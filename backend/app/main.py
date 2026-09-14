from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import alerts, auth, explainability, federated, rf, risk, simulator, system, transactions
from app.demo_data import DEMO_CASES, TERMINALS
from app.schemas import TerminalProfile, TransactionRequest

app = FastAPI(
    title="FedGuard-RF Backend",
    version="0.1.0",
    description="Privacy-preserving federated anomaly detection backend with RF terminal authentication.",
)

# Frontend runs on the Vite dev server; only that origin needs cross-origin access.
# (allow_origins=["*"] cannot be combined with allow_credentials=True per the CORS spec.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(risk.router)
app.include_router(rf.router)
app.include_router(federated.router)
app.include_router(explainability.router)
app.include_router(alerts.router)
app.include_router(simulator.router)
app.include_router(system.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "fedguard-rf-backend"}


@app.get("/demo/cases", response_model=list[TransactionRequest])
def list_demo_cases() -> list[TransactionRequest]:
    return DEMO_CASES


@app.get("/terminals/{terminal_id}", response_model=TerminalProfile)
def get_terminal(terminal_id: str) -> TerminalProfile:
    terminal = TERMINALS.get(terminal_id)
    if terminal is None:
        raise HTTPException(status_code=404, detail="Terminal not found")
    return terminal
