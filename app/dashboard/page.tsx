import { prisma } from '@/lib/prisma';
import GlobeViz from '@/components/GlobeViz';

export default async function DashboardPage() {
  // Fetch only geocoded connections
  const connections = await prisma.connection.findMany({
    where: {
      latitude: { not: null },
    },
  });

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
       <div className="absolute top-5 left-5 z-10 text-white pointer-events-none">
          <h1 className="text-3xl font-bold tracking-widest">RELNODES</h1>
          <p className="text-green-400 text-sm uppercase tracking-wide">
            {connections.length} Nodes Active
          </p>
       </div>
       
       <GlobeViz data={connections} />
    </main>
  );
}
