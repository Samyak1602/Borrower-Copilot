import { Answers, OutputO2_Eligibility, LoanProductType, RuleMetadata } from './types';
import {
  HAIRCUT_SALARIED,
  HAIRCUT_SELF_EMPLOYED,
  HAIRCUT_INFORMAL,
  HAIRCUT_CO_APPLICANT,
  VARIABLE_INCOME_HIGH_THRESHOLD_PCT,
  VARIABLE_INCOME_EXTRA_HAIRCUT,
  INCOME_STABILITY_BONUS_YEARS,
  FOIR_STABILITY_BONUS_PCT,
  FOIR_LENDER_SALARIED,
  FOIR_SAFE_SALARIED,
  FOIR_LENDER_SELF_EMPLOYED,
  FOIR_SAFE_SELF_EMPLOYED,
  FOIR_LENDER_INFORMAL,
  FOIR_SAFE_INFORMAL,
  LOW_INCOME_BRACKET_THRESHOLD,
  LOW_INCOME_FOIR_TIGHTENING,
  LTV_CAP_PROPERTY,
  LTV_CAP_GOLD,
  DEFAULT_TENURE_MONTHS,
  DEFAULT_TENURE_MONTHS_LAP
} from './constants';

/**
 * Calculates Present Value (Principal) from Monthly EMI, annual interest rate, and tenure in months.
 */
export function calculatePrincipalFromEMI(monthlyEMI: number, annualRatePct: number, tenureMonths: number): number {
  if (monthlyEMI <= 0 || annualRatePct <= 0 || tenureMonths <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  const n = tenureMonths;
  const pv = monthlyEMI * ((1 - Math.pow(1 + r, -n)) / r);
  return Math.round(pv);
}

/**
 * Calculates Monthly EMI from Principal, annual interest rate, and tenure in months.
 */
export function calculateEMIFromPrincipal(principal: number, annualRatePct: number, tenureMonths: number): number {
  if (principal <= 0 || annualRatePct <= 0 || tenureMonths <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  const n = tenureMonths;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

/**
 * Pure function: Calculates Lender-view vs Borrower-safe FOIR and maximum eligible loan amounts.
 */
export function calculateFOIR(
  answers: Answers,
  routedProduct: LoanProductType,
  benchmarkRatePct: number = 14.0
): OutputO2_Eligibility {
  const incomeType = answers.incomeType || 'salaried';
  const rawIncome = Math.max(0, answers.netMonthlyIncome ?? 0);
  const existingEMIs = Math.max(0, answers.existingEMIs ?? 0);
  const coIncome = Math.max(0, answers.coApplicantIncome ?? 0);
  const rulesTriggered: RuleMetadata[] = [];

  // 1. Determine base haircut percentage based on income classification
  let baseHaircutPct = HAIRCUT_SALARIED;
  let haircutRuleName = 'Salaried Haircut (0%)';
  if (incomeType === 'self-employed') {
    baseHaircutPct = HAIRCUT_SELF_EMPLOYED;
    haircutRuleName = 'Self-Employed Cash Income Haircut (25%)';
  } else if (incomeType === 'informal') {
    baseHaircutPct = HAIRCUT_INFORMAL;
    haircutRuleName = 'Informal Sector Income Haircut (40%)';
  }

  // 2. Check variable income share
  let extraVariableHaircut = 0;
  if ((answers.variableIncomeSharePct ?? 0) > VARIABLE_INCOME_HIGH_THRESHOLD_PCT) {
    extraVariableHaircut = VARIABLE_INCOME_EXTRA_HAIRCUT;
    rulesTriggered.push({
      ruleId: 'VARIABLE_INCOME_HAIRCUT',
      name: 'High Variable Income Haircut',
      thresholdApplied: `Variable share: ${answers.variableIncomeSharePct}% (> ${VARIABLE_INCOME_HIGH_THRESHOLD_PCT}%)`,
      description: `Applies an extra ${VARIABLE_INCOME_EXTRA_HAIRCUT * 100}% haircut due to earnings volatility.`,
      sourceOrJudgement: 'Underwriting risk adjustment.'
    });
  }

  const totalIncomeHaircutPct = baseHaircutPct + extraVariableHaircut;
  const haircuttedPrimaryIncome = rawIncome * (1 - totalIncomeHaircutPct);
  const haircuttedCoIncome = coIncome * (1 - HAIRCUT_CO_APPLICANT);
  const netEffectiveMonthlyIncome = haircuttedPrimaryIncome + haircuttedCoIncome;

  rulesTriggered.push({
    ruleId: 'INCOME_HAIRCUT_RULE',
    name: haircutRuleName,
    thresholdApplied: `Haircut: ${(totalIncomeHaircutPct * 100).toFixed(0)}%`,
    description: `Adjusts stated monthly income from ₹${rawIncome.toLocaleString('en-IN')} to effective ₹${netEffectiveMonthlyIncome.toLocaleString('en-IN')} based on verification stability.`,
    sourceOrJudgement: 'Bank policy standard for income verification.'
  });

  // 3. Base FOIR Caps
  let lenderFOIRCap = FOIR_LENDER_SALARIED;
  let safeFOIRCap = FOIR_SAFE_SALARIED;

  if (incomeType === 'self-employed') {
    lenderFOIRCap = FOIR_LENDER_SELF_EMPLOYED;
    safeFOIRCap = FOIR_SAFE_SELF_EMPLOYED;
  } else if (incomeType === 'informal') {
    lenderFOIRCap = FOIR_LENDER_INFORMAL;
    safeFOIRCap = FOIR_SAFE_INFORMAL;
  }

  // 4. Low Income Tightening (< ₹30,000)
  if (rawIncome > 0 && rawIncome < LOW_INCOME_BRACKET_THRESHOLD) {
    lenderFOIRCap -= LOW_INCOME_FOIR_TIGHTENING;
    safeFOIRCap -= LOW_INCOME_FOIR_TIGHTENING;
    rulesTriggered.push({
      ruleId: 'LOW_INCOME_TIGHTENING',
      name: 'Low Income Bracket FOIR Tightening',
      thresholdApplied: `Net income < ₹${LOW_INCOME_BRACKET_THRESHOLD.toLocaleString('en-IN')}`,
      description: `Tightens FOIR caps by ${(LOW_INCOME_FOIR_TIGHTENING * 100)}% because lower income households spend a higher fraction on basic necessities.`,
      sourceOrJudgement: 'RBI Microfinance Fair Practices Code.'
    });
  }

  // 5. Income Stability Bonus (>= 5 years)
  if ((answers.incomeHistoryYears ?? 0) >= INCOME_STABILITY_BONUS_YEARS) {
    lenderFOIRCap += FOIR_STABILITY_BONUS_PCT;
    safeFOIRCap += FOIR_STABILITY_BONUS_PCT;
    rulesTriggered.push({
      ruleId: 'INCOME_STABILITY_BONUS',
      name: '5+ Year Stability Bonus',
      thresholdApplied: `History: ${answers.incomeHistoryYears} yrs (>= ${INCOME_STABILITY_BONUS_YEARS} yrs)`,
      description: `Adds a ${(FOIR_STABILITY_BONUS_PCT * 100)}% FOIR cap bonus for demonstrated career/business continuity.`,
      sourceOrJudgement: 'Bureau stability scoring benchmark.'
    });
  }

  // 6. Max Monthly EMI Capacity
  const lenderMaxEMICapacity = Math.max(0, netEffectiveMonthlyIncome * lenderFOIRCap - existingEMIs);
  const safeMaxEMICapacity = Math.max(0, netEffectiveMonthlyIncome * safeFOIRCap - existingEMIs);

  // 7. Unadjusted FOIR Principal
  const tenureMonths = routedProduct === 'loan_against_property' ? DEFAULT_TENURE_MONTHS_LAP : DEFAULT_TENURE_MONTHS;
  let lenderMaxPrincipal = calculatePrincipalFromEMI(lenderMaxEMICapacity, benchmarkRatePct, tenureMonths);
  let safeMaxPrincipal = calculatePrincipalFromEMI(safeMaxEMICapacity, benchmarkRatePct, tenureMonths);

  // 8. Collateral Loan-To-Value (LTV) Ceiling
  if ((answers.collateralValue ?? 0) > 0) {
    const isGold = answers.collateralType === 'gold' || routedProduct === 'gold_loan';
    const ltvCap = isGold ? LTV_CAP_GOLD : LTV_CAP_PROPERTY;
    const maxLTVLoanAmount = Math.round((answers.collateralValue ?? 0) * ltvCap);

    lenderMaxPrincipal = Math.min(lenderMaxPrincipal, maxLTVLoanAmount);
    safeMaxPrincipal = Math.min(safeMaxPrincipal, maxLTVLoanAmount);

    rulesTriggered.push({
      ruleId: 'COLLATERAL_LTV_CAP',
      name: `${isGold ? 'Gold' : 'Property'} Loan-To-Value (LTV) Cap`,
      thresholdApplied: `LTV Cap: ${(ltvCap * 100)}% of ₹${(answers.collateralValue ?? 0).toLocaleString('en-IN')}`,
      description: `Caps maximum loan eligibility at ₹${maxLTVLoanAmount.toLocaleString('en-IN')} based on regulatory LTV limits.`,
      sourceOrJudgement: 'RBI Regulatory LTV Ceiling.'
    });
  }

  const requestedAmount = answers.amountRequested ?? safeMaxPrincipal;
  const recommendedAmount = Math.min(safeMaxPrincipal, requestedAmount);

  const recommendationReason = safeMaxPrincipal >= requestedAmount
    ? `We strongly advise using the Borrower-Safe ceiling (₹${safeMaxPrincipal.toLocaleString('en-IN')}) because lenders push maximum leverage (₹${lenderMaxPrincipal.toLocaleString('en-IN')}) which leaves zero margin for household emergencies or price inflation.`
    : `Your requested loan of ₹${requestedAmount.toLocaleString('en-IN')} exceeds your borrower-safe monthly capacity (₹${safeMaxPrincipal.toLocaleString('en-IN')}). Accepting a lender's looser max (₹${lenderMaxPrincipal.toLocaleString('en-IN')}) risks serious financial strain.`;

  return {
    lenderMaxEligible: lenderMaxPrincipal,
    safeMaxEligible: safeMaxPrincipal,
    recommendedAmount,
    haircutAppliedPct: totalIncomeHaircutPct * 100,
    lenderFOIRCapPct: Math.round(lenderFOIRCap * 100),
    safeFOIRCapPct: Math.round(safeFOIRCap * 100),
    recommendationReason,
    rulesTriggered
  };
}
