import React from 'react';
import { PersonaAuditModal } from '../components/PersonaAuditModal';
import { Answers } from '../../rules/types';

interface PersonasViewProps {
  onLoadPersona: (answers: Answers, personaName: string) => void;
}

export const PersonasView: React.FC<PersonasViewProps> = ({ onLoadPersona }) => {
  return (
    <div className="py-4">
      <PersonaAuditModal onLoadPersona={onLoadPersona} />
    </div>
  );
};
