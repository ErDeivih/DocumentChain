import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind CSS resolviendo conflictos y eliminando duplicados.
 *
 * @param inputs - Lista de valores de clase (strings, arrays, objetos condicionales).
 * @returns Cadena de clases CSS optimizada.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea una cantidad de bytes a una representación legible (KB, MB, GB, etc.).
 *
 * @param bytes - Cantidad de bytes.
 * @returns Cadena formateada, p. ej., `"1.5 MB"`.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formatea una fecha a formato localizado en español.
 *
 * @param date - Fecha en formato ISO, objeto `Date`, o valor nulo/indefinido.
 * @returns Cadena formateada con día, mes, año, hora y minuto; o un mensaje por defecto.
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'No disponible';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Fecha no registrada';
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Devuelve una descripción relativa del tiempo transcurrido desde una fecha dada.
 *
 * Ejemplos: `"hace 3 minutos"`, `"ayer"`, `"hace 2 semanas"`.
 *
 * @param date - Fecha de referencia.
 * @returns Cadena de tiempo relativo en español, o un mensaje por defecto.
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'No disponible';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Fecha no registrada';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();

  // Si la fecha es futura (desfase de reloj), mostrar como "ahora"
  if (diffMs < 0) {
    return 'ahora';
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

  if (diffSec < 60) return rtf.format(-diffSec, 'second');
  if (diffMin < 60) return rtf.format(-diffMin, 'minute');
  if (diffHour < 24) return rtf.format(-diffHour, 'hour');
  if (diffDay < 30) return rtf.format(-diffDay, 'day');
  if (diffMonth < 12) return rtf.format(-diffMonth, 'month');
  return rtf.format(-diffYear, 'year');
}

/**
 * Trunca una dirección (u otra cadena larga) mostrando solo los primeros y últimos caracteres.
 *
 * @param address - Cadena a truncar.
 * @param start - Número de caracteres iniciales a conservar (por defecto 6).
 * @param end - Número de caracteres finales a conservar (por defecto 4).
 * @returns Cadena truncada con elipsis, o la cadena original si es corta.
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Inicia la descarga de un archivo en el navegador a partir de un `Blob`.
 *
 * @param blob - Contenido del archivo.
 * @param filename - Nombre sugerido para el archivo descargado.
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Copia texto al portapapeles del sistema.
 *
 * Utiliza la API moderna `navigator.clipboard` cuando está disponible;
 * de lo contrario, recurre a un fallback con un elemento `<textarea>` oculto.
 *
 * @param text - Texto a copiar.
 * @throws {Error} Si no es posible copiar al portapapeles.
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    window.isSecureContext &&
    navigator.clipboard?.writeText
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard no disponible en este entorno');
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', 'true');
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.left = '-9999px';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, textArea.value.length);

  const copied = document.execCommand('copy');
  document.body.removeChild(textArea);

  if (!copied) {
    throw new Error('No se pudo copiar al portapapeles');
  }
}

/** Tamaño máximo de archivo permitido para subida (100 MB). */
export const MAX_FILE_SIZE = 100 * 1024 * 1024;
