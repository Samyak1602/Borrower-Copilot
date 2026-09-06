import React, { useState } from 'react';
import { X, Search, Cpu, BookOpen } from 'lucide-react';
import { OverallAssessment } from '../../rules/types';
import * as Constants from '../../rules/constants';

interface RuleInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  assessment?: OverallAssessment;
}

export const RuleInspector: React.FC<RuleInspectorProps> = ({
  isOpen,
  onClose,
  assessment
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Formatting helper to eliminate floating point artifacts like 55.00000000000001%
  const formatPct = (decimalVal: number): string => {
    const rounded = Math.round(decimalVal * 100 * 100) / 100;
    return `${rounded}%`;
  };

  const formatBps = (bps: number, prefix: string = ''): string => {
    const rounded = Math.round((bps / 100) * 100) / 100;
    return `${prefix}${rounded}%`;
  };

  // Flatten constants into searchable array
  const constantsList = [
    { name: 'HAIRCUT_SALARIED', val: formatPct(Constants.HAIRCUT_SALARIED), source: 'RBI / Standard Bank Policy', why: 'Fixed salaried income carries zero verification haircut.' },
    { name: 'HAIRCUT_SELF_EMPLOYED', val: formatPct(Constants.HAIRCUT_SELF_EMPLOYED), source: 'SBI SME Underwriting', why: 'Cash business receipts haircut for turnover variance.' },
    { name: 'HAIRCUT_INFORMAL', val: formatPct(Constants.HAIRCUT_INFORMAL), source: 'Microfinance Risk Code', why: 'Informal gig/cash income haircut for volatility.' },
    { name: 'FOIR_LENDER_SALARIED', val: formatPct(Constants.FOIR_LENDER_SALARIED), source: 'HDFC / ICICI Policy Manual', why: 'Maximum FOIR cap allowed by aggressive lenders.' },
    { name: 'FOIR_SAFE_SALARIED', val: formatPct(Constants.FOIR_SAFE_SALARIED), source: 'Financial Planning Judgement', why: 'Borrower-safe cap reserving 55% buffer for living expenses.' },
    { name: 'FOIR_LENDER_SELF_EMPLOYED', val: formatPct(Constants.FOIR_LENDER_SELF_EMPLOYED), source: 'SBI MSME Policy', why: 'Lender FOIR cap for self-employed borrowers.' },
    { name: 'FOIR_SAFE_SELF_EMPLOYED', val: formatPct(Constants.FOIR_SAFE_SELF_EMPLOYED), source: 'SME Safety Judgement', why: 'Borrower-safe cap for working capital resilience.' },
    { name: 'FOIR_LENDER_INFORMAL', val: formatPct(Constants.FOIR_LENDER_INFORMAL), source: 'NBFC Informal Risk Policy', why: 'Lender FOIR limit for informal applicants.' },
    { name: 'FOIR_SAFE_INFORMAL', val: formatPct(Constants.FOIR_SAFE_INFORMAL), source: 'Financial Inclusion Safety', why: 'Strict 30% safe FOIR limit for low-income households.' },
    { name: 'LTV_CAP_PROPERTY', val: formatPct(Constants.LTV_CAP_PROPERTY), source: 'RBI Property Loan Direction', why: 'Loan-To-Value cap on unencumbered property value.' },
    { name: 'LTV_CAP_GOLD', val: formatPct(Constants.LTV_CAP_GOLD), source: 'RBI Gold Loan Limit', why: 'Loan-To-Value cap on pledged gold value.' },
    { name: 'SECURED_RATE_DISCOUNT_BPS', val: formatBps(Constants.SECURED_RATE_DISCOUNT_BPS, '-'), source: 'Retail Banking Rate Card', why: 'Rate discount granted when collateral is pledged.' },
    { name: 'UNSECURED_NO_SCORE_PENALTY_BPS', val: formatBps(Constants.UNSECURED_NO_SCORE_PENALTY_BPS, '+'), source: 'Risk-Based Pricing Model', why: 'Unsecured penalty for missing bureau credit score.' },
    { name: 'HIGH_COST_DEBT_THRESHOLD_RATE', val: `${Math.round(Constants.HIGH_COST_DEBT_THRESHOLD_RATE * 100) / 100}%`, source: 'RBI Digital Lending Fair Code', why: 'Interest rate threshold flagging high-cost predator debt.' },
    { name: 'EXISTING_EMI_BURDEN_CAUTION_PCT', val: formatPct(Constants.EXISTING_EMI_BURDEN_CAUTION_PCT), source: 'Retail Lending Risk Indicator', why: 'Existing debt ratio burden threshold triggering BORROW_LESS caution.' },
    { name: 'STRESS_INCOME_DROP_PCT', val: `-${formatPct(Constants.STRESS_INCOME_DROP_PCT)}`, source: 'Household Stress Standard', why: 'Emergency income drop simulation parameter.' },
    { name: 'UNKNOWN_SCORE_BAND_WIDENING_BPS', val: formatBps(Constants.UNKNOWN_SCORE_BAND_WIDENING_BPS, '+'), source: 'Underwriting Confidence Engine', why: 'Rate range widening factor when credit score is unknown.' },
    { name: 'OPTIONAL_FIELD_MISSING_RATE_WIDENING_BPS', val: formatBps(Constants.OPTIONAL_FIELD_MISSING_RATE_WIDENING_BPS, '+'), source: 'Confidence Range Model', why: 'Upper rate bound expansion per unstated optional question.' }
  ];

  const filteredConstants = constantsList.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.why.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Collect all triggered rules from assessment
  const triggeredRules = assessment ? [
    ...assessment.o1.rulesTriggered,
    ...assessment.o2.rulesTriggered,
    ...assessment.o3.rulesTriggered,
    ...assessment.o4.rulesTriggered
  ] : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Inspector Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Live Rules Inspector</h2>
              <p className="text-xs text-slate-400">Single Source of Truth: <code className="text-emerald-300 font-mono">src/rules/constants.ts</code></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Active Triggered Rules Section */}
          {triggeredRules.length > 0 && (
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Active Rules Triggered for Current Assessment ({triggeredRules.length})</span>
              </h3>

              <div className="space-y-3">
                {triggeredRules.map((rule, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-emerald-300">{rule.name}</span>
                      <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                        {rule.thresholdApplied}
                      </span>
                    </div>
                    <p className="text-slate-300 mb-1">{rule.description}</p>
                    <div className="text-[10px] text-slate-400 italic">Source: {rule.sourceOrJudgement}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Box */}
          <div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search rule constants, thresholds, or rationale..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Master Constants Registry */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-3">
              Master Rules Registry (<code className="text-blue-300 font-mono">constants.ts</code>)
            </h3>

            <div className="space-y-2.5">
              {filteredConstants.map((c) => (
                <div key={c.name} className="p-3 rounded-xl bg-slate-950/80 border border-white/5 hover:border-white/15 text-xs">
                  <div className="flex justify-between items-center font-mono">
                    <span className="font-bold text-blue-400 text-[11px]">{c.name}</span>
                    <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {c.val}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1 text-[11px]">{c.why}</p>
                  <div className="text-[10px] text-slate-500 mt-1 italic">Source: {c.source}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950 text-center text-xs text-slate-400">
          60-Minute Live Defense Ready: Edit any value in <code className="text-emerald-300 font-mono">constants.ts</code> to update app behavior instantly.
        </div>

      </div>
    </div>
  );
};
