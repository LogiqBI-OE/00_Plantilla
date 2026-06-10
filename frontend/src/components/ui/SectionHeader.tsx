/**
 * SectionHeader — barra superior consistente de cada panel/tab.
 *
 * Izquierda: titulo + descripcion. Derecha: acciones custom (`actions`) y/o
 * Descartar + Guardar cambios (opcionales). Se usa en todas las pantallas de
 * config para mantener el mismo patron. Si no se pasan acciones, solo muestra
 * el titulo.
 */
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from './Button';

interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
  dirty?: boolean;
  saving?: boolean;
  onDiscard?: () => void;
  onSave?: () => void;
  saveLabel?: string;
  /** Acciones custom a la derecha (ej. "+ Nuevo"). Se muestran antes de Descartar/Guardar. */
  actions?: ReactNode;
}

export function SectionHeader({
  title,
  description,
  dirty = false,
  saving = false,
  onDiscard,
  onSave,
  saveLabel,
  actions,
}: SectionHeaderProps): React.ReactElement {
  const { t } = useTranslation();
  const hasActions = !!onSave || !!onDiscard || !!actions;
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
      <div className="min-w-0">
        <h3 className="font-semibold text-sm">{title}</h3>
        {description && <p className="text-xs opacity-60 mt-0.5">{description}</p>}
      </div>
      {hasActions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
          {onDiscard && (
            <Button variant="secondary" onClick={onDiscard} disabled={!dirty}>
              {t('common.discard')}
            </Button>
          )}
          {onSave && (
            <Button onClick={onSave} disabled={!dirty} loading={saving}>
              {saveLabel ?? t('common.save_changes')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
