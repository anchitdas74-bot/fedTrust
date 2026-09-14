from app.schemas import (
    Decision,
    RiskLevel,
    TransactionRequest,
    TransactionScoreResponse,
)
from app.services.anomaly import (
    FedGuardAnomalyScorer,
    MockAnomalyScorer,
)
from app.services.rf_auth import RfAuthenticator


class RiskEngine:
    def __init__(
        self,
        anomaly_scorer=None,
        rf_authenticator: RfAuthenticator | None = None,
    ) -> None:
        # Real trained FedGuard model
        self.fedguard_scorer = FedGuardAnomalyScorer()

        # Existing fallback for old demo transactions
        self.mock_scorer = MockAnomalyScorer()

        self.rf_authenticator = rf_authenticator or RfAuthenticator()

    def score(
        self,
        transaction: TransactionRequest,
    ) -> TransactionScoreResponse:

        # ---------------------------------------------------------
        # 1. BEHAVIORAL / ML LAYER
        # ---------------------------------------------------------

        if transaction.ml_features is not None:
            anomaly = self.fedguard_scorer.score_features(
                transaction.ml_features
            )
            ml_anomalous = (
                anomaly.raw_reconstruction_error is not None
                and anomaly.raw_reconstruction_error
                >= self.fedguard_scorer.threshold
            )
        else:
            anomaly = self.mock_scorer.score(transaction)
            ml_anomalous = anomaly.reconstruction_error >= 0.45

        # ---------------------------------------------------------
        # 2. RF TERMINAL TRUST LAYER
        # ---------------------------------------------------------

        rf = self.rf_authenticator.verify(transaction.terminal)

        # ---------------------------------------------------------
        # 3. CONTEXTUAL RISK
        # ---------------------------------------------------------

        contextual_risk = self._contextual_risk(transaction)

        # RF risk = inverse of terminal trust
        rf_risk = 1.0 - rf.trust_score

        # ---------------------------------------------------------
        # 4. FINAL RISK SCORE
        #
        # 52% Behavioral ML
        # 32% RF terminal trust
        # 16% Context
        # ---------------------------------------------------------

        risk_score = (
            (0.52 * anomaly.reconstruction_error)
            + (0.32 * rf_risk)
            + (0.16 * contextual_risk)
        )

        risk_score = min(max(risk_score, 0.0), 1.0)

        # ---------------------------------------------------------
        # 5. DECISION ENGINE
        #
        # IMPORTANT:
        # Real FedGuard uses the GWO raw reconstruction threshold.
        # Current trained threshold = 2.5
        #
        # anomaly.reconstruction_error is normalized to [0,1]
        # and is used for the weighted risk score.
        # ---------------------------------------------------------

        if not rf.verified and ml_anomalous:
            risk_level = RiskLevel.HIGH
            decision = Decision.BLOCKED

        elif risk_score >= 0.68 or not rf.verified:
            risk_level = RiskLevel.HIGH
            decision = Decision.BLOCKED

        elif risk_score >= 0.38 or ml_anomalous:
            risk_level = RiskLevel.MEDIUM
            decision = Decision.STEP_UP_VERIFICATION

        else:
            risk_level = RiskLevel.LOW
            decision = Decision.APPROVED

        # ---------------------------------------------------------
        # 6. EXPLANATIONS
        # ---------------------------------------------------------

        reasons = []

        if ml_anomalous:
            if anomaly.model_used == "FedGuard PyTorch Autoencoder":
                raw_error = anomaly.raw_reconstruction_error

                reasons.append(
                    "FedGuard behavioral model detected an anomalous "
                    "transaction pattern "
                    f"(reconstruction error: {raw_error:.5f}, "
                    f"threshold: {self.fedguard_scorer.threshold:.5f})."
                )
            else:
                reasons.append(
                    "Behavioral anomaly detected in transaction activity."
                )

        if not rf.verified:
            reasons.append(
                "Terminal failed RF trust verification."
            )
        elif rf.trust_score < 0.8:
            reasons.append(
                "Terminal RF trust score is below the normal range."
            )

        if contextual_risk >= 0.4:
            reasons.append(
                "Transaction context indicates elevated risk."
            )

        if not reasons:
            reasons.append(
                "Transaction behavior and terminal trust are within "
                "the expected range."
            )

        # ---------------------------------------------------------
        # 7. STATUS
        # ---------------------------------------------------------

        status = self._status_for_decision(decision)

        return TransactionScoreResponse(
            transaction_id=transaction.transaction_id,
            risk_level=risk_level,
            decision=decision,
            risk_score=round(risk_score, 3),
            anomaly_score=anomaly.reconstruction_error,
            rf_trust_score=rf.trust_score,
            reasons=reasons,
            explanations=anomaly.feature_impacts,
            contextual_risk_score=round(contextual_risk, 3),
            status=status,
            action=decision.value,
        )

    def _contextual_risk(
        self,
        transaction: TransactionRequest,
    ) -> float:

        risk = 0.0

        if transaction.amount >= 100000:
            risk += 0.25

        if transaction.transactions_last_hour >= 5:
            risk += 0.25

        if transaction.distance_from_home_km >= 500:
            risk += 0.25

        if transaction.hour_of_day <= 5:
            risk += 0.15

        if transaction.country != "IN":
            risk += 0.20

        return min(risk, 1.0)

    def _status_for_decision(self, decision: Decision) -> str:
        if decision == Decision.APPROVED:
            return "approved"

        if decision == Decision.STEP_UP_VERIFICATION:
            return "pending_verification"

        return "blocked"