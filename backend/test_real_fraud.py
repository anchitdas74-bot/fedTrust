import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

from app.services.anomaly import FedGuardAnomalyScorer


# Same dataset used by the training notebook
URL = "https://raw.githubusercontent.com/nsethi31/Kaggle-Data-Credit-Card-Fraud-Detection/master/creditcard.csv"

print("[1] Loading credit-card dataset...")
df = pd.read_csv(URL)

# Same feature selection as notebook:
# remove Time and Class -> 29 ML features
feature_cols = [c for c in df.columns if c not in ["Time", "Class"]]

X = df[feature_cols].values
y = df["Class"].values

print(f"Dataset rows: {len(df)}")
print(f"ML features: {len(feature_cols)}")
print(f"Fraud rows: {int(y.sum())}")

# Same scaler as notebook
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Same fraud extraction as notebook
X_fraud = X_scaled[y == 1]

fraud_vector = X_fraud[0]

print("\n[2] Running FedGuard inference...")
scorer = FedGuardAnomalyScorer()
result = scorer.score_features(fraud_vector.tolist())

print("\n==============================")
print("REAL FRAUD INFERENCE RESULT")
print("==============================")
print(f"Raw reconstruction error : {result.raw_reconstruction_error:.5f}")
print(f"GWO threshold             : {scorer.threshold:.5f}")
print(f"Normalized anomaly score  : {result.reconstruction_error:.5f}")
print(f"Model                     : {result.model_used}")

print("\nTop contributing features:")
for x in result.feature_impacts:
    print(f"  {x.feature}: {x.impact:.5f}")

print("\nExpected notebook result:")
print("  reconstruction_loss ≈ 3.02956")
print("  threshold = 2.50000")
print("  ML anomalous = True")