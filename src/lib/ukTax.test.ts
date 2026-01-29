import { describe, expect, it } from 'vitest';
import { computeTakeHome, DEFAULT_UK_ASSUMPTIONS } from './ukTax';

describe('computeTakeHome (rough UK estimate)', () => {
  it('handles zero', () => {
    const r = computeTakeHome({ grossAnnualSalary: 0 });
    expect(r.netAnnual).toBe(0);
    expect(r.incomeTaxAnnual).toBe(0);
    expect(r.niAnnual).toBe(0);
  });

  it('at personal allowance => no income tax/NI', () => {
    const r = computeTakeHome({ grossAnnualSalary: DEFAULT_UK_ASSUMPTIONS.personalAllowance });
    expect(r.incomeTaxAnnual).toBe(0);
    expect(r.niAnnual).toBe(0);
    expect(r.netAnnual).toBe(DEFAULT_UK_ASSUMPTIONS.personalAllowance);
  });

  it('basic-rate example sanity check', () => {
    // 30k salary: taxable 17,430 at 20% => 3486
    // NI: (30k-12,570)*8% => 1,394.4
    const r = computeTakeHome({ grossAnnualSalary: 30_000 });
    expect(r.incomeTaxAnnual).toBeCloseTo(3486, 2);
    expect(r.niAnnual).toBeCloseTo(1394.4, 1);
    expect(r.netAnnual).toBeCloseTo(30_000 - 3486 - 1394.4, 1);
  });

  it('crossing basic-rate limit increases marginal tax', () => {
    const r1 = computeTakeHome({ grossAnnualSalary: 50_000 });
    const r2 = computeTakeHome({ grossAnnualSalary: 55_000 });

    const deltaGross = r2.grossAnnual - r1.grossAnnual;
    const deltaNet = r2.netAnnual - r1.netAnnual;

    expect(deltaGross).toBe(5000);
    // Net should increase by less than gross.
    expect(deltaNet).toBeLessThan(deltaGross);
    expect(deltaNet).toBeGreaterThan(0);
  });
});
