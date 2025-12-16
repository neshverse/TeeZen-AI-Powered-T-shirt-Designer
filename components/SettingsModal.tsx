import React from 'react';
import { AISettings } from '../types';
import { X, Server, Cpu } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSave: (s: AISettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  if (!isOpen) return null;

  const [localSettings, setLocalSettings] = React.useState(settings);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border-4 border-black shadow-neo-lg w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 hover:bg-red-500 hover:text-white border-2 border-transparent hover:border-black p-1 transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-black italic uppercase mb-6 flex items-center gap-2">
            <Server className="text-vivid-purple" />
            Backend Config
        </h2>

        <div className="space-y-6">
            
            {/* Provider Select */}
            <div className="flex gap-4">
                <button 
                    onClick={() => setLocalSettings(s => ({...s, provider: 'gemini'}))}
                    className={`flex-1 py-3 px-4 border-2 font-bold uppercase transition-all flex flex-col items-center gap-2 ${localSettings.provider === 'gemini' ? 'bg-black text-white border-black' : 'bg-white border-gray-300 text-gray-400 hover:border-black hover:text-black'}`}
                >
                   <div className="text-xl">✨</div>
                   Gemini Cloud
                </button>
                <button 
                    onClick={() => setLocalSettings(s => ({...s, provider: 'custom'}))}
                    className={`flex-1 py-3 px-4 border-2 font-bold uppercase transition-all flex flex-col items-center gap-2 ${localSettings.provider === 'custom' ? 'bg-electric-blue text-black border-black' : 'bg-white border-gray-300 text-gray-400 hover:border-black hover:text-black'}`}
                >
                   <Cpu />
                   Custom / Local
                </button>
            </div>

            {localSettings.provider === 'gemini' && (
                <div className="bg-off-white p-4 border-l-4 border-black text-sm font-mono">
                    Using Google Gemini 2.5 Flash via internal API key. 
                    <br/><br/>
                    <span className="bg-acid-green px-1 text-black font-bold">STATUS: ONLINE</span>
                </div>
            )}

            {localSettings.provider === 'custom' && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                    <div>
                        <label className="block font-mono text-xs font-bold uppercase mb-1">API Endpoint URL</label>
                        <input 
                            type="text" 
                            value={localSettings.customEndpoint || ''}
                            onChange={e => setLocalSettings(s => ({...s, customEndpoint: e.target.value}))}
                            placeholder="http://localhost:11434/v1/chat/completions"
                            className="w-full border-2 border-black p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-hot-pink"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Compatible with OpenAI, Ollama, LM Studio, etc.</p>
                    </div>

                    <div>
                        <label className="block font-mono text-xs font-bold uppercase mb-1">Model Name</label>
                        <input 
                            type="text" 
                            value={localSettings.customModelName || ''}
                            onChange={e => setLocalSettings(s => ({...s, customModelName: e.target.value}))}
                            placeholder="llama3, mistral, gpt-4..."
                            className="w-full border-2 border-black p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-hot-pink"
                        />
                    </div>

                    <div>
                        <label className="block font-mono text-xs font-bold uppercase mb-1">API Key (Optional)</label>
                        <input 
                            type="password" 
                            value={localSettings.customApiKey || ''}
                            onChange={e => setLocalSettings(s => ({...s, customApiKey: e.target.value}))}
                            placeholder="sk-..."
                            className="w-full border-2 border-black p-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-hot-pink"
                        />
                    </div>
                </div>
            )}

            <button 
                onClick={() => { onSave(localSettings); onClose(); }}
                className="w-full bg-acid-green border-2 border-black py-3 font-black uppercase hover:shadow-neo hover:-translate-y-1 transition-all"
            >
                Save Configuration
            </button>
        </div>

      </div>
    </div>
  );
};