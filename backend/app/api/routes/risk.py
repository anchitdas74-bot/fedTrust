from fastapi import APIRouter, HTTPException

from app.schemas import Decision, StepUpChallenge, StepUpResult, StepUpVerifyRequest, TransactionStatus
from app.core.security import auth_store
from app.services.store import repository

router = APIRouter(prefix="/risk", tags=["risk"])


@router.get("/summary")
def risk_summary() -> dict[str, int | float | str]:
    records = repository.list_transactions()
    approved = sum(1 for record in records if record.score.decision == Decision.APPROVED)
    pending = sum(1 for record in records if record.score.decision == Decision.STEP_UP_VERIFICATION)
    blocked = sum(1 for record in records if record.score.decision == Decision.BLOCKED)
    avg_risk = sum(record.score.risk_score for record in records) / len(records)
    return {
        "total_transactions": len(records),
        "approved_transactions": approved,
        "step_up_required": pending,
        "blocked_transactions": blocked,
        "overall_risk_level": "medium" if avg_risk >= 0.38 else "low",
        "average_risk_score": round(avg_risk, 3),
    }


@router.post("/transactions/{transaction_id}/step-up/start", response_model=StepUpChallenge)
def start_step_up(transaction_id: str) -> StepUpChallenge:
    record = repository.get_transaction(transaction_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if record.score.decision != Decision.STEP_UP_VERIFICATION:
        raise HTTPException(status_code=409, detail="Transaction does not require step-up verification")

    token = auth_store.create_step_up_challenge(transaction_id)
    return StepUpChallenge(
        transaction_id=transaction_id,
        authorization_token=token,
        expires_in_seconds=120,
        status="otp_required",
    )


@router.post("/transactions/{transaction_id}/step-up/verify", response_model=StepUpResult)
def verify_step_up(transaction_id: str, payload: StepUpVerifyRequest) -> StepUpResult:
    verified_transaction_id = auth_store.verify_step_up_challenge(payload.authorization_token, payload.otp)
    if verified_transaction_id != transaction_id:
        repository.set_status(transaction_id, TransactionStatus.BLOCKED, Decision.BLOCKED)
        raise HTTPException(status_code=401, detail="Invalid or expired authorization OTP")

    repository.set_status(transaction_id, TransactionStatus.APPROVED, Decision.APPROVED)
    return StepUpResult(
        transaction_id=transaction_id,
        status=TransactionStatus.APPROVED,
        decision=Decision.APPROVED,
        message="Step-up verification succeeded. Transaction approved.",
    )

