from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import alerts, auth, explainability, federated, rf, risk, system, transactions
from app.demo_data import DEMO_CASES, TERMINALS
from app.schemas import FederatedStatus, TerminalProfile, TransactionRequest, TransactionScoreResponse
from app.services.federated import FederatedTrainingStatusService
from app.services.risk_engine import RiskEngine

app = FastAPI(
    title="FedGuard-RF Backend",
    version="0.1.0",
    description="Privacy-preserving federated anomaly detection backend with RF terminal authentication.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

risk_engine = RiskEngine()
federated_status = FederatedTrainingStatusService()

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(risk.router)
app.include_router(rf.router)
app.include_router(federated.router)
app.include_router(explainability.router)
app.include_router(alerts.router)
app.include_router(system.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "fedguard-rf-backend"}


@app.get("/demo/cases", response_model=list[TransactionRequest])
def list_demo_cases() -> list[TransactionRequest]:
    return DEMO_CASES


@app.post("/transactions/score", response_model=TransactionScoreResponse)
def score_transaction(transaction: TransactionRequest) -> TransactionScoreResponse:
    return risk_engine.score(transaction)


@app.get("/terminals/{terminal_id}", response_model=TerminalProfile)
def get_terminal(terminal_id: str) -> TerminalProfile:
    terminal = TERMINALS.get(terminal_id)
    if terminal is None:
        raise HTTPException(status_code=404, detail="Terminal not found")
    return terminal


@app.get("/federated/status", response_model=FederatedStatus)
def get_federated_status() -> FederatedStatus:
    return federated_status.get_status()
