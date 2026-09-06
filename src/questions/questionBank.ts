import { QuestionDef } from '../rules/types';

export const QUESTION_BANK: QuestionDef[] = [
  // --------------------------------------------------------------------------
  // MUST-TIER QUESTIONS (~9 core questions)
  // --------------------------------------------------------------------------
  {
    id: 'incomeType',
    text: 'What is your primary source of income?',
    helpText: 'Lenders view salaried, self-employed, and informal cash income through different risk lenses.',
    appliesTo: ['all'],
    affects: ['O1', 'O2', 'O3', 'O4'],
    tier: 'must',
    inputType: 'select',
    options: [
      { label: 'Salaried (MNC / Corporate / Govt)', value: 'salaried' },
      { label: 'Self-Employed (Business / Kirana / Shop Owner)', value: 'self-employed' },
      { label: 'Informal / Cash-in-hand (Rider / Tailor / Daily)', value: 'informal' }
    ],
    defaultValue: 'salaried'
  },
  {
    id: 'purpose',
    text: 'What is the primary purpose of this loan?',
    helpText: 'Productive business investments are evaluated differently than consumption or wedding loans.',
    appliesTo: ['all'],
    affects: ['O1', 'O3'],
    tier: 'must',
    inputType: 'select',
    options: [
      { label: 'Wedding / Personal Celebration', value: 'wedding' },
      { label: 'Business Expansion / Shop Stock', value: 'business_expansion' },
      { label: 'Vehicle Purchase (Electric Scooter / Delivery)', value: 'vehicle' },
      { label: 'Debt Consolidation / Refinancing', value: 'debt_consolidation' },
      { label: 'Medical / Family Emergency', value: 'medical' }
    ],
    defaultValue: 'wedding'
  },
  {
    id: 'amountRequested',
    text: 'How much total money do you want to borrow?',
    helpText: 'Enter the exact principal amount in Rupees (₹).',
    appliesTo: ['all'],
    affects: ['O1', 'O2', 'O4'],
    tier: 'must',
    inputType: 'currency',
    min: 10000,
    max: 10000000,
    step: 10000,
    defaultValue: 500000,
    placeholder: 'e.g., 800000'
  },
  {
    id: 'loanType',
    text: 'What category of loan product are you seeking?',
    helpText: 'Selecting a secured product backed by collateral unlocks substantially lower interest rates.',
    appliesTo: ['all'],
    affects: ['O2', 'O3', 'O4'],
    tier: 'must',
    inputType: 'select',
    options: [
      { label: 'Personal Loan (Unsecured)', value: 'personal_loan' },
      { label: 'Loan Against Property (LAP - Secured)', value: 'loan_against_property' },
      { label: 'Gold Loan (Secured)', value: 'gold_loan' },
      { label: 'Two-Wheeler / Vehicle Loan', value: 'two_wheeler' },
      { label: 'Business Loan', value: 'business_loan' }
    ],
    defaultValue: 'personal_loan'
  },
  {
    id: 'netMonthlyIncome',
    text: 'What is your net monthly take-home income?',
    helpText: 'Actual cash/salary credited into your account per month after taxes.',
    appliesTo: ['all'],
    affects: ['O1', 'O2', 'O4'],
    tier: 'must',
    inputType: 'currency',
    min: 5000,
    max: 2000000,
    step: 5000,
    defaultValue: 60000,
    placeholder: 'e.g., 110000'
  },
  {
    id: 'existingEMIs',
    text: 'What is the sum of all your existing monthly loan EMIs?',
    helpText: 'Include credit card minimum payments, car loans, home loans, and app loans.',
    appliesTo: ['all'],
    affects: ['O1', 'O2', 'O4'],
    tier: 'must',
    inputType: 'currency',
    min: 0,
    max: 1000000,
    step: 1000,
    defaultValue: 0,
    placeholder: 'e.g., 14000'
  },
  {
    id: 'householdExpenses',
    text: 'What are your monthly household living expenses?',
    helpText: 'Rent, groceries, school fees, utilities, and essential family spending.',
    appliesTo: ['all'],
    affects: ['O1', 'O4'],
    tier: 'must',
    inputType: 'currency',
    min: 0,
    max: 1000000,
    step: 1000,
    defaultValue: 25000,
    placeholder: 'e.g., 28000'
  },
  {
    id: 'creditScore',
    text: 'What is your Credit Bureau Score (CIBIL / Experian)?',
    helpText: 'Select "I don\'t know" if you have no formal credit history or haven\'t checked.',
    appliesTo: ['all'],
    affects: ['O1', 'O3'],
    tier: 'must',
    inputType: 'select',
    options: [
      { label: '750 or higher (Excellent credit)', value: 780 },
      { label: '700 to 749 (Good credit)', value: 720 },
      { label: 'Below 700 (Fair / Poor credit)', value: 650 },
      { label: "I don't know / No credit history", value: 'unknown' }
    ],
    defaultValue: 780
  },
  {
    id: 'age',
    text: 'What is your age in years?',
    helpText: 'Lenders evaluate remaining career horizon and max eligible tenure.',
    appliesTo: ['all'],
    affects: ['O2', 'O4'],
    tier: 'must',
    inputType: 'number',
    min: 18,
    max: 75,
    defaultValue: 32,
    placeholder: 'e.g., 29'
  },

  // --------------------------------------------------------------------------
  // ADDITIONAL-TIER QUESTIONS (8 questions, every one demonstrably affects /rules)
  // --------------------------------------------------------------------------
  {
    id: 'incomeHistoryYears',
    text: 'How many continuous years have you been in your current job or business?',
    helpText: 'Demonstrating 5+ years of continuous stability unlocks a 3% FOIR capacity bonus.',
    appliesTo: ['salaried', 'self-employed'],
    affects: ['O2'],
    tier: 'additional',
    inputType: 'number',
    min: 0,
    max: 50,
    defaultValue: 3,
    unit: 'years'
  },
  {
    id: 'variableIncomeSharePct',
    text: 'What percentage of your total income is variable or commission-based?',
    helpText: 'Variable share above 30% triggers an extra 10% safety haircut.',
    appliesTo: ['salaried', 'self-employed'],
    affects: ['O2'],
    tier: 'additional',
    inputType: 'number',
    min: 0,
    max: 100,
    defaultValue: 0,
    unit: '%'
  },
  {
    id: 'highInterestLoanCount',
    text: 'How many high-interest digital app loans (30%+ interest) do you have outstanding?',
    helpText: 'High-cost loan stacking is a key warning sign that triggers a "DO NOT BORROW" verdict.',
    appliesTo: ['all'],
    affects: ['O1'],
    tier: 'additional',
    inputType: 'number',
    min: 0,
    max: 10,
    defaultValue: 0
  },
  {
    id: 'bouncedEMIsInLast12M',
    text: 'Have you missed or bounced any EMI payment in the last 12 months?',
    helpText: 'A bounced EMI indicates recent cashflow distress and triggers hard safety rejections.',
    appliesTo: ['all'],
    affects: ['O1'],
    tier: 'additional',
    inputType: 'radio',
    options: [
      { label: 'Yes, I had a bounced EMI', value: true },
      { label: 'No, perfect payment history', value: false }
    ],
    defaultValue: false
  },
  {
    id: 'emergencySavingsMonths',
    text: 'How many months of expenses do you hold in emergency cash/savings?',
    helpText: 'Having under 3 months of emergency buffer flags vulnerability during economic shocks.',
    appliesTo: ['all'],
    affects: ['O1', 'O4'],
    tier: 'additional',
    inputType: 'number',
    min: 0,
    max: 36,
    defaultValue: 3,
    unit: 'months'
  },
  {
    id: 'collateralValue',
    text: 'What is the estimated market value of unencumbered property or gold you own?',
    helpText: 'Providing property or gold collateral routes your loan to LAP/Gold Loan, bypassing credit score limits.',
    appliesTo: ['all'],
    affects: ['O2', 'O3'],
    tier: 'additional',
    inputType: 'currency',
    min: 0,
    max: 50000000,
    step: 50000,
    defaultValue: 0,
    placeholder: 'e.g., 4500000'
  },
  {
    id: 'coApplicantIncome',
    text: 'What is your co-applicant\'s net monthly income (if adding spouse/parent)?',
    helpText: 'Co-applicant income is factored into effective household repayment capacity.',
    appliesTo: ['all'],
    affects: ['O2', 'O4'],
    tier: 'additional',
    inputType: 'currency',
    min: 0,
    max: 1000000,
    step: 5000,
    defaultValue: 0,
    placeholder: 'e.g., 18000'
  },
  {
    id: 'competingRateOffer',
    text: 'What is the lowest interest rate offer you have received from another bank (if any)?',
    helpText: 'Providing a competing offer unlocks a 0.50% interest rate negotiation floor discount.',
    appliesTo: ['all'],
    affects: ['O3'],
    tier: 'additional',
    inputType: 'number',
    min: 5,
    max: 30,
    step: 0.1,
    defaultValue: 0,
    unit: '%'
  }
];
