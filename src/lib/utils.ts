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

  const isContiguousSubsequence = (sub: string[], arr: string[]): boolean => {
    if (sub.length === 0 || sub.length > arr.length) return false;
    for (let i = 0; i <= arr.length - sub.length; i++) {
      let match = true;
      for (let j = 0; j < sub.length; j++) {
        if (arr[i + j] !== sub[j]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
    return false;
  };

  // If last name is already contained as a contiguous phrase in first name
  if (isContiguousSubsequence(lastWords, firstWords)) {
    return first;
  }

  // If first name is already contained as a contiguous phrase in last name
  if (isContiguousSubsequence(firstWords, lastWords)) {
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
