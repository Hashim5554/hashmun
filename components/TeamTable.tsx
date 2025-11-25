import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Share2, Search, ArrowLeft, Printer, FileText, Edit2, Check, X, Save, Crown, Plus, Trash2, Edit3, AlertTriangle } from 'lucide-react';
import { MunData, Delegate } from '../types';

interface TeamTableProps {
  data: MunData;
  onBack: () => void;
  onUpdate: (updatedData: MunData) => void;
}

// Robust ID generator
const generateId = () => `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const TeamTable: React.FC<TeamTableProps> = ({ data, onBack, onUpdate }) => {
  // --- State ---
  const [conferenceName, setConferenceName] = useState('');
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [activeTeam, setActiveTeam] = useState<string>('');
  const [additionalTeams, setAdditionalTeams] = useState<string[]>([]); 

  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState<{show: boolean, message: string}>({show: false, message: ''});

  // Modal States
  const [modalState, setModalState] = useState<{
    type: 'ADD_TEAM' | 'RENAME_TEAM' | 'DELETE_TEAM' | null;
    inputValue: string;
  }>({ type: null, inputValue: '' });
  
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Initialization ---
  useEffect(() => {
    // Migration: Ensure 'team' exists
    const sanitizedDelegates = data.delegates.map(d => ({
        ...d,
        team: d.team || "General"
    }));

    setDelegates(sanitizedDelegates);
    setConferenceName(data.conferenceName);
    
    // Set active team if not set
    if (sanitizedDelegates.length > 0 && !activeTeam) {
        setActiveTeam(sanitizedDelegates[0].team);
    } else if (!activeTeam) {
        setActiveTeam('General');
    }
  }, [data]);

  // Focus input when modal opens
  useEffect(() => {
    if (modalState.type && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [modalState.type]);

  // Derived Teams List
  const teams = useMemo(() => {
    const existing = Array.from(new Set(delegates.map(d => d.team)));
    const all = Array.from(new Set([...existing, ...additionalTeams])).filter(Boolean);
    // Sort teams alphabetically (Team A, Team B...)
    return all.sort();
  }, [delegates, additionalTeams]);

  // Ensure Active Team Validity
  useEffect(() => {
    if (teams.length > 0 && !teams.includes(activeTeam)) {
        setActiveTeam(teams[0]);
    } else if (teams.length === 0 && activeTeam !== 'General' && !isEditing) {
        // Only default to General if not editing (edit mode allows custom empty states)
        setActiveTeam('General');
    }
  }, [teams, activeTeam, isEditing]);

  // Filtering
  const filteredDelegates = delegates.filter(d => 
    d.team === activeTeam &&
    (d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.allotment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.committee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.class && d.class.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const headDelegateCount = delegates.filter(d => d.status === 'Head Delegate').length;

  // --- Actions ---

  const handlePrint = () => {
    window.print();
  };

  const handleExportDocx = () => {
    // Generate HTML for ALL teams, not just the visible one
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${conferenceName}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; color: #000; }
          h1 { font-family: 'Segoe UI', 'Arial', sans-serif; color: #2563eb; font-size: 24pt; text-align: center; margin-bottom: 24px; }
          h2 { font-family: 'Segoe UI', 'Arial', sans-serif; color: #1e293b; font-size: 16pt; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 32px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background-color: #f8fafc; border: 1px solid #94a3b8; padding: 8px; text-align: left; font-weight: bold; color: #0f172a; }
          td { border: 1px solid #94a3b8; padding: 8px; color: #334155; }
          .status-allocated { color: #15803d; font-weight: bold; }
          .status-waitlist { color: #c2410c; }
          .status-headdelegate { color: #a16207; font-weight: bold; text-transform: uppercase; }
          p.footer { text-align: center; color: #64748b; font-size: 10pt; margin-top: 40px; }
        </style>
      </head>
      <body>
        <h1>${conferenceName}</h1>
    `;

    teams.forEach(team => {
      const teamDelegates = delegates.filter(d => d.team === team);
      if (teamDelegates.length === 0) return;

      htmlContent += `<h2>${team}</h2>`;
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Delegate Name</th>
              <th>Committee</th>
              <th>Allotment</th>
              <th>Class</th>
            </tr>
          </thead>
          <tbody>
      `;

      teamDelegates.forEach(d => {
        const statusClass = d.status.toLowerCase().replace(' ', '');
        htmlContent += `
          <tr>
            <td class="status-${statusClass}">${d.status}</td>
            <td>${d.name}</td>
            <td>${d.committee}</td>
            <td>${d.allotment}</td>
            <td>${d.class || '-'}</td>
          </tr>
        `;
      });

      htmlContent += `
          </tbody>
        </table>
      `;
    });

    htmlContent += `
        <p class="footer">Generated by HASHMUN AI</p>
      </body>
      </html>
    `;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(htmlContent);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `HASHMUN_${conferenceName.replace(/\s+/g, '_')}_Master.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handleShare = () => {
    const fakeUrl = `https://hashmun.app/share/${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(fakeUrl);
    setShowToast({show: true, message: 'Link copied to clipboard!'});
    setTimeout(() => setShowToast({show: false, message: ''}), 3000);
  };

  // --- Editing ---

  const handleEditChange = (id: string, field: keyof Delegate, value: string) => {
    setDelegates(prev => prev.map(d => 
        d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const handleAddDelegate = () => {
    const newDelegate: Delegate = {
        id: generateId(),
        name: '',
        allotment: '',
        committee: '', 
        team: activeTeam || 'General',
        class: '',
        status: 'Allocated'
    };
    setDelegates(prev => [...prev, newDelegate]);
  };

  const handleDeleteDelegate = (id: string) => {
    setDelegates(prev => prev.filter(d => d.id !== id));
  };

  // --- Modal Triggers & Logic ---

  const openAddTeamModal = () => {
      // Auto-suggest next team name (Team A -> Team B)
      let suggestedName = "Team A";
      const teamLetters = teams
        .filter(t => t.startsWith("Team "))
        .map(t => t.replace("Team ", ""));
      
      if (teamLetters.length > 0) {
          const lastLetter = teamLetters[teamLetters.length - 1];
          const nextCharCode = lastLetter.charCodeAt(0) + 1;
          // Check if single letter and within alphabet
          if (lastLetter.length === 1 && nextCharCode <= 90) { 
              suggestedName = `Team ${String.fromCharCode(nextCharCode)}`;
          } else {
             suggestedName = `Team ${teams.length + 1}`;
          }
      } else if (teams.length > 0) {
          suggestedName = `Team ${teams.length + 1}`;
      }

      setModalState({ type: 'ADD_TEAM', inputValue: suggestedName });
  };

  const openRenameTeamModal = () => {
      setModalState({ type: 'RENAME_TEAM', inputValue: activeTeam });
  };

  const openDeleteTeamModal = () => {
      setModalState({ type: 'DELETE_TEAM', inputValue: '' });
  };

  const closeModal = () => {
      setModalState({ type: null, inputValue: '' });
  };

  // --- Modal Actions ---

  const confirmModalAction = () => {
      const value = modalState.inputValue.trim();

      if (modalState.type === 'ADD_TEAM') {
          if (!value) return;
          if (teams.includes(value)) {
              alert("A team with this name already exists.");
              return;
          }
          setAdditionalTeams(prev => [...prev, value]);
          setActiveTeam(value);
      } 
      else if (modalState.type === 'RENAME_TEAM') {
          if (!value || value === activeTeam) {
            closeModal();
            return;
          }
          if (teams.includes(value)) {
              alert("A team with this name already exists.");
              return;
          }
          // Update delegates
          setDelegates(prev => prev.map(d => d.team === activeTeam ? { ...d, team: value } : d));
          // Update manual list
          setAdditionalTeams(prev => {
              const filtered = prev.filter(t => t !== activeTeam);
              return [...filtered, value];
          });
          setActiveTeam(value);
      }
      else if (modalState.type === 'DELETE_TEAM') {
          // Delete delegates
          setDelegates(prev => prev.filter(d => d.team !== activeTeam));
          // Delete from manual list
          setAdditionalTeams(prev => prev.filter(t => t !== activeTeam));
          // activeTeam logic handled by useEffect
      }

      closeModal();
  };

  const handleSave = () => {
    onUpdate({
        conferenceName: conferenceName,
        delegates: delegates
    });
    setIsEditing(false);
    setShowToast({show: true, message: 'All changes saved!'});
    setTimeout(() => setShowToast({show: false, message: ''}), 3000);
  };

  const handleCancelEdit = () => {
    const sanitizedOriginal = data.delegates.map(d => ({...d, team: d.team || "General"}));
    setDelegates(sanitizedOriginal);
    setConferenceName(data.conferenceName);
    setAdditionalTeams([]);
    setIsEditing(false);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 lg:p-8 overflow-y-auto custom-scrollbar relative">
      
      {/* --- HIDDEN PRINT VIEW (Rendered only on Print) --- */}
      {/* ID is 'print-area' which matches the index.html CSS rule to be visible */}
      <div id="print-area" className="hidden print:block fixed inset-0 bg-white text-black z-[9999] p-8 overflow-y-auto top-0 left-0 h-screen w-screen">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 font-display mb-2">{conferenceName || "MUN Conference"}</h1>
            <p className="text-slate-500 text-sm tracking-widest uppercase">Delegate Matrix • Generated by HASHMUN</p>
        </div>
        {teams.map(team => (
            <div key={team} className="mb-10 break-inside-avoid">
                <div className="flex items-end justify-between border-b-2 border-slate-900 mb-4 pb-2">
                    <h2 className="text-2xl font-bold text-slate-800 font-display uppercase tracking-wide">{team}</h2>
                    <span className="text-sm font-bold text-slate-600">{delegates.filter(d => d.team === team).length} DELEGATES</span>
                </div>
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="p-2 border border-slate-300 font-bold text-slate-800 uppercase text-xs">Status</th>
                            <th className="p-2 border border-slate-300 font-bold text-slate-800 uppercase text-xs">Name</th>
                            <th className="p-2 border border-slate-300 font-bold text-slate-800 uppercase text-xs">Committee</th>
                            <th className="p-2 border border-slate-300 font-bold text-slate-800 uppercase text-xs">Allotment</th>
                            <th className="p-2 border border-slate-300 font-bold text-slate-800 uppercase text-xs">Class</th>
                        </tr>
                    </thead>
                    <tbody>
                        {delegates.filter(d => d.team === team).map(d => (
                            <tr key={d.id} className="border-b border-slate-200">
                                <td className="p-2 border border-slate-300 font-semibold">{d.status}</td>
                                <td className="p-2 border border-slate-300">{d.name}</td>
                                <td className="p-2 border border-slate-300">{d.committee}</td>
                                <td className="p-2 border border-slate-300 font-mono text-xs">{d.allotment}</td>
                                <td className="p-2 border border-slate-300">{d.class || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ))}
        <div className="text-center text-slate-400 text-xs mt-12 pt-4 border-t border-slate-200">
            Document generated via HASHMUN.
        </div>
      </div>

      {/* --- SCREEN VIEW --- */}
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Chat
        </button>

        <div className="flex gap-2 w-full md:w-auto">
           {!isEditing ? (
             <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-brand-600/10 border border-brand-500/20 text-brand-400 hover:bg-brand-600/20 flex items-center justify-center gap-2 text-sm font-medium transition-all"
             >
                <Edit2 size={16} /> Edit Table
             </button>
           ) : (
             <div className="flex gap-2 w-full md:w-auto">
                <button 
                    onClick={handleCancelEdit}
                    className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 flex items-center justify-center gap-2 text-sm font-medium transition-all"
                >
                    <X size={16} /> Cancel
                </button>
                <button 
                    onClick={handleSave}
                    className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-lg shadow-green-500/20"
                >
                    <Save size={16} /> Save
                </button>
             </div>
           )}
        </div>
      </div>

      {/* Main Card (No-Print applied implicitly by Print overlay being fixed z-index) */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative flex-1 flex flex-col no-print">
        
        {/* Header & Toolbar */}
        <div className="p-6 border-b border-white/10 flex flex-col gap-6 bg-slate-900/40">
          
          {/* Title Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div className="flex-1 w-full">
                {isEditing ? (
                    <input 
                        type="text" 
                        value={conferenceName}
                        onChange={(e) => setConferenceName(e.target.value)}
                        className="text-2xl font-bold font-display text-white bg-slate-800 border border-brand-500/50 rounded px-2 py-1 w-full max-w-md focus:outline-none"
                        placeholder="Conference Name"
                    />
                ) : (
                    <h1 className="text-2xl font-bold font-display text-white">{conferenceName || "MUN Conference"}</h1>
                )}
                <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                    Generated Matrix • {delegates.length} Total Delegates
                </p>
             </div>

             <div className="flex items-center gap-3">
                 <button 
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-lg text-sm text-white transition-colors"
                  title="Print to PDF"
                 >
                   <Printer size={16} />
                 </button>
                 <button 
                  onClick={handleExportDocx}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-lg text-sm text-white transition-colors"
                  title="Export to Word"
                 >
                   <FileText size={16} />
                 </button>
                 <button 
                   onClick={handleShare}
                   className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
                 >
                   <Share2 size={16} /> Share
                 </button>
             </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
             
             {/* Tabs (Teams) */}
             <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 custom-scrollbar mask-gradient">
                {teams.length === 0 && (
                     <div className="px-4 py-2 rounded-lg bg-brand-600 text-white border border-brand-500 text-sm font-medium">
                        General
                     </div>
                )}
                {teams.map(team => (
                    <button
                        key={team}
                        onClick={() => setActiveTeam(team)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                            activeTeam === team 
                            ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-500/20' 
                            : 'bg-slate-800/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        {team}
                    </button>
                ))}
                
                {isEditing && (
                    <button
                        onClick={openAddTeamModal}
                        className="px-3 py-2 rounded-lg bg-slate-800 border border-brand-500/30 text-brand-400 hover:bg-brand-600/20 hover:text-brand-300 transition-colors flex items-center gap-1 text-xs uppercase font-bold tracking-wider whitespace-nowrap ml-2"
                        title="Add New Table/Team"
                    >
                        <Plus size={14} /> New Table
                    </button>
                )}
             </div>

             {/* Editing Actions for Active Team */}
             {isEditing && teams.length > 0 && (
                <div className="flex items-center gap-2 md:ml-2 md:mr-auto">
                    <button 
                        onClick={openRenameTeamModal}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Rename Current Table"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button 
                        onClick={openDeleteTeamModal}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Current Table"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
             )}

             {/* Search */}
             <div className="relative w-full md:w-auto ml-auto">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder={`Search in ${activeTeam}...`} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 w-full md:w-64 transition-all"
                />
             </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto flex-1 bg-slate-950/20" id="mun-table-container">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-white/10 sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Delegate Name</th>
                <th className="px-6 py-4">Committee</th>
                <th className="px-6 py-4">Allotment</th>
                <th className="px-6 py-4">Class</th>
                {isEditing && <th className="px-6 py-4 w-10 text-center no-print">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
              {filteredDelegates.map((delegate) => (
                <tr 
                  key={delegate.id} 
                  className={`group transition-colors relative ${isEditing ? 'bg-slate-800/20' : 'hover:bg-white/[0.02]'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                        <select 
                            value={delegate.status}
                            onChange={(e) => handleEditChange(delegate.id, 'status', e.target.value)}
                            className="bg-slate-950 border border-white/20 rounded px-2 py-1 text-xs focus:border-brand-500 outline-none text-white"
                        >
                            <option value="Allocated">Allocated</option>
                            <option value="Pending">Pending</option>
                            <option value="Waitlist">Waitlist</option>
                            <option value="Head Delegate">Head Delegate</option>
                        </select>
                    ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        delegate.status === 'Allocated' 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                            : delegate.status === 'Waitlist'
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            : delegate.status === 'Head Delegate'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            : 'bg-slate-700/50 text-slate-400 border-slate-600/30'
                        }`}>
                        {delegate.status === 'Head Delegate' && <Crown size={12} className="mr-1" />}
                        {delegate.status}
                        </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-white group-hover:text-brand-300 transition-colors">
                    {isEditing ? (
                        <input 
                            value={delegate.name}
                            onChange={(e) => handleEditChange(delegate.id, 'name', e.target.value)}
                            className="bg-slate-950 border border-white/20 rounded px-2 py-1 w-full focus:border-brand-500 outline-none"
                            placeholder="Name"
                        />
                    ) : delegate.name}
                  </td>
                  <td className="px-6 py-4">
                     {isEditing ? (
                        <input 
                            value={delegate.committee}
                            onChange={(e) => handleEditChange(delegate.id, 'committee', e.target.value)}
                            className="bg-slate-950 border border-white/20 rounded px-2 py-1 w-full focus:border-brand-500 outline-none"
                            placeholder="Committee"
                        />
                     ) : (
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-accent-purple/50"></div>
                           {delegate.committee}
                        </div>
                     )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {isEditing ? (
                         <input 
                            value={delegate.allotment}
                            onChange={(e) => handleEditChange(delegate.id, 'allotment', e.target.value)}
                            className="bg-slate-950 border border-white/20 rounded px-2 py-1 w-full focus:border-brand-500 outline-none"
                            placeholder="Country/Portfolio"
                        />
                    ) : delegate.allotment}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {isEditing ? (
                         <input 
                            value={delegate.class || ''}
                            onChange={(e) => handleEditChange(delegate.id, 'class', e.target.value)}
                            className="bg-slate-950 border border-white/20 rounded px-2 py-1 w-full focus:border-brand-500 outline-none"
                            placeholder="Class"
                        />
                    ) : (delegate.class || "—")}
                  </td>
                  {isEditing && (
                      <td className="px-6 py-4 text-center no-print">
                          <button 
                            onClick={() => handleDeleteDelegate(delegate.id)}
                            className="text-slate-600 hover:text-red-400 transition-colors p-1"
                            title="Remove Delegate"
                          >
                             <Trash2 size={16} />
                          </button>
                      </td>
                  )}
                </tr>
              ))}
              
              {/* Add Row Button (Edit Mode Only) */}
              {isEditing && (
                  <tr>
                      <td colSpan={6} className="px-6 py-4 border-t border-white/5 border-dashed">
                          <button 
                            onClick={handleAddDelegate}
                            className="w-full py-2 flex items-center justify-center gap-2 text-slate-500 hover:text-brand-400 hover:bg-brand-500/5 rounded-lg border border-transparent hover:border-brand-500/20 transition-all border-dashed"
                          >
                              <Plus size={16} /> Add Delegate to {activeTeam || "Team"}
                          </button>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
          
          {filteredDelegates.length === 0 && !isEditing && (
             <div className="p-12 text-center text-slate-500">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>No delegates in {activeTeam}.</p>
             </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950/30 flex justify-between items-center text-xs text-slate-500 no-print">
          <div>
            Powered by HASHMUN AI
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-yellow-500/80 font-medium">
               <Crown size={12} /> Head Delegates: {headDelegateCount}
            </span>
            <span>
               Total: {delegates.length}
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast.show && (
        <div className="fixed bottom-8 right-8 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 no-print">
          <div className="bg-brand-500 rounded-full p-1">
            <Check size={12} className="text-white" /> 
          </div>
          <div>
            <p className="font-bold text-sm">{showToast.message}</p>
          </div>
        </div>
      )}

      {/* --- CUSTOM MODALS (Replacements for prompt/confirm) --- */}
      {modalState.type && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 no-print">
              <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 transform scale-100 animate-in zoom-in-95 duration-200">
                  
                  {/* Header */}
                  <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-1">
                          {modalState.type === 'ADD_TEAM' && "Create New Table"}
                          {modalState.type === 'RENAME_TEAM' && "Rename Table"}
                          {modalState.type === 'DELETE_TEAM' && "Delete Table?"}
                      </h3>
                      <p className="text-sm text-slate-400">
                          {modalState.type === 'ADD_TEAM' && "Enter a name for the new team/table."}
                          {modalState.type === 'RENAME_TEAM' && "Enter a new name for this table."}
                          {modalState.type === 'DELETE_TEAM' && "Are you sure? This will permanently remove the team and all its delegates."}
                      </p>
                  </div>

                  {/* Body (Inputs) */}
                  {(modalState.type === 'ADD_TEAM' || modalState.type === 'RENAME_TEAM') && (
                      <input 
                        ref={inputRef}
                        type="text" 
                        value={modalState.inputValue}
                        onChange={(e) => setModalState(prev => ({ ...prev, inputValue: e.target.value }))}
                        className="w-full bg-slate-950 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500 mb-6"
                        placeholder="Team Name (e.g., Team A)"
                        onKeyDown={(e) => e.key === 'Enter' && confirmModalAction()}
                      />
                  )}

                  {/* Warning Icon for Delete */}
                  {modalState.type === 'DELETE_TEAM' && (
                      <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm mb-6">
                          <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
                          <p>This action cannot be undone.</p>
                      </div>
                  )}

                  {/* Footer (Buttons) */}
                  <div className="flex justify-end gap-3">
                      <button 
                        onClick={closeModal}
                        className="px-4 py-2 rounded-lg text-slate-300 hover:bg-white/5 transition-colors text-sm font-medium"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={confirmModalAction}
                        className={`px-4 py-2 rounded-lg text-white text-sm font-bold shadow-lg transition-all transform active:scale-95 ${
                            modalState.type === 'DELETE_TEAM' 
                            ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' 
                            : 'bg-brand-600 hover:bg-brand-500 shadow-brand-500/20'
                        }`}
                      >
                          {modalState.type === 'DELETE_TEAM' ? 'Confirm Delete' : 'Confirm'}
                      </button>
                  </div>

              </div>
          </div>
      )}

    </div>
  );
};

export default TeamTable;