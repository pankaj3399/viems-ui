import { formatFullName, getInitials, getCaseAction } from "./utils";
import { getCountryInfo } from "./country";
import { CASE_STATUSES } from "@/app/(app)/cases/case-status-data";
import { RawCaseRecord, VISA_OUTCOME_CODES } from "@/types/api";

export interface CaseRow {
  id?: number | string;
  roleId?: number;
  caseId: string;
  country: string;
  countryCode: string;
  countryHalf: string;
  flag: string;
  name: string;
  group: string;
  avatarText?: string;
  avatarUrl?: string;
  status: string;
  statusColor: "warning" | "success" | "info" | "error" | "gray";
  migration: string;
  action: string;
  actionColor: "blue" | "red" | "yellow" | "gray";
  passportNumber?: string;
  refusalDate?: string;
  refusalReason?: string;
  outcome?: string | null;       // preserve server outcome on PATCH
  cosStatusValue?: string | null; // preserve server cosStatus on PATCH
  visa?: number;
  case_status?: string;
  migration_stage?: string;
  is_active?: boolean;
}

export function getStatusDetails(rawStatus?: string): { label: string; color: "success" | "warning" | "error" | "info" | "gray" } {
  if (!rawStatus) return { label: "Visa Approved", color: "gray" };
  const norm = rawStatus.toLowerCase().replace(/_/g, " ").trim();
  if (norm === "granted" || norm === "visa approved" || norm === "assigned" || norm === "cos assigned" || norm === "active" || norm === "done") {
    return { label: "Visa Approved", color: "success" };
  }
  if (norm === "refused" || norm === "visa refused") {
    return { label: "Visa Refused", color: "error" };
  }
  if (norm === "in progress" || norm === "in_progress" || norm === "drafting cos") {
    return { label: "Drafting CoS", color: "info" };
  }
  if (norm === "pending" || norm === "awaiting applicant docs") {
    return { label: "Awaiting applicant docs", color: "warning" };
  }
  if (norm === "withdrawn" || norm === "closed" || norm === "case closed" || norm === "archived") {
    return { label: "Case closed", color: "gray" };
  }

  const found = CASE_STATUSES.find(
    (s) => s.value.toLowerCase().replace(/_/g, " ").trim() === norm || s.label.toLowerCase().trim() === norm
  );
  if (found) {
    const color = found.dotColor === "#1FC16B" ? "success"
      : found.dotColor === "#F6B51E" ? "warning"
      : found.dotColor === "#335CFF" ? "info"
      : found.dotColor === "#FB3748" ? "error"
      : "gray";
    return { label: found.label, color };
  }

  return { label: rawStatus, color: "gray" };
}

export function mapBackendCaseToRow(c: RawCaseRecord, completedActions?: Set<string>): CaseRow {
  const name = formatFullName(c.first_name, c.last_name);
  const initials = getInitials(name);

  const { label: status, color: statusColor } = getStatusDetails(c.case_status);

  // Parse country info (full, code, half, flag)
  const { code: countryCode, full: countryName, half: countryHalf, flag } = getCountryInfo(c.nationality_value);

  // Migration stage mapping
  let migration = "ACTIVE COMPLIANCE";
  if (status === "Visa Refused" || status.toLowerCase().includes("refused")) {
    migration = "VISA REFUSED";
  } else if (status === "Case closed" || status.toLowerCase().includes("closed") || status.toLowerCase().includes("withdrawn")) {
    migration = "CASE CLOSED";
  } else if (status === "Awaiting applicant docs" || status === "Drafting CoS" || status.toLowerCase().includes("drafting") || status.toLowerCase().includes("awaiting")) {
    migration = "PENDING VISA";
  } else if (status === "Visa Approved" || status.toLowerCase().includes("approved")) {
    migration = "ARRIVED - RTW PENDING";
  } else if (c.migration_stage) {
    migration = String(c.migration_stage).toUpperCase();
  } else {
    migration = "ACTIVE COMPLIANCE";
  }

  // Action mapping unified across Dashboard and Cases
  const { action, actionColor } = getCaseAction(c, completedActions);

  const passportNumber = c.passport_number || c.passportNumber || "—";
  const refusalDate = c.refusal_date || c.refusalDate || "—";
  const refusalReason = c.refusal_reason || c.refusalReason || "—";
  const assignedGroup = c.group_name || "No Group";

  return {
    id: c.id,
    roleId: c.role || 1,
    caseId: c.caseIdDisplay || c.caseNumber || `${c.id}`,
    country: countryName,
    countryCode,
    countryHalf,
    flag,
    name,
    group: assignedGroup,
    avatarText: initials || "UM",
    avatarUrl: undefined,
    status,
    statusColor,
    migration,
    action,
    actionColor,
    passportNumber,
    refusalDate,
    refusalReason,
    outcome: c.outcome ?? null,
    cosStatusValue: c.cosStatus ?? null,
    visa: c.visa,
    case_status: c.case_status,
    migration_stage: c.migration_stage,
    is_active: c.is_active,
  };
}

export function getMappedCasesWithOverrides(rawCases: RawCaseRecord[]): CaseRow[] {
  let overrides: Record<string, string> = {};
  let completedActions = new Set<string>();
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("viems_case_status_overrides");
      if (saved) overrides = JSON.parse(saved);
    } catch (e) {
      console.error("Corrupt viems_case_status_overrides in localStorage, clearing key:", e);
      try { localStorage.removeItem("viems_case_status_overrides"); } catch (_) {}
    }
    try {
      const savedActions = localStorage.getItem("viems_completed_actions");
      if (savedActions) {
        const parsed = JSON.parse(savedActions);
        if (Array.isArray(parsed)) completedActions = new Set(parsed.map(String));
      }
    } catch (e) {
      console.error("Corrupt viems_completed_actions in localStorage, clearing key:", e);
      try { localStorage.removeItem("viems_completed_actions"); } catch (_) {}
    }
  }

  return rawCases.map((c) => {
    const row = mapBackendCaseToRow(c, completedActions);
    const overrideKey = c.id || c.caseNumber || row.caseId;
    if (overrideKey && overrides[overrideKey]) {
      const overrideStatus = overrides[overrideKey];
      const foundOption = CASE_STATUSES.find(
        (s) => s.value === overrideStatus || s.label === overrideStatus
      );
      if (foundOption) {
        row.status = foundOption.label;
        row.statusColor = foundOption.dotColor === "#1FC16B" ? "success"
          : foundOption.dotColor === "#F6B51E" ? "warning"
          : foundOption.dotColor === "#335CFF" ? "info"
          : foundOption.dotColor === "#FB3748" ? "error"
          : "gray";
      }
    }
    return row;
  });
}

export function isCaseRefused(c: CaseRow | RawCaseRecord): boolean {
  if (!c) return false;
  const s = String(c.status || c.case_status || "").toLowerCase();
  const m = String(c.migration || c.migration_stage || "").toLowerCase();
  return (
    s === "visa refused" ||
    s.includes("refused") ||
    m === "visa refused" ||
    m.includes("refused") ||
    c.visa === VISA_OUTCOME_CODES.REFUSED
  );
}
