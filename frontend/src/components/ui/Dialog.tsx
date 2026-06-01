import React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

/**
 * Props del componente Dialog.
 * @property open - Controla si el diálogo está abierto.
 * @property onOpenChange - Función que se ejecuta cuando cambia el estado de apertura.
 * @property children - Contenido del diálogo.
 */
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * Componente contenedor de diálogo que gestiona su estado y contexto.
 * @param props - Props del componente Dialog.
 */
const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(open ?? false);

  React.useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  // Body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Escape key handler
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleOpenChange(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

/**
 * Elemento que activa la apertura del diálogo al hacer clic.
 * @param props - Props del componente DialogTrigger.
 */
const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext);

  return (
    <button
      ref={ref}
      onClick={(e) => {
        onClick?.(e);
        onOpenChange(true);
      }}
      {...props}
    />
  );
});
DialogTrigger.displayName = 'DialogTrigger';

/**
 * Portal interno del diálogo.
 * @param props - Props del componente DialogPortal.
 */
const DialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

/**
 * Fondo oscuro semitransparente que cubre la pantalla detrás del diálogo.
 * @param props - Props del componente DialogOverlay.
 */
const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

/**
 * Contenido principal del diálogo, posicionado en el centro de la pantalla.
 * @param props - Props del componente DialogContent.
 */
const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { showCloseButton?: boolean }
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(DialogContext);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

  React.useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    contentRef.current?.focus();

    return () => {
      previousFocus?.focus();
    };
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Tab') return;

    const focusableElements = contentRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  if (!open) return null;

  return (
    <DialogPortal>
      <DialogOverlay onClick={() => onOpenChange(false)} data-testid="modal-backdrop" />
      <div
        ref={contentRef}
        {...props}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid max-h-[90vh] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto rounded-2xl border border-white/10 bg-card/96 p-6 text-card-foreground shadow-[0_32px_80px_-30px_rgba(2,6,23,0.5)] backdrop-blur-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          className
        )}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        data-testid="modal-content"
        onKeyDown={handleKeyDown}
      >
        {showCloseButton && (
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar diálogo"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            data-testid="modal-close-btn"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    </DialogPortal>
  );
});
DialogContent.displayName = 'DialogContent';

/**
 * Encabezado del diálogo.
 * @param props - Props del componente DialogHeader.
 */
const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

/**
 * Pie del diálogo.
 * @param props - Props del componente DialogFooter.
 */
const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

/**
 * Título del diálogo.
 * @param props - Props del componente DialogTitle.
 */
const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

/**
 * Descripción del diálogo.
 * @param props - Props del componente DialogDescription.
 */
const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
