from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import pandas as pd
from typing import List, Dict, Any
from fastapi import File, UploadFile

from schemas import PredictionRequest, PredictionResponse
from services import load_models, get_predictions
import services
from cv_service import load_cv_model, analyze_image

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load all ML models and database during startup
    load_models()
    load_cv_model()
    yield
    # Clean up on shutdown

app = FastAPI(title="PackWise AI Model API", lifespan=lifespan)

# Optional: Add CORS middleware if you end up running without the Vite proxy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    from services import models, encoders
    loaded_models_count = sum(1 for m in models.values() if m is not None)
    
    if loaded_models_count < 7 or not encoders:
        return {
            "status": "error",
            "message": "Some models or encoders failed to load.",
            "models_loaded": loaded_models_count,
            "encoders_loaded": bool(encoders)
        }

    return {
        "status": "ok",
        "models_loaded": loaded_models_count,
        "encoders_loaded": True
    }

@app.get("/api/product-families")
def get_product_families():
    if services.product_master is None:
        return []
    # Fill NaN values with None so JSON serialization works properly
    pm_clean = services.product_master.fillna("")
    return pm_clean.to_dict(orient="records")

@app.get("/api/accessories")
def get_accessories():
    if services.accessory_master is None:
        return []
    am_clean = services.accessory_master.fillna("")
    return am_clean.to_dict(orient="records")

@app.post("/api/analyze-image")
async def process_image(file: UploadFile = File(...)):
    contents = await file.read()
    result = analyze_image(contents)
    return result

@app.post("/api/predict-packaging", response_model=PredictionResponse)
def predict_packaging(request: PredictionRequest):
    input_dict = request.model_dump()
    predictions = get_predictions(input_dict)
    return PredictionResponse(**predictions)
