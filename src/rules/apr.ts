/**
 * Pure function: Folds upfront processing fee into effective Annualized Percentage Rate (APR).
 * 
 * Standard financial approximation:
 * APR = Nominal Rate + (Processing Fee % / (Tenure in Years))
 */
export function calculateAPR(
  nominalMinRate: number,
  nominalMaxRate: number,
  tenureMonths: number,
  processingFeePct: number
): { aprMinRate: number; aprMaxRate: number } {
  if (tenureMonths <= 0) {
    return { aprMinRate: nominalMinRate, aprMaxRate: nominalMaxRate };
  }

  const tenureYears = tenureMonths / 12;
  const feeAnnualizedComponent = processingFeePct / tenureYears;

  const aprMinRate = Math.round((nominalMinRate + feeAnnualizedComponent) * 10) / 10;
  const aprMaxRate = Math.round((nominalMaxRate + feeAnnualizedComponent) * 10) / 10;

  return {
    aprMinRate,
    aprMaxRate
  };
}
