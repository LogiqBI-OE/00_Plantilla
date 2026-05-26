/**
 * InfoIcon — chip "(i)" con tooltip custom via Portal.
 *
 * Gotcha #5 del SKELETON_GUIDE: no usar `title=` nativo (tarda 1.5s
 * y depende del browser). Tampoco embebido en el flujo normal — acordeones
 * con overflow:hidden lo clipan.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface InfoIconProps {
  text: string;
}

export function InfoIcon({ text }: InfoIconProps): React.ReactElement {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left + rect.width / 2 });
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="w-4 h-4 inline-flex items-center justify-center rounded-full text-[10px] opacity-50 hover:opacity-100 border border-current cursor-help select-none"
        aria-label="info"
      >
        i
      </button>
      {open &&
        createPortal(
          <div
            className="fixed z-[60] bg-text-primary text-page text-xs px-2.5 py-1.5 rounded-md shadow-lg max-w-xs"
            style={{
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
            role="tooltip"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
