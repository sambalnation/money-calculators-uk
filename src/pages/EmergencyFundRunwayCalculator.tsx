import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { HowItsCalculated } from '../components/HowItsCalculated';
import { NumberInput } from '../components/NumberInput';
import { computeEmergencyFundRunway } from '../lib/emergencyFundRunway';

function fmtGBP(n: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtMonths(n: number) {
  if (!Number.isFinite(n)) return '∞';
  if (n < 0.05) return '<0.1';
  return n.toFixed(1);
}

function fmtWeeks(n: number) {
  if (!Number.isFinite(n)) return '∞';
  if (n < 0.5) return '<0.5';
  return n.toFixed(1);
}

export function EmergencyFundRunwayCalculator() {
  const [emergencyFundBalance, setEmergencyFundBalance] = useState(10_000);
  const [monthlyEssentialSpending, setMonthlyEssentialSpending] = useState(2_000);
  const [monthlyIncomeDuringEmergency, setMonthlyIncomeDuringEmergency] = useState(0);

  const result = useMemo(
    () => computeEmergencyFundRunway({ emergencyFundBalance, monthlyEssentialSpending, monthlyIncomeDuringEmergency }),
    [emergencyFundBalance, monthlyEssentialSpending, monthlyIncomeDuringEmergency],
  );

  const netBurnDisplay = result.netMonthlyBurn <= 0 ? '£0 (or less)' : fmtGBP(result.netMonthlyBurn);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card
        title="Emergency fund runway"
        subtitle="How long your emergency fund could cover your essentials (monthly averages)."
      >
        <div className="grid gap-4">
          <NumberInput
            label="Emergency fund balance (cash)"
            prefix="£"
            value={emergencyFundBalance}
            onChange={setEmergencyFundBalance}
          />
          <NumberInput
            label="Monthly essential spending"
            prefix="£"
            value={monthlyEssentialSpending}
            onChange={setMonthlyEssentialSpending}
            hint="rent/mortgage, bills, food, etc."
          />
          <NumberInput
            label="Monthly income during emergency"
            prefix="£"
            value={monthlyIncomeDuringEmergency}
            onChange={setMonthlyIncomeDuringEmergency}
            hint="benefits/side income/etc."
          />

          <div className="border-t border-white/10 pt-4 text-xs text-white/60">
            <p className="font-medium text-white/70">Assumptions (read me)</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>
                Uses monthly averages: <span className="text-white/70">net burn = spending − income</span>.
              </li>
              <li>Ignores interest on cash, inflation, and any investment volatility.</li>
              <li>Doesn’t model one-off costs (car repairs) or one-off income (redundancy pay).</li>
            </ul>
            <p className="mt-3">Educational estimates only — not financial advice.</p>
          </div>
        </div>
      </Card>

      <Card title="Results">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Net monthly burn</span>
            <span className="text-xl font-semibold text-neon-pink">{netBurnDisplay}</span>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            <div className="py-2">
              <Row label="Runway (months)" value={fmtMonths(result.runwayMonths)} accent="text-neon-cyan" />
            </div>
            <div className="py-2">
              <Row label="Runway (weeks)" value={fmtWeeks(result.runwayWeeks)} accent="text-neon-lime" />
            </div>
          </div>

          {Number.isFinite(result.runwayMonths) ? (
            <p className="text-xs text-white/50">
              If your spending/income changes, your runway changes. Treat this as a planning baseline, not a promise.
            </p>
          ) : (
            <p className="text-xs text-white/50">
              If income covers essentials (or more), your cash runway is effectively unlimited in this simple model.
            </p>
          )}
        </div>
      </Card>

      <div className="lg:col-span-2 pt-2">
        <HowItsCalculated
          bullets={[
            'Net monthly burn is calculated as essential spending minus income during the emergency.',
            'Runway (months) is emergency fund balance divided by net monthly burn (∞ if burn is zero or below).',
            'Runway (weeks) converts months to weeks using 52/12.',
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
