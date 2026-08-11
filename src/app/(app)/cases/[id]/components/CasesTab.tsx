"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RiSearchLine,
  RiArrowDownSLine,
  RiExpandUpDownFill,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

interface CaseHistoryRow {
  id: string;
  caseId: string;
  date: string;
  visaType: string;
  group: string;
  status: string;
  statusType: "approved" | "closed" | "in_progress";
  immigrationStatus: string;
  immigrationType: "in_uk" | "left_uk" | "outside";
}

interface CasesTabProps {
  migrant?: any;
  migrantId?: string;
}

export function CasesTab({ migrant, migrantId }: CasesTabProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [countryFilter, setCountryFilter] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [casesList, setCasesList] = React.useState<CaseHistoryRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Resolve the migrant ID from either the explicit prop or the migrant object
  const resolvedMigrantId = migrantId || migrant?.id;

  React.useEffect(() => {
    async function fetchCases() {
      try {
        setLoading(true);
        let casesData: any[] = [];

        if (resolvedMigrantId) {
          // Fetch only this migrant's cases from the migrant endpoint
          const migrantRes = await apiClient.get<any>(ENDPOINTS.migrants.byId(resolvedMigrantId));
          // The migrant response includes a nested `cases` array
          const migrantCases = migrantRes?.cases || migrantRes?.data?.cases;
          if (Array.isArray(migrantCases)) {
            casesData = migrantCases;
          }
        } else {
          // Fallback: fetch all cases (should not happen in migrant context)
          const res = await apiClient.get<any>(ENDPOINTS.cases.base);
          casesData = Array.isArray(res) ? res : res?.data || res?.cases || [];
        }

        if (Array.isArray(casesData) && casesData.length > 0) {
          const mapped: CaseHistoryRow[] = casesData.map((c: any) => {
            const rawStatus = c.case_status || c.status || "PENDING";
            const isAppr = rawStatus.toUpperCase().includes("APPROVED");
            const isEntered = Boolean(c.flightEntered?.isEntered);
            return {
              id: String(c.id || ""),
              caseId: c.caseIdDisplay || c.caseNumber || (c.id ? `#${c.id}` : "—"),
              date: c.created_at || c.creation_date ? new Date(c.created_at || c.creation_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
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

  const filteredCases = React.useMemo(() => {
    return casesList.filter((item) => {
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
  }, [casesList, searchQuery, statusFilter]);

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
            placeholder="Search..."
            className="w-full bg-transparent text-[14px] font-normal text-[#171717] placeholder:text-[#A4A4A4] border-0 outline-none leading-[20px]"
          />
        </div>

        {/* Filter Button */}
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          className="size-8 bg-white border border-[#EBEBEB] rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          title="Reset filter"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
            <path d="M8.5 14.5H11.5V13H8.5V14.5ZM3.25 5.5V7H16.75V5.5H3.25ZM5.5 10.75H14.5V9.25H5.5V10.75Z" fill="currentColor" />
          </svg>
        </button>

        {/* Country Filter Dropdown */}
        <div className="h-[32px] px-[12px] bg-white border border-[#EBEBEB] rounded-[8px] flex items-center gap-[6px] text-[14px] font-medium text-[#5C5C5C] cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <span>All countries</span>
          <RiArrowDownSLine className="size-5 text-[#5C5C5C]" />
        </div>

        {/* Status Filter Dropdown */}
        <div className="h-[32px] px-[12px] bg-white border border-[#EBEBEB] rounded-[8px] flex items-center gap-[6px] text-[14px] font-medium text-[#5C5C5C] cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <span>All status</span>
          <RiArrowDownSLine className="size-5 text-[#5C5C5C]" />
        </div>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-[8px] w-full">
        {/* Table Header */}
        <div className="h-[36px] bg-[#F5F5F5] rounded-[8px] px-4 flex items-center gap-[24px] w-full">
          <div className="w-[116px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>CASE ID #</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
          <div className="w-[116px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>DATE</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
          <div className="w-[186px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>VISA TYPE</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
          <div className="w-[186px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>GROUP</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
          <div className="w-[186px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>STATUS</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
          <div className="w-[186px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>IMMIGRATION STATUS</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col gap-[4px] w-full">
          {filteredCases.map((row) => (
            <div
              key={row.id || row.caseId}
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
