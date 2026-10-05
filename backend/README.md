# 🛡️ TakaSafe ScamShield — Real-Time ML Backend (Python / FastAPI)

This directory contains the production-grade **Python FastAPI** backend service for TakaSafe ScamShield.

## Architecture

```
USER ENTERS PAYMENT
        ↓
FRONTEND SENDS TRANSACTION DATA (POST /api/scamshield/analyze)
        ↓
BACKEND FEATURE PROCESSING (feature_processor.py)
        ↓
LOADED XGBOOST MODEL (scamshield_model.py in-memory)
        ↓
RISK SCORE (0 - 100)
        ↓
BEHAVIOR / NETWORK / RECIPIENT SIGNALS
        ↓
RISK FUSION & EVIDENCE (explanation_service.py)
        ↓
SCAMSHIELD DECISION (risk_engine.py)
        ↓
FRONTEND SHOWS RESULT INSTANTLY
```

- **Low-Latency In-Memory Inference**: The trained XGBoost model is loaded **once** at server startup and held in memory.
- **No Kaggle Dependency at Runtime**: Kaggle is used only for training/evaluating. The exported artifact (`scamshield_xgb.json` or `.joblib`) runs self-contained.
- **Configurable Feature Schema**: Configured via `ml/feature_config.json`.
- **Explainability**: Outputs structured evidence with percentage impact scores.
- **Safety / Verification Principle**: The customer retains the final choice (`Verify Recipient`, `Delay Payment`, `Continue Anyway`). No autonomous blind blocking.

---

## Model Artifact Placement

Place your trained model artifact in:
```bash
./ml/model/scamshield_xgb.json
```
or specify an arbitrary path using the environment variable:
```bash
export MODEL_PATH=/path/to/your/trained_xgboost_model.json
```

If no model is found, the service responds with:
```json
{
  "status": "MODEL_NOT_CONNECTED",
  "detail": "ML model not connected"
}
```

---

## Running the FastAPI Server

```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Run with uvicorn on port 8000
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## API Endpoints

### 1. `POST /api/scamshield/analyze`
Scores an incoming transaction.

**Request:**
```json
{
  "amount": 75000,
  "receiver_id": "01988-510294",
  "timestamp": "2026-10-05T01:30:00",
  "device_id": "device_102",
  "location": "Dhaka",
  "transaction_frequency": 8,
  "customer_avg_amount": 1500,
  "is_new_recipient": true
}
```

**Response:**
```json
{
  "risk_score": 94,
  "risk_level": "CRITICAL",
  "prediction": "CRITICAL",
  "confidence": 0.94,
  "reasons": [
    { "label": "New recipient", "impact": 32 },
    { "label": "Unusually high amount (50.0x typical avg)", "impact": 35 },
    { "label": "Unusual transaction time (01:00 BST nocturnal)", "impact": 19 },
    { "label": "Suspicious recipient connection (Syndicate Net #17 Link)", "impact": 24 }
  ],
  "recommended_action": "VERIFY",
  "can_continue": true,
  "model_status": "LOADED",
  "inference_latency_ms": 1.2
}
```

### 2. `GET /api/scamshield/health`
Checks model status and configuration.

### 3. `POST /api/scamshield/verify-recipient`
Returns recipient graph intelligence and threat signals.

### 4. `POST /api/scamshield/decision`
Logs customer action (`VERIFY`, `DELAY`, `CONTINUE`).
