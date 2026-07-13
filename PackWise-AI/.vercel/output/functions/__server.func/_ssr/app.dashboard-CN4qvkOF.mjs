import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as getUser } from "./auth-ZX2vfegG.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { $ as ArrowDownRight, B as CircleCheck, I as DollarSign, R as Clock, S as Link2, X as ArrowUpRight, Z as ArrowRight, c as Target, et as Activity, f as ShieldAlert, g as ScanLine, i as UserPlus, k as FolderKanban, r as Users, s as TrendingDown, u as Sparkles } from "../_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { n as PageHeader, t as Badge } from "./page-header-Dam7wNGy.mjs";
import { _ as Legend, a as LineChart, c as Area, g as Tooltip, h as ResponsiveContainer, l as Line, m as Cell, n as AreaChart, o as YAxis, p as Pie, r as PieChart, s as XAxis, u as CartesianGrid } from "../_libs/recharts+[...].mjs";
import { t as Progress } from "./progress-DOIEKRJF.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
import { a as performanceTrend, c as recommendations, i as monthlyTrends, l as sustainabilityMetrics, n as costBreakdown, o as recentActivities, r as managedUsers, s as recentAnalyses } from "./mock-data-CDSDiqKg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.dashboard-CN4qvkOF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function KpiCard({ label, value, delta, trend = "up", icon: Icon, hint }) {
	const positive = trend === "up";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "border-border/70 shadow-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-9 w-9 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
				}), delta && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium", positive ? "bg-[color:var(--success)]/10 text-[color:var(--success)]" : "bg-destructive/10 text-destructive"),
					children: [positive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownRight, { className: "h-3 w-3" }), delta]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
						children: label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-2xl font-semibold tracking-tight text-foreground",
						children: value
					}),
					hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: hint
					})
				]
			})]
		})
	});
}
var statusStyles = {
	Optimized: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
	Review: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent",
	Pending: "bg-muted text-muted-foreground border-transparent"
};
var ZONE_SUMMARY = [
	{
		zone: "Hair",
		method: "Elastic Strap",
		risk: "medium",
		stability: 85
	},
	{
		zone: "Waist",
		method: "PET Support",
		risk: "low",
		stability: 94
	},
	{
		zone: "Right Wrist",
		method: "EVA Strap",
		risk: "high",
		stability: 90
	},
	{
		zone: "Left Foot",
		method: "No Attachment",
		risk: "low",
		stability: 100
	}
];
function EngineerDashboard({ user }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: `Welcome back, ${user.name.split(" ")[0]}`,
				description: "Here's your attachment optimization workspace — active projects, risk flags, and AI recommendations.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/app/reports",
						children: "Export report"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/app/product-analysis",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), " New analysis"]
					})
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "ACTIVE ANALYSES",
						value: "4",
						icon: Activity,
						hint: "Products currently in optimization"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "ATTACHMENT ZONES MAPPED",
						value: "47",
						icon: ScanLine,
						hint: "AI-identified zones across all SKUs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "AVG. RISK REDUCTION",
						value: "71%",
						icon: ShieldAlert,
						hint: "Vs. unplanned attachment baseline"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "POSE CONFIGURATIONS",
						value: "24",
						icon: Sparkles,
						hint: "Alternative plans generated this month"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/5 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "flex flex-row items-start justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base text-foreground",
						children: "Attachment Approvals"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Track the status of your submitted attachment plans." })] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: [{
						id: "REQ-091",
						sku: "Action Hero Series 7",
						date: "Approved Today, 09:15 AM",
						risk: "Medium",
						cost: "$0.45/unit",
						status: "Approved"
					}, {
						id: "REQ-092",
						sku: "Glamour Doll – Sparkle Edition",
						date: "Submitted Today, 10:45 AM",
						risk: "Low",
						cost: "$0.38/unit",
						status: "Pending"
					}].map((req, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-lg border border-border/70 bg-background p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${req.status === "Approved" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)]"}`,
								children: req.status === "Approved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-foreground",
								children: req.sku
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: req.date
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden sm:block text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-medium uppercase text-muted-foreground",
										children: "Est. Cost"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: req.cost
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden sm:block text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-medium uppercase text-muted-foreground",
										children: "Risk Level"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: `text-sm font-medium ${req.risk === "Low" ? "text-[color:var(--success)]" : "text-[color:var(--warning-foreground)]"}`,
										children: req.risk
									})]
								}),
								req.status === "Approved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									className: "bg-[color:var(--success)] hover:bg-[color:var(--success)]/90 text-white",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/app/reports",
										children: "Upload Report"
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "border-border/60 bg-muted/50 text-muted-foreground font-normal",
										children: "Under Review"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "outline",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: `/app/approvals/${req.id}`,
											children: "View Details"
										})
									})]
								})
							]
						})]
					}, i))
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-start justify-between space-y-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Performance trend"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Risk reduction, pose stability & sustainability — last 8 months." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "border-border/70 text-xs font-normal",
							children: "Last 8 months"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-72 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: performanceTrend,
								margin: {
									top: 8,
									right: 12,
									left: -16,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "g1",
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
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "g2",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "0%",
											stopColor: "var(--color-chart-2)",
											stopOpacity: .25
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "100%",
											stopColor: "var(--color-chart-2)",
											stopOpacity: 0
										})]
									})] }),
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
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "riskReduction",
										name: "Risk Reduction %",
										stroke: "var(--color-chart-1)",
										strokeWidth: 2,
										fill: "url(#g1)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										type: "monotone",
										dataKey: "poseStability",
										name: "Pose Stability %",
										stroke: "var(--color-chart-2)",
										strokeWidth: 2,
										fill: "url(#g2)"
									})
								]
							})
						})
					}) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-7 w-7 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "AI recommendations"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Top opportunities across your active SKUs." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3",
						children: [recommendations.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border/70 p-3 transition hover:border-primary/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium leading-tight",
									children: r.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "bg-[color:var(--primary-soft)] text-primary text-[10px] font-medium",
									children: r.tag
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: r.impact
							})]
						}, r.title)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: "w-full justify-between text-primary hover:text-primary",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/app/packaging-planner",
								children: ["View attachment planner ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
							})
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Active workflow — Glamour Doll Sparkle Edition"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Track progress through the attachment optimization pipeline." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-0",
					children: [
						{
							label: "Pose & Doll Analysis",
							done: true,
							url: "/app/product-analysis",
							icon: ScanLine
						},
						{
							label: "Attachment Planner",
							done: true,
							url: "/app/packaging-planner",
							icon: Link2
						},
						{
							label: "Attachment Visualizer",
							done: false,
							url: "/app/packaging-preview",
							icon: Link2
						},
						{
							label: "Risk Assessment",
							done: false,
							url: "/app/risk-assessment",
							icon: ShieldAlert
						},
						{
							label: "Cost & Sustainability",
							done: false,
							url: "/app/cost-analysis",
							icon: Activity
						}
					].map((step, i, arr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-1 items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: step.url,
							className: "group flex flex-col items-center gap-1.5 px-2 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${step.done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground group-hover:border-primary/50"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(step.icon, { className: "h-3.5 w-3.5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-[10px] font-medium leading-tight ${step.done ? "text-primary" : "text-muted-foreground"}`,
								children: step.label
							})]
						}), i < arr.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-px flex-1 ${step.done ? "bg-primary" : "bg-border"}` })]
					}, step.label))
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between space-y-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Recent analyses"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Latest attachment optimization runs across your team." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app/reports",
							children: "View all"
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "w-[110px]",
						children: "ID"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Product" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Stability"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Est. savings"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Date"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: recentAnalyses.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs text-muted-foreground",
						children: a.id
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: a.product
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: statusStyles[a.status],
						children: a.status
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: a.efficiency,
								className: "h-1.5 w-16"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums text-xs",
								children: [a.efficiency, "%"]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right tabular-nums",
						children: a.savings
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right text-muted-foreground",
						children: a.date
					})
				] }, a.id)) })] }) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Active attachment plan — Glamour Doll Sparkle Edition"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Current attachment zone assignments and stability scores." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: ZONE_SUMMARY.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border/70 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: z.zone
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: `border-transparent text-[10px] font-medium capitalize ${z.risk === "high" ? "bg-destructive/10 text-destructive" : z.risk === "medium" ? "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)]" : "bg-[color:var(--success)]/10 text-[color:var(--success)]"}`,
									children: [z.risk, " risk"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: z.method
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-[10px] text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pose stability" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-medium text-foreground",
										children: [z.stability, "%"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
									value: z.stability,
									className: "h-1.5"
								})]
							})
						]
					}, z.zone))
				}) })]
			})
		]
	});
}
var PIE_COLORS = [
	"var(--color-chart-1)",
	"var(--color-chart-2)",
	"var(--color-chart-3)",
	"var(--color-chart-4)"
];
var riskTrend = [
	{
		month: "Mar",
		movement: 68,
		accessoryLoss: 74
	},
	{
		month: "Apr",
		movement: 63,
		accessoryLoss: 70
	},
	{
		month: "May",
		movement: 57,
		accessoryLoss: 65
	},
	{
		month: "Jun",
		movement: 52,
		accessoryLoss: 61
	},
	{
		month: "Jul",
		movement: 47,
		accessoryLoss: 57
	},
	{
		month: "Aug",
		movement: 44,
		accessoryLoss: 53
	}
];
function ManagerDashboard({ user }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Operations Overview",
				description: `Executive snapshot for ${user.company ?? "your organization"} — attachment costs, labor trends & sustainability.`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					children: "Download executive summary"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "TOTAL SKUs ANALYZED",
						value: "12",
						icon: Target,
						hint: "Products with attachment plans"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "COST SAVINGS YTD",
						value: "$52k",
						icon: DollarSign,
						hint: "vs. unoptimized attachment baseline"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "AVG. LABOR REDUCTION",
						value: "31%",
						icon: TrendingDown,
						hint: "Per unit vs. prior methods"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "AVG. RISK SCORE",
						value: "44/100",
						icon: ShieldAlert,
						hint: "Movement risk across portfolio"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-[color:var(--warning)]/30 bg-[color:var(--warning)]/5 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-start justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base text-[color:var(--warning-foreground)]",
						children: "Pending Attachment Approvals"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Attachment plans awaiting your review before proceeding to production." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/app/approvals",
							children: "View All"
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: [{
						sku: "Glamour Doll – Sparkle Edition",
						engineer: "Eng. Alice",
						date: "Today, 10:45 AM",
						risk: "Low",
						cost: "$0.38/unit"
					}, {
						sku: "Action Hero Series 7",
						engineer: "Eng. Bob",
						date: "Yesterday, 3:15 PM",
						risk: "Medium",
						cost: "$0.45/unit"
					}].map((req, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-lg border border-border/70 bg-background p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-foreground",
							children: req.sku
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 text-xs text-muted-foreground",
							children: [
								"Requested by ",
								req.engineer,
								" on ",
								req.date
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden sm:block text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-medium uppercase text-muted-foreground",
										children: "Est. Cost"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: req.cost
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden sm:block text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-medium uppercase text-muted-foreground",
										children: "Risk Level"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: `text-sm font-medium ${req.risk === "Low" ? "text-[color:var(--success)]" : "text-[color:var(--warning-foreground)]"}`,
										children: req.risk
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: `/app/approvals/REQ-09${2 - i}`,
											children: "View Details"
										})
									})
								})
							]
						})]
					}, i))
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Monthly cost & savings trend"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Cost per 1,000 units vs. realized monthly savings from attachment optimization." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-72 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
								data: monthlyTrends,
								margin: {
									top: 8,
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
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										type: "monotone",
										dataKey: "savings",
										name: "Savings ($k)",
										stroke: "var(--color-chart-1)",
										strokeWidth: 2.5,
										dot: { r: 3 }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
										type: "monotone",
										dataKey: "cost",
										name: "Cost / 1k units ($)",
										stroke: "var(--color-chart-2)",
										strokeWidth: 2.5,
										dot: { r: 3 }
									})
								]
							})
						})
					}) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Attachment cost composition"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Where your per-unit attachment spend goes today." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-48 w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
								data: costBreakdown,
								dataKey: "value",
								nameKey: "name",
								innerRadius: 42,
								outerRadius: 72,
								paddingAngle: 2,
								children: costBreakdown.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: PIE_COLORS[i % PIE_COLORS.length] }, i))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
								borderRadius: 8,
								border: "1px solid var(--color-border)",
								background: "var(--color-card)",
								fontSize: 12
							} })] })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1.5 text-xs",
						children: costBreakdown.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "h-2 w-2 rounded-full",
									style: { background: PIE_COLORS[i] }
								}), c.name]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums font-medium",
								children: [c.value, "%"]
							})]
						}, c.name))
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Sustainability progress"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Attachment material recyclability & environmental targets for 2026." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "space-y-5",
						children: sustainabilityMetrics.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground",
								children: m.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums text-muted-foreground",
								children: [
									m.value,
									"% ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs",
										children: [
											"/ target ",
											m.target,
											"%"
										]
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
							value: m.value / m.target * 100,
							className: "mt-2 h-2"
						})] }, m.label))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Executive summary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Auto-generated insights this week." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "space-y-3",
						children: [
							{
								tag: "Wins",
								text: "Glamour Doll Sparkle Edition achieved 94% pose stability — highest this quarter.",
								tone: "success"
							},
							{
								tag: "Watch",
								text: "Right Wrist zone flagged as high-risk on 3 active SKUs — engineer review pending.",
								tone: "warning"
							},
							{
								tag: "Next",
								text: "Approve EVA strap rollout across 6 remaining collectible doll SKUs.",
								tone: "info"
							}
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border/70 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: item.tone === "success" ? "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent text-[10px]" : item.tone === "warning" ? "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent text-[10px]" : "bg-[color:var(--primary-soft)] text-primary border-transparent text-[10px]",
								children: item.tag
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-foreground",
								children: item.text
							})]
						}, item.tag))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Risk reduction trends"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Movement risk and accessory loss risk scores — declining as attachment plans mature." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-56 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
							data: riskTrend,
							margin: {
								top: 8,
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
									axisLine: false,
									domain: [30, 80]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
									borderRadius: 8,
									border: "1px solid var(--color-border)",
									background: "var(--color-card)",
									fontSize: 12
								} }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { wrapperStyle: { fontSize: 12 } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "movement",
									name: "Movement Risk Score",
									stroke: "var(--color-chart-3)",
									strokeWidth: 2.5,
									dot: { r: 3 }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "accessoryLoss",
									name: "Accessory Loss Risk Score",
									stroke: "var(--color-chart-4)",
									strokeWidth: 2.5,
									dot: { r: 3 }
								})
							]
						})
					})
				}) })]
			})
		]
	});
}
function AdminDashboard({ user }) {
	const pending = managedUsers.filter((u) => u.status === "pending");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: `Administration`,
				description: `Manage users, roles, and platform health, ${user.name.split(" ")[0]}.`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/app/users",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-4 w-4" }), "Review approvals"]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Total Users",
						value: "1,284",
						icon: Users,
						hint: "Across 38 companies"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Pending Approvals",
						value: `${pending.length}`,
						icon: UserPlus,
						hint: "Awaiting review"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Active Projects",
						value: "167",
						icon: FolderKanban,
						hint: "Currently in progress"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
						label: "Server Status",
						value: "Online",
						icon: Activity,
						hint: "All models operational"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-center justify-between space-y-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Recent activities"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "What's happening across the platform right now." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							children: ["View audit log ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border/70",
						children: recentActivities.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-xs font-semibold text-primary",
									children: a.who.split(" ").map((p) => p[0]).slice(0, 2).join("")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: a.who
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: a.what
											})
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: a.when
								})
							]
						}, i))
					}) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Pending approvals"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: [pending.length, " accounts waiting on you."] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3",
						children: [pending.slice(0, 4).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-lg border border-border/70 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium",
									children: u.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: u.company
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent text-[10px]",
								children: u.joined
							})]
						}, u.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "sm",
							className: "w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/app/users",
								children: "Go to user management"
							})
						})]
					})]
				})]
			})
		]
	});
}
function DashboardRouter() {
	const [user, setUser] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => setUser(getUser()), []);
	if (!user) return null;
	if (user.role === "engineer") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EngineerDashboard, { user });
	if (user.role === "manager") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManagerDashboard, { user });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminDashboard, { user });
}
//#endregion
export { DashboardRouter as component };
