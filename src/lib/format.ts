/**
 * Formatting Utilities — Shared name formatting and initials helpers.
 */

export function formatFullName(first?: string, last?: string): string {
  const f = (first || "").trim();
  const l = (last || "").trim();
  if (!f && !l) return "";
  return `${f} ${l}`.trim();
}

export function getInitials(name?: string): string {
  if (!name) return "MA";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
