import { apiClient } from './apiClient';
import type {
  Transaction,
  TransactionStatus,
  RiskLevel,
  RiskAction,
} from '../../types';
import { MOCK_TRANSACTIONS } from '../mockData';

type BackendRiskLevel = 'low' | 'medium' | 'high';

type BackendDecision =
  | 'approved'
  | 'step_up_verification'
  | 'blocked';

type BackendStatus =
  | 'analyzing'
  | 'approved'
  | 'pending_verification'
  | 'blocked';

interface BackendTerminal {
  terminal_id: string;
  rssi_dbm: number;
  s11_db: number;
  frequency_ghz: number;
  path_loss_db: number;
}

interface BackendTransaction {
  transaction_id: string;
  customer_id: string;
  amount: number;
  merchant: string;
  merchant_category?: string;
  category?: string;
  country: string;
  location?: string;
  hour_of_day: number;
  transactions_last_hour: number;
  distance_from_home_km: number;
  previous_transaction_id?: string | null;
  terminal: BackendTerminal;
  timestamp?: string | null;
  ml_features?: number[] | null;
}

interface BackendExplanation {
  feature: string;
  impact: number;
  direction: 'raises_risk' | 'lowers_risk';
  message: string;
}

interface BackendScore {
  transaction_id: string;
  risk_level: BackendRiskLevel;
  decision: BackendDecision;
  risk_score: number;
  anomaly_score: number;
  rf_trust_score: number;
  reasons: string[];
  explanations: BackendExplanation[];
  contextual_risk_score: number;
  status: BackendStatus;
  action: string;
}

interface BackendRecord {
  transaction: BackendTransaction;
  score: BackendScore;
}

interface StepUpResponse {
  transaction_id: string;
  authorization_token: string;
  expires_in_seconds: number;
  status: string;
}

interface StepUpVerifyResponse {
  transaction_id: string;
  status: BackendStatus;
  decision: BackendDecision;
  message: string;
}

/* =======================================================
   BACKEND → FRONTEND MAPPINGS
======================================================= */

function mapStatus(
  status: BackendStatus,
): TransactionStatus {
  switch (status) {
    case 'approved':
      return 'APPROVED';

    case 'pending_verification':
      return 'PENDING_VERIFICATION';

    case 'blocked':
      return 'BLOCKED';

    case 'analyzing':
    default:
      /*
       * The frontend TransactionStatus type does not
       * contain ANALYZING, so treat an in-progress
       * transaction as pending.
       */
      return 'PENDING_VERIFICATION';
  }
}

function mapRiskLevel(
  level: BackendRiskLevel,
): RiskLevel {
  switch (level) {
    case 'high':
      return 'HIGH';

    case 'medium':
      return 'MEDIUM';

    case 'low':
    default:
      return 'LOW';
  }
}

function mapRiskAction(
  decision: BackendDecision,
): RiskAction {
  switch (decision) {
    case 'approved':
      return 'Approve';

    case 'step_up_verification':
      return 'Step-Up Verification';

    case 'blocked':
      return 'Block';
  }
}

/* =======================================================
   CONTEXTUAL FACTORS
======================================================= */

function mapContextualFactors(
  transaction: BackendTransaction,
): string[] {
  const factors: string[] = [];

  if (transaction.amount >= 25000) {
    factors.push('Unusual transaction amount');
  }

  if (transaction.transactions_last_hour >= 5) {
    factors.push('High transaction velocity');
  }

  if (
    transaction.hour_of_day <= 5 ||
    transaction.hour_of_day >= 23
  ) {
    factors.push('Unusual transaction time');
  }

  if (transaction.distance_from_home_km > 500) {
    factors.push('Large location change');
  }

  if (transaction.country !== 'IN') {
    factors.push('International transaction');
  }

  return factors;
}

/* =======================================================
   BACKEND RECORD → FRONTEND TRANSACTION
======================================================= */

function mapRecord(
  record: BackendRecord,
): Transaction {
  const { transaction, score } = record;

  /*
   * Backend risk/anomaly/RF/context scores are 0–1.
   * Frontend expects 0–100.
   */

  const anomalyScore = Math.round(
    Math.min(
      Math.max(score.anomaly_score, 0),
      1,
    ) * 100,
  );

  const rfTrustScore = Math.round(
    Math.min(
      Math.max(score.rf_trust_score, 0),
      1,
    ) * 100,
  );

  const contextualRiskScore = Math.round(
    Math.min(
      Math.max(
        score.contextual_risk_score,
        0,
      ),
      1,
    ) * 100,
  );

  const finalRiskScore = Math.round(
    Math.min(
      Math.max(score.risk_score, 0),
      1,
    ) * 100,
  );

  /*
   * ML anomaly decision.
   */
  const isMLAnomalous =
    score.anomaly_score >= 1 ||
    score.reasons.some((reason) =>
      reason.toLowerCase().includes('anomal'),
    );

  /*
   * RF terminal verification.
   *
   * Backend considers >= 0.7 trusted.
   */
  const isRFVerified =
    score.rf_trust_score >= 0.7;

  /*
   * Backend currently returns reconstruction-error
   * contributions rather than true SHAP values.
   *
   * Frontend calls this structure SHAPContribution,
   * so we map impact → contribution.
   */
  const shapFeatures = (
    score.explanations ?? []
  ).map((explanation) => {
    const impact = Number(
      explanation.impact ?? 0,
    );

    return {
      feature: explanation.feature,

      displayValue:
        impact.toFixed(4),

      contribution: impact,

      isPositive:
        explanation.direction ===
        'raises_risk',
    };
  });

  const contextualFactors =
    mapContextualFactors(transaction);

  /*
   * Use the backend location if available.
   * Otherwise fall back to country.
   */
  const location =
    transaction.location ??
    (transaction.country === 'IN'
      ? 'India'
      : transaction.country);

  return {
    id: transaction.transaction_id,

    amount: transaction.amount,

    currency: 'INR',

    merchant: transaction.merchant,

    category:
      transaction.merchant_category ??
      transaction.category ??
      'Unknown',

    location,

    timestamp:
      transaction.timestamp ??
      new Date().toISOString(),

    terminalId:
      transaction.terminal.terminal_id,

    cardholderId:
      transaction.customer_id,

    /*
     * Backend does not currently return a
     * separate cardholder display name.
     */
    cardholderName:
      transaction.customer_id,

    velocityCount1h:
      transaction.transactions_last_hour,

    previousLocation:
      transaction.previous_transaction_id
        ? `Previous transaction: ${transaction.previous_transaction_id}`
        : 'Unknown',

    /* ---------------------------------------------------
       Signal 1 — Behavioural AI
    --------------------------------------------------- */

    reconstructionError:
      score.anomaly_score,

    anomalyScore,

    isMLAnomalous,

    /* ---------------------------------------------------
       Signal 2 — Physical RF Layer
    --------------------------------------------------- */

    rfTrustScore,

    isRFVerified,

    /* ---------------------------------------------------
       Signal 3 — Contextual Analysis
    --------------------------------------------------- */

    contextualRiskScore,

    contextualFactors,

    /* ---------------------------------------------------
       Final Risk Engine Output
    --------------------------------------------------- */

    finalRiskScore,

    riskLevel:
      mapRiskLevel(score.risk_level),

    status:
      mapStatus(score.status),

    finalAction:
      mapRiskAction(score.decision),

    explanation:
      score.reasons?.join(' ') ||
      'Transaction analyzed by FedTrust risk engine.',

    shapFeatures,

    /* ---------------------------------------------------
       Step-Up State
    --------------------------------------------------- */

    stepUpOtpSent:
      score.decision ===
      'step_up_verification',

    stepUpAttemptsLeft:
      score.decision ===
        'step_up_verification'
        ? 3
        : undefined,
  };
}

/* =======================================================
   TRANSACTIONS
======================================================= */

/**
 * Fetch all transactions.
 *
 * Normal dashboard loading can fall back to mock data
 * if the backend is unavailable.
 */
export async function getTransactions(): Promise<
  Transaction[]
> {
  try {
    const response =
      await apiClient.get<BackendRecord[]>(
        '/transactions',
      );

    return response.data.map(mapRecord);
  } catch (error) {
    console.warn(
      '[FedTrust] Backend transaction list unavailable. Using mock data.',
      error,
    );

    return MOCK_TRANSACTIONS;
  }
}

/**
 * Fetch one transaction.
 */
export async function getTransactionById(
  transactionId: string,
): Promise<Transaction | null> {
  try {
    const response =
      await apiClient.get<BackendRecord>(
        `/transactions/${transactionId}`,
      );

    return mapRecord(response.data);
  } catch (error) {
    console.warn(
      `[FedTrust] Backend transaction ${transactionId} unavailable. Checking mock data.`,
      error,
    );

    return (
      MOCK_TRANSACTIONS.find(
        (transaction) =>
          transaction.id === transactionId,
      ) ?? null
    );
  }
}

/* =======================================================
   STEP-UP VERIFICATION
======================================================= */

/**
 * Start a real backend step-up challenge.
 */
export async function startStepUp(
  transactionId: string,
): Promise<{
  authorizationToken: string;
  expiresInSeconds: number;
}> {
  const response =
    await apiClient.post<StepUpResponse>(
      `/risk/transactions/${transactionId}/step-up/start`,
    );

  return {
    authorizationToken:
      response.data.authorization_token,

    expiresInSeconds:
      response.data.expires_in_seconds,
  };
}

/**
 * Verify the OTP through the real backend.
 */
export async function verifyStepUpOTP(
  transactionId: string,
  otp: string,
  authorizationToken: string,
): Promise<{
  success: boolean;
  transactionId: string;
  status: TransactionStatus;
  decision: BackendDecision;
  message: string;
}> {
  if (!authorizationToken) {
    throw new Error(
      'Missing step-up authorization token.',
    );
  }

  const response =
    await apiClient.post<StepUpVerifyResponse>(
      `/risk/transactions/${transactionId}/step-up/verify`,
      {
        authorization_token:
          authorizationToken,
        otp,
      },
    );

  return {
    success:
      response.data.decision === 'approved',

    transactionId:
      response.data.transaction_id,

    status:
      mapStatus(response.data.status),

    decision:
      response.data.decision,

    message:
      response.data.message,
  };
}

/**
 * Resend OTP.
 *
 * The backend start endpoint generates a fresh
 * challenge and authorization token.
 */
export async function resendStepUpOTP(
  transactionId: string,
): Promise<{
  authorizationToken: string;
  expiresInSeconds: number;
}> {
  return startStepUp(transactionId);
}

/* =======================================================
   LIVE DEMO SIMULATOR
======================================================= */

/**
 * Trigger one of the four REAL backend scenarios.
 *
 * There is deliberately NO mock fallback here.
 *
 * CASE_A → legitimate
 * CASE_B → behavioural anomaly
 * CASE_C → credential hijack / rogue terminal
 * CASE_D → stolen physical card on legitimate POS
 */
export async function triggerScenario(
  scenarioCode:
    | 'CASE_A'
    | 'CASE_B'
    | 'CASE_C'
    | 'CASE_D',
): Promise<Transaction> {
  const response =
    await apiClient.post<BackendRecord>(
      '/simulator/trigger',
      {
        scenarioCode,
      },
    );

  return mapRecord(response.data);
}

/* =======================================================
   SERVICE OBJECT
======================================================= */

export const transactionService = {
  getTransactions,
  getTransactionById,
  startStepUp,
  verifyStepUpOTP,
  resendStepUpOTP,
  triggerScenario,
};