import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient'; 

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard');
  }

  // Fetch all connections for this user
  const connections = await prisma.connection.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Filter geocoded ones for the globe
  const geocodedConnections = connections.filter(c => c.latitude !== null);

  // Compute Stats server-side
  const total = connections.length;
  const geocoded = geocodedConnections.length;
  const pending = total - geocoded;
  
  // Count companies (excluding null/empty/Unknown)
  const companyCounts: Record<string, number> = {};
  connections.forEach(c => {
    // Only count valid company names
    if (c.company && c.company.trim() !== '' && c.company.toLowerCase() !== 'unknown') {
      companyCounts[c.company] = (companyCounts[c.company] || 0) + 1;
    }
  });

  // Sort and get top 8
  const topCompanies = Object.entries(companyCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Count countries
  const countryCounts: Record<string, number> = {};
  geocodedConnections.forEach(c => {
    const country = c.country || 'Unknown';
    if (country !== 'Unknown') {
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    }
  });

  const topCountries = Object.entries(countryCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return (
    <DashboardClient 
      connections={JSON.parse(JSON.stringify(geocodedConnections))}
      allConnections={JSON.parse(JSON.stringify(connections))}
      stats={{ total, geocoded, pending, topCompanies, topCountries }} 
    />
  );
}
