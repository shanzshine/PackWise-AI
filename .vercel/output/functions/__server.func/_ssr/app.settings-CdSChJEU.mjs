import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { C as Settings } from "../_libs/lucide-react.mjs";
import { t as PlaceholderPage } from "./placeholder-page-CB7CUziN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app.settings-CdSChJEU.js
var import_jsx_runtime = require_jsx_runtime();
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceholderPage, {
	title: "Settings",
	description: "Manage your profile, preferences, and notification rules.",
	icon: Settings,
	sections: [
		{
			title: "Profile",
			description: "Update personal information, password, and 2FA preferences."
		},
		{
			title: "Notifications",
			description: "Choose what triggers an email, in-app, or Slack alert."
		},
		{
			title: "Integrations",
			description: "Connect ERP, PLM, and shop floor systems to PackWise AI."
		}
	]
});
//#endregion
export { SplitComponent as component };
