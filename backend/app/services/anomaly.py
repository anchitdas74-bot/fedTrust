from dataclasses import dataclass
from pathlib import Path

import numpy as np

from app.schemas import FeatureExplanation, TransactionRequest


@dataclass(frozen=True)
class AnomalyResult:
    reconstruction_error: float
    feature_impacts: list[FeatureExplanation]
    raw_reconstruction_error: float | None = None
    model_used: str = "MockAnomalyScorer"


class TransactionAutoencoder:
    """
    Exact autoencoder architecture used by the FedTrust_ML notebook.

    Architecture:
        Input 29
        Encoder: 29 -> 16 -> 8 -> 4
        Decoder: 4 -> 8 -> 16 -> 29
    """

    def __init__(self, input_dim: int = 29):
        import torch.nn as nn

        class Autoencoder(nn.Module):
            def __init__(self, input_dim: int):
                super().__init__()

                self.encoder = nn.Sequential(
                    nn.Linear(input_dim, 16),
                    nn.BatchNorm1d(16),
                    nn.LeakyReLU(0.1),

                    nn.Linear(16, 8),
                    nn.BatchNorm1d(8),
                    nn.LeakyReLU(0.1),

                    nn.Linear(8, 4),
                )

                self.decoder = nn.Sequential(
                    nn.Linear(4, 8),
                    nn.BatchNorm1d(8),
                    nn.LeakyReLU(0.1),

                    nn.Linear(8, 16),
                    nn.BatchNorm1d(16),
                    nn.LeakyReLU(0.1),

                    nn.Linear(16, input_dim),
                )

            def forward(self, x):
                encoded = self.encoder(x)
                return self.decoder(encoded)

        self.model = Autoencoder(input_dim)

    def state_dict(self):
        return self.model.state_dict()

    def load_state_dict(self, state_dict):
        self.model.load_state_dict(state_dict)

    def eval(self):
        self.model.eval()

    def __call__(self, x):
        return self.model(x)


class FedGuardAnomalyScorer:
    """
    Real inference service using the trained FedGuard PyTorch artifact.

    The artifact contains:
        - trained model weights
        - GWO threshold
        - feature names
        - StandardScaler mean
        - StandardScaler scale
        - input dimension
    """

    def __init__(self):
        import torch

        self.torch = torch

        # backend/app/services/anomaly.py
        #        ↑
        # parents[0] = services
        # parents[1] = app
        # parents[2] = backend
        #
        # Therefore:
        # backend/ml/fedguard_complete_artifact.pt

        artifact_path = (
            Path(__file__).resolve().parents[2]
            / "ml"
            / "fedguard_complete_artifact.pt"
        )

        if not artifact_path.exists():
            raise FileNotFoundError(
                f"FedGuard model artifact not found: {artifact_path}"
            )

        self.artifact_path = artifact_path

        print(
            f"[FedGuard ML] Loading model artifact: {artifact_path}"
        )

        artifact = torch.load(
            artifact_path,
            map_location="cpu",
            weights_only=False,
        )

        # ---------------------------------------------------------
        # Load deployment metadata
        # ---------------------------------------------------------

        self.threshold = float(
            artifact["gwo_optimal_threshold"]
        )

        self.feature_names = list(
            artifact["feature_names"]
        )

        self.scaler_mean = np.asarray(
            artifact["scaler_mean"],
            dtype=np.float32,
        )

        self.scaler_scale = np.asarray(
            artifact["scaler_scale"],
            dtype=np.float32,
        )

        self.input_dim = int(
            artifact["input_dim"]
        )

        # ---------------------------------------------------------
        # Validate artifact
        # ---------------------------------------------------------

        if self.input_dim != 29:
            raise ValueError(
                f"Expected 29 model inputs, "
                f"but artifact contains {self.input_dim}."
            )

        if len(self.feature_names) != self.input_dim:
            raise ValueError(
                "Feature name count does not match "
                "model input size."
            )

        if len(self.scaler_mean) != self.input_dim:
            raise ValueError(
                "Scaler mean does not match "
                "model input size."
            )

        if len(self.scaler_scale) != self.input_dim:
            raise ValueError(
                "Scaler scale does not match "
                "model input size."
            )

        # ---------------------------------------------------------
        # Recreate exact trained architecture
        # ---------------------------------------------------------

        model = TransactionAutoencoder(
            input_dim=self.input_dim
        )

        model.load_state_dict(
            artifact["model_state_dict"]
        )

        model.eval()

        self.model = model

        print(
            "[FedGuard ML] Model loaded successfully"
        )

        print(
            f"[FedGuard ML] Input dimension: {self.input_dim}"
        )

        print(
            f"[FedGuard ML] GWO threshold: {self.threshold}"
        )

    def score_features(
        self,
        features: list[float],
    ) -> AnomalyResult:
        """
        Run genuine PyTorch reconstruction-error inference.

        Expected feature order:

            V1, V2, ..., V28, Amount

        Exactly 29 values are required.
        """

        # ---------------------------------------------------------
        # Validate input
        # ---------------------------------------------------------

        if len(features) != self.input_dim:
            raise ValueError(
                f"FedGuard expects {self.input_dim} features, "
                f"but received {len(features)}."
            )

        # ---------------------------------------------------------
        # Convert input to NumPy
        # ---------------------------------------------------------

        raw_features = np.asarray(
            features,
            dtype=np.float32,
        )

        # ---------------------------------------------------------
        # Apply the SAME StandardScaler parameters
        # used during model training
        # ---------------------------------------------------------

        scaled_features = (
            raw_features - self.scaler_mean
        ) / self.scaler_scale

        # ---------------------------------------------------------
        # Convert to PyTorch tensor
        # ---------------------------------------------------------

        tensor = self.torch.tensor(
            scaled_features.reshape(1, -1),
            dtype=self.torch.float32,
        )

        # ---------------------------------------------------------
        # REAL MODEL INFERENCE
        # ---------------------------------------------------------

        with self.torch.no_grad():

            reconstruction = self.model(
                tensor
            )

            # Mean squared reconstruction error
            mse = float(
                self.torch.mean(
                    (tensor - reconstruction) ** 2
                ).item()
            )

        # ---------------------------------------------------------
        # Compare against GWO threshold
        #
        # Artifact threshold = 2.5
        #
        # Keep API anomaly_score within [0, 1].
        # ---------------------------------------------------------

        normalized_score = min(
            mse / self.threshold,
            1.0,
        )

        # ---------------------------------------------------------
        # Feature-level reconstruction errors
        #
        # This is NOT SHAP.
        # It simply identifies which input dimensions
        # contributed most to reconstruction error.
        # ---------------------------------------------------------

        squared_error = (
            (
                tensor - reconstruction
            )
            .detach()
            .cpu()
            .numpy()[0]
            ** 2
        )

        top_indices = np.argsort(
            squared_error
        )[::-1][:5]

        impacts: list[FeatureExplanation] = []

        total_error = float(
            squared_error.sum()
        )

        for index in top_indices:

            relative_impact = float(
                squared_error[index]
                / (total_error + 1e-8)
            )

            impacts.append(
                FeatureExplanation(
                    feature=self.feature_names[index],
                    impact=min(
                        relative_impact,
                        1.0,
                    ),
                    direction="raises_risk",
                    message=(
                        f"{self.feature_names[index]} "
                        "contributed to the reconstruction "
                        "error."
                    ),
                )
            )

        # ---------------------------------------------------------
        # Return inference result
        # ---------------------------------------------------------

        return AnomalyResult(
            reconstruction_error=round(
                normalized_score,
                3,
            ),
            raw_reconstruction_error=round(
                mse,
                5,
            ),
            feature_impacts=impacts,
            model_used=(
                "FedGuard PyTorch Autoencoder"
            ),
        )


class MockAnomalyScorer:
    """
    Deterministic fallback used for existing demo transactions
    that do not contain the trained model's 29-feature vector.

    This is NOT the trained ML model.
    """

    def score(
        self,
        transaction: TransactionRequest,
    ) -> AnomalyResult:

        impacts: list[FeatureExplanation] = []

        # ---------------------------------------------------------
        # Transaction amount
        # ---------------------------------------------------------

        amount_impact = min(
            transaction.amount / 500000.0,
            0.35,
        )

        if amount_impact > 0:

            impacts.append(
                FeatureExplanation(
                    feature="transaction_amount",
                    impact=round(
                        amount_impact,
                        3,
                    ),
                    direction="raises_risk",
                    message=(
                        "Transaction amount is unusually high."
                    ),
                )
            )

        # ---------------------------------------------------------
        # Distance from home
        # ---------------------------------------------------------

        distance_impact = min(
            transaction.distance_from_home_km
            / 15000.0,
            0.35,
        )

        if distance_impact > 0:

            impacts.append(
                FeatureExplanation(
                    feature="distance_from_home",
                    impact=round(
                        distance_impact,
                        3,
                    ),
                    direction="raises_risk",
                    message=(
                        "Transaction is far from "
                        "the customer's home."
                    ),
                )
            )

        # ---------------------------------------------------------
        # Transaction velocity
        # ---------------------------------------------------------

        velocity_impact = min(
            transaction.transactions_last_hour
            / 12.0,
            0.3,
        )

        if velocity_impact > 0:

            impacts.append(
                FeatureExplanation(
                    feature="transaction_velocity",
                    impact=round(
                        velocity_impact,
                        3,
                    ),
                    direction="raises_risk",
                    message=(
                        "Transaction velocity is elevated."
                    ),
                )
            )

        # ---------------------------------------------------------
        # Transaction hour
        # ---------------------------------------------------------

        hour_impact = (
            0.12
            if transaction.hour_of_day <= 5
            else 0.02
        )

        impacts.append(
            FeatureExplanation(
                feature="transaction_hour",
                impact=hour_impact,
                direction=(
                    "raises_risk"
                    if hour_impact > 0.05
                    else "lowers_risk"
                ),
                message=(
                    "Unusual transaction hour."
                    if hour_impact > 0.05
                    else "Transaction occurred during "
                         "a normal hour."
                ),
            )
        )

        # ---------------------------------------------------------
        # Merchant category
        # ---------------------------------------------------------

        category_impact = (
            0.12
            if transaction.merchant_category
            in {"electronics", "travel"}
            else 0.03
        )

        impacts.append(
            FeatureExplanation(
                feature="merchant_category",
                impact=category_impact,
                direction=(
                    "raises_risk"
                    if category_impact > 0.05
                    else "lowers_risk"
                ),
                message=(
                    "Merchant category has elevated risk."
                    if category_impact > 0.05
                    else "Merchant category is relatively normal."
                ),
            )
        )

        # ---------------------------------------------------------
        # Country
        # ---------------------------------------------------------

        country_impact = (
            0.18
            if transaction.country != "IN"
            else 0.02
        )

        impacts.append(
            FeatureExplanation(
                feature="country",
                impact=country_impact,
                direction=(
                    "raises_risk"
                    if country_impact > 0.05
                    else "lowers_risk"
                ),
                message=(
                    "Transaction country differs "
                    "from expected region."
                    if country_impact > 0.05
                    else "Transaction country matches "
                         "expected region."
                ),
            )
        )

        # ---------------------------------------------------------
        # Final mock anomaly score
        # ---------------------------------------------------------

        raw_score = sum(
            item.impact
            for item in impacts
        )

        normalized = min(
            raw_score,
            1.0,
        )

        return AnomalyResult(
            reconstruction_error=round(
                normalized,
                3,
            ),
            feature_impacts=sorted(
                impacts,
                key=lambda item: item.impact,
                reverse=True,
            ),
            model_used="MockAnomalyScorer",
        )