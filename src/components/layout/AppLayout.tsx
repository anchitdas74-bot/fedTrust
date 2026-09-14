import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ServiceStatusBanner } from './ServiceStatusBanner';
import { NotificationsDrawer } from './NotificationsDrawer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#080d19] text-slate-900 dark:text-slate-100 cyber-grid transition-colors duration-300 relative overflow-x-hidden">
      {/* Subtle ambient lighting orbs */}
      <div className="pointer-events-none fixed -top-40 left-1/3 w-96 h-96 rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-[100px] transition-opacity duration-500" />
      <div className="pointer-events-none fixed top-1/2 -right-20 w-96 h-96 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] transition-opacity duration-500" />

      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header />
        <ServiceStatusBanner />
        <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 animate-fade-in">
          {children}
        </main>
      </div>

      <NotificationsDrawer />
    </div>
  );
};
