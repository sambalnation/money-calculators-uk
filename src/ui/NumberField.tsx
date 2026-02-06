import { useId } from 'react';

import { cx } from './cx';
import { Field } from './Field';
import { tokens } from './tokens';

function parseNumber(raw: string) {
  const cleaned = raw.replace(/[^0-9.\-]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  inputMode = 'decimal',
  step,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  step?: number;
}) {
  const id = useId();

  return (
    <Field label={label} hint={hint}>
      <div
        className={cx(
          tokens.radii.control,
          tokens.border.subtle,
          tokens.surfaces.input,
          'flex items-center gap-2 px-3 py-2 transition-colors',
          'focus-within:border-neon-cyan/40 focus-within:bg-bg-900/80',
        )}
      >
        {prefix ? <span className="text-sm text-white/45">{prefix}</span> : null}
        <input
          id={id}
          className={cx(
            'w-full bg-transparent text-base text-white/90 placeholder:text-white/25',
            'outline-none',
            tokens.focusRing,
          )}
          inputMode={inputMode}
          type="text"
          value={Number.isFinite(value) ? String(value) : ''}
          step={step}
          onChange={(e) => onChange(parseNumber(e.target.value))}
        />
        {suffix ? <span className="text-sm text-white/45">{suffix}</span> : null}
      </div>
    </Field>
  );
}
