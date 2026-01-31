# Money Calculators UK (prototype)

A dark, neon fintech-style calculator hub for UK money nerds.

**Goal:** lots of useful UK calculators in one place (educational estimates, not financial advice).

## What’s in v0.3
- UK take‑home pay calculator (England/Wales/NI)
  - Income tax + employee NI (simplified)
  - Clear assumptions panel
  - Unit-tested calculation core
- Compound growth calculator
  - Monthly contributions + monthly compounding (end-of-month deposits)
  - Clear assumptions + year-by-year breakdown
  - Unit-tested math core (matches closed-form formula)
- Emergency fund runway
  - Monthly burn vs cash balance
  - Clear assumptions panel
  - Unit-tested calculation core
- Pay rise impact
  - Delta view: how much of a gross pay rise you keep after tax + NI
  - Uses the same simplified tax/NI model as take-home
  - Unit-tested calculation core

## Run locally
```bash
npm install
npm run dev
```

## Tests
```bash
npm run test:run
```

## Notes / disclaimers
This project is for education and estimation. Not financial advice.
Always verify results against payroll/HMRC and your own situation.

## Next calculators to add
- Pension contribution impact (salary sacrifice vs net pay vs relief-at-source — with a "not sure" mode)
