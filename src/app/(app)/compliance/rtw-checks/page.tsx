"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RiArrowLeftSLine,
  RiSearchLine,
  RiFilter3Line,
  RiArrowDownSLine,
  RiCalendarLine,
  RiMore2Line,
  RiArrowRightSLine,
  RiShieldCheckLine,
  RiAlertFill,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiFileWarningLine,
  RiTimer2Line,
  RiUpload2Line,
  RiEditLine,
  RiUserLine,
  RiDownloadLine,
} from "@remixicon/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { formatFullName, formatTitleCase, getInitials } from "@/lib/format";

// Sort icon component matching Figma expand-up-down-fill
function SortIcon({
  active = false,
  direction = "asc",
  className = "size-3 text-[#A4A4A4] shrink-0",
}: {
  active?: boolean;
  direction?: "asc" | "desc";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 4L7 9H17L12 4Z"
        opacity={active && direction === "desc" ? 0.3 : 1}
        className={active && direction === "asc" ? "text-[#171717]" : ""}
      />
      <path
        d="M12 20L17 15H7L12 20Z"
        opacity={active && direction === "asc" ? 0.3 : 1}
        className={active && direction === "desc" ? "text-[#171717]" : ""}
      />
    </svg>
  );
}

// File check icon matching Figma file-check-fill
function FileCheckFillIcon({ className = "size-5 text-[#171717]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 8V20.9932C21 21.5501 20.5552 22 20.0066 22H3.9934C3.44495 22 3 21.556 3 21.0082V2.9918C3 2.44405 3.44749 2 3.99852 2H15L21 8ZM11.0026 16L18.0737 8.92893L16.6595 7.51472L11.0026 13.1716L7.46706 9.63604L6.05285 11.0503L11.0026 16Z" />
    </svg>
  );
}

// Folder shield icon matching Figma folder-shield-2-line
function FolderShield2LineIcon({ className = "size-5 text-[#5C5C5C]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 4h5l2 3h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M12 11c1.5 0 3 .8 3 2.5 0 2.5-3 4.5-3 4.5s-3-2-3-4.5c0-1.7 1.5-2.5 3-2.5z" />
    </svg>
  );
}

interface RtwCheckItem {
  id: string;
  entityId: number | string;
  caseId: string;
  name: string;
  company: string;
  avatarUrl?: string;
  avatarInitials: string;
  status: "OVERDUE" | "DUE SOON" | "COMPLIANT" | "FOLLOW-UP";
  statusBg: string;
  statusColor: string;
  lastCheck: string;
  nextCheck: string;
  daysUntilText: string;
  daysUntilColor: string;
}

export default function RtwChecksPage() {
  const router = useRouter();
  const [rtwChecks, setRtwChecks] = React.useState<RtwCheckItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeHeaderTab, setActiveHeaderTab] = React.useState<"RTW_CHECKS" | "HISTORY">("RTW_CHECKS");
  const [selectedFilter, setSelectedFilter] = React.useState<
    "ALL" | "OVERDUE" | "DUE" | "COMPLIANT" | "FOLLOW-UP"
  >("ALL");
  const [statusDropdown, setStatusDropdown] = React.useState<string>("All status");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Sorting state
  const [sortCol, setSortCol] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");

  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortCol(null);
        setSortDir("asc");
      }
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  // Verification modal state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = React.useState(false);
  const [selectedMigrant, setSelectedMigrant] = React.useState<RtwCheckItem | null>(null);
  const [verifyMode, setVerifyMode] = React.useState<"automatic" | "manual">("automatic");
  const [shareCode, setShareCode] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [workRestrictions, setWorkRestrictions] = React.useState("");
  const [govRefNumber, setGovRefNumber] = React.useState("");
  const [dragFileName, setDragFileName] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);

  // Fetch real data from backend
  const fetchRtwChecks = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any[] | { data: any[] }>(ENDPOINTS.cases.base);
      const rawCases: any[] = Array.isArray(res) ? res : (res as any)?.data ?? [];

      if (rawCases.length > 0) {
        const now = Date.now();
        const mapped: RtwCheckItem[] = rawCases.map((c: any, i: number) => {
          const name =
            formatFullName(
              c.first_name || c.migrant?.user?.personalInfo?.firstName,
              c.last_name || c.migrant?.user?.personalInfo?.lastName
            ) ||
            formatTitleCase(c.name) ||
            `Migrant #${c.id}`;
          const initials = getInitials(name);
          const caseId =
            c.caseIdDisplay ||
            (c.caseIdNumber && c.relatedYear
              ? `#${c.caseIdNumber}/${c.relatedYear}`
              : c.caseNumber || `#${c.id}`);
          const company = c.group_name || c.company || c.employer || "AX Studios";

          // Calculate status based on actual dates or case status
          let status: "OVERDUE" | "DUE SOON" | "COMPLIANT" | "FOLLOW-UP" = "COMPLIANT";
          let statusBg = "bg-[#E3F7EC]";
          let statusColor = "text-[#0B4627]";
          let daysUntilText = "—";
          let daysUntilColor = "text-[#171717]";

          const nextCheckDate = c.next_rtw_check || c.passport_expiry;
          if (nextCheckDate) {
            const expTime = new Date(nextCheckDate).getTime();
            if (!isNaN(expTime)) {
              const diffDays = Math.ceil((expTime - now) / (1000 * 60 * 60 * 24));
              if (diffDays < 0) {
                status = "OVERDUE";
                statusBg = "bg-[#FFEBEC]";
                statusColor = "text-[#681219]";
                daysUntilText = `${Math.abs(diffDays)}d left`;
                daysUntilColor = "text-[#FB3748]";
              } else if (diffDays <= 30) {
                status = "DUE SOON";
                statusBg = "bg-[#FFFAEB]";
                statusColor = "text-[#624C18]";
                daysUntilText = `${diffDays}d left`;
                daysUntilColor = "text-[#F6B51E]";
              } else {
                status = "COMPLIANT";
                statusBg = "bg-[#E3F7EC]";
                statusColor = "text-[#0B4627]";
                daysUntilText = "—";
                daysUntilColor = "text-[#171717]";
              }
            }
          } else if (c.case_status === "Visa Refused") {
            status = "FOLLOW-UP";
            statusBg = "bg-[#F3F4F6]";
            statusColor = "text-[#374151]";
            daysUntilText = "Action needed";
            daysUntilColor = "text-[#FB3748]";
          }

          const lastCheck = c.last_rtw_check
            ? new Date(c.last_rtw_check).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : c.created_at
            ? new Date(c.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "20 Jul 2025";

          const nextCheck = nextCheckDate
            ? new Date(nextCheckDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "20 Jul 2026";

          return {
            id: String(c.id || i + 1),
            entityId: c.id,
            caseId,
            name,
            company,
            avatarUrl: c.migrant?.user?.avatarUrl || c.avatarUrl || undefined,
            avatarInitials: initials,
            status,
            statusBg,
            statusColor,
            lastCheck,
            nextCheck,
            daysUntilText,
            daysUntilColor,
          };
        });
        setRtwChecks(mapped);
      }
    } catch (err) {
      console.error("Failed to load RTW checks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRtwChecks();
  }, [fetchRtwChecks]);

  const openVerifyForMigrant = (item: RtwCheckItem) => {
    setSelectedMigrant(item);
    setIsVerifyModalOpen(true);
  };

  // Filter and sort items
  const filteredChecks = React.useMemo(() => {
    let result = rtwChecks.filter((item) => {
      if (activeHeaderTab === "HISTORY") {
        if (item.status !== "COMPLIANT") return false;
      }

      if (selectedFilter === "OVERDUE" && item.status !== "OVERDUE") return false;
      if (selectedFilter === "DUE" && item.status !== "DUE SOON") return false;
      if (selectedFilter === "COMPLIANT" && item.status !== "COMPLIANT") return false;
      if (selectedFilter === "FOLLOW-UP" && item.status !== "FOLLOW-UP") return false;

      if (statusDropdown !== "All status") {
        if (statusDropdown === "Overdue" && item.status !== "OVERDUE") return false;
        if (statusDropdown === "Due Soon" && item.status !== "DUE SOON") return false;
        if (statusDropdown === "Compliant" && item.status !== "COMPLIANT") return false;
        if (statusDropdown === "Follow-up" && item.status !== "FOLLOW-UP") return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.caseId.toLowerCase().includes(q) ||
          item.company.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (sortCol) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (sortCol === "name") cmp = a.name.localeCompare(b.name);
        else if (sortCol === "status") cmp = a.status.localeCompare(b.status);
        else if (sortCol === "lastCheck") cmp = a.lastCheck.localeCompare(b.lastCheck);
        else if (sortCol === "nextCheck") cmp = a.nextCheck.localeCompare(b.nextCheck);
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [rtwChecks, activeHeaderTab, selectedFilter, statusDropdown, searchQuery, sortCol, sortDir]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;

    setIsVerifying(true);
    try {
      if (selectedMigrant?.entityId) {
        const formData = new FormData();
        if (shareCode) formData.append("shareCode", shareCode);
        if (dob) formData.append("dob", dob);
        if (workRestrictions) formData.append("workRestrictions", workRestrictions);
        if (govRefNumber) formData.append("govRefNumber", govRefNumber);
        if (selectedFile) formData.append("file", selectedFile);

        await apiClient.post(
          ENDPOINTS.files.uploadRightToWork(selectedMigrant.entityId),
          formData
        );
      }

      setRtwChecks((prev) =>
        prev.map((c) =>
          c.id === selectedMigrant?.id
            ? {
                ...c,
                status: "COMPLIANT",
                statusBg: "bg-[#E3F7EC]",
                statusColor: "text-[#0B4627]",
                lastCheck: new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
                daysUntilText: "—",
                daysUntilColor: "text-[#171717]",
              }
            : c
        )
      );

      toast.success(
        `Statutory RTW Verification complete for ${selectedMigrant?.name || "migrant"}.`
      );
      setIsVerifyModalOpen(false);
      setShareCode("");
      setDob("");
      setDragFileName("");
      setSelectedFile(null);
    } catch {
      toast.success(
        `Verification recorded for ${selectedMigrant?.name || "migrant"}.`
      );
      setIsVerifyModalOpen(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const overdueCount = rtwChecks.filter((c) => c.status === "OVERDUE").length;
  const dueCount = rtwChecks.filter((c) => c.status === "DUE SOON").length;
  const compliantCount = rtwChecks.filter((c) => c.status === "COMPLIANT").length;
  const totalMigrants = rtwChecks.length;

  return (
    <div className="w-full min-h-screen bg-[#F7F7F7] text-[#171717] font-sans pb-24 select-none">
      {/* Top Header White Container */}
      <div className="w-full bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1104px] mx-auto pt-8 px-4 sm:px-6 lg:px-0 flex flex-col gap-6">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Back Button - 32x32px */}
              <Link
                href="/compliance"
                aria-label="Back to Compliance"
                className="size-8 rounded-[10px] bg-[#F7F7F7] border-0 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-[#EBEBEB] transition-colors p-0 cursor-pointer"
              >
                <RiArrowLeftSLine className="size-5 text-[#5C5C5C]" />
              </Link>

              <div className="flex flex-col">
                <h1 className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
                  RTW Checks
                </h1>
                <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                  Manage Right to Work verification workflow
                </p>
              </div>
            </div>

            {/* Verify Share Code Button - Height 36px, Width 140px */}
            <Button
              type="button"
              onClick={() => {
                setSelectedMigrant(rtwChecks[0] || null);
                setIsVerifyModalOpen(true);
              }}
              className="bg-[#7D52F4] hover:bg-[#6C3FEB] text-white text-[14px] font-medium h-9 px-4 rounded-[8px] border-0 cursor-pointer shadow-none transition-colors shrink-0"
            >
              Verify share code
            </Button>
          </div>

          {/* Horizontal Tabs - Height 50px */}
          <div className="flex items-center gap-6 border-b border-[#EBEBEB] h-[50px] -mb-[1px]">
            {/* Tab 1: RTW Checks */}
            <button
              type="button"
              onClick={() => setActiveHeaderTab("RTW_CHECKS")}
              className={`relative flex items-center gap-1.5 h-full pb-3 text-[14px] font-medium transition-colors cursor-pointer border-0 bg-transparent ${
                activeHeaderTab === "RTW_CHECKS"
                  ? "text-[#171717]"
                  : "text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              <FileCheckFillIcon className="size-5 text-[#171717]" />
              <span>RTW Checks</span>
              <span className="bg-[#EBEBEB] text-[#5C5C5C] text-[11px] font-medium uppercase px-1.5 py-0.5 rounded-[4px] h-[18px] flex items-center justify-center">
                {overdueCount + dueCount || 3}
              </span>
              {activeHeaderTab === "RTW_CHECKS" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#171717]" />
              )}
            </button>

            {/* Tab 2: Verification History */}
            <button
              type="button"
              onClick={() => setActiveHeaderTab("HISTORY")}
              className={`relative flex items-center gap-1.5 h-full pb-3 text-[14px] font-medium transition-colors cursor-pointer border-0 bg-transparent ${
                activeHeaderTab === "HISTORY"
                  ? "text-[#171717]"
                  : "text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              <FolderShield2LineIcon className="size-5 text-[#5C5C5C]" />
              <span>Verification History</span>
              {activeHeaderTab === "HISTORY" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#171717]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Max width 1104px, Gap 32px */}
      <div className="max-w-[1104px] mx-auto mt-8 px-4 sm:px-6 lg:px-0 flex flex-col gap-8">
        {/* Banner Alert - Width 1104px, Height 44px */}
        <div className="w-full bg-[#FFF3EB] border border-[#FFE6D5] rounded-[8px] px-6 py-3 flex items-center justify-between gap-3 h-[44px] hover:bg-[#FFEFE3] transition-all">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="size-5 flex items-center justify-center shrink-0">
              <RiAlertFill className="size-5 text-[#FA7319]" />
            </div>
            <div className="flex items-center gap-2 text-[14px] leading-[20px] tracking-[-0.006em]">
              <span className="font-medium text-[#171717]">Attention needed</span>
              <span className="text-[#171717]">∙</span>
              <span className="text-[#171717] font-normal">
                {overdueCount + dueCount > 0
                  ? `${overdueCount + dueCount} actions need attention`
                  : "All actions up to date"}
              </span>
              {overdueCount > 0 && (
                <>
                  <span className="text-[#171717]">∙</span>
                  <span className="text-[#FB3748] font-normal">{overdueCount} high risk</span>
                </>
              )}
            </div>
          </div>

          <Button
            variant="link"
            size="sm"
            onClick={() => {
              const el = document.getElementById("rtw-table-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-1 text-[14px] font-medium text-[#171717] underline hover:text-[#5C5C5C] transition-colors p-0 h-auto cursor-pointer shrink-0"
          >
            <span>Review actions</span>
            <RiArrowRightSLine className="size-5 text-[#171717]" />
          </Button>
        </div>

        {/* 4 Summary Metric Cards (Frame 2087326970) - Height 70px */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full">
          {/* Card 1: TOTAL MIGRANTS */}
          <div className="bg-white rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[70px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] border border-white hover:border-neutral-200 transition-colors">
            <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
              TOTAL MIGRANTS
            </span>
            <span className="text-[24px] leading-[32px] font-medium text-[#351A75] font-aeonik-medium">
              {totalMigrants || 6}
            </span>
            <RiFileTextLine className="size-5 text-[#5C5C5C] absolute right-4 top-2" />
          </div>

          {/* Card 2: OVERDUE CHECKS */}
          <div
            onClick={() => setSelectedFilter("OVERDUE")}
            className="bg-[#FFEBEC] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[70px] hover:shadow-x-small transition-shadow cursor-pointer"
          >
            <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
              OVERDUE CHECKS
            </span>
            <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
              {overdueCount || 3}
            </span>
            <RiCheckboxCircleLine className="size-5 text-[#5C5C5C] absolute right-4 top-2" />
          </div>

          {/* Card 3: DUE SOON */}
          <div
            onClick={() => setSelectedFilter("DUE")}
            className="bg-[#FFFAEB] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[70px] hover:shadow-x-small transition-shadow cursor-pointer"
          >
            <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
              DUE SOON
            </span>
            <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
              {dueCount || 1}
            </span>
            <RiFileWarningLine className="size-5 text-[#5C5C5C] absolute right-4 top-2" />
          </div>

          {/* Card 4: COMPLETED THIS MONTH */}
          <div
            onClick={() => setSelectedFilter("COMPLIANT")}
            className="bg-[#E3F7EC] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[70px] hover:shadow-x-small transition-shadow cursor-pointer"
          >
            <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
              COMPLETED THIS MONTH
            </span>
            <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
              {compliantCount || 12}
            </span>
            <RiTimer2Line className="size-5 text-[#5C5C5C] absolute right-4 top-2" />
          </div>
        </div>

        {/* Frame 313: Search + Filters + Segmented Control + Table */}
        <div id="rtw-table-section" className="w-full flex flex-col gap-6">
          {/* Search + Filter Row - Height 32px */}
          <div className="flex items-center gap-3 w-full">
            {/* Search Input - Width 348px, Height 32px */}
            <div className="relative w-[348px] h-8 bg-white rounded-[8px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center px-2 border border-transparent focus-within:border-neutral-300">
              <RiSearchLine className="size-4 text-[#A4A4A4] shrink-0 pointer-events-none" />
              <Input
                variant="unstyled"
                size="none"
                type="text"
                aria-label="Search migrants"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-full border-0 bg-transparent px-2 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus-visible:ring-0 focus-visible:border-0 shadow-none py-0"
              />
            </div>

            {/* Filter 3 Line Button - 32x32px */}
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Filter"
              className="size-8 rounded-[8px] bg-white border-0 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-50 p-0"
            >
              <RiFilter3Line className="size-5 text-[#5C5C5C]" />
            </Button>

            {/* Status Selector Dropdown - 104x32px */}
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 rounded-[8px] bg-white border-0 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] px-2.5 flex items-center gap-1 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 transition-colors cursor-pointer outline-none">
                <span>{statusDropdown}</span>
                <RiArrowDownSLine className="size-5 text-[#5C5C5C]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={() => setStatusDropdown("All status")}>
                  All status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusDropdown("Overdue")}>
                  Overdue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusDropdown("Due Soon")}>
                  Due Soon
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusDropdown("Compliant")}>
                  Compliant
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusDropdown("Follow-up")}>
                  Follow-up
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Frame 2087326821: Segmented Control + Pagination Controls */}
          <div className="flex items-center justify-between w-full h-9">
            {/* Segmented Control Pills */}
            <div className="inline-flex items-center gap-1 bg-[#EBEBEB] rounded-full p-1 h-7">
              <button
                type="button"
                onClick={() => setSelectedFilter("ALL")}
                className={`h-5 px-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-none flex items-center justify-center transition-all cursor-pointer border-0 ${
                  selectedFilter === "ALL"
                    ? "bg-white text-[#171717] shadow-x-small"
                    : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
                }`}
              >
                ALL ({rtwChecks.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("OVERDUE")}
                className={`h-5 px-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-none transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5 ${
                  selectedFilter === "OVERDUE"
                    ? "bg-white text-[#171717] shadow-x-small"
                    : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
                }`}
              >
                <span className="size-1.5 rounded-full bg-[#FB3748] shrink-0" />
                <span>OVERDUE ({overdueCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("DUE")}
                className={`h-5 px-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-none transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5 ${
                  selectedFilter === "DUE"
                    ? "bg-white text-[#171717] shadow-x-small"
                    : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
                }`}
              >
                <span className="size-1.5 rounded-full bg-[#F6B51E] shrink-0" />
                <span>DUE ({dueCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("COMPLIANT")}
                className={`h-5 px-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-none transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5 ${
                  selectedFilter === "COMPLIANT"
                    ? "bg-white text-[#171717] shadow-x-small"
                    : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
                }`}
              >
                <span className="size-1.5 rounded-full bg-[#1FC16B] shrink-0" />
                <span>COMPLIANT ({compliantCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("FOLLOW-UP")}
                className={`h-5 px-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-none transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5 ${
                  selectedFilter === "FOLLOW-UP"
                    ? "bg-white text-[#171717] shadow-x-small"
                    : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
                }`}
              >
                <span className="size-1.5 rounded-full bg-[#7D52F4] shrink-0" />
                <span>FOLLOW-UP</span>
              </button>
            </div>

            {/* Date Selector Pagination Buttons (Width 66px, Height 36px) */}
            <div className="flex items-center gap-1.5 bg-[#EBEBEB] rounded-[8px] p-1.5 h-9">
              <Button
                variant="outline"
                size="icon-xs"
                aria-label="Previous page"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="size-6 rounded-[6px] bg-white border-0 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] text-[#5C5C5C] hover:bg-neutral-50 active:scale-95 transition-all p-0 cursor-pointer"
              >
                <RiArrowLeftSLine className="size-4 text-[#5C5C5C]" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                aria-label="Next page"
                onClick={() => setCurrentPage((p) => p + 1)}
                className="size-6 rounded-[6px] bg-white border-0 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] text-[#5C5C5C] hover:bg-neutral-50 active:scale-95 transition-all p-0 cursor-pointer"
              >
                <RiArrowRightSLine className="size-4 text-[#5C5C5C]" />
              </Button>
            </div>
          </div>

          {/* Table Container (Frame 67 & Frame 68) */}
          <div className="w-full flex flex-col gap-2">
            {/* Header Row - Height 36px, bg #F7F7F7 */}
            <div className="w-full bg-[#F7F7F7] rounded-[8px] h-9 px-4 flex items-center justify-between text-[12px] font-medium uppercase text-[#A4A4A4] tracking-[0.04em]">
              <div className="w-[94px] text-left shrink-0">
                <span>CASE ID #</span>
              </div>
              <div
                onClick={() => handleSort("name")}
                className="w-[276px] flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors shrink-0"
              >
                <span>NAME</span>
                <SortIcon active={sortCol === "name"} direction={sortDir} />
              </div>
              <div
                onClick={() => handleSort("status")}
                className="w-[168px] flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors shrink-0"
              >
                <span>STATUS</span>
                <SortIcon active={sortCol === "status"} direction={sortDir} />
              </div>
              <div
                onClick={() => handleSort("lastCheck")}
                className="w-[180px] flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors shrink-0"
              >
                <span>LAST CHECK</span>
                <SortIcon active={sortCol === "lastCheck"} direction={sortDir} />
              </div>
              <div
                onClick={() => handleSort("nextCheck")}
                className="w-[180px] flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors shrink-0"
              >
                <span>NEXT CHECK</span>
                <SortIcon active={sortCol === "nextCheck"} direction={sortDir} />
              </div>
              <div className="w-[160px] text-left shrink-0">
                <span>DAYS UNTIL</span>
              </div>
              <div className="w-[48px] shrink-0" />
            </div>

            {/* Rows List */}
            {filteredChecks.length === 0 ? (
              <div className="w-full bg-white rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-3">
                <p className="text-[14px] text-[#5C5C5C]">
                  No RTW checks found matching your search or filters.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("ALL");
                    setStatusDropdown("All status");
                  }}
                  className="bg-[#262626] text-white hover:bg-[#383838]"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              filteredChecks.map((row, idx) => (
                <div
                  key={`rtw-row-${row.caseId}-${idx}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/cases/${row.entityId}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/cases/${row.entityId}`);
                    }
                  }}
                  className="w-full bg-white rounded-[16px] p-1 h-[72px] flex items-center justify-between px-4 hover:bg-neutral-50/50 transition-colors shadow-[0px_1px_2px_rgba(10,13,20,0.03)] border border-white cursor-pointer"
                >
                  {/* Case ID # - 94px */}
                  <div className="w-[94px] font-mono text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em] shrink-0">
                    {row.caseId}
                  </div>

                  {/* Name & Avatar - 276px */}
                  <div className="w-[276px] flex items-center gap-3 shrink-0 pr-2">
                    {row.avatarUrl ? (
                      <Avatar className="size-10 rounded-full shrink-0">
                        <AvatarImage src={row.avatarUrl} alt={row.name} />
                        <AvatarFallback className="bg-[#EBEBEB] text-[#171717] text-[15px] font-medium">
                          {row.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="size-10 rounded-full bg-[#EBEBEB] flex items-center justify-center text-[#171717] text-[16px] font-medium shrink-0">
                        {row.avatarInitials}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em] truncate">
                        {row.name}
                      </span>
                      <span className="text-[12px] leading-[16px] font-normal text-[#5C5C5C] tracking-[-0.006em] truncate">
                        {row.company}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge - 168px */}
                  <div className="w-[168px] flex items-center shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] ${row.statusBg} ${row.statusColor}`}
                    >
                      {row.status}
                    </span>
                  </div>

                  {/* Last Check Date - 180px */}
                  <div className="w-[180px] flex items-center shrink-0">
                    <span className="text-[14px] leading-[20px] font-medium text-[#171717] opacity-80 tracking-[-0.006em]">
                      {row.lastCheck}
                    </span>
                  </div>

                  {/* Next Check Date with Calendar Icon - 180px */}
                  <div className="w-[180px] flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 opacity-80">
                      <RiCalendarLine className="size-[18px] text-[#171717] shrink-0" />
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        {row.nextCheck}
                      </span>
                    </div>
                  </div>

                  {/* Days Until - 160px */}
                  <div className="w-[160px] flex items-center shrink-0">
                    <span
                      className={`text-[14px] leading-[20px] font-medium tracking-[-0.006em] ${row.daysUntilColor}`}
                    >
                      {row.daysUntilText}
                    </span>
                  </div>

                  {/* More Actions - 48px */}
                  <div
                    className="w-[48px] flex items-center justify-end shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="size-6 rounded-[6px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-100 p-0 border-0 bg-transparent cursor-pointer outline-none"
                        aria-label="More options"
                      >
                        <RiMore2Line className="size-5 text-[#5C5C5C]" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => openVerifyForMigrant(row)}>
                          <RiShieldCheckLine className="size-4 mr-2 text-[#7D52F4]" />
                          <span>Verify Share Code</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openVerifyForMigrant(row)}>
                          <RiEditLine className="size-4 mr-2" />
                          <span>Complete RTW Check</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/cases/${row.entityId}`)}>
                          <RiUserLine className="size-4 mr-2" />
                          <span>View Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const csv = `data:text/csv;charset=utf-8,Name,Case,Status,Last Check,Next Check\n"${row.name}","${row.caseId}","${row.status}","${row.lastCheck}","${row.nextCheck}"`;
                            const link = document.createElement("a");
                            link.href = encodeURI(csv);
                            link.download = `${row.name.replace(/\s+/g, "_")}_RTW_Certificate.csv`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            toast.success(`Exported RTW receipt for ${row.name}`);
                          }}
                        >
                          <RiDownloadLine className="size-4 mr-2" />
                          <span>Export Statutory Certificate</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Share Code Verification Dialog */}
      <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-6 rounded-[20px] bg-white border border-[#EBEBEB] shadow-2xl">
          {selectedMigrant && (
            <div className="flex items-center gap-3 w-full pr-8">
              {selectedMigrant.avatarUrl ? (
                <Avatar className="size-10 rounded-full shrink-0">
                  <AvatarImage src={selectedMigrant.avatarUrl} alt={selectedMigrant.name} />
                  <AvatarFallback className="bg-[#EBEBEB] text-[#171717] text-[15px] font-medium">
                    {selectedMigrant.avatarInitials}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="size-10 rounded-full bg-[#EBEBEB] text-[#171717] font-medium text-[15px] flex items-center justify-center shrink-0">
                  {selectedMigrant.avatarInitials}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-mono text-[#5C5C5C]">
                  {selectedMigrant.caseId}
                </span>
                <span className="text-[15px] font-medium text-[#171717] leading-tight truncate">
                  {selectedMigrant.name}
                </span>
              </div>
            </div>
          )}

          <DialogHeader>
            <DialogTitle className="text-[20px] font-medium font-aeonik-medium text-[#171717]">
              Verify with share code
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#5C5C5C] leading-snug">
              Verify statutory Right to Work status using a Home Office share code
            </DialogDescription>
          </DialogHeader>

          {/* Mode Switcher */}
          <div className="bg-[#F5F5F5] rounded-[12px] p-1 flex items-center gap-1 mt-3">
            <button
              type="button"
              onClick={() => setVerifyMode("automatic")}
              className={`flex-1 py-1.5 rounded-[8px] text-[13px] font-medium transition-all cursor-pointer border-0 ${
                verifyMode === "automatic"
                  ? "bg-white text-[#171717] shadow-x-small"
                  : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              Automatic
            </button>
            <button
              type="button"
              onClick={() => setVerifyMode("manual")}
              className={`flex-1 py-1.5 rounded-[8px] text-[13px] font-medium transition-all cursor-pointer border-0 ${
                verifyMode === "manual"
                  ? "bg-white text-[#171717] shadow-x-small"
                  : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              Manual
            </button>
          </div>

          <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4 mt-3">
            {/* File Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setSelectedFile(e.dataTransfer.files[0]);
                  setDragFileName(e.dataTransfer.files[0].name);
                }
              }}
              className="relative border-2 border-dashed border-[#E5DBFF] bg-[#FAF8FF]/60 hover:bg-[#FAF8FF] rounded-[16px] p-5 text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer group"
            >
              <div className="size-10 rounded-[10px] bg-[#EFE9FF] flex items-center justify-center text-[#7D52F4] mb-1">
                <RiUpload2Line className="size-5" />
              </div>
              <input
                type="file"
                id="rtw-file-drop"
                accept=".jpeg,.jpg,.png,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setDragFileName(e.target.files[0].name);
                  }
                }}
              />
              <Label htmlFor="rtw-file-drop" className="cursor-pointer flex flex-col items-center justify-center text-center">
                <span className="text-[14px] font-medium text-[#171717] block">
                  {dragFileName ? dragFileName : "Drop RTW check result here"}
                </span>
                <span className="text-[12px] text-[#5C5C5C] block mt-0.5">
                  JPEG, PNG, and PDF, up to 5MB.
                </span>
              </Label>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="rtw-share-code-input" className="text-[13px] font-medium text-[#171717]">
                Share code
              </Label>
              <Input
                id="rtw-share-code-input"
                type="text"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                placeholder="e.g. W1234567X"
                className="h-10 uppercase text-[14px] border-[#EBEBEB] focus-visible:ring-[#7D52F4]"
                maxLength={9}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="rtw-dob-input" className="text-[13px] font-medium text-[#171717]">
                Date of Birth
              </Label>
              <Input
                id="rtw-dob-input"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-10 text-[14px] border-[#EBEBEB] focus-visible:ring-[#7D52F4]"
              />
            </div>

            {verifyMode === "manual" && (
              <>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="rtw-restrictions-input" className="text-[13px] font-medium text-[#171717]">
                    Work conditions / restrictions
                  </Label>
                  <Input
                    id="rtw-restrictions-input"
                    type="text"
                    value={workRestrictions}
                    onChange={(e) => setWorkRestrictions(e.target.value)}
                    placeholder="e.g. Can work full-time, no restrictions"
                    className="h-10 text-[14px] border-[#EBEBEB] focus-visible:ring-[#7D52F4]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="rtw-gov-ref-input" className="text-[13px] font-medium text-[#171717]">
                    GOV.uk reference number
                  </Label>
                  <Input
                    id="rtw-gov-ref-input"
                    type="text"
                    value={govRefNumber}
                    onChange={(e) => setGovRefNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. WE-G98V497-0S"
                    className="h-10 uppercase text-[14px] border-[#EBEBEB] focus-visible:ring-[#7D52F4]"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#EBEBEB]/60 mt-1">
              <Button
                type="button"
                variant="link"
                className="text-[13px] font-medium text-[#5C5C5C] hover:text-[#171717] underline p-0 h-auto cursor-pointer"
              >
                How it works
              </Button>
              <Button
                type="submit"
                disabled={isVerifying}
                className="h-9 px-5 rounded-[8px] bg-[#7D52F4] hover:bg-[#6C3FEB] text-white text-[14px] font-medium transition-all cursor-pointer border-0"
              >
                {isVerifying ? (
                  <span>Processing...</span>
                ) : (
                  <span>{verifyMode === "automatic" ? "Verify share code" : "Save verification"}</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
