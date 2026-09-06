import { Answers, ConfidenceAssessment } from './types';

/**
 * Step 1 Helper: Detects unstated or missing optional inputs from the borrower answers.
 */
export function detectMissingFields(answers: Answers): string[] {
  const missingFields: string[] = [];

  if (answers.creditScore === 'unknown' || answers.creditScore === undefined) {
    missingFields.push('Credit Score (Selected as Unknown)');
  }
  if (answers.householdExpenses === undefined || answers.householdExpenses === 0) {
    missingFields.push('Monthly Household Expenses');
  }
  if (answers.emergencySavingsMonths === undefined) {
    missingFields.push('Emergency Savings Buffer');
  }
  if (answers.incomeHistoryYears === undefined) {
    missingFields.push('Years of Income Stability');
  }
  if (answers.bouncedEMIsInLast12M === undefined) {
    missingFields.push('Recent Payment History (Bounced EMIs)');
  }

  return missingFields;
}

/**
 * Pure function: Evaluates confidence level and reports the EXACT real rate-widening applied by rateBand.ts.
 * 
 * Data Flow Architecture:
 * - engine.ts calls detectMissingFields(answers) first.
 * - rateBand.ts applies OPTIONAL_FIELD_MISSING_RATE_WIDENING_BPS to maxRate and returns widenedBps.
 * - calculateConfidence receives actualWidenedBps from rateBand.ts and reports that EXACT number.
 */
export function calculateConfidence(
  answers: Answers,
  answeredCount: number,
  applicableCount: number,
  actualWidenedBps: number,
  missingFields: string[]
): ConfidenceAssessment {
  // Calculate answered ratio percentage
  const totalCount = Math.max(1, applicableCount);
  const ratio = Math.min(1.0, Math.max(0.2, answeredCount / totalCount));
  const rawScore = Math.round(ratio * 100);

  let level: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
  let explanation = '';

  const isScoreUnknown = answers.creditScore === 'unknown' || answers.creditScore === undefined;
  const actualWidenedPct = Math.round((actualWidenedBps / 100) * 10) / 10;

  if (rawScore >= 85 && !isScoreUnknown && missingFields.length === 0) {
    level = 'HIGH';
    explanation = 'High Confidence: Your inputs provide a complete, verified financial profile including exact credit score and living expenses. Rates and eligibility reflect narrow, precise bands.';
  } else if (rawScore >= 60 && !isScoreUnknown) {
    level = 'MEDIUM';
    explanation = `Medium Confidence: Your interest rate range has been widened by +${actualWidenedPct.toFixed(1)}% because optional questions (${missingFields.slice(0, 2).join(', ')}) were left unstated. Answering them will sharpen your negotiation card.`;
  } else {
    level = 'LOW';
    if (isScoreUnknown) {
      explanation = `Low Confidence: Your interest rate range has been widened by +${actualWidenedPct.toFixed(1)}% because your Credit Score was marked as 'Unknown' and key optional questions were omitted (${missingFields.slice(0, 2).join(', ')}). Lenders charge uncertainty premiums when bureau history is unverified.`;
    } else {
      explanation = `Low Confidence: Rate and eligibility bands are widened by +${actualWidenedPct.toFixed(1)}% due to multiple unstated optional inputs (${missingFields.join(', ')}).`;
    }
  }

  return {
    scorePct: rawScore,
    level,
    explanation,
    missingOptionalFields: missingFields
  };
}

