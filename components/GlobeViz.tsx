'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

interface Connection {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  position?: string;
  profileUrl?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}

interface Props {
  data: Connection[];
  onNodeClick?: (node: Connection) => void;
}

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

export default function GlobeViz({ data, onNodeClick }: Props) {
  const globeEl = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    // Auto-rotate
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.3;
      
      // Set initial view
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
    }
  }, [dimensions]);

  // Find user's location center (for arc start point)
  const userLat = 37.7749; // San Francisco
  const userLng = -122.4194;

  return (
    <div ref={containerRef} className="h-full w-full cursor-grab active:cursor-grabbing relative overflow-hidden">
      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>
      
      {dimensions.width > 0 && (
        <Globe
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          
          // Globe appearance - darker for LinkedIn theme
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          // Atmosphere - LinkedIn blue
          atmosphereColor="#0a66c2"
          atmosphereAltitude={0.15}
          
          // Points (The Nodes) - LinkedIn blue
          pointsData={data}
          pointLat="latitude"
          pointLng="longitude"
          pointColor={() => '#0a66c2'}
          pointAltitude={0.01}
          pointRadius={0.5}
          pointsMerge={false}
          
          // Arcs (Connecting lines) - LinkedIn colors
          arcsData={data.map((d) => ({
            startLat: userLat,
            startLng: userLng,
            endLat: d.latitude,
            endLng: d.longitude,
            connection: d,
          }))}
          arcColor={() => ['rgba(10, 102, 194, 0.8)', 'rgba(112, 181, 249, 0.8)']}
          arcAltitude={0.12}
          arcStroke={0.4}
          arcDashLength={0.5}
          arcDashGap={0.3}
          arcDashAnimateTime={3000}
          
          // Hover Tooltip
          pointLabel={(d: object) => {
            const conn = d as Connection;
            return `
            <div style="
              background: #1d2226;
              border: 1px solid #38434f;
              border-radius: 8px;
              padding: 12px 16px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              min-width: 180px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            ">
              <div style="color: #fff; font-weight: 600; margin-bottom: 4px; font-size: 14px;">
                ${conn.firstName} ${conn.lastName}
              </div>
              <div style="color: #b0b0b0; font-size: 12px; margin-bottom: 8px;">
                ${conn.position || 'No title'}
              </div>
              <div style="color: #0a66c2; font-size: 12px; font-weight: 500;">
                ${conn.company || 'Unknown'}
              </div>
              ${conn.city ? `
                <div style="color: #666666; font-size: 11px; margin-top: 6px; display: flex; align-items: center; gap: 4px;">
                  📍 ${conn.city}, ${conn.country}
                </div>
              ` : ''}
            </div>
          `;
          }}
          
          // Interaction
          onPointClick={(point: object) => {
            const d = point as Connection;
            if (onNodeClick) {
              onNodeClick(d);
            }
          }}
        />
      )}

      {/* Stats overlay */}
      <div className="absolute bottom-6 left-6 z-20">
        <div className="flex items-center gap-2 text-xs text-[#b0b0b0] bg-[#1d2226]/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#38434f]">
          <div className="w-2 h-2 rounded-full bg-[#0a66c2] animate-pulse" />
          {data.length} connections mapped
        </div>
      </div>
    </div>
  );
}
