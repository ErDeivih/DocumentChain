import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileCheck2, FolderGit2, LockKeyhole, ShieldCheck, Sparkles, Waypoints } from 'lucide-react';

export const Landing: React.FC = () => {
    return (
        <div className="min-h-screen overflow-hidden bg-[#f4efe6] text-slate-900">
            <style>{`
                @keyframes landingFloat {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    50% { transform: translateY(-12px) translateX(8px); }
                }
                @keyframes landingPulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.08); opacity: 0.9; }
                }
                .landing-float { animation: landingFloat 8s ease-in-out infinite; }
                .landing-float-slow { animation: landingFloat 11s ease-in-out infinite; }
                .landing-pulse { animation: landingPulse 9s ease-in-out infinite; }
            `}</style>

            <div className="relative isolate">
                <div className="landing-float absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,155,92,0.55),_transparent_70%)] blur-2xl" />
                <div className="landing-pulse absolute right-[-6rem] top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(61,126,255,0.38),_transparent_68%)] blur-3xl" />
                <div className="landing-float-slow absolute bottom-[-8rem] left-1/3 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,_rgba(23,163,137,0.22),_transparent_70%)] blur-3xl" />

                <header className="relative z-10 px-4 pt-5 sm:px-6 lg:px-10">
                    <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/60 bg-white/70 px-5 py-3 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2556d8,#16a085)] text-white shadow-lg shadow-blue-200/80">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-['Trebuchet_MS'] text-lg font-semibold tracking-[0.02em] text-slate-950">DocumentChain</p>
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Gestión documental verificable</p>
                            </div>
                        </div>

                        <div className="hidden items-center gap-3 md:flex">
                            <Link to="/verify" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                                Verificar documento
                            </Link>
                            <Link to="/login" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                                Iniciar sesión
                            </Link>
                            <Link to="/register" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
                                Crear cuenta
                            </Link>
                        </div>
                    </nav>
                </header>

                <main className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-10 lg:pb-28 lg:pt-16">
                    <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                Flujo híbrido entre aplicación, blockchain y trazabilidad operativa
                            </div>

                            <h1 className="max-w-4xl font-['Georgia'] text-5xl font-semibold leading-[0.95] text-slate-950 sm:text-6xl lg:text-7xl">
                                Documentos sensibles con una interfaz clara y una trazabilidad que se puede defender.
                            </h1>

                            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                                DocumentChain combina gestión documental, control de versiones, permisos por rol y registro verificable de operaciones para trabajar con documentos privados y compartidos sin perder contexto técnico ni operativo.
                            </p>

                            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#1f4ed8,#0f766e)] px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_rgba(37,86,216,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_22px_45px_rgba(15,118,110,0.28)]">
                                    Entrar en la aplicación
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link to="/verify" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-3.5 text-base font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-white">
                                    Comprobar un documento público
                                </Link>
                            </div>

                            <div className="mt-10 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                                    <p className="text-3xl font-semibold text-slate-950">3</p>
                                    <p className="mt-1 text-sm uppercase tracking-[0.24em] text-slate-500">capas técnicas</p>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">Frontend, backend y servicios auxiliares coordinados con Docker.</p>
                                </div>
                                <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                                    <p className="text-3xl font-semibold text-slate-950">4</p>
                                    <p className="mt-1 text-sm uppercase tracking-[0.24em] text-slate-500">flujos críticos</p>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">Subida, compartición, versionado y firma con soporte de correo transaccional.</p>
                                </div>
                                <div className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.06)] backdrop-blur">
                                    <p className="text-3xl font-semibold text-slate-950">24/7</p>
                                    <p className="mt-1 text-sm uppercase tracking-[0.24em] text-slate-500">trazabilidad</p>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">Historial visible de versiones, firmas y operaciones relevantes del documento.</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-6 rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.75),rgba(255,255,255,0.25))] blur-xl" />
                            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-7 text-white shadow-[0_35px_90px_rgba(15,23,42,0.22)]">
                                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/80">Panel operativo</p>
                                        <h2 className="mt-2 text-2xl font-semibold">Documento TFG.pdf</h2>
                                    </div>
                                    <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200">
                                        Operativo
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="rounded-2xl bg-white/5 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-200">
                                                <FolderGit2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">Versionado controlado</p>
                                                <p className="mt-1 text-sm leading-6 text-slate-300">Cada cambio genera una nueva versión y deja rastro técnico listo para revisión.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-white/5 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-2xl bg-fuchsia-400/15 p-3 text-fuchsia-200">
                                                <Waypoints className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">Permisos granulares</p>
                                                <p className="mt-1 text-sm leading-6 text-slate-300">Owner, editor y visor comparten contexto sin perder control sobre el documento.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-white/5 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-2xl bg-amber-300/15 p-3 text-amber-200">
                                                <FileCheck2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">Firma y verificación</p>
                                                <p className="mt-1 text-sm leading-6 text-slate-300">La aplicación conserva referencias para explicar quién firmó, cuándo y sobre qué versión.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-[linear-gradient(135deg,rgba(37,86,216,0.22),rgba(15,118,110,0.22))] p-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.28em] text-slate-200/75">correo transaccional</p>
                                                <p className="mt-2 text-lg font-semibold">Recuperación, verificación y avisos operativos</p>
                                            </div>
                                            <LockKeyhole className="h-10 w-10 text-white/80" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-20 grid gap-6 lg:grid-cols-3">
                        <article className="rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-[0_22px_55px_rgba(15,23,42,0.07)] backdrop-blur">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Control documental</p>
                            <h3 className="mt-4 text-2xl font-semibold text-slate-950">Gestionar sin perder el contexto</h3>
                            <p className="mt-4 text-base leading-7 text-slate-600">La interfaz prioriza la consulta de documentos, sus versiones y la operativa compartida sin obligar al usuario a pensar en infraestructura.</p>
                        </article>
                        <article className="rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-[0_22px_55px_rgba(15,23,42,0.07)] backdrop-blur">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Trazabilidad</p>
                            <h3 className="mt-4 text-2xl font-semibold text-slate-950">Decisiones defendibles ante revisión</h3>
                            <p className="mt-4 text-base leading-7 text-slate-600">Las vistas públicas, los historiales y las notificaciones permiten explicar qué ha ocurrido en cada documento sin recurrir a datos inventados.</p>
                        </article>
                        <article className="rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-[0_22px_55px_rgba(15,23,42,0.07)] backdrop-blur">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Despliegue</p>
                            <h3 className="mt-4 text-2xl font-semibold text-slate-950">Stack completo levantable en local</h3>
                            <p className="mt-4 text-base leading-7 text-slate-600">Docker orquesta base de datos, blockchain local, backend, frontend y correo para reproducir el sistema en otra máquina con menos fricción.</p>
                        </article>
                    </section>
                </main>
            </div>
        </div>
    );
};
