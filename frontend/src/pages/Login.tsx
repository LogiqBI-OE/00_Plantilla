/**
 * Login — pantalla full con BackgroundCarousel + brand publico + selector
 * adaptativo de tenant.
 *
 * Layout 2 columnas:
 *   Izquierda: form translucido con backdrop-filter blur (frosted glass).
 *   Derecha: brand hero con logo + alcance, fondo var(--brand-hero-bg).
 *
 * BrandProvider scope='public' carga /api/brand/public que decide si
 * mostrar el selector de tenant (cuando hay 2+ tenants activos).
 */
import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BackgroundCarousel } from '@/components/BackgroundCarousel';
import {
  Button,
  LanguageToggle,
  TextField,
  ThemeToggle,
} from '@/components/ui';
import { ApiError, authApi, brandApi } from '@/lib/api';
import type { BrandPublic, Tenant } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { applyPalette } from '@/lib/brand';

export default function Login(): React.ReactElement {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [brand, setBrand] = useState<BrandPublic | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [tenantOptions, setTenantOptions] = useState<Tenant[]>([]);
  const [tenantSlug, setTenantSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resolvingTenants, setResolvingTenants] = useState(false);

  // Cargar brand publico al montar.
  useEffect(() => {
    void brandApi
      .getPublic()
      .then((b) => {
        setBrand(b);
        if (b.paleta_actual) applyPalette(b.paleta_actual);
        if (b.tenant_slug) setTenantSlug(b.tenant_slug);
      })
      .catch(() => undefined);
  }, []);

  // Si el sistema tiene 2+ tenants, resolver opciones cuando el usuario
  // termine de escribir identifier (debounced).
  useEffect(() => {
    if (!brand?.requires_tenant_selector || !identifier.trim()) {
      setTenantOptions([]);
      return;
    }
    const handle = window.setTimeout(() => {
      setResolvingTenants(true);
      authApi
        .tenantsForIdentifier(identifier.trim())
        .then((res) => setTenantOptions(res.tenants))
        .catch(() => setTenantOptions([]))
        .finally(() => setResolvingTenants(false));
    }, 400);
    return () => window.clearTimeout(handle);
  }, [brand?.requires_tenant_selector, identifier]);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await login({
        identifier,
        password,
        tenant_slug: tenantSlug || undefined,
      });
      if (res.user.level >= 8 && !res.tenant) navigate('/platform');
      else navigate('/');
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.toUserMessage() : t('errors.generic'));
    } finally {
      setSubmitting(false);
    }
  };

  const marca = brand?.marca ?? 'LogiQ';
  const alcance = brand?.alcance ?? 'Workspace';
  const logoLogin = brand?.logo_login ?? '/brand/logiq/logo-black.png';
  const fotos = brand?.carrusel_fotos ?? [];
  const segundos = brand?.carrusel_segundos ?? 4.5;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <BackgroundCarousel fotos={fotos} intervalSeconds={segundos} />

      {/* Toggles flotantes top-right */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* Izquierda: formulario */}
        <div
          className="p-8 md:p-10"
          style={{
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(16px) saturate(140%)',
            WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          }}
        >
          <div
            className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6"
            style={{
              background: 'var(--brand-hero-accent)',
              color: 'var(--brand-hero-accent-ink)',
            }}
          >
            {marca} · {alcance}
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            {t('auth.login.title')}
          </h1>
          <p className="text-sm text-slate-600 mb-6">{t('auth.login.subtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label={t('auth.login.identifier')}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />

            {brand?.requires_tenant_selector && tenantOptions.length > 1 && (
              <div className="space-y-1">
                <label className="text-xs font-medium opacity-80">
                  {t('auth.login.tenant_selector')}
                </label>
                <select
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                  required
                >
                  <option value="">--</option>
                  {tenantOptions.map((tt) => (
                    <option key={tt.slug} value={tt.slug}>
                      {tt.name}
                    </option>
                  ))}
                </select>
                {resolvingTenants && (
                  <p className="text-xs opacity-60">{t('common.loading')}…</p>
                )}
              </div>
            )}

            <TextField
              label={t('auth.login.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {error && (
              <div className="px-3 py-2 rounded-lg bg-danger/15 text-danger text-xs">
                {error}
              </div>
            )}

            <Button type="submit" loading={submitting} className="w-full">
              {t('auth.login.submit', { alcance })}
            </Button>
          </form>

          <p className="mt-8 text-[10px] text-center text-slate-500 uppercase tracking-wider">
            Powered by LogiQ
          </p>
        </div>

        {/* Derecha: brand hero */}
        <div
          className="hidden md:flex flex-col items-center justify-center p-10 text-center"
          style={{ background: 'var(--brand-hero-bg)' }}
        >
          <img
            src={logoLogin}
            alt={marca}
            className="max-w-[200px] max-h-[120px] object-contain mb-6"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div
            className="flex items-center gap-3 text-xs uppercase tracking-[0.2em]"
            style={{ color: 'var(--brand-hero-text-muted)' }}
          >
            <span
              className="flex-1 h-px"
              style={{ background: 'var(--brand-hero-divider)' }}
            />
            <span style={{ color: 'var(--brand-hero-text)' }}>
              {alcance.toUpperCase()}
            </span>
            <span
              className="flex-1 h-px"
              style={{ background: 'var(--brand-hero-divider)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
