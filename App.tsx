import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ParkingMap } from './components/ParkingMap';
import { ControlPanel } from './components/ControlPanel';
import { ParkingSpot, SpotType, ZoneConfig } from './types';

// --- Constants & Initial Data Generation ---

const INITIAL_ZONES: ZoneConfig[] = [
  // Top Row
  { id: 'Z1', x: 5, y: 5, angle: 0, rows: 1, cols: 14, spotType: SpotType.STANDARD, startNumber: 1, gap: 2 },
  // Left Vertical
  { id: 'Z2', x: 5, y: 20, angle: 0, rows: 8, cols: 1, spotType: SpotType.STANDARD, startNumber: 15, gap: 2, skewX: 0 },
  // Center Island Top (Angled)
  { id: 'Z3', x: 25, y: 35, angle: 0, rows: 1, cols: 10, spotType: SpotType.DISABLED, startNumber: 23, gap: 2, skewX: -20 },
  // Center Island Bottom (Angled back-to-back)
  { id: 'Z4', x: 25, y: 55, angle: 0, rows: 1, cols: 10, spotType: SpotType.PRIORITY, startNumber: 33, gap: 2, skewX: 20 },
   // Right Vertical
   { id: 'Z5', x: 90, y: 20, angle: 0, rows: 8, cols: 1, spotType: SpotType.STANDARD, startNumber: 43, gap: 2, skewX: 0 },
  // Bottom Row
  { id: 'Z6', x: 15, y: 80, angle: 0, rows: 1, cols: 12, spotType: SpotType.STANDARD, startNumber: 51, gap: 2, skewX: 0 },
];

const generateSpots = (zones: ZoneConfig[]): ParkingSpot[] => {
  let allSpots: ParkingSpot[] = [];
  
  zones.forEach(zone => {
    const count = zone.rows * zone.cols;
    for (let i = 0; i < count; i++) {
      allSpots.push({
        id: `${zone.id}-${i}`,
        zoneId: zone.id,
        type: zone.spotType,
        isOccupied: Math.random() > 0.7, // Random initial state
        label: String(zone.startNumber + i).padStart(3, '0'),
      });
    }
  });
  return allSpots;
};

const App: React.FC = () => {
  const [spots, setSpots] = useState<ParkingSpot[]>(() => generateSpots(INITIAL_ZONES));
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulation Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isSimulating) {
      interval = setInterval(() => {
        setSpots(prevSpots => {
          // Clone array
          const newSpots = [...prevSpots];
          
          // Randomly change 1-3 spots
          const changes = Math.floor(Math.random() * 3) + 1;
          
          for (let i = 0; i < changes; i++) {
            const randomIndex = Math.floor(Math.random() * newSpots.length);
            // Don't change the selected spot to avoid UI jumping while editing
            if (newSpots[randomIndex].id !== selectedSpotId) {
                newSpots[randomIndex] = {
                    ...newSpots[randomIndex],
                    isOccupied: !newSpots[randomIndex].isOccupied
                };
            }
          }
          return newSpots;
        });
      }, 1500); // Update every 1.5 seconds
    }

    return () => clearInterval(interval);
  }, [isSimulating, selectedSpotId]);

  // Calculate Stats
  const stats = useMemo(() => {
    const total = spots.length;
    const occupied = spots.filter(s => s.isOccupied).length;
    
    const breakdown = {
        [SpotType.STANDARD]: { total: 0, available: 0 },
        [SpotType.DISABLED]: { total: 0, available: 0 },
        [SpotType.PRIORITY]: { total: 0, available: 0 },
        [SpotType.EV]: { total: 0, available: 0 },
    };

    spots.forEach(s => {
        if (!breakdown[s.type]) {
            // Safety fallback if type is weird
             breakdown[SpotType.STANDARD].total++;
             if (!s.isOccupied) breakdown[SpotType.STANDARD].available++;
        } else {
            breakdown[s.type].total++;
            if (!s.isOccupied) breakdown[s.type].available++;
        }
    });

    return {
      total,
      occupied,
      available: total - occupied,
      breakdown
    };
  }, [spots]);

  // Handlers
  const handleSpotClick = useCallback((id: string) => {
    setSelectedSpotId(id);
  }, []);

  const handleUpdateSpot = useCallback((id: string, updates: Partial<ParkingSpot>) => {
    setSpots(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const handleReset = useCallback(() => {
    setSpots(generateSpots(INITIAL_ZONES).map(s => ({ ...s, isOccupied: false })));
  }, []);

  const selectedSpot = useMemo(() => 
    spots.find(s => s.id === selectedSpotId) || null
  , [spots, selectedSpotId]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-100">
      
      {/* Map Area */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 h-full relative overflow-hidden flex flex-col">
        <div className="mb-4 flex items-center justify-between">
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
             📍 停車場即時監控圖
             <span className="ml-4 text-sm font-normal text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm">
                場景置中 | 即時更新
             </span>
           </h1>
        </div>
        
        <div className="flex-1 relative shadow-2xl rounded-xl border border-slate-300 bg-slate-200">
             <ParkingMap 
                spots={spots} 
                zones={INITIAL_ZONES} 
                onSpotClick={handleSpotClick}
                selectedSpotId={selectedSpotId}
             />
        </div>
      </div>

      {/* Sidebar Control Panel */}
      <ControlPanel 
        stats={stats}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onReset={handleReset}
        selectedSpot={selectedSpot}
        onUpdateSpot={handleUpdateSpot}
      />
    </div>
  );
};

export default App;