import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { C as Leaf, F as DollarSign, L as Clock, Z as ArrowLeft, m as Send, q as Brain, u as Sparkles } from "../_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { n as PageHeader, t as Badge } from "./page-header-Dam7wNGy.mjs";
import { i as loadPlan, n as loadAnalysis, t as DEMO_RESULT } from "./workflow-store-Hbw_5P2e.mjs";
import { t as Progress } from "./progress-DOIEKRJF.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { _ as Legend, d as Bar, g as Tooltip, h as ResponsiveContainer, i as BarChart, m as Cell, o as YAxis, p as Pie, r as PieChart, s as XAxis, u as CartesianGrid } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.cost-analysis-DpnAhL8E.js
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
		done: true
	},
	{
		label: "Cost & Sustainability",
		active: true
	}
];
var MATERIAL_SUSTAINABILITY = {
	"Elastic Strap": 68,
	"PET Support": 78,
	"EVA Strap": 82,
	"Cardboard Support": 90,
	"No Attachment Required": 100
};
var MATERIAL_COLORS = {
	"Elastic Strap": "var(--color-chart-1)",
	"PET Support": "var(--color-chart-2)",
	"EVA Strap": "var(--color-chart-3)",
	"Cardboard Support": "var(--color-chart-4)",
	"No Attachment Required": "var(--color-chart-5)"
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
function CostSustainabilityPage() {
	const navigate = useNavigate();
	const [productName, setProductName] = (0, import_react.useState)("Glamour Doll – Sparkle Edition");
	const [plan, setPlan] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setProductName((loadAnalysis() ?? DEMO_RESULT).productName);
		setPlan(loadPlan());
	}, []);
	const activeZones = plan?.zones.filter((z) => z.action !== "Remove") ?? [];
	const removedZones = plan?.zones.filter((z) => z.action === "Remove") ?? [];
	plan?.zones.filter((z) => z.action === "Add");
	plan?.zones.filter((z) => z.action === "Keep");
	const totalCost = plan?.totalCost ?? 0;
	const avgSustainability = plan?.avgSustainability ?? 78;
	plan?.avgStability;
	const totalLabor = activeZones.reduce((s, z) => s + z.laborMins, 0);
	const costSavings = removedZones.reduce((s, z) => s + z.cost, 0);
	const materialCounts = {};
	for (const z of activeZones) {
		const m = z.recommendedMethod;
		if (m === "Not needed" || m === "No Attachment Required") continue;
		if (!materialCounts[m]) materialCounts[m] = {
			count: 0,
			totalCost: 0
		};
		materialCounts[m].count++;
		materialCounts[m].totalCost += z.cost;
	}
	const pieData = Object.entries(materialCounts).map(([name, d]) => ({
		name,
		value: d.count,
		cost: d.totalCost,
		color: MATERIAL_COLORS[name] ?? "var(--color-chart-5)"
	}));
	const barData = (plan?.zones ?? []).filter((z) => z.action !== "Remove").map((z) => ({
		zone: z.zone,
		cost: z.cost,
		sustainability: MATERIAL_SUSTAINABILITY[z.recommendedMethod] ?? 80,
		stability: z.stability
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Cost & Sustainability",
				description: `Attachment costs, material analysis, and environmental impact — ${productName}`,
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
						value: `$${totalCost.toFixed(2)}`,
						sub: `${activeZones.length} attachment zones`,
						icon: DollarSign,
						color: "text-primary"
					},
					{
						label: "Est. Labor / Unit",
						value: `${totalLabor.toFixed(1)} min`,
						sub: "Production line estimate",
						icon: Clock,
						color: "text-[color:var(--chart-2)]"
					},
					{
						label: "Cost Savings",
						value: costSavings > 0 ? `-$${costSavings.toFixed(2)}` : "$0.00",
						sub: removedZones.length > 0 ? `${removedZones.length} zone(s) removed by AI` : "No zones removed",
						icon: Sparkles,
						color: "text-[color:var(--success)]"
					},
					{
						label: "Sustainability Score",
						value: `${avgSustainability}/100`,
						sub: plan?.recommendedMaterial ? `Material: ${plan.recommendedMaterial}` : "Weighted average",
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-7 w-7 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brain, { className: "h-3.5 w-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Attachment Cost Breakdown"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Per-zone cost and sustainability from AI recommendation plan" })] })]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Zone" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Material" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-center",
						children: "Action"
					}),
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
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [(plan?.zones ?? []).map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: z.action === "Keep" ? "bg-[color:var(--success)]/5" : z.action === "Add" ? "bg-blue-500/5" : z.action === "Remove" ? "bg-destructive/5 opacity-60" : "",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: z.zone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: z.action === "Remove" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted-foreground italic line-through",
							children: z.currentMethod
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: z.recommendedMethod
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-center",
							children: [
								z.action === "Keep" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "bg-[color:var(--success)] text-white border-0 text-[10px]",
									children: "Keep"
								}),
								z.action === "Add" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "bg-blue-500 text-white border-0 text-[10px]",
									children: "Add"
								}),
								z.action === "Remove" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "destructive",
									className: "text-[10px]",
									children: "Remove"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right tabular-nums font-medium",
							children: z.action === "Remove" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[color:var(--success)] font-semibold",
								children: ["-$", z.cost.toFixed(2)]
							}) : z.cost === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "—"
							}) : `$${z.cost.toFixed(2)}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-right tabular-nums text-sm",
							children: z.action === "Remove" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "—"
							}) : z.laborMins > 0 ? `${z.laborMins} min` : "—"
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
						})
					]
				}, z.zone)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "border-t-2 border-border font-semibold",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							colSpan: 3,
							className: "font-semibold",
							children: "Total (Recommended)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right tabular-nums font-bold text-primary",
							children: ["$", totalCost.toFixed(2)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right tabular-nums font-bold",
							children: [totalLabor.toFixed(1), " min"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right font-bold",
							children: [avgSustainability, "/100"]
						})
					]
				})] })] }) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Cost & Sustainability per Zone"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Cost and sustainability score for each recommended attachment zone" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-56",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: barData,
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
										dataKey: "zone",
										stroke: "var(--color-muted-foreground)",
										fontSize: 10,
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
										dataKey: "stability",
										name: "Stability",
										fill: "var(--color-chart-2)",
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
					}) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Material Distribution"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Attachment materials used in recommended plan" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: pieData.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-44",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: pieData,
								dataKey: "value",
								nameKey: "name",
								cx: "50%",
								cy: "50%",
								innerRadius: 52,
								outerRadius: 76,
								paddingAngle: 2,
								children: pieData.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: entry.color }, entry.name))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								formatter: (v, name) => [`${v} zone(s)`, name],
								contentStyle: {
									borderRadius: 8,
									border: "1px solid var(--color-border)",
									background: "var(--color-card)",
									fontSize: 12
								}
							})] })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 grid grid-cols-1 gap-1.5",
						children: pieData.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-2 w-2 shrink-0 rounded-full",
									style: { background: d.color }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: d.name
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-medium",
								children: ["$", d.cost.toFixed(2)]
							})]
						}, d.name))
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground text-center py-8",
						children: "No attachment data available. Run the Attachment Planner first."
					}) })]
				})]
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
