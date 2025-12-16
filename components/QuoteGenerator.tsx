import React, { useState } from 'react';
import { generateQuotesService } from '../services/ai';
import { AISettings } from '../types';
import { Sparkles, RefreshCw, Plus, Loader2, Settings2 } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

interface QuoteGeneratorProps {
  onSelectQuote: (quote: string) => void;
}

export const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ onSelectQuote }) => {
  const [topic, setTopic] = useState('');
  const [mood, setMood] = useState('Funny');
  const [quotes, setQuotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AISettings>({
    provider: 'gemini',
    // Default for Ollama/LocalAI
    customEndpoint: 'http://localhost:11434/v1/chat/completions',
    customModelName: 'llama3'
  });

  const moods = [
      'Funny', 'Sarcastic', 'Inspirational', 'Nihilistic', 
      'Cute', 'Retro', 'Unhinged', 'Y2K', 'Goth', 'Cyberpunk', 'Wholesome'
  ];

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setQuotes([]); // Clear previous
    try {
        const results = await generateQuotesService(topic, mood, settings);
        setQuotes(results);
    } catch (e) {
        setQuotes(["Error generating quotes.", "Check settings."]);
    }
    setLoading(false);
  };

  return (
    <>
    <div className="bg-white border-2 border-black p-4 shadow-neo-lg rounded-sm mb-6 relative overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-acid-green rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
            <div className="bg-vivid-purple text-white p-1 border border-black shadow-sm">
                <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter">AI Generator</h2>
        </div>
        <button 
            onClick={() => setShowSettings(true)}
            className="p-1 hover:bg-gray-100 rounded-sm border-2 border-transparent hover:border-black transition-all"
            title="Configure AI Model"
        >
            <Settings2 size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        <input 
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (e.g. Pizza, Coding)"
            className="w-full border-2 border-black p-3 font-mono text-sm font-bold focus:ring-4 focus:ring-electric-blue outline-none shadow-sm placeholder:font-normal"
        />
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {moods.map(m => (
                <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-3 py-1 text-xs font-bold uppercase border-2 border-black whitespace-nowrap transition-all hover:-translate-y-0.5 ${mood === m ? 'bg-hot-pink text-white shadow-neo' : 'bg-off-white hover:bg-white'}`}
                >
                    {m}
                </button>
            ))}
        </div>

        <button 
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="w-full bg-acid-green border-2 border-black py-3 font-black uppercase text-black hover:shadow-neo-hover active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
            {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />}
            {loading ? 'Cooking...' : 'Generate Drip'}
        </button>
      </div>

      {quotes.length > 0 && (
          <div className="mt-4 grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {quotes.map((q, i) => (
                  <div 
                    key={i} 
                    onClick={() => onSelectQuote(q)}
                    className="group flex items-center justify-between bg-off-white border-2 border-transparent hover:border-black p-2 px-3 cursor-pointer transition-all hover:bg-electric-blue hover:shadow-neo-hover"
                  >
                      <p className="font-mono text-xs md:text-sm font-bold truncate pr-2">"{q}"</p>
                      <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
              ))}
          </div>
      )}
    </div>

    <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={setSettings}
    />
    </>
  );
};