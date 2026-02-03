import { describe, expect, it } from 'vitest';
import { computeCompoundGrowth } from './compoundGrowth';

// Closed-form for periodic contributions with compound interest.
// Ordinary annuity (end-of-period):
// FV = P*(1+r)^n + PMT * [((1+r)^n - 1) / r]
// Annuity due (start-of-period): multiply PMT term by (1+r)
function closedForm({
  startingBalance,
  contributionPerPeriod,
  periodicRate,
  periods,
  timing,
}: {
  startingBalance: number;
  contributionPerPeriod: number;
  periodicRate: number;
  periods: number;
  timing: 'endOfPeriod' | 'startOfPeriod';
}) {
  if (periods === 0) return startingBalance;
  const growth = Math.pow(1 + periodicRate, periods);

  if (periodicRate === 0) {
    // With 0% growth, timing doesn't matter.
    return startingBalance + contributionPerPeriod * periods;
  }

  const annuity = contributionPerPeriod * ((growth - 1) / periodicRate);
  const timingFactor = timing === 'startOfPeriod' ? (1 + periodicRate) : 1;

  return startingBalance * growth + annuity * timingFactor;
}

describe('computeCompoundGrowth', () => {
  it('handles zeros', () => {
    const r = computeCompoundGrowth({ startingBalance: 0, monthlyContribution: 0, annualRatePct: 0, years: 0 });
    expect(r.finalBalance).toBe(0);
    expect(r.totalContributed).toBe(0);
    expect(r.totalGrowth).toBe(0);
    expect(r.yearly).toHaveLength(0);
  });

  it('no growth => linear contributions (timing irrelevant)', () => {
    const end = computeCompoundGrowth({
      startingBalance: 1000,
      monthlyContribution: 100,
      annualRatePct: 0,
      years: 2,
      contributionTiming: 'endOfPeriod',
    });
    const start = computeCompoundGrowth({
      startingBalance: 1000,
      monthlyContribution: 100,
      annualRatePct: 0,
      years: 2,
      contributionTiming: 'startOfPeriod',
    });

    expect(end.totalContributed).toBeCloseTo(100 * 24, 6);
    expect(end.finalBalance).toBeCloseTo(1000 + 100 * 24, 6);
    expect(end.totalGrowth).toBeCloseTo(0, 6);
    expect(end.yearly).toHaveLength(2);

    expect(start.finalBalance).toBeCloseTo(end.finalBalance, 6);
  });

  it('matches closed form for monthly compounding + end-of-month contributions', () => {
    const inputs = {
      startingBalance: 5000,
      monthlyContribution: 250,
      annualRatePct: 6,
      years: 10,
      periodsPerYear: 12,
      contributionTiming: 'endOfPeriod' as const,
    };
    const r = computeCompoundGrowth(inputs);

    const periodicRate = (inputs.annualRatePct / 100) / 12;
    const periods = inputs.years * 12;
    const expected = closedForm({
      startingBalance: inputs.startingBalance,
      contributionPerPeriod: inputs.monthlyContribution,
      periodicRate,
      periods,
      timing: inputs.contributionTiming,
    });

    expect(r.finalBalance).toBeCloseTo(expected, 6);
  });

  it('matches closed form for monthly compounding + start-of-month contributions (annuity due)', () => {
    const inputs = {
      startingBalance: 5000,
      monthlyContribution: 250,
      annualRatePct: 6,
      years: 10,
      periodsPerYear: 12,
      contributionTiming: 'startOfPeriod' as const,
    };
    const r = computeCompoundGrowth(inputs);

    const periodicRate = (inputs.annualRatePct / 100) / 12;
    const periods = inputs.years * 12;
    const expected = closedForm({
      startingBalance: inputs.startingBalance,
      contributionPerPeriod: inputs.monthlyContribution,
      periodicRate,
      periods,
      timing: inputs.contributionTiming,
    });

    expect(r.finalBalance).toBeCloseTo(expected, 6);
  });

  it('start-of-period contributions should beat end-of-period (with positive rate)', () => {
    const base = {
      startingBalance: 0,
      monthlyContribution: 100,
      annualRatePct: 5,
      years: 10,
      periodsPerYear: 12,
    };

    const end = computeCompoundGrowth({ ...base, contributionTiming: 'endOfPeriod' });
    const start = computeCompoundGrowth({ ...base, contributionTiming: 'startOfPeriod' });

    expect(start.finalBalance).toBeGreaterThan(end.finalBalance);
  });

  it('supports annual compounding while keeping monthly input scaled', () => {
    const inputs = {
      startingBalance: 0,
      monthlyContribution: 100,
      annualRatePct: 12,
      years: 3,
      periodsPerYear: 1,
      contributionTiming: 'endOfPeriod' as const,
    };
    const r = computeCompoundGrowth(inputs);

    // Contribution per period becomes £1200/year.
    expect(r.totalContributed).toBeCloseTo(1200 * 3, 6);
    // Sanity: with positive growth, final > contributions.
    expect(r.finalBalance).toBeGreaterThan(r.totalContributed);
  });
});
