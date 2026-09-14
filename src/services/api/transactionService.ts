import { apiClient } from './apiClient';
import type { Transaction, TransactionStatus } from '../../types';
import { MOCK_TRANSACTIONS, DEMO_SCENARIOS } from '../mockData';

// Maps backend TransactionRecord {transaction, score} to frontend Transaction shape
function mapRecord(record: any): Transaction {
  const t = record.transaction ?? record;
  const s = record.score ?? {};
  return {
    id: t.transaction_id,
    customerId: t.customer_id,
    amount: t.amount,
    merchant: t.merchant,
    merchantCategory: t.merchant_category,
    country: t.country,
    location: t.location,
    timestamp: t.timestamp ?? new Date().toISOString(),
    hourOfDay: t.hour_of_day,
    transactionsLastHour: t.transactions_last_hour,
    distanceFromHomeKm: t.distance_from_home_km,
    terminalId: t.terminal?.terminal_id,
    riskScore: s.risk_score ?? 0,
    riskLevel: (s.risk_level?.toUpperCase() ?? 'LOW') as Transaction['riskLevel'],
    status: (s.status?.toUpperCase() ?? s.decision?.toUpperCase() ?? 'APPROVED') as TransactionStatus,
    action: s.action ?? s.decision ?? 'Approve',
    anomalyScore: s.anomaly_score ?? 0,
    rfTrustScore: s.rf_trust_score ?? 1,
    reasons: s.reasons ?? [],
    explanation: s.reasons?.[0] ?? '',
    shapFeatures: (s.explanations ?? []).map((e: any) => ({
      feature: e.feature,
      impact: e.impact,
      direction: e.direction,
      message: e.message,
    })),
    rfTelemetry: t.terminal ? {
      terminalId: t.terminal.terminal_id,
      frequencyGHz: t.terminal.frequency_ghz,
      rssiDbm: t.terminal.rssi_dbm,
      returnLossS11Db: t.terminal.s11_db,
      pathLossDb: t.terminal.path_loss_db,
      isVerified: (s.rf_trust_score ?? 0) >= 0.7,
      trustScore: s.rf_trust_score ?? 0,
    } : undefined,
  } as unknown as Transaction;
}

export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    try {
      const res = await apiClient.get('/transactions');
      return (res.data as any[]).map(mapRecord);
    } catch {
      return MOCK_TRANSACTIONS;
    }
  },

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    try {
      const res = await apiClient.get(`/transactions/${id}`);
      // Backend returns TransactionDetails which has transaction + score + ml_analysis etc.
      return mapRecord(res.data);
    } catch {
      return MOCK_TRANSACTIONS.find(t => t.id === id) || DEMO_SCENARIOS.find(s => s.transaction.id === id)?.transaction;
    }
  },

  async startStepUp(transactionId: string): Promise<{ authorizationToken: string; expiresInSeconds: number }> {
    try {
      const res = await apiClient.post(`/risk/transactions/${transactionId}/step-up/start`);
      return {
        authorizationToken: res.data.authorization_token,
        expiresInSeconds: res.data.expires_in_seconds,
      };
    } catch {
      return { authorizationToken: 'mock_step_up_token_' + Date.now(), expiresInSeconds: 120 };
    }
  },

  async verifyStepUpOTP(transactionId: string, otp: string, authorizationToken?: string): Promise<{ success: boolean; updatedStatus: TransactionStatus; message: string }> {
    try {
      const res = await apiClient.post(`/risk/transactions/${transactionId}/step-up/verify`, {
        authorization_token: authorizationToken ?? 'mock_step_up_token',
        otp
      });
      const d = res.data;
      return {
        success: d.decision === 'approved',
        updatedStatus: (d.status?.toUpperCase() ?? 'APPROVED') as TransactionStatus,
        message: d.message,
      };
    } catch {
      if (otp === '000000' || otp === '999999') {
        return {
          success: false,
          updatedStatus: 'BLOCKED',
          message: 'Step-Up Verification Failed: Invalid OTP entered or authorization expired. Transaction blocked.'
        };
      }
      return {
        success: true,
        updatedStatus: 'APPROVED',
        message: 'Cardholder Step-Up Verification Successful! Transaction approved.'
      };
    }
  },

  async triggerScenario(scenarioCode: 'CASE_A' | 'CASE_B' | 'CASE_C' | 'CASE_D'): Promise<Transaction> {
    try {
      const res = await apiClient.post('/simulator/trigger', { scenarioCode });
      return mapRecord(res.data);
    } catch {
      const scen = DEMO_SCENARIOS.find(s => s.code === scenarioCode);
      if (!scen) throw new Error('Scenario not found');
      const freshTxn: Transaction = {
        ...scen.transaction,
        id: `DEMO-TXN-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      return freshTxn;
    }
  }
};

