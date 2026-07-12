import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { B as CircleCheck, D as Image, H as ChevronRight, J as Brain, N as Eye, Q as ArrowLeft, g as ScanLine, u as Sparkles } from "../_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { n as PageHeader, t as Badge } from "./page-header-Dam7wNGy.mjs";
import { n as loadAnalysis, r as saveAnalysis, t as DEMO_RESULT } from "./workflow-store-BXv3B_km.mjs";
import { f as RadialBar, g as Tooltip, h as ResponsiveContainer, t as RadialBarChart } from "../_libs/recharts+[...].mjs";
import { t as Progress } from "./progress-DOIEKRJF.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { t as ATTACHMENT_METHODS } from "./mock-data-CDSDiqKg.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/radix-ui__react-slider.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.packaging-planner-BMozbaaz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Slider = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
	ref,
	className: cn("relative flex w-full touch-none select-none items-center", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
		className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })]
}));
Slider.displayName = Slider$1.displayName;
var WORKFLOW_STEPS = [
	{
		label: "Pose & Doll Analysis",
		active: false
	},
	{
		label: "Attachment Planner",
		active: true
	},
	{
		label: "Attachment Visualizer",
		active: false
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
	const addedZones = /* @__PURE__ */ new Set();
	const plan = [];
	const vizZones = [];
	const mkRow = (zone, bodyRegion, method, source) => {
		const p = METHOD_PROPS[method] ?? METHOD_PROPS["No Attachment Required"];
		const laborLabel = p.laborMins === 0 ? "None" : p.laborMins < .7 ? "Low" : "Medium";
		const risk = method === "No Attachment Required" ? "low" : p.stability >= 92 ? "low" : p.stability >= 85 ? "medium" : "high";
		return {
			plan: {
				zone,
				method,
				cost: p.cost,
				laborMins: p.laborMins,
				laborLabel,
				sustainability: p.sustainability,
				stability: p.stability,
				riskReduction: p.riskReduction,
				source
			},
			viz: {
				zone: bodyRegion.split("/")[0].trim(),
				bodyRegion,
				riskLevel: risk,
				recommendedMethod: method
			}
		};
	};
	for (const [key, meta] of Object.entries({
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
	})) if (xgbData[key] === 1 && !addedZones.has(meta.zone)) {
		const { plan: r, viz: v } = mkRow(meta.zone, meta.bodyRegion, meta.method, "xgb");
		plan.push(r);
		vizZones.push(v);
		addedZones.add(meta.zone);
	}
	for (const det of detections) {
		const mapping = YOLO_TO_ZONE[det.class_name];
		if (!mapping) continue;
		if (addedZones.has(mapping.zone)) {
			const existing = plan.find((p) => p.zone === mapping.zone);
			if (existing) existing.source = "both";
		} else if (det.confidence >= threshold) {
			const { plan: r, viz: v } = mkRow(mapping.zone, mapping.bodyRegion, mapping.defaultMethod, "yolo");
			plan.push(r);
			vizZones.push(v);
			addedZones.add(mapping.zone);
		}
	}
	if (plan.length === 0) {
		const { plan: r } = mkRow("General", "General", "No Attachment Required", "xgb");
		plan.push(r);
	}
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
	const [threshold, setThreshold] = (0, import_react.useState)(.15);
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
						selected_accessories: a.selected_accessories ?? []
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
		}
	}, [
		xgbData,
		analysis,
		threshold
	]);
	const productName = analysis?.productName ?? "Glamour Doll – Sparkle Edition";
	const activeZones = zonePlan.filter((z) => z.method !== "No Attachment Required");
	const totalCost = zonePlan.reduce((s, z) => s + z.cost, 0).toFixed(2);
	const totalLaborMins = zonePlan.reduce((s, z) => s + z.laborMins, 0);
	const avgStability = activeZones.length > 0 ? Math.round(activeZones.reduce((s, z) => s + z.stability, 0) / activeZones.length) : 100;
	const avgSustainability = activeZones.length > 0 ? Math.round(activeZones.reduce((s, z) => s + z.sustainability, 0) / activeZones.length) : 100;
	zonePlan.filter((z) => z.source === "both").length;
	zonePlan.filter((z) => z.source === "yolo").length;
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
					onClick: () => navigate({ to: "/app/packaging-preview" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" }), " View Visualizer"]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowBar, { steps: WORKFLOW_STEPS }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "lg:col-span-1 border-border/70 shadow-none overflow-hidden flex flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "bg-muted/30 pb-4 border-b flex flex-row items-center justify-between space-y-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-base flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "h-4 w-4 text-primary" }), " YOLO Vision Detections"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-0 flex-1 flex flex-col items-center justify-center bg-zinc-950/5 relative min-h-[300px]",
							children: analysis?.imageDataUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YoloImageOverlay, {
								imageUrl: analysis.imageDataUrl,
								detections: analysis.cvDetections || [],
								threshold
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-muted-foreground text-sm flex flex-col items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-8 w-8 opacity-20" }), "No image uploaded"]
							})
						}),
						analysis?.imageDataUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 border-t border-border/50 bg-background/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-medium text-muted-foreground",
									children: "Confidence Threshold"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-semibold",
									children: [Math.round(threshold * 100), "%"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
								value: [threshold],
								onValueChange: ([val]) => setThreshold(val),
								max: 1,
								step: .05,
								className: "w-full"
							})]
						})
					]
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
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					{
						label: "Avg. Pose Stability",
						value: `${avgStability}%`,
						hint: `${activeZones.length} active attachment zones`
					},
					{
						label: "Total Cost / Unit",
						value: `$${totalCost}`,
						hint: "All attachment materials combined"
					},
					{
						label: "Est. Labor Time",
						value: `${totalLaborMins.toFixed(1)} min`,
						hint: "Per unit on production line"
					},
					{
						label: "Sustainability Score",
						value: `${avgSustainability}/100`,
						hint: "Weighted avg across materials"
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
						children: "Zone-by-Zone Attachment Plan"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "AI-assigned attachment method for each identified attachment zone" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "border-border/70 text-xs font-normal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "mr-1 h-3 w-3" }), " AI Generated"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Zone" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Method" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Cost/Unit"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Labor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Sustainability"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Pose Stability"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Risk Reduction"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: zonePlan.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: z.source === "both" ? "bg-[color:var(--success)]/5" : z.source === "yolo" ? "bg-[color:var(--warning)]/5" : "",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									z.zone,
									z.source === "both" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[9px] bg-[color:var(--success)]/15 text-[color:var(--success)] px-1.5 py-0.5 rounded-full font-semibold",
										children: "XGB+CV"
									}),
									z.source === "yolo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[9px] bg-amber-500/15 text-amber-600 px-1.5 py-0.5 rounded-full font-semibold",
										children: "CV Only"
									}),
									z.source === "xgb" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[9px] bg-blue-500/15 text-blue-500 px-1.5 py-0.5 rounded-full font-semibold",
										children: "AI Only"
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-2",
							children: z.method === "No Attachment Required" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm text-muted-foreground italic",
								children: z.method
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								className: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent text-[10px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-1 h-2.5 w-2.5" }), " Recommended"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: z.method
							})] })
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right tabular-nums font-medium",
							children: z.cost === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "—"
							}) : `$${z.cost.toFixed(2)}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: `text-[10px] font-normal border-border/70 ${z.laborLabel === "None" ? "text-muted-foreground" : ""}`,
								children: z.laborMins > 0 ? `${z.laborMins} min` : "—"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
									value: z.sustainability,
									className: "h-1.5 w-12"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-xs",
									children: z.sustainability
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-end gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
									value: z.stability,
									className: "h-1.5 w-12"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums text-xs",
									children: [z.stability, "%"]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right",
							children: z.riskReduction > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-semibold text-[color:var(--success)]",
								children: [
									"-",
									z.riskReduction,
									"%"
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "—"
							})
						})
					]
				}, z.zone)) })] }) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-base flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "h-4 w-4 text-primary" }), " Recommendation Logic"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Understanding how AI (XGBoost) and Computer Vision (YOLO) merge to create the plan" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "grid sm:grid-cols-3 gap-4 pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 rounded-lg border border-[color:var(--success)]/30 bg-[color:var(--success)]/5 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "bg-[color:var(--success)] hover:bg-[color:var(--success)] text-white shadow-sm border-0 font-medium",
											children: "XGB+CV"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold mt-1",
										children: "High Confidence"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground leading-relaxed",
										children: "Both the Engineering AI (XGBoost) and the Vision Model (YOLO) independently recommended this attachment zone."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "bg-blue-500/10 text-blue-600 border-blue-200 font-medium",
											children: "AI Only"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold mt-1",
										children: "Engineering Driven"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground leading-relaxed",
										children: "XGBoost determined this is necessary based on doll weight/pose, but YOLO did not see it (possibly occluded in photo)."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 rounded-lg border border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "bg-[color:var(--warning)]/20 text-[color:var(--warning-foreground)] border-[color:var(--warning)]/30 font-medium",
											children: "CV Only"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold mt-1",
										children: "Vision Detected"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground leading-relaxed",
										children: "YOLO detected a strap here, but XGBoost deems it optional based on specs. Added for safety."
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
						children: "View the attachment layout visualization"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-muted-foreground",
						children: "See attachment markers, zone details, and inside-box placement diagram."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => navigate({ to: "/app/packaging-preview" }),
						className: "shrink-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" }),
							" Attachment Visualizer ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
						]
					})]
				})
			})
		]
	});
}
//#endregion
export { AttachmentPlannerPage as component };
