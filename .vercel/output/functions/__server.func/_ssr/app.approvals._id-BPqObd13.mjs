import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as getUser } from "./auth-ZX2vfegG.mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { C as Leaf, F as DollarSign, L as Clock, R as CircleX, T as Info, Z as ArrowLeft, f as ShieldAlert, t as Zap, z as CircleCheck } from "../_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { n as PageHeader, t as Badge } from "./page-header-Dam7wNGy.mjs";
import { n as loadAnalysis, t as DEMO_RESULT } from "./workflow-store-Hbw_5P2e.mjs";
import { t as Route } from "./app.approvals._id-CN2mVqkl.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.approvals._id-BPqObd13.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RISK_BADGE = {
	low: "bg-[color:var(--success)]/10 text-[color:var(--success)] border-transparent",
	medium: "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-transparent",
	high: "bg-destructive/10 text-destructive border-transparent"
};
var RISK_FILL = {
	low: "#22c55e",
	medium: "#f59e0b",
	high: "#ef4444"
};
var RISK_STROKE = {
	low: "#16a34a",
	medium: "#d97706",
	high: "#dc2626"
};
var ZONE_POSITIONS = {
	"Hair": {
		cx: 100,
		cy: 10
	},
	"Waist": {
		cx: 148,
		cy: 162
	},
	"Right Wrist": {
		cx: 182,
		cy: 188
	},
	"Left Foot": {
		cx: 72,
		cy: 358
	}
};
var ZONE_DETAIL = {
	"Hair": {
		cost: "$0.08",
		labor: "0.5 min",
		sustainability: 68,
		impact: "Reduces hair zone movement risk from Medium → Low"
	},
	"Waist": {
		cost: "$0.18",
		labor: "1.1 min",
		sustainability: 78,
		impact: "Stabilises torso pose geometry, 81% risk reduction"
	},
	"Right Wrist": {
		cost: "$0.12",
		labor: "0.7 min",
		sustainability: 82,
		impact: "Critical zone — eliminates high-risk displacement flag"
	},
	"Left Foot": {
		cost: "$0.00",
		labor: "0 min",
		sustainability: 100,
		impact: "Zone is stable — no attachment element required"
	}
};
function DollSVG({ zones, selected, onSelect }) {
	const bodyColor = "hsl(220 14% 18%)";
	const bodyStroke = "hsl(220 14% 26%)";
	const skinColor = "hsl(220 13% 22%)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex items-center justify-center py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 rounded-xl",
			style: {
				backgroundImage: "linear-gradient(hsl(220 14% 96%) 1px, transparent 1px), linear-gradient(90deg, hsl(220 14% 96%) 1px, transparent 1px)",
				backgroundSize: "20px 20px"
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 200 400",
			className: "relative z-10 h-[340px] w-auto drop-shadow-sm",
			xmlns: "http://www.w3.org/2000/svg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "100",
					cy: "42",
					r: "28",
					fill: skinColor,
					stroke: bodyStroke,
					strokeWidth: "1.5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: "94",
					y: "68",
					width: "12",
					height: "16",
					rx: "3",
					fill: skinColor,
					stroke: bodyStroke,
					strokeWidth: "1.5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M62 82 Q54 82 54 92 L54 168 Q54 182 100 185 Q146 182 146 168 L146 92 Q146 82 138 82 Z",
					fill: bodyColor,
					stroke: bodyStroke,
					strokeWidth: "1.5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M62 94 Q38 130 24 188",
					stroke: skinColor,
					strokeWidth: "18",
					fill: "none",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M62 94 Q38 130 24 188",
					stroke: bodyStroke,
					strokeWidth: "18",
					fill: "none",
					strokeLinecap: "round",
					strokeOpacity: "0.3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M138 94 Q162 130 176 188",
					stroke: skinColor,
					strokeWidth: "18",
					fill: "none",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M138 94 Q162 130 176 188",
					stroke: bodyStroke,
					strokeWidth: "18",
					fill: "none",
					strokeLinecap: "round",
					strokeOpacity: "0.3"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M82 188 L78 340",
					stroke: skinColor,
					strokeWidth: "20",
					fill: "none",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M82 188 L78 340",
					stroke: bodyStroke,
					strokeWidth: "20",
					fill: "none",
					strokeLinecap: "round",
					strokeOpacity: "0.25"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M118 188 L122 340",
					stroke: skinColor,
					strokeWidth: "20",
					fill: "none",
					strokeLinecap: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M118 188 L122 340",
					stroke: bodyStroke,
					strokeWidth: "20",
					fill: "none",
					strokeLinecap: "round",
					strokeOpacity: "0.25"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "72",
					cy: "352",
					rx: "18",
					ry: "10",
					fill: skinColor,
					stroke: bodyStroke,
					strokeWidth: "1.5"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "128",
					cy: "352",
					rx: "18",
					ry: "10",
					fill: skinColor,
					stroke: bodyStroke,
					strokeWidth: "1.5"
				}),
				zones.map((z, idx) => {
					const pos = ZONE_POSITIONS[z.zone];
					if (!pos) return null;
					const fill = RISK_FILL[z.riskLevel];
					const stroke = RISK_STROKE[z.riskLevel];
					const isSelected = selected === z.zone;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						className: "cursor-pointer",
						onClick: () => onSelect(z.zone),
						children: [
							isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: pos.cx,
								cy: pos.cy,
								r: "18",
								fill,
								fillOpacity: "0.2",
								stroke,
								strokeWidth: "1",
								strokeDasharray: "3 2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: pos.cx,
								y1: pos.cy,
								x2: pos.cx > 100 ? pos.cx + 14 : pos.cx - 14,
								y2: pos.cy,
								stroke,
								strokeWidth: "1",
								strokeDasharray: "3 2",
								opacity: "0.6"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: pos.cx,
								cy: pos.cy,
								r: "11",
								fill,
								fillOpacity: isSelected ? 1 : .85,
								stroke,
								strokeWidth: isSelected ? 2.5 : 1.5
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: pos.cx,
								y: pos.cy + 4,
								textAnchor: "middle",
								fill: "white",
								fontSize: "9",
								fontWeight: "bold",
								children: idx + 1
							})
						]
					}, z.zone);
				})
			]
		})]
	});
}
function ApprovalDetailsPage() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [analysis, setAnalysis] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const user = getUser();
	const isApprover = user?.role === "manager" || user?.role === "admin";
	(0, import_react.useEffect)(() => {
		const a = loadAnalysis() ?? DEMO_RESULT;
		setAnalysis(a);
		setSelected(a.attachmentZones?.[0]?.zone ?? null);
	}, []);
	const zones = analysis?.attachmentZones ?? DEMO_RESULT.attachmentZones;
	const productName = analysis?.productName ?? DEMO_RESULT.productName;
	const sel = zones.find((z) => z.zone === selected);
	const selDetail = selected ? ZONE_DETAIL[selected] : null;
	const handleApprove = () => {
		toast.success(`Request ${id} approved successfully.`);
		navigate({ to: "/app/approvals" });
	};
	const handleReject = () => {
		toast.error(`Request ${id} rejected.`);
		navigate({ to: "/app/approvals" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: `Approval Request: ${id}`,
				description: `Reviewing attachment plan for ${productName}`,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/app/approvals",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-1 h-4 w-4" }), " Back to Approvals"]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
				children: [
					{
						label: "Zones Secured",
						value: `${zones.filter((z) => z.recommendedMethod !== "No Attachment Required").length} / ${zones.length}`,
						icon: Zap
					},
					{
						label: "Est. Labor / Unit",
						value: "2.3 min",
						icon: Clock
					},
					{
						label: "Avg. Pose Stability",
						value: "90%",
						icon: ShieldAlert
					},
					{
						label: "Sustainability Score",
						value: "76/100",
						icon: Leaf
					}
				].map(({ label, value, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border/70 shadow-none",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5 flex items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--primary-soft)] text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xl font-bold text-foreground",
							children: value
						})] })]
					})
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Attachment Visualizer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Click a numbered marker to inspect the zone details" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "relative overflow-hidden rounded-xl bg-muted/20 p-4",
						style: { minHeight: 380 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollSVG, {
							zones,
							selected,
							onSelect: setSelected
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 lg:col-span-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border/70 shadow-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Zone Inspector"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Select a zone to view attachment details, risk level, and cost impact" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "space-y-2",
							children: zones.map((z, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setSelected(z.zone),
								className: `w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${selected === z.zone ? "border-primary bg-[color:var(--primary-soft)]/40" : "border-border/60 hover:border-primary/30 hover:bg-muted/30"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
										style: { background: RISK_FILL[z.riskLevel] },
										children: i + 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-semibold",
												children: z.zone
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "outline",
												className: `text-[10px] font-medium capitalize ${RISK_BADGE[z.riskLevel]}`,
												children: [z.riskLevel, " risk"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: z.bodyRegion
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "shrink-0 text-sm font-medium text-foreground",
										children: z.recommendedMethod
									})
								]
							}, z.zone))
						})]
					}), sel && selDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-[color:var(--primary)]/20 bg-[color:var(--primary-soft)]/20 shadow-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold",
									style: { background: RISK_FILL[sel.riskLevel] },
									children: zones.indexOf(sel) + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base",
									children: sel.zone
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: `text-[10px] font-medium capitalize ${RISK_BADGE[sel.riskLevel]}`,
									children: [sel.riskLevel, " risk"]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: sel.bodyRegion })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-4 mb-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-background border border-border/60 p-3 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "mx-auto h-4 w-4 text-muted-foreground mb-1" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Cost / Unit"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-lg font-bold",
											children: selDetail.cost
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-background border border-border/60 p-3 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "mx-auto h-4 w-4 text-muted-foreground mb-1" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Labor"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-lg font-bold",
											children: selDetail.labor
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-background border border-border/60 p-3 text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "mx-auto h-4 w-4 text-muted-foreground mb-1" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Sustainability"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-lg font-bold",
											children: selDetail.sustainability
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border/60 bg-background p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5",
									children: "Recommended Method"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium text-foreground",
									children: sel.recommendedMethod
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-start gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-3.5 w-3.5 shrink-0 text-primary mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: selDetail.impact
									})]
								})
							]
						})] })]
					})]
				})]
			}),
			isApprover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/30 shadow-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center justify-between gap-4 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base font-semibold",
						children: "Make a Decision"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-sm text-muted-foreground",
						children: "Approve this attachment plan to move it to production, or reject it back to the engineer."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							className: "text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20",
							onClick: handleReject,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "mr-2 h-4 w-4" }), " Reject Plan"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "bg-[color:var(--success)] text-white hover:bg-[color:var(--success)]/90",
							onClick: handleApprove,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-2 h-4 w-4" }), " Approve Plan"]
						})]
					})]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-border/70 bg-muted/20 shadow-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex items-center justify-between gap-4 p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base font-semibold",
						children: "Status: Under Review"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-sm text-muted-foreground",
						children: "This attachment plan is currently waiting for Operations Manager approval."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "border-[color:var(--warning)] text-[color:var(--warning-foreground)] px-3 py-1 text-xs",
						children: "Pending"
					})]
				})
			})
		]
	});
}
//#endregion
export { ApprovalDetailsPage as component };
