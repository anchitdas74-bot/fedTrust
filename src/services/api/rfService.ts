import { apiClient } from './apiClient';
import type { RFTelemetry } from '../../types';
import { MOCK_RF_TELEMETRY, UNVERIFIED_RF_TELEMETRY } from '../mockData';

function asSignature(value: unknown): RFTelemetry['expectedSignature'] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const points = value
    .map((point) => {
      if (!point || typeof point !== 'object') {
        return null;
      }
      const freq = (point as { freq?: unknown }).freq;
      const s11 = (point as { s11?: unknown }).s11;
      if (typeof freq !== 'number' || typeof s11 !== 'number') {
        return null;
      }
      return { freq, s11 };
    })
    .filter((point): point is { freq: number; s11: number } => point !== null);
  return points.length ? points : undefined;
}

function toTrustScore(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number') {
    return fallback;
  }
  return value <= 1 ? Math.round(value * 100) : value;
}

function mapRfStatus(d: Record<string, unknown>, terminalId?: string): RFTelemetry {
  const verified = Boolean(d.verified);
  const template = verified ? MOCK_RF_TELEMETRY : UNVERIFIED_RF_TELEMETRY;
  const observedS11 = typeof d.s11_db === 'number' ? d.s11_db : template.returnLossS11Db;
  const observedFreq =
    typeof d.observed_frequency_ghz === 'number'
      ? d.observed_frequency_ghz
      : typeof d.expected_frequency_ghz === 'number'
        ? d.expected_frequency_ghz
        : template.frequencyGHz;

  return {
    terminalId:
      (typeof d.current_terminal_id === 'string' && d.current_terminal_id) ||
      terminalId ||
      template.terminalId,
    authorizedTerminalId:
      (typeof d.authorized_terminal_id === 'string' && d.authorized_terminal_id) ||
      MOCK_RF_TELEMETRY.authorizedTerminalId,
    frequencyGHz: observedFreq,
    rssiDbm: typeof d.rssi_dbm === 'number' ? d.rssi_dbm : template.rssiDbm,
    returnLossS11Db: observedS11,
    vswr: typeof d.vswr === 'number' ? d.vswr : template.vswr,
    pathLossDb: typeof d.path_loss_db === 'number' ? d.path_loss_db : template.pathLossDb,
    expectedSignature: asSignature(d.expected_signature) ?? MOCK_RF_TELEMETRY.expectedSignature,
    observedSignature:
      asSignature(d.observed_signature) ??
      template.observedSignature.map((point) =>
        Math.abs(point.freq - 2.45) < 0.001 ? { ...point, s11: observedS11 } : point
      ),
    isVerified: verified,
    trustScore: toTrustScore(typeof d.trust_score === 'number' ? d.trust_score : undefined, template.trustScore),
    lastVerifiedAt: new Date().toISOString(),
  };
}

export const rfService = {
  async getTerminalTelemetry(terminalId?: string): Promise<RFTelemetry> {
    try {
      const res = await apiClient.get('/rf/status');
      return mapRfStatus(res.data, terminalId);
    } catch {
      if (terminalId && terminalId.includes('ROGUE')) {
        return UNVERIFIED_RF_TELEMETRY;
      }
      return MOCK_RF_TELEMETRY;
    }
  }
};
