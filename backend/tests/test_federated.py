import unittest
from unittest.mock import MagicMock
from app.services.federated import (
    FederatedTrainingStatusService,
    continuous_federated_update,
)

try:
    import torch
    import torch.nn as nn
except ImportError:
    torch = None
    nn = None


class TestFederatedService(unittest.TestCase):
    def test_federated_status_service(self):
        service = FederatedTrainingStatusService()
        status = service.get_status()
        self.assertEqual(status.strategy, "Flower FedAvg")
        self.assertEqual(status.rounds_completed, 5)
        self.assertEqual(status.participating_nodes, 3)

    def test_continuous_federated_update_raises_or_runs(self):
        if torch is None:
            with self.assertRaises(ImportError):
                continuous_federated_update(
                    global_model=MagicMock(),
                    new_client_batches=[[[1.0, 2.0]]],
                    current_scaler=MagicMock(),
                )
        else:
            class SimpleAutoencoder(nn.Module):
                def __init__(self):
                    super().__init__()
                    self.encoder = nn.Linear(4, 2)
                    self.decoder = nn.Linear(2, 4)

                def forward(self, x):
                    return self.decoder(self.encoder(x))

            class MockScaler:
                def transform(self, data):
                    return data

            model = SimpleAutoencoder()
            initial_weights = copy_weights = {k: v.clone() for k, v in model.state_dict().items()}

            batch_1 = [[0.1, 0.2, 0.3, 0.4] for _ in range(10)]
            batch_2 = [[0.5, 0.6, 0.7, 0.8] for _ in range(10)]

            updated_model = continuous_federated_update(
                global_model=model,
                new_client_batches=[batch_1, batch_2],
                current_scaler=MockScaler(),
                lr=0.01,
                local_epochs=1,
            )

            self.assertIs(updated_model, model)
            updated_weights = model.state_dict()
            # Verify weights changed after training
            changed = any(
                not torch.equal(initial_weights[k], updated_weights[k])
                for k in initial_weights
            )
            self.assertTrue(changed)


if __name__ == "__main__":
    unittest.main()
