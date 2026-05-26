/** BrandNameSub — editar marca + alcance + preview inline. */
import { useState } from 'react';

import { Button, Card, TextField } from '@/components/ui';
import { brandApi } from '@/lib/api';
import type { BrandSettings } from '@/lib/api';

interface Props {
  brand: BrandSettings;
  onSaved: () => Promise<void>;
}

export function BrandNameSub({ brand, onSaved }: Props): React.ReactElement {
  const [marca, setMarca] = useState(brand.marca);
  const [alcance, setAlcance] = useState(brand.alcance);
  const [saving, setSaving] = useState(false);

  const dirty = marca !== brand.marca || alcance !== brand.alcance;

  const handleSave = async () => {
    setSaving(true);
    try {
      await brandApi.patch({ marca, alcance });
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Identidad</h3>
        <Button onClick={handleSave} loading={saving} disabled={!dirty}>
          Guardar
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField
          label="Marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          hint="Nombre que aparece en topbar, login y tab del browser."
        />
        <TextField
          label="Alcance"
          value={alcance}
          onChange={(e) => setAlcance(e.target.value)}
          hint='Ej. "Workspace", "Admin", "Showroom".'
        />
      </div>

      <div className="space-y-2 pt-3 border-t border-border">
        <p className="text-xs opacity-60">Previsualizacion del chip del login:</p>
        <div
          className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{
            background: 'var(--brand-hero-accent)',
            color: 'var(--brand-hero-accent-ink)',
          }}
        >
          {marca} · {alcance}
        </div>
      </div>
    </Card>
  );
}
