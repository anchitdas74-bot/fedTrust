import time
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.demo_data import DEMO_CASES
from app.schemas import TransactionRecord
from app.services.store import repository

router = APIRouter(prefix="/simulator", tags=["simulator"])

SCENARIO_TRANSACTION_IDS = {
    "CASE_A": "case-a-legitimate",
    "CASE_B": "case-b-travel-shift",
    "CASE_C": "case-c-credential-attack",
    "CASE_D": "case-d-stolen-card-legit-terminal",
}


class ScenarioTriggerRequest(BaseModel):
    scenario_code: Literal["CASE_A", "CASE_B", "CASE_C", "CASE_D"] = Field(alias="scenarioCode")

    model_config = {"populate_by_name": True}


@router.post("/trigger", response_model=TransactionRecord)
def trigger_scenario(payload: ScenarioTriggerRequest) -> TransactionRecord:
    template_id = SCENARIO_TRANSACTION_IDS[payload.scenario_code]
    template = next((case for case in DEMO_CASES if case.transaction_id == template_id), None)
    if template is None:
        raise HTTPException(status_code=404, detail="Unknown demo scenario")

    fresh_transaction = template.model_copy(
        update={
            "transaction_id": f"demo-live-{int(time.time() * 1000)}",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
    )
    return repository.score_transaction(fresh_transaction)
