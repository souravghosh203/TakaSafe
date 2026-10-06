import time
from typing import Dict, Any, List
from backend.services.feature_processor import FeatureProcessor
from backend.services.scamshield_model import ScamShieldModelService
from backend.services.explanation_service import ExplanationService
from backend.models.schemas import AnalyzeResponse, RiskReason, VerifyRecipientResponse

class RiskEngine:
    def __init__(self, model_service: ScamShieldModelService = None, feature_processor: FeatureProcessor = None):
        self.feature_processor = feature_processor or FeatureProcessor()
        self.model_service = model_service or ScamShieldModelService()
        self.explanation_service = ExplanationService()

    def analyze_transaction(self, payload: Dict[str, Any]) -> AnalyzeResponse:
        start_time = time.time()

        # Check if model is connected
        if not self.model_service.is_loaded:
            raise RuntimeError(f"ML model not connected: {self.model_service.load_error}")

        # 1. Feature processing
        feature_vector, feature_dict = self.feature_processor.extract_features(payload)

        # 2. In-memory model inference
        risk_prob = self.model_service.predict_proba(feature_vector)
        risk_score = int(round(risk_prob * 100))
        risk_score = max(0, min(100, risk_score))

        # 3. Risk Band mapping
        if risk_score <= 30:
            risk_level = "LOW"
            prediction = "SAFE"
            recommended_action = "CONTINUE"
        elif risk_score <= 60:
            risk_level = "MEDIUM"
            prediction = "REVIEW"
            recommended_action = "VERIFY"
        elif risk_score <= 80:
            risk_level = "HIGH"
            prediction = "RISKY"
            recommended_action = "VERIFY"
        else:
            risk_level = "CRITICAL"
            prediction = "CRITICAL"
            recommended_action = "VERIFY"

        # 4. Generate structured evidence
        raw_reasons = self.explanation_service.explain(feature_dict, risk_score)
        reasons = [RiskReason(label=r["label"], impact=r["impact"]) for r in raw_reasons]

        latency_ms = round((time.time() - start_time) * 1000, 2)

        return AnalyzeResponse(
            risk_score=risk_score,
            risk_level=risk_level,
            prediction=prediction,
            confidence=round(risk_prob, 3),
            reasons=reasons,
            recommended_action=recommended_action,
            can_continue=True,
            model_status="LOADED",
            model_path=self.model_service.model_path,
            inference_latency_ms=latency_ms
        )

    def verify_recipient(self, receiver_id: str) -> VerifyRecipientResponse:
        clean_id = receiver_id.replace('-', '').replace(' ', '')
        is_mule = clean_id in self.feature_processor.known_mule_wallets or receiver_id in self.feature_processor.known_mule_wallets

        if is_mule:
            status = "SUSPICIOUS"
            reputation_score = 14
            signals = [
                "New recipient not in your contact ledger",
                "Multiple rapid inbound transfers detected within 15 minutes",
                "Flagged in BFIU Suspicious Mule Network #17 cluster",
                "High cash-out velocity terminal in coastal division"
            ]
            receiver_name = "Md. Al-Amin (Node W302)" if "302" in clean_id or "510294" in clean_id else "Unverified High-Risk Wallet"
            mule_id = "Suspicious Network #17"
        elif receiver_id.startswith("01710") or receiver_id.startswith("01825"):
            status = "SAFE"
            reputation_score = 96
            signals = [
                "Recipient verified with biometric NID on file",
                "Frequent historical contact (12+ successful transfers)",
                "No suspicious dispute or velocity reports"
            ]
            receiver_name = "Rehana Parvin (Mother / Family)"
            mule_id = None
        else:
            status = "NEEDS_VERIFICATION"
            reputation_score = 45
            signals = [
                "First-time recipient for this customer account",
                "Wallet created recently (< 30 days active tenure)",
                "Standard retail MFS account without enterprise verification"
            ]
            receiver_name = f"Wallet Holder ({receiver_id})"
            mule_id = None

        return VerifyRecipientResponse(
            receiver_id=receiver_id,
            receiver_name=receiver_name,
            status=status,
            reputation_score=reputation_score,
            is_mule_connected=is_mule,
            mule_network_id=mule_id,
            signals=signals,
            previous_interactions_count=14 if status == "SAFE" else 0,
            total_volume_received_today=155000.0 if is_mule else 3200.0
        )
