import { useMemo, useState } from 'react';

import { HowItsCalculated } from '../components/HowItsCalculated';
import { computePayRiseImpact } from '../lib/payRiseImpact';
import { DEFAULT_UK_ASSUMPTIONS } from '../lib/ukTax';
import { Disclosure, KeyValueList, NumberField, Panel } from '../ui';

function fmtGBP(n: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

export function PayRiseImpactCalculator() {
  const [currentSalary, setCurrentSalary] = useState(50_000);
  const [newSalary, setNewSalary] = useState(55_000);

  const result = useMemo(
    () => computePayRiseImpact({ currentGrossAnnualSalary: currentSalary, newGrossAnnualSalary: newSalary }),
    [currentSalary, newSalary],
  );

  const deltaGrossMonthly = result.deltaGrossAnnual / 12;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel
        title="Pay rise impact"
        subtitle="Rough estimate of how much of a gross pay rise you keep after income tax + employee NI (England/Wales/NI)."
      >
        <div className="grid gap-4">
          <NumberField label="Current gross annual salary" prefix="£" value={currentSalary} onChange={setCurrentSalary} />
          <NumberField label="New gross annual salary" prefix="£" value={newSalary} onChange={setNewSalary} />

          <Disclosure title="Assumptions" defaultOpen>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              <li>Tax year: {DEFAULT_UK_ASSUMPTIONS.taxYear}.</li>
              <li>Income tax + employee NI only (no pension, student loan, benefits, salary sacrifice, etc.).</li>
              <li>
                Same assumptions as the take-home calculator; this is a <span className="text-white/75">delta</span>{' '}
                view.
              </li>
            </ul>
            <p className="text-xs text-white/55">Educational estimates only — not financial advice.</p>
          </Disclosure>
        </div>
      </Panel>

      <Panel title="Results">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-6">
            <span className="text-sm text-white/65">Net change (monthly)</span>
            <span className="text-2xl font-semibold text-neon-cyan tabular-nums">{fmtGBP(result.deltaNetMonthly)}</span>
          </div>

          <KeyValueList
            items={[
              { label: 'Gross change (annual)', value: fmtGBP(result.deltaGrossAnnual) },
              { label: 'Gross change (monthly)', value: fmtGBP(deltaGrossMonthly) },
              { label: 'Net change (annual)', value: fmtGBP(result.deltaNetAnnual), emphasis: 'accent' },
              { label: 'Net change (monthly)', value: fmtGBP(result.deltaNetMonthly), emphasis: 'accent' },
            ]}
          />

          <KeyValueList
            className="border-t-0"
            items={[
              { label: 'You keep (effective)', value: fmtPct(result.keepRate), emphasis: 'accent' },
              { label: 'Lost to tax+NI (effective)', value: fmtPct(result.effectiveDeductionRate) },
            ]}
          />

          <Disclosure title="Before vs after (take‑home)">
            <div className="grid gap-4 divide-y divide-white/10 md:grid-cols-2 md:divide-y-0 md:divide-x">
              <div className="pt-3 md:pt-0 md:pr-6">
                <p className="text-xs font-semibold tracking-widest text-white/50">CURRENT</p>
                <div className="mt-2">
                  <KeyValueList
                    className="border-y-0"
                    items={[
                      { label: 'Net monthly (est.)', value: fmtGBP(result.current.netMonthly), emphasis: 'strong' },
                      { label: 'Income tax (annual)', value: fmtGBP(result.current.incomeTaxAnnual) },
                      { label: 'Employee NI (annual)', value: fmtGBP(result.current.niAnnual) },
                    ]}
                  />
                </div>
              </div>

              <div className="pt-3 md:pt-0 md:pl-6">
                <p className="text-xs font-semibold tracking-widest text-white/50">NEW</p>
                <div className="mt-2">
                  <KeyValueList
                    className="border-y-0"
                    items={[
                      { label: 'Net monthly (est.)', value: fmtGBP(result.next.netMonthly), emphasis: 'strong' },
                      { label: 'Income tax (annual)', value: fmtGBP(result.next.incomeTaxAnnual) },
                      { label: 'Employee NI (annual)', value: fmtGBP(result.next.niAnnual) },
                    ]}
                  />
                </div>
              </div>
            </div>
          </Disclosure>
        </div>
      </Panel>

      <div className="lg:col-span-2 pt-1">
        <HowItsCalculated
          bullets={[
            'We compute take-home for the current salary and the new salary using the same simplified UK tax/NI assumptions.',
            'Net change is the difference between the two take-home results (annual and monthly).',
            '“You keep” is net change divided by gross change (effective marginal keep rate for that specific pay rise).',
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
