import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Update a connection's location or details
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const { latitude, longitude, city, country, tags, notes } = body;
    
    const updated = await prisma.connection.update({
      where: { id },
      data: {
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(tags !== undefined && { tags }),
        ...(notes !== undefined && { notes }),
      },
    });
    
    return NextResponse.json({ success: true, connection: updated });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
  }
}

// Delete a connection
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.connection.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 });
  }
}

