# Borrower Copilot — Lokta Take-Home Submission

> **Borrower Copilot** is a transparent, client-side, inspectable rules engine and loan advisory application designed to help Indian borrowers evaluate eligibility, fair interest rates, safe EMIs, and negotiation leverage before stepping into a lender.

---

## ⚡ Quickstart Setup (< 2 Minutes)

This app requires **zero backend servers**, **zero login**, and **zero external API keys**. Everything runs locally in-memory.

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Run Automated Unit Tests

To execute the Vitest suite testing all pure rule functions across **Priya**, **Ravi**, **Anita**, and question bank usage:

```bash
npm test
```

Expected output:
```
✓ src/__tests__/rules.test.ts (9 tests) 53ms
Test Files  1 passed (1)
Tests       9 passed (9)
```

---

## 🏗️ Production Build

To validate TypeScript compilation and create production static bundle:

```bash
npm run build
```

---

## 🛡️ Hard Architectural Rule & 60-Minute Live Defense

**Separation of Logic and UI**:
- **Zero Business Logic in UI**: No ratio, haircut percentage, cutoff, band, fee, or threshold exists inside any React component.
- **Single Source of Truth**: ALL domain numbers live exclusively in [`src/rules/constants.ts`](file:///d:/Borrower%20Copilot/src/rules/constants.ts).
- **Instant Propagation**: Changing ONE constant in `constants.ts` (e.g. `FOIR_SAFE_INFORMAL`) instantly changes app behavior across all screens without modifying any UI file.

---

## 📂 Project Architecture

```
/src
  /rules
    constants.ts        # ALL thresholds, ratios, haircuts, rate bands, and fees (with inline comments)
    routing.ts          # Secured vs unsecured loan product selection logic
    foir.ts             # Lender-view vs Borrower-safe FOIR affordability engine
    rateBand.ts         # Nominal interest rate range & processing fee calculation
    apr.ts              # Upfront processing fee to effective All-In APR conversion
    stressTest.ts       # -20% household income drop shock simulation
    verdict.ts          # O1 Decision engine (BORROW / BORROW_LESS / DONT_BORROW)
    confidence.ts       # Confidence score & band-widening rationale
    engine.ts           # Central pure master evaluator: (answers) => OverallAssessment
    types.ts            # Shared TypeScript domain interfaces
  /questions
    questionBank.ts     # Master question repository (Must & Additional tiers tagged with affects)
    flowEngine.ts       # Adaptive flow router branching on income type & prior answers
  /personas
    testPersonas.ts     # Structured fixtures for Priya, Ravi, and Anita
  /__tests__
    rules.test.ts       # Vitest unit test suite validating all rules & personas
  /ui
    index.css           # Glassmorphic modern design system tokens
    /components
      Header.tsx        # Top bar, persona quick-loader, and Rule Inspector trigger
      ProgressBar.tsx   # Tier progress and confidence indicator badge
      QuestionCard.tsx  # Responsive wizard question input card
      NegotiationCard.tsx # Printable/exportable 1-page borrower summary card
      RuleInspector.tsx # Live drawer mapping output numbers to constants.ts
      PersonaAuditModal.tsx # Side-by-side persona comparative runner
    /views
      WizardView.tsx    # Interactive questionnaire wizard with real-time preview
      ReportView.tsx    # Dashboard with NegotiationCard & confidence explanation box
      PersonasView.tsx  # Persona benchmark audit view
    App.tsx             # Main application shell
    main.tsx            # React entry point
RULES.md                # Human-readable mirror of constants.ts in markdown table format
PERSONA_RUNS.md         # Audit logs for Priya, Ravi, and Anita execution
WALKTHROUGH.md          # 5-minute walkthrough write-up on trade-offs & roadmap
```

---

## 📋 Deliverables Checklist Verification

- [x] **Working App**: Runs from README in <2 minutes, no backend required.
- [x] **`RULES.md`**: Markdown table of every constant (`Rule` \| `Value` \| `Why` \| `Source/Judgement`) + "What we don't know" section.
- [x] **`PERSONA_RUNS.md`**: Full audit run-throughs for Priya, Ravi, and Anita with all 4 outputs and Negotiation Cards.
- [x] **`WALKTHROUGH.md`**: 5-minute walkthrough write-up on roadmap, cuts, and trade-offs.
- [x] **`README.md`**: Setup and run instructions.
- [x] **Unit Tests**: 100% passing Vitest test suite (`src/__tests__/rules.test.ts`).
- [x] **Separation of Concerns**: Verified 0 rules or constants in UI.
- [x] **Anita Safety Rule**: Verified `DONT_BORROW` verdict fires for Anita's fixture.
- [x] **Ravi LAP Routing**: Verified Ravi is routed to LAP and cleared for ₹15L.
- [x] **Question Usage Audit**: Verified every question ID is consumed in `/src/rules`.
