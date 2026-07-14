import { redirect } from "@tanstack/react-router";

export type Role = "engineer" | "manager" | "admin" | "Packaging Engineer" | "Operations Manager" | "Admin";

export interface AuthUser {
  user_id?: string;
  email: string;
  name: string;
  role: Role;
  must_change_password?: boolean;
}

const USER_KEY = "packwise_user";
const TOKEN_KEY = "packwise_token";
const API_BASE = "http://localhost:8000";

// API Helpers
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthData(token: string, user: AuthUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAuthData() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

// User Actions
export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { 
    const u = JSON.parse(raw) as AuthUser; 
    if (u && u.role) {
      const r = u.role.toLowerCase();
      if (r.includes("engineer")) u.role = "engineer";
      else if (r.includes("manager")) u.role = "manager";
      else if (r.includes("admin")) u.role = "admin";
    }
    return u;
  } catch { return null; }
}

export function requireAuth() {
  const user = getUser();
  if (!user) {
    throw redirect({ to: "/login" });
  }
  // If user must change password and they are not currently on the change-password page
  // (We handle this check within the router or component to avoid infinite loops)
  return user;
}

export function roleHome(role: Role): string {
  return "/app/dashboard";
}

export async function loginApi(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(error.detail || "Login failed");
  }

  const data = await res.json();
  const token = data.access_token;

  // Fetch full profile
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  
  if (!meRes.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const profile = await meRes.json() as AuthUser;
  
  if (profile && profile.role) {
    const r = profile.role.toLowerCase();
    if (r.includes("engineer")) profile.role = "engineer";
    else if (r.includes("manager")) profile.role = "manager";
    else if (r.includes("admin")) profile.role = "admin";
  }
  
  setAuthData(token, profile);
  return profile;
}

export function logout() {
  clearAuthData();
}

export async function changePasswordApi(new_password: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ new_password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to change password" }));
    throw new Error(error.detail || "Failed to change password");
  }

  // Update local storage to reflect the change
  const user = getUser();
  if (user) {
    user.must_change_password = false;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export async function createUserApi(email: string, name: string, role: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE}/auth/create-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ email, name, role }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to create user" }));
    throw new Error(error.detail || "Failed to create user");
  }

  return await res.json();
}