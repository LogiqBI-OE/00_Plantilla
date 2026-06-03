/**
 * Login — pantalla full con BackgroundCarousel + brand publico + selector
 * adaptativo de tenant. Estilo "Terra de Flora":
 *   Izquierda: panel frosted con header (marca + pill de alcance), campos con
 *     label en mayusculas, contrasena con toggle de visibilidad, recuerdame +
 *     olvidaste, y soporte.
 *   Derecha: brand hero con logo grande + alcance en modo hero.
 *
 * BrandProvider scope='public' carga /api/brand/public que decide si mostrar
 * el selector de tenant (cuando hay 2+ tenants cliente).
 */
import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';

import { BackgroundCarousel } from '@/components/BackgroundCarousel';
import { Button, LanguageToggle, ThemeToggle } from '@/components/ui';
import { ApiError, authApi, brandApi, TENANT_TYPE_LABEL } from '@/lib/api';
import type { BrandPublic, Tenant } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { applyPalette } from '@/lib/brand';

const INPUT_CLASS =
  'w-full rounded-xl bg-slate-100/80 border border-transparent px-4 py-3 text-sm ' +
  'text-slate-900 placeholder:text-slate-400 outline-none transition ' +
  'focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-accent/20';
const LABEL_CLASS =
  'block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5';

export default function Login(): React.ReactElement {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [brand, setBrand] = useState<BrandPublic | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
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

  // Si el sistema tiene 2+ tenants cliente, resolver opciones cuando el
  // usuario termine de escribir identifier (debounced).
  useEffect(() => {
    if (!brand?.requires_tenant_selector || !identifier.trim()) {
      setTenantOptions([]);
      return;
    }
    const handle = window.setTimeout(() => {
      setResolvingTenants(true);
      authApi
        .tenantsForIdentifier(identifier.trim())
        .then((res) => {
          setTenantOptions(res.tenants);
          // Preseleccionar la primera opcion (no dejar el placeholder vacio).
          if (res.tenants.length > 0) setTenantSlug(res.tenants[0].slug);
        })
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
  const logoLogin = brand?.logo_login ?? '/brand/logiq/logo-white.png';
  const fotos = brand?.carrusel_fotos ?? [];
  const segundos = brand?.carrusel_segundos ?? 4.5;
  const showSelector = brand?.requires_tenant_selector && tenantOptions.length > 1;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Backdrop de marca cuando no hay fotos de carrusel (evita el gris plano). */}
      {fotos.length === 0 && (
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(70% 90% at 15% 15%, rgba(255,255,255,0.10), transparent 55%), ' +
              'radial-gradient(75% 90% at 85% 90%, rgba(90,120,190,0.28), transparent 55%), ' +
              'linear-gradient(135deg, var(--brand-hero-bg) 0%, #16223f 60%, var(--brand-hero-bg) 100%)',
          }}
        />
      )}
      <BackgroundCarousel fotos={fotos} intervalSeconds={segundos} />

      {/* Toggles flotantes top-right */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* Izquierda: formulario */}
        <div
          className="p-8 md:p-12 flex flex-col"
          style={{
            background: 'rgba(255, 255, 255, 0.62)',
            backdropFilter: 'blur(16px) saturate(140%)',
            WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          }}
        >
          {/* Header: ——— MARCA  (alcance pill) */}
          <div className="flex items-center gap-3 mb-8">
            <span
              className="h-px w-10"
              style={{ background: 'var(--brand-hero-bg)', opacity: 0.3 }}
            />
            <span
              className="text-sm font-bold uppercase tracking-[0.25em]"
              style={{ color: 'var(--brand-hero-bg)' }}
            >
              {marca}
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: 'var(--brand-hero-accent)',
                color: 'var(--brand-hero-accent-ink)',
              }}
            >
              {alcance}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            {t('auth.login.title')}
          </h1>
          <p className="text-sm text-slate-600 mb-7">{t('auth.login.subtitle')}.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={LABEL_CLASS}>
                {t('auth.login.identifier')} <span className="text-red-500">*</span>
              </label>
              <input
                className={INPUT_CLASS}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('auth.login.identifier_placeholder')}
                autoComplete="username"
                required
                autoFocus
              />
            </div>

            {showSelector && (
              <div>
                <label className={LABEL_CLASS}>
                  {t('auth.login.tenant_selector')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  className={INPUT_CLASS}
                  required
                >
                  {tenantOptions.map((tt) => (
                    <option key={tt.slug} value={tt.slug}>
                      {tt.name} · {TENANT_TYPE_LABEL[tt.type]}
                    </option>
                  ))}
                </select>
                {resolvingTenants && (
                  <p className="text-xs text-slate-500 mt-1">{t('common.loading')}…</p>
                )}
              </div>
            )}

            <div>
              <label className={LABEL_CLASS}>
                {t('auth.login.password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  className={`${INPUT_CLASS} pr-11`}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                  aria-label={t('auth.login.password')}
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.5} />
                  ) : (
                    <Eye size={18} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-slate-300"
                />
                {t('auth.login.remember_me')}
              </label>
              <button
                type="button"
                className="font-semibold hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                {t('auth.login.forgot_password')}
              </button>
            </div>

            {error && (
              <div className="px-3 py-2 rounded-lg bg-danger/15 text-danger text-xs">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={submitting}
              className="w-full text-base"
              style={{
                background:
                  'linear-gradient(rgba(255,255,255,0.22), rgba(255,255,255,0.22)), var(--brand-hero-bg)',
                paddingTop: '0.7rem',
                paddingBottom: '0.7rem',
              }}
            >
              {t('auth.login.submit', { alcance })}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            {t('auth.login.need_help')}{' '}
            <span className="font-semibold text-slate-700">
              {t('auth.login.contact_support')}
            </span>
          </p>

          <p className="mt-auto pt-8 text-[11px] text-slate-500">
            Powered by{' '}
            <span className="font-semibold text-slate-700">LogiQ</span> · Business Intelligence
          </p>
        </div>

        {/* Derecha: brand hero */}
        <div
          className="hidden md:flex flex-col items-center justify-center p-10 text-center"
          style={{
            background:
              'radial-gradient(100% 80% at 50% 0%, rgba(130,160,230,0.22), transparent 60%), ' +
              'radial-gradient(120% 100% at 50% 120%, rgba(0,0,0,0.38), transparent 60%), ' +
              'var(--brand-hero-bg)',
          }}
        >
          <img
            src={logoLogin}
            alt={marca}
            className="max-w-[360px] max-h-[220px] w-full object-contain mb-8"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div
            className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] w-full max-w-[320px]"
            style={{ color: 'var(--brand-hero-text-muted)' }}
          >
            <span
              className="flex-1 h-px opacity-50"
              style={{ background: 'var(--brand-hero-accent)' }}
            />
            <span style={{ color: 'var(--brand-hero-accent)' }}>
              {alcance.toUpperCase()}
            </span>
            <span
              className="flex-1 h-px opacity-50"
              style={{ background: 'var(--brand-hero-accent)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
