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

export function getStatusBadgeStyle(statusStr: string): { bg: string; text: string; dot: string } {
  const norm = (statusStr || "").toLowerCase().replace(/_/g, " ").trim();
  if (norm.includes("approved") || norm.includes("assigned") || norm.includes("granted") || norm.includes("cleared")) {
    return { bg: "bg-[#E3F7EC]", text: "text-[#0B4627]", dot: "bg-[#1FC16B]" };
  }
  if (norm.includes("refused") || norm.includes("ineligible") || norm.includes("risk")) {
    return { bg: "bg-[#FFEBEC]", text: "text-[#681219]", dot: "bg-[#FB3748]" };
  }
  if (norm.includes("pending") || norm.includes("awaiting") || norm.includes("requested") || norm.includes("decision") || norm.includes("biometrics") || norm.includes("interview")) {
    return { bg: "bg-[#FFFAEB]", text: "text-[#855B00]", dot: "bg-[#F6B51E]" };
  }
  if (norm.includes("draft") || norm.includes("progress") || norm.includes("assessment") || norm.includes("submission")) {
    return { bg: "bg-[#EFEBFF]", text: "text-[#351A75]", dot: "bg-[#7D52F4]" };
  }
  if (norm.includes("withdrawn") || norm.includes("closed") || norm.includes("done") || norm.includes("archived")) {
    return { bg: "bg-[#F5F5F5]", text: "text-[#5C5C5C]", dot: "bg-[#7B7B7B]" };
  }
  return { bg: "bg-[#F5F5F5]", text: "text-[#5C5C5C]", dot: "bg-[#7B7B7B]" };
}

