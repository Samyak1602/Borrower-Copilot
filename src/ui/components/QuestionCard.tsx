import React from 'react';
import { QuestionDef } from '../../rules/types';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';

interface QuestionCardProps {
  question: QuestionDef;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  value,
  onChange,
  onNext,
  onPrev,
  isFirst,
  isLast
}) => {
  const formatIndianCurrency = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const currentValue = value !== undefined ? value : '';

  const renderInput = () => {
    switch (question.inputType) {
      case 'currency':
        return (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden shadow-inner">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₹</span>
              <input
                type="number"
                min={question.min}
                max={question.max}
                step={question.step || 1000}
                value={currentValue}
                onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={question.placeholder}
                className="w-full pl-10 pr-4 py-4 bg-slate-900/90 border border-slate-700 rounded-xl text-2xl font-bold text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
            {typeof currentValue === 'number' && currentValue > 0 && (
              <div className="text-right text-xs font-semibold text-blue-400">
                Formatted: {formatIndianCurrency(currentValue)}
              </div>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options?.map((opt) => {
              const isSelected = currentValue === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => onChange(opt.value)}
                  className={`p-4 rounded-xl border text-left font-semibold text-sm transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
                </button>
              );
            })}
          </div>
        );

      case 'radio':
        return (
          <div className="flex flex-col sm:flex-row gap-3">
            {question.options?.map((opt) => {
              const isSelected = currentValue === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => onChange(opt.value)}
                  className={`flex-1 p-4 rounded-xl border text-center font-bold text-sm transition-all ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      case 'number':
      default:
        return (
          <div className="space-y-2">
            <div className="relative">
              <input
                type="number"
                min={question.min}
                max={question.max}
                step={question.step || 1}
                value={currentValue}
                onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={question.placeholder}
                className="w-full px-4 py-3.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xl font-bold text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
              {question.unit && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  {question.unit}
                </span>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 max-w-3xl mx-auto border-white/10 shadow-2xl relative overflow-hidden">
      
      {/* Affects Badges Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
          question.tier === 'must'
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        }`}>
          {question.tier === 'must' ? 'Core Question (Must-Tier)' : 'Refinement Question (Additional-Tier)'}
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400">Affects Outputs:</span>
          {question.affects.map((aff) => (
            <span
              key={aff}
              className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-300"
            >
              {aff}
            </span>
          ))}
        </div>
      </div>

      {/* Question Text */}
      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
        {question.text}
      </h2>

      {/* Helper Text / Tooltip */}
      {question.helpText && (
        <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-white/5 mb-6">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <span>{question.helpText}</span>
        </div>
      )}

      {/* Input Control */}
      <div className="my-6">
        {renderInput()}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            isFirst
              ? 'opacity-40 cursor-not-allowed text-slate-500'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
        >
          <span>{isLast ? 'View Negotiation Card' : 'Next Question'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
