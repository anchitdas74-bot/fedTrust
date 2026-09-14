from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.demo_data import DEMO_CASES
from app.schemas import TransactionRecord, TransactionRequest
from app.services.anomaly import FedGuardAnomalyScorer
from app.services.risk_engine import RiskEngine
from app.services.store import repository


router = APIRouter(prefix="/simulator", tags=["simulator"])

risk_engine = RiskEngine()
ml_scorer = FedGuardAnomalyScorer()


NORMAL_VECTOR: list[float] | None = None
FRAUD_VECTOR: list[float] | None = None


def _build_ml_vectors() -> tuple[list[float], list[float]]:
    """
    Build deterministic demo vectors directly from the trained
    FedGuard artifact.

    No external dataset or internet connection is required.

    The anomaly scorer expects RAW feature values and performs
    StandardScaler transformation internally.
    """

    global NORMAL_VECTOR, FRAUD_VECTOR

    if NORMAL_VECTOR is not None and FRAUD_VECTOR is not None:
        return NORMAL_VECTOR, FRAUD_VECTOR

    try:
        means = ml_scorer.scaler_mean
        scales = ml_scorer.scaler_scale

        if len(means) != 29 or len(scales) != 29:
            raise RuntimeError(
                f"FedGuard artifact must contain 29 scaler values. "
                f"Found means={len(means)}, scales={len(scales)}."
            )

        # ---------------------------------------------------------
        # NORMAL TRANSACTION
        #
        # scaler_mean produces approximately zero standardized
        # features, representing a normal/central transaction.
        #
        # IMPORTANT:
        # This is RAW feature space. Do not scale it here.
        # ---------------------------------------------------------

        NORMAL_VECTOR = [
            float(value)
            for value in means
        ]

        # ---------------------------------------------------------
        # FRAUD / ANOMALOUS TRANSACTION
        #
        # Create an intentionally unusual standardized pattern,
        # then convert it back into RAW feature space.
        #
        # The anomaly scorer will scale it again internally.
        # ---------------------------------------------------------

        anomaly_pattern = [
            6.0,
            -6.0,
            5.0,
            -5.0,
            6.0,
            -6.0,
            5.0,
            -5.0,
            6.0,
            -6.0,
            5.0,
            -5.0,
            6.0,
            -6.0,
            5.0,
            -5.0,
            6.0,
            -6.0,
            5.0,
            -5.0,
            6.0,
            -6.0,
            5.0,
            -5.0,
            6.0,
            -6.0,
            5.0,
            -5.0,
            6.0,
        ]

        FRAUD_VECTOR = [
            float(mean + scale * z)
            for mean, scale, z in zip(
                means,
                scales,
                anomaly_pattern,
            )
        ]

        print("[Simulator] Local ML vectors generated from FedGuard artifact.")

        return NORMAL_VECTOR, FRAUD_VECTOR

    except Exception as exc:
        raise RuntimeError(
            f"Unable to generate FedGuard ML scenario vectors: {exc}"
        ) from exc


def _build_transaction(scenario_code: str) -> TransactionRequest:
    scenario_map = {
        "CASE_A": 0,
        "CASE_B": 1,
        "CASE_C": 2,
        "CASE_D": 3,
    }

    if scenario_code not in scenario_map:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid scenarioCode. "
                "Use CASE_A, CASE_B, CASE_C or CASE_D."
            ),
        )

    normal_vector, fraud_vector = _build_ml_vectors()

    index = scenario_map[scenario_code]
    base = DEMO_CASES[index]

    # CASE A = normal transaction.
    # CASE B/C/D = anomalous transaction.
    ml_features = (
        normal_vector
        if scenario_code == "CASE_A"
        else fraud_vector
    )

    # Every simulation gets a unique ID.
    unique_transaction_id = (
        f"{base.transaction_id}-"
        f"{scenario_code}-"
        f"{uuid4().hex[:8]}"
    )

    return base.model_copy(
        update={
            "ml_features": ml_features,
            "transaction_id": unique_transaction_id,
        }
    )


@router.post("/trigger", response_model=TransactionRecord)
def trigger_scenario(payload: dict) -> TransactionRecord:
    scenario_code = payload.get("scenarioCode")

    if not isinstance(scenario_code, str):
        raise HTTPException(
            status_code=400,
            detail="scenarioCode is required.",
        )

    try:
        # ---------------------------------------------------------
        # Build demo transaction using REAL artifact-derived
        # ML features.
        # ---------------------------------------------------------

        transaction = _build_transaction(scenario_code)

        # ---------------------------------------------------------
        # REAL FedTrust risk engine:
        #
        # ML anomaly
        # + RF terminal trust
        # + contextual risk
        # ---------------------------------------------------------

        score = risk_engine.score(transaction)

        record = TransactionRecord(
            transaction=transaction,
            score=score,
        )

        # Persist the exact transaction so Step-Up endpoints
        # can find it later.
        repository.records[transaction.transaction_id] = record

        print(
            f"[Simulator] {scenario_code} -> "
            f"{transaction.transaction_id} -> "
            f"{score.risk_level.value.upper()} / "
            f"{score.decision.value} / "
            f"anomaly={score.anomaly_score:.3f}"
        )

        return record

    except HTTPException:
        raise

    except Exception as exc:
        print(f"[Simulator ERROR] {exc}")

        raise HTTPException(
            status_code=500,
            detail=f"Simulator failed: {exc}",
        ) from exc