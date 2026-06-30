import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

/**
 * Página de inicio pública (landing page) de la aplicación.
 *
 * Presenta una vista sobria con acceso a inicio de sesión, registro
 * y verificación de documentos, sin sección promocional de funcionalidades.
 *
 * @returns JSX.Element con la landing page.
 */
export const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-gray-200 bg-white">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <span className="text-xl font-bold text-foreground">DocumentChain</span>
                    <div className="flex items-center space-x-3">
                        <Link to="/login">
                            <Button variant="outline" size="sm">Iniciar Sesión</Button>
                        </Link>
                        <Link to="/register">
                            <Button size="sm">Registrarse</Button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main>
                <div className="max-w-3xl mx-auto px-4 py-24 sm:py-32 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Gestión documental con trazabilidad blockchain
                    </h1>
                    <p className="mt-4 text-base text-muted-foreground sm:text-lg max-w-xl mx-auto">
                        DocumentChain permite verificar la autenticidad de documentos, registrar firmas digitales y consultar el historial de cambios mediante tecnología blockchain.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <Link to="/verify">
                            <Button size="lg">Verificar Documento</Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" size="lg">Iniciar Sesión</Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};
