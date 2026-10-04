from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import uuid
from backend.models.schemas import (
    AnalyzeRequest, AnalyzeResponse,
    VerifyRecipientRequest, VerifyRecipientResponse,
    DecisionRequest, DecisionResponse,
    HealthResponse
)
from backend.services.risk_engine import RiskEngine
from backend.services.scamshield_model import ScamShieldModelService
from backend.services.feature_processor import FeatureProcessor

router = APIRouter(prefix="/api/scamshield", tags=["ScamShield"])

# Singleton services initialized on startup
model_service = ScamShieldModelService()
feature_processor = FeatureProcessor()
risk_engine = RiskEngine(model_service=model_service, feature_processor=feature_processor)

# Decision ledger
decisions_log = []

@router.get("/health", response_model=HealthResponse)
def get_health():
    is_loaded = model_service.is_loaded
    return HealthResponse(
        status="HEALTHY" if is_loaded else "MODEL_DISCONNECTED",
        service="TakaSafe ScamShield ML Backend",
        model_loaded=is_loaded,
        model_path=model_service.model_path,
        model_type=model_service.model_type,
        feature_count=len(feature_processor.feature_order),
        message="Model is loaded and ready for real-time inference" if is_loaded else f"ML model not connected: {model_service.load_error}"
    )

@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_payment(payload: AnalyzeRequest):
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML model not connected. Please provide the trained XGBoost model artifact (e.g., scamshield_xgb.json) in ./ml/model/ or configure MODEL_PATH."
        )
    
    try:
        response = risk_engine.analyze_transaction(payload.dict())
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

@router.post("/verify-recipient", response_model=VerifyRecipientResponse)
def verify_recipient(payload: VerifyRecipientRequest):
    return risk_engine.verify_recipient(payload.receiver_id)

@router.post("/decision", response_model=DecisionResponse)
def record_decision(payload: DecisionRequest):
    decision_id = f"DEC-{uuid.uuid4().hex[:8].upper()}"
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    entry = {
        "decision_id": decision_id,
        "receiver_id": payload.receiver_id,
        "amount": payload.amount,
        "risk_score": payload.risk_score,
        "decision": payload.decision,
        "confirmed_override": payload.confirmed_override,
        "notes": payload.notes,
        "timestamp": timestamp
    }
    decisions_log.append(entry)
    
    return DecisionResponse(
        success=True,
        decision_id=decision_id,
        logged_at=timestamp,
        action_recorded=payload.decision
    )
