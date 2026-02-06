export function NumberInput({
  label,
  value,
  onChange,
  prefix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-white/80">{label}</span>
        {hint ? <span className="text-xs text-white/40">{hint}</span> : null}
      </div>

      <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-bg-900/70 px-3 py-2 transition-colors focus-within:border-neon-cyan/40 focus-within:bg-bg-900/90">
        {prefix ? <span className="mr-2 text-sm text-white/50">{prefix}</span> : null}
        <input
          className="w-full bg-transparent text-base outline-none placeholder:text-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-900"
          inputMode="decimal"
          type="text"
          value={Number.isFinite(value) ? String(value) : ''}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, '');
            const n = Number(raw);
            onChange(Number.isFinite(n) ? n : 0);
          }}
        />
      </div>
    </label>
  );
}
