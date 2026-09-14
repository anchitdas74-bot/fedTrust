import { apiClient } from './apiClient';
import type { Transaction, TransactionStatus } from '../../types';
import { MOCK_TRANSACTIONS, DEMO_SCENARIOS } from '../mockData';
import { mapDecisionToAction, mapShapExplanations, toPercent } from '../mapping';

function mapStatus(status: string | null | undefined, decision: string | null | undefined): TransactionStatus {
  const value = status ?? decision ?? 'approved';
  if (value === 'pending_verification') return 'PENDING_VERIFICATION';
  if (value === 'blocked') return 'BLOCKED';
  return 'APPROVED';
}

function mapContextualFactors(record: any): string[] {
  const analysis = record.contextual_analysis;
  if (!analysis) return record.score?.reasons ?? [];

  const factors: string[] = [];
  if (analysis.unusual_amount) factors.push('Transaction amount is above the customer baseline');
  if (analysis.high_velocity) factors.push('High transaction velocity in the last hour');
  if (analysis.unusual_time) factors.push('Transaction occurred at an unusual hour');
  if (analysis.location_change) factors.push('Location is far from the customer home base');
  return factors.length ? factors : ['No elevated contextual risk factors'];
}

// Maps backend TransactionRecord/TransactionDetails {transaction, score, ...} to the frontend Transaction shape
function mapRecord(record: any): Transaction {
  const t = record.transaction ?? record;
  const s = record.score ?? {};
  const anomalyScore = s.anomaly_score ?? 0;
  const rfTrustScore = s.rf_trust_score ?? 1;

  return {
    id: t.transaction_id,
    amount: t.amount,
    currency: 'INR',
    merchant: t.merchant,
    category: t.merchant_category,
    location: t.location,
    timestamp: t.timestamp ?? new Date().toISOString(),
    terminalId: t.terminal?.terminal_id ?? '',
    cardholderId: t.customer_id,
    cardholderName: `Customer ${t.customer_id}`,
    velocityCount1h: t.transactions_last_hour,
    previousLocation: t.location,

    reconstructionError: anomalyScore,
    anomalyScore: toPercent(anomalyScore),
    isMLAnomalous: anomalyScore >= 0.45,

    rfTrustScore: toPercent(rfTrustScore),
    isRFVerified: rfTrustScore >= 0.7,

    contextualRiskScore: toPercent(s.contextual_risk_score),
    contextualFactors: mapContextualFactors(record),

    finalRiskScore: toPercent(s.risk_score),
    riskLevel: (s.risk_level?.toUpperCase() ?? 'LOW') as Transaction['riskLevel'],
    status: mapStatus(s.status, s.decision),
    finalAction: mapDecisionToAction(s.decision ?? s.action),
    explanation: s.reasons?.[0] ?? '',
    shapFeatures: mapShapExplanations(s.explanations),
  };
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

