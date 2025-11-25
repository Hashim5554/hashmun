import React from 'react';
import { X, School, Star, BookOpen } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-8 overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-500/10 to-transparent pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-purple/20 rounded-full blur-3xl pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg mb-6">
            <School size={32} className="text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white font-display mb-4">About HASHMUN</h2>
          
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <p className="flex gap-3">
              <span className="mt-1 text-yellow-400 flex-shrink-0"><Star size={18} fill="currentColor" /></span>
              <span>
                Welcome to this website—a helpful project by <strong className="text-white">Hashim Ali</strong>, a student at <strong className="text-white">LGS JT (International & Senior Section)</strong>. 🏫✨
              </span>
            </p>

            <p className="flex gap-3">
              <span className="mt-1 text-brand-400 flex-shrink-0"><BookOpen size={18} /></span>
              <span>
                Designed to make everyday tasks more convenient, the site is packed with useful resources, all thoughtfully organized to help you save time and stay productive. 📚⚙️
              </span>
            </p>

            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-100 text-sm font-medium text-center">
              It’s completely free for everyone, because making life easier should be simple and accessible! 📚⚙️
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-500 uppercase tracking-widest">
            Created with ❤️ by Hashim Ali
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;