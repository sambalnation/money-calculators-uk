import type { ReactNode } from 'react';

import { cx } from './cx';
import { tokens } from './tokens';

export function Page({ children }: { children: ReactNode }) {
  return <div className="min-h-full">{children}</div>;
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('mx-auto', tokens.layout.pageMaxWidth, tokens.layout.pageXPadding, className)}>{children}</div>
  );
}

export function Section({
  title,
  subtitle,
  children,
  className,
  ...rest
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<'section'>, 'children'>) {
  return (
    <section className={cx('space-y-3', className)} {...rest}>
      {title ? (
        <header className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-white/90">{title}</h2>
          {subtitle ? <p className="text-sm text-white/60">{subtitle}</p> : null}
        </header>
      ) : null}
      <div>{children}</div>
    </section>
  );
}
