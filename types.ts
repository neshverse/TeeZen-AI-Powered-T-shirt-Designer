export interface DesignElement {
  id: string;
  type: 'text' | 'image';
  content: string; // text content or image base64
  
  // Positioning
  position: { x: number; y: number }; // %
  rotation: number;
  scale: number;

  // Typography / Style
  font: string;
  color: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  textTransform: 'uppercase' | 'lowercase' | 'none';
  
  // Effects
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'difference';
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface TShirtSideDesign {
  elements: DesignElement[];
  shirtColor: string;
  selectedId: string | null;
}

export interface AppDesignState {
  front: TShirtSideDesign;
  back: TShirtSideDesign;
  activeSide: 'FRONT' | 'BACK';
}

// Alias for backward compatibility in components expecting a single side
export type DesignState = TShirtSideDesign;

export enum ShirtSide {
  FRONT = 'FRONT',
  BACK = 'BACK',
}

export interface QuoteRequest {
  topic: string;
  mood: string;
}

export interface AISettings {
  provider: 'gemini' | 'custom';
  customEndpoint?: string;
  customApiKey?: string;
  customModelName?: string;
}

export const FONTS = [
  { name: 'Inter', value: 'font-sans' },
  { name: 'Mono', value: 'font-mono' },
  { name: 'Marker', value: 'font-marker' },
  { name: 'Righteous', value: 'font-righteous' },
  { name: 'Anton', value: 'font-anton' },
  { name: 'Pacifico', value: 'font-pacifico' },
  { name: 'Pixel', value: 'font-pixel' },
  { name: 'Creep', value: 'font-creep' },
  { name: 'Serif', value: 'font-serif' },
];

export const SHIRT_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#121212' },
];

export const createNewTextElement = (text: string = "NEW TEXT"): DesignElement => ({
  id: `el-${Date.now()}-${Math.random()}`,
  type: 'text',
  content: text,
  position: { x: 50, y: 30 },
  rotation: 0,
  scale: 1,
  font: 'font-sans',
  color: '#000000',
  fontSize: 32,
  letterSpacing: 0,
  lineHeight: 1.2,
  textAlign: 'center',
  textTransform: 'uppercase',
  opacity: 1,
  blendMode: 'normal',
  strokeColor: '#000000',
  strokeWidth: 0,
  shadowColor: '#000000',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
});

export const createNewImageElement = (imgData: string): DesignElement => ({
  id: `el-${Date.now()}-${Math.random()}`,
  type: 'image',
  content: imgData,
  position: { x: 50, y: 30 },
  rotation: 0,
  scale: 1,
  font: 'font-sans', // unused but needed for type consistency or we make it optional
  color: '#000000',
  fontSize: 0,
  letterSpacing: 0,
  lineHeight: 0,
  textAlign: 'center',
  textTransform: 'none',
  opacity: 1,
  blendMode: 'normal',
  strokeColor: '#000000',
  strokeWidth: 0,
  shadowColor: '#000000',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
});
