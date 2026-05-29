/** GlobalSettingsPage — SystemConfig key-value editor (L9 only). */
import { useCallback, useEffect, useState } from 'react';

import { Button, Card, EmptyState, SkeletonBox, TextField } from '@/components/ui';
import { systemConfigApi } from '@/lib/api';
import type { SystemConfigItem } from '@/lib/api';
import { usePageTitle } from '@/lib/pageTitle';

export default function GlobalSettingsPage(): React.ReactElement {
  usePageTitle('Configuracion global');

  const [items, setItems] = useState<SystemConfigItem[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await systemConfigApi.list();
      setItems(res.items);
      setEdits({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleSave = async (): Promise<void> => {
    if (Object.keys(edits).length === 0) return;
    setSaving(true);
    try {
      const res = await systemConfigApi.patch(edits);
      setItems(res.items);
      setEdits({});
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SkeletonBox height={300} />;
  if (items.length === 0) return <EmptyState icon="⚙️" title="Sin configuracion" />;

  // Agrupar por section
  const sections = new Map<string, SystemConfigItem[]>();
  for (const item of items) {
    const list = sections.get(item.section) ?? [];
    list.push(item);
    sections.set(item.section, list);
  }

  const dirty = Object.keys(edits).length > 0;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header de pagina */}
      <div>
        <h2 className="text-2xl font-bold">Configuracion global</h2>
        <p className="text-sm opacity-60 mt-1">
          Solo nivel 9. Parametros que controlan el comportamiento del sistema.
        </p>
      </div>

      {/* Panel unico */}
      <Card className="space-y-6">
        {/* Header del panel: heading + acciones */}
        <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="font-semibold text-sm">Parametros del sistema</h3>
            <p className="text-xs opacity-60 mt-0.5">
              {items.length} claves de configuracion runtime.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="secondary" onClick={() => setEdits({})} disabled={!dirty}>
              Descartar
            </Button>
            <Button onClick={handleSave} disabled={!dirty} loading={saving}>
              Guardar cambios
            </Button>
          </div>
        </div>

        {Array.from(sections.entries()).map(([sectionName, sectionItems]) => (
        <div key={sectionName} className="space-y-3">
          <h4 className="font-semibold text-xs uppercase tracking-wider opacity-70">
            {sectionName}
          </h4>
          {sectionItems.map((item) => {
            const value = edits[item.key] ?? item.value;
            const isDirty = item.key in edits;
            const setValue = (v: string) => setEdits((prev) => ({ ...prev, [item.key]: v }));
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium flex-1">{item.label}</label>
                  {isDirty && <span className="text-[10px] text-warning">●</span>}
                </div>
                <p className="text-xs opacity-60">{item.description}</p>
                {item.input_type === 'boolean' ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={value === 'true'}
                      onChange={(e) => setValue(e.target.checked ? 'true' : 'false')}
                    />
                    {value === 'true' ? 'Si' : 'No'}
                  </label>
                ) : item.input_type === 'select' ? (
                  <select
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full rounded-lg bg-card border border-border px-3 py-2 text-sm"
                  >
                    {item.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <TextField
                    type={item.input_type === 'password' ? 'password' : item.input_type === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    size="sm"
                  />
                )}
                <p className="text-[10px] opacity-50 font-mono">{item.key} · default: {item.default}</p>
              </div>
            );
          })}
        </div>
        ))}
      </Card>
    </div>
  );
}
