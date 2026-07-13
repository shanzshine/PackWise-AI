import { redirect } from "@tanstack/react-router";

export type Role = "engineer" | "manager" | "admin";

export interface AuthUser {
  email: string;
  name: string;
  role: Role;
  company?: string;
}

const KEY = "packwise_user";

const DEMO: Record<string, AuthUser> = {
  "engineer@packwise.ai": { email: "engineer@packwise.ai", name: "Elena Park", role: "engineer", company: "ToyForge Industries" },
  "manager@packwise.ai": { email: "manager@packwise.ai", name: "Marcus Reid", role: "manager", company: "ToyForge Industries" },
  "admin@packwise.ai": { email: "admin@packwise.ai", name: "Avery Quinn", role: "admin", company: "PackWise AI" },
};

export function login(email: string): AuthUser | null {
  const user = DEMO[email.toLowerCase().trim()];
  if (!user) return null;
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

export function requireAuth() {
  const user = getUser();
  if (!user) throw redirect({ to: "/login" });
  return user;
}

export function roleHome(role: Role): string {
  return "/app/dashboard";
}