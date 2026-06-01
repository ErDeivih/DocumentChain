const TX_HASH_REGEX = /^0x[a-fA-F0-9]{64}$/;

export function isValidTxHash(value: unknown): value is string {
  return typeof value === 'string' && TX_HASH_REGEX.test(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function toPositiveInteger(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
