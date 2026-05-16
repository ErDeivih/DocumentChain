/**
 * @fileoverview Hook useDebounce.
 *
 * Retrasa la actualización de un valor hasta que deje de cambiar
 * durante un período de tiempo especificado.
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 */

import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores.
 *
 * @template T - Tipo del valor a debouncear.
 * @param value - Valor a retrasar.
 * @param delay - Tiempo de espera en milisegundos (predeterminado: 300).
 * @returns Valor debounceado.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
