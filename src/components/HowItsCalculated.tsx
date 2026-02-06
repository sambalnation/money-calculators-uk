import type { ReactNode } from 'react';

const SOURCES_LAST_VERIFIED = '6 Feb 2026';

export type SourceLink = {
  label: string;
  href: string;
};

export function HowItsCalculated({
  title = "How it’s calculated",
  bullets,
  sources,
  children,
}: {
  title?: string;
  bullets?: string[];
  sources?: SourceLink[];
  children?: ReactNode;
}) {
  return (
    <details className="rounded-2xl border border-white/10 bg-bg-900/40 p-5">
      <summary className="cursor-pointer select-none text-sm font-semibold text-white/75 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-900">
        {title}
      </summary>

      <div className="mt-3 space-y-3 text-sm text-white/65">
        {bullets && bullets.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}

        {children}

        {sources && sources.length > 0 ? (
          <div className="rounded-xl border border-white/10 bg-bg-950/40 p-4">
            <p className="text-xs font-semibold tracking-widest text-white/50">SOURCES</p>
            <ul className="mt-2 space-y-1 text-xs">
              {sources.map((s) => (
                <li key={s.href}>
                  <a
                    className="underline decoration-white/20 underline-offset-4 hover:decoration-white/40"
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-white/40">
              Sources last verified: {SOURCES_LAST_VERIFIED} (updated when we review sources; not every release)
            </p>
          </div>
        ) : null}
      </div>
    </details>
  );
}
