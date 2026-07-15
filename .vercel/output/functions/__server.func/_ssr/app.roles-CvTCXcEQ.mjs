import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { b as ShieldCheck } from "../_libs/lucide-react.mjs";
import { t as PlaceholderPage } from "./placeholder-page-CB7CUziN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.roles-CvTCXcEQ.js
var import_jsx_runtime = require_jsx_runtime();
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceholderPage, {
	title: "Role Assignment",
	description: "Define what each role can see and do across the platform.",
	icon: ShieldCheck,
	sections: [
		{
			title: "Engineer",
			description: "Run analyses, plan packaging, and export technical reports."
		},
		{
			title: "Operations Manager",
			description: "View KPIs, approve programs, and access executive summaries."
		},
		{
			title: "Administrator",
			description: "Manage accounts, billing, security, and global system settings."
		}
	]
});
//#endregion
export { SplitComponent as component };
