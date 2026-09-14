import { apiClient } from './apiClient';
import type { SHAPContribution } from '../../types';
import { MOCK_TRANSACTIONS } from '../mockData';
import { mapShapExplanations } from '../mapping';

export const explainabilityService = {
  async getSHAPBreakdown(transactionId: string): Promise<{ features: SHAPContribution[]; summary: string }> {
    try {
      // Backend endpoint: GET /explainability/transactions/{transaction_id}
      const res = await apiClient.get(`/explainability/transactions/${transactionId}`);
      const d = res.data;
      return {
        features: mapShapExplanations(d.shap_values),
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

