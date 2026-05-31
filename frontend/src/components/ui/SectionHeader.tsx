/**
 * SectionHeader — barra superior consistente de cada panel/tab.
 *
 * Izquierda: titulo + descripcion. Derecha: Descartar + Guardar cambios
 * (opcionales). Se usa en todas las pantallas de config para mantener el
 * mismo patron. Si no se pasan onSave/onDiscard, solo muestra el titulo.
 */
import type { ReactNode } from 'react';

import { Button } from './Button';

interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
  dirty?: boolean;
  saving?: boolean;
  onDiscard?: () => void;
  onSave?: () => void;
  saveLabel?: string;
}

export function SectionHeader({
  title,
  description,
  dirty = false,
  saving = false,
  onDiscard,
  onSave,
  saveLabel = 'Guardar cambios',
}: SectionHeaderProps): React.ReactElement {
  const hasActions = !!onSave || !!onDiscard;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
      <div className="min-w-0">
        <h3 className="font-semibold text-sm">{title}</h3>
        {description && <p className="text-xs opacity-60 mt-0.5">{description}</p>}
      </div>
      {hasActions && (
        <div className="flex items-center gap-2 shrink-0">
          {onDiscard && (
            <Button variant="secondary" onClick={onDiscard} disabled={!dirty}>
              Descartar
            </Button>
          )}
          {onSave && (
            <Button onClick={onSave} disabled={!dirty} loading={saving}>
              {saveLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
