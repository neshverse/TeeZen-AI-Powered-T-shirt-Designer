import React, { useEffect, useState, useRef } from 'react';
import { X, ExternalLink, Timer, Lock, Unlock, TestTube2 } from 'lucide-react';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ isOpen, onClose, onContinue }) => {
  const [clickedAd, setClickedAd] = useState(false);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [hoveringAd, setHoveringAd] = useState(false);

  // Focus blur hack to detect click on iframe
  useEffect(() => {
    const handleBlur = () => {
      if (hoveringAd && isOpen) {
        setClickedAd(true);
      }
    };
    
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [hoveringAd, isOpen]);

  useEffect(() => {
      if (!isOpen) {
          setClickedAd(false);
          setHoveringAd(false);
      }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white border-4 border-black w-full max-w-lg p-0 relative animate-in zoom-in-95 duration-200 shadow-[8px_8px_0_#ccff00]">
        
        {/* Header */}
        <div className="bg-black text-white p-3 flex justify-between items-center">
            <span className="font-mono font-bold uppercase text-sm tracking-widest text-acid-green">Sponsored Content</span>
            <button onClick={onClose} className="hover:text-red-500"><X size={20} /></button>
        </div>

        <div className="p-6 text-center space-y-4">
            <h2 className="text-2xl font-black italic">UNLOCK YOUR DESIGN</h2>
            <p className="font-mono text-sm text-gray-500">
                To keep this tool free, please check out our sponsor below.<br/>
                <span className="font-bold text-red-500">Click the ad to unlock the download button.</span>
            </p>
            
            {/* AD PLACEMENT: DISPLAY AD (RECTANGLE) */}
            <div 
                ref={adContainerRef}
                onMouseEnter={() => setHoveringAd(true)}
                onMouseLeave={() => setHoveringAd(false)}
                className={`w-full min-h-[250px] bg-gray-100 border-4 border-dashed flex flex-col items-center justify-center gap-2 relative overflow-hidden transition-all ${clickedAd ? 'border-acid-green bg-green-50' : 'border-red-300 hover:border-red-500'}`}
            >
                 
                 {/* --- GOOGLE ADS CODE START --- */}
                 {/* 
                 <ins class="adsbygoogle"
                      style="display:block"
                      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                      data-ad-slot="1234567890"
                      data-ad-format="auto"
                      data-full-width-responsive="true"></ins>
                 <script>
                      (adsbygoogle = window.adsbygoogle || []).push({});
                 </script>
                 */}
                 {/* --- GOOGLE ADS CODE END --- */}

                 {/* VISUAL PLACEHOLDER (REMOVE WHEN ADS ARE ACTIVE) */}
                 <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 pointer-events-none -z-10"></div>
                 <div className="relative z-0 pointer-events-none flex flex-col items-center">
                    <div className="bg-white p-2 border border-black shadow-neo -rotate-2">
                        <span className="font-black text-xl">GOOGLE ADS</span>
                    </div>
                    <span className="font-mono text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <ExternalLink size={12}/> Visit Sponsor
                    </span>
                 </div>
                 
                 {clickedAd && (
                     <div className="absolute inset-0 bg-acid-green/20 flex items-center justify-center pointer-events-none z-20">
                         <div className="bg-white border-2 border-black p-2 font-bold flex items-center gap-2 shadow-neo">
                             <Unlock size={16} /> UNLOCKED
                         </div>
                     </div>
                 )}
            </div>

            <div className="pt-4 border-t-2 border-dashed border-gray-200 space-y-3">
                <button 
                    onClick={onContinue}
                    disabled={!clickedAd}
                    className="w-full py-4 bg-acid-green border-2 border-black font-black text-xl uppercase shadow-neo hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                    {!clickedAd ? (
                        <span className="flex items-center justify-center gap-2"><Lock size={20} /> VISIT AD TO UNLOCK</span>
                    ) : (
                        "DOWNLOAD DESIGN"
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};