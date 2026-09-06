import { Answers, OutputO1_Verdict, OutputO2_Eligibility, OutputO3_RateBand, OutputO4_EMISafety, RuleMetadata } from './types';
import {
  EXISTING_EMI_BURDEN_CAUTION_PCT,
  EXISTING_EMI_BURDEN_DANGER_PCT,
  BOUNCED_EMI_HARD_PENALTY,
  MIN_EMERGENCY_SAVINGS_MONTHS
} from './constants';

/**
 * Pure function: Evaluates O1 Verdict (BORROW / BORROW_LESS / DONT_BORROW).
 * 
 * Ensures "DONT_BORROW" genuinely fires for vulnerable or over-indebted applicants
 * like Anita (bounced EMI + high interest app loans + low savings buffer).
 */
export function evaluateVerdict(
  answers: Answers,
  eligibility: OutputO2_Eligibility,
  _rateBand: OutputO3_RateBand,
  stressResult: OutputO4_EMISafety
): OutputO1_Verdict {
  const rulesTriggered: RuleMetadata[] = [];
  const income = answers.netMonthlyIncome || 0;
  const existingEMIs = answers.existingEMIs || 0;
  const expenses = answers.householdExpenses || 0;
  const requestedAmount = answers.amountRequested || 0;
  const bouncedEMI = Boolean(answers.bouncedEMIsInLast12M);
  const highInterestLoans = answers.highInterestLoanCount || 0;
  const savingsMonths = answers.emergencySavingsMonths !== undefined ? answers.emergencySavingsMonths : 3;

  const currentDebtRatio = income > 0 ? existingEMIs / income : 0;
  const netMonthlyBuffer = income - existingEMIs - expenses;

  // --------------------------------------------------------------------------
  // CONDITION 0: INSUFFICIENT DATA (Blank or incomplete profile)
  // --------------------------------------------------------------------------
  if (income <= 0 || requestedAmount <= 0) {
    rulesTriggered.push({
      ruleId: 'INSUFFICIENT_DATA_VERDICT_RULE',
      name: 'Insufficient Profile Data',
      thresholdApplied: 'Net monthly income > 0 AND Amount requested > 0',
      description: 'Cannot evaluate borrowing verdict without net monthly income and requested loan amount.',
      sourceOrJudgement: 'Profile completeness requirement.'
    });

    return {
      verdict: 'INSUFFICIENT_DATA',
      reason: 'INSUFFICIENT DATA: Please answer your net monthly income and requested loan amount to calculate your borrowing verdict.',
      rulesTriggered
    };
  }

  // --------------------------------------------------------------------------
  // CONDITION 1: HARD DECLINE -> DONT_BORROW (Anita's Fixture Scenario)
  // --------------------------------------------------------------------------
  
  // Rule 1A: Bounced EMI combined with high existing debt or high-cost app loans
  if (bouncedEMI && BOUNCED_EMI_HARD_PENALTY && (currentDebtRatio >= EXISTING_EMI_BURDEN_CAUTION_PCT || highInterestLoans > 0 || savingsMonths < MIN_EMERGENCY_SAVINGS_MONTHS)) {
    rulesTriggered.push({
      ruleId: 'BOUNCED_EMI_HIGH_RISK_RULE',
      name: 'Bounced EMI & High-Cost Debt Trap Rule',
      thresholdApplied: `Bounced EMI: Yes, Debt ratio: ${(currentDebtRatio * 100).toFixed(0)}%, High-cost loans: ${highInterestLoans}`,
      description: 'A recent bounced payment combined with high-interest app loans or thin emergency savings indicates severe debt distress.',
      sourceOrJudgement: 'Lender credit policy hard rejection standard.'
    });

    return {
      verdict: 'DONT_BORROW',
      reason: `DO NOT BORROW: You have a recent bounced EMI, ${highInterestLoans > 0 ? `${highInterestLoans} high-interest app loan(s)` : 'high existing debt'}, and only ${savingsMonths} month(s) of savings buffer — taking another loan will likely trigger a debt trap.`,
      rulesTriggered
    };
  }

  // Rule 1B: Deficit Cashflow (Already negative disposable income)
  if (income > 0 && netMonthlyBuffer <= 0) {
    rulesTriggered.push({
      ruleId: 'CASHFLOW_DEFICIT_RULE',
      name: 'Monthly Disposable Income Deficit',
      thresholdApplied: `Buffer: -₹${Math.abs(netMonthlyBuffer).toLocaleString('en-IN')}/mo`,
      description: 'Your existing EMIs and living expenses already exceed your net monthly income.',
      sourceOrJudgement: 'Basic household solvency standard.'
    });

    return {
      verdict: 'DONT_BORROW',
      reason: `DO NOT BORROW: Your existing monthly EMIs (₹${existingEMIs.toLocaleString('en-IN')}) and household expenses (₹${expenses.toLocaleString('en-IN')}) already consume more than your total net income (₹${income.toLocaleString('en-IN')}).`,
      rulesTriggered
    };
  }

  // Rule 1C: Extreme Debt Burden (Existing EMIs >= 50% of income)
  if (currentDebtRatio >= EXISTING_EMI_BURDEN_DANGER_PCT) {
    rulesTriggered.push({
      ruleId: 'EXTREME_DEBT_BURDEN_RULE',
      name: '50%+ Existing Debt Obligation Ceiling',
      thresholdApplied: `FOIR: ${(currentDebtRatio * 100).toFixed(0)}% (>= ${(EXISTING_EMI_BURDEN_DANGER_PCT * 100)}%)`,
      description: 'Existing loan EMIs already consume 50% or more of net monthly income.',
      sourceOrJudgement: 'Bureau over-indebtedness indicators.'
    });

    return {
      verdict: 'DONT_BORROW',
      reason: `DO NOT BORROW: Existing loan commitments already swallow ${(currentDebtRatio * 100).toFixed(0)}% of your monthly earnings, exceeding the maximum safe insolvency limit.`,
      rulesTriggered
    };
  }

  // --------------------------------------------------------------------------
  // CONDITION 2: CAUTIONARY REDUCTION -> BORROW_LESS
  // --------------------------------------------------------------------------

  const isAmountOverSafe = requestedAmount > eligibility.safeMaxEligible;
  const isStressFailed = stressResult.stressScenario.passes === false;


  if (isAmountOverSafe || isStressFailed || currentDebtRatio > EXISTING_EMI_BURDEN_CAUTION_PCT) {
    let reason = '';
    if (isAmountOverSafe) {
      reason = `BORROW LESS: Your requested loan of ₹${requestedAmount.toLocaleString('en-IN')} exceeds your borrower-safe ceiling of ₹${eligibility.safeMaxEligible.toLocaleString('en-IN')}. Reduce your borrow request to avoid financial strain.`;
      rulesTriggered.push({
        ruleId: 'CAPACITY_EXCEEDED_RULE',
        name: 'Requested Amount Exceeds Borrower-Safe Capacity',
        thresholdApplied: `Requested: ₹${requestedAmount.toLocaleString('en-IN')} > Safe: ₹${eligibility.safeMaxEligible.toLocaleString('en-IN')}`,
        description: 'Limits recommended loan amount to borrower-safe FOIR capacity.',
        sourceOrJudgement: 'Borrower protection safety limit.'
      });
    } else if (isStressFailed) {
      reason = `BORROW LESS: Your current profile breaks under a 20% income shock simulation. We recommend borrowing a smaller amount to protect your emergency buffer.`;
      rulesTriggered.push({
        ruleId: 'STRESS_TEST_FAILURE_RULE',
        name: 'Income Shock Stress Failure',
        thresholdApplied: `Post-stress FOIR: ${stressResult.stressScenario.postStressFOIRPct}%`,
        description: 'Triggers caution when household cashflow fails economic stress simulation.',
        sourceOrJudgement: 'Financial resiliency threshold.'
      });
    } else {
      reason = `BORROW LESS: With existing EMIs already using ${(currentDebtRatio * 100).toFixed(0)}% of income (exceeding caution threshold of ${(EXISTING_EMI_BURDEN_CAUTION_PCT * 100)}%), capping your new loan request protects your monthly savings.`;
      rulesTriggered.push({
        ruleId: 'CAUTIONARY_DEBT_RATIO_RULE',
        name: 'Cautionary Debt Ratio Ceiling',
        thresholdApplied: `FOIR: ${(currentDebtRatio * 100).toFixed(0)}% (> ${(EXISTING_EMI_BURDEN_CAUTION_PCT * 100)}%)`,
        description: 'Applies caution when existing debt obligations consume more than 35% of monthly income.',
        sourceOrJudgement: 'Retail lending risk indicator.'
      });
    }

    return {
      verdict: 'BORROW_LESS',
      reason,
      rulesTriggered
    };
  }

  // --------------------------------------------------------------------------
  // CONDITION 3: FULL APPROVAL -> BORROW
  // --------------------------------------------------------------------------

  rulesTriggered.push({
    ruleId: 'SOLVENT_BORROWER_APPROVAL',
    name: 'Solvent Borrower Approval Criteria',
    thresholdApplied: `Safe capacity: ₹${eligibility.safeMaxEligible.toLocaleString('en-IN')}, Stress test: Passed`,
    description: 'Borrower maintains strong cashflow buffer, clean payment history, and adequate debt headroom.',
    sourceOrJudgement: 'Standard retail loan approval logic.'
  });

  return {
    verdict: 'BORROW',
    reason: `YOU CAN BORROW: Your requested loan of ₹${requestedAmount.toLocaleString('en-IN')} is well within your safe ceiling of ₹${eligibility.safeMaxEligible.toLocaleString('en-IN')} and comfortably passes all income stress tests.`,
    rulesTriggered
  };
}
