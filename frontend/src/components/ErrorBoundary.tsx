import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Estado interno del componente ErrorBoundary.
 */
interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

/**
 * Límite de errores de React.
 * Captura errores en el árbol de componentes hijos y muestra una interfaz de fallback.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary capturó un error:', error, errorInfo);
    }
    
    this.setState({ errorInfo });
    
    // Callback opcional para reportar errores a servicios externos.
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Si se proporciona un fallback custom, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto
      return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_35%),radial-gradient(circle_at_right_top,_rgba(45,212,191,0.16),_transparent_30%),linear-gradient(135deg,#0f172a_0%,#111c30_45%,#0b1324_100%)] px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-card/95 p-6 shadow-[0_32px_80px_-30px_rgba(2,6,23,0.95)] backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-900/35">
              <svg
                className="w-6 h-6 text-error-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h2 className="mb-2 text-center text-2xl font-bold text-foreground">
              Algo salió mal
            </h2>
            
            <p className="mb-6 text-center text-muted-foreground">
              La aplicación encontró un error inesperado. Por favor, intenta recargar la página.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 rounded-xl border border-error-700/30 bg-error-900/20 p-4 text-xs">
                <summary className="mb-2 cursor-pointer font-semibold text-error-200">
                  Detalles del error (solo desarrollo)
                </summary>
                <pre className="whitespace-pre-wrap break-words text-error-100">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 rounded-xl border border-white/10 bg-secondary/70 px-4 py-2 text-secondary-foreground transition hover:bg-secondary"
              >
                Reintentar
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 rounded-xl bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary/90"
              >
                Ir al inicio
              </button>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="mt-3 w-full text-sm text-muted-foreground underline hover:text-foreground"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
