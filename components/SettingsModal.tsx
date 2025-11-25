import React from 'react';
import { X, Check } from 'lucide-react';
import { AppSettings, ThemeColor } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

const themes: { id: ThemeColor; name: string; color: string }[] = [
  { id: 'blue', name: 'Cosmic Blue', color: 'bg-[#0ea5e9]' },
  { id: 'purple', name: 'Nebula Purple', color: 'bg-[#8b5cf6]' },
  { id: 'emerald', name: 'Cyber Emerald', color: 'bg-[#10b981]' },
  { id: 'orange', name: 'Mars Orange', color: 'bg-[#f97316]' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  const handleThemeChange = (theme: ThemeColor) => {
    onUpdateSettings({ ...settings, theme });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900">
          <h2 className="text-xl font-bold text-white font-display">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Theme Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Interface Theme</h3>
            <div className="grid grid-cols-2 gap-4">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`relative p-4 rounded-xl border transition-all text-left group overflow-hidden ${
                    settings.theme === t.id 
                      ? 'border-brand-500 bg-brand-500/10' 
                      : 'border-white/5 bg-slate-800 hover:bg-slate-750'
                  }`}
                >
                   <div className="flex items-center justify-between mb-2">
                      <div className={`w-6 h-6 rounded-full ${t.color} shadow-lg`}></div>
                      {settings.theme === t.id && <Check size={16} className="text-brand-400" />}
                   </div>
                   <span className={`text-sm font-medium ${settings.theme === t.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                     {t.name}
                   </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-slate-500 text-center">
              HASHMUN v2.0 • Build 2024
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
