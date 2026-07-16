"use strict";
/**
 * API Client — A thin fetch() wrapper with automatic auth, error handling,
 * and multipart/form-data support.
 *
 * Replaces the old axios-based `front/public/common/getData.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.ApiError = void 0;
const auth_1 = require("./auth");
// ─── Custom Error ────────────────────────────────────────────────────────────
class ApiError extends Error {
    constructor(status, message, data) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}
exports.ApiError = ApiError;
// ─── Helpers ─────────────────────────────────────────────────────────────────
function buildUrl(url, params) {
    if (!params || Object.keys(params).length === 0)
        return url;
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            searchParams.append(key, value);
        }
    }
    const qs = searchParams.toString();
    return qs ? `${url}${url.includes("?") ? "&" : "?"}${qs}` : url;
}
function buildHeaders(options) {
    const headers = {};
    // Auto-attach auth token
    const token = (0, auth_1.getToken)();
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
async function request(method, url, options) {
    const finalUrl = buildUrl(url, options?.params);
    const headers = buildHeaders(options);
    // Serialize body: FormData is sent as-is; objects are JSON-stringified
    let body;
    if (options?.body instanceof FormData) {
        body = options.body;
    }
    else if (options?.body !== undefined && options?.body !== null) {
        body = JSON.stringify(options.body);
    }
    const response = await fetch(finalUrl, { method, headers, body });
    // ── Handle auth errors globally ──────────────────────────────────────────
    if (response.status === 401) {
        (0, auth_1.removeToken)();
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        throw new ApiError(401, "Unauthorized — session expired.");
    }
    if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(403, errorData.message || "Access denied.", errorData);
    }
    // ── Handle other HTTP errors ─────────────────────────────────────────────
    if (!response.ok) {
        let errorData = {};
        try {
            errorData = await response.json();
        }
        catch {
            // response body is not JSON — ignore
        }
        throw new ApiError(response.status, errorData.message || `Request failed with status ${response.status}`, errorData);
    }
    // ── Return raw Response for non-JSON (file streams, etc.) ────────────────
    if (options?.raw) {
        return response;
    }
    // Check content-type to avoid parsing binary responses as JSON
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        return response;
    }
    // ── Parse JSON ───────────────────────────────────────────────────────────
    const data = await response.json();
    return data;
}
// ─── Public API ──────────────────────────────────────────────────────────────
exports.apiClient = {
    get(url, options) {
        return request("GET", url, options);
    },
    post(url, options) {
        return request("POST", url, options);
    },
    put(url, options) {
        return request("PUT", url, options);
    },
    patch(url, options) {
        return request("PATCH", url, options);
    },
    delete(url, options) {
        return request("DELETE", url, options);
    },
};
