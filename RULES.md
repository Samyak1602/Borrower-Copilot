# RULES.md — Inspectable Domain Rules & Threshold Registry

> **Single Source of Truth**: Every number, ratio, cutoff, haircut, rate band, and fee percentage in Borrower Copilot is defined strictly within [`src/rules/constants.ts`](file:///d:/Borrower%20Copilot/src/rules/constants.ts). No UI component contains hardcoded business logic or financial cutoffs.

---

## 1. Income Haircuts & Verification Adjustments

| Rule | Value | Why | Source / Judgement |
|---|---|---|---|
| Salaried Income Haircut | `0%` (`0.00`) | Fixed monthly salary credited directly to bank account from MNCs/formal sector carries minimal verification uncertainty. | RBI Retail Lending Guidelines & bank underwriting standards |
| Self-Employed Income Haircut | `25%` (`0.25`) | Accounts for cash turnover variance, seasonal sales dips, and unrecorded business overheads in MSME receipts. | SBI MSME / HDFC SME underwriting policy |
| Informal Sector Income Haircut | `40%` (`0.40`) | Informal gig/daily cash income (riders, tailors, daily-wage) lacks audit trail and formal contracts. | Microfinance & informal credit risk policy ("my judgement") |
| Co-Applicant Income Haircut | `10%` (`0.10`) | Secondary co-applicant (spouse/parent) income is factored conservatively to account for joint household risks. | Retail joint-borrower underwriting practice |
| High Variable Income Threshold | `30%` | Variable income (commissions/bonuses) exceeding 30% increases default risk during lean periods. | Bank variable compensation risk rule |
| Extra Haircut on Variable Income | `10%` (`0.10`) | Applied to variable income portion when variable share exceeds 30%. | Underwriting conservatism ("my judgement") |
| 5+ Year Stability Bonus | `+3% FOIR` | Borrowers with 5+ years of continuous job or business stability demonstrate lower turnover and default risk. | Credit bureau stability scoring benchmark |

---

## 2. FOIR (Fixed Obligation to Income Ratio) Caps

| Rule | Value | Why | Source / Judgement |
|---|---|---|---|
| Salaried Lender FOIR Cap | `55%` | Aggressive lender policy cap for stable salaried employees before issuing a decline. | HDFC / ICICI Personal Loan policy manual |
| Salaried Borrower-Safe Cap | `45%` | Borrower safety cap reserving 55% of disposable income for rent, food, healthcare, and savings. | Financial planning best practice ("my judgement") |
| Self-Employed Lender FOIR Cap | `50%` | Lenders restrict self-employed applicants to 50% FOIR due to working capital swings. | SBI MSME underwriting framework |
| Self-Employed Borrower-Safe Cap | `40%` | Borrower safety cap preserving business liquidity buffer for lean business cycles. | SME risk management ("my judgement") |
| Informal Lender FOIR Cap | `40%` | Lenders cap informal applicants at 40% FOIR due to high historical default volatility. | NBFC micro-lending risk policy |
| Informal Borrower-Safe Cap | `30%` | Strict safety cap for informal households with dependants and no formal safety net. | Financial inclusion safety standard ("my judgement") |
| Low-Income Bracket Threshold | `₹30,000/mo` | Net monthly income below ₹30,000 forces a higher fraction of income toward basic survival essentials. | RBI Low-Income Household definition benchmark |
| Low-Income FOIR Tightening | `5%` | Reduces FOIR caps by 5% for net monthly incomes under ₹30,000 to prevent living squeeze. | Reserve Bank of India Microfinance Fair Practices Code |

---

## 3. Product Routing & Collateral LTV Caps

| Rule | Value | Why | Source / Judgement |
|---|---|---|---|
| Loan Against Property LTV Cap | `65%` | Caps maximum loan eligibility at 65% of unencumbered market value for Loan Against Property (LAP). | RBI Master Direction on Housing & Property Loans |
| Gold Loan LTV Cap | `75%` | Caps maximum loan eligibility at 75% of market value of pledged 22k/24k gold. | RBI Regulatory LTV Ceiling on Gold Loans |
| Secured Collateral Rate Discount | `-2.50%` (`-250 bps`) | Pledging unencumbered property or gold lowers lender default loss, yielding a ~2.5% rate discount. | Indian retail banking rate card differential |
| Unsecured No-Credit-Score Penalty | `+3.00%` (`+300 bps`) | Unbacked personal loans without bureau credit history incur a risk surcharge. | Risk-based pricing underwriting manual ("my judgement") |

---

## 4. Interest Rates & Processing Fees

| Rule | Value | Why | Source / Judgement |
|---|---|---|---|
| Unsecured PL Base Rates (750+ Score) | `10.5% – 13.0%` | Prime interest rate band for top-tier credit bureau scores. | Aggregate Indian bank rate cards (Q3 2025) |
| Unsecured PL Base Rates (700-749 Score) | `13.0% – 16.5%` | Standard interest rate band for good credit bureau scores. | Bank retail rate benchmark |
| Unsecured PL Base Rates (<700 Score) | `16.5% – 24.0%` | Higher-risk rate band for thin or subprime credit scores. | NBFC rate card benchmark |
| Unsecured PL Base Rates (Unknown Score) | `14.0% – 21.0%` | Unknown credit score widens range; does NOT force worst-case subprime penalty. | Underwriting uncertainty model ("my judgement") |
| LAP Base Rates | `8.5% – 12.5%` | Lower nominal interest rate bands for property-backed collateral loans. | Retail LAP rate card benchmark |
| Informal Income Verification Premium | `+2.00%` (`+200 bps`) | Expands upper rate bound to cover field verification and door-to-door audit overheads. | Field underwriting pricing matrix ("my judgement") |
| Competing Lender Offer Discount | `-0.50%` (`-50 bps`) | Presenting a written competing offer provides negotiation leverage for a 0.5% rate floor discount. | Retail loan negotiation dynamics ("my judgement") |
| Optional Field Missing Rate Widening | `+0.75%` (`75 bps`) | Expands upper interest rate bound by +0.75% for each unstated optional question (living expenses, savings, stability). | Confidence range-widening model ("my judgement") |
| Unknown Score Band Widening | `+3.50%` (`350 bps`) | Expands interest rate range by +3.50% when credit score is marked as Unknown. | Underwriting confidence engine ("my judgement") |
| Unsecured Processing Fee | `2.0%` | Standard upfront administrative fee for unsecured personal loans. | Bank schedule of charges (1.5% - 2.5% + GST) |
| Secured Processing Fee | `1.0%` | Lower processing fee for collateralized property/gold loans. | Standard LAP schedule of charges (0.5% - 1.5%) |

---

## 5. Tenure, Stress Testing & Rejection Cutoffs

| Rule | Value | Why | Source / Judgement |
|---|---|---|---|
| Standard Unsecured Tenure | `60 months` | 5-year standard benchmark tenure for personal loans. | Retail credit industry benchmark |
| LAP Secured Tenure | `120 months` | 10-year standard tenure benchmark for Loan Against Property. | HDFC / SBI LAP product guidelines |
| Economic Income Drop Shock | `-20%` | Simulates emergency income reduction or medical shock to test household EMI survivability. | Household stress testing standard ("my judgement") |
| High-Cost Predator Debt Threshold | `24.0%` | Interest rates above 24% indicate predatory app loan debt trapping vulnerable borrowers. | RBI Digital Lending Guidelines (Fair Code) |
| Cautionary Debt Burden Threshold | `35% FOIR` | Existing loan EMIs consuming >35% of income indicate elevated debt burden, triggering BORROW_LESS caution. | Retail lending risk indicator |
| Extreme Existing Debt Danger Cap | `50% FOIR` | Existing loan EMIs consuming >= 50% of income signal high default correlation. | Bureau over-indebtedness indicator |
| Bounced EMI Hard Penalty | `True` | A bounced EMI in the last 12 months combined with high debt triggers a hard `DO NOT BORROW` verdict. | Lender credit policy hard decline rule |
| Minimum Emergency Savings Buffer | `3 months` | Borrowers with under 3 months of living expenses saved expose themselves to debt traps. | Personal finance safety benchmark |

---

## 6. What We Don't Know / Where We're Guessing

*(Honesty about limits & explicit domain trade-offs)*

1. **Credit Bureau File Granularity**:
   - *Where we guess*: We rely on self-reported CIBIL/Experian score brackets or "Unknown".
   - *What we don't know*: We do not pull live credit bureau XMLs, so we cannot detect active DPD (Days Past Due) tracks, inquiry velocity (multiple hard pulls in 30 days), or revolving credit utilization ratios unless self-reported in optional questions.

2. **Property Valuation & Legal Cleanliness**:
   - *Where we guess*: In Ravi's profile, we accept stated market value (₹45,00,000) for unencumbered shop premises.
   - *What we don't know*: Bank legal & technical valuation (L&T report) often applies a 15-20% distress haircut to market value, and title deed encumbrance searches can delay LAP sanction.

3. **Informal Sector Cashflow Verification (Bank Statement Analyzer)**:
   - *Where we guess*: For Anita, we apply a 40% haircut to informal income (₹28,00,00/mo).
   - *What we don't know*: Actual informal lenders use Account Aggregator (AA) UPI cashflow flows or physical field inspection (shop footfall counting) which may yield a higher or lower haircut.

4. **Floating Interest Rate Benchmark Spreads**:
   - *Where we guess*: We assume static nominal bands and folded processing fee APR.
   - *What we don't know*: External benchmark-linked lending rates (EBLR) fluctuate with RBI Repo rate changes over a 5 to 10 year tenure.

5. **Lender-Specific Risk Appetites**:
   - *Where we guess*: We model general Indian retail banking averages (HDFC, ICICI, SBI, Bajaj Finance).
   - *What we don't know*: Specific NBFCs may offer specialized micro-loans with higher risk tolerance or custom promo processing fee waivers.
