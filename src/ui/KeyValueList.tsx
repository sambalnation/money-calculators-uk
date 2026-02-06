import { cx } from './cx';

export type KeyValueItem = {
  label: string;
  value: string;
  emphasis?: 'default' | 'strong' | 'accent';
};

export function KeyValueList({ items, className }: { items: KeyValueItem[]; className?: string }) {
  return (
    <dl className={cx('divide-y divide-white/10 border-y border-white/10', className)}>
      {items.map((it) => {
        const valueClassName =
          it.emphasis === 'accent'
            ? 'text-neon-cyan'
            : it.emphasis === 'strong'
              ? 'text-white/90'
              : 'text-white/75';

        return (
          <div key={it.label} className="flex items-center justify-between gap-6 py-2">
            <dt className="text-sm text-white/60">{it.label}</dt>
            <dd className={cx('text-sm font-medium tabular-nums', valueClassName)}>{it.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
