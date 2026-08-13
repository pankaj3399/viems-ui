"use client";

import * as React from "react";
import Link from "next/link";
import {
  RiArrowLeftSLine,
  RiSearch2Line,
  RiFilter3Line,
  RiArrowDownSLine,
  RiCalendarLine,
  RiMore2Line,
  RiErrorWarningLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiShieldCheckLine,
  RiCloseLine,
  RiExpandUpDownLine,
  RiInformationLine,
  RiMagicLine,
  RiEditLine,
  RiUpload2Line,
} from "@remixicon/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { formatFullName, getInitials } from "@/lib/format";

interface RtwCheckItem {
  id: string;
  entityId: number | string;
  caseId: string;
  name: string;
  company: string;
  avatarUrl?: string;
  avatarInitials: string;
  status: "OVERDUE" | "DUE SOON" | "FOLLOW-UP" | "COMPLIANT";
  lastCheck: string;
  nextCheck: string;
  daysUntil: number | null;
}

const fallbackRtwChecks: RtwCheckItem[] = [];

export default function RtwChecksPage() {
  const [rtwChecks, setRtwChecks] = React.useState<RtwCheckItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<
    "ALL" | "OVERDUE" | "DUE" | "COMPLIANT" | "FOLLOW-UP"
  >("ALL");
  const [statusDropdownFilter, setStatusDropdownFilter] = React.useState<string>("All status");
  
  const [selectedMigrant, setSelectedMigrant] = React.useState("Taylor Johnson");
  const [selectedCaseId, setSelectedCaseId] = React.useState("#430/2026");
  const [selectedEntityId, setSelectedEntityId] = React.useState<number | string>("430");
  const [selectedAvatarUrl, setSelectedAvatarUrl] = React.useState<string | undefined>(
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  );
  const [selectedAvatarInitials, setSelectedAvatarInitials] = React.useState("TJ");
  const [verifyMode, setVerifyMode] = React.useState<"automatic" | "manual">("automatic");
  const [shareCode, setShareCode] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [workRestrictions, setWorkRestrictions] = React.useState("");
  const [govRefNumber, setGovRefNumber] = React.useState("");
  const [dragFileName, setDragFileName] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verificationResult, setVerificationResult] = React.useState<null | {
    success: boolean;
    msg: string;
  }>(null);

  const fetchRtwData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>(ENDPOINTS.cases.base);
      const rawCases: any[] = Array.isArray(res) ? res : res?.data ?? [];
      
      if (rawCases.length > 0) {
        const mapped: RtwCheckItem[] = rawCases.map((c, i) => {
          const name = formatFullName(c.first_name || c.migrant?.user?.personalInfo?.firstName, c.last_name || c.migrant?.user?.personalInfo?.lastName) || `Migrant #${c.id}`;
          const initials = getInitials(name);
          const caseId = c.caseIdDisplay || c.caseNumber || `${c.id}/2026`;
          const company = c.group_name || c.company || "AX Studios";
          
          let derivedStatus: "OVERDUE" | "DUE SOON" | "FOLLOW-UP" | "COMPLIANT" = "COMPLIANT";
          const mod = i % 4;
          if (mod === 0) derivedStatus = "OVERDUE";
          else if (mod === 1) derivedStatus = "DUE SOON";
          else if (mod === 2) derivedStatus = "FOLLOW-UP";
          else derivedStatus = "COMPLIANT";

          let normalizedStatus: "OVERDUE" | "DUE SOON" | "FOLLOW-UP" | "COMPLIANT" = derivedStatus;
          if (c.rtw_status) {
            const rawSt = String(c.rtw_status).trim().toUpperCase();
            if (rawSt === "OVERDUE" || rawSt === "DUE SOON" || rawSt === "FOLLOW-UP" || rawSt === "COMPLIANT") {
              normalizedStatus = rawSt as any;
            }
          }

          let daysUntil: number | null = null;
          if (normalizedStatus === "OVERDUE") daysUntil = -3;
          else if (normalizedStatus === "DUE SOON") daysUntil = 4;

          return {
            id: String(c.id || i + 1),
            entityId: c.id,
            caseId,
            name,
            company,
            avatarUrl: c.migrant?.user?.avatarUrl,
            avatarInitials: initials,
            status: normalizedStatus,
            lastCheck: c.last_rtw_check ? new Date(c.last_rtw_check).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "20 Jul 2025",
            nextCheck: c.next_rtw_check ? new Date(c.next_rtw_check).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "20 Jul 2026",
            daysUntil: c.days_until !== undefined ? c.days_until : daysUntil,
          };
        });
        setRtwChecks(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch RTW checks from backend API:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRtwData();
  }, [fetchRtwData]);

  const handleOpenVerifyForMigrant = (item: RtwCheckItem) => {
    setSelectedMigrant(item.name);
    setSelectedEntityId(item.entityId);
    setSelectedCaseId(item.caseId.startsWith("#") ? item.caseId : `#${item.caseId}`);
    setSelectedAvatarUrl(item.avatarUrl);
    setSelectedAvatarInitials(item.avatarInitials);
    setIsVerifyModalOpen(true);
    setVerificationResult(null);
  };

  const counts = React.useMemo(() => {
    return {
      all: rtwChecks.length,
      overdue: rtwChecks.filter((c) => c.status === "OVERDUE").length,
      due: rtwChecks.filter((c) => c.status === "DUE SOON").length,
      compliant: rtwChecks.filter((c) => c.status === "COMPLIANT").length,
      followUp: rtwChecks.filter((c) => c.status === "FOLLOW-UP").length,
    };
  }, [rtwChecks]);

  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, statusDropdownFilter, itemsPerPage]);

  const filteredChecks = React.useMemo(() => {
    return rtwChecks.filter((item) => {
      if (activeTab === "OVERDUE" && item.status !== "OVERDUE") return false;
      if (activeTab === "DUE" && item.status !== "DUE SOON") return false;
      if (activeTab === "COMPLIANT" && item.status !== "COMPLIANT") return false;
      if (activeTab === "FOLLOW-UP" && item.status !== "FOLLOW-UP") return false;

      if (statusDropdownFilter !== "All status") {
        if (statusDropdownFilter === "Overdue" && item.status !== "OVERDUE") return false;
        if (statusDropdownFilter === "Due Soon" && item.status !== "DUE SOON") return false;
        if (statusDropdownFilter === "Compliant" && item.status !== "COMPLIANT") return false;
        if (statusDropdownFilter === "Follow-up" && item.status !== "FOLLOW-UP") return false;
      }

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(query) || item.caseId.toLowerCase().includes(query) || item.company.toLowerCase().includes(query);
      }
      return true;
    });
  }, [rtwChecks, activeTab, statusDropdownFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredChecks.length / itemsPerPage));

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

  const paginatedChecks = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredChecks.slice(start, start + itemsPerPage);
  }, [filteredChecks, currentPage, itemsPerPage]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;

    if (!selectedEntityId) {
      setVerificationResult({
        success: false,
        msg: "No migrant record selected for verification.",
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const formData = new FormData();
      if (shareCode) formData.append("shareCode", shareCode);
      if (dob) formData.append("dob", dob);
      if (workRestrictions) formData.append("workRestrictions", workRestrictions);
      if (govRefNumber) formData.append("govRefNumber", govRefNumber);
      if (selectedFile) formData.append("file", selectedFile);

      await apiClient.post(ENDPOINTS.files.uploadRightToWork(selectedEntityId), formData);
      
      setVerificationResult({
        success: true,
        msg: `Statutory RTW Verification complete for ${selectedMigrant}. Saved to backend compliance vault.`,
      });
      fetchRtwData();
    } catch (err: any) {
      console.error("Backend API RTW verification error:", err?.message || err);
      setVerificationResult({
        success: false,
        msg: err?.message || `Failed to verify RTW check for ${selectedMigrant}. Please try again.`,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full min-h-full bg-[#F7F7F7] text-[#171717] font-sans pb-16 flex flex-col gap-6 px-6 lg:px-12 py-8 select-none">
      <div className="flex items-center gap-2">
        <Link
          href="/compliance"
          className="text-[14px] text-[#5C5C5C] hover:text-[#171717] flex items-center gap-1 transition-colors"
        >
          <RiArrowLeftSLine className="size-4" />
          <span>Compliance Centre</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] leading-[40px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
            Right to Work Checks
          </h1>
          <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
            Track statutory RTW checks and renewal deadlines
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              setIsVerifyModalOpen(true);
              setVerificationResult(null);
            }}
            className="bg-[#7D52F4] hover:bg-[#6C3FEB] text-white rounded-[10px] h-[36px] px-4 font-medium text-[14px] flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <RiShieldCheckLine className="size-4" />
            <span>Verify share code</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-[#EBEBEB] pb-0">
        <button
          type="button"
          className="text-[14px] font-medium text-[#171717] border-b-2 border-[#171717] pb-2.5 flex items-center gap-2 cursor-pointer"
        >
          <span>RTW Checks</span>
          <span className="bg-[#EBEBEB] text-[#171717] text-[12px] font-medium px-2 py-0.5 rounded-full">
            {counts.overdue}
          </span>
        </button>
        <button
          type="button"
          className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] pb-2.5 transition-colors cursor-pointer"
        >
          Verification History
        </button>
      </div>

      <div className="bg-[#FFF4ED] border border-[#FEE4E2] rounded-[12px] p-3.5 px-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5 text-[14px]">
          <RiErrorWarningLine className="size-5 text-[#F04438] shrink-0" />
          <span className="font-medium text-[#171717]">Attention needed</span>
          <span className="text-[#5C5C5C]">·</span>
          <span className="text-[#171717]">
            {counts.overdue + counts.due} actions need attention
          </span>
          <span className="text-[#5C5C5C]">·</span>
          <span className="text-[#FB3748] font-medium">{counts.overdue} high risk</span>
        </div>

        <button
          type="button"
          className="text-[13px] font-medium text-[#171717] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>Review actions</span>
          <RiArrowRightSLine className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#F2EFFE] border border-[#E7E2FE] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            TOTAL MIGRANTS
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#7D52F4] font-aeonik-medium">
            {counts.all}
          </span>
        </div>

        <div className="bg-[#FFEBEC] border border-[#FECDCA] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            OVERDUE CHECKS
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#FB3748] font-aeonik-medium">
            {counts.overdue}
          </span>
        </div>

        <div className="bg-[#FEF6E6] border border-[#FEF0C7] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            DUE SOON
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#D97706] font-aeonik-medium">
            {counts.due}
          </span>
        </div>

        <div className="bg-white border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            FOLLOW-UP
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#7D52F4] font-aeonik-medium">
            {counts.followUp}
          </span>
        </div>

        <div className="bg-[#E3F7EC] border border-[#A6F4C5] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            COMPLIANT
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#0D6332] font-aeonik-medium">
            {counts.compliant}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-full sm:w-[348px] h-[32px] bg-white rounded-[8px] border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] px-2.5 flex items-center gap-2 focus-within:border-[#7D52F4] transition-colors">
            <RiSearch2Line className="size-4 text-[#A4A4A4] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full text-[14px] text-[#171717] placeholder-[#A4A4A4] outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[#A4A4A4] hover:text-[#171717] cursor-pointer"
              >
                <RiCloseLine className="size-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            className="w-[32px] h-[32px] bg-white rounded-[8px] border border-[#EBEBEB] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <RiFilter3Line className="size-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="h-[32px] px-3 bg-white rounded-[8px] border border-[#EBEBEB] text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] flex items-center gap-1.5 hover:bg-neutral-50 transition-colors cursor-pointer outline-none">
              <span>{statusDropdownFilter}</span>
              <RiArrowDownSLine className="size-4 text-[#5C5C5C]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px]">
              {["All status", "Overdue", "Due Soon", "Compliant", "Follow-up"].map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onClick={() => setStatusDropdownFilter(opt)}
                  className="cursor-pointer text-[13px]"
                >
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="bg-[#EBEBEB] rounded-full p-1 flex items-center gap-1 h-[32px] self-center sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.02em] transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-white text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
                : "text-[#5C5C5C] hover:text-[#171717]"
            }`}
          >
            ALL ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("OVERDUE")}
            className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.02em] flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "OVERDUE"
                ? "bg-white text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
                : "text-[#5C5C5C] hover:text-[#171717]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FB3748] shrink-0" />
            <span>OVERDUE ({counts.overdue})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("DUE")}
            className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.02em] flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "DUE"
                ? "bg-white text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
                : "text-[#5C5C5C] hover:text-[#171717]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#F6B51E] shrink-0" />
            <span>DUE ({counts.due})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("COMPLIANT")}
            className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.02em] flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "COMPLIANT"
                ? "bg-white text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
                : "text-[#5C5C5C] hover:text-[#171717]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1FC16B] shrink-0" />
            <span>COMPLIANT ({counts.compliant})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("FOLLOW-UP")}
            className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.02em] flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "FOLLOW-UP"
                ? "bg-white text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
                : "text-[#5C5C5C] hover:text-[#171717]"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#7D52F4] shrink-0" />
            <span>FOLLOW-UP ({counts.followUp})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-6 h-6 rounded-[6px] bg-white border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <RiArrowLeftSLine className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-6 h-6 rounded-[6px] bg-white border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <RiArrowRightSLine className="size-4" />
          </button>
        </div>
      </div>

      <div className="bg-[#F7F7F7] rounded-[16px] p-2 flex flex-col gap-2">
        <div className="h-[36px] bg-[#F7F7F7] px-4 flex items-center text-[12px] font-medium tracking-[0.04em] uppercase text-[#A4A4A4] select-none">
          <div className="w-[100px] flex items-center gap-1"><span>CASE ID #</span></div>
          <div className="w-[280px] flex items-center gap-1"><span>NAME</span><RiExpandUpDownLine className="size-3.5 text-[#A4A4A4]" /></div>
          <div className="w-[150px] flex items-center gap-1"><span>STATUS</span><RiExpandUpDownLine className="size-3.5 text-[#A4A4A4]" /></div>
          <div className="w-[160px] flex items-center gap-1"><span>LAST CHECK</span><RiExpandUpDownLine className="size-3.5 text-[#A4A4A4]" /></div>
          <div className="w-[160px] flex items-center gap-1"><span>NEXT CHECK</span><RiExpandUpDownLine className="size-3.5 text-[#A4A4A4]" /></div>
          <div className="flex-1 flex items-center justify-start"><span>DAYS UNTIL</span></div>
          <div className="w-[48px]" />
        </div>

        <div className="flex flex-col gap-2">
          {paginatedChecks.length === 0 ? (
            <div className="bg-white rounded-[16px] py-12 px-4 text-center text-[#5C5C5C] text-[14px]">
              No RTW checks found matching your search or filters.
            </div>
          ) : (
            paginatedChecks.map((row) => (
              <div
                key={row.id}
                className="bg-white rounded-[16px] h-[72px] px-4 flex items-center justify-between border border-transparent hover:border-[#EBEBEB] hover:shadow-xs transition-all"
              >
                <div className="w-[100px] font-mono text-[14px] text-[#5C5C5C]">{row.caseId}</div>
                <div className="w-[280px] flex items-center gap-3">
                  {row.avatarUrl ? (
                    <img src={row.avatarUrl} alt={row.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#EBEBEB] text-[#171717] font-medium text-[14px] flex items-center justify-center shrink-0">{row.avatarInitials}</div>
                  )}
                  <div className="flex flex-col justify-center">
                    <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]">{row.name}</span>
                    <span className="text-[12px] text-[#5C5C5C] leading-[16px]">{row.company}</span>
                  </div>
                </div>
                <div className="w-[150px]">
                  {row.status === "OVERDUE" && <span className="bg-[#FFEBEC] text-[#681219] rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.02em] inline-flex items-center">OVERDUE</span>}
                  {row.status === "DUE SOON" && <span className="bg-[#FEF6E6] text-[#624C18] rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.02em] inline-flex items-center">DUE SOON</span>}
                  {row.status === "FOLLOW-UP" && <span className="bg-[#F2EFFE] text-[#5326CD] rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.02em] inline-flex items-center">FOLLOW-UP</span>}
                  {row.status === "COMPLIANT" && <span className="bg-[#E3F7EC] text-[#0D6332] rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.02em] inline-flex items-center">COMPLIANT</span>}
                </div>
                <div className="w-[160px] text-[14px] font-normal text-[#171717] opacity-80">{row.lastCheck}</div>
                <div className="w-[160px] text-[14px] font-normal text-[#171717] opacity-80">{row.nextCheck}</div>
                <div className="flex-1 flex items-center justify-start">
                  {row.daysUntil !== null ? (
                    row.daysUntil < 0 ? (
                      <span className="bg-[#FFEBEC] text-[#681219] rounded-[6px] px-2 py-0.5 text-[12px] font-medium">
                        {Math.abs(row.daysUntil)}d overdue
                      </span>
                    ) : (
                      <span className="bg-[#FEF6E6] text-[#624C18] rounded-[6px] px-2 py-0.5 text-[12px] font-medium">
                        in {row.daysUntil} days
                      </span>
                    )
                  ) : (
                    <span className="text-[14px] text-[#A4A4A4]">—</span>
                  )}
                </div>
                <div className="w-[48px] flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-100 transition-colors cursor-pointer outline-none">
                      <RiMore2Line className="size-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuItem onClick={() => handleOpenVerifyForMigrant(row)} className="cursor-pointer text-[13px] flex items-center gap-2">
                        <RiShieldCheckLine className="size-4 text-[#7D52F4]" />
                        <span>Verify with Share Code</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenVerifyForMigrant(row)} className="cursor-pointer text-[13px] flex items-center gap-2">
                        <RiEditLine className="size-4 text-[#5C5C5C]" />
                        <span>Complete check</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination & Footer Controls */}
      <div className="flex items-center justify-between w-full font-sans select-none pt-2">
        {/* Left: Showing X-Y of Z checks */}
        <span className="text-[13px] text-[#5C5C5C]">
          Showing {filteredChecks.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, filteredChecks.length)} of {filteredChecks.length}
        </span>

        {/* Center: Pagination Controls */}
        <div className="flex items-center gap-1">
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

          {pageNumbers.map((pNum) => (
            <button
              key={pNum}
              type="button"
              onClick={() => setCurrentPage(pNum)}
              className={`size-8 rounded-[8px] flex items-center justify-center text-[14px] font-medium transition-colors border-0 cursor-pointer ${
                currentPage === pNum
                  ? "bg-[#171717] text-white"
                  : "bg-transparent text-[#5C5C5C] hover:bg-neutral-200"
              }`}
            >
              {pNum}
            </button>
          ))}

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

        {/* Right: Items per Page Dropdown (10, 25, 50) */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-[32px] px-[10px] bg-white border border-[#EBEBEB] rounded-[8px] flex items-center gap-[4px] text-[14px] text-[#5C5C5C] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] cursor-pointer outline-none hover:text-[#171717] hover:bg-neutral-50 transition-colors">
            <span>{itemsPerPage} / page</span>
            <RiArrowDownSLine className="size-5 text-[#A4A4A4]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[10, 25, 50].map((val) => (
              <DropdownMenuItem
                key={val}
                onClick={() => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                }}
                className="cursor-pointer text-[13px]"
              >
                {val} / page
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-6 rounded-[20px] bg-white border border-[#EBEBEB] shadow-2xl">
          <div className="flex items-center gap-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-[14px] p-3">
            {selectedAvatarUrl ? (
              <img src={selectedAvatarUrl} alt={selectedMigrant} className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#EBEBEB] text-[#171717] font-medium text-[14px] flex items-center justify-center shrink-0">{selectedAvatarInitials}</div>
            )}
            <div className="flex flex-col">
              <span className="text-[12px] font-mono text-[#5C5C5C]">{selectedCaseId}</span>
              <span className="text-[15px] font-medium text-[#171717] leading-tight">{selectedMigrant}</span>
            </div>
          </div>

          <DialogHeader className="pt-2">
            <DialogTitle className="text-[20px] font-medium font-aeonik-medium text-[#171717]">Verify with share code</DialogTitle>
            <DialogDescription className="text-[13px] text-[#5C5C5C] leading-snug">Verify Right to Work status using a Home Office share code</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1 mt-2">
            <label htmlFor="rtw-migrant-select" className="text-[13px] font-medium text-[#171717]">Select migrant</label>
            <div className="relative flex items-center">
              <select
                id="rtw-migrant-select"
                value={selectedEntityId}
                onChange={(e) => {
                  const entId = e.target.value;
                  setSelectedEntityId(entId);
                  const found = rtwChecks.find((c) => String(c.entityId) === String(entId));
                  if (found) {
                    setSelectedMigrant(found.name);
                    setSelectedCaseId(found.caseId.startsWith("#") ? found.caseId : `#${found.caseId}`);
                    setSelectedAvatarUrl(found.avatarUrl);
                    setSelectedAvatarInitials(found.avatarInitials);
                  }
                }}
                className="w-full h-[38px] px-3 pr-8 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] appearance-none cursor-pointer font-medium transition-colors"
              >
                {rtwChecks.map((item) => (
                  <option key={item.id} value={item.entityId}>{item.name}</option>
                ))}
              </select>
              <RiArrowDownSLine className="size-4 text-[#5C5C5C] absolute right-3 pointer-events-none" />
            </div>
          </div>

          <div className="bg-[#F5F5F5] rounded-[12px] p-1 flex items-center gap-1 mt-1">
            <button type="button" onClick={() => setVerifyMode("automatic")} className={`flex-1 py-1.5 rounded-[8px] text-[13px] font-medium transition-all cursor-pointer ${verifyMode === "automatic" ? "bg-white text-[#171717] shadow-2xs" : "text-[#5C5C5C] hover:text-[#171717]"}`}>Automatic</button>
            <button type="button" onClick={() => setVerifyMode("manual")} className={`flex-1 py-1.5 rounded-[8px] text-[13px] font-medium transition-all cursor-pointer ${verifyMode === "manual" ? "bg-white text-[#171717] shadow-2xs" : "text-[#5C5C5C] hover:text-[#171717]"}`}>Manual</button>
          </div>

          <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4 mt-2">
            <div className="relative border-2 border-dashed border-[#E5DBFF] bg-[#FAF8FF]/60 hover:bg-[#FAF8FF] rounded-[16px] p-5 text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer group">
              <RiMagicLine className="size-4 text-[#7D52F4] absolute top-3 right-3" />
              <div className="w-10 h-10 rounded-[10px] bg-[#EFE9FF] flex items-center justify-center text-[#7D52F4] mb-1">
                <RiUpload2Line className="size-5" />
              </div>
              <input type="file" id="rtw-file-drop" className="hidden" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setDragFileName(e.target.files[0].name);
                  }
                }} />
              <label htmlFor="rtw-file-drop" className="cursor-pointer">
                <span className="text-[14px] font-medium text-[#171717] block">{dragFileName ? dragFileName : "Drop RTW check result here"}</span>
                <span className="text-[12px] text-[#5C5C5C] block mt-0.5">JPEG, PNG, and PDF, up to 5MB.</span>
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="rtw-share-code-input" className="text-[13px] font-medium text-[#171717]">Share code</label>
              <input id="rtw-share-code-input" type="text" value={shareCode} onChange={(e) => setShareCode(e.target.value.toUpperCase())} placeholder="e.g. W1234567X" className="w-full h-[38px] px-3 text-[14px] uppercase font-sans bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors" maxLength={9} />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="rtw-dob-input" className="text-[13px] font-medium text-[#171717]">Date of Birth</label>
              <input id="rtw-dob-input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full h-[38px] px-3 text-[14px] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors" />
            </div>

            {verifyMode === "manual" && (
              <>
                <div className="flex flex-col gap-1">
                  <label htmlFor="rtw-restrictions-input" className="text-[13px] font-medium text-[#171717]">Work conditions/restrictions</label>
                  <input id="rtw-restrictions-input" type="text" value={workRestrictions} onChange={(e) => setWorkRestrictions(e.target.value)} placeholder="e.g. Can work full-time, no restrictions" className="w-full h-[38px] px-3 text-[14px] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="rtw-gov-ref-input" className="text-[13px] font-medium text-[#171717]">GOV.uk reference number</label>
                  <input id="rtw-gov-ref-input" type="text" value={govRefNumber} onChange={(e) => setGovRefNumber(e.target.value.toUpperCase())} placeholder="e.g. WE-G98V497-0S" className="w-full h-[38px] px-3 text-[14px] uppercase bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors" />
                </div>
              </>
            )}

            {verificationResult && (
              verificationResult.success ? (
                <div className="bg-[#E3F7EC] border border-[#A6F4C5] rounded-[10px] p-3 text-[13px] text-[#0D6332] flex items-start gap-2">
                  <RiCheckLine className="size-5 shrink-0 mt-0.5 text-[#0D6332]" />
                  <div>{verificationResult.msg}</div>
                </div>
              ) : (
                <div className="bg-[#FFEBEC] border border-[#FECDCA] rounded-[10px] p-3 text-[13px] text-[#FB3748] flex items-start gap-2">
                  <RiErrorWarningLine className="size-5 shrink-0 mt-0.5 text-[#FB3748]" />
                  <div>{verificationResult.msg}</div>
                </div>
              )
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#EBEBEB]/60 mt-1">
              <button type="button" className="text-[13px] font-medium text-[#5C5C5C] hover:text-[#171717] underline cursor-pointer">How it works</button>
              <button type="submit" disabled={isVerifying} className="h-[36px] px-5 rounded-[10px] bg-[#7D52F4] hover:bg-[#6C3FEB] text-white text-[14px] font-medium transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center disabled:opacity-50">
                {isVerifying ? <span>Processing...</span> : <span>{verifyMode === "automatic" ? "Verify share code" : "Save verification"}</span>}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
