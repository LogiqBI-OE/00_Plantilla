/**
 * GeneralesTab — editor del SystemConfig (parametros runtime, L9).
 *
 * Es el panel reutilizable: lo usa el tab "Generales" de ConfiguracionPage
 * y tambien GlobalSettingsPage (plataforma). Una sola implementacion del
 * editor para que no diverjan.
 */
import { useCallback, useEffect, useState } from 'react';

import { EmptyState, SectionHeader, SkeletonBox, TextField } from '@/components/ui';
import { systemConfigApi } from '@/lib/api';
import type { SystemConfigItem } from '@/lib/api';

export function GeneralesTab(): React.ReactElement {
  const [items, setItems] = useState<SystemConfigItem[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await systemConfigApi.list();
      // Las keys "managed" se editan en UIs dedicadas (ej. multi-tenant en la
      // pestaña Licencias y tenants), no en el editor generico.
      setItems(res.items.filter((it) => !it.managed));
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

  const sectionNames = Array.from(sections.keys());
  const current =
    activeSection && sections.has(activeSection) ? activeSection : sectionNames[0];
  const currentItems = sections.get(current) ?? [];

  const dirty = Object.keys(edits).length > 0;
  // Cuantos cambios sin guardar hay por seccion (para el badge en la sub-nav).
  const dirtyBySection = new Map<string, number>();
  for (const item of items) {
    if (item.key in edits) {
      dirtyBySection.set(item.section, (dirtyBySection.get(item.section) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Parametros del sistema"
        description={`${items.length} claves de configuracion runtime.`}
        dirty={dirty}
        saving={saving}
        onDiscard={() => setEdits({})}
        onSave={handleSave}
      />

      {/* Sub-navegacion por seccion (sin scroll: solo la seccion activa) */}
      <div className="flex items-center gap-2 flex-wrap border-b border-border pb-3">
        {sectionNames.map((name) => {
          const isActive = name === current;
          const dirtyCount = dirtyBySection.get(name) ?? 0;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setActiveSection(name)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5"
              style={{
                background: isActive ? 'var(--accent-bg-soft)' : 'transparent',
                color: isActive ? 'var(--accent-text)' : 'var(--text-secondary)',
                borderColor: isActive ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {name}
              {dirtyCount > 0 && <span className="text-[10px] text-warning">●</span>}
            </button>
          );
        })}
      </div>

      {/* Items de la seccion activa */}
      <div className="space-y-3">
        {currentItems.map((item) => {
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
    </div>
  );
}
