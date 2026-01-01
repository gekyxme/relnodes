import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple delay to respect API rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add random jitter to coordinates so connections at the same company spread out
// Jitter radius is approximately 50-100km
function addJitter(lat: number, lon: number): { lat: number; lon: number } {
  const jitterRadius = 0.5; // ~50km in degrees
  const randomAngle = Math.random() * 2 * Math.PI;
  const randomRadius = Math.random() * jitterRadius;
  
  return {
    lat: lat + randomRadius * Math.cos(randomAngle),
    lon: lon + randomRadius * Math.sin(randomAngle),
  };
}

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
      return NextResponse.json({ message: 'No pending connections to geocode.', processed: 0, updated: 0 });
    }

    let updatedCount = 0;

    for (const conn of connectionsToGeocode) {
      if (!conn.company) continue;

      // Check our cache first
      const cached = await prisma.locationCache.findUnique({
        where: { companyName: conn.company },
      });

      if (cached) {
        // Apply jitter so multiple people at same company don't overlap
        const jittered = addJitter(cached.latitude, cached.longitude);
        
        await prisma.connection.update({
          where: { id: conn.id },
          data: {
            latitude: jittered.lat,
            longitude: jittered.lon,
            city: cached.city,
            country: cached.country,
          },
        });
        updatedCount++;
        continue;
      }

      // If not cached, fetch from external API (OpenStreetMap Nominatim - Free)
      try {
        const query = encodeURIComponent(conn.company);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
          { headers: { 'User-Agent': 'Relnodes/1.0 (Network Visualization App)' } }
        );
        
        const data = await res.json();

        if (data && data.length > 0) {
          const result = data[0];
          const baseLat = parseFloat(result.lat);
          const baseLon = parseFloat(result.lon);
          
          // Save to Cache with base coordinates (no jitter)
          await prisma.locationCache.upsert({
            where: { companyName: conn.company },
            update: {}, // If exists, do nothing
            create: {
              companyName: conn.company,
              latitude: baseLat,
              longitude: baseLon,
              city: result.display_name.split(',')[0],
              country: result.display_name.split(',').pop()?.trim(),
            },
          });

          // Apply jitter for the individual connection
          const jittered = addJitter(baseLat, baseLon);

          // Update Connection
          await prisma.connection.update({
            where: { id: conn.id },
            data: {
              latitude: jittered.lat,
              longitude: jittered.lon,
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
      message: `Processed batch of ${connectionsToGeocode.length} connections.`
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}
