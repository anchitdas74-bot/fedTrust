import { apiClient } from './apiClient';
import type { RFTelemetry } from '../../types';
import { MOCK_RF_TELEMETRY, UNVERIFIED_RF_TELEMETRY } from '../mockData';
import { toPercent } from '../mapping';

export const rfService = {
  async getTerminalTelemetry(terminalId?: string): Promise<RFTelemetry> {
    try {
      // Backend endpoint: GET /rf/status
      const res = await apiClient.get('/rf/status');
      const d = res.data;
      // Map backend RfStatus schema → frontend RFTelemetry shape
      return {
        terminalId: d.current_terminal_id,
        authorizedTerminalId: d.current_terminal_id,
        frequencyGHz: d.observed_frequency_ghz ?? d.expected_frequency_ghz,
        rssiDbm: d.rssi_dbm,
        returnLossS11Db: d.s11_db,
        vswr: d.vswr ?? 1.28,
        pathLossDb: d.path_loss_db,
        expectedSignature: [{ freq: d.expected_frequency_ghz, s11: d.s11_db }],
        observedSignature: [{ freq: d.observed_frequency_ghz ?? d.expected_frequency_ghz, s11: d.s11_db }],
        isVerified: d.verified,
        trustScore: toPercent(d.trust_score),
        lastVerifiedAt: new Date().toISOString(),
      };
    } catch {
      if (terminalId && terminalId.includes('ROGUE')) {
        return UNVERIFIED_RF_TELEMETRY;
      }
      return MOCK_RF_TELEMETRY;
    }
  }
};

