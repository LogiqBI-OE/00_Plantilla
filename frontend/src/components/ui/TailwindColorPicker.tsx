/**
 * TailwindColorPicker — swatch + popover con paletas Tailwind v3.
 *
 * Gotchas (heredados del SKELETON_GUIDE):
 * - Popover via React Portal con position:fixed. Si fuera embebido en
 *   acordeones con overflow:hidden, se clipa.
 * - Recalcula posicion en scroll/resize. Si no cabe a la derecha, se
 *   ajusta a la izquierda (clamp en viewport).
 * - "Mas cercano" usa OKLab (no RGB euclidiano — falla con champagne).
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  PALETTE_GROUPS,
  TAILWIND_PALETTES,
  findClosestTailwind,
} from '@/lib/colorPalettes';

interface TailwindColorPickerProps {
  value: string; // hex
  onChange: (hex: string) => void;
  label?: string;
}

const POPOVER_W = 320;
const POPOVER_H = 420;

export function TailwindColorPicker({
  value,
  onChange,
  label,
}: TailwindColorPickerProps): React.ReactElement {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const closest = findClosestTailwind(value);

  // Posicionamiento del popover
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const calc = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let top = rect.bottom + 6;
      let left = rect.left;
      if (left + POPOVER_W > vw - 8) left = vw - POPOVER_W - 8;
      if (top + POPOVER_H > vh - 8) top = Math.max(8, rect.top - POPOVER_H - 6);
      setPos({ top, left });
    };
    calc();
    window.addEventListener('scroll', calc, true);
    window.addEventListener('resize', calc);
    return () => {
      window.removeEventListener('scroll', calc, true);
      window.removeEventListener('resize', calc);
    };
  }, [open]);

  // Click outside + Esc
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        popoverRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-2 py-1 rounded-lg border border-border hover:bg-elevated transition"
      >
        <span
          className="w-5 h-5 rounded border border-border"
          style={{ background: value }}
          aria-label={label ?? 'color'}
        />
        <span className="text-xs font-mono opacity-70">{value.toUpperCase()}</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[60] bg-card border border-border rounded-xl shadow-2xl flex flex-col"
            style={{
              top: `${pos.top}px`,
              left: `${pos.left}px`,
              width: `${POPOVER_W}px`,
              maxHeight: `${POPOVER_H}px`,
            }}
            role="dialog"
          >
            <div className="px-3 py-2 border-b border-border flex items-center justify-between text-xs">
              <span className="opacity-60">Mas cercano:</span>
              <span className="font-mono">
                {closest.paletteName}-{closest.shade}
              </span>
            </div>

            <div className="overflow-y-auto p-3 space-y-3">
              {/* Quick: black/white */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange('#000000');
                    setOpen(false);
                  }}
                  className="flex-1 h-8 rounded border border-border"
                  style={{ background: '#000000' }}
                  title="Negro"
                />
                <button
                  type="button"
                  onClick={() => {
                    onChange('#FFFFFF');
                    setOpen(false);
                  }}
                  className="flex-1 h-8 rounded border border-border"
                  style={{ background: '#FFFFFF' }}
                  title="Blanco"
                />
              </div>

              {PALETTE_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="text-[10px] uppercase tracking-wider opacity-50 mb-1">
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {group.names.map((paletteName) => {
                      const shades = TAILWIND_PALETTES[paletteName];
                      if (!shades) return null;
                      return (
                        <div key={paletteName} className="flex items-center gap-1">
                          <span className="text-[10px] w-14 opacity-60 font-mono shrink-0">
                            {paletteName}
                          </span>
                          <div className="flex flex-1 gap-0.5">
                            {Object.entries(shades).map(([shade, hex]) => {
                              const active =
                                closest.paletteName === paletteName && closest.shade === shade;
                              return (
                                <button
                                  key={shade}
                                  type="button"
                                  onClick={() => {
                                    onChange(hex);
                                    setOpen(false);
                                  }}
                                  className={`flex-1 h-5 rounded-sm border ${active ? 'border-accent ring-2 ring-accent/40' : 'border-transparent'}`}
                                  style={{ background: hex }}
                                  title={`${paletteName}-${shade} ${hex}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
