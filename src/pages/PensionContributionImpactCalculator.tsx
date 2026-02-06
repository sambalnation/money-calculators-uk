import { useMemo, useState } from 'react';

import { HowItsCalculated } from '../components/HowItsCalculated';
import { computePensionContributionImpact, type PensionSchemeType } from '../lib/pensionContributionImpact';
import { DEFAULT_UK_ASSUMPTIONS } from '../lib/ukTax';
import { Disclosure, KeyValueList, NumberField, Panel, SelectField } from '../ui';

function fmtGBP(n: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtGBP0(n: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(n);
}

type EmployeeInputMode = 'percent' | 'monthlyAmount';

type SchemeMode = PensionSchemeType | 'notSure';

export function PensionContributionImpactCalculator() {
  const [salary, setSalary] = useState(60_000);

  const [employeeMode, setEmployeeMode] = useState<EmployeeInputMode>('percent');
  const [employeePct, setEmployeePct] = useState(5);
  const [employeeMonthlyAmount, setEmployeeMonthlyAmount] = useState(250);

  const [employerPct, setEmployerPct] = useState(3);

  const [schemeMode, setSchemeMode] = useState<SchemeMode>('notSure');

  const employeeGrossAnnualContribution = useMemo(() => {
    if (employeeMode === 'percent') return (salary * employeePct) / 100;
    return employeeMonthlyAmount * 12;
  }, [employeeMode, employeePct, employeeMonthlyAmount, salary]);

  const employerGrossAnnualContribution = useMemo(() => (salary * employerPct) / 100, [salary, employerPct]);

  const result = useMemo(
    () =>
      computePensionContributionImpact({
        grossAnnualSalary: salary,
        employeeGrossAnnualContribution,
        employerGrossAnnualContribution,
      }),
    [salary, employeeGrossAnnualContribution, employerGrossAnnualContribution],
  );

  const shownScenarios: PensionSchemeType[] =
    schemeMode === 'notSure' ? ['salarySacrifice', 'netPay', 'reliefAtSource'] : [schemeMode];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel
        title="Pension contribution impact"
        subtitle="Estimate the effect on take‑home pay and pension added. Includes a “not sure” mode."
      >
        <div className="grid gap-4">
          <NumberField label="Gross annual salary" prefix="£" value={salary} onChange={setSalary} hint="annual" />

          <SelectField
            label="Your contribution input"
            hint="we convert to an annual gross amount"
            value={employeeMode}
            onChange={setEmployeeMode}
            options={[
              { value: 'percent', label: '% of salary' },
              { value: 'monthlyAmount', label: '£/month' },
            ]}
          />

          {employeeMode === 'percent' ? (
            <NumberField label="Employee contribution" value={employeePct} onChange={setEmployeePct} hint="%" />
          ) : (
            <NumberField
              label="Employee contribution"
              prefix="£"
              value={employeeMonthlyAmount}
              onChange={setEmployeeMonthlyAmount}
              hint="per month"
            />
          )}

          <NumberField label="Employer contribution (optional)" value={employerPct} onChange={setEmployerPct} hint="%" />

          <KeyValueList
            items={[
              {
                label: 'Employee gross contribution (annual)',
                value: fmtGBP0(result.inputs.employeeGrossAnnualContribution),
                emphasis: 'strong',
              },
              {
                label: 'Employer contribution (annual)',
                value: fmtGBP0(result.inputs.employerGrossAnnualContribution),
                emphasis: 'strong',
              },
            ]}
          />

          <SelectField
            label="Pension scheme type"
            hint="if you’re unsure, we’ll show a range"
            value={schemeMode}
            onChange={setSchemeMode}
            options={[
              { value: 'notSure', label: 'Not sure (show range)' },
              { value: 'salarySacrifice', label: 'Salary sacrifice' },
              { value: 'netPay', label: 'Net pay arrangement' },
              { value: 'reliefAtSource', label: 'Relief at source' },
            ]}
          />

          <Disclosure title="Assumptions / caveats" defaultOpen>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              <li>Tax year assumptions: {DEFAULT_UK_ASSUMPTIONS.taxYear} (rough estimate).</li>
              <li>We ignore student loans, childcare, benefits, and tapering edge cases.</li>
              <li>Employer contributions are assumed to be additional (not matched/conditional).</li>
              <li>Relief-at-source assumes you claim no extra higher-rate relief here.</li>
            </ul>
            <p className="text-xs text-white/55">Educational estimates only — not financial advice.</p>
          </Disclosure>
        </div>
      </Panel>

      <Panel title="Results">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-6">
            <span className="text-sm text-white/65">Baseline net monthly (no pension)</span>
            <span className="text-2xl font-semibold text-neon-cyan tabular-nums">{fmtGBP(result.baseline.netMonthly)}</span>
          </div>

          <KeyValueList
            items={[
              { label: 'Baseline net monthly', value: fmtGBP(result.baseline.netMonthly), emphasis: 'accent' },
              { label: 'Baseline net annual', value: fmtGBP(result.baseline.netAnnual) },
            ]}
          />

          {shownScenarios.length === 1 ? (
            <ScenarioPanel scenario={result.scenarios[shownScenarios[0]]} />
          ) : (
            <Disclosure title="Not sure mode: compare scenarios" defaultOpen>
              <p className="text-xs text-white/55">
                Pick the one that matches your payslip/pension docs for the most accurate estimate.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead className="text-white/50">
                    <tr>
                      <th className="py-2">Scheme</th>
                      <th className="py-2">Net monthly</th>
                      <th className="py-2">Take-home change</th>
                      <th className="py-2">Pension added</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/75">
                    {shownScenarios.map((k) => {
                      const s = result.scenarios[k];
                      return (
                        <tr key={k} className="border-t border-white/10">
                          <td className="py-2 font-medium text-white/90">{s.label}</td>
                          <td className="py-2">{fmtGBP(s.netMonthly)}</td>
                          <td className="py-2 text-white/70">-{fmtGBP(s.takeHomeChangeMonthly)}/mo</td>
                          <td className="py-2 text-white/70">{fmtGBP0(s.totalPensionAddedAnnual)}/yr</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div>
                {shownScenarios.map((k) => (
                  <Disclosure key={k} title={`${result.scenarios[k].label} — notes`}>
                    <ul className="list-disc space-y-1 pl-5 text-xs">
                      {result.scenarios[k].notes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </Disclosure>
                ))}
              </div>
            </Disclosure>
          )}
        </div>
      </Panel>

      <div className="lg:col-span-2 pt-1">
        <HowItsCalculated
          bullets={[
            'We start with a baseline take-home estimate (income tax + employee NI) using the current tax year assumptions.',
            'Each pension scheme type changes taxable pay differently (e.g. salary sacrifice reduces gross pay; relief-at-source applies relief to your contribution).',
            'This tool is simplified: it does not include student loans, benefits, childcare, or claiming extra higher-rate relief.',
          ]}
          sources={[
            { label: 'GOV.UK — Pension tax relief', href: 'https://www.gov.uk/tax-on-your-private-pension/pension-tax-relief' },
            { label: 'GOV.UK — Income Tax rates', href: 'https://www.gov.uk/income-tax-rates' },
            { label: 'GOV.UK — National Insurance rates', href: 'https://www.gov.uk/national-insurance-rates-letters' },
          ]}
        />
      </div>
    </div>
  );
}

function ScenarioPanel({
  scenario,
}: {
  scenario: ReturnType<typeof computePensionContributionImpact>['scenarios'][PensionSchemeType];
}) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="text-sm font-semibold text-white/80">{scenario.label}</p>

      <div className="mt-3">
        <KeyValueList
          items={[
            { label: 'Net monthly (est.)', value: fmtGBP(scenario.netMonthly), emphasis: 'accent' },
            { label: 'Net annual (est.)', value: fmtGBP(scenario.netAnnual) },
            { label: 'Take-home change', value: `-${fmtGBP(scenario.takeHomeChangeMonthly)}/mo` },
            { label: 'Total pension added', value: `${fmtGBP0(scenario.totalPensionAddedAnnual)}/yr` },
          ]}
        />
      </div>

      <Disclosure title="Notes">
        <ul className="list-disc space-y-1 pl-5 text-xs">
          {scenario.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Disclosure>
    </div>
  );
}
