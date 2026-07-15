/**
 * API Client — A thin fetch() wrapper with automatic auth, error handling,
 * and multipart/form-data support.
 *
 * Replaces the old axios-based `front/public/common/getData.js`.
 */

import { getToken, removeToken } from "./auth";

// ─── Custom Error ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  /** If true, return the raw Response object instead of parsed JSON */
  raw?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildUrl(url: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) return url;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  }
  const qs = searchParams.toString();
  return qs ? `${url}${url.includes("?") ? "&" : "?"}${qs}` : url;
}

function buildHeaders(
  options?: RequestOptions
): Record<string, string> | undefined {
  const headers: Record<string, string> = {};

  // Auto-attach auth token
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If body is FormData, do NOT set Content-Type — let the browser set the
  // boundary automatically. Otherwise default to JSON.
  if (options?.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Merge any caller-provided headers (they take priority)
  if (options?.headers) {
    Object.assign(headers, options.headers);
  }

  return headers;
}

// ─── Core Request ────────────────────────────────────────────────────────────

async function request<T = unknown>(
  method: string,
  url: string,
  options?: RequestOptions
): Promise<T> {
  const finalUrl = buildUrl(url, options?.params);
  const headers = buildHeaders(options);

  // Serialize body: FormData is sent as-is; objects are JSON-stringified
  let body: BodyInit | undefined;
  if (options?.body instanceof FormData) {
    body = options.body;
  } else if (options?.body !== undefined && options?.body !== null) {
    body = JSON.stringify(options.body);
  }

  const response = await fetch(finalUrl, { method, headers, body });

  // ── Handle auth errors globally ──────────────────────────────────────────
  if (response.status === 401) {
    removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Unauthorized — session expired.");
  }

  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      403,
      (errorData as { message?: string }).message || "Access denied.",
      errorData
    );
  }

  // ── Handle other HTTP errors ─────────────────────────────────────────────
  if (!response.ok) {
    let errorData: { message?: string; statusCode?: number } = {};
    try {
      errorData = await response.json();
    } catch {
      // response body is not JSON — ignore
    }
    throw new ApiError(
      response.status,
      errorData.message || `Request failed with status ${response.status}`,
      errorData
    );
  }

  // ── Return raw Response for non-JSON (file streams, etc.) ────────────────
  if (options?.raw) {
    return response as unknown as T;
  }

  // Check content-type to avoid parsing binary responses as JSON
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return response as unknown as T;
  }

  // ── Parse JSON ───────────────────────────────────────────────────────────
  const data = await response.json();
  return data as T;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const apiClient = {
  get<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return request<T>("GET", url, options);
  },

  post<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return request<T>("POST", url, options);
  },

  put<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return request<T>("PUT", url, options);
  },

  patch<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return request<T>("PATCH", url, options);
  },

  delete<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return request<T>("DELETE", url, options);
  },
};
