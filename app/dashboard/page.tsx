import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient'; 

export const dynamic = 'force-dynamic';

function DashboardLoading() {
  return (
    <div className="flex h-screen w-full bg-black items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#0a66c2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#b0b0b0]">Loading your network...</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard');
  }

  // Fetch user data including location
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      latitude: true,
      longitude: true,
      city: true,
      country: true,
    },
  });

  // User location for the globe
  const userLocation = user && user.latitude !== null && user.longitude !== null ? {
    latitude: user.latitude,
    longitude: user.longitude,
    city: user.city || undefined,
    country: user.country || undefined,
  } : null;

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
    <Suspense fallback={<DashboardLoading />}>
      <DashboardClient 
        connections={JSON.parse(JSON.stringify(geocodedConnections))}
        allConnections={JSON.parse(JSON.stringify(connections))}
        stats={{ total, geocoded, pending, topCompanies, topCountries }}
        initialUserLocation={userLocation}
      />
    </Suspense>
  );
}
