import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Shield, FileText, Share2, Database, Lock } from 'lucide-react';

export const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-transparent">
            {/* Minimal public header — no authenticated user links */}
            <header className="border-b border-white/10 bg-[#0f172a]/88 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.9)] backdrop-blur-xl">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="rounded-lg bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] p-2 shadow-[0_0_24px_rgba(14,165,233,0.2)]">
                            <Lock className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">DocumentChain</span>
                    </div>
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
                <div className="relative overflow-hidden pt-12 pb-24 sm:pt-16 sm:pb-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
                            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:mx-0">
                                <h1 data-testid="landing-hero-heading" className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl">
                                    <span className="block">Custodia verificable</span>
                                    <span className="block text-primary">de documentos distribuidos</span>
                                </h1>
                                <p className="mt-3 text-base text-slate-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Gestione, verifique y comparta documentos con trazabilidad blockchain, control de versiones y almacenamiento distribuido basado en IPFS.
                                </p>
                                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                                    <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
                                        <Link to="/login">
                                            <Button size="lg" className="w-full sm:w-auto">
                                                Iniciar Sesión
                                            </Button>
                                        </Link>
                                        <Link to="/verify">
                                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                                Verificar Documento
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                                <div className="relative mx-auto w-full rounded-[24px] border border-white/10 bg-card/85 shadow-strong backdrop-blur-xl lg:max-w-md">
                                    <div className="relative block w-full overflow-hidden rounded-[24px]">
                                        <div className="flex h-64 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.14),_transparent_32%),linear-gradient(135deg,#0f172a_0%,#122131_50%,#0b1324_100%)]">
                                            <Database className="h-32 w-32 text-blockchain-300 opacity-70" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        </div>

                <div className="border-y border-white/10 bg-card/50 py-12 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:text-center">
                            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Capacidades</h2>
                            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
                                Infraestructura documental con trazabilidad verificable
                            </p>
                        </div>

                        <div className="mt-10">
                            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                                <div className="relative">
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] text-white shadow-[0_0_18px_rgba(14,165,233,0.18)]">
                                        <Shield className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-foreground">Registro blockchain</p>
                                    <p className="mt-2 ml-16 text-base text-slate-300">
                                        Los documentos son hasheados y almacenados en la blockchain, garantizando inmutabilidad y prueba de existencia.
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] text-white shadow-[0_0_18px_rgba(14,165,233,0.18)]">
                                        <FileText className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-foreground">Versionado operativo</p>
                                    <p className="mt-2 ml-16 text-base text-slate-300">
                                        Mantenga un seguimiento de los cambios en documentos con un historial de versiones transparente e inmutable.
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[linear-gradient(135deg,#2dd4bf_0%,#0ea5e9_100%)] text-white shadow-[0_0_18px_rgba(14,165,233,0.18)]">
                                        <Share2 className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-foreground">Intercambio controlado</p>
                                    <p className="mt-2 ml-16 text-base text-slate-300">
                                        Comparta documentos de forma segura con otros usuarios usando controles de permisos granulares.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
