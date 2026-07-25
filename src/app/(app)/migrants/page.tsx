"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RiSearchLine,
  RiFilterLine,
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiMore2Line,
  RiAddLine,
  RiUploadLine,
  RiExpandUpDownFill,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { formatFullName, getInitials } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { CountryFilterDropdown } from "../cases/components/CountryFilterDropdown";
import { StatusFilterDropdown } from "../cases/components/StatusFilterDropdown";
import { CaseRowMenu } from "../cases/components/CaseRowMenu";
import { ChangeCaseStatusModal } from "../cases/components/ChangeCaseStatusModal";
import { MarkVisaRefusedModal } from "../cases/components/MarkVisaRefusedModal";
import { ArchiveCaseModal } from "../cases/components/ArchiveCaseModal";
import { DeleteCaseModal } from "../cases/components/DeleteCaseModal";
import { CaseActionModal } from "../cases/components/CaseActionModal";
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
  migrationColor: "outside" | "pending" | "active" | "pre" | "withdrawn" | "archived";
  action: string;
  actionColor: "blue" | "red" | "yellow" | "gray";
}

const DEFAULT_MIGRANTS: MigrantRow[] = [
  {
    id: 1,
    caseId: "431/2026",
    country: "United States",
    countryCode: "US",
    countryHalf: "USA",
    flag: "🇺🇸",
    name: "Alex Marin",
    group: "AX Studios",
    avatarText: "AM",
    status: "Visa Approved",
    migration: "OUTSIDE UK",
    migrationColor: "outside",
    action: "No action required",
    actionColor: "gray",
  },
  {
    id: 2,
    caseId: "430/2026",
    country: "United States",
    countryCode: "US",
    countryHalf: "USA",
    flag: "🇺🇸",
    name: "Taylor Johnson",
    group: "AX Studios",
    avatarText: "TJ",
    status: "Visa Approved",
    migration: "ARRIVED – RTW PENDING",
    migrationColor: "pending",
    action: "Check RTW",
    actionColor: "red",
  },
  {
    id: 3,
    caseId: "429/2026",
    country: "China",
    countryCode: "CN",
    countryHalf: "Chn",
    flag: "🇨🇳",
    name: "Gulab Singh Sidhu",
    group: "Inderbir Sidhu",
    avatarText: "GS",
    status: "Active Compliance",
    migration: "ACTIVE COMPLIANCE",
    migrationColor: "active",
    action: "No action required",
    actionColor: "gray",
  },
  {
    id: 4,
    caseId: "428/2026",
    country: "India",
    countryCode: "IN",
    countryHalf: "Ind",
    flag: "🇮🇳",
    name: "Elena Petrova",
    group: "Dhira Gill Music Video",
    avatarText: "EP",
    status: "Visa Approved",
    migration: "OUTSIDE UK",
    migrationColor: "outside",
    action: "No action required",
    actionColor: "gray",
  },
  {
    id: 5,
    caseId: "427/2026",
    country: "India",
    countryCode: "IN",
    countryHalf: "Ind",
    flag: "🇮🇳",
    name: "Ami Monarch",
    group: "Dhira Gill Music Video",
    avatarText: "AM",
    status: "Pre-Arrival",
    migration: "PRE-ARRIVAL",
    migrationColor: "pre",
    action: "Schedule RTW check",
    actionColor: "yellow",
  },
  {
    id: 6,
    caseId: "426/2026",
    country: "France",
    countryCode: "FR",
    countryHalf: "Fra",
    flag: "🇫🇷",
    name: "Wei Chen",
    group: "Anonymous Group",
    avatarText: "WC",
    status: "Visa Approved",
    migration: "OUTSIDE UK",
    migrationColor: "outside",
    action: "No action required",
    actionColor: "gray",
  },
  {
    id: 7,
    caseId: "425/2026",
    country: "France",
    countryCode: "FR",
    countryHalf: "Fra",
    flag: "🇫🇷",
    name: "James Brown",
    group: "Anonymous Group",
    avatarText: "JB",
    status: "Active Compliance",
    migration: "ACTIVE COMPLIANCE",
    migrationColor: "active",
    action: "Upload passport",
    actionColor: "blue",
  },
  {
    id: 8,
    caseId: "424/2026",
    country: "France",
    countryCode: "FR",
    countryHalf: "Fra",
    flag: "🇫🇷",
    name: "Sofia Reyez",
    group: "Anonymous Group",
    avatarText: "SR",
    status: "Sponsorship Withdrawn",
    migration: "SPONSORSHIP WITHDRAWN",
    migrationColor: "withdrawn",
    action: "Review and report",
    actionColor: "red",
  },
  {
    id: 9,
    caseId: "423/2026",
    country: "South Africa",
    countryCode: "ZA",
    countryHalf: "SA",
    flag: "🇿🇦",
    name: "Juma Omondi",
    group: "Bhai Tera Star Hai Film",
    avatarText: "JO",
    status: "Visa Approved",
    migration: "OUTSIDE UK",
    migrationColor: "outside",
    action: "No action required",
    actionColor: "gray",
  },
  {
    id: 10,
    caseId: "422/2026",
    country: "China",
    countryCode: "CN",
    countryHalf: "Chn",
    flag: "🇨🇳",
    name: "Ravi Patel",
    group: "Bhai Tera Star Hai Film",
    avatarText: "RP",
    status: "Archived",
    migration: "ARCHIVED",
    migrationColor: "archived",
    action: "No action required",
    actionColor: "gray",
  },
];

export default function MigrantsPage() {
  const router = useRouter();
  const [migrants, setMigrants] = React.useState<MigrantRow[]>(DEFAULT_MIGRANTS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [countryFilter, setCountryFilter] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [needsActionOnly, setNeedsActionOnly] = React.useState(false);
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
  const [selectedActionType, setSelectedActionType] = React.useState<string>("");

  React.useEffect(() => {
    async function fetchCasesData() {
      try {
        setLoading(true);
        const res = await apiClient.get<any>(ENDPOINTS.cases.base);
        const rawArr: any[] = Array.isArray(res) ? res : res?.data ?? [];
        if (rawArr.length > 0) {
          const mapped: MigrantRow[] = rawArr.map((c, i) => {
            const name = formatFullName(c.first_name, c.last_name);
            const initials = getInitials(name);
            const rawCountry = (c.nationality_value || "US").trim().toUpperCase();
            const countryCode = rawCountry.length === 2 ? rawCountry : "US";
            const caseId = c.caseIdDisplay || c.caseNumber || `43${9 - i}/2026`;
            
            let migration = "ACTIVE COMPLIANCE";
            let migrationColor: MigrantRow["migrationColor"] = "active";
            const mod = i % 6;
            if (mod === 0) { migration = "OUTSIDE UK"; migrationColor = "outside"; }
            else if (mod === 1) { migration = "ARRIVED – RTW PENDING"; migrationColor = "pending"; }
            else if (mod === 2) { migration = "ACTIVE COMPLIANCE"; migrationColor = "active"; }
            else if (mod === 3) { migration = "PRE-ARRIVAL"; migrationColor = "pre"; }
            else if (mod === 4) { migration = "SPONSORSHIP WITHDRAWN"; migrationColor = "withdrawn"; }
            else { migration = "ARCHIVED"; migrationColor = "archived"; }

            return {
              id: c.id ?? i + 1,
              caseId,
              country: countryCode === "US" ? "United States" : countryCode === "CN" ? "China" : countryCode === "IN" ? "India" : countryCode === "FR" ? "France" : "South Africa",
              countryCode,
              countryHalf: countryCode,
              flag: countryCode === "US" ? "🇺🇸" : countryCode === "CN" ? "🇨🇳" : countryCode === "IN" ? "🇮🇳" : countryCode === "FR" ? "🇫🇷" : "🇿🇦",
              name: name || "Migrant Applicant",
              group: c.group_name || "AX Studios",
              avatarText: initials || "MA",
              status: c.case_status || "Visa Approved",
              migration,
              migrationColor,
              action: mod === 1 ? "Check RTW" : mod === 3 ? "Schedule RTW check" : mod === 4 ? "Review and report" : "No action required",
              actionColor: mod === 1 || mod === 4 ? "red" : mod === 3 ? "yellow" : "gray",
            };
          });
          setMigrants(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch cases for migrants table:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCasesData();
  }, []);

  const filteredMigrants = React.useMemo(() => {
    return migrants.filter((m) => {
      if (countryFilter && m.countryCode.toLowerCase() !== countryFilter.toLowerCase()) return false;
      if (statusFilter && m.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (needsActionOnly && m.action === "No action required") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.caseId.toLowerCase().includes(q) ||
          m.group.toLowerCase().includes(q) ||
          m.country.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [migrants, countryFilter, statusFilter, needsActionOnly, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredMigrants.length / itemsPerPage));

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
        return { dot: "bg-[#7B7B7B]", text: "text-[#7B7B7B]" };
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
            className="flex items-center gap-xs px-xl py-lg h-9 bg-white border border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] rounded-[10px] text-[14px] font-semibold leading-[20px] tracking-[-0.006em] transition-all cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          >
            <RiUploadLine className="size-4 text-[#5C5C5C]" />
            Import
          </button>
          <button
            type="button"
            onClick={() => router.push("/cases")}
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
          onClick={() => {
            setSearchQuery("");
            setCountryFilter(null);
            setStatusFilter(null);
            setNeedsActionOnly(false);
          }}
          className="size-8 bg-white border border-[#EBEBEB] rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          title="Reset filters"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
            <path d="M8.5 14.5H11.5V13H8.5V14.5ZM3.25 5.5V7H16.75V5.5H3.25ZM5.5 10.75H14.5V9.25H5.5V10.75Z" fill="currentColor" />
          </svg>
        </button>

        {/* Country Filter Dropdown */}
        <CountryFilterDropdown
          countries={[
            { code: "US", label: "United States", flag: "🇺🇸", count: 2 },
            { code: "CN", label: "China", flag: "🇨🇳", count: 2 },
            { code: "IN", label: "India", flag: "🇮🇳", count: 2 },
            { code: "FR", label: "France", flag: "🇫🇷", count: 3 },
            { code: "ZA", label: "South Africa", flag: "🇿🇦", count: 1 },
          ]}
          value={countryFilter}
          onChange={(val: string | null) => setCountryFilter(val)}
        />

        {/* Status Filter Dropdown */}
        <StatusFilterDropdown
          statuses={[
            { label: "Visa Approved", count: 5 },
            { label: "Active Compliance", count: 2 },
            { label: "Pre-Arrival", count: 1 },
            { label: "Sponsorship Withdrawn", count: 1 },
            { label: "Archived", count: 1 },
          ]}
          value={statusFilter}
          onChange={(val: string | null) => setStatusFilter(val)}
          statusColors={{
            "Visa Approved": "#1FC16B",
            "Active Compliance": "#1FC16B",
            "Pre-Arrival": "#F6B51E",
            "Sponsorship Withdrawn": "#FB3748",
            "Archived": "#7B7B7B",
          }}
        />

        {/* Quick Filter: Needs Action */}
        <button
          type="button"
          onClick={() => setNeedsActionOnly(!needsActionOnly)}
          className={`h-[32px] px-[12px] rounded-[8px] text-[14px] font-medium transition-all cursor-pointer border-0 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] ${
            needsActionOnly
              ? "bg-[#171717] text-white"
              : "bg-white text-[#5C5C5C] hover:text-[#171717]"
          }`}
        >
          Needs action
        </button>
      </div>

      {/* Migrants Table Panel */}
      <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-2 flex flex-col gap-1 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
        {/* Table Header */}
        <div className="h-[36px] bg-[#F7F7F7] rounded-[8px] px-4 flex items-center w-full">
          <div className="w-[112px] text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            CASE ID #
          </div>
          <div className="w-[112px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>COUNTRY</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
          <div className="flex-1 min-w-[200px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>NAME</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
          <div className="w-[257px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>MIGRATION STATUS</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
          <div className="w-[48px]" />
        </div>

        {/* Table Rows */}
        <div className="flex flex-col gap-1 w-full mt-1">
          {currentRows.map((migrant) => {
            const badgeStyle = getMigrationBadgeStyle(migrant.migrationColor);
            return (
              <div
                key={migrant.id}
                onClick={() => handleRowClick(migrant)}
                className="w-full h-[72px] bg-white border border-transparent hover:border-[#EBEBEB] rounded-[16px] px-4 flex items-center justify-between transition-all cursor-pointer group shadow-[0px_1px_2px_rgba(10,13,20,0.02)]"
              >
                {/* Case ID */}
                <div className="w-[112px] text-[14px] font-mono text-[#5C5C5C]">
                  {migrant.caseId}
                </div>

                {/* Country */}
                <div className="w-[112px] flex items-center gap-2">
                  <Flag country={migrant.countryCode} className="size-5 rounded-full object-cover shrink-0" />
                  <span className="text-[14px] font-normal text-[#171717]">
                    {migrant.countryCode}
                  </span>
                </div>

                {/* Name & Group */}
                <div className="flex-1 min-w-[200px] flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#EBEBEB] flex items-center justify-center shrink-0 text-[14px] font-medium text-[#171717]">
                    {migrant.avatarText}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-[#171717] leading-[20px]">
                      {migrant.name}
                    </span>
                    <span className="text-[12px] font-normal text-[#5C5C5C] leading-[16px]">
                      {migrant.group}
                    </span>
                  </div>
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
                    onChangeStatus={() => { setSelectedRow(migrant); setStatusModalOpen(true); }}
                    onMarkRefused={() => { setSelectedRow(migrant); setRefusedModalOpen(true); }}
                    onViewDetails={() => handleRowClick(migrant)}
                    onArchive={() => { setSelectedRow(migrant); setArchiveModalOpen(true); }}
                    onDelete={() => { setSelectedRow(migrant); setDeleteModalOpen(true); }}
                  />
                </div>
              </div>
            );
          })}
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
            <RiArrowLeftSLine className="size-5 text-[#5C5C5C]" />
          </button>

          {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
            const pNum = i + 1;
            return (
              <button
                key={pNum}
                type="button"
                onClick={() => setCurrentPage(pNum)}
                className={`size-8 rounded-[8px] flex items-center justify-center text-[14px] font-medium transition-colors border-0 cursor-pointer ${
                  currentPage === pNum
                    ? "bg-[#171717] text-white"
                    : "bg-white border border-[#EBEBEB] text-[#171717] hover:bg-neutral-100"
                }`}
              >
                {pNum}
              </button>
            );
          })}

          {totalPages > 5 && <span className="text-[14px] text-[#A4A4A4] px-1">...</span>}

          {totalPages > 5 && (
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              className={`size-8 rounded-[8px] flex items-center justify-center text-[14px] font-medium transition-colors border-0 cursor-pointer ${
                currentPage === totalPages
                  ? "bg-[#171717] text-white"
                  : "bg-transparent text-[#5C5C5C] hover:bg-neutral-200"
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
          >
            <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
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

        {/* Right Items per Page */}
        <div className="h-[32px] px-[10px] bg-white border border-[#EBEBEB] rounded-[8px] flex items-center gap-[4px] text-[14px] text-[#5C5C5C] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] cursor-pointer">
          <span>{itemsPerPage} / page</span>
          <RiArrowDownSLine className="size-5 text-[#A4A4A4]" />
        </div>
      </div>

      {/* Action & Status Modals */}
      {selectedRow && (
        <>
          <ChangeCaseStatusModal
            open={statusModalOpen}
            onOpenChange={setStatusModalOpen}
            currentStatus={selectedRow.status}
            onApply={(newStatus: string) => {
              setMigrants((prev) =>
                prev.map((m) => (m.id === selectedRow.id ? { ...m, status: newStatus } : m))
              );
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
            onConfirm={(reason: string) => {
              setMigrants((prev) =>
                prev.map((m) => (m.id === selectedRow.id ? { ...m, status: "Visa Refused", migration: "SPONSORSHIP WITHDRAWN", migrationColor: "withdrawn" } : m))
              );
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
            onConfirm={() => {
              setMigrants((prev) => prev.filter((m) => m.id !== selectedRow.id));
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
            onConfirm={() => {
              setMigrants((prev) => prev.filter((m) => m.id !== selectedRow.id));
            }}
          />
        </>
      )}
    </div>
  );
}
