import os
from ultralytics import YOLO
from PIL import Image
import io

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
YOLO_MODEL_PATH = os.path.join(MODELS_DIR, "best_yolo.pt")

yolo_model = None

def load_cv_model():
    global yolo_model
    if os.path.exists(YOLO_MODEL_PATH):
        try:
            yolo_model = YOLO(YOLO_MODEL_PATH, task="detect")
            print(f"Successfully loaded YOLO CV model. Classes: {list(yolo_model.names.values())}")
        except Exception as e:
            print(f"Failed to load YOLO CV model: {e}")
    else:
        print(f"YOLO model not found at {YOLO_MODEL_PATH}")

def analyze_image(image_bytes: bytes):
    if yolo_model is None:
        return {"error": "CV Model not loaded", "detections": [], "model_classes": []}
    
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = image.size
        results = yolo_model(image, conf=0.15)  # Low threshold for sensitivity
        
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # get box coordinates in (xmin, ymin, xmax, ymax) format
                b = box.xyxy[0].tolist()
                c = int(box.cls)
                name = yolo_model.names[c]
                conf = float(box.conf)
                
                detections.append({
                    "box": {"xmin": b[0], "ymin": b[1], "xmax": b[2], "ymax": b[3]},
                    "class_name": name,
                    "confidence": conf
                })
                
        print(f"CV: image={w}x{h}, detections={len(detections)}")
        return {
            "detections": detections,
            "model_classes": list(yolo_model.names.values()),
            "image_size": {"width": w, "height": h}
        }
    except Exception as e:
        print(f"CV analyze error: {e}")
        return {"error": str(e), "detections": [], "model_classes": []}
