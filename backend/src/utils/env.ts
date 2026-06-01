/**
 * Utilidad unificada para normalizar valores de variables de entorno.
 * Reemplaza las implementaciones duplicadas en ipfs.ts, env.ts y blockchain.ts.
 */

export function normalizeEnvValue(value: string | undefined, fallback = ''): string {
  if (!value) return fallback;
  let normalized = value.trim();

  while (
    normalized.length >= 2 &&
    ((normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized || fallback;
}
