import { useEffect, useMemo, useState } from 'react';
import { Tabs, type TabItem } from './components/Tabs';
import { CompoundGrowthCalculator } from './pages/CompoundGrowthCalculator';
import { InflationAdjustedGrowthCalculator } from './pages/InflationAdjustedGrowthCalculator';
import { EmergencyFundRunwayCalculator } from './pages/EmergencyFundRunwayCalculator';
import { PayRiseImpactCalculator } from './pages/PayRiseImpactCalculator';
import { PensionContributionImpactCalculator } from './pages/PensionContributionImpactCalculator';
import { TakeHomeCalculator } from './pages/TakeHomeCalculator';

type ToolId = 'takehome' | 'compound' | 'inflation' | 'emergency' | 'payrise' | 'pension';

function parseToolFromHash(): ToolId | null {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  const tool = params.get('tool') as ToolId | null;
  return tool;
}

function setToolHash(tool: ToolId) {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  params.set('tool', tool);
  window.location.hash = params.toString();
}

function formatLastUpdated(iso: string) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function App() {
  const items: TabItem<ToolId>[] = useMemo(
    () => [
      { id: 'takehome', label: 'Take‑home', content: <TakeHomeCalculator /> },
      { id: 'compound', label: 'Compound growth', content: <CompoundGrowthCalculator /> },
      { id: 'inflation', label: 'Inflation‑adjusted', content: <InflationAdjustedGrowthCalculator /> },
      { id: 'emergency', label: 'Emergency fund', content: <EmergencyFundRunwayCalculator /> },
      { id: 'payrise', label: 'Pay rise', content: <PayRiseImpactCalculator /> },
      { id: 'pension', label: 'Pension', content: <PensionContributionImpactCalculator /> },
    ],
    [],
  );

  const [active, setActive] = useState<ToolId>(() => parseToolFromHash() ?? 'takehome');

  useEffect(() => {
    const onHash = () => {
      const next = parseToolFromHash();
      if (next) setActive(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    setToolHash(active);
  }, [active]);

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-6">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-neon">
            <span className="h-2 w-2 rounded-full bg-neon-cyan" />
            <span className="text-xs font-semibold tracking-widest text-white/70">MONEY CALCULATORS UK</span>
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            UK money calculators, <span className="text-neon-cyan">done right</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/60">
            Fast, no-login calculators for UK taxes and savings. Educational estimates only — not financial advice.
          </p>
        </header>

        <main className="space-y-6">
          <Tabs items={items} activeId={active} onChange={setActive} />

          <section id="method" className="scroll-mt-24 rounded-2xl border border-white/10 bg-bg-900 p-5">
            <h2 className="text-lg font-semibold">Method &amp; sources</h2>
            <p className="mt-2 max-w-3xl text-sm text-white/60">
              These calculators run entirely in your browser (no accounts, no server-side computation). Where a tool uses UK tax
              thresholds, we link the relevant GOV.UK/HMRC guidance.
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-white/70 md:grid-cols-2">
              <li className="rounded-xl border border-white/10 bg-bg-950/60 p-3">
                Income Tax rates (GOV.UK):{' '}
                <a className="underline decoration-white/20 underline-offset-4 hover:decoration-white/40" href="https://www.gov.uk/income-tax-rates" target="_blank" rel="noreferrer">
                  gov.uk/income-tax-rates
                </a>
              </li>
              <li className="rounded-xl border border-white/10 bg-bg-950/60 p-3">
                National Insurance rates (GOV.UK):{' '}
                <a className="underline decoration-white/20 underline-offset-4 hover:decoration-white/40" href="https://www.gov.uk/national-insurance-rates-letters" target="_blank" rel="noreferrer">
                  gov.uk/national-insurance-rates-letters
                </a>
              </li>
              <li className="rounded-xl border border-white/10 bg-bg-950/60 p-3">
                Pension tax relief (GOV.UK):{' '}
                <a className="underline decoration-white/20 underline-offset-4 hover:decoration-white/40" href="https://www.gov.uk/tax-on-your-private-pension/pension-tax-relief" target="_blank" rel="noreferrer">
                  gov.uk/.../pension-tax-relief
                </a>
              </li>
              <li className="rounded-xl border border-white/10 bg-bg-950/60 p-3">
                UK inflation statistics (ONS):{' '}
                <a className="underline decoration-white/20 underline-offset-4 hover:decoration-white/40" href="https://www.ons.gov.uk/economy/inflationandpriceindices" target="_blank" rel="noreferrer">
                  ons.gov.uk/.../inflationandpriceindices
                </a>
              </li>
            </ul>
            <p className="mt-3 text-xs text-white/50">
              We don’t track you. We don’t store inputs. Double-check results against official calculators/payroll when making
              decisions.
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-bg-900 p-5">
            <h2 className="text-lg font-semibold">Coming next</h2>
            <ul className="mt-3 grid gap-2 text-sm text-white/70 md:grid-cols-2">
              <li className="rounded-xl border border-white/10 bg-bg-950/60 p-3">More UK calculators, one at a time (with tests + clear assumptions)</li>
            </ul>
          </section>
        </main>

        <footer className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>No tracking. No login. Runs in-browser.</p>
            <p>Last updated: {formatLastUpdated(__BUILD_TIME__)}</p>
          </div>
          <div className="mt-2">
            <button
              type="button"
              className="underline decoration-white/20 underline-offset-4 hover:decoration-white/40"
              onClick={() => document.getElementById('method')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              Method &amp; sources
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
