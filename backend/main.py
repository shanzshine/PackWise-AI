from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import io
from PIL import Image
import base64

app = FastAPI()

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        annotated_frame = result.plot(boxes=False)
        
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
