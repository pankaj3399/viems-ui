"use client";

import * as React from "react";
import {
  RiAlertLine,
  RiArrowRightSLine,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiTimer2Line,
  RiArrowUpDownLine,
  RiArrowDownSLine,
  RiCalendarLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

// ─── Donut Chart Component ──────────────────────────────────
function ComplianceDonutChart({ percentage = 100 }: { percentage?: number }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  const strokeColor = clamped >= 80 ? "#10B981" : clamped >= 50 ? "#F6B51E" : "#FB3748";

  return (
    <div className="relative size-[67px] flex items-center justify-center shrink-0">
      <svg width="67" height="67" viewBox="0 0 67 67" className="rotate-[-90deg]">
        <circle
          cx="33.5"
          cy="33.5"
          r={radius}
          fill="none"
          stroke="#EBEBEB"
          strokeWidth="8"
        />
        <circle
          cx="33.5"
          cy="33.5"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

interface PriorityTaskItem {
  id: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  badgeBg: string;
  badgeText: string;
  statusText: string;
  statusColor: string;
  dueDate: string;
}

export function ComplianceTab({
  id,
  onNavigateTab,
}: {
  id?: string;
  onNavigateTab?: (tab: string) => void;
}) {
  const [priorityFilter, setPriorityFilter] = React.useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [caseData, setCaseData] = React.useState<any>(null);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [files, setFiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    const caseId = id;
    let isCancelled = false;

    async function loadComplianceData() {
      try {
        setLoading(true);
        const [caseRes, tasksRes, filesRes] = await Promise.allSettled([
          apiClient.get<any>(ENDPOINTS.cases.byId(caseId)),
          apiClient.get<any>(`${ENDPOINTS.tasks.base}?caseId=${caseId}`),
          apiClient.get<any>(`${ENDPOINTS.files.base}/list/cases/${caseId}`),
        ]);

        if (!isCancelled) {
          if (caseRes.status === "fulfilled" && caseRes.value) {
            setCaseData(caseRes.value);
          }
          if (tasksRes.status === "fulfilled") {
            const raw = tasksRes.value;
            const taskArr = Array.isArray(raw) ? raw : raw?.data || raw?.tasks || [];
            setTasks(taskArr);
          }
          if (filesRes.status === "fulfilled" && Array.isArray(filesRes.value)) {
            setFiles(filesRes.value);
          }
        }
      } catch (err) {
        console.error("Failed to load compliance data:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadComplianceData();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  // Calculations
  const completedTasks = tasks.filter((t) => t.isCompleted || t.completed || t.status === "completed").length;
  const totalTasks = Math.max(tasks.length, 1);
  const totalDocs = Math.max(files.length, 1);
  const uploadedDocs = files.filter((f) => f.status === "uploaded" || !f.status).length;
  const missingDocs = Math.max(0, totalDocs - uploadedDocs);

  const healthScore = Math.round(((completedTasks + uploadedDocs) / (totalTasks + totalDocs)) * 100);

  // Remaining eVisa days calculation
  const expiryDateString =
    caseData?.visaExpiryDate ||
    caseData?.expiryDate ||
    caseData?.migrant?.visaExpiryDate ||
    caseData?.cosExpiryDate;
  const daysLeft = expiryDateString
    ? Math.max(0, Math.ceil((new Date(expiryDateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 325;

  // Derive priority tasks dynamically
  const dynamicPriorityTasks: PriorityTaskItem[] = React.useMemo(() => {
    if (tasks.length > 0) {
      return tasks
        .filter((t) => !t.isCompleted && !t.completed && t.status !== "completed")
        .map((t, idx) => {
          const isHigh = t.status === "crucial" || idx === 0;
          const isMed = t.status === "under_review" || idx === 1;
          const priority: "HIGH" | "MEDIUM" | "LOW" = isHigh ? "HIGH" : isMed ? "MEDIUM" : "LOW";
          return {
            id: String(t.id || `pt-${idx}`),
            title: t.title || t.name || "Pending Compliance Action",
            priority,
            badgeBg: isHigh ? "bg-[#FFEBEC]" : isMed ? "bg-[#FFFAEB]" : "bg-[#F5F5F5]",
            badgeText: isHigh ? "text-[#681219]" : isMed ? "text-[#624C18]" : "text-[#5C5C5C]",
            statusText: isHigh ? "Needs attention" : "Pending action",
            statusColor: isHigh ? "text-[#FB3748]" : isMed ? "text-[#E6A819]" : "text-[#5C5C5C]",
            dueDate: expiryDateString ? `Due ${new Date(expiryDateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : "Due soon",
          };
        });
    }

    // Default dynamic tasks based on case status if no specific task records
    return [
      {
        id: "pt1",
        title: "Complete right-to-work check",
        priority: "HIGH",
        badgeBg: "bg-[#FFEBEC]",
        badgeText: "text-[#681219]",
        statusText: "Immediate action",
        statusColor: "text-[#FB3748]",
        dueDate: "Due in 28 days",
      },
      {
        id: "pt2",
        title: "Verify contact & address details",
        priority: "MEDIUM",
        badgeBg: "bg-[#FFFAEB]",
        badgeText: "text-[#624C18]",
        statusText: "Review required",
        statusColor: "text-[#E6A819]",
        dueDate: "Due next week",
      },
    ];
  }, [tasks, expiryDateString]);

  const filteredTasks = React.useMemo(() => {
    if (priorityFilter === "ALL") return dynamicPriorityTasks;
    return dynamicPriorityTasks.filter((t) => t.priority === priorityFilter);
  }, [dynamicPriorityTasks, priorityFilter]);

  const highCount = dynamicPriorityTasks.filter((t) => t.priority === "HIGH").length;
  const medCount = dynamicPriorityTasks.filter((t) => t.priority === "MEDIUM").length;
  const lowCount = dynamicPriorityTasks.filter((t) => t.priority === "LOW").length;

  return (
    <div className="w-full flex flex-col gap-8 font-sans animate-fade-in text-left max-w-[1104px] mx-auto">
      {/* ─── Top Banner: Attention Needed ──────────────────────────────────── */}
      <div className="w-full bg-[#FFF5EB] border border-[#FDE8D3] rounded-[12px] px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 text-[13px] text-[#171717] font-medium">
          <RiAlertLine className="size-4 text-[#FB3748] shrink-0" />
          <span>Attention needed · {dynamicPriorityTasks.length} action{dynamicPriorityTasks.length !== 1 ? "s" : ""} need attention · </span>
          <span className="text-[#FB3748] font-bold">{highCount} high risk</span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onNavigateTab) onNavigateTab("Tasks");
          }}
          className="text-[13px] font-medium text-[#171717] underline hover:text-black flex items-center gap-1 cursor-pointer bg-transparent border-0"
        >
          Review actions <RiArrowRightSLine className="size-4" />
        </button>
      </div>

      {/* ─── Top Stats & Widgets Row ─────── */}
      <div className="flex items-stretch gap-3 w-full">
        {/* Widget 1: COMPLIANCE HEALTH (Donut Chart) */}
        <div className="bg-white border border-[#F5F5F5] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[16px] p-3 flex flex-col justify-between items-center w-[189px] h-[204px] shrink-0">
          <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] text-center leading-[12px]">
            COMPLIANCE HEALTH
          </span>

          <div className="flex flex-col items-center gap-1 my-auto">
            <ComplianceDonutChart percentage={healthScore} />
            <span className="font-aeonik-medium text-[24px] font-medium text-[#171717] leading-[32px] mt-1">
              {healthScore}%
            </span>
            <span className="text-[13px] text-[#7B7B7B] font-normal leading-[20px]">
              {tasks.length - completedTasks} tasks • {missingDocs} docs
            </span>
          </div>
        </div>

        {/* 2x2 Grid for Top Stat Cards */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          {/* Card 2: DOCUMENTS */}
          <div className="bg-[#EFEBFF] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[98px] relative">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
                DOCUMENTS
              </span>
              <span className="font-aeonik-medium text-[24px] font-medium text-[#351A75] leading-[32px]">
                {uploadedDocs}/{totalDocs}
              </span>
            </div>
            <span className="text-[13px] text-[#7B7B7B] font-normal">{missingDocs} missing</span>
            <RiFileTextLine className="size-5 text-[#5C5C5C] absolute top-3 right-4" />
          </div>

          {/* Card 3: TASKS COMPLETED */}
          <div className="bg-[#E3F7EC] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[98px] relative">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
                TASKS COMPLETED
              </span>
              <span className="font-aeonik-medium text-[24px] font-medium text-[#171717] leading-[32px]">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <span className="text-[13px] text-[#7B7B7B] font-normal">{totalTasks - completedTasks} remaining</span>
            <RiCheckboxCircleLine className="size-5 text-[#5C5C5C] absolute top-3 right-4" />
          </div>

          {/* Card 4: OPEN ACTIONS */}
          <div className="bg-[#FFFAEB] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[98px] relative">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
                OPEN ACTIONS
              </span>
              <span className="font-aeonik-medium text-[24px] font-medium text-[#624C18] leading-[32px]">
                {dynamicPriorityTasks.length}
              </span>
            </div>
            <span className="text-[13px] text-[#7B7B7B] font-normal">Immediate action</span>
            <RiAlertLine className="size-5 text-[#681219] absolute top-3 right-4" />
          </div>

          {/* Card 5: RISKS */}
          <div className="bg-[#FFEBEC] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[98px] relative">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
                RISKS
              </span>
              <span className="font-aeonik-medium text-[24px] font-medium text-[#681219] leading-[32px]">
                {highCount}
              </span>
            </div>
            <span className="text-[13px] text-[#7B7B7B] font-normal">{highCount > 0 ? `${highCount} critical` : "No critical"}</span>
            <RiTimer2Line className="size-5 text-[#5C5C5C] absolute top-3 right-4" />
          </div>
        </div>

        {/* Widget 6: EVISA REMAINING */}
        <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[12px_20px] flex flex-col justify-between w-[449px] h-[204px] shrink-0 shadow-2xs">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
              EVISA REMAINING
            </span>
            <span className="font-aeonik-medium text-[24px] font-medium text-[#171717] leading-[32px]">
              {daysLeft}d left
            </span>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-[#7D52F4] rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.max(5, (daysLeft / 365) * 100))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[13px] text-[#5C5C5C] mt-1">
              <span>Today</span>
              <span>{expiryDateString ? new Date(expiryDateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "31 Mar 2027"}</span>
            </div>
          </div>

          {/* Footer Details */}
          <div className="flex flex-col gap-1 pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#5C5C5C]">Case Type</span>
              <span className="font-medium text-[#171717]">{caseData?.migrant?.visaType || caseData?.visaType || "Skilled Worker"}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#5C5C5C]">Status</span>
              <span className="font-medium text-[#171717]">{caseData?.status || "Active compliance"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Middle Section: Priority Tasks & Risk Profile ──────────────────── */}
      <div className="flex items-start gap-6 w-full">
        {/* Left Column: Priority Tasks */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717]">
              Priority tasks
            </h3>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onNavigateTab && onNavigateTab("Tasks")}
              className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer bg-transparent border-0 p-0 h-auto"
            >
              Go to Tasks
            </Button>
          </div>

          {/* Filter Pills Bar */}
          <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-4 flex flex-col gap-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-full text-[11px] font-medium uppercase tracking-[0.02em]">
                <button
                  type="button"
                  onClick={() => setPriorityFilter("ALL")}
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                    priorityFilter === "ALL" ? "bg-white text-[#171717] shadow-2xs" : "text-[#5C5C5C] hover:text-[#171717] hover:bg-white/60"
                  }`}
                >
                  ALL ({dynamicPriorityTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter("HIGH")}
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1.5 ${
                    priorityFilter === "HIGH" ? "bg-white text-[#171717] shadow-2xs" : "text-[#5C5C5C] hover:text-[#171717] hover:bg-white/60"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-[#FB3748]" />
                  HIGH ({highCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter("MEDIUM")}
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1.5 ${
                    priorityFilter === "MEDIUM" ? "bg-white text-[#171717] shadow-2xs" : "text-[#5C5C5C] hover:text-[#171717] hover:bg-white/60"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-[#F6B51E]" />
                  MEDIUM ({medCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter("LOW")}
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1.5 ${
                    priorityFilter === "LOW" ? "bg-white text-[#171717] shadow-2xs" : "text-[#5C5C5C] hover:text-[#171717] hover:bg-white/60"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-[#7B7B7B]" />
                  LOW ({lowCount})
                </button>
              </div>

              <div className="flex items-center gap-1 text-[12px] text-[#A4A4A4]">
                <span>ACTION</span>
                <span className="ml-4">DUE</span>
                <RiArrowUpDownLine className="size-3.5 text-[#A4A4A4]" />
              </div>
            </div>

            {/* Task Rows */}
            <div className="flex flex-col gap-2">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-6 text-[13px] text-[#7B7B7B]">
                  No tasks matching selected priority
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-white border border-[#EBEBEB] rounded-[12px] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-6 rounded-[8px] ${task.badgeBg} ${task.badgeText} flex items-center justify-center font-bold text-[12px] shrink-0`}
                      >
                        !
                      </div>
                      <span className="text-[14px] font-medium text-[#171717]">
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 text-[14px] font-medium ${task.statusColor}`}>
                        <RiCalendarLine className={`size-4 ${task.statusColor}`} />
                        <span>{task.statusText}</span>
                      </div>
                      <span className="text-[13px] text-[#5C5C5C]">{task.dueDate}</span>
                      <button
                        type="button"
                        onClick={() => onNavigateTab && onNavigateTab("Tasks")}
                        aria-label={`View task details for ${task.title}`}
                        className="size-6 rounded-full bg-[#F5F5F5] hover:bg-neutral-200 flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors border-0 cursor-pointer"
                      >
                        <RiArrowRightSLine className="size-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Risk Profile */}
        <div className="w-[350px] shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717]">
              Risk profile
            </h3>
          </div>

          <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-4 flex flex-col gap-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-[#171717]">Overall exposure</span>
                <span className="text-[12px] text-[#7B7B7B]">
                  {highCount} high • {medCount} medium
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  highCount > 0
                    ? "bg-[#FFEBEC] text-[#FB3748]"
                    : medCount > 0
                    ? "bg-[#FFFAEB] text-[#B45309]"
                    : "bg-[#E3F7EC] text-[#0B4627]"
                }`}
              >
                {highCount > 0 ? "▲ HIGH" : medCount > 0 ? "▲ MEDIUM" : "LOW"}
              </span>
            </div>

            {/* Risk Items */}
            <div className="flex flex-col gap-3 text-[13px]">
              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="font-medium text-[#171717]">Immigration status</span>
                  <span className="text-[11px] text-[#7B7B7B]">
                    {caseData?.status || "Active compliance"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        highCount > 0 ? "w-[75%] bg-[#FB3748]" : "w-[100%] bg-[#10B981]"
                      }`}
                    />
                  </div>
                  <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="font-medium text-[#171717]">Documents</span>
                  <span className="text-[11px] text-[#7B7B7B]">{missingDocs} unfiled</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        missingDocs > 0 ? "w-[50%] bg-[#F6B51E]" : "w-[100%] bg-[#10B981]"
                      }`}
                    />
                  </div>
                  <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="font-medium text-[#171717]">Employment conditions</span>
                  <span className="text-[11px] text-[#7B7B7B]">Verified</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                    <div className="w-[100%] h-full bg-[#10B981] rounded-full" />
                  </div>
                  <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="font-medium text-[#171717]">Reporting duties</span>
                  <span className="text-[11px] text-[#7B7B7B]">Up to date</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                    <div className="w-[100%] h-full bg-[#10B981] rounded-full" />
                  </div>
                  <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 text-[11px] text-[#A4A4A4]">
              Real-time automated compliance evaluation
            </div>
          </div>
        </div>
      </div>

      {/* ─── Compliance Breakdown Section ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 w-full">
        <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717]">
          Compliance breakdown
        </h3>

        <div className="bg-white border border-[#F5F5F5] rounded-[16px] divide-y divide-neutral-100 overflow-hidden shadow-2xs">
          {/* Header Row */}
          <div className="bg-[#F5F5F5] px-4 py-2.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.04em] text-[#A4A4A4]">
            <span className="w-1/3">CHECK</span>
            <div className="w-1/3 flex items-center gap-1">
              <span>STATUS</span>
              <RiArrowUpDownLine className="size-3" />
            </div>
            <div className="w-1/3 flex items-center justify-end gap-1">
              <span>DUE</span>
              <RiArrowUpDownLine className="size-3" />
            </div>
          </div>

          {/* Table Rows */}
          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Right to work</span>
            <div className="w-1/3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                highCount > 0 ? "bg-[#FFEBEC] text-[#FB3748]" : "bg-[#E3F7EC] text-[#0B4627]"
              }`}>
                {highCount > 0 ? "AT RISK" : "COMPLIANT"}
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>Within 28 days</span>
              <RiArrowDownSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Contact details</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#E3F7EC] text-[#0B4627] text-[10px] font-bold uppercase tracking-wider">
                COMPLIANT
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>Verified</span>
              <RiArrowDownSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Salary &amp; role</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#E3F7EC] text-[#0B4627] text-[10px] font-bold uppercase tracking-wider">
                COMPLIANT
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>Verified</span>
              <RiArrowDownSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Absence monitoring</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#E3F7EC] text-[#0B4627] text-[10px] font-bold uppercase tracking-wider">
                COMPLIANT
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>Active</span>
              <RiArrowDownSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Required Documents Section ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center justify-between">
          <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717]">
            Required documents
          </h3>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onNavigateTab && onNavigateTab("Documents")}
            className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer bg-transparent border-0 p-0 h-auto"
          >
            Go to Documents
          </Button>
        </div>

        <div className="bg-white border border-[#F5F5F5] rounded-[16px] divide-y divide-neutral-100 overflow-hidden shadow-2xs">
          {/* Header Row */}
          <div className="bg-[#F5F5F5] px-4 py-2.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.04em] text-[#A4A4A4]">
            <span className="w-1/3">DOCUMENT</span>
            <div className="w-1/3 flex items-center gap-1">
              <span>STATUS</span>
              <RiArrowUpDownLine className="size-3" />
            </div>
            <div className="w-1/3 flex items-center justify-end gap-1">
              <span>EXPIRY</span>
              <RiArrowUpDownLine className="size-3" />
            </div>
          </div>

          {/* Document Rows */}
          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Right to work share code</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#FFFAEB] text-[#B45309] text-[10px] font-bold uppercase tracking-wider">
                IN PROGRESS
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>—</span>
              <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Proof of address</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#E3F7EC] text-[#0B4627] text-[10px] font-bold uppercase tracking-wider">
                VERIFIED
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>—</span>
              <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Passport</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#E3F7EC] text-[#0B4627] text-[10px] font-bold uppercase tracking-wider">
                VERIFIED
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>{expiryDateString ? new Date(expiryDateString).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Valid"}</span>
              <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
