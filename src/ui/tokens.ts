export const tokens = {
  accent: {
    hex: '#22d3ee',
    rgb: '34, 211, 238',
    className: 'text-neon-cyan',
    bgClassName: 'bg-neon-cyan',
  },
  layout: {
    pageMaxWidth: 'max-w-5xl',
    pageXPadding: 'px-4',
    pageYPadding: 'py-10',
  },
  radii: {
    panel: 'rounded-2xl',
    control: 'rounded-xl',
    pill: 'rounded-full',
  },
  border: {
    subtle: 'border border-white/10',
    divider: 'border-white/10',
  },
  text: {
    default: 'text-white/90',
    muted: 'text-white/60',
    subtle: 'text-white/45',
  },
  surfaces: {
    panel: 'bg-white/[0.03]',
    input: 'bg-bg-900/60',
    inputHover: 'bg-bg-900/80',
    elevated: 'bg-bg-950/90',
  },
  focusRing:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/55 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-950',
  shadow: {
    floating: 'shadow-[0_24px_80px_rgba(0,0,0,0.70)]',
  },
} as const;

export const chartTokens = {
  accentLine: `rgba(${tokens.accent.rgb}, 0.95)`,
  accentFill: `rgba(${tokens.accent.rgb}, 0.14)`,
  neutralLine: 'rgba(255, 255, 255, 0.55)',
  neutralFill: 'rgba(255, 255, 255, 0.08)',
} as const;
