import { useMemo, useState } from 'react';

import { cx } from './cx';
import { ModalSheet } from './Modal';
import { PageContainer } from './Page';
import { tokens } from './tokens';

export type CalculatorItem<T extends string> = {
  id: T;
  label: string;
  description?: string;
};

export function CalculatorPicker<T extends string>({
  items,
  activeId,
  onChange,
}: {
  items: Array<CalculatorItem<T>>;
  activeId: T;
  onChange: (id: T) => void;
}) {
  const [open, setOpen] = useState(false);

  const active = useMemo(() => items.find((it) => it.id === activeId), [activeId, items]);

  return (
    <>
      <div className="sticky top-0 z-30">
        <PageContainer className="py-3">
          <div
            className={cx(
              tokens.radii.panel,
              tokens.border.subtle,
              tokens.surfaces.panel,
              'flex items-center justify-between gap-4 px-4 py-3',
            )}
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/45">Calculator</p>
              <p className="truncate text-sm font-semibold text-white/85">{active?.label ?? '—'}</p>
            </div>

            <button
              type="button"
              className={cx(
                tokens.radii.control,
                'inline-flex items-center gap-2',
                'border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white/80',
                'hover:bg-white/[0.07] hover:text-white',
                tokens.focusRing,
              )}
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              Change
              <span aria-hidden="true" className="text-white/40">
                ▾
              </span>
            </button>
          </div>
        </PageContainer>
      </div>

      <ModalSheet
        open={open}
        title="Choose a calculator"
        description="All calculators run in-browser. No login. No tracking."
        onClose={() => setOpen(false)}
      >
        <div className="grid gap-2">
          {items.map((it) => {
            const isActive = it.id === activeId;
            return (
              <button
                key={it.id}
                type="button"
                className={cx(
                  tokens.radii.control,
                  'w-full border border-white/10 px-4 py-3 text-left transition-colors',
                  tokens.focusRing,
                  isActive
                    ? 'bg-white/[0.06]'
                    : 'bg-white/[0.02] hover:bg-white/[0.06]',
                )}
                onClick={() => {
                  onChange(it.id);
                  setOpen(false);
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className={cx('text-sm font-semibold', isActive ? 'text-white' : 'text-white/85')}>{it.label}</p>
                    {it.description ? <p className="text-xs text-white/55">{it.description}</p> : null}
                  </div>
                  {isActive ? <span className="text-neon-cyan">✓</span> : null}
                </div>
              </button>
            );
          })}
        </div>
      </ModalSheet>
    </>
  );
}
