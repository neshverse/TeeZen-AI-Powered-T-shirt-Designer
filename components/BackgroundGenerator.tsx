import React, { useState } from 'react';
import { generateDesignImage } from '../services/ai';
import { Sparkles, Image as ImageIcon, Paintbrush, Loader2, ArrowRight } from 'lucide-react';

interface BackgroundGeneratorProps {
  onSelectImage: (imageData: string) => void;
}

const STYLES = [
  'Cyberpunk', 'Vaporwave', 'Retro 90s', 'Street Graffiti', 
  'Minimalist Vector', 'Abstract Geometric', 'Pop Art', 
  'Watercolor', 'Ukiyo-e', 'Glitch Art', 'Dark Gothic', 'Y2K Aesthetic',
  'Kawaii', 'Dark Fantasy', 'Sci-Fi', 'Abstract Expressionism',
  'Pixel Art', 'Surrealism', 'Vintage Poster', 'Doodle Art'
];

export const BackgroundGenerator: React.FC<BackgroundGeneratorProps> = ({ onSelectImage }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cyberpunk');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');
    setGeneratedImage(null);
    
    try {
      const image = await generateDesignImage(prompt, selectedStyle);
      setGeneratedImage(image);
    } catch (e) {
      console.error(e);
      setError('Failed to generate. Try a different prompt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-black p-4 shadow-neo rounded-sm relative overflow-hidden h-full">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-acid-green via-electric-blue to-hot-pink"></div>
      
      <div className="flex items-center gap-2 mb-4">
          <div className="bg-black text-electric-blue p-1.5 shadow-sm">
            <Paintbrush size={18} />
          </div>
          <h2 className="text-xl font-black italic uppercase tracking-tighter">AI Art Studio</h2>
      </div>

      <div className="space-y-4">
        <div>
            <label className="text-[10px] font-mono font-bold uppercase text-gray-500 mb-1 block">Your Vision</label>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., A cybernetic cat riding a pizza slice..."
                className="w-full border-2 border-black p-3 font-bold text-sm focus:ring-4 focus:ring-hot-pink outline-none shadow-sm resize-none"
                rows={2}
            />
        </div>

        <div>
            <label className="text-[10px] font-mono font-bold uppercase text-gray-500 mb-2 block flex items-center gap-1">
                <Sparkles size={10} /> Choose Aesthetic
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[120px] overflow-y-auto pr-1 scrollbar-hide">
                {STYLES.map((style) => (
                    <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`text-[10px] font-bold uppercase py-1.5 px-2 border-2 transition-all ${
                            selectedStyle === style 
                            ? 'bg-black text-acid-green border-black shadow-[2px_2px_0_rgba(0,0,0,0.2)]' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-black'
                        }`}
                    >
                        {style}
                    </button>
                ))}
            </div>
        </div>

        <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full py-3 bg-electric-blue border-2 border-black font-black uppercase text-black hover:bg-acid-green hover:shadow-neo transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {loading ? (
                <>
                    <Loader2 size={18} className="animate-spin" /> Generating Art...
                </>
            ) : (
                <>
                    Generate Graphic <ArrowRight size={18} />
                </>
            )}
        </button>

        {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-2 border border-red-200">{error}</p>}

        {generatedImage && (
            <div className="animate-in fade-in zoom-in-95 duration-300 border-2 border-black p-2 bg-gray-50 relative group">
                <img src={generatedImage} alt="Generated" className="w-full aspect-square object-contain bg-white border border-gray-200" />
                <button 
                    onClick={() => onSelectImage(generatedImage)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] bg-hot-pink text-white border-2 border-black py-2 font-bold uppercase shadow-neo hover:shadow-neo-hover hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    <ImageIcon size={16} /> Apply to Shirt
                </button>
            </div>
        )}
      </div>
    </div>
  );
};