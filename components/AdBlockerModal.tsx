import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export const AdBlockerModal = () => {
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // Create a bait element that ad blockers typically hide
    const bait = document.createElement('div');
    bait.className = 'adsbygoogle ad-banner';
    bait.style.height = '1px';
    bait.style.width = '1px';
    bait.style.position = 'absolute';
    bait.style.left = '-10000px';
    bait.style.top = '-10000px';
    document.body.appendChild(bait);

    const checkAds = () => {
      // Check if bait is hidden or has no size
      const style = window.getComputedStyle(bait);
      if (
        style.display === 'none' || 
        style.visibility === 'hidden' || 
        bait.offsetHeight === 0 ||
        // Also check if standard ad blocking rules applied to generic ad classes
        bait.offsetParent === null
      ) {
        setIsBlocked(true);
      }
      // Clean up
      try {
        if (document.body.contains(bait)) {
            document.body.removeChild(bait);
        }
      } catch (e) {}
    };

    // Delay check to allow ad blockers to do their thing
    setTimeout(checkAds, 1000);
  }, []);

  if (!isBlocked) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white border-4 border-black p-8 max-w-md text-center shadow-[10px_10px_0_#ff0000] relative animate-in zoom-in-95">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white p-3 border-4 border-black rounded-full">
            <ShieldAlert size={32} />
        </div>
        
        <h2 className="text-3xl font-black uppercase mt-6 mb-4 leading-none">Ad Blocker<br/><span className="text-red-600">Detected</span></h2>
        
        <p className="font-mono font-bold text-sm text-gray-600 mb-8 leading-relaxed">
          Our AI Design Studio requires significant server resources. We keep it free by showing ads.<br/><br/>
          <span className="bg-yellow-300 px-1 text-black">Please disable your ad blocker to continue creating.</span>
        </p>
        
        <button 
            onClick={() => window.location.reload()}
            className="w-full bg-black text-white border-2 border-black py-4 font-black uppercase hover:bg-gray-800 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
            <RefreshCw size={20} /> I've Disabled It
        </button>
      </div>
    </div>
  );
};