import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const API_URL = "http://localhost:3001";

export async function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
  });
}

export async function requireAuth(router: AppRouterInstance) {
  const res = await apiFetch("/auth/me");

  if (!res.ok) {
    router.push("/login");
  }
}
