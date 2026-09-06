import React from 'react';
import { OverallAssessment } from '../../rules/types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Printer, Cpu, CheckCircle, HelpCircle } from 'lucide-react';

interface NegotiationCardProps {
  assessment: OverallAssessment;
  onToggleInspector?: () => void;
  personaName?: string;
}

export const NegotiationCard: React.FC<NegotiationCardProps> = ({
  assessment,
  onToggleInspector,
  personaName
}) => {
  const { o1, o2, o3, o4, confidence, answers } = assessment;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getVerdictBadge = () => {
    if (o1.verdict === 'BORROW') {
      return {
        bg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
        badge: 'bg-emerald-500 text-slate-950',
        title: 'VERDICT: YOU CAN BORROW',
        icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />
      };
    }
    if (o1.verdict === 'BORROW_LESS') {
      return {
        bg: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
        badge: 'bg-amber-500 text-slate-950',
        title: 'VERDICT: BORROW LESS',
        icon: <AlertTriangle className="w-6 h-6 text-amber-400" />
      };
    }
    if (o1.verdict === 'INSUFFICIENT_DATA') {
      return {
        bg: 'bg-slate-900/80 border-slate-700 text-slate-300',
        badge: 'bg-slate-700 text-slate-200',
        title: 'VERDICT: INSUFFICIENT DATA',
        icon: <HelpCircle className="w-6 h-6 text-slate-400" />
      };
    }
    return {
      bg: 'bg-rose-950/80 border-rose-500/50 text-rose-300',
      badge: 'bg-rose-600 text-white',
      title: 'VERDICT: DO NOT BORROW',
      icon: <ShieldAlert className="w-6 h-6 text-rose-400" />
    };
  };

  const verdictStyle = getVerdictBadge();


  return (
    <div id="negotiation-card-container" className="glass-card p-6 sm:p-8 max-w-4xl mx-auto border-white/15 shadow-2xl relative">
      
      {/* Top Controls (No-Print) */}
      <div className="no-print flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Borrower Negotiation Card</span>
            {personaName && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Persona: {personaName}
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">Hold this card up to a bank manager to negotiate terms backed by inspectable rules.</p>
        </div>

        <div className="flex items-center gap-2">
          {onToggleInspector && (
            <button
              onClick={onToggleInspector}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trace Rules</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* CARD HEADER FOR PRINT / PREVIEW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-slate-900/90 border border-white/10 mb-6">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Borrower Profile Summary</div>
          <div className="text-lg font-bold text-white mt-0.5">
            {answers.incomeType?.toUpperCase()} • Income: {formatCurrency(answers.netMonthlyIncome || 0)}/mo
          </div>
          <div className="text-xs text-slate-400">
            Requested Loan: <span className="text-white font-semibold">{formatCurrency(answers.amountRequested || 0)}</span> ({answers.purpose})
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs font-semibold text-slate-400">Product Routed</div>
          <div className="text-sm font-bold text-blue-400 flex items-center gap-1.5 sm:justify-end">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30">
              {o3.productRouted.replace(/_/g, ' ').toUpperCase()} {o3.isSecured ? '(SECURED)' : '(UNSECURED)'}
            </span>
          </div>
        </div>
      </div>

      {/* O1: VERDICT BANNER */}
      <div className={`p-6 rounded-2xl border-2 mb-6 ${verdictStyle.bg}`}>
        <div className="flex items-start gap-4">
          <div className="shrink-0 p-2 rounded-xl bg-black/30">
            {verdictStyle.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${verdictStyle.badge}`}>
                Output O1
              </span>
              <h3 className="text-lg font-black tracking-tight">{verdictStyle.title}</h3>
            </div>
            <p className="text-sm font-semibold leading-relaxed mt-1 text-slate-100">
              "{o1.reason}"
            </p>
          </div>
        </div>
      </div>

      {/* 2x2 GRID FOR O2, O3, O4 & CONFIDENCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* O2: ELIGIBILITY COMPARISON */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">Output O2 • Eligibility Engine</span>
              <span className="text-[10px] font-semibold text-slate-400">Haircut: {o2.haircutAppliedPct}%</span>
            </div>

            <div className="space-y-3">
              {/* Borrower Safe Number (RECOMMENDED) */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-emerald-400 uppercase tracking-wider">Borrower-Safe Max (Recommended)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">Safe Cap {o2.safeFOIRCapPct}%</span>
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {formatCurrency(o2.safeMaxEligible)}
                </div>
              </div>

              {/* Lender Max Number */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Lender-Policy Max (Looser)</span>
                  <span>Lender Cap {o2.lenderFOIRCapPct}%</span>
                </div>
                <div className="text-lg font-bold text-slate-300 mt-0.5">
                  {formatCurrency(o2.lenderMaxEligible)}
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 leading-normal italic border-t border-white/5 pt-2">
            💡 {o2.recommendationReason}
          </p>
        </div>

        {/* O3: FAIR INTEREST RATE & ALL-IN APR */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">Output O3 • Interest & All-In APR</span>
              <span className="text-[10px] font-semibold text-slate-400">Fee: {o3.processingFeePct}%</span>
            </div>

            <div className="space-y-3">
              {/* Nominal Rate Band */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40">
                <div className="text-xs font-semibold text-indigo-300">Fair Nominal Interest Rate Band</div>
                <div className="text-2xl font-black text-white mt-0.5">
                  {o3.nominalMinRate}% – {o3.nominalMaxRate}% <span className="text-xs font-normal text-slate-400">/ yr</span>
                </div>
              </div>

              {/* All-In APR Band */}
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40">
                <div className="flex justify-between items-center text-xs text-purple-300 font-semibold">
                  <span>True All-In APR (With Upfront Fee)</span>
                  <span>Fee: {o3.processingFeeAmount > 0 ? formatCurrency(o3.processingFeeAmount) : `${o3.processingFeePct}%`}</span>
                </div>

                <div className="text-xl font-bold text-purple-200 mt-0.5">
                  {o3.aprMinRate}% – {o3.aprMaxRate}% <span className="text-xs font-normal text-slate-400">APR</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 leading-normal italic border-t border-white/5 pt-2">
            📊 {o3.rationale}
          </p>
        </div>

      </div>

      {/* O4 & CONFIDENCE INDICATOR ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* O4: EMI CEILING & STRESS TEST */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Output O4 • Safe EMI & Stress Test</span>
            <span className="text-[10px] font-semibold text-slate-400">{o4.tenureMonths / 12}-Yr Tenure</span>
          </div>

          <div className="flex items-baseline justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 mb-3">
            <div>
              <div className="text-xs text-amber-300 font-semibold">Borrower Safe Monthly EMI Ceiling</div>
              <div className="text-2xl font-black text-white">{formatCurrency(o4.safeEMICeiling)}/mo</div>
            </div>
          </div>

          {/* Stress Scenario Result */}
          {o4.stressScenario.passes === null ? (
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-xs font-medium text-slate-300">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-slate-300">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Not enough information yet</span>
              </div>
              <div className="text-slate-400">{o4.stressScenario.description}</div>
            </div>
          ) : (
            <div className={`p-3 rounded-xl border text-xs font-medium ${
              o4.stressScenario.passes
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            }`}>
              <div className="font-bold flex items-center gap-1.5 mb-1">
                {o4.stressScenario.passes ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                <span>{o4.stressScenario.description}</span>
              </div>
              <div>{o4.stressScenario.warningMessage}</div>
            </div>
          )}

        </div>

        {/* EXPLICIT CONFIDENCE INDICATOR & RANGE WIDENING RATIONALE */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Confidence & Range Widening</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                confidence.level === 'HIGH' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                confidence.level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                {confidence.level} ({confidence.scorePct}%)
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-white/5">
              {confidence.explanation}
            </p>
          </div>

          {confidence.missingOptionalFields.length > 0 && (
            <div className="mt-3 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Unanswered / Skipped Inputs:</span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400">
                {confidence.missingOptionalFields.map(f => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>

      {/* RULE TRACEABILITY FOOTER */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-slate-400">
        <div>
          <span className="font-bold text-slate-300">Rule Traceability:</span> Every number is computed by pure rules in <code className="text-blue-300 font-mono">src/rules/constants.ts</code>
        </div>
        <div className="text-slate-500 font-mono">
          Borrower Copilot v1.0 • Lokta Take-Home
        </div>
      </div>

    </div>
  );
};
