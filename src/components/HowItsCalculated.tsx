import type { ReactNode } from 'react';

import { Disclosure } from '../ui';
import { SOURCES_LAST_VERIFIED } from '../lib/sources';

export type SourceLink = {
  label: string;
  href: string;
};

export function HowItsCalculated({
  title = 'How it’s calculated',
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
    <Disclosure title={title}>
      {bullets && bullets.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : null}

      {children}

      {sources && sources.length > 0 ? (
        <div className="border-t border-white/10 pt-3">
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
          <p className="mt-2 text-xs text-white/40">Sources last verified: {SOURCES_LAST_VERIFIED}</p>
        </div>
      ) : null}
    </Disclosure>
  );
}
