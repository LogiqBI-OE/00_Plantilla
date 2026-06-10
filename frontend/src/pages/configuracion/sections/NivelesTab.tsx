/** NivelesTab — tabla con label/description/is_reserved editables (L9). */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, SectionHeader, SkeletonTable, TextField } from '@/components/ui';
import { levelsApi } from '@/lib/api';
import type { LevelsResponse } from '@/lib/api';

interface NivelesTabProps {
  data: LevelsResponse | null;
  loading: boolean;
  onReload: () => Promise<void>;
}

type Draft = { label?: string; description?: string; is_reserved?: boolean };

export function NivelesTab({ data, loading, onReload }: NivelesTabProps): React.ReactElement {
  const { t } = useTranslation();
  const [edits, setEdits] = useState<Record<number, Draft>>({});
  const [saving, setSaving] = useState(false);

  const setEdit = (level: number, patch: Draft) => {
    setEdits((prev) => ({ ...prev, [level]: { ...prev[level], ...patch } }));
  };

  const dirty = Object.keys(edits).length > 0;

  const handleSave = async () => {
    if (!dirty) return;
    setSaving(true);
    try {
      for (const [level, patch] of Object.entries(edits)) {
        await levelsApi.updateLevel(Number(level), patch);
      }
      setEdits({});
      await onReload();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SkeletonTable rows={10} cols={4} />;
  if (!data) return <></>;

  const th = 'px-4 py-3 text-[11px] uppercase tracking-wider font-semibold opacity-80 bg-table-header border-b border-border';

  return (
    <div className="space-y-5">
      <SectionHeader
        title={t('levels.section_title')}
        description={t('levels.section_desc')}
        dirty={dirty}
        saving={saving}
        onDiscard={() => setEdits({})}
        onSave={handleSave}
      />

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr>
              <th className={`text-left w-20 ${th}`}>{t('levels.col_level')}</th>
              <th className={`text-left w-64 ${th}`}>{t('levels.col_label')}</th>
              <th className={`text-left ${th}`}>{t('levels.col_description')}</th>
              <th className={`text-right w-28 ${th}`}>{t('levels.col_hidden')}</th>
            </tr>
          </thead>
          <tbody>
            {data.levels.map((lv) => {
              const draft = edits[lv.level] ?? {};
              return (
                <tr
                  key={lv.level}
                  className="border-b border-border last:border-0 hover:bg-elevated/40 transition"
                >
                  <td className="px-4 py-3">
                    <Badge tone="neutral">L{lv.level}</Badge>
                  </td>
                  <td className="px-2 py-2">
                    <TextField
                      variant="ghost"
                      value={draft.label ?? lv.label}
                      onChange={(e) => setEdit(lv.level, { label: e.target.value })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <TextField
                      variant="ghost"
                      value={draft.description ?? lv.description}
                      onChange={(e) => setEdit(lv.level, { description: e.target.value })}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="checkbox"
                      className="w-4 h-4 align-middle"
                      checked={draft.is_reserved ?? lv.is_reserved}
                      onChange={(e) => setEdit(lv.level, { is_reserved: e.target.checked })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
