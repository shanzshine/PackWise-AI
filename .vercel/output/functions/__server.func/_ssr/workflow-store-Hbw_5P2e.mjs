//#region node_modules/.nitro/vite/services/ssr/assets/workflow-store-Hbw_5P2e.js
/**
* Lightweight client-side store for the PackWise AI workflow.
* Persists the analysis result so that downstream pages (Attachment Planner,
* Attachment Visualizer, Risk Assessment, Cost & Sustainability) can read it.
*/
var KEY = "packwise_analysis";
var IMG_KEY = "packwise_image";
var DEMO_RESULT = {
	productName: "Glamour Doll – Sparkle Edition",
	category: "Collectible Doll",
	imageDataUrl: null,
	productType: "Collectible Doll",
	dimensions: "28 × 8 × 5 cm",
	analysedAt: (/* @__PURE__ */ new Date()).toISOString(),
	product_family: "Fashionistas",
	articulation: "Standard",
	pose: "Arms Open",
	product_weight_g: 120,
	height_cm: 29,
	center_of_gravity: "Center",
	hair_length: "Long",
	dress_length: "Short",
	accessory_count: 5,
	accessory_weight_g: 30,
	selected_accessories: [
		"Handbag",
		"Shoes",
		"Glasses",
		"Crown",
		"Dress Stand"
	],
	accessories: [
		"Handbag",
		"Shoes",
		"Glasses",
		"Crown",
		"Dress Stand"
	],
	bodyRegions: [
		"Head / Hair",
		"Torso / Waist",
		"Right Arm",
		"Left Arm",
		"Right Leg",
		"Left Leg"
	],
	attachmentZones: [
		{
			zone: "Hair",
			bodyRegion: "Head / Hair",
			riskLevel: "medium",
			recommendedMethod: "Elastic Strap"
		},
		{
			zone: "Waist",
			bodyRegion: "Torso / Waist",
			riskLevel: "low",
			recommendedMethod: "PET Support"
		},
		{
			zone: "Right Wrist",
			bodyRegion: "Right Arm",
			riskLevel: "high",
			recommendedMethod: "EVA Strap"
		},
		{
			zone: "Left Foot",
			bodyRegion: "Left Leg",
			riskLevel: "low",
			recommendedMethod: "No Attachment Required"
		}
	],
	poseComplexityScore: 82,
	poseStabilityScore: 76,
	movementRiskScore: 44,
	accessoryLossRisk: 61
};
function saveAnalysis(result) {
	try {
		if (result.imageDataUrl) sessionStorage.setItem(IMG_KEY, result.imageDataUrl);
		const { imageDataUrl, ...rest } = result;
		localStorage.setItem(KEY, JSON.stringify(rest));
	} catch (e) {
		console.warn("saveAnalysis failed", e);
	}
}
function loadAnalysis() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed.retentionZones && !parsed.attachmentZones) parsed.attachmentZones = parsed.retentionZones;
		if (!parsed.attachmentZones || !Array.isArray(parsed.attachmentZones)) return null;
		const img = sessionStorage.getItem(IMG_KEY);
		if (img) parsed.imageDataUrl = img;
		return parsed;
	} catch {
		return null;
	}
}
var PLAN_KEY = "packwise_plan";
function savePlan(plan) {
	try {
		localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
	} catch (e) {
		console.warn("savePlan failed", e);
	}
}
function loadPlan() {
	try {
		const raw = localStorage.getItem(PLAN_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
var APPROVALS_KEY = "packwise_approvals";
function saveApprovalRequest(req) {
	try {
		const existing = loadApprovalRequests();
		existing.unshift(req);
		localStorage.setItem(APPROVALS_KEY, JSON.stringify(existing));
	} catch (e) {
		console.warn("saveApprovalRequest failed", e);
	}
}
function loadApprovalRequests() {
	try {
		const raw = localStorage.getItem(APPROVALS_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
//#endregion
export { saveAnalysis as a, loadPlan as i, loadAnalysis as n, saveApprovalRequest as o, loadApprovalRequests as r, savePlan as s, DEMO_RESULT as t };
