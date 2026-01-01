import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all connections
export async function GET() {
  try {
    const connections = await prisma.connection.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
  }
}

