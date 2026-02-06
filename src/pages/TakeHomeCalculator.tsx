import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { HowItsCalculated } from '../components/HowItsCalculated';
import { NumberInput } from '../components/NumberInput';
import { computeTakeHome, DEFAULT_UK_ASSUMPTIONS } from '../lib/ukTax';

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
    <div className="grid gap-5 lg:grid-cols-2">
      <Card
        title="UK Take‑Home Pay"
        subtitle="Rough estimate for England/Wales/NI. Shows income tax + employee NI only."
      >
        <div className="grid gap-4">
          <NumberInput label="Gross annual salary" prefix="£" value={salary} onChange={setSalary} hint="annual" />

          <div className="rounded-xl border border-white/10 bg-bg-900/40 p-4 text-xs text-white/60">
            <p className="font-medium text-white/70">Assumptions</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Tax year: {DEFAULT_UK_ASSUMPTIONS.taxYear}</li>
              <li>Personal allowance: {fmtGBP(DEFAULT_UK_ASSUMPTIONS.personalAllowance)}</li>
              <li>Basic rate limit: {fmtGBP(DEFAULT_UK_ASSUMPTIONS.basicRateLimit)} (taxable)</li>
              <li>Higher rate limit: {fmtGBP(DEFAULT_UK_ASSUMPTIONS.higherRateLimit)} (taxable)</li>
              <li>NI main rate: {(DEFAULT_UK_ASSUMPTIONS.niMainRate * 100).toFixed(0)}% between {fmtGBP(DEFAULT_UK_ASSUMPTIONS.niPrimaryThreshold)} and {fmtGBP(DEFAULT_UK_ASSUMPTIONS.niUpperEarningsLimit)}</li>
            </ul>
            <p className="mt-3">
              This is educational estimation, not financial advice. Verify using HMRC/payroll.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Results">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Net monthly (est.)</span>
            <span className="text-2xl font-semibold text-neon-cyan">{fmtGBP(result.netMonthly)}</span>
          </div>

          <div className="grid gap-2 rounded-xl border border-white/10 bg-bg-900/40 p-4">
            <Row label="Gross annual" value={fmtGBP(result.grossAnnual)} />
            <Row label="Taxable (after allowance)" value={fmtGBP(result.taxableAnnual)} />
            <Row label="Income tax (annual)" value={fmtGBP(result.incomeTaxAnnual)} accent="text-neon-pink" />
            <Row label="Employee NI (annual)" value={fmtGBP(result.niAnnual)} accent="text-neon-purple" />
            <div className="my-1 h-px bg-white/10" />
            <Row label="Net annual" value={fmtGBP(result.netAnnual)} accent="text-neon-cyan" />
          </div>
        </div>
      </Card>

      <div className="lg:col-span-2">
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

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-sm text-white/60">{label}</span>
      <span className={`text-sm font-medium ${accent || 'text-white/85'}`}>{value}</span>
    </div>
  );
}
