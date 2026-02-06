import { type ReactNode, useState } from 'react';

import { cx } from './cx';
import { tokens } from './tokens';

export function Disclosure({
  title,
  children,
  defaultOpen,
  className,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  return (
    <details
      className={cx('border-t border-white/10 pt-4', className)}
      open={open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className={cx('cursor-pointer select-none text-sm font-semibold text-white/75', tokens.focusRing)}>
        {title}
      </summary>
      <div className="mt-3 space-y-3 text-sm text-white/65">{children}</div>
    </details>
  );
}
