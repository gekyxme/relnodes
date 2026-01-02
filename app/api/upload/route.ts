import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Papa from 'papaparse';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    // Limit file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const text = await file.text();
    
    // LinkedIn CSVs have 3 lines of metadata at the top.
    // We remove them so PapaParse reads the actual header row.
    const cleanText = text.split('\n').slice(3).join('\n');
    
    // Parse CSV
    const { data } = Papa.parse(cleanText, { header: true, skipEmptyLines: true });
    
    const userId = session.user.id;
    let count = 0;
    let skipped = 0;

    // Process each row
    for (const row of data as Record<string, string>[]) {
      // Check for required fields
      if (!row['First Name']) continue;

      const firstName = row['First Name'].trim();
      const lastName = (row['Last Name'] || '').trim();
      const profileUrl = row['URL']?.trim() || null;

      // Check if this connection already exists for this user
      const existingConnection = await prisma.connection.findFirst({
        where: {
          userId,
          OR: [
            ...(profileUrl ? [{ profileUrl }] : []),
            {
              AND: [
                { firstName },
                { lastName },
                { company: row['Company']?.trim() || null }
              ]
            }
          ]
        }
      });

      if (existingConnection) {
        skipped++;
        continue;
      }

      await prisma.connection.create({
        data: {
          userId,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          company: row['Company']?.trim() || null,
          position: row['Position']?.trim() || null,
          profileUrl,
          email: row['Email Address']?.trim() || null,
          connectedOn: row['Connected On'] ? new Date(row['Connected On']) : null,
        }
      });
      count++;
    }

    return NextResponse.json({ 
      success: true, 
      count, 
      skipped,
      message: `Successfully imported ${count} connections${skipped > 0 ? ` (${skipped} duplicates skipped)` : ''}` 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
