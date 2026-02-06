import { type ReactNode, useMemo, useRef } from 'react';

export type TabItem<T extends string> = {
  id: T;
  label: string;
  content: ReactNode;
};

function tabDomId(id: string) {
  return `tab-${id}`;
}

function panelDomId(id: string) {
  return `panel-${id}`;
}

export function Tabs<T extends string>({
  items,
  activeId,
  onChange,
  ariaLabel = 'Tools',
}: {
  items: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
}) {
  const indexById = useMemo(() => {
    const m = new Map<T, number>();
    items.forEach((t, i) => m.set(t.id, i));
    return m;
  }, [items]);

  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = indexById.get(activeId) ?? 0;

  return (
    <div>
      {/* Tab bar */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-white/10 bg-bg-950/90 px-4 pt-3 backdrop-blur">
        <div
          role="tablist"
          aria-label={ariaLabel}
          className="flex flex-wrap gap-1"
          onKeyDown={(e) => {
            // Roving tabs + automatic activation
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
            e.preventDefault();

            const count = items.length;
            if (count === 0) return;

            const current = activeIndex;
            const next =
              e.key === 'Home'
                ? 0
                : e.key === 'End'
                  ? count - 1
                  : e.key === 'ArrowLeft'
                    ? (current - 1 + count) % count
                    : (current + 1) % count;

            const nextId = items[next]?.id;
            if (!nextId) return;

            tabRefs.current[next]?.focus();
            onChange(nextId);
          }}
        >
          {items.map((t, i) => {
            const active = t.id === activeId;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={tabDomId(t.id)}
                role="tab"
                type="button"
                tabIndex={active ? 0 : -1}
                aria-selected={active}
                aria-controls={panelDomId(t.id)}
                onClick={() => onChange(t.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange(t.id);
                  }
                }}
                className={
                  'relative -mb-px rounded-t-xl border px-4 py-2 text-xs font-semibold tracking-wide transition ' +
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 ' +
                  (active
                    ? 'border-white/20 bg-bg-900 text-white shadow-neon'
                    : 'border-transparent bg-transparent text-white/60 hover:border-white/10 hover:bg-white/5 hover:text-white/85')
                }
              >
                {t.label}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 right-3 bottom-0 h-px bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-lime"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panels */}
      {items.map((t) => {
        const active = t.id === activeId;
        return (
          <div
            key={t.id}
            id={panelDomId(t.id)}
            role="tabpanel"
            aria-labelledby={tabDomId(t.id)}
            hidden={!active}
          >
            {t.content}
          </div>
        );
      })}
    </div>
  );
}
