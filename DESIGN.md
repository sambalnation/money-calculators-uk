# Design system (Money Calculators UK)

This UI is intentionally **calm, modern fintech**: clean surfaces, restrained contrast, and **one accent** (cyan).

## Goals

- Trustworthy + readable (low visual noise)
- Consistent spacing/typography across calculators
- Accessible focus states + keyboard support
- No ad-hoc “one off” component styling in pages

## Tokens

The shared tokens live in `src/ui/tokens.ts`.

- Accent: `neon-cyan` (`#22d3ee`)
- Borders: `border-white/10`
- Panels: `bg-white/[0.03]` on the dark gradient background

## Spacing

Use **Tailwind spacing scale** and keep it predictable:

- Inside panels: `p-5`
- Vertical stacks: `gap-4` / `gap-6`
- Section dividers: `border-t border-white/10 pt-4` (or `pt-8` for page-level sections)

Avoid “random” values unless there’s a clear reason.

## Typography

- Headline metric: `text-2xl font-semibold` + `text-neon-cyan`
- Labels: `text-sm text-white/60`
- Supporting text: `text-xs text-white/55`
- Prefer `tabular-nums` for monetary figures shown in tables / key-value lists.

## Focus contract

- All interactive controls must have a visible focus style.
- Prefer the shared token: `tokens.focusRing`.
- A global fallback focus outline is also applied in `src/index.css`.

## Components (use these in pages)

All reusable UI primitives live in `src/ui/*`.

- `Page`, `PageContainer`, `Section`: consistent page layout + headings
- `Panel`: the standard calculator surface
- `Field`, `NumberField`, `SelectField`: consistent input controls
- `KeyValueList`: results lists (use instead of bespoke "Row" components)
- `Disclosure`: expandable sections (assumptions, notes, tables)
- `ModalSheet`: accessible modal/bottom-sheet (used by…)
- `CalculatorPicker`: sticky navigation to switch calculators

## Charts

- Use `chartTokens` for colours.
- Primary series uses the accent cyan; secondary series should be neutral.
