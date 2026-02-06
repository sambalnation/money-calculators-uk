import type { ReactNode } from 'react';

import { cx } from './cx';

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx('block space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-white/80">{label}</span>
        {hint ? <span className="text-xs text-white/40">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}
