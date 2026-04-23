import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Shield, FileText, Share2, Database, Lock } from 'lucide-react';

export const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Minimal public header — no authenticated user links */}
            <header className="bg-white shadow-sm">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Lock className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">DocumentChain</span>
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
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block">Almacenamiento Seguro</span>
                                    <span className="block text-blue-600">de Documentos en Blockchain</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
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
                                <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                                    <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                                        <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                            <Database className="w-32 h-32 text-blue-500 opacity-50" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        </div>

                <div className="py-12 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:text-center">
                            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Características</h2>
                            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                                Una mejor forma de almacenar documentos
                            </p>
                        </div>

                        <div className="mt-10">
                            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                                <div className="relative">
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                        <Shield className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Seguridad Blockchain</p>
                                    <p className="mt-2 ml-16 text-base text-gray-500">
                                        Los documentos son hasheados y almacenados en la blockchain, garantizando inmutabilidad y prueba de existencia.
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                        <FileText className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Control de Versiones</p>
                                    <p className="mt-2 ml-16 text-base text-gray-500">
                                        Mantenga un seguimiento de los cambios en documentos con un historial de versiones transparente e inmutable.
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                                        <Share2 className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Compartir Seguro</p>
                                    <p className="mt-2 ml-16 text-base text-gray-500">
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
