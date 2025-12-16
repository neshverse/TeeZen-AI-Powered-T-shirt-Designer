import React, { useRef, useState } from 'react';
import { DesignState, FONTS, createNewTextElement, createNewImageElement } from '../types';
import { cartoonifyImage } from '../services/ai';
import { Type, Move, AlignCenter, AlignLeft, AlignRight, Layers, Blend, Undo2, Redo2, Image as ImageIcon, Sparkles, Loader2, Trash2, Plus, Scissors, Upload } from 'lucide-react';

interface ControlsProps {
  design: DesignState;
  setDesign: React.Dispatch<React.SetStateAction<DesignState>>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ design, setDesign, undo, redo, canUndo, canRedo }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [cartoonStyle, setCartoonStyle] = useState('Anime');

  const selectedElement = design.elements.find(el => el.id === design.selectedId);

  const updateSelected = (updates: Partial<typeof selectedElement>) => {
      if (!selectedElement) return;
      setDesign(prev => ({
          ...prev,
          elements: prev.elements.map(el => el.id === selectedElement.id ? { ...el, ...updates } : el)
      }));
  };

  const handleAddText = () => {
      const newEl = createNewTextElement("NEW TEXT");
      setDesign(prev => ({
          ...prev,
          elements: [...prev.elements, newEl],
          selectedId: newEl.id
      }));
  };

  const handleSplitText = () => {
      if (!selectedElement || selectedElement.type !== 'text') return;
      const words = selectedElement.content.split(/\s+/);
      if (words.length <= 1) return;

      const newElements = words.map((word, i) => ({
          ...selectedElement,
          id: `split-${Date.now()}-${i}`,
          content: word,
          position: { 
              x: selectedElement.position.x, 
              y: selectedElement.position.y + (i * 10) // Waterfall them slightly
          }
      }));

      setDesign(prev => ({
          ...prev,
          elements: [
              ...prev.elements.filter(el => el.id !== selectedElement.id),
              ...newElements
          ],
          selectedId: newElements[0].id
      }));
  };

  const handleDelete = () => {
      if (!selectedElement) return;
      setDesign(prev => ({
          ...prev,
          elements: prev.elements.filter(el => el.id !== selectedElement.id),
          selectedId: null
      }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newEl = createNewImageElement(reader.result as string);
        setDesign(prev => ({
            ...prev,
            elements: [...prev.elements, newEl],
            selectedId: newEl.id
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCartoonify = async () => {
    if (!selectedElement || selectedElement.type !== 'image') return;
    setProcessingImage(true);
    try {
        const newImage = await cartoonifyImage(selectedElement.content, cartoonStyle);
        updateSelected({ content: newImage });
    } catch (error) {
        alert("Failed to generate cartoon.");
    }
    setProcessingImage(false);
  };

  return (
    <div className="flex flex-col gap-6 p-1">
      
      {/* Hidden Input for Global Access */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

      {/* Header with Undo/Redo/Add */}
      <div className="flex items-center justify-between border-b-2 border-dashed border-gray-200 pb-2 mb-[-1rem]">
         <h3 className="font-black text-lg uppercase">Editor</h3>
         <div className="flex gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="h-10 w-10 flex items-center justify-center border-2 border-black bg-electric-blue hover:bg-white transition-all shadow-neo hover:shadow-none active:translate-y-0.5 active:shadow-none" title="Upload Image"><Upload size={20} /></button>
            <button onClick={handleAddText} className="h-10 w-10 flex items-center justify-center border-2 border-black bg-acid-green hover:bg-white transition-all shadow-neo hover:shadow-none active:translate-y-0.5 active:shadow-none" title="Add Text"><Plus size={20} /></button>
            <button onClick={undo} disabled={!canUndo} className="h-10 w-10 flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-30 shadow-neo hover:shadow-none active:translate-y-0.5 active:shadow-none" title="Undo"><Undo2 size={20} /></button>
            <button onClick={redo} disabled={!canRedo} className="h-10 w-10 flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100 disabled:opacity-30 shadow-neo hover:shadow-none active:translate-y-0.5 active:shadow-none" title="Redo"><Redo2 size={20} /></button>
         </div>
      </div>

      {!selectedElement ? (
          <div className="text-center p-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-sm mt-4">
              <p className="font-mono text-xs font-bold text-gray-500 mb-4">SELECT AN ELEMENT TO EDIT</p>
              <button onClick={handleAddText} className="bg-black text-white px-6 py-3 font-bold uppercase text-sm shadow-neo active:shadow-none active:translate-y-0.5 transition-all">Add New Text</button>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 text-sm font-bold text-gray-400 hover:text-black cursor-pointer border-2 border-dashed border-gray-300 hover:border-black p-4 flex flex-col items-center gap-2 transition-colors hover:bg-white"
             >
                 <Upload size={24} />
                 <span>or Upload Image</span>
             </div>
          </div>
      ) : (
        <>
            {/* Selected Element Controls */}
            <div className="bg-electric-blue/20 p-2 border border-electric-blue flex justify-between items-center rounded-sm mt-4">
                <span className="text-[10px] font-mono font-bold uppercase ml-2">Editing: {selectedElement.type}</span>
                <div className="flex gap-2">
                     {selectedElement.type === 'text' && (
                         <button onClick={handleSplitText} className="text-[10px] font-bold bg-white border border-black px-3 py-2 flex items-center gap-1 hover:bg-hot-pink hover:text-white transition-colors" title="Split into individual words">
                             <Scissors size={14} /> SPLIT WORDS
                         </button>
                     )}
                     <button onClick={handleDelete} className="bg-red-500 text-white h-8 w-8 flex items-center justify-center border border-black hover:bg-red-600 shadow-sm active:shadow-none active:translate-y-0.5"><Trash2 size={16} /></button>
                </div>
            </div>

            {selectedElement.type === 'image' && (
                 <div className="space-y-4 bg-off-white p-4 border-2 border-black shadow-neo rounded-sm">
                    <div className="flex gap-2">
                        <select 
                            value={cartoonStyle}
                            onChange={(e) => setCartoonStyle(e.target.value)}
                            className="flex-1 bg-white border-2 border-black text-xs font-bold p-2 h-10"
                        >
                            <option value="Anime">Anime Style</option>
                            <option value="3D Pixar">3D Cartoon</option>
                            <option value="Retro Comic">Retro Comic</option>
                            <option value="Pixel Art">Pixel Art</option>
                            <option value="Cyberpunk">Cyberpunk</option>
                        </select>
                        <button 
                            onClick={handleCartoonify}
                            disabled={processingImage}
                            className="bg-vivid-purple text-white border-2 border-black h-10 w-10 flex items-center justify-center shadow-neo hover:translate-y-0.5 hover:shadow-none transition-all"
                        >
                            {processingImage ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        </button>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase">Scale</label>
                        <input type="range" min="0.1" max="3" step="0.1" value={selectedElement.scale} onChange={(e) => updateSelected({ scale: Number(e.target.value) })} className="w-full h-4 bg-gray-300 accent-black appearance-none rounded-lg" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase">Rotate</label>
                        <input type="range" min="-180" max="180" value={selectedElement.rotation} onChange={(e) => updateSelected({ rotation: Number(e.target.value) })} className="w-full h-4 bg-gray-300 accent-black appearance-none rounded-lg" />
                    </div>
                 </div>
            )}

            {selectedElement.type === 'text' && (
                <>
                    <div className="space-y-2">
                        <label className="text-xs font-bold font-mono text-gray-500 uppercase flex items-center gap-2"><Type size={14} /> Text Content</label>
                        <textarea 
                            value={selectedElement.content}
                            onChange={(e) => updateSelected({ content: e.target.value })}
                            className="w-full bg-white border-2 border-black p-3 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-acid-green shadow-neo transition-all rounded-sm resize-none"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                         <label className="text-xs font-bold font-mono text-gray-500 uppercase flex items-center gap-2"><Layers size={14} /> Font</label>
                         <div className="grid grid-cols-3 gap-2">
                            {FONTS.map(f => (
                                <button key={f.name} onClick={() => updateSelected({ font: f.value })} className={`border-2 border-black p-1 py-3 text-xs truncate transition-all ${selectedElement.font === f.value ? 'bg-black text-white shadow-neo' : 'bg-white hover:bg-gray-100'}`}>
                                    <span className={f.value}>{f.name}</span>
                                </button>
                            ))}
                         </div>
                    </div>
                </>
            )}

             <div className="space-y-4 bg-off-white p-4 border-2 border-black shadow-neo rounded-sm">
                <div className="flex items-center gap-2 mb-2 border-b-2 border-gray-200 pb-2"><Move size={14} /> <span className="text-xs font-bold font-mono uppercase">Transform</span></div>
                
                {selectedElement.type === 'text' && (
                    <div className="flex justify-between pb-1">
                        <div className="flex bg-white border-2 border-black rounded-sm overflow-hidden scale-90 origin-left">
                            <button onClick={() => updateSelected({ textAlign: 'left' })} className={`h-10 w-10 flex items-center justify-center hover:bg-gray-100 ${selectedElement.textAlign === 'left' ? 'bg-acid-green' : ''}`}><AlignLeft size={20} /></button>
                            <button onClick={() => updateSelected({ textAlign: 'center' })} className={`h-10 w-10 flex items-center justify-center border-l-2 border-r-2 border-black hover:bg-gray-100 ${selectedElement.textAlign === 'center' ? 'bg-acid-green' : ''}`}><AlignCenter size={20} /></button>
                            <button onClick={() => updateSelected({ textAlign: 'right' })} className={`h-10 w-10 flex items-center justify-center hover:bg-gray-100 ${selectedElement.textAlign === 'right' ? 'bg-acid-green' : ''}`}><AlignRight size={20} /></button>
                        </div>
                        <div className="flex bg-white border-2 border-black rounded-sm overflow-hidden scale-90 origin-right">
                            <button onClick={() => updateSelected({ textTransform: 'uppercase' })} className={`h-10 px-3 font-bold text-xs hover:bg-gray-100 flex items-center ${selectedElement.textTransform === 'uppercase' ? 'bg-hot-pink text-white' : ''}`}>AA</button>
                            <button onClick={() => updateSelected({ textTransform: 'lowercase' })} className={`h-10 px-3 font-bold text-xs border-l-2 border-black hover:bg-gray-100 flex items-center ${selectedElement.textTransform === 'lowercase' ? 'bg-hot-pink text-white' : ''}`}>aa</button>
                        </div>
                    </div>
                )}
                
                {selectedElement.type === 'text' && (
                    <div className="flex items-center gap-3">
                         <span className="font-mono text-[10px] w-8">SIZE</span>
                         <input type="range" min="12" max="150" value={selectedElement.fontSize} onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })} className="w-full accent-hot-pink h-4 bg-gray-300 rounded-lg appearance-none cursor-pointer" />
                    </div>
                )}
                 
                 <div className="flex items-center gap-3">
                     <span className="font-mono text-[10px] w-8">ROT</span>
                     <input type="range" min="-180" max="180" value={selectedElement.rotation} onChange={(e) => updateSelected({ rotation: Number(e.target.value) })} className="w-full accent-electric-blue h-4 bg-gray-300 rounded-lg appearance-none cursor-pointer" />
                 </div>
             </div>

             <div className="space-y-4 bg-off-white p-4 border-2 border-black shadow-neo rounded-sm">
                 <div className="flex items-center gap-2 mb-2 border-b-2 border-gray-200 pb-2"><Blend size={14} /> <span className="text-xs font-bold font-mono uppercase">Effects</span></div>
                 
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase">Blend Mode</span>
                    <select value={selectedElement.blendMode} onChange={(e) => updateSelected({ blendMode: e.target.value as any })} className="bg-white border border-black text-xs font-mono p-2 rounded-sm h-8">
                        <option value="normal">Normal</option>
                        <option value="multiply">Multiply</option>
                        <option value="screen">Screen</option>
                        <option value="overlay">Overlay</option>
                        <option value="difference">Difference</option>
                    </select>
                 </div>
                 
                 {selectedElement.type === 'text' && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono font-bold"><span>OUTLINE</span><span>{selectedElement.strokeWidth}px</span></div>
                        <input type="range" min="0" max="10" step="0.5" value={selectedElement.strokeWidth} onChange={(e) => updateSelected({ strokeWidth: Number(e.target.value) })} className="w-full accent-black h-4 bg-gray-300 rounded-lg appearance-none cursor-pointer" />
                    </div>
                 )}
             </div>
        </>
      )}
    </div>
  );
};