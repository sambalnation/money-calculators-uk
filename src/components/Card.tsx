import type { ReactNode } from 'react';

export type CardVariant = 'subtle' | 'neon';

export function Card({
  title,
  subtitle,
  children,
  variant = 'subtle',
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /**
   * "subtle" keeps calculators feeling embedded in the tab panel.
   * "neon" is an optional accent style (kept for backwards-compat).
   */
  variant?: CardVariant;
}) {
  const surfaceClassName =
    variant === 'neon'
      ? 'border border-white/10 bg-bg-900 shadow-neon'
      : 'ring-1 ring-white/10 bg-bg-950/20 shadow-none';

  return (
    <section className={`rounded-2xl p-5 ${surfaceClassName}`}>
      <header className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-white/90">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}
