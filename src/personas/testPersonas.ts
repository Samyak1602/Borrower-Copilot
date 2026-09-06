import { Answers } from '../rules/types';

export interface PersonaFixture {
  id: string;
  name: string;
  age: number;
  location: string;
  occupation: string;
  summary: string;
  expectedVerdict: 'BORROW' | 'BORROW_LESS' | 'DONT_BORROW';
  expectedRouting: string;
  answers: Answers;
}

export const TEST_PERSONAS: Record<string, PersonaFixture> = {
  priya: {
    id: 'priya',
    name: 'Priya',
    age: 29,
    location: 'Bengaluru',
    occupation: 'Salaried — MNC Software Engineer (5 yrs)',
    summary: 'High income, clean CIBIL 780, existing ₹14k car loan EMI. Wants ₹8L for wedding.',
    expectedVerdict: 'BORROW',
    expectedRouting: 'personal_loan',
    answers: {
      incomeType: 'salaried',
      purpose: 'wedding',
      amountRequested: 800000,
      loanType: 'personal_loan',
      netMonthlyIncome: 110000,
      existingEMIs: 14000,
      householdExpenses: 28000,
      creditScore: 780,
      age: 29,
      incomeHistoryYears: 5,
      variableIncomeSharePct: 10,
      highInterestLoanCount: 0,
      bouncedEMIsInLast12M: false,
      emergencySavingsMonths: 6,
      collateralValue: 0,
      collateralType: 'none',
      coApplicantIncome: 0,
      competingRateOffer: 11.2
    }
  },

  ravi: {
    id: 'ravi',
    name: 'Ravi',
    age: 42,
    location: 'Mysuru',
    occupation: 'Self-Employed — Kirana Store Owner (14 yrs)',
    summary: 'Cash income ₹60k/mo, owns shop premises ₹45L unencumbered. No credit score. Wife earns ₹18k teaching. Wants ₹15L stock + vehicle.',
    expectedVerdict: 'BORROW',
    expectedRouting: 'loan_against_property',
    answers: {
      incomeType: 'self-employed',
      purpose: 'business_expansion',
      amountRequested: 1500000,
      loanType: 'personal_loan', // Engine MUST route to loan_against_property
      netMonthlyIncome: 60000,
      existingEMIs: 0,
      householdExpenses: 22000,
      creditScore: 'unknown',
      age: 42,
      incomeHistoryYears: 14,
      variableIncomeSharePct: 20,
      highInterestLoanCount: 0,
      bouncedEMIsInLast12M: false,
      emergencySavingsMonths: 4,
      collateralValue: 4500000,
      collateralType: 'property',
      coApplicantIncome: 18000,
      competingRateOffer: 0
    }
  },

  anita: {
    id: 'anita',
    name: 'Anita',
    age: 35,
    location: 'Hubballi',
    occupation: 'Informal — Delivery Rider & Home Tailor',
    summary: '₹28k/mo cash income, husband unemployed, 3 app loans at 30%+, 1 bounced EMI last month. Wants ₹1.5L for electric scooter.',
    expectedVerdict: 'DONT_BORROW',
    expectedRouting: 'two_wheeler',
    answers: {
      incomeType: 'informal',
      purpose: 'vehicle',
      amountRequested: 150000,
      loanType: 'two_wheeler',
      netMonthlyIncome: 28000,
      existingEMIs: 9500,
      householdExpenses: 19000,
      creditScore: 640,
      age: 35,
      incomeHistoryYears: 2,
      variableIncomeSharePct: 50,
      highInterestLoanCount: 3,
      bouncedEMIsInLast12M: true,
      emergencySavingsMonths: 0.5,
      collateralValue: 0,
      collateralType: 'none',
      coApplicantIncome: 0,
      competingRateOffer: 0
    }
  }
};
