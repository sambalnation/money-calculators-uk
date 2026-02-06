import { useId } from 'react';

import { cx } from './cx';
import { Field } from './Field';
import { tokens } from './tokens';

export type SelectOption<T extends string> = { value: T; label: string };

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  hint,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  hint?: string;
  options: Array<SelectOption<T>>;
}) {
  const id = useId();

  return (
    <Field label={label} hint={hint}>
      <select
        id={id}
        className={cx(
          tokens.radii.control,
          tokens.border.subtle,
          tokens.surfaces.input,
          'w-full px-3 py-2 text-sm text-white/85 transition-colors',
          tokens.focusRing,
          'hover:bg-bg-900/80',
        )}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
