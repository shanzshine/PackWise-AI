import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { A as FileDown, C as Leaf, F as DollarSign, K as Calendar, L as Clock, M as Eye, P as Download, V as ChevronRight, W as ChartColumn, j as FileChartColumn, k as FileText, n as X, u as Sparkles, y as Package, z as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { n as PageHeader, t as Badge } from "./page-header-Dam7wNGy.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C0WYWEQX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.reports-TlpqJIX9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var REPORTS = [
	{
		id: "RPT-2041",
		name: "Glamour Doll – Sparkle Edition — Full Attachment Analysis",
		type: "analysis",
		product: "Glamour Doll – Sparkle Edition",
		status: "completed",
		date: "Aug 21, 2025",
		size: "2.4 MB",
		summary: "Complete AI attachment analysis. Pose complexity score 82/100. 4 attachment zones identified: Hair (medium risk), Waist (low), Right Wrist (high), Left Foot (no attachment required). Movement risk: 44/100. Accessory loss risk: 61/100.",
		insights: [
			"Pose complexity score 82/100 — 4 attachment zones identified",
			"Right Wrist flagged as HIGH risk — EVA strap recommended",
			"5 accessories detected: Handbag, Shoes, Glasses, Crown, Dress Stand",
			"Glasses accessory at 81% predicted loss risk — blister support needed",
			"Drop-test pass rate: 87% (Grade B+) with current attachment plan"
		]
	},
	{
		id: "RPT-2040",
		name: "Q3 Attachment Cost & Sustainability Review",
		type: "cost",
		product: "Multiple SKUs",
		status: "completed",
		date: "Aug 20, 2025",
		size: "1.8 MB",
		summary: "Quarterly cost analysis across 12 active SKUs. Average attachment cost reduced to $0.38/unit. Carbon footprint from attachment materials: 2.9 kg CO₂/1,000 units — 50% below 2023 baseline.",
		insights: [
			"Total attachment cost per unit: $0.38 (down from $0.71 in Q1)",
			"EVA Straps now dominant material (36% of cost share)",
			"Carbon footprint: 2.9 kg CO₂ per 1,000 units",
			"Sustainability score: 78/100 (+22 pts YoY)",
			"Labor time reduction: 31% vs. prior attachment methods"
		]
	},
	{
		id: "RPT-2039",
		name: "Action Hero Series 7 — Attachment Plan",
		type: "attachment-plan",
		product: "Action Hero Series 7",
		status: "completed",
		date: "Aug 19, 2025",
		size: "1.2 MB",
		summary: "AI-generated attachment plan for Action Hero Series 7. 3 attachment zones identified. PET support at waist and EVA strap at right shoulder reduce movement risk by 68%. Drop-test prediction: 91% pass rate.",
		insights: [
			"3 attachment zones identified: Shoulder (high), Waist (medium), Feet (low)",
			"Recommended: PET Support at waist + EVA strap at shoulder",
			"Movement risk reduced: 78 → 24 (from high to low)",
			"Drop-test prediction: 91% pass rate (Grade A)",
			"Estimated annual savings: $38,000 at current production volume"
		]
	},
	{
		id: "RPT-2038",
		name: "August Sustainability Disclosure — Attachment Materials",
		type: "sustainability",
		product: "Full Portfolio",
		status: "completed",
		date: "Aug 18, 2025",
		size: "3.1 MB",
		summary: "GRI-aligned sustainability report for August. Recyclable attachment material usage at 82%, up from 61% in January. CO₂ savings of 2.1 tonnes vs. prior-year attachment materials across the portfolio.",
		insights: [
			"Recyclable attachment materials: 82% (target: 90% by Dec 2025)",
			"Renewable material sources: 64% (target: 75%)",
			"CO₂ savings vs prior year: 2.1 tonnes",
			"Plastic-free attachment zones: 58% (target: 65%)",
			"GRI 301 Material compliance: PASS"
		]
	},
	{
		id: "RPT-2037",
		name: "Princess Castle Playset — Risk Assessment",
		type: "risk",
		product: "Princess Castle Playset",
		status: "completed",
		date: "Aug 17, 2025",
		size: "2.0 MB",
		summary: "Risk assessment for Princess Castle Playset. High complexity (78/100) due to 12 component types. 6 attachment zones identified. Movement risk: 52/100. Cardboard supports recommended for small parts.",
		insights: [
			"Pose complexity: 78/100 — 6 high-structure attachment zones required",
			"12 component types — 4 flagged for accessory loss risk",
			"Movement risk: 52/100 (Medium) — 2 high-risk zones",
			"Recommended: Cardboard support tray for small parts",
			"Drop-test prediction: 84% pass rate (Grade B+)"
		]
	},
	{
		id: "RPT-2036",
		name: "Fashion Doll Wardrobe Box — Attachment Plan Draft",
		type: "attachment-plan",
		product: "Fashion Doll Wardrobe Box",
		status: "draft",
		date: "Aug 22, 2025",
		size: "—",
		summary: "Draft attachment plan in progress. Initial scan identifies 5 attachment zones. Right arm and left wrist at elevated pose angle — EVA strap provisionally recommended for both zones.",
		insights: [
			"Draft — not yet finalized",
			"5 attachment zones identified in initial scan",
			"Right Arm and Left Wrist both flagged as medium risk"
		]
	}
];
var TYPE_ICONS = {
	analysis: Package,
	"attachment-plan": ChartColumn,
	risk: X,
	sustainability: Leaf,
	cost: DollarSign
};
var TYPE_LABELS = {
	analysis: "Pose Analysis",
	"attachment-plan": "Attachment Plan",
	risk: "Risk Assessment",
	sustainability: "Sustainability",
	cost: "Cost Analysis"
};
var STATUS_STYLES = {
	completed: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
	processing: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent",
	draft: "bg-muted text-muted-foreground border-transparent"
};
function ReportDetailModal({ report, onClose }) {
	const Icon = TYPE_ICONS[report.type];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "border-border/70 text-xs font-normal",
							children: report.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: `border-transparent text-xs font-medium ${STATUS_STYLES[report.status]}`,
							children: report.status.charAt(0).toUpperCase() + report.status.slice(1)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-left text-base leading-snug",
					children: report.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
					className: "text-left text-xs text-muted-foreground",
					children: [
						report.product,
						" · ",
						report.date,
						" · ",
						report.size
					]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-border/70 shadow-none bg-muted/30",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2",
								children: "Executive Summary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-foreground leading-relaxed",
								children: report.summary
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2",
						children: "Key Insights"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: report.insights.map((insight) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--success)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-foreground",
								children: insight
							})]
						}, insight))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "flex-1",
							onClick: () => {
								const blob = new Blob([`PackWise AI Report\n${report.id}\n\n${report.name}\n\nProduct: ${report.product}\nDate: ${report.date}\n\nSummary:\n${report.summary}\n\nKey Insights:\n${report.insights.map((i, n) => `${n + 1}. ${i}`).join("\n")}`], { type: "text/plain" });
								const a = document.createElement("a");
								a.href = URL.createObjectURL(blob);
								a.download = `${report.id}.txt`;
								a.click();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "h-4 w-4" }), " Export PDF"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "flex-1",
							onClick: () => {
								const csv = [[
									"ID",
									"Name",
									"Product",
									"Date",
									"Insight"
								], ...report.insights.map((i) => [
									report.id,
									report.name,
									report.product,
									report.date,
									i
								])].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
								const blob = new Blob([csv], { type: "text/csv" });
								const a = document.createElement("a");
								a.href = URL.createObjectURL(blob);
								a.download = `${report.id}.csv`;
								a.click();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Export CSV"]
						})]
					})
				]
			})]
		})
	});
}
function ReportsPage() {
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const filtered = filter === "all" ? REPORTS : REPORTS.filter((r) => r.type === filter);
	const completed = REPORTS.filter((r) => r.status === "completed").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Reports",
				description: "Access, review, and export all PackWise AI packaging analysis reports.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					variant: "outline",
					className: "border-border/70 font-normal",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileChartColumn, { className: "mr-1 h-3 w-3" }),
						" ",
						completed,
						" completed reports"
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					{
						label: "Total Reports",
						value: REPORTS.length.toString(),
						icon: FileText,
						hint: "Available in archive"
					},
					{
						label: "Completed",
						value: completed.toString(),
						icon: CircleCheck,
						hint: "Ready to export"
					},
					{
						label: "Analyses Run",
						value: "24",
						icon: Package,
						hint: "Historical total"
					},
					{
						label: "System Status",
						value: "Online",
						icon: Sparkles,
						hint: "All services operational"
					}
				].map(({ label, value, icon: Icon, hint }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border/70 shadow-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-2xl font-semibold tracking-tight text-foreground",
								children: value
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: hint
							})
						]
					})
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 flex-wrap",
				children: [
					"all",
					"analysis",
					"attachment-plan",
					"risk",
					"sustainability",
					"cost"
				].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: filter === f ? "default" : "outline",
					size: "sm",
					onClick: () => setFilter(f),
					className: filter !== f ? "border-border/70" : "",
					children: f === "all" ? "All Reports" : TYPE_LABELS[f]
				}, f))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between space-y-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Report History"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Click any report to view details, or export directly." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Export All CSV"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "w-[100px]",
						children: "ID"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Report Name" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Date"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Size"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filtered.map((r) => {
					const Icon = TYPE_ICONS[r.type];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
						className: "cursor-pointer",
						onClick: () => setSelected(r),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-mono text-xs text-muted-foreground",
								children: r.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-foreground leading-tight",
									children: r.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: r.product
								})] })]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "border-border/70 text-xs font-normal",
								children: TYPE_LABELS[r.type]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: `text-xs font-medium ${STATUS_STYLES[r.status]}`,
								children: [
									r.status === "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-1 h-3 w-3" }),
									r.status === "processing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "mr-1 h-3 w-3" }),
									r.status.charAt(0).toUpperCase() + r.status.slice(1)
								]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right text-sm text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-end gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3 w-3" }), r.date]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right text-sm text-muted-foreground tabular-nums",
								children: r.size
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-end gap-1",
									onClick: (e) => e.stopPropagation(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "h-7 w-7",
										onClick: () => setSelected(r),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "h-7 w-7",
										disabled: r.status !== "completed",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" })
									})]
								})
							})
						]
					}, r.id);
				}) })] }) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border/70 shadow-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "text-base",
					children: "Generated Reports"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Quickly access the most recently completed reports" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: REPORTS.filter((r) => r.status === "completed").slice(0, 3).map((r) => {
						const Icon = TYPE_ICONS[r.type];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setSelected(r),
							className: "group flex items-start gap-3 rounded-lg border border-border/60 p-4 text-left transition hover:border-primary/40 hover:bg-[color:var(--primary-soft)]/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-semibold text-foreground",
										children: r.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 text-xs text-muted-foreground",
										children: [
											r.date,
											" · ",
											r.size
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-center gap-1 text-xs text-primary opacity-0 transition group-hover:opacity-100",
										children: ["View report ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3 w-3" })]
									})
								]
							})]
						}, r.id);
					})
				}) })]
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportDetailModal, {
				report: selected,
				onClose: () => setSelected(null)
			})
		]
	});
}
//#endregion
export { ReportsPage as component };
