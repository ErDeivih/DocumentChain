/**
 * Utility functions for handling Express request parameters
 */

/**
 * Get a single string value from request params
 * Express params can be string | string[], this ensures we get a single string
 */
export function getParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value || '';
}

/**
 * Get a single string value from request query
 */
export function getQuery(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value || '';
}

/**
 * Get query as array of strings
 */
export function getQueryArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
}
