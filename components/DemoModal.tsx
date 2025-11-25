import React, { useEffect, useState } from 'react';
import { X, Send, Bot, User, Loader2, Edit2, FileText, Check } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState('');
  
  // Simulation Data
  const promptText = "Create a table for UNSC with 3 delegates: USA, China, Russia.";
  
  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setTypedText('');
      return;
    }

    // Sequence Logic
    let timeouts: NodeJS.Timeout[] = [];

    // Step 1: Typewriter Effect (0ms - 2000ms)
    const startTyping = () => {
      let currentText = '';
      promptText.split('').forEach((char, index) => {
        const t = setTimeout(() => {
          currentText += char;
          setTypedText(currentText);
        }, index * 50);
        timeouts.push(t);
      });
    };

    // Step 2: Send Message (2200ms)
    const sendMsg = setTimeout(() => setStep(1), 2200);
    timeouts.push(sendMsg);

    // Step 3: AI Thinking (2200ms - 4000ms)
    const aiThink = setTimeout(() => setStep(2), 2500);
    timeouts.push(aiThink);

    // Step 4: Table Appears (4500ms)
    const showTable = setTimeout(() => setStep(3), 4500);
    timeouts.push(showTable);

    // Step 5: Edit Mode (6500ms)
    const editMode = setTimeout(() => setStep(4), 6500);
    timeouts.push(editMode);

    // Step 6: Export (8500ms)
    const exportDoc = setTimeout(() => setStep(5), 8500);
    timeouts.push(exportDoc);

    startTyping();

    return () => timeouts.forEach(clearTimeout);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-4xl aspect-video bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col">
        
        {/* Fake Browser Header */}
        <div className="h-12 bg-slate-800 border-b border-white/5 flex items-center px-4 gap-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="mx-auto bg-slate-950/50 px-4 py-1 rounded text-xs text-slate-500 font-mono">
            hashmun_demo.exe
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative p-6 flex flex-col gap-4 bg-slate-950/50">
          
          {/* Chat View (Steps 0, 1, 2) */}
          <div className={`flex-1 flex flex-col justify-end gap-4 transition-all duration-500 ${step >= 3 ? 'opacity-0 translate-y-10 absolute inset-0 pointer-events-none' : 'opacity-100'}`}>
            
            {/* User Message */}
            <div className={`flex justify-end items-center gap-3 transition-opacity duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
               <div className="bg-brand-600 text-white px-4 py-3 rounded-2xl rounded-tr-none max-w-md shadow-lg">
                 {promptText}
               </div>
               <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-lg">
                 <User size={14} />
               </div>
            </div>

            {/* AI Thinking / Response */}
            {step === 2 && (
               <div className="flex justify-start items-center gap-3 animate-pulse">
                 <div className="w-8 h-8 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-brand-400 shadow-lg">
                   <Bot size={14} />
                 </div>
                 <div className="bg-slate-800 text-slate-300 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                   <Loader2 size={14} className="animate-spin" /> Generating Matrix...
                 </div>
               </div>
            )}

            {/* Input Bar Simulation */}
            <div className="bg-slate-900 border border-white/10 rounded-xl p-3 flex items-center gap-3 mt-4">
              <div className="flex-1 text-slate-300 font-mono text-sm">
                {step === 0 ? typedText : ''}
                {step === 0 && <span className="animate-pulse">|</span>}
              </div>
              <div className={`p-2 rounded-lg ${step >= 1 ? 'bg-slate-800 text-slate-500' : 'bg-brand-600 text-white'}`}>
                <Send size={16} />
              </div>
            </div>
          </div>

          {/* Table View (Steps 3, 4, 5) */}
          <div className={`absolute inset-0 p-6 bg-slate-900 transition-all duration-700 transform ${step >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
             <div className="h-full bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                {/* Table Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                   <h3 className="font-bold text-white">UNSC Table</h3>
                   <div className="flex gap-2">
                      <div className={`p-2 rounded bg-slate-800 border border-white/10 transition-colors duration-300 ${step === 4 ? 'border-brand-500 bg-brand-500/20 text-brand-400' : 'text-slate-400'}`}>
                        <Edit2 size={14} />
                      </div>
                      <div className={`p-2 rounded bg-slate-800 border border-white/10 transition-colors duration-300 ${step === 5 ? 'bg-green-500 text-white border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-110' : 'text-slate-400'}`}>
                        {step === 5 ? <Check size={14} /> : <FileText size={14} />}
                      </div>
                   </div>
                </div>
                {/* Table Content */}
                <div className="p-4">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-800/30">
                      <tr>
                        <th className="px-4 py-2 rounded-l-lg">Delegate</th>
                        <th className="px-4 py-2">Country</th>
                        <th className="px-4 py-2 rounded-r-lg">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-white/5">
                        <td className="px-4 py-3">Delegate 1</td>
                        <td className="px-4 py-3 text-brand-300">USA</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">Allocated</span></td>
                      </tr>
                      <tr className={`border-b border-white/5 transition-colors duration-500 ${step === 4 ? 'bg-brand-500/10' : ''}`}>
                        <td className="px-4 py-3">Delegate 2</td>
                        <td className="px-4 py-3 text-brand-300">China</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">Allocated</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Delegate 3</td>
                        <td className="px-4 py-3 text-brand-300">Russia</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">Allocated</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Toasts */}
                <div className="mt-auto p-4 flex justify-center">
                   {step === 4 && (
                     <div className="bg-slate-800 border border-brand-500/30 text-brand-300 px-4 py-2 rounded-full text-xs shadow-lg animate-bounce">
                       Cursor selecting row...
                     </div>
                   )}
                   {step === 5 && (
                     <div className="bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl animate-in slide-in-from-bottom-5">
                       Document Exported!
                     </div>
                   )}
                </div>
             </div>
          </div>

        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-slate-800 w-full mt-auto">
          <div className="h-full bg-brand-500 transition-all duration-[500ms] ease-linear" style={{ width: `${(step / 5) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default DemoModal;