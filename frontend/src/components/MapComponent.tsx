'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue in Next.js
const setupLeafletIcon = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

interface ProjectFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    id: string;
    title: string;
    registry: string;
    methodology: string;
    category: string;
    credits_issued: number;
    credits_retired: number;
    status: string;
    region: string;
    country: string;
    price_per_credit: number;
    price_vs_regional_pct: number;
    retirement_ratio_pct: number;
    trust_score: number;
    verifier: string;
    last_updated: string;
  };
}

interface MapComponentProps {
  projects: ProjectFeature[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
}

// Component to dynamically fly to the selected project position
const RecenterMap = ({ activeProject }: { activeProject: ProjectFeature | null }) => {
  const map = useMap();
  useEffect(() => {
    if (activeProject) {
      const [lon, lat] = activeProject.geometry.coordinates;
      map.flyTo([lat, lon], 4, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [activeProject, map]);
  return null;
};

export default function MapComponent({ projects, selectedProjectId, onSelectProject }: MapComponentProps) {
  useEffect(() => {
    setupLeafletIcon();
  }, []);

  const activeProject = projects.find(p => p.properties.id === selectedProjectId) || null;

  // Custom icon style for electric cyan glow theme
  const getCustomIcon = (registry: string, isActive: boolean) => {
    const color = registry === 'Verra Registry' ? '#38BDF8' : '#818CF8';
    const border = isActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)';
    const size = isActive ? '32px' : '24px';
    const glow = isActive ? 'box-shadow: 0 0 12px #38BDF8;' : '';

    return L.divIcon({
      html: `<div style="
        background-color: ${color}; 
        width: ${size}; 
        height: ${size}; 
        border-radius: 50%; 
        border: 2px solid ${border};
        ${glow}
        display: flex;
        align-items: center;
        justify-content: center;
        color: #030712;
        font-weight: bold;
        font-size: 10px;
      ">${registry[0]}</div>`,
      className: 'custom-leaflet-icon',
      iconSize: isActive ? [32, 32] : [24, 24],
      iconAnchor: isActive ? [16, 16] : [12, 12],
    });
  };

  return (
    <div className="w-full h-full relative border border-border rounded-lg overflow-hidden glass-panel">
      <MapContainer
        center={[0.0, 0.0]}
        zoom={2}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Dark map tiles matching Obsidian Black Theme */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {projects.map((proj) => {
          const [lon, lat] = proj.geometry.coordinates;
          const isActive = proj.properties.id === selectedProjectId;
          
          return (
            <Marker
              key={proj.properties.id}
              position={[lat, lon]}
              icon={getCustomIcon(proj.properties.registry, isActive)}
              eventHandlers={{
                click: () => onSelectProject(proj.properties.id),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 bg-surface text-foreground font-sans text-xs min-w-[200px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-accent-primary">
                      {proj.properties.id}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-border text-gray-400">
                      {proj.properties.registry}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mb-2 text-white">{proj.properties.title}</h4>
                  
                  <div className="space-y-1 text-gray-300">
                    <div className="flex justify-between">
                      <span>Methodology:</span>
                      <span className="text-white font-medium">{proj.properties.methodology.split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price/Credit:</span>
                      <span className="text-white font-medium">${proj.properties.price_per_credit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>vs Regional Avg:</span>
                      <span className={`font-semibold ${proj.properties.price_vs_regional_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {proj.properties.price_vs_regional_pct >= 0 ? '+' : ''}{proj.properties.price_vs_regional_pct}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retired ratio:</span>
                      <span className="text-white font-medium">{proj.properties.retirement_ratio_pct}%</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <RecenterMap activeProject={activeProject} />
      </MapContainer>
    </div>
  );
}
