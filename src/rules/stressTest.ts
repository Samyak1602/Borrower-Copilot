import { Answers, OutputO4_EMISafety, OutputO2_Eligibility, OutputO3_RateBand, TenureTradeoff, RuleMetadata } from './types';
import { calculateEMIFromPrincipal } from './foir';
import {
  STRESS_INCOME_DROP_PCT,
  DEFAULT_TENURE_MONTHS,
  DEFAULT_TENURE_MONTHS_LAP,
  TENURE_TRADE_OFF_YEARS,
  ILLUSTRATIVE_TENURE_PREVIEW_AMOUNT
} from './constants';

/**
 * Pure function: Calculates safe EMI ceiling, tenure trade-offs, and runs economic stress test.
 * 
 * Uses product-appropriate tenure (120 months for LAP, 60 for PL) so collateralized product EMIs
 * reflect true long-term repayment terms.
 */
export function runStressTest(
  answers: Answers,
  eligibility: OutputO2_Eligibility,
  rateBand: OutputO3_RateBand
): OutputO4_EMISafety {
  const rulesTriggered: RuleMetadata[] = [];
  const rawIncome = answers.netMonthlyIncome || 0;
  const existingEMIs = answers.existingEMIs || 0;
  const expenses = answers.householdExpenses || 0;
  const amountRequested = answers.amountRequested || 0;
  const actualPrincipal = eligibility.recommendedAmount || amountRequested;
  const annualInterestRate = rateBand.nominalMinRate || 14.0;

  // Product-appropriate tenure (120 months for LAP, 60 for PL/other)
  const productTenureMonths = rateBand.productRouted === 'loan_against_property'
    ? DEFAULT_TENURE_MONTHS_LAP
    : DEFAULT_TENURE_MONTHS;

  // Illustrative preview principal used ONLY for tenure trade-off matrix when borrower amount is unstated
  const previewPrincipal = actualPrincipal > 0 ? actualPrincipal : ILLUSTRATIVE_TENURE_PREVIEW_AMOUNT;

  // Tenure Trade-Off Matrix (3yr, 4yr, 5yr)
  const tenureTradeoffs: TenureTradeoff[] = TENURE_TRADE_OFF_YEARS.map((years) => {
    const months = years * 12;
    const emi = calculateEMIFromPrincipal(previewPrincipal, annualInterestRate, months);
    const totalRepayment = emi * months;
    const totalInterestPaid = Math.max(0, totalRepayment - previewPrincipal);

    return {
      tenureYears: years,
      monthlyEMI: emi,
      totalInterestPaid,
      totalRepayment
    };
  });

  // Guard: Stress test requires both net monthly income > 0 AND loan amount > 0
  const hasSufficientDataForStressTest = amountRequested > 0 && rawIncome > 0;

  if (!hasSufficientDataForStressTest) {
    rulesTriggered.push({
      ruleId: 'INSUFFICIENT_DATA_STRESS_TEST',
      name: 'Insufficient Profile Data for Stress Test',
      thresholdApplied: 'Net monthly income > 0 AND Amount requested > 0',
      description: 'Stress testing requires both net monthly income and requested loan amount.',
      sourceOrJudgement: 'Profile completeness guard.'
    });

    return {
      safeEMICeiling: 0,
      tenureMonths: productTenureMonths,
      tenureTradeoffs,
      stressScenario: {
        type: 'insufficient_data',
        description: 'Answer income and loan amount to run the stress test',
        postStressEMI: 0,
        postStressFOIRPct: 0,
        passes: null,
        warningMessage: ''
      },
      rulesTriggered
    };
  }

  // 1. Calculate Safe EMI Ceiling for requested loan using product tenure
  const proposedNewEMI = calculateEMIFromPrincipal(actualPrincipal, annualInterestRate, productTenureMonths);
  const safeFOIRCapDecimal = eligibility.safeFOIRCapPct / 100;
  const effectiveIncome = (rawIncome * (1 - (eligibility.haircutAppliedPct / 100))) + ((answers.coApplicantIncome || 0) * 0.9);
  const safeEMICeiling = Math.max(0, Math.round(effectiveIncome * safeFOIRCapDecimal - existingEMIs));

  rulesTriggered.push({
    ruleId: 'SAFE_EMI_CEILING_RULE',
    name: 'Borrower-Safe EMI Ceiling',
    thresholdApplied: `Safe FOIR Cap: ${eligibility.safeFOIRCapPct}%, Tenure: ${productTenureMonths}m`,
    description: `Derives maximum safe monthly EMI ceiling of ₹${safeEMICeiling.toLocaleString('en-IN')}/mo based on your haircutted disposable income over ${productTenureMonths / 12} years.`,
    sourceOrJudgement: 'Personal safety debt ceiling rule.'
  });

  // 2. Stress Scenario Simulation: -20% Income Drop Shock
  const stressedIncome = Math.max(1, effectiveIncome * (1 - STRESS_INCOME_DROP_PCT));
  const totalStressedEMI = existingEMIs + proposedNewEMI;
  const postStressFOIRPct = Math.round((totalStressedEMI / stressedIncome) * 100);
  const remainingCashflow = stressedIncome - totalStressedEMI - expenses;

  // Passes if post-stress FOIR is within lender limit and remaining cashflow is non-negative
  const passes = postStressFOIRPct <= eligibility.lenderFOIRCapPct && remainingCashflow >= 0;

  let warningMessage = '';
  if (!passes) {
    if (remainingCashflow < 0) {
      warningMessage = `CRITICAL STRESS WARNING: A ${(STRESS_INCOME_DROP_PCT * 100)}% drop in monthly income leaves your household with a NEGATIVE cashflow deficit of ₹${Math.abs(Math.round(remainingCashflow)).toLocaleString('en-IN')}/mo after basic living expenses and EMIs.`;
    } else {
      warningMessage = `STRESS WARNING: Under a ${(STRESS_INCOME_DROP_PCT * 100)}% income drop scenario, your debt obligations consume ${postStressFOIRPct}% of monthly income (exceeding your safe ceiling of ${eligibility.safeFOIRCapPct}%).`;
    }
  } else {
    warningMessage = `STRESS VERIFIED: Your borrower profile comfortably survives a ${(STRESS_INCOME_DROP_PCT * 100)}% income shock, maintaining a positive buffer of ₹${Math.round(remainingCashflow).toLocaleString('en-IN')}/mo.`;
  }

  rulesTriggered.push({
    ruleId: 'STRESS_TEST_SIMULATION',
    name: '20% Income Drop Stress Test',
    thresholdApplied: `Income drop: -${(STRESS_INCOME_DROP_PCT * 100)}%`,
    description: `Simulates an emergency income reduction to evaluate whether EMI obligations exceed sustainable living thresholds.`,
    sourceOrJudgement: 'Macroeconomic financial stability benchmark.'
  });

  return {
    safeEMICeiling,
    tenureMonths: productTenureMonths,
    tenureTradeoffs,
    stressScenario: {
      type: 'income_drop',
      description: `20% Household Income Drop Simulation (${productTenureMonths / 12}-Yr Term)`,
      postStressEMI: totalStressedEMI,
      postStressFOIRPct,
      passes,
      warningMessage
    },
    rulesTriggered
  };
}

