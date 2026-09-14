import type { Transaction, RFTelemetry, FederatedNode, SecurityAlert, DemoScenario, MLServiceInfo } from '../types';

export const MOCK_RF_TELEMETRY: RFTelemetry = {
  terminalId: 'RF-TERM-8092',
  authorizedTerminalId: 'RF-TERM-8092',
  frequencyGHz: 2.45,
  rssiDbm: -18.4, // Near-field physical presence window (>= -25.0 dBm)
  returnLossS11Db: -24.5,
  vswr: 1.14,
  pathLossDb: 42.1,
  isVerified: true,
  trustScore: 96,
  lastVerifiedAt: new Date().toLocaleTimeString(),
  expectedSignature: [
    { freq: 2.40, s11: -12.1 },
    { freq: 2.41, s11: -14.3 },
    { freq: 2.42, s11: -18.2 },
    { freq: 2.43, s11: -21.8 },
    { freq: 2.44, s11: -24.1 },
    { freq: 2.45, s11: -26.8 }, // Resonance peak
    { freq: 2.46, s11: -23.9 },
    { freq: 2.47, s11: -19.4 },
    { freq: 2.48, s11: -16.0 },
    { freq: 2.49, s11: -13.2 },
    { freq: 2.50, s11: -11.5 }
  ],
  observedSignature: [
    { freq: 2.40, s11: -11.9 },
    { freq: 2.41, s11: -14.0 },
    { freq: 2.42, s11: -17.9 },
    { freq: 2.43, s11: -21.5 },
    { freq: 2.44, s11: -23.8 },
    { freq: 2.45, s11: -26.4 },
    { freq: 2.46, s11: -23.5 },
    { freq: 2.47, s11: -19.1 },
    { freq: 2.48, s11: -15.8 },
    { freq: 2.49, s11: -12.9 },
    { freq: 2.50, s11: -11.2 }
  ]
};

export const UNVERIFIED_RF_TELEMETRY: RFTelemetry = {
  terminalId: 'RF-TERM-9999-ROGUE',
  authorizedTerminalId: 'RF-TERM-8092',
  frequencyGHz: 2.41,
  rssiDbm: -42.6, // Fails near-field RSSI window (< -25.0 dBm)
  returnLossS11Db: -8.2,
  vswr: 2.45,
  pathLossDb: 68.5,
  isVerified: false,
  trustScore: 18,
  lastVerifiedAt: new Date().toLocaleTimeString(),
  expectedSignature: MOCK_RF_TELEMETRY.expectedSignature,
  observedSignature: [
    { freq: 2.40, s11: -7.5 },
    { freq: 2.41, s11: -8.2 },
    { freq: 2.42, s11: -9.0 },
    { freq: 2.43, s11: -10.1 },
    { freq: 2.44, s11: -9.8 },
    { freq: 2.45, s11: -8.9 },
    { freq: 2.46, s11: -7.8 },
    { freq: 2.47, s11: -7.1 },
    { freq: 2.48, s11: -6.8 },
    { freq: 2.49, s11: -6.4 },
    { freq: 2.50, s11: -5.9 }
  ]
};

export const MOCK_ML_SERVICE: MLServiceInfo = {
  status: 'active',
  modelVersion: 'v2.4.1-federated',
  reconstructionThreshold: 2.50000, // GWO Optimized τ_opt = 2.50000
  averageReconstructionError: 0.4440,
  lastTrainedRound: 10,
  lastTrainedAt: '2026-09-14 15:30 UTC'
};

export const MOCK_FEDERATED_NODES: FederatedNode[] = [
  {
    id: 'node-a',
    name: 'Bank A (Chase Financial)',
    code: 'BANK-CHASE-NY',
    status: 'connected',
    localLoss: 0.3375,
    sampleCount: 75818,
    modelVersion: 'v2.4.1-local',
    lastGradientUpdate: '2 mins ago'
  },
  {
    id: 'node-b',
    name: 'Bank B (Citi Global)',
    code: 'BANK-CITI-LDN',
    status: 'connected',
    localLoss: 0.3617,
    sampleCount: 75817,
    modelVersion: 'v2.4.1-local',
    lastGradientUpdate: '5 mins ago'
  },
  {
    id: 'node-c',
    name: 'Bank C (Barclays Enterprise)',
    code: 'BANK-BARCLAYS-UK',
    status: 'connected',
    localLoss: 0.6329,
    sampleCount: 75817,
    modelVersion: 'v2.4.1-local',
    lastGradientUpdate: '1 min ago'
  }
];

export const MOCK_FEDERATED_LOSS_HISTORY = [
  { round: 1, globalLoss: 0.5594, bankA: 0.4487, bankB: 0.4724, bankC: 0.7570 },
  { round: 2, globalLoss: 0.5116, bankA: 0.4077, bankB: 0.4280, bankC: 0.6992 },
  { round: 3, globalLoss: 0.4920, bankA: 0.3926, bankB: 0.4015, bankC: 0.6819 },
  { round: 4, globalLoss: 0.4798, bankA: 0.3817, bankB: 0.3995, bankC: 0.6583 },
  { round: 5, globalLoss: 0.4650, bankA: 0.3646, bankB: 0.3804, bankC: 0.6501 },
  { round: 6, globalLoss: 0.4552, bankA: 0.3482, bankB: 0.3685, bankC: 0.6490 },
  { round: 7, globalLoss: 0.4486, bankA: 0.3407, bankB: 0.3632, bankC: 0.6421 },
  { round: 8, globalLoss: 0.4461, bankA: 0.3390, bankB: 0.3620, bankC: 0.6372 },
  { round: 9, globalLoss: 0.4459, bankA: 0.3384, bankB: 0.3616, bankC: 0.6377 },
  { round: 10, globalLoss: 0.4441, bankA: 0.3375, bankB: 0.3618, bankC: 0.6329 }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-902418',
    amount: 45.50,
    currency: 'USD',
    merchant: 'Star Coffee Roasters',
    category: 'Food & Beverage',
    location: 'New York, NY',
    timestamp: '2026-09-14 14:58:12',
    terminalId: 'RF-TERM-8092',
    cardholderId: 'USR-77312',
    cardholderName: 'Alex Morgan',
    velocityCount1h: 1,
    previousLocation: 'New York, NY (12 mins ago)',
    reconstructionError: 0.2798,
    anomalyScore: 12,
    isMLAnomalous: false,
    rfTrustScore: 96,
    isRFVerified: true,
    contextualRiskScore: 8,
    contextualFactors: ['Normal daytime hours', 'Usual category', 'Near-field RSSI -18.4 dBm'],
    finalRiskScore: 10,
    riskLevel: 'LOW',
    status: 'APPROVED',
    finalAction: 'Approve',
    explanation: 'Reconstruction error (0.2798) is well below GWO cutoff τ_opt (2.50000). Near-field physical RSSI (-18.4 dBm >= -25.0 dBm) matches authorized microstrip antenna.',
    shapFeatures: [
      { feature: 'Feature V14', displayValue: '-0.12 (Normal)', contribution: -14.2, isPositive: false },
      { feature: 'Feature V17', displayValue: '0.04 (Normal)', contribution: -10.5, isPositive: false },
      { feature: 'Feature V4', displayValue: '0.08 (Normal)', contribution: -8.1, isPositive: false },
      { feature: 'RF Near-Field RSSI', displayValue: '-18.4 dBm', contribution: -22.0, isPositive: false }
    ]
  },
  {
    id: 'TXN-902419',
    amount: 2850.00,
    currency: 'USD',
    merchant: 'Mayfair Luxury Horology',
    category: 'Luxury Goods',
    location: 'London, UK',
    timestamp: '2026-09-14 15:02:40',
    terminalId: 'RF-TERM-8092',
    cardholderId: 'USR-88210',
    cardholderName: 'Elena Rostova',
    velocityCount1h: 4,
    previousLocation: 'New York, NY (45 mins ago)',
    reconstructionError: 3.0296,
    anomalyScore: 78,
    isMLAnomalous: true,
    rfTrustScore: 95,
    isRFVerified: true,
    contextualRiskScore: 82,
    contextualFactors: [
      'Reconstruction loss 3.0296 exceeds GWO τ_opt threshold (2.50000)',
      'Geographic velocity jump (3,450 mi in 45 mins)',
      'Verified near-field RSSI (-17.3 dBm)'
    ],
    finalRiskScore: 64,
    riskLevel: 'MEDIUM',
    status: 'PENDING_VERIFICATION',
    finalAction: 'Step-Up Verification',
    explanation: 'PyTorch Autoencoder loss (3.02956) exceeds GWO optimal cutoff τ_opt (2.50000). However, near-field RSSI (-17.29 dBm) confirms physical presence at terminal. Enforces 2FA Step-Up.',
    shapFeatures: [
      { feature: 'Feature V14', displayValue: '-4.82 (High Anomaly)', contribution: 21.46, isPositive: true },
      { feature: 'Feature V17', displayValue: '-3.15 (High Anomaly)', contribution: 11.63, isPositive: true },
      { feature: 'Feature V4', displayValue: '2.84 (Spike)', contribution: 10.51, isPositive: true },
      { feature: 'RF Antenna Match', displayValue: '-17.29 dBm Verified', contribution: -24.0, isPositive: false }
    ]
  },
  {
    id: 'TXN-902420',
    amount: 9500.00,
    currency: 'USD',
    merchant: 'Offshore Crypto Exchange',
    category: 'High Risk Financial',
    location: 'Unknown IP / Proxy',
    timestamp: '2026-09-14 15:04:10',
    terminalId: 'RF-TERM-9999-ROGUE',
    cardholderId: 'USR-31904',
    cardholderName: 'Marcus Vance',
    velocityCount1h: 8,
    previousLocation: 'Chicago, IL (10 mins ago)',
    reconstructionError: 3.0296,
    anomalyScore: 95,
    isMLAnomalous: true,
    rfTrustScore: 18,
    isRFVerified: false,
    contextualRiskScore: 92,
    contextualFactors: [
      'Failed near-field RSSI (-42.61 dBm < -25.0 dBm window)',
      'PyTorch loss 3.0296 exceeds GWO τ_opt threshold (2.50000)',
      'Spoofed / Remote Rogue Transceiver'
    ],
    finalRiskScore: 95,
    riskLevel: 'HIGH',
    status: 'BLOCKED',
    finalAction: 'Block',
    explanation: 'Critical Risk: Remote rogue transceiver (RSSI -42.61 dBm fails near-field threshold -25.0 dBm) combined with ML anomaly loss (3.02956 > 2.50000). Transaction blocked immediately.',
    shapFeatures: [
      { feature: 'Feature V14', displayValue: '-5.12 (High Anomaly)', contribution: 24.15, isPositive: true },
      { feature: 'RF RSSI Failure', displayValue: '-42.61 dBm (Fails -25.0 dBm)', contribution: 45.0, isPositive: true },
      { feature: 'Feature V17', displayValue: '-3.80', contribution: 14.20, isPositive: true }
    ]
  }
];

export const MOCK_SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: 'ALT-1092',
    transactionId: 'TXN-902420',
    severity: 'CRITICAL',
    timestamp: '2026-09-14 15:04:10',
    customerName: 'Marcus Vance',
    cardholderId: 'USR-31904',
    terminalId: 'RF-TERM-9999-ROGUE',
    merchant: 'Offshore Crypto Exchange',
    amount: 9500.00,
    anomalyReason: 'Unverified Rogue RF Terminal (RSSI -42.6 dBm) + ML Loss (3.03 > τ_opt 2.50)',
    mlAnomalyScore: 95,
    rfTrustResult: 'UNVERIFIED',
    contextualRisk: 92,
    finalRiskScore: 95,
    actionTaken: 'Block',
    isResolved: false
  },
  {
    id: 'ALT-1091',
    transactionId: 'TXN-902419',
    severity: 'HIGH',
    timestamp: '2026-09-14 15:02:40',
    customerName: 'Elena Rostova',
    cardholderId: 'USR-88210',
    terminalId: 'RF-TERM-8092',
    merchant: 'Mayfair Luxury Horology',
    amount: 2850.00,
    anomalyReason: 'Behavioral shift (Loss 3.03 > GWO τ_opt 2.50) on verified near-field terminal',
    mlAnomalyScore: 78,
    rfTrustResult: 'VERIFIED',
    contextualRisk: 82,
    finalRiskScore: 64,
    actionTaken: 'Step-Up Verification',
    isResolved: false
  }
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scen-a',
    name: 'Case A — Legitimate In-Store Transaction',
    code: 'CASE_A',
    title: 'Case A — Normal Purchase at POS Terminal',
    description: 'Normal spending vector + Verified near-field RSSI (-12.08 dBm). Autoencoder loss (0.2798) is well below GWO cutoff τ_opt (2.50000). Automatic approval.',
    transaction: {
      id: 'DEMO-TXN-A01',
      amount: 64.20,
      currency: 'USD',
      merchant: 'Gourmet Bistro & Cafe',
      category: 'Dining',
      location: 'New York, NY',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      terminalId: 'RF-TERM-8092',
      cardholderId: 'USR-99102',
      cardholderName: 'David Chen',
      velocityCount1h: 1,
      previousLocation: 'New York, NY',
      reconstructionError: 0.2798,
      anomalyScore: 14,
      isMLAnomalous: false,
      rfTrustScore: 97,
      isRFVerified: true,
      contextualRiskScore: 9,
      contextualFactors: ['Normal dining hour', 'Near-field RSSI -12.08 dBm', 'Loss 0.2798 < GWO cutoff 2.50000'],
      finalRiskScore: 12,
      riskLevel: 'LOW',
      status: 'APPROVED',
      finalAction: 'Approve',
      explanation: 'Reconstruction error (0.2798) is below GWO F2-optimized threshold τ_opt (2.50000). RSSI (-12.08 dBm) confirms near-field physical tap.',
      shapFeatures: [
        { feature: 'Feature V14', displayValue: '-0.12 (Normal)', contribution: -14.2, isPositive: false },
        { feature: 'Feature V17', displayValue: '0.04 (Normal)', contribution: -10.5, isPositive: false },
        { feature: 'RF RSSI Near-Field', displayValue: '-12.08 dBm', contribution: -25.0, isPositive: false }
      ]
    }
  },
  {
    id: 'scen-b',
    name: 'Case B — Behavioural Shift on Legitimate POS',
    code: 'CASE_B',
    title: 'Case B — Behavioural Shift at Legitimate POS',
    description: 'Unusual transaction (Loss 3.0296 > GWO cutoff 2.50000), but near-field RSSI (-17.29 dBm >= -25.0 dBm) verifies POS tap. Triggers 2FA Step-Up Challenge.',
    transaction: {
      id: 'DEMO-TXN-B02',
      amount: 3450.00,
      currency: 'USD',
      merchant: 'Grand Horology Emporium',
      category: 'Jewelry / Luxury',
      location: 'Paris, FR',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      terminalId: 'RF-TERM-8092',
      cardholderId: 'USR-88210',
      cardholderName: 'Elena Rostova',
      velocityCount1h: 3,
      previousLocation: 'New York, NY (1 hour ago)',
      reconstructionError: 3.0296,
      anomalyScore: 81,
      isMLAnomalous: true,
      rfTrustScore: 96,
      isRFVerified: true,
      contextualRiskScore: 84,
      contextualFactors: [
        'Geographic speed jump (NYC to Paris in 1hr)',
        'Loss 3.0296 > GWO cutoff 2.50000',
        'Verified RSSI -17.29 dBm'
      ],
      finalRiskScore: 66,
      riskLevel: 'MEDIUM',
      status: 'PENDING_VERIFICATION',
      finalAction: 'Step-Up Verification',
      explanation: 'PyTorch Autoencoder loss (3.02956) exceeds GWO optimal threshold τ_opt (2.50000). Physical RF near-field presence (-17.29 dBm) is verified, triggering 2FA Step-Up.',
      shapFeatures: [
        { feature: 'Feature V14', displayValue: '-4.82 (High Anomaly)', contribution: 21.46, isPositive: true },
        { feature: 'Feature V17', displayValue: '-3.15 (High Anomaly)', contribution: 11.63, isPositive: true },
        { feature: 'Feature V4', displayValue: '2.84 (Spike)', contribution: 10.51, isPositive: true }
      ]
    }
  },
  {
    id: 'scen-c',
    name: 'Case C — Credential Hijack / Rogue Transceiver',
    code: 'CASE_C',
    title: 'Case C — Credential Hijack / Rogue Transceiver',
    description: 'PyTorch loss (3.0296 > 2.50000) combined with remote rogue transceiver (RSSI -42.61 dBm < -25.0 dBm). Immediate automated block.',
    transaction: {
      id: 'DEMO-TXN-C03',
      amount: 8900.00,
      currency: 'USD',
      merchant: 'Global Cash Kiosk',
      category: 'Cash Withdrawal',
      location: 'Unknown Terminal',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      terminalId: 'RF-TERM-9999-ROGUE',
      cardholderId: 'USR-31904',
      cardholderName: 'Marcus Vance',
      velocityCount1h: 6,
      previousLocation: 'Chicago, IL',
      reconstructionError: 3.0296,
      anomalyScore: 96,
      isMLAnomalous: true,
      rfTrustScore: 14,
      isRFVerified: false,
      contextualRiskScore: 95,
      contextualFactors: [
        'Failed RSSI near-field presence (-42.61 dBm < -25.0 dBm)',
        'S11 Return loss mismatch (-8.2 dB vs expected -24.5 dB)',
        'Loss 3.0296 > GWO cutoff 2.50000'
      ],
      finalRiskScore: 96,
      riskLevel: 'HIGH',
      status: 'BLOCKED',
      finalAction: 'Block',
      explanation: 'Critical Risk: Remote rogue transceiver (RSSI -42.61 dBm) failed physical layer verification. Combined with PyTorch ML anomaly (3.02956 > 2.50000), transaction is blocked.',
      shapFeatures: [
        { feature: 'Feature V14', displayValue: '-5.12 (High Anomaly)', contribution: 24.15, isPositive: true },
        { feature: 'RF RSSI Failure', displayValue: '-42.61 dBm (Fails -25.0 dBm)', contribution: 45.0, isPositive: true },
        { feature: 'Feature V17', displayValue: '-3.80', contribution: 14.20, isPositive: true }
      ]
    }
  },
  {
    id: 'scen-d',
    name: 'Case D — Stolen Physical Card on Legitimate Terminal',
    code: 'CASE_D',
    title: 'Case D — Stolen Physical Card on Legitimate POS',
    description: 'Demonstrates that RF physical presence alone does NOT prove cardholder authorization. Near-field RSSI is valid, but PyTorch loss (3.0296) triggers 2FA Step-Up.',
    transaction: {
      id: 'DEMO-TXN-D04',
      amount: 1950.00,
      currency: 'USD',
      merchant: 'Digital Mega Outlet',
      category: 'Electronics',
      location: 'Miami, FL',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      terminalId: 'RF-TERM-8092',
      cardholderId: 'USR-44109',
      cardholderName: 'Samantha Ray',
      velocityCount1h: 4,
      previousLocation: 'Miami, FL',
      reconstructionError: 3.0296,
      anomalyScore: 88,
      isMLAnomalous: true,
      rfTrustScore: 96,
      isRFVerified: true,
      contextualRiskScore: 78,
      contextualFactors: [
        'Unusual spending surge at 3:15 AM',
        'Loss 3.0296 > GWO cutoff 2.50000',
        'Verified physical terminal (-18.4 dBm)'
      ],
      finalRiskScore: 72,
      riskLevel: 'MEDIUM',
      status: 'PENDING_VERIFICATION',
      finalAction: 'Step-Up Verification',
      explanation: 'Physical RF presence is valid (-18.4 dBm), but customer PyTorch Autoencoder loss (3.02956) exceeds GWO cutoff τ_opt (2.50000), indicating a stolen physical card. Enforces 2FA Step-Up.',
      shapFeatures: [
        { feature: 'Feature V14', displayValue: '-4.65 (High Anomaly)', contribution: 21.0, isPositive: true },
        { feature: 'Feature V17', displayValue: '-3.10', contribution: 11.5, isPositive: true },
        { feature: 'RF Physical Trust', displayValue: 'Verified (-18.4 dBm)', contribution: -22.0, isPositive: false }
      ]
    }
  }
];
