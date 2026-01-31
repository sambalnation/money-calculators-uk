import { computeTakeHome, DEFAULT_UK_ASSUMPTIONS, type TakeHomeBreakdown, type UKTaxAssumptions } from './ukTax';

export type PayRiseImpactInput = {
  currentGrossAnnualSalary: number;
  newGrossAnnualSalary: number;
};

export type PayRiseImpactResult = {
  inputs: {
    currentGrossAnnualSalary: number;
    newGrossAnnualSalary: number;
  };

  current: TakeHomeBreakdown;
  next: TakeHomeBreakdown;

  deltaGrossAnnual: number;
  deltaNetAnnual: number;
  deltaNetMonthly: number;

  keepRate: number; // deltaNet / deltaGross
  effectiveDeductionRate: number; // 1 - keepRate
};

function clamp0Finite(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function computePayRiseImpact(
  input: PayRiseImpactInput,
  a: UKTaxAssumptions = DEFAULT_UK_ASSUMPTIONS,
): PayRiseImpactResult {
  const currentGrossAnnualSalary = clamp0Finite(input.currentGrossAnnualSalary);
  const newGrossAnnualSalary = clamp0Finite(input.newGrossAnnualSalary);

  const current = computeTakeHome({ grossAnnualSalary: currentGrossAnnualSalary }, a);
  const next = computeTakeHome({ grossAnnualSalary: newGrossAnnualSalary }, a);

  const deltaGrossAnnual = next.grossAnnual - current.grossAnnual;
  const deltaNetAnnual = next.netAnnual - current.netAnnual;

  const keepRate = deltaGrossAnnual <= 0 ? 0 : deltaNetAnnual / deltaGrossAnnual;
  const effectiveDeductionRate = 1 - keepRate;

  return {
    inputs: {
      currentGrossAnnualSalary: round2(currentGrossAnnualSalary),
      newGrossAnnualSalary: round2(newGrossAnnualSalary),
    },
    current,
    next,
    deltaGrossAnnual: round2(deltaGrossAnnual),
    deltaNetAnnual: round2(deltaNetAnnual),
    deltaNetMonthly: round2(deltaNetAnnual / 12),
    keepRate: round2(keepRate),
    effectiveDeductionRate: round2(effectiveDeductionRate),
  };
}
