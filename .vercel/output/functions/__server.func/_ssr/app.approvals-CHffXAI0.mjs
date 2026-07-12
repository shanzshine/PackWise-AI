import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-Bq5vK6RO.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { B as CircleCheck, O as Funnel, R as Clock, h as Search, z as CircleX } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-CtX3ithx.mjs";
import { n as PageHeader, t as Badge } from "./page-header-Dam7wNGy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.approvals-CHffXAI0.js
var import_jsx_runtime = require_jsx_runtime();
var APPROVALS_DATA = [
	{
		id: "REQ-092",
		sku: "Glamour Doll – Sparkle Edition",
		engineer: "Eng. Alice",
		date: "Today, 10:45 AM",
		risk: "Low",
		cost: "$0.38/unit",
		status: "Pending"
	},
	{
		id: "REQ-091",
		sku: "Action Hero Series 7",
		engineer: "Eng. Bob",
		date: "Yesterday, 3:15 PM",
		risk: "Medium",
		cost: "$0.45/unit",
		status: "Pending"
	},
	{
		id: "REQ-090",
		sku: "Fashion Doll Wardrobe Box",
		engineer: "Eng. Alice",
		date: "Mon, 09:20 AM",
		risk: "Low",
		cost: "$0.42/unit",
		status: "Approved"
	},
	{
		id: "REQ-089",
		sku: "Princess Castle Playset",
		engineer: "Eng. Charlie",
		date: "Last Fri, 11:10 AM",
		risk: "High",
		cost: "$0.55/unit",
		status: "Rejected"
	}
];
function ApprovalsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				title: "Attachment Approvals",
				description: "Review, approve, or reject pending attachment plans submitted by the engineering team."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search requests by SKU or ID...",
						className: "pl-9 bg-background"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "mr-2 h-4 w-4" }), " Filter"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4",
				children: APPROVALS_DATA.map((req) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border/70 shadow-none hover:border-primary/30 transition-colors",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${req.status === "Pending" ? "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)]" : req.status === "Approved" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]" : "bg-destructive/15 text-destructive"}`,
								children: req.status === "Pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-5 w-5" }) : req.status === "Approved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-base font-semibold text-foreground",
									children: req.sku
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "text-[10px] font-medium text-muted-foreground",
									children: req.id
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: [
									"Requested by ",
									req.engineer,
									" • ",
									req.date
								]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden md:block text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-medium uppercase text-muted-foreground",
										children: "Est. Cost"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: req.cost
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden md:block text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-medium uppercase text-muted-foreground",
										children: "Risk Level"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: `text-sm font-medium ${req.risk === "Low" ? "text-[color:var(--success)]" : req.risk === "Medium" ? "text-[color:var(--warning-foreground)]" : "text-destructive"}`,
										children: req.risk
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-2 w-full sm:w-auto",
									children: req.status === "Pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										className: "w-full sm:w-auto",
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: `/app/approvals/${req.id}`,
											children: "View Details"
										})
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "w-full sm:w-auto justify-center bg-muted text-muted-foreground",
										children: req.status
									})
								})
							]
						})]
					})
				}, req.id))
			})
		]
	});
}
//#endregion
export { ApprovalsPage as component };
