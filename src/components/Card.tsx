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
   * "subtle" is the default calculator surface.
   * "neon" is kept for backwards-compat but intentionally restrained.
   */
  variant?: CardVariant;
}) {
  const surfaceClassName =
    variant === 'neon' ? 'border border-white/10 bg-bg-900 shadow-none' : 'border border-white/10 bg-bg-950/20 shadow-none';

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
