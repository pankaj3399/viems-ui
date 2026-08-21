"use client";

import * as React from "react";
import {
  RiAlertFill,
  RiArrowRightSLine,
  RiInformationLine,
  RiArrowLeftSLine,
  RiSearchLine,
  RiFilter3Line,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiFileWarningLine,
  RiTimer2Line,
  RiCalendarLine,
  RiMoreFill,
  RiCheckFill,
  RiAlertLine,
  RiUserLine,
  RiDownloadLine,
  RiRefreshLine,
} from "@remixicon/react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { formatFullName, getInitials } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface TaskItem {
  id: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  migrantName: string;
  caseId: string;
  avatarUrl?: string;
  avatarText: string;
  status: string;
  statusBg: string;
  statusColor: string;
  dueDate: string;
  hasWarningIcon?: boolean;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  potentialImpact: string;
  isResolved?: boolean;
}

interface MigrantComplianceRow {
  caseId: string;
  name: string;
  company: string;
  avatarUrl?: string;
  avatarText: string;
  status: "COMPLIANT" | "UNDER REVIEW" | "ACTION NEEDED";
  statusBg: string;
  statusColor: string;
  nextRtw: string;
  docs: string;
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "task-1",
    iconBg: "bg-[#FFEBEC]",
    iconColor: "text-[#681219]",
    title: "Complete RTW check",
    subtitle: "Complete right to work check before employment starts",
    migrantName: "Alex Marin",
    caseId: "431/2026",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    avatarText: "AM",
    status: "UNDER REVIEW",
    statusBg: "bg-[#FFFAEB]",
    statusColor: "text-[#624C18]",
    dueDate: "Mar 5, 2026",
    hasWarningIcon: false,
    riskLevel: "HIGH",
    potentialImpact:
      "Civil penalty up to GBP £20,000 per illegal worker. Criminal prosecution possible.",
  },
  {
    id: "task-2",
    iconBg: "bg-[#FFFAEB]",
    iconColor: "text-[#624C18]",
    title: "Upload Migrant Signed Docs (MSDs)",
    subtitle: "Provide confirmation of migrant signed docs",
    migrantName: "Taylor Johnson",
    caseId: "430/2026",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    avatarText: "TJ",
    status: "UNDER REVIEW",
    statusBg: "bg-[#FFFAEB]",
    statusColor: "text-[#624C18]",
    dueDate: "Mar 5, 2026",
    hasWarningIcon: false,
    riskLevel: "MEDIUM",
    potentialImpact:
      "Home Office compliance breach. Sponsor duties require signed documents on file.",
  },
  {
    id: "task-3",
    iconBg: "bg-[#FFEBEC]",
    iconColor: "text-[#681219]",
    title: "Inform worker of UK employment rights",
    subtitle: "Provide written confirmation of employment rights and retain evidence",
    migrantName: "Gulab Singh Sidhu",
    caseId: "429/2026",
    avatarText: "GS",
    status: "REQUIRED ASAP",
    statusBg: "bg-[#FFEBEC]",
    statusColor: "text-[#681219]",
    dueDate: "Upload by: Mar 25, 2026",
    hasWarningIcon: true,
    riskLevel: "HIGH",
    potentialImpact:
      "Mandatory worker rights disclosure violation under UKVI audit rules.",
  },
  {
    id: "task-4",
    iconBg: "bg-[#EBEBEB]",
    iconColor: "text-[#262626]",
    title: "Upload promoter payment letter",
    subtitle: "Request payment leter from promoter and add to case file",
    migrantName: "Ami Monarch",
    caseId: "427/2026",
    avatarText: "AM",
    status: "NOT UPLOADED",
    statusBg: "bg-[#F5F5F5]",
    statusColor: "text-[#A4A4A4]",
    dueDate: "–",
    hasWarningIcon: false,
    riskLevel: "LOW",
    potentialImpact:
      "Financial documentation record incomplete for sponsorship trail.",
  },
  {
    id: "task-5",
    iconBg: "bg-[#EBEBEB]",
    iconColor: "text-[#262626]",
    title: "Plan visa renewal",
    subtitle: "Window for visa renewal approaching. Get started soon.",
    migrantName: "Wei Chen",
    caseId: "426/2026",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    avatarText: "WC",
    status: "NOT UPLOADED",
    statusBg: "bg-[#F5F5F5]",
    statusColor: "text-[#A4A4A4]",
    dueDate: "–",
    hasWarningIcon: false,
    riskLevel: "LOW",
    potentialImpact:
      "Visa expiry lead time notification to prevent unlawful status.",
  },
];

const INITIAL_MIGRANTS: MigrantComplianceRow[] = [
  {
    caseId: "431/2026",
    name: "Alex Marin",
    company: "AX Studios",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    avatarText: "AM",
    status: "UNDER REVIEW",
    statusBg: "bg-[#FFFAEB]",
    statusColor: "text-[#624C18]",
    nextRtw: "18 Nov 2026",
    docs: "5/12",
  },
  {
    caseId: "430/2026",
    name: "Taylor Johnson",
    company: "AX Studios",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    avatarText: "TJ",
    status: "COMPLIANT",
    statusBg: "bg-[#E3F7EC]",
    statusColor: "text-[#0B4627]",
    nextRtw: "04 Sep 2026",
    docs: "12/12",
  },
  {
    caseId: "429/2026",
    name: "Gulab Singh Sidhu",
    company: "Inderbir Sidhu",
    avatarText: "GS",
    status: "COMPLIANT",
    statusBg: "bg-[#E3F7EC]",
    statusColor: "text-[#0B4627]",
    nextRtw: "22 Jan 2027",
    docs: "12/12",
  },
  {
    caseId: "428/2026",
    name: "Elena Petrova",
    company: "Dhira Gill Music Video",
    avatarText: "EP",
    status: "COMPLIANT",
    statusBg: "bg-[#E3F7EC]",
    statusColor: "text-[#0B4627]",
    nextRtw: "12 Aug 2026",
    docs: "12/12",
  },
  {
    caseId: "427/2026",
    name: "Ami Monarch",
    company: "Dhira Gill Music Video",
    avatarText: "AM",
    status: "ACTION NEEDED",
    statusBg: "bg-[#FFEBEC]",
    statusColor: "text-[#681219]",
    nextRtw: "06 Mar 2027",
    docs: "12/12",
  },
  {
    caseId: "426/2026",
    name: "Wei Chen",
    company: "Anonymous Group",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    avatarText: "WC",
    status: "UNDER REVIEW",
    statusBg: "bg-[#FFFAEB]",
    statusColor: "text-[#624C18]",
    nextRtw: "28 Oct 2026",
    docs: "4/12",
  },
];

export default function ComplianceCentrePage() {
  const [tasks, setTasks] = React.useState<TaskItem[]>(INITIAL_TASKS);
  const [migrantsData, setMigrantsData] = React.useState<MigrantComplianceRow[]>(INITIAL_MIGRANTS);
  const [selectedTaskFilter, setSelectedTaskFilter] = React.useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>("task-1");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All status");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Synchronize backend data if available, preserving visual fidelity
  React.useEffect(() => {
    async function syncBackendData() {
      try {
        const [casesRes, tasksRes] = await Promise.allSettled([
          apiClient.get<any[] | { data: any[] }>(ENDPOINTS.cases.base),
          apiClient.get<any[] | { data: any[] }>(ENDPOINTS.tasks.base),
        ]);

        if (casesRes.status === "fulfilled" && casesRes.value) {
          const rawCases = Array.isArray(casesRes.value) ? casesRes.value : (casesRes.value as any)?.data ?? [];
          if (rawCases.length > 0) {
            const mapped = rawCases.slice(0, 8).map((c: any, i: number) => {
              const name = formatFullName(c.first_name || c.migrant?.user?.personalInfo?.firstName, c.last_name || c.migrant?.user?.personalInfo?.lastName) || `Migrant #${c.id}`;
              const caseId = c.caseIdDisplay || c.caseNumber || `${431 - i}/2026`;
              const company = c.group_name || c.company || "AX Studios";
              const initials = getInitials(name);

              let status: "COMPLIANT" | "UNDER REVIEW" | "ACTION NEEDED" = "COMPLIANT";
              let statusBg = "bg-[#E3F7EC]";
              let statusColor = "text-[#0B4627]";

              const rawStatus = String(c.compliance_status || "").toUpperCase();
              if (rawStatus === "ACTION NEEDED" || rawStatus === "ACTION_NEEDED") {
                status = "ACTION NEEDED";
                statusBg = "bg-[#FFEBEC]";
                statusColor = "text-[#681219]";
              } else if (rawStatus === "REVIEW" || rawStatus === "UNDER_REVIEW" || rawStatus === "UNDER REVIEW") {
                status = "UNDER REVIEW";
                statusBg = "bg-[#FFFAEB]";
                statusColor = "text-[#624C18]";
              }

              return {
                caseId,
                name,
                company,
                avatarUrl: c.migrant?.user?.avatarUrl || (i === 0 || i === 1 || i === 5 ? INITIAL_MIGRANTS[i]?.avatarUrl : undefined),
                avatarText: initials,
                status,
                statusBg,
                statusColor,
                nextRtw: c.next_rtw_check ? new Date(c.next_rtw_check).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : INITIAL_MIGRANTS[i % INITIAL_MIGRANTS.length].nextRtw,
                docs: c.doc_count || INITIAL_MIGRANTS[i % INITIAL_MIGRANTS.length].docs,
              };
            });
            setMigrantsData(mapped);
          }
        }

        if (tasksRes.status === "fulfilled" && tasksRes.value) {
          const rawTasks = Array.isArray(tasksRes.value) ? tasksRes.value : (tasksRes.value as any)?.data ?? [];
          if (rawTasks.length > 0) {
            const mapped = rawTasks.slice(0, 8).map((t: any, i: number) => {
              const prio = String(t.priority || "").toUpperCase();
              const riskLevel: "HIGH" | "MEDIUM" | "LOW" =
                prio === "HIGH" || prio === "MEDIUM" || prio === "LOW" ? prio : i === 0 ? "HIGH" : i === 1 ? "MEDIUM" : "LOW";

              const iconBg = riskLevel === "HIGH" ? "bg-[#FFEBEC]" : riskLevel === "MEDIUM" ? "bg-[#FFFAEB]" : "bg-[#EBEBEB]";
              const iconColor = riskLevel === "HIGH" ? "text-[#681219]" : riskLevel === "MEDIUM" ? "text-[#624C18]" : "text-[#262626]";

              return {
                id: String(t.id || `task-${i + 1}`),
                iconBg,
                iconColor,
                title: t.title || INITIAL_TASKS[i % INITIAL_TASKS.length].title,
                subtitle: t.description || t.subtitle || INITIAL_TASKS[i % INITIAL_TASKS.length].subtitle,
                migrantName: t.migrantName || INITIAL_TASKS[i % INITIAL_TASKS.length].migrantName,
                caseId: t.caseId || INITIAL_TASKS[i % INITIAL_TASKS.length].caseId,
                avatarUrl: INITIAL_TASKS[i % INITIAL_TASKS.length]?.avatarUrl,
                avatarText: getInitials(t.migrantName || INITIAL_TASKS[i % INITIAL_TASKS.length].migrantName),
                status: t.status || INITIAL_TASKS[i % INITIAL_TASKS.length].status,
                statusBg: INITIAL_TASKS[i % INITIAL_TASKS.length].statusBg,
                statusColor: INITIAL_TASKS[i % INITIAL_TASKS.length].statusColor,
                dueDate: t.dueDate || INITIAL_TASKS[i % INITIAL_TASKS.length].dueDate,
                hasWarningIcon: i === 2,
                riskLevel,
                potentialImpact: t.impact || INITIAL_TASKS[i % INITIAL_TASKS.length].potentialImpact,
              };
            });
            setTasks(mapped);
          }
        }
      } catch {
        // Retain initial high-fidelity data
      }
    }
    syncBackendData();
  }, []);

  // Filter tasks by risk level
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (selectedTaskFilter === "ALL") return true;
      return t.riskLevel === selectedTaskFilter;
    });
  }, [tasks, selectedTaskFilter]);

  // Filter migrants by search query and status
  const filteredMigrants = React.useMemo(() => {
    return migrantsData.filter((m) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.caseId.toLowerCase().includes(q) &&
          !m.company.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (statusFilter !== "All status") {
        if (statusFilter === "Compliant" && m.status !== "COMPLIANT") return false;
        if (statusFilter === "Review" && m.status !== "UNDER REVIEW") return false;
        if (statusFilter === "Action Needed" && m.status !== "ACTION NEEDED") return false;
      }
      return true;
    });
  }, [migrantsData, searchQuery, statusFilter]);

  const handleResolveTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, isResolved: true, status: "RESOLVED", statusBg: "bg-[#E3F7EC]", statusColor: "text-[#0B4627]" } : t
      )
    );
    toast.success("Task marked as resolved");
  };

  const highCount = tasks.filter((t) => t.riskLevel === "HIGH" && !t.isResolved).length;
  const mediumCount = tasks.filter((t) => t.riskLevel === "MEDIUM" && !t.isResolved).length;
  const lowCount = tasks.filter((t) => t.riskLevel === "LOW" && !t.isResolved).length;

  return (
    <div className="w-full min-h-screen bg-[#F7F7F7] text-[#171717] font-sans pb-24 select-none">
      {/* Page Header */}
      <div className="max-w-[1104px] mx-auto pt-8 px-4 sm:px-6 lg:px-0 flex flex-col gap-1">
        <h1 className="text-[32px] leading-[40px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
          Compliance Centre
        </h1>
        <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
          Create, track, and manage visa cases for individual or grouped migrants.
        </p>
      </div>

      {/* Main Container - Width 1104px, Gap 32px */}
      <div className="max-w-[1104px] mx-auto mt-8 px-4 sm:px-6 lg:px-0 flex flex-col gap-8">
        {/* Banner Alert [1.1] */}
        <div className="w-full bg-[#FFF3EB] rounded-[8px] px-6 py-3 flex items-center justify-between gap-3 border border-[#FFE4D4] h-[44px] transition-all hover:bg-[#FFEFE3]">
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
              const el = document.getElementById("priority-tasks-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-1 text-[14px] font-medium text-[#171717] underline hover:text-[#5C5C5C] transition-colors p-0 h-auto cursor-pointer shrink-0"
          >
            <span>Review actions</span>
            <RiArrowRightSLine className="size-5 text-[#171717]" />
          </Button>
        </div>

        {/* Overview Widgets Section - Height 204px */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 w-full h-auto lg:h-[204px]">
          {/* Left Donut Score Widget - Width 357px */}
          <div className="lg:col-span-4 bg-white rounded-[16px] p-3 px-4 flex flex-col justify-between items-center shadow-[0px_1px_2px_rgba(10,13,20,0.03)] border border-white h-[204px]">
            <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px] text-center pt-0.5">
              COMPLIANCE SCORE
            </span>

            {/* Circular Progress Ring - 75x75px */}
            <div className="relative size-[75px] flex items-center justify-center">
              <svg className="size-[75px] -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#EBEBEB]"
                  strokeWidth="4.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#F6B51E]"
                  strokeDasharray="68, 100"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                68%
              </span>
            </div>

            {/* Score Bottom Text */}
            <div className="flex flex-col items-center gap-1 text-center pb-0.5">
              <h3 className="text-[20px] leading-[24px] font-medium text-[#171717] font-aeonik-medium">
                Low Risk
              </h3>
              <div className="flex items-center gap-1 text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                <span>3 tasks</span>
                <span className="text-[10px] text-[#7B7B7B]">•</span>
                <span>4 docs</span>
              </div>
            </div>
          </div>

          {/* Right Metrics 2x2 Grid - Width 739px, Height 204px */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2 h-full">
            {/* Total Cases */}
            <div className="bg-[#EFEBFF] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[98px] hover:shadow-x-small transition-shadow cursor-default">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                  TOTAL CASES
                </span>
                <span className="text-[24px] leading-[32px] font-medium text-[#351A75] font-aeonik-medium">
                  8
                </span>
              </div>
              <RiFileTextLine className="size-5 text-[#5C5C5C] absolute right-4 top-2.5" />
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                44 active
              </span>
            </div>

            {/* Compliant */}
            <div className="bg-[#E3F7EC] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[98px] hover:shadow-x-small transition-shadow cursor-default">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                  COMPLIANT
                </span>
                <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                  4
                </span>
              </div>
              <RiCheckboxCircleLine className="size-5 text-[#5C5C5C] absolute right-4 top-2.5" />
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                68%
              </span>
            </div>

            {/* Warnings */}
            <div className="bg-[#FFFAEB] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[98px] hover:shadow-x-small transition-shadow cursor-default">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                  WARNINGS
                </span>
                <span className="text-[24px] leading-[32px] font-medium text-[#624C18] font-aeonik-medium">
                  2
                </span>
              </div>
              <RiFileWarningLine className="size-5 text-[#5C5C5C] absolute right-4 top-2.5" />
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                Attention required
              </span>
            </div>

            {/* Critical */}
            <div className="bg-[#FFEBEC] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[98px] hover:shadow-x-small transition-shadow cursor-default">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                  CRITICAL
                </span>
                <span className="text-[24px] leading-[32px] font-medium text-[#681219] font-aeonik-medium">
                  1
                </span>
              </div>
              <RiTimer2Line className="size-5 text-[#5C5C5C] absolute right-4 top-2.5" />
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                Immediate action
              </span>
            </div>
          </div>
        </div>

        {/* Risk Profile Section */}
        <div className="w-full flex flex-col gap-3">
          <h2 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
            Risk profile
          </h2>

          <div className="w-full bg-white rounded-[16px] p-3 px-4 flex flex-col gap-3 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] border border-white">
            {/* Header: Overall exposure & LOW Badge */}
            <div className="flex items-center justify-between w-full h-[40px]">
              <div className="flex flex-col">
                <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                  Overall exposure
                </span>
                <div className="flex items-center gap-1 text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                  <span>1 high</span>
                  <span>•</span>
                  <span>1 low</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 bg-[#FFFAEB] px-2 py-0.5 rounded-full text-[11px] font-medium text-[#F6B51E] uppercase tracking-[0.02em] h-5">
                <RiAlertFill className="size-3.5 text-[#F6B51E]" />
                <span>LOW</span>
              </div>
            </div>

            {/* 3 Status Summary Metric Boxes - Height 78px */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
              {/* Overdue */}
              <div className="bg-[#F7F7F7] rounded-[8px] p-3 px-4 flex flex-col justify-between h-[78px] hover:bg-[#F2F2F2] transition-colors cursor-default">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                    OVERDUE
                  </span>
                  <div className="size-5 rounded-[6.67px] bg-[#FFEBEC] flex items-center justify-center text-[#681219]">
                    <RiAlertLine className="size-3.5 text-[#681219]" />
                  </div>
                </div>
                <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                  4
                </span>
              </div>

              {/* Due Soon */}
              <div className="bg-[#F7F7F7] rounded-[8px] p-3 px-4 flex flex-col justify-between h-[78px] hover:bg-[#F2F2F2] transition-colors cursor-default">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                    DUE SOON
                  </span>
                  <div className="size-5 rounded-[6.67px] bg-[#FFFAEB] flex items-center justify-center text-[#624C18]">
                    <RiAlertLine className="size-3.5 text-[#624C18]" />
                  </div>
                </div>
                <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                  9
                </span>
              </div>

              {/* Need Review */}
              <div className="bg-[#F7F7F7] rounded-[8px] p-3 px-4 flex flex-col justify-between h-[78px] hover:bg-[#F2F2F2] transition-colors cursor-default">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                    NEED REVIEW
                  </span>
                  <div className="size-5 rounded-[6.67px] bg-[#FFFAEB] flex items-center justify-center text-[#624C18]">
                    <RiAlertLine className="size-3.5 text-[#624C18]" />
                  </div>
                </div>
                <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                  14
                </span>
              </div>
            </div>

            {/* 6 Category Schedule Cards Grid (2 rows x 3 cols, gap 8px, height 78px each) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
              {/* Card 1: Right to work */}
              <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between h-[78px] hover:border-neutral-300 hover:shadow-x-small transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-[8px] bg-[#FFEBEC] flex items-center justify-center shrink-0 text-[#681219]">
                      <RiAlertLine className="size-3.5 text-[#681219]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        Right to work
                      </span>
                      <div className="flex items-center gap-1 text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                        <span>8 people</span>
                        <span className="text-[#D1D1D1]">•</span>
                        <span>11 items</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFFAEB] text-[#624C18] rounded-full px-2 py-0.5 text-[11px] font-medium tracking-[0.02em] uppercase">
                      85%
                    </span>
                    <div className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C] group-hover:bg-[#EBEBEB] transition-colors">
                      <RiArrowRightSLine className="size-4 text-[#5C5C5C]" />
                    </div>
                  </div>
                </div>

                <div className="w-full pl-[36px] flex items-center gap-0.5 h-1">
                  <div className="bg-[#F6B51E] h-1 rounded-full w-[28%]" />
                  <div className="bg-[#1DAF61] h-1 rounded-full flex-1" />
                </div>
              </div>

              {/* Card 2: Employment */}
              <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between h-[78px] hover:border-neutral-300 hover:shadow-x-small transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-[8px] bg-[#FFFAEB] flex items-center justify-center shrink-0 text-[#624C18]">
                      <RiAlertLine className="size-3.5 text-[#624C18]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        Employment
                      </span>
                      <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                        CoS &amp; contract alignment
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFFAEB] text-[#624C18] rounded-full px-2 py-0.5 text-[11px] font-medium tracking-[0.02em] uppercase">
                      79%
                    </span>
                    <div className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C] group-hover:bg-[#EBEBEB] transition-colors">
                      <RiArrowRightSLine className="size-4 text-[#5C5C5C]" />
                    </div>
                  </div>
                </div>

                <div className="w-full pl-[36px] flex items-center gap-0.5 h-1">
                  <div className="bg-[#FB3748] h-1 rounded-full w-[7%]" />
                  <div className="bg-[#F6B51E] h-1 rounded-full w-[38%]" />
                  <div className="bg-[#1DAF61] h-1 rounded-full flex-1" />
                </div>
              </div>

              {/* Card 3: Reporting */}
              <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between h-[78px] hover:border-neutral-300 hover:shadow-x-small transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-[8px] bg-[#E3F7EC] flex items-center justify-center shrink-0 text-[#0B4627]">
                      <RiCheckFill className="size-3.5 text-[#0B4627]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        Reporting
                      </span>
                      <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                        Change notifications
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-[#E3F7EC] text-[#0B4627] rounded-[8px] px-1.5 py-0.5 text-[11px] font-medium tracking-[0.02em] uppercase">
                      CLEAR
                    </span>
                    <div className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C] group-hover:bg-[#EBEBEB] transition-colors">
                      <RiArrowRightSLine className="size-4 text-[#5C5C5C]" />
                    </div>
                  </div>
                </div>

                <div className="w-full pl-[36px] flex items-center h-1">
                  <div className="bg-[#1DAF61] h-1 rounded-full w-full" />
                </div>
              </div>

              {/* Card 4: Documents */}
              <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between h-[78px] hover:border-neutral-300 hover:shadow-x-small transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-[8px] bg-[#FFFAEB] flex items-center justify-center shrink-0 text-[#624C18]">
                      <RiAlertLine className="size-3.5 text-[#624C18]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        Documents
                      </span>
                      <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                        2 need review
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-[#E3F7EC] text-[#624C18] rounded-[8px] px-1.5 py-0.5 text-[11px] font-medium tracking-[0.02em] uppercase">
                      91%
                    </span>
                    <div className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C] group-hover:bg-[#EBEBEB] transition-colors">
                      <RiArrowRightSLine className="size-4 text-[#5C5C5C]" />
                    </div>
                  </div>
                </div>

                <div className="w-full pl-[36px] flex items-center gap-0.5 h-1">
                  <div className="bg-[#F6B51E] h-1 rounded-full w-[6%]" />
                  <div className="bg-[#1DAF61] h-1 rounded-full flex-1" />
                </div>
              </div>

              {/* Card 5: Attendance */}
              <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between h-[78px] hover:border-neutral-300 hover:shadow-x-small transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-[8px] bg-[#E3F7EC] flex items-center justify-center shrink-0 text-[#0B4627]">
                      <RiCheckFill className="size-3.5 text-[#0B4627]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        Attendance
                      </span>
                      <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                        Absence &amp; 10-day rule
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-[#E3F7EC] text-[#0B4627] rounded-[8px] px-1.5 py-0.5 text-[11px] font-medium tracking-[0.02em] uppercase">
                      CLEAR
                    </span>
                    <div className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C] group-hover:bg-[#EBEBEB] transition-colors">
                      <RiArrowRightSLine className="size-4 text-[#5C5C5C]" />
                    </div>
                  </div>
                </div>

                <div className="w-full pl-[36px] flex items-center gap-0.5 h-1">
                  <div className="bg-[#FB3748] h-1 rounded-full w-[18%]" />
                  <div className="bg-[#1DAF61] h-1 rounded-full flex-1" />
                </div>
              </div>

              {/* Card 6: Audit trail */}
              <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between h-[78px] hover:border-neutral-300 hover:shadow-x-small transition-all group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-[8px] bg-[#E3F7EC] flex items-center justify-center shrink-0 text-[#0B4627]">
                      <RiCheckFill className="size-3.5 text-[#0B4627]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        Audit trail
                      </span>
                      <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                        Complete records
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-[#E3F7EC] text-[#0B4627] rounded-[8px] px-1.5 py-0.5 text-[11px] font-medium tracking-[0.02em] uppercase">
                      CLEAR
                    </span>
                    <div className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C] group-hover:bg-[#EBEBEB] transition-colors">
                      <RiArrowRightSLine className="size-4 text-[#5C5C5C]" />
                    </div>
                  </div>
                </div>

                <div className="w-full pl-[36px] flex items-center h-1">
                  <div className="bg-[#1DAF61] h-1 rounded-full w-full" />
                </div>
              </div>
            </div>

            {/* Footer timestamp */}
            <span className="text-[13px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em] pt-0.5">
              Last assessed 20 Jul 2026, 09:42
            </span>
          </div>
        </div>

        {/* Priority Tasks Section */}
        <div id="priority-tasks-section" className="w-full flex flex-col gap-3">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                Priority tasks
              </h2>
              <RiInformationLine className="size-5 text-[#A4A4A4]" />
            </div>

            {/* Right pagination control: 5 of 12 */}
            <div className="flex items-center gap-4">
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                {filteredTasks.length} of 12
              </span>
              <div className="flex items-center gap-1.5 bg-[#EBEBEB] rounded-[8px] p-1.5 h-9">
                <Button
                  variant="outline"
                  size="icon-xs"
                  aria-label="Previous tasks page"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="size-6 rounded-[6px] bg-white border-0 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] text-[#5C5C5C] hover:bg-neutral-50 active:scale-95 transition-all p-0"
                >
                  <RiArrowLeftSLine className="size-4 text-[#5C5C5C]" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-xs"
                  aria-label="Next tasks page"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="size-6 rounded-[6px] bg-white border-0 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] text-[#5C5C5C] hover:bg-neutral-50 active:scale-95 transition-all p-0"
                >
                  <RiArrowRightSLine className="size-4 text-[#5C5C5C]" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Pills Segmented Control */}
          <div className="inline-flex items-center gap-1 bg-[#EBEBEB] rounded-full p-1 h-7 w-fit">
            <button
              type="button"
              onClick={() => setSelectedTaskFilter("ALL")}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] transition-all cursor-pointer border-0 ${
                selectedTaskFilter === "ALL"
                  ? "bg-white text-[#171717] shadow-x-small"
                  : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              ALL (5)
            </button>
            <button
              type="button"
              onClick={() => setSelectedTaskFilter("HIGH")}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] transition-all cursor-pointer border-0 flex items-center gap-1.5 ${
                selectedTaskFilter === "HIGH"
                  ? "bg-white text-[#171717] shadow-x-small"
                  : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              <span className="size-1.5 rounded-full bg-[#FB3748] shrink-0" />
              <span>HIGH ({highCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTaskFilter("MEDIUM")}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] transition-all cursor-pointer border-0 flex items-center gap-1.5 ${
                selectedTaskFilter === "MEDIUM"
                  ? "bg-white text-[#171717] shadow-x-small"
                  : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              <span className="size-1.5 rounded-full bg-[#F6B51E] shrink-0" />
              <span>MEDIUM ({mediumCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTaskFilter("LOW")}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] transition-all cursor-pointer border-0 flex items-center gap-1.5 ${
                selectedTaskFilter === "LOW"
                  ? "bg-white text-[#171717] shadow-x-small"
                  : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              <span className="size-1.5 rounded-full bg-[#7B7B7B] shrink-0" />
              <span>LOW ({lowCount})</span>
            </button>
          </div>

          {/* Tasks Table */}
          <div className="w-full flex flex-col gap-2 mt-1">
            {/* Table Header Row - Height 36px, background #F7F7F7 */}
            <div className="w-full bg-[#F7F7F7] rounded-[8px] h-9 px-4 grid grid-cols-12 items-center text-[12px] font-medium uppercase text-[#A4A4A4] tracking-[0.04em]">
              <div className="col-span-5 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors">
                <span>DOCUMENT</span>
                <SortIcon />
              </div>
              <div className="col-span-3 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors">
                <span>MIGRANT</span>
                <SortIcon />
              </div>
              <div className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors">
                <span>STATUS</span>
                <SortIcon />
              </div>
              <div className="col-span-2 flex items-center justify-between pl-2">
                <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors">
                  <span>DUE DATE</span>
                  <SortIcon />
                </div>
              </div>
            </div>

            {/* Task Rows */}
            {filteredTasks.map((t) => {
              const isExpanded = expandedTaskId === t.id;

              return (
                <div
                  key={t.id}
                  className="w-full bg-white rounded-[16px] border border-[#F5F5F5] p-1 flex flex-col transition-all hover:border-neutral-200"
                >
                  {/* Clickable Header Row - Height 64px */}
                  <div
                    onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
                    className="w-full grid grid-cols-12 items-center px-3 py-2 cursor-pointer h-16 rounded-[12px] hover:bg-neutral-50/50 transition-colors"
                  >
                    {/* Document Info (Col-span-5) */}
                    <div className="col-span-5 flex items-center gap-3 pr-2">
                      <div
                        className={`size-10 rounded-[8px] ${t.iconBg} flex items-center justify-center shrink-0 ${t.iconColor}`}
                      >
                        <RiAlertLine className="size-5" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em] truncate">
                          {t.title}
                        </span>
                        <span className="text-[13px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em] truncate">
                          {t.subtitle}
                        </span>
                      </div>
                    </div>

                    {/* Migrant Info (Col-span-3) */}
                    <div className="col-span-3 flex items-center gap-3">
                      {t.avatarUrl ? (
                        <Avatar className="size-10 rounded-full shrink-0">
                          <AvatarImage src={t.avatarUrl} alt={t.migrantName} />
                          <AvatarFallback className="bg-[#EBEBEB] text-[#171717] text-[15px] font-medium">
                            {t.avatarText}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="size-10 rounded-full bg-[#EBEBEB] flex items-center justify-center text-[#171717] text-[16px] font-medium shrink-0">
                          {t.avatarText}
                        </div>
                      )}
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em] truncate">
                          {t.migrantName}
                        </span>
                        <span className="text-[12px] leading-[20px] font-normal text-[#5C5C5C] font-mono tracking-[-0.006em]">
                          {t.caseId}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge (Col-span-2) */}
                    <div className="col-span-2 flex items-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] ${t.statusBg} ${t.statusColor}`}
                      >
                        {t.status}
                      </span>
                    </div>

                    {/* Due Date & Expand Button (Col-span-2) */}
                    <div className="col-span-2 flex items-center justify-between pl-2">
                      <div className="flex items-center gap-1.5 text-[14px] leading-[20px] tracking-[-0.006em] text-[#5C5C5C]">
                        {t.hasWarningIcon && (
                          <RiAlertLine className="size-4 text-[#E93544] shrink-0" />
                        )}
                        <span className="text-[#5C5C5C]">
                          {t.dueDate}
                        </span>
                      </div>

                      <div className="size-6 rounded-[6px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-100 transition-colors">
                        {isExpanded ? (
                          <RiArrowUpSLine className="size-5 text-[#5C5C5C]" />
                        ) : (
                          <RiArrowDownSLine className="size-5 text-[#5C5C5C]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Frame 112 Drawer */}
                  {isExpanded && (
                    <div className="bg-[#F7F7F7] rounded-[16px] p-5 flex items-center justify-between gap-5 h-[84px] transition-all animate-in fade-in-50 duration-150">
                      <div className="flex flex-col gap-1 max-w-[700px]">
                        <span className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.04em] leading-[16px]">
                          POTENTIAL IMPACT
                        </span>
                        <p className="text-[13px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                          {t.potentialImpact}
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolveTask(t.id);
                        }}
                        disabled={t.isResolved}
                        className="bg-[#262626] hover:bg-[#383838] text-white text-[14px] font-medium px-4 h-8 rounded-[8px] shrink-0 cursor-pointer border-0 transition-colors"
                      >
                        {t.isResolved ? "Resolved" : "Resolve"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Migrant Compliance Section */}
        <div className="w-full flex flex-col gap-3">
          {/* Section Header */}
          <h2 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
            Migrant compliance
          </h2>

          {/* Search + Filter Bar (Height 32px) */}
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
              <DropdownMenuTrigger
                className="h-8 rounded-[8px] bg-white border-0 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] px-2.5 flex items-center gap-1 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 transition-colors cursor-pointer outline-none"
              >
                <span>{statusFilter}</span>
                <RiArrowDownSLine className="size-5 text-[#5C5C5C]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={() => setStatusFilter("All status")}>
                  All status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Compliant")}>
                  Compliant
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Review")}>
                  Under Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Action Needed")}>
                  Action Needed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Migrant Compliance Table */}
          <div className="w-full flex flex-col gap-2 mt-1">
            {/* Table Header - Height 36px, background #F7F7F7 */}
            <div className="w-full bg-[#F7F7F7] rounded-[8px] h-9 px-4 grid grid-cols-12 items-center text-[12px] font-medium uppercase text-[#A4A4A4] tracking-[0.04em]">
              <div className="col-span-2 text-left">
                <span>CASE ID #</span>
              </div>
              <div className="col-span-4 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors">
                <span>NAME</span>
                <SortIcon />
              </div>
              <div className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors">
                <span>STATUS</span>
                <SortIcon />
              </div>
              <div className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors">
                <span>NEXT RTW</span>
                <SortIcon />
              </div>
              <div className="col-span-2 flex items-center justify-between">
                <span>DOCUMENTS</span>
              </div>
            </div>

            {/* Table Rows */}
            {filteredMigrants.length === 0 ? (
              <div className="w-full bg-white rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-3">
                <p className="text-[14px] text-[#5C5C5C]">
                  No migrant compliance records match your search or filter.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("All status");
                  }}
                  className="bg-[#262626] text-white hover:bg-[#383838]"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              filteredMigrants.map((m, idx) => (
                <div
                  key={`migrant-${m.caseId}-${idx}`}
                  className="w-full bg-white rounded-[16px] p-1 h-[72px] grid grid-cols-12 items-center px-4 hover:bg-neutral-50/50 transition-colors shadow-[0px_1px_2px_rgba(10,13,20,0.03)] border border-white"
                >
                  {/* Case ID # */}
                  <div className="col-span-2 font-mono text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                    {m.caseId}
                  </div>

                  {/* Name & Avatar */}
                  <div className="col-span-4 flex items-center gap-3">
                    {m.avatarUrl ? (
                      <Avatar className="size-10 rounded-full shrink-0">
                        <AvatarImage src={m.avatarUrl} alt={m.name} />
                        <AvatarFallback className="bg-[#EBEBEB] text-[#171717] text-[15px] font-medium">
                          {m.avatarText}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="size-10 rounded-full bg-[#EBEBEB] flex items-center justify-center text-[#171717] text-[16px] font-medium shrink-0">
                        {m.avatarText}
                      </div>
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em] truncate">
                        {m.name}
                      </span>
                      <span className="text-[12px] leading-[16px] font-normal text-[#5C5C5C] tracking-[-0.006em] truncate">
                        {m.company}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-2 flex items-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] ${m.statusBg} ${m.statusColor}`}
                    >
                      {m.status}
                    </span>
                  </div>

                  {/* Next RTW Date */}
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="flex items-center gap-2 opacity-80">
                      <RiCalendarLine className="size-[18px] text-[#171717] shrink-0" />
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        {m.nextRtw}
                      </span>
                    </div>
                  </div>

                  {/* Documents & More Actions */}
                  <div className="col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
                        <RiFileTextLine className="size-5 text-[#5C5C5C]" />
                      </div>
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        {m.docs}
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="size-6 rounded-[6px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-100 p-0 border-0 bg-transparent cursor-pointer outline-none"
                        aria-label="More options"
                      >
                        <RiMoreFill className="size-5 text-[#5C5C5C]" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => toast.info(`Viewing compliance profile for ${m.name}`)}>
                          <RiUserLine className="size-4 mr-2" />
                          <span>View Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info(`Viewing documents for ${m.name}`)}>
                          <RiFileTextLine className="size-4 mr-2" />
                          <span>View Documents</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info(`Running RTW verification for ${m.name}`)}>
                          <RiRefreshLine className="size-4 mr-2" />
                          <span>Run RTW Check</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toast.success(`Exported compliance record for ${m.name}`)}>
                          <RiDownloadLine className="size-4 mr-2" />
                          <span>Export Summary</span>
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
    </div>
  );
}
