export type BorrowerIncomeType = 'salaried' | 'self-employed' | 'informal';

export type LoanProductType = 
  | 'personal_loan' 
  | 'loan_against_property' 
  | 'gold_loan' 
  | 'two_wheeler' 
  | 'business_loan';

export type VerdictType = 'BORROW' | 'BORROW_LESS' | 'DONT_BORROW' | 'INSUFFICIENT_DATA';

export type QuestionAffects = 'O1' | 'O2' | 'O3' | 'O4';
export type QuestionTier = 'must' | 'additional';
export type QuestionInputType = 'select' | 'currency' | 'number' | 'boolean' | 'radio';

export interface QuestionOption {
  label: string;
  value: string | number | boolean;
}

export interface QuestionDef {
  id: string;
  text: string;
  helpText?: string;
  appliesTo: ('salaried' | 'self-employed' | 'informal' | 'all')[];
  affects: QuestionAffects[];
  tier: QuestionTier;
  inputType: QuestionInputType;
  options?: QuestionOption[];
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  unit?: string;
}

export interface Answers {
  purpose?: string;
  amountRequested?: number;
  loanType?: LoanProductType;
  incomeType?: BorrowerIncomeType;
  netMonthlyIncome?: number;
  existingEMIs?: number;
  householdExpenses?: number;
  age?: number;
  creditScore?: number | 'unknown';
  
  // Additional tier fields
  incomeHistoryYears?: number;
  variableIncomeSharePct?: number;
  existingLoanCount?: number;
  highInterestLoanCount?: number;
  totalOutstandingDebt?: number;
  bouncedEMIsInLast12M?: boolean;
  emergencySavingsMonths?: number;
  collateralValue?: number;
  collateralType?: 'property' | 'gold' | 'none';
  coApplicantIncome?: number;
  upcomingLargeExpenses?: number;
  expectedReturnPct?: number;
  competingRateOffer?: number;

  [key: string]: any;
}

export interface RuleMetadata {
  ruleId: string;
  name: string;
  thresholdApplied: string | number;
  description: string;
  sourceOrJudgement: string;
}

export interface OutputO1_Verdict {
  verdict: VerdictType;
  reason: string;
  rulesTriggered: RuleMetadata[];
}

export interface OutputO2_Eligibility {
  lenderMaxEligible: number;
  safeMaxEligible: number;
  recommendedAmount: number;
  haircutAppliedPct: number;
  lenderFOIRCapPct: number;
  safeFOIRCapPct: number;
  recommendationReason: string;
  rulesTriggered: RuleMetadata[];
}

export interface OutputO3_RateBand {
  nominalMinRate: number;
  nominalMaxRate: number;
  aprMinRate: number;
  aprMaxRate: number;
  processingFeePct: number;
  processingFeeAmount: number;
  widenedBps: number;
  rationale: string;
  productRouted: LoanProductType;
  isSecured: boolean;
  rulesTriggered: RuleMetadata[];
}

export interface TenureTradeoff {
  tenureYears: number;
  monthlyEMI: number;
  totalInterestPaid: number;
  totalRepayment: number;
}

export interface OutputO4_EMISafety {
  safeEMICeiling: number;
  tenureMonths: number;
  tenureTradeoffs: TenureTradeoff[];
  stressScenario: {
    type: 'income_drop' | 'rate_rise' | 'insufficient_data';
    description: string;
    postStressEMI: number;
    postStressFOIRPct: number;
    passes: boolean | null;
    warningMessage: string;
  };
  rulesTriggered: RuleMetadata[];
}

export interface ConfidenceAssessment {
  scorePct: number;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  missingOptionalFields: string[];
}


export interface OverallAssessment {
  o1: OutputO1_Verdict;
  o2: OutputO2_Eligibility;
  o3: OutputO3_RateBand;
  o4: OutputO4_EMISafety;
  confidence: ConfidenceAssessment;
  answeredQuestionCount: number;
  totalApplicableQuestions: number;
  answers: Answers;
}
