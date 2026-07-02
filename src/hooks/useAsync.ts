/**
 * Hook genérico de datos asíncronos: ejecuta una función que pega al backend y
 * expone `data` / `loading` / `error` / `reload`. Base de todas las pantallas que
 * cargan datos reales (estados de carga, error y vacío).
 *
 * Carga una vez al montar. Para refrescar (p. ej. al volver a la pantalla o tras
 * una mutación) usa `reload()`. La identidad de `fn` no dispara recargas: se
 * mantiene la última referencia para que `reload()` siempre use la más reciente
 * (evita bucles cuando se pasa una función inline).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '@/types/api';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  reload: () => Promise<void>;
}

function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  return new ApiError({
    message: 'Ocurrió un error inesperado.',
    status: 0,
    kind: 'unknown',
  });
}

export function useAsync<T>(fn: () => Promise<T>): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const mounted = useRef(true);
  const fnRef = useRef(fn);

  // Se actualiza en un efecto (no en render) para no reejecutar la carga.
  useEffect(() => {
    fnRef.current = fn;
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      if (mounted.current) setData(result);
    } catch (e) {
      if (mounted.current) setError(toApiError(e));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    // Diferido (microtarea) para no disparar setState de forma síncrona dentro
    // del efecto (evita renders en cascada). En `reload()` manual sí es directo.
    const timer = setTimeout(() => void load(), 0);
    return () => {
      mounted.current = false;
      clearTimeout(timer);
    };
  }, [load]);

  return { data, loading, error, reload: load };
}
