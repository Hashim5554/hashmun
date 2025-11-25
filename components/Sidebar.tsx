import React from 'react';
import { MessageSquare, Plus, Settings, Trash2, X, LayoutDashboard } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  isOpen,
  setIsOpen,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onOpenSettings,
}) => {
  return (
    <>
      {/* Mobile Toggle Button (Floating) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed bottom-6 left-6 z-50 p-3 rounded-full shadow-lg transition-all active:scale-95 ${
            isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-brand-600 text-white'
        }`}
      >
        <LayoutDashboard size={24} />
      </button>

      {/* Mobile Overlay Backdrop */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity duration-300 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <div className={`fixed lg:static inset-y-0 left-0 z-[60] w-[280px] sm:w-72 bg-slate-900 border-r border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Mobile Close Button Header */}
        <div className="lg:hidden p-4 flex justify-end border-b border-white/5">
            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white">
                <X size={24} />
            </button>
        </div>

        {/* Header Action */}
        <div className="p-4 border-b border-white/5">
          <button
            onClick={() => {
                onNewChat();
                if (window.innerWidth < 1024) setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand-500/20 active:scale-95"
          >
            <Plus size={18} />
            <span>New Table</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-2">Saved Chats</h3>
          
          {sessions.length === 0 && (
            <div className="text-center py-8 text-slate-600 text-sm">
              No saved chats yet.
            </div>
          )}

          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => {
                onSelectSession(session.id);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                currentSessionId === session.id 
                  ? 'bg-white/10 text-white shadow-sm border border-white/5' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <MessageSquare size={16} className={`flex-shrink-0 ${currentSessionId === session.id ? 'text-brand-400' : 'text-slate-600'}`} />
              <div className="flex-1 truncate text-sm font-medium">
                {session.title}
              </div>
              <button
                onClick={(e) => onDeleteSession(session.id, e)}
                className={`p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded transition-all ${
                    // Always show delete on mobile/touch devices where hover doesn't exist
                    'lg:opacity-0 lg:group-hover:opacity-100' 
                }`}
                title="Delete Chat"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/5 bg-slate-950/30">
          <button 
            onClick={() => {
                onOpenSettings();
                if (window.innerWidth < 1024) setIsOpen(false);
            }}
            className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;