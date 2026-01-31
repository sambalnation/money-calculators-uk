import { CompoundGrowthCalculator } from './pages/CompoundGrowthCalculator';
import { EmergencyFundRunwayCalculator } from './pages/EmergencyFundRunwayCalculator';
import { PayRiseImpactCalculator } from './pages/PayRiseImpactCalculator';
import { TakeHomeCalculator } from './pages/TakeHomeCalculator';

export default function App() {
  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-neon">
            <span className="h-2 w-2 rounded-full bg-neon-cyan" />
            <span className="text-xs font-semibold tracking-widest text-white/70">MONEY CALCULATORS UK</span>
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            UK money calculators,
            <span className="bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-lime bg-clip-text text-transparent">
              {' '}done right
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/60">
            Fast, no-login calculators for UK taxes and savings. Educational estimates only — not financial advice.
          </p>
        </header>

        <main className="space-y-6">
          <TakeHomeCalculator />
          <CompoundGrowthCalculator />
          <EmergencyFundRunwayCalculator />
          <PayRiseImpactCalculator />

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Coming next</h2>
            <ul className="mt-3 grid gap-2 text-sm text-white/70 md:grid-cols-2">
              <li className="rounded-xl border border-white/10 bg-bg-900/40 p-3">Pension contribution impact (with “not sure” mode)</li>
            </ul>
          </section>
        </main>

        <footer className="mt-10 border-t border-white/10 pt-6 text-xs text-white/40">
          Built for the UK. Dark mode by default. No tracking in this prototype.
        </footer>
      </div>
    </div>
  );
}
