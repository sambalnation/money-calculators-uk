import { describe, expect, it } from 'vitest';
import { computePensionContributionImpact } from './pensionContributionImpact';

describe('computePensionContributionImpact', () => {
  it('clamps non-finite and negative values to zero', () => {
    const r = computePensionContributionImpact({
      grossAnnualSalary: Number.NaN,
      employeeGrossAnnualContribution: -100,
      employerGrossAnnualContribution: -200,
    });

    expect(r.inputs.grossAnnualSalary).toBe(0);
    expect(r.inputs.employeeGrossAnnualContribution).toBe(0);
    expect(r.inputs.employerGrossAnnualContribution).toBe(0);

    expect(r.baseline.netAnnual).toBe(0);
    expect(r.scenarios.salarySacrifice.netAnnual).toBe(0);
    expect(r.scenarios.netPay.netAnnual).toBe(0);
    expect(r.scenarios.reliefAtSource.netAnnual).toBe(0);
  });

  it('salary sacrifice usually reduces take-home less than net pay (because NI is reduced too)', () => {
    const r = computePensionContributionImpact({
      grossAnnualSalary: 60_000,
      employeeGrossAnnualContribution: 6_000,
      employerGrossAnnualContribution: 3_000,
    });

    const ssCost = r.scenarios.salarySacrifice.takeHomeChangeAnnual;
    const netPayCost = r.scenarios.netPay.takeHomeChangeAnnual;

    expect(ssCost).toBeGreaterThan(0);
    expect(netPayCost).toBeGreaterThan(0);

    // In our simplified model, SS should never cost MORE than net pay.
    expect(ssCost).toBeLessThanOrEqual(netPayCost);
  });

  it('relief at source take-home cost is ~80% of gross contribution (ignoring higher-rate reclaim)', () => {
    const r = computePensionContributionImpact({
      grossAnnualSalary: 40_000,
      employeeGrossAnnualContribution: 1_200,
      employerGrossAnnualContribution: 0,
    });

    const cost = r.scenarios.reliefAtSource.takeHomeChangeAnnual;
    expect(cost).toBeCloseTo(960, 2);
  });

  it('employee contribution is capped at salary (cannot sacrifice more than you earn)', () => {
    const r = computePensionContributionImpact({
      grossAnnualSalary: 10_000,
      employeeGrossAnnualContribution: 99_999,
      employerGrossAnnualContribution: 0,
    });

    expect(r.inputs.employeeGrossAnnualContribution).toBe(10_000);
    expect(r.scenarios.salarySacrifice.netAnnual).toBe(0);
  });
});
