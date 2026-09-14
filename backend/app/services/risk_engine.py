from app.schemas import Decision, RiskLevel, TransactionRequest, TransactionScoreResponse
from app.services.anomaly import MockAnomalyScorer
from app.services.rf_auth import RfAuthenticator


class RiskEngine:
    def __init__(
        self,
        anomaly_scorer: MockAnomalyScorer | None = None,
        rf_authenticator: RfAuthenticator | None = None,
    ) -> None:
        self.anomaly_scorer = anomaly_scorer or MockAnomalyScorer()
        self.rf_authenticator = rf_authenticator or RfAuthenticator()

    def score(self, transaction: TransactionRequest) -> TransactionScoreResponse:
        anomaly = self.anomaly_scorer.score(transaction)
        rf = self.rf_authenticator.verify(transaction.terminal)

        contextual_risk = self._contextual_risk(transaction)
        rf_risk = 1.0 - rf.trust_score
        risk_score = (
            (0.52 * anomaly.reconstruction_error)
            + (0.32 * rf_risk)
            + (0.16 * contextual_risk)
        )
        risk_score = min(max(risk_score, 0.0), 1.0)

        if not rf.verified and anomaly.reconstruction_error >= 0.55:
            risk_level = RiskLevel.HIGH
            decision = Decision.BLOCKED
        elif risk_score >= 0.68 or not rf.verified:
            risk_level = RiskLevel.HIGH
            decision = Decision.BLOCKED
        elif risk_score >= 0.38 or anomaly.reconstruction_error >= 0.45:
            risk_level = RiskLevel.MEDIUM
            decision = Decision.STEP_UP_VERIFICATION
        else:
            risk_level = RiskLevel.LOW
            decision = Decision.APPROVED

        status = self._status_from_decision(decision)
        reasons = self._build_reasons(anomaly.reconstruction_error, rf.reasons, risk_level)

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

    @staticmethod
    def _contextual_risk(transaction: TransactionRequest) -> float:
        score = 0.0
        if transaction.amount > 25000:
            score += 0.25
        if transaction.transactions_last_hour >= 5:
            score += 0.25
        if transaction.hour_of_day <= 5 or transaction.hour_of_day >= 23:
            score += 0.15
        if transaction.country != "IN":
            score += 0.2
        if transaction.distance_from_home_km > 500:
            score += 0.15
        return min(score, 1.0)

    @staticmethod
    def _status_from_decision(decision: Decision):
        from app.schemas import TransactionStatus

        if decision == Decision.APPROVED:
            return TransactionStatus.APPROVED
        if decision == Decision.STEP_UP_VERIFICATION:
            return TransactionStatus.PENDING_VERIFICATION
        return TransactionStatus.BLOCKED

    @staticmethod
    def _build_reasons(
        anomaly_score: float,
        rf_reasons: list[str],
        risk_level: RiskLevel,
    ) -> list[str]:
        reasons: list[str] = []
        if anomaly_score < 0.35:
            reasons.append("Behavioral pattern is close to the learned customer baseline")
        elif anomaly_score < 0.6:
            reasons.append("Behavioral shift detected, but RF terminal identity is considered")
        else:
            reasons.append("Strong behavioral anomaly detected")

        reasons.extend(rf_reasons)
        if risk_level == RiskLevel.MEDIUM:
            reasons.append("Step-up verification recommended instead of immediate blocking")
        if risk_level == RiskLevel.HIGH:
            reasons.append("Transaction should be blocked pending manual or customer review")

        return reasons
