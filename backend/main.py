from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import io
from PIL import Image
import base64
import joblib
import pandas as pd
from pydantic import BaseModel

import os
from dotenv import load_dotenv
load_dotenv()

from typing import Optional
from pydantic import Field
from fastapi import HTTPException, Depends

from auth import router as auth_router, get_current_user
from supabase_client import save_assessment

try:
    from rule_engine import (
        ProductFeatures, RiskCategory, BodyRegion, AccessoryItem, AccessoryRetention,
        predict,
    )
    from rule_engine.mapping import row_to_product_features
    RULE_ENGINE_AVAILABLE = True
except ImportError:
    RULE_ENGINE_AVAILABLE = False

app = FastAPI(
    title="PackWise Risk Prediction API",
    description="Rule-based Transport Risk Predictor: Drop Test, Movement, and Accessory Loss Risk.",
    version="1.0.0",
)

_origins_env = os.getenv("ALLOWED_ORIGINS")
allow_origins = _origins_env.split(",") if _origins_env else ["*"]

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

class PackagingRequest(BaseModel):
    product_family: str = "Fashionistas"
    articulation: str = "Standard"
    pose: str = "Arms Open"
    product_weight_g: int = 120
    height_cm: float = 29.0
    center_of_gravity: str = "Center"
    hair_length: str = "Short"
    dress_length: str = "Short"
    accessory_count: int = 1
    accessory_weight_g: float = 15.0
    complexity_score: int = 5
    stability_index: int = 5
    fragility_score: int = 5
    attachment_needed: int = 1
    fragile_parts_count: int = 1

encoders = {}
rf_models = {}

@app.on_event("startup")
def load_models():
    global encoders, rf_models
    try:
        encoders = joblib.load("label_encoders.pkl")
        rf_models = {
            "recommended_head_strap": joblib.load("head_strap.pkl"),
            "recommended_waist_strap": joblib.load("waist_strap.pkl"),
            "recommended_hand_strap": joblib.load("hand_strap.pkl"),
            "recommended_leg_strap": joblib.load("leg_strap.pkl"),
            "recommended_back_support": joblib.load("back_support.pkl"),
            "recommended_base_support": joblib.load("base_support.pkl"),
            "recommended_material": joblib.load("material.pkl")
        }
        print("Successfully loaded RF models and encoders.")
    except Exception as e:
        print(f"Error loading RF models: {e}")

@app.post("/api/predict-packaging")
async def predict_packaging(req: PackagingRequest):
    try:
        data = req.model_dump()
    except AttributeError:
        data = req.dict()
    df = pd.DataFrame([data])
    
    feature_columns = [
        "product_family", "articulation", "pose", "product_weight_g", "height_cm",
        "complexity_score", "stability_index", "center_of_gravity", "hair_length",
        "dress_length", "accessory_count", "accessory_weight_g", "fragility_score",
        "attachment_needed", "fragile_parts_count"
    ]
    
    categorical_cols = ["product_family", "articulation", "pose", "center_of_gravity", "hair_length", "dress_length"]
    for col in categorical_cols:
        if col in encoders:
            try:
                # If label is unseen, we just fallback to the first encoded class (usually 0) to avoid errors
                # This could happen with random unseen pose or family
                classes = list(encoders[col].classes_)
                val = df[col].iloc[0]
                if val not in classes:
                    df[col] = 0
                else:
                    df[col] = encoders[col].transform(df[col])
            except Exception:
                df[col] = 0
                
    df = df[feature_columns]
    
    output = {}
    for target, rf_model in rf_models.items():
        pred = rf_model.predict(df)[0]
        output[target] = int(pred)
        
    if "recommended_material" in encoders:
        mat_encoder = encoders["recommended_material"]
        output["recommended_material"] = mat_encoder.inverse_transform([output["recommended_material"]])[0]
        
    return output

# Load YOLOv8 Pose model (auto-downloads if not present)
model = YOLO("yolov8n-pose.pt")
# Load Custom Strap Detection model
strap_model = YOLO("best_strap.pt")

COCO_KEYPOINTS = [
    "nose", "left_eye", "right_eye", "left_ear", "right_ear",
    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
    "left_wrist", "right_wrist", "left_hip", "right_hip",
    "left_knee", "right_knee", "left_ankle", "right_ankle"
]

@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    img_np = np.array(image)
    
    # Run YOLOv8 Pose Inference
    results = model(img_np)
    # Run Custom Strap Inference
    strap_results = strap_model(img_np)
    
    # Menyiapkan kerangka Payload JSON yang lengkap sesuai kebutuhan tim (untuk Supabase)
    output = {
        "pose_status": {
            "left_arm_up": False,
            "right_arm_up": False
        },
        "detected_poses": [],
        "raw_keypoints": [], # Ke-17 titik COCO akan dimasukkan ke sini
        "detected_straps": [], # Hasil model best_strap.pt
        "image_base64": None
    }
    
    if len(results) > 0:
        result = results[0]
        
        # 1. Plot HANYA keypoints/skeleton, TANPA bounding boxes
        annotated_frame = result.plot(boxes=False, kpt_line=True)
        
        # Tambahkan plotting Bounding Box dari Strap Model di atas frame yang sama
        if len(strap_results) > 0:
            strap_result = strap_results[0]
            annotated_frame = strap_result.plot(img=annotated_frame)
            
            # Ekstrak data strap ke JSON
            if strap_result.boxes is not None:
                for box in strap_result.boxes:
                    cls_id = int(box.cls[0])
                    cls_name = strap_result.names[cls_id]
                    cnf = float(box.conf[0])
                    b = box.xyxy[0].tolist()
                    output["detected_straps"].append({
                        "class_name": cls_name,
                        "confidence": round(cnf, 4),
                        "box": { "xmin": b[0], "ymin": b[1], "xmax": b[2], "ymax": b[3] }
                    })
        
        # YOLO mengembalikan gambar dalam format RGB, tapi cv2.imencode membaca format BGR.
        # Ini yang bikin gambarnya jadi "Smurf" (merah dan biru tertukar). Kita harus convert!
        annotated_frame_bgr = cv2.cvtColor(annotated_frame, cv2.COLOR_RGB2BGR)
        
        # 2. Encode to base64
        _, buffer = cv2.imencode('.jpg', annotated_frame_bgr)
        img_b64 = base64.b64encode(buffer).decode("utf-8")
        output["image_base64"] = f"data:image/jpeg;base64,{img_b64}"
        
        # 3. Process Logic for Arm Up/Down & Ekstraksi 17 Titik
        if result.keypoints is not None and len(result.keypoints.xy) > 0:
            kpts = result.keypoints.xy[0].tolist()
            confs = result.keypoints.conf[0].tolist() if result.keypoints.conf is not None else [1.0]*17
            
            # Menyusun JSON Payload 17 Titik Lengkap
            for i in range(min(17, len(kpts))):
                output["raw_keypoints"].append({
                    "id": i,
                    "part": COCO_KEYPOINTS[i] if i < len(COCO_KEYPOINTS) else f"pt_{i}",
                    "x": round(kpts[i][0], 2),
                    "y": round(kpts[i][1], 2),
                    "confidence": round(confs[i], 4)
                })

            # Logic pose
            detected_poses = []
            
            # Left Arm Up
            # Boneka sering dapat confidence rendah, kita turunkan batasnya jadi 0.1
            if confs[5] > 0.1 and confs[9] > 0.1:
                if kpts[9][1] < kpts[5][1] and kpts[9][1] != 0:
                    output["pose_status"]["left_arm_up"] = True
                    detected_poses.append("Left Arm Raised")
                    
            # Right Arm Up
            if confs[6] > 0.1 and confs[10] > 0.1:
                if kpts[10][1] < kpts[6][1] and kpts[10][1] != 0:
                    output["pose_status"]["right_arm_up"] = True
                    detected_poses.append("Right Arm Raised")
            
            # Logic "Hand on Hip"
            import math
            # Left Hand on Hip
            if confs[5] > 0.1 and confs[11] > 0.1 and confs[9] > 0.1:
                torso_len_l = math.dist([kpts[5][0], kpts[5][1]], [kpts[11][0], kpts[11][1]])
                wrist_hip_dist_l = math.dist([kpts[9][0], kpts[9][1]], [kpts[11][0], kpts[11][1]])
                if torso_len_l > 0 and (wrist_hip_dist_l / torso_len_l) < 0.4:
                    detected_poses.append("Left Hand on Hip")
                    
            # Right Hand on Hip
            if confs[6] > 0.1 and confs[12] > 0.1 and confs[10] > 0.1:
                torso_len_r = math.dist([kpts[6][0], kpts[6][1]], [kpts[12][0], kpts[12][1]])
                wrist_hip_dist_r = math.dist([kpts[10][0], kpts[10][1]], [kpts[12][0], kpts[12][1]])
                if torso_len_r > 0 and (wrist_hip_dist_r / torso_len_r) < 0.4:
                    detected_poses.append("Right Hand on Hip")
                    
            # Tambahan Heuristik: T-Pose / Arms Wide Open
            if confs[5] > 0.1 and confs[6] > 0.1 and confs[9] > 0.1 and confs[10] > 0.1:
                wrist_dist_x = abs(kpts[9][0] - kpts[10][0])
                shoulder_dist_x = abs(kpts[5][0] - kpts[6][0])
                if shoulder_dist_x > 0 and wrist_dist_x > shoulder_dist_x * 2.5:
                    detected_poses.append("T-Pose (Arms Wide)")

            # Tambahan Heuristik: Arms Crossed (Tangan Bersilang)
            if confs[5] > 0.1 and confs[6] > 0.1 and confs[9] > 0.1 and confs[10] > 0.1:
                # Jarak wrist kiri ke bahu kanan, dan sebaliknya
                lw_rs = math.dist([kpts[9][0], kpts[9][1]], [kpts[6][0], kpts[6][1]])
                rw_ls = math.dist([kpts[10][0], kpts[10][1]], [kpts[5][0], kpts[5][1]])
                shoulder_w = math.dist([kpts[5][0], kpts[5][1]], [kpts[6][0], kpts[6][1]])
                if shoulder_w > 0 and (lw_rs / shoulder_w) < 0.8 and (rw_ls / shoulder_w) < 0.8:
                    detected_poses.append("Arms Crossed")
                    
            # Tambahan Heuristik: Hand Touching Face (Vogue Pose)
            if confs[0] > 0.1 and confs[5] > 0.1 and confs[11] > 0.1:
                torso_len = math.dist([kpts[5][0], kpts[5][1]], [kpts[11][0], kpts[11][1]])
                if confs[9] > 0.1:
                    dist_to_face_l = math.dist([kpts[9][0], kpts[9][1]], [kpts[0][0], kpts[0][1]])
                    if torso_len > 0 and (dist_to_face_l / torso_len) < 0.4:
                        detected_poses.append("Left Hand on Face (Vogue)")
                if confs[10] > 0.1:
                    dist_to_face_r = math.dist([kpts[10][0], kpts[10][1]], [kpts[0][0], kpts[0][1]])
                    if torso_len > 0 and (dist_to_face_r / torso_len) < 0.4:
                        detected_poses.append("Right Hand on Face (Vogue)")

            # Tambahan Heuristik: Hands Clasped / Relaxed Together
            if confs[9] > 0.1 and confs[10] > 0.1 and confs[5] > 0.1 and confs[11] > 0.1:
                wrist_dist = math.dist([kpts[9][0], kpts[9][1]], [kpts[10][0], kpts[10][1]])
                torso_len = math.dist([kpts[5][0], kpts[5][1]], [kpts[11][0], kpts[11][1]])
                if torso_len > 0 and (wrist_dist / torso_len) < 0.3 and kpts[9][1] > kpts[5][1]:
                    detected_poses.append("Hands Clasped")

            # Tambahan Heuristik: Sitting Pose (Duduk)
            # Cek jika selisih Y antara pinggul dan lutut sangat kecil (paha horizontal)
            if confs[11] > 0.1 and confs[13] > 0.1 and confs[5] > 0.1:
                torso_len = math.dist([kpts[5][0], kpts[5][1]], [kpts[11][0], kpts[11][1]])
                y_dist_hip_knee = abs(kpts[11][1] - kpts[13][1])
                if torso_len > 0 and (y_dist_hip_knee / torso_len) < 0.35:
                    detected_poses.append("Sitting Pose")

            if len(detected_poses) == 0:
                detected_poses.append("Standing Neutral")

            output["detected_poses"] = detected_poses

    return output


# ---------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------

class ProductRow(BaseModel):
    plan_id: int = Field(..., description="The packaging_plan.plan_id this assessment belongs to")
    product_weight_g: float
    height_cm: float
    fragility_score: float
    center_of_gravity: str = Field(..., description="'Center', 'Back', 'Left', 'Right', or 'Front'")
    accessory_count: int = 0
    accessory_weight_g: float = 0.0
    movement_score: float = 0.0
    complexity_score: float = 0.0
    stability_index: float = 0.0
    recommended_head_strap: int = 0
    recommended_waist_strap: int = 0
    recommended_hand_strap: int = 0
    recommended_leg_strap: int = 0

    class Config:
        json_schema_extra = {
            "example": {
                "plan_id": 1,
                "product_weight_g": 123,
                "height_cm": 30.0,
                "fragility_score": 5,
                "center_of_gravity": "Back",
                "accessory_count": 3,
                "accessory_weight_g": 31.0,
                "movement_score": 7,
                "complexity_score": 7,
                "stability_index": 5,
                "recommended_head_strap": 1,
                "recommended_waist_strap": 4,
                "recommended_hand_strap": 1,
                "recommended_leg_strap": 0,
            }
        }


# ---------------------------------------------------------------------
# Response serialization helpers
# ---------------------------------------------------------------------

def serialize_report(report) -> dict:
    return {
        "overall_risk_level": report.overall_risk_level,
        "categories": {
            category.value: {
                "risk_level": result.risk_level,
                "risk_percentage": result.risk_percentage,
                "pass_probability": result.pass_probability,
                "matched_rules": [
                    {
                        "rule_id": m.rule.rule_id,
                        "evidence_id": m.rule.evidence_id,
                        "severity": m.rule.severity,
                        "confidence": m.rule.confidence,
                        "source_reference": m.rule.source_reference,
                        "explanation": m.explanation,
                    }
                    for m in result.matched_rules
                ],
            }
            for category, result in report.results.items()
        },
        "movement_by_region": {
            region.value: data for region, data in report.movement_by_region.items()
        },
        "accessory_loss_by_item": report.accessory_loss_by_item,
        "explanation_trace": report.explanation_trace,
    }


# ---------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "service": "PackWise Risk Prediction API"}


@app.post("/predict")
def predict_from_row(row: ProductRow, user: dict = Depends(get_current_user)):
    if not RULE_ENGINE_AVAILABLE:
        raise HTTPException(status_code=501, detail="Rule engine not yet installed")
    try:
        row_dict = row.model_dump()
        plan_id = row_dict.pop("plan_id")
        features = row_to_product_features(row_dict)
        report = predict(features)
        report_dict = serialize_report(report)

        assessment_id = save_assessment(
            plan_id=plan_id,
            report_dict=report_dict,
            input_snapshot=row_dict,
        )
        report_dict["assessment_id"] = assessment_id
        report_dict["saved_to_database"] = assessment_id is not None

        return report_dict
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {e}")


@app.post("/predict/features")
def predict_from_features(features_dict: dict):
    if not RULE_ENGINE_AVAILABLE:
        raise HTTPException(status_code=501, detail="Rule engine not yet installed")
    try:
        accessories = [
            AccessoryItem(
                name=a["name"], weight_g=a["weight_g"],
                retention_type=AccessoryRetention(a.get("retention_type", "None")),
                fragility=a.get("fragility"),
            )
            for a in features_dict.get("accessories", [])
        ]
        body_region_coverage = {
            BodyRegion(k): v for k, v in features_dict.get("body_region_coverage", {}).items()
        } or None

        kwargs = {k: v for k, v in features_dict.items() if k not in ("accessories", "body_region_coverage", "product_fragility")}
        features = ProductFeatures(
            product_fragility=features_dict["product_fragility"],
            accessories=accessories,
            **({"body_region_coverage": body_region_coverage} if body_region_coverage else {}),
            **kwargs,
        )
        report = predict(features)
        return serialize_report(report)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {e}")
