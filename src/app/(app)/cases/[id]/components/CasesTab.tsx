"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RiSearchLine,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { StatusFilterDropdown } from "../../components/StatusFilterDropdown";
import { useTableSort } from "@/hooks/useTableSort";

interface CaseHistoryRow {
  id: string;
  caseId: string;
  date: string;
  dateValue: number;
  visaType: string;
  group: string;
  status: string;
  statusType: "approved" | "closed" | "in_progress";
  immigrationStatus: string;
  immigrationType: "in_uk" | "left_uk" | "outside";
}

interface RawCaseRecord {
  id?: number | string;
  caseIdDisplay?: string;
  caseNumber?: string;
  created_at?: string;
  creation_date?: string;
  job_title?: string;
  visaType?: string;
  personal?: {
    jobTitle?: string;
    groupName?: string;
  };
  group_name?: string;
  case_status?: string;
  status?: string;
  migration?: string;
  flightEntered?: {
    isEntered?: boolean;
  };
}

interface MigrantCasesResponse {
  cases?: RawCaseRecord[];
  data?: {
    cases?: RawCaseRecord[];
  };
}

interface CasesTabProps {
  migrant?: { id?: string | number; [key: string]: unknown } | null;
  migrantId?: string;
}

export function CasesTab({ migrant, migrantId }: CasesTabProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const { sortField, sortDirection, setSortField, setSortDirection, handleSort, renderSortIcon } = useTableSort<CaseHistoryRow>();
  const [casesList, setCasesList] = React.useState<CaseHistoryRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Resolve the migrant ID from either the explicit prop or the migrant object
  const resolvedMigrantId = migrantId || migrant?.id;

  React.useEffect(() => {
    async function fetchCases() {
      if (!resolvedMigrantId) return;
      try {
        setLoading(true);
        let casesData: RawCaseRecord[] = [];
        try {
          const res = await apiClient.get<MigrantCasesResponse | RawCaseRecord[]>(ENDPOINTS.migrants.byId(resolvedMigrantId));
          if (Array.isArray(res)) {
            casesData = res;
          } else if (res && typeof res === "object") {
            const mCases = (res as MigrantCasesResponse).cases || (res as MigrantCasesResponse).data?.cases;
            casesData = Array.isArray(mCases) ? mCases : [];
          }
        } catch {
          const res = await apiClient.get<MigrantCasesResponse | RawCaseRecord[]>(ENDPOINTS.cases.base);
          if (Array.isArray(res)) {
            casesData = res;
          } else if (res && typeof res === "object") {
            const mCases = (res as MigrantCasesResponse).cases || (res as MigrantCasesResponse).data?.cases;
            casesData = Array.isArray(mCases) ? mCases : [];
          }
        }

        if (Array.isArray(casesData) && casesData.length > 0) {
          const mapped: CaseHistoryRow[] = casesData.map((c: RawCaseRecord) => {
            const rawStatus = c.case_status || c.status || "PENDING";
            const isAppr = rawStatus.toUpperCase().includes("APPROVED");
            const isEntered = Boolean(c.flightEntered?.isEntered);
            const dateStr = c.created_at || c.creation_date;
            const dateObj = dateStr ? new Date(dateStr) : null;
            const dateValue = dateObj && !isNaN(dateObj.getTime()) ? dateObj.getTime() : 0;
            return {
              id: String(c.id || ""),
              caseId: c.caseIdDisplay || c.caseNumber || (c.id ? `#${c.id}` : "—"),
              date: dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
              dateValue,
              visaType: c.job_title || c.visaType || c.personal?.jobTitle || "—",
              group: c.group_name || c.personal?.groupName || "—",
              status: rawStatus.toUpperCase(),
              statusType: isAppr ? "approved" : "closed",
              immigrationStatus: c.migration || (isEntered ? "IN UK" : "OUTSIDE UK"),
              immigrationType: isEntered ? "in_uk" : "outside",
            };
          });
          setCasesList(mapped);
        } else {
          setCasesList([]);
        }
      } catch (err) {
        console.error("Failed to fetch cases for tab:", err);
        setCasesList([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, [resolvedMigrantId]);

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

  const filteredCases = React.useMemo(() => {
    const list = casesList.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = (
          item.caseId.toLowerCase().includes(q) ||
          item.date.toLowerCase().includes(q) ||
          item.visaType.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q) ||
          item.status.toLowerCase().includes(q)
        );
        if (!matchesQuery) return false;
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
  }, [casesList, searchQuery, statusFilter, sortField, sortDirection]);

  return (
    <div className="flex flex-col gap-[32px] w-full font-sans select-none max-w-[1104px]">
      {/* Toolbar / Filters Row */}
      <div className="flex items-center gap-[12px] w-full">
        {/* Search Bar */}
        <div className="w-[348px] h-[32px] bg-white border border-[#EBEBEB] rounded-[8px] px-[8px] py-[6px] flex items-center gap-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <RiSearchLine className="size-5 text-[#A4A4A4] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases..."
            className="w-full bg-transparent text-[14px] font-normal text-[#171717] placeholder:text-[#A4A4A4] border-0 outline-none leading-[20px]"
          />
        </div>

        {/* Filter Reset Button */}
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setStatusFilter(null);
            setSortField(null);
            setSortDirection("asc");
          }}
          className="size-8 bg-white border border-[#EBEBEB] rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          title="Reset filter"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
            <path d="M8.5 14.5H11.5V13H8.5V14.5ZM3.25 5.5V7H16.75V5.5H3.25ZM5.5 10.75H14.5V9.25H5.5V10.75Z" fill="currentColor" />
          </svg>
        </button>

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
          <button
            type="button"
            onClick={() => handleSort("caseId")}
            className="w-[116px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent border-0 p-0 text-left transition-colors"
          >
            <span>CASE ID #</span>
            {renderSortIcon("caseId")}
          </button>
          <button
            type="button"
            onClick={() => handleSort("date")}
            className="w-[116px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent border-0 p-0 text-left transition-colors"
          >
            <span>DATE</span>
            {renderSortIcon("date")}
          </button>
          <button
            type="button"
            onClick={() => handleSort("visaType")}
            className="w-[186px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent border-0 p-0 text-left transition-colors"
          >
            <span>VISA TYPE</span>
            {renderSortIcon("visaType")}
          </button>
          <button
            type="button"
            onClick={() => handleSort("group")}
            className="w-[186px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent border-0 p-0 text-left transition-colors"
          >
            <span>GROUP</span>
            {renderSortIcon("group")}
          </button>
          <button
            type="button"
            onClick={() => handleSort("status")}
            className="w-[186px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent border-0 p-0 text-left transition-colors"
          >
            <span>STATUS</span>
            {renderSortIcon("status")}
          </button>
          <button
            type="button"
            onClick={() => handleSort("immigrationStatus")}
            className="w-[186px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent border-0 p-0 text-left transition-colors"
          >
            <span>IMMIGRATION STATUS</span>
            {renderSortIcon("immigrationStatus")}
          </button>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col gap-[4px] w-full">
          {filteredCases.map((row, idx) => (
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
              className="w-full h-[56px] bg-white border border-transparent hover:border-[#EBEBEB] rounded-[16px] px-4 flex items-center gap-[24px] transition-all cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
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
              <div className="w-[186px] text-[14px] font-medium text-[#7B7B7B]">
                {row.visaType}
              </div>

              {/* Group */}
              <div className="w-[186px] text-[14px] font-medium text-[#7B7B7B]">
                {row.group}
              </div>

              {/* Status */}
              <div className="w-[186px] flex items-center">
                {row.statusType === "approved" ? (
                  <span className="inline-flex items-center gap-xs px-2 py-0.5 bg-[#E3F7EC] text-[#0B4627] rounded-full text-[11px] font-semibold uppercase tracking-[0.02em]">
                    <span className="size-1.5 rounded-full bg-[#1FC16B]" />
                    {row.status}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-xs px-2 py-0.5 bg-[#F5F5F5] text-[#7B7B7B] rounded-full text-[11px] font-semibold uppercase tracking-[0.02em]">
                    <span className="size-1.5 rounded-full bg-[#7B7B7B]" />
                    {row.status}
                  </span>
                )}
              </div>

              {/* Immigration Status */}
              <div className="w-[186px] flex items-center">
                {row.immigrationType === "in_uk" ? (
                  <span className="px-2 py-0.5 bg-[#EFEBFF] text-[#171717] rounded-full text-[11px] font-semibold uppercase tracking-[0.02em]">
                    {row.immigrationStatus}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-[#F5F5F5] text-[#7B7B7B] rounded-full text-[11px] font-semibold uppercase tracking-[0.02em]">
                    {row.immigrationStatus}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
