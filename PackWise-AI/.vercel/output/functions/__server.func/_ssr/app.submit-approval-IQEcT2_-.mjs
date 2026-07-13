import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { B as CircleCheck, C as Leaf, I as DollarSign, f as ShieldAlert, m as Send } from "../_libs/lucide-react.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-CtX3ithx.mjs";
import { n as PageHeader, t as Badge } from "./page-header-Dam7wNGy.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.submit-approval-IQEcT2_-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SubmitApprovalPage() {
	const navigate = useNavigate();
	const [isSubmitted, setIsSubmitted] = (0, import_react.useState)(false);
	const handleSubmit = () => {
		setIsSubmitted(true);
		toast.success("Attachment plan successfully submitted to Operations Manager.");
		setTimeout(() => {
			navigate({ to: "/app/dashboard" });
		}, 2e3);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Submit Plan for Approval",
			description: "Review the finalized attachment plan, including cost and risk metrics, before submitting to the Operations Manager."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:col-span-2 space-y-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex flex-row items-center justify-between pb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Selected Plan: Glamour Doll – Sparkle Edition"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: ["Generated on ", (/* @__PURE__ */ new Date()).toLocaleDateString()] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							className: "bg-[color:var(--primary-soft)] text-primary border-transparent",
							children: "Ready to Submit"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-muted/40 p-4 border border-border/50",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-5 w-5 text-muted-foreground mb-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground uppercase font-semibold",
											children: "Total Cost"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xl font-bold mt-1",
											children: ["$0.38 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-normal text-muted-foreground",
												children: "/ unit"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-muted/40 p-4 border border-border/50",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-5 w-5 text-muted-foreground mb-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground uppercase font-semibold",
											children: "Risk Level"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xl font-bold text-[color:var(--success)] mt-1",
											children: ["Low ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-normal text-muted-foreground",
												children: "(44/100)"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-muted/40 p-4 border border-border/50",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Leaf, { className: "h-5 w-5 text-muted-foreground mb-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground uppercase font-semibold",
											children: "Sustainability"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xl font-bold text-[color:var(--success)] mt-1",
											children: ["78 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-normal text-muted-foreground",
												children: "/ 100"
											})]
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-sm font-semibold mb-3",
							children: "Plan Summary"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: [
								"3 active attachment zones (Hair, Waist, Right Wrist)",
								"Optimal material efficiency (EVA & PET mix)",
								"87% predicted drop-test pass rate (Grade B+)",
								"Estimated labor: 2.3 min per unit"
							].map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-[color:var(--success)] shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-foreground",
									children: item
								})]
							}, i))
						})] })]
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-[color:var(--primary)]/30 bg-[color:var(--primary-soft)]/20 shadow-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base",
						children: "Submit to Manager"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "This will notify the Operations Manager to review your plan." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full h-12 text-base font-semibold bg-[color:var(--success)] hover:bg-[color:var(--success)]/90 text-white",
						onClick: handleSubmit,
						disabled: isSubmitted,
						children: isSubmitted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Submitted Successfully ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "ml-2 h-5 w-5" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Submit Plan ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "ml-2 h-4 w-4" })] })
					}) })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/70 shadow-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm",
							children: "Approval Workflow"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-6 w-6 rounded-full bg-[color:var(--success)]/20 text-[color:var(--success)] flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-8 bg-border my-1" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pt-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: "Plan Finalized"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Cost & risk analysis complete"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-2 rounded-full bg-primary" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-px h-8 bg-border my-1" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pt-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: "Submit to Manager"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Awaiting your submission"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-col items-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1.5 w-1.5 rounded-full bg-muted-foreground" })
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pt-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-muted-foreground",
										children: "Manager Review"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Approval required for production"
									})]
								})]
							})
						]
					})]
				})]
			})]
		})]
	});
}
//#endregion
export { SubmitApprovalPage as component };
