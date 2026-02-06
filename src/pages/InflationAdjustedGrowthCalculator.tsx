import { useMemo, useState } from 'react';

import { HowItsCalculated } from '../components/HowItsCalculated';
import { YearlyLineChart } from '../components/YearlyLineChart';
import { computeInflationAdjustedGrowth } from '../lib/inflationAdjustedGrowth';
import { Disclosure, KeyValueList, NumberField, Panel, chartTokens } from '../ui';

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

export function InflationAdjustedGrowthCalculator() {
  const [startingBalance, setStartingBalance] = useState(5_000);
  const [monthlyContribution, setMonthlyContribution] = useState(250);
  const [annualReturnPct, setAnnualReturnPct] = useState(6);
  const [annualInflationPct, setAnnualInflationPct] = useState(2.5);
  const [years, setYears] = useState(10);

  const result = useMemo(
    () =>
      computeInflationAdjustedGrowth({
        startingBalance,
        monthlyContribution,
        annualReturnPct,
        annualInflationPct,
        years,
      }),
    [startingBalance, monthlyContribution, annualReturnPct, annualInflationPct, years],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Inflation‑adjusted growth" subtitle="Nominal vs real (today’s £) estimate with monthly contributions.">
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
            label="Annual return (nominal)"
            value={annualReturnPct}
            onChange={setAnnualReturnPct}
            hint="% per year"
          />
          <NumberField label="Annual inflation" value={annualInflationPct} onChange={setAnnualInflationPct} hint="% per year" />
          <NumberField label="Time horizon" value={years} onChange={setYears} hint="years" inputMode="numeric" />

          <Disclosure title="Assumptions" defaultOpen>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              <li>Constant nominal return ({fmtPct(result.inputs.annualReturnPct)}) with monthly compounding.</li>
              <li>
                Constant inflation ({fmtPct(result.inputs.annualInflationPct)}), used to convert to{' '}
                <span className="text-white/75">today’s pounds</span>.
              </li>
              <li>
                Contributions happen at the <span className="text-white/75">end</span> of each month.
              </li>
              <li>Ignores fees, taxes, volatility and sequence risk.</li>
            </ul>
            <p className="text-xs text-white/55">
              Educational estimates only — not financial advice. Inflation is unpredictable; real returns can be negative.
            </p>
          </Disclosure>
        </div>
      </Panel>

      <Panel title="Results">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-6">
            <span className="text-sm text-white/65">Final value (real, today’s £)</span>
            <span className="text-2xl font-semibold text-neon-cyan tabular-nums">{fmtGBP(result.finalBalanceReal)}</span>
          </div>

          <KeyValueList
            items={[
              { label: 'Final (nominal)', value: fmtGBP(result.finalBalanceNominal) },
              { label: 'Final (real, today’s £)', value: fmtGBP(result.finalBalanceReal), emphasis: 'accent' },
              { label: 'Total contributed', value: fmtGBP(result.totalContributedNominal) },
            ]}
          />

          <Disclosure title="Value over time (nominal vs real)" defaultOpen>
            <div>
              <YearlyLineChart
                years={result.yearly.map((r) => r.year)}
                valueFormatter={fmtGBP}
                series={[
                  {
                    label: 'Nominal end',
                    values: result.yearly.map((r) => r.endBalanceNominal),
                    borderColor: chartTokens.neutralLine,
                    backgroundColor: chartTokens.neutralFill,
                    fill: false,
                  },
                  {
                    label: 'Real end (today’s £)',
                    values: result.yearly.map((r) => r.endBalanceReal),
                    borderColor: chartTokens.accentLine,
                    backgroundColor: chartTokens.accentFill,
                    fill: false,
                  },
                ]}
              />

              <Disclosure title="Show table">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-xs">
                    <thead className="text-white/50">
                      <tr>
                        <th className="py-2">Year</th>
                        <th className="py-2">Nominal end</th>
                        <th className="py-2">Real end</th>
                        <th className="py-2">Contributed</th>
                      </tr>
                    </thead>
                    <tbody className="text-white/75">
                      {result.yearly.map((row) => (
                        <tr key={row.year} className="border-t border-white/10">
                          <td className="py-2">{row.year}</td>
                          <td className="py-2 font-medium text-white/90">{fmtGBP(row.endBalanceNominal)}</td>
                          <td className="py-2 text-white/75">{fmtGBP(row.endBalanceReal)}</td>
                          <td className="py-2 text-white/70">{fmtGBP(row.totalContributedNominal)}</td>
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
            'We compound the balance monthly using the nominal annual return divided by 12 (constant-rate model).',
            'Each month: grow the balance, then add the end-of-month contribution.',
            '“Real” (today’s £) values are calculated by deflating the nominal balance by cumulative inflation.',
          ]}
          sources={[
            {
              label: 'ONS — Inflation and price indices (background)',
              href: 'https://www.ons.gov.uk/economy/inflationandpriceindices',
            },
          ]}
        />
      </div>
    </div>
  );
}
