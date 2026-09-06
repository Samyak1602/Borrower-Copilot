import { Answers, LoanProductType, RuleMetadata } from './types';
import { SECURED_RATE_DISCOUNT_BPS, UNSECURED_NO_SCORE_PENALTY_BPS } from './constants';

export interface RoutingResult {
  routedProduct: LoanProductType;
  isSecured: boolean;
  changed: boolean;
  rationale: string;
  rulesTriggered: RuleMetadata[];
}

/**
 * Pure function: Routes borrower to optimal loan product (Secured vs Unsecured).
 * Prevents borrowers without formal credit scores from being penalized when they possess unencumbered collateral.
 */
export function routeLoanProduct(answers: Answers): RoutingResult {
  const requestedProduct = answers.loanType || 'personal_loan';
  const hasCollateral = Boolean(
    (answers.collateralValue && answers.collateralValue > 0) ||
    answers.collateralType === 'property' ||
    answers.collateralType === 'gold'
  );
  
  const isUnknownOrNoScore = answers.creditScore === 'unknown' || typeof answers.creditScore !== 'number';
  const isSelfEmployedOrInformal = answers.incomeType === 'self-employed' || answers.incomeType === 'informal';

  // Defensive check for collateral backing
  if (hasCollateral && (isUnknownOrNoScore || isSelfEmployedOrInformal || requestedProduct === 'loan_against_property')) {
    const isGold = answers.collateralType === 'gold';
    const routedProduct: LoanProductType = isGold ? 'gold_loan' : 'loan_against_property';
    const changed = routedProduct !== requestedProduct;

    const rationale = changed
      ? `Routed to ${isGold ? 'Gold Loan' : 'Loan Against Property'} using unencumbered collateral worth ₹${answers.collateralValue?.toLocaleString('en-IN') || 'available'}. This avoids the +${UNSECURED_NO_SCORE_PENALTY_BPS / 100}% 'no credit score' penalty and unlocks a ${SECURED_RATE_DISCOUNT_BPS / 100}% rate discount.`
      : `Confirmed ${isGold ? 'Gold Loan' : 'Loan Against Property'} product backed by collateral, unlocking lower interest rate bands and higher LTV eligibility caps.`;

    return {
      routedProduct,
      isSecured: true,
      changed,
      rationale,
      rulesTriggered: [
        {
          ruleId: 'SECURED_ROUTING_RULE',
          name: 'Collateral-Backed Product Routing',
          thresholdApplied: `Collateral: ₹${answers.collateralValue || 'Yes'}`,
          description: 'Routes applicants with unencumbered collateral toward secured products to bypass credit score penalties.',
          sourceOrJudgement: 'Lender underwriting best practice for asset-rich borrowers.'
        }
      ]
    };
  }

  // Default: Keep requested product (or personal_loan)
  const isSecuredProduct = requestedProduct === 'loan_against_property' || requestedProduct === 'gold_loan';

  return {
    routedProduct: requestedProduct,
    isSecured: isSecuredProduct,
    changed: false,
    rationale: `Evaluated for ${requestedProduct.replace(/_/g, ' ').toUpperCase()} product based on stated borrower preference.`,
    rulesTriggered: []
  };
}
