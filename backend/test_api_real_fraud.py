import requests
import pandas as pd
from sklearn.preprocessing import StandardScaler


API = "http://127.0.0.1:8000"

# Same dataset + preprocessing as the training notebook
URL = "https://raw.githubusercontent.com/nsethi31/Kaggle-Data-Credit-Card-Fraud-Detection/master/creditcard.csv"

print("[1] Loading dataset...")
df = pd.read_csv(URL)

feature_cols = [
    c for c in df.columns
    if c not in ["Time", "Class"]
]

X = df[feature_cols].values
y = df["Class"].values

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Exact first fraud vector used by notebook
fraud_vector = X_scaled[y == 1][0].tolist()

print(f"Features: {len(fraud_vector)}")
print("[2] Sending REAL fraud transaction to FastAPI...")

payload = {
    "transaction_id": "real-fraud-test-001",
    "customer_id": "CUST-001",
    "amount": 25000,
    "merchant": "Luxury Travel Merchant",
    "merchant_category": "travel",
    "country": "IN",
    "location": "Mumbai",
    "timestamp": "2026-09-15T01:00:00",
    "hour_of_day": 1,
    "transactions_last_hour": 1,
    "distance_from_home_km": 10.0,
    "previous_transaction_id": None,

    "terminal": {
   	 "terminal_id": "POS-ROGUE-999",
    	"rssi_dbm": -42.61,
    	"s11_db": -5.0,
    	"frequency_ghz": 2.45,
    	"path_loss_db": 74.0
	},
    "ml_features": fraud_vector
}

response = requests.post(
    f"{API}/transactions/score",
    json=payload,
    timeout=30
)

print("\nHTTP STATUS:", response.status_code)
import requests
import pandas as pd
from sklearn.preprocessing import StandardScaler


API = "http://127.0.0.1:8000"

# Same dataset used by the FedTrust training notebook
URL = (
    "https://raw.githubusercontent.com/nsethi31/"
    "Kaggle-Data-Credit-Card-Fraud-Detection/master/creditcard.csv"
)

print("[1] Loading dataset...")

df = pd.read_csv(URL)

# Same 29 ML features used during training
feature_cols = [
    c for c in df.columns
    if c not in ["Time", "Class"]
]

X = df[feature_cols].values
y = df["Class"].values

# Same preprocessing used during training
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Get the exact first fraud sample used in the notebook
fraud_vector = X_scaled[y == 1][0].tolist()

print(f"Features: {len(fraud_vector)}")

# ---------------------------------------------------------
# CASE 3
# REAL FRAUD + ROGUE / REMOTE TERMINAL
# ---------------------------------------------------------

print("[2] Sending REAL fraud transaction with ROGUE terminal...")

payload = {
    "transaction_id": "real-fraud-rogue-001",
    "customer_id": "CUST-001",

    "amount": 25000,
    "merchant": "Luxury Travel Merchant",
    "merchant_category": "travel",

    "country": "IN",
    "location": "Mumbai",

    "timestamp": "2026-09-15T01:00:00",
    "hour_of_day": 1,

    "transactions_last_hour": 1,
    "distance_from_home_km": 10.0,

    "previous_transaction_id": None,

    # -----------------------------------------------------
    # ROGUE / REMOTE TERMINAL
    # -----------------------------------------------------
    "terminal": {
        "terminal_id": "POS-ROGUE-999",
        "rssi_dbm": -42.61,
        "s11_db": -5.0,
        "frequency_ghz": 2.45,
        "path_loss_db": 74.0
    },

    # -----------------------------------------------------
    # REAL 29-DIMENSIONAL FRAUD VECTOR
    # -----------------------------------------------------
    "ml_features": fraud_vector
}


response = requests.post(
    f"{API}/transactions/score",
    json=payload,
    timeout=30
)


print("\nHTTP STATUS:", response.status_code)

if response.status_code != 200:
    print("\nAPI ERROR:")
    print(response.text)
    raise SystemExit(1)


data = response.json()
score = data["score"]


print("\n==============================")
print("REAL FRAUD + ROGUE TERMINAL")
print("==============================")

print("Risk level      :", score["risk_level"])
print("Decision        :", score["decision"])
print("Risk score      :", score["risk_score"])
print("Anomaly score   :", score["anomaly_score"])
print("RF trust score  :", score["rf_trust_score"])
print("Status          :", score["status"])
print("Action          :", score["action"])


print("\nReasons:")

for reason in score["reasons"]:
    print(" -", reason)


print("\nFeature explanations:")

for explanation in score["explanations"]:
    print(
        f" - {explanation['feature']}: "
        f"{explanation['impact']:.5f}"
    )
if response.status_code != 200:
    print(response.text)
    raise SystemExit(1)

data = response.json()
score = data["score"]

print("\n==============================")
print("REAL FRAUD API RESULT")
print("==============================")

print("Risk level      :", score["risk_level"])
print("Decision        :", score["decision"])
print("Risk score      :", score["risk_score"])
print("Anomaly score   :", score["anomaly_score"])
print("RF trust score  :", score["rf_trust_score"])
print("Status          :", score["status"])
print("Action          :", score["action"])

print("\nReasons:")
for reason in score["reasons"]:
    print(" -", reason)