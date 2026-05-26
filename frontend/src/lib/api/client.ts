/**
 * Cliente HTTP base.
 *
 * Wrapper tipado sobre fetch nativo. Maneja:
 * - Token JWT desde localStorage (auto-inyectado en Authorization header).
 * - JSON serialize/deserialize.
 * - Errores mapeados a ApiError con shape consistente.
 * - Base URL: en dev usa proxy de Vite (/api -> localhost:8000); en
 *   produccion usa VITE_API_URL (env var) o el mismo origen si no.
 *
 * Sin cache: cada llamada va al backend (convencion de la plantilla).
 */

const STORAGE_TOKEN_KEY = 'logiq-access-token';
const STORAGE_REFRESH_KEY = 'logiq-refresh-token';

/** Lee el access token del localStorage. */
export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_TOKEN_KEY);
}

/** Lee el refresh token del localStorage. */
export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_REFRESH_KEY);
}

/** Persiste un nuevo par de tokens. */
export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(STORAGE_TOKEN_KEY, access);
  localStorage.setItem(STORAGE_REFRESH_KEY, refresh);
}

/** Borra los tokens (logout). */
export function clearTokens(): void {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_REFRESH_KEY);
}

/**
 * Error tipado de la API. Encapsula status code + detail del backend
 * (puede ser string, objeto con campos, o estructura DRF estandar).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, detail: unknown, message?: string) {
    super(message ?? formatErrorDetail(detail) ?? `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }

  /** Conveniencia: extrae mensaje legible del detail. */
  toUserMessage(): string {
    return formatErrorDetail(this.detail) ?? this.message;
  }
}

/**
 * Convierte el `detail` de un error en un string legible.
 *
 * DRF puede devolver:
 *   { "detail": "..." }                          -> string plano
 *   { "field": ["error1", "error2"] }            -> "field: error1"
 *   { "non_field_errors": ["..."] }              -> "..."
 */
export function formatErrorDetail(detail: unknown): string | null {
  if (typeof detail === 'string') return detail;
  if (!detail || typeof detail !== 'object') return null;

  const d = detail as Record<string, unknown>;

  if (typeof d.detail === 'string') return d.detail;
  if (typeof d.message === 'string') return d.message;

  // Primer campo con error
  for (const [key, value] of Object.entries(d)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
      return key === 'non_field_errors' ? value[0] : `${key}: ${value[0]}`;
    }
    if (typeof value === 'string') {
      return key === 'non_field_errors' || key === 'detail' ? value : `${key}: ${value}`;
    }
  }
  return null;
}

type QueryValue = string | number | boolean | undefined | null;

interface RequestOptions {
  /** Si false, no inyecta el token. Util para /api/auth/login y /api/brand/public. */
  auth?: boolean;
  /** Body como objeto (se serializa a JSON automaticamente). */
  body?: unknown;
  /** Query params como objeto (se serializan a ?a=b&c=d). Acepta cualquier shape; valores undefined/null se omiten. */
  params?: Record<string, QueryValue> | { [key: string]: QueryValue };
  /** Signal para abortar (timeout o cancelacion manual). */
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  let url = path.startsWith('http') ? path : path;
  if (!params) return url;
  const entries = Object.entries(params as Record<string, QueryValue>);
  const qs = entries
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  if (qs) url += (url.includes('?') ? '&' : '?') + qs;
  return url;
}

async function request<T = unknown>(
  method: string,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (opts.auth !== false) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, opts.params), {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  // 204 No Content: response vacia
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload: unknown = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, payload);
  }

  return payload as T;
}

export const api = {
  get: <T = unknown>(path: string, opts?: RequestOptions) =>
    request<T>('GET', path, opts),
  post: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, body }),
  patch: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, { ...opts, body }),
  put: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, { ...opts, body }),
  delete: <T = unknown>(path: string, opts?: RequestOptions) =>
    request<T>('DELETE', path, opts),
};
