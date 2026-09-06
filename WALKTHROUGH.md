# WALKTHROUGH.md — 5-Minute Technical & Strategic Walkthrough

Welcome to **Borrower Copilot**, an inspectable, rules-based web application designed to empower Indian borrowers before they step into a bank or NBFC branch.

---

## 1. Architectural Integrity & Single Source of Truth

The most critical architectural constraint of this project is the **strict separation between domain business logic and UI presentation**:

- **Zero business logic in UI**: No financial ratio, haircut percentage, credit cutoff, rate range, fee percentage, or stress parameter exists anywhere inside a UI component.
- **Single File Edit (`src/rules/constants.ts`)**: Every threshold lives strictly in [`src/rules/constants.ts`](file:///d:/Borrower%20Copilot/src/rules/constants.ts). Each constant is exported with explicit inline comments documenting its value, underwriting rationale, and regulatory source (or `"my judgement"`).
- **Pure Functions**: Every rules module (`foir.ts`, `routing.ts`, `rateBand.ts`, `apr.ts`, `stressTest.ts`, `verdict.ts`, `confidence.ts`) exports pure functions of the form:
  ```ts
  (answers, priorContext) => { value, why, confidence, rulesTriggered }
  ```
- **60-Minute Live Defense Ready**: If an interviewer changes `FOIR_SAFE_INFORMAL` from `0.30` to `0.25` in `constants.ts`, the running app and all four outputs (O1–O4) update instantly without touching any UI component.

---

## 2. Key Technical Accomplishments & Persona Verification

1. **Automated Unit Test Suite (`src/__tests__/rules.test.ts`)**:
   - 9 test cases in Vitest covering FOIR caps, income haircuts, secured routing, APR calculation, stress tests, and persona fixtures.
   - **Priya**: Salaried MNC engineer (780 CIBIL) cleared for full ₹8,00,000 PL with `BORROW` verdict.
   - **Ravi**: Self-employed kirana store owner (unknown CIBIL, ₹45L unencumbered shop premises) automatically routed to **Loan Against Property (LAP)**, unlocking a 2.5% rate discount and confirming eligibility for the full ₹15,00,000 requested.
   - **Anita**: Informal rider with 3 high-cost app loans (>30% rate), 1 bounced EMI, and 0.5 mo savings buffer triggers a hard **`DO NOT BORROW`** verdict.
   - **Question Usage Test**: Automated test asserting that EVERY question `id` in `questionBank.ts` is explicitly consumed inside `/src/rules`.

2. **Visible UI Confidence Indicator**:
   - `ReportView.tsx` and `NegotiationCard.tsx` explicitly render a plain-language explanation box detailing why a band is wider when optional questions are omitted or when credit score is marked as "Unknown".

3. **Exportable / Printable Negotiation Card**:
   - Clean 1-page layout formatted for PDF print/export combining Verdict, O2 (Lender vs Safe), O3 (Rate vs All-In APR), O4 (Safe EMI & Stress), Confidence, and Rule Traceability.

---

## 3. What We Would Build Next (Product Roadmap)

If expanded into a full production product for Indian borrowers:

1. **Account Aggregator (AA) Consent Flow Integration**:
   - Enable borrowers to grant 1-click Bank Statement consent via Sahmati / AA ecosystem to automatically extract average monthly balance (AMB), bounce history, and recurring salary credits without manual data entry.

2. **Regional Language Localization (Indic UI)**:
   - Provide multi-lingual support in Hindi, Kannada, Tamil, Telugu, and Marathi, since non-salaried borrowers (like Ravi and Anita) operate primarily in regional languages.

3. **Lender Negotiation Script Generator**:
   - Add a "Lender Talking Points" tab on the Negotiation Card generating exact sentences for the borrower to speak to a loan officer (e.g., *"My CIBIL is 780, your processing fee of 2.5% brings the APR to 13.8%, which is above the 12.5% market benchmark for my tier"*).

4. **KFS (Key Fact Statement) Document Scanner**:
   - Allow borrowers to upload a lender's sanction letter/KFS PDF and run OCR to detect hidden insurance bundling, pre-payment penalties, or APR misrepresentation.

---

## 4. What We Deliberately Cut — And Why

*(Tied directly to non-scored items in the project brief)*

1. **Black-Box Credit Scoring ML Models**:
   - *Why cut*: Machine learning credit scoring models are black boxes that cannot explain *why* a decision was made. For a live 60-minute defense and borrower negotiation tool, an explicit, inspectable rules engine where every number traces to a line in `constants.ts` is vastly superior to an opaque neural network.

2. **Direct Bureau API Integrations (CIBIL / Experian / CRIF HighMark)**:
   - *Why cut*: Hard dependency on live bureau APIs requires formal OTPs, Indian phone verification, and regulatory KYC persistence. Borrower Copilot intentionally operates as a **no-login, no-backend, zero-data-stored** client-side tool to guarantee complete data privacy.

3. **User Authentication & Persistent Databases**:
   - *Why cut*: Storing borrower financial data on a backend server introduces security liabilities, GDPR/DPDP compliance requirements, and login friction. In-memory client-side evaluation keeps the experience instantaneous (<5 min setup) and privacy-first.

4. **Exhaustive Product Breadth (Home Loans, Education Loans)**:
   - *Why cut*: Home loans involve complex multi-stage disbursements and co-construction milestones. Capping product scope to 5 core categories (`personal_loan`, `loan_against_property`, `gold_loan`, `two_wheeler`, `business_loan`) delivers maximum underwriting clarity without unnecessary UI clutter.
