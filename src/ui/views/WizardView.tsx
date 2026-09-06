import React, { useState } from 'react';
import { Answers, QuestionDef } from '../../rules/types';
import { getApplicableQuestions, getFlowProgress } from '../../questions/flowEngine';
import { evaluateBorrowerCopilot } from '../../rules/engine';
import { ProgressBar } from '../components/ProgressBar';
import { QuestionCard } from '../components/QuestionCard';
import { Sparkles, Eye } from 'lucide-react';

interface WizardViewProps {
  answers: Answers;
  onUpdateAnswers: (newAnswers: Answers) => void;
  onComplete: () => void;
}

export const WizardView: React.FC<WizardViewProps> = ({
  answers,
  onUpdateAnswers,
  onComplete
}) => {
  const applicableQuestions = getApplicableQuestions(answers);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answeredIds, setAnsweredIds] = useState<string[]>(Object.keys(answers));
  const allAnsweredIds = Array.from(new Set([...answeredIds, ...Object.keys(answers)]));

  // Current Question
  const safeIndex = Math.min(currentStepIndex, applicableQuestions.length - 1);
  const currentQuestion: QuestionDef = applicableQuestions[safeIndex] || applicableQuestions[0];

  const progress = getFlowProgress(answers, allAnsweredIds);
  const liveAssessment = evaluateBorrowerCopilot(answers, allAnsweredIds);

  const handleAnswerChange = (val: any) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: val };
    onUpdateAnswers(updatedAnswers);

    if (!answeredIds.includes(currentQuestion.id)) {
      setAnsweredIds([...answeredIds, currentQuestion.id]);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < applicableQuestions.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      
      {/* Progress Bar & Tier Indicator */}
      <ProgressBar
        answeredCount={progress.answeredCount}
        totalCount={progress.totalCount}
        pctComplete={progress.pctComplete}
        mustTierComplete={progress.mustTierComplete}
        tier={currentQuestion.tier}
        confidenceLevel={liveAssessment.confidence.level}
        confidenceScorePct={liveAssessment.confidence.scorePct}
      />

      {/* Main Interactive Question Card */}
      <QuestionCard
        question={currentQuestion}
        value={answers[currentQuestion.id]}
        onChange={handleAnswerChange}
        onNext={handleNext}
        onPrev={handlePrev}
        isFirst={currentStepIndex === 0}
        isLast={currentStepIndex === applicableQuestions.length - 1}
      />

      {/* Live Impact Real-Time Preview Panel */}
      <div className="glass-card p-5 border-blue-500/20 bg-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-400">Real-Time Rules Impact</div>
            <div className="text-sm font-bold text-white">
              Verdict: <span className={
                liveAssessment.o1.verdict === 'BORROW' ? 'text-emerald-400' :
                liveAssessment.o1.verdict === 'BORROW_LESS' ? 'text-amber-400' :
                liveAssessment.o1.verdict === 'DONT_BORROW' ? 'text-rose-400' :
                'text-slate-400'
              }>{liveAssessment.o1.verdict.replace(/_/g, ' ')}</span> • Safe Max: <span className="text-indigo-300">₹{liveAssessment.o2.safeMaxEligible.toLocaleString('en-IN')}</span> • Rate: <span className="text-purple-300">{liveAssessment.o3.nominalMinRate}%–{liveAssessment.o3.nominalMaxRate}%</span>
            </div>

          </div>
        </div>

        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all shrink-0"
        >
          <Eye className="w-4 h-4" />
          <span>Skip to Full Card</span>
        </button>
      </div>

    </div>
  );
};
