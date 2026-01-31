import { describe, expect, it } from 'vitest';
import { computePayRiseImpact } from './payRiseImpact';

describe('computePayRiseImpact', () => {
  it('clamps non-finite/negative values to zero', () => {
    const r = computePayRiseImpact({ currentGrossAnnualSalary: Number.NaN, newGrossAnnualSalary: -10 });
    expect(r.inputs.currentGrossAnnualSalary).toBe(0);
    expect(r.inputs.newGrossAnnualSalary).toBe(0);
    expect(r.deltaGrossAnnual).toBe(0);
    expect(r.deltaNetAnnual).toBe(0);
    expect(r.keepRate).toBe(0);
  });

  it('for a positive rise: net increase is positive but smaller than gross increase', () => {
    const r = computePayRiseImpact({ currentGrossAnnualSalary: 50_000, newGrossAnnualSalary: 55_000 });

    expect(r.deltaGrossAnnual).toBe(5000);
    expect(r.deltaNetAnnual).toBeGreaterThan(0);
    expect(r.deltaNetAnnual).toBeLessThan(r.deltaGrossAnnual);

    expect(r.keepRate).toBeGreaterThan(0);
    expect(r.keepRate).toBeLessThan(1);
    expect(r.effectiveDeductionRate).toBeGreaterThan(0);
    expect(r.effectiveDeductionRate).toBeLessThan(1);
  });

  it('when salary goes down, keepRate is 0 (we treat this tool as a “pay rise” lens)', () => {
    const r = computePayRiseImpact({ currentGrossAnnualSalary: 60_000, newGrossAnnualSalary: 50_000 });
    expect(r.deltaGrossAnnual).toBeLessThan(0);
    expect(r.keepRate).toBe(0);
  });
});
