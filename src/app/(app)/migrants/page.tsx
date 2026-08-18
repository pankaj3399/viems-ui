"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RiSearchLine,
  RiFilterLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiMore2Line,
  RiAddLine,
  RiUploadLine,
  RiUserLine,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { formatFullName, getInitials, getStatusBadgeStyle } from "@/lib/utils";
import { getCountryInfo } from "@/lib/country";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { useTableSort } from "@/hooks/useTableSort";
import { toast } from "sonner";
import { CountryFilterDropdown } from "../cases/components/CountryFilterDropdown";
import { StatusFilterDropdown } from "../cases/components/StatusFilterDropdown";
import { CaseRowMenu } from "../cases/components/CaseRowMenu";
import { ChangeCaseStatusModal } from "../cases/components/ChangeCaseStatusModal";
import { MarkVisaRefusedModal } from "../cases/components/MarkVisaRefusedModal";
import { ArchiveCaseModal } from "../cases/components/ArchiveCaseModal";
import { DeleteCaseModal } from "../cases/components/DeleteCaseModal";
import { CaseActionModal } from "../cases/components/CaseActionModal";
import { ImportMigrantsModal } from "../dashboard/components/ImportMigrantsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flag } from "@/components/ui/flag";

interface MigrantRow {
  id?: number;
  caseId: string;
  country: string;
  countryCode: string;
  countryHalf: string;
  flag: string;
  name: string;
  group: string;
  avatarText: string;
  avatarUrl?: string;
  status: string;
  migration: string;
  migrationColor: "outside" | "pending" | "active" | "pre" | "withdrawn" | "archived" | "unknown";
  action: string;
  actionColor: "blue" | "red" | "yellow" | "gray";
}

function getErrorStatusCode(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null) {
    const err = error as { status?: number; response?: { status?: number } };
    return err.status ?? err.response?.status;
  }
  return undefined;
}

const DEFAULT_MIGRANTS: MigrantRow[] = [];

export default function MigrantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialNationality = searchParams?.get("nationality") || null;

  const [migrants, setMigrants] = React.useState<MigrantRow[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [countryFilter, setCountryFilter] = React.useState<string | null>(initialNationality);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [needsActionOnly, setNeedsActionOnly] = React.useState(false);
  const { sortField, sortDirection, setSortField, setSortDirection, handleSort, renderSortIcon } = useTableSort<MigrantRow>();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [loading, setLoading] = React.useState(false);

  // Modal states for action handling
  const [selectedRow, setSelectedRow] = React.useState<MigrantRow | null>(null);
  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [refusedModalOpen, setRefusedModalOpen] = React.useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [actionModalOpen, setActionModalOpen] = React.useState(false);
  const [importModalOpen, setImportModalOpen] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);

  const fetchCasesData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<any>(ENDPOINTS.cases.base);
      const rawArr: any[] = Array.isArray(res) ? res : res?.data ?? [];
      if (rawArr.length > 0) {
        const mapped: MigrantRow[] = rawArr.map((c, i) => {
          const name = formatFullName(c.first_name, c.last_name) || c.name || "Unknown Migrant";
          const initials = getInitials(name) || "—";
          const caseId = c.caseIdDisplay || c.caseNumber || (c.id ? `CASE-${c.id}` : "Unknown");
          
          const rawVal =
            c.nationality_value ||
            c.country ||
            c.country_code ||
            c.nationality ||
            c.nationality_code ||
            c.migrant?.user?.personalInfo?.nationalityCode ||
            c.migrant?.user?.personalInfo?.nationality?.value ||
            c.migrant?.user?.personalInfo?.nationality?.name ||
            c.migrant?.user?.personalInfo?.nationality?.title;

          const countryObj = getCountryInfo(rawVal);
          const rawStatus = (c.case_status || c.status || "").toString().trim();
          const normStatus = rawStatus.toLowerCase().replace(/_/g, " ").trim();

          let statusDisplay = rawStatus || "Pending";
          if (normStatus === "in progress" || normStatus === "in_progress") statusDisplay = "In Progress";
          else if (normStatus === "cos assigned" || normStatus === "cos_assigned") statusDisplay = "CoS Assigned";
          else if (normStatus === "visa approved" || normStatus === "visa_approved" || normStatus === "granted") statusDisplay = "Visa Approved";
          else if (normStatus === "visa refused" || normStatus === "visa_refused" || normStatus === "refused") statusDisplay = "Visa Refused";
          else if (normStatus === "withdrawn" || normStatus === "application withdrawn" || normStatus === "application_withdrawn") statusDisplay = "Withdrawn";
          else if (normStatus === "awaiting applicant docs" || normStatus === "awaiting_applicant_docs") statusDisplay = "Awaiting Docs";
          else if (normStatus === "drafting cos" || normStatus === "drafting_cos") statusDisplay = "Drafting CoS";
          else if (normStatus === "draft") statusDisplay = "Draft";
          else if (normStatus === "pending") statusDisplay = "Pending";

          const rawMigration = (c.migration_stage || c.migration_status || c.migrationStatus || "").toString().trim().toUpperCase();
          let migration = "ACTIVE COMPLIANCE";
          let migrationColor: MigrantRow["migrationColor"] = "active";

          if (rawMigration) {
            if (rawMigration.includes("OUTSIDE")) {
              migration = "OUTSIDE UK";
              migrationColor = "outside";
            } else if (rawMigration.includes("PENDING") || rawMigration.includes("RTW")) {
              migration = "ARRIVED – RTW PENDING";
              migrationColor = "pending";
            } else if (rawMigration.includes("ACTIVE") || rawMigration.includes("COMPLIANCE")) {
              migration = "ACTIVE COMPLIANCE";
              migrationColor = "active";
            } else if (rawMigration.includes("PRE")) {
              migration = "PRE-ARRIVAL";
              migrationColor = "pre";
            } else if (rawMigration.includes("WITHDRAWN")) {
              migration = "SPONSORSHIP WITHDRAWN";
              migrationColor = "withdrawn";
            } else if (rawMigration.includes("REFUSED")) {
              migration = "VISA REFUSED";
              migrationColor = "withdrawn";
            } else if (rawMigration.includes("ARCHIVED") || rawMigration.includes("CLOSED") || rawMigration.includes("LEFT")) {
              migration = "ARCHIVED";
              migrationColor = "archived";
            } else {
              migration = rawMigration;
              migrationColor = "active";
            }
          } else {
            if (normStatus.includes("refused")) {
              migration = "VISA REFUSED";
              migrationColor = "withdrawn";
            } else if (normStatus.includes("withdrawn") || normStatus.includes("closed")) {
              migration = "SPONSORSHIP WITHDRAWN";
              migrationColor = "withdrawn";
            } else if (normStatus.includes("pending") || normStatus.includes("awaiting") || normStatus.includes("draft")) {
              migration = "PRE-ARRIVAL";
              migrationColor = "pre";
            } else if (normStatus.includes("approved") || normStatus.includes("assigned") || normStatus.includes("granted")) {
              migration = "UNKNOWN";
              migrationColor = "archived";
            } else {
              migration = "UNKNOWN";
              migrationColor = "archived";
            }
          }

          const rawAction = (c.action || c.pending_action || c.required_action || "").toString().trim();
          let action = "No action required";
          let actionColor: MigrantRow["actionColor"] = "gray";

          if (rawAction) {
            action = rawAction;
            const upperAct = rawAction.toUpperCase();
            if (upperAct.includes("CHECK") || upperAct.includes("REPORT") || upperAct.includes("REVIEW")) {
              actionColor = "red";
            } else if (upperAct.includes("SCHEDULE")) {
              actionColor = "yellow";
            } else {
              actionColor = "blue";
            }
          } else if (migrationColor === "pending" || migration.includes("RTW PENDING")) {
            action = "Check RTW";
            actionColor = "red";
          } else if (migrationColor === "pre" || migration.includes("PRE-ARRIVAL")) {
            action = "Schedule RTW check";
            actionColor = "yellow";
          } else if (migrationColor === "withdrawn" || normStatus.includes("refused") || normStatus.includes("withdrawn")) {
            action = "Review and report";
            actionColor = "red";
          }

          return {
            id: c.id ?? i + 1,
            caseId,
            country: countryObj.full,
            countryCode: countryObj.code,
            countryHalf: countryObj.half,
            flag: countryObj.flag,
            name,
            group: c.group_name || c.group || "—",
            avatarText: initials,
            status: statusDisplay,
            migration,
            migrationColor,
            action,
            actionColor,
          };
        });
        setMigrants(mapped);
      } else {
        setMigrants([]);
      }
    } catch (err) {
      console.error("Failed to fetch cases for migrants table:", err);
      setMigrants([]);
      setError("Failed to load migrant records.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCasesData();
  }, [fetchCasesData]);

  const availableCountries = React.useMemo(() => {
    const map = new Map<string, { code: string; label: string; flag: string; count: number }>();
    migrants.forEach((m) => {
      if (!m.countryCode) return;
      const key = m.countryCode.toUpperCase();
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          code: key,
          label: m.country || key,
          flag: m.flag || "🌐",
          count: 1,
        });
      }
    });
    return Array.from(map.values());
  }, [migrants]);

  const availableStatuses = React.useMemo(() => {
    const map = new Map<string, number>();
    migrants.forEach((m) => {
      if (!m.status) return;
      map.set(m.status, (map.get(m.status) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, count]) => ({
      label,
      count,
    }));
  }, [migrants]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [countryFilter, statusFilter, needsActionOnly, searchQuery, sortField, sortDirection]);

  const filteredMigrants = React.useMemo(() => {
    const list = migrants.filter((m) => {
      if (countryFilter) {
        const cf = countryFilter.toLowerCase().trim();
        const matches =
          m.countryCode.toLowerCase() === cf ||
          m.country.toLowerCase().includes(cf);
        if (!matches) return false;
      }
      if (statusFilter && m.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (needsActionOnly && m.action === "No action required") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.caseId.toLowerCase().includes(q) ||
          m.group.toLowerCase().includes(q) ||
          m.country.toLowerCase().includes(q) ||
          m.countryCode.toLowerCase().includes(q) ||
          m.status.toLowerCase().includes(q) ||
          m.migration.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (!sortField) return list;

    return [...list].sort((a, b) => {
      const valA = (a[sortField] || "").toString().toLowerCase();
      const valB = (b[sortField] || "").toString().toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [migrants, countryFilter, statusFilter, needsActionOnly, searchQuery, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredMigrants.length / itemsPerPage));

  const pageNumbers = React.useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  }, [currentPage, totalPages]);

  const currentRows = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMigrants.slice(start, start + itemsPerPage);
  }, [filteredMigrants, currentPage, itemsPerPage]);

  const handleRowClick = (migrant: MigrantRow) => {
    if (migrant.id) {
      router.push(`/migrants/${migrant.id}`);
    }
  };

  const getMigrationBadgeStyle = (type: MigrantRow["migrationColor"]) => {
    switch (type) {
      case "pending":
        return { dot: "bg-[#FB3748]", text: "text-[#681219]" };
      case "active":
        return { dot: "bg-[#1FC16B]", text: "text-[#0B4627]" };
      case "pre":
        return { dot: "bg-[#F6B51E]", text: "text-[#855B00]" };
      case "withdrawn":
        return { dot: "bg-[#FB3748]", text: "text-[#681219]" };
      case "archived":
      case "unknown":
      case "outside":
      default:
        return { dot: "bg-[#7B7B7B]", text: "text-[#7B7B7B]" };
    }
  };

  return (
    <div className="px-[40px] py-[32px] pb-[80px] flex flex-col gap-xl font-sans bg-[#F7F7F7] min-h-screen select-none">
      {/* Top Header Row */}
      <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-xl shrink-0">
        <div>
          <h1 className="text-[28px] text-[#171717] tracking-[-0.01em] leading-[36px] font-aeonik-medium">
            Migrants
          </h1>
          <p className="text-[14px] text-[#7B7B7B] tracking-[-0.006em] mt-1 leading-[20px] font-sans">
            Create, track, and manage visa cases for individual or grouped applicants.
          </p>
        </div>
        <div className="flex items-center gap-[12px]">
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-xs px-xl py-lg h-9 bg-white border border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] rounded-[10px] text-[14px] font-semibold leading-[20px] tracking-[-0.006em] transition-all cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          >
            <RiUploadLine className="size-4 text-[#5C5C5C]" />
            Import
          </button>
          <button
            type="button"
            onClick={() => router.push("/migrants/create")}
            className="flex items-center gap-xs px-xl py-lg h-9 bg-[#7D52F4] hover:bg-brand-dark text-white rounded-[10px] text-[14px] font-semibold leading-[20px] tracking-[-0.006em] transition-all cursor-pointer"
          >
            <RiAddLine className="size-4 text-white" />
            New migrant
          </button>
        </div>
      </div>

      {/* Toolbar / Search & Filter Controls */}
      <div className="flex items-center gap-[12px] w-full">
        {/* Search Bar */}
        <div className="w-[348px] h-[32px] bg-white border border-[#EBEBEB] rounded-[8px] px-[8px] py-[6px] flex items-center gap-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <RiSearchLine className="size-5 text-[#A4A4A4] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-[14px] font-normal text-[#171717] placeholder:text-[#A4A4A4] border-0 outline-none leading-[20px]"
          />
        </div>

        {/* Filter Button */}
        <button
          type="button"
          aria-label="Reset filters"
          onClick={() => {
            setSearchQuery("");
            setCountryFilter(null);
            setStatusFilter(null);
            setNeedsActionOnly(false);
            setSortField(null);
            setSortDirection("asc");
          }}
          className="size-8 bg-white border border-[#EBEBEB] rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          title="Reset filters"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" aria-hidden="true">
            <path d="M8.5 14.5H11.5V13H8.5V14.5ZM3.25 5.5V7H16.75V5.5H3.25ZM5.5 10.75H14.5V9.25H5.5V10.75Z" fill="currentColor" />
          </svg>
        </button>

        {/* Country Filter Dropdown */}
        <CountryFilterDropdown
          countries={availableCountries}
          value={countryFilter}
          onChange={(val: string | null) => setCountryFilter(val)}
        />

        {/* Status Filter Dropdown */}
        <StatusFilterDropdown
          statuses={availableStatuses}
          value={statusFilter}
          onChange={(val: string | null) => setStatusFilter(val)}
          statusColors={{
            "Visa Approved": "#1FC16B",
            "CoS Assigned": "#1FC16B",
            "Active Compliance": "#1FC16B",
            "Pending": "#F6B51E",
            "Pre-Arrival": "#F6B51E",
            "Awaiting Docs": "#F6B51E",
            "Awaiting applicant docs": "#F6B51E",
            "Drafting CoS": "#7D52F4",
            "In Progress": "#7D52F4",
            "Visa Refused": "#FB3748",
            "Sponsorship Withdrawn": "#FB3748",
            "Withdrawn": "#7B7B7B",
            "Draft": "#7B7B7B",
            "Case Closed": "#7B7B7B",
            "Archived": "#7B7B7B",
          }}
        />

        {/* Quick Filter: Needs Action */}
        <button
          type="button"
          aria-pressed={needsActionOnly}
          onClick={() => setNeedsActionOnly((prev) => !prev)}
          className={`h-8 px-[12px] border rounded-[8px] text-[14px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)] ${
            needsActionOnly
              ? "bg-[#171717] border-[#171717] text-white"
              : "bg-white border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717]"
          }`}
        >
          <span>Needs action</span>
        </button>
      </div>

      {/* Main Table / Empty State Container */}
      {loading ? (
        <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-2 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <span className="text-[14px] font-medium text-[#5C5C5C] animate-pulse">Loading migrant records...</span>
        </div>
      ) : migrants.length === 0 ? (
        <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-3 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <div className="size-12 rounded-full bg-[#FAF8FF] border border-[#E5DBFF] flex items-center justify-center text-[#7D52F4]">
            <RiUserLine className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-[16px] font-semibold text-[#171717]">No migrant records found</h3>
            <p className="text-[14px] text-[#5C5C5C]">There are no migrant applicants currently registered.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/migrants/create")}
            className="mt-2 h-9 px-4 bg-[#7D52F4] hover:bg-brand-dark text-white rounded-[10px] text-[14px] font-semibold transition-all cursor-pointer"
          >
            + Add New Migrant
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-[8px] w-full">
            {/* Table Header */}
            <div className="h-[36px] bg-[#F5F5F5] rounded-[8px] px-4 flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => handleSort("caseId")}
                className="w-[124px] shrink-0 flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent border-0 p-0 text-left transition-colors"
              >
                <span>CASE ID #</span>
                {renderSortIcon("caseId")}
              </button>
              <button
                type="button"
                onClick={() => handleSort("country")}
                className="w-[180px] shrink-0 flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent border-0 p-0 text-left transition-colors"
              >
                <span>COUNTRY</span>
                {renderSortIcon("country")}
              </button>
              <button
                type="button"
                onClick={() => handleSort("name")}
                className="w-[200px] shrink-0 flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent border-0 p-0 text-left transition-colors"
              >
                <span>MIGRANT</span>
                {renderSortIcon("name")}
              </button>
              <button
                type="button"
                onClick={() => handleSort("action")}
                className="w-[180px] shrink-0 flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent border-0 p-0 text-left transition-colors"
              >
                <span>ACTION</span>
                {renderSortIcon("action")}
              </button>
              <button
                type="button"
                onClick={() => handleSort("status")}
                className="w-[160px] shrink-0 flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent border-0 p-0 text-left transition-colors"
              >
                <span>VISA STATUS</span>
                {renderSortIcon("status")}
              </button>
              <button
                type="button"
                onClick={() => handleSort("migration")}
                className="w-[257px] shrink-0 flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent border-0 p-0 text-left transition-colors"
              >
                <span>MIGRATION STATUS</span>
                {renderSortIcon("migration")}
              </button>
              <div className="w-[48px] shrink-0" />
            </div>

            {/* Table Rows */}
            <div className="flex flex-col gap-[4px] w-full">
              {error ? (
                <div className="bg-white border border-[#FECDCA] rounded-[12px] p-8 text-center flex flex-col items-center justify-center gap-xs">
                  <span className="text-[14px] font-semibold text-[#FB3748]">{error}</span>
                  <button
                    type="button"
                    onClick={fetchCasesData}
                    className="mt-2 text-[13px] font-medium text-[#7D52F4] hover:underline cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredMigrants.length === 0 ? (
                <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-8 text-center text-[14px] text-[#5C5C5C]">
                  No migrants match your search or filter criteria.
                </div>
              ) : (
                currentRows.map((migrant, idx) => {
                  const badgeStyle = getMigrationBadgeStyle(migrant.migrationColor);

                  return (
                    <div
                      key={migrant.id ? `migrant-${migrant.id}-${idx}` : `migrant-${migrant.caseId}-${idx}`}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("[role='menu']")) {
                          return;
                        }
                        handleRowClick(migrant);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("[role='menu']")) {
                            return;
                          }
                          e.preventDefault();
                          handleRowClick(migrant);
                        }
                      }}
                      className="w-full h-[56px] bg-white border border-transparent hover:border-[#EBEBEB] rounded-[16px] px-4 flex items-center justify-between transition-all cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
                    >
                      {/* Case ID */}
                      <div className="w-[124px] flex items-center">
                        <span className="font-mono text-[14px] font-medium text-[#171717]">
                          {migrant.caseId}
                        </span>
                      </div>

                      {/* Country */}
                      <div className="w-[180px] flex items-center gap-2">
                        <Flag country={migrant.countryCode} className="size-4 rounded-full object-cover shrink-0" />
                        <span className="text-[14px] font-medium text-[#171717]">
                          {migrant.country}
                        </span>
                      </div>

                      {/* Migrant (Avatar + Name & Group) */}
                      <div className="w-[200px] flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-[#EBEBEB] text-[#171717] flex items-center justify-center font-medium text-[12px] shrink-0 font-sans">
                          {migrant.avatarText}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[14px] font-medium text-[#171717] truncate leading-[20px]">
                            {migrant.name}
                          </span>
                          <span className="text-[13px] font-normal text-[#5C5C5C] truncate leading-[18px]">
                            {migrant.group}
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="w-[180px] flex items-center">
                        {migrant.action === "Check RTW" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRow(migrant);
                              setActionModalOpen(true);
                            }}
                            className="px-[8px] py-[2px] bg-[#FFEBEC] text-[#681219] hover:bg-[#FFD6D8] rounded-[6px] text-[12px] font-medium leading-[16px] transition-colors border-0 cursor-pointer"
                          >
                            Check RTW
                          </button>
                        ) : migrant.action === "Schedule RTW check" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRow(migrant);
                              setActionModalOpen(true);
                            }}
                            className="px-[8px] py-[2px] bg-[#FFFAEB] text-[#855B00] hover:bg-[#FFEFC2] rounded-[6px] text-[12px] font-medium leading-[16px] transition-colors border-0 cursor-pointer"
                          >
                            Schedule RTW check
                          </button>
                        ) : migrant.action === "Review and report" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRow(migrant);
                              setActionModalOpen(true);
                            }}
                            className="px-[8px] py-[2px] bg-[#FFEBEC] text-[#681219] hover:bg-[#FFD6D8] rounded-[6px] text-[12px] font-medium leading-[16px] transition-colors border-0 cursor-pointer"
                          >
                            Review and report
                          </button>
                        ) : (
                          <span className="text-[14px] font-normal text-[#5C5C5C]">
                            No action required
                          </span>
                        )}
                      </div>

                      {/* Visa Status */}
                      <div className="w-[160px] flex items-center">
                        {(() => {
                          const statusStyle = getStatusBadgeStyle(migrant.status);
                          return (
                            <div className={`inline-flex items-center gap-1.5 px-[8px] py-[2px] ${statusStyle.bg} ${statusStyle.text} rounded-full text-[12px] font-medium`}>
                              <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
                              <span className="truncate">
                                {migrant.status}
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Migration Status */}
                      <div className="w-[257px] flex items-center gap-2">
                        <div className={`size-[6px] rounded-full ${badgeStyle.dot} shrink-0`} />
                        <span className={`text-[11px] font-semibold tracking-[0.02em] uppercase leading-[12px] ${badgeStyle.text}`}>
                          {migrant.migration}
                        </span>
                      </div>

                      {/* More actions menu */}
                      <div className="w-[48px] flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                        <CaseRowMenu
                          onResolve={() => {
                            setSelectedRow(migrant);
                            setActionModalOpen(true);
                          }}
                          onChangeStatus={() => { setSelectedRow(migrant); setStatusModalOpen(true); }}
                          onMarkRefused={() => { setSelectedRow(migrant); setRefusedModalOpen(true); }}
                          onViewDetails={() => handleRowClick(migrant)}
                          onArchive={() => { setSelectedRow(migrant); setArchiveModalOpen(true); }}
                          onDelete={() => { setSelectedRow(migrant); setDeleteModalOpen(true); }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination Footer Group */}
          <div className="flex items-center justify-between w-full h-[32px] mt-2 border-t border-[#EBEBEB] pt-[24px]">
            {/* Left Page Summary */}
            <span className="text-[14px] font-normal text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
              Page {currentPage} of {totalPages}
            </span>

            {/* Center Page Numbers */}
            <div className="flex items-center gap-[8px]">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
              >
                «
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
              >
                ‹
              </button>

              {pageNumbers.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`size-8 rounded-[8px] text-[13px] font-medium flex items-center justify-center transition-colors cursor-pointer border-0 ${
                    currentPage === p
                      ? "bg-[#171717] text-white"
                      : "text-[#5C5C5C] hover:bg-neutral-200"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
              >
                »
              </button>
            </div>

            {/* Right Per-Page Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 h-8 px-3 rounded-[8px] border border-[#EBEBEB] bg-white text-[13px] text-[#171717] hover:bg-neutral-50 transition-colors outline-none cursor-pointer">
                <span>{itemsPerPage} / page</span>
                <RiArrowDownSLine className="size-4 text-[#5C5C5C]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[120px]">
                {[10, 20, 50, 100].map((size) => (
                  <DropdownMenuItem
                    key={size}
                    onClick={() => {
                      setItemsPerPage(size);
                      setCurrentPage(1);
                    }}
                    className="text-[13px] cursor-pointer"
                  >
                    {size} / page
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}

      {/* Action & Status Modals */}
      {selectedRow && (
        <>
          <ChangeCaseStatusModal
            open={statusModalOpen}
            onOpenChange={setStatusModalOpen}
            currentStatus={selectedRow.status}
            onApply={async (newStatus: string) => {
              try {
                if (!selectedRow.id) {
                  toast.error("Invalid case ID");
                  return;
                }
                let success = false;
                try {
                  await apiClient.patch(ENDPOINTS.cases.byId(selectedRow.id), {
                    case_status: newStatus,
                    status: newStatus,
                  });
                  success = true;
                } catch (caseErr: unknown) {
                  console.error("Initial case status update failed:", caseErr);
                  const statusCode = getErrorStatusCode(caseErr);
                  if (statusCode === 404 || statusCode === 405) {
                    await apiClient.patch(ENDPOINTS.migrants.byId(selectedRow.id), {
                      case_status: newStatus,
                      status: newStatus,
                    });
                    success = true;
                  } else {
                    throw caseErr;
                  }
                }
                if (success) {
                  toast.success("Case status updated successfully");
                  fetchCasesData();
                }
              } catch (err: unknown) {
                console.error("Failed to update status in backend:", err);
                const message = err instanceof Error ? err.message : "Failed to update case status";
                toast.error(message);
              }
            }}
          />
          <MarkVisaRefusedModal
            open={refusedModalOpen}
            onOpenChange={setRefusedModalOpen}
            caseInfo={{
              caseId: selectedRow.caseId,
              name: selectedRow.name,
              avatarText: selectedRow.avatarText,
            }}
            onConfirm={async (reason: string, customText?: string) => {
              try {
                if (!selectedRow.id) {
                  toast.error("Invalid case ID");
                  return;
                }
                let success = false;
                try {
                  await apiClient.patch(`${ENDPOINTS.migrants.base}/credibility/${selectedRow.id}`, {
                    refusalReason: reason,
                    customReason: customText,
                    refusalDate: new Date().toISOString(),
                  });
                  success = true;
                } catch (refErr: unknown) {
                  console.error("Initial migrant credibility update failed:", refErr);
                  const statusCode = getErrorStatusCode(refErr);
                  if (statusCode === 404 || statusCode === 405) {
                    await apiClient.patch(ENDPOINTS.cases.byId(selectedRow.id), {
                      outcome: "Refused",
                      case_status: "Visa Refused",
                    });
                    success = true;
                  } else {
                    throw refErr;
                  }
                }
                if (success) {
                  toast.success("Case marked as visa refused");
                  fetchCasesData();
                }
              } catch (err: unknown) {
                console.error("Failed to mark visa refused:", err);
                const message = err instanceof Error ? err.message : "Failed to mark visa as refused";
                toast.error(message);
              }
            }}
          />
          <ArchiveCaseModal
            open={archiveModalOpen}
            onOpenChange={setArchiveModalOpen}
            caseInfo={{
              caseId: selectedRow.caseId,
              name: selectedRow.name,
              avatarText: selectedRow.avatarText,
            }}
            onConfirm={async () => {
              try {
                if (!selectedRow.id) {
                  toast.error("Invalid case ID");
                  return;
                }
                let success = false;
                try {
                  await apiClient.delete(ENDPOINTS.cases.toArchive, {
                    data: { data: [{ id: selectedRow.id }] },
                  });
                  success = true;
                } catch (archErr: unknown) {
                  console.error("Initial case archive failed:", archErr);
                  const statusCode = getErrorStatusCode(archErr);
                  if (statusCode === 404 || statusCode === 405) {
                    await apiClient.delete(`${ENDPOINTS.migrants.base}/to-archive`, {
                      data: { data: [{ id: selectedRow.id }] },
                    });
                    success = true;
                  } else {
                    throw archErr;
                  }
                }
                if (success) {
                  toast.success("Case archived successfully");
                  fetchCasesData();
                }
              } catch (err: unknown) {
                console.error("Failed to archive case:", err);
                const message = err instanceof Error ? err.message : "Failed to archive case";
                toast.error(message);
              }
            }}
          />
          <DeleteCaseModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            caseInfo={{
              caseId: selectedRow.caseId,
              name: selectedRow.name,
              avatarText: selectedRow.avatarText,
            }}
            onConfirm={async () => {
              try {
                if (!selectedRow.id) {
                  toast.error("Invalid case ID");
                  return;
                }
                let success = false;
                try {
                  await apiClient.delete(ENDPOINTS.cases.archive, {
                    data: { data: [{ id: selectedRow.id }] },
                  });
                  success = true;
                } catch (delErr: unknown) {
                  console.error("Initial case delete failed:", delErr);
                  const statusCode = getErrorStatusCode(delErr);
                  if (statusCode === 404 || statusCode === 405) {
                    await apiClient.delete(`${ENDPOINTS.migrants.base}/archive`, {
                      data: { data: [{ id: selectedRow.id }] },
                    });
                    success = true;
                  } else {
                    throw delErr;
                  }
                }
                if (success) {
                  toast.success("Case deleted successfully");
                  fetchCasesData();
                }
              } catch (err: unknown) {
                console.error("Failed to delete case:", err);
                const message = err instanceof Error ? err.message : "Failed to delete case";
                toast.error(message);
              }
            }}
          />
          <CaseActionModal
            open={actionModalOpen}
            onOpenChange={setActionModalOpen}
            row={selectedRow}
            onSuccess={() => {
              fetchCasesData();
            }}
          />
        </>
      )}

      {/* Import Migrants Modal */}
      <ImportMigrantsModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={() => {
          toast.success("Migrants imported successfully");
          fetchCasesData();
        }}
      />
    </div>
  );
}
