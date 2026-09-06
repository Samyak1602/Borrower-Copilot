import { Answers, OverallAssessment } from './types';
import { routeLoanProduct } from './routing';
import { calculateFOIR } from './foir';
import { calculateRateBand } from './rateBand';
import { runStressTest } from './stressTest';
import { evaluateVerdict } from './verdict';
import { detectMissingFields, calculateConfidence } from './confidence';
import { getApplicableQuestions } from '../questions/flowEngine';

/**
 * Pure Master Evaluator: (answers, priorContext) => OverallAssessment
 * 
 * Clean 7-step Data Flow Architecture:
 * 1. detectMissingFields(answers) -> missingFields
 * 2. routeLoanProduct(answers) -> routing
 * 3. calculateRateBand(answers, product, isSecured, missingFields) -> o3 (includes widenedBps)
 * 4. calculateFOIR(answers, product, o3.nominalMinRate) -> o2
 * 5. runStressTest(answers, o2, o3) -> o4 (uses product tenure)
 * 6. evaluateVerdict(answers, o2, o3, o4) -> o1
 * 7. calculateConfidence(answers, count, total, o3.widenedBps, missingFields) -> confidence
 */
export function evaluateBorrowerCopilot(
  answers: Answers,
  answeredQuestionIds: string[] = []
): OverallAssessment {
  // Step 1: Detect missing optional fields
  const missingFields = detectMissingFields(answers);

  // Step 2: Secured vs Unsecured Product Selection Logic
  const routing = routeLoanProduct(answers);

  // Step 3: Interest Rate Band & All-In APR Engine (O3) with missingFields range widening
  const o3 = calculateRateBand(answers, routing.routedProduct, routing.isSecured, missingFields);

  // Step 4: Affordability Engine (O2: Eligibility) using routed nominal min rate
  const o2 = calculateFOIR(answers, routing.routedProduct, o3.nominalMinRate);

  // Step 5: Safe EMI Ceiling & Economic Stress Test Engine (O4) using product-appropriate tenure
  const o4 = runStressTest(answers, o2, o3);

  // Step 6: Verdict Engine (O1)
  const o1 = evaluateVerdict(answers, o2, o3, o4);

  // Step 7: Confidence Engine & Range Widening Narrative using exact o3.widenedBps
  const answeredCount = answeredQuestionIds.length > 0
    ? answeredQuestionIds.length
    : Object.keys(answers).filter(k => answers[k] !== undefined).length;
  const totalApplicableQuestions = getApplicableQuestions(answers).length;
  const confidence = calculateConfidence(
    answers,
    answeredCount,
    totalApplicableQuestions,
    o3.widenedBps,
    missingFields
  );


  return {
    o1,
    o2,
    o3,
    o4,
    confidence,
    answeredQuestionCount: answeredCount,
    totalApplicableQuestions,
    answers
  };
}
