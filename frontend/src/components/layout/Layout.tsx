import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-transparent">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="scrollbar-thin flex-1 min-h-0 overflow-y-auto bg-transparent p-4 sm:p-6 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
