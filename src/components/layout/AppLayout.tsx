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
    <div className="min-h-screen flex bg-gray-950 dark:bg-slate-950 text-gray-100 cyber-grid">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <ServiceStatusBanner />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
      <NotificationsDrawer />
    </div>
  );
};
