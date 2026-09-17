import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return `http://${hostname}:3001`;
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(`${getApiUrl()}${path}`, {
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
