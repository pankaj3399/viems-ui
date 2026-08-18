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

const STATUS_BADGE_STYLES = {
  success: { bg: "bg-[#E3F7EC]", text: "text-[#0B4627]", dot: "bg-[#1FC16B]" },
  warning: { bg: "bg-[#FFFAEB]", text: "text-[#855B00]", dot: "bg-[#F6B51E]" },
  danger: { bg: "bg-[#FFEBEC]", text: "text-[#681219]", dot: "bg-[#FB3748]" },
  purple: { bg: "bg-[#EFEBFF]", text: "text-[#351A75]", dot: "bg-[#7D52F4]" },
  neutral: { bg: "bg-[#F5F5F5]", text: "text-[#5C5C5C]", dot: "bg-[#7B7B7B]" },
};

const EXACT_STATUS_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  // Green / Approved / Active
  "visa approved": STATUS_BADGE_STYLES.success,
  "cos assigned": STATUS_BADGE_STYLES.success,
  "cleared for sponsorship": STATUS_BADGE_STYLES.success,
  "active compliance": STATUS_BADGE_STYLES.success,
  "assigned": STATUS_BADGE_STYLES.success,
  "granted": STATUS_BADGE_STYLES.success,
  "cleared": STATUS_BADGE_STYLES.success,
  "active": STATUS_BADGE_STYLES.success,

  // Yellow / Pending / In-progress reviews
  "awaiting applicant docs": STATUS_BADGE_STYLES.warning,
  "awaiting ukvi decision": STATUS_BADGE_STYLES.warning,
  "awaiting biometrics": STATUS_BADGE_STYLES.warning,
  "awaiting interview": STATUS_BADGE_STYLES.warning,
  "info requested": STATUS_BADGE_STYLES.warning,
  "additional docs requested": STATUS_BADGE_STYLES.warning,
  "pending": STATUS_BADGE_STYLES.warning,
  "pre arrival": STATUS_BADGE_STYLES.warning,
  "pre-arrival": STATUS_BADGE_STYLES.warning,

  // Purple / Process / Drafting
  "eligibility assessment": STATUS_BADGE_STYLES.purple,
  "drafting cos": STATUS_BADGE_STYLES.purple,
  "ready for submission": STATUS_BADGE_STYLES.purple,
  "in progress": STATUS_BADGE_STYLES.purple,
  "assessment": STATUS_BADGE_STYLES.purple,
  "submission": STATUS_BADGE_STYLES.purple,

  // Red / Refused / Ineligible
  "visa refused": STATUS_BADGE_STYLES.danger,
  "ineligible high risk": STATUS_BADGE_STYLES.danger,
  "ineligible / high risk": STATUS_BADGE_STYLES.danger,
  "refused": STATUS_BADGE_STYLES.danger,
  "ineligible": STATUS_BADGE_STYLES.danger,
  "high risk": STATUS_BADGE_STYLES.danger,
  "sponsorship withdrawn": STATUS_BADGE_STYLES.danger,

  // Gray / Neutral / Inactive / Draft
  "draft": STATUS_BADGE_STYLES.neutral,
  "case closed": STATUS_BADGE_STYLES.neutral,
  "application withdrawn": STATUS_BADGE_STYLES.neutral,
  "withdrawn": STATUS_BADGE_STYLES.neutral,
  "closed": STATUS_BADGE_STYLES.neutral,
  "archived": STATUS_BADGE_STYLES.neutral,
  "done": STATUS_BADGE_STYLES.neutral,
};

export function getStatusBadgeStyle(statusStr: string): { bg: string; text: string; dot: string } {
  if (!statusStr) return STATUS_BADGE_STYLES.neutral;
  const norm = statusStr.toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ").trim();
  if (EXACT_STATUS_MAP[norm]) {
    return EXACT_STATUS_MAP[norm];
  }
  return STATUS_BADGE_STYLES.neutral;
}

