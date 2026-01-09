import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch user's location
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        latitude: true,
        longitude: true,
        city: true,
        country: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      hasLocation: user.latitude !== null && user.longitude !== null,
      location: user.latitude !== null ? {
        latitude: user.latitude,
        longitude: user.longitude,
        city: user.city,
        country: user.country,
      } : null,
    });
  } catch (error) {
    console.error('Failed to fetch user location:', error);
    return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 });
  }
}

// PATCH - Update user's location
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { latitude, longitude, city, country } = body;

    // Validate latitude and longitude
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Coordinates out of range' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        latitude,
        longitude,
        city: city || null,
        country: country || null,
      },
      select: {
        latitude: true,
        longitude: true,
        city: true,
        country: true,
      },
    });

    return NextResponse.json({
      success: true,
      location: {
        latitude: updatedUser.latitude,
        longitude: updatedUser.longitude,
        city: updatedUser.city,
        country: updatedUser.country,
      },
    });
  } catch (error) {
    console.error('Failed to update user location:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

