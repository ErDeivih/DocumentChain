/**
 * Utilidades para la gestión de parámetros de solicitudes Express.
 */

/**
 * Obtiene un único valor de tipo cadena a partir de un parámetro de la solicitud.
 * Dado que Express puede proporcionar `string | string[]`, esta función garantiza
 * que se devuelva una única cadena.
 *
 * @param value - Valor del parámetro (puede ser cadena, arreglo de cadenas o indefinido).
 * @returns Primera cadena del arreglo, la cadena misma, o una cadena vacía.
 */
export function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value || '';
}

/**
 * Obtiene un único valor de tipo cadena a partir de un parámetro de consulta (query).
 *
 * @param value - Valor del query (puede ser cadena, arreglo de cadenas o indefinido).
 * @returns Primera cadena del arreglo, la cadena misma, o una cadena vacía.
 */
export function getQuery(value: string | string[] | undefined): string {
  return getParam(value);
}

/**
 * Obtiene un parámetro de consulta como un arreglo de cadenas.
 *
 * @param value - Valor del query (puede ser cadena, arreglo de cadenas o indefinido).
 * @returns Arreglo de cadenas; si el valor es una cadena única, se envuelve en un arreglo.
 */
export function getQueryArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
}
