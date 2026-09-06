import { Answers, LoanProductType, OutputO3_RateBand, RuleMetadata } from './types';
import {
  BASE_RATES,
  UNSECURED_NO_SCORE_PENALTY_BPS,
  SECURED_RATE_DISCOUNT_BPS,
  INFORMAL_RATE_PREMIUM_BPS,
  COMPETING_OFFER_DISCOUNT_BPS,
  PROCESSING_FEE_PCT_UNSECURED,
  PROCESSING_FEE_PCT_SECURED,
  DEFAULT_TENURE_MONTHS,
  UNKNOWN_SCORE_BAND_WIDENING_BPS,
  OPTIONAL_FIELD_MISSING_RATE_WIDENING_BPS
} from './constants';
import { calculateAPR } from './apr';

/**
 * Pure function: Calculates nominal low-high interest rate band and all-in APR.
 * 
 * Applies OPTIONAL_FIELD_MISSING_RATE_WIDENING_BPS (+0.75% per missing optional field) to nominalMaxRate
 * and returns widenedBps so confidence.ts can report the EXACT real rate expansion.
 */
export function calculateRateBand(
  answers: Answers,
  routedProduct: LoanProductType,
  isSecured: boolean,
  missingFields: string[] = []
): OutputO3_RateBand {
  const creditScore = answers.creditScore;
  const incomeType = answers.incomeType || 'salaried';
  const rulesTriggered: RuleMetadata[] = [];

  // 1. Determine Credit Tier
  let creditTier: 'excellent' | 'good' | 'average' | 'unknown' = 'unknown';
  if (typeof creditScore === 'number') {
    if (creditScore >= 750) creditTier = 'excellent';
    else if (creditScore >= 700) creditTier = 'good';
    else creditTier = 'average';
  }

  // 2. Fetch Base Nominal Rates for Product + Tier
  const baseBand = BASE_RATES[routedProduct]?.[creditTier] || BASE_RATES.personal_loan.unknown;
  let minRate = baseBand.min;
  let maxRate = baseBand.max;

  rulesTriggered.push({
    ruleId: 'BASE_PRODUCT_RATE_BAND',
    name: `${routedProduct.replace(/_/g, ' ').toUpperCase()} Base Rate Band`,
    thresholdApplied: `Credit Tier: ${creditTier.toUpperCase()} (${typeof creditScore === 'number' ? creditScore : 'Unknown'})`,
    description: `Establishes starting nominal interest rate band of ${minRate.toFixed(1)}% - ${maxRate.toFixed(1)}%.`,
    sourceOrJudgement: 'Quarterly retail banking rate card benchmarks.'
  });

  // 3. Range Widening for Missing Optional Fields & Unknown Score
  let widenedBps = 0;
  if (creditTier === 'unknown') {
    widenedBps += UNKNOWN_SCORE_BAND_WIDENING_BPS;
  }
  // Exclude credit score from missingFields count if already accounted for
  const optionalMissingCount = missingFields.filter(f => !f.includes('Credit Score')).length;
  widenedBps += optionalMissingCount * OPTIONAL_FIELD_MISSING_RATE_WIDENING_BPS;

  if (widenedBps > 0) {
    const wideningAddonPct = widenedBps / 100;
    maxRate += wideningAddonPct;
    rulesTriggered.push({
      ruleId: 'CONFIDENCE_BAND_WIDENING',
      name: 'Uncertainty Range Widening',
      thresholdApplied: `+${wideningAddonPct.toFixed(2)}% upper rate bound expansion`,
      description: `Widens upper interest rate bound by +${wideningAddonPct.toFixed(2)}% due to missing optional inputs (${optionalMissingCount} field(s)) or unknown credit score.`,
      sourceOrJudgement: 'Confidence range-widening model.'
    });
  }

  // 4. Unsecured No-Score Penalty (+300 bps)
  if (!isSecured && creditTier === 'unknown') {
    const penaltyBps = UNSECURED_NO_SCORE_PENALTY_BPS / 100;
    minRate += penaltyBps;
    maxRate += penaltyBps;
    rulesTriggered.push({
      ruleId: 'UNSECURED_NO_SCORE_PENALTY',
      name: 'Unsecured No-Credit-Score Premium',
      thresholdApplied: `+${penaltyBps.toFixed(1)}% rate penalty`,
      description: `Adds ${penaltyBps.toFixed(1)}% to rate range because unbacked personal loans without bureau score carry higher risk.`,
      sourceOrJudgement: 'Risk-based loan pricing model.'
    });
  }

  // 5. Secured Rate Discount (-250 bps)
  if (isSecured) {
    const discountBps = SECURED_RATE_DISCOUNT_BPS / 100;
    minRate = Math.max(7.5, minRate - discountBps);
    maxRate = Math.max(9.5, maxRate - discountBps);
    rulesTriggered.push({
      ruleId: 'SECURED_RATE_DISCOUNT',
      name: 'Collateral-Backed Rate Discount',
      thresholdApplied: `-${discountBps.toFixed(1)}% rate discount`,
      description: `Applies a ${discountBps.toFixed(1)}% interest discount due to property/gold collateral protection.`,
      sourceOrJudgement: 'Bank collateralized lending rate benefit.'
    });
  }

  // 6. Informal Sector Premium (+200 bps on upper bound)
  if (incomeType === 'informal') {
    const premiumBps = INFORMAL_RATE_PREMIUM_BPS / 100;
    maxRate += premiumBps;
    rulesTriggered.push({
      ruleId: 'INFORMAL_RATE_PREMIUM',
      name: 'Informal Verification Risk Premium',
      thresholdApplied: `+${premiumBps.toFixed(1)}% max rate premium`,
      description: `Expands upper interest cap by ${premiumBps.toFixed(1)}% to account for field verification costs.`,
      sourceOrJudgement: 'Field underwriting pricing matrix.'
    });
  }

  // 7. Competing Offer Leverage Discount (-50 bps on min rate)
  if (answers.competingRateOffer && answers.competingRateOffer > 0) {
    const discountBps = COMPETING_OFFER_DISCOUNT_BPS / 100;
    minRate = Math.max(7.0, minRate - discountBps);
    rulesTriggered.push({
      ruleId: 'COMPETING_OFFER_DISCOUNT',
      name: 'Competing Lender Offer Leverage',
      thresholdApplied: `-${discountBps.toFixed(1)}% negotiation discount`,
      description: `Leverages stated competing offer of ${answers.competingRateOffer}% to lower floor rate target by ${discountBps.toFixed(1)}%.`,
      sourceOrJudgement: 'Borrower negotiation leverage model.'
    });
  }

  // Round rates to 1 decimal place
  minRate = Math.round(minRate * 10) / 10;
  maxRate = Math.round(maxRate * 10) / 10;

  // 8. Processing Fee Calculation
  const feePct = isSecured ? PROCESSING_FEE_PCT_SECURED : PROCESSING_FEE_PCT_UNSECURED;
  const amountRequested = answers.amountRequested || 0;
  const processingFeeAmount = amountRequested > 0 ? Math.round(amountRequested * (feePct / 100)) : 0;

  // 9. Calculate Effective All-In APR
  const aprRange = calculateAPR(minRate, maxRate, DEFAULT_TENURE_MONTHS, feePct);

  const feeText = processingFeeAmount > 0 ? ` (₹${processingFeeAmount.toLocaleString('en-IN')})` : '';

  const rationale = creditTier === 'unknown'
    ? `Since your credit score is unknown, we present a wider nominal band of ${minRate}%–${maxRate}%. Folding in the upfront ${feePct}% processing fee${feeText} brings your true Annual Percentage Rate (APR) to ${aprRange.aprMinRate}%–${aprRange.aprMaxRate}%.`
    : `Based on your ${creditTier.toUpperCase()} credit score (${creditScore}), a fair interest rate target is ${minRate}%–${maxRate}%. Your true All-In APR (including ${feePct}% processing fee${feeText}) is ${aprRange.aprMinRate}%–${aprRange.aprMaxRate}%.`;


  return {
    nominalMinRate: minRate,
    nominalMaxRate: maxRate,
    aprMinRate: aprRange.aprMinRate,
    aprMaxRate: aprRange.aprMaxRate,
    processingFeePct: feePct,
    processingFeeAmount,
    widenedBps,
    rationale,
    productRouted: routedProduct,
    isSecured,
    rulesTriggered
  };
}
