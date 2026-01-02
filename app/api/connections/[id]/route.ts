import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Update a connection's location or details
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    
    // Verify the connection belongs to the user
    const existingConnection = await prisma.connection.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingConnection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (existingConnection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Verify the connection belongs to the user
    const existingConnection = await prisma.connection.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingConnection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (existingConnection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.connection.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 });
  }
}
