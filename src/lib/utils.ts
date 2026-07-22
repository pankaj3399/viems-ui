import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFullName(firstName?: string, lastName?: string): string {
  const first = (firstName || "").trim();
  const last = (lastName || "").trim();

  if (!first && !last) return "Unknown Migrant";
  if (!last) return first;
  if (!first) return last;

  const firstLower = first.toLowerCase();
  const lastLower = last.toLowerCase();

  // If first name equals last name (e.g. "Singh", "Singh")
  if (firstLower === lastLower) {
    return first;
  }

  // If first name already ends with last name (e.g. "Gurjit Singh", "Singh")
  if (firstLower.endsWith(" " + lastLower)) {
    return first;
  }

  // If last name already starts with first name (e.g. "Taylor", "Taylor Johnson")
  if (lastLower.startsWith(firstLower + " ")) {
    return last;
  }

  return `${first} ${last}`;
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "UM";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
