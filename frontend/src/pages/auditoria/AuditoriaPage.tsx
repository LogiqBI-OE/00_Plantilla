/** AuditoriaPage — log de eventos con filtros. */
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList } from 'lucide-react';

import {
  Badge,
  Card,
  EmptyState,
  SkeletonTable,
  TextField,
} from '@/components/ui';
import { auditApi } from '@/lib/api';
import type { AuditLog, Paginated } from '@/lib/api';
import { usePageTitle } from '@/lib/pageTitle';

export default function AuditoriaPage(): React.ReactElement {
  const { t } = useTranslation();
  usePageTitle(t('auditoria.title'));

  const [data, setData] = useState<Paginated<AuditLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await auditApi.list({ action: actionFilter || undefined });
      setData(res);
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void reload();
    }, 200);
    return () => window.clearTimeout(t);
  }, [reload]);

  const logs = data?.results ?? [];

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center gap-3">
        <TextField
          placeholder={t('auditoria.filter_placeholder')}
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          size="sm"
          className="max-w-xs"
        />
        <p className="text-sm opacity-60">
          {loading ? '—' : t('auditoria.count', { count: data?.count ?? 0 })}
        </p>
      </div>

      {loading ? (
        <SkeletonTable rows={8} cols={4} />
      ) : logs.length === 0 ? (
        <EmptyState icon={<ClipboardList strokeWidth={1.5} size={36} />} title={t('auditoria.empty')} />
      ) : (
        <Card padding="none">
          <table className="w-full text-sm">
            <thead className="bg-elevated text-xs uppercase tracking-wider opacity-70">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">{t('auditoria.col_when')}</th>
                <th className="text-left px-4 py-2.5 font-medium">{t('auditoria.col_who')}</th>
                <th className="text-left px-4 py-2.5 font-medium">{t('auditoria.col_action')}</th>
                <th className="text-left px-4 py-2.5 font-medium">{t('auditoria.col_target')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-border align-top">
                  <td className="px-4 py-2 text-xs opacity-70 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-xs">{log.user_email ?? '—'}</td>
                  <td className="px-4 py-2">
                    <Badge tone="accent">{log.action}</Badge>
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {log.target_type && (
                      <span className="font-mono opacity-70">
                        {log.target_type}#{log.target_id}
                      </span>
                    )}
                    {Object.keys(log.metadata).length > 0 && (
                      <pre className="mt-1 text-[10px] opacity-60 whitespace-pre-wrap">
                        {JSON.stringify(log.metadata, null, 0)}
                      </pre>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
