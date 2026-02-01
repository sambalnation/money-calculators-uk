import { DEFAULT_UK_ASSUMPTIONS, computeIncomeTaxAnnual, computeNIAAnnual, computeTakeHome, type UKTaxAssumptions } from './ukTax';

export type PensionSchemeType = 'salarySacrifice' | 'netPay' | 'reliefAtSource';

export type PensionContributionInput = {
  grossAnnualSalary: number;

  // Employee contribution expressed as a gross annual amount.
  // (If the UI collects % or £/month, convert before calling.)
  employeeGrossAnnualContribution: number;

  // Employer contribution expressed as a gross annual amount.
  employerGrossAnnualContribution: number;
};

export type PensionScenario = {
  schemeType: PensionSchemeType;
  label: string;

  baselineNetAnnual: number;
  netAnnual: number;
  netMonthly: number;

  takeHomeChangeAnnual: number; // baselineNet - net
  takeHomeChangeMonthly: number;

  employeeGrossAnnualContribution: number;
  employerGrossAnnualContribution: number;
  totalPensionAddedAnnual: number;

  notes: string[];
};

export type PensionContributionImpactResult = {
  inputs: PensionContributionInput;
  baseline: ReturnType<typeof computeTakeHome>;
  scenarios: Record<PensionSchemeType, PensionScenario>;
};

function clamp0(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function clampContribution(contribution: number, salary: number) {
  return Math.min(clamp0(contribution), clamp0(salary));
}

export function computePensionContributionImpact(
  input: PensionContributionInput,
  a: UKTaxAssumptions = DEFAULT_UK_ASSUMPTIONS,
): PensionContributionImpactResult {
  const grossAnnualSalary = clamp0(input.grossAnnualSalary);
  const employeeGrossAnnualContribution = clampContribution(input.employeeGrossAnnualContribution, grossAnnualSalary);
  const employerGrossAnnualContribution = clamp0(input.employerGrossAnnualContribution);

  const baseline = computeTakeHome({ grossAnnualSalary }, a);

  // 1) Salary sacrifice: employee gives up salary; employer pays into pension.
  const sacrificedGross = clamp0(grossAnnualSalary - employeeGrossAnnualContribution);
  const ssBreakdown = computeTakeHome({ grossAnnualSalary: sacrificedGross }, a);

  const salarySacrifice: PensionScenario = {
    schemeType: 'salarySacrifice',
    label: 'Salary sacrifice (if available)',
    baselineNetAnnual: baseline.netAnnual,
    netAnnual: ssBreakdown.netAnnual,
    netMonthly: ssBreakdown.netMonthly,
    takeHomeChangeAnnual: round2(baseline.netAnnual - ssBreakdown.netAnnual),
    takeHomeChangeMonthly: round2((baseline.netAnnual - ssBreakdown.netAnnual) / 12),
    employeeGrossAnnualContribution,
    employerGrossAnnualContribution,
    totalPensionAddedAnnual: round2(employeeGrossAnnualContribution + employerGrossAnnualContribution),
    notes: [
      'Reduces income tax AND employee NI because your taxable/NI-able salary is lower.',
      'Some employers also share their NI saving (not included here).',
    ],
  };

  // 2) Net pay arrangement: contribution taken before income tax, after NI.
  // We model this as: income tax uses (gross - contribution - allowance), NI uses gross.
  const taxableAfterAllowanceNetPay = clamp0(grossAnnualSalary - employeeGrossAnnualContribution - a.personalAllowance);
  const taxNetPay = computeIncomeTaxAnnual(taxableAfterAllowanceNetPay, a);
  const niNetPay = computeNIAAnnual(grossAnnualSalary, a);
  const netPayNetAnnual = clamp0(grossAnnualSalary - taxNetPay - niNetPay - employeeGrossAnnualContribution);

  const netPay: PensionScenario = {
    schemeType: 'netPay',
    label: 'Net pay arrangement (common workplace pensions)',
    baselineNetAnnual: baseline.netAnnual,
    netAnnual: round2(netPayNetAnnual),
    netMonthly: round2(netPayNetAnnual / 12),
    takeHomeChangeAnnual: round2(baseline.netAnnual - netPayNetAnnual),
    takeHomeChangeMonthly: round2((baseline.netAnnual - netPayNetAnnual) / 12),
    employeeGrossAnnualContribution,
    employerGrossAnnualContribution,
    totalPensionAddedAnnual: round2(employeeGrossAnnualContribution + employerGrossAnnualContribution),
    notes: ['Reduces income tax, but does NOT reduce employee NI in this simplified model.'],
  };

  // 3) Relief at source: employee pays net contribution; provider adds 20% basic-rate relief.
  // We assume the user input is the gross contribution amount.
  // Take-home cost is 80% of the gross amount (ignoring higher-rate reclamation).
  const employeeNetPaid = round2(employeeGrossAnnualContribution * 0.8);
  const reliefAtSourceNetAnnual = clamp0(baseline.netAnnual - employeeNetPaid);

  const reliefAtSource: PensionScenario = {
    schemeType: 'reliefAtSource',
    label: 'Relief at source (e.g. some personal pensions/SIPPs)',
    baselineNetAnnual: baseline.netAnnual,
    netAnnual: round2(reliefAtSourceNetAnnual),
    netMonthly: round2(reliefAtSourceNetAnnual / 12),
    takeHomeChangeAnnual: round2(baseline.netAnnual - reliefAtSourceNetAnnual),
    takeHomeChangeMonthly: round2((baseline.netAnnual - reliefAtSourceNetAnnual) / 12),
    employeeGrossAnnualContribution,
    employerGrossAnnualContribution,
    totalPensionAddedAnnual: round2(employeeGrossAnnualContribution + employerGrossAnnualContribution),
    notes: [
      'We assume you pay 80% from your take‑home pay, and the pension provider adds 20% basic‑rate tax relief.',
      'If you pay higher/additional rate tax, you may be able to claim extra relief separately (not modelled).',
    ],
  };

  return {
    inputs: {
      grossAnnualSalary: round2(grossAnnualSalary),
      employeeGrossAnnualContribution: round2(employeeGrossAnnualContribution),
      employerGrossAnnualContribution: round2(employerGrossAnnualContribution),
    },
    baseline,
    scenarios: {
      salarySacrifice,
      netPay,
      reliefAtSource,
    },
  };
}
