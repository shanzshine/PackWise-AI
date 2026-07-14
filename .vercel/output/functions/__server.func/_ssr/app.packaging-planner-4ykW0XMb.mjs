import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { E as Image, V as ChevronRight, Z as ArrowLeft, g as ScanLine, q as Brain, u as Sparkles, z as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { n as PageHeader, t as Badge } from "./page-header-Dam7wNGy.mjs";
import { a as saveAnalysis, n as loadAnalysis, s as savePlan, t as DEMO_RESULT } from "./workflow-store-Hbw_5P2e.mjs";
import { t as Progress } from "./progress-DOIEKRJF.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { f as RadialBar, g as Tooltip, h as ResponsiveContainer, t as RadialBarChart } from "../_libs/recharts+[...].mjs";
import { t as ATTACHMENT_METHODS } from "./mock-data-C1Mmtqzt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.packaging-planner-4ykW0XMb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Maps YOLOv8 / COCO keypoint names to human-readable packaging zones.
* Only keypoints with confidence ≥ 0.4 are considered.
*/
var KEYPOINT_ZONE_MAP = {
	nose: {
		zone: "Head",
		bodyRegion: "Head / Hair",
		reason: "Head attachment prevents forward lean during transit"
	},
	left_eye: {
		zone: "Head",
		bodyRegion: "Head / Hair",
		reason: "Facial region — constraint prevents head rotation"
	},
	right_eye: {
		zone: "Head",
		bodyRegion: "Head / Hair",
		reason: "Facial region — constraint prevents head rotation"
	},
	left_ear: {
		zone: "Head",
		bodyRegion: "Head / Hair",
		reason: "Ear-level attachment point for lateral stability"
	},
	right_ear: {
		zone: "Head",
		bodyRegion: "Head / Hair",
		reason: "Ear-level attachment point for lateral stability"
	},
	left_shoulder: {
		zone: "Shoulder",
		bodyRegion: "Torso / Waist",
		reason: "Shoulder node is a primary torso stability point"
	},
	right_shoulder: {
		zone: "Shoulder",
		bodyRegion: "Torso / Waist",
		reason: "Shoulder node is a primary torso stability point"
	},
	left_elbow: {
		zone: "Left Elbow",
		bodyRegion: "Left Arm",
		reason: "Elbow bend creates displacement risk — restraint required"
	},
	right_elbow: {
		zone: "Right Elbow",
		bodyRegion: "Right Arm",
		reason: "Elbow bend creates displacement risk — restraint required"
	},
	left_wrist: {
		zone: "Left Wrist",
		bodyRegion: "Left Arm",
		reason: "Wrist is the highest movement-risk extremity point"
	},
	right_wrist: {
		zone: "Right Wrist",
		bodyRegion: "Right Arm",
		reason: "Wrist is the highest movement-risk extremity point"
	},
	left_hip: {
		zone: "Waist",
		bodyRegion: "Torso / Waist",
		reason: "Hip anchors the centre-of-mass — key stability zone"
	},
	right_hip: {
		zone: "Waist",
		bodyRegion: "Torso / Waist",
		reason: "Hip anchors the centre-of-mass — key stability zone"
	},
	left_knee: {
		zone: "Left Knee",
		bodyRegion: "Left Leg",
		reason: "Knee angle increases leg splay probability"
	},
	right_knee: {
		zone: "Right Knee",
		bodyRegion: "Right Leg",
		reason: "Knee angle increases leg splay probability"
	},
	left_ankle: {
		zone: "Left Ankle",
		bodyRegion: "Left Leg",
		reason: "Ankle / foot point is the lowest extremity anchor"
	},
	right_ankle: {
		zone: "Right Ankle",
		bodyRegion: "Right Leg",
		reason: "Ankle / foot point is the lowest extremity anchor"
	}
};
/** Fallback zones used when no skeleton data is provided */
var DEFAULT_ZONES = [
	{
		zone: "Head / Hair",
		bodyRegion: "Head / Hair",
		keypointSource: "heuristic",
		reason: "Head region always requires elastic or foam restraint to prevent forward lean"
	},
	{
		zone: "Waist",
		bodyRegion: "Torso / Waist",
		keypointSource: "heuristic",
		reason: "Waist is the centre-of-mass anchor — PET or EVA support recommended"
	},
	{
		zone: "Right Wrist",
		bodyRegion: "Right Arm",
		keypointSource: "heuristic",
		reason: "Distal limb extremities carry highest displacement risk"
	},
	{
		zone: "Left Ankle",
		bodyRegion: "Left Leg",
		keypointSource: "heuristic",
		reason: "Ankle zone anchors lower extremity during vertical shipping stress"
	}
];
/**
* Selects the optimal material based on weight and number of zones.
*
* Strategy:
*   ≥ 5 zones or ≥ 300 g  → Blister (complete containment)
*   ≥ 3 zones             → EVA Strap (balance between rigidity & cost)
*   1–2 zones, light      → Elastic Strap or Rubber Band
*   High-weight single    → PET Support
*/
function selectMaterial(weightGrams, zoneCount, complexPose) {
	if (weightGrams >= 400 || zoneCount >= 6) return "Blister";
	if (weightGrams >= 250 || zoneCount >= 4) return "Inner Tray";
	if (complexPose && zoneCount >= 3) return "EVA Strap";
	if (zoneCount >= 3) return "PET Support";
	if (weightGrams >= 150) return "EVA Strap";
	if (weightGrams >= 80) return "Elastic Strap";
	return "Rubber Band";
}
var TIME_RATES = {
	"Rubber Band": { rate: 2.5 },
	"Elastic Strap": { rate: 3 },
	"EVA Strap": { rate: 3.5 },
	"Blister": {
		flat: 15,
		rate: 0
	},
	"Inner Tray": {
		flat: 15,
		rate: 0
	},
	"PET Support": { rate: 3.8 },
	"Cardboard Support": { rate: 3.2 },
	"Fastener": { rate: 4 }
};
/**
* Recommends the minimum number of attachment points needed.
* Blister/tray = 1 (the tray itself), else 1 point per zone minimum.
*/
function recommendPoints(material, zoneCount) {
	if (material === "Blister" || material === "Inner Tray") return 1;
	return zoneCount + ([
		"EVA Strap",
		"PET Support",
		"Fastener"
	].includes(material) ? Math.min(2, Math.floor(zoneCount / 2)) : 0);
}
/**
* Detects overlapping limbs using bounding-box proximity on keypoints.
* If skeleton data is absent, falls back to the poseComplexityScore.
*/
function detectComplexPose(keypoints, poseComplexityScore) {
	if (keypoints && keypoints.length > 0) {
		const get = (name) => keypoints.find((k) => k.name === name);
		const lw = get("left_wrist"), rw = get("right_wrist");
		const lh = get("left_hip"), rh = get("right_hip");
		const le = get("left_elbow"), re = get("right_elbow");
		const lk = get("left_knee"), rk = get("right_knee");
		const proximity = (a, b, threshold = .08) => {
			if (!a || !b) return false;
			if ((a.confidence ?? 1) < .4 || (b.confidence ?? 1) < .4) return false;
			const dx = a.x - b.x, dy = a.y - b.y;
			return Math.sqrt(dx * dx + dy * dy) < threshold;
		};
		if (proximity(lw, rh) || proximity(rw, lh) || proximity(le, lk) || proximity(re, rk)) return true;
	}
	return poseComplexityScore >= 70;
}
/**
* Derives retention zones from skeleton keypoints.
* De-duplicates by bodyRegion (takes only the most-reliable keypoint).
*/
function extractZones(keypoints) {
	if (!keypoints || keypoints.length === 0) return DEFAULT_ZONES;
	const seen = /* @__PURE__ */ new Set();
	const zones = [];
	const sorted = [...keypoints].sort((a, b) => (b.confidence ?? 1) - (a.confidence ?? 1));
	for (const kp of sorted) {
		if ((kp.confidence ?? 1) < .4) continue;
		const mapping = KEYPOINT_ZONE_MAP[kp.name];
		if (!mapping || seen.has(mapping.bodyRegion)) continue;
		seen.add(mapping.bodyRegion);
		zones.push({
			zone: mapping.zone,
			bodyRegion: mapping.bodyRegion,
			keypointSource: kp.name,
			reason: mapping.reason
		});
	}
	return zones.length > 0 ? zones : DEFAULT_ZONES;
}
function runAssemblyEngine(input) {
	const { weightGrams, accessories, skeletonKeypoints, poseComplexityScore = 0 } = input;
	const zones = extractZones(skeletonKeypoints);
	const isComplexPose = detectComplexPose(skeletonKeypoints, poseComplexityScore);
	const material = selectMaterial(weightGrams, zones.length, isComplexPose);
	const attachmentPoints = recommendPoints(material, zones.length);
	const timing = TIME_RATES[material];
	let baseTime;
	if (timing.flat !== void 0) baseTime = timing.flat;
	else baseTime = timing.rate * attachmentPoints;
	const finalTime = parseFloat((baseTime * (isComplexPose ? 1.15 : 1)).toFixed(2));
	const breakdownParts = [];
	if (timing.flat !== void 0) breakdownParts.push(`${material} flat-rate = ${timing.flat}s`);
	else breakdownParts.push(`${material} @ ${timing.rate}s × ${attachmentPoints} points = ${(timing.rate * attachmentPoints).toFixed(1)}s`);
	if (isComplexPose) breakdownParts.push(`Complex pose penalty +15% → ×1.15`);
	breakdownParts.push(`Total = ${finalTime}s`);
	if (accessories.length > 0) breakdownParts.push(`Accessories noted (${accessories.join(", ")}) — add 2–4s/accessory for individual tying if loose`);
	return {
		retention_zones: zones,
		recommended_material: material,
		attachment_points: attachmentPoints,
		assembly_time_seconds: finalTime,
		is_complex_pose: isComplexPose,
		calculation_breakdown: breakdownParts.join(" | ")
	};
}
var WORKFLOW_STEPS = [
	{
		label: "Product Input",
		active: false
	},
	{
		label: "Analysis Results",
		active: false
	},
	{
		label: "Attachment Planner",
		active: true
	},
	{
		label: "Risk Assessment",
		active: false
	},
	{
		label: "Cost & Sustainability",
		active: false
	}
];
var radialData = [
	{
		name: "Pose Quality",
		value: 88,
		fill: "var(--color-chart-1)"
	},
	{
		name: "Drop Test",
		value: 84,
		fill: "var(--color-chart-2)"
	},
	{
		name: "Cost Score",
		value: 72,
		fill: "var(--color-chart-3)"
	},
	{
		name: "Sustain.",
		value: 80,
		fill: "var(--color-chart-4)"
	}
];
function WorkflowBar({ steps }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center rounded-xl border border-border/70 bg-muted/30 px-4 py-3",
		children: steps.map((s, i, arr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${s.active ? "bg-primary text-primary-foreground" : i < steps.findIndex((x) => x.active) ? "bg-[color:var(--success)] text-white" : "bg-muted text-muted-foreground"}`,
					children: i < steps.findIndex((x) => x.active) ? "✓" : i + 1
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `hidden text-[9px] font-medium sm:block ${s.active ? "text-primary" : "text-muted-foreground"}`,
					children: s.label
				})]
			}), i < arr.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `mx-1 h-px flex-1 ${i < steps.findIndex((x) => x.active) ? "bg-[color:var(--success)]" : s.active ? "bg-primary" : "bg-border"}` })]
		}, s.label))
	});
}
function YoloImageOverlay({ imageUrl, detections, threshold }) {
	const [imgNatural, setImgNatural] = (0, import_react.useState)({
		w: 1,
		h: 1
	});
	const [imgRendered, setImgRendered] = (0, import_react.useState)({
		w: 0,
		h: 0
	});
	const imgRef = (0, import_react.useRef)(null);
	const handleLoad = (e) => {
		const el = e.currentTarget;
		setImgNatural({
			w: el.naturalWidth,
			h: el.naturalHeight
		});
		setImgRendered({
			w: el.clientWidth,
			h: el.clientHeight
		});
	};
	const filteredDetections = detections.filter((d) => d.confidence >= threshold);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full h-full flex flex-col items-center justify-center p-4 gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative inline-block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				ref: imgRef,
				src: imageUrl,
				alt: "Doll YOLO",
				className: "max-h-[280px] max-w-full object-contain rounded drop-shadow-md block",
				onLoad: handleLoad
			}), imgRendered.w > 0 && filteredDetections.map((d, i) => {
				const { xmin, ymin, xmax, ymax } = d.box;
				const scaleX = imgRendered.w / imgNatural.w;
				const scaleY = imgRendered.h / imgNatural.h;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute border-2 border-primary bg-primary/15 pointer-events-none",
					style: {
						left: `${xmin * scaleX}px`,
						top: `${ymin * scaleY}px`,
						width: `${(xmax - xmin) * scaleX}px`,
						height: `${(ymax - ymin) * scaleY}px`
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute -top-[20px] left-0 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-t font-semibold whitespace-nowrap shadow-sm",
						children: [
							d.class_name,
							" ",
							Math.round(d.confidence * 100),
							"%"
						]
					})
				}, i);
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-2 text-xs",
			children: filteredDetections.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "bg-[color:var(--success)]/10 text-[color:var(--success)] border border-[color:var(--success)]/30 rounded-full px-2 py-0.5 font-semibold",
				children: [
					"✓ ",
					filteredDetections.length,
					" strap zone",
					filteredDetections.length > 1 ? "s" : "",
					" detected"
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "bg-muted/50 text-muted-foreground rounded-full px-2 py-0.5",
				children: "No straps detected in this image"
			})
		})]
	});
}
var METHOD_PROPS = {
	"Elastic Strap": {
		cost: .08,
		laborMins: .5,
		sustainability: 68,
		stability: 85,
		riskReduction: 62
	},
	"PET Support": {
		cost: .18,
		laborMins: 1.1,
		sustainability: 78,
		stability: 94,
		riskReduction: 81
	},
	"EVA Strap": {
		cost: .12,
		laborMins: .7,
		sustainability: 82,
		stability: 90,
		riskReduction: 74
	},
	"Cardboard Support": {
		cost: .15,
		laborMins: .8,
		sustainability: 90,
		stability: 95,
		riskReduction: 85
	},
	"No Attachment Required": {
		cost: 0,
		laborMins: 0,
		sustainability: 100,
		stability: 100,
		riskReduction: 0
	}
};
var YOLO_TO_ZONE = {
	"hair_strap": {
		zone: "Head/Hair",
		bodyRegion: "Head / Hair",
		xgbKey: "recommended_head_strap",
		defaultMethod: "Elastic Strap"
	},
	"neck_strap": {
		zone: "Neck",
		bodyRegion: "Neck",
		xgbKey: "recommended_head_strap",
		defaultMethod: "Elastic Strap"
	},
	"waist_strap": {
		zone: "Waist",
		bodyRegion: "Torso / Waist",
		xgbKey: "recommended_waist_strap",
		defaultMethod: "PET Support"
	},
	"wrist_strap": {
		zone: "Hands/Wrists",
		bodyRegion: "Right Arm",
		xgbKey: "recommended_hand_strap",
		defaultMethod: "EVA Strap"
	},
	"ankle_strap": {
		zone: "Legs/Feet",
		bodyRegion: "Left Leg",
		xgbKey: "recommended_leg_strap",
		defaultMethod: "Elastic Strap"
	}
};
function buildZonePlan(xgbData, detections, threshold) {
	const plan = [];
	const vizZones = [];
	const xgbMap = {
		recommended_head_strap: {
			zone: "Head/Hair",
			bodyRegion: "Head / Hair",
			method: "Elastic Strap"
		},
		recommended_waist_strap: {
			zone: "Waist",
			bodyRegion: "Torso / Waist",
			method: "PET Support"
		},
		recommended_hand_strap: {
			zone: "Hands/Wrists",
			bodyRegion: "Right Arm",
			method: "EVA Strap"
		},
		recommended_leg_strap: {
			zone: "Legs/Feet",
			bodyRegion: "Left Leg",
			method: "Elastic Strap"
		},
		recommended_back_support: {
			zone: "Back",
			bodyRegion: "Back",
			method: "Cardboard Support"
		},
		recommended_base_support: {
			zone: "Base",
			bodyRegion: "Base",
			method: "Cardboard Support"
		}
	};
	const cvDetectedZones = /* @__PURE__ */ new Map();
	for (const det of detections) {
		if (det.confidence < threshold) continue;
		const mapping = YOLO_TO_ZONE[det.class_name];
		if (mapping && !cvDetectedZones.has(mapping.zone)) cvDetectedZones.set(mapping.zone, {
			method: mapping.defaultMethod,
			bodyRegion: mapping.bodyRegion
		});
	}
	const processedZones = /* @__PURE__ */ new Set();
	for (const [key, meta] of Object.entries(xgbMap)) {
		const xgbRecommended = xgbData[key] === 1;
		const cvDetected = cvDetectedZones.has(meta.zone);
		processedZones.add(meta.zone);
		if (!xgbRecommended && !cvDetected) continue;
		const cvMethod = cvDetected ? cvDetectedZones.get(meta.zone)?.method ?? "Unknown" : "None";
		const aiMethod = xgbRecommended ? meta.method : "None";
		const finalMethod = xgbRecommended ? meta.method : cvMethod;
		const p = METHOD_PROPS[finalMethod] ?? METHOD_PROPS["No Attachment Required"];
		const laborLabel = p.laborMins === 0 ? "None" : p.laborMins < .7 ? "Low" : "Medium";
		const risk = finalMethod === "No Attachment Required" ? "low" : p.stability >= 92 ? "low" : p.stability >= 85 ? "medium" : "high";
		let action = "Keep";
		let reasoning = "";
		if (xgbRecommended && cvDetected) {
			action = "Keep";
			reasoning = "CV confirms attachment exists, AI agrees it is needed";
		} else if (xgbRecommended && !cvDetected) {
			action = "Add";
			reasoning = "AI recommends this attachment but CV did not detect it on current product — should be added";
		} else if (!xgbRecommended && cvDetected) {
			action = "Remove";
			reasoning = "CV detected this attachment on current product but AI says it is unnecessary — can be removed to save cost";
		}
		plan.push({
			zone: meta.zone,
			currentMethod: cvDetected ? cvMethod : "—",
			recommendedMethod: xgbRecommended ? aiMethod : "Not needed",
			action,
			cvDetected,
			xgbRecommended,
			cost: p.cost,
			laborMins: p.laborMins,
			laborLabel,
			sustainability: p.sustainability,
			stability: p.stability,
			riskReduction: p.riskReduction,
			reasoning
		});
		if (action !== "Remove") vizZones.push({
			zone: meta.bodyRegion.split("/")[0].trim(),
			bodyRegion: meta.bodyRegion,
			riskLevel: risk,
			recommendedMethod: finalMethod
		});
	}
	for (const [zone, cv] of cvDetectedZones) if (!processedZones.has(zone)) {
		const p = METHOD_PROPS[cv.method] ?? METHOD_PROPS["No Attachment Required"];
		const laborLabel = p.laborMins === 0 ? "None" : p.laborMins < .7 ? "Low" : "Medium";
		plan.push({
			zone,
			currentMethod: cv.method,
			recommendedMethod: "Not needed",
			action: "Remove",
			cvDetected: true,
			xgbRecommended: false,
			cost: p.cost,
			laborMins: p.laborMins,
			laborLabel,
			sustainability: p.sustainability,
			stability: p.stability,
			riskReduction: p.riskReduction,
			reasoning: "CV detected this but AI deems it unnecessary"
		});
	}
	if (plan.length === 0) plan.push({
		zone: "General",
		currentMethod: "—",
		recommendedMethod: "No Attachment Required",
		action: "Keep",
		cvDetected: false,
		xgbRecommended: false,
		cost: 0,
		laborMins: 0,
		laborLabel: "None",
		sustainability: 100,
		stability: 100,
		riskReduction: 0,
		reasoning: "No attachments needed"
	});
	return {
		plan,
		vizZones
	};
}
function AttachmentPlannerPage() {
	const navigate = useNavigate();
	const [analysis, setAnalysis] = (0, import_react.useState)(null);
	const [zonePlan, setZonePlan] = (0, import_react.useState)([]);
	const [recommendedMaterial, setRecommendedMaterial] = (0, import_react.useState)(null);
	const [threshold] = (0, import_react.useState)(.15);
	const [xgbData, setXgbData] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const a = loadAnalysis() ?? DEMO_RESULT;
		setAnalysis(a);
		async function fetchPredictions() {
			try {
				const data = await (await fetch("http://127.0.0.1:8000/api/predict-packaging", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						product_family: a.product_family ?? "Fashionistas",
						articulation: a.articulation ?? "Standard",
						pose: a.pose ?? "Arms Open",
						product_weight_g: a.product_weight_g ?? 120,
						height_cm: a.height_cm ?? 29,
						center_of_gravity: a.center_of_gravity ?? "Center",
						hair_length: a.hair_length ?? "Short",
						dress_length: a.dress_length ?? "Short",
						accessory_count: a.accessory_count ?? 1,
						accessory_weight_g: a.accessory_weight_g ?? 15,
						complexity_score: Math.round((a.poseComplexityScore ?? 50) / 10),
						stability_index: Math.round((a.poseStabilityScore ?? 50) / 10),
						fragility_score: 5,
						attachment_needed: 1,
						fragile_parts_count: Math.max(1, Math.floor((a.accessory_count ?? 1) / 2))
					})
				})).json();
				setXgbData(data);
				setRecommendedMaterial(data.recommended_material ?? null);
			} catch (err) {
				console.error("Failed to fetch predictions", err);
			}
		}
		fetchPredictions();
	}, []);
	(0, import_react.useEffect)(() => {
		if (xgbData && analysis) {
			const { plan: newPlan, vizZones: newAttachmentZones } = buildZonePlan(xgbData, analysis.cvDetections ?? [], threshold);
			setZonePlan(newPlan);
			saveAnalysis({
				...analysis,
				attachmentZones: newAttachmentZones
			});
			const active = newPlan.filter((z) => z.action !== "Remove" && z.recommendedMethod !== "Not needed");
			savePlan({
				zones: newPlan.map((z) => ({
					zone: z.zone,
					currentMethod: z.currentMethod,
					recommendedMethod: z.recommendedMethod,
					action: z.action,
					cvDetected: z.cvDetected,
					xgbRecommended: z.xgbRecommended,
					cost: z.cost,
					laborMins: z.laborMins,
					sustainability: z.sustainability,
					stability: z.stability,
					riskReduction: z.riskReduction
				})),
				totalCost: parseFloat(active.reduce((s, z) => s + z.cost, 0).toFixed(2)),
				avgStability: active.length > 0 ? Math.round(active.reduce((s, z) => s + z.stability, 0) / active.length) : 100,
				avgSustainability: active.length > 0 ? Math.round(active.reduce((s, z) => s + z.sustainability, 0) / active.length) : 100,
				recommendedMaterial
			});
		}
	}, [
		xgbData,
		analysis,
		threshold
	]);
	const productName = analysis?.productName ?? "Glamour Doll – Sparkle Edition";
	const assemblyResult = runAssemblyEngine({
		weightGrams: analysis?.product_weight_g ?? 120,
		accessories: analysis?.selected_accessories ?? [],
		skeletonKeypoints: analysis?.raw_keypoints ?? [],
		poseComplexityScore: analysis?.poseComplexityScore ?? 0
	});
	const activeZones = zonePlan.filter((z) => z.action !== "Remove" && z.recommendedMethod !== "No Attachment Required" && z.recommendedMethod !== "Not needed");
	const totalCost = activeZones.reduce((s, z) => s + z.cost, 0).toFixed(2);
	assemblyResult.assembly_time_seconds / 60;
	const avgStability = activeZones.length > 0 ? Math.round(activeZones.reduce((s, z) => s + z.stability, 0) / activeZones.length) : 100;
	const avgSustainability = activeZones.length > 0 ? Math.round(activeZones.reduce((s, z) => s + z.sustainability, 0) / activeZones.length) : 100;
	const keepCount = zonePlan.filter((z) => z.action === "Keep").length;
	const addCount = zonePlan.filter((z) => z.action === "Add").length;
	const removeCount = zonePlan.filter((z) => z.action === "Remove").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Attachment Planner",
				description: `AI-recommended attachment methods for each attachment zone — ${productName}`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => navigate({ to: "/app/product-analysis" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to Analysis"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => navigate({ to: "/app/risk-assessment" }),
					children: ["Proceed to Risk Assessment ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-2 h-4 w-4" })]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowBar, { steps: WORKFLOW_STEPS }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-1 border-border/70 shadow-none overflow-hidden flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "bg-muted/30 pb-4 border-b flex flex-row items-center justify-between space-y-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "text-base flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "h-4 w-4 text-primary" }), " YOLO Vision Detections"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-0 flex-1 flex flex-col items-center justify-center bg-zinc-950/5 relative min-h-[300px]",
						children: analysis?.imageDataUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoloImageOverlay, {
							imageUrl: analysis.imageDataUrl,
							detections: analysis.cvDetections || [],
							threshold
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-muted-foreground text-sm flex flex-col items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-8 w-8 opacity-20" }), "No image uploaded"]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "lg:col-span-2 border-[color:var(--primary)]/30 bg-gradient-to-br from-[color:var(--primary-soft)] to-[color:var(--primary-soft)]/20 shadow-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-6 h-full flex flex-col justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "bg-primary/20 text-primary border-primary/30 text-xs",
											children: "AI Recommended Plan"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-xl font-semibold",
										children: "Mixed Attachment Strategy"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted-foreground max-w-[300px]",
										children: [recommendedMaterial ? `Recommended Material: ${recommendedMaterial}. ` : "", "AI generated optimized plan for pose quality and sustainability balance."]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-6",
								children: [{
									label: "Avg. Pose Stability",
									value: `${avgStability}%`
								}, {
									label: "Total Cost / Unit",
									value: `$${totalCost}`
								}].map(({ label, value }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center bg-background/50 rounded-xl p-4 border border-border/50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-2xl font-bold text-foreground",
										children: value
									})]
								}, label))
							})]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-5",
				children: [
					{
						label: "Avg. Pose Stability",
						value: `${avgStability}%`,
						hint: `${activeZones.length} active attachment zones`
					},
					{
						label: "Total Cost / Unit",
						value: `$${totalCost}`,
						hint: removeCount > 0 ? `Saving possible by removing ${removeCount} zone(s)` : "All recommended materials"
					},
					{
						label: "Est. Assembly Time",
						value: `${assemblyResult.assembly_time_seconds}s`,
						hint: assemblyResult.is_complex_pose ? "+15% complex pose penalty applied" : "Calculated using DFA standards"
					},
					{
						label: "Action Summary",
						value: `${keepCount} Keep · ${addCount} Add · ${removeCount} Remove`,
						hint: `${zonePlan.length} zones analyzed`
					},
					{
						label: "Sustainability Score",
						value: `${avgSustainability}/100`,
						hint: "Weighted avg across recommended materials"
					}
				].map(({ label, value, hint }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border/70 shadow-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-2xl font-bold tracking-tight text-foreground",
								children: value
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: hint
							})
						]
					})
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between space-y-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Current vs AI Recommendation"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Comparing what CV detects on the current product vs what the 7 AI models recommend" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "border-border/70 text-xs font-normal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "mr-1 h-3 w-3" }), " AI + CV Analysis"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Zone" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-center",
						children: "Current (CV Detected)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-center",
						children: "AI Recommendation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-center",
						children: "Action"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Cost"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Stability"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Reasoning" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: zonePlan.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: z.action === "Keep" ? "bg-[color:var(--success)]/5" : z.action === "Add" ? "bg-blue-500/5" : z.action === "Remove" ? "bg-destructive/5" : "",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: z.zone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-center",
							children: z.cvDetected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								className: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-[color:var(--success)]/30 text-[10px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-1 h-2.5 w-2.5" }),
									" ",
									z.currentMethod
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground italic",
								children: "Not detected"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-center",
							children: z.xgbRecommended ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								className: "bg-primary/10 text-primary border-primary/30 text-[10px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "mr-1 h-2.5 w-2.5" }),
									" ",
									z.recommendedMethod
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground italic",
								children: "Not needed"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-center",
							children: [
								z.action === "Keep" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									className: "bg-[color:var(--success)] text-white border-0 font-semibold shadow-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-1 h-3 w-3" }), " Keep"]
								}),
								z.action === "Add" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "bg-blue-500 text-white border-0 font-semibold shadow-sm",
									children: "Add"
								}),
								z.action === "Remove" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "destructive",
									className: "font-semibold shadow-sm",
									children: "Remove"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right tabular-nums font-medium",
							children: z.cost === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "—"
							}) : `$${z.cost.toFixed(2)}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: z.stability > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
									value: z.stability,
									className: "h-1.5 w-12"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums text-xs",
									children: [z.stability, "%"]
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "—"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground leading-tight",
							children: z.reasoning
						}) })
					]
				}, z.zone)) })] }) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-base flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "h-4 w-4 text-primary" }), " How to Read This Comparison"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "The system compares what's currently on the product (CV) vs what AI recommends, then suggests an action" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "grid sm:grid-cols-3 gap-4 pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 rounded-lg border border-[color:var(--success)]/30 bg-[color:var(--success)]/5 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											className: "bg-[color:var(--success)] hover:bg-[color:var(--success)] text-white shadow-sm border-0 font-medium",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-1 h-3 w-3" }), " Keep"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold mt-1",
										children: "Current = Correct"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground leading-relaxed",
										children: [
											"CV detected this attachment on the current product, and the AI model confirms it ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "should be there" }),
											". No change needed."
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "bg-blue-500 hover:bg-blue-600 text-white border-0 font-medium shadow-sm",
											children: "Add"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold mt-1",
										children: "Missing Attachment"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground leading-relaxed",
										children: [
											"CV did ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "not" }),
											" detect this on the current product, but the AI model says it ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "should be added" }),
											" for safety/stability."
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "destructive",
											className: "font-medium shadow-sm",
											children: "Remove"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold mt-1",
										children: "Unnecessary Attachment"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground leading-relaxed",
										children: [
											"CV detected this attachment on the current product, but the AI model says it's ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "not necessary" }),
											". Removing it can save cost."
										]
									})
								]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Plan Score Breakdown"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Recommended plan evaluation across 4 dimensions" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-48",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RadialBarChart, {
								innerRadius: "25%",
								outerRadius: "100%",
								data: radialData,
								startAngle: 180,
								endAngle: 0,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadialBar, {
									dataKey: "value",
									background: { fill: "var(--color-muted)" }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									borderRadius: 8,
									border: "1px solid var(--color-border)",
									background: "var(--color-card)",
									fontSize: 12
								} })]
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 grid grid-cols-2 gap-2",
						children: radialData.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-2 w-2 rounded-full",
								style: { background: d.fill }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									d.name,
									": ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
										className: "text-foreground",
										children: [d.value, "%"]
									})
								]
							})]
						}, d.name))
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Attachment Method Comparison"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Compare Pose stability, risk reduction & sustainability across all available methods" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Method" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Material" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Cost/Unit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Sustainability"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Labor (min)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Pose Stability"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Risk Reduction"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: [...ATTACHMENT_METHODS].map((m) => {
					const isRec = [
						"Elastic Strap",
						"PET Support",
						"EVA Strap"
					].includes(m.method);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: isRec ? "bg-[color:var(--primary-soft)]/20" : "",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-medium",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [isRec && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1.5 w-1.5 rounded-full bg-primary" }), m.method]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-sm text-muted-foreground",
								children: m.material
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right tabular-nums",
								children: ["$", m.costPerUnit.toFixed(2)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-end gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
										value: m.sustainability,
										className: "h-1.5 w-12"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums text-xs",
										children: m.sustainability
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right tabular-nums text-sm",
								children: m.laborMins
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right tabular-nums font-medium",
								children: [m.poseStability, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-semibold text-[color:var(--success)]",
									children: [
										"-",
										m.riskReduction,
										"%"
									]
								})
							})
						]
					}, m.method);
				}) })] }) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/50 shadow-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center justify-between gap-4 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Proceed to Risk Assessment"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-muted-foreground",
						children: "Analyze potential packaging risks and mitigations based on the plan."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => navigate({ to: "/app/risk-assessment" }),
						className: "shrink-0",
						children: ["Risk Assessment ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-2 h-4 w-4" })]
					})]
				})
			})
		]
	});
}
//#endregion
export { AttachmentPlannerPage as component };
