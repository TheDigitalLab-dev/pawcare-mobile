/**
 * Cliente HTTP central (F3) — RNF-ARQ-002, RNF-SEC-001, RNF-REL-001, RNF-OBS-001.
 *
 * - Base URL por entorno (config).
 * - Inyección de `Authorization: Bearer` vía token provider que registra F4.
 * - Normalización de errores a `ApiError` (mensajes en español, sin stack/token).
 * - Refresh transparente ante 401 (un reintento) usando un hook que registra F4.
 * - Soporte de multipart (uploads, F8) y respuestas crudas (descargas binarias, F8).
 */
import { config } from '@/config/env';
import { getApiBaseUrl } from '@/config/serverConfig';
import {
  ApiError,
  type ApiErrorKind,
  type FieldErrors,
  type RequestOptions,
} from '@/types/api';

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

// --- Hooks que registra la capa de sesión (F4) ----------------------------

let getToken: () => Promise<string | null> = async () => null;
/** Devuelve true si el refresh tuvo éxito y conviene reintentar. */
let refreshSession: () => Promise<boolean> = async () => false;

export function registerTokenProvider(fn: () => Promise<string | null>): void {
  getToken = fn;
}
export function registerSessionRefresher(fn: () => Promise<boolean>): void {
  refreshSession = fn;
}

// --- Utilidades -----------------------------------------------------------

function buildUrl(path: string, params?: RequestOptions['params']): string {
  // URL base en runtime (configurable por el usuario, self-hosted).
  const base = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  if (!params) return base;
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `${base}?${qs}` : base;
}

function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 422) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
}

function messageFor(kind: ApiErrorKind, fallback?: string): string {
  switch (kind) {
    case 'network':
      return 'Sin conexión. Verifica tu red e inténtalo de nuevo.';
    case 'timeout':
      return 'La operación tardó demasiado. Inténtalo de nuevo.';
    case 'unauthorized':
      return 'Tu sesión expiró. Inicia sesión nuevamente.';
    case 'forbidden':
      return 'No tienes permiso para realizar esta acción.';
    case 'notFound':
      return 'No se encontró el recurso solicitado.';
    case 'validation':
      return fallback ?? 'Revisa los datos ingresados.';
    case 'server':
      return 'Ocurrió un error en el servidor. Inténtalo más tarde.';
    default:
      return fallback ?? 'Ocurrió un error inesperado.';
  }
}

/** Extrae fieldErrors y mensaje de un body de error de Rails (formato flexible). */
function parseErrorBody(body: unknown): {
  message?: string;
  fieldErrors?: FieldErrors;
} {
  if (!body || typeof body !== 'object') return {};
  const obj = body as Record<string, unknown>;
  // { errors: { campo: ["msg"] } }
  if (obj.errors && typeof obj.errors === 'object' && !Array.isArray(obj.errors)) {
    const fieldErrors: FieldErrors = {};
    for (const [k, v] of Object.entries(obj.errors as Record<string, unknown>)) {
      fieldErrors[k] = Array.isArray(v) ? v.map(String) : [String(v)];
    }
    return { fieldErrors };
  }
  // { error: "msg" } o { message: "msg" }
  if (typeof obj.error === 'string') return { message: obj.error };
  if (typeof obj.message === 'string') return { message: obj.message };
  return {};
}

function devLog(...args: unknown[]): void {
  // Logging técnico solo en desarrollo (RNF-OBS-001); desactivado en prod.
  // eslint-disable-next-line no-console
  if (config.isDev) console.log('[api]', ...args);
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// --- Núcleo ---------------------------------------------------------------

async function rawRequest(
  method: Method,
  path: string,
  body: unknown,
  options: RequestOptions = {},
  isRetry = false,
): Promise<Response> {
  const { params, headers = {}, auth = true, timeoutMs } = options;
  const url = buildUrl(path, params);

  const finalHeaders: Record<string, string> = { Accept: 'application/json', ...headers };

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let payload: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (isFormData) {
      payload = body as FormData; // el runtime fija el Content-Type con boundary
    } else {
      finalHeaders['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
  }

  if (auth) {
    const token = await getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs ?? config.requestTimeoutMs,
  );

  let res: Response;
  try {
    devLog(method, path);
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: payload,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const aborted = err instanceof Error && err.name === 'AbortError';
    const kind: ApiErrorKind = aborted ? 'timeout' : 'network';
    throw new ApiError({ message: messageFor(kind), status: 0, kind });
  }
  clearTimeout(timer);

  // 401 → intentar refresh una sola vez y reintentar.
  if (res.status === 401 && auth && !options.skipRefresh && !isRetry) {
    const ok = await refreshSession();
    if (ok) return rawRequest(method, path, body, options, true);
  }

  return res;
}

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const res = await rawRequest(method, path, body, options);
  const parsed = await parseJsonSafe(res);

  if (!res.ok) {
    const kind = kindFromStatus(res.status);
    const { message, fieldErrors } = parseErrorBody(parsed);
    devLog('error', res.status, kind);
    throw new ApiError({
      message: messageFor(kind, message),
      status: res.status,
      kind,
      fieldErrors,
    });
  }

  return parsed as T;
}

// --- API pública ----------------------------------------------------------

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
  /** Subida multipart (F8): pasa un FormData ya construido. */
  upload: <T>(path: string, form: FormData, options?: RequestOptions) =>
    request<T>('POST', path, form, options),
  /** Respuesta cruda para descargas binarias / PDFs (F8 la procesa). */
  raw: (path: string, options?: RequestOptions) =>
    rawRequest('GET', path, undefined, options),
};
