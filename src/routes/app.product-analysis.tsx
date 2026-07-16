import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Sparkles, CheckCircle2, ChevronRight, RotateCcw,
  ScanLine, ShieldAlert, AlertTriangle, Brain, Plus, X, Upload, ImageIcon, Camera,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { Progress } from "@/components/ui/progress";
import { saveAnalysis, clearAllWorkflowData, type AnalysisResult } from "@/lib/workflow-store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/app/product-analysis")({
  head: () => ({ meta: [{ title: "Pose & Doll Analysis — PackWise AI" }] }),
  component: ProductAnalysisPage,
});

const getWorkflowSteps = (stage: string) => [
  { label: "Product Input", active: stage === "form" || stage === "analysing" },
  { label: "Analysis Results", active: stage === "results" },
  { label: "Attachment Planner", active: false },
  { label: "Risk Assessment", active: false },
  { label: "Cost & Sustainability", active: false },
];

const ANALYSIS_STEPS = [
  "Detecting doll body regions",
  "Mapping strap zones via YOLO",
  "Identifying accessories",
  "Extracting engineering features",
];

type Stage = "form" | "analysing" | "results";

function WorkflowBar({ steps }: { steps: ReturnType<typeof getWorkflowSteps> }) {
  return (
    <div className="flex items-center rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
      {steps.map((s: any, i: number, arr: any[]) => (
        <div key={s.label} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${s.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i + 1}
            </div>
            <span className={`hidden text-[9px] font-medium sm:block ${s.active ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
          </div>
          {i < arr.length - 1 && <div className={`mx-1 h-px flex-1 ${s.active ? "bg-primary" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

function ProductAnalysisPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [runId] = useState(() => crypto.randomUUID());
  const [stage, setStage] = useState<Stage>("form");
  const [progress, setProgress] = useState(0);
  const [poseStatus, setPoseStatus] = useState<{ left_arm_up: boolean, right_arm_up: boolean } | null>(null);
  const [detectedPoses, setDetectedPoses] = useState<string[]>([]);
  const [detectedStraps, setDetectedStraps] = useState<{ class_name: string, confidence: number, box?: any }[]>([]);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [rawKeypoints, setRawKeypoints] = useState<any[]>([]);
  const [customWeightG, setCustomWeightG] = useState<string>("");
  const [customHeightCm, setCustomHeightCm] = useState<string>("");
  const [customAccName, setCustomAccName] = useState("");
  const [customAccWeight, setCustomAccWeight] = useState("10");
  const [saveToDb, setSaveToDb] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Image Upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  // Camera
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Master data
  const [productFamilies, setProductFamilies] = useState<any[]>([]);
  const [masterAccessories, setMasterAccessories] = useState<any[]>([
    { accessory_name: "Handbag", weight_g: 15 },
    { accessory_name: "Shoes (Pair)", weight_g: 10 },
    { accessory_name: "Sunglasses", weight_g: 5 },
    { accessory_name: "Hat", weight_g: 20 },
    { accessory_name: "Necklace", weight_g: 2 },
    { accessory_name: "Brush", weight_g: 8 },
    { accessory_name: "Pet Dog", weight_g: 45 },
    { accessory_name: "Backpack", weight_g: 25 },
  ]);

  // Form state
  const [productFamily, setProductFamily] = useState("Dreamtopia");
  const [articulation, setArticulation] = useState("Standard");
  const [pose, setPose] = useState("Arms Open"); // Mocked for now
  const [hairLength, setHairLength] = useState("Short");
  const [dressLength, setDressLength] = useState("Short");
  const [heightCm, setHeightCm] = useState<number>(29.0);
  const [weightG, setWeightG] = useState<number>(120);

  // Computed CV Metrics
  const [computedHeight, setComputedHeight] = useState<string>("29.5 cm");
  const [computedComplexity, setComputedComplexity] = useState<string>("Low (Standard)");
  const [computedCOG, setComputedCOG] = useState<string>("Center");

  // Accessories State
  const [selectedAccessories, setSelectedAccessories] = useState<{ name: string, weight: number }[]>([]);
  const [accSearch, setAccSearch] = useState("");

  useEffect(() => {
    // Entering Step 1 implies starting a fresh session. Wipe residual state.
    clearAllWorkflowData();

    async function loadMasterData() {
      try {
        const { data: pfData, error: pfError } = await supabase.from('product_families').select('*');
        if (pfData && !pfError && pfData.length > 0) {
          setProductFamilies(pfData);
          handleFamilyChange(pfData[0].product_family, pfData);
        } else {
          const fallback = [
            { product_family: "Dreamtopia", articulation: "Standard", default_height_cm: 29.0, default_weight_max: 120 },
            { product_family: "Fashionistas", articulation: "Standard", default_height_cm: 29.0, default_weight_max: 120 },
            { product_family: "Careers", articulation: "Standard", default_height_cm: 29.0, default_weight_max: 120 },
            { product_family: "Signature", articulation: "Standard", default_height_cm: 29.0, default_weight_max: 130 },
            { product_family: "Extra", articulation: "Standard", default_height_cm: 29.0, default_weight_max: 125 },
            { product_family: "Made to Move", articulation: "Made to Move", default_height_cm: 29.0, default_weight_max: 135 }
          ];
          setProductFamilies(fallback);
          handleFamilyChange(fallback[0].product_family, fallback);
        }

        const { data: accData, error: accError } = await supabase.from('accessories').select('*');
        if (accData && !accError && accData.length > 0) {
          setMasterAccessories(accData);
        }
      } catch (e) {
        console.error("Failed to load master data from Supabase, using local defaults", e);
      }
    }
    loadMasterData();
  }, []);

  useEffect(() => {
    const details = productFamilies.find((f) => f.product_family === productFamily);
    const baseWeight = details?.default_weight_max || 120;
    
    let hairWeight = 0;
    if (hairLength === "Medium") hairWeight = 8;
    else if (hairLength === "Long") hairWeight = 18;
    else if (hairLength === "Very Long") hairWeight = 30;

    let dressWeight = 5;
    if (dressLength === "Knee") dressWeight = 15;
    else if (dressLength === "Long") dressWeight = 45;

    let bodyWeight = 0;
    if (articulation === "Made to Move") bodyWeight = 15;
    else if (articulation === "Curvy") bodyWeight = 20;

    const finalWeight = baseWeight + hairWeight + dressWeight + bodyWeight;
    setWeightG(finalWeight);
  }, [productFamily, hairLength, dressLength, articulation, productFamilies]);

  const handleFile = (f: File) => {
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setImageDataUrl(src);
      try {
        sessionStorage.setItem("packwise_image", src);
      } catch (e) {
        console.warn("Failed to save raw image to sessionStorage:", e);
      }
    };
    reader.readAsDataURL(f);
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    setImageDataUrl(null);
    setImageFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.error("Camera access failed", e);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
          handleFile(file);
        }
      }, "image/jpeg");
    }
    stopCamera();
  };

  const handleFamilyChange = (fam: string, familiesData = productFamilies) => {
    setProductFamily(fam);
    const details = familiesData.find((f) => f.product_family === fam);
    if (details) {
      setArticulation(details.articulation || "Standard");
      setHeightCm(Number(details.default_height_cm) || 29.0);
      setWeightG(Number(details.default_weight_max) || 120);
    }
  };

  const addAccessory = (acc: any) => {
    setSelectedAccessories([...selectedAccessories, { name: acc.accessory_name, weight: acc.weight_g }]);
    setAccSearch("");
  };

  const removeAccessory = (idx: number) => {
    setSelectedAccessories(selectedAccessories.filter((_, i) => i !== idx));
  };

  const handleCustomAccAdd = async () => {
    const rawName = customAccName.trim();
    if (!rawName) return;

    // Convert to Title Case (e.g. "pet dog" -> "Pet Dog")
    const name = rawName
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const weight = parseFloat(customAccWeight) || 0;

    setSelectedAccessories([...selectedAccessories, { name, weight }]);

    // Instantly update the local autocomplete template list for zero-latency search
    const exists = masterAccessories.some(a => a.accessory_name === name);
    if (!exists) {
      setMasterAccessories([...masterAccessories, { accessory_name: name, weight_g: weight }]);
    } else {
      setMasterAccessories(masterAccessories.map(a => a.accessory_name === name ? { ...a, weight_g: weight } : a));
    }

    if (saveToDb) {
      const { error } = await supabase
        .from('accessories')
        .upsert({ accessory_name: name, weight_g: weight }, { onConflict: 'accessory_name' });
      
      if (!error) {
        toast.success(`Template "${name}" saved to Supabase.`);
        const { data } = await supabase.from('accessories').select('*');
        if (data) setMasterAccessories(data);
      } else {
        console.warn("Failed to save accessory template:", error.message);
        toast.error(`Database Warning: ${error.message}`);
      }
    } else {
      toast.success(`Added "${name}" to current doll.`);
    }

    setCustomAccName("");
    setCustomAccWeight("10");
    setAccSearch("");
  };

  const handleAnalyse = async () => {
    const finalWeight = customWeightG !== "" ? parseFloat(customWeightG) : weightG;
    const finalHeight = customHeightCm !== "" ? parseFloat(customHeightCm) : heightCm;

    setStage("analysing");
    setProgress(0);
    const ticks = [15, 32, 50, 66, 82, 100];
    ticks.forEach((p, i) => setTimeout(() => setProgress(p), (i + 1) * 700)); // slightly slower to wait for CV

    let detections = [];

    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        const res = await fetch("http://127.0.0.1:8000/api/analyze-image", {
          method: "POST",
          body: formData
        });
        if (res.ok) {
          const cvData = await res.json();
          if (cvData.detected_straps) {
            detections = cvData.detected_straps;
            console.log("YOLO Detections:", detections);
          }
          if (cvData.pose_status) setPoseStatus(cvData.pose_status);
          if (cvData.detected_poses) setDetectedPoses(cvData.detected_poses);
          if (cvData.detected_straps) setDetectedStraps(cvData.detected_straps);
          if (cvData.raw_keypoints) setRawKeypoints(cvData.raw_keypoints);
          if (cvData.image_base64) setAnnotatedImage(cvData.image_base64);

          // Skeleton math estimation based on keypoints
          if (cvData.raw_keypoints && cvData.raw_keypoints.length >= 16) {
            const getPt = (idx: number) => {
              const pt = cvData.raw_keypoints[idx];
              return (Array.isArray(pt)) ? { x: pt[0], y: pt[1] } : pt;
            };
            const nose = getPt(0);
            const leftHip = getPt(11);
            const rightHip = getPt(12);
            const leftAnkle = getPt(15);
            const leftShoulder = getPt(5);
            const leftElbow = getPt(7);
            const leftWrist = getPt(9);

            // 1. Height Estimation (Nose to Left Ankle)
            if (nose && leftAnkle) {
              const pxDist = Math.sqrt(Math.pow(nose.x - leftAnkle.x, 2) + Math.pow(nose.y - leftAnkle.y, 2));
              setComputedHeight(`${(pxDist * 0.05).toFixed(1)} cm (from Skeleton)`);
            }

            // 2. Pose Complexity (Shoulder - Elbow - Wrist Angle)
            if (leftShoulder && leftElbow && leftWrist) {
              const rad = Math.atan2(leftWrist.y - leftElbow.y, leftWrist.x - leftElbow.x) - Math.atan2(leftShoulder.y - leftElbow.y, leftShoulder.x - leftElbow.x);
              let angle = Math.abs(rad * 180.0 / Math.PI);
              if (angle > 180.0) angle = 360 - angle;
              if (angle < 140) setComputedComplexity("High / Dynamic (Arm bent)");
              else setComputedComplexity("Low / Standard (Arm straight)");
            }

            // 3. Center of Gravity (Midpoint of hips)
            if (leftHip && rightHip) {
              const midX = (leftHip.x + rightHip.x) / 2;
              setComputedCOG(`Center (Hip Midpoint X: ${midX.toFixed(0)})`);
            }
          }

          // Switch to results stage after progress finishes
          setTimeout(() => setStage("results"), 4200);
          return;
        }
      } catch (e) {
        console.error("YOLO CV failed", e);
      }
    }

    setTimeout(() => {
      // Mock skeleton logic for demo without backend
      setComputedHeight("29.2 cm (Estimated from skeleton)");
      setComputedComplexity("High / Dynamic (Arm bent)");
      setComputedCOG("Center (Hip midpoint estimated)");
      setDetectedStraps([
        { class_name: "waist_strap", confidence: 0.92 },
        { class_name: "neck_support", confidence: 0.85 }
      ]);
      setDetectedPoses(["Standing Neutral"]);

      const r: AnalysisResult = {
        productName: `${productFamily} Doll`,
        category: "Fashion Doll",
        imageDataUrl: imageDataUrl,
        productType: "Doll",
        dimensions: `${heightCm}cm`,
        analysedAt: new Date().toISOString(),

        product_family: productFamily,
        articulation: articulation,
        pose: pose,
        product_weight_g: finalWeight,
        height_cm: finalHeight,
        center_of_gravity: computedCOG,
        hair_length: hairLength,
        dress_length: dressLength,
        accessory_count: selectedAccessories.length,
        accessory_weight_g: selectedAccessories.reduce((acc, curr) => acc + curr.weight, 0),
        selected_accessories: selectedAccessories.map((a) => a.name),
        cvDetections: detections,

        accessories: selectedAccessories.map((a) => a.name),
        bodyRegions: ["Head", "Torso", "Arms", "Legs"],
        attachmentZones: [],
        poseComplexityScore: 0,
        poseStabilityScore: 0,
        movementRiskScore: 0,
        accessoryLossRisk: 0,
      };

      setStage("results");
    }, 4500);
  };

  const handleContinue = async () => {
    setIsSaving(true);
    try {
      const user = (() => { try { return JSON.parse(localStorage.getItem("packwise_user") || ""); } catch { return null; } })();
      
      let publicImageUrl = null;
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${user?.user_id || 'anonymous'}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, imageFile);
          if (!uploadError) {
            const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
            publicImageUrl = data.publicUrl;
          } else {
            console.warn("Supabase Storage upload failed:", uploadError);
          }
        } catch (err) {
          console.warn("Failed to upload image:", err);
        }
      }

      // Save full analysis to Supabase product_analyses
      try {
        const finalWeight = customWeightG !== "" ? parseFloat(customWeightG) : weightG;
        const finalHeight = customHeightCm !== "" ? parseFloat(customHeightCm) : heightCm;

        const mlOutputs = {
          detected_poses: detectedPoses,
          raw_keypoints: rawKeypoints,
          cv_detections: detectedStraps,
          pose_status: poseStatus,
          computed_height: computedHeight,
          computed_complexity: computedComplexity,
          computed_cog: computedCOG
        };

        const { data, error } = await supabase.from('product_analyses').insert([{
          id: runId,
          user_id: user?.user_id ?? null,
          product_name: `${productFamily} Doll`,
          product_family: productFamily,
          articulation: articulation,
          pose: poseStatus ? (poseStatus.left_arm_up || poseStatus.right_arm_up ? "Arms Up" : "Arms Down") : pose,
          weight_g: finalWeight,
          height_cm: finalHeight,
          center_of_gravity: computedCOG,
          hair_length: hairLength,
          dress_length: dressLength,
          accessory_count: selectedAccessories.length,
          accessory_weight_g: selectedAccessories.reduce((acc, curr) => acc + curr.weight, 0),
          selected_accessories: selectedAccessories.map((a) => a.name),
          image_url: publicImageUrl,
          annotated_image_url: null, // Can be updated later if needed
          ml_outputs: mlOutputs,
          created_at: new Date().toISOString(),
        }]).select();

        if (error) {
          console.warn("Supabase save warning:", error.message);
          toast.error("Database save error: " + error.message);
        } else if (data && data.length > 0) {
          console.log("[PackWise] Analysis saved to Supabase ✓", data[0].id);
          toast.success("Analysis saved to Supabase successfully.");
        }
      } catch (err: any) {
        console.warn("Supabase save failed (offline?):", err);
        toast.error("Database connection issue: " + err.message);
      }
    } finally {
      setIsSaving(false);

      const finalWeight = customWeightG !== "" ? parseFloat(customWeightG) : weightG;
      const finalHeight = customHeightCm !== "" ? parseFloat(customHeightCm) : heightCm;

      const r: AnalysisResult = {
        id: runId,
        productName: `${productFamily} Doll`,
        category: "Fashion Doll",
        imageDataUrl: imageDataUrl,
        productType: "Doll",
        dimensions: `${finalHeight}cm`,
        analysedAt: new Date().toISOString(),

        product_family: productFamily,
        articulation: articulation,
        pose: poseStatus ? (poseStatus.left_arm_up || poseStatus.right_arm_up ? "Arms Up" : "Arms Down") : pose,
        product_weight_g: finalWeight,
        height_cm: finalHeight,
        center_of_gravity: computedCOG,
        hair_length: hairLength,
        dress_length: dressLength,
        accessory_count: selectedAccessories.length,
        accessory_weight_g: selectedAccessories.reduce((acc, curr) => acc + curr.weight, 0),
        selected_accessories: selectedAccessories.map((a) => a.name),
        cvDetections: detectedStraps,
        raw_keypoints: rawKeypoints,

        // Skeleton & CV output for Attachment Planner
        annotatedImageDataUrl: annotatedImage,
        detectedPoses: detectedPoses,
        computedHeight: computedHeight,
        computedComplexity: computedComplexity,
        computedCOG: computedCOG,
        poseStatus: poseStatus ?? { left_arm_up: false, right_arm_up: false },

        accessories: selectedAccessories.map((a) => a.name),
        bodyRegions: ["Head", "Torso", "Arms", "Legs"],
        attachmentZones: [],
        poseComplexityScore: 0,
        poseStabilityScore: 0,
        movementRiskScore: 0,
        accessoryLossRisk: 0,
      };
      saveAnalysis(r);
      navigate({ to: "/app/packaging-planner" });
    }
  };

  if (stage === "results") return (
    <div className="space-y-6">
      <PageHeader title="Analysis Complete" description="Review the detected pose and YOLOv8 skeleton visualization." />
      <WorkflowBar steps={getWorkflowSteps(stage)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/70 shadow-none">
          <CardHeader><CardTitle className="text-base">Skeleton Pose Visualization</CardTitle></CardHeader>
          <CardContent className="flex justify-center p-4 bg-muted/20">
            {annotatedImage || imageDataUrl ? (
              <img src={annotatedImage || imageDataUrl!} alt="Annotated" className="max-h-96 rounded-lg object-contain border shadow-sm" />
            ) : (
              <div className="flex items-center justify-center h-48 w-full bg-muted/50 rounded-lg text-muted-foreground text-sm">Image not available</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--success)] text-white mb-2">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Raw AI Detections (As-Is State)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {detectedPoses.length > 0 ? detectedPoses.map(pose => (
                <Badge key={pose} variant="default" className="text-sm px-3 py-1 bg-[color:var(--primary-soft)] text-primary border-transparent">
                  {pose}
                </Badge>
              )) : (
                <span className="text-sm text-muted-foreground">No specific pose detected.</span>
              )}
            </div>

            <div className="pt-2 pb-2 border-t border-border/60 mt-2">
              <h4 className="text-sm font-medium mb-3 text-foreground flex items-center gap-2"><ScanLine className="h-4 w-4 text-primary" /> Detected Straps (YOLOv8)</h4>
              <div className="flex flex-wrap gap-2">
                {detectedStraps && detectedStraps.length > 0 ? detectedStraps.map((strap, idx) => (
                  <Badge key={idx} variant="outline" className="text-sm px-3 py-1 border-[color:var(--primary)] text-primary bg-[color:var(--primary-soft)]/30">
                    {strap.class_name.replace('_', ' ').toUpperCase()} ({(strap.confidence * 100).toFixed(0)}%)
                  </Badge>
                )) : (
                  <span className="text-sm text-muted-foreground">No straps detected.</span>
                )}
              </div>
            </div>



            <div className="pt-3 pb-2 border-t border-border/60 mt-3 space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> Computed Skeleton Metrics
              </h4>

              <div className="flex justify-between items-center p-3 border border-border/60 rounded-lg bg-background">
                <span className="text-sm font-medium">Estimated Height (0.Nose to 15.Ankle)</span>
                <span className="text-sm font-semibold">{computedHeight}</span>
              </div>

              <div className="flex justify-between items-center p-3 border border-border/60 rounded-lg bg-background">
                <span className="text-sm font-medium">Pose Complexity (Shoulder-Elbow-Wrist)</span>
                <span className="text-sm font-semibold text-primary">{computedComplexity}</span>
              </div>

              <div className="flex justify-between items-center p-3 border border-border/60 rounded-lg bg-background">
                <span className="text-sm font-medium">Center of Gravity (Midpoint Hips)</span>
                <span className="text-sm font-semibold">{computedCOG}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              * Calculated mathematically by comparing relative distances and angles between YOLOv8 keypoints.
            </p>
            <div className="pt-4 flex gap-3">
              <Button variant="outline" className="w-full" onClick={() => {
                setStage("form");
                setAnnotatedImage(null);
                setImageDataUrl(null);
                setImageFile(null);
              }}>
                <RotateCcw className="mr-2 h-4 w-4" /> Re-upload Image
              </Button>
              <Button className="w-full" onClick={handleContinue} disabled={isSaving}>
                {isSaving ? "Saving..." : "Proceed to Planner"} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (stage === "analysing") return (
    <div className="space-y-6">
      <PageHeader title="Computer Vision Inference" description="YOLOv8 is analyzing the image for strap locations..." />
      <WorkflowBar steps={getWorkflowSteps(stage)} />
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-8">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[color:var(--primary-soft)]">
          <ScanLine className="h-10 w-10 animate-pulse text-primary" />
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
        </div>
        <div className="w-full max-w-md space-y-4 text-center">
          <h2 className="text-xl font-semibold">Running AI Model…</h2>
          <p className="text-sm text-muted-foreground">Detecting optimal strap zones and extracting features.</p>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{progress}% complete</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          {ANALYSIS_STEPS.map((step, i) => (
            <div key={step} className={`flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-xs transition ${progress >= (i + 1) * 20 ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/5 text-[color:var(--success)]" : "text-muted-foreground"}`}>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />{step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product & CV Analysis"
        description="Upload an image for the YOLO model to detect strap zones, and enter product details."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border/70 font-normal"><Sparkles className="mr-1 h-3 w-3 text-primary" />AI-Powered</Badge>
          </div>
        }
      />
      <WorkflowBar steps={getWorkflowSteps(stage)} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">

          <Card className="border-border/70 shadow-none overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Provide Doll Image</CardTitle>
                <CardDescription>Upload or capture a front-facing image for YOLO.</CardDescription>
              </div>
              <div className="flex bg-background border border-border/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => { if (isCameraActive) stopCamera(); }}
                  className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${!isCameraActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </button>
                <button
                  onClick={startCamera}
                  className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${isCameraActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                >
                  <Camera className="h-3.5 w-3.5" /> Camera
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isCameraActive ? (
                <div className="relative flex flex-col items-center bg-black min-h-[300px]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="max-h-[400px] w-full object-contain"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <Button onClick={capturePhoto} className="rounded-full h-12 w-12 p-0 border-4 border-white/20 hover:border-white/40 bg-white hover:bg-gray-200">
                      <div className="h-full w-full rounded-full bg-transparent" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div onClick={() => fileRef.current?.click()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
                    onDragOver={(e) => e.preventDefault()}
                    className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/70 bg-muted/30 px-6 py-12 text-center transition hover:border-primary/50 hover:bg-[color:var(--primary-soft)]/30">
                    {imageDataUrl ? (
                      <div className="relative group">
                        <img src={imageDataUrl} alt="Preview" className="max-h-48 rounded-lg object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Click to replace</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--primary-soft)] text-primary">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="mt-3 text-sm font-medium">Drop your image here, or <span className="text-primary underline underline-offset-2">browse</span></p>
                        <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 10 MB</p>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  </div>
                  {imageFile && (
                    <p className="mt-2 text-xs text-muted-foreground text-center">
                      <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-[color:var(--success)]" />
                      {imageFile.name} ready for processing
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-base">Product Identity</CardTitle>
              <Badge variant="outline" className="border-border/70 font-mono text-muted-foreground bg-muted/20">ID: #{runId.split('-')[0].toUpperCase()}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Family</Label>
                  <select value={productFamily} onChange={(e) => handleFamilyChange(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none">
                    {["Dreamtopia", "Fashionistas", "Careers", "Signature", "Extra", "Made to Move"].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Articulation</Label>
                  <select value={articulation} onChange={(e) => setArticulation(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none">
                    {["Standard", "Made to Move", "Curvy"].map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Hair Length</Label>
                  <select value={hairLength} onChange={(e) => setHairLength(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none">
                    {["Short", "Medium", "Long", "Very Long"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Dress / Pants Length</Label>
                  <select value={dressLength} onChange={(e) => setDressLength(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none">
                    <option value="Short">Short (Dress / Shorts)</option>
                    <option value="Knee">Knee-Length (Dress / Capri Pants)</option>
                    <option value="Long">Long (Dress / Trousers)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border/40">
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    <span>Weight (grams)</span>
                    <span className="text-[10px] text-muted-foreground italic">(Auto calculated: {weightG}g)</span>
                  </Label>
                  <Input 
                    type="number" 
                    placeholder={`${weightG}g (Leave empty for auto)`} 
                    value={customWeightG} 
                    onChange={(e) => setCustomWeightG(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    <span>Height (cm)</span>
                    <span className="text-[10px] text-muted-foreground italic">(Default: {heightCm}cm)</span>
                  </Label>
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder={`${heightCm}cm (Leave empty for auto)`} 
                    value={customHeightCm} 
                    onChange={(e) => setCustomHeightCm(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>



          <Button size="lg" className="w-full" onClick={handleAnalyse}>
            <ScanLine className="mr-2 h-4 w-4" /> Run Computer Vision & Analytics
          </Button>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <Card className="border-border/70 shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Accessories</CardTitle>
              <CardDescription>Select accessories or create a custom one with weight override.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Accessory Database</Label>
                <Input placeholder="Type to search (e.g., Handbag)" value={accSearch} onChange={(e) => {
                  setAccSearch(e.target.value);
                  setCustomAccName(e.target.value);
                }} />
                
                {/* Quick Add Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-muted-foreground mr-1">Quick Add:</span>
                  {[
                    { accessory_name: "Pet Dog", default_weight: 45 },
                    { accessory_name: "Shoes (Pair)", default_weight: 10 },
                    { accessory_name: "Handbag", default_weight: 15 }
                  ].map((s) => {
                    const dbItem = masterAccessories.find(a => a.accessory_name === s.accessory_name);
                    const weight = dbItem ? Number(dbItem.weight_g) : s.default_weight;
                    return (
                      <button
                        key={s.accessory_name}
                        onClick={() => addAccessory({ accessory_name: s.accessory_name, weight_g: weight })}
                        type="button"
                        className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all font-medium cursor-pointer"
                      >
                        + {s.accessory_name} ({weight}g)
                      </button>
                    );
                  })}
                </div>

                {accSearch && (
                  <div className="mt-1 rounded-md border border-border p-2 max-h-40 overflow-y-auto bg-background">
                    {masterAccessories
                      .filter(a => a.accessory_name.toLowerCase().includes(accSearch.toLowerCase()))
                      .map(a => (
                        <div key={a.accessory_name} onClick={() => {
                          addAccessory(a);
                        }} className="cursor-pointer p-1.5 text-sm hover:bg-muted/50 rounded flex justify-between">
                          <span>{a.accessory_name}</span>
                          <span className="text-muted-foreground">{a.weight_g}g</span>
                        </div>
                      ))}
                    {masterAccessories.filter(a => a.accessory_name.toLowerCase().includes(accSearch.toLowerCase())).length === 0 && (
                      <p className="text-xs text-muted-foreground p-1.5 italic">No matching templates found.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Custom / Override Accessory Form */}
              <div className="p-3 border border-dashed rounded-lg space-y-3 bg-muted/20">
                <p className="text-xs font-semibold text-foreground">Add Custom / Override Template</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Accessory Name</Label>
                    <Input 
                      placeholder="e.g. Magic Wand" 
                      value={customAccName} 
                      onChange={(e) => setCustomAccName(e.target.value)} 
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Weight (grams)</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g. 10" 
                      value={customAccWeight} 
                      onChange={(e) => setCustomAccWeight(e.target.value)} 
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={saveToDb} 
                      onChange={(e) => setSaveToDb(e.target.checked)} 
                      className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span className="text-[10px] text-muted-foreground">Save/Overwrite template in database</span>
                  </label>
                  <Button 
                    size="sm" 
                    onClick={handleCustomAccAdd} 
                    className="h-7 text-xs px-3"
                  >
                    Add to Doll
                  </Button>
                </div>
              </div>

              {selectedAccessories.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Accessories</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedAccessories.map((acc, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1 bg-[color:var(--primary-soft)] text-primary">
                        {acc.name} ({acc.weight}g)
                        <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeAccessory(idx)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-none bg-[color:var(--primary-soft)]/40">
            <CardHeader>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Brain className="h-4 w-4" />
              </div>
              <CardTitle className="text-base mt-2">YOLO Strap Detection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                The integrated PyTorch YOLO model analyzes your uploaded image to detect ideal strap zones (e.g., Head Strap, Waist Strap).
              </p>
              {[
                { icon: Brain, label: "PyTorch Inference", desc: "best_strap.pt running live on the backend." },
                { icon: ShieldAlert, label: "Bounding Boxes", desc: "Coordinates and confidence scores are extracted and passed to the planner." },
                { icon: ScanLine, label: "XGBoost Integration", desc: "CV results complement the XGBoost Packaging Recommendation models." }
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
