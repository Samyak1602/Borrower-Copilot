# PERSONA_RUNS.md — Test Persona Execution & Audit Log

> **Note on provenance**: every number in this document was captured by directly executing
> `evaluateBorrowerCopilot()` against the exact fixtures in `src/personas/testPersonas.ts`,
> not hand-calculated or estimated. See verification methodology at the end of this document.

---

## 1. Priya (Salaried MNC Software Engineer)

### 1.1 Profile & Stated Answers
Age 29, Bengaluru, salaried (MNC, 5 yrs). Net income ₹1,10,000/mo. Existing EMI ₹14,000/mo
(car loan). Household expenses ₹28,000/mo. Credit score 780. Wants ₹8,00,000 personal loan
for a wedding. Optional inputs answered: 10% variable income share, 0 high-interest loans,
no bounced EMIs, 6 months emergency savings, no collateral, competing offer at 11.2%.

### 1.2 Rules Engine Outputs (O1–O4)

| Output | Metric | Value | Rule Reference |
|---|---|---|---|
| **O1 Verdict** | Decision | **`BORROW`** | Safe capacity ₹18,26,136 covers the ₹8L request; stress test passed. |
| **O2 Eligibility** | Lender-View Max | **`₹23,43,855`** | Lender FOIR Cap: 58% (55% base + 3% stability bonus). |
| | Borrower-Safe Max | **`₹18,26,136`** | **RECOMMENDED.** Safe FOIR Cap: 48% (45% + 3% bonus). |
| | Income Haircut | `0%` | Salaried income carries no haircut. |
| **O3 Rate Band** | Product Routed | `personal_loan` (unsecured) | |
| | Nominal Rate Band | **`10.0% – 13.0%`** | Excellent tier (10.5–13.0%) with –0.5% floor discount for her stated competing offer (11.2%). |
| | All-In APR Band | **`10.4% – 13.4%`** | Folds 2.0% processing fee (₹16,000) over 60-month tenure. |
| **O4 EMI & Stress** | Safe EMI Ceiling | **`₹38,800/mo`** | 48% safe FOIR on effective income, minus existing ₹14k EMI. |
| | Tenure | `60 months` | Standard personal loan tenure. |
| | 20% Income Drop Stress | **`PASSED`** | Post-stress FOIR 35%, positive buffer of **+₹29,002/mo**. |

### 1.3 Negotiation Card
> **VERDICT: YOU CAN BORROW** — *"Your requested loan of ₹8,00,000 is well within your safe ceiling of ₹18,26,136 and comfortably passes all income stress tests."*
> **ELIGIBILITY**: Lender Max ₹23,43,855 vs **Borrower-Safe Max ₹18,26,136 (RECOMMENDED)**.
> **FAIR RATE**: 10.0%–13.0% Nominal | **10.4%–13.4% All-In APR**.
> **CONFIDENCE**: **HIGH (100%)** — complete, verified salaried profile, no fields missing.

---

## 2. Ravi (Self-Employed Kirana Store Owner)

### 2.1 Profile & Stated Answers
Age 42, Mysuru, self-employed (kirana store, 14 yrs). Cash income ₹60,000/mo. No existing
EMIs. Household expenses ₹22,000/mo. Credit score **unknown**. Owns shop premises worth
₹45,00,000 (unencumbered). Wife co-applicant income ₹18,000/mo. Wants ₹15,00,000 for stock
expansion + delivery vehicle, originally requested as an unsecured personal loan.

### 2.2 Adaptive Routing
Ravi requested an unsecured personal loan but has no bureau credit score. Because he has
₹45L of unencumbered collateral, `routing.ts` reroutes him to **Loan Against Property (LAP)**
instead of applying the standard +3% no-score penalty — trading an unsecured penalty for a
secured discount.

### 2.3 Rules Engine Outputs (O1–O4)

| Output | Metric | Value | Rule Reference |
|---|---|---|---|
| **O1 Verdict** | Decision | **`BORROW`** | Safe capacity ₹22,16,985 covers the ₹15L request; 10-year LAP stress test passed. |
| **O2 Eligibility** | Lender-View Max | **`₹27,32,562`** | Lender FOIR Cap: 53% (50% + 3% bonus). |
| | Borrower-Safe Max | **`₹22,16,985`** | **RECOMMENDED.** Safe FOIR Cap: 43%. |
| | Property LTV Ceiling | `₹29,25,000` | 65% LTV cap on ₹45,00,000 shop value. |
| | Income Haircut | `25%` | Self-employed cash-income haircut; effective income ₹61,200/mo (incl. co-applicant). |
| **O3 Rate Band** | Product Routed | **`loan_against_property`** (secured) | |
| | Nominal Rate Band | **`7.5% – 13.5%`** | LAP-unknown base (9.5–12.5%) → +3.5% unknown-score widening (→16.0%) → –2.5% secured discount (→7.5–13.5%). |
| | All-In APR Band | **`7.7% – 13.7%`** | Folds 1.0% secured processing fee (₹15,000) over 120-month tenure. |
| **O4 EMI & Stress** | Safe EMI Ceiling | **`₹26,316/mo`** | 43% safe FOIR on effective household income. |
| | Tenure | `120 months` | 10-year LAP term (not the 60-month PL default). |
| | 20% Income Drop Stress | **`PASSED`** | Post-stress FOIR 36%, positive buffer of **+₹9,155/mo**. |

### 2.4 Negotiation Card
> **VERDICT: YOU CAN BORROW** — *"Your requested loan of ₹15,00,000 is well within your safe ceiling of ₹22,16,985 and comfortably passes all income stress tests."*
> **ELIGIBILITY**: Lender Max ₹27,32,562 vs **Borrower-Safe Max ₹22,16,985 (RECOMMENDED)** (LTV Cap ₹29,25,000).
> **FAIR RATE**: 7.5%–13.5% Nominal | **7.7%–13.7% All-In APR** (Product: Secured Loan Against Property).
> **CONFIDENCE**: **LOW (100% answered, but LOW rating)** — range widened +3.5% specifically because credit score is unknown; every other optional field was answered.

---

## 3. Anita (Informal Gig Rider & Home Tailor)

### 3.1 Profile & Stated Answers
Age 35, Hubballi, informal income (delivery rider + tailoring). Net income ₹28,000/mo, 50%
variable. Existing EMIs ₹9,500/mo. Household expenses ₹19,000/mo. Credit score 640. Three
existing high-interest app loans. One bounced EMI in the last 12 months. Only 0.5 months of
emergency savings. Wants ₹1,50,000 for an electric scooter.

### 3.2 Rules Engine Outputs (O1–O4)

| Output | Metric | Value | Rule Reference |
|---|---|---|---|
| **O1 Verdict** | Decision | **`DONT_BORROW`** | Bounced EMI + 3 high-cost loans + thin savings buffer triggers the hard-decline rule. |
| **O2 Eligibility** | Lender-View Max | **`₹0`** | Lender FOIR Cap 35% (40% base – 5% low-income tightening). |
| | Borrower-Safe Max | **`₹0`** | **RECOMMENDED.** Safe FOIR Cap 25% (30% – 5% tightening). |
| | Income Haircut | `50%` | 40% base informal haircut + 10% extra haircut (variable income share 50% > 30% threshold). Effective income ₹14,000/mo. |
| **O3 Rate Band** | Product Routed | `two_wheeler` (unsecured) | |
| | Nominal Rate Band | **`18.0% – 26.0%`** | Average-tier base (18–24%) + 2.0% informal verification premium. |
| | All-In APR Band | **`18.4% – 26.4%`** | Folds 2.0% processing fee (₹3,000). |
| **O4 EMI & Stress** | Safe EMI Ceiling | **`₹0/mo`** | Existing EMIs already exceed the safe allowance. |
| | Tenure | `60 months` | |
| | 20% Income Drop Stress | **`FAILED`** | Post-stress FOIR 119%, **negative** buffer of –₹21,109/mo. |

### 3.3 Negotiation Card
> **VERDICT: DO NOT BORROW** — *"You have a recent bounced EMI, 3 high-interest app loan(s), and only 0.5 month(s) of savings buffer — taking another loan will likely trigger a debt trap."*
> **ELIGIBILITY**: Lender Max ₹0 vs **Borrower-Safe Max ₹0 (RECOMMENDED)**.
> **FAIR RATE**: 18.0%–26.0% Nominal | **18.4%–26.4% All-In APR**.
> **CONFIDENCE**: **HIGH (100%)** — profile fully answered; the DONT_BORROW verdict is a rule-based decline, not a low-confidence guess.

---

## Verification Methodology

These outputs were produced by running:
```ts
evaluateBorrowerCopilot(TEST_PERSONAS.priya.answers)
evaluateBorrowerCopilot(TEST_PERSONAS.ravi.answers)
evaluateBorrowerCopilot(TEST_PERSONAS.anita.answers)
```
directly against the engine, with the full JSON output diffed against this document before
submission. If you change any constant in `src/rules/constants.ts`, re-run this exact script
and update this file — do not hand-edit these numbers.
