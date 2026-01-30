import { describe, expect, it } from 'vitest';
import { computeEmergencyFundRunway } from './emergencyFundRunway';

describe('computeEmergencyFundRunway', () => {
  it('clamps non-finite and negative inputs to zero', () => {
    const r = computeEmergencyFundRunway({
      emergencyFundBalance: Number.NaN,
      monthlyEssentialSpending: -500,
      monthlyIncomeDuringEmergency: Number.POSITIVE_INFINITY,
    });

    expect(r.inputs.emergencyFundBalance).toBe(0);
    expect(r.inputs.monthlyEssentialSpending).toBe(0);
    expect(r.inputs.monthlyIncomeDuringEmergency).toBe(0);
    expect(r.netMonthlyBurn).toBe(0);
    expect(r.runwayMonths).toBe(Number.POSITIVE_INFINITY);
  });

  it('returns Infinity when income covers spending', () => {
    const r = computeEmergencyFundRunway({
      emergencyFundBalance: 10_000,
      monthlyEssentialSpending: 2000,
      monthlyIncomeDuringEmergency: 2500,
    });

    expect(r.netMonthlyBurn).toBeLessThanOrEqual(0);
    expect(r.runwayMonths).toBe(Number.POSITIVE_INFINITY);
    expect(r.runwayWeeks).toBe(Number.POSITIVE_INFINITY);
  });

  it('computes a simple runway when net burn is positive', () => {
    const r = computeEmergencyFundRunway({
      emergencyFundBalance: 6000,
      monthlyEssentialSpending: 1500,
      monthlyIncomeDuringEmergency: 500,
    });

    expect(r.netMonthlyBurn).toBe(1000);
    expect(r.runwayMonths).toBeCloseTo(6, 10);
    expect(r.runwayWeeks).toBeCloseTo(6 * (52 / 12), 10);
  });
});
