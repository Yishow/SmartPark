export enum SpotType {
  STANDARD = 'STANDARD',
  DISABLED = 'DISABLED',
  PRIORITY = 'PRIORITY', // e.g., Pink/Family
  EV = 'EV',
}

export interface ParkingSpot {
  id: string;
  zoneId: string;
  type: SpotType;
  isOccupied: boolean;
  customColorFree?: string;
  customColorOccupied?: string;
  label: string;
}

export interface ZoneConfig {
  id: string;
  x: number; // Percentage or px position
  y: number;
  angle: number; // Rotation in degrees
  rows: number;
  cols: number;
  skewX?: number; // For that realistic angled parking look
  gap?: number;
  spotType: SpotType;
  startNumber: number;
}

export interface ParkingStats {
  total: number;
  occupied: number;
  available: number;
  breakdown: Record<SpotType, { total: number; available: number }>;
}