import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { HowItsCalculated } from '../components/HowItsCalculated';
import { NumberInput } from '../components/NumberInput';
import { YearlyLineChart } from '../components/YearlyLineChart';
import { computeInflationAdjustedGrowth } from '../lib/inflationAdjustedGrowth';

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
    () => computeInflationAdjustedGrowth({ startingBalance, monthlyContribution, annualReturnPct, annualInflationPct, years }),
    [startingBalance, monthlyContribution, annualReturnPct, annualInflationPct, years],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card
        title="Inflation-adjusted growth"
        subtitle="Nominal vs real (today’s £) estimate with monthly contributions."
      >
        <div className="grid gap-4">
          <NumberInput label="Starting balance" prefix="£" value={startingBalance} onChange={setStartingBalance} />
          <NumberInput
            label="Monthly contribution"
            prefix="£"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            hint="per month"
          />
          <NumberInput
            label="Annual return (nominal)"
            value={annualReturnPct}
            onChange={setAnnualReturnPct}
            hint="% per year"
          />
          <NumberInput
            label="Annual inflation"
            value={annualInflationPct}
            onChange={setAnnualInflationPct}
            hint="% per year"
          />
          <NumberInput label="Time horizon" value={years} onChange={setYears} hint="years" />

          <div className="rounded-xl border border-white/10 bg-bg-900/40 p-4 text-xs text-white/60">
            <p className="font-medium text-white/70">Assumptions (read me)</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Constant nominal return ({fmtPct(result.inputs.annualReturnPct)}) with monthly compounding.</li>
              <li>Constant inflation ({fmtPct(result.inputs.annualInflationPct)}), used to convert to <span className="text-white/70">today’s pounds</span>.</li>
              <li>Contributions happen at the <span className="text-white/70">end</span> of each month.</li>
              <li>Ignores fees, taxes, volatility and sequence risk.</li>
            </ul>
            <p className="mt-3">
              Educational estimates only — not financial advice. Inflation is unpredictable; real returns can be negative.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Results">
        <div className="space-y-3">
          <div className="grid gap-2 rounded-xl border border-white/10 bg-bg-900/40 p-4">
            <Row label="Final (nominal)" value={fmtGBP(result.finalBalanceNominal)} accent="text-neon-cyan" />
            <Row label="Final (real, today’s £)" value={fmtGBP(result.finalBalanceReal)} accent="text-neon-pink" />
            <Row label="Total contributed" value={fmtGBP(result.totalContributedNominal)} accent="text-neon-lime" />
          </div>

          <details className="rounded-xl border border-white/10 bg-bg-900/30 p-4" open>
            <summary className="cursor-pointer select-none text-sm font-medium text-white/70 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-900">Value over time (nominal vs real)</summary>
            <div className="mt-3">
              <YearlyLineChart
                years={result.yearly.map((r) => r.year)}
                valueFormatter={fmtGBP}
                series={[
                  {
                    label: 'Nominal end',
                    values: result.yearly.map((r) => r.endBalanceNominal),
                    borderColor: 'rgba(34, 211, 238, 0.95)',
                    backgroundColor: 'rgba(34, 211, 238, 0.12)',
                    fill: false,
                  },
                  {
                    label: 'Real end (today’s £)',
                    values: result.yearly.map((r) => r.endBalanceReal),
                    borderColor: 'rgba(236, 72, 153, 0.95)',
                    backgroundColor: 'rgba(236, 72, 153, 0.10)',
                    fill: false,
                  },
                ]}
              />

              <details className="mt-4 rounded-xl border border-white/10 bg-bg-900/20 p-3">
                <summary className="cursor-pointer select-none text-xs font-medium text-white/70 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-900">Show table</summary>
                <div className="mt-3 overflow-x-auto">
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
                          <td className="py-2 font-medium text-white/85">{fmtGBP(row.endBalanceNominal)}</td>
                          <td className="py-2 text-white/70">{fmtGBP(row.endBalanceReal)}</td>
                          <td className="py-2 text-white/70">{fmtGBP(row.totalContributedNominal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </div>
          </details>
        </div>
      </Card>

      <div className="lg:col-span-2">
        <HowItsCalculated
          bullets={[
            'We compound the balance monthly using the nominal annual return divided by 12 (constant-rate model).',
            'Each month: grow the balance, then add the end-of-month contribution.',
            '“Real” (today’s £) values are calculated by deflating the nominal balance by cumulative inflation.',
          ]}
          sources={[
            { label: 'ONS — Inflation and price indices (background)', href: 'https://www.ons.gov.uk/economy/inflationandpriceindices' },
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
