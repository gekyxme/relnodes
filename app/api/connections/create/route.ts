import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, company, position, profileUrl, city, country, latitude, longitude, tags, notes } = body;
    
    if (!firstName) {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }
    
    // Get or create demo user
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: { email: 'demo@example.com', name: 'Demo User' }
    });
    
    const connection = await prisma.connection.create({
      data: {
        userId: demoUser.id,
        firstName,
        lastName: lastName || '',
        fullName: `${firstName} ${lastName || ''}`.trim(),
        company: company || null,
        position: position || null,
        profileUrl: profileUrl || null,
        city: city || null,
        country: country || null,
        latitude: latitude || null,
        longitude: longitude || null,
        tags: tags || null,
        notes: notes || null,
      },
    });
    
    return NextResponse.json({ success: true, connection });
  } catch (error) {
    console.error('Create error:', error);
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
  }
}

