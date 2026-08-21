"use client";

import * as React from "react";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiUploadLine,
  RiAddLine,
  RiFoldersLine,
  RiCheckboxCircleLine,
  RiFileWarningLine,
  RiTaskLine,
  RiFileTextLine,
  RiCalendarEventLine,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { formatFullName, formatTitleCase, getInitials, classifyCaseStage, getCaseAction } from "@/lib/utils";
import { mapBackendCaseToRow, getMappedCasesWithOverrides, isCaseRefused } from "@/lib/case-mapper";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { useRouter } from "next/navigation";
import { ImportMigrantsModal } from "./components/ImportMigrantsModal";
import { AddEventModal } from "./components/AddEventModal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Helper to parse Year, Month (0-indexed), and Day without UTC timezone shifts
function parseLocalDateParts(dateStr: string | number | Date): { year: number; month: number; day: number } {
  if (typeof dateStr === "string") {
    const rawDate = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const parts = rawDate.split("-").map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      return { year: parts[0], month: parts[1] - 1, day: parts[2] };
    }
  }
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

const MONTH_NAMES_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function formatActivityTime(dateStr: string): string {
  if (!dateStr) return "RECENTLY";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "RECENTLY";
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeFormatted = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
  
  if (isToday) {
    return `TODAY, ${timeFormatted}`;
  }
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `YESTERDAY, ${timeFormatted}`;
  }
  return `${date.getDate()} ${MONTH_NAMES_SHORT[date.getMonth()]}, ${timeFormatted}`;
}

// Top Stat Metric Card matching Figma: width: 270px, height: 70px, p: 12px 16px, rounded: 8px
function TopMetricCard({
  title,
  value,
  icon: Icon,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white rounded-[8px] p-[12px_16px] h-[70px] flex flex-col justify-between relative transition-all text-left w-full group cursor-pointer border border-transparent hover:border-[#EBEBEB] hover:bg-neutral-50/40 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] hover:shadow-md"
    >
      <span className="text-[11px] font-medium tracking-[0.02em] text-[#171717] uppercase leading-[12px]">
        {title}
      </span>
      <span className="text-[24px] font-medium text-[#171717] leading-[32px] font-aeonik-medium">
        {value}
      </span>
      <Icon className="size-5 text-[#5C5C5C] absolute top-[8px] right-[16px] transition-colors group-hover:text-[#7D52F4]" />
    </button>
  );
}

// Task Card matching Figma: Schedule Cards [Schedule] [1.1], height: 76px, p: 16px 12px, rounded: 12px, border: #EBEBEB
function TaskItem({
  title,
  owner,
  due,
  dotColor,
  onClick,
}: {
  title: string;
  owner: string;
  due: string;
  dotColor: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-row items-center p-[16px_12px] gap-[12px] bg-white border border-[#EBEBEB] rounded-[12px] hover:border-[#7D52F4]/40 hover:bg-[#FAFAFA] transition-all cursor-pointer w-full group text-left h-[76px]"
    >
      <div className="flex flex-row items-center gap-[12px] flex-1 min-w-0">
        <div className="flex items-center justify-center p-[6px] size-[18px] shrink-0">
          <div className={`w-[6px] h-[6px] rounded-full ${dotColor}`} />
        </div>
        <div className="flex flex-col gap-[2px] flex-1 min-w-0">
          <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em] group-hover:text-[#7D52F4] transition-colors truncate">
            {title}
          </span>
          <div className="flex items-center gap-[6px] text-[13px] text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
            <span className="font-normal truncate">{owner}</span>
            <span className="text-[9px] text-[#5C5C5C]">•</span>
            <span className="font-normal truncate">{due ? `Due ${due}` : "Action required"}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center size-6 bg-[#F5F5F5] group-hover:bg-[#7D52F4] rounded-full shrink-0 transition-colors">
        <RiArrowRightSLine className="size-5 text-[#5C5C5C] group-hover:text-white transition-colors" />
      </div>
    </button>
  );
}

// Activity Item matching Figma: Feeds with timeline avatar, title, subtitle & vertical connector
function ActivityItem({
  avatarText,
  avatarBg,
  title,
  owner,
  time,
  isLast,
  onClick,
}: {
  avatarText: string;
  avatarBg: string;
  title: string;
  owner: string;
  time: string;
  isLast?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="relative flex items-start gap-[12px] w-full min-h-[48px] text-left">
      {/* Vertical timeline divider line */}
      {!isLast && (
        <div className="absolute left-[16px] top-[32px] bottom-[-8px] w-px bg-[#EBEBEB] z-0" />
      )}
      <div className={`size-8 rounded-full ${avatarBg} flex items-center justify-center shrink-0 z-10 text-[12px] font-medium text-[#171717]`}>
        {avatarText}
      </div>
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col gap-[2px] min-w-0 flex-1 pt-[2px] pb-[8px] px-1.5 -mx-1.5 rounded-[8px] hover:bg-neutral-50/60 text-left border-0 bg-transparent cursor-pointer group transition-colors"
      >
        <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] leading-[20px] group-hover:text-[#7D52F4] transition-colors truncate">
          {title}
        </span>
        <div className="flex items-center gap-[6px] leading-[16px]">
          <span className="text-[13px] font-normal text-[#7B7B7B] tracking-[-0.006em] truncate">{owner}</span>
          <span className="text-[8px] font-medium text-[#A4A4A4] uppercase">•</span>
          <span className="text-[11px] font-medium text-[#A4A4A4] tracking-[0.02em] uppercase truncate">{time}</span>
        </div>
      </button>
    </div>
  );
}

// ─── Dashboard types ──────────────────────────────────────────────────────────
interface DashboardStats {
  migrants: { in: number; out: number; active: number };
  tasksStats: { high: number; medium: number; low: number };
  leadsStats: { high: number; medium: number; low: number };
  leave: { expiring7Days: number; expiring14Days: number };
}

interface RawTaskItem {
  id: number;
  caseId?: number;
  caseNumber?: string;
  migrantId?: number;
  firstName?: string;
  lastName?: string;
  priority?: number | string;
  name?: Array<{ value: string; title: string }> | string;
  title?: string;
  creation_date?: string;
  dueDate?: string;
  status?: string;
}

interface DashboardEvent {
  id: number;
  title: string;
  date: string;
  color?: string;
  action?: string;
  eventType?: string;
  migrantName?: string;
  initials?: string;
  actionText?: string;
  caseId?: number;
}

interface CalendarData {
  [timestamp: string]: {
    id: string;
    migrantId: number;
    migrantName: string;
    workStartDate: string;
    workEndDate: string;
    cosNumber: string;
    isVisaEnd: boolean;
  }[];
}

interface LogEntry {
  id: number;
  userName: string;
  action: string;
  entityName: string;
  entityIdentifier: string;
  creationDate: string;
  newValue?: string;
  oldValue?: string;
}

interface UserProfile {
  id: number;
  email: string;
  name?: string;
  personalInfo?: {
    firstName: string;
    lastName: string;
  };
}

interface LeaveAlertItem {
  id: string | number;
  name: string;
  initials: string;
  avatarBg: string;
  daysLeft: string;
  caseId?: number;
}

export default function DashboardPage() {
  const router = useRouter();

  // ── State ────────────────────────────────────────────────────────────────
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [casesList, setCasesList] = React.useState<any[]>([]);
  const [tasksList, setTasksList] = React.useState<RawTaskItem[]>([]);
  const [calendarData, setCalendarData] = React.useState<CalendarData>({});
  const [events, setEvents] = React.useState<DashboardEvent[]>([]);
  const [userInfo, setUserInfo] = React.useState<UserProfile | null>(null);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);
  const [activeTaskTab, setActiveTaskTab] = React.useState<"open" | "missing">("open");
  const [hoveredPipelineSegment, setHoveredPipelineSegment] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Modals & Calendar Navigation State
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [addEventModalOpen, setAddEventModalOpen] = React.useState(false);
  const [modalInitialDate, setModalInitialDate] = React.useState<string | undefined>(undefined);
  
  // Current calendar month view
  const [displayedMonth, setDisplayedMonth] = React.useState(() => new Date());
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

  // Dynamic greeting based on current local time
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const currentDateFormatted = React.useMemo(() => {
    return new Date().toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  // ── Data Fetching ────────────────────────────────────────────────────────
  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);

      const monthStart = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
      const monthEnd = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0);
      const fmt = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      };

      const [
        statsRes,
        casesRes,
        tasksRes,
        calRes,
        eventsRes,
        userInfoRes,
        logsRes,
      ] = await Promise.allSettled([
        apiClient.get<DashboardStats>(ENDPOINTS.statistics.dashboard, { params: { filter: "all" } }),
        apiClient.get<any[]>(ENDPOINTS.cases.base),
        apiClient.get<{ data: RawTaskItem[]; count: number } | RawTaskItem[]>(ENDPOINTS.tasks.base),
        apiClient.get<CalendarData>(ENDPOINTS.dashboard.calendar, {
          params: { from: fmt(monthStart), to: fmt(monthEnd) },
        }),
        apiClient.get<DashboardEvent[]>(ENDPOINTS.dashboard.events),
        apiClient.get<UserProfile>(ENDPOINTS.users.userInfo),
        apiClient.get<{ logs: LogEntry[]; count: number } | LogEntry[]>(ENDPOINTS.logs.base, {
          params: { take: "8", sort_by: "date.desc" },
        }),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats(statsRes.value);
      }
      if (casesRes.status === "fulfilled") {
        const raw = casesRes.value;
        const arr = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
        setCasesList(arr);
      }
      if (tasksRes.status === "fulfilled") {
        const raw = tasksRes.value;
        const arr = Array.isArray(raw) ? raw : (raw as any)?.data ?? [];
        setTasksList(arr);
      }
      if (calRes.status === "fulfilled" && calRes.value) {
        setCalendarData(calRes.value);
      }
      if (eventsRes.status === "fulfilled") {
        const evts = Array.isArray(eventsRes.value) ? eventsRes.value : (eventsRes.value as any)?.data ?? [];
        setEvents(evts);
      }
      if (userInfoRes.status === "fulfilled" && userInfoRes.value) {
        setUserInfo(userInfoRes.value);
      }
      if (logsRes.status === "fulfilled") {
        const raw = logsRes.value;
        const arr = Array.isArray(raw) ? raw : (raw as any)?.logs ?? (raw as any)?.data ?? [];
        setLogs(arr);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [displayedMonth]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Month Navigation for Calendar ───────────────────────────────────────
  const handlePrevMonth = () => {
    setDisplayedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setDisplayedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  // ── Derived Profile Information ──────────────────────────────────────────
  const userDisplayName = React.useMemo(() => {
    if (userInfo?.personalInfo?.firstName) {
      return userInfo.personalInfo.firstName;
    }
    if (userInfo?.name) {
      return userInfo.name.split(" ")[0];
    }
    return "Alex";
  }, [userInfo]);

  const userInitials = React.useMemo(() => {
    if (userInfo?.personalInfo?.firstName || userInfo?.personalInfo?.lastName) {
      return getInitials(formatFullName(userInfo?.personalInfo?.firstName, userInfo?.personalInfo?.lastName));
    }
    if (userInfo?.name) {
      return getInitials(userInfo.name);
    }
    return "AM";
  }, [userInfo]);

  // ── Mapped Cases (Unified with Cases Page) ────────────────────────────────
  const mappedCases = React.useMemo(() => {
    return getMappedCasesWithOverrides(casesList);
  }, [casesList, mounted]);

  // ── Real Dynamic Metrics ─────────────────────────────────────────────────
  const activeCasesCount = React.useMemo(() => {
    return mappedCases.filter((c) => !isCaseRefused(c)).length;
  }, [mappedCases]);

  const visaApprovedCount = React.useMemo(() => {
    return mappedCases.filter((c) => c.status === "Visa Approved").length;
  }, [mappedCases]);

  const awaitingDecisionCount = React.useMemo(() => {
    return mappedCases.filter((c) => c.status === "Awaiting applicant docs").length;
  }, [mappedCases]);

  const totalTasksCount = React.useMemo(() => {
    return mappedCases.filter(
      (c) => !isCaseRefused(c) && c.actionColor !== "gray" && c.action !== "No action required"
    ).length;
  }, [mappedCases]);

  // ── Missing Documents & Tasks Filtering ──────────────────────────────────
  const missingDocsTasks = React.useMemo(() => {
    return tasksList.filter((t) => {
      if (Array.isArray(t.name) && t.name.length > 0) return true;
      const title = String(t.title || "").toLowerCase();
      return title.includes("doc") || title.includes("upload") || title.includes("msd") || title.includes("passport");
    });
  }, [tasksList]);

  const displayedTasks = React.useMemo(() => {
    const list = activeTaskTab === "missing" ? missingDocsTasks : tasksList;
    return list.map((t, idx) => {
      const migrantName = formatFullName(t.firstName, t.lastName) || (typeof t.name === "string" ? formatTitleCase(t.name) : "") || "Migrant";
      let title = t.title;
      if (!title && Array.isArray(t.name) && t.name.length > 0) {
        title = `Upload ${t.name.map((n) => n.title || n.value).join(", ")}`;
      } else if (!title) {
        title = "Complete RTW check";
      }

      let dotColor = "bg-[#335CFF]";
      const p = Number(t.priority);
      if (p === 3 || String(t.priority).toLowerCase() === "high") {
        dotColor = "bg-[#FB3748]";
      } else if (p === 2 || String(t.priority).toLowerCase() === "medium") {
        dotColor = "bg-[#F6B51E]";
      }

      let dueDateFormatted = "Soon";
      if (t.dueDate || t.creation_date) {
        const d = new Date(t.dueDate || t.creation_date!);
        if (!isNaN(d.getTime())) {
          dueDateFormatted = `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]}`;
        }
      }

      return {
        id: t.id || idx,
        caseId: t.caseId,
        title,
        owner: migrantName,
        due: dueDateFormatted,
        dotColor,
      };
    });
  }, [activeTaskTab, tasksList, missingDocsTasks]);

  // ── Real Leave To Remain Alerts ──────────────────────────────────────────
  const leaveAlertsList = React.useMemo<LeaveAlertItem[]>(() => {
    const alerts: LeaveAlertItem[] = [];

    casesList.forEach((c) => {
      const expiry = c.visaEndDate || c.workEndDate || c.visa_expiry_date || c.leave_to_remain_expiry || c.passport_expiry_date;
      if (expiry) {
        const expDate = new Date(expiry);
        if (!isNaN(expDate.getTime())) {
          const diffMs = expDate.getTime() - Date.now();
          const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (days > 0 && days <= 180) {
            const name = formatFullName(c.first_name, c.last_name) || formatTitleCase(c.name) || "Migrant";
            alerts.push({
              id: c.id,
              name,
              initials: getInitials(name) || "M",
              avatarBg: days <= 14 ? "bg-[#FFD9C0] text-[#78350F]" : days <= 45 ? "bg-[#E1FBF2] text-[#0B4627]" : "bg-[#EBEBEB] text-[#171717]",
              daysLeft: `${days} days`,
              caseId: c.id,
            });
          }
        }
      }
    });

    alerts.sort((a, b) => parseInt(a.daysLeft) - parseInt(b.daysLeft));
    return alerts.slice(0, 5);
  }, [casesList]);

  // ── Real Case Pipeline Calculation ───────────────────────────────────────
  const pipelineSegments = React.useMemo(() => {
    let preCos = 0;
    let cosMgmt = 0;
    let visa = 0;
    let active = 0;

    casesList.forEach((c) => {
      const stage = classifyCaseStage(c);
      if (stage === "PRE-COS") preCos++;
      else if (stage === "COS MANAGEMENT") cosMgmt++;
      else if (stage === "VISA") visa++;
      else if (stage === "ACTIVE") active++;
    });

    const total = preCos + cosMgmt + visa + active;

    if (total === 0) {
      return [
        { id: "pre-cos", color: "bg-[#335CFF]", pct: 25, label: "PRE-COS", count: 0 },
        { id: "cos-mgmt", color: "bg-[#7D52F4]", pct: 25, label: "COS MANAGEMENT", count: 0 },
        { id: "visa", color: "bg-[#F6B51E]", pct: 25, label: "VISA", count: 0 },
        { id: "active", color: "bg-[#1FC16B]", pct: 25, label: "ACTIVE", count: 0 },
      ];
    }

    const pctPre = Math.max(8, (preCos / total) * 100);
    const pctCos = Math.max(8, (cosMgmt / total) * 100);
    const pctVisa = Math.max(8, (visa / total) * 100);
    const pctActive = Math.max(8, (active / total) * 100);
    const sum = pctPre + pctCos + pctVisa + pctActive;

    return [
      { id: "pre-cos", color: "bg-[#335CFF]", pct: (pctPre / sum) * 100, label: "PRE-COS", count: preCos },
      { id: "cos-mgmt", color: "bg-[#7D52F4]", pct: (pctCos / sum) * 100, label: "COS MANAGEMENT", count: cosMgmt },
      { id: "visa", color: "bg-[#F6B51E]", pct: (pctVisa / sum) * 100, label: "VISA", count: visa },
      { id: "active", color: "bg-[#1FC16B]", pct: (pctActive / sum) * 100, label: "ACTIVE", count: active },
    ];
  }, [casesList]);

  // ── Real Calendar Events Calculation ─────────────────────────────────────
  const combinedCalendarEvents = React.useMemo<DashboardEvent[]>(() => {
    const list: DashboardEvent[] = [...events];

    // Merge backend calendar CoS schedule events
    Object.entries(calendarData).forEach(([tsStr, items]) => {
      const date = new Date(Number(tsStr));
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const dateKey = `${y}-${m}-${d}`;

      items.forEach((item, i) => {
        list.push({
          id: Number(`999${i}${date.getDate()}`),
          title: item.isVisaEnd ? "Visa Expiry" : "CoS Assignment",
          migrantName: item.migrantName,
          initials: getInitials(item.migrantName) || "M",
          actionText: item.isVisaEnd ? "Check RTW" : "Assign CoS",
          date: dateKey,
          color: item.isVisaEnd ? "bg-[#FB3748]" : "bg-[#7D52F4]",
          caseId: item.migrantId,
        });
      });
    });

    return list;
  }, [events, calendarData]);

  const calendarDotDays = React.useMemo(() => {
    const result: Record<number, string> = {};

    combinedCalendarEvents.forEach((evt) => {
      if (!evt.date) return;
      const parts = parseLocalDateParts(evt.date);
      if (parts.month === displayedMonth.getMonth() && parts.year === displayedMonth.getFullYear()) {
        result[parts.day] = evt.color ?? "bg-[#7D52F4]";
      }
    });

    return result;
  }, [combinedCalendarEvents, displayedMonth]);

  const currentEventsList = React.useMemo(() => {
    if (selectedDay !== null) {
      return combinedCalendarEvents.filter((e) => {
        const parts = parseLocalDateParts(e.date);
        return parts.day === selectedDay &&
               parts.month === displayedMonth.getMonth() &&
               parts.year === displayedMonth.getFullYear();
      });
    }
    // Default upcoming events sorted by date
    return [...combinedCalendarEvents]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [combinedCalendarEvents, selectedDay, displayedMonth]);

  const openAddEventForDay = (dayNum?: number) => {
    if (dayNum) {
      const targetDate = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), dayNum);
      const y = targetDate.getFullYear();
      const m = String(targetDate.getMonth() + 1).padStart(2, "0");
      const d = String(dayNum).padStart(2, "0");
      setModalInitialDate(`${y}-${m}-${d}`);
    } else {
      setModalInitialDate(undefined);
    }
    setAddEventModalOpen(true);
  };

  return (
    <div className="flex flex-col font-sans bg-[#F5F5F5] min-h-screen text-left">
      {/* ─── Top White Section Header (Rectangle 7 & Section Header [1.1]) ─── */}
      <div className="bg-white rounded-t-[16px] px-[40px] py-[32px] flex items-center justify-between border-b border-[#EBEBEB] shrink-0">
        <div className="flex items-center gap-[20px]">
          {/* 48px Grey User Avatar */}
          <div className="size-[48px] rounded-full bg-[#EBEBEB] text-[#171717] flex items-center justify-center font-medium text-[12px] leading-none tracking-[-0.011em] shrink-0 shadow-sm">
            {userInitials}
          </div>
          <div className="flex flex-col gap-[4px]">
            <h1 className="text-[24px] text-[#171717] font-medium leading-[32px] font-aeonik-medium">
              {`${greeting}, ${userDisplayName}`}
            </h1>
            <p className="text-[14px] font-normal text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
              {currentDateFormatted}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-[12px]">
          {/* Import Button */}
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="flex items-center justify-center gap-[4px] w-[96px] h-[40px] p-[10px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] rounded-[10px] text-[14px] font-medium leading-[20px] tracking-[-0.006em] transition-all cursor-pointer border-0 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          >
            <RiUploadLine className="size-5 text-[#5C5C5C]" />
            Import
          </button>
          
          {/* + New migrant Button */}
          <Button 
            type="button"
            onClick={() => router.push("/migrants/create")}
            className="flex items-center justify-center gap-[4px] px-[12px] h-[36px] bg-[#7D52F4] hover:bg-[#6C3EE8] text-white rounded-[8px] text-[14px] font-medium leading-[20px] tracking-[-0.006em] transition-all cursor-pointer border-0 shadow-sm"
          >
            <RiAddLine className="size-5 text-white" />
            New migrant
          </Button>
        </div>
      </div>

      {/* ─── Main Content Container (Background: #F5F5F5) ─── */}
      <div className="p-[32px_40px_64px] flex flex-col gap-[24px] w-full">
        {/* Top 4 Metrics Stat Row */}
        <div className="grid grid-cols-4 gap-[8px] w-full">
          <TopMetricCard
            title="ACTIVE CASES"
            value={loading ? "…" : activeCasesCount}
            icon={RiFoldersLine}
            onClick={() => router.push("/cases")}
          />
          <TopMetricCard
            title="VISA APPROVED"
            value={loading ? "…" : visaApprovedCount}
            icon={RiCheckboxCircleLine}
            onClick={() => router.push("/cases?status=approved")}
          />
          <TopMetricCard
            title="AWAITING DECISION"
            value={loading ? "…" : awaitingDecisionCount}
            icon={RiFileWarningLine}
            onClick={() => router.push("/cases?status=awaiting_decision")}
          />
          <TopMetricCard
            title="OPEN TASKS"
            value={loading ? "…" : totalTasksCount}
            icon={RiTaskLine}
            onClick={() => router.push("/cases?quick=needs_action")}
          />
        </div>

        {/* ─── 2-Column Main Workspace Grid ─── */}
        <div className="grid grid-cols-12 gap-[24px] w-full items-start">
          {/* ── Left Column: Tasks + Recent Activity ── */}
          <div className="col-span-5 flex flex-col gap-[24px]">
            {/* Tasks Block */}
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex items-center justify-between w-full h-[30px]">
                <h2 className="text-[20px] font-medium text-[#171717] leading-[32px] font-aeonik-medium">
                  Tasks
                </h2>
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/cases?quick=needs_action")}
                  className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0 bg-transparent p-0 h-auto"
                >
                  Go to Cases
                </Button>
              </div>

              {/* Tasks Container */}
              <div className="bg-white border border-white rounded-[16px] p-[12px_16px_16px] flex flex-col gap-[12px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
                {/* 2 Sub-metrics inside Tasks */}
                <div className="flex flex-row items-center gap-[8px] w-full">
                  <button
                    type="button"
                    onClick={() => setActiveTaskTab("open")}
                    className={`flex flex-col items-start p-[12px_16px] gap-[2px] rounded-[8px] relative transition-all text-left cursor-pointer flex-1 h-[78px] border-0 ${
                      activeTaskTab === "open"
                        ? "bg-[#F5F5F5] ring-1 ring-[#171717]"
                        : "bg-[#F5F5F5] hover:bg-[#EBEBEB]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-medium text-[#171717] tracking-[0.02em] uppercase leading-[12px]">
                        OPEN TASKS
                      </span>
                      <RiTaskLine className="size-5 text-[#5C5C5C]" />
                    </div>
                    <span className="text-[24px] font-medium text-[#171717] leading-[32px] font-aeonik-medium">
                      {loading ? "…" : totalTasksCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTaskTab("missing")}
                    className={`flex flex-col items-start p-[12px_16px] gap-[2px] rounded-[8px] relative transition-all text-left cursor-pointer flex-1 h-[78px] border-0 ${
                      activeTaskTab === "missing"
                        ? "bg-[#F5F5F5] ring-1 ring-[#171717]"
                        : "bg-[#F5F5F5] hover:bg-[#EBEBEB]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-medium text-[#171717] tracking-[0.02em] uppercase leading-[12px]">
                        MISSING DOCS
                      </span>
                      <RiFileTextLine className="size-5 text-[#5C5C5C]" />
                    </div>
                    <span className="text-[24px] font-medium text-[#171717] leading-[32px] font-aeonik-medium">
                      {loading ? "…" : missingDocsTasks.length}
                    </span>
                  </button>
                </div>

                {/* Task List Items */}
                <div className="flex flex-col gap-[4px]">
                  {displayedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-[#5C5C5C]">
                      <RiTaskLine className="size-8 text-[#A4A4A4] mb-2" />
                      <span className="text-[14px] font-medium">No {activeTaskTab === "missing" ? "missing document" : "pending"} tasks</span>
                      <span className="text-[12px] text-[#A4A4A4] mt-1">All compliance records are up to date</span>
                    </div>
                  ) : (
                    displayedTasks.slice(0, 5).map((task) => (
                      <TaskItem
                        key={task.id}
                        title={task.title}
                        owner={task.owner}
                        due={task.due}
                        dotColor={task.dotColor}
                        onClick={() => router.push(task.caseId ? `/cases/${task.caseId}` : "/cases")}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity Block */}
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex items-center justify-between w-full h-[30px]">
                <h2 className="text-[20px] font-medium text-[#171717] leading-[32px] font-aeonik-medium">
                  Recent activity
                </h2>
                <button
                  type="button"
                  onClick={() => router.push("/compliance/logs")}
                  className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0 bg-transparent"
                >
                  View all
                </button>
              </div>

              {/* Recent Activity Container */}
              <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] flex flex-col gap-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
                <div className="flex flex-col gap-[8px]">
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-[#5C5C5C]">
                      <span className="text-[14px] font-medium">No recent logs recorded</span>
                    </div>
                  ) : (
                    logs.slice(0, 6).map((log, idx) => {
                      const actor = log.userName || "System";
                      const entity = log.entityName || "Record";
                      const actionText = log.action ? log.action.charAt(0).toUpperCase() + log.action.slice(1) : "Updated";
                      const idStr = log.entityIdentifier ? `#${log.entityIdentifier}` : "";
                      const title = `${actor} ${log.action || "updated"} ${entity} ${idStr}`.trim();
                      const timeStr = formatActivityTime(log.creationDate);
                      const initials = getInitials(actor) || "SY";

                      return (
                        <ActivityItem
                          key={log.id || idx}
                          avatarText={initials}
                          avatarBg="bg-[#EBEBEB] text-[#171717]"
                          title={title}
                          owner={actor}
                          time={timeStr}
                          isLast={idx === Math.min(logs.length, 6) - 1}
                          onClick={() => router.push("/compliance/logs")}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Calendar + Migrants Overview ── */}
          <div className="col-span-7 flex flex-col gap-[24px]">
            {/* Calendar Block */}
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex items-center justify-between w-full h-[30px]">
                <h2 className="text-[20px] font-medium text-[#171717] leading-[32px] font-aeonik-medium">
                  Calendar
                </h2>
              </div>

              {/* Calendar Container */}
              <div className="bg-white rounded-[20px] border border-[#EBEBEB] flex flex-col w-full overflow-hidden shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
                <div className="p-[20px] flex flex-col gap-[16px]">
                  {/* Calendar Top Header Row */}
                  <div className="flex items-center justify-between h-[36px]">
                    <span className="text-[12px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[16px]">
                      {`${MONTH_NAMES_SHORT[displayedMonth.getMonth()]} ${displayedMonth.getFullYear()}`}
                    </span>
                    <div className="flex items-center gap-[6px] bg-[#F5F5F5] rounded-[8px] p-[6px] h-[36px]">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        title="Previous Month"
                        className="size-6 flex items-center justify-center bg-white rounded-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] hover:bg-[#F0F0F0] transition-colors cursor-pointer border-0"
                      >
                        <RiArrowLeftSLine className="size-5 text-[#5C5C5C]" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        title="Next Month"
                        className="size-6 flex items-center justify-center bg-white rounded-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] hover:bg-[#F0F0F0] transition-colors cursor-pointer border-0"
                      >
                        <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="flex flex-col gap-[8px]">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-[8px] h-[36px]">
                      {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day, i) => (
                        <div key={i} className="flex items-center justify-center rounded-[10px]">
                          <span className="text-[12px] font-medium text-[#A4A4A4] tracking-[0.04em] uppercase leading-[16px] text-center">
                            {day}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Dates Cells */}
                    {(() => {
                      const firstDay = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
                      const startDay = (firstDay.getDay() + 6) % 7; // Monday-indexed
                      const totalDays = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0).getDate();
                      const cells: React.ReactNode[] = [];
                      const dotMap = calendarDotDays;

                      // Preceding empty cells
                      for (let e = 0; e < startDay; e++) {
                        cells.push(
                          <div key={`empty-${e}`} className="flex items-center justify-center h-[40px]" />
                        );
                      }

                      // Current month days
                      for (let d = 1; d <= totalDays; d++) {
                        const isSelected = selectedDay === d;
                        const dotColor = dotMap[d] || null;

                        cells.push(
                          <div key={d} className="flex items-center justify-center h-[40px]">
                            <button
                              type="button"
                              onClick={() => setSelectedDay(selectedDay === d ? null : d)}
                              className={`relative flex flex-col items-center justify-center size-[40px] rounded-[8px] cursor-pointer transition-all border-0 ${
                                isSelected
                                  ? "bg-[#262626] text-white shadow-sm"
                                  : "bg-white text-[#5C5C5C] hover:bg-[#F5F5F5]"
                              }`}
                            >
                              <span className={`text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-center ${isSelected ? "text-white" : "text-[#5C5C5C]"}`}>
                                {d}
                              </span>
                              {dotColor && (
                                <span
                                  className={`absolute bottom-[6px] w-[3px] h-[3px] rounded-full transition-all ${
                                    isSelected ? "bg-white" : dotColor
                                  }`}
                                />
                              )}
                            </button>
                          </div>
                        );
                      }

                      // Trailing next month cells
                      const totalCells = startDay + totalDays;
                      const remainingCells = (7 - (totalCells % 7)) % 7;
                      for (let n = 1; n <= remainingCells; n++) {
                        cells.push(
                          <div key={`next-${n}`} className="flex items-center justify-center h-[40px]">
                            <span className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-center text-[#D1D1D1]">
                              {n}
                            </span>
                          </div>
                        );
                      }

                      const rows: React.ReactNode[] = [];
                      for (let r = 0; r < cells.length; r += 7) {
                        rows.push(
                          <div key={`row-${r}`} className="grid grid-cols-7 gap-[8px]">
                            {cells.slice(r, r + 7)}
                          </div>
                        );
                      }
                      return rows;
                    })()}
                  </div>
                </div>

                {/* ── Lower Calendar Events Panel ── */}
                <div className="p-[4px] bg-white">
                  <div className="bg-[#F5F5F5] rounded-[16px] p-[20px_20px_16px] flex flex-col gap-[16px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[12px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[16px]">
                          {selectedDay !== null
                            ? `${selectedDay} ${MONTH_NAMES_SHORT[displayedMonth.getMonth()]} ${displayedMonth.getFullYear()}`
                            : "UPCOMING"}
                        </span>
                        <span className="inline-flex items-center justify-center min-w-[20px] h-[18px] bg-[#EBEBEB] rounded-[4px] px-[2px] text-[11px] font-medium text-[#171717] tracking-[0.02em] leading-[12px]">
                          {currentEventsList.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => openAddEventForDay(selectedDay ?? undefined)}
                        className="flex items-center gap-1 text-[12px] font-medium text-[#7D52F4] hover:text-[#6C3EE8] transition-colors cursor-pointer border-0 bg-transparent"
                      >
                        <RiAddLine className="size-4" />
                        Add event
                      </button>
                    </div>

                    <div className="flex flex-col gap-[16px]">
                      {currentEventsList.length === 0 ? (
                        <div className="flex items-center justify-center p-4 text-center text-[#5C5C5C] text-[13px]">
                          No events scheduled {selectedDay ? "on this date" : "upcoming"}
                        </div>
                      ) : (
                        currentEventsList.map((evt) => {
                          const parts = parseLocalDateParts(evt.date);
                          const dayNum = parts.day;
                          const monthStr = MONTH_NAMES_SHORT[parts.month] ?? "MAY";
                          const isUnderlined = evt.actionText === "Check RTW" || evt.title === "Check RTW";

                          return (
                            <div
                              key={evt.id}
                              className="flex items-center gap-[16px] h-[32px] w-full"
                            >
                              <div className="flex items-center gap-[16px] shrink-0">
                                <span className={`size-[6px] rounded-full ${evt.color ?? "bg-[#7D52F4]"} shrink-0`} />
                                
                                {/* Date badge: 31px x 32px stack */}
                                <div className="flex flex-col items-center justify-center p-[2px_4px] bg-[#F5F5F5] rounded-[4px] w-[31px] h-[32px] shrink-0">
                                  <span className="text-[10px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[16px] -my-[4px]">
                                    {dayNum}
                                  </span>
                                  <span className="text-[10px] font-medium text-[#A4A4A4] tracking-[0.04em] uppercase leading-[16px]">
                                    {monthStr}
                                  </span>
                                </div>
                              </div>

                              {/* Migrant Avatar & Info */}
                              <div className="flex items-center gap-[8px] flex-1 min-w-0">
                                <div className="size-8 rounded-full bg-[#EBEBEB] text-[#171717] font-medium text-[14px] flex items-center justify-center shrink-0">
                                  {evt.initials || "M"}
                                </div>
                                <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em] truncate">
                                  {evt.migrantName || evt.title}
                                </span>
                                <span className="text-[9px] text-[#5C5C5C] leading-[16px] shrink-0">•</span>
                                <button
                                  type="button"
                                  onClick={() => router.push(evt.caseId ? `/cases?caseId=${evt.caseId}` : "/cases")}
                                  className={`text-[13px] leading-[20px] tracking-[-0.006em] truncate cursor-pointer transition-colors border-0 bg-transparent p-0 ${
                                    isUnderlined
                                      ? "font-medium text-[#171717] underline hover:text-[#7D52F4]"
                                      : "font-normal text-[#5C5C5C] hover:text-[#171717]"
                                  }`}
                                >
                                  {evt.actionText || "View details"}
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Migrants Overview Block */}
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex items-center justify-between w-full h-[30px]">
                <h2 className="text-[20px] font-medium text-[#171717] leading-[32px] font-aeonik-medium">
                  Migrants overview
                </h2>
                <button
                  type="button"
                  onClick={() => router.push("/migrants")}
                  className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0 bg-transparent"
                >
                  View all
                </button>
              </div>

              {/* Split Card Overview */}
              <div className="flex flex-col w-full shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[16px] overflow-hidden">
                {/* Top Section: IN THE UK vs OUTSIDE UK */}
                <div className="bg-white border border-white p-[12px_16px_8px] rounded-t-[16px] flex flex-col gap-[12px] w-full">
                  <div className="flex items-center gap-[8px] w-full">
                    <button
                      type="button"
                      onClick={() => router.push("/migrants?location=uk")}
                      className="bg-[#E3F7EC] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[78px] flex-1 text-left relative transition-all cursor-pointer border-0 hover:opacity-90"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-medium text-[#171717] tracking-[0.02em] uppercase leading-[12px]">
                          IN THE UK
                        </span>
                        <RiTaskLine className="size-5 text-[#5C5C5C]" />
                      </div>
                      <span className="text-[24px] font-medium text-[#0B4627] leading-[32px] font-aeonik-medium">
                        {stats?.migrants?.in ?? 0}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push("/migrants?location=outside")}
                      className="bg-[#F5F5F5] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[78px] flex-1 text-left relative transition-all cursor-pointer border-0 hover:bg-[#EBEBEB]"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-medium text-[#171717] tracking-[0.02em] uppercase leading-[12px]">
                          OUTSIDE UK
                        </span>
                        <RiFileTextLine className="size-5 text-[#5C5C5C]" />
                      </div>
                      <span className="text-[24px] font-medium text-[#171717] leading-[32px] font-aeonik-medium">
                        {stats?.migrants?.out ?? 0}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Bottom Section: LEAVE TO REMAIN ALERTS */}
                <div className="bg-white p-[4px] rounded-b-[16px]">
                  <div className="bg-[#F5F5F5] rounded-[16px] p-[20px_20px_16px] flex flex-col gap-[20px]">
                    <span className="text-[12px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[16px]">
                      LEAVE TO REMAIN ALERTS
                    </span>

                    <div className="flex flex-col gap-[12px]">
                      {leaveAlertsList.length === 0 ? (
                        <div className="flex items-center justify-center p-3 text-center text-[#5C5C5C] text-[13px]">
                          No imminent leave to remain expiries recorded
                        </div>
                      ) : (
                        leaveAlertsList.map((alert) => (
                          <button
                            key={alert.id}
                            type="button"
                            onClick={() => router.push(alert.caseId ? `/cases?caseId=${alert.caseId}` : "/migrants")}
                            className="flex items-center justify-between w-full h-[28px] cursor-pointer border-0 bg-transparent px-1.5 -mx-1.5 rounded-[6px] hover:bg-neutral-50/70 group text-left transition-colors"
                          >
                            <div className="flex items-center gap-[8px]">
                              <div className={`size-6 rounded-full ${alert.avatarBg} font-medium text-[12px] flex items-center justify-center shrink-0`}>
                                {alert.initials}
                              </div>
                              <span className="text-[14px] font-medium text-[#171717] group-hover:text-[#7D52F4] transition-colors leading-[20px] tracking-[-0.006em]">
                                {alert.name}
                              </span>
                            </div>
                            <span className="text-[14px] font-medium text-[#171717] group-hover:text-[#7D52F4] transition-colors leading-[20px] tracking-[-0.006em]">
                              {alert.daysLeft}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Full-Width Section: Case Pipeline ─── */}
        <div className="flex flex-col gap-[12px] w-full mt-2">
          <div className="flex items-center justify-between w-full h-[30px]">
            <h2 className="text-[20px] font-medium text-[#171717] leading-[32px] font-aeonik-medium">
              Case pipeline
            </h2>
          </div>

          <div className="bg-white border border-white rounded-[16px] p-[12px_16px_16px] flex flex-col w-full shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
            {(() => {
              const segments = pipelineSegments;
              const currentSegment = segments.find((s) => s.id === (hoveredPipelineSegment || "cos-mgmt")) ?? segments[1];

              let left = 0;
              for (const s of segments) {
                if (s.id === currentSegment.id) {
                  left += s.pct / 2;
                  break;
                }
                left += s.pct;
              }

              return (
                <div className="relative w-full pt-[36px] pb-[6px]">
                  {/* Floating Dark Tooltip with Tail */}
                  <div
                    className="absolute top-0 flex flex-col items-center -translate-x-1/2 pointer-events-none z-20 transition-all duration-300 ease-out"
                    style={{ left: `${left}%` }}
                  >
                    <div className="bg-[#171717] text-white text-[12px] font-medium p-[4px_6px] rounded-[4px] flex items-center gap-[6px] shadow-[0px_12px_24px_rgba(14,18,27,0.06),0px_1px_2px_rgba(14,18,27,0.03)] uppercase tracking-[0.04em] leading-[16px] whitespace-nowrap">
                      <span>{currentSegment.label}</span>
                      <span className="bg-[#333333] size-[18px] min-w-[18px] flex items-center justify-center rounded-[4px] text-[11px] font-medium text-white leading-[12px]">
                        {currentSegment.count}
                      </span>
                    </div>
                    {/* Tail pointing down */}
                    <div className="w-2 h-1 bg-[#171717] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                  </div>

                  {/* Multi-segment Progress Bar with generous vertical hover target area */}
                  <div className="flex gap-[2px] w-full h-[20px] items-center">
                    {segments.map((seg) => {
                      const isActive = currentSegment.id === seg.id;
                      return (
                        <div
                          key={seg.id}
                          onClick={() => router.push(`/cases?stage=${encodeURIComponent(seg.label)}`)}
                          onMouseEnter={() => setHoveredPipelineSegment(seg.id)}
                          className="h-full flex items-center cursor-pointer group py-1"
                          style={{ width: `${seg.pct}%` }}
                          title={`${seg.label}: ${seg.count} cases`}
                        >
                          <div
                            className={`w-full h-[6px] rounded-[16px] ${seg.color} transition-all duration-200 ${
                              isActive
                                ? "h-[8px] opacity-100 shadow-sm brightness-110 ring-1 ring-black/10"
                                : "opacity-80 group-hover:opacity-100 group-hover:h-[8px]"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      <ImportMigrantsModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />

      <AddEventModal
        open={addEventModalOpen}
        onOpenChange={setAddEventModalOpen}
        initialDate={modalInitialDate}
        onAddEvent={async (newEvent) => {
          try {
            await apiClient.post<any>(ENDPOINTS.dashboard.events, {
              title: newEvent.title,
              notes: newEvent.title,
              date: newEvent.date.includes(" ") ? newEvent.date : `${newEvent.date} 09:00:00`,
              color: newEvent.color || "bg-[#7D52F4]",
              eventType: "Internal",
              action: "Call",
              duration: 30,
              employees: [],
              clients: [],
            });
            toast.success("Event scheduled successfully");
          } catch (e: any) {
            console.error("Backend event post error:", e);
            toast.error(e?.message || "Failed to schedule event");
          } finally {
            fetchDashboardData();
            const parts = parseLocalDateParts(newEvent.date);
            const monthStart = new Date(parts.year, parts.month, 1);
            setDisplayedMonth(monthStart);
            setSelectedDay(parts.day);
          }
        }}
      />
    </div>
  );
}
