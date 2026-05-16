import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Definición de una columna de la tabla.
 * @property key - Identificador único de la columna.
 * @property header - Texto del encabezado de la columna.
 * @property render - Función opcional para renderizar el contenido personalizado de una celda.
 * @property className - Clases CSS adicionales para la columna.
 */
export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

/**
 * Props del componente Table.
 * @property data - Conjunto de datos a mostrar en la tabla.
 * @property columns - Definición de las columnas.
 * @property keyExtractor - Función para obtener una clave única de cada fila.
 * @property emptyMessage - Mensaje que se muestra cuando no hay datos.
 * @property isLoading - Indica si la tabla está cargando datos.
 * @property onRowClick - Función que se ejecuta al hacer clic en una fila.
 * @property className - Clases CSS adicionales.
 */
export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
}

/**
 * Componente de tabla genérico para renderizar listas de datos.
 * @param props - Props del componente Table.
 */
export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No hay datos disponibles',
  isLoading = false,
  onRowClick,
  className,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="spinner h-8 w-8" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-secondary-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="table">
        <thead className="table-header">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn('table-header-cell', column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={keyExtractor(item, index)}
              className={cn(
                'table-row',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn('table-cell', column.className)}
                >
                  {column.render
                    ? column.render(item)
                    : String((item as any)[column.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Componente auxiliar para celdas con contenido apilado en múltiples líneas.
 * @param props - Props del componente TableCellStack.
 */
export const TableCellStack: React.FC<{
  primary: React.ReactNode;
  secondary?: React.ReactNode;
}> = ({ primary, secondary }) => (
  <div className="flex flex-col gap-1">
    <div className="font-medium text-secondary-900">{primary}</div>
    {secondary && (
      <div className="text-sm text-secondary-500">{secondary}</div>
    )}
  </div>
);
