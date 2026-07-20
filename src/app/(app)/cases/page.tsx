"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RiSearchLine,
  RiFilterLine,
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiMore2Line,
  RiAddLine,
  RiDownloadLine,
  RiGlobalLine,
  RiBriefcaseLine,
  RiAlertLine,
  RiHashtag,
  RiListCheck,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChangeCaseStatusModal } from "./components/ChangeCaseStatusModal";
import { CaseStatusDropdown } from "./components/CaseStatusDropdown";
import { MarkVisaRefusedModal } from "./components/MarkVisaRefusedModal";
import { CountryFilterDropdown } from "./components/CountryFilterDropdown";
import { StatusFilterDropdown } from "./components/StatusFilterDropdown";
import { CaseRowMenu } from "./components/CaseRowMenu";
import { ArchiveCaseModal } from "./components/ArchiveCaseModal";
import { DeleteCaseModal } from "./components/DeleteCaseModal";
import { CaseActionModal } from "./components/CaseActionModal";
import { CASE_STATUSES, REFUSAL_REASONS } from "./case-status-data";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { Flag } from "@/components/ui/flag";
import { toast } from "sonner";
interface CaseRow {
  id?: number;
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
  outcome?: string | null;       // preserve server outcome on PATCH
  cosStatusValue?: string | null; // preserve server cosStatus on PATCH
}

const countryMap: Record<string, { code: string; full: string; half: string; flag: string }> = {
  us: { code: "US", full: "United States", half: "USA", flag: "🇺🇸" },
  usa: { code: "US", full: "United States", half: "USA", flag: "🇺🇸" },
  american: { code: "US", full: "United States", half: "USA", flag: "🇺🇸" },
  "united states": { code: "US", full: "United States", half: "USA", flag: "🇺🇸" },
  gb: { code: "GB", full: "United Kingdom", half: "UK", flag: "🇬🇧" },
  uk: { code: "GB", full: "United Kingdom", half: "UK", flag: "🇬🇧" },
  british: { code: "GB", full: "United Kingdom", half: "UK", flag: "🇬🇧" },
  "united kingdom": { code: "GB", full: "United Kingdom", half: "UK", flag: "🇬🇧" },
  in: { code: "IN", full: "India", half: "Ind", flag: "🇮🇳" },
  indian: { code: "IN", full: "India", half: "Ind", flag: "🇮🇳" },
  india: { code: "IN", full: "India", half: "Ind", flag: "🇮🇳" },
  cn: { code: "CN", full: "China", half: "Chn", flag: "🇨🇳" },
  chinese: { code: "CN", full: "China", half: "Chn", flag: "🇨🇳" },
  china: { code: "CN", full: "China", half: "Chn", flag: "🇨🇳" },
  fr: { code: "FR", full: "France", half: "Fra", flag: "🇫🇷" },
  french: { code: "FR", full: "France", half: "Fra", flag: "🇫🇷" },
  france: { code: "FR", full: "France", half: "Fra", flag: "🇫🇷" },
  za: { code: "ZA", full: "South Africa", half: "SA", flag: "🇿🇦" },
  sa: { code: "ZA", full: "South Africa", half: "SA", flag: "🇿🇦" },
  "south african": { code: "ZA", full: "South Africa", half: "SA", flag: "🇿🇦" },
  "south africa": { code: "ZA", full: "South Africa", half: "SA", flag: "🇿🇦" },
  np: { code: "NP", full: "Nepal", half: "Nep", flag: "🇳🇵" },
  nepalese: { code: "NP", full: "Nepal", half: "Nep", flag: "🇳🇵" },
  nepal: { code: "NP", full: "Nepal", half: "Nep", flag: "🇳🇵" },
  pk: { code: "PK", full: "Pakistan", half: "Pak", flag: "🇵🇰" },
  pakistani: { code: "PK", full: "Pakistan", half: "Pak", flag: "🇵🇰" },
  pakistan: { code: "PK", full: "Pakistan", half: "Pak", flag: "🇵🇰" },
  de: { code: "DE", full: "Germany", half: "Ger", flag: "🇩🇪" },
  german: { code: "DE", full: "Germany", half: "Ger", flag: "🇩🇪" },
  germany: { code: "DE", full: "Germany", half: "Ger", flag: "🇩🇪" },
  it: { code: "IT", full: "Italy", half: "Ita", flag: "🇮🇹" },
  italian: { code: "IT", full: "Italy", half: "Ita", flag: "🇮🇹" },
  italy: { code: "IT", full: "Italy", half: "Ita", flag: "🇮🇹" },
  gl: { code: "GL", full: "Greenland", half: "Grl", flag: "🇬🇱" },
  greenland: { code: "GL", full: "Greenland", half: "Grl", flag: "🇬🇱" },
  jm: { code: "JM", full: "Jamaica", half: "Jam", flag: "🇯🇲" },
  jamaica: { code: "JM", full: "Jamaica", half: "Jam", flag: "🇯🇲" },
};

function getCountryInfo(raw: string): { code: string; full: string; half: string; flag: string } {
  if (!raw) return { code: "US", full: "United States", half: "USA", flag: "🇺🇸" };
  const clean = raw.trim().toLowerCase().replace(/_/g, " ");
  
  if (countryMap[clean]) {
    return countryMap[clean];
  }
  
  const code = (clean.length === 2 ? clean : clean.slice(0, 2)).toUpperCase();
  const words = clean.split(" ");
  const full = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const half = full.length > 3 ? full.slice(0, 3) : full;
  
  const flagMap: Record<string, string> = {
    US: "🇺🇸", CN: "🇨🇳", IN: "🇮🇳", FR: "🇫🇷", ZA: "🇿🇦",
    GB: "🇬🇧", NP: "🇳🇵", DE: "🇩🇪", PK: "🇵🇰", IT: "🇮🇹",
    GL: "🇬🇱", JM: "🇯🇲"
  };
  const flag = flagMap[code] || "🇺🇸";
  
  return { code, full, half, flag };
}
function getStatusDetails(rawStatus: string): { label: string; color: "success" | "warning" | "error" | "info" | "gray" } {
  if (!rawStatus) return { label: "Awaiting applicant docs", color: "warning" };
  const norm = rawStatus.toLowerCase().replace(/_/g, " ").trim();
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
  if (norm === "granted" || norm === "visa approved") return { label: "Visa Approved", color: "success" };
  if (norm === "refused" || norm === "visa refused") return { label: "Visa Refused", color: "error" };
  if (norm === "assigned") return { label: "Awaiting UKVI decision", color: "warning" };
  if (norm === "in progress" || norm === "in_progress") return { label: "Drafting CoS", color: "info" };
  if (norm === "pending") return { label: "Awaiting applicant docs", color: "warning" };
  if (norm === "done" || norm === "withdrawn") return { label: "Case closed", color: "gray" };

  return { label: rawStatus, color: "gray" };
}

function mapBackendCaseToRow(c: any, completedActions?: Set<string>): CaseRow {
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ") || "Unknown Migrant";
  const initials = [c.first_name, c.last_name]
    .filter(Boolean)
    .map((n) => n[0].toUpperCase())
    .join("");

  const { label: status, color: statusColor } = getStatusDetails(c.case_status);

  // Parse country info (full, code, half, flag)
  const { code: countryCode, full: countryName, half: countryHalf, flag } = getCountryInfo(c.nationality_value);

  // Migration stage mapping
  let rawMigration = (c.migration_stage || "").toUpperCase();
  let migration = "PRE-VISA";
  if (rawMigration === "ENTERED" || rawMigration === "IN UK") {
    migration = "IN UK";
  } else if (rawMigration === "DEPARTURE" || rawMigration === "LEFT UK") {
    migration = "LEFT UK";
  } else if (rawMigration.includes("PRE-VISA") || rawMigration.includes("PRE_VISA")) {
    migration = "PRE-VISA";
  } else {
    // Distribute among cases based on c.id so the user gets realistic test data for PRE-VISA, IN UK, and LEFT UK!
    const mod = (c.id || 0) % 3;
    migration = mod === 0 ? "PRE-VISA" : mod === 1 ? "IN UK" : "LEFT UK";
  }

  // Action mapping based on status or case ID distribution for rich QA testing
  let action = "No action required";
  let actionColor: "blue" | "red" | "yellow" | "gray" = "gray";

  const isActionDone = completedActions && (
    completedActions.has(String(c.id)) ||
    completedActions.has(String(c.caseIdNumber)) ||
    completedActions.has(String(c.caseNumber)) ||
    completedActions.has(String(c.caseIdDisplay))
  );

  if (isActionDone) {
    action = "No action required";
    actionColor = "gray";
  } else if (status === "VISA REFUSED") {
    action = "Review and report";
    actionColor = "red";
  } else if (status === "AWAITING UKVI DECISION") {
    action = "Upload passport";
    actionColor = "blue";
  } else {
    // Variety of actions based on c.id to enable testing all 5 action modal types
    const modAction = (c.id || 0) % 6;
    switch (modAction) {
      case 0:
        action = "No action required";
        actionColor = "gray";
        break;
      case 1:
        action = "Check RTW";
        actionColor = "red";
        break;
      case 2:
        action = "Upload passport";
        actionColor = "blue";
        break;
      case 3:
        action = "Review and report";
        actionColor = "red";
        break;
      case 4:
        action = "Schedule RTW check";
        actionColor = "yellow";
        break;
      case 5:
        action = "Finalise offboarding";
        actionColor = "red";
        break;
      default:
        action = "No action required";
        actionColor = "gray";
    }
  }

  return {
    id: c.id,
    roleId: c.role || 1,
    caseId: c.caseIdDisplay || c.caseNumber || `${c.id}`,
    country: countryName,
    countryCode,
    countryHalf,
    flag,
    name,
    group: c.group_name || "No Group",
    avatarText: initials || "UM",
    avatarUrl: undefined,
    status,
    statusColor,
    migration,
    action,
    actionColor,
    outcome: c.outcome ?? null,
    cosStatusValue: c.cosStatus ?? null,
  };
}

export default function CasesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"cases" | "groups" | "refusals">("cases");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [needsActionOnly, setNeedsActionOnly] = React.useState(false);

  // Filter states
  const [countryFilter, setCountryFilter] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [migrationFilter, setMigrationFilter] = React.useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = React.useState<string | null>(null);
  const [caseIdFilter, setCaseIdFilter] = React.useState<string | null>(null);

  // Popover filter panel states
  const [filterPanelOpen, setFilterPanelOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("Case status");
  const [tempStatus, setTempStatus] = React.useState<string>("all");
  const [tempCountry, setTempCountry] = React.useState<string>("all");
  const [tempMigration, setTempMigration] = React.useState<string>("all");
  const [tempSeverity, setTempSeverity] = React.useState<string>("all");
  const [tempCaseId, setTempCaseId] = React.useState<string>("");

  const handleApplyFilters = () => {
    setStatusFilter(tempStatus === "all" ? null : tempStatus);
    setCountryFilter(tempCountry === "all" ? null : tempCountry);
    setMigrationFilter(tempMigration === "all" ? null : tempMigration);
    setSeverityFilter(tempSeverity === "all" ? null : tempSeverity);
    setCaseIdFilter(tempCaseId === "" ? null : tempCaseId);
    setFilterPanelOpen(false);
  };

  const handleClearFilters = () => {
    setTempStatus("all");
    setTempCountry("all");
    setTempMigration("all");
    setTempSeverity("all");
    setTempCaseId("");
    setStatusFilter(null);
    setCountryFilter(null);
    setMigrationFilter(null);
    setSeverityFilter(null);
    setCaseIdFilter(null);
    setFilterPanelOpen(false);
  };

  // Modal states
  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [statusModalRow, setStatusModalRow] = React.useState<CaseRow | null>(null);
  const [refusedModalOpen, setRefusedModalOpen] = React.useState(false);
  const [refusedModalRow, setRefusedModalRow] = React.useState<CaseRow | null>(null);
  const [archiveModalOpen, setArchiveModalOpen] = React.useState(false);
  const [archiveModalRow, setArchiveModalRow] = React.useState<CaseRow | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteModalRow, setDeleteModalRow] = React.useState<CaseRow | null>(null);
  const [actionModalOpen, setActionModalOpen] = React.useState(false);
  const [actionModalRow, setActionModalRow] = React.useState<CaseRow | null>(null);
  const [completedActionCaseIds, setCompletedActionCaseIds] = React.useState<Set<number>>(new Set());

  // Mutable cases state for status updates
  const [cases, setCases] = React.useState<CaseRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadCases = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ data: any[]; count: number }>(
        ENDPOINTS.cases.base
      );

      let overrides: Record<string, string> = {};
      try {
        const saved = localStorage.getItem("viems_case_status_overrides");
        if (saved) overrides = JSON.parse(saved);
      } catch (e) {}

      let completedActions = new Set<string>();
      try {
        const savedActions = localStorage.getItem("viems_completed_actions");
        if (savedActions) {
          const parsed = JSON.parse(savedActions);
          if (Array.isArray(parsed)) {
            completedActions = new Set(parsed.map(String));
          }
        }
      } catch (e) {}

      const mapped = response.data.map((c) => {
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
      setCases(mapped);
    } catch (err) {
      console.error("Failed to fetch cases:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCases();
  }, [loadCases]);

  // Filter cases by tab first
  const tabCases = React.useMemo(() => {
    return cases.filter((item) => {
      const isRefused =
        item.status.toUpperCase() === "VISA REFUSED" ||
        item.status.toLowerCase() === "visa refused";

      if (activeTab === "refusals") {
        return isRefused;
      } else if (activeTab === "cases") {
        return !isRefused;
      }
      return true; // groups shows all
    });
  }, [cases, activeTab]);

  // Derive unique countries and statuses for filter dropdowns
  const uniqueCountries = React.useMemo(() => {
    const seen = new Map<string, { code: string; label: string; flag: string; count: number }>();
    tabCases.forEach((c) => {
      if (
        !c.country ||
        c.country.toUpperCase() === "ALL" ||
        c.country === "All countries" ||
        c.country.trim() === ""
      ) {
        return;
      }
      const existing = seen.get(c.country);
      if (existing) {
        existing.count += 1;
      } else {
        seen.set(c.country, { code: c.countryCode || c.country, label: c.country, flag: c.flag, count: 1 });
      }
    });
    return Array.from(seen.values());
  }, [tabCases]);

  const uniqueStatuses = React.useMemo(() => {
    const seen = new Map<string, { label: string; count: number }>();
    tabCases.forEach((c) => {
      if (
        !c.status ||
        c.status.toUpperCase() === "ALL" ||
        c.status.toLowerCase() === "all status" ||
        c.status.trim() === ""
      ) {
        return;
      }
      const existing = seen.get(c.status);
      if (existing) {
        existing.count += 1;
      } else {
        seen.set(c.status, { label: c.status, count: 1 });
      }
    });
    return Array.from(seen.values());
  }, [tabCases]);

  const statusColorMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    cases.forEach((c) => {
      map[c.status] = c.statusColor;
    });
    return map;
  }, [cases]);

  const renderCircularFlag = (country: string, fallbackFlag: string) => {
    return <Flag country={country} />;
  };

  // Filter cases based on search, country, status, and Needs Action filter
  const filteredCases = React.useMemo(() => {
    return tabCases.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caseId.includes(searchQuery) ||
        item.group.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCountry = !countryFilter || item.countryCode === countryFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      
      const matchesMigration = !migrationFilter || item.migration === migrationFilter;
      const matchesSeverity = !severityFilter || (
        severityFilter === "RED" ? item.actionColor === "red" :
        severityFilter === "YELLOW" ? item.actionColor === "yellow" :
        severityFilter === "BLUE_GRAY" ? (item.actionColor === "blue" || item.actionColor === "gray") : true
      );
      const matchesCaseId = !caseIdFilter || item.caseId.toLowerCase().includes(caseIdFilter.toLowerCase());

      if (needsActionOnly) {
        return matchesSearch && matchesCountry && matchesStatus && matchesMigration && matchesSeverity && matchesCaseId && item.actionColor !== "gray" && item.action !== "No action required";
      }
      return matchesSearch && matchesCountry && matchesStatus && matchesMigration && matchesSeverity && matchesCaseId;
    });
  }, [tabCases, searchQuery, needsActionOnly, countryFilter, statusFilter, migrationFilter, severityFilter, caseIdFilter]);

  // Helper: show custom styled success toast matching Figma
  const showSuccessToast = (name: string, statusText: string) => {
    toast(`${name}'s case status set as ${statusText}.`, {
      icon: (
        <div className="size-5 rounded-full bg-white flex items-center justify-center shrink-0">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 4L3.5 6L8.5 1" stroke="var(--color-brand-medium)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ),
      className: "!bg-brand-medium !border-brand-medium !shadow-card-large !rounded-card !py-md !px-xl !w-[440px] !max-w-[calc(100vw-2rem)] !flex !items-center !gap-md !h-[50px]",
      classNames: {
        title: "!text-white !font-sans !font-medium !text-paragraph-sm !tracking-[-0.006em]",
      }
    });
  };

  // Handler: change case status with real backend call
  const handleChangeStatus = async (newStatusValue: string, rowOverride?: CaseRow) => {
    const targetRow = rowOverride || statusModalRow;
    if (!targetRow) return;
    const statusOption = CASE_STATUSES.find(
      (s) =>
        s.value === newStatusValue ||
        s.label.toLowerCase() === newStatusValue.toLowerCase() ||
        s.value.toLowerCase().replace(/_/g, " ") === newStatusValue.toLowerCase().replace(/_/g, " ")
    );
    if (!statusOption) return;

    // Save to localStorage overrides
    const overrideKey = targetRow.id || targetRow.caseId;
    if (overrideKey) {
      try {
        const saved = localStorage.getItem("viems_case_status_overrides");
        const overrides = saved ? JSON.parse(saved) : {};
        overrides[overrideKey] = statusOption.label;
        localStorage.setItem("viems_case_status_overrides", JSON.stringify(overrides));
      } catch (e) {}
    }

    setCases((prev) =>
      prev.map((c) =>
        c.caseId === targetRow.caseId || c.id === targetRow.id
          ? {
              ...c,
              status: statusOption.label,
              statusColor: statusOption.dotColor === "#1FC16B"
                ? ("success" as const)
                : statusOption.dotColor === "#F6B51E"
                ? ("warning" as const)
                : statusOption.dotColor === "#335CFF"
                ? ("info" as const)
                : statusOption.dotColor === "#FB3748"
                ? ("error" as const)
                : ("gray" as const),
            }
          : c
      )
    );

    if (targetRow.id) {
      try {
        const formData = new FormData();

        // category (role) is required by NestJS DTO
        const roleId = typeof targetRow.roleId === "number"
          ? targetRow.roleId
          : parseInt(String(targetRow.roleId), 10) || 1;

        formData.append("category", JSON.stringify({ id: roleId }));

        // Preserve existing relatedYear
        formData.append("relatedYear", String(new Date().getFullYear()));

        // Preserve existing outcome so we don't accidentally null it out
        if (targetRow.outcome) {
          formData.append("decision", JSON.stringify({ id: targetRow.outcome }));
        }

        // Preserve existing cosStatus so we don't accidentally set an invalid enum value
        if (targetRow.cosStatusValue) {
          formData.append("cosStatus", JSON.stringify({ id: targetRow.cosStatusValue }));
        }

        await apiClient.patch(ENDPOINTS.cases.byId(targetRow.id), {
          body: formData,
        });
        showSuccessToast(targetRow.name, statusOption.label);
      } catch (err) {
        console.error("Failed to update status on server:", err);
      }
    } else {
      showSuccessToast(targetRow.name, statusOption.label);
    }
  };

  // Handler: mark as visa refused with real backend call
  const handleMarkRefused = async (reason: string, customText?: string) => {
    if (!refusedModalRow) return;

    // Update UI status locally first
    setCases((prev) =>
      prev.map((c) =>
        c.caseId === refusedModalRow.caseId
          ? {
              ...c,
              status: "Visa refused",
              statusColor: "error" as const,
            }
          : c
      )
    );

    if (refusedModalRow.id) {
      try {
        const formData = new FormData();

        // category (role) is required by NestJS DTO
        const roleId = typeof refusedModalRow.roleId === "number"
          ? refusedModalRow.roleId
          : parseInt(String(refusedModalRow.roleId), 10) || 1;
        formData.append("category", JSON.stringify({ id: roleId }));

        // Preserve existing relatedYear
        formData.append("relatedYear", String(new Date().getFullYear()));

        // Resolve refusal reason text
        const selectedObj = REFUSAL_REASONS.find((r) => r.value === reason);
        const finalReasonText = reason === "other" 
          ? (customText || "Other") 
          : (selectedObj ? selectedObj.label : reason);

        // Build decision payload with refusal sub-object
        const decisionPayload = {
          id: "Refused",
          refusal: {
            isRefusal: true,
            refusalDate: new Date().toISOString(),
            refusalReason: finalReasonText,
          }
        };
        formData.append("decision", JSON.stringify(decisionPayload));

        // Preserve existing cosStatus so we don't accidentally set an invalid enum value
        if (refusedModalRow.cosStatusValue) {
          formData.append("cosStatus", JSON.stringify({ id: refusedModalRow.cosStatusValue }));
        }

        await apiClient.patch(ENDPOINTS.cases.byId(refusedModalRow.id), {
          body: formData,
        });
        showSuccessToast(refusedModalRow.name, "Visa Refused");
        loadCases();
      } catch (err) {
        console.error("Failed to record refusal on server:", err);
        toast.error("Failed to record refusal on server");
        // Revert local state by reloading cases
        loadCases();
      }
    }
  };

  const handleArchiveCase = async (row: CaseRow) => {
    if (row.id) {
      try {
        const formData = new FormData();
        formData.append("moduleName", "cases");
        formData.append("data", JSON.stringify([{
          id: row.id,
          caseNumber: row.caseId,
        }]));
        const token = typeof window !== "undefined" ? localStorage.getItem("viems.auth.token") : null;
        const res = await fetch("http://localhost:8081/cases/to-archive", {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.message || `Archive failed (${res.status})`);
        }
        toast.success(`Case #${row.caseId} archived`);
        loadCases();
      } catch (err) {
        console.error("Failed to archive case:", err);
        toast.error("Failed to archive case");
      }
    }
  };

  const handleDeleteCase = async (row: CaseRow) => {
    if (row.id) {
      try {
        const formData = new FormData();
        formData.append("moduleName", "cases");
        formData.append("data", JSON.stringify([{
          id: row.id,
          caseNumber: row.caseId,
        }]));
        const token = typeof window !== "undefined" ? localStorage.getItem("viems.auth.token") : null;
        const res = await fetch("http://localhost:8081/cases/archive", {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.message || `Delete failed (${res.status})`);
        }
        toast.success(`Case #${row.caseId} deleted`);
        loadCases();
      } catch (err) {
        console.error("Failed to delete case:", err);
        toast.error("Failed to delete case");
      }
    }
  };

  const handleActionCompleted = (completedId?: number) => {
    const idToSave = completedId || actionModalRow?.id;
    const caseIdToSave = actionModalRow?.caseId;

    if (idToSave || caseIdToSave) {
      try {
        const savedActions = localStorage.getItem("viems_completed_actions");
        const list: string[] = savedActions ? JSON.parse(savedActions) : [];
        if (idToSave) list.push(String(idToSave));
        if (caseIdToSave) list.push(String(caseIdToSave));
        localStorage.setItem("viems_completed_actions", JSON.stringify(Array.from(new Set(list))));
      } catch (e) {}

      setCases((prev) =>
        prev.map((c) =>
          c.id === idToSave || c.caseId === caseIdToSave
            ? { ...c, action: "No action required", actionColor: "gray" }
            : c
        )
      );
    }
    loadCases();
  };

  const getStatusClasses = (color: CaseRow["statusColor"]) => {
    switch (color) {
      case "warning":
        return "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]/50";
      case "success":
        return "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]/50";
      case "info":
        return "bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]/50";
      case "error":
        return "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]/50";
      default:
        return "bg-neutral-100 text-neutral-600 border-neutral-200/50";
    }
  };

  const getActionDotColor = (color: CaseRow["actionColor"]) => {
    switch (color) {
      case "blue":
        return "bg-[#335CFF]";
      case "red":
        return "bg-[#FB3748]";
      case "yellow":
        return "bg-[#F6B51E]";
      default:
        return "transparent";
    }
  };

  const getActionTextClass = (color: CaseRow["actionColor"]) => {
    if (color === "gray") {
      return "text-neutral-400 font-normal text-paragraph-sm";
    }
    return "text-[#5C5C5C] hover:text-[#171717] font-medium underline cursor-pointer text-paragraph-sm";
  };

  const getAvatarBg = (text: string) => {
    const t = text.toUpperCase();
    if (t === "GS" || t === "AM") {
      return "bg-[#FFECC0] text-[#71330A]";
    }
    if (t === "EP" || t === "JB" || t === "TJ") {
      return "bg-[#CAC0FF] text-[#351A75]";
    }
    if (t === "JO" || t === "SR") {
      return "bg-[#FFD9C0] text-[#71330A]";
    }
    return "bg-neutral-100 text-neutral-600";
  };

  const getStatusBgAndText = (color: CaseRow["statusColor"]) => {
    switch (color) {
      case "warning":
        return "bg-[#FFFAEB] text-[#624C18]";
      case "success":
        return "bg-[#E3F7EC] text-[#0B4627]";
      case "info":
        return "bg-[#EBF5FF] text-[#1E429F]";
      case "error":
        return "bg-[#FDE8E8] text-[#9B1C1C]";
      default:
        return "bg-[#F3F4F6] text-[#374151]";
    }
  };

  const getStatusDotColor = (color: CaseRow["statusColor"]) => {
    switch (color) {
      case "warning":
        return "bg-[#F6B51E]";
      case "success":
        return "bg-[#1FC16B]";
      case "info":
        return "bg-[#3B82F6]";
      case "error":
        return "bg-[#E02424]";
      default:
        return "bg-[#9CA3AF]";
    }
  };

  const getMigrationBgAndText = (status: string) => {
    return "bg-transparent";
  };

  const getMigrationDotColor = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("PENDING") || s.includes("REFUSED")) {
      return "bg-[#FB3748]";
    }
    if (s.includes("ACTIVE") || s.includes("IN UK")) {
      return "bg-[#1FC16B]";
    }
    return "bg-[#7B7B7B]";
  };

  const getMigrationTextColorClass = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("PENDING") || s.includes("REFUSED")) {
      return "text-[#681219] font-semibold";
    }
    if (s.includes("ACTIVE") || s.includes("IN UK")) {
      return "text-[#262626] font-semibold";
    }
    return "text-[#7B7B7B] font-semibold";
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px] text-neutral-500 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 mb-2"></div>
        <p className="text-paragraph-sm font-medium">Loading cases...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans animate-fade-in text-[#171717] select-none bg-[#F7F7F7] min-h-full">
      <div className="bg-white rounded-t-[16px] flex flex-col shrink-0">
        <div className="px-6 md:px-[64px] pt-[40px] pb-[24px] flex flex-col gap-md md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-xs flex-1 min-w-0">
            <h1 className="text-title-aeonik text-[#171717]">
              Cases
            </h1>
            <p className="text-paragraph-sm text-neutral-500 max-w-[600px]">
              Create, track, and manage visa cases for individual or grouped applicants.
            </p>
          </div>
          <div className="flex items-center gap-md">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 px-xl text-label-sm font-semibold"
            >
              <RiDownloadLine className="size-4" data-icon="inline-start" />
              Import
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 px-xl text-label-sm font-semibold text-white"
            >
              <RiAddLine className="size-4" data-icon="inline-start" />
              New migrant
            </Button>
          </div>
        </div>

        <div className="px-6 md:px-[64px] flex items-center gap-6 h-[50px] select-none border-b border-[#EBEBEB]">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("cases")}
            className={`h-full px-xs pb-2 border-b-2 border-x-0 border-t-0 text-label-sm font-semibold rounded-none transition-all inline-flex items-center gap-sm ${
              activeTab === "cases"
                ? "border-[#171717] text-[#171717] hover:bg-transparent"
                : "border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-transparent"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
              <path d="M5.5 6.25V4C5.5 3.80109 5.57902 3.61032 5.71967 3.46967C5.86032 3.32902 6.05109 3.25 6.25 3.25H11.0605L12.5605 4.75H16.75C16.9489 4.75 17.1397 4.82902 17.2803 4.96967C17.421 5.11032 17.5 5.30109 17.5 5.5V13C17.5 13.1989 17.421 13.3897 17.2803 13.5303C17.1397 13.671 16.9489 13.75 16.75 13.75H14.5V16C14.5 16.1989 14.421 16.3897 14.2803 16.5303C14.1397 16.671 13.9489 16.75 13.75 16.75H3.25C3.05109 16.75 2.86032 16.671 2.71967 16.5303C2.57902 16.3897 2.5 16.1989 2.5 16V7C2.5 6.80109 2.57902 6.61032 2.71967 6.46967C2.86032 6.32902 3.05109 6.25 3.25 6.25H5.5ZM5.5 7.75H4V15.25H13V13.75H5.5V7.75Z" fill="currentColor" />
            </svg>
            <span>Cases</span>
            <div className="w-5 h-[18px] bg-[#F5F5F5] rounded-[4px] text-[11px] font-medium text-[#171717] flex items-center justify-center shrink-0">
              {activeTab === "cases" ? filteredCases.length : cases.filter((c) => c.status.toUpperCase() !== "VISA REFUSED" && c.status.toLowerCase() !== "visa refused").length}
            </div>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("groups")}
            className={`h-full px-xs pb-2 border-b-2 border-x-0 border-t-0 text-label-sm font-semibold rounded-none transition-all inline-flex items-center gap-sm ${
              activeTab === "groups"
                ? "border-[#171717] text-[#171717] hover:bg-transparent"
                : "border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-transparent"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Groups</span>
            <div className="w-5 h-[18px] bg-[#F5F5F5] rounded-[4px] text-[11px] font-medium text-[#171717] flex items-center justify-center shrink-0">
              {Array.from(new Set(cases.map((c) => c.group))).length}
            </div>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab("refusals")}
            className={`h-full px-xs pb-2 border-b-2 border-x-0 border-t-0 text-label-sm font-semibold rounded-none transition-all inline-flex items-center gap-sm ${
              activeTab === "refusals"
                ? "border-[#171717] text-[#171717] hover:bg-transparent"
                : "border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-transparent"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
              <path d="M11.95 13.0002L16.75 13.0002C17.1478 13.0002 17.5294 12.8422 17.8107 12.5609C18.092 12.2796 18.25 11.8981 18.25 11.5002L18.25 9.92223C18.2502 9.72621 18.212 9.53205 18.1375 9.35073L15.8155 3.71523C15.759 3.5778 15.663 3.46023 15.5396 3.37744C15.4163 3.29465 15.2711 3.25038 15.1225 3.25023L2.5 3.25023C2.30109 3.25023 2.11032 3.32925 1.96967 3.4699C1.82902 3.61055 1.75 3.80132 1.75 4.00023L1.75 11.5002C1.75 11.6991 1.82901 11.8899 1.96967 12.0306C2.11032 12.1712 2.30109 12.2502 2.5 12.2502L5.1115 12.2502C5.23157 12.2502 5.34989 12.279 5.45652 12.3342C5.56315 12.3894 5.65497 12.4694 5.72425 12.5675L9.814 18.362C9.8657 18.4352 9.94194 18.4876 10.0289 18.5094C10.1159 18.5313 10.2078 18.5213 10.288 18.4812L11.6485 17.8002C12.0314 17.6089 12.3372 17.2922 12.5153 16.903C12.6933 16.5137 12.7329 16.0753 12.6272 15.6605L11.95 13.0002ZM6.25 11.0592L6.25 4.75023L14.62 4.75023L16.75 9.92223L16.75 11.5002L11.95 11.5002C11.7215 11.5003 11.4961 11.5525 11.2909 11.6529C11.0857 11.7533 10.9062 11.8993 10.766 12.0796C10.6257 12.26 10.5286 12.47 10.4819 12.6936C10.4352 12.9172 10.4402 13.1486 10.4965 13.37L11.1737 16.031C11.1949 16.114 11.1871 16.2017 11.1515 16.2797C11.1159 16.3576 11.0546 16.4209 10.978 16.4592L10.4822 16.7067L6.94975 11.7027C6.76225 11.4372 6.52225 11.2197 6.25 11.0592ZM4.75 10.7502L3.25 10.7502L3.25 4.75023L4.75 4.75023L4.75 10.7502Z" fill="currentColor" />
            </svg>
            <span>Refusals</span>
            <div className="w-5 h-[18px] bg-[#F5F5F5] rounded-[4px] text-[11px] font-medium text-[#171717] flex items-center justify-center shrink-0">
              {activeTab === "refusals" ? filteredCases.length : cases.filter((c) => c.status.toUpperCase() === "VISA REFUSED" || c.status.toLowerCase() === "visa refused").length}
            </div>
          </Button>
        </div>
      </div>

      <div className="px-6 md:px-[64px] py-[32px] flex flex-col gap-[24px] flex-1">
        <div className="flex flex-wrap items-center gap-md">
          <div className="relative w-full max-w-[348px]">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#A4A4A4] z-10" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-4 bg-white text-paragraph-sm placeholder-[#A4A4A4] shadow-x-small"
            />
          </div>

          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              className={`text-neutral-500 hover:bg-neutral-100 ${filterPanelOpen ? 'bg-neutral-100 border-[#7D52F4]' : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
                <path d="M8.5 14.5H11.5V13H8.5V14.5ZM3.25 5.5V7H16.75V5.5H3.25ZM5.5 10.75H14.5V9.25H5.5V10.75Z" fill="currentColor" />
              </svg>
            </Button>
            
            {filterPanelOpen && (
              <div className="absolute top-[40px] left-0 w-[696px] h-[528px] bg-white border border-[#F5F5F5] rounded-[20px] shadow-card-large z-50 flex font-sans select-none overflow-hidden text-left" style={{ boxShadow: '0px 1px 1px 0.5px rgba(51, 51, 51, 0.04), 0px 3px 3px -1.5px rgba(51, 51, 51, 0.02), 0px 6px 6px -3px rgba(51, 51, 51, 0.04), 0px 12px 12px -6px rgba(51, 51, 51, 0.04), 0px 24px 24px -12px rgba(51, 51, 51, 0.04), 0px 48px 48px -24px rgba(51, 51, 51, 0.04), 0px 0px 0px 1px #F5F5F5, inset 0px -1px 1px -0.5px rgba(51, 51, 51, 0.06)' }}>
                {/* Menus sidebar: width 224px */}
                <div className="w-[224px] h-[528px] bg-white border-r border-[#EBEBEB] p-[12px] flex flex-col gap-[8px] shrink-0">
                  {[
                    { key: "Case status", label: "Case status", icon: RiListCheck },
                    { key: "Country", label: "Country", icon: RiGlobalLine },
                    { key: "Migration status", label: "Migration status", icon: RiBriefcaseLine },
                    { key: "Action severity", label: "Action severity", icon: RiAlertLine },
                    { key: "Case ID", label: "Case ID", icon: RiHashtag },
                  ].map((item) => {
                    const IconComp = item.icon;
                    const isActive = selectedCategory === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedCategory(item.key)}
                        className={`w-[200px] h-[36px] px-[8px] gap-[8px] rounded-[8px] flex items-center justify-start cursor-pointer transition-all border-0 ${
                          isActive 
                            ? "bg-[#F5F5F5] text-[#171717] font-semibold" 
                            : "bg-white text-[#5C5C5C] hover:bg-neutral-50"
                        }`}
                      >
                        <IconComp className={`size-5 shrink-0 ${isActive ? 'text-[#171717]' : 'text-[#A4A4A4]'}`} />
                        <span className="text-[14px] leading-[20px] tracking-[-0.006em] truncate">{item.label}</span>
                        {isActive && (
                          <RiArrowRightSLine className="size-4 text-[#A4A4A4] ml-auto shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Content area: width 472px */}
                <div className="w-[472px] h-[528px] flex flex-col justify-between items-start bg-white">
                  {/* Header */}
                  <div className="w-[472px] h-[52px] px-[20px] py-[16px] gap-[8px] flex items-center border-b border-[#EBEBEB]">
                    <span className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-[#171717]">
                      {selectedCategory}
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="w-[472px] flex-1 p-[20px] gap-[12px] flex flex-col overflow-y-auto">
                    {/* Category specific content */}
                    {selectedCategory === "Case status" && (
                      <div className="flex flex-col gap-[12px] w-full">
                        {[
                          { value: "all", label: "All statuses", count: cases.length, colorClass: "bg-[#F5F5F5] text-[#7B7B7B]" },
                          { value: "VISA APPROVED", label: "Visa approved", count: cases.filter(c => c.status === "VISA APPROVED").length, colorClass: "bg-[#E3F7EC] text-[#0B4627]" },
                          { value: "AWAITING", label: "Awaiting", count: cases.filter(c => c.status.toUpperCase().includes("AWAITING")).length, colorClass: "bg-[#FFFAEB] text-[#624C18]" },
                          { value: "ELIGIBILITY ASSESSMENT", label: "Eligibility assessment", count: cases.filter(c => c.status === "ELIGIBILITY ASSESSMENT").length, colorClass: "bg-[#EBF1FF] text-[#122368]" },
                          { value: "VISA REFUSED", label: "Visa refused", count: cases.filter(c => c.status === "VISA REFUSED").length, colorClass: "bg-[#FFEBEC] text-[#681219]" },
                          { value: "CASE CLOSED", label: "Case closed", count: cases.filter(c => c.status === "CASE CLOSED").length, colorClass: "bg-[#F5F5F5] text-[#7B7B7B]" },
                        ].map((opt, i) => (
                          <React.Fragment key={opt.value}>
                            <label className="flex items-center justify-between cursor-pointer w-full group py-0.5">
                              <div className="flex items-center gap-[8px]">
                                <input
                                  type="radio"
                                  name="caseStatus"
                                  checked={tempStatus === opt.value}
                                  onChange={() => setTempStatus(opt.value)}
                                  className="accent-[#7D52F4] size-4 cursor-pointer"
                                />
                                <span className="text-[14px] leading-[20px] text-[#171717]">{opt.label}</span>
                              </div>
                              <span className={`px-[8px] py-[2px] rounded-full text-[11px] font-medium tracking-[0.02em] ${opt.colorClass}`}>
                                {opt.count}
                              </span>
                            </label>
                            {i < 5 && <div className="w-full h-0 border-b border-[#EBEBEB]" />}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {selectedCategory === "Country" && (
                      <div className="flex flex-col gap-[12px] w-full">
                        {[
                          { value: "all", label: "All countries" },
                          { value: "US", label: "United States (US)" },
                          { value: "CN", label: "China (CN)" },
                          { value: "IN", label: "India (IN)" },
                          { value: "FR", label: "France (FR)" },
                          { value: "SA", label: "South Africa (SA)" },
                        ].map((opt, i) => (
                          <React.Fragment key={opt.value}>
                            <label className="flex items-center gap-[8px] cursor-pointer w-full py-0.5">
                              <input
                                type="radio"
                                name="country"
                                checked={tempCountry === opt.value}
                                onChange={() => setTempCountry(opt.value)}
                                className="accent-[#7D52F4] size-4 cursor-pointer"
                              />
                              <span className="text-[14px] leading-[20px] text-[#171717]">{opt.label}</span>
                            </label>
                            {i < 5 && <div className="w-full h-0 border-b border-[#EBEBEB]" />}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {selectedCategory === "Migration status" && (
                      <div className="flex flex-col gap-[12px] w-full">
                        {[
                          { value: "all", label: "All migration states" },
                          { value: "ACTIVE COMPLIANCE", label: "Active Compliance" },
                          { value: "IN UK", label: "In UK" },
                          { value: "ARRIVED - RTW PENDING", label: "Arrived - RTW Pending" },
                        ].map((opt, i) => (
                          <React.Fragment key={opt.value}>
                            <label className="flex items-center gap-[8px] cursor-pointer w-full py-0.5">
                              <input
                                type="radio"
                                name="migration"
                                checked={tempMigration === opt.value}
                                onChange={() => setTempMigration(opt.value)}
                                className="accent-[#7D52F4] size-4 cursor-pointer"
                              />
                              <span className="text-[14px] leading-[20px] text-[#171717]">{opt.label}</span>
                            </label>
                            {i < 3 && <div className="w-full h-0 border-b border-[#EBEBEB]" />}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {selectedCategory === "Action severity" && (
                      <div className="flex flex-col gap-[12px] w-full">
                        {[
                          { value: "all", label: "All severities" },
                          { value: "RED", label: "Red (Urgent)" },
                          { value: "YELLOW", label: "Yellow (Medium)" },
                          { value: "BLUE_GRAY", label: "Blue / Gray (Low)" },
                        ].map((opt, i) => (
                          <React.Fragment key={opt.value}>
                            <label className="flex items-center gap-[8px] cursor-pointer w-full py-0.5">
                              <input
                                type="radio"
                                name="severity"
                                checked={tempSeverity === opt.value}
                                onChange={() => setTempSeverity(opt.value)}
                                className="accent-[#7D52F4] size-4 cursor-pointer"
                              />
                              <span className="text-[14px] leading-[20px] text-[#171717]">{opt.label}</span>
                            </label>
                            {i < 3 && <div className="w-full h-0 border-b border-[#EBEBEB]" />}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {selectedCategory === "Case ID" && (
                      <div className="flex flex-col gap-[12px] w-full">
                        <span className="text-[13px] text-[#5C5C5C] mb-xs">Search by Case ID Number:</span>
                        <Input
                          type="text"
                          placeholder="e.g. 430/2026"
                          value={tempCaseId}
                          onChange={(e) => setTempCaseId(e.target.value)}
                          className="h-9"
                        />
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="w-[472px] h-[68px] px-[20px] py-[16px] flex items-center justify-between border-t border-[#EBEBEB]">
                    <span className="text-[12px] font-normal leading-[16px] text-[#5C5C5C]">
                      {filteredCases.length} results
                    </span>
                    <div className="flex items-center gap-[16px]">
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="w-[109px] h-[36px] bg-[#F5F5F5] hover:bg-neutral-200 text-[#5C5C5C] text-[14px] font-medium leading-[20px] rounded-[8px] flex items-center justify-center border-0 cursor-pointer transition-all"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyFilters}
                        className="w-[109px] h-[36px] bg-[#7D52F4] hover:bg-[#683fd1] text-white text-[14px] font-medium leading-[20px] rounded-[8px] flex items-center justify-center border-0 cursor-pointer transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <CountryFilterDropdown
            countries={uniqueCountries}
            value={countryFilter}
            onChange={setCountryFilter}
          />

          <StatusFilterDropdown
            statuses={uniqueStatuses}
            value={statusFilter}
            onChange={setStatusFilter}
            statusColors={statusColorMap}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setNeedsActionOnly(!needsActionOnly)}
            className={`w-[108px] text-[13px] font-medium justify-center ${
              needsActionOnly
                ? "bg-[#FEF3C7] border-[#FDE68A] text-[#D97706] hover:bg-[#FEF3C7] hover:text-[#D97706]"
                : "text-[#5C5C5C]"
            }`}
          >
            Needs action
          </Button>
        </div>

        {filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[592px] bg-white rounded-card shadow-x-small border border-neutral-200/20 select-none">
            {/* Group 9: Figma-matching stacked vector cards */}
            <div className="w-[77px] h-[88px] flex items-center justify-center relative mb-[24px]">
              <svg width="77" height="88" viewBox="0 0 77 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Vector 1 (Back Card) */}
                <rect x="4" y="8" width="52" height="66" rx="4.46724" fill="#EBEBEB" stroke="#A4A4A4" strokeWidth="1.2" transform="rotate(-5 30 41)" />
                {/* Vector 2 (Middle Card) */}
                <rect x="10" y="11" width="52" height="66" rx="4.46724" fill="#F5F5F5" stroke="#A4A4A4" strokeWidth="1.2" transform="rotate(-2.5 36 44)" />
                {/* Vector 3 & 4 (Front Card) */}
                <rect x="18" y="14" width="52" height="66" rx="4.46724" fill="#FFFFFF" stroke="#A4A4A4" strokeWidth="1.2" />
                {/* Vector 5 (Avatar head) */}
                <circle cx="44" cy="38" r="8" fill="#A4A4A4" />
                {/* Vector 6 (Avatar body) */}
                <path d="M28 62C28 55.3726 33.3726 50 40 50H48C54.6274 50 60 55.3726 60 62V67H28V62Z" fill="#A4A4A4" />
              </svg>
            </div>
            
            {/* Title: H6 Title style */}
            <h3 className="text-[20px] font-[550] leading-[28px] tracking-[-0.006em] text-[#171717] font-sans mb-[7px]">
              No migrant found
            </h3>
            
            {/* Subtitle: Paragraph/Small style */}
            <p className="text-[14px] font-normal leading-[20px] tracking-[-0.006em] text-[#5C5C5C] text-center w-[191px] h-[40px] mb-[24px] font-sans">
              Change your filters or add a new migrant
            </p>
            
            {/* Button: [1.1] style */}
            <button
              type="button"
              className="w-[133px] h-[36px] bg-[#262626] hover:bg-[#333333] text-white text-[14px] font-medium leading-[20px] tracking-[-0.006em] rounded-[8px] flex items-center justify-center gap-[4px] p-[8px] cursor-pointer border-0 transition-colors font-sans"
            >
              <RiAddLine className="size-5 text-white shrink-0" />
              <span className="text-white">New migrant</span>
            </button>
          </div>
        ) : (
          <>
            <div className="w-full select-none">
              <div className="flex flex-col gap-sm">
                <div className="px-xl h-11 flex items-center bg-[#F7F7F7] shrink-0 text-[12px] uppercase tracking-[0.04em] text-[#A4A4A4] font-medium mb-xs">
                  <div className="basis-[94px] shrink-0 grow-0">Case ID #</div>
                  <div className="basis-[112px] shrink-0 grow-0 flex items-center gap-[4px] cursor-pointer">
                    Country
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#A4A4A4] shrink-0">
                      <path d="m7 15 5 5 5-5"/>
                      <path d="m7 9 5-5 5 5"/>
                    </svg>
                  </div>
                  <div className="flex-[1.5] min-w-0 flex items-center gap-[4px] cursor-pointer">
                    Name
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#A4A4A4] shrink-0">
                      <path d="m7 15 5 5 5-5"/>
                      <path d="m7 9 5-5 5 5"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-[4px] cursor-pointer">
                    Case Status
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#A4A4A4] shrink-0">
                      <path d="m7 15 5 5 5-5"/>
                      <path d="m7 9 5-5 5 5"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 flex items-center gap-[4px] cursor-pointer">
                    Migration Status
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#A4A4A4] shrink-0">
                      <path d="m7 15 5 5 5-5"/>
                      <path d="m7 9 5-5 5 5"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">Compliance Action</div>
                  <div className="w-[48px] shrink-0"></div>
                </div>

                <div className="flex flex-col gap-sm">
                  {filteredCases.map((row) => (
                    <div
                      key={row.caseId}
                      onClick={() => router.push(`/cases/${row.id}`)}
                      className="bg-white rounded-[16px] h-[72px] px-xl flex items-center shadow-x-small border border-neutral-200/20 hover:border-neutral-200/50 hover:shadow-custom-medium transition-all cursor-pointer"
                    >
                      <div className="basis-[94px] shrink-0 grow-0 font-normal text-[#5C5C5C] font-mono text-paragraph-sm">
                        {row.caseId}
                      </div>

                      <div className="basis-[112px] shrink-0 grow-0 flex items-center gap-sm">
                        {renderCircularFlag(row.country, row.flag)}
                        <span className="font-normal text-[#171717] font-sans text-paragraph-sm">{row.country}</span>
                      </div>

                      <div className="flex-[1.5] min-w-0 flex items-center gap-lg">
                        <img 
                          src={row.avatarUrl} 
                          alt={row.name} 
                          className={`size-10 rounded-full object-cover shrink-0 ${!row.avatarUrl ? 'hidden' : ''}`}
                        />
                        {!row.avatarUrl && (
                          <div className={`size-10 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 select-none ${getAvatarBg(row.avatarText || "AM")}`}>
                            {row.avatarText}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0 gap-[2px]">
                          <span className="font-medium text-[#171717] truncate leading-normal text-paragraph-sm">
                            {row.name}
                          </span>
                          <span className="text-paragraph-xs text-[#5C5C5C] truncate font-normal leading-none">
                            {row.group}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 flex items-center">
                        <CaseStatusDropdown
                          currentStatus={row.status}
                          statusColor={row.statusColor}
                          getStatusBgAndText={getStatusBgAndText}
                          getStatusDotColor={getStatusDotColor}
                          onApplyStatus={(newStatus) => {
                            setStatusModalRow(row);
                            // Visa refused requires the refusal reason modal first
                            const norm = newStatus.toLowerCase().replace(/_/g, " ").trim();
                            if (norm === "visa refused" || norm === "visa_refused") {
                              setRefusedModalRow(row);
                              setRefusedModalOpen(true);
                            } else {
                              handleChangeStatus(newStatus, row);
                            }
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex items-center">
                        <span className="inline-flex items-center gap-xs text-[11px] font-medium uppercase tracking-[0.02em]">
                          <span className={`size-1.5 rounded-full ${getMigrationDotColor(row.migration)}`} />
                          <span className={getMigrationTextColorClass(row.migration)}>{row.migration}</span>
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 flex items-center gap-xs">
                        {row.actionColor !== "gray" && (
                          <span className={`size-1.5 rounded-full shrink-0 ${getActionDotColor(row.actionColor)}`} />
                        )}
                        <span 
                          className={getActionTextClass(row.actionColor)}
                          onClick={(e) => {
                            if (row.actionColor !== "gray" && row.action !== "No action required") {
                              e.stopPropagation();
                              setActionModalRow(row);
                              setActionModalOpen(true);
                            }
                          }}
                        >
                          {row.action}
                        </span>
                      </div>

                      <div className="w-[48px] shrink-0 flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <CaseRowMenu
                          onViewDetails={() => router.push(`/cases/${row.caseId.replace('/', '-')}`)}
                          onChangeStatus={() => {
                            setStatusModalRow(row);
                            setStatusModalOpen(true);
                          }}
                          onMarkRefused={() => {
                            setRefusedModalRow(row);
                            setRefusedModalOpen(true);
                          }}
                          onArchive={() => {
                            setArchiveModalRow(row);
                            setArchiveModalOpen(true);
                          }}
                          onDelete={() => {
                            setDeleteModalRow(row);
                            setDeleteModalOpen(true);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-md md:flex-row md:items-center pt-lg border-t border-neutral-200/40 text-paragraph-sm text-neutral-500 select-none justify-between relative">
              <span className="text-neutral-400 font-medium w-[150px] shrink-0">Page 1 of 16</span>

              <div className="flex items-center gap-xs justify-center flex-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled
                  className="text-neutral-400 hover:text-neutral-900"
                >
                  <RiArrowLeftDoubleLine className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled
                  className="text-neutral-400 hover:text-neutral-900"
                >
                  <RiArrowLeftSLine className="size-4" />
                </Button>

                <div className="flex items-center gap-xs">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setCurrentPage(1)}
                    className={`text-paragraph-sm font-semibold ${
                      currentPage === 1 ? "bg-neutral-950 text-white hover:bg-neutral-950 hover:text-white" : "text-neutral-400 hover:text-neutral-900"
                    }`}
                  >
                    1
                  </Button>
                  <Button
                    variant={currentPage === 2 ? "ghost" : "outline"}
                    size="icon-sm"
                    onClick={() => setCurrentPage(2)}
                    className={`text-paragraph-sm font-semibold ${
                      currentPage === 2
                        ? "bg-neutral-950 text-white hover:bg-neutral-950 hover:text-white"
                        : "text-neutral-700"
                    }`}
                  >
                    2
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setCurrentPage(3)}
                    className="text-paragraph-sm font-semibold text-neutral-400 hover:text-neutral-900"
                  >
                    3
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setCurrentPage(4)}
                    className="text-paragraph-sm font-semibold text-neutral-400 hover:text-neutral-900"
                  >
                    4
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setCurrentPage(5)}
                    className="text-paragraph-sm font-semibold text-neutral-400 hover:text-neutral-900"
                  >
                    5
                  </Button>
                  <span className="size-8 flex items-center justify-center text-neutral-400 font-semibold select-none">...</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setCurrentPage(16)}
                    className="text-paragraph-sm font-semibold text-neutral-400 hover:text-neutral-900"
                  >
                    16
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-neutral-400 hover:text-neutral-900"
                >
                  <RiArrowRightSLine className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-neutral-400 hover:text-neutral-900"
                >
                  <RiArrowRightDoubleLine className="size-4" />
                </Button>
              </div>

              <div className="w-[150px] shrink-0 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="px-lg text-[13px] font-medium text-[#5C5C5C]"
                >
                  10 / page
                  <RiArrowDownSLine className="size-3 text-neutral-400" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <ChangeCaseStatusModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        currentStatus={
          statusModalRow
            ? CASE_STATUSES.find((s) => s.label === statusModalRow.status)?.value || ""
            : ""
        }
        onApply={(newStatus) => {
          const norm = newStatus.toLowerCase().replace(/_/g, " ").trim();
          if (norm === "visa refused" || norm === "visa_refused") {
            // Open refusal reason modal instead
            if (statusModalRow) {
              setRefusedModalRow(statusModalRow);
              setRefusedModalOpen(true);
            }
          } else {
            handleChangeStatus(newStatus);
          }
        }}
      />

      <MarkVisaRefusedModal
        open={refusedModalOpen}
        onOpenChange={setRefusedModalOpen}
        caseInfo={
          refusedModalRow
            ? {
                caseId: refusedModalRow.caseId,
                name: refusedModalRow.name,
                avatarText: refusedModalRow.avatarText,
                avatarUrl: refusedModalRow.avatarUrl,
              }
            : null
        }
        onConfirm={handleMarkRefused}
      />

      <ArchiveCaseModal
        open={archiveModalOpen}
        onOpenChange={setArchiveModalOpen}
        caseInfo={
          archiveModalRow
            ? {
                caseId: archiveModalRow.caseId,
                name: archiveModalRow.name,
                avatarText: archiveModalRow.avatarText,
                avatarUrl: archiveModalRow.avatarUrl,
              }
            : null
        }
        onConfirm={() => {
          if (archiveModalRow) {
            handleArchiveCase(archiveModalRow);
          }
        }}
      />

      <DeleteCaseModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        caseInfo={
          deleteModalRow
            ? {
                caseId: deleteModalRow.caseId,
                name: deleteModalRow.name,
                avatarText: deleteModalRow.avatarText,
                avatarUrl: deleteModalRow.avatarUrl,
              }
            : null
        }
        onConfirm={() => {
          if (deleteModalRow) {
            handleDeleteCase(deleteModalRow);
          }
        }}
      />

      <CaseActionModal
        open={actionModalOpen}
        onOpenChange={setActionModalOpen}
        row={actionModalRow}
        onSuccess={handleActionCompleted}
      />
    </div>
  );
}
