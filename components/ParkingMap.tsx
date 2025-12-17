import React from 'react';
import { ParkingSpot, SpotType, ZoneConfig } from '../types';
import { CarFront, Accessibility, Zap, Baby } from 'lucide-react';

interface ParkingMapProps {
  spots: ParkingSpot[];
  zones: ZoneConfig[];
  onSpotClick: (spotId: string) => void;
  selectedSpotId: string | null;
}

const getSpotColor = (spot: ParkingSpot) => {
  if (spot.isOccupied) {
    return spot.customColorOccupied || '#ef4444'; // Red-500 default
  }
  if (spot.customColorFree) {
    return spot.customColorFree;
  }
  switch (spot.type) {
    case SpotType.DISABLED: return '#3b82f6'; // Blue-500
    case SpotType.PRIORITY: return '#d946ef'; // Fuchsia-500
    case SpotType.EV: return '#22c55e'; // Green-500
    default: return '#84cc16'; // Lime-500 (Matches the image's generic green)
  }
};

const getSpotIcon = (type: SpotType) => {
  switch (type) {
    case SpotType.DISABLED: return <Accessibility className="w-4 h-4 text-white opacity-80" />;
    case SpotType.PRIORITY: return <Baby className="w-4 h-4 text-white opacity-80" />;
    case SpotType.EV: return <Zap className="w-4 h-4 text-white opacity-80" />;
    default: return null;
  }
};

export const ParkingMap: React.FC<ParkingMapProps> = ({ spots, zones, onSpotClick, selectedSpotId }) => {
  
  // Helper to render a single zone of spots
  const renderZone = (zone: ZoneConfig) => {
    const zoneSpots = spots.filter(s => s.zoneId === zone.id);
    
    // Create a grid layout for the zone
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${zone.x}%`,
      top: `${zone.y}%`,
      transform: `rotate(${zone.angle}deg) skewX(${zone.skewX || 0}deg)`,
      display: 'grid',
      gridTemplateColumns: `repeat(${zone.cols}, 1fr)`,
      gap: `${zone.gap || 4}px`,
      padding: '8px',
      backgroundColor: 'transparent', 
      // Enhance the "island" look if needed
    };

    return (
      <div key={zone.id} style={style} className="pointer-events-none">
        {zoneSpots.map((spot) => {
            const bgColor = getSpotColor(spot);
            const isSelected = selectedSpotId === spot.id;

            return (
            <div
                key={spot.id}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent map click deselect
                    onSpotClick(spot.id);
                }}
                className={`
                relative w-10 h-16 border-2 flex flex-col items-center justify-center 
                cursor-pointer transition-all duration-300 pointer-events-auto shadow-sm
                ${isSelected ? 'ring-4 ring-yellow-400 z-10 scale-110' : 'hover:scale-105 hover:z-10'}
                `}
                style={{
                backgroundColor: bgColor,
                borderColor: 'rgba(255,255,255,0.8)',
                }}
            >
                {/* Spot Number */}
                <span className="absolute top-1 text-[10px] font-bold text-white drop-shadow-md">
                {spot.label}
                </span>

                {/* Icon or Car */}
                <div className="flex-1 flex items-center justify-center">
                {spot.isOccupied ? (
                    <CarFront className="w-8 h-8 text-white drop-shadow-md animate-in fade-in zoom-in duration-300" />
                ) : (
                    getSpotIcon(spot.type)
                )}
                </div>
            </div>
            );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full bg-slate-200 overflow-hidden border-4 border-slate-400 rounded-lg shadow-inner">
      {/* Background Texture / Grid Lines */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
            backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
            backgroundSize: '20px 20px'
        }}
      />
      
      {/* Structural Elements (Roads/Walls) - simulated via divs */}
      <div className="absolute top-[10%] left-[5%] right-[5%] h-[80%] border-2 border-dashed border-slate-400 rounded-[50px] pointer-events-none opacity-30" />
      
      {/* Render All Zones */}
      {zones.map(renderZone)}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-md text-xs backdrop-blur-sm z-20">
        <div className="font-bold mb-2 text-slate-700">圖例說明</div>
        <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#84cc16] rounded"></div>一般車位</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#3b82f6] rounded"></div>身心障礙</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#d946ef] rounded"></div>婦幼優先</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#ef4444] rounded"></div>已佔用</div>
        </div>
      </div>
    </div>
  );
};