import React from 'react';
import { UserCheck, FileText, Cpu, HelpCircle } from 'lucide-react';
import { TEST_PERSONAS } from '../../personas/testPersonas';
import { Answers } from '../../rules/types';

interface HeaderProps {
  activeTab: 'wizard' | 'report' | 'personas';
  setActiveTab: (tab: 'wizard' | 'report' | 'personas') => void;
  onLoadPersona: (answers: Answers, personaName: string) => void;
  onToggleInspector: () => void;
  activePersonaName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onLoadPersona,
  onToggleInspector,
  activePersonaName
}) => {
  return (
    <header className="no-print border-b border-white/10 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('wizard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xl shrink-0">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white tracking-tight">Borrower Copilot</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Lokta Submission
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Inspectable Loan Advisory & Negotiation Engine</p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'wizard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'report'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Negotiation Card</span>
          </button>

          <button
            onClick={() => setActiveTab('personas')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'personas'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Persona Audit</span>
          </button>
        </nav>

        {/* Persona Quick-Load Switcher & Rule Inspector Button */}
        <div className="flex items-center gap-2">
          {/* Quick Load Persona Dropdown / Buttons */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
            <span className="text-[11px] text-slate-400 px-2 font-medium hidden sm:inline">Persona:</span>
            {Object.values(TEST_PERSONAS).map((p) => {
              const isActive = activePersonaName === p.name;
              return (
                <button
                  key={p.id}
                  onClick={() => onLoadPersona(p.answers, p.name)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={p.summary}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Live Rule Inspector Button */}
          <button
            onClick={onToggleInspector}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold transition-all shadow-sm"
          >
            <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Rule Inspector</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Header Navigation (Visible on small screens) */}
      <div className="md:hidden border-t border-white/10 bg-slate-900/90 px-4 py-2 flex items-center justify-around gap-1">
        <button
          onClick={() => setActiveTab('wizard')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'wizard'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Wizard</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'report'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Card</span>
        </button>

        <button
          onClick={() => setActiveTab('personas')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'personas'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Audit</span>
        </button>
      </div>
    </header>
  );
};
