import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { NumberInput } from '../components/NumberInput';
import { computePensionContributionImpact, type PensionSchemeType } from '../lib/pensionContributionImpact';
import { DEFAULT_UK_ASSUMPTIONS } from '../lib/ukTax';

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
    <div className="grid gap-5 lg:grid-cols-2">
      <Card
        title="Pension contribution impact"
        subtitle="Estimate the effect on take‑home pay and pension added. Includes a “not sure” mode."
      >
        <div className="grid gap-4">
          <NumberInput label="Gross annual salary" prefix="£" value={salary} onChange={setSalary} hint="annual" />

          <div className="rounded-xl border border-white/10 bg-bg-900/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white/80">Your contribution input</p>
                <p className="text-xs text-white/50">We convert this to an annual gross contribution for the maths.</p>
              </div>
              <Segmented
                value={employeeMode}
                onChange={setEmployeeMode}
                options={[
                  { value: 'percent', label: '% of salary' },
                  { value: 'monthlyAmount', label: '£/month' },
                ]}
              />
            </div>

            <div className="mt-4 grid gap-4">
              {employeeMode === 'percent' ? (
                <NumberInput label="Employee contribution" value={employeePct} onChange={setEmployeePct} hint="%" />
              ) : (
                <NumberInput
                  label="Employee contribution"
                  prefix="£"
                  value={employeeMonthlyAmount}
                  onChange={setEmployeeMonthlyAmount}
                  hint="per month"
                />
              )}
              <NumberInput label="Employer contribution (optional)" value={employerPct} onChange={setEmployerPct} hint="%" />
            </div>

            <div className="mt-4 grid gap-2 text-xs text-white/60">
              <div className="flex items-center justify-between">
                <span>Employee gross contribution (annual)</span>
                <span className="font-medium text-white/80">{fmtGBP0(result.inputs.employeeGrossAnnualContribution)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Employer contribution (annual)</span>
                <span className="font-medium text-white/80">{fmtGBP0(result.inputs.employerGrossAnnualContribution)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-bg-900/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white/80">Pension scheme type</p>
                <p className="text-xs text-white/50">If you’re unsure, we’ll show a range.</p>
              </div>
              <select
                className="rounded-xl border border-white/10 bg-bg-900/70 px-3 py-2 text-sm text-white/80 outline-none"
                value={schemeMode}
                onChange={(e) => setSchemeMode(e.target.value as SchemeMode)}
              >
                <option value="notSure">Not sure (show range)</option>
                <option value="salarySacrifice">Salary sacrifice</option>
                <option value="netPay">Net pay arrangement</option>
                <option value="reliefAtSource">Relief at source</option>
              </select>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-bg-900/30 p-3 text-xs text-white/60">
              <p className="font-medium text-white/70">Assumptions / caveats</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Tax year assumptions: {DEFAULT_UK_ASSUMPTIONS.taxYear} (rough estimate).</li>
                <li>We ignore student loans, childcare, benefits, and tapering edge cases.</li>
                <li>Employer contributions are assumed to be additional (not matched/conditional).</li>
                <li>Relief-at-source assumes you claim no extra higher-rate relief here.</li>
              </ul>
              <p className="mt-2">Educational estimates only — not financial advice.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Results">
        <div className="space-y-3">
          <div className="grid gap-2 rounded-xl border border-white/10 bg-bg-900/40 p-4">
            <Row label="Baseline net monthly (no pension)" value={fmtGBP(result.baseline.netMonthly)} accent="text-neon-cyan" />
            <Row label="Baseline net annual" value={fmtGBP(result.baseline.netAnnual)} />
          </div>

          {shownScenarios.length === 1 ? (
            <ScenarioPanel scenario={result.scenarios[shownScenarios[0]]} />
          ) : (
            <div className="rounded-xl border border-white/10 bg-bg-900/40 p-4">
              <p className="text-sm font-medium text-white/80">Not sure mode: compare scenarios</p>
              <p className="mt-1 text-xs text-white/50">Pick the one that matches your payslip/pension docs for the most accurate estimate.</p>

              <div className="mt-3 overflow-x-auto">
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
                          <td className="py-2 font-medium text-white/85">{s.label}</td>
                          <td className="py-2">{fmtGBP(s.netMonthly)}</td>
                          <td className="py-2 text-white/70">-{fmtGBP(s.takeHomeChangeMonthly)}/mo</td>
                          <td className="py-2 text-white/70">{fmtGBP0(s.totalPensionAddedAnnual)}/yr</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 grid gap-2">
                {shownScenarios.map((k) => (
                  <details key={k} className="rounded-xl border border-white/10 bg-bg-900/30 p-3">
                    <summary className="cursor-pointer select-none text-xs font-medium text-white/70 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-900">
                      {result.scenarios[k].label} — notes
                    </summary>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-white/60">
                      {result.scenarios[k].notes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function ScenarioPanel({ scenario }: { scenario: ReturnType<typeof computePensionContributionImpact>['scenarios'][PensionSchemeType] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-bg-900/40 p-4">
      <p className="text-sm font-medium text-white/80">{scenario.label}</p>

      <div className="mt-3 grid gap-2">
        <Row label="Net monthly (est.)" value={fmtGBP(scenario.netMonthly)} accent="text-neon-cyan" />
        <Row label="Net annual (est.)" value={fmtGBP(scenario.netAnnual)} />
        <div className="my-1 h-px bg-white/10" />
        <Row label="Take-home change" value={`-${fmtGBP(scenario.takeHomeChangeMonthly)}/mo`} accent="text-neon-pink" />
        <Row label="Total pension added" value={`${fmtGBP0(scenario.totalPensionAddedAnnual)}/yr`} accent="text-neon-lime" />
      </div>

      <div className="mt-3 rounded-xl border border-white/10 bg-bg-900/30 p-3">
        <p className="text-xs font-medium text-white/70">Notes</p>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-white/60">
          {scenario.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
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

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-bg-900/70 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={
              'rounded-lg px-3 py-1.5 text-xs font-medium transition ' +
              (active
                ? 'bg-white/10 text-white shadow-neon'
                : 'text-white/60 hover:bg-white/5 hover:text-white/75')
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
