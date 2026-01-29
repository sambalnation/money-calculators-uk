import { describe, expect, it } from 'vitest';
import { computeCompoundGrowth } from './compoundGrowth';

// Closed-form for end-of-period contributions with compound interest.
// FV = P*(1+r)^n + PMT * [((1+r)^n - 1) / r]
function closedForm({
  startingBalance,
  contributionPerPeriod,
  periodicRate,
  periods,
}: {
  startingBalance: number;
  contributionPerPeriod: number;
  periodicRate: number;
  periods: number;
}) {
  if (periods === 0) return startingBalance;
  const growth = Math.pow(1 + periodicRate, periods);
  if (periodicRate === 0) return startingBalance + contributionPerPeriod * periods;
  return startingBalance * growth + contributionPerPeriod * ((growth - 1) / periodicRate);
}

describe('computeCompoundGrowth', () => {
  it('handles zeros', () => {
    const r = computeCompoundGrowth({ startingBalance: 0, monthlyContribution: 0, annualRatePct: 0, years: 0 });
    expect(r.finalBalance).toBe(0);
    expect(r.totalContributed).toBe(0);
    expect(r.totalGrowth).toBe(0);
    expect(r.yearly).toHaveLength(0);
  });

  it('no growth => linear contributions', () => {
    const r = computeCompoundGrowth({ startingBalance: 1000, monthlyContribution: 100, annualRatePct: 0, years: 2 });
    expect(r.totalContributed).toBeCloseTo(100 * 24, 6);
    expect(r.finalBalance).toBeCloseTo(1000 + 100 * 24, 6);
    expect(r.totalGrowth).toBeCloseTo(0, 6);
    expect(r.yearly).toHaveLength(2);
  });

  it('matches closed form for monthly compounding + end-of-month contributions', () => {
    const inputs = { startingBalance: 5000, monthlyContribution: 250, annualRatePct: 6, years: 10, periodsPerYear: 12 };
    const r = computeCompoundGrowth(inputs);

    const periodicRate = (inputs.annualRatePct / 100) / 12;
    const periods = inputs.years * 12;
    const expected = closedForm({
      startingBalance: inputs.startingBalance,
      contributionPerPeriod: inputs.monthlyContribution,
      periodicRate,
      periods,
    });

    expect(r.finalBalance).toBeCloseTo(expected, 6);
  });

  it('supports annual compounding while keeping monthly input scaled', () => {
    const inputs = { startingBalance: 0, monthlyContribution: 100, annualRatePct: 12, years: 3, periodsPerYear: 1 };
    const r = computeCompoundGrowth(inputs);

    // Contribution per period becomes £1200/year.
    expect(r.totalContributed).toBeCloseTo(1200 * 3, 6);
    // Sanity: with positive growth, final > contributions.
    expect(r.finalBalance).toBeGreaterThan(r.totalContributed);
  });
});
