from fastapi import APIRouter

from app.schemas import FederatedNode, FederatedRound, FederatedStatus
from app.services.federated import FederatedTrainingStatusService

router = APIRouter(prefix="/federated", tags=["federated"])
service = FederatedTrainingStatusService()


@router.get("/status", response_model=FederatedStatus)
def get_federated_status() -> FederatedStatus:
    return service.get_status()


@router.get("/nodes", response_model=list[FederatedNode])
def get_nodes() -> list[FederatedNode]:
    return [
        FederatedNode(
            node_id="bank-a",
            name="Bank A",
            connection_status="connected",
            local_training_status="complete",
            local_reconstruction_loss=0.039,
            model_update_status="aggregated",
        ),
        FederatedNode(
            node_id="bank-b",
            name="Bank B",
            connection_status="connected",
            local_training_status="complete",
            local_reconstruction_loss=0.044,
            model_update_status="aggregated",
        ),
        FederatedNode(
            node_id="bank-c",
            name="Bank C",
            connection_status="connected",
            local_training_status="complete",
            local_reconstruction_loss=0.041,
            model_update_status="aggregated",
        ),
    ]


@router.get("/rounds", response_model=list[FederatedRound])
def get_rounds() -> list[FederatedRound]:
    return service.get_rounds()


@router.post("/aggregate", response_model=FederatedRound)
def trigger_aggregation_round() -> FederatedRound:
    return service.aggregate_round()

