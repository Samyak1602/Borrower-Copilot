import { QUESTION_BANK } from './questionBank';
import { Answers, QuestionDef } from '../rules/types';

/**
 * Returns all applicable questions for the current borrower given their income type and prior answers.
 * 
 * Adaptive flow rules:
 * - Salaried applicants skip ITR and business collateral questions unless explicitly indicated.
 * - Kirana/Self-Employed applicants see business stability and collateral questions.
 * - Informal riders/tailors skip formal ITR questions.
 */
export function getApplicableQuestions(answers: Answers): QuestionDef[] {
  const incomeType = answers.incomeType || 'salaried';

  return QUESTION_BANK.filter((q) => {
    // Check baseline applicability tag
    const appliesToType = q.appliesTo.includes('all') || q.appliesTo.includes(incomeType);
    if (!appliesToType) return false;

    // Additional adaptive branching rules
    if (q.id === 'variableIncomeSharePct' && incomeType === 'informal') {
      return false; // Informal cash income is 100% variable by definition
    }

    return true;
  });
}

/**
 * Calculates current progress stats for the questionnaire wizard.
 */

export function getFlowProgress(answers: Answers, answeredIds: string[]) {
  const applicable = getApplicableQuestions(answers);
  const total = applicable.length;

  const answeredSet = new Set(answeredIds);
  const answeredCount = applicable.filter((q) => answeredSet.has(q.id) || answers[q.id] !== undefined).length;

  const mustTierQuestions = applicable.filter((q) => q.tier === 'must');
  const mustAnswered = mustTierQuestions.filter((q) => answeredSet.has(q.id) || answers[q.id] !== undefined).length;

  return {
    answeredCount,
    totalCount: total,
    pctComplete: Math.min(100, Math.round((answeredCount / total) * 100)),
    mustTierComplete: mustAnswered >= mustTierQuestions.length,
    mustTierRemaining: mustTierQuestions.length - mustAnswered,
    additionalTierCount: total - mustTierQuestions.length
  };
}
