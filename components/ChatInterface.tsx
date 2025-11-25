import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2, AlertCircle, Sparkles, User, Table as TableIcon } from 'lucide-react';
import { MunData, Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  onDataGenerated: (data: MunData) => void;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
  onOpenTable: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  onDataGenerated,
  isLoading,
  error,
  hasData,
  onOpenTable
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handleExampleClick = (text: string) => {
    setInput(text);
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Background Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto p-4 lg:p-6 h-full">
        <div className="flex-1 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="p-4 lg:p-6 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center shadow-lg relative">
                <Bot className="text-white relative z-10" size={20} />
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse-glow"></div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">HASHMUN AI Assistant</h2>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   <p className="text-xs text-brand-400 font-mono">ONLINE // READY</p>
                </div>
              </div>
            </div>
            
            {hasData && (
              <button 
                onClick={onOpenTable}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600/20 border border-brand-500/30 text-brand-400 hover:bg-brand-600 hover:text-white rounded-lg text-sm font-medium transition-all group"
              >
                <TableIcon size={16} />
                <span>View Table</span>
              </button>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar flex flex-col space-y-6" ref={scrollRef}>
             {messages.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-80 my-auto">
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-all duration-500">
                    <Bot size={40} className="text-brand-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white">Welcome back, President.</h3>
                    <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                      I'm ready to help you organize your committees. Start by pasting a list or asking for mock data.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                    <button 
                      onClick={() => handleExampleClick("Create a mock table for UNSC with 5 delegates, include Class and Allotment.")}
                      className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-500/30 text-left transition-all group"
                    >
                      <span className="block text-brand-300 text-xs font-mono mb-1 group-hover:text-brand-400">GENERATE</span>
                      <span className="text-sm text-slate-200">Create mock data for UNSC</span>
                    </button>
                    <button 
                      onClick={() => handleExampleClick("Allocations: Ali (USA), Sara (China), Ahmed (Russia). All in DISEC, Class A2.")}
                      className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-500/30 text-left transition-all group"
                    >
                      <span className="block text-brand-300 text-xs font-mono mb-1 group-hover:text-brand-400">PARSE</span>
                      <span className="text-sm text-slate-200">Process raw delegate list</span>
                    </button>
                  </div>
               </div>
             )}

             {messages.map((msg, idx) => (
               <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`flex gap-4 max-w-[90%] lg:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                   
                   <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                     msg.role === 'user' ? 'bg-brand-500' : 'bg-slate-800 border border-white/10'
                   }`}>
                      {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-brand-400" />}
                   </div>

                   <div className={`p-5 rounded-3xl shadow-md text-sm leading-7 ${
                     msg.role === 'user' 
                      ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'
                   }`}>
                     <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                     <div className={`text-[10px] mt-2 opacity-50 font-mono ${msg.role === 'user' ? 'text-brand-100' : 'text-slate-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                   </div>
                 </div>
               </div>
             ))}

             {/* AI Loading State */}
             {isLoading && (
               <div className="flex justify-start w-full">
                 <div className="flex gap-4 max-w-[80%]">
                   <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Loader2 size={18} className="text-brand-400 animate-spin" />
                   </div>
                   <div className="bg-slate-800 p-5 rounded-3xl rounded-tl-none border border-white/5 shadow-lg">
                     <div className="flex items-center gap-2 text-brand-300 text-sm font-medium mb-3">
                       <Sparkles size={14} className="animate-pulse" />
                       <span>Analyzing Request...</span>
                     </div>
                     <div className="space-y-2">
                       <div className="h-2 w-48 bg-white/5 rounded animate-pulse"></div>
                       <div className="h-2 w-32 bg-white/5 rounded animate-pulse delay-75"></div>
                     </div>
                   </div>
                 </div>
               </div>
             )}
             
             {error && (
               <div className="flex justify-center w-full animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                    <AlertCircle size={20} className="text-red-400" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
               </div>
             )}
          </div>

          {/* Input Area */}
          <div className="p-4 lg:p-6 bg-slate-900 border-t border-white/5">
            <form onSubmit={handleSubmit} className="relative group max-w-4xl mx-auto">
              <div className="relative shadow-2xl rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-accent-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={hasData ? "Ask to edit the table (e.g., 'Change Ali to USA')..." : "Describe your committee or paste delegate list..."}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 pr-16 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all resize-none h-20 custom-scrollbar relative z-10"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                      }
                  }}
                  />
                  <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-all shadow-lg shadow-brand-500/20 z-20 hover:scale-105 active:scale-95"
                  >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatInterface;