import { useEffect, useMemo, useState } from 'react';

import { CalculatorPicker, Page, PageContainer, Section } from './ui';
import { CompoundGrowthCalculator } from './pages/CompoundGrowthCalculator';
import { InflationAdjustedGrowthCalculator } from './pages/InflationAdjustedGrowthCalculator';
import { EmergencyFundRunwayCalculator } from './pages/EmergencyFundRunwayCalculator';
import { PayRiseImpactCalculator } from './pages/PayRiseImpactCalculator';
import { PensionContributionImpactCalculator } from './pages/PensionContributionImpactCalculator';
import { TakeHomeCalculator } from './pages/TakeHomeCalculator';
import { SOURCES_LAST_VERIFIED } from './lib/sources';

type ToolId = 'takehome' | 'compound' | 'inflation' | 'emergency' | 'payrise' | 'pension';

const TOOL_IDS: ToolId[] = ['takehome', 'compound', 'inflation', 'emergency', 'payrise', 'pension'];

function isToolId(v: unknown): v is ToolId {
  return typeof v === 'string' && (TOOL_IDS as string[]).includes(v);
}

function parseToolFromLocation(): ToolId | null {
  const fromQuery = new URLSearchParams(window.location.search).get('tool');
  if (isToolId(fromQuery)) return fromQuery;

  const rawHash = window.location.hash.replace(/^#/, '');
  if (!rawHash) return null;

  // Legacy: "#takehome" → treat as tool id.
  if (!rawHash.includes('=')) {
    return isToolId(rawHash) ? rawHash : null;
  }

  const params = new URLSearchParams(rawHash);
  const tool = params.get('tool');
  return isToolId(tool) ? tool : null;
}

function setToolHash(tool: ToolId) {
  const rawHash = window.location.hash.replace(/^#/, '');
  const params = rawHash.includes('=') ? new URLSearchParams(rawHash) : new URLSearchParams();
  params.set('tool', tool);
  window.location.hash = params.toString();
}

function canonicaliseUrl() {
  const query = new URLSearchParams(window.location.search);
  const queryTool = query.get('tool');
  if (!isToolId(queryTool)) return;

  const hashTool = (() => {
    const rawHash = window.location.hash.replace(/^#/, '');
    if (!rawHash) return null;
    if (!rawHash.includes('=')) return isToolId(rawHash) ? rawHash : null;
    const params = new URLSearchParams(rawHash);
    const t = params.get('tool');
    return isToolId(t) ? t : null;
  })();

  // Canonical: hash routing. If the deep link uses ?tool=..., redirect once to #tool=...
  if (!hashTool) {
    setToolHash(queryTool);
  }

  // Remove query param from the URL (keep hash) so shares are consistent.
  query.delete('tool');
  const nextSearch = query.toString();
  const next = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', next);
}

function formatLastUpdated(iso: string) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function App() {
  const tools = useMemo(
    () => [
      {
        id: 'takehome' as const,
        label: 'Take‑home pay',
        description: 'Estimate income tax + employee NI from a gross annual salary.',
      },
      {
        id: 'payrise' as const,
        label: 'Pay rise impact',
        description: 'How much of a gross pay rise you keep after tax + NI.',
      },
      {
        id: 'compound' as const,
        label: 'Compound growth',
        description: 'Savings/investing projection with monthly contributions.',
      },
      {
        id: 'inflation' as const,
        label: 'Inflation‑adjusted growth',
        description: 'Translate nominal growth into “today’s money”.',
      },
      {
        id: 'emergency' as const,
        label: 'Emergency fund runway',
        description: 'How many months your cash could cover essentials.',
      },
      {
        id: 'pension' as const,
        label: 'Pension contribution impact',
        description: 'Rough take‑home impact of pension contributions (simplified).',
      },
    ],
    [],
  );

  const [active, setActive] = useState<ToolId>(() => parseToolFromLocation() ?? 'takehome');

  useEffect(() => {
    canonicaliseUrl();

    const onHash = () => {
      const next = parseToolFromLocation();
      if (next) setActive(next);
    };

    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    setToolHash(active);
  }, [active]);

  const content = useMemo(() => {
    switch (active) {
      case 'takehome':
        return <TakeHomeCalculator />;
      case 'compound':
        return <CompoundGrowthCalculator />;
      case 'inflation':
        return <InflationAdjustedGrowthCalculator />;
      case 'emergency':
        return <EmergencyFundRunwayCalculator />;
      case 'payrise':
        return <PayRiseImpactCalculator />;
      case 'pension':
        return <PensionContributionImpactCalculator />;
      default:
        return null;
    }
  }, [active]);

  return (
    <Page>
      <PageContainer className="pt-10">
        <header className="mb-7">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-neon-cyan" />
            <span className="text-xs font-semibold tracking-widest text-white/70">MONEY CALCULATORS UK</span>
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white/95">
            UK money calculators, <span className="text-neon-cyan">done right</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/60">
            Fast, no-login calculators for UK taxes and savings. Educational estimates only — not financial advice.
          </p>
        </header>
      </PageContainer>

      <CalculatorPicker
        items={tools}
        activeId={active}
        onChange={(id) => {
          setActive(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <PageContainer className="pb-12 pt-6">
        <main className="space-y-10">
          <div id="calculator" className="scroll-mt-24">
            {content}
          </div>

          <Section
            id="method"
            className="scroll-mt-24 border-t border-white/10 pt-8"
            title="Method & sources"
            subtitle="These calculators run entirely in your browser (no accounts, no server-side computation). Where a tool uses UK tax thresholds, we link GOV.UK/HMRC guidance."
          >
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                Income Tax rates (GOV.UK):{' '}
                <a
                  className="underline decoration-white/20 underline-offset-4 hover:decoration-white/40"
                  href="https://www.gov.uk/income-tax-rates"
                  target="_blank"
                  rel="noreferrer"
                >
                  gov.uk/income-tax-rates
                </a>
              </li>
              <li>
                National Insurance rates (GOV.UK):{' '}
                <a
                  className="underline decoration-white/20 underline-offset-4 hover:decoration-white/40"
                  href="https://www.gov.uk/national-insurance-rates-letters"
                  target="_blank"
                  rel="noreferrer"
                >
                  gov.uk/national-insurance-rates-letters
                </a>
              </li>
              <li>
                Pension tax relief (GOV.UK):{' '}
                <a
                  className="underline decoration-white/20 underline-offset-4 hover:decoration-white/40"
                  href="https://www.gov.uk/tax-on-your-private-pension/pension-tax-relief"
                  target="_blank"
                  rel="noreferrer"
                >
                  gov.uk/.../pension-tax-relief
                </a>
              </li>
              <li>
                UK inflation statistics (ONS):{' '}
                <a
                  className="underline decoration-white/20 underline-offset-4 hover:decoration-white/40"
                  href="https://www.ons.gov.uk/economy/inflationandpriceindices"
                  target="_blank"
                  rel="noreferrer"
                >
                  ons.gov.uk/.../inflationandpriceindices
                </a>
              </li>
            </ul>

            <p className="text-xs text-white/50">
              Sources last verified: {SOURCES_LAST_VERIFIED} (updated when we review sources; not every release). We don’t
              track you. We don’t store inputs. Double-check results against official calculators/payroll when making
              decisions.
            </p>
          </Section>

          <Section className="border-t border-white/10 pt-8" title="Coming next">
            <ul className="space-y-2 text-sm text-white/70">
              <li>More UK calculators, one at a time (with tests + clear assumptions).</li>
            </ul>
          </Section>
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
              Method & sources
            </button>
          </div>
        </footer>
      </PageContainer>
    </Page>
  );
}
