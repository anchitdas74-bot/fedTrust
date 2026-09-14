from fastapi import APIRouter

from app.schemas import SystemServiceState, SystemStatus

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/status", response_model=SystemStatus)
def system_status() -> SystemStatus:
    return SystemStatus(
        backend=SystemServiceState(
            name="FastAPI backend",
            status="available",
            message="API is accepting requests",
        ),
        ml_service=SystemServiceState(
            name="ML anomaly service",
            status="available",
            message="Mock scorer active; replace with federated model adapter",
        ),
        rf_service=SystemServiceState(
            name="RF terminal service",
            status="available",
            message="Demo RF beacon verifier active",
        ),
        federated_network=SystemServiceState(
            name="Flower federated network",
            status="available",
            message="Three simulated bank nodes connected",
        ),
        database=SystemServiceState(
            name="Transaction store",
            status="degraded",
            message="In-memory demo repository active; add PostgreSQL for production",
        ),
    )

