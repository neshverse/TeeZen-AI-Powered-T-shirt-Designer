import React, { useRef, useState } from 'react';
import { DesignState, DesignElement } from '../types';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface TShirtCanvasProps {
  design: DesignState;
  setDesign?: React.Dispatch<React.SetStateAction<DesignState>>;
  side: 'FRONT' | 'BACK';
  id?: string;
  readOnly?: boolean;
}

export const TShirtCanvas: React.FC<TShirtCanvasProps> = ({ design, setDesign, side, id, readOnly = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Handle Dragging
  const handlePointerDown = (e: React.PointerEvent, elementId: string) => {
    if (readOnly || !setDesign) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Set active selection
    setDesign(prev => ({ ...prev, selectedId: elementId }));
    setDraggingId(elementId);
    
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (readOnly || !setDesign || !draggingId || !containerRef.current) return;
    
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate new position as percentage
    let newX = ((e.clientX - rect.left) / rect.width) * 100;
    let newY = ((e.clientY - rect.top) / rect.height) * 100;

    // Optional bounds clamping (looser for creative freedom)
    newX = Math.max(-20, Math.min(120, newX));
    newY = Math.max(-20, Math.min(120, newY));

    setDesign(prev => ({
        ...prev,
        elements: prev.elements.map(el => 
            el.id === draggingId ? { ...el, position: { x: newX, y: newY } } : el
        )
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (readOnly) return;
    setDraggingId(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleZoom = (delta: number) => {
      setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const resetZoom = () => setZoomLevel(1);

  return (
    <div 
        id={id || "design-studio-preview"} 
        className="relative w-full h-full flex items-center justify-center p-8 bg-white overflow-hidden touch-none" 
        onPointerUp={() => setDraggingId(null)}
        onPointerLeave={() => setDraggingId(null)}
        onClick={() => {
            // Deselect if clicking background
            if(!readOnly && setDesign && !draggingId) {
                // We handle this carefully, maybe we want to keep selection?
                // setDesign(prev => ({ ...prev, selectedId: null }));
            }
        }}
    >
        {!readOnly && (
            <div className="absolute top-4 right-4 z-[60] flex flex-col gap-2">
                <div className="bg-white border-2 border-black p-1 shadow-neo flex flex-col gap-1 items-center rounded-sm">
                    <button onClick={() => handleZoom(0.1)} className="p-2 hover:bg-gray-100 active:bg-gray-200 transition-colors"><ZoomIn size={20} /></button>
                    <span className="text-[9px] font-mono font-bold select-none">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={() => handleZoom(-0.1)} className="p-2 hover:bg-gray-100 active:bg-gray-200 transition-colors"><ZoomOut size={20} /></button>
                    {zoomLevel !== 1 && <button onClick={resetZoom} className="p-2 text-red-500 hover:bg-red-50"><RotateCcw size={16} /></button>}
                </div>
            </div>
        )}

        {!readOnly && <div className="absolute inset-0 border-[12px] border-black pointer-events-none z-30"></div>}
        
        {!readOnly && (
            <div className="absolute inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden opacity-30">
                <div className="-rotate-45 text-6xl font-black text-gray-300 select-none whitespace-nowrap">
                    TEEGENZ.AI PREVIEW • TEEGENZ.AI PREVIEW
                </div>
            </div>
        )}

        <div className="absolute top-0 right-0 p-4 z-40 flex items-center gap-2">
            <span className="font-black italic text-xl tracking-tighter">TEE<span className="text-vivid-purple">GEN</span> Z</span>
            <div className="w-8 h-8 bg-black text-acid-green flex items-center justify-center font-display border border-white">Z</div>
        </div>
        
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
             style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}>
        </div>

      <div 
        className="relative w-full max-w-md aspect-[3/4] filter drop-shadow-xl transition-all duration-200 z-10 origin-top"
        style={{ transform: `scale(${zoomLevel}) translateY(${zoomLevel > 1 ? '5%' : '0'})` }}
      >
        <svg viewBox="0 0 500 600" className="w-full h-full" style={{ color: design.shirtColor }}>
            {side === 'FRONT' ? (
                <path fill="currentColor" d="M372,94.2c-15.6,2.1-26.2,2.4-53.2-12.8c-12-6.7-27.5-12.1-47.5-12.8h-1.3c-20,0.7-35.4,6.1-47.5,12.8C195.5,96.6,184.9,96.3,169.3,94.2c-29.2-3.9-57.9-19-86.8-37.5L52.8,37.6C47.3,34,40.1,34.8,35.5,39.5L14,62.3c-5.5,5.8-5.3,15,0.6,20.5l42.6,39.8c8.8,8.2,14.6,18.9,16.5,30.8l15.9,101.9c0,0,13.2,109.8,16.8,172.6c3.3,58.3,21.9,114.6,21.9,114.6s29.6,12.5,121.7,12.5s121.7-12.5,121.7-12.5s18.6-56.3,21.9-114.6c3.6-62.8,16.8-172.6,16.8-172.6l15.9-101.9c1.9-11.9,7.7-22.6,16.5-30.8l42.6-39.8c5.9-5.5,6.1-14.7,0.6-20.5l-21.5-22.8c-4.6-4.8-11.8-5.6-17.3-2l-29.6,19.2C429.9,75.2,401.2,90.3,372,94.2z"/>
            ) : (
                <path fill="currentColor" d="M372,94.2c-15.6,2.1-26.2,2.4-53.2-12.8c-12-6.7-27.5-12.1-47.5-12.8h-1.3c-20,0.7-35.4,6.1-47.5,12.8C195.5,96.6,184.9,96.3,169.3,94.2c-29.2-3.9-57.9-19-86.8-37.5L52.8,37.6C47.3,34,40.1,34.8,35.5,39.5L14,62.3c-5.5,5.8-5.3,15,0.6,20.5l42.6,39.8c8.8,8.2,14.6,18.9,16.5,30.8l15.9,101.9c0,0,13.2,109.8,16.8,172.6c3.3,58.3,21.9,114.6,21.9,114.6s29.6,12.5,121.7,12.5s121.7-12.5,121.7-12.5s18.6-56.3,21.9-114.6c3.6-62.8,16.8-172.6,16.8-172.6l15.9-101.9c1.9-11.9,7.7-22.6,16.5-30.8l42.6-39.8c5.9-5.5,6.1-14.7,0.6-20.5l-21.5-22.8c-4.6-4.8-11.8-5.6-17.3-2l-29.6,19.2C429.9,75.2,401.2,90.3,372,94.2z"/>
            )}
            <path fill="rgba(0,0,0,0.15)" d="M250,70c30,0,55,10,70,25c-15,10-40,15-70,15s-55-5-70-15C195,80,220,70,250,70z"/>
        </svg>

        <div ref={containerRef} className="absolute top-[20%] left-[22%] w-[56%] h-[60%] overflow-hidden z-10">
             {design.elements.map(el => {
                 const isSelected = el.id === design.selectedId;
                 const shadowStyle = el.shadowColor && (el.shadowOffsetX || el.shadowOffsetY || el.shadowBlur)
                    ? `${el.shadowOffsetX}px ${el.shadowOffsetY}px ${el.shadowBlur}px ${el.shadowColor}`
                    : 'none';

                 if (el.type === 'image') {
                     return (
                        <img 
                            key={el.id}
                            src={el.content}
                            alt="Design"
                            draggable={false}
                            onPointerDown={(e) => handlePointerDown(e, el.id)}
                            onPointerMove={handlePointerMove}
                            className={`absolute origin-center select-none transition-all ${!readOnly ? 'cursor-move' : ''} ${isSelected && !readOnly ? 'ring-4 ring-electric-blue opacity-90 shadow-[0_0_15px_rgba(0,255,255,0.4)] z-50' : 'z-10'}`}
                            style={{
                                top: `${el.position.y}%`,
                                left: `${el.position.x}%`,
                                transform: `translate(-50%, -50%) rotate(${el.rotation}deg) scale(${el.scale})`,
                                maxWidth: '80%', maxHeight: '80%',
                                touchAction: 'none'
                            }}
                        />
                     );
                 }
                 return (
                    <div
                        key={el.id}
                        onPointerDown={(e) => handlePointerDown(e, el.id)}
                        onPointerMove={handlePointerMove}
                        className={`absolute select-none whitespace-pre-wrap leading-tight origin-center transition-transform ${el.font} ${!readOnly ? 'cursor-move pointer-events-auto' : ''} ${isSelected && !readOnly ? 'ring-2 ring-hot-pink bg-black/5 shadow-neo-sm z-50' : 'hover:scale-105 active:scale-100 z-20'}`}
                        style={{
                            top: `${el.position.y}%`,
                            left: `${el.position.x}%`,
                            transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
                            color: el.color,
                            fontSize: `${el.fontSize}px`,
                            letterSpacing: `${el.letterSpacing}px`,
                            lineHeight: el.lineHeight,
                            textAlign: el.textAlign,
                            textTransform: el.textTransform,
                            WebkitTextStroke: el.strokeWidth > 0 ? `${el.strokeWidth}px ${el.strokeColor}` : 'none',
                            textShadow: shadowStyle,
                            opacity: el.opacity,
                            mixBlendMode: el.blendMode as any,
                            touchAction: 'none'
                        }}
                    >
                        {el.content}
                        {isSelected && !readOnly && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-hot-pink text-white text-[10px] px-2 py-0.5 rounded-full font-mono shadow-sm border border-black animate-bounce whitespace-nowrap">
                                SELECTED
                            </div>
                        )}
                    </div>
                 );
             })}
        </div>
        
        {/* URL Watermark - Always Visible, Full Opacity */}
        <div className="absolute bottom-4 right-4 z-20 rotate-[-1deg]">
            <div className="bg-white border border-black px-2 py-0.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <p className="font-mono text-[10px] font-black tracking-widest text-black">WWW.TEEGENZ.AI</p>
            </div>
        </div>
      </div>
    </div>
  );
};