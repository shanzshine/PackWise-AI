import { redirect } from "@tanstack/react-router";
import { supabase } from "./supabase";

export type Role = "engineer" | "manager" | "admin" | "Packaging Engineer" | "Product Manager" | "Admin";

export interface AuthUser {
  user_id?: string;
  email: string;
  name: string;
  role: Role;
  must_change_password?: boolean;
  company?: string;
}

const USER_KEY = "packwise_user";
const TOKEN_KEY = "packwise_token";
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

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
      if (r.includes("admin")) u.role = "admin";
      else if (r.includes("manager") || r === "pm" || r.includes("product")) u.role = "manager";
      else if (r.includes("engineer") || r === "pe") u.role = "engineer";
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
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && data?.session) {
      const token = data.session.access_token;
      const user_id = data.user.id;

      // Fetch full profile from Supabase
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('app_user')
          .select('*')
          .eq('user_id', user_id)
          .single();
        
        // DEBUG: log so we can see what's returned
        console.log("[PackWise Auth] user_id from Supabase Auth:", user_id);
        console.log("[PackWise Auth] profileData from app_user:", profileData);
        console.log("[PackWise Auth] profileError:", profileError);
          
        if (profileData) {
          const profile = profileData as AuthUser;
          if (profile && profile.role) {
            const r = profile.role.toLowerCase();
            console.log("[PackWise Auth] raw role from DB:", profile.role, "→ normalized r:", r);
            if (r.includes("admin")) profile.role = "admin";
            else if (r.includes("manager") || r === "pm" || r.includes("product")) profile.role = "manager";
            else if (r.includes("engineer") || r === "pe") profile.role = "engineer";
            console.log("[PackWise Auth] final role set to:", profile.role);
          }
          setAuthData(token, profile);
          return profile;
        }

        // app_user not found by user_id — try by email as fallback
        const { data: profileByEmail } = await supabase
          .from('app_user')
          .select('*')
          .eq('email', data.user.email || email)
          .single();
        console.log("[PackWise Auth] profileByEmail fallback:", profileByEmail);
        if (profileByEmail) {
          const profile = profileByEmail as AuthUser;
          if (profile && profile.role) {
            const r = profile.role.toLowerCase();
            if (r.includes("admin")) profile.role = "admin";
            else if (r.includes("manager") || r === "pm" || r.includes("product")) profile.role = "manager";
            else if (r.includes("engineer") || r === "pe") profile.role = "engineer";
          }
          setAuthData(token, profile);
          return profile;
        }
      } catch (pe) {
        console.warn("Could not fetch user profile from Supabase:", pe);
      }

      const profile: AuthUser = {
        user_id: user_id,
        email: data.user.email || email,
        name: data.user.user_metadata?.name || email.split("@")[0],
        role: (data.user.user_metadata?.role as Role) || "engineer",
      };
      setAuthData(token, profile);
      return profile;
    }
  } catch (err: any) {
    console.warn("Supabase auth network or service error, using local fallback:", err);
  }

  // Fallback / Offline / Demo login when Supabase is unconfigured or unreachable
  const cleanEmail = email.toLowerCase().trim();
  let role: Role = "engineer";
  const nameParts = cleanEmail.split("@")[0].split(/[._-]/);
  const name = nameParts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

  if (cleanEmail.includes("admin")) {
    role = "admin";
  } else if (cleanEmail.includes("manager") || cleanEmail.includes(".pm") || cleanEmail.includes("_pm") || cleanEmail.startsWith("pm.")) {
    role = "manager";
  }

  const demoUser: AuthUser = {
    user_id: "usr-" + Math.random().toString(36).substring(2, 9),
    email: cleanEmail,
    name: name || "Demo User",
    role: role,
    must_change_password: false,
    company: "PackWise AI Demo",
  };

  setAuthData("demo-session-token", demoUser);
  return demoUser;
}

export async function logout() {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn("Supabase signOut error ignored:", e);
  }
  clearAuthData();
}

export async function changePasswordApi(new_password: string): Promise<void> {
  try {
    await supabase.auth.updateUser({ password: new_password });
  } catch (e) {
    console.warn("Supabase updateUser error ignored:", e);
  }
  
  const user = getUser();
  if (user) {
    if (user.user_id) {
      try {
        await supabase.from('app_user').update({ must_change_password: false }).eq('user_id', user.user_id);
      } catch (e) {
        console.warn("Update app_user error ignored:", e);
      }
    }
    user.must_change_password = false;
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }
}

export async function createUserApi(email: string, name: string, role: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  try {
    const res = await fetch(`${API_BASE}/auth/create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ email, name, role }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Backend create-user error, using local mock fallback:", e);
  }

  return {
    id: "usr-" + Math.random().toString(36).substring(2, 9),
    email,
    name,
    role,
    temporary_password: "TempPass" + Math.floor(1000 + Math.random() * 9000),
    note: "User created in local workspace mode.",
  };
}