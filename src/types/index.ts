export type BoothStatus = 'available' | 'reserved' | 'sold';

export type PathStyle = 'main-aisle' | 'secondary-aisle' | 'emergency';

export type ObjectType = 'entrance' | 'exit' | 'stage' | 'food-court' | 'registration' | 'washroom' | 'emergency-exit' | 'seating' | 'pillar' | 'wall';

export interface Company {
  name: string;
  contactPerson: string;
  category: string;
  notes: string;
  logoUrl?: string;
}

export interface Booth {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  number: string;
  status: BoothStatus;
  color?: string;
  company?: Company;
  locked: boolean;
  price?: number;
}

export interface WalkPath {
  id: string;
  points: number[];
  style: PathStyle;
  strokeWidth: number;
  color: string;
  label?: string;
  arrowEnd: boolean;
  locked: boolean;
}

export interface LayoutObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string;
  color: string;
  locked: boolean;
}

export type Tool = 'select' | 'booth' | 'path' | 'object';

export type SelectedElement = 
  | { kind: 'booth'; id: string }
  | { kind: 'path'; id: string }
  | { kind: 'object'; id: string }
  | null;
