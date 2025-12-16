import React, { useState, useCallback } from 'react';
import { TShirtCanvas } from './components/TShirtCanvas';
import { Controls } from './components/Controls';
import { QuoteGenerator } from './components/QuoteGenerator';
import { BackgroundGenerator } from './components/BackgroundGenerator';
import { MovableColorPalette } from './components/MovableColorPalette';
import { AdModal } from './components/AdModal';
import { AdBlockerModal } from './components/AdBlockerModal';
import { AppDesignState, TShirtSideDesign, createNewTextElement, createNewImageElement } from './types';
import { useHistory } from './hooks/useHistory';
import { ShoppingBag, Share2, Download, Zap, Loader2, Palette, Repeat, ArrowRightLeft, Sparkles, Image as ImageIcon, Edit3 } from 'lucide-react';
import html2canvas from 'html2canvas';

const DEFAULT_SIDE: TShirtSideDesign = {
  shirtColor: '#ffffff',
  elements: [
    { ...createNewTextElement("HELLO\nWORLD"), color: '#121212' }
  ],
  selectedId: null
};

const INITIAL_STATE: AppDesignState = {
  front: { ...DEFAULT_SIDE, selectedId: DEFAULT_SIDE.elements[0].id },
  back: { 
      ...DEFAULT_SIDE, 
      elements: [{ ...createNewTextElement("BACK\nSIDE"), color: '#121212' }],
      selectedId: null 
  },
  activeSide: 'FRONT'
};

function App() {
  const { state, set: setGlobalState, undo, redo, canUndo, canRedo } = useHistory<AppDesignState>(INITIAL_STATE);
  
  const [saving, setSaving] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<'download' | 'share' | null>(null);
  
  const [activeTool, setActiveTool] = useState<'quotes' | 'art' | 'edit'>('quotes');

  const currentDesign = state.activeSide === 'FRONT' ? state.front : state.back;

  const setDesign = useCallback((update: React.SetStateAction<TShirtSideDesign>) => {
    setGlobalState((prev) => {
      const activeKey = prev.activeSide === 'FRONT' ? 'front' : 'back';
      const currentSideState = prev[activeKey];
      
      const newSideState = typeof update === 'function' 
        ? (update as (p: TShirtSideDesign) => TShirtSideDesign)(currentSideState)
        : update;

      // Sync shirt color
      const otherKey = prev.activeSide === 'FRONT' ? 'back' : 'front';
      let otherSideState = prev[otherKey];
      
      if (newSideState.shirtColor !== currentSideState.shirtColor) {
         otherSideState = { ...otherSideState, shirtColor: newSideState.shirtColor };
      }

      return {
        ...prev,
        [activeKey]: newSideState,
        [otherKey]: otherSideState
      };
    });
  }, [setGlobalState]);

  const toggleSide = () => {
    setGlobalState(prev => ({
      ...prev,
      activeSide: prev.activeSide === 'FRONT' ? 'BACK' : 'FRONT'
    }));
  };

  const handleQuoteSelect = (quote: string) => {
    const newEl = createNewTextElement(quote);
    newEl.rotation = (Math.random() * 10) - 5;
    
    setDesign(prev => ({
        ...prev,
        elements: [...prev.elements, newEl],
        selectedId: newEl.id
    }));
    setActiveTool('edit');
  };

  const handleImageSelect = (imageData: string) => {
      const newEl = createNewImageElement(imageData);
      setDesign(prev => ({
          ...prev,
          elements: [...prev.elements, newEl],
          selectedId: newEl.id
      }));
      setActiveTool('edit');
  };

  const generateImage = async (): Promise<Blob | null> => {
      const element = document.getElementById('export-container');
      if (!element) return null;
      try {
            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
            });
            return new Promise(resolve => {
                canvas.toBlob(blob => resolve(blob), 'image/png');
            });
      } catch (error) {
          console.error("Image generation failed", error);
          return null;
      }
  };

  const processPendingAction = async () => {
    setShowAd(false);
    setSaving(true);
    
    const blob = await generateImage();
    
    if (!blob) {
        setSaving(false);
        setPendingAction(null);
        alert("Could not generate image. Please try again.");
        return;
    }

    try {
        if (pendingAction === 'download') {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `teegen-z-full-design-${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(url);
        } else if (pendingAction === 'share') {
             if (navigator.share) {
                const file = new File([blob], `teegen-z-design-${Date.now()}.png`, { type: 'image/png' });
                await navigator.share({
                    title: 'My TeeGen Z Design',
                    text: 'Check out this fresh drip I made with AI on TeeGen Z! #TeeGenZ',
                    files: [file]
                });
            } else {
                // Fallback to download if share not supported
                alert("Sharing not supported on this device. Downloading instead.");
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `teegen-z-full-design-${Date.now()}.png`;
                link.click();
                URL.revokeObjectURL(url);
            }
        }
    } catch (error) {
        console.error("Action failed:", error);
    }
    
    setSaving(false);
    setPendingAction(null);
  };

  const handleDownloadClick = () => {
      setPendingAction('download');
      setShowAd(true);
  };

  const handleShareClick = () => {
      setPendingAction('share');
      setShowAd(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-dark-matter pb-24 lg:pb-10 overflow-x-hidden relative">
      <AdBlockerModal />

      {/* Hidden Container for Exporting */}
      <div 
        id="export-container"
        style={{ position: 'fixed', top: -9999, left: -9999, width: '1600px', display: 'flex', gap: '0', background: 'white', padding: '40px' }}
      >
          <div className="flex-1 flex flex-col items-center">
             <h2 className="text-4xl font-black mb-4 uppercase">Front</h2>
             <div className="w-[600px] h-[800px] relative border-4 border-black">
                <TShirtCanvas design={state.front} side="FRONT" readOnly={true} />
             </div>
          </div>
          <div className="flex-1 flex flex-col items-center">
             <h2 className="text-4xl font-black mb-4 uppercase">Back</h2>
             <div className="w-[600px] h-[800px] relative border-4 border-black">
                <TShirtCanvas design={state.back} side="BACK" readOnly={true} />
             </div>
          </div>
      </div>

      {showColorPalette && (
        <MovableColorPalette 
            design={currentDesign} 
            setDesign={setDesign} 
            onClose={() => setShowColorPalette(false)} 
        />
      )}

      <AdModal isOpen={showAd} onClose={() => { setShowAd(false); setPendingAction(null); }} onContinue={processPendingAction} />

      <div className="bg-hot-pink border-b-2 border-black py-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex gap-8 font-black font-mono text-sm">
             <span>★ CREATE FOR FREE ★</span>
             <span>AI POWERED DESIGN STUDIO</span>
             <span>★ DOWNLOAD YOUR VIBE ★</span>
             <span>NO CAP JUST STYLE</span>
          </div>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b-4 border-black px-3 py-3 flex justify-between items-center shadow-lg safe-top">
        <div className="flex items-center gap-2 group cursor-pointer relative">
            <div className="absolute -inset-1 bg-electric-blue blur opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-10 h-10 bg-black text-acid-green border-2 border-black flex items-center justify-center shadow-neo-hover transform group-hover:rotate-12 transition-transform">
                <span className="font-display text-2xl animate-pulse-fast">Z</span>
            </div>
            <div className="flex flex-col leading-none">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter italic">TEE<span className="text-vivid-purple">GEN</span></h1>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
             <button onClick={toggleSide} className="flex items-center gap-2 px-3 py-2 font-bold text-xs border-2 border-black bg-acid-green hover:bg-white transition-colors uppercase shadow-neo hover:translate-y-0.5 hover:shadow-none active:translate-y-0.5 active:shadow-none">
                <ArrowRightLeft size={16} /> <span className="hidden sm:inline">Side: {state.activeSide}</span>
             </button>
             <button onClick={() => setShowColorPalette(!showColorPalette)} className={`flex items-center gap-2 px-3 py-2 font-bold text-xs border-2 border-black hover:bg-electric-blue transition-colors shadow-neo active:translate-y-0.5 active:shadow-none ${showColorPalette ? 'bg-electric-blue translate-y-0.5 shadow-none' : 'bg-white'}`}>
                <Palette size={16} /> <span className="hidden sm:inline">COLORS</span>
            </button>
        </div>
      </header>

      <main className="flex-1 max-w-[90rem] mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1 h-fit">
            <div className="flex border-2 border-black bg-white shadow-neo rounded-sm overflow-hidden sticky top-20 z-40 lg:static">
                <button onClick={() => setActiveTool('quotes')} className={`flex-1 py-4 flex flex-col items-center gap-1 border-r-2 border-black transition-colors ${activeTool === 'quotes' ? 'bg-acid-green font-black' : 'bg-white hover:bg-gray-100'}`}>
                    <Sparkles size={20} /> <span className="text-[10px] uppercase font-bold">Text AI</span>
                </button>
                <button onClick={() => setActiveTool('art')} className={`flex-1 py-4 flex flex-col items-center gap-1 border-r-2 border-black transition-colors ${activeTool === 'art' ? 'bg-vivid-purple text-white font-black' : 'bg-white hover:bg-gray-100'}`}>
                    <ImageIcon size={20} /> <span className="text-[10px] uppercase font-bold">Art AI</span>
                </button>
                 <button onClick={() => setActiveTool('edit')} className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors ${activeTool === 'edit' ? 'bg-black text-white font-black' : 'bg-white hover:bg-gray-100'}`}>
                    <Edit3 size={20} /> <span className="text-[10px] uppercase font-bold">Editor</span>
                </button>
            </div>

            <div className="min-h-[400px]">
                {activeTool === 'quotes' && (
                    <div className="animate-in slide-in-from-left-4 fade-in duration-200">
                        <QuoteGenerator onSelectQuote={handleQuoteSelect} />
                    </div>
                )}
                {activeTool === 'art' && (
                     <div className="animate-in slide-in-from-left-4 fade-in duration-200 h-full">
                         <BackgroundGenerator onSelectImage={handleImageSelect} />
                     </div>
                )}
                {activeTool === 'edit' && (
                    <div className="animate-in slide-in-from-left-4 fade-in duration-200 bg-white border-2 border-black p-4 shadow-neo rounded-sm">
                        <Controls 
                            design={currentDesign} 
                            setDesign={setDesign} 
                            undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
                        />
                    </div>
                )}
            </div>
        </div>

        <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2 sticky top-20 z-0">
            <div className="w-full max-w-xl bg-off-white/80 backdrop-blur-sm border-4 border-black rounded-lg p-2 shadow-neo-lg relative overflow-hidden">
                 <div className="absolute top-4 left-4 z-50">
                    <button onClick={toggleSide} className="bg-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase flex items-center gap-1 hover:bg-black hover:text-white transition-colors shadow-sm">
                      <Repeat size={12} /> {state.activeSide}
                    </button>
                 </div>

                 <TShirtCanvas design={currentDesign} setDesign={setDesign} side={state.activeSide} />
                 
                 <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-50 pointer-events-none">
                     <button 
                        onClick={handleShareClick}
                        disabled={saving}
                        className="pointer-events-auto bg-white border-2 border-black px-4 py-3 font-black flex items-center gap-2 hover:bg-vivid-purple hover:text-white shadow-neo hover:shadow-neo-hover active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 text-sm md:text-base uppercase"
                        title="Share Design"
                     >
                        {saving && pendingAction === 'share' ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={20} />}
                        <span className="hidden sm:inline">Share</span>
                     </button>

                    <button 
                        onClick={handleDownloadClick} 
                        disabled={saving} 
                        className="pointer-events-auto bg-white border-2 border-black px-8 py-3 font-black flex items-center gap-2 hover:bg-electric-blue shadow-neo hover:shadow-neo-hover active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 text-sm md:text-base uppercase"
                    >
                        {saving && pendingAction === 'download' ? <Loader2 size={18} className="animate-spin" /> : <Download size={20} />} 
                        {saving && pendingAction === 'download' ? 'Saving...' : 'Download'}
                    </button>
                 </div>
            </div>
        </div>

        <div className="lg:col-span-3 hidden lg:flex flex-col gap-6 order-3 h-fit sticky top-24">
             <div className="bg-white border-4 border-black p-2 flex items-center justify-center min-h-[400px] shadow-neo relative overflow-hidden group">
                <span className="font-black text-xl text-black rotate-90 origin-center">ADVERTISEMENT</span>
             </div>
        </div>

      </main>
    </div>
  );
}

export default App;