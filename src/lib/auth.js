"use strict";
/**
 * Auth Library — Token management, JWT decode, and role helpers.
 *
 * Mirrors the old `front/public/common/authcheck.js` behavior.
 * Uses the same localStorage key ("viems.auth.token") to preserve
 * session compatibility with the legacy frontend.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_TOKEN_KEY = void 0;
exports.getToken = getToken;
exports.setToken = setToken;
exports.removeToken = removeToken;
exports.getTokenPayload = getTokenPayload;
exports.isAuthenticated = isAuthenticated;
exports.isAdmin = isAdmin;
exports.isRole = isRole;
// ─── Constants ───────────────────────────────────────────────────────────────
exports.AUTH_TOKEN_KEY = "viems.auth.token";
// ─── Token Management ────────────────────────────────────────────────────────
/** Read the JWT token from localStorage. Returns null if absent. */
function getToken() {
    if (typeof window === "undefined")
        return null;
    return localStorage.getItem(exports.AUTH_TOKEN_KEY);
}
/** Store a JWT token in localStorage. */
function setToken(token) {
    if (typeof window === "undefined")
        return;
    localStorage.setItem(exports.AUTH_TOKEN_KEY, token);
}
/** Remove the JWT token from localStorage. */
function removeToken() {
    if (typeof window === "undefined")
        return;
    localStorage.removeItem(exports.AUTH_TOKEN_KEY);
}
/**
 * Decode the payload segment of a JWT without verifying the signature.
 * Returns null if the token is malformed.
 */
function getTokenPayload() {
    const token = getToken();
    if (!token)
        return null;
    try {
        const parts = token.split(".");
        if (parts.length !== 3)
            return null;
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const binary = atob(base64);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        const json = new TextDecoder().decode(bytes);
        return JSON.parse(json);
    }
    catch {
        return null;
    }
}
/**
 * Check whether a valid, non-expired JWT exists in localStorage.
 */
function isAuthenticated() {
    const payload = getTokenPayload();
    if (!payload || !payload.exp)
        return false;
    // JWT `exp` is in seconds; Date.now() is in milliseconds
    return Date.now() < payload.exp * 1000;
}
/**
 * Returns true if the user's role is superadmin or supervisor.
 * Ported from `initGlobalObject.js` isUserAdmin().
 */
function isAdmin(user) {
    if (!user?.role?.value)
        return false;
    const role = user.role.value.toLowerCase();
    return role === "superadmin" || role === "supervisor";
}
/**
 * Returns true if the user's role exactly matches the given value.
 * Ported from `initGlobalObject.js` isUserRole().
 */
function isRole(user, role) {
    if (!user?.role?.value)
        return false;
    return user.role.value.toLowerCase() === role.toLowerCase();
}
