const BASE_URL: string = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "auth_token";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  body?: unknown;
  token?: string | null;
}

function resolveToken(explicit?: string | null): string | null {
  if (explicit === null) return null;
  if (explicit) return explicit;
  return localStorage.getItem(TOKEN_KEY);
}

function buildHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const resolved = resolveToken(token);
  if (resolved) {
    headers["Authorization"] = `Bearer ${resolved}`;
  }
  return headers;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, token } = options;
  const url = `${BASE_URL}${path}`;
  const headers = buildHeaders(token);

  const init: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined && method !== "GET") {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(url, init);

  if (response.status === 204) {
    return undefined as T;
  }

  let data: unknown;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { detail: text } : {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    const detail =
      data && typeof data === "object" && "detail" in data
        ? (data as Record<string, unknown>).detail
        : response.statusText;
    throw new ApiError(response.status, String(detail || response.statusText));
  }

  return data as T;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiGet<T>(
  path: string,
  token?: string | null
): Promise<T> {
  return request<T>("GET", path, { token });
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string | null
): Promise<T> {
  return request<T>("POST", path, { body, token });
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  token?: string | null
): Promise<T> {
  return request<T>("PUT", path, { body, token });
}

export async function apiDelete<T>(
  path: string,
  token?: string | null
): Promise<T> {
  return request<T>("DELETE", path, { token });
}
