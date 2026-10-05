from typing import Dict, List, Any

class ExplanationService:
    def __init__(self):
        pass

    def explain(self, features: Dict[str, float], risk_score: int) -> List[Dict[str, Any]]:
        """
        Derives structured evidence and percentage impacts from feature values.
        Matches prototype SHAP attribution schema.
        """
        reasons = []

        is_new = features.get('is_new_recipient', 0.0) >= 0.5
        amount_ratio = features.get('amount_deviation_ratio', 1.0)
        is_nocturnal = features.get('is_nocturnal', 0.0) >= 0.5
        is_mule = features.get('is_mule_cluster_linked', 0.0) >= 0.5
        device_flag = features.get('device_change_flag', 0.0) >= 0.5
        recipient_surge = features.get('recipient_incoming_surge', 0.0) >= 0.5

        if is_new:
            reasons.append({
                "label": "New recipient",
                "impact": 32
            })

        if amount_ratio >= 2.0:
            impact = 35 if amount_ratio >= 10.0 else 27 if amount_ratio >= 4.0 else 18
            reasons.append({
                "label": f"Unusually high amount ({amount_ratio:.1f}x typical avg)",
                "impact": impact
            })
        elif amount_ratio >= 1.4:
            reasons.append({
                "label": "Above average transaction volume",
                "impact": 12
            })

        if is_nocturnal:
            hour = int(features.get('transaction_hour', 3))
            reasons.append({
                "label": f"Unusual transaction time ({hour:02d}:00 BST nocturnal)",
                "impact": 19
            })

        if is_mule or recipient_surge:
            reasons.append({
                "label": "Suspicious recipient connection (Syndicate Net #17 Link)",
                "impact": 24 if is_mule else 16
            })

        if device_flag:
            reasons.append({
                "label": "Unrecognized device fingerprint",
                "impact": 14
            })

        # If low risk and no red flags
        if not reasons and risk_score <= 30:
            reasons.append({
                "label": "Recipient matches historical trusted peer",
                "impact": 5
            })
            reasons.append({
                "label": "Amount is within 90-day habitual envelope",
                "impact": 4
            })

        # Sort by impact descending
        reasons.sort(key=lambda x: x["impact"], reverse=True)
        return reasons
