from fastapi import APIRouter, HTTPException, Query

from app.schemas import TransactionDetails, TransactionRecord, TransactionRequest
from app.services.store import repository

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionRecord])
def list_transactions(
    risk: str | None = Query(default=None),
    status: str | None = Query(default=None),
    terminal_verified: bool | None = Query(default=None),
) -> list[TransactionRecord]:
    records = repository.list_transactions()
    if risk:
        records = [record for record in records if record.score.risk_level.value == risk]
    if status:
        records = [record for record in records if record.score.status and record.score.status.value == status]
    if terminal_verified is not None:
        records = [record for record in records if (record.score.rf_trust_score >= 0.7) == terminal_verified]
    return records


@router.get("/{transaction_id}", response_model=TransactionDetails)
def get_transaction(transaction_id: str) -> TransactionDetails:
    details = repository.details(transaction_id)
    if details is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return details


@router.post("/score", response_model=TransactionRecord)
def score_transaction(transaction: TransactionRequest) -> TransactionRecord:
    return repository.score_transaction(transaction)

