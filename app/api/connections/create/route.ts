import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, company, position, profileUrl, city, country, latitude, longitude, tags, notes } = body;
    
    // Validate required fields
    if (!firstName?.trim()) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedFirstName = firstName.trim().slice(0, 100);
    const sanitizedLastName = lastName?.trim().slice(0, 100) || '';
    const sanitizedCompany = company?.trim().slice(0, 200) || null;
    const sanitizedPosition = position?.trim().slice(0, 200) || null;
    const sanitizedNotes = notes?.trim().slice(0, 1000) || null;

    // Validate URL if provided
    let validatedProfileUrl = null;
    if (profileUrl?.trim()) {
      try {
        const url = new URL(profileUrl.trim());
        if (url.hostname.includes('linkedin.com')) {
          validatedProfileUrl = profileUrl.trim();
        }
      } catch {
        // Invalid URL, ignore
      }
    }

    // Validate coordinates if provided
    let validLat = null;
    let validLng = null;
    if (latitude !== undefined && longitude !== undefined) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        validLat = lat;
        validLng = lng;
      }
    }

    const connection = await prisma.connection.create({
      data: {
        userId: session.user.id,
        firstName: sanitizedFirstName,
        lastName: sanitizedLastName,
        fullName: `${sanitizedFirstName} ${sanitizedLastName}`.trim(),
        company: sanitizedCompany,
        position: sanitizedPosition,
        profileUrl: validatedProfileUrl,
        city: city?.trim().slice(0, 100) || null,
        country: country?.trim().slice(0, 100) || null,
        latitude: validLat,
        longitude: validLng,
        tags: tags?.trim().slice(0, 500) || null,
        notes: sanitizedNotes,
      },
    });
    
    return NextResponse.json({ success: true, connection });
  } catch (error) {
    console.error('Create error:', error);
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
  }
}
