import React, { useState, useEffect } from 'react';
import { AppState, MunData, ChatSession, Message, AppSettings } from './types';
import Hero from './components/Hero';
import ChatInterface from './components/ChatInterface';
import TeamTable from './components/TeamTable';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import AboutModal from './components/AboutModal';
import DemoModal from './components/DemoModal';
import { Globe } from 'lucide-react';
import { processChatInput } from './services/geminiService';

const App: React.FC = () => {
  // App View State
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [viewMode, setViewMode] = useState<'chat' | 'table'>('chat');
  
  // Data State - LAZY INITIALIZATION (Fixes persistence bug)
  // We read from localStorage immediately so the state starts populated.
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('hashmun_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load sessions:", e);
      return [];
    }
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings State - LAZY INITIALIZATION
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('hashmun_settings');
      return saved ? JSON.parse(saved) : { theme: 'blue' };
    } catch (e) {
      return { theme: 'blue' };
    }
  });

  // Persist Sessions whenever they change
  useEffect(() => {
    localStorage.setItem('hashmun_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Persist Settings & Apply Theme whenever they change
  useEffect(() => {
    localStorage.setItem('hashmun_settings', JSON.stringify(settings));
    applyTheme(settings.theme);
  }, [settings]);

  // Apply theme on initial load
  useEffect(() => {
    applyTheme(settings.theme);
  }, []);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    const colors: Record<string, any> = {
      blue: {
        50: '240 249 255', 100: '224 242 254', 200: '186 230 253', 300: '125 211 252',
        400: '56 189 248', 500: '14 165 233', 600: '2 132 199', 700: '3 105 161',
        800: '7 89 133', 900: '12 74 110', 950: '8 47 73'
      },
      purple: {
        50: '250 245 255', 100: '243 232 255', 200: '233 213 255', 300: '216 180 254',
        400: '192 132 252', 500: '168 85 247', 600: '147 51 234', 700: '126 34 206',
        800: '107 33 168', 900: '88 28 135', 950: '59 7 100'
      },
      emerald: {
        50: '236 253 245', 100: '209 250 229', 200: '167 243 208', 300: '110 231 183',
        400: '52 211 153', 500: '16 185 129', 600: '5 150 105', 700: '4 120 87',
        800: '6 95 70', 900: '6 78 59', 950: '2 44 34'
      },
      orange: {
        50: '255 247 237', 100: '255 237 213', 200: '254 215 170', 300: '253 186 116',
        400: '251 146 60', 500: '249 115 22', 600: '234 88 12', 700: '194 65 12',
        800: '154 52 18', 900: '124 45 18', 950: '67 20 7'
      }
    };

    const selected = colors[theme] || colors.blue;
    Object.keys(selected).forEach(key => {
        root.style.setProperty(`--brand-${key}`, selected[key]);
    });
  };

  const handleStart = () => {
    setAppState(AppState.APP);
    // Only create a new session if there are no existing ones to resume
    if (sessions.length === 0) {
        createNewSession();
    } else if (!currentSessionId) {
        // Resume the most recent one
        setCurrentSessionId(sessions[0].id);
    }
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      lastModified: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setViewMode('chat');
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
        const remaining = sessions.filter(s => s.id !== id);
        setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null);
        if (remaining.length === 0) setViewMode('chat');
    }
  };

  const getCurrentSession = () => {
    return sessions.find(s => s.id === currentSessionId);
  };

  const updateCurrentSession = (updatedSession: ChatSession) => {
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const handleSendMessage = async (msg: string) => {
    if (!currentSessionId) createNewSession();
    
    const current = sessions.find(s => s.id === currentSessionId) || sessions[0]; // Fallback
    if (!current) return;

    const userMsg: Message = { role: 'user', content: msg, timestamp: Date.now() };
    const updatedWithUser = {
        ...current,
        messages: [...current.messages, userMsg],
        title: current.messages.length === 0 ? (msg.slice(0, 30) + (msg.length > 30 ? '...' : '')) : current.title,
        lastModified: Date.now()
    };
    updateCurrentSession(updatedWithUser);
    
    setIsLoading(true);
    setError(null);

    try {
        const response = await processChatInput(msg, current.munData);
        
        let aiContent = "";
        let newMunData = undefined;
        let shouldSwitchToTable = false;

        if (response.type === 'chat') {
            aiContent = response.message || "I acknowledged that.";
        } else if (response.type === 'data' && response.data) {
            aiContent = response.message || "I've updated the committee matrix for you.";
            newMunData = response.data;
            shouldSwitchToTable = true;
        }

        const aiMsg: Message = { role: 'ai', content: aiContent, timestamp: Date.now() };
        
        const finalSession = {
            ...updatedWithUser,
            messages: [...updatedWithUser.messages, aiMsg],
            munData: newMunData || updatedWithUser.munData, 
            lastModified: Date.now()
        };
        updateCurrentSession(finalSession);

        if (shouldSwitchToTable) {
            setViewMode('table');
        }
        
    } catch (err: any) {
        console.error(err);
        setError("Connection error: API Key may be missing or invalid.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleTableUpdate = (updatedData: MunData) => {
     const current = getCurrentSession();
     if (current) {
        updateCurrentSession({
            ...current,
            munData: updatedData,
            lastModified: Date.now()
        });
     }
  };

  const handleLogoClick = () => {
      setAppState(AppState.LANDING);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setViewMode('chat');
  };

  const currentSession = getCurrentSession();
  const hasData = !!currentSession?.munData;

  return (
    <div className="h-screen max-h-screen font-sans text-slate-200 selection:bg-brand-500/30 flex flex-col bg-slate-950 transition-colors duration-500 overflow-hidden">
      
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
      
      <AboutModal 
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      <DemoModal 
        isOpen={showDemo}
        onClose={() => setShowDemo(false)}
      />

      {/* Persistent Navbar */}
      <nav className={`w-full z-50 px-6 py-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-md border-b border-white/5 transition-all duration-300`}>
        <div className="cursor-pointer flex items-center gap-2 group" onClick={handleLogoClick}>
            <div className="relative">
                <div className="absolute inset-0 bg-brand-500 blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <Globe className="relative text-white transform group-hover:rotate-180 transition-transform duration-700" size={28} />
            </div>
            <span className="text-xl font-display font-bold tracking-tighter text-white drop-shadow-md">
                HASH<span className="text-brand-400 transition-colors">MUN</span>
            </span>
        </div>
        
        {appState === AppState.LANDING && (
            <div className="hidden md:block">
                <button 
                  onClick={() => setShowAbout(true)}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  About
                </button>
            </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {appState === AppState.LANDING && (
          <div className="w-full h-full overflow-y-auto custom-scrollbar">
             <Hero 
               onStart={handleStart} 
               onViewDemo={() => setShowDemo(true)} 
             />
          </div>
        )}

        {appState === AppState.APP && (
          <div className="flex flex-1 w-full relative overflow-hidden">
            
            {/* Sidebar */}
            <Sidebar 
                sessions={sessions}
                currentSessionId={currentSessionId}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onNewChat={createNewSession}
                onSelectSession={handleSelectSession}
                onDeleteSession={deleteSession}
                onOpenSettings={() => setShowSettings(true)}
            />

            {/* View Area */}
            <div className="flex-1 flex flex-col relative w-full overflow-hidden bg-slate-950 h-full">
                {currentSession ? (
                    viewMode === 'table' && currentSession.munData ? (
                        <div className="h-full w-full animate-in fade-in zoom-in-95 duration-300">
                            <TeamTable 
                                data={currentSession.munData} 
                                onBack={() => setViewMode('chat')}
                                onUpdate={handleTableUpdate}
                            />
                        </div>
                    ) : (
                        <ChatInterface 
                            messages={currentSession.messages}
                            onSendMessage={handleSendMessage}
                            onDataGenerated={(data) => {}}
                            isLoading={isLoading}
                            error={error}
                            hasData={hasData}
                            onOpenTable={() => setViewMode('table')}
                        />
                    )
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <p className="mb-4">Ready to start?</p>
                            <button 
                                onClick={createNewSession} 
                                className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-500 transition-colors"
                            >
                                Create New Table
                            </button>
                        </div>
                    </div>
                )}
            </div>

          </div>
        )}
      </main>

    </div>
  );
};

export default App;