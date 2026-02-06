import { useMemo, useState } from 'react';

import { HowItsCalculated } from '../components/HowItsCalculated';
import { computeEmergencyFundRunway } from '../lib/emergencyFundRunway';
import { Disclosure, KeyValueList, NumberField, Panel } from '../ui';

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
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Emergency fund runway" subtitle="How long your emergency fund could cover essentials (monthly averages).">
        <div className="grid gap-4">
          <NumberField
            label="Emergency fund balance (cash)"
            prefix="£"
            value={emergencyFundBalance}
            onChange={setEmergencyFundBalance}
          />
          <NumberField
            label="Monthly essential spending"
            prefix="£"
            value={monthlyEssentialSpending}
            onChange={setMonthlyEssentialSpending}
            hint="rent/mortgage, bills, food, etc."
          />
          <NumberField
            label="Monthly income during emergency"
            prefix="£"
            value={monthlyIncomeDuringEmergency}
            onChange={setMonthlyIncomeDuringEmergency}
            hint="benefits/side income/etc."
          />

          <Disclosure title="Assumptions" defaultOpen>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              <li>
                Uses monthly averages: <span className="text-white/75">net burn = spending − income</span>.
              </li>
              <li>Ignores interest on cash, inflation, and any investment volatility.</li>
              <li>Doesn’t model one-off costs (car repairs) or one-off income (redundancy pay).</li>
            </ul>
            <p className="text-xs text-white/55">Educational estimates only — not financial advice.</p>
          </Disclosure>
        </div>
      </Panel>

      <Panel title="Results">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-6">
            <span className="text-sm text-white/65">Runway (months)</span>
            <span className="text-2xl font-semibold text-neon-cyan tabular-nums">{fmtMonths(result.runwayMonths)}</span>
          </div>

          <KeyValueList
            items={[
              { label: 'Net monthly burn', value: netBurnDisplay },
              { label: 'Runway (months)', value: fmtMonths(result.runwayMonths), emphasis: 'accent' },
              { label: 'Runway (weeks)', value: fmtWeeks(result.runwayWeeks) },
            ]}
          />

          {Number.isFinite(result.runwayMonths) ? (
            <p className="text-xs text-white/55">
              If your spending/income changes, your runway changes. Treat this as a planning baseline, not a promise.
            </p>
          ) : (
            <p className="text-xs text-white/55">
              If income covers essentials (or more), your runway is effectively unlimited in this simple model.
            </p>
          )}
        </div>
      </Panel>

      <div className="lg:col-span-2 pt-1">
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
