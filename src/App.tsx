import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';

import { LoginPortal } from './pages/LoginPortal';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { TransactionsPage } from './pages/TransactionsPage';
import { RFAuthenticationPage } from './pages/RFAuthenticationPage';
import { FederatedNetworkPage } from './pages/FederatedNetworkPage';
import { AIExplainabilityPage } from './pages/AIExplainabilityPage';
import { AlertsPage } from './pages/AlertsPage';
import { LiveDemoSimulatorPage } from './pages/LiveDemoSimulatorPage';
import { SettingsPage } from './pages/SettingsPage';

import { TransactionDetailsDrawer } from './components/modals/TransactionDetailsDrawer';
import { StepUpModal } from './components/modals/StepUpModal';

const AuthenticatedRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPortal />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/rf-auth" element={<RFAuthenticationPage />} />
        <Route path="/federated-net" element={<FederatedNetworkPage />} />
        <Route path="/ai-explainability" element={<AIExplainabilityPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/simulator" element={<LiveDemoSimulatorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <TransactionDetailsDrawer />
      <StepUpModal />
    </AppLayout>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SystemProvider>
          <BrowserRouter>
            <AuthenticatedRoutes />
          </BrowserRouter>
        </SystemProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
