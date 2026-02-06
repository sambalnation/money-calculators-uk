import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

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

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function Tabs<T extends string>({
  items,
  activeId,
  onChange,
  ariaLabel = 'Tools',
  maxPrimaryTabs = 4,
  primaryIds,
}: {
  items: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
  /** Target number of visible tabs before overflowing into the More menu. */
  maxPrimaryTabs?: number;
  /** Optional explicit ordering for primary (always-visible) tabs. */
  primaryIds?: T[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const itemById = useMemo(() => {
    const m = new Map<T, TabItem<T>>();
    for (const it of items) m.set(it.id, it);
    return m;
  }, [items]);

  const primary = useMemo(() => {
    const fallback = items.slice(0, Math.max(0, maxPrimaryTabs)).map((t) => t.id);
    const proposed = primaryIds && primaryIds.length > 0 ? primaryIds : fallback;
    return proposed.filter((id) => itemById.has(id));
  }, [itemById, items, maxPrimaryTabs, primaryIds]);

  const visibleItems = useMemo(() => {
    if (items.length === 0) return [] as TabItem<T>[];

    const primaryIdsResolved = primary;
    const activeIsPrimary = primaryIdsResolved.includes(activeId);

    const desired = maxPrimaryTabs <= 0 ? [] : primaryIdsResolved.slice(0, maxPrimaryTabs);

    if (activeIsPrimary) {
      return uniq(desired)
        .map((id) => itemById.get(id))
        .filter(Boolean) as TabItem<T>[];
    }

    // If the active tool isn't primary, swap it into the visible tabs so the active panel
    // always has a corresponding rendered <button role="tab" ...> element.
    const base = desired.slice(0, Math.max(0, maxPrimaryTabs - 1));
    const withActive = uniq([...base, activeId]);

    return withActive
      .map((id) => itemById.get(id))
      .filter(Boolean) as TabItem<T>[];
  }, [activeId, itemById, items.length, maxPrimaryTabs, primary]);

  const showMore = items.length > visibleItems.length;

  const visibleIndexById = useMemo(() => {
    const m = new Map<T, number>();
    visibleItems.forEach((t, i) => m.set(t.id, i));
    return m;
  }, [visibleItems]);

  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuRootRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuListRef = useRef<HTMLDivElement | null>(null);

  const activeIndex = visibleIndexById.get(activeId) ?? 0;

  useEffect(() => {
    // Keep the active tab visible when the tablist is horizontally scrollable (mobile).
    const el = tabRefs.current[activeIndex];
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeIndex]);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (menuRootRef.current && !menuRootRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown, { capture: true });
    return () => document.removeEventListener('pointerdown', onPointerDown, { capture: true });
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    // Focus the active item (or first) when the menu opens.
    const desiredId = `more-item-${activeId}`;
    requestAnimationFrame(() => {
      const preferred = document.getElementById(desiredId) as HTMLButtonElement | null;
      if (preferred) {
        preferred.focus();
        return;
      }

      const first = menuListRef.current?.querySelector<HTMLButtonElement>('[role="menuitemradio"]');
      first?.focus();
    });
  }, [activeId, menuOpen]);

  return (
    <div>
      {/* Sticky tab header (flat strip with divider; active tab uses underline). */}
      <div className="sticky top-0 z-20">
        <div className="border-b border-white/10 bg-bg-950/70 backdrop-blur">
          <div className="relative flex items-end gap-2 px-4">
            <div
              role="tablist"
              aria-label={ariaLabel}
              className="no-scrollbar flex flex-1 flex-nowrap gap-5 overflow-x-auto"
              onKeyDown={(e) => {
                // Roving tabs + automatic activation
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
                e.preventDefault();

                const count = visibleItems.length;
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

                const nextId = visibleItems[next]?.id;
                if (!nextId) return;

                tabRefs.current[next]?.focus();
                onChange(nextId);
              }}
            >
              {visibleItems.map((t, i) => {
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
                    className={
                      'relative -mb-px shrink-0 whitespace-nowrap border-b-2 px-1.5 py-3 text-xs font-semibold tracking-wide transition ' +
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-950 ' +
                      (active
                        ? 'border-neon-cyan/80 text-white'
                        : 'border-transparent text-white/60 hover:border-white/20 hover:text-white/85')
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {showMore ? (
              <div ref={menuRootRef} className="relative">
                <button
                  ref={menuButtonRef}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className={
                    'relative -mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-1.5 py-3 text-xs font-semibold tracking-wide transition ' +
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-950 ' +
                    (menuOpen
                      ? 'border-neon-cyan/70 text-white'
                      : 'border-transparent text-white/60 hover:border-white/20 hover:text-white/85')
                  }
                  onClick={() => setMenuOpen((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setMenuOpen(true);
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setMenuOpen(false);
                    }
                  }}
                >
                  More
                  <span aria-hidden="true" className="text-white/40">
                    ▾
                  </span>
                </button>

                {menuOpen ? (
                  <div
                    ref={menuListRef}
                    role="menu"
                    aria-label="All calculators"
                    className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-bg-950 shadow-xl"
                    onKeyDown={(e) => {
                      if (!menuListRef.current) return;
                      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
                      e.preventDefault();

                      const buttons = Array.from(
                        menuListRef.current.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'),
                      );
                      if (buttons.length === 0) return;

                      const currentIndex = Math.max(0, buttons.findIndex((b) => b === document.activeElement));
                      const nextIndex =
                        e.key === 'Home'
                          ? 0
                          : e.key === 'End'
                            ? buttons.length - 1
                            : e.key === 'ArrowUp'
                              ? (currentIndex - 1 + buttons.length) % buttons.length
                              : (currentIndex + 1) % buttons.length;

                      buttons[nextIndex]?.focus();
                    }}
                  >
                    <div className="border-b border-white/10 bg-bg-950/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                      All calculators
                    </div>

                    <div className="max-h-[70vh] overflow-auto p-1">
                      {items.map((t) => {
                        const active = t.id === activeId;
                        return (
                          <button
                            key={t.id}
                            id={`more-item-${t.id}`}
                            type="button"
                            role="menuitemradio"
                            aria-checked={active}
                            className={
                              'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ' +
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/40 ' +
                              (active
                                ? 'bg-white/5 text-white'
                                : 'text-white/70 hover:bg-white/5 hover:text-white')
                            }
                            onClick={() => {
                              onChange(t.id);
                              setMenuOpen(false);
                              menuButtonRef.current?.focus();
                            }}
                          >
                            <span>{t.label}</span>
                            {active ? (
                              <span aria-hidden="true" className="text-neon-cyan">
                                ✓
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Subtle fade edges to hint horizontal scrolling on mobile */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-bg-950/70 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-bg-950/70 to-transparent"
            />
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="pt-0">
        {items.map((t) => {
          const active = t.id === activeId;
          return (
            <div
              key={t.id}
              id={panelDomId(t.id)}
              role="tabpanel"
              aria-labelledby={tabDomId(t.id)}
              hidden={!active}
              className="pt-4 sm:pt-5"
            >
              {t.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
