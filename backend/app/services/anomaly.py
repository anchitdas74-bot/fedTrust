from dataclasses import dataclass

from app.schemas import FeatureExplanation, TransactionRequest


@dataclass(frozen=True)
class AnomalyResult:
    reconstruction_error: float
    feature_impacts: list[FeatureExplanation]


class MockAnomalyScorer:
    """Deterministic stand-in for the federated autoencoder during backend work."""

    def score(self, transaction: TransactionRequest) -> AnomalyResult:
        impacts: list[FeatureExplanation] = []

        amount_impact = self._amount_impact(transaction.amount)
        self._append(
            impacts,
            "amount",
            amount_impact,
            "Amount is higher than the normal customer baseline",
        )

        distance_impact = min(transaction.distance_from_home_km / 15000.0, 0.35)
        self._append(
            impacts,
            "distance_from_home_km",
            distance_impact,
            "Transaction location is far from the customer baseline",
        )

        velocity_impact = min(transaction.transactions_last_hour / 12.0, 0.3)
        self._append(
            impacts,
            "transactions_last_hour",
            velocity_impact,
            "Recent transaction velocity is elevated",
        )

        hour_impact = 0.12 if transaction.hour_of_day <= 5 else 0.02
        self._append(
            impacts,
            "hour_of_day",
            hour_impact,
            "Transaction time is unusual for the customer",
        )

        category_impact = 0.12 if transaction.merchant_category in {"electronics", "travel"} else 0.03
        self._append(
            impacts,
            "merchant_category",
            category_impact,
            "Merchant category has higher fraud sensitivity",
        )

        country_impact = 0.18 if transaction.country != "IN" else 0.02
        self._append(
            impacts,
            "country",
            country_impact,
            "Country differs from the customer home profile",
        )

        raw_score = sum(item.impact for item in impacts)
        normalized = min(raw_score, 1.0)
        return AnomalyResult(
            reconstruction_error=round(normalized, 3),
            feature_impacts=sorted(impacts, key=lambda item: item.impact, reverse=True),
        )

    @staticmethod
    def _amount_impact(amount: float) -> float:
        if amount <= 2000:
            return 0.05
        if amount <= 10000:
            return 0.18
        if amount <= 50000:
            return 0.32
        return 0.45

    @staticmethod
    def _append(
        impacts: list[FeatureExplanation],
        feature: str,
        impact: float,
        risk_message: str,
    ) -> None:
        if impact < 0.04:
            impacts.append(
                FeatureExplanation(
                    feature=feature,
                    impact=round(impact, 3),
                    direction="lowers_risk",
                    message=f"{feature} is within the expected range",
                )
            )
            return

        impacts.append(
            FeatureExplanation(
                feature=feature,
                impact=round(impact, 3),
                direction="raises_risk",
                message=risk_message,
            )
        )

