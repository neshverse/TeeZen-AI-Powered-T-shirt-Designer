import React, { useState, useRef, useEffect } from 'react';
import { DesignState } from '../types';
import { X, Droplet, Layers, Type, Sun, Palette, GripHorizontal, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface MovableColorPaletteProps {
  design: DesignState;
  setDesign: React.Dispatch<React.SetStateAction<DesignState>>;
  onClose: () => void;
}

// Robust Helper to convert Hex to HSL
const hexToHSL = (H: string) => {
  if (!H || typeof H !== 'string' || !H.startsWith('#')) return { h: 0, s: 0, l: 0 };
  let r = 0, g = 0, b = 0;
  try {
    if (H.length === 4) {
      r = parseInt("0x" + H[1] + H[1]);
      g = parseInt("0x" + H[2] + H[2]);
      b = parseInt("0x" + H[3] + H[3]);
    } else if (H.length === 7) {
      r = parseInt("0x" + H[1] + H[2]);
      g = parseInt("0x" + H[3] + H[4]);
      b = parseInt("0x" + H[5] + H[6]);
    } else return { h: 0, s: 0, l: 0 };
  } catch (e) { return { h: 0, s: 0, l: 0 }; }

  r /= 255; g /= 255; b /= 255;
  let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
  let h = 0, s = 0, l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
};

const hslToHex = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
      m = l - c / 2,
      r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

const PRESET_COLORS = [
  '#ffffff', '#000000', '#121212', '#ccff00', '#ff00ff', '#00ffff', 
  '#9d00ff', '#ff4d4d', '#ffa500', '#ffff00', '#00ff00', '#0000ff',
  '#e0e0e0', '#333333', '#1a1a1a', '#b3ff00', '#ff66ff', '#66ffff'
];

type ColorTarget = 'shirtColor' | 'textColor' | 'strokeColor' | 'shadowColor';

export const MovableColorPalette: React.FC<MovableColorPaletteProps> = ({ design, setDesign, onClose }) => {
  const [position, setPosition] = useState({ x: 20, y: 120 });
  const [activeTab, setActiveTab] = useState<ColorTarget>('shirtColor');
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const isInternalUpdate = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  const selectedElement = design.elements.find(el => el.id === design.selectedId);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper to get current value based on tab
  const getCurrentValue = () => {
      if (activeTab === 'shirtColor') return design.shirtColor;
      if (!selectedElement) return '#000000'; // Fallback
      if (activeTab === 'textColor') return selectedElement.color;
      if (activeTab === 'strokeColor') return selectedElement.strokeColor;
      if (activeTab === 'shadowColor') return selectedElement.shadowColor;
      return '#000000';
  };

  useEffect(() => {
    if (isInternalUpdate.current || !design) {
        isInternalUpdate.current = false;
        return;
    }
    const hex = getCurrentValue();
    if (hex && typeof hex === 'string') setHsl(hexToHSL(hex));
  }, [activeTab, design, design.selectedId]);

  const updateColor = (h: number, s: number, l: number) => {
    isInternalUpdate.current = true;
    setHsl({ h, s, l });
    const hex = hslToHex(h, s, l);
    
    setDesign(prev => {
        if (activeTab === 'shirtColor') {
            return { ...prev, shirtColor: hex };
        }
        
        // Element updates
        if (!prev.selectedId) return prev;
        
        return {
            ...prev,
            elements: prev.elements.map(el => {
                if (el.id !== prev.selectedId) return el;
                
                const updates: any = {};
                if (activeTab === 'textColor') updates.color = hex;
                if (activeTab === 'strokeColor') {
                    updates.strokeColor = hex;
                    if (el.strokeWidth === 0) updates.strokeWidth = 1;
                }
                if (activeTab === 'shadowColor') {
                    updates.shadowColor = hex;
                    if (el.shadowBlur === 0 && el.shadowOffsetX === 0) {
                        updates.shadowBlur = 4;
                        updates.shadowOffsetX = 2;
                        updates.shadowOffsetY = 2;
                    }
                }
                return { ...el, ...updates };
            })
        };
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isMobile) return;
    const target = e.target as HTMLElement;
    if (target.closest('.drag-handle')) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || isMobile) return;
    setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const tabs = [
    { id: 'shirtColor', icon: Layers, label: 'Body' },
    { id: 'textColor', icon: Type, label: 'Text' },
    { id: 'strokeColor', icon: Droplet, label: 'Line' },
    { id: 'shadowColor', icon: Sun, label: 'Shade' }
  ];

  if (!design) return null;

  // Optimized styles for mobile to ensure visibility of the canvas behind
  const containerStyle: React.CSSProperties = isMobile 
    ? { 
        bottom: 0, 
        left: 0, 
        right: 0, 
        width: '100%', 
        borderRadius: '1.5rem 1.5rem 0 0', 
        maxHeight: '45vh', // Restrict height to 45% of view to see the shirt
        overflowY: 'auto',
        boxShadow: '0 -4px 25px rgba(0,0,0,0.5)'
      }
    : { top: position.y, left: position.x, width: '320px', borderRadius: '1rem' };

  return (
    <>
    {/* Transparent backdrop on mobile to allow clicking off to close, but clear enough to see */}
    {isMobile && <div className="fixed inset-0 bg-transparent z-[90]" onClick={onClose}></div>}
    
    <div 
      className={`fixed z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border border-white/20 ring-1 ring-black/80`}
      style={{ 
          ...containerStyle,
          backgroundColor: '#121212', 
          backdropFilter: 'blur(20px)',
          color: 'white'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => isDragging.current = false}
    >
      <div className={`drag-handle flex items-center justify-between bg-white/5 border-b border-white/10 ${isMobile ? 'p-2' : 'p-4 cursor-move'}`}>
        <div className="flex items-center gap-2.5">
            <div className="bg-acid-green p-1 rounded-md shadow-lg">
                <Palette size={isMobile ? 14 : 18} className="text-black" strokeWidth={3} />
            </div>
            <span className={`font-black uppercase tracking-widest text-gray-200 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>Color Studio</span>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
            {!isMobile && <GripHorizontal size={16} className="opacity-50 hover:text-white transition-colors" />}
            <button onClick={onClose} className="hover:text-red-500 transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10">
                {isMobile ? <ChevronDown size={18} /> : <X size={16} />}
            </button>
        </div>
      </div>

      <div className={`flex p-1.5 gap-1.5 bg-black/40 mx-3 rounded-xl border border-white/5 ${isMobile ? 'mt-2' : 'mt-3'}`}>
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ColorTarget)}
                disabled={tab.id !== 'shirtColor' && !selectedElement}
                className={`flex-1 rounded-lg flex flex-col items-center gap-1 transition-all duration-200 relative overflow-hidden group ${
                    isMobile ? 'py-2' : 'py-3 md:py-2'
                } ${
                    activeTab === tab.id 
                    ? 'bg-white/10 text-acid-green shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
                    : tab.id !== 'shirtColor' && !selectedElement ? 'opacity-30 cursor-not-allowed' : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
                <tab.icon size={isMobile ? 14 : 18} className={`relative z-10 transition-transform ${activeTab === tab.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]' : 'group-hover:scale-110'}`} />
                <span className="text-[9px] font-bold uppercase relative z-10 tracking-wider">{tab.label}</span>
            </button>
        ))}
      </div>

      <div className={`${isMobile ? 'p-3 space-y-3' : 'p-5 space-y-6'}`}>
        
        {/* Compact Hex Display for Mobile */}
        <div className={`flex items-center justify-between bg-black/40 rounded-xl border border-white/10 shadow-inner ${isMobile ? 'p-2' : 'p-3'}`}>
             <div className="flex items-center gap-3">
                <div 
                    className={`rounded-lg shadow-lg ring-1 ring-white/20 relative overflow-hidden ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}
                    style={{ backgroundColor: getCurrentValue() }}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
                </div>
                <div>
                    {!isMobile && <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Hex Value</p>}
                    <p className="font-mono font-bold tracking-widest text-white drop-shadow-md" style={{ fontSize: isMobile ? '14px' : '18px' }}>{getCurrentValue()}</p>
                </div>
             </div>
             {activeTab === 'textColor' && selectedElement && (
                 <div className="flex flex-col items-end">
                     <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Opacity</span>
                     <span className="font-mono text-acid-green font-bold">{Math.round((selectedElement.opacity || 1) * 100)}%</span>
                 </div>
             )}
        </div>

        <div className={`space-y-4 ${isMobile ? 'space-y-2' : ''}`}>
            {['h', 's', 'l'].map((channel) => (
                <div key={channel} className="space-y-1.5 group">
                    {!isMobile && (
                        <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 group-hover:text-white transition-colors">
                            <span>{channel === 'h' ? 'Hue' : channel === 's' ? 'Saturation' : 'Lightness'}</span>
                            <span className="font-mono text-gray-500 group-hover:text-acid-green">{hsl[channel as keyof typeof hsl]}{channel === 'h' ? '°' : '%'}</span>
                        </div>
                    )}
                    <div className="relative h-6 md:h-4 rounded-full overflow-hidden ring-1 ring-white/10 group-hover:ring-white/30 transition-all shadow-inner bg-black/50">
                        <input 
                            type="range" 
                            min="0" 
                            max={channel === 'h' ? 360 : 100} 
                            value={hsl[channel as keyof typeof hsl]}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                const newHsl = { ...hsl, [channel]: val };
                                updateColor(newHsl.h, newHsl.s, newHsl.l);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                        />
                         <div 
                            className="absolute top-1 bottom-1 left-1 right-1 rounded-full"
                            style={{ 
                                background: channel === 'h' 
                                    ? 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
                                    : channel === 's'
                                    ? `linear-gradient(to right, #2a2a2a, hsl(${hsl.h}, 100%, 50%))`
                                    : `linear-gradient(to right, #000, hsl(${hsl.h}, ${hsl.s}%, 50%), #fff)`
                            }}
                        />
                        <div 
                            className="absolute top-0 bottom-0 w-2 md:w-1.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none transition-transform"
                            style={{ 
                                left: `${channel === 'h' ? (hsl.h / 360) * 100 : hsl[channel as keyof typeof hsl]}%`,
                                transform: 'translateX(-50%)'
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
        
        {/* Only show these extras if not on mobile or if there's vertical space */}
        <div className={`min-h-[40px] bg-white/5 rounded-xl border border-white/5 ${isMobile ? 'p-2 hidden' : 'p-3'}`}>
            {activeTab === 'textColor' && selectedElement && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                        <span className="flex items-center gap-1"><SlidersHorizontal size={10}/> Transparency</span>
                    </div>
                    <input 
                        type="range" min="0" max="1" step="0.01"
                        value={selectedElement.opacity}
                        onChange={(e) => setDesign(prev => ({
                            ...prev,
                            elements: prev.elements.map(el => el.id === selectedElement.id ? { ...el, opacity: Number(e.target.value) } : el)
                        }))}
                        className="w-full h-4 md:h-2 rounded-lg bg-black/40 accent-acid-green appearance-none cursor-pointer hover:bg-black/60 transition-colors"
                    />
                </div>
            )}
            
            {activeTab === 'shirtColor' && (
                <div className="flex items-center justify-center h-full text-[10px] font-mono text-gray-500 animate-in fade-in">
                    ADJUST T-SHIRT BASE COLOR
                </div>
            )}
            
            {!selectedElement && activeTab !== 'shirtColor' && (
                <div className="flex items-center justify-center h-full text-[10px] font-mono text-red-500 animate-in fade-in">
                    SELECT AN ELEMENT TO EDIT
                </div>
            )}
        </div>

        <div className={`border-t border-white/10 pb-6 md:pb-0 ${isMobile ? 'pt-2' : 'pt-4'}`}>
            <p className="text-[9px] font-bold uppercase text-gray-500 mb-3 tracking-widest">Quick Presets</p>
            <div className={`grid grid-cols-6 gap-3 ${isMobile ? 'gap-2' : 'md:gap-2'}`}>
                {PRESET_COLORS.map(color => (
                    <button
                        key={color}
                        onClick={() => {
                            isInternalUpdate.current = true;
                            const h = hexToHSL(color);
                            updateColor(h.h, h.s, h.l);
                        }}
                        className="group relative w-full aspect-square rounded-full border border-white/10 overflow-hidden shadow-sm transition-transform hover:scale-110 active:scale-95 ring-1 ring-transparent hover:ring-white/50"
                        title={color}
                    >
                        <div className="absolute inset-0" style={{ backgroundColor: color }}></div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>
                        {color.toLowerCase() === (getCurrentValue() || '').toLowerCase() && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                                 <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>
                             </div>
                        )}
                    </button>
                ))}
            </div>
        </div>

      </div>
    </div>
    </>
  );
};