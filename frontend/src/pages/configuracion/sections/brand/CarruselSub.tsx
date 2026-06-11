/** CarruselSub — intervalo + grid de fotos del carrusel del Login. */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

import { Button, Card } from '@/components/ui';
import { brandApi } from '@/lib/api';
import type { BrandSettings } from '@/lib/api';

const MAX_FOTOS = 12;
const MAX_BYTES = 800 * 1024;

async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface Props {
  brand: BrandSettings;
  onSaved: () => Promise<void>;
}

export function CarruselSub({ brand, onSaved }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [segundos, setSegundos] = useState(brand.carrusel_segundos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const segDirty = segundos !== brand.carrusel_segundos;

  const handleSaveSeg = async () => {
    await brandApi.patch({ carrusel_segundos: segundos });
    await onSaved();
  };

  const handleAdd = async (file: File) => {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError(t('brand.max_kb_photo', { kb: MAX_BYTES / 1024 }));
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await fileToDataURL(file);
      await brandApi.addCarruselFoto(dataUrl);
      await onSaved();
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (idx: number) => {
    await brandApi.removeCarruselFoto(idx);
    await onSaved();
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium opacity-80">{t('brand.seconds_label')}</label>
          <input
            type="number"
            min={1}
            max={60}
            step={0.5}
            value={segundos}
            onChange={(e) => setSegundos(parseFloat(e.target.value))}
            className="w-32 rounded-lg bg-card border border-border px-3 py-1.5 text-sm"
          />
        </div>
        <Button onClick={handleSaveSeg} disabled={!segDirty}>
          {t('brand.save_interval')}
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {t('brand.photos', { count: brand.carrusel_fotos.length, max: MAX_FOTOS })}
          </span>
          {brand.carrusel_fotos.length < MAX_FOTOS && (
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleAdd(f);
                  e.target.value = '';
                }}
                className="hidden"
              />
              <span className="inline-block px-3 py-1.5 rounded-lg bg-accent text-white text-sm cursor-pointer hover:opacity-90 transition">
                {uploading ? t('brand.uploading') : t('brand.add_photo')}
              </span>
            </label>
          )}
        </div>
        {error && <p className="text-xs text-danger mb-2">{error}</p>}
        {brand.carrusel_fotos.length === 0 ? (
          <div className="text-center py-8 opacity-50 text-sm">{t('brand.no_photos')}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {brand.carrusel_fotos.map((src, idx) => (
              <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-border">
                <img src={src} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => void handleRemove(idx)}
                  className="absolute top-1 right-1 w-6 h-6 inline-flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <X strokeWidth={1.5} size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
