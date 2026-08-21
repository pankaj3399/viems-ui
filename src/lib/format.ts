/**
 * Formatting Utilities — Shared name formatting and initials helpers.
 */

export function formatTitleCase(str?: string | null): string {
  if (!str) return "";
  return str
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      if (w.includes("-")) {
        return w
          .split("-")
          .map((part) =>
            part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""
          )
          .join("-");
      }
      if (w.includes("'")) {
        return w
          .split("'")
          .map((part) =>
            part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""
          )
          .join("'");
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

export function formatFullName(first?: string, last?: string): string {
  const f = (first || "").trim();
  const l = (last || "").trim();
  if (!f && !l) return "";
  if (!l) return formatTitleCase(f);
  if (!f) return formatTitleCase(l);
  const formattedFirst = formatTitleCase(f);
  const formattedLast = formatTitleCase(l);
  if (formattedFirst.toLowerCase() === formattedLast.toLowerCase()) {
    return formattedFirst;
  }
  return `${formattedFirst} ${formattedLast}`.trim();
}

export function getInitials(name?: string | null): string {
  if (!name) return "UM";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "UM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
