import React from 'react';
import { TEST_PERSONAS } from '../../personas/testPersonas';
import { evaluateBorrowerCopilot } from '../../rules/engine';
import { UserCheck, ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';
import { Answers } from '../../rules/types';

interface PersonaAuditModalProps {
  onLoadPersona: (answers: Answers, personaName: string) => void;
}

export const PersonaAuditModal: React.FC<PersonaAuditModalProps> = ({ onLoadPersona }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 border-indigo-500/30 bg-gradient-to-br from-slate-900/90 to-indigo-950/40">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Test Persona Audit Runner</h2>
            <p className="text-xs text-slate-300">Automated verification of Priya, Ravi, and Anita against the inspectable rules engine.</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          The three test profiles validate distinct underwriting scenarios: Priya (salaried approval), Ravi (self-employed LAP collateral routing unblocked by missing credit score), and Anita (informal rider with bounced EMI triggering DO NOT BORROW).
        </p>
      </div>

      {/* 3 Personas Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(TEST_PERSONAS).map((p) => {
          const assessment = evaluateBorrowerCopilot(p.answers);
          const { o1, o2, o3 } = assessment;

          const getVerdictBadge = () => {
            if (o1.verdict === 'BORROW') return { color: 'bg-emerald-500 text-slate-950', icon: <ShieldCheck className="w-4 h-4" /> };
            if (o1.verdict === 'BORROW_LESS') return { color: 'bg-amber-500 text-slate-950', icon: <AlertTriangle className="w-4 h-4" /> };
            if (o1.verdict === 'INSUFFICIENT_DATA') return { color: 'bg-slate-700 text-slate-200', icon: <HelpCircle className="w-4 h-4" /> };
            return { color: 'bg-rose-600 text-white', icon: <ShieldAlert className="w-4 h-4" /> };
          };

          const verdictBadge = getVerdictBadge();


          return (
            <div key={p.id} className="glass-card p-6 flex flex-col justify-between border-white/10 hover:border-white/20 transition-all">
              <div>
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-4 pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-xl font-bold text-white">{p.name} ({p.age} yrs)</h3>
                    <div className="text-xs text-slate-400 font-medium">{p.location}</div>
                  </div>
                  <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${verdictBadge.color}`}>
                    {verdictBadge.icon}
                    {o1.verdict.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Profile Summary */}
                <p className="text-xs text-slate-300 italic mb-4 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  "{p.summary}"
                </p>

                {/* Core Metrics */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between p-2 rounded bg-slate-900/80">
                    <span className="text-slate-400">Net Income:</span>
                    <span className="font-bold text-white">{formatCurrency(p.answers.netMonthlyIncome || 0)}/mo</span>
                  </div>

                  <div className="flex justify-between p-2 rounded bg-slate-900/80">
                    <span className="text-slate-400">Requested Loan:</span>
                    <span className="font-bold text-white">{formatCurrency(p.answers.amountRequested || 0)}</span>
                  </div>

                  <div className="flex justify-between p-2 rounded bg-slate-900/80">
                    <span className="text-slate-400">Product Routed:</span>
                    <span className="font-bold text-blue-400">{o3.productRouted.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>

                  <div className="flex justify-between p-2 rounded bg-slate-900/80">
                    <span className="text-slate-400">Safe Max Eligible:</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(o2.safeMaxEligible)}</span>
                  </div>

                  <div className="flex justify-between p-2 rounded bg-slate-900/80">
                    <span className="text-slate-400">Rate Band / APR:</span>
                    <span className="font-bold text-indigo-300">{o3.nominalMinRate}%–{o3.nominalMaxRate}% ({o3.aprMinRate}% APR)</span>
                  </div>
                </div>

                {/* Verdict Rationale */}
                <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-white/5 text-[11px] text-slate-300">
                  <span className="font-bold text-slate-400 block mb-1">Verdict Rationale:</span>
                  "{o1.reason}"
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onLoadPersona(p.answers, p.name)}
                className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Load {p.name}'s Flow & Card</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
