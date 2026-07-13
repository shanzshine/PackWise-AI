import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { B as CircleCheck, J as Brain, K as Camera, a as Upload, f as ShieldAlert, g as ScanLine, n as X, u as Sparkles } from "../_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { n as PageHeader, t as Badge } from "./page-header-Dam7wNGy.mjs";
import { r as saveAnalysis } from "./workflow-store-BXv3B_km.mjs";
import { t as Progress } from "./progress-DOIEKRJF.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.product-analysis-imKST9gT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WORKFLOW_STEPS = [
	{
		label: "Pose & Doll Analysis",
		active: true
	},
	{
		label: "Attachment Planner",
		active: false
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
var ANALYSIS_STEPS = [
	"Detecting doll body regions",
	"Mapping strap zones via YOLO",
	"Identifying accessories",
	"Extracting engineering features"
];
function WorkflowBar({ steps }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center rounded-xl border border-border/70 bg-muted/30 px-4 py-3",
		children: steps.map((s, i, arr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${s.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`,
					children: i + 1
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `hidden text-[9px] font-medium sm:block ${s.active ? "text-primary" : "text-muted-foreground"}`,
					children: s.label
				})]
			}), i < arr.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `mx-1 h-px flex-1 ${s.active ? "bg-primary" : "bg-border"}` })]
		}, s.label))
	});
}
function ProductAnalysisPage() {
	const navigate = useNavigate();
	const fileRef = (0, import_react.useRef)(null);
	const [stage, setStage] = (0, import_react.useState)("form");
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [imageFile, setImageFile] = (0, import_react.useState)(null);
	const [imageDataUrl, setImageDataUrl] = (0, import_react.useState)(null);
	const [isCameraActive, setIsCameraActive] = (0, import_react.useState)(false);
	const videoRef = (0, import_react.useRef)(null);
	const [productFamilies, setProductFamilies] = (0, import_react.useState)([]);
	const [masterAccessories, setMasterAccessories] = (0, import_react.useState)([]);
	const [productFamily, setProductFamily] = (0, import_react.useState)("");
	const [articulation, setArticulation] = (0, import_react.useState)("");
	const [pose, setPose] = (0, import_react.useState)("Arms Open");
	const [hairLength, setHairLength] = (0, import_react.useState)("Short");
	const [dressLength, setDressLength] = (0, import_react.useState)("Short");
	const [centerOfGravity, setCenterOfGravity] = (0, import_react.useState)("Center");
	const [heightCm, setHeightCm] = (0, import_react.useState)(29);
	const [weightG, setWeightG] = (0, import_react.useState)(120);
	const [selectedAccessories, setSelectedAccessories] = (0, import_react.useState)([]);
	const [accSearch, setAccSearch] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		async function loadMasterData() {
			try {
				const pfRes = await fetch("http://127.0.0.1:8000/api/product-families");
				const accRes = await fetch("http://127.0.0.1:8000/api/accessories");
				if (pfRes.ok) {
					const pfData = await pfRes.json();
					setProductFamilies(pfData);
					if (pfData.length > 0) handleFamilyChange(pfData[0].product_family, pfData);
				}
				if (accRes.ok) setMasterAccessories(await accRes.json());
			} catch (e) {
				console.error("Failed to load master data", e);
			}
		}
		loadMasterData();
	}, []);
	const handleFile = (f) => {
		setImageFile(f);
		const reader = new FileReader();
		reader.onload = (ev) => setImageDataUrl(ev.target?.result);
		reader.readAsDataURL(f);
	};
	const startCamera = async () => {
		setIsCameraActive(true);
		setImageDataUrl(null);
		setImageFile(null);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
			if (videoRef.current) videoRef.current.srcObject = stream;
		} catch (e) {
			console.error("Camera access failed", e);
		}
	};
	const stopCamera = () => {
		if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
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
				if (blob) handleFile(new File([blob], "camera_capture.jpg", { type: "image/jpeg" }));
			}, "image/jpeg");
		}
		stopCamera();
	};
	const handleFamilyChange = (fam, familiesData = productFamilies) => {
		setProductFamily(fam);
		const details = familiesData.find((f) => f.product_family === fam);
		if (details) {
			setArticulation(details.articulation || "Standard");
			setHeightCm(details.default_height_cm || 29);
			setWeightG(details.default_weight_max || 120);
			if (details.center_of_gravity) setCenterOfGravity(details.center_of_gravity);
		}
	};
	const addAccessory = (acc) => {
		setSelectedAccessories([...selectedAccessories, {
			name: acc.accessory_name,
			weight: acc.weight_g
		}]);
		setAccSearch("");
	};
	const removeAccessory = (idx) => {
		setSelectedAccessories(selectedAccessories.filter((_, i) => i !== idx));
	};
	const loadDemo = () => {
		handleFamilyChange("Fashionistas", productFamilies);
		setHairLength("Long");
		setDressLength("Short");
		setSelectedAccessories([{
			name: "Handbag",
			weight: 8
		}, {
			name: "Shoes",
			weight: 15
		}]);
	};
	const handleAnalyse = async () => {
		setStage("analysing");
		setProgress(0);
		[
			15,
			32,
			50,
			66,
			82,
			100
		].forEach((p, i) => setTimeout(() => setProgress(p), (i + 1) * 700));
		let detections = [];
		if (imageFile) try {
			const formData = new FormData();
			formData.append("file", imageFile);
			const res = await fetch("http://127.0.0.1:8000/api/analyze-image", {
				method: "POST",
				body: formData
			});
			if (res.ok) {
				const cvData = await res.json();
				if (cvData.detections) {
					detections = cvData.detections;
					console.log("YOLO Strap Detections:", detections);
				}
			}
		} catch (e) {
			console.error("YOLO CV failed", e);
		}
		setTimeout(() => {
			saveAnalysis({
				productName: `${productFamily} Doll`,
				category: "Fashion Doll",
				imageDataUrl,
				productType: "Doll",
				dimensions: `${heightCm}cm`,
				analysedAt: (/* @__PURE__ */ new Date()).toISOString(),
				product_family: productFamily,
				articulation,
				pose,
				product_weight_g: weightG,
				height_cm: heightCm,
				center_of_gravity: centerOfGravity,
				hair_length: hairLength,
				dress_length: dressLength,
				accessory_count: selectedAccessories.length,
				accessory_weight_g: selectedAccessories.reduce((acc, curr) => acc + curr.weight, 0),
				selected_accessories: selectedAccessories.map((a) => a.name),
				cvDetections: detections,
				accessories: selectedAccessories.map((a) => a.name),
				bodyRegions: [
					"Head",
					"Torso",
					"Arms",
					"Legs"
				],
				attachmentZones: [],
				poseComplexityScore: 0,
				poseStabilityScore: 0,
				movementRiskScore: 0,
				accessoryLossRisk: 0
			});
			navigate({ to: "/app/packaging-planner" });
		}, 4500);
	};
	if (stage === "analysing") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Computer Vision Inference",
				description: "YOLOv8 is analyzing the image for strap locations..."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowBar, { steps: WORKFLOW_STEPS }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-[55vh] flex-col items-center justify-center gap-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex h-24 w-24 items-center justify-center rounded-full bg-[color:var(--primary-soft)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "h-10 w-10 animate-pulse text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 animate-ping rounded-full bg-primary/10" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full max-w-md space-y-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xl font-semibold",
								children: "Running PyTorch Model…"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Detecting optimal strap zones and extracting features."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: progress,
								className: "h-2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [progress, "% complete"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-3 sm:grid-cols-2",
						children: ANALYSIS_STEPS.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-xs transition ${progress >= (i + 1) * 20 ? "border-[color:var(--success)]/40 bg-[color:var(--success)]/5 text-[color:var(--success)]" : "text-muted-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 shrink-0" }), step]
						}, step))
					})
				]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Product & CV Analysis",
				description: "Upload an image for the YOLO model to detect strap zones, and enter product details.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: loadDemo,
						children: "Load Demo Product"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "outline",
						className: "border-border/70 font-normal",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-1 h-3 w-3 text-primary" }), "AI-Powered"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowBar, { steps: WORKFLOW_STEPS }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 lg:col-span-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-border/70 shadow-none overflow-hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "bg-muted/30 pb-4 border-b flex flex-row items-center justify-between space-y-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base",
									children: "Provide Doll Image"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Upload or capture a front-facing image for YOLO." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex bg-background border border-border/50 rounded-lg overflow-hidden",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => {
											if (isCameraActive) stopCamera();
										},
										className: `px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${!isCameraActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5" }), " Upload"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: startCamera,
										className: `px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 ${isCameraActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "h-3.5 w-3.5" }), " Camera"]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-0",
								children: isCameraActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex flex-col items-center bg-black min-h-[300px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
										ref: videoRef,
										autoPlay: true,
										playsInline: true,
										className: "max-h-[400px] w-full object-contain"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute bottom-4 left-0 right-0 flex justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											onClick: capturePhoto,
											className: "rounded-full h-12 w-12 p-0 border-4 border-white/20 hover:border-white/40 bg-white hover:bg-gray-200",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-full rounded-full bg-transparent" })
										})
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										onClick: () => fileRef.current?.click(),
										onDrop: (e) => {
											e.preventDefault();
											const f = e.dataTransfer.files?.[0];
											if (f?.type.startsWith("image/")) handleFile(f);
										},
										onDragOver: (e) => e.preventDefault(),
										className: "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/70 bg-muted/30 px-6 py-12 text-center transition hover:border-primary/50 hover:bg-[color:var(--primary-soft)]/30",
										children: [imageDataUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative group",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: imageDataUrl,
												alt: "Preview",
												className: "max-h-48 rounded-lg object-contain"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-white text-xs font-medium",
													children: "Click to replace"
												})
											})]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--primary-soft)] text-primary",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-6 w-6" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-3 text-sm font-medium",
												children: ["Drop your image here, or ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-primary underline underline-offset-2",
													children: "browse"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: "PNG, JPG up to 10 MB"
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: fileRef,
											type: "file",
											accept: "image/*",
											className: "hidden",
											onChange: (e) => {
												const f = e.target.files?.[0];
												if (f) handleFile(f);
											}
										})]
									}), imageFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-muted-foreground text-center",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-1 inline h-3.5 w-3.5 text-[color:var(--success)]" }),
											imageFile.name,
											" ready for processing"
										]
									})]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-border/70 shadow-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Product Identity"
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Product Family" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: productFamily,
											onChange: (e) => handleFamilyChange(e.target.value),
											className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none",
											children: productFamilies.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: f.product_family,
												children: f.product_family
											}, f.product_family))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Articulation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											value: articulation,
											onChange: (e) => setArticulation(e.target.value),
											className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none",
											children: Array.from(new Set(productFamilies.map((f) => f.articulation))).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: a,
												children: a
											}, a))
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Hair Length" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: hairLength,
												onChange: (e) => setHairLength(e.target.value),
												className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none",
												children: [
													"Short",
													"Medium",
													"Long",
													"Very Long"
												].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: c,
													children: c
												}, c))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Dress Length" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: dressLength,
												onChange: (e) => setDressLength(e.target.value),
												className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none",
												children: [
													"Short",
													"Knee",
													"Long"
												].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: c,
													children: c
												}, c))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Center of Gravity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
												value: centerOfGravity,
												onChange: (e) => setCenterOfGravity(e.target.value),
												className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none",
												children: [
													"Center",
													"Back",
													"Left"
												].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: c,
													children: c
												}, c))
											})]
										})
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-border/70 shadow-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Accessories"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Select accessories to include. Weight and count will be calculated automatically." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Search Accessory Database" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Type to search (e.g., Handbag)",
											value: accSearch,
											onChange: (e) => setAccSearch(e.target.value)
										}),
										accSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 rounded-md border border-border p-2 max-h-40 overflow-y-auto",
											children: masterAccessories.filter((a) => a.accessory_name.toLowerCase().includes(accSearch.toLowerCase())).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												onClick: () => addAccessory(a),
												className: "cursor-pointer p-1.5 text-sm hover:bg-muted/50 rounded flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: a.accessory_name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-muted-foreground",
													children: [a.weight_g, "g"]
												})]
											}, a.accessory_name))
										})
									]
								}), selectedAccessories.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Selected Accessories" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2",
										children: selectedAccessories.map((acc, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "secondary",
											className: "flex items-center gap-1 bg-[color:var(--primary-soft)] text-primary",
											children: [
												acc.name,
												" (",
												acc.weight,
												"g)",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
													className: "h-3 w-3 cursor-pointer hover:text-destructive",
													onClick: () => removeAccessory(idx)
												})
											]
										}, idx))
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							className: "w-full",
							onClick: handleAnalyse,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanLine, { className: "mr-2 h-4 w-4" }), " Run Computer Vision & Analytics"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4 lg:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border/70 shadow-none bg-[color:var(--primary-soft)]/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base mt-2",
							children: "YOLO Strap Detection"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "The integrated PyTorch YOLO model analyzes your uploaded image to detect ideal strap zones (e.g., Head Strap, Waist Strap)."
							}), [
								{
									icon: Brain,
									label: "PyTorch Inference",
									desc: "best_strap.pt running live on the backend."
								},
								{
									icon: ShieldAlert,
									label: "Bounding Boxes",
									desc: "Coordinates and confidence scores are extracted and passed to the planner."
								},
								{
									icon: ScanLine,
									label: "XGBoost Integration",
									desc: "CV results complement the XGBoost Packaging Recommendation models."
								}
							].map(({ icon: Icon, label, desc }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: desc
								})] })]
							}, label))]
						})]
					})
				})]
			})
		]
	});
}
//#endregion
export { ProductAnalysisPage as component };
