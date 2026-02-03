import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { NumberInput } from '../components/NumberInput';
import { computeCompoundGrowth, type ContributionTiming } from '../lib/compoundGrowth';

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
  const [years, setYears] = useState(10);
  const [contributionTiming, setContributionTiming] = useState<ContributionTiming>('endOfPeriod');

  const result = useMemo(
    () =>
      computeCompoundGrowth({
        startingBalance,
        monthlyContribution,
        annualRatePct,
        years,
        periodsPerYear: 12,
        contributionTiming,
      }),
    [startingBalance, monthlyContribution, annualRatePct, years, contributionTiming],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Compound growth" subtitle="Savings / investing growth estimate with monthly contributions.">
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
            label="Annual growth rate (nominal)"
            value={annualRatePct}
            onChange={setAnnualRatePct}
            hint="% per year"
          />
          <NumberInput label="Time horizon" value={years} onChange={setYears} hint="years" />

          <div className="rounded-xl border border-white/10 bg-bg-900/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white/80">Contribution timing</p>
                <p className="text-xs text-white/50">
                  If you invest at the start of the month, you usually get a tiny boost vs end-of-month saving.
                </p>
              </div>
              <select
                className="rounded-xl border border-white/10 bg-bg-900/70 px-3 py-2 text-sm text-white/80 outline-none"
                value={contributionTiming}
                onChange={(e) => setContributionTiming(e.target.value as ContributionTiming)}
              >
                <option value="endOfPeriod">End of month</option>
                <option value="startOfPeriod">Start of month</option>
              </select>
            </div>

            <p className="mt-3 text-xs text-white/60">
              Currently selected: <span className="font-medium text-white/75">{timingLabel(contributionTiming)}</span>
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-bg-900/40 p-4 text-xs text-white/60">
            <p className="font-medium text-white/70">Assumptions (read me)</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Constant annual growth rate ({fmtPct(result.inputs.annualRatePct)}) with monthly compounding.</li>
              <li>Contributions are applied: <span className="text-white/70">{timingLabel(contributionTiming)}</span>.</li>
              <li>Ignores fees, taxes, inflation, and volatility (real investing is messier).</li>
            </ul>
            <p className="mt-3">
              Educational estimates only — not financial advice. For ISA/pension/tax specifics, your result will differ.
            </p>
          </div>
        </div>
      </Card>

      <Card title="Results">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Final balance (est.)</span>
            <span className="text-2xl font-semibold text-neon-cyan">{fmtGBP(result.finalBalance)}</span>
          </div>

          <div className="grid gap-2 rounded-xl border border-white/10 bg-bg-900/40 p-4">
            <Row label="Total contributed" value={fmtGBP(result.totalContributed)} accent="text-neon-lime" />
            <Row label="Total growth" value={fmtGBP(result.totalGrowth)} accent="text-neon-pink" />
          </div>

          <details className="rounded-xl border border-white/10 bg-bg-900/30 p-4">
            <summary className="cursor-pointer select-none text-sm font-medium text-white/70">Year-by-year breakdown</summary>
            <div className="mt-3 overflow-x-auto">
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
                      <td className="py-2 font-medium text-white/85">{fmtGBP(row.endBalance)}</td>
                      <td className="py-2 text-white/70">{fmtGBP(row.totalContributed)}</td>
                      <td className="py-2 text-white/70">{fmtGBP(row.totalGrowth)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </Card>
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
