import { ApiResponse } from "@shared/types";
interface ApiOptions extends RequestInit {
  token?: string | null;
}
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }
  const res = await fetch(path, { ...options, headers });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success || json.data === undefined) {
    if (res.status === 401) {
      console.error("Unauthorized access. Token might be expired.");
    }
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}