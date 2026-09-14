from app.demo_data import DEMO_CASES
from app.schemas import Alert, AlertSeverity, Decision, TransactionDetails, TransactionRecord, TransactionStatus
from app.services.risk_engine import RiskEngine


class DemoRepository:
    def __init__(self) -> None:
        self.risk_engine = RiskEngine()
        self.records: dict[str, TransactionRecord] = {}
        self.resolved_alert_ids: set[str] = set()
        for transaction in DEMO_CASES:
            score = self.risk_engine.score(transaction)
            self.records[transaction.transaction_id] = TransactionRecord(
                transaction=transaction,
                score=score,
            )

    def list_transactions(self) -> list[TransactionRecord]:
        return list(self.records.values())

    def get_transaction(self, transaction_id: str) -> TransactionRecord | None:
        return self.records.get(transaction_id)

    def score_transaction(self, transaction) -> TransactionRecord:
        score = self.risk_engine.score(transaction)
        record = TransactionRecord(transaction=transaction, score=score)
        self.records[transaction.transaction_id] = record
        return record

    def set_status(
        self,
        transaction_id: str,
        status: TransactionStatus,
        decision: Decision,
    ) -> TransactionRecord | None:
        record = self.records.get(transaction_id)
        if record is None:
            return None
        record.score.status = status
        record.score.decision = decision
        record.score.action = decision.value
        return record

    def details(self, transaction_id: str) -> TransactionDetails | None:
        record = self.get_transaction(transaction_id)
        if record is None:
            return None

        transaction = record.transaction
        score = record.score
        return TransactionDetails(
            transaction=transaction,
            score=score,
            ml_analysis={
                "autoencoder_reconstruction_error": score.anomaly_score,
                "anomaly_threshold": 0.45,
                "is_behaviorally_anomalous": score.anomaly_score >= 0.45,
                "model_family": "Federated PyTorch Autoencoder",
            },
            rf_analysis={
                "terminal_id": transaction.terminal.terminal_id,
                "rf_trust_score": score.rf_trust_score,
                "frequency_ghz": transaction.terminal.frequency_ghz,
                "rssi_dbm": transaction.terminal.rssi_dbm,
                "path_loss_db": transaction.terminal.path_loss_db,
                "s11_db": transaction.terminal.s11_db,
                "verified_terminal": score.rf_trust_score >= 0.7,
                "expected_signature": {"frequency_ghz": 2.45, "max_s11_db": -15.0},
                "observed_signature": {
                    "frequency_ghz": transaction.terminal.frequency_ghz,
                    "s11_db": transaction.terminal.s11_db,
                },
            },
            contextual_analysis={
                "contextual_risk_score": score.contextual_risk_score,
                "unusual_amount": transaction.amount > 25000,
                "high_velocity": transaction.transactions_last_hour >= 5,
                "unusual_time": transaction.hour_of_day <= 5 or transaction.hour_of_day >= 23,
                "location_change": transaction.distance_from_home_km > 500,
            },
            security_actions=self._security_actions(score.decision),
        )

    def list_alerts(self) -> list[Alert]:
        alerts: list[Alert] = []
        for record in self.records.values():
            if record.score.risk_level.value == "low":
                continue
            alerts.append(self._alert_from_record(record))
        return alerts

    def get_alert(self, alert_id: str) -> Alert | None:
        return next((alert for alert in self.list_alerts() if alert.alert_id == alert_id), None)

    def resolve_alert(self, alert_id: str) -> bool:
        if self.get_alert(alert_id) is None:
            return False
        self.resolved_alert_ids.add(alert_id)
        return True

    @staticmethod
    def _security_actions(decision: Decision) -> list[str]:
        if decision == Decision.APPROVED:
            return ["Transaction approved automatically"]
        if decision == Decision.STEP_UP_VERIFICATION:
            return ["Send 6-digit OTP", "Hold transaction pending customer verification"]
        return ["Block transaction", "Create security alert", "Queue for analyst review"]

    def _alert_from_record(self, record: TransactionRecord) -> Alert:
        score = record.score
        transaction = record.transaction
        severity = AlertSeverity.MEDIUM
        if score.risk_level.value == "high":
            severity = AlertSeverity.CRITICAL if score.rf_trust_score < 0.2 else AlertSeverity.HIGH
        alert_id = f"alert-{transaction.transaction_id}"
        return Alert(
            alert_id=alert_id,
            transaction_id=transaction.transaction_id,
            severity=severity,
            timestamp=transaction.timestamp or "2026-09-14T00:00:00Z",
            customer_id=transaction.customer_id,
            terminal_id=transaction.terminal.terminal_id,
            merchant=transaction.merchant,
            amount=transaction.amount,
            anomaly_reason=score.reasons[0],
            ml_anomaly_score=score.anomaly_score,
            rf_terminal_trust=score.rf_trust_score,
            contextual_risk=score.contextual_risk_score,
            final_risk_score=score.risk_score,
            action_taken=score.decision,
            alert_type="transaction_risk",
            is_resolved=alert_id in self.resolved_alert_ids,
        )


repository = DemoRepository()
