/**
 * Auth Library — Token management, JWT decode, and role helpers.
 *
 * Mirrors the old `front/public/common/authcheck.js` behavior.
 * Uses the same localStorage key ("viems.auth.token") to preserve
 * session compatibility with the legacy frontend.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

export const AUTH_TOKEN_KEY = "viems.auth.token";

// ─── Token Management ────────────────────────────────────────────────────────

/** Read the JWT token from localStorage. Returns null if absent. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/** Store a JWT token in localStorage. */
export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/** Remove the JWT token from localStorage. */
export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// ─── JWT Decode ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  email: string;
  iat: number;
  exp: number;
  [key: string]: unknown;
}

/**
 * Decode the payload segment of a JWT without verifying the signature.
 * Returns null if the token is malformed.
 */
export function getTokenPayload(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64url → Base64 → UTF-8 decode
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);

    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Check whether a valid, non-expired JWT exists in localStorage.
 */
export function isAuthenticated(): boolean {
  const payload = getTokenPayload();
  if (!payload || !payload.exp) return false;

  // JWT `exp` is in seconds; Date.now() is in milliseconds
  return Date.now() < payload.exp * 1000;
}

// ─── Role Helpers ────────────────────────────────────────────────────────────

interface UserWithRole {
  role?: { value?: string } | null;
}

/**
 * Returns true if the user's role is superadmin or supervisor.
 * Ported from `initGlobalObject.js` isUserAdmin().
 */
export function isAdmin(user: UserWithRole | null | undefined): boolean {
  if (!user?.role?.value) return false;
  const role = user.role.value.toLowerCase();
  return role === "superadmin" || role === "supervisor";
}

/**
 * Returns true if the user's role exactly matches the given value.
 * Ported from `initGlobalObject.js` isUserRole().
 */
export function isRole(
  user: UserWithRole | null | undefined,
  role: string
): boolean {
  if (!user?.role?.value) return false;
  return user.role.value.toLowerCase() === role.toLowerCase();
}
