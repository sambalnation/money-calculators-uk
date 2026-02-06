import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { NumberInput } from '../components/NumberInput';
import { computePayRiseImpact } from '../lib/payRiseImpact';
import { DEFAULT_UK_ASSUMPTIONS } from '../lib/ukTax';

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
    <div className="grid gap-5 lg:grid-cols-2">
      <Card
        title="Pay rise impact"
        subtitle="Rough estimate of how much of a gross pay rise you keep after income tax + employee NI (England/Wales/NI)."
      >
        <div className="grid gap-4">
          <NumberInput label="Current gross annual salary" prefix="£" value={currentSalary} onChange={setCurrentSalary} />
          <NumberInput label="New gross annual salary" prefix="£" value={newSalary} onChange={setNewSalary} />

          <div className="rounded-xl border border-white/10 bg-bg-900/40 p-4 text-xs text-white/60">
            <p className="font-medium text-white/70">Assumptions (read me)</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Tax year: {DEFAULT_UK_ASSUMPTIONS.taxYear}.</li>
              <li>Income tax + employee NI only (no pension, student loan, benefits, salary sacrifice, etc.).</li>
              <li>Same assumptions as the take-home calculator; this is a <span className="text-white/70">delta</span> view.</li>
            </ul>
            <p className="mt-3">Educational estimates only — not financial advice.</p>
          </div>
        </div>
      </Card>

      <Card title="Results">
        <div className="space-y-3">
          <div className="grid gap-2 rounded-xl border border-white/10 bg-bg-900/40 p-4">
            <Row label="Gross change (annual)" value={fmtGBP(result.deltaGrossAnnual)} accent="text-white/85" />
            <Row label="Gross change (monthly)" value={fmtGBP(deltaGrossMonthly)} accent="text-white/70" />
            <div className="my-1 h-px bg-white/10" />
            <Row label="Net change (annual)" value={fmtGBP(result.deltaNetAnnual)} accent="text-neon-cyan" />
            <Row label="Net change (monthly)" value={fmtGBP(result.deltaNetMonthly)} accent="text-neon-cyan" />
          </div>

          <div className="grid gap-2 rounded-xl border border-white/10 bg-bg-900/40 p-4">
            <Row label="You keep (effective)" value={fmtPct(result.keepRate)} accent="text-neon-lime" />
            <Row label="Lost to tax+NI (effective)" value={fmtPct(result.effectiveDeductionRate)} accent="text-neon-pink" />
          </div>

          <details className="rounded-xl border border-white/10 bg-bg-900/30 p-4">
            <summary className="cursor-pointer select-none text-sm font-medium text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-900">Before vs after (take-home)</summary>
            <div className="mt-3 grid gap-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-bg-900/40 p-4">
                <p className="text-xs font-semibold tracking-widest text-white/50">CURRENT</p>
                <div className="mt-2 grid gap-1">
                  <SmallRow label="Net monthly (est.)" value={fmtGBP(result.current.netMonthly)} />
                  <SmallRow label="Income tax (annual)" value={fmtGBP(result.current.incomeTaxAnnual)} />
                  <SmallRow label="Employee NI (annual)" value={fmtGBP(result.current.niAnnual)} />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-bg-900/40 p-4">
                <p className="text-xs font-semibold tracking-widest text-white/50">NEW</p>
                <div className="mt-2 grid gap-1">
                  <SmallRow label="Net monthly (est.)" value={fmtGBP(result.next.netMonthly)} />
                  <SmallRow label="Income tax (annual)" value={fmtGBP(result.next.incomeTaxAnnual)} />
                  <SmallRow label="Employee NI (annual)" value={fmtGBP(result.next.niAnnual)} />
                </div>
              </div>
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

function SmallRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-xs text-white/60">{label}</span>
      <span className="text-xs font-medium text-white/80">{value}</span>
    </div>
  );
}
