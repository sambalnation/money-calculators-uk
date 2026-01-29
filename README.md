# Money Calculators UK (prototype)

A dark, neon fintech-style calculator hub for UK money nerds.

**Goal:** lots of useful UK calculators in one place (educational estimates, not financial advice).

## What’s in v0.2
- UK take‑home pay calculator (England/Wales/NI)
  - Income tax + employee NI (simplified)
  - Clear assumptions panel
  - Unit-tested calculation core
- Compound growth calculator
  - Monthly contributions + monthly compounding (end-of-month deposits)
  - Clear assumptions + year-by-year breakdown
  - Unit-tested math core (matches closed-form formula)

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
- Emergency fund runway
- Pay rise impact (marginal rate visual)
- Pension contribution impact (salary sacrifice vs net pay vs relief-at-source — with a "not sure" mode)
