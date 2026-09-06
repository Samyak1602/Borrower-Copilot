import React from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

interface ProgressBarProps {
  answeredCount: number;
  totalCount: number;
  pctComplete: number;
  mustTierComplete: boolean;
  tier: 'must' | 'additional';
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScorePct: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  answeredCount,
  totalCount,
  pctComplete,
  mustTierComplete,
  tier,
  confidenceLevel,
  confidenceScorePct
}) => {
  const getConfidenceBadgeColor = () => {
    if (confidenceLevel === 'HIGH') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (confidenceLevel === 'MEDIUM') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="w-full bg-slate-900/60 p-4 rounded-2xl border border-white/10 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Progress:</span>
          <span className="text-sm font-semibold text-white">{answeredCount} of {totalCount} Questions Answered</span>
          
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
            tier === 'must' 
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
              : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
          }`}>
            {tier === 'must' ? 'Core Must-Tier' : 'Additional Refinement Tier'}
          </span>
        </div>

        {/* Confidence Indicator Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Confidence Score:</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${getConfidenceBadgeColor()}`}>
            {confidenceLevel === 'HIGH' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            {confidenceLevel} ({confidenceScorePct}%)
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${pctComplete}%` }}
        />
      </div>

      {/* Tier milestone footnote */}
      <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
        <span>
          {mustTierComplete 
            ? '✓ Core inputs complete (All 4 outputs calculated)' 
            : 'Complete 9 Must-Tier questions to calculate your basic Negotiation Card.'}
        </span>
        <span className="hidden sm:inline">
          {pctComplete < 100 ? 'Answering additional questions narrows interest & eligibility bands.' : '100% Complete — Full Precision Analysis'}
        </span>
      </div>
    </div>
  );
};
