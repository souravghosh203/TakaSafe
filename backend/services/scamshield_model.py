import os
import json
import math
from typing import List, Optional, Tuple, Any

class ScamShieldModelService:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or os.getenv("MODEL_PATH")
        if not self.model_path:
            # Check default candidate paths
            candidates = [
                os.path.join(os.getcwd(), "ml", "model", "scamshield_xgb.json"),
                os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "model", "scamshield_xgb.json"),
                os.path.join(os.getcwd(), "model_artifacts", "xgboost_mfs_fraud_detector.json"),
            ]
            for c in candidates:
                if os.path.exists(c):
                    self.model_path = c
                    break
        
        self.is_loaded = False
        self.model = None
        self.model_type = "UNLOADED"
        self.feature_names = []
        self.json_trees = []
        self.load_error = None
        self.load_model()

    def load_model(self):
        """Loads the XGBoost model artifact into memory once at startup."""
        if not self.model_path or not os.path.exists(self.model_path):
            self.is_loaded = False
            self.load_error = f"Model artifact not found at path: {self.model_path or 'NOT_SET'}"
            return

        try:
            # 1. First attempt to load using native xgboost package if available
            try:
                import xgboost as xgb
                booster = xgb.Booster()
                booster.load_model(self.model_path)
                self.model = booster
                self.model_type = "XGBoost_Native"
                self.is_loaded = True
                self.load_error = None
                return
            except Exception:
                pass

            # 2. Support joblib/pickle if model is saved in binary format
            if self.model_path.endswith('.joblib') or self.model_path.endswith('.pkl'):
                try:
                    import joblib
                    self.model = joblib.load(self.model_path)
                    self.model_type = "Joblib_XGBoost"
                    self.is_loaded = True
                    self.load_error = None
                    return
                except Exception:
                    pass

            # 3. Native Python JSON Tree Parser for XGBoost JSON dumps
            # Allows instant low-latency in-memory tree traversal without requiring C++ libxgboost
            with open(self.model_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            if "learner" in data and "gradient_booster" in data["learner"]:
                gb = data["learner"]["gradient_booster"]["model"]
                self.json_trees = gb.get("trees", [])
                self.feature_names = data["learner"].get("feature_names", [])
                self.model_type = "XGBoost_JSON_Memory"
                self.is_loaded = True
                self.load_error = None
            else:
                self.is_loaded = False
                self.load_error = "Invalid XGBoost JSON model format"
        except Exception as e:
            self.is_loaded = False
            self.load_error = str(e)

    def predict_proba(self, feature_vector: List[float]) -> float:
        """
        Executes model prediction in-memory.
        Returns risk probability [0.0, 1.0].
        Raises RuntimeError if model is not connected.
        """
        if not self.is_loaded:
            raise RuntimeError(f"ML model not connected: {self.load_error}")

        # If native XGBoost booster
        if self.model_type == "XGBoost_Native":
            import xgboost as xgb
            import numpy as np
            dmatrix = xgb.DMatrix(np.array([feature_vector]))
            preds = self.model.predict(dmatrix)
            return float(preds[0])

        # If joblib / scikit-learn XGBClassifier
        if self.model_type == "Joblib_XGBoost":
            import numpy as np
            probs = self.model.predict_proba(np.array([feature_vector]))
            return float(probs[0, 1])

        # In-memory XGBoost JSON Tree Evaluator
        margin = 0.0
        for tree in self.json_trees:
            margin += self._evaluate_tree(tree, feature_vector)

        # Logistic sigmoid link function: 1 / (1 + exp(-margin))
        probability = 1.0 / (1.0 + math.exp(-max(min(margin, 25.0), -25.0)))
        return float(probability)

    def _evaluate_tree(self, tree: dict, feature_vector: List[float]) -> float:
        """Evaluates a single decision tree on the feature vector."""
        split_indices = tree.get("split_indices", [])
        split_conditions = tree.get("split_conditions", [])
        left_children = tree.get("left_children", [])
        right_children = tree.get("right_children", [])
        base_weights = tree.get("base_weights", [])

        if not split_indices:
            return 0.0

        current_node = 0
        while True:
            # Leaf node reached (indicated by left_children[current_node] == -1)
            left_child = left_children[current_node]
            if left_child == -1 or left_child >= len(split_indices):
                return base_weights[current_node]

            feat_idx = split_indices[current_node]
            split_val = split_conditions[current_node]

            val = feature_vector[feat_idx] if feat_idx < len(feature_vector) else 0.0

            if val < split_val:
                current_node = left_children[current_node]
            else:
                current_node = right_children[current_node]
