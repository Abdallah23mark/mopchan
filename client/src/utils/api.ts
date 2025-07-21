// client/src/utils/api.ts
import type { ApiError } from "../../../shared/types";

const API_ROOT = import.meta.env.VITE_API_URL || "";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let err: ApiError;
    try {
      err = await res.json();
    } catch {
      throw new Error(res.statusText);
    }
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_ROOT}${path}`, {
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(
  path: string,
  body: BodyInit,
  json = false
): Promise<T> {
  const headers: Record<string, string> = {};
  if (json) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_ROOT}${path}`, {
    method: "POST",
    headers,
    body,
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_ROOT}${path}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<T>(res);
}
