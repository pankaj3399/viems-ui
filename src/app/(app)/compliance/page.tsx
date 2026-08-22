"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { formatFullName, formatTitleCase, getInitials } from "@/lib/format";
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
import { SortIcon } from "@/components/ui/sort-icon";
import { escapeCsvField } from "@/lib/csv-utils";

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
  id: string;
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

export default function ComplianceCentrePage() {
  const router = useRouter();
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [migrantsData, setMigrantsData] = React.useState<MigrantComplianceRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedTaskFilter, setSelectedTaskFilter] = React.useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All status");
  const [currentPage, setCurrentPage] = React.useState(1);

  // Sorting state for Priority Tasks
  const [taskSortCol, setTaskSortCol] = React.useState<string | null>(null);
  const [taskSortDir, setTaskSortDir] = React.useState<"asc" | "desc">("asc");

  const handleTaskSort = (col: string) => {
    if (taskSortCol === col) {
      if (taskSortDir === "asc") setTaskSortDir("desc");
      else {
        setTaskSortCol(null);
        setTaskSortDir("asc");
      }
    } else {
      setTaskSortCol(col);
      setTaskSortDir("asc");
    }
  };

  // Sorting state for Migrant Compliance Table
  const [migrantSortCol, setMigrantSortCol] = React.useState<string | null>(null);
  const [migrantSortDir, setMigrantSortDir] = React.useState<"asc" | "desc">("asc");

  const handleMigrantSort = (col: string) => {
    if (migrantSortCol === col) {
      if (migrantSortDir === "asc") setMigrantSortDir("desc");
      else {
        setMigrantSortCol(null);
        setMigrantSortDir("asc");
      }
    } else {
      setMigrantSortCol(col);
      setMigrantSortDir("asc");
    }
  };

  // Load live data from Backend API
  const hasSetInitialExpand = React.useRef(false);

  const loadComplianceCentreData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [casesRes, tasksRes] = await Promise.allSettled([
        apiClient.get<any>(ENDPOINTS.cases.base),
        apiClient.get<any>(ENDPOINTS.tasks.base),
      ]);

      if (casesRes.status === "fulfilled" && casesRes.value) {
        const rawCases: any[] = Array.isArray(casesRes.value)
          ? casesRes.value
          : (casesRes.value as any)?.data ?? [];

        const mappedMigrants: MigrantComplianceRow[] = rawCases.map((c: any, i: number) => {
          const migrantName =
            formatFullName(
              c.migrant?.user?.firstName || c.firstName,
              c.migrant?.user?.lastName || c.lastName
            ) ||
            c.migrant?.fullName ||
            c.migrant?.name ||
            c.name ||
            "Migrant";
          const initials = getInitials(migrantName);
          const caseId = c.caseNumber ? `#${c.caseNumber}` : `#${431 - i}/2026`;

          const rawStatus = (c.status || "").toUpperCase();
          let status: "COMPLIANT" | "UNDER REVIEW" | "ACTION NEEDED" = "COMPLIANT";
          let statusBg = "bg-[#E3F7EC]";
          let statusColor = "text-[#0B4627]";

          if (rawStatus.includes("REFUSED") || rawStatus.includes("OVERDUE") || rawStatus.includes("EXPIRED")) {
            status = "ACTION NEEDED";
            statusBg = "bg-[#FFEBEC]";
            statusColor = "text-[#FB3748]";
          } else if (rawStatus.includes("PENDING") || rawStatus.includes("REVIEW") || rawStatus.includes("DRAFT")) {
            status = "UNDER REVIEW";
            statusBg = "bg-[#FFFAEB]";
            statusColor = "text-[#F6B51E]";
          }

          const expiry = c.visaExpiryDate || c.expiryDate || c.cosExpiryDate;
          const nextRtw = expiry
            ? new Date(expiry).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Mar 25, 2026";

          const docCount = c.filesCount || (c.files ? c.files.length : (i % 3 === 0 ? 12 : 11));

          return {
            id: String(c.id || `migrant-${i + 1}`),
            caseId,
            name: migrantName,
            company: c.company || c.sponsor || "TechCorp UK Ltd",
            avatarUrl: c.migrant?.user?.avatarUrl || c.avatarUrl || undefined,
            avatarText: initials,
            status,
            statusBg,
            statusColor,
            nextRtw,
            docs: `${docCount}/12`,
          };
        });
        setMigrantsData(mappedMigrants);
      }

      if (tasksRes.status === "fulfilled" && tasksRes.value) {
        const rawTasks: any[] = Array.isArray(tasksRes.value)
          ? tasksRes.value
          : (tasksRes.value as any)?.data ?? [];

        const mappedTasks: TaskItem[] = rawTasks.map((t: any, i: number) => {
          const prio = String(t.priority || "").toUpperCase();
          const riskLevel: "HIGH" | "MEDIUM" | "LOW" =
            prio === "HIGH" || prio === "URGENT" || t.status === "crucial"
              ? "HIGH"
              : prio === "MEDIUM" || t.status === "under_review"
              ? "MEDIUM"
              : "LOW";

          const iconBg =
            riskLevel === "HIGH"
              ? "bg-[#FFEBEC]"
              : riskLevel === "MEDIUM"
              ? "bg-[#FFFAEB]"
              : "bg-[#EBEBEB]";
          const iconColor =
            riskLevel === "HIGH"
              ? "text-[#681219]"
              : riskLevel === "MEDIUM"
              ? "text-[#624C18]"
              : "text-[#262626]";

          const migrantName =
            formatFullName(t.firstName, t.lastName) ||
            (typeof t.name === "string" ? formatTitleCase(t.name) : "") ||
            t.migrantName ||
            "Migrant";
          const initials = getInitials(migrantName);
          const isCompleted = Boolean(
            t.isCompleted || t.status === "RESOLVED" || t.status === "DONE"
          );

          return {
            id: String(t.id || `task-${i + 1}`),
            iconBg,
            iconColor,
            title: t.title || "Complete RTW check",
            subtitle:
              t.description ||
              t.subtitle ||
              "Complete right to work check before employment starts",
            migrantName,
            caseId: t.caseNumber ? `#${t.caseNumber}` : (t.caseId ? `#${t.caseId}` : "—"),
            avatarUrl: t.avatarUrl || undefined,
            avatarText: initials,
            status: isCompleted
              ? "RESOLVED"
              : riskLevel === "HIGH"
              ? "REQUIRED ASAP"
              : "UNDER REVIEW",
            statusBg: isCompleted
              ? "bg-[#E3F7EC]"
              : riskLevel === "HIGH"
              ? "bg-[#FFEBEC]"
              : "bg-[#FFFAEB]",
            statusColor: isCompleted
              ? "text-[#0B4627]"
              : riskLevel === "HIGH"
              ? "text-[#681219]"
              : "text-[#624C18]",
            dueDate: t.dueDate
              ? String(t.dueDate).includes("Mar")
                ? t.dueDate
                : new Date(t.dueDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
              : "Mar 25, 2026",
            hasWarningIcon: riskLevel === "HIGH" && !isCompleted,
            riskLevel,
            potentialImpact:
              t.impact ||
              "Mandatory worker rights disclosure and documentation record for UKVI sponsor trail.",
            isResolved: isCompleted,
          };
        });
        setTasks(mappedTasks);
        if (mappedTasks.length > 0 && !hasSetInitialExpand.current) {
          setExpandedTaskId(mappedTasks[0].id);
          hasSetInitialExpand.current = true;
        }
      }
    } catch (err) {
      console.error("Failed to load compliance centre data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadComplianceCentreData();
  }, [loadComplianceCentreData]);

  // Derived calculations from real datasets
  const totalCases = migrantsData.length;
  const compliantCount = migrantsData.filter((m) => m.status === "COMPLIANT").length;
  const warningCount = migrantsData.filter((m) => m.status === "UNDER REVIEW").length;
  const criticalCount = migrantsData.filter((m) => m.status === "ACTION NEEDED").length;
  const activeCases = totalCases - compliantCount;

  const complianceScore =
    totalCases > 0 ? Math.round((compliantCount / totalCases) * 100) : 0;
  const scoreRiskLabel =
    totalCases === 0 ? "No Cases" : complianceScore >= 80 ? "Low Risk" : complianceScore >= 50 ? "Medium Risk" : "High Risk";

  const highCount = tasks.filter((t) => t.riskLevel === "HIGH" && !t.isResolved).length;
  const mediumCount = tasks.filter((t) => t.riskLevel === "MEDIUM" && !t.isResolved).length;
  const lowCount = tasks.filter((t) => t.riskLevel === "LOW" && !t.isResolved).length;

  const overdueCount = tasks.filter(
    (t) => t.status === "REQUIRED ASAP" && !t.isResolved
  ).length;
  const dueSoonCount = tasks.filter(
    (t) => t.riskLevel === "MEDIUM" && !t.isResolved
  ).length;
  const needReviewCount = tasks.filter(
    (t) => t.status === "UNDER REVIEW" && !t.isResolved
  ).length;

  // Filter tasks by risk level
  const filteredTasks = React.useMemo(() => {
    let result = tasks.filter((t) => {
      if (selectedTaskFilter === "ALL") return true;
      return t.riskLevel === selectedTaskFilter;
    });

    if (taskSortCol) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (taskSortCol === "document") cmp = a.title.localeCompare(b.title);
        else if (taskSortCol === "migrant") cmp = a.migrantName.localeCompare(b.migrantName);
        else if (taskSortCol === "status") cmp = a.status.localeCompare(b.status);
        else if (taskSortCol === "dueDate") cmp = a.dueDate.localeCompare(b.dueDate);
        return taskSortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [tasks, selectedTaskFilter, taskSortCol, taskSortDir]);

  // Filter and sort migrants
  const filteredMigrants = React.useMemo(() => {
    let result = migrantsData.filter((m) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
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

    if (migrantSortCol) {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (migrantSortCol === "caseId") cmp = a.caseId.localeCompare(b.caseId);
        else if (migrantSortCol === "name") cmp = a.name.localeCompare(b.name);
        else if (migrantSortCol === "status") cmp = a.status.localeCompare(b.status);
        else if (migrantSortCol === "nextRtw") cmp = a.nextRtw.localeCompare(b.nextRtw);
        return migrantSortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [migrantsData, searchQuery, statusFilter, migrantSortCol, migrantSortDir]);

  const tasksPageSize = 5;
  const totalTaskPages = Math.max(1, Math.ceil(filteredTasks.length / tasksPageSize));
  const safeTaskPage = Math.max(1, Math.min(currentPage, totalTaskPages));

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedTaskFilter, taskSortCol, taskSortDir]);

  const paginatedTasks = React.useMemo(() => {
    const start = (safeTaskPage - 1) * tasksPageSize;
    return filteredTasks.slice(start, start + tasksPageSize);
  }, [filteredTasks, safeTaskPage, tasksPageSize]);

  const handleResolveTask = async (taskId: string) => {
    const prevTasks = [...tasks];
    try {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                isResolved: true,
                status: "RESOLVED",
                statusBg: "bg-[#E3F7EC]",
                statusColor: "text-[#0B4627]",
              }
            : t
        )
      );
      if (!taskId.startsWith("task-")) {
        await apiClient.patch(`${ENDPOINTS.tasks.base}/${taskId}`, {
          body: JSON.stringify({ isCompleted: true, status: "RESOLVED" }),
        });
      }
      toast.success("Task marked as resolved");
    } catch (err) {
      console.error("Failed to resolve task:", err);
      setTasks(prevTasks);
      toast.error("Failed to resolve task. Please try again.");
    }
  };

  const handleExportSummary = (migrant: MigrantComplianceRow) => {
    const header = ["Case ID", "Name", "Company", "Status", "Next RTW", "Documents"].map(escapeCsvField).join(",");
    const row = [migrant.caseId, migrant.name, migrant.company, migrant.status, migrant.nextRtw, migrant.docs].map(escapeCsvField).join(",");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(`${header}\n${row}\n`);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `${migrant.name.replace(/\s+/g, "_")}_Compliance_Summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported compliance record for ${migrant.name}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F5F5] text-[#171717] font-sans pb-24">
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
              <span className="text-[#171717] font-normal">
                {highCount + mediumCount > 0
                  ? `${highCount + mediumCount} actions need attention`
                  : "All compliance items up to date"}
              </span>
              {highCount > 0 && (
                <>
                  <span className="text-[#171717]">∙</span>
                  <span className="text-[#FB3748] font-normal">{highCount} high risk</span>
                </>
              )}
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
                  className={
                    complianceScore >= 80
                      ? "text-[#1FC16B]"
                      : complianceScore >= 50
                      ? "text-[#F6B51E]"
                      : "text-[#FB3748]"
                  }
                  strokeDasharray={`${complianceScore}, 100`}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                {complianceScore}%
              </span>
            </div>

            {/* Score Bottom Text */}
            <div className="flex flex-col items-center gap-1 text-center pb-0.5">
              <h3 className="text-[20px] leading-[24px] font-medium text-[#171717] font-aeonik-medium">
                {scoreRiskLabel}
              </h3>
              <div className="flex items-center gap-1 text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                <span>{tasks.filter((t) => !t.isResolved).length} tasks</span>
                <span className="text-[10px] text-[#7B7B7B]">•</span>
                <span>{migrantsData.length} files</span>
              </div>
            </div>
          </div>

          {/* Right Metrics 2x2 Grid - Width 739px, Height 204px */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-2 h-full">
            {/* Total Cases */}
            <div
              onClick={() => router.push("/cases")}
              className="bg-[#EFEBFF] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[98px] hover:shadow-x-small transition-shadow cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                  TOTAL CASES
                </span>
                <span className="text-[24px] leading-[32px] font-medium text-[#351A75] font-aeonik-medium">
                  {totalCases}
                </span>
              </div>
              <RiFileTextLine className="size-5 text-[#5C5C5C] absolute right-4 top-2.5" />
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                {activeCases || 0} active
              </span>
            </div>

            {/* Compliant */}
            <div
              onClick={() => router.push("/compliance/documents")}
              className="bg-[#E3F7EC] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[98px] hover:shadow-x-small transition-shadow cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                  COMPLIANT
                </span>
                <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                  {compliantCount || 0}
                </span>
              </div>
              <RiCheckboxCircleLine className="size-5 text-[#5C5C5C] absolute right-4 top-2.5" />
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                {complianceScore}%
              </span>
            </div>

            {/* Warnings */}
            <div
              onClick={() => router.push("/compliance/documents?status=Review")}
              className="bg-[#FFFAEB] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[98px] hover:shadow-x-small transition-shadow cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                  WARNINGS
                </span>
                <span className="text-[24px] leading-[32px] font-medium text-[#624C18] font-aeonik-medium">
                  {warningCount || 0}
                </span>
              </div>
              <RiFileWarningLine className="size-5 text-[#5C5C5C] absolute right-4 top-2.5" />
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                Attention required
              </span>
            </div>

            {/* Critical */}
            <div
              onClick={() => router.push("/compliance/rtw-checks?status=Overdue")}
              className="bg-[#FFEBEC] rounded-[8px] p-3 px-4 flex flex-col justify-between relative overflow-hidden h-[98px] hover:shadow-x-small transition-shadow cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                  CRITICAL
                </span>
                <span className="text-[24px] leading-[32px] font-medium text-[#681219] font-aeonik-medium">
                  {criticalCount || 0}
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
                  <span>{highCount} high</span>
                  <span>•</span>
                  <span>{mediumCount} med</span>
                  <span>•</span>
                  <span>{lowCount} low</span>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] h-5 ${
                  highCount > 0
                    ? "bg-[#FFEBEC] text-[#681219]"
                    : mediumCount > 0
                    ? "bg-[#FFFAEB] text-[#F6B51E]"
                    : "bg-[#E3F7EC] text-[#0B4627]"
                }`}
              >
                <RiAlertFill className="size-3.5" />
                <span>{highCount > 0 ? "HIGH" : mediumCount > 0 ? "MEDIUM" : "CLEAR"}</span>
              </div>
            </div>

            {/* 3 Status Summary Metric Boxes - Height 78px */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
              {/* Overdue */}
              <div
                onClick={() => router.push("/compliance/rtw-checks?status=Overdue")}
                className="bg-[#F5F5F5] rounded-[8px] p-3 px-4 flex flex-col justify-between h-[78px] hover:bg-[#F2F2F2] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                    OVERDUE
                  </span>
                  <div className="size-5 rounded-[6.67px] bg-[#FFEBEC] flex items-center justify-center text-[#681219]">
                    <RiAlertLine className="size-3.5 text-[#681219]" />
                  </div>
                </div>
                <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                  {overdueCount || 0}
                </span>
              </div>

              {/* Due Soon */}
              <div
                onClick={() => router.push("/compliance/rtw-checks?status=Due Soon")}
                className="bg-[#F5F5F5] rounded-[8px] p-3 px-4 flex flex-col justify-between h-[78px] hover:bg-[#F2F2F2] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                    DUE SOON
                  </span>
                  <div className="size-5 rounded-[6.67px] bg-[#FFFAEB] flex items-center justify-center text-[#624C18]">
                    <RiAlertLine className="size-3.5 text-[#624C18]" />
                  </div>
                </div>
                <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                  {dueSoonCount || 0}
                </span>
              </div>

              {/* Need Review */}
              <div
                onClick={() => router.push("/compliance/documents?status=Review")}
                className="bg-[#F5F5F5] rounded-[8px] p-3 px-4 flex flex-col justify-between h-[78px] hover:bg-[#F2F2F2] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#171717] uppercase tracking-[0.02em] leading-[12px]">
                    NEED REVIEW
                  </span>
                  <div className="size-5 rounded-[6.67px] bg-[#FFFAEB] flex items-center justify-center text-[#624C18]">
                    <RiAlertLine className="size-3.5 text-[#624C18]" />
                  </div>
                </div>
                <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                  {needReviewCount || 0}
                </span>
              </div>
            </div>

            {/* 6 Category Schedule Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
              {/* Card 1: Right to work */}
              <div
                onClick={() => router.push("/compliance/rtw-checks")}
                className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between h-[78px] hover:border-neutral-300 hover:shadow-x-small transition-all group cursor-pointer"
              >
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
                        <span>{totalCases} people</span>
                        <span className="text-[#D1D1D1]">•</span>
                        <span>{overdueCount + dueSoonCount} items</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-[#FFFAEB] text-[#624C18] rounded-full px-2 py-0.5 text-[11px] font-medium tracking-[0.02em] uppercase">
                      85%
                    </span>
                    <div className="size-6 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#5C5C5C] group-hover:bg-[#EBEBEB] transition-colors">
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
              <div
                onClick={() => router.push("/compliance/documents?category=contract")}
                className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between h-[78px] hover:border-neutral-300 hover:shadow-x-small transition-all group cursor-pointer"
              >
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
                    <div className="size-6 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#5C5C5C] group-hover:bg-[#EBEBEB] transition-colors">
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
              <div
                onClick={() => router.push("/compliance/logs")}
                className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between h-[78px] hover:border-neutral-300 hover:shadow-x-small transition-all group cursor-pointer"
              >
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
                    <div className="size-6 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#5C5C5C] group-hover:bg-[#EBEBEB] transition-colors">
                      <RiArrowRightSLine className="size-4 text-[#5C5C5C]" />
                    </div>
                  </div>
                </div>

                <div className="w-full pl-[36px] flex items-center h-1">
                  <div className="bg-[#1DAF61] h-1 rounded-full w-full" />
                </div>
              </div>

              {/* Card 4: Documents */}
              <div
                onClick={() => router.push("/compliance/documents")}
                className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between h-[78px] hover:border-neutral-300 hover:shadow-x-small transition-all group cursor-pointer"
              >
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
                        {warningCount > 0 ? `${warningCount} need review` : "All documents on file"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-[#E3F7EC] text-[#624C18] rounded-[8px] px-1.5 py-0.5 text-[11px] font-medium tracking-[0.02em] uppercase">
                      91%
                    </span>
                    <div className="size-6 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#5C5C5C] group-hover:bg-[#EBEBEB] transition-colors">
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
              <div
                onClick={() => router.push("/compliance/logs")}
                className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between h-[78px] hover:border-neutral-300 hover:shadow-x-small transition-all group cursor-pointer"
              >
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
                    <div className="size-6 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#5C5C5C] group-hover:bg-[#EBEBEB] transition-colors">
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
              <div
                onClick={() => router.push("/compliance/logs")}
                className="bg-white border border-[#EBEBEB] rounded-[12px] p-3 flex flex-col justify-between h-[78px] hover:border-neutral-300 hover:shadow-x-small transition-all group cursor-pointer"
              >
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
                    <div className="size-6 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#5C5C5C] group-hover:bg-[#EBEBEB] transition-colors">
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
              Assessed {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
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

            {/* Right count: N of Total */}
            <div className="flex items-center gap-4">
              <span className="text-[13px] leading-[20px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                {filteredTasks.length} of {tasks.length}
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
                  onClick={() => setCurrentPage((p) => Math.min(totalTaskPages, p + 1))}
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
              className={`h-5 px-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-none flex items-center justify-center transition-all cursor-pointer border-0 ${
                selectedTaskFilter === "ALL"
                  ? "bg-white text-[#171717] shadow-x-small"
                  : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              ALL ({tasks.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTaskFilter("HIGH")}
              className={`h-5 px-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-none transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5 ${
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
              className={`h-5 px-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-none transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5 ${
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
              className={`h-5 px-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-none transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5 ${
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
            {/* Table Header Row - Height 36px, background #F5F5F5 */}
            <div className="w-full bg-[#F5F5F5] rounded-[8px] h-9 px-4 grid grid-cols-12 items-center text-[12px] font-medium uppercase text-[#A4A4A4] tracking-[0.04em]">
              <div
                onClick={() => handleTaskSort("document")}
                className="col-span-5 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors"
              >
                <span>DOCUMENT</span>
                <SortIcon active={taskSortCol === "document"} direction={taskSortDir} />
              </div>
              <div
                onClick={() => handleTaskSort("migrant")}
                className="col-span-3 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors"
              >
                <span>MIGRANT</span>
                <SortIcon active={taskSortCol === "migrant"} direction={taskSortDir} />
              </div>
              <div
                onClick={() => handleTaskSort("status")}
                className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors"
              >
                <span>STATUS</span>
                <SortIcon active={taskSortCol === "status"} direction={taskSortDir} />
              </div>
              <div className="col-span-2 flex items-center justify-between pl-2">
                <div
                  onClick={() => handleTaskSort("dueDate")}
                  className="flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors"
                >
                  <span>DUE DATE</span>
                  <SortIcon active={taskSortCol === "dueDate"} direction={taskSortDir} />
                </div>
              </div>
            </div>

            {/* Task Rows */}
            {paginatedTasks.length === 0 ? (
              <div className="w-full bg-white rounded-[16px] p-8 text-center text-[#7B7B7B] text-[14px] shadow-x-small">
                No priority tasks pending.
              </div>
            ) : (
              paginatedTasks.map((t) => {
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
                            <AvatarFallback className="bg-[#EBEBEB] text-[#171717] text-[12px] font-medium">
                              {t.avatarText}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="size-10 rounded-full bg-[#EBEBEB] flex items-center justify-center text-[#171717] text-[12px] font-medium shrink-0">
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
                          <span className="text-[#5C5C5C]">{t.dueDate}</span>
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
                      <div className="bg-[#F5F5F5] rounded-[16px] p-5 flex items-center justify-between gap-5 h-[84px] transition-all animate-in fade-in-50 duration-150">
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
              })
            )}
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
            {/* Table Header - Height 36px, background #F5F5F5 */}
            <div className="w-full bg-[#F5F5F5] rounded-[8px] h-9 px-4 grid grid-cols-12 items-center text-[12px] font-medium uppercase text-[#A4A4A4] tracking-[0.04em]">
              <div
                onClick={() => handleMigrantSort("caseId")}
                className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors"
              >
                <span>CASE ID #</span>
                <SortIcon active={migrantSortCol === "caseId"} direction={migrantSortDir} />
              </div>
              <div
                onClick={() => handleMigrantSort("name")}
                className="col-span-4 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors"
              >
                <span>NAME</span>
                <SortIcon active={migrantSortCol === "name"} direction={migrantSortDir} />
              </div>
              <div
                onClick={() => handleMigrantSort("status")}
                className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors"
              >
                <span>STATUS</span>
                <SortIcon active={migrantSortCol === "status"} direction={migrantSortDir} />
              </div>
              <div
                onClick={() => handleMigrantSort("nextRtw")}
                className="col-span-2 flex items-center gap-1.5 cursor-pointer hover:text-[#171717] transition-colors"
              >
                <span>NEXT RTW</span>
                <SortIcon active={migrantSortCol === "nextRtw"} direction={migrantSortDir} />
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
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/cases/${m.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/cases/${m.id}`);
                    }
                  }}
                  className="w-full bg-white rounded-[16px] p-1 h-[72px] grid grid-cols-12 items-center px-4 hover:bg-neutral-50/50 transition-colors shadow-[0px_1px_2px_rgba(10,13,20,0.03)] border border-white cursor-pointer"
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
                        <AvatarFallback className="bg-[#EBEBEB] text-[#171717] text-[12px] font-medium">
                          {m.avatarText}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="size-10 rounded-full bg-[#EBEBEB] flex items-center justify-center text-[#171717] text-[12px] font-medium shrink-0">
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
                  <div
                    className="col-span-2 flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                        <DropdownMenuItem onClick={() => router.push(`/cases/${m.id}`)}>
                          <RiUserLine className="size-4 mr-2" />
                          <span>View Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/cases/${m.id}?tab=Documents`)}
                        >
                          <RiFileTextLine className="size-4 mr-2" />
                          <span>View Documents</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/compliance/rtw-checks")}>
                          <RiRefreshLine className="size-4 mr-2" />
                          <span>Run RTW Check</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleExportSummary(m)}>
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
