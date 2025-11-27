import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple delay to respect API rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
  try {
    // 1. Find connections that have a company but NO coordinates yet
    const connectionsToGeocode = await prisma.connection.findMany({
      where: {
        company: { not: null },
        latitude: null,
      },
      take: 50, // Process in batches of 50 to avoid timeouts
    });

    if (connectionsToGeocode.length === 0) {
      return NextResponse.json({ message: 'No pending connections to geocode.' });
    }

    let updatedCount = 0;

    for (const conn of connectionsToGeocode) {
      if (!conn.company) continue;

      // Check our cache first
      const cached = await prisma.locationCache.findUnique({
        where: { companyName: conn.company },
      });

      if (cached) {
        await prisma.connection.update({
          where: { id: conn.id },
          data: {
            latitude: cached.latitude,
            longitude: cached.longitude,
            city: cached.city,
            country: cached.country,
          },
        });
        updatedCount++;
        continue;
      }

      // If not cached, fetch from external API (OpenStreetMap Nominatim - Free)
      // Note: In production, use a paid API like Geoapify or Google Maps
      try {
        const query = encodeURIComponent(conn.company);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
          { headers: { 'User-Agent': 'LinkedinVizHackathon/1.0' } }
        );
        
        const data = await res.json();

        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);
          
        // Save to Cache (Use upsert to prevent unique constraint errors)
        await prisma.locationCache.upsert({
        where: { companyName: conn.company },
        update: {}, // If exists, do nothing
        create: {
            companyName: conn.company,
            latitude: lat,
            longitude: lon,
            city: result.display_name.split(',')[0],
            country: result.display_name.split(',').pop()?.trim(),
        },
        });


          // Update Connection
          await prisma.connection.update({
            where: { id: conn.id },
            data: {
              latitude: lat,
              longitude: lon,
              city: result.display_name.split(',')[0],
              country: result.display_name.split(',').pop()?.trim(),
            },
          });
          updatedCount++;
        }
        
        // Respect rate limit (1 second per request for Nominatim)
        await delay(1100); 

      } catch (err) {
        console.error(`Failed to geocode ${conn.company}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: connectionsToGeocode.length,
      updated: updatedCount,
      message: `Processed batch of ${connectionsToGeocode.length} connections. Refresh to continue.`
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}
