from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Decision(str, Enum):
    APPROVED = "approved"
    STEP_UP_VERIFICATION = "step_up_verification"
    BLOCKED = "blocked"


class TransactionStatus(str, Enum):
    ANALYZING = "analyzing"
    APPROVED = "approved"
    PENDING_VERIFICATION = "pending_verification"
    BLOCKED = "blocked"


class AlertSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TerminalBeacon(BaseModel):
    terminal_id: str = Field(..., examples=["POS-MUM-001"])
    rssi_dbm: float = Field(..., examples=[-41.2])
    s11_db: float = Field(..., examples=[-18.7])
    frequency_ghz: float = Field(..., examples=[2.45])
    path_loss_db: float = Field(..., examples=[43.5])


class TransactionRequest(BaseModel):
    transaction_id: str
    customer_id: str
    amount: float
    merchant: str
    merchant_category: str
    country: str
    location: str
    timestamp: str
    hour_of_day: int
    transactions_last_hour: int
    distance_from_home_km: float
    previous_transaction_id: str | None = None
    terminal: TerminalBeacon

    ml_features: list[float] | None = Field(
        default=None,
        min_length=29,
        max_length=29,
    )


class FeatureExplanation(BaseModel):
    feature: str
    impact: float = Field(..., ge=0, le=1)
    direction: Literal["raises_risk", "lowers_risk"]
    message: str


class TransactionScoreResponse(BaseModel):
    transaction_id: str
    risk_level: RiskLevel
    decision: Decision
    risk_score: float = Field(..., ge=0, le=1)
    anomaly_score: float = Field(..., ge=0, le=1)
    rf_trust_score: float = Field(..., ge=0, le=1)
    reasons: list[str]
    explanations: list[FeatureExplanation]
    contextual_risk_score: float = Field(0.0, ge=0, le=1)
    status: TransactionStatus | None = None
    action: str | None = None


class TerminalProfile(BaseModel):
    terminal_id: str
    location: str
    expected_frequency_ghz: float
    expected_rssi_dbm: float
    expected_path_loss_db: float
    max_s11_db: float
    status: Literal["active", "blocked"]


class FederatedStatus(BaseModel):
    strategy: str
    rounds_completed: int
    participating_nodes: int
    global_reconstruction_loss: float
    last_round_delta: float
    status: Literal["idle", "training", "ready"]


class LoginRequest(BaseModel):
    institution_id: str
    username: str
    password: str
    terminal_id: str


class LoginChallenge(BaseModel):
    mfa_token: str
    expires_in_seconds: int
    masked_destination: str
    status: Literal["otp_required"]


class OtpVerifyRequest(BaseModel):
    mfa_token: str
    otp: str = Field(..., min_length=6, max_length=6)


class ResendOtpRequest(BaseModel):
    mfa_token: str


class AuthenticatedUser(BaseModel):
    user_id: str
    username: str
    institution_id: str
    institution_name: str
    role: str


class AuthSession(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in_seconds: int
    user: AuthenticatedUser


class SessionStatus(BaseModel):
    authenticated: bool
    user: AuthenticatedUser | None = None


class TransactionRecord(BaseModel):
    transaction: TransactionRequest
    score: TransactionScoreResponse


class TransactionDetails(BaseModel):
    transaction: TransactionRequest
    score: TransactionScoreResponse
    ml_analysis: dict[str, float | str | bool]
    rf_analysis: dict[str, float | str | bool | dict[str, float]]
    contextual_analysis: dict[str, float | str | bool]
    security_actions: list[str]


class StepUpChallenge(BaseModel):
    transaction_id: str
    authorization_token: str
    expires_in_seconds: int
    status: Literal["otp_required"]


class StepUpVerifyRequest(BaseModel):
    authorization_token: str
    otp: str = Field(..., min_length=6, max_length=6)


class StepUpResult(BaseModel):
    transaction_id: str
    status: TransactionStatus
    decision: Decision
    message: str


class RfSignaturePoint(BaseModel):
    freq: float
    s11: float


class RfStatus(BaseModel):
    current_terminal_id: str
    authorized_terminal_id: str = "RF-TERM-8092"
    expected_frequency_ghz: float
    observed_frequency_ghz: float
    rssi_dbm: float
    path_loss_db: float
    s11_db: float
    vswr: float | None = None
    trust_score: float
    verified: bool
    status: Literal["available", "unavailable"]
    expected_signature: list[RfSignaturePoint] = Field(default_factory=list)
    observed_signature: list[RfSignaturePoint] = Field(default_factory=list)


class FederatedNode(BaseModel):
    node_id: str
    name: str
    connection_status: Literal["connected", "disconnected"]
    local_training_status: Literal["idle", "training", "complete", "failed"]
    local_reconstruction_loss: float
    model_update_status: Literal["pending", "uploaded", "aggregated", "failed"]


class FederatedRound(BaseModel):
    round_number: int
    global_reconstruction_loss: float


class ExplainabilityResponse(BaseModel):
    transaction_id: str
    summary: str
    base_value: float
    final_score: float
    shap_values: list[FeatureExplanation]


class Alert(BaseModel):
    alert_id: str
    transaction_id: str
    severity: AlertSeverity
    timestamp: str
    customer_id: str
    terminal_id: str
    merchant: str
    amount: float
    anomaly_reason: str
    ml_anomaly_score: float
    rf_terminal_trust: float
    contextual_risk: float
    final_risk_score: float
    action_taken: Decision
    alert_type: str


class SystemServiceState(BaseModel):
    name: str
    status: Literal["available", "degraded", "unavailable"]
    message: str


class SystemStatus(BaseModel):
    backend: SystemServiceState
    ml_service: SystemServiceState
    rf_service: SystemServiceState
    federated_network: SystemServiceState
    database: SystemServiceState
