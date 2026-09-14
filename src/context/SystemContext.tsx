import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, ServiceStatus, ConnectionStatus, SecurityAlert } from '../types';
import { MOCK_TRANSACTIONS, MOCK_SECURITY_ALERTS } from '../services/mockData';
import { transactionService } from '../services/api/transactionService';

interface SystemContextType {
  mlServiceStatus: ServiceStatus;
  rfServiceStatus: ServiceStatus;
  backendConnection: ConnectionStatus;
  transactions: Transaction[];
  alerts: SecurityAlert[];
  selectedTransactionId: string | null;
  stepUpTransaction: Transaction | null;
  isNotificationsOpen: boolean;
  isRealtimeActive: boolean;
  
  // Actions & Toggles
  setMlServiceStatus: (status: ServiceStatus) => void;
  setRfServiceStatus: (status: ServiceStatus) => void;
  setBackendConnection: (conn: ConnectionStatus) => void;
  toggleRealtime: () => void;
  toggleNotifications: () => void;
  openTransactionDetails: (id: string) => void;
  closeTransactionDetails: () => void;
  openStepUpModal: (txn: Transaction) => void;
  closeStepUpModal: () => void;
  updateTransactionStatus: (id: string, newStatus: Transaction['status'], newAction: Transaction['finalAction']) => void;
  addTransaction: (txn: Transaction) => void;
  triggerScenarioDemo: (scenarioCode: 'CASE_A' | 'CASE_B' | 'CASE_C' | 'CASE_D') => Promise<Transaction>;
  resolveAlert: (alertId: string) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mlServiceStatus, setMlServiceStatus] = useState<ServiceStatus>('active');
  const [rfServiceStatus, setRfServiceStatus] = useState<ServiceStatus>('active');
  const [backendConnection, setBackendConnection] = useState<ConnectionStatus>('mock');
  
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(MOCK_SECURITY_ALERTS);
  
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [stepUpTransaction, setStepUpTransaction] = useState<Transaction | null>(null);
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);

  // Live simulation ticker for incoming transactions
  useEffect(() => {
    if (!isRealtimeActive) return;

    const interval = setInterval(() => {
      // 10% chance to simulate a live low-risk incoming transaction
      if (Math.random() < 0.25) {
        const id = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
        const merchants = ['Pret A Manger', 'Shell Fuel Express', 'Subway NYC', 'Target Express', 'Apple Store NYC'];
        const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
        const amount = Number((10 + Math.random() * 80).toFixed(2));
        
        const isRfActive = rfServiceStatus === 'active';
        const isMlActive = mlServiceStatus === 'active';

        const newTxn: Transaction = {
          id,
          amount,
          currency: 'USD',
          merchant: randomMerchant,
          category: 'Retail & Convenience',
          location: 'New York, NY',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          terminalId: 'RF-TERM-8092',
          cardholderId: `USR-${Math.floor(10000 + Math.random() * 90000)}`,
          cardholderName: 'Live Feed Customer',
          velocityCount1h: 1,
          previousLocation: 'New York, NY',
          reconstructionError: 0.0085,
          anomalyScore: isMlActive ? 12 : 0,
          isMLAnomalous: false,
          rfTrustScore: isRfActive ? 96 : 0,
          isRFVerified: isRfActive,
          contextualRiskScore: 6,
          contextualFactors: ['Normal live merchant stream', 'Verified terminal signature'],
          finalRiskScore: 10,
          riskLevel: 'LOW',
          status: 'APPROVED',
          finalAction: 'Approve',
          explanation: 'Real-time incoming transaction verified by ML Autoencoder and RF Terminal Trust.',
          shapFeatures: [
            { feature: 'Live Stream Baseline', displayValue: 'Standard', contribution: -10, isPositive: false }
          ]
        };

        setTransactions(prev => [newTxn, ...prev.slice(0, 29)]);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isRealtimeActive, rfServiceStatus, mlServiceStatus]);

  const toggleRealtime = () => setIsRealtimeActive(prev => !prev);
  const toggleNotifications = () => setIsNotificationsOpen(prev => !prev);

  const openTransactionDetails = (id: string) => setSelectedTransactionId(id);
  const closeTransactionDetails = () => setSelectedTransactionId(null);

  const openStepUpModal = (txn: Transaction) => setStepUpTransaction(txn);
  const closeStepUpModal = () => setStepUpTransaction(null);

  const updateTransactionStatus = (id: string, newStatus: Transaction['status'], newAction: Transaction['finalAction']) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, status: newStatus, finalAction: newAction } : t))
    );
    if (stepUpTransaction && stepUpTransaction.id === id) {
      setStepUpTransaction(prev => prev ? { ...prev, status: newStatus, finalAction: newAction } : null);
    }
  };

  const addTransaction = (txn: Transaction) => {
    setTransactions(prev => [txn, ...prev]);
  };

  const triggerScenarioDemo = async (scenarioCode: 'CASE_A' | 'CASE_B' | 'CASE_C' | 'CASE_D'): Promise<Transaction> => {
    const txn = await transactionService.triggerScenario(scenarioCode);
    addTransaction(txn);
    if (txn.riskLevel === 'MEDIUM') {
      openStepUpModal(txn);
    } else {
      openTransactionDetails(txn.id);
    }
    return txn;
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isResolved: true } : a));
  };

  return (
    <SystemContext.Provider
      value={{
        mlServiceStatus,
        rfServiceStatus,
        backendConnection,
        transactions,
        alerts,
        selectedTransactionId,
        stepUpTransaction,
        isNotificationsOpen,
        isRealtimeActive,
        setMlServiceStatus,
        setRfServiceStatus,
        setBackendConnection,
        toggleRealtime,
        toggleNotifications,
        openTransactionDetails,
        closeTransactionDetails,
        openStepUpModal,
        closeStepUpModal,
        updateTransactionStatus,
        addTransaction,
        triggerScenarioDemo,
        resolveAlert
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
