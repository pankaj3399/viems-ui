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

export type CasePipelineStage = "PRE-COS" | "COS MANAGEMENT" | "VISA" | "ACTIVE" | "CLOSED";

export function classifyCaseStage(c: any): CasePipelineStage {
  const status = String(c.case_status || c.status || "").toLowerCase().replace(/_/g, " ").trim();
  const migration = String(c.migration_stage || c.migration || "").toLowerCase().replace(/_/g, " ").trim();

  // 1. Closed or Archived cases
  if (
    status.includes("closed") ||
    status.includes("archive") ||
    status.includes("withdrawn") ||
    status.includes("delete") ||
    migration.includes("closed")
  ) {
    return "CLOSED";
  }

  // 2. CoS Management (assigned CoS, CoS allocation)
  if (
    status.includes("assigned") ||
    status === "cos management" ||
    Boolean(c.cosStatus || c.cosStatusValue) ||
    (status.includes("cos") && !status.includes("draft"))
  ) {
    return "COS MANAGEMENT";
  }

  // 3. Pre-CoS (Drafting, awaiting applicant docs, eligibility assessment)
  if (
    status.includes("draft") ||
    status.includes("awaiting") ||
    status.includes("pre") ||
    status.includes("eligibility") ||
    migration.includes("departure")
  ) {
    return "PRE-COS";
  }

  // 4. Visa (Refused, Pending decision)
  if (
    status.includes("refused") ||
    status.includes("visa refused") ||
    status === "pending" ||
    c.visa === 2 ||
    c.visa === 4
  ) {
    return "VISA";
  }

  // 5. Active (Approved, Active, Granted, Done, In UK, Active Compliance)
  if (
    status.includes("approved") ||
    status.includes("granted") ||
    status.includes("done") ||
    status.includes("active") ||
    c.is_active === true ||
    c.visa === 1 ||
    migration.includes("entered") ||
    migration.includes("active") ||
    migration.includes("in uk") ||
    migration.includes("arrived")
  ) {
    return "ACTIVE";
  }

  return "ACTIVE";
}

export function getCaseAction(c: any, completedActions?: Set<string>): { action: string; actionColor: "blue" | "red" | "yellow" | "gray" } {
  const isActionDone = completedActions && (
    completedActions.has(String(c.id)) ||
    completedActions.has(String(c.caseIdNumber)) ||
    completedActions.has(String(c.caseNumber)) ||
    completedActions.has(String(c.caseIdDisplay))
  );

  if (isActionDone) {
    return { action: "No action required", actionColor: "gray" };
  }

  const status = String(c.case_status || c.status || "").toLowerCase().replace(/_/g, " ").trim();

  if (status.includes("refused")) {
    return { action: "Review and report", actionColor: "red" };
  }
  if (status.includes("awaiting") || status === "pending") {
    return { action: "Upload passport", actionColor: "blue" };
  }

  const modAction = (Number(c.id) || 0) % 6;
  switch (modAction) {
    case 0:
      return { action: "No action required", actionColor: "gray" };
    case 1:
      return { action: "Check RTW", actionColor: "red" };
    case 2:
      return { action: "Upload passport", actionColor: "blue" };
    case 3:
      return { action: "Review and report", actionColor: "red" };
    case 4:
      return { action: "Schedule RTW check", actionColor: "yellow" };
    case 5:
      return { action: "Finalise offboarding", actionColor: "red" };
    default:
      return { action: "No action required", actionColor: "gray" };
  }
}

