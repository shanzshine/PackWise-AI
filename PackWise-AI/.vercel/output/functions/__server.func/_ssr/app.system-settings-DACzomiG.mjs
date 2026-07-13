import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { L as Cog } from "../_libs/lucide-react.mjs";
import { t as PlaceholderPage } from "./placeholder-page-CB7CUziN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.system-settings-DACzomiG.js
var import_jsx_runtime = require_jsx_runtime();
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceholderPage, {
	title: "System Settings",
	description: "Configure organization-wide defaults, security, and integrations.",
	icon: Cog,
	sections: [
		{
			title: "Security policies",
			description: "SSO, session lifetimes, password requirements, and audit logging."
		},
		{
			title: "Billing",
			description: "Manage subscription tier, seat counts, and invoicing details."
		},
		{
			title: "Data residency",
			description: "Choose where your packaging data is stored and processed."
		}
	]
});
//#endregion
export { SplitComponent as component };
