/** NivelesTab — tabla con label/description/is_reserved editables (L9). */
import { useState } from 'react';

import { Badge, Button, SkeletonTable, TextField } from '@/components/ui';
import { levelsApi } from '@/lib/api';
import type { LevelsResponse } from '@/lib/api';

interface NivelesTabProps {
  data: LevelsResponse | null;
  loading: boolean;
  onReload: () => Promise<void>;
}

export function NivelesTab({ data, loading, onReload }: NivelesTabProps): React.ReactElement {
  const [edits, setEdits] = useState<Record<number, { label?: string; description?: string; is_reserved?: boolean }>>({});
  const [savingLevel, setSavingLevel] = useState<number | null>(null);

  const setEdit = (level: number, patch: object) => {
    setEdits((prev) => ({ ...prev, [level]: { ...prev[level], ...patch } }));
  };

  const handleSave = async (level: number) => {
    const patch = edits[level];
    if (!patch) return;
    setSavingLevel(level);
    try {
      await levelsApi.updateLevel(level, patch);
      setEdits((prev) => {
        const next = { ...prev };
        delete next[level];
        return next;
      });
      await onReload();
    } finally {
      setSavingLevel(null);
    }
  };

  if (loading) return <SkeletonTable rows={10} cols={4} />;
  if (!data) return <></>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-elevated text-xs uppercase tracking-wider opacity-70">
          <tr>
            <th className="text-left px-4 py-2.5 font-medium w-16">#</th>
            <th className="text-left px-4 py-2.5 font-medium">Label</th>
            <th className="text-left px-4 py-2.5 font-medium">Descripcion</th>
            <th className="text-center px-4 py-2.5 font-medium w-24">Oculto</th>
            <th className="text-right px-4 py-2.5 font-medium w-32"></th>
          </tr>
        </thead>
        <tbody>
          {data.levels.map((lv) => {
            const draft = edits[lv.level] ?? {};
            const dirty = Object.keys(draft).length > 0;
            return (
              <tr key={lv.level} className="border-t border-border">
                <td className="px-4 py-2"><Badge tone="neutral">L{lv.level}</Badge></td>
                <td className="px-4 py-2">
                  <TextField
                    size="sm"
                    value={draft.label ?? lv.label}
                    onChange={(e) => setEdit(lv.level, { label: e.target.value })}
                  />
                </td>
                <td className="px-4 py-2">
                  <TextField
                    size="sm"
                    value={draft.description ?? lv.description}
                    onChange={(e) => setEdit(lv.level, { description: e.target.value })}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={draft.is_reserved ?? lv.is_reserved}
                    onChange={(e) => setEdit(lv.level, { is_reserved: e.target.checked })}
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <Button
                    size="sm"
                    disabled={!dirty}
                    loading={savingLevel === lv.level}
                    onClick={() => handleSave(lv.level)}
                  >
                    Guardar
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
