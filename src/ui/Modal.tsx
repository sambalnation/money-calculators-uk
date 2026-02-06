import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

import { cx } from './cx';
import { tokens } from './tokens';

function getFocusable(root: HTMLElement) {
  const selector =
    'a[href], button:not([disabled]), textarea, input, select, details, [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((el) => !el.hasAttribute('disabled'));
}

export function ModalSheet({
  open,
  title,
  description,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}) {
  const portalTarget = useMemo(() => (typeof document === 'undefined' ? null : document.body), []);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    lastActiveRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;
      const root = rootRef.current;
      if (!root) return;

      const focusable = getFocusable(root);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    requestAnimationFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const focusable = getFocusable(root);
      (focusable[0] ?? root).focus();
    });

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
      lastActiveRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open || !portalTarget) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div
        ref={rootRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cx(
          'relative w-full sm:max-w-xl',
          'max-h-[85vh] overflow-hidden',
          'rounded-t-2xl sm:rounded-2xl',
          tokens.border.subtle,
          tokens.surfaces.elevated,
          tokens.shadow.floating,
          'm-0 sm:m-4',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-white/90">{title}</h2>
            {description ? <p className="text-sm text-white/60">{description}</p> : null}
          </div>
          <button
            type="button"
            className={cx(
              tokens.radii.control,
              tokens.border.subtle,
              'bg-white/5 px-2.5 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white',
              tokens.focusRing,
            )}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(85vh-64px)] overflow-auto px-5 py-4">{children}</div>

        {footer ? <div className="border-t border-white/10 px-5 py-4">{footer}</div> : null}
      </div>
    </div>,
    portalTarget,
  );
}
