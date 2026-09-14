from app.schemas import FederatedStatus


class FederatedTrainingStatusService:
    def get_status(self) -> FederatedStatus:
        return FederatedStatus(
            strategy="Flower FedAvg",
            rounds_completed=5,
            participating_nodes=3,
            global_reconstruction_loss=0.041,
            last_round_delta=-0.006,
            status="ready",
        )

