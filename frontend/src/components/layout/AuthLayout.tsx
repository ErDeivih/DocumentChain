import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {title && <h1 className="text-2xl font-bold text-white text-center mb-6">{title}</h1>}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
