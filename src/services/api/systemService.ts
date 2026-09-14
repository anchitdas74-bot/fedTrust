import { apiClient } from './apiClient';
import type { ServiceStatus, ConnectionStatus } from '../../types';

export interface SystemHealthState {
  mlService: ServiceStatus;
  rfService: ServiceStatus;
  backendConnection: ConnectionStatus;
  connectedBankNodes: number;
  totalBankNodes: number;
}

export const systemService = {
  async getHealth(): Promise<SystemHealthState> {
    try {
      // Backend endpoint: GET /system/status
      const res = await apiClient.get('/system/status');
      const d = res.data;
      // Map backend SystemStatus → frontend SystemHealthState
      const mapStatus = (s: string): ServiceStatus =>
        s === 'available' ? 'active' : s === 'degraded' ? 'degraded' : 'unavailable';
      return {
        mlService: mapStatus(d.ml_service?.status ?? 'unavailable'),
        rfService: mapStatus(d.rf_service?.status ?? 'unavailable'),
        backendConnection: 'online' as ConnectionStatus,
        connectedBankNodes: 3,
        totalBankNodes: 3
      };
    } catch {
      return {
        mlService: 'active',
        rfService: 'active',
        backendConnection: 'mock',
        connectedBankNodes: 3,
        totalBankNodes: 3
      };
    }
  }
};

