/**
 * Drawer — panel deslizable desde la derecha.
 *
 * Patron estandar: header (titulo + close) + body scrolleable + footer
 * con botones Cancelar/Guardar. Bloquea scroll del body cuando esta abierto.
 */
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  /** Ancho del drawer en px. Default 480. */
  width?: number;
}

export function Drawer({
  open,
  onClose,
  title,
  footer,
  children,
  width = 480,
}: DrawerProps): React.ReactElement | null {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="bg-card border-l border-border shadow-2xl flex flex-col"
        style={{ width: `${width}px`, maxWidth: '90vw' }}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div className="font-semibold">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="text-2xl leading-none opacity-50 hover:opacity-100 transition"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-border flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
