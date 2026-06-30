const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

/**
 * Type guard que comprueba si un valor es un hash de transaccion Ethereum valido (0x + 64 caracteres hex).
 * @param value - Valor a comprobar.
 */
export function isValidTxHash(value: unknown): value is string {
  return typeof value === 'string' && TX_HASH_REGEX.test(value);
}

/**
 * Type guard que comprueba si un valor es un string no vacio (tras recortar espacios).
 * @param value - Valor a comprobar.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Intenta convertir un valor a un entero positivo.
 * @param value - Valor a convertir (numero o string numerico).
 * @returns El entero positivo, o `null` si la conversion falla o el resultado es ≤ 0.
 */
export function toPositiveInteger(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
