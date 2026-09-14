# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

FedTrust (backend service name: FedGuard-RF) is a demo fraud-detection dashboard: a React/TypeScript frontend paired with a FastAPI backend that simulates federated-learning anomaly detection combined with RF (radio-beacon) terminal authentication. It scores transactions by blending a behavioral anomaly score with RF terminal trust and contextual risk factors into an approve / step-up / block decision.

## Commands

### Frontend (repo root)
```bash
npm run dev        # Vite dev server on :5173, proxies /auth, /transactions, /rf, /risk,
                    # /federated, /explainability, /alerts, /system, /health, /demo to :8000
npm run build       # tsc -b && vite build
npm run lint        # oxlint
npm run preview
```

### Backend (`backend/`)
```bash
python -m venv .venv
.venv\Scripts\activate       # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

pytest                        # run all tests
pytest tests/test_risk_engine.py            # single file
pytest tests/test_risk_engine.py::test_credential_attack_is_blocked  # single test
```
API docs at `http://127.0.0.1:8000/docs`; health check at `/health`.

There is no root-level command that runs both frontend and backend together — start the backend (port 8000) and frontend (port 5173) separately during development.

## Architecture

### Backend (`backend/app/`)
FastAPI app assembled in `main.py`, which mounts routers from `api/routes/` and wires two module-level singletons (`RiskEngine`, `FederatedTrainingStatusService`) shared across requests. All state is in-memory (`services/store.py`, `core/security.py`) — there is no database; restarting the server resets everything to `demo_data.py`.

Routing is organized one file per domain area, each with a matching service:
- `api/routes/auth.py` + `core/security.py` — login/OTP/session flow (demo in-memory OTP + bearer sessions)
- `api/routes/transactions.py` + `services/store.py` — transaction listing/detail
- `api/routes/risk.py` + `services/risk_engine.py` — risk summary and step-up (re-)authorization
- `api/routes/rf.py` + `services/rf_auth.py` — RF terminal trust verification and terminal registry
- `api/routes/federated.py` + `services/federated.py` — simulated Flower/FedAvg training status and a `continuous_federated_update` routine for online federated updates (requires `torch`; the corresponding test skips/expects `ImportError` gracefully if torch isn't installed)
- `api/routes/explainability.py` — SHAP-style feature-contribution explanations
- `api/routes/alerts.py` — security event center
- `api/routes/system.py` — aggregate service health/status banner data

**Core scoring pipeline** (`services/risk_engine.py`): `RiskEngine.score()` combines three inputs into a final `risk_score`:
- 52% behavioral anomaly score from `services/anomaly.py` (`MockAnomalyScorer`) — this is the intended integration point for a real PyTorch/Flower model; keep the `score(transaction) -> AnomalyResult(reconstruction_error, feature_impacts)` contract stable when replacing it.
- 32% RF terminal trust risk (`1 - trust_score`) from `services/rf_auth.py`.
- 16% contextual risk computed from transaction amount, velocity (`transactions_last_hour`), time of day, country, and distance from home.

Thresholds on the combined score (and a few override rules, e.g. unverified RF + high anomaly forces a block) map to `RiskLevel` (low/medium/high) and `Decision` (approved/step_up_verification/blocked) enums in `schemas.py`. When changing scoring weights or thresholds, check `tests/test_risk_engine.py` — it pins expected decisions for the four `DEMO_CASES` scenarios (legitimate, travel shift, credential attack, stolen card at legit terminal).

### Frontend (`src/`)
Vite + React 19 + TypeScript + Tailwind v4 (via `@tailwindcss/vite`), routed with `react-router-dom`.

- `src/services/api/apiClient.ts` — shared Axios instance. Uses relative paths (empty `baseURL`) so requests go through the Vite dev proxy defined in `vite.config.ts`; set `VITE_API_URL` to point at an absolute backend URL instead (e.g. in production). Attaches `Authorization: Bearer <token>` from `localStorage['fedtrust_token']` via an interceptor.
- One service module per backend domain in `src/services/api/` (`authService`, `transactionService`, `riskService`, `rfService`, `federatedService`, `explainabilityService`, `alertsService`, `systemService`) — each maps 1:1 to the matching backend router. When adding a new backend route, add/extend the matching frontend service rather than calling `apiClient` directly from components.
- `src/context/` holds global providers composed in `App.tsx`: `ThemeProvider` > `AuthProvider` > `SystemProvider` > router. `AuthContext` drives the two-step login flow (credentials, then OTP/2FA) and persists session to `localStorage['fedtrust_session']`; routes in `App.tsx` render `LoginPortal` whenever `isAuthenticated` is false.
- Pages under `src/pages/` correspond to sidebar sections (Dashboard, Transactions, RF Authentication, Federated Network, AI Explainability, Alerts, Live Demo Simulator, Settings), each backed by its matching API service.

### Demo credentials
```
institution_id: BANK-A
username: analyst
password: fedtrust123
terminal_id: POS-MUM-001
OTP: 123456
```
