from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnalyzeRequest(BaseModel):
    amount: float = Field(..., description="Transaction amount in BDT", gt=0)
    receiver_id: str = Field(..., description="Target recipient phone or wallet ID")
    timestamp: Optional[str] = Field(None, description="ISO timestamp of the transaction")
    device_id: Optional[str] = Field(None, description="Device fingerprint ID")
    location: Optional[str] = Field(None, description="Initiating location region (e.g. Dhaka)")
    transaction_frequency: Optional[int] = Field(1, description="Number of recent payments in window")
    customer_avg_amount: Optional[float] = Field(1500.0, description="Customer 90-day typical transfer average")
    is_new_recipient: Optional[bool] = Field(True, description="Whether recipient is new to the sender")
    note: Optional[str] = Field(None, description="Optional reference note")

class RiskReason(BaseModel):
    label: str
    impact: int

class AnalyzeResponse(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    prediction: str = Field(..., description="SAFE, REVIEW, RISKY, CRITICAL")
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasons: List[RiskReason]
    recommended_action: str = Field(..., description="CONTINUE, REVIEW, VERIFY, DELAY")
    can_continue: bool = True
    model_status: str = "LOADED"
    model_path: Optional[str] = None
    inference_latency_ms: Optional[float] = None
    shap_contributions: Optional[Dict[str, float]] = None

class VerifyRecipientRequest(BaseModel):
    receiver_id: str

class RecipientSignal(BaseModel):
    text: str
    severity: str  # INFO, WARNING, CRITICAL

class VerifyRecipientResponse(BaseModel):
    receiver_id: str
    receiver_name: Optional[str] = None
    status: str  # SAFE, NEEDS_VERIFICATION, SUSPICIOUS, HIGH_RISK
    reputation_score: int  # 0-100 (higher = safer)
    is_mule_connected: bool = False
    mule_network_id: Optional[str] = None
    signals: List[str]
    previous_interactions_count: int = 0
    total_volume_received_today: float = 0.0

class DecisionRequest(BaseModel):
    receiver_id: str
    amount: float
    risk_score: int
    decision: str  # VERIFY, DELAY, CONTINUE, CANCEL
    confirmed_override: Optional[bool] = False
    notes: Optional[str] = None

class DecisionResponse(BaseModel):
    success: bool
    decision_id: str
    logged_at: str
    action_recorded: str

class HealthResponse(BaseModel):
    status: str
    service: str = "TakaSafe ScamShield ML Backend"
    model_loaded: bool
    model_path: Optional[str] = None
    model_type: str = "XGBoost"
    feature_count: int = 0
    message: str
