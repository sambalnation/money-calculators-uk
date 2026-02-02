import { describe, expect, it } from 'vitest';
import { computeCompoundGrowth } from './compoundGrowth';
import { computeInflationAdjustedGrowth } from './inflationAdjustedGrowth';

function closeTo(a: number, b: number, tol = 1e-6) {
  expect(a).toBeCloseTo(b, Math.max(0, Math.round(-Math.log10(tol))));
}

describe('computeInflationAdjustedGrowth', () => {
  it('matches compound growth when inflation is zero (nominal == real)', () => {
    const inputs = {
      startingBalance: 10_000,
      monthlyContribution: 200,
      annualReturnPct: 6,
      annualInflationPct: 0,
      years: 15,
    };

    const inflationRes = computeInflationAdjustedGrowth(inputs);
    const compoundRes = computeCompoundGrowth({
      startingBalance: inputs.startingBalance,
      monthlyContribution: inputs.monthlyContribution,
      annualRatePct: inputs.annualReturnPct,
      years: inputs.years,
      periodsPerYear: 12,
    });

    closeTo(inflationRes.finalBalanceNominal, compoundRes.finalBalance, 1e-7);
    closeTo(inflationRes.finalBalanceReal, compoundRes.finalBalance, 1e-7);
  });

  it('deflates nominal balance by cumulative inflation', () => {
    const inputs = {
      startingBalance: 5_000,
      monthlyContribution: 0,
      annualReturnPct: 0,
      annualInflationPct: 3,
      years: 10,
    };

    const res = computeInflationAdjustedGrowth(inputs);

    // With zero return and no contributions, nominal stays flat.
    closeTo(res.finalBalanceNominal, inputs.startingBalance, 1e-10);

    // Real value should be startingBalance deflated by the same monthly inflation model used in the calculator.
    const monthlyInflation = (inputs.annualInflationPct / 100) / 12;
    const expectedReal = inputs.startingBalance / Math.pow(1 + monthlyInflation, inputs.years * 12);
    expect(res.finalBalanceReal).toBeCloseTo(expectedReal, 8);
  });

  it('handles years=0 without NaNs', () => {
    const res = computeInflationAdjustedGrowth({
      startingBalance: 123,
      monthlyContribution: 456,
      annualReturnPct: 7,
      annualInflationPct: 2,
      years: 0,
    });

    expect(res.finalBalanceNominal).toBe(123);
    expect(res.finalBalanceReal).toBe(123);
    expect(res.yearly).toHaveLength(0);
  });
});
