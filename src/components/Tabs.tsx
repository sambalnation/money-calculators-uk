import { type ReactNode } from 'react';

export type TabItem<T extends string> = {
  id: T;
  label: string;
  content: ReactNode;
};

export function Tabs<T extends string>({
  items,
  activeId,
  onChange,
}: {
  items: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
}) {
  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-white/10 bg-bg-950/80 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {items.map((t) => {
            const active = t.id === activeId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange(t.id)}
                className={
                  'rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition ' +
                  (active
                    ? 'border-white/20 bg-white/10 text-white shadow-neon'
                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80')
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>{items.find((t) => t.id === activeId)?.content}</div>
    </div>
  );
}
