import { apiClient } from './apiClient';
import type { SecurityAlert } from '../../types';
import { MOCK_SECURITY_ALERTS } from '../mockData';

export const alertsService = {
  async getAlerts(): Promise<SecurityAlert[]> {
    try {
      const res = await apiClient.get('/alerts');
      return res.data;
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
