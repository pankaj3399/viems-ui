"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RiSearchLine,
  RiFilter3Line,
  RiArrowLeftSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightSLine,
  RiArrowRightDoubleLine,
  RiArrowDownSLine,
  RiAddLine,
  RiUploadLine,
  RiUserLine,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { formatFullName, getInitials } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [loading, setLoading] = React.useState(true);

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
          const caseId = c.caseIdDisplay || c.caseNumber || (c.id ? `${c.id}/2026` : `CASE-${i + 1}`);
          
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
          let migration = "Active Compliance";
          let migrationColor: MigrantRow["migrationColor"] = "active";

          if (rawMigration) {
            if (rawMigration.includes("OUTSIDE")) {
              migration = "Outside UK";
              migrationColor = "outside";
            } else if (rawMigration.includes("PENDING") || rawMigration.includes("RTW")) {
              migration = "Arrived – RTW Pending";
              migrationColor = "pending";
            } else if (rawMigration.includes("ACTIVE") || rawMigration.includes("COMPLIANCE")) {
              migration = "Active Compliance";
              migrationColor = "active";
            } else if (rawMigration.includes("PRE")) {
              migration = "Pre-Arrival";
              migrationColor = "pre";
            } else if (rawMigration.includes("WITHDRAWN")) {
              migration = "Sponsorship Withdrawn";
              migrationColor = "withdrawn";
            } else if (rawMigration.includes("REFUSED")) {
              migration = "Visa Refused";
              migrationColor = "withdrawn";
            } else if (rawMigration.includes("ARCHIVED") || rawMigration.includes("CLOSED") || rawMigration.includes("LEFT")) {
              migration = "Archived";
              migrationColor = "archived";
            } else if (rawMigration.includes("ENTERED")) {
              migration = "Entered";
              migrationColor = "active";
            } else {
              migration = rawMigration
                .toLowerCase()
                .split(/[\s_-]+/)
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
              migrationColor = "active";
            }
          } else {
            if (normStatus.includes("refused")) {
              migration = "Visa Refused";
              migrationColor = "withdrawn";
            } else if (normStatus.includes("withdrawn") || normStatus.includes("closed")) {
              migration = "Sponsorship Withdrawn";
              migrationColor = "withdrawn";
            } else if (normStatus.includes("pending") || normStatus.includes("awaiting") || normStatus.includes("draft")) {
              migration = "Pre-Arrival";
              migrationColor = "pre";
            } else if (normStatus.includes("approved") || normStatus.includes("assigned") || normStatus.includes("granted")) {
              migration = "Active Compliance";
              migrationColor = "active";
            } else {
              migration = "Unknown";
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
            group: c.group_name || c.group || c.sponsor_name || c.employer || "—",
            avatarText: initials,
            avatarUrl: c.avatar_url || c.migrant?.user?.personalInfo?.avatarUrl || c.photo_url || undefined,
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
      setError("Failed to load migrant records from server.");
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
      if (!m.migration) return;
      map.set(m.migration, (map.get(m.migration) || 0) + 1);
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
          m.country.toLowerCase().includes(cf) ||
          m.countryHalf.toLowerCase() === cf;
        if (!matches) return false;
      }
      if (statusFilter && m.migration.toLowerCase() !== statusFilter.toLowerCase()) return false;
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
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
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
        return { dot: "bg-[#F6B51E]", text: "text-[#624C18]" };
      case "withdrawn":
        return { dot: "bg-[#FB3748]", text: "text-[#681219]" };
      case "archived":
      case "outside":
      case "unknown":
      default:
        return { dot: "bg-[#7B7B7B]", text: "text-[#7B7B7B]" };
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCountryFilter(null);
    setStatusFilter(null);
    setNeedsActionOnly(false);
    setSortField(null);
    setSortDirection("asc");
  };

  return (
    <div className="px-[40px] py-[32px] pb-[80px] flex flex-col gap-[32px] font-sans bg-[#F7F7F7] min-h-screen select-none">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-xs px-xl py-lg h-9 bg-white border border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 rounded-[10px] text-[14px] font-semibold leading-[20px] tracking-[-0.006em] transition-all cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          >
            <RiUploadLine className="size-4 text-[#5C5C5C]" />
            Import
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => router.push("/migrants/create")}
            className="flex items-center gap-xs px-xl py-lg h-9 bg-brand-medium hover:bg-brand-dark text-white rounded-[10px] text-[14px] font-semibold leading-[20px] tracking-[-0.006em] transition-all cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          >
            <RiAddLine className="size-4 text-white" />
            New migrant
          </Button>
        </div>
      </div>

      {/* Widgets [HR Management] [1.1] Component Container */}
      <div className="flex flex-col items-start gap-[32px] w-full max-w-[1104px]">
        {/* Header / Toolbar (32px) */}
        <div className="flex flex-row items-center gap-[12px] w-full h-[32px]">
          {/* Search Bar */}
          <div className="w-[348px] h-[32px] bg-white border border-[#EBEBEB] rounded-[8px] px-[8px] py-[6px] flex items-center gap-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] focus-within:border-brand-medium focus-within:ring-2 focus-within:ring-brand-medium/20 transition-all shrink-0">
            <RiSearchLine className="size-5 text-[#A4A4A4] shrink-0" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-full border-0 bg-transparent p-0 text-[14px] font-normal text-[#171717] placeholder:text-[#A4A4A4] shadow-none focus-visible:ring-0 focus-visible:shadow-none leading-[20px] font-sans"
            />
          </div>

          {/* Filter Button */}
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={resetFilters}
            className="size-8 bg-white border border-[#EBEBEB] rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)] shrink-0"
            title="Reset filters"
          >
            <RiFilter3Line className="size-5 text-[#5C5C5C]" />
          </Button>

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
              "Active Compliance": "#1FC16B",
              "Arrived – RTW Pending": "#FB3748",
              "Pre-Arrival": "#F6B51E",
              "Outside UK": "#7B7B7B",
              "Sponsorship Withdrawn": "#FB3748",
              "Archived": "#7B7B7B",
            }}
          />

          {/* Quick Filter: Needs Action */}
          <Button
            type="button"
            variant={needsActionOnly ? "primary-neutral" : "outline"}
            size="sm"
            onClick={() => setNeedsActionOnly((prev) => !prev)}
            className={`h-8 px-[12px] py-[6px] border rounded-[8px] text-[14px] font-medium leading-[20px] flex items-center justify-center transition-all cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)] shrink-0 ${
              needsActionOnly
                ? "bg-[#171717] border-[#171717] text-white hover:bg-[#171717]/90"
                : "bg-white border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 hover:border-neutral-300"
            }`}
          >
            <span>Needs action</span>
          </Button>
        </div>

        {/* Frame 67: Table Header & Rows */}
        <div className="flex flex-col items-start gap-[8px] w-full">
          {/* Header Row (36px, #F7F7F7) */}
          <div className="w-full h-[36px] bg-[#F7F7F7] rounded-[8px] px-[4px] flex flex-row items-center">
            {/* Case ID column */}
            <div className="w-[94px] h-[32px] px-[12px] py-[8px] flex items-center">
              <span className="text-[12px] font-medium text-[#A4A4A4] uppercase tracking-[0.04em] leading-[16px] select-none font-sans">
                CASE ID #
              </span>
            </div>

            {/* Country column */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleSort("country")}
              className="w-[112px] h-[36px] px-[12px] py-[8px] flex items-center justify-start gap-[2px] text-[12px] font-medium text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] leading-[16px] cursor-pointer bg-transparent hover:bg-transparent border-0 rounded-none transition-colors"
            >
              <span>COUNTRY</span>
              {renderSortIcon("country")}
            </Button>

            {/* Name column */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleSort("name")}
              className="flex-1 h-[36px] px-[12px] py-[8px] flex items-center justify-start gap-[2px] text-[12px] font-medium text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] leading-[16px] cursor-pointer bg-transparent hover:bg-transparent border-0 rounded-none transition-colors"
            >
              <span>NAME</span>
              {renderSortIcon("name")}
            </Button>

            {/* Migration status column */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleSort("migration")}
              className="w-[257.5px] h-[36px] px-[12px] py-[8px] flex items-center justify-start gap-[2px] text-[12px] font-medium text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] leading-[16px] cursor-pointer bg-transparent hover:bg-transparent border-0 rounded-none transition-colors"
            >
              <span>MIGRATION STATUS</span>
              {renderSortIcon("migration")}
            </Button>

            {/* Action spacer */}
            <div className="w-[48px] h-[36px] px-[12px] py-[8px]" />
          </div>

          {/* Frame 68: Table Rows */}
          <div className="flex flex-col items-start gap-[4px] w-full">
            {loading ? (
              <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-2 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
                <span className="text-[14px] font-medium text-[#5C5C5C] animate-pulse">
                  Loading migrant records...
                </span>
              </div>
            ) : error ? (
              <div className="w-full bg-white border border-[#FECDCA] rounded-[16px] p-8 text-center flex flex-col items-center justify-center gap-xs shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
                <span className="text-[14px] font-semibold text-[#FB3748]">{error}</span>
                <Button
                  type="button"
                  variant="link"
                  onClick={fetchCasesData}
                  className="mt-2 text-[13px] font-medium text-[#7D52F4] hover:underline cursor-pointer"
                >
                  Retry
                </Button>
              </div>
            ) : migrants.length === 0 ? (
              <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-3 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
                <div className="size-12 rounded-full bg-[#FAF8FF] border border-[#E5DBFF] flex items-center justify-center text-[#7D52F4]">
                  <RiUserLine className="size-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[16px] font-semibold text-[#171717]">No migrant records found</h3>
                  <p className="text-[14px] text-[#5C5C5C]">There are no migrant applicants currently registered.</p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setImportModalOpen(true)}
                    className="h-9 px-4 rounded-[10px] text-[14px] font-medium border-[#EBEBEB] text-[#171717] hover:bg-neutral-50 cursor-pointer"
                  >
                    Import Migrants
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => router.push("/migrants/create")}
                    className="h-9 px-4 bg-brand-medium hover:bg-brand-dark text-white rounded-[10px] text-[14px] font-semibold transition-all cursor-pointer"
                  >
                    + Add New Migrant
                  </Button>
                </div>
              </div>
            ) : filteredMigrants.length === 0 ? (
              <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-3 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
                <div className="size-12 rounded-full bg-[#FAF8FF] border border-[#E5DBFF] flex items-center justify-center text-[#7D52F4]">
                  <RiUserLine className="size-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[16px] font-semibold text-[#171717]">No migrants match your filters</h3>
                  <p className="text-[14px] text-[#5C5C5C]">Try adjusting your search query or clear your active filters.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="mt-2 h-9 px-4 rounded-[10px] text-[14px] font-medium border-[#EBEBEB] text-[#171717] hover:bg-neutral-50 cursor-pointer"
                >
                  Clear filters
                </Button>
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
                    className="w-full h-[72px] bg-white border border-transparent hover:border-[#F5F5F5] rounded-[16px] p-[4px] flex flex-row items-center transition-all cursor-pointer hover:shadow-[0px_2px_8px_rgba(10,13,20,0.04)] select-none"
                  >
                    {/* Case ID (94px) */}
                    <div className="w-[94px] h-[64px] px-[12px] flex items-center shrink-0">
                      <span className="font-mono text-[14px] font-normal leading-[20px] tracking-[-0.006em] text-[#5C5C5C]">
                        {migrant.caseId}
                      </span>
                    </div>

                    {/* Country (112px) */}
                    <div className="w-[112px] h-[64px] px-[12px] flex items-center gap-[8px] shrink-0">
                      <Flag country={migrant.countryCode} className="size-6 shrink-0" />
                      <span className="text-[14px] font-normal leading-[20px] tracking-[-0.006em] text-[#171717] font-sans">
                        {migrant.countryCode}
                      </span>
                    </div>

                    {/* Migrant Name + Avatar (flex-1) */}
                    <div className="flex-1 h-[64px] px-[12px] flex items-center gap-[12px] min-w-0">
                      <Avatar size="lg" className="size-10 rounded-full shrink-0">
                        {migrant.avatarUrl && (
                          <AvatarImage
                            src={migrant.avatarUrl}
                            alt={migrant.name}
                            className="size-full rounded-full object-cover"
                          />
                        )}
                        <AvatarFallback className="size-full rounded-full bg-[#EBEBEB] text-[#171717] font-medium text-[16px] leading-[24px] flex items-center justify-center font-sans">
                          {migrant.avatarText}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-[2px] min-w-0">
                        <span className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-[#171717] truncate font-sans">
                          {migrant.name}
                        </span>
                        <span className="text-[12px] font-normal leading-[16px] text-[#5C5C5C] truncate font-sans">
                          {migrant.group}
                        </span>
                      </div>
                    </div>

                    {/* Migration Status (257.5px) */}
                    <div className="w-[257.5px] h-[64px] px-[12px] flex items-center gap-[8px] shrink-0">
                      <div className="flex items-center gap-[8px]">
                        <span className={`size-[6px] rounded-full ${badgeStyle.dot} shrink-0`} />
                        <span className={`text-[11px] font-medium leading-[12px] tracking-[0.02em] uppercase ${badgeStyle.text} font-sans`}>
                          {migrant.migration}
                        </span>
                      </div>
                    </div>

                    {/* Actions Menu (48px) */}
                    <div
                      className="w-[48px] h-[64px] px-[12px] flex items-center justify-center shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CaseRowMenu
                        onResolve={() => {
                          setSelectedRow(migrant);
                          setActionModalOpen(true);
                        }}
                        onChangeStatus={() => {
                          setSelectedRow(migrant);
                          setStatusModalOpen(true);
                        }}
                        onMarkRefused={() => {
                          setSelectedRow(migrant);
                          setRefusedModalOpen(true);
                        }}
                        onViewDetails={() => handleRowClick(migrant)}
                        onArchive={() => {
                          setSelectedRow(migrant);
                          setArchiveModalOpen(true);
                        }}
                        onDelete={() => {
                          setSelectedRow(migrant);
                          setDeleteModalOpen(true);
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination Group [1.1] */}
        {filteredMigrants.length > 0 && (
          <div className="flex flex-row items-center justify-between w-full h-[32px] gap-[24px]">
            {/* Left: Page summary */}
            <div className="w-[200px] h-[32px] py-[6px] flex items-center shrink-0">
              <span className="text-[14px] font-normal leading-[20px] tracking-[-0.006em] text-[#5C5C5C] font-sans">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            {/* Center: Pagination buttons */}
            <div className="flex flex-row items-center justify-center gap-[8px] flex-1">
              {/* First Page */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="size-8 p-0 rounded-[8px] text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border-0 shrink-0"
                title="First page"
              >
                <RiArrowLeftDoubleLine className="size-5 text-[#5C5C5C]" />
              </Button>

              {/* Previous Page */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="size-8 p-0 rounded-[8px] text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border-0 shrink-0"
                title="Previous page"
              >
                <RiArrowLeftSLine className="size-5 text-[#5C5C5C]" />
              </Button>

              {/* Page number cells */}
              <div className="flex flex-row items-center gap-[8px]">
                {pageNumbers.map((p, pIdx) => {
                  if (p === "...") {
                    return (
                      <span
                        key={`ellipsis-${pIdx}`}
                        className="size-8 flex items-center justify-center text-[14px] font-medium text-[#5C5C5C] select-none"
                      >
                        ...
                      </span>
                    );
                  }

                  const pageNum = Number(p);
                  const isActive = currentPage === pageNum;

                  return (
                    <Button
                      key={`page-${pageNum}`}
                      type="button"
                      variant={isActive ? "primary-neutral" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`size-8 p-0 rounded-[8px] text-[14px] font-medium leading-[20px] flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-[#171717] text-white border-0 hover:bg-[#171717]"
                          : "bg-white border border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              {/* Next Page */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="size-8 p-0 rounded-[8px] text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border-0 shrink-0"
                title="Next page"
              >
                <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
              </Button>

              {/* Last Page */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="size-8 p-0 rounded-[8px] text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border-0 shrink-0"
                title="Last page"
              >
                <RiArrowRightDoubleLine className="size-5 text-[#5C5C5C]" />
              </Button>
            </div>

            {/* Right: Items per page selector */}
            <div className="w-[200px] h-[32px] flex items-center justify-end shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-[99px] h-8 px-[10px] py-[6px] rounded-[8px] border border-[#EBEBEB] bg-white text-[14px] font-normal text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 flex items-center justify-between shadow-[0px_1px_2px_rgba(10,13,20,0.03)] cursor-pointer outline-none shrink-0"
                  >
                    <span className="leading-[20px]">{itemsPerPage} / page</span>
                    <RiArrowDownSLine className="size-5 text-[#A4A4A4]" />
                  </Button>
                } />
                <DropdownMenuContent align="end" className="w-[110px] bg-white border border-[#EBEBEB] rounded-[10px] shadow-card-large p-1">
                  {[10, 20, 50, 100].map((size) => (
                    <DropdownMenuItem
                      key={size}
                      onClick={() => {
                        setItemsPerPage(size);
                        setCurrentPage(1);
                      }}
                      className="text-[13px] text-[#171717] hover:bg-[#F5F5F5] rounded-[6px] px-2 py-1.5 cursor-pointer"
                    >
                      {size} / page
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>

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
