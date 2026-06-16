/**
 * Tipos compartidos de la capa API (F3).
 *
 * Los contratos concretos de cada dominio (User, Pet, Appointment…) se definen
 * en sus propios archivos de `types/`. Aquí solo viven los genéricos.
 */

/** Errores de validación por campo (respuestas 422). */
export type FieldErrors = Record<string, string[]>;

export type ApiErrorKind =
  | 'network' // sin conexión / DNS / fetch falló
  | 'timeout' // se excedió el tiempo de espera
  | 'unauthorized' // 401
  | 'forbidden' // 403
  | 'notFound' // 404
  | 'validation' // 422
  | 'server' // 5xx
  | 'unknown';

/** Error normalizado que consume la UI (mensajes en español, sin stack/token). */
export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly fieldErrors?: FieldErrors;
  /** Código de error anónimo para correlación (RNF-OBS-001). */
  readonly code?: string;

  constructor(params: {
    message: string;
    status: number;
    kind: ApiErrorKind;
    fieldErrors?: FieldErrors;
    code?: string;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.kind = params.kind;
    this.fieldErrors = params.fieldErrors;
    this.code = params.code;
  }
}

/** Resultado paginado, cuando el endpoint lo ofrezca (RNF-PERF-001). */
export interface Paginated<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface RequestOptions {
  /** Query string. */
  params?: QueryParams;
  /** Headers extra. */
  headers?: Record<string, string>;
  /** Si false, no inyecta Authorization (endpoints públicos). Default true. */
  auth?: boolean;
  /** Si true, no intenta refresh ante 401 (evita bucles en /auth/refresh). */
  skipRefresh?: boolean;
  /** Timeout específico (ms). */
  timeoutMs?: number;
}
