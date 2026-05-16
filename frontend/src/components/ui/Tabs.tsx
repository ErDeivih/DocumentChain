import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Valor del contexto de pestañas.
 * @property value - Valor de la pestaña activa.
 * @property onValueChange - Función que cambia la pestaña activa.
 */
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

/**
 * Props del componente Tabs.
 * @property defaultValue - Valor inicial de la pestaña activa.
 * @property value - Valor controlado de la pestaña activa.
 * @property onValueChange - Función que se ejecuta al cambiar de pestaña.
 * @property children - Contenido de las pestañas.
 * @property className - Clases CSS adicionales.
 */
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente contenedor de pestañas que gestiona el estado activo.
 * @param props - Props del componente Tabs.
 */
const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

/**
 * Lista de botones de navegación de pestañas.
 * @param props - Props del componente TabsList.
 */
const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-11 items-center justify-center rounded-xl border border-border/80 bg-white p-1 text-muted-foreground shadow-[0_12px_30px_-24px_rgba(15,23,42,0.14)]',
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = 'TabsList';

/**
 * Props del componente TabsTrigger.
 * @property value - Valor de la pestaña que activa este botón.
 * @property className - Clases CSS adicionales.
 */
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

/**
 * Botón que activa una pestaña específica.
 * @param props - Props del componente TabsTrigger.
 */
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    
    if (!context) {
      throw new Error('TabsTrigger must be used within Tabs');
    }

    const isActive = context.value === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => context.onValueChange(value)}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isActive
            ? 'bg-[linear-gradient(90deg,rgba(45,212,191,0.18),rgba(14,165,233,0.14))] text-foreground shadow-[0_10px_30px_-18px_rgba(14,165,233,0.24)]'
            : 'text-muted-foreground hover:bg-sky-50 hover:text-foreground',
          className
        )}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = 'TabsTrigger';

/**
 * Props del componente TabsContent.
 * @property value - Valor de la pestaña cuyo contenido se renderiza.
 * @property className - Clases CSS adicionales.
 */
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

/**
 * Contenido asociado a una pestaña específica.
 * @param props - Props del componente TabsContent.
 */
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    
    if (!context) {
      throw new Error('TabsContent must be used within Tabs');
    }

    if (context.value !== value) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={cn(
          'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
