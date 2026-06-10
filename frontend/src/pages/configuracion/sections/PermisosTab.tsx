/** PermisosTab — matriz nivel x permiso (checkbox grid). L9 only. */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, SectionHeader, SkeletonTable } from '@/components/ui';
import { levelsApi } from '@/lib/api';
import type { LevelsResponse, MatrixEntry } from '@/lib/api';

interface PermisosTabProps {
  data: LevelsResponse | null;
  loading: boolean;
  onReload: () => Promise<void>;
}

/** Construye el Map nivel|permiso -> allowed desde la data. */
function buildMatrix(data: LevelsResponse): Map<string, boolean> {
  const m = new Map<string, boolean>();
  for (const lv of data.levels) {
    for (const p of lv.permissions) {
      m.set(`${lv.level}|${p.permission_code}`, p.allowed);
    }
  }
  return m;
}

export function PermisosTab({ data, loading, onReload }: PermisosTabProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.split('-')[0];
  const [matrix, setMatrix] = useState<Map<string, boolean>>(new Map());
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setMatrix(buildMatrix(data));
    setDirty(false);
  }, [data]);

  const toggle = (level: number, code: string) => {
    const key = `${level}|${code}`;
    setMatrix((prev) => {
      const next = new Map(prev);
      next.set(key, !next.get(key));
      return next;
    });
    setDirty(true);
  };

  const handleDiscard = () => {
    if (!data) return;
    setMatrix(buildMatrix(data));
    setDirty(false);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const payload: MatrixEntry[] = [];
      for (const lv of data.levels) {
        for (const p of data.permission_catalog) {
          payload.push({
            level: lv.level,
            permission_code: p.key,
            allowed: matrix.get(`${lv.level}|${p.key}`) ?? false,
          });
        }
      }
      await levelsApi.setMatrix(payload);
      setDirty(false);
      await onReload();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SkeletonTable rows={10} cols={8} />;
  if (!data) return <></>;

  const visibleLevels = data.levels.filter((lv) => !lv.is_reserved);
  const thBand = 'bg-table-header border-b border-border';

  return (
    <div className="space-y-5">
      <SectionHeader
        title={t('permissions.section_title')}
        description={t('permissions.section_desc')}
        dirty={dirty}
        saving={saving}
        onDiscard={handleDiscard}
        onSave={handleSave}
      />

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th
                  className={`text-left sticky left-0 px-4 py-3 text-[11px] uppercase tracking-wider font-semibold opacity-80 ${thBand}`}
                >
                  {t('permissions.col_permission')}
                </th>
                {visibleLevels.map((lv) => (
                  <th key={lv.level} className={`px-2 py-3 text-center ${thBand}`}>
                    <Badge tone="neutral">L{lv.level}</Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.permission_catalog.map((p) => (
                <tr
                  key={p.key}
                  className="border-b border-border last:border-0 hover:bg-elevated/40 transition"
                >
                  <td className="px-4 py-3 sticky left-0 bg-card">
                    <div className="font-medium">
                      {lang === 'ko' ? p.label_ko : lang === 'en' ? p.label_en : p.label_es}
                    </div>
                    <div className="text-[10px] opacity-60 font-mono">{p.key}</div>
                  </td>
                  {visibleLevels.map((lv) => (
                    <td key={lv.level} className="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 align-middle"
                        checked={matrix.get(`${lv.level}|${p.key}`) ?? false}
                        onChange={() => toggle(lv.level, p.key)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
