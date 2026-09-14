from fastapi import APIRouter, HTTPException

from app.schemas import ExplainabilityResponse
from app.services.store import repository

router = APIRouter(prefix="/explainability", tags=["explainability"])


@router.get("/transactions/{transaction_id}", response_model=ExplainabilityResponse)
def explain_transaction(transaction_id: str) -> ExplainabilityResponse:
    record = repository.get_transaction(transaction_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Transaction not found")

    top_features = [
        item.feature.replace("_", " ")
        for item in record.score.explanations
        if item.direction == "raises_risk"
    ][:2]
    if top_features:
        summary = f"This transaction was flagged primarily because of {', '.join(top_features)}."
    else:
        summary = "This transaction is close to the learned customer baseline."

    return ExplainabilityResponse(
        transaction_id=transaction_id,
        summary=summary,
        base_value=0.2,
        final_score=record.score.risk_score,
        shap_values=record.score.explanations,
    )

