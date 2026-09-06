import React, { useState } from 'react';
import { Header } from './ui/components/Header';
import { WizardView } from './ui/views/WizardView';
import { ReportView } from './ui/views/ReportView';
import { PersonasView } from './ui/views/PersonasView';
import { RuleInspector } from './ui/components/RuleInspector';
import { Answers } from './rules/types';
import { evaluateBorrowerCopilot } from './rules/engine';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wizard' | 'report' | 'personas'>('wizard');
  const [answers, setAnswers] = useState<Answers>({});
  const [activePersonaName, setActivePersonaName] = useState<string | undefined>(undefined);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  const handleLoadPersona = (newAnswers: Answers, name: string) => {
    setAnswers({ ...newAnswers });
    setActivePersonaName(name);
    setActiveTab('report');
  };

  const currentAssessment = evaluateBorrowerCopilot(answers);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Main Header & Navigation */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLoadPersona={handleLoadPersona}
          onToggleInspector={() => setIsInspectorOpen(true)}
          activePersonaName={activePersonaName}
        />

        {/* View Routing */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'wizard' && (
            <WizardView
              answers={answers}
              onUpdateAnswers={(updated) => setAnswers(updated)}
              onComplete={() => setActiveTab('report')}
            />
          )}

          {activeTab === 'report' && (
            <ReportView
              answers={answers}
              onToggleInspector={() => setIsInspectorOpen(true)}
              activePersonaName={activePersonaName}
            />
          )}

          {activeTab === 'personas' && (
            <PersonasView onLoadPersona={handleLoadPersona} />
          )}
        </main>
      </div>

      {/* Live Rule Inspector Drawer */}
      <RuleInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        assessment={currentAssessment}
      />

      {/* App Footer */}
      <footer className="no-print border-t border-white/10 py-6 bg-slate-950/80 text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <span className="font-bold text-slate-300">Borrower Copilot</span> — Built for Lokta Submission. Zero login • Zero backend • Zero data stored.
          </div>
          <div className="text-slate-400">
            Every threshold editable in <code className="text-blue-300 font-mono">src/rules/constants.ts</code>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
