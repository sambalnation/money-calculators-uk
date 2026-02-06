import { useMemo, useState } from 'react';

import { HowItsCalculated } from '../components/HowItsCalculated';
import { DEFAULT_UK_ASSUMPTIONS, computeTakeHome } from '../lib/ukTax';
import { Disclosure, KeyValueList, NumberField, Panel } from '../ui';

function fmtGBP(n: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(n);
}

export function TakeHomeCalculator() {
  const [salary, setSalary] = useState(60_000);

  const result = useMemo(() => computeTakeHome({ grossAnnualSalary: salary }), [salary]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel
        title="UK take‑home pay"
        subtitle="Rough estimate for England/Wales/NI. Shows income tax + employee NI only."
      >
        <div className="grid gap-4">
          <NumberField label="Gross annual salary" prefix="£" value={salary} onChange={setSalary} hint="annual" />

          <Disclosure title="Assumptions" defaultOpen>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              <li>Tax year: {DEFAULT_UK_ASSUMPTIONS.taxYear}</li>
              <li>Personal allowance: {fmtGBP(DEFAULT_UK_ASSUMPTIONS.personalAllowance)}</li>
              <li>Basic rate limit: {fmtGBP(DEFAULT_UK_ASSUMPTIONS.basicRateLimit)} (taxable)</li>
              <li>Higher rate limit: {fmtGBP(DEFAULT_UK_ASSUMPTIONS.higherRateLimit)} (taxable)</li>
              <li>
                NI main rate: {(DEFAULT_UK_ASSUMPTIONS.niMainRate * 100).toFixed(0)}% between{' '}
                {fmtGBP(DEFAULT_UK_ASSUMPTIONS.niPrimaryThreshold)} and {fmtGBP(DEFAULT_UK_ASSUMPTIONS.niUpperEarningsLimit)}
              </li>
            </ul>
            <p className="text-xs text-white/55">
              Educational estimate only — not financial advice. Verify using HMRC/payroll.
            </p>
          </Disclosure>
        </div>
      </Panel>

      <Panel title="Results">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-6">
            <span className="text-sm text-white/65">Net monthly (est.)</span>
            <span className="text-2xl font-semibold text-neon-cyan tabular-nums">{fmtGBP(result.netMonthly)}</span>
          </div>

          <KeyValueList
            items={[
              { label: 'Gross annual', value: fmtGBP(result.grossAnnual) },
              { label: 'Taxable (after allowance)', value: fmtGBP(result.taxableAnnual) },
              { label: 'Income tax (annual)', value: fmtGBP(result.incomeTaxAnnual) },
              { label: 'Employee NI (annual)', value: fmtGBP(result.niAnnual) },
              { label: 'Net annual', value: fmtGBP(result.netAnnual), emphasis: 'accent' },
            ]}
          />
        </div>
      </Panel>

      <div className="lg:col-span-2 pt-1">
        <HowItsCalculated
          bullets={[
            'Taxable pay is calculated as gross annual salary minus the personal allowance (simplified: no allowance tapering).',
            'Income tax is calculated by applying the basic/higher/additional rates to the relevant taxable bands.',
            'Employee Class 1 National Insurance is calculated from annualised thresholds (simplified model).',
            'Excludes pension contributions, student loans, benefits, childcare, salary sacrifice and other payslip items.',
          ]}
          sources={[
            { label: 'GOV.UK — Income Tax rates', href: 'https://www.gov.uk/income-tax-rates' },
            { label: 'GOV.UK — National Insurance rates', href: 'https://www.gov.uk/national-insurance-rates-letters' },
          ]}
        />
      </div>
    </div>
  );
}
