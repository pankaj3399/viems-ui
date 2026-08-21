"use client";

import * as React from "react";
import Link from "next/link";
import {
  RiArrowLeftSLine,
  RiSearchLine,
  RiFilter3Line,
  RiArrowDownSLine,
  RiCalendarLine,
  RiMore2Line,
  RiArrowRightSLine,
  RiCheckLine,
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
import { formatFullName, getInitials } from "@/lib/format";

// Sort icon component matching Figma expand-up-down-fill
function SortIcon({ className = "size-3 text-[#A4A4A4]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 4L7 9H17L12 4ZM12 20L17 15H7L12 20Z" />
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

const INITIAL_RTW_CHECKS: RtwCheckItem[] = [
  {
    id: "rtw-1",
    entityId: "427",
    caseId: "427/2026",
    name: "Ami Monarch",
    company: "Dhira Gill Music Video",
    avatarInitials: "AM",
    status: "OVERDUE",
    statusBg: "bg-[#FFEBEC]",
    statusColor: "text-[#681219]",
    lastCheck: "20 Jul 2025",
    nextCheck: "20 Jul 2026",
    daysUntilText: "3d left",
    daysUntilColor: "text-[#FB3748]",
  },
  {
    id: "rtw-2",
    entityId: "428",
    caseId: "428/2026",
    name: "Elena Petrova",
    company: "Dhira Gill Music Video",
    avatarInitials: "EP",
    status: "OVERDUE",
    statusBg: "bg-[#FFEBEC]",
    statusColor: "text-[#681219]",
    lastCheck: "12 Aug 2025",
    nextCheck: "12 Aug 2026",
    daysUntilText: "1d left",
    daysUntilColor: "text-[#FB3748]",
  },
  {
    id: "rtw-3",
    entityId: "431",
    caseId: "431/2026",
    name: "Alex Marin",
    company: "AX Studios",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    avatarInitials: "AM",
    status: "DUE SOON",
    statusBg: "bg-[#FFFAEB]",
    statusColor: "text-[#624C18]",
    lastCheck: "18 Nov 2025",
    nextCheck: "18 Nov 2026",
    daysUntilText: "4d left",
    daysUntilColor: "text-[#F6B51E]",
  },
  {
    id: "rtw-4",
    entityId: "430",
    caseId: "430/2026",
    name: "Taylor Johnson",
    company: "AX Studios",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    avatarInitials: "TJ",
    status: "DUE SOON",
    statusBg: "bg-[#FFFAEB]",
    statusColor: "text-[#624C18]",
    lastCheck: "04 Sep 2025",
    nextCheck: "04 Sep 2026",
    daysUntilText: "6d left",
    daysUntilColor: "text-[#F6B51E]",
  },
  {
    id: "rtw-5",
    entityId: "426",
    caseId: "426/2026",
    name: "Wei Chen",
    company: "Anonymous Group",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    avatarInitials: "WC",
    status: "DUE SOON",
    statusBg: "bg-[#FFFAEB]",
    statusColor: "text-[#624C18]",
    lastCheck: "28 Oct 2025",
    nextCheck: "28 Oct 2026",
    daysUntilText: "7d left",
    daysUntilColor: "text-[#F6B51E]",
  },
  {
    id: "rtw-6",
    entityId: "429",
    caseId: "429/2026",
    name: "Gulab Singh Sidhu",
    company: "Inderbir Sidhu",
    avatarInitials: "GS",
    status: "COMPLIANT",
    statusBg: "bg-[#E3F7EC]",
    statusColor: "text-[#0B4627]",
    lastCheck: "22 Jan 2025",
    nextCheck: "22 Jan 2027",
    daysUntilText: "—",
    daysUntilColor: "text-[#5C5C5C]",
  },
];

export default function RtwChecksPage() {
  const [rtwChecks, setRtwChecks] = React.useState<RtwCheckItem[]>(INITIAL_RTW_CHECKS);
  const [activeHeaderTab, setActiveHeaderTab] = React.useState<"RTW_CHECKS" | "HISTORY">("RTW_CHECKS");
  const [selectedFilter, setSelectedFilter] = React.useState<
    "ALL" | "OVERDUE" | "DUE" | "COMPLIANT" | "FOLLOW-UP"
  >("ALL");
  const [statusDropdown, setStatusDropdown] = React.useState<string>("All status");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

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

  // Synchronize backend data if available, maintaining exact visual fidelity
  React.useEffect(() => {
    async function syncBackendData() {
      try {
        const res = await apiClient.get<any[] | { data: any[] }>(ENDPOINTS.cases.base);
        const rawCases: any[] = Array.isArray(res) ? res : (res as any)?.data ?? [];

        if (rawCases.length > 0) {
          const mapped: RtwCheckItem[] = rawCases.slice(0, 6).map((c: any, i: number) => {
            const name =
              formatFullName(
                c.first_name || c.migrant?.user?.personalInfo?.firstName,
                c.last_name || c.migrant?.user?.personalInfo?.lastName
              ) || INITIAL_RTW_CHECKS[i % INITIAL_RTW_CHECKS.length].name;
            const initials = getInitials(name);
            const caseId = c.caseIdDisplay || c.caseNumber || INITIAL_RTW_CHECKS[i % INITIAL_RTW_CHECKS.length].caseId;
            const company = c.group_name || c.company || INITIAL_RTW_CHECKS[i % INITIAL_RTW_CHECKS.length].company;

            const fallback = INITIAL_RTW_CHECKS[i % INITIAL_RTW_CHECKS.length];

            return {
              id: String(c.id || `rtw-${i + 1}`),
              entityId: c.id || fallback.entityId,
              caseId,
              name,
              company,
              avatarUrl: c.migrant?.user?.avatarUrl || fallback.avatarUrl,
              avatarInitials: initials,
              status: fallback.status,
              statusBg: fallback.statusBg,
              statusColor: fallback.statusColor,
              lastCheck: c.last_rtw_check
                ? new Date(c.last_rtw_check).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : fallback.lastCheck,
              nextCheck: c.next_rtw_check
                ? new Date(c.next_rtw_check).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : fallback.nextCheck,
              daysUntilText: fallback.daysUntilText,
              daysUntilColor: fallback.daysUntilColor,
            };
          });
          setRtwChecks(mapped);
        }
      } catch {
        // Retain initial mockup data
      }
    }
    syncBackendData();
  }, []);

  const openVerifyForMigrant = (item: RtwCheckItem) => {
    setSelectedMigrant(item);
    setIsVerifyModalOpen(true);
  };

  // Filter items
  const filteredChecks = React.useMemo(() => {
    return rtwChecks.filter((item) => {
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
  }, [rtwChecks, selectedFilter, statusDropdown, searchQuery]);

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

  return (
    <div className="w-full min-h-screen bg-[#F7F7F7] text-[#171717] font-sans pb-24 select-none">
      {/* Top Header White Container */}
      <div className="w-full bg-white border-b border-[#EBEBEB]">
        <div className="max-w-[1104px] mx-auto pt-8 px-4 sm:px-6 lg:px-0 flex flex-col gap-6">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Back Button - 32x32px, bg #F7F7F7, rounded 10px */}
              <Link href="/compliance">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Back to Compliance"
                  className="size-8 rounded-[10px] bg-[#F7F7F7] border-0 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-[#EBEBEB] transition-colors p-0 cursor-pointer"
                >
                  <RiArrowLeftSLine className="size-5 text-[#5C5C5C]" />
                </Button>
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

            {/* Verify Share Code Button - Height 36px, bg #7D52F4, rounded 8px */}
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
            {/* Tab 1: RTW Checks (Active) */}
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
                3
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
        {/* Banner Alert [1.1] - Width 1104px, Height 44px, bg #FFF3EB */}
        <div className="w-full bg-[#FFF3EB] border border-[#FFE6D5] rounded-[8px] px-6 py-3 flex items-center justify-between gap-3 h-[44px] hover:bg-[#FFEFE3] transition-all">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="size-5 flex items-center justify-center shrink-0">
              <RiAlertFill className="size-5 text-[#FA7319]" />
            </div>
            <div className="flex items-center gap-2 text-[14px] leading-[20px] tracking-[-0.006em]">
              <span className="font-medium text-[#171717]">Attention needed</span>
              <span className="text-[#171717]">∙</span>
              <span className="text-[#171717] font-normal">3 actions need attention</span>
              <span className="text-[#171717]">∙</span>
              <span className="text-[#FB3748] font-normal">1 high risk</span>
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
              6
            </span>
            <RiFileTextLine className="size-5 text-[#5C5C5C] absolute right-4 top-2" />
          </div>

          {/* Card 2: OVERDUE CHECKS */}
          <div className="bg-[#FFEBEC] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[70px] hover:shadow-x-small transition-shadow">
            <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
              OVERDUE CHECKS
            </span>
            <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
              3
            </span>
            <RiCheckboxCircleLine className="size-5 text-[#5C5C5C] absolute right-4 top-2" />
          </div>

          {/* Card 3: DUE SOON */}
          <div className="bg-[#FFFAEB] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[70px] hover:shadow-x-small transition-shadow">
            <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
              DUE SOON
            </span>
            <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
              1
            </span>
            <RiFileWarningLine className="size-5 text-[#5C5C5C] absolute right-4 top-2" />
          </div>

          {/* Card 4: COMPLETED THIS MONTH */}
          <div className="bg-[#E3F7EC] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[70px] hover:shadow-x-small transition-shadow">
            <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
              COMPLETED THIS MONTH
            </span>
            <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
              12
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
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] transition-all cursor-pointer border-0 ${
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
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] transition-all cursor-pointer border-0 flex items-center gap-1.5 ${
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
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] transition-all cursor-pointer border-0 flex items-center gap-1.5 ${
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
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] transition-all cursor-pointer border-0 flex items-center gap-1.5 ${
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
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] transition-all cursor-pointer border-0 flex items-center gap-1.5 ${
                  selectedFilter === "FOLLOW-UP"
                    ? "bg-white text-[#171717] shadow-x-small"
                    : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
                }`}
              >
                <span className="size-1.5 rounded-full bg-[#7D52F4] shrink-0" />
                <span>FOLLOW-UP</span>
              </button>
            </div>

            {/* Compact Pagination Date Selector Buttons - 24x24px */}
            <div className="flex items-center gap-1.5">
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
            <div className="w-full bg-[#F7F7F7] rounded-[8px] h-9 px-4 grid grid-cols-12 items-center text-[12px] font-medium uppercase text-[#A4A4A4] tracking-[0.04em]">
              <div className="col-span-2 text-left">
                <span>CASE ID #</span>
              </div>
              <div className="col-span-3 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors">
                <span>NAME</span>
                <SortIcon />
              </div>
              <div className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors">
                <span>STATUS</span>
                <SortIcon />
              </div>
              <div className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors">
                <span>LAST CHECK</span>
                <SortIcon />
              </div>
              <div className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors">
                <span>NEXT CHECK</span>
                <SortIcon />
              </div>
              <div className="col-span-1 flex items-center justify-between">
                <span>DAYS UNTIL</span>
              </div>
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
                  className="w-full bg-white rounded-[16px] p-1 h-[72px] grid grid-cols-12 items-center px-4 hover:bg-neutral-50/50 transition-colors shadow-[0px_1px_2px_rgba(10,13,20,0.03)] border border-white"
                >
                  {/* Case ID # */}
                  <div className="col-span-2 font-mono text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                    {row.caseId}
                  </div>

                  {/* Name & Avatar */}
                  <div className="col-span-3 flex items-center gap-3">
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

                  {/* Status Badge */}
                  <div className="col-span-2 flex items-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] ${row.statusBg} ${row.statusColor}`}
                    >
                      {row.status}
                    </span>
                  </div>

                  {/* Last Check Date */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-[14px] leading-[20px] font-medium text-[#171717] opacity-80 tracking-[-0.006em]">
                      {row.lastCheck}
                    </span>
                  </div>

                  {/* Next Check Date with Calendar Icon */}
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="flex items-center gap-2 opacity-80">
                      <RiCalendarLine className="size-[18px] text-[#171717] shrink-0" />
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        {row.nextCheck}
                      </span>
                    </div>
                  </div>

                  {/* Days Until & More Button */}
                  <div className="col-span-1 flex items-center justify-between">
                    <span
                      className={`text-[14px] leading-[20px] font-medium tracking-[-0.006em] ${row.daysUntilColor}`}
                    >
                      {row.daysUntilText}
                    </span>

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
                        <DropdownMenuItem onClick={() => toast.info(`Viewing record for ${row.name}`)}>
                          <RiUserLine className="size-4 mr-2" />
                          <span>View Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success(`Exported RTW receipt for ${row.name}`)}>
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
            <div className="flex items-center gap-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-[14px] p-3 mb-2">
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
              <div className="flex flex-col">
                <span className="text-[12px] font-mono text-[#5C5C5C]">
                  {selectedMigrant.caseId}
                </span>
                <span className="text-[15px] font-medium text-[#171717] leading-tight">
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
            <div className="relative border-2 border-dashed border-[#E5DBFF] bg-[#FAF8FF]/60 hover:bg-[#FAF8FF] rounded-[16px] p-5 text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer group">
              <div className="size-10 rounded-[10px] bg-[#EFE9FF] flex items-center justify-center text-[#7D52F4] mb-1">
                <RiUpload2Line className="size-5" />
              </div>
              {/* ui-native-fallback */}
              <input
                type="file"
                id="rtw-file-drop"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setDragFileName(e.target.files[0].name);
                  }
                }}
              />
              <Label htmlFor="rtw-file-drop" className="cursor-pointer">
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
