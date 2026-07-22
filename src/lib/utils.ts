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

  if (firstLower === lastLower) {
    return first;
  }

  const firstWords = firstLower.split(/\s+/);
  const lastWords = lastLower.split(/\s+/);

  // If last name is already contained as a whole-word phrase in first name (e.g. first = "Gurjit Singh", last = "Singh")
  if (lastWords.every((word) => firstWords.includes(word))) {
    return first;
  }

  // If first name is already contained as a whole-word phrase in last name (e.g. first = "Singh", last = "Gurjit Singh")
  if (firstWords.every((word) => lastWords.includes(word))) {
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
