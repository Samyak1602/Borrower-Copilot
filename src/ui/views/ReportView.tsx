import React from 'react';
import { Answers } from '../../rules/types';
import { evaluateBorrowerCopilot } from '../../rules/engine';
import { NegotiationCard } from '../components/NegotiationCard';

interface ReportViewProps {
  answers: Answers;
  onToggleInspector: () => void;
  activePersonaName?: string;
}

export const ReportView: React.FC<ReportViewProps> = ({
  answers,
  onToggleInspector,
  activePersonaName
}) => {
  const assessment = evaluateBorrowerCopilot(answers);

  return (
    <div className="py-4 space-y-6">
      {/* Primary Exportable Negotiation Card */}
      <NegotiationCard
        assessment={assessment}
        onToggleInspector={onToggleInspector}
        personaName={activePersonaName}
      />
    </div>
  );
};
