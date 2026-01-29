export type TaxYearKey = '2025-26';

export type UKTaxAssumptions = {
  taxYear: TaxYearKey;

  personalAllowance: number; // annual
  basicRateLimit: number; // annual taxable income upper bound of basic band
  higherRateLimit: number; // annual taxable income upper bound of higher band
  basicRate: number; // 0..1
  higherRate: number;
  additionalRate: number;

  // Employee Class 1 NI (annualized thresholds, simplified)
  niPrimaryThreshold: number;
  niUpperEarningsLimit: number;
  niMainRate: number;
  niUpperRate: number;
};

export const DEFAULT_UK_ASSUMPTIONS: UKTaxAssumptions = {
  // Assumptions intended for rough estimates. We’ll show this clearly in UI.
  // For Jan 2026, the relevant tax year is typically 2025/26.
  taxYear: '2025-26',

  personalAllowance: 12_570,
  basicRateLimit: 50_270,
  higherRateLimit: 125_140,
  basicRate: 0.20,
  higherRate: 0.40,
  additionalRate: 0.45,

  // NI: using the post-Jan-2024 main rate reduction to 8% (commonly cited for 2024/25).
  // We treat thresholds as aligned to the tax bands for a first pass.
  niPrimaryThreshold: 12_570,
  niUpperEarningsLimit: 50_270,
  niMainRate: 0.08,
  niUpperRate: 0.02,
};

export type TakeHomeInput = {
  grossAnnualSalary: number;
};

export type TakeHomeBreakdown = {
  grossAnnual: number;
  taxableAnnual: number;
  incomeTaxAnnual: number;
  niAnnual: number;
  netAnnual: number;
  netMonthly: number;
};

function clamp0(n: number) {
  return Math.max(0, n);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function computeIncomeTaxAnnual(taxable: number, a: UKTaxAssumptions): number {
  const t = clamp0(taxable);

  // Bands are expressed as taxable income thresholds.
  const basicBand = clamp0(Math.min(t, a.basicRateLimit));
  const higherBand = clamp0(Math.min(t, a.higherRateLimit) - a.basicRateLimit);
  const additionalBand = clamp0(t - a.higherRateLimit);

  return basicBand * a.basicRate + higherBand * a.higherRate + additionalBand * a.additionalRate;
}

export function computeNIAAnnual(grossAnnual: number, a: UKTaxAssumptions): number {
  const g = clamp0(grossAnnual);

  const mainBand = clamp0(Math.min(g, a.niUpperEarningsLimit) - a.niPrimaryThreshold);
  const upperBand = clamp0(g - a.niUpperEarningsLimit);

  return mainBand * a.niMainRate + upperBand * a.niUpperRate;
}

export function computeTakeHome(input: TakeHomeInput, a: UKTaxAssumptions = DEFAULT_UK_ASSUMPTIONS): TakeHomeBreakdown {
  const grossAnnual = clamp0(input.grossAnnualSalary);
  const taxableAnnual = clamp0(grossAnnual - a.personalAllowance);
  const incomeTaxAnnual = computeIncomeTaxAnnual(taxableAnnual, a);
  const niAnnual = computeNIAAnnual(grossAnnual, a);
  const netAnnual = clamp0(grossAnnual - incomeTaxAnnual - niAnnual);

  return {
    grossAnnual: round2(grossAnnual),
    taxableAnnual: round2(taxableAnnual),
    incomeTaxAnnual: round2(incomeTaxAnnual),
    niAnnual: round2(niAnnual),
    netAnnual: round2(netAnnual),
    netMonthly: round2(netAnnual / 12),
  };
}
