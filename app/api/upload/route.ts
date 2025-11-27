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
    
    // FIX: LinkedIn CSVs have 3 lines of metadata at the top.
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

    // Process each row
    for (const row of data as any[]) {
      // Check for required fields (First Name is essential, Company is useful for map)
      if (row['First Name']) {
        await prisma.connection.create({
          data: {
            userId: demoUser.id,
            firstName: row['First Name'],
            lastName: row['Last Name'] || '',
            fullName: `${row['First Name']} ${row['Last Name'] || ''}`.trim(),
            company: row['Company'] || null,
            position: row['Position'] || null,
            profileUrl: row['URL'] || null,
            email: row['Email Address'] || null,
            connectedOn: row['Connected On'] ? new Date(row['Connected On']) : null,
          }
        });
        count++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      count, 
      message: `Successfully imported ${count} connections` 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
