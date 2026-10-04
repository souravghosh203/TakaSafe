import json
import os
from datetime import datetime
from typing import Dict, Any, List, Tuple
import numpy as np

class FeatureProcessor:
    def __init__(self, config_path: str = None):
        if not config_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            config_path = os.path.join(base_dir, 'ml', 'feature_config.json')
        
        self.config_path = config_path
        self.config = self._load_config()
        self.feature_order = self.config.get('feature_order', [])
        self.feature_defaults = self.config.get('feature_defaults', {})
        
        # Known suspicious syndicates & wallets in TakaSafe network #17
        self.known_mule_wallets = {
            '01988-510294', '01988510294', 'W302', '01899-771122', '01899771122',
            '01711-239481', '01711239481', 'AGT-881', 'AGT-882'
        }

    def _load_config(self) -> Dict[str, Any]:
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                return json.load(f)
        return {}

    def extract_features(self, payload: Dict[str, Any]) -> Tuple[List[float], Dict[str, float]]:
        """
        Transforms raw transaction input into aligned vector according to feature_order.
        Returns (feature_vector, feature_dict).
        """
        amount = float(payload.get('amount', 1000.0))
        customer_avg = float(payload.get('customer_avg_amount', 1500.0))
        if customer_avg <= 0:
            customer_avg = 1500.0
            
        amount_ratio = amount / customer_avg
        receiver_id = str(payload.get('receiver_id', '')).strip()
        is_new = 1.0 if payload.get('is_new_recipient', True) else 0.0
        
        # Parse timestamp
        timestamp_str = payload.get('timestamp')
        if timestamp_str:
            try:
                dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                # Bangladesh is UTC+6
                hour = (dt.hour + 6) % 24 if dt.tzinfo else dt.hour
            except Exception:
                hour = 14
        else:
            now = datetime.now()
            hour = now.hour

        is_nocturnal = 1.0 if hour < 6 else 0.0
        frequency = float(payload.get('transaction_frequency', 1))
        
        # Known mule / network #17 link
        normalized_receiver = receiver_id.replace('-', '').replace(' ', '')
        is_mule = 1.0 if normalized_receiver in self.known_mule_wallets or receiver_id in self.known_mule_wallets else 0.0
        
        # Recipient surge simulation based on transaction volume/mule involvement
        recipient_surge = 1.0 if is_mule or normalized_receiver.startswith('01988') else 0.0
        
        # Device & location flags
        device_id = str(payload.get('device_id', '')).lower()
        device_flag = 1.0 if 'unknown' in device_id or 'dev-8819' in device_id or 'new' in device_id else 0.0
        
        location = str(payload.get('location', '')).lower()
        loc_flag = 1.0 if 'coastal' in location or 'patuakhali' in location else 0.0
        
        # Composite behavior score
        behavior_score = min(1.0, max(0.01, (amount_ratio - 1.0) / 10.0 + (0.3 if is_nocturnal else 0.0) + (0.2 if is_new else 0.0)))

        features_dict = {
            'amount': amount,
            'amount_deviation_ratio': round(amount_ratio, 3),
            'is_new_recipient': is_new,
            'transaction_hour': float(hour),
            'is_nocturnal': is_nocturnal,
            'transaction_frequency': frequency,
            'behavior_deviation_score': round(behavior_score, 3),
            'recipient_incoming_surge': recipient_surge,
            'is_mule_cluster_linked': is_mule,
            'device_change_flag': device_flag,
            'location_mismatch_flag': loc_flag
        }
        
        # Build ordered vector
        vector = []
        for feat_name in self.feature_order:
            val = features_dict.get(feat_name, self.feature_defaults.get(feat_name, 0.0))
            vector.append(float(val))
            
        return vector, features_dict
