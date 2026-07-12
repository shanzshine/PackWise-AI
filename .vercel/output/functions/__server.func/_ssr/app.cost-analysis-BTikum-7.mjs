import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { C as Leaf, I as DollarSign, J as Brain, Q as ArrowLeft, R as Clock, _ as Recycle, m as Send } from "../_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { n as PageHeader, t as Badge } from "./page-header-Dam7wNGy.mjs";
import { n as loadAnalysis, t as DEMO_RESULT } from "./workflow-store-BXv3B_km.mjs";
import { _ as Legend, c as Area, d as Bar, g as Tooltip, h as ResponsiveContainer, i as BarChart, m as Cell, n as AreaChart, o as YAxis, p as Pie, r as PieChart, s as XAxis, u as CartesianGrid } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.cost-analysis-BTikum-7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WORKFLOW_STEPS = [
	{
		label: "Pose & Doll Analysis",
		done: true
	},
	{
		label: "Attachment Planner",
		done: true
	},
	{
		label: "Attachment Visualizer",
		done: true
	},
	{
		label: "Risk Assessment",
		done: true
	},
	{
		label: "Cost & Sustainability",
		active: true
	}
];
var attachmentMaterialBreakdown = [
	{
		name: "EVA Straps",
		value: 36,
		color: "var(--color-chart-1)"
	},
	{
		name: "PET Supports",
		value: 28,
		color: "var(--color-chart-2)"
	},
	{
		name: "Elastic Straps",
		value: 22,
		color: "var(--color-chart-3)"
	},
	{
		name: "Rubber Bands",
		value: 8,
		color: "var(--color-chart-4)"
	},
	{
		name: "Cardboard Supports",
		value: 6,
		color: "var(--color-chart-5)"
	}
];
var sustainabilityTrend = [
	{
		month: "Jan",
		score: 64,
		waste: 32,
		carbon: 5.8
	},
	{
		month: "Feb",
		score: 68,
		waste: 30,
		carbon: 5.4
	},
	{
		month: "Mar",
		score: 72,
		waste: 27,
		carbon: 5
	},
	{
		month: "Apr",
		score: 76,
		waste: 24,
		carbon: 4.6
	},
	{
		month: "May",
		score: 80,
		waste: 21,
		carbon: 4.1
	},
	{
		month: "Jun",
		score: 84,
		waste: 18,
		carbon: 3.7
	},
	{
		month: "Jul",
		score: 88,
		waste: 15,
		carbon: 3.3
	},
	{
		month: "Aug",
		score: 92,
		waste: 12,
		carbon: 2.9
	}
];
var whatIfData = [
	{
		scenario: "Current Plan",
		costPerUnit: .38,
		laborMin: 2.3,
		sustainability: 78,
		riskScore: 44
	},
	{
		scenario: "Alt. Plan A (EVA)",
		costPerUnit: .52,
		laborMin: 2.9,
		sustainability: 83,
		riskScore: 31
	},
	{
		scenario: "Alt. Plan B (Blister)",
		costPerUnit: .68,
		laborMin: 3.4,
		sustainability: 61,
		riskScore: 22
	},
	{
		scenario: "Minimal (Rubber Band)",
		costPerUnit: .12,
		laborMin: .9,
		sustainability: 71,
		riskScore: 72
	}
];
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
function CostSustainabilityPage() {
	const navigate = useNavigate();
	const [productName, setProductName] = (0, import_react.useState)("Glamour Doll – Sparkle Edition");
	(0, import_react.useEffect)(() => {
		setProductName((loadAnalysis() ?? DEMO_RESULT).productName);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Cost & Sustainability",
				description: `Attachment element costs, labor analysis, and environmental impact — ${productName}`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => navigate({ to: "/app/risk-assessment" }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Back to Risk Assessment"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: () => navigate({ to: "/app/submit-approval" }),
					className: "bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mr-2 h-4 w-4" }), " Submit Plan"]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkflowBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					{
						label: "Total Cost / Unit",
						value: "$0.38",
						sub: "All attachment elements",
						icon: DollarSign,
						color: "text-primary"
					},
					{
						label: "Est. Labor / Unit",
						value: "2.3 min",
						sub: "Production line estimate",
						icon: Clock,
						color: "text-[color:var(--chart-2)]"
					},
					{
						label: "Recyclability",
						value: "High",
						sub: "EVA & PET dominant mix",
						icon: Recycle,
						color: "text-[color:var(--success)]"
					},
					{
						label: "Sustainability Score",
						value: "78/100",
						sub: "Above industry average",
						icon: Leaf,
						color: "text-[color:var(--success)]"
					}
				].map(({ label, value, sub, icon: Icon, color }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border/70 shadow-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--primary-soft)] ${color}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-2xl font-bold tracking-tight text-foreground",
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
				className: "grid gap-6 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Attachment Material Composition"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Cost share by attachment element type — total $0.38 / unit" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3",
						children: [attachmentMaterialBreakdown.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-2.5 w-2.5 rounded-full",
										style: { background: item.color }
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: item.name
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums font-semibold",
									children: [item.value, "%"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-2 w-full overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full transition-all duration-700",
									style: {
										width: `${item.value}%`,
										background: item.color
									}
								})
							})]
						}, item.name)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center justify-between border-t border-border/70 pt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: "Material Efficiency"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xl font-bold text-[color:var(--success)]",
								children: "Optimal"
							})]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Material Distribution"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Proportion by attachment element type" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-44",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: attachmentMaterialBreakdown,
								dataKey: "value",
								nameKey: "name",
								cx: "50%",
								cy: "50%",
								innerRadius: 52,
								outerRadius: 76,
								paddingAngle: 2,
								children: attachmentMaterialBreakdown.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: entry.color }, entry.name))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								formatter: (v) => [`${v}%`, "Share"],
								contentStyle: {
									borderRadius: 8,
									border: "1px solid var(--color-border)",
									background: "var(--color-card)",
									fontSize: 12
								}
							})] })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 grid grid-cols-2 gap-1.5",
						children: attachmentMaterialBreakdown.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-2 w-2 shrink-0 rounded-full",
								style: { background: d.color }
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground truncate",
								children: d.name
							})]
						}, d.name))
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Sustainability Trend"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Sustainability score, material waste and carbon footprint over the last 8 months" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-56",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: sustainabilityTrend,
							margin: {
								top: 8,
								right: 12,
								left: -16,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "gs",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "0%",
										stopColor: "var(--color-chart-1)",
										stopOpacity: .35
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "100%",
										stopColor: "var(--color-chart-1)",
										stopOpacity: 0
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "var(--color-border)",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "month",
									stroke: "var(--color-muted-foreground)",
									fontSize: 12,
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "var(--color-muted-foreground)",
									fontSize: 12,
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									borderRadius: 8,
									border: "1px solid var(--color-border)",
									background: "var(--color-card)",
									fontSize: 12
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 12 } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "score",
									name: "Sustainability Score",
									stroke: "var(--color-chart-1)",
									strokeWidth: 2,
									fill: "url(#gs)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "waste",
									name: "Material Waste %",
									stroke: "var(--color-chart-3)",
									strokeWidth: 2,
									fill: "none",
									strokeDasharray: "4 2"
								})
							]
						})
					})
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-7 w-7 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "h-3.5 w-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "What-If Analysis"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Compare attachment plan variants across cost, labor, sustainability, and risk" })] })]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-56 mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: whatIfData,
							margin: {
								top: 4,
								right: 12,
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
									dataKey: "scenario",
									stroke: "var(--color-muted-foreground)",
									fontSize: 9,
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									stroke: "var(--color-muted-foreground)",
									fontSize: 11,
									tickLine: false,
									axisLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									borderRadius: 8,
									border: "1px solid var(--color-border)",
									background: "var(--color-card)",
									fontSize: 12
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 11 } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "sustainability",
									name: "Sustainability",
									fill: "var(--color-chart-1)",
									radius: [
										3,
										3,
										0,
										0
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "riskScore",
									name: "Risk Score",
									fill: "var(--color-chart-3)",
									radius: [
										3,
										3,
										0,
										0
									]
								})
							]
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: whatIfData.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `rounded-lg border p-3 ${s.scenario === "Current Plan" ? "border-primary/30 bg-[color:var(--primary-soft)]/30" : "border-border/60"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold leading-tight",
								children: s.scenario
							}), s.scenario === "Current Plan" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "bg-primary/20 text-primary border-transparent text-[9px]",
								children: "Active"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Cost/unit"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium",
										children: ["$", s.costPerUnit.toFixed(2)]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Labor"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium",
										children: [s.laborMin, " min"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Sustainability"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium",
										children: [s.sustainability, "/100"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Risk score"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium",
										children: [s.riskScore, "/100"]
									})]
								})
							]
						})]
					}, s.scenario))
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/50 shadow-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center justify-between gap-4 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Ready for Production?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-muted-foreground",
						children: "Submit the completed analysis and attachment plan to the Operations Manager for final approval."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: () => navigate({ to: "/app/submit-approval" }),
						className: "shrink-0 bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "mr-2 h-4 w-4" }), " Submit Plan"]
					})]
				})
			})
		]
	});
}
//#endregion
export { CostSustainabilityPage as component };
