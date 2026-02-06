import { useMemo, useState } from 'react';

import { HowItsCalculated } from '../components/HowItsCalculated';
import { YearlyLineChart } from '../components/YearlyLineChart';
import { computeCompoundGrowth, type ContributionTiming } from '../lib/compoundGrowth';
import { Disclosure, KeyValueList, NumberField, Panel, SelectField, chartTokens } from '../ui';

function fmtGBP(n: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtPct(n: number) {
  return `${n.toFixed(2)}%`;
}

function timingLabel(t: ContributionTiming) {
  return t === 'startOfPeriod' ? 'Start of month (deposit then grow)' : 'End of month (grow then deposit)';
}

export function CompoundGrowthCalculator() {
  const [startingBalance, setStartingBalance] = useState(5_000);
  const [monthlyContribution, setMonthlyContribution] = useState(250);
  const [annualRatePct, setAnnualRatePct] = useState(6);
  const [annualFeePct, setAnnualFeePct] = useState(0.5);
  const [years, setYears] = useState(10);
  const [contributionTiming, setContributionTiming] = useState<ContributionTiming>('endOfPeriod');

  const result = useMemo(
    () =>
      computeCompoundGrowth({
        startingBalance,
        monthlyContribution,
        annualRatePct,
        annualFeePct,
        years,
        periodsPerYear: 12,
        contributionTiming,
      }),
    [startingBalance, monthlyContribution, annualRatePct, annualFeePct, years, contributionTiming],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Compound growth" subtitle="Savings/investing estimate with monthly contributions.">
        <div className="grid gap-4">
          <NumberField label="Starting balance" prefix="£" value={startingBalance} onChange={setStartingBalance} />
          <NumberField
            label="Monthly contribution"
            prefix="£"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            hint="per month"
          />
          <NumberField
            label="Annual growth rate (nominal)"
            value={annualRatePct}
            onChange={setAnnualRatePct}
            hint="% per year"
          />
          <NumberField label="Annual fee (platform/fund)" value={annualFeePct} onChange={setAnnualFeePct} hint="% per year" />
          <NumberField label="Time horizon" value={years} onChange={setYears} hint="years" inputMode="numeric" />

          <SelectField
            label="Contribution timing"
            hint="small difference, but start-of-month usually wins"
            value={contributionTiming}
            onChange={setContributionTiming}
            options={[
              { value: 'endOfPeriod', label: 'End of month' },
              { value: 'startOfPeriod', label: 'Start of month' },
            ]}
          />

          <Disclosure title="Assumptions" defaultOpen>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              <li>Constant annual growth rate ({fmtPct(result.inputs.annualRatePct)}) with monthly compounding.</li>
              <li>
                Simple fee model: an annual fee of {fmtPct(result.inputs.annualFeePct)} is charged evenly each month as a %
                of your balance.
              </li>
              <li>
                Contributions are applied: <span className="text-white/75">{timingLabel(contributionTiming)}</span>.
              </li>
              <li>Ignores taxes, inflation, and volatility (real investing is messier).</li>
            </ul>
            <p className="text-xs text-white/55">Educational estimates only — not financial advice.</p>
          </Disclosure>
        </div>
      </Panel>

      <Panel title="Results">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-6">
            <span className="text-sm text-white/65">Final balance (est.)</span>
            <span className="text-2xl font-semibold text-neon-cyan tabular-nums">{fmtGBP(result.finalBalance)}</span>
          </div>

          <KeyValueList
            items={[
              { label: 'Total contributed', value: fmtGBP(result.totalContributed) },
              { label: 'Total growth', value: fmtGBP(result.totalGrowth) },
            ]}
          />

          <Disclosure title="Balance over time" defaultOpen>
            <div>
              <YearlyLineChart
                years={result.yearly.map((r) => r.year)}
                valueFormatter={fmtGBP}
                series={[
                  {
                    label: 'End balance',
                    values: result.yearly.map((r) => r.endBalance),
                    borderColor: chartTokens.accentLine,
                    backgroundColor: chartTokens.accentFill,
                    fill: true,
                  },
                  {
                    label: 'Total contributed',
                    values: result.yearly.map((r) => r.totalContributed),
                    borderColor: chartTokens.neutralLine,
                    backgroundColor: chartTokens.neutralFill,
                    fill: false,
                  },
                ]}
              />

              <Disclosure title="Show table">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-xs">
                    <thead className="text-white/50">
                      <tr>
                        <th className="py-2">Year</th>
                        <th className="py-2">End balance</th>
                        <th className="py-2">Contributed</th>
                        <th className="py-2">Growth</th>
                      </tr>
                    </thead>
                    <tbody className="text-white/75">
                      {result.yearly.map((row) => (
                        <tr key={row.year} className="border-t border-white/10">
                          <td className="py-2">{row.year}</td>
                          <td className="py-2 font-medium text-white/90">{fmtGBP(row.endBalance)}</td>
                          <td className="py-2 text-white/70">{fmtGBP(row.totalContributed)}</td>
                          <td className="py-2 text-white/70">{fmtGBP(row.totalGrowth)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Disclosure>
            </div>
          </Disclosure>
        </div>
      </Panel>

      <div className="lg:col-span-2 pt-1">
        <HowItsCalculated
          bullets={[
            'We convert the annual growth rate into a monthly rate by dividing by 12 (simple, constant-rate model).',
            'Each month: apply growth, apply the fee (annual fee spread evenly across months), then add your contribution (timing selectable).',
            'Total growth is final balance minus starting balance minus total contributions.',
          ]}
        />
      </div>
    </div>
  );
}
