import { apiClient } from './apiClient';
import type { SHAPContribution } from '../../types';
import { MOCK_TRANSACTIONS } from '../mockData';

export const explainabilityService = {
  async getSHAPBreakdown(transactionId: string): Promise<{ features: SHAPContribution[]; summary: string }> {
    try {
      // Backend endpoint: GET /explainability/transactions/{transaction_id}
      const res = await apiClient.get(`/explainability/transactions/${transactionId}`);
      const d = res.data;
      // Map backend ExplainabilityResponse → frontend shape
      return {
        features: (d.shap_values ?? []).map((e: any) => ({
          feature: e.feature,
          impact: e.impact,
          direction: e.direction,
          message: e.message,
        })),
        summary: d.summary ?? '',
      };
    } catch {
      const txn = MOCK_TRANSACTIONS.find(t => t.id === transactionId) || MOCK_TRANSACTIONS[1];
      return {
        features: txn.shapFeatures,
        summary: txn.explanation
      };
    }
  }
};

