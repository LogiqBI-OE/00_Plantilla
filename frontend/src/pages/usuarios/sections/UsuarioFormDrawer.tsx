/**
 * UsuarioFormDrawer — drawer para crear/editar usuario.
 *
 * Valida level <= self.level en frontend (backend hace lo mismo).
 * En modo edit, no permite cambiar email (requeriria flujo de
 * verificacion). Si se cambia el password en edit (campo opcional),
 * se hace un PATCH separado al endpoint reset-password.
 */
import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Drawer, TextField } from '@/components/ui';
import { ApiError, usersApi } from '@/lib/api';
import type { User } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface UsuarioFormDrawerProps {
  mode: 'create' | 'edit';
  user?: User;
  onClose: () => void;
  onSaved: () => void;
}

export function UsuarioFormDrawer({
  mode,
  user,
  onClose,
  onSaved,
}: UsuarioFormDrawerProps): React.ReactElement {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const maxLevel = me?.level ?? 0;

  const [email, setEmail] = useState(user?.email ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastPaterno, setLastPaterno] = useState(user?.last_name_paterno ?? '');
  const [lastMaterno, setLastMaterno] = useState(user?.last_name_materno ?? '');
  const [level, setLevel] = useState(user?.level ?? 0);
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (mode === 'create') {
        await usersApi.create({
          email,
          username: username || null,
          password,
          first_name: firstName,
          last_name_paterno: lastPaterno,
          last_name_materno: lastMaterno,
          level,
        });
      } else if (user) {
        await usersApi.update(user.id, {
          username: username || null,
          first_name: firstName,
          last_name_paterno: lastPaterno,
          last_name_materno: lastMaterno,
          level,
          is_active: isActive,
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.toUserMessage() : t('errors.generic'));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (): Promise<void> => {
    if (!user) return;
    setResetting(true);
    setError(null);
    try {
      const res = await usersApi.resetPassword(user.id);
      alert(t('usuarios.reset_done', { password: res.standard_password }));
    } catch (err) {
      setError(err instanceof ApiError ? err.toUserMessage() : t('errors.generic'));
    } finally {
      setResetting(false);
    }
  };

  return (
    <Drawer
      open
      onClose={onClose}
      title={mode === 'create' ? t('usuarios.new') : t('usuarios.edit', { name: user?.full_name ?? '' })}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} loading={saving} type="submit" form="usuario-form">
            {t('common.save')}
          </Button>
        </>
      }
    >
      <form id="usuario-form" onSubmit={handleSubmit} className="space-y-3">
        <TextField
          label={t('auth.login.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={mode === 'edit'}
          required
        />
        <TextField
          label={t('usuarios.username_label')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {mode === 'create' && (
          <TextField
            label={t('auth.login.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            hint={t('usuarios.password_hint')}
          />
        )}
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={t('usuarios.first_name')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <TextField
            label={t('usuarios.last_paterno')}
            value={lastPaterno}
            onChange={(e) => setLastPaterno(e.target.value)}
            required
          />
        </div>
        <TextField
          label={t('usuarios.last_materno')}
          value={lastMaterno}
          onChange={(e) => setLastMaterno(e.target.value)}
        />
        <div className="space-y-1">
          <label className="text-xs font-medium opacity-80">{t('common.level')}</label>
          <select
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value, 10))}
            className="w-full rounded-lg bg-card border border-border px-3 py-2 text-sm"
          >
            {Array.from({ length: maxLevel + 1 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>
                L{n}
              </option>
            ))}
          </select>
          <p className="text-xs opacity-60">{t('usuarios.level_max', { max: maxLevel })}</p>
        </div>
        {mode === 'edit' && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            {t('common.active')}
          </label>
        )}

        {mode === 'edit' && user && user.id !== me?.id && (
          <div className="border-t border-border pt-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={resetting}
              onClick={handleReset}
            >
              {t('usuarios.reset_password')}
            </Button>
          </div>
        )}

        {error && (
          <div className="px-3 py-2 rounded-lg bg-danger/15 text-danger text-xs">{error}</div>
        )}
      </form>
    </Drawer>
  );
}
