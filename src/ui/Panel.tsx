import type { ReactNode } from 'react';

import { cx } from './cx';
import { tokens } from './tokens';

export function Panel({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx(tokens.radii.panel, tokens.border.subtle, tokens.surfaces.panel, 'p-5', className)}>
      {title ? (
        <header className="mb-4 space-y-1">
          <h3 className="text-base font-semibold tracking-tight text-white/90">{title}</h3>
          {subtitle ? <p className="text-sm text-white/60">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
