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
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiFileWarningLine,
  RiTimer2Line,
  RiUser6Line,
  RiMoreFill,
  RiCalendarEventLine,
} from "@remixicon/react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

interface TaskItem {
  id: string;
  title: string;
  subtitle: string;
  migrantName: string;
  caseId: string;
  avatarBg: string;
  avatarText: string;
  avatarUrl?: string;
  status: string;
  statusType: string;
  date: string;
  hasWarningIcon?: boolean;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  potentialImpact: string;
}

const fallbackTasks: TaskItem[] = [
  {
    id: "task-1",
    title: "Complete RTW check",
    subtitle: "Complete right to work check before employment starts",
    migrantName: "Alex Marin",
    caseId: "431/2026",
    avatarBg: "#EFEBFF",
    avatarText: "AM",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    status: "NOT UPLOADED",
    statusType: "neutral",
    date: "Mar 5, 2026",
    riskLevel: "HIGH",
    potentialImpact: "Civil penalty up to GBP £20,000 per illegal worker. Criminal prosecution possible.",
  },
  {
    id: "task-2",
    title: "Upload Migrant Signed Docs (MSDs)",
    subtitle: "Provide confirmation of migrant signed docs",
    migrantName: "Taylor Johnson",
    caseId: "430/2026",
    avatarBg: "#171717",
    avatarText: "TJ",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    status: "UPLOADED",
    statusType: "success",
    date: "Mar 5, 2026",
    riskLevel: "MEDIUM",
    potentialImpact: "Delay in Home Office audit verification and potential non-compliance warning.",
  },
  {
    id: "task-3",
    title: "Inform worker of UK employment rights",
    subtitle: "Provide written confirmation of employment rights and retain record",
    migrantName: "Gulab Singh Sidhu",
    caseId: "429/2026",
    avatarBg: "#EBEBEB",
    avatarText: "GS",
    status: "REQUIRED ASAP",
    statusType: "error",
    date: "Upload by: Mar 25, 2026",
    hasWarningIcon: true,
    riskLevel: "HIGH",
    potentialImpact: "Mandatory breach notice if not provided within 7 days of employment start date.",
  },
  {
    id: "task-4",
    title: "Upload promoter payment letter",
    subtitle: "Request payment letter from promoter and add to case file",
    migrantName: "Ami Monarch",
    caseId: "427/2026",
    avatarBg: "#EBEBEB",
    avatarText: "AM",
    status: "UNDER REVIEW",
    statusType: "warning",
    date: "Mar 12, 2026",
    riskLevel: "MEDIUM",
    potentialImpact: "Required for sponsor license record-keeping compliance audit.",
  },
  {
    id: "task-5",
    title: "Plan visa renewal",
    subtitle: "Window for visa renewal approaching. Get started soon.",
    migrantName: "Wei Chen",
    caseId: "426/2026",
    avatarBg: "#171717",
    avatarText: "WC",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    status: "UPLOADED",
    statusType: "success",
    date: "Apr 01, 2026",
    riskLevel: "LOW",
    potentialImpact: "Ensures continuous right to work without gap in legal status.",
  },
];

interface MigrantComplianceRow {
  caseId: string;
  name: string;
  company: string;
  avatarText: string;
  avatarUrl?: string;
  status: string;
  statusStyle: string;
  nextRtw: string;
  docs: string;
}

function formatFullName(first?: string, last?: string): string {
  const f = (first || "").trim();
  const l = (last || "").trim();
  if (!f && !l) return "";
  return `${f} ${l}`.trim();
}

function getInitials(name?: string): string {
  if (!name) return "MA";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const fallbackMigrantsData: MigrantComplianceRow[] = [
  {
    caseId: "431/2026",
    name: "Alex Marin",
    company: "AX Studios",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    avatarText: "AM",
    status: "ACTION NEEDED",
    statusStyle: "bg-[#FFEBEC] text-[#681219]",
    nextRtw: "18 Nov 2026",
    docs: "10/12",
  },
  {
    caseId: "430/2026",
    name: "Taylor Johnson",
    company: "AX Studios",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    avatarText: "TJ",
    status: "COMPLIANT",
    statusStyle: "bg-[#E3F7EC] text-[#0D6332]",
    nextRtw: "04 Sep 2026",
    docs: "12/12",
  },
  {
    caseId: "429/2026",
    name: "Gulab Singh Sidhu",
    company: "Inderbir Sidhu",
    avatarText: "GS",
    status: "COMPLIANT",
    statusStyle: "bg-[#E3F7EC] text-[#0D6332]",
    nextRtw: "22 Jan 2027",
    docs: "12/12",
  },
  {
    caseId: "428/2026",
    name: "Elena Petrova",
    company: "Dhira Gill Music Video",
    avatarText: "EP",
    status: "COMPLIANT",
    statusStyle: "bg-[#E3F7EC] text-[#0D6332]",
    nextRtw: "12 Aug 2026",
    docs: "12/12",
  },
  {
    caseId: "427/2026",
    name: "Ami Monarch",
    company: "Dhira Gill Music Video",
    avatarText: "AM",
    status: "ACTION NEEDED",
    statusStyle: "bg-[#FFEBEC] text-[#681219]",
    nextRtw: "06 Mar 2027",
    docs: "12/12",
  },
  {
    caseId: "426/2026",
    name: "Wei Chen",
    company: "Anonymous Group",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    avatarText: "WM",
    status: "REVIEW",
    statusStyle: "bg-[#FFFAEB] text-[#624C18]",
    nextRtw: "28 Oct 2026",
    docs: "4/12",
  },
];

export default function ComplianceCentrePage() {
  const [tasks, setTasks] = React.useState<TaskItem[]>(fallbackTasks);
  const [migrantsData, setMigrantsData] = React.useState<MigrantComplianceRow[]>(fallbackMigrantsData);
  const [loading, setLoading] = React.useState(true);
  const [selectedTaskFilter, setSelectedTaskFilter] = React.useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>("task-1");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All status");

  // Fetch real cases and tasks from NestJS backend API
  React.useEffect(() => {
    async function fetchComplianceBackendData() {
      try {
        setLoading(true);
        const [casesRes, tasksRes] = await Promise.allSettled([
          apiClient.get<any>(ENDPOINTS.cases.base),
          apiClient.get<any>(ENDPOINTS.tasks.base),
        ]);

        if (casesRes.status === "fulfilled" && casesRes.value) {
          const rawCases: any[] = Array.isArray(casesRes.value) ? casesRes.value : casesRes.value?.data ?? [];
          if (rawCases.length > 0) {
            const mappedMigrants: MigrantComplianceRow[] = rawCases.map((c, i) => {
              const name = formatFullName(c.first_name || c.migrant?.user?.personalInfo?.firstName, c.last_name || c.migrant?.user?.personalInfo?.lastName) || `Migrant #${c.id}`;
              const caseId = c.caseIdDisplay || c.caseNumber || `${c.id}/2026`;
              const company = c.group_name || c.company || "AX Studios";
              const initials = getInitials(name);

              let status = "COMPLIANT";
              let statusStyle = "bg-[#E3F7EC] text-[#0D6332]";
              if (i % 3 === 0) {
                status = "ACTION NEEDED";
                statusStyle = "bg-[#FFEBEC] text-[#681219]";
              } else if (i % 3 === 2) {
                status = "REVIEW";
                statusStyle = "bg-[#FFFAEB] text-[#624C18]";
              }

              return {
                caseId,
                name,
                company,
                avatarText: initials,
                avatarUrl: c.migrant?.user?.avatarUrl,
                status,
                statusStyle,
                nextRtw: c.next_rtw_check ? new Date(c.next_rtw_check).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "18 Nov 2026",
                docs: `${12 - (i % 4)}/12`,
              };
            });
            setMigrantsData(mappedMigrants);
          }
        }

        if (tasksRes.status === "fulfilled" && tasksRes.value) {
          const rawTasks: any[] = Array.isArray(tasksRes.value) ? tasksRes.value : tasksRes.value?.data ?? [];
          if (rawTasks.length > 0) {
            const mappedTasks: TaskItem[] = rawTasks.map((t, i) => {
              const prioStr = typeof t.priority === "string" ? t.priority.toUpperCase() : "";
              const riskLevel: "HIGH" | "MEDIUM" | "LOW" =
                prioStr === "HIGH" || prioStr === "MEDIUM" || prioStr === "LOW"
                  ? prioStr
                  : i % 2 === 0
                  ? "HIGH"
                  : "MEDIUM";

              return {
                id: String(t.id || `task-${i + 1}`),
                title: t.title || "Complete compliance action",
                subtitle: t.description || t.subtitle || "Provide required document or check",
                migrantName: t.migrantName || "Migrant Record",
                caseId: t.caseId || `${430 - i}/2026`,
                avatarBg: "#EFEBFF",
                avatarText: "MR",
                status: t.status || "REQUIRED ASAP",
                statusType: t.statusType || "error",
                date: t.dueDate || "Mar 25, 2026",
                riskLevel,
                potentialImpact: t.impact || "Mandatory compliance requirement under sponsor license obligations.",
              };
            });
            setTasks(mappedTasks);
          }
        }
      } catch (err) {
        console.error("Failed to fetch compliance backend data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchComplianceBackendData();
  }, []);

  // Derived counts for compliance
  const highRiskCount = React.useMemo(
    () => tasks.filter((t) => t.riskLevel === "HIGH" && t.status !== "RESOLVED").length,
    [tasks]
  );
  const medRiskCount = React.useMemo(
    () => tasks.filter((t) => t.riskLevel === "MEDIUM" && t.status !== "RESOLVED").length,
    [tasks]
  );
  const lowRiskCount = React.useMemo(
    () => tasks.filter((t) => t.riskLevel === "LOW" && t.status !== "RESOLVED").length,
    [tasks]
  );
  const actionsNeededCount = React.useMemo(
    () => tasks.filter((t) => t.status !== "RESOLVED" && t.status !== "UPLOADED").length,
    [tasks]
  );

  const handleResolveTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "RESOLVED", statusType: "success" } : t
      )
    );
    toast.success("Task resolved successfully");
  };

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (selectedTaskFilter === "ALL") return true;
      return t.riskLevel === selectedTaskFilter;
    });
  }, [tasks, selectedTaskFilter]);

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
        if (statusFilter === "Review" && m.status !== "REVIEW") return false;
        if (statusFilter === "Action Needed" && m.status !== "ACTION NEEDED") return false;
      }
      return true;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div className="w-full min-h-full bg-[#F7F7F7] text-[#171717] font-sans pb-16 flex flex-col gap-8 px-6 lg:px-12 py-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[32px] leading-[40px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
          Compliance Centre
        </h1>
        <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
          Create, track, and manage visa cases for individual or grouped migrants.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-8 max-w-[1232px] w-full">
        {/* Banner Alert [1.1] */}
        <div className="w-full bg-[#FFF3EB] rounded-[8px] px-6 py-3 flex items-center justify-between gap-4 border border-[#FFE4D4]">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="size-5 flex items-center justify-center shrink-0">
              <RiAlertFill className="size-5 text-[#FA7319]" />
            </div>
            <div className="flex items-center gap-2 text-[14px] leading-[20px] font-normal text-[#171717] tracking-[-0.006em]">
              <span className="font-medium text-[#171717]">Attention needed</span>
              <span>•</span>
              <span>{actionsNeededCount} actions need attention</span>
              <span>•</span>
              <span className="text-[#FB3748] font-normal">{highRiskCount} high risk</span>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 text-[14px] font-medium text-[#171717] underline hover:text-[#5C5C5C] transition-colors border-0 bg-transparent cursor-pointer shrink-0"
          >
            <span>Review actions</span>
            <RiArrowRightSLine className="size-5 text-[#171717]" />
          </button>
        </div>

        {/* Overview Widgets Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
          {/* Donut Score Widget */}
          <div className="lg:col-span-4 bg-white rounded-[16px] p-4 flex flex-col justify-between items-center gap-4 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] border border-white">
            <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
              COMPLIANCE SCORE
            </span>

            {/* Circular Progress Ring */}
            <div className="relative size-[75px] flex items-center justify-center my-1">
              <svg className="size-[75px] -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#EBEBEB]"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#F6B51E]"
                  strokeDasharray="68, 100"
                  strokeWidth="4"
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

            {/* Score Text */}
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-[20px] leading-[24px] font-medium text-[#171717] font-aeonik-medium">
                Low Risk
              </h3>
              <div className="flex items-center gap-1 text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                <span>{tasks.filter((t) => t.status !== "RESOLVED").length} tasks</span>
                <span>•</span>
                <span>4 docs</span>
              </div>
            </div>
          </div>

          {/* Metrics 2x2 Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#EFEBFF] rounded-[8px] p-3 px-4 flex flex-col justify-between gap-2 relative overflow-hidden h-[98px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                  TOTAL CASES
                </span>
                <span className="text-[24px] leading-[32px] font-medium text-[#351A75] font-aeonik-medium">
                  8
                </span>
              </div>
              <RiFileTextLine className="size-5 text-[#5C5C5C] absolute right-3 top-3" />
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">
                44 active
              </span>
            </div>

            <div className="bg-[#E3F7EC] rounded-[8px] p-3 px-4 flex flex-col justify-between gap-2 relative overflow-hidden h-[98px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                  COMPLIANT
                </span>
                <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                  4
                </span>
              </div>
              <RiCheckboxCircleLine className="size-5 text-[#5C5C5C] absolute right-3 top-3" />
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">
                68%
              </span>
            </div>

            <div className="bg-[#FFFAEB] rounded-[8px] p-3 px-4 flex flex-col justify-between gap-2 relative overflow-hidden h-[98px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                  WARNINGS
                </span>
                <span className="text-[24px] leading-[32px] font-medium text-[#624C18] font-aeonik-medium">
                  {medRiskCount}
                </span>
              </div>
              <RiFileWarningLine className="size-5 text-[#5C5C5C] absolute right-3 top-3" />
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">
                Attention required
              </span>
            </div>

            <div className="bg-[#FFEBEC] rounded-[8px] p-3 px-4 flex flex-col justify-between gap-2 relative overflow-hidden h-[98px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                  CRITICAL
                </span>
                <span className="text-[24px] leading-[32px] font-medium text-[#681219] font-aeonik-medium">
                  {highRiskCount}
                </span>
              </div>
              <RiTimer2Line className="size-5 text-[#5C5C5C] absolute right-3 top-3" />
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">
                Immediate action
              </span>
            </div>
          </div>
        </div>

        {/* Risk Profile Card */}
        <div className="w-full flex flex-col gap-3">
          <h2 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
            Risk profile
          </h2>

          <div className="w-full bg-white rounded-[16px] p-6 flex flex-col gap-4 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] border border-white">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] leading-[20px] font-medium text-[#171717]">
                  Overall exposure
                </span>
                <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">
                  {highRiskCount} high • {lowRiskCount} low
                </span>
              </div>
              <div className="inline-flex items-center gap-1 bg-[#FFFAEB] px-2 py-0.5 rounded-full text-[11px] font-medium text-[#F6B51E] uppercase tracking-[0.02em]">
                <RiAlertFill className="size-4 text-[#F6B51E]" />
                <span>LOW</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between gap-3 h-[98px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0 text-[#5C5C5C]">
                      <RiUser6Line className="size-5 text-[#5C5C5C]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">Right to work</span>
                      <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">RTW documents &amp; checks</span>
                    </div>
                  </div>
                  <div className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C]">
                    <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FB3748] w-[30%] rounded-full" />
                </div>
              </div>

              <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between gap-3 h-[98px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0 text-[#5C5C5C]">
                      <RiUser6Line className="size-5 text-[#5C5C5C]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">Employment</span>
                      <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">CoS &amp; contract alignment</span>
                    </div>
                  </div>
                  <div className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C]">
                    <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1DAF61] w-[80%] rounded-full" />
                </div>
              </div>

              <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between gap-3 h-[98px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0 text-[#5C5C5C]">
                      <RiUser6Line className="size-5 text-[#5C5C5C]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">Reporting</span>
                      <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">Change notifications</span>
                    </div>
                  </div>
                  <div className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C]">
                    <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1DAF61] w-[100%] rounded-full" />
                </div>
              </div>

              <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between gap-3 h-[98px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0 text-[#5C5C5C]">
                      <RiUser6Line className="size-5 text-[#5C5C5C]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">Documents</span>
                      <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">2 need review</span>
                    </div>
                  </div>
                  <div className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C]">
                    <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#F6B51E] w-[70%] rounded-full" />
                </div>
              </div>

              <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between gap-3 h-[98px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0 text-[#5C5C5C]">
                      <RiUser6Line className="size-5 text-[#5C5C5C]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">Attendance</span>
                      <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">Absence &amp; 10-day rule</span>
                    </div>
                  </div>
                  <div className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C]">
                    <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1DAF61] w-[100%] rounded-full" />
                </div>
              </div>

              <div className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between gap-3 h-[98px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0 text-[#5C5C5C]">
                      <RiUser6Line className="size-5 text-[#5C5C5C]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">Audit trail</span>
                      <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">Complete records</span>
                    </div>
                  </div>
                  <div className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C]">
                    <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1DAF61] w-[100%] rounded-full" />
                </div>
              </div>
            </div>

            <span className="text-[12px] leading-[16px] font-normal text-[#7B7B7B] mt-1">
              Last assessed 20 Jul 2026, 09:42
            </span>
          </div>
        </div>

        {/* Priority Tasks Section */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                Priority tasks
              </h2>
              <RiInformationLine className="size-4 text-[#A4A4A4]" />
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[13px] font-normal text-[#7B7B7B]">
                {filteredTasks.length} of {tasks.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous tasks page"
                  className="size-8 rounded-[8px] bg-white border border-[#EBEBEB] flex items-center justify-center text-[#5C5C5C] hover:bg-[#F5F5F5] cursor-pointer"
                >
                  <RiArrowLeftSLine className="size-4 text-[#5C5C5C]" />
                </button>
                <button
                  type="button"
                  aria-label="Next tasks page"
                  className="size-8 rounded-[8px] bg-white border border-[#EBEBEB] flex items-center justify-center text-[#5C5C5C] hover:bg-[#F5F5F5] cursor-pointer"
                >
                  <RiArrowRightSLine className="size-4 text-[#5C5C5C]" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedTaskFilter("ALL")}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border-0 cursor-pointer ${
                selectedTaskFilter === "ALL"
                  ? "bg-[#171717] text-white"
                  : "bg-[#EBEBEB] text-[#5C5C5C] hover:bg-neutral-300"
              }`}
            >
              ALL ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTaskFilter("HIGH")}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border-0 cursor-pointer flex items-center gap-1.5 ${
                selectedTaskFilter === "HIGH"
                  ? "bg-[#171717] text-white"
                  : "bg-[#EBEBEB] text-[#5C5C5C] hover:bg-neutral-300"
              }`}
            >
              <span className="size-2 rounded-full bg-[#FB3748]" />
              <span>HIGH ({highRiskCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTaskFilter("MEDIUM")}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border-0 cursor-pointer flex items-center gap-1.5 ${
                selectedTaskFilter === "MEDIUM"
                  ? "bg-[#171717] text-white"
                  : "bg-[#EBEBEB] text-[#5C5C5C] hover:bg-neutral-300"
              }`}
            >
              <span className="size-2 rounded-full bg-[#F6B51E]" />
              <span>MEDIUM ({medRiskCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTaskFilter("LOW")}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border-0 cursor-pointer flex items-center gap-1.5 ${
                selectedTaskFilter === "LOW"
                  ? "bg-[#171717] text-white"
                  : "bg-[#EBEBEB] text-[#5C5C5C] hover:bg-neutral-300"
              }`}
            >
              <span className="size-2 rounded-full bg-[#7B7B7B]" />
              <span>LOW ({lowRiskCount})</span>
            </button>
          </div>

          {/* Priority Tasks Table / List */}
          <div className="w-full flex flex-col gap-2 mt-1">
            <div className="grid grid-cols-12 px-6 py-2 text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em]">
              <div className="col-span-5 flex items-center gap-1">DOCUMENT ↕</div>
              <div className="col-span-3 flex items-center gap-1">MIGRANT ↕</div>
              <div className="col-span-2 flex items-center gap-1">STATUS ↕</div>
              <div className="col-span-2 flex items-center gap-1 justify-end">DATE ↕</div>
            </div>

            {filteredTasks.map((t) => {
              const isExpanded = expandedTaskId === t.id;

              return (
                <div
                  key={t.id}
                  className="w-full bg-white rounded-[16px] border border-white shadow-[0px_1px_2px_rgba(10,13,20,0.03)] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedTaskId(isExpanded ? null : t.id)}
                    className="w-full grid grid-cols-12 items-center p-4 px-6 text-left cursor-pointer border-0 bg-transparent hover:bg-neutral-50/50"
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div
                        className={`size-8 rounded-[8px] flex items-center justify-center shrink-0 text-[14px] font-bold ${
                          t.statusType === "error" || t.riskLevel === "HIGH"
                            ? "bg-[#FFEBEC] text-[#FB3748]"
                            : t.statusType === "warning"
                            ? "bg-[#FFFAEB] text-[#F6B51E]"
                            : "bg-[#F5F5F5] text-[#5C5C5C]"
                        }`}
                      >
                        !
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] leading-[20px] font-medium text-[#171717]">
                          {t.title}
                        </span>
                        <span className="text-[13px] leading-[20px] font-normal text-[#5C5C5C]">
                          {t.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-3 flex items-center gap-3">
                      {t.avatarUrl ? (
                        <img
                          src={t.avatarUrl}
                          alt={t.migrantName}
                          className="size-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="size-8 rounded-full bg-[#EBEBEB] flex items-center justify-center text-[#5C5C5C] text-[12px] font-medium shrink-0">
                          {t.avatarText}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-[14px] leading-[20px] font-medium text-[#171717]">
                          {t.migrantName}
                        </span>
                        <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">
                          {t.caseId}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center">
                      <span
                        className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium uppercase tracking-[0.02em] ${
                          t.statusType === "success"
                            ? "bg-[#E3F7EC] text-[#0D6332]"
                            : t.statusType === "error"
                            ? "bg-[#FFEBEC] text-[#FB3748]"
                            : t.statusType === "warning"
                            ? "bg-[#FFFAEB] text-[#624C18]"
                            : "bg-[#F5F5F5] text-[#7B7B7B]"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-2 text-right">
                      {t.hasWarningIcon && <span className="text-[#FB3748]">⚠️</span>}
                      <span
                        className={`text-[13px] leading-[20px] ${
                          t.hasWarningIcon ? "text-[#FB3748]" : "text-[#5C5C5C]"
                        }`}
                      >
                        {t.date}
                      </span>
                      <RiArrowDownSLine
                        className={`size-5 text-[#A4A4A4] transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-[#F9F9F9] p-4 px-6 border-t border-[#EBEBEB] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex flex-col gap-1 max-w-[700px]">
                        <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em]">
                          POTENTIAL IMPACT
                        </span>
                        <p className="text-[13px] leading-[20px] font-normal text-[#171717]">
                          {t.potentialImpact}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleResolveTask(t.id)}
                        className="bg-[#171717] hover:bg-[#333333] text-white text-[14px] font-medium px-4 py-2 rounded-[8px] shrink-0 cursor-pointer border-0 shadow-x-small transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Migrant Compliance Section */}
        <div className="w-full flex flex-col gap-4 mt-2">
          <h2 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
            Migrant compliance
          </h2>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[280px]">
              <RiSearchLine className="size-4 text-[#A4A4A4] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                aria-label="Search migrants"
                placeholder="Search migrants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 bg-white border border-transparent rounded-[10px] pl-9 pr-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
              />
            </div>

            <button
              type="button"
              aria-label="Filter actions"
              className="size-10 bg-white rounded-[10px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-50 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] border-0 cursor-pointer shrink-0"
            >
              <RiFilter3Line className="size-5 text-[#5C5C5C]" />
            </button>

            <div className="relative shrink-0">
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 bg-white border border-transparent rounded-[10px] pl-3 pr-8 text-[14px] font-medium text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
              >
                <option value="All status">All status</option>
                <option value="Compliant">Compliant</option>
                <option value="Review">Review</option>
                <option value="Action Needed">Action Needed</option>
              </select>
              <RiArrowDownSLine className="size-4 text-[#5C5C5C] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Table Container */}
          <div className="w-full bg-white rounded-[16px] border border-white shadow-[0px_1px_2px_rgba(10,13,20,0.03)] overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3 border-b border-[#EBEBEB] text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em]">
              <div className="col-span-2">CASE ID #</div>
              <div className="col-span-4 flex items-center gap-1">NAME ↕</div>
              <div className="col-span-2 flex items-center gap-1">STATUS ↕</div>
              <div className="col-span-2 flex items-center gap-1">NEXT RTW ↕</div>
              <div className="col-span-2 text-right">DOCUMENTS</div>
            </div>

            {filteredMigrants.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center gap-3">
                <p className="text-[14px] text-[#5C5C5C]">
                  No migrants found matching your active search or filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("All status");
                  }}
                  className="bg-[#171717] hover:bg-[#333333] text-white text-[13px] font-medium px-4 py-2 rounded-[8px] cursor-pointer border-0 shadow-x-small transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredMigrants.map((m, idx) => (
                <div
                  key={m.caseId}
                  className={`grid grid-cols-12 items-center px-6 py-3.5 hover:bg-neutral-50/60 transition-colors ${
                    idx !== filteredMigrants.length - 1 ? "border-b border-[#F5F5F5]" : ""
                  }`}
                >
                  <div className="col-span-2 text-[14px] font-normal text-[#5C5C5C]">
                    {m.caseId}
                  </div>

                  <div className="col-span-4 flex items-center gap-3">
                    {m.avatarUrl ? (
                      <img
                        src={m.avatarUrl}
                        alt={m.name}
                        className="size-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-[#EBEBEB] flex items-center justify-center text-[#5C5C5C] text-[12px] font-medium shrink-0">
                        {m.avatarText}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">
                        {m.name}
                      </span>
                      <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B]">
                        {m.company}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <span
                      className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium uppercase tracking-[0.02em] ${m.statusStyle}`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center gap-2 text-[14px] font-normal text-[#171717]">
                    <RiCalendarEventLine className="size-4 text-[#A4A4A4] shrink-0" />
                    <span>{m.nextRtw}</span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-3 text-right">
                    <div className="flex items-center gap-1.5 bg-[#F5F5F5] px-2 py-1 rounded-[6px]">
                      <RiFileTextLine className="size-4 text-[#7B7B7B]" />
                      <span className="text-[13px] font-medium text-[#171717]">{m.docs}</span>
                    </div>
                    <button
                      type="button"
                      aria-label="More actions"
                      className="size-7 rounded-full flex items-center justify-center text-[#A4A4A4] hover:text-[#171717] hover:bg-neutral-100 border-0 bg-transparent cursor-pointer"
                    >
                      <RiMoreFill className="size-5 text-current" />
                    </button>
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
