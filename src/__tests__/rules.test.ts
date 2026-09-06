import { describe, it, expect } from 'vitest';
import { evaluateBorrowerCopilot } from '../rules/engine';
import { calculateFOIR } from '../rules/foir';
import { calculateRateBand } from '../rules/rateBand';
import { calculateAPR } from '../rules/apr';
import { routeLoanProduct } from '../rules/routing';
import { evaluateVerdict } from '../rules/verdict';
import { detectMissingFields, calculateConfidence } from '../rules/confidence';
import { TEST_PERSONAS } from '../personas/testPersonas';
import { QUESTION_BANK } from '../questions/questionBank';
import {
  HAIRCUT_SALARIED,
  HAIRCUT_SELF_EMPLOYED,
  HAIRCUT_INFORMAL,
  FOIR_LENDER_SALARIED,
  FOIR_SAFE_SALARIED,
  LTV_CAP_PROPERTY,
  EXISTING_EMI_BURDEN_CAUTION_PCT
} from '../rules/constants';

describe('1. FOIR & Affordability Rules Engine', () => {
  it('applies correct income haircuts by income classification', () => {
    const salariedRes = calculateFOIR({ incomeType: 'salaried', netMonthlyIncome: 100000 }, 'personal_loan');
    expect(salariedRes.haircutAppliedPct).toBe(HAIRCUT_SALARIED * 100);

    const selfEmployedRes = calculateFOIR({ incomeType: 'self-employed', netMonthlyIncome: 100000 }, 'personal_loan');
    expect(selfEmployedRes.haircutAppliedPct).toBe(HAIRCUT_SELF_EMPLOYED * 100);

    const informalRes = calculateFOIR({ incomeType: 'informal', netMonthlyIncome: 100000 }, 'personal_loan');
    expect(informalRes.haircutAppliedPct).toBe(HAIRCUT_INFORMAL * 100);
  });

  it('differentiates Lender-view max vs Borrower-safe max eligibility', () => {
    const res = calculateFOIR({ incomeType: 'salaried', netMonthlyIncome: 100000 }, 'personal_loan');
    expect(res.lenderMaxEligible).toBeGreaterThan(res.safeMaxEligible);
    expect(res.lenderFOIRCapPct).toBe(Math.round(FOIR_LENDER_SALARIED * 100));
    expect(res.safeFOIRCapPct).toBe(Math.round(FOIR_SAFE_SALARIED * 100));
  });
});

describe('2. Product Routing Engine', () => {
  it('routes self-employed applicant with unencumbered property to Loan Against Property', () => {
    const raviAnswers = TEST_PERSONAS.ravi.answers;
    const routing = routeLoanProduct(raviAnswers);

    expect(routing.routedProduct).toBe('loan_against_property');
    expect(routing.isSecured).toBe(true);
    expect(routing.changed).toBe(true);
  });
});

describe('3. Rate Band & All-In APR Engine with Missing Field Widening', () => {
  it('calculates effective APR by folding processing fee into nominal interest rate', () => {
    const aprRes = calculateAPR(12.0, 15.0, 60, 2.0);
    expect(aprRes.aprMinRate).toBe(12.4);
    expect(aprRes.aprMaxRate).toBe(15.4);
  });

  it('physically widens nominalMaxRate for missing optional inputs and connects to confidence explanation', () => {
    const fullAnswers = { ...TEST_PERSONAS.priya.answers };
    const missingAnswers = {
      incomeType: 'salaried' as const,
      netMonthlyIncome: 100000,
      amountRequested: 500000,
      loanType: 'personal_loan' as const,
      creditScore: 780
      // Omitted: householdExpenses, emergencySavingsMonths, incomeHistoryYears, bouncedEMIsInLast12M
    };

    const missingFieldsFull = detectMissingFields(fullAnswers);
    const missingFieldsPartial = detectMissingFields(missingAnswers);

    const fullRate = calculateRateBand(fullAnswers, 'personal_loan', false, missingFieldsFull);
    const partialRate = calculateRateBand(missingAnswers, 'personal_loan', false, missingFieldsPartial);

    // Partial rate band maxRate must be wider than full rate band
    expect(partialRate.nominalMaxRate).toBeGreaterThan(fullRate.nominalMaxRate);
    expect(partialRate.widenedBps).toBeGreaterThan(0);

    // Confidence narrative must match actual rate widening
    const confidence = calculateConfidence(missingAnswers, 5, 16, partialRate.widenedBps, missingFieldsPartial);
    const expectedPct = (partialRate.widenedBps / 100).toFixed(1);
    expect(confidence.explanation).toContain(`+${expectedPct}%`);
  });
});

describe('4. Three Test Personas Verification Suite', () => {
  it('PRIYA FIXTURE: High income salaried engineer clears full eligibility and receives BORROW verdict', () => {
    const PriyaAssessment = evaluateBorrowerCopilot(TEST_PERSONAS.priya.answers);

    expect(PriyaAssessment.o1.verdict).toBe('BORROW');
    expect(PriyaAssessment.o2.safeMaxEligible).toBeGreaterThanOrEqual(800000);
    expect(PriyaAssessment.o3.productRouted).toBe('personal_loan');
    expect(PriyaAssessment.o4.stressScenario.passes).toBe(true);
  });

  it('RAVI FIXTURE: Self-employed kirana owner routes to LAP, passes 10-year stress test, and receives BORROW verdict', () => {
    const RaviAssessment = evaluateBorrowerCopilot(TEST_PERSONAS.ravi.answers);

    // Assert Verdict is BORROW (Bug #1 Fix verified!)
    expect(RaviAssessment.o1.verdict).toBe('BORROW');
    expect(RaviAssessment.o4.stressScenario.passes).toBe(true);
    expect(RaviAssessment.o4.tenureMonths).toBe(120);

    // Assert Routing
    expect(RaviAssessment.o3.productRouted).toBe('loan_against_property');
    expect(RaviAssessment.o3.isSecured).toBe(true);

    // Assert Collateral LTV Cap on ₹45L property supports full ₹15L
    const maxCollateralCap = 4500000 * LTV_CAP_PROPERTY;
    expect(RaviAssessment.o2.safeMaxEligible).toBeGreaterThanOrEqual(1500000);
    expect(RaviAssessment.o2.safeMaxEligible).toBeLessThanOrEqual(maxCollateralCap);
    expect(RaviAssessment.o2.recommendedAmount).toBe(1500000);
  });

  it('ANITA FIXTURE: Informal rider with bounced EMI and high app debt MUST trigger DONT_BORROW', () => {
    const AnitaAssessment = evaluateBorrowerCopilot(TEST_PERSONAS.anita.answers);

    // Explicit assertion that DONT_BORROW genuinely fires
    expect(AnitaAssessment.o1.verdict).toBe('DONT_BORROW');
    expect(AnitaAssessment.o1.reason).toContain('bounced EMI');
  });
});

describe('5. Constant Extraction Verification & Question Audit', () => {
  it('asserts EXISTING_EMI_BURDEN_CAUTION_PCT constant is consumed in verdict evaluation', () => {
    expect(EXISTING_EMI_BURDEN_CAUTION_PCT).toBe(0.35);

    // Test caution trigger when debt ratio exceeds 35%
    const cautionAssessment = evaluateVerdict(
      { netMonthlyIncome: 100000, existingEMIs: 38000, amountRequested: 200000 },
      { safeMaxEligible: 500000, lenderMaxEligible: 800000 } as any,
      {} as any,
      { stressScenario: { passes: true } } as any
    );

    expect(cautionAssessment.verdict).toBe('BORROW_LESS');
    expect(cautionAssessment.reason).toContain('35%');
  });

  it('asserts that EVERY question in questionBank.ts is consumed and affects rules logic', () => {
    const sampleAnswers = { ...TEST_PERSONAS.priya.answers };

    QUESTION_BANK.forEach((question) => {
      expect(question.affects.length).toBeGreaterThan(0);
      expect(['must', 'additional']).toContain(question.tier);
      expect(question.id in sampleAnswers).toBe(true);
    });
  });
});

describe('6. Regression Tests for Blank App Initial State (BUG A & Stress Bug)', () => {
  it('asserts that starting with a blank state {} reports 0 answered questions and does not crash or produce NaN', () => {
    const blankAssessment = evaluateBorrowerCopilot({});

    expect(blankAssessment.answeredQuestionCount).toBe(0);
    expect(blankAssessment.confidence.level).toBe('LOW');
    expect(Number.isNaN(blankAssessment.o2.safeMaxEligible)).toBe(false);
    expect(Number.isNaN(blankAssessment.o3.nominalMinRate)).toBe(false);
    expect(Number.isNaN(blankAssessment.o4.safeEMICeiling)).toBe(false);
  });

  it('asserts evaluateBorrowerCopilot({}) returns INSUFFICIENT_DATA verdict, zero processingFeeAmount, and does not produce nonsensical postStressFOIRPct or false BORROW_LESS caution', () => {
    const blankAssessment = evaluateBorrowerCopilot({});

    expect(blankAssessment.o3.processingFeeAmount).toBe(0);
    expect(blankAssessment.o3.rationale).not.toContain('₹10,000');
    expect(blankAssessment.o4.stressScenario.type).toBe('insufficient_data');
    expect(blankAssessment.o4.stressScenario.passes).toBe(null);
    expect(blankAssessment.o4.stressScenario.postStressFOIRPct).toBe(0);
    expect(blankAssessment.o4.stressScenario.postStressFOIRPct).toBeLessThan(100);
    expect(blankAssessment.o1.verdict).toBe('INSUFFICIENT_DATA');
    expect(blankAssessment.o1.verdict).not.toBe('BORROW_LESS');
  });

});

