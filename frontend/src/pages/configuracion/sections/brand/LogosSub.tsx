/** LogosSub — 2 slots (login + sidebar) con upload y preview. */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Card } from '@/components/ui';
import { brandApi } from '@/lib/api';
import type { BrandSettings } from '@/lib/api';

const MAX_BYTES = 500 * 1024; // 500KB

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

interface SlotProps {
  kind: 'login' | 'sidebar';
  title: string;
  description: string;
  currentUrl: string;
  filename: string;
  bgVar: string;
  onSaved: () => Promise<void>;
}

function LogoSlot({ kind, title, description, currentUrl, filename, bgVar, onSaved }: SlotProps): React.ReactElement {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File): Promise<void> => {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError(t('brand.max_kb', { kb: MAX_BYTES / 1024 }));
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await fileToDataURL(file);
      await brandApi.uploadLogo(kind, dataUrl, file.name);
      await onSaved();
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm(t('brand.remove_logo_confirm'))) return;
    setUploading(true);
    try {
      await brandApi.removeLogo(kind);
      await onSaved();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs opacity-60">{description}</p>
      </div>
      <div
        className="rounded-xl border border-border p-6 flex items-center justify-center min-h-[140px]"
        style={{ background: bgVar }}
      >
        {currentUrl ? (
          <img src={currentUrl} alt={title} className="max-h-[120px] max-w-full object-contain" />
        ) : (
          <span className="text-xs opacity-50">{t('brand.no_logo')}</span>
        )}
      </div>
      {filename && <p className="text-[10px] font-mono opacity-60">{filename}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <label className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = '';
            }}
            className="hidden"
          />
          <span className="inline-block w-full text-center px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium cursor-pointer hover:opacity-90 transition">
            {uploading ? t('brand.uploading') : currentUrl ? t('brand.replace') : t('brand.upload')}
          </span>
        </label>
        {currentUrl && (
          <Button variant="secondary" size="md" onClick={handleRemove} loading={uploading}>
            {t('brand.remove')}
          </Button>
        )}
      </div>
    </div>
  );
}

export function LogosSub({ brand, onSaved }: Props): React.ReactElement {
  const { t } = useTranslation();
  return (
    <Card className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LogoSlot
        kind="login"
        title={t('brand.login_logo_title')}
        description={t('brand.login_logo_desc')}
        currentUrl={brand.logo_login}
        filename={brand.logo_login_filename}
        bgVar="var(--brand-hero-bg)"
        onSaved={onSaved}
      />
      <LogoSlot
        kind="sidebar"
        title={t('brand.sidebar_logo_title')}
        description={t('brand.sidebar_logo_desc')}
        currentUrl={brand.logo_sidebar}
        filename={brand.logo_sidebar_filename}
        bgVar="var(--sidebar-bg)"
        onSaved={onSaved}
      />
    </Card>
  );
}
