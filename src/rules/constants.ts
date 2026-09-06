/**
 * BORROWER COPILOT — DOMAIN CONSTANTS & RULES REGISTRY
 * 
 * HARD ARCHITECTURAL REQUIREMENT:
 * Every threshold, ratio, haircut, rate band, fee percentage, and cutoff
 * used anywhere in the application MUST be exported from this single file.
 * No UI component or helper file may hardcode any numeric threshold.
 * 
 * Format for inline documentation:
 * VALUE: [numerical / string value]
 * WHY: [underwriting rationale]
 * SOURCE: [regulatory rule / bank standard / "judgement"]
 */

// ============================================================================
// 1. INCOME HAIRCUTS & VERIFICATION ADJUSTMENTS
// ============================================================================

/**
 * VALUE: 0.00 (0% haircut)
 * WHY: Salaried income from MNCs/formal employment is directly bank-credited and stable.
 * SOURCE: RBI Retail Lending Guidelines & standard bank underwriting.
 */
export const HAIRCUT_SALARIED = 0.00;

/**
 * VALUE: 0.25 (25% haircut)
 * WHY: Self-employed cash income and ITR turnover carry seasonal variance and informal overheads.
 * SOURCE: Standard Indian MSME / Kirana underwriting practice (SBI / HDFC SME policy).
 */
export const HAIRCUT_SELF_EMPLOYED = 0.25;

/**
 * VALUE: 0.40 (40% haircut)
 * WHY: Informal income (gig riders, tailoring, cash-in-hand) lacks audit trail and formal contracts.
 * SOURCE: Microfinance / informal sector risk policy ("judgement").
 */
export const HAIRCUT_INFORMAL = 0.40;

/**
 * VALUE: 0.10 (10% haircut)
 * WHY: Secondary co-applicant income is factored conservatively to account for joint dependency risks.
 * SOURCE: Retail joint-applicant underwriting standards.
 */
export const HAIRCUT_CO_APPLICANT = 0.10;

/**
 * VALUE: 30 (% of income)
 * WHY: Variable income (commissions/bonuses) exceeding 30% of total pay increases default risk during lean months.
 * SOURCE: Bank variable compensation risk rule.
 */
export const VARIABLE_INCOME_HIGH_THRESHOLD_PCT = 30;

/**
 * VALUE: 0.10 (10% extra haircut)
 * WHY: Applied to variable income portion if variable share exceeds 30%.
 * SOURCE: Underwriting conservatism ("judgement").
 */
export const VARIABLE_INCOME_EXTRA_HAIRCUT = 0.10;

/**
 * VALUE: 5 (years)
 * WHY: Borrowers with 5+ years of continuous income history demonstrate lower turnover and higher resilience.
 * SOURCE: Bureau stability scoring benchmark.
 */
export const INCOME_STABILITY_BONUS_YEARS = 5;

/**
 * VALUE: 0.03 (3% FOIR bonus)
 * WHY: Grants a 3% FOIR cap increase for verified income stability >= 5 years.
 * SOURCE: Underwriting preference ("judgement").
 */
export const FOIR_STABILITY_BONUS_PCT = 0.03;


// ============================================================================
// 2. FOIR (FIXED OBLIGATION TO INCOME RATIO) CAPS
// ============================================================================

/**
 * VALUE: 0.55 (55%)
 * WHY: Typical lender policy allows salaried individuals up to 55% FOIR before declining.
 * SOURCE: HDFC Bank / ICICI Personal Loan policy manual.
 */
export const FOIR_LENDER_SALARIED = 0.55;

/**
 * VALUE: 0.45 (45%)
 * WHY: Borrower-safe limit reserves 55% for rent, utilities, food, healthcare, and savings.
 * SOURCE: Personal financial planning best practices ("judgement").
 */
export const FOIR_SAFE_SALARIED = 0.45;

/**
 * VALUE: 0.50 (50%)
 * WHY: Lenders restrict self-employed borrowers to 50% FOIR due to working capital swings.
 * SOURCE: SBI MSME underwriting framework.
 */
export const FOIR_LENDER_SELF_EMPLOYED = 0.50;

/**
 * VALUE: 0.40 (40%)
 * WHY: Borrower-safe limit for self-employed to preserve cash reserves for business shocks.
 * SOURCE: SME risk management ("judgement").
 */
export const FOIR_SAFE_SELF_EMPLOYED = 0.40;

/**
 * VALUE: 0.40 (40%)
 * WHY: Lenders cap informal borrowers at 40% FOIR due to high historical default rates.
 * SOURCE: NBFC micro-lending risk policy.
 */
export const FOIR_LENDER_INFORMAL = 0.40;

/**
 * VALUE: 0.30 (30%)
 * WHY: Strict safe limit for informal households with volatile daily income and minimal safety net.
 * SOURCE: Financial inclusion safety standard ("judgement").
 */
export const FOIR_SAFE_INFORMAL = 0.30;

/**
 * VALUE: 30000 (INR/month)
 * WHY: Households earning net monthly income below ₹30,000 spend a larger % on basic essentials.
 * SOURCE: RBI Low-Income Household definition benchmark.
 */
export const LOW_INCOME_BRACKET_THRESHOLD = 30000;

/**
 * VALUE: 0.05 (5% FOIR tightening)
 * WHY: Reduces FOIR cap by 5% for borrowers earning under ₹30,000/month to prevent living squeeze.
 * SOURCE: Reserve Bank of India Microfinance Fair Practices Code.
 */
export const LOW_INCOME_FOIR_TIGHTENING = 0.05;


// ============================================================================
// 3. SECURED LOAN ROUTING & COLLATERAL LTV CAPS
// ============================================================================

/**
 * VALUE: 0.65 (65% LTV)
 * WHY: Lenders approve Loan Against Property up to 65% of unencumbered market value.
 * SOURCE: RBI Master Direction on Housing & Property Loans.
 */
export const LTV_CAP_PROPERTY = 0.65;

/**
 * VALUE: 0.75 (75% LTV)
 * WHY: Gold loans are capped at 75% of market value of pledged 22k/24k gold.
 * SOURCE: RBI Regulatory LTV Ceiling on Gold Loans.
 */
export const LTV_CAP_GOLD = 0.75;

/**
 * VALUE: 250 (bps / 2.50%)
 * WHY: Pledging property or gold lowers lender default loss, yielding a ~2.5% rate discount.
 * SOURCE: Indian retail banking rate card differential.
 */
export const SECURED_RATE_DISCOUNT_BPS = 250;

/**
 * VALUE: 300 (bps / 3.00%)
 * WHY: Unsecured loans without credit history incur a risk surcharge for lack of bureau record.
 * SOURCE: Risk-based pricing underwriting manual ("judgement").
 */
export const UNSECURED_NO_SCORE_PENALTY_BPS = 300;


// ============================================================================
// 4. INTEREST RATE BANDS & PROCESSING FEES
// ============================================================================

/**
 * Base nominal rate ranges (Min %, Max %) by product category and credit score tier.
 * SOURCE: Aggregate Indian market data (Public Banks, Private Banks, NBFCs Q3 2025).
 */
export const BASE_RATES = {
  personal_loan: {
    excellent: { min: 10.5, max: 13.0 }, // Credit Score >= 750
    good:      { min: 13.0, max: 16.5 }, // Credit Score 700-749
    average:   { min: 16.5, max: 24.0 }, // Credit Score < 700
    unknown:   { min: 14.0, max: 21.0 }, // Unknown score: wide range, NOT worst case
  },
  loan_against_property: {
    excellent: { min: 8.5,  max: 10.5 },
    good:      { min: 9.5,  max: 11.5 },
    average:   { min: 11.0, max: 13.5 },
    unknown:   { min: 9.5,  max: 12.5 },
  },
  gold_loan: {
    excellent: { min: 9.0,  max: 11.0 },
    good:      { min: 10.0, max: 12.5 },
    average:   { min: 12.0, max: 15.0 },
    unknown:   { min: 10.5, max: 13.5 },
  },
  two_wheeler: {
    excellent: { min: 11.0, max: 14.0 },
    good:      { min: 14.0, max: 18.0 },
    average:   { min: 18.0, max: 24.0 },
    unknown:   { min: 15.0, max: 21.0 },
  },
  business_loan: {
    excellent: { min: 13.0, max: 16.0 },
    good:      { min: 16.0, max: 20.0 },
    average:   { min: 20.0, max: 26.0 },
    unknown:   { min: 17.0, max: 23.0 },
  },
};

/**
 * VALUE: 200 (bps / 2.00%)
 * WHY: Informal income borrowers face higher verification costs and field audit surcharges.
 * SOURCE: Field underwriting pricing matrix ("judgement").
 */
export const INFORMAL_RATE_PREMIUM_BPS = 200;

/**
 * VALUE: 50 (bps / 0.50%)
 * WHY: Having a written competing offer gives the borrower bargaining leverage for a 0.5% rate reduction.
 * SOURCE: Retail loan negotiation dynamics ("judgement").
 */
export const COMPETING_OFFER_DISCOUNT_BPS = 50;

/**
 * VALUE: 2.0 (% of loan principal)
 * WHY: Standard upfront processing fee for unsecured personal loans.
 * SOURCE: Typical bank schedule of charges (1.5% - 2.5% + GST).
 */
export const PROCESSING_FEE_PCT_UNSECURED = 2.0;

/**
 * VALUE: 1.0 (% of loan principal)
 * WHY: Processing fee for property/gold collateralized loans is lower due to asset backing.
 * SOURCE: Standard LAP schedule of charges (0.5% - 1.5% + GST).
 */
export const PROCESSING_FEE_PCT_SECURED = 1.0;


// ============================================================================
// 5. TENURE, STRESS TESTING & EMI CALCULATIONS
// ============================================================================

/**
 * VALUE: 60 (months / 5 years)
 * WHY: Standard benchmark tenure for medium-term personal and LAP loans.
 * SOURCE: Retail credit industry standard.
 */
export const DEFAULT_TENURE_MONTHS = 60;

/**
 * VALUE: 120 (months / 10 years)
 * WHY: Loan Against Property (LAP) is a long-term collateralized facility allowing 10-15 year terms.
 * SOURCE: Indian retail LAP product standards (HDFC / SBI LAP guidelines).
 */
export const DEFAULT_TENURE_MONTHS_LAP = 120;

/**
 * VALUE: [3, 4, 5] (years)
 * WHY: Common tenure options evaluated in trade-off matrix to show total interest impact.
 * SOURCE: Borrower decision matrix ("judgement").
 */
export const TENURE_TRADE_OFF_YEARS = [3, 4, 5];

/**
 * VALUE: 0.20 (20% income reduction)
 * WHY: Simulates job shock, medical emergency, or income drop to test EMI survivability.
 * SOURCE: Household financial stress test standard ("judgement").
 */
export const STRESS_INCOME_DROP_PCT = 0.20;

/**
 * VALUE: 500000 (INR)
 * WHY: Illustrative fallback loan amount used ONLY for generating preview rows in tenureTradeoffs table when borrower profile is blank/incomplete. Must never feed into actual stress pass/fail or verdict.
 * SOURCE: UI preview reference standard ("judgement").
 */
export const ILLUSTRATIVE_TENURE_PREVIEW_AMOUNT = 500000;



// ============================================================================
// 6. VERDICT ENGINE (O1) HARD DECLINE & CAUTION CUTOFFS
// ============================================================================

/**
 * VALUE: 24.0 (% per annum)
 * WHY: Interest rates above 24% indicate predatory loan app debt that traps vulnerable borrowers.
 * SOURCE: Reserve Bank of India Digital Lending Guidelines (Fair Practices Code).
 */
export const HIGH_COST_DEBT_THRESHOLD_RATE = 24.0;

/**
 * VALUE: 0.35 (35% FOIR)
 * WHY: Existing EMIs consuming >35% of net income indicate an elevated debt burden, triggering caution.
 * SOURCE: Retail lending risk indicator.
 */
export const EXISTING_EMI_BURDEN_CAUTION_PCT = 0.35;

/**
 * VALUE: 0.50 (50% FOIR)
 * WHY: If existing EMIs already consume >= 50% of income, adding a new loan is extremely unsafe.
 * SOURCE: Credit bureau over-indebtedness indicator.
 */
export const EXISTING_EMI_BURDEN_DANGER_PCT = 0.50;

/**
 * VALUE: true
 * WHY: A bounced EMI in the last 12 months indicates immediate liquidity distress.
 * SOURCE: Lender hard-decline policy for retail credit.
 */
export const BOUNCED_EMI_HARD_PENALTY = true;

/**
 * VALUE: 3 (months of expenses)
 * WHY: Having less than 3 months of emergency savings exposes borrower to default upon minor shocks.
 * SOURCE: Personal finance safety benchmark.
 */
export const MIN_EMERGENCY_SAVINGS_MONTHS = 3;


// ============================================================================
// 7. CONFIDENCE ENGINE & BAND WIDENING RATIONALE
// ============================================================================

/**
 * VALUE: 350 (bps / 3.50% range expansion)
 * WHY: When credit score is unknown, rate range widens by 3.5% to reflect lender uncertainty.
 * SOURCE: Underwriting confidence model ("judgement").
 */
export const UNKNOWN_SCORE_BAND_WIDENING_BPS = 350;

/**
 * VALUE: 75 (bps / 0.75% range expansion per unstated optional question)
 * WHY: Each omitted optional question (living expenses, savings, stability) expands upper rate bound by 0.75%.
 * SOURCE: Confidence range-widening model ("judgement").
 */
export const OPTIONAL_FIELD_MISSING_RATE_WIDENING_BPS = 75;

