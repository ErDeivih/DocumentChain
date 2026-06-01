import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-6 pr-8 shadow-[0_24px_60px_-30px_rgba(2,6,23,0.95)] backdrop-blur-md transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border-border bg-white text-foreground',
        destructive:
          'destructive group border-[#fecaca] bg-[#fff1f2] text-[#881337]',
        success: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]',
        warning: 'border-[#fcd34d] bg-[#fffbeb] text-[#92400e]',
        info: 'border-[#bae6fd] bg-[#f0f9ff] text-[#0f4c81]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Props del componente Toast.
 * @property variant - Variante visual del toast.
 * @property title - Título del toast.
 * @property description - Descripción del toast.
 * @property onClose - Función que se ejecuta al cerrar el toast.
 * @property className - Clases CSS adicionales.
 */
interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
}

/**
 * Componente de notificación flotante con variantes de estilo y opción de cierre.
 * @param props - Props del componente Toast.
 */
const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, title, description, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live={variant === 'destructive' ? 'assertive' : 'polite'}
        aria-label={title || description || 'Notificación'}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="grid gap-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar notificación"
            className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

/**
 * Datos de un toast individual.
 * @property id - Identificador único del toast.
 * @property title - Título del toast.
 * @property description - Descripción del toast.
 * @property variant - Variante visual del toast.
 * @property duration - Duración en milisegundos antes de auto-cerrarse.
 */
interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  duration?: number;
}

/**
 * Valor del contexto de toasts.
 * @property toasts - Lista de toasts activos.
 * @property toast - Función para crear un nuevo toast.
 * @property dismiss - Función para descartar un toast por su id.
 */
interface ToastContextValue {
  toasts: ToastData[];
  toast: (data: Omit<ToastData, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

let toastCount = 0;

/**
 * Proveedor de contexto que gestiona la cola de notificaciones toast.
 * @param props - Props del componente ToastProvider.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const toast = React.useCallback((data: Omit<ToastData, 'id'>) => {
    const id = `toast-${++toastCount}`;
    const duration = data.duration ?? 5000;

    setToasts((prev) => [...prev, { ...data, id }]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div aria-live="polite" aria-relevant="additions text" className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            title={t.title}
            description={t.description}
            onClose={() => dismiss(t.id)}
            className="mb-2"
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Hook para acceder al contexto de toasts y poder crear o descartar notificaciones.
 * @returns El contexto de toasts.
 */
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export { Toast, toastVariants };
