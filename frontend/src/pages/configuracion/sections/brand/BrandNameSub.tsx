/** BrandNameSub — editar marca + alcance + preview inline. */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Card, TextField } from '@/components/ui';
import { brandApi } from '@/lib/api';
import type { BrandSettings } from '@/lib/api';

interface Props {
  brand: BrandSettings;
  onSaved: () => Promise<void>;
}

export function BrandNameSub({ brand, onSaved }: Props): React.ReactElement {
  const { t } = useTranslation();
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
        <h3 className="font-semibold">{t('brand.identity')}</h3>
        <Button onClick={handleSave} loading={saving} disabled={!dirty}>
          {t('common.save')}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextField
          label={t('brand.marca_label')}
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
          hint={t('brand.marca_hint')}
        />
        <TextField
          label={t('brand.alcance_label')}
          value={alcance}
          onChange={(e) => setAlcance(e.target.value)}
          hint={t('brand.alcance_hint')}
        />
      </div>

      <div className="space-y-2 pt-3 border-t border-border">
        <p className="text-xs opacity-60">{t('brand.chip_preview')}</p>
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
