import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient'; 

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Fetch all connections (including ungeocodded ones for editing)
  const connections = await prisma.connection.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // 2. Filter geocoded ones for the globe
  const geocodedConnections = connections.filter(c => c.latitude !== null);

  // 3. Compute Stats server-side
  const total = connections.length;
  const geocoded = geocodedConnections.length;
  const pending = total - geocoded;
  
  // Count companies
  const companyCounts: Record<string, number> = {};
  connections.forEach(c => {
    const name = c.company || 'Unknown';
    companyCounts[name] = (companyCounts[name] || 0) + 1;
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
    countryCounts[country] = (countryCounts[country] || 0) + 1;
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
