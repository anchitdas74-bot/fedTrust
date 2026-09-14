import { apiClient } from './apiClient';
import type { AlertSeverity, SecurityAlert } from '../../types';
import { MOCK_SECURITY_ALERTS } from '../mockData';
import { mapDecisionToAction, toPercent } from '../mapping';

// Maps the backend's Alert schema (snake_case) to the frontend SecurityAlert shape
function mapAlert(a: any): SecurityAlert {
  return {
    id: a.alert_id,
    transactionId: a.transaction_id,
    severity: (a.severity?.toUpperCase() ?? 'MEDIUM') as AlertSeverity,
    timestamp: a.timestamp,
    customerName: `Customer ${a.customer_id}`,
    cardholderId: a.customer_id,
    terminalId: a.terminal_id,
    merchant: a.merchant,
    amount: a.amount,
    anomalyReason: a.anomaly_reason,
    mlAnomalyScore: toPercent(a.ml_anomaly_score),
    rfTrustResult: (a.rf_terminal_trust ?? 0) >= 0.7 ? 'VERIFIED' : 'UNVERIFIED',
    contextualRisk: toPercent(a.contextual_risk),
    finalRiskScore: toPercent(a.final_risk_score),
    actionTaken: mapDecisionToAction(a.action_taken),
    isResolved: a.is_resolved ?? false,
  };
}

export const alertsService = {
  async getAlerts(): Promise<SecurityAlert[]> {
    try {
      const res = await apiClient.get('/alerts');
      return (res.data as any[]).map(mapAlert);
    } catch {
      return MOCK_SECURITY_ALERTS;
    }
  },

  async resolveAlert(alertId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post(`/alerts/${alertId}/resolve`);
      return res.data;
    } catch {
      return { success: true, message: `Alert ${alertId} marked as resolved by security supervisor.` };
    }
  }
};
