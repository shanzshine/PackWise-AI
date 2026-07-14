import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { F as DollarSign, V as ChevronRight, Z as ArrowLeft, f as ShieldAlert, o as TriangleAlert, q as Brain, z as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { n as PageHeader, t as Badge } from "./page-header-Dam7wNGy.mjs";
import { n as loadAnalysis, t as DEMO_RESULT } from "./workflow-store-Hbw_5P2e.mjs";
import { d as Bar, g as Tooltip, h as ResponsiveContainer, i as BarChart, o as YAxis, s as XAxis, u as CartesianGrid } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.risk-assessment-CCu5eK5o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WORKFLOW_STEPS = [
	{
		label: "Product Input",
		done: true
	},
	{
		label: "Analysis Results",
		done: true
	},
	{
		label: "Attachment Planner",
		done: true
	},
	{
		label: "Risk Assessment",
		active: true
	},
	{
		label: "Cost & Sustainability",
		done: false
	}
];
var BODY_REGION_RISKS = [
	{
		region: "Right Arm / Wrist",
		riskScore: 78,
		level: "high"
	},
	{
		region: "Head / Hair",
		riskScore: 54,
		level: "medium"
	},
	{
		region: "Left Leg / Foot",
		riskScore: 22,
		level: "low"
	},
	{
		region: "Torso / Waist",
		riskScore: 31,
		level: "low"
	},
	{
		region: "Left Arm",
		riskScore: 19,
		level: "low"
	},
	{
		region: "Right Leg",
		riskScore: 14,
		level: "low"
	}
];
var ACCESSORY_RISKS = [
	{
		accessory: "Glasses",
		lossRisk: 81,
		level: "high"
	},
	{
		accessory: "Handbag",
		lossRisk: 62,
		level: "medium"
	},
	{
		accessory: "Crown",
		lossRisk: 44,
		level: "medium"
	},
	{
		accessory: "Shoes",
		lossRisk: 18,
		level: "low"
	},
	{
		accessory: "Dress Stand",
		lossRisk: 12,
		level: "low"
	}
];
var DROP_TEST_DATA = [
	{
		plan: "Current Plan",
		passRate: 87
	},
	{
		plan: "Alt. Plan A",
		passRate: 78
	},
	{
		plan: "Alt. Plan B",
		passRate: 93
	},
	{
		plan: "No Attachment",
		passRate: 31
	}
];
var AI_SUGGESTIONS = [
	{
		level: "high",
		text: "Add EVA strap at Right Wrist — reduces movement risk by 34%, from High → Low.",
		impact: "-34% movement risk"
	},
	{
		level: "medium",
		text: "Replace Rubber Band at Glasses accessory with Blister Support — loss risk drops from 81% → 22%.",
		impact: "-59% loss risk"
	},
	{
		level: "low",
		text: "Waist PET Support is performing optimally — no change recommended.",
		impact: "Stable"
	},
	{
		level: "medium",
		text: "Consider adding Crown accessory to dedicated compartment — reduces loss risk from 44% → 8%.",
		impact: "-36% loss risk"
	}
];
var RISK_BADGE = {
	low: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
	medium: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent",
	high: "bg-destructive/10 text-destructive border-transparent"
};
var RISK_BAR = {
	low: "bg-[color:var(--success)]",
	medium: "bg-[color:var(--warning)]",
	high: "bg-destructive"
};
var RISK_DOT = {
	low: "bg-[color:var(--success)]",
	medium: "bg-[color:var(--warning)]",
	high: "bg-destructive"
};
function WorkflowBar() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center rounded-xl border border-border/70 bg-muted/30 px-4 py-3",
		children: WORKFLOW_STEPS.map((s, i, arr) => {
			const isActive = "active" in s && s.active;
			const isDone = "done" in s && s.done;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${isActive ? "bg-primary text-primary-foreground" : isDone ? "bg-[color:var(--success)] text-white" : "bg-muted text-muted-foreground"}`,
						children: isDone ? "✓" : i + 1
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `hidden text-[9px] font-medium sm:block ${isActive ? "text-primary" : isDone ? "text-[color:var(--success)]" : "text-muted-foreground"}`,
						children: s.label
					})]
				}), i < arr.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `mx-1 h-px flex-1 ${isDone ? "bg-[color:var(--success)]" : "bg-border"}` })]
			}, s.label);
		})
	});
}
function RiskAssessmentPage() {
	const navigate = useNavigate();
	const [productName, setProductName] = (0, import_react.useState)("Glamour Doll – Sparkle Edition");
	(0, import_react.useEffect)(() => {
		setProductName((loadAnalysis() ?? DEMO_RESULT).productName);
	}, []);
	const movementRisk = 44;
	const accessoryLoss = 61;
	const poseStability = 76;
	const dropTestPass = 87;
	const overallGrade = "B+";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Risk Assessment",
				description: `Predictive movement, accessory loss, and drop-test analysis — ${productName}`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => navigate({ to: "/app/packaging-planner" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to Planner"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => navigate({ to: "/app/cost-analysis" }),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" }),
						" Cost & Sustainability ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
					]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					{
						label: "Movement Risk Score",
						value: `${movementRisk}/100`,
						sub: "Medium — 2 zones flagged",
						color: "text-[color:var(--warning-foreground)]"
					},
					{
						label: "Accessory Loss Risk",
						value: `${accessoryLoss}/100`,
						sub: "Medium — Glasses at high risk",
						color: "text-[color:var(--warning-foreground)]"
					},
					{
						label: "Pose Stability Score",
						value: `${poseStability}/100`,
						sub: "Needs improvement at wrist",
						color: "text-[color:var(--warning-foreground)]"
					},
					{
						label: "Drop-Test Prediction",
						value: `${dropTestPass}%`,
						sub: `Grade ${overallGrade} — likely to pass`,
						color: "text-[color:var(--success)]"
					}
				].map(({ label, value, sub, color }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border/70 shadow-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `mt-1 text-2xl font-bold tracking-tight ${color}`,
								children: value
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: sub
							})
						]
					})
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Movement Risk by Body Region"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Risk score per zone based on pose geometry and attachment plan" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "border-border/70 text-xs font-normal",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mr-1 h-3 w-3" }), " AI Predicted"]
						})]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "space-y-4",
						children: BODY_REGION_RISKS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-2 w-2 rounded-full ${RISK_DOT[r.level]}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: r.region
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: `text-[10px] font-medium capitalize ${RISK_BADGE[r.level]}`,
									children: r.level
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-xs font-semibold w-8 text-right",
									children: r.riskScore
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-2 w-full overflow-hidden rounded-full bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `h-full rounded-full transition-all ${RISK_BAR[r.level]}`,
								style: { width: `${r.riskScore}%` }
							})
						})] }, r.region))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Accessory Loss Risk"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Predicted loss probability per detected accessory item" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "border-border/70 text-xs font-normal",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mr-1 h-3 w-3" }),
								" ",
								ACCESSORY_RISKS.filter((a) => a.level === "high").length,
								" high risk"
							]
						})]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "space-y-4",
						children: ACCESSORY_RISKS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-2 w-2 rounded-full ${RISK_DOT[a.level]}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: a.accessory
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: `text-[10px] font-medium capitalize ${RISK_BADGE[a.level]}`,
									children: a.level
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums text-xs font-semibold w-8 text-right",
									children: [a.lossRisk, "%"]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-2 w-full overflow-hidden rounded-full bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `h-full rounded-full transition-all ${RISK_BAR[a.level]}`,
								style: { width: `${a.lossRisk}%` }
							})
						})] }, a.accessory))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Drop-Test Pass Rate Prediction"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Predicted pass rate comparison across attachment plan variants" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							className: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-1 h-3 w-3" }),
								" Grade ",
								overallGrade
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "border-border/70 text-xs font-normal",
							children: [dropTestPass, "% confidence"]
						})]
					})]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-56",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: DROP_TEST_DATA,
							margin: {
								top: 4,
								right: 16,
								left: -16,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "var(--color-border)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "plan",
									stroke: "var(--color-muted-foreground)",
									fontSize: 11,
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "var(--color-muted-foreground)",
									fontSize: 11,
									tickLine: false,
									axisLine: false,
									domain: [0, 100]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: {
										borderRadius: 8,
										border: "1px solid var(--color-border)",
										background: "var(--color-card)",
										fontSize: 12
									},
									formatter: (v) => [`${v}%`, "Pass Rate"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "passRate",
									name: "Pass Rate %",
									fill: "var(--color-chart-1)",
									radius: [
										6,
										6,
										0,
										0
									],
									children: DROP_TEST_DATA.map((entry, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { fill: entry.plan === "Current Plan" ? "var(--color-chart-1)" : entry.plan === "No Attachment" ? "var(--color-chart-3)" : "var(--color-chart-2)" }, i))
								})
							]
						})
					})
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-[color:var(--primary)]/20 bg-[color:var(--primary-soft)]/20 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "h-3.5 w-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "AI Improvement Suggestions"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Targeted changes to reduce risk and improve drop-test readiness" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "space-y-3",
					children: AI_SUGGESTIONS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `mt-0.5 h-2 w-2 shrink-0 rounded-full ${RISK_DOT[s.level]}` }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "flex-1 text-xs leading-relaxed text-foreground",
								children: s.text
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: `shrink-0 text-[10px] font-semibold ${RISK_BADGE[s.level]}`,
								children: s.impact
							})
						]
					}, i))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/50 shadow-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center justify-between gap-4 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Review cost and sustainability impact"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-muted-foreground",
						children: "Analyse attachment element costs, labor time, carbon footprint, and a what-if comparison."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => navigate({ to: "/app/cost-analysis" }),
						className: "shrink-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" }),
							" Cost & Sustainability ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
						]
					})]
				})
			})
		]
	});
}
//#endregion
export { RiskAssessmentPage as component };
