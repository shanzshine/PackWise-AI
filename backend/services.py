import os
import joblib
import pandas as pd
from typing import Dict, Any, List

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
DB_PATH = os.path.join(os.path.dirname(__file__), "Engineering_Database.xlsx")

# Dictionary to hold the loaded models and encoders
models: Dict[str, Any] = {}
encoders: Dict[str, Any] = {}

# Global variables for Master Data
product_master = None
accessory_master = None

def load_models():
    """Load all 7 XGBoost models, label encoders, and Master Databases."""
    global models, encoders, product_master, accessory_master
    
    # Load Engineering DB
    if os.path.exists(DB_PATH):
        try:
            xls = pd.ExcelFile(DB_PATH)
            product_master = pd.read_excel(xls, 'Product_Master')
            accessory_master = pd.read_excel(xls, 'Accessory_Master')
            print("Loaded Engineering Database")
        except Exception as e:
            print(f"Failed to load Engineering DB: {e}")
    
    # Load encoders first
    encoders_path = os.path.join(MODELS_DIR, "label_encoders.pkl")
    if os.path.exists(encoders_path):
        try:
            loaded_encoders = joblib.load(encoders_path)
            encoders.update(loaded_encoders)
            print("Loaded label encoders")
        except Exception as e:
            print(f"Failed to load label encoders: {e}")
    else:
        print(f"Warning: Label encoders not found at {encoders_path}")
    model_filenames = {
        "head_strap": "head_strap.pkl",
        "waist_strap": "waist_strap.pkl",
        "hand_strap": "hand_strap.pkl",
        "leg_strap": "leg_strap.pkl",
        "back_support": "back_support.pkl",
        "base_support": "base_support.pkl",
        "material": "material.pkl",
    }
    
    for key, filename in model_filenames.items():
        filepath = os.path.join(MODELS_DIR, filename)
        if os.path.exists(filepath):
            models[key] = joblib.load(filepath)
            print(f"Loaded model {filename}")
        else:
            print(f"Warning: Model {filename} not found at {filepath}. Using dummy predictor.")
            # Set a dummy predictor if model not found for development purposes
            models[key] = None

def get_predictions(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate engineering features and run inferences using the loaded models."""
    global product_master, accessory_master
    
    predictions = {}
    
    # 1. Look up Product Master defaults
    complexity_score = 0
    stability_index = 0
    
    if product_master is not None:
        pm_row = product_master[product_master['product_family'] == request_data.get('product_family')]
        if not pm_row.empty:
            complexity_score = int(pm_row.iloc[0].get('complexity_score', 0))
            stability_index = int(pm_row.iloc[0].get('stability_index', 0))
            
    # 2. Look up Accessory Master for fragile parts and attachments
    fragility_score = 0
    attachment_needed = 0
    fragile_parts_count = 0
    
    selected_accessories = request_data.get('selected_accessories', [])
    
    if accessory_master is not None and selected_accessories:
        for acc in selected_accessories:
            am_row = accessory_master[accessory_master['accessory_name'] == acc]
            if not am_row.empty:
                f_score = int(am_row.iloc[0].get('fragility', 0))
                req_att = int(am_row.iloc[0].get('requires_attachment', 0))
                
                fragility_score += f_score
                if req_att > 0:
                    attachment_needed = 1  # 1 if ANY accessory needs attachment
                if f_score > 0:
                    fragile_parts_count += 1

    # 3. Build the final 15-feature dictionary expected by the XGBoost models
    features = {
        'product_family': request_data.get('product_family'),
        'articulation': request_data.get('articulation'),
        'pose': request_data.get('pose'),
        'product_weight_g': request_data.get('product_weight_g'),
        'height_cm': request_data.get('height_cm'),
        'complexity_score': complexity_score,
        'stability_index': stability_index,
        'center_of_gravity': request_data.get('center_of_gravity'),
        'hair_length': request_data.get('hair_length'),
        'dress_length': request_data.get('dress_length'),
        'accessory_count': request_data.get('accessory_count'),
        'accessory_weight_g': request_data.get('accessory_weight_g'),
        'fragility_score': fragility_score,
        'attachment_needed': attachment_needed,
        'fragile_parts_count': fragile_parts_count
    }
    
    input_data = pd.DataFrame([features])
    
    # Apply label encoders to categorical features
    categorical_features = [
        "product_family", "articulation", "pose", 
        "center_of_gravity", "hair_length", "dress_length"
    ]
    
    for feature in categorical_features:
        if feature in input_data.columns and feature in encoders:
            try:
                input_data[feature] = encoders[feature].transform(input_data[feature])
            except Exception as e:
                print(f"Error encoding {feature}: {e}")
    
    model_keys = [
        "head_strap", "waist_strap", "hand_strap", "leg_strap",
        "back_support", "base_support", "material"
    ]
    
    for key in model_keys:
        model = models.get(key)
        if model is not None:
            # Predict using XGBoost model
            pred = model.predict(input_data)[0]
            if hasattr(pred, "item"):
                pred = pred.item()
            
            # Decode only material
            if key == "material":
                if "recommended_material" in encoders:
                    try:
                        pred = encoders["recommended_material"].inverse_transform([int(pred)])[0]
                    except Exception as e:
                        print(f"Error decoding material: {e}")
            
            predictions[f"recommended_{key}"] = pred
        else:
            # Dummy predictions if model isn't loaded
            if key == "material":
                predictions[f"recommended_{key}"] = "Recycled Cardboard + rPET"
            else:
                predictions[f"recommended_{key}"] = 0

    return predictions
