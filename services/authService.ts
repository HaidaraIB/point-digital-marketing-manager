/**
 * Auth service: JWT login, refresh, current user, logout.
 */
import { User, UserRole } from "../types.ts";
import { apiGet, apiUrl, isApiEnabled } from "./api.ts";

const TOKEN_PATH = "/api/auth/token/";
const REFRESH_PATH = "/api/auth/refresh/";
const ME_PATH = "/api/users/me/";

function mapApiRoleToUserRole(role: string): UserRole {
  if (role === "ADMIN") return UserRole.ADMIN;
  return UserRole.ACCOUNTANT;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export async function loginWithApi(credentials: LoginCredentials): Promise<User | null> {
  if (!isApiEnabled()) return null;
  const url = apiUrl(TOKEN_PATH);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  if (!res.ok) return null;
  const tokens: TokenResponse = await res.json();
  sessionStorage.setItem("noqta_access_token", tokens.access);
  sessionStorage.setItem("noqta_refresh_token", tokens.refresh);
  const me = await getCurrentUser();
  return me;
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isApiEnabled()) return null;
  const { data, ok } = await apiGet<{
    id: string;
    name: string;
    username: string;
    role: string;
    createdAt: string;
  }>(ME_PATH);
  if (!ok || !data) return null;
  return {
    id: String(data.id),
    name: data.name,
    username: data.username,
    role: mapApiRoleToUserRole(data.role),
    createdAt: data.createdAt || new Date().toISOString().slice(0, 10),
  };
}

export async function refreshToken(): Promise<boolean> {
  const refresh = sessionStorage.getItem("noqta_refresh_token");
  if (!refresh) return false;
  const url = apiUrl(REFRESH_PATH);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return false;
  const out: { access: string } = await res.json();
  sessionStorage.setItem("noqta_access_token", out.access);
  return true;
}

export function logoutApi(): void {
  sessionStorage.removeItem("noqta_access_token");
  sessionStorage.removeItem("noqta_refresh_token");
  sessionStorage.removeItem("noqta_user");
}

export function isApiAuthEnabled(): boolean {
  return isApiEnabled();
}
