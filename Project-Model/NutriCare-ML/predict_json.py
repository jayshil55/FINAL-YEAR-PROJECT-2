"""Offline JSON adapter for NutriCare's local Random Forest model."""

import json
import os
import sys

import joblib
import numpy as np
import pandas as pd

from src.config import METADATA_PATH, MODEL_PATH


LABELS = {"GOOD": "Good", "MEDIUM": "Okay", "HARD": "Poor"}


def main():
    try:
        request = json.load(sys.stdin)
        if not os.path.isfile(MODEL_PATH):
            print(json.dumps({
                "status": "not_ready",
                "message": "The local model artifact is missing. Run train.py once in the NutriCare-ML folder.",
            }))
            return

        with open(METADATA_PATH, "r", encoding="utf-8") as metadata_file:
            metadata = json.load(metadata_file)
        features = metadata.get("input_features", [])
        if not features:
            raise ValueError("Model metadata does not define input_features.")

        supplied = request.get("values", {})
        row = {name: supplied.get(name, np.nan) for name in features}
        if not any(pd.notna(value) for value in row.values()):
            print(json.dumps({"status": "insufficient_data", "message": "No supported biomarkers were found."}))
            return

        pipeline = joblib.load(MODEL_PATH)
        frame = pd.DataFrame([row], columns=features)
        category = str(pipeline.predict(frame)[0])
        probabilities = pipeline.predict_proba(frame)[0]
        class_probabilities = {
            LABELS.get(str(label), str(label)): round(float(probability), 4)
            for label, probability in zip(pipeline.classes_, probabilities)
        }

        print(json.dumps({
            "status": "ready",
            "category": LABELS.get(category, category),
            "rawCategory": category,
            "probabilities": class_probabilities,
            "providedFeatureCount": int(sum(pd.notna(value) for value in row.values())),
            "expectedFeatureCount": len(features),
            "disclaimer": metadata.get("disclaimer", "Synthetic educational model output; not a diagnosis."),
        }))
    except Exception as error:
        print(json.dumps({"status": "error", "message": str(error)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
