# FedTrust Backend

FastAPI backend for the FedTrust / FedGuard-RF demo. It exposes authentication with 2FA, transaction risk scoring, RF terminal authentication, federated-learning status, SHAP-style explainability, alerts, system health, and clean extension points for the AIML model.

## What This Backend Handles

- Receives live transaction requests from the frontend.
- Handles secure login with OTP/2FA challenge flow.
- Validates the POS terminal using RF beacon measurements.
- Computes behavioral anomaly risk through a replaceable anomaly service.
- Combines transaction anomaly + RF trust into one contextual risk score.
- Returns user-facing actions: approve, step-up verification, or block.
- Provides demo cases for Review 0 and frontend integration.

## Project Structure

```text
app/
  main.py                  FastAPI app assembly
  schemas.py               Shared request/response models
  api/routes/
    auth.py                Login, OTP, session, logout
    transactions.py        Transaction list, details, scoring
    risk.py                Risk summary and step-up authorization
    rf.py                  RF terminal trust and terminal registry
    federated.py           Flower/FedAvg demo telemetry
    explainability.py      SHAP-style transaction explanations
    alerts.py              Security event center
    system.py              Service health/status
  core/
    security.py            Demo OTP/session store
  demo_data.py             Demo transactions and terminal profiles
  services/
    anomaly.py             Mock anomaly model adapter
    federated.py           Federated training status adapter
    rf_auth.py             RF authentication logic
    risk_engine.py         Final decision engine
    store.py               In-memory transaction/alert repository
tests/
  test_risk_engine.py      Core backend tests
```

## Quick Start

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open:

- API docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

## Key Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Backend health check |
| `GET` | `/system/status` | Full service-state banner data |
| `POST` | `/auth/login` | Validate institution/user/password and issue OTP challenge |
| `POST` | `/auth/verify-otp` | Verify 6-digit OTP and create session |
| `POST` | `/auth/resend-otp` | Issue a fresh OTP challenge |
| `GET` | `/auth/session` | Validate current bearer session |
| `POST` | `/auth/logout` | Invalidate bearer session |
| `GET` | `/auth/demo-credentials` | Demo-only login credentials |
| `GET` | `/demo/cases` | Four review-demo transactions |
| `GET` | `/transactions` | Transaction table data with basic filters |
| `GET` | `/transactions/{transaction_id}` | Transaction details drawer/page data |
| `POST` | `/transactions/score` | Score a transaction with RF data |
| `GET` | `/risk/summary` | Overview dashboard metrics |
| `POST` | `/risk/transactions/{transaction_id}/step-up/start` | Start transaction OTP authorization |
| `POST` | `/risk/transactions/{transaction_id}/step-up/verify` | Approve/block after OTP |
| `GET` | `/rf/status` | Current RF terminal trust status |
| `GET` | `/rf/terminals` | Known terminal registry |
| `POST` | `/rf/verify` | Verify an observed RF beacon |
| `GET` | `/federated/status` | Flower/FedAvg demo status |
| `GET` | `/federated/nodes` | Bank A/B/C node states |
| `GET` | `/federated/rounds` | Global reconstruction loss graph data |
| `GET` | `/explainability/transactions/{transaction_id}` | SHAP-style feature contributions |
| `GET` | `/alerts` | Security event center data |
| `GET` | `/alerts/{alert_id}` | Single alert detail |

## Demo Login

```json
{
  "institution_id": "BANK-A",
  "username": "analyst",
  "password": "fedtrust123",
  "terminal_id": "POS-MUM-001"
}
```

Demo OTP:

```text
123456
```

## Transaction Score Response Shape

```json
{
  "transaction": {},
  "score": {
    "transaction_id": "case-a-legitimate",
    "risk_level": "low",
    "decision": "approved",
    "risk_score": 0.055,
    "anomaly_score": 0.14,
    "rf_trust_score": 1,
    "contextual_risk_score": 0,
    "status": "approved",
    "action": "approved",
    "reasons": [],
    "explanations": []
  }
}
```

## AIML Integration Point

Replace `app/services/anomaly.py` with a real PyTorch/Flower model adapter. Keep the `score(transaction)` method return shape the same:

```python
AnomalyResult(
    reconstruction_error=0.0_to_1.0,
    feature_impacts=[...],
)
```

That lets the frontend and backend API contract stay stable while the model improves.

## Frontend Service Mapping

| Frontend module | Backend routes |
| --- | --- |
| `authService.ts` | `/auth/*` |
| `transactionService.ts` | `/transactions/*` |
| `riskService.ts` | `/risk/*` |
| `rfService.ts` | `/rf/*` |
| `federatedService.ts` | `/federated/*` |
| `explainabilityService.ts` | `/explainability/*` |
| `alertsService.ts` | `/alerts/*` |
| `systemService.ts` | `/health`, `/system/status` |
