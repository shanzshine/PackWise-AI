//#region node_modules/.nitro/vite/services/ssr/assets/auth-ZX2vfegG.js
var KEY = "packwise_user";
var DEMO = {
	"engineer@packwise.ai": {
		email: "engineer@packwise.ai",
		name: "Elena Park",
		role: "engineer",
		company: "ToyForge Industries"
	},
	"manager@packwise.ai": {
		email: "manager@packwise.ai",
		name: "Marcus Reid",
		role: "manager",
		company: "ToyForge Industries"
	},
	"admin@packwise.ai": {
		email: "admin@packwise.ai",
		name: "Avery Quinn",
		role: "admin",
		company: "PackWise AI"
	}
};
function login(email) {
	const user = DEMO[email.toLowerCase().trim()];
	if (!user) return null;
	if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(user));
	return user;
}
function logout() {
	if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
function getUser() {
	if (typeof window === "undefined") return null;
	const raw = localStorage.getItem(KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
//#endregion
export { login as n, logout as r, getUser as t };
