import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    
    // LinkedIn CSVs have 3 lines of metadata at the top.
    // We remove them so PapaParse reads the actual header row.
    const cleanText = text.split('\n').slice(3).join('\n');
    
    // Parse CSV
    const { data } = Papa.parse(cleanText, { header: true, skipEmptyLines: true });
    
    // Create or get the demo user
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: { email: 'demo@example.com', name: 'Demo User' }
    });

    let count = 0;
    let skipped = 0;

    // Process each row
    for (const row of data as Record<string, string>[]) {
      // Check for required fields
      if (!row['First Name']) continue;

      const firstName = row['First Name'];
      const lastName = row['Last Name'] || '';
      const profileUrl = row['URL'] || null;

      // Check if this connection already exists (by URL or name + company combo)
      const existingConnection = await prisma.connection.findFirst({
        where: {
          userId: demoUser.id,
          OR: [
            { profileUrl: profileUrl || undefined },
            {
              AND: [
                { firstName },
                { lastName },
                { company: row['Company'] || null }
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
          userId: demoUser.id,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          company: row['Company'] || null,
          position: row['Position'] || null,
          profileUrl,
          email: row['Email Address'] || null,
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
