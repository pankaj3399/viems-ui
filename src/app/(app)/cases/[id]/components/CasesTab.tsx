"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RiSearchLine,
  RiFilter3Line,
  RiFoldersLine,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { StatusFilterDropdown } from "../../components/StatusFilterDropdown";
import { CountryFilterDropdown } from "../../components/CountryFilterDropdown";
import { getCountryInfo } from "@/lib/country";
import { useTableSort } from "@/hooks/useTableSort";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RawCaseRecord, MigrantCasesResponse } from "@/types/api";

interface CaseHistoryRow {
  id: string;
  caseId: string;
  date: string;
  dateValue: number;
  visaType: string;
  group: string;
  countryCode: string;
  countryLabel: string;
  status: string;
  statusType: "approved" | "closed" | "in_progress";
  immigrationStatus: string;
  immigrationType: "in_uk" | "left_uk" | "outside";
}

interface CasesTabProps {
  migrant?: { id?: string | number; [key: string]: unknown } | null;
  migrantId?: string;
}

export function CasesTab({ migrant, migrantId }: CasesTabProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [countryFilter, setCountryFilter] = React.useState<string | null>(null);
  const { sortField, sortDirection, handleSort, renderSortIcon } = useTableSort<CaseHistoryRow>();
  const [casesList, setCasesList] = React.useState<CaseHistoryRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const resolvedMigrantId = migrantId || (migrant?.id ? String(migrant.id) : null);

  React.useEffect(() => {
    let active = true;
    async function fetchCases() {
      if (!resolvedMigrantId) return;
      try {
        setLoading(true);
        let casesData: RawCaseRecord[] = [];

        try {
          const res = await apiClient.get<RawCaseRecord[]>(`${ENDPOINTS.cases.base}?migrant_id=${resolvedMigrantId}`);
          if (Array.isArray(res)) {
            casesData = res;
          }
        } catch {
          // Fallback to migrant entity cases
        }

        if (casesData.length === 0) {
          const res = await apiClient.get<MigrantCasesResponse | RawCaseRecord[]>(ENDPOINTS.migrants.byId(resolvedMigrantId));
          if (Array.isArray(res)) {
            casesData = res;
          } else if (res && typeof res === "object") {
            const mCases = (res as MigrantCasesResponse).cases || (res as MigrantCasesResponse).data?.cases;
            casesData = Array.isArray(mCases) ? mCases : [];
          }
        }

        if (Array.isArray(casesData) && casesData.length > 0) {
          const mapped: CaseHistoryRow[] = casesData.map((c: RawCaseRecord) => {
            const rawStatus = (c.case_status || c.status || "PENDING").toUpperCase().replace(/_/g, " ");
            let statusDisplay = rawStatus;
            let statusType: "approved" | "closed" | "in_progress" = "closed";

            if (rawStatus.includes("APPROVED") || rawStatus.includes("GRANTED") || rawStatus.includes("ACTIVE")) {
              statusDisplay = "VISA APPROVED";
              statusType = "approved";
            } else if (rawStatus.includes("CLOSED") || rawStatus.includes("COMPLETED") || rawStatus.includes("ARCHIVED") || rawStatus.includes("REFUSED")) {
              statusDisplay = "CASE CLOSED";
              statusType = "closed";
            } else {
              statusDisplay = rawStatus;
              statusType = "in_progress";
            }

            const isEntered = Boolean(c.flightEntered?.isEntered);
            let immigrationStatus = "LEFT UK";
            let immigrationType: "in_uk" | "left_uk" | "outside" = "left_uk";

            if (statusType === "approved" || isEntered || c.migration === "IN UK") {
              immigrationStatus = "IN UK";
              immigrationType = "in_uk";
            } else if (c.migration === "LEFT UK" || statusType === "closed") {
              immigrationStatus = "LEFT UK";
              immigrationType = "left_uk";
            } else {
              immigrationStatus = c.migration || "OUTSIDE UK";
              immigrationType = "outside";
            }

            const dateStr = c.created_at || c.creation_date;
            const dateObj = dateStr ? new Date(dateStr) : null;
            const dateValue = dateObj && !isNaN(dateObj.getTime()) ? dateObj.getTime() : 0;
            
            // Format case ID (remove '#' prefix if present)
            let caseIdStr = c.caseIdDisplay || c.caseNumber || (c.id ? String(c.id) : "—");
            if (c.caseIdNumber && c.relatedYear) {
              caseIdStr = `${c.caseIdNumber}/${c.relatedYear}`;
            }
            caseIdStr = caseIdStr.replace(/^#/, "");

            const migrantPersonalInfo =
              migrant && typeof migrant === "object" && "personalInfo" in migrant && typeof migrant.personalInfo === "object" && migrant.personalInfo !== null
                ? (migrant.personalInfo as { nationalityCode?: string; nationality?: string })
                : undefined;
            const rawCountry =
              c.nationality_value ||
              c.nationality_title ||
              c.country ||
              migrantPersonalInfo?.nationalityCode ||
              migrantPersonalInfo?.nationality ||
              "";
            const { code: countryCode, full: countryLabel } = getCountryInfo(rawCountry);

            return {
              id: String(c.id || ""),
              caseId: caseIdStr,
              date: dateObj && !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                : "—",
              dateValue,
              visaType: c.job_title || c.visaType || c.personal?.jobTitle || "—",
              group: c.group_name || c.personal?.groupName || "—",
              countryCode,
              countryLabel,
              status: statusDisplay,
              statusType,
              immigrationStatus,
              immigrationType,
            };
          });
          if (active) {
            setCasesList(mapped);
          }
        } else {
          if (active) {
            setCasesList([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch cases for tab:", err);
        if (active) {
          setCasesList([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    fetchCases();
    return () => {
      active = false;
    };
  }, [resolvedMigrantId, migrant]);

  const availableStatuses = React.useMemo(() => {
    const map = new Map<string, number>();
    casesList.forEach((c) => {
      if (!c.status) return;
      map.set(c.status, (map.get(c.status) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, count]) => ({
      label,
      count,
    }));
  }, [casesList]);

  const availableCountries = React.useMemo(() => {
    const map = new Map<string, { code: string; label: string; count: number }>();
    casesList.forEach((c) => {
      if (!c.countryCode) return;
      const existing = map.get(c.countryCode);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(c.countryCode, {
          code: c.countryCode,
          label: c.countryLabel || c.countryCode,
          count: 1,
        });
      }
    });
    return Array.from(map.values()).map((item) => ({
      code: item.code,
      label: item.label,
      flag: item.code.toLowerCase(),
      count: item.count,
    }));
  }, [casesList]);

  const filteredCases = React.useMemo(() => {
    const list = casesList.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = (
          item.caseId.toLowerCase().includes(q) ||
          item.date.toLowerCase().includes(q) ||
          item.visaType.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q) ||
          item.immigrationStatus.toLowerCase().includes(q)
        );
        if (!matchesQuery) return false;
      }
      if (countryFilter && countryFilter !== "all") {
        if (item.countryCode.toLowerCase() !== countryFilter.toLowerCase()) return false;
      }
      if (statusFilter && statusFilter !== "all") {
        if (!item.status.toLowerCase().includes(statusFilter.toLowerCase())) return false;
      }
      return true;
    });

    if (!sortField) return list;

    return [...list].sort((a, b) => {
      if (sortField === "date") {
        return sortDirection === "asc"
          ? a.dateValue - b.dateValue
          : b.dateValue - a.dateValue;
      }
      const valA = (a[sortField] || "").toString().toLowerCase();
      const valB = (b[sortField] || "").toString().toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [casesList, searchQuery, countryFilter, statusFilter, sortField, sortDirection]);

  return (
    <div className="flex flex-col gap-[32px] w-full font-sans max-w-[1104px]">
      {/* Toolbar / Filters Row */}
      <div className="flex items-center gap-[12px] w-full">
        {/* Search Bar */}
        <div className="w-[348px] h-[32px] bg-white border border-[#EBEBEB] rounded-[8px] px-[8px] py-[6px] flex items-center gap-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] focus-within:border-brand-medium focus-within:ring-2 focus-within:ring-brand-medium/20">
          <RiSearchLine className="size-5 text-[#A4A4A4] shrink-0" />
          <Input
            variant="unstyled"
            size="none"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="h-full border-0 bg-transparent p-0 text-[14px] font-normal text-[#171717] placeholder:text-[#A4A4A4] shadow-none focus-visible:ring-0 focus-visible:shadow-none leading-[20px]"
          />
        </div>

        {/* Filter Reset Button */}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => {
            setSearchQuery("");
            setCountryFilter(null);
            setStatusFilter(null);
          }}
          className="size-8 bg-white border-0 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer shadow-x-small"
          title="Reset filter"
        >
          <RiFilter3Line className="size-4 shrink-0 text-[#5C5C5C]" />
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
        />
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-[8px] w-full">
        {/* Table Header */}
        <div className="h-[36px] bg-[#F5F5F5] rounded-[8px] px-4 flex items-center gap-[24px] w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("caseId")}
            className="w-[116px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>CASE ID</span>
            {renderSortIcon("caseId")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("date")}
            className="w-[116px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>DATE</span>
            {renderSortIcon("date")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("visaType")}
            className="flex-1 min-w-0 flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>VISA TYPE</span>
            {renderSortIcon("visaType")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("group")}
            className="flex-1 min-w-0 flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>GROUP</span>
            {renderSortIcon("group")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("status")}
            className="w-[186px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>STATUS</span>
            {renderSortIcon("status")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("immigrationStatus")}
            className="w-[186px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>IMMIGRATION STATUS</span>
            {renderSortIcon("immigrationStatus")}
          </Button>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col gap-[4px] w-full">
          {loading ? (
            <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-8 text-center flex flex-col items-center justify-center">
              <span className="text-[14px] font-medium text-[#5C5C5C] animate-pulse">Loading cases...</span>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-8 text-center flex flex-col items-center justify-center gap-2">
              <RiFoldersLine className="size-8 text-[#A4A4A4]" />
              <span className="text-[14px] font-medium text-[#5C5C5C]">No cases found for this migrant</span>
            </div>
          ) : (
            filteredCases.map((row, idx) => (
              <div
                key={row.id ? `casetab-${row.id}-${idx}` : `casetab-${row.caseId}-${idx}`}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/cases/${row.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/cases/${row.id}`);
                  }
                }}
                className="w-full h-[56px] bg-white border border-transparent hover:border-[#EBEBEB] rounded-[16px] px-4 flex items-center gap-[24px] transition-all cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)] hover:shadow-md"
              >
                {/* Case ID */}
                <div className="w-[116px] text-[14px] font-mono text-[#5C5C5C]">
                  {row.caseId}
                </div>

                {/* Date */}
                <div className="w-[116px] text-[14px] font-medium text-[#171717]">
                  {row.date}
                </div>

                {/* Visa Type */}
                <div className="flex-1 min-w-0 text-[14px] font-medium text-[#7B7B7B] truncate">
                  {row.visaType}
                </div>

                {/* Group */}
                <div className="flex-1 min-w-0 text-[14px] font-medium text-[#7B7B7B] truncate">
                  {row.group}
                </div>

                {/* Status */}
                <div className="w-[186px] flex items-center">
                  {row.statusType === "approved" ? (
                    <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] pr-[10px] pl-[6px] bg-[#E3F7EC] text-[#0B4627] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] h-[20px]">
                      <span className="size-[6px] rounded-full bg-[#1FC16B] shrink-0" />
                      <span>{row.status}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-[4px] px-[8px] py-[2px] pr-[10px] pl-[6px] bg-[#F5F5F5] text-[#7B7B7B] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] h-[20px]">
                      <span className="size-[6px] rounded-full bg-[#7B7B7B] shrink-0" />
                      <span>{row.status}</span>
                    </span>
                  )}
                </div>

                {/* Immigration Status */}
                <div className="w-[186px] flex items-center">
                  {row.immigrationType === "in_uk" ? (
                    <span className="inline-flex items-center justify-center px-[8px] py-[2px] bg-[#EFEBFF] text-[#171717] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] h-[16px]">
                      {row.immigrationStatus}
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center px-[8px] py-[2px] bg-[#F5F5F5] text-[#7B7B7B] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] h-[16px]">
                      {row.immigrationStatus}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
