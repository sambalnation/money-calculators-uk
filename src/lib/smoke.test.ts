import { describe, expect, it } from 'vitest';

import { computeTakeHome } from './ukTax';
import { computeCompoundGrowth } from './compoundGrowth';
import { computeEmergencyFundRunway } from './emergencyFundRunway';
import { computePayRiseImpact } from './payRiseImpact';

describe('smoke: calculators return sane outputs', () => {
  it('take-home: 30k is positive and net < gross', () => {
    const r = computeTakeHome({ grossAnnualSalary: 30_000 });
    expect(r.netAnnual).toBeGreaterThan(0);
    expect(r.netAnnual).toBeLessThan(r.grossAnnual);
    expect(r.incomeTaxAnnual).toBeGreaterThanOrEqual(0);
    expect(r.niAnnual).toBeGreaterThanOrEqual(0);
  });

  it('compound growth: grows with positive rate and contributions', () => {
    const r = computeCompoundGrowth({
      startingBalance: 0,
      monthlyContribution: 100,
      annualRatePct: 5,
      years: 10,
    });

    expect(r.totalContributed).toBeCloseTo(12_000, 6);
    expect(r.finalBalance).toBeGreaterThan(r.totalContributed);
    expect(r.totalGrowth).toBeGreaterThan(0);
    expect(r.yearly.length).toBe(10);
  });

  it('emergency fund runway: infinite if income >= spending', () => {
    const r = computeEmergencyFundRunway({
      emergencyFundBalance: 10_000,
      monthlyEssentialSpending: 2000,
      monthlyIncomeDuringEmergency: 2000,
    });
    expect(r.netMonthlyBurn).toBe(0);
    expect(r.runwayMonths).toBe(Infinity);
  });

  it('pay rise impact: net delta is smaller than gross delta (usually)', () => {
    const r = computePayRiseImpact({ currentGrossAnnualSalary: 50_000, newGrossAnnualSalary: 55_000 });
    expect(r.deltaGrossAnnual).toBe(5_000);
    expect(r.deltaNetAnnual).toBeGreaterThan(0);
    expect(r.deltaNetAnnual).toBeLessThan(r.deltaGrossAnnual);
    expect(r.keepRate).toBeGreaterThan(0);
    expect(r.keepRate).toBeLessThan(1);
  });
});
