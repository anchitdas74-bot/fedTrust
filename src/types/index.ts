export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type TransactionStatus = 'APPROVED' | 'PENDING_VERIFICATION' | 'BLOCKED';
export type RiskAction = 'Approve' | 'Step-Up Verification' | 'Block';
export type ServiceStatus = 'active' | 'degraded' | 'unavailable';
export type ConnectionStatus = 'online' | 'offline' | 'mock';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UserSession {
  institutionId: string;
  institutionName: string;
  username: string;
  terminalId: string;
  isAuthenticated: boolean;
  is2FAVerified: boolean;
  token?: string;
  loginTime?: string;
}

export interface RFTelemetry {
  terminalId: string;
  authorizedTerminalId: string;
  frequencyGHz: number;
  rssiDbm: number;
  returnLossS11Db: number;
  vswr: number;
  pathLossDb: number;
  expectedSignature: { freq: number; s11: number }[];
  observedSignature: { freq: number; s11: number }[];
  isVerified: boolean;
  trustScore: number; // 0 - 100
  lastVerifiedAt: string;
}

export interface MLServiceInfo {
  status: ServiceStatus;
  modelVersion: string;
  reconstructionThreshold: number;
  averageReconstructionError: number;
  lastTrainedRound: number;
  lastTrainedAt: string;
}

export interface FederatedNode {
  id: string;
  name: string;
  code: string;
  status: 'connected' | 'training' | 'disconnected';
  localLoss: number;
  sampleCount: number;
  modelVersion: string;
  lastGradientUpdate: string;
}

export interface SHAPContribution {
  feature: string;
  displayValue: string;
  contribution: number; // percentage (-100 to +100)
  isPositive: boolean; // positive means increases fraud risk
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  merchant: string;
  category: string;
  location: string;
  timestamp: string;
  terminalId: string;
  cardholderId: string;
  cardholderName: string;
  velocityCount1h: number;
  previousLocation: string;
  
  // Signal 1: Behavioural AI (PyTorch Autoencoder)
  reconstructionError: number;
  anomalyScore: number; // 0 - 100
  isMLAnomalous: boolean;

  // Signal 2: Physical RF Layer
  rfTrustScore: number; // 0 - 100
  isRFVerified: boolean;

  // Signal 3: Contextual Analysis
  contextualRiskScore: number; // 0 - 100
  contextualFactors: string[];

  // Risk Engine Output
  finalRiskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  status: TransactionStatus;
  finalAction: RiskAction;
  explanation: string;
  shapFeatures: SHAPContribution[];

  // Step-Up state tracking
  stepUpOtpSent?: boolean;
  stepUpAttemptsLeft?: number;
}

export interface SecurityAlert {
  id: string;
  transactionId: string;
  severity: AlertSeverity;
  timestamp: string;
  customerName: string;
  cardholderId: string;
  terminalId: string;
  merchant: string;
  amount: number;
  anomalyReason: string;
  mlAnomalyScore: number;
  rfTrustResult: 'VERIFIED' | 'UNVERIFIED';
  contextualRisk: number;
  finalRiskScore: number;
  actionTaken: RiskAction;
  isResolved: boolean;
}

export interface DemoScenario {
  id: string;
  name: string;
  code: 'CASE_A' | 'CASE_B' | 'CASE_C' | 'CASE_D';
  title: string;
  description: string;
  transaction: Transaction;
}
