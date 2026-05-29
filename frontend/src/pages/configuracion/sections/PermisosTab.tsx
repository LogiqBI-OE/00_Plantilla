/** PermisosTab — matriz nivel x permiso (checkbox grid). L9 only. */
import { useEffect, useState } from 'react';

import { Badge, Button, SkeletonTable } from '@/components/ui';
import { levelsApi } from '@/lib/api';
import type { LevelsResponse, MatrixEntry } from '@/lib/api';

interface PermisosTabProps {
  data: LevelsResponse | null;
  loading: boolean;
  onReload: () => Promise<void>;
}

export function PermisosTab({ data, loading, onReload }: PermisosTabProps): React.ReactElement {
  const [matrix, setMatrix] = useState<Map<string, boolean>>(new Map());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    const m = new Map<string, boolean>();
    for (const lv of data.levels) {
      for (const p of lv.permissions) {
        m.set(`${lv.level}|${p.permission_code}`, p.allowed);
      }
    }
    setMatrix(m);
  }, [data]);

  const toggle = (level: number, code: string) => {
    const key = `${level}|${code}`;
    setMatrix((prev) => {
      const next = new Map(prev);
      next.set(key, !next.get(key));
      return next;
    });
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
      await onReload();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SkeletonTable rows={10} cols={8} />;
  if (!data) return <></>;

  const visibleLevels = data.levels.filter((lv) => !lv.is_reserved);

  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button loading={saving} onClick={handleSave}>
          Guardar matriz
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left px-2 py-2 sticky left-0 bg-card">Permiso</th>
              {visibleLevels.map((lv) => (
                <th key={lv.level} className="px-2 py-2 text-center">
                  <Badge tone="neutral">L{lv.level}</Badge>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.permission_catalog.map((p) => (
              <tr key={p.key} className="border-t border-border">
                <td className="px-2 py-2 sticky left-0 bg-card">
                  <div className="font-medium">{p.label_es}</div>
                  <div className="text-[10px] opacity-60 font-mono">{p.key}</div>
                </td>
                {visibleLevels.map((lv) => (
                  <td key={lv.level} className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
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
  );
}
