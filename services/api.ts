/**
 * API client for Point Digital Marketing Manager (v4).
 * Uses JWT from authService; base URL from VITE_API_URL.
 */

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "";
};

const getToken = (): string | null => {
  return sessionStorage.getItem("noqta_access_token");
};

const getApiKey = (): string | undefined => import.meta.env.VITE_API_KEY;

/** Headers for requests that don't have a token yet (e.g. login, refresh). */
export const getApiHeaders = (): HeadersInit => {
  const apiKey = getApiKey();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (apiKey) headers["X-API-Key"] = apiKey;
  return headers;
};

const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  const apiKey = getApiKey();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (apiKey) headers["X-API-Key"] = apiKey;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export const apiUrl = (path: string): string => {
  const base = getBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : "";
};

export const isApiEnabled = (): boolean => !!getBaseUrl();

export interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const data = await res.json().catch(() => ({}));
  return { data: data as T, status: res.status, ok: res.ok };
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const url = apiUrl(path);
  if (!url) throw new Error("API URL not configured");
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const url = apiUrl(path);
  if (!url) throw new Error("API URL not configured");
  const res = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const url = apiUrl(path);
  if (!url) throw new Error("API URL not configured");
  const res = await fetch(url, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const url = apiUrl(path);
  if (!url) throw new Error("API URL not configured");
  const res = await fetch(url, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiDelete(path: string): Promise<ApiResponse<unknown>> {
  const url = apiUrl(path);
  if (!url) throw new Error("API URL not configured");
  const res = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  return handleResponse<unknown>(res);
}
