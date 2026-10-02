"""Lightweight PackWise historical-ML API.

Run this service when only the product-input prediction workflow is needed. It
does not initialize YOLO, OpenCV, Supabase, or the scan pipeline.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import joblib
import pandas as pd
import sklearn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


BASE_DIR = Path(__file__).resolve().parent
MODEL_FILES = {
    "recommended_head_strap": "head_strap.pkl",
    "recommended_waist_strap": "waist_strap.pkl",
    "recommended_hand_strap": "hand_strap.pkl",
    "recommended_leg_strap": "leg_strap.pkl",
    "recommended_back_support": "back_support.pkl",
    "recommended_base_support": "base_support.pkl",
    "recommended_material": "material.pkl",
}
FEATURE_COLUMNS = [
    "product_family",
    "articulation",
    "pose",
    "product_weight_g",
    "height_cm",
    "complexity_score",
    "stability_index",
    "center_of_gravity",
    "hair_length",
    "dress_length",
    "accessory_count",
    "accessory_weight_g",
    "fragility_score",
    "attachment_needed",
    "fragile_parts_count",
]
CATEGORICAL_COLUMNS = [
    "product_family",
    "articulation",
    "pose",
    "center_of_gravity",
    "hair_length",
    "dress_length",
]


class PackagingRequest(BaseModel):
    product_family: str
    articulation: str
    pose: str
    product_weight_g: int
    height_cm: float
    complexity_score: int
    stability_index: int
    center_of_gravity: str
    hair_length: str
    dress_length: str
    accessory_count: int
    accessory_weight_g: float
    fragility_score: int
    attachment_needed: int
    fragile_parts_count: int


def resolve_model_dir() -> Path:
    configured = os.getenv("PACKAGING_MODEL_DIR")
    if configured:
        return Path(configured).expanduser().resolve()

    candidate = BASE_DIR / "model_output"
    metrics_path = candidate / "metrics.json"
    required = [candidate / "label_encoders.pkl"] + [
        candidate / filename for filename in MODEL_FILES.values()
    ]
    if metrics_path.exists() and all(path.exists() for path in required):
        metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
        trained_version = metrics.get("runtime_versions", {}).get("scikit_learn")
        if trained_version == sklearn.__version__:
            return candidate

    return BASE_DIR


MODEL_DIR = resolve_model_dir()
encoders = joblib.load(MODEL_DIR / "label_encoders.pkl")
models = {
    target: joblib.load(MODEL_DIR / filename)
    for target, filename in MODEL_FILES.items()
}

app = FastAPI(title="PackWise Historical ML API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "model_dir": str(MODEL_DIR),
        "scikit_learn": sklearn.__version__,
    }


@app.post("/api/predict-packaging")
def predict_packaging(request: PackagingRequest) -> dict[str, int | str]:
    frame = pd.DataFrame([request.model_dump()])
    for column in CATEGORICAL_COLUMNS:
        encoder = encoders.get(column)
        if encoder is None:
            raise HTTPException(500, f"Missing encoder for {column}")
        value = str(frame.at[0, column])
        if value not in encoder.classes_:
            raise HTTPException(
                422,
                f"Unsupported {column}: {value}. Expected one of: {', '.join(encoder.classes_)}",
            )
        frame[column] = encoder.transform(frame[column].astype(str))

    frame = frame[FEATURE_COLUMNS]
    output = {
        target: int(model.predict(frame)[0])
        for target, model in models.items()
    }
    output["recommended_material"] = encoders[
        "recommended_material"
    ].inverse_transform([output["recommended_material"]])[0]
    return output
