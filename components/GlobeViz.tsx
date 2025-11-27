'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function GlobeViz({ data }: { data: any[] }) {
  const globeEl = useRef<any>(null);
  
  useEffect(() => {
    // Auto-rotate
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);

  return (
    <div className="h-screen w-full bg-black">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        pointsData={data}
        pointLat="latitude"
        pointLng="longitude"
        pointColor={() => '#00ff00'}
        pointAltitude={0.02}
        pointRadius={0.5}
        pointsMerge={true} // Performance optimization
        
        // Arcs (Connecting you to them)
        arcsData={data.map(d => ({
          startLat: 33.6405, // Irvine, CA (Your Location)
          startLng: -117.8443,
          endLat: d.latitude,
          endLng: d.longitude,
        }))}
        arcColor={() => '#rgba(0, 255, 0, 0.5)'}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={1500}
        
        // Hover Tooltip
        pointLabel={(d: any) => `
          <div class="p-2 bg-gray-900 text-white text-xs rounded border border-gray-700 shadow-xl">
            <div class="font-bold text-green-400">${d.firstName} ${d.lastName}</div>
            <div>${d.company}</div>
            <div class="text-gray-400">${d.position}</div>
          </div>
        `}
        
        onPointClick={(d: any) => {
            window.open(d.profileUrl, '_blank');
        }}
      />
    </div>
  );
}
