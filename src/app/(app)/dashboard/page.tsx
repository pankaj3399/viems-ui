"use client";

import * as React from "react";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiUploadLine,
  RiAddLine,
  RiCheckboxCircleLine,
  RiBriefcaseLine,
} from "@remixicon/react";
import { FoldersLine, SelectBoxCircleLine, FileWarningLine, TaskLine } from "@/components/ui/custom-icons";
import { apiClient } from "@/lib/api-client";
import { formatFullName } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { useRouter } from "next/navigation";
import { ImportMigrantsModal } from "./components/ImportMigrantsModal";
import { AddEventModal } from "./components/AddEventModal";

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

// Sub-components
function MetricCard({
  title,
  value,
  icon: Icon,
  colorClass,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#EBEBEB] rounded-[16px] p-[16px_20px_20px] w-full h-[88px] flex flex-col justify-between relative shadow-[0px_1px_2px_rgba(10,13,20,0.03)] font-sans transition-all ${
        onClick ? "hover:border-[#7D52F4]/50 hover:shadow-md cursor-pointer group" : ""
      }`}
    >
      <span className="text-[11px] font-semibold tracking-[0.02em] text-[#171717] uppercase group-hover:text-[#7D52F4] transition-colors">
        {title}
      </span>
      <span className="text-[28px] font-medium text-[#171717] tracking-[-0.01em] leading-none mt-xs font-aeonik-medium">
        {value}
      </span>
      <Icon className={`size-5 text-[#5C5C5C] absolute top-3 right-3 transition-colors group-hover:text-[#7D52F4] ${colorClass ?? ""}`} />
    </div>
  );
}

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
    <div
      onClick={onClick}
      className="flex flex-row items-center py-[16px] px-[12px] gap-[12px] bg-white border border-[#EBEBEB] rounded-[12px] hover:border-[#7D52F4]/40 hover:bg-[#FAFAFA] transition-all cursor-pointer select-none w-full group"
    >
      <div className="flex flex-row items-center gap-[12px] flex-1 min-w-0">
        <div className="flex items-center justify-center p-[4px] shrink-0">
          <div className={`w-[6px] h-[6px] rounded-full ${dotColor}`} />
        </div>
        <div className="flex flex-col gap-[2px] flex-1 min-w-0">
          <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em] group-hover:text-[#7D52F4] transition-colors truncate">
            {title}
          </span>
          <div className="flex items-center gap-[6px] text-[13px] text-[#5C5C5C]">
            <span className="font-normal truncate">{owner}</span>
            <span className="text-[9px] text-[#A4A4A4]">•</span>
            <span className="font-normal truncate">Due {due}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center size-6 bg-[#F7F7F7] group-hover:bg-[#7D52F4] rounded-full shrink-0 transition-colors">
        <RiArrowRightSLine className="size-5 text-[#5C5C5C] group-hover:text-white transition-colors" />
      </div>
    </div>
  );
}

function ActivityItem({
  avatarText,
  avatarBg,
  title,
  owner,
  time,
  onClick,
}: {
  avatarText: string;
  avatarBg: string;
  title: string;
  owner: string;
  time: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-start gap-[12px] py-[12px] px-[8px] -mx-[8px] rounded-[8px] hover:bg-[#F9F9F9] transition-colors cursor-pointer border-b border-[#F5F5F5] last:border-0 relative font-sans group"
    >
      <div className={`size-8 rounded-full ${avatarBg} flex items-center justify-center shrink-0`}>
        <span className="text-[13px] font-medium">{avatarText}</span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] leading-[20px] group-hover:text-[#7D52F4] transition-colors truncate">
          {title}
        </span>
        <span className="text-[12px] font-semibold text-[#A4A4A4] tracking-[0.02em] uppercase leading-[16px]">
          <span className="text-[#7B7B7B] font-normal lowercase first-letter:uppercase">{owner}</span> • {time}
        </span>
      </div>
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

interface DashboardTask {
  id: number;
  title: string;
  priority: { id: number; value: string; name: string };
  case?: {
    id: number;
    migrant?: {
      user?: { personalInfo?: { firstName: string; lastName: string } };
    };
  };
  dueDate?: string;
  status?: { value: string };
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

interface SchedulerEvent {
  id: string;
  migrantName: string;
  cosNumber: string;
  workStartDate: string;
  workEndDate: string;
  isVisaEnd: boolean;
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

// Recent activity avatar colors pool
const AVATAR_BG_POOL = [
  "bg-[#EFEBFF] text-[#7D52F4]",
  "bg-[#FEE2E2] text-[#EF4444]",
  "bg-[#E1FBF2] text-[#10B981]",
  "bg-[#F5F5F5] text-[#171717]",
  "bg-[#FFF7ED] text-[#F59E0B]",
];

const MISSING_DOC_TASKS = [
  { id: 101, title: "Complete RTW check", owner: "Mei Chen", due: "13 May", dotColor: "bg-[#FB3748]" },
  { id: 102, title: "Upload Migrant Signed Docs (MSDs)", owner: "James Brown", due: "13 May", dotColor: "bg-[#F6B51E]" },
  { id: 103, title: "Upload documents", owner: "Ravi Patel", due: "13 May", dotColor: "bg-[#335CFF]" },
  { id: 104, title: "Review and report", owner: "Yash Parmar", due: "13 May", dotColor: "bg-[#FB3748]" },
  { id: 105, title: "Plan visa renewal", owner: "Taylor Johnson", due: "13 May", dotColor: "bg-[#335CFF]" },
];

const LOCAL_STORAGE_KEY = "viems_persisted_events";

export default function DashboardPage() {
  const router = useRouter();

  // ── State ────────────────────────────────────────────────────────────────
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [tasks, setTasks] = React.useState<DashboardTask[]>([]);
  const [calendarData, setCalendarData] = React.useState<CalendarData>({});
  const [userInfo, setUserInfo] = React.useState<UserProfile | null>(null);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [schedulerEvents, setSchedulerEvents] = React.useState<SchedulerEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTaskTab, setActiveTaskTab] = React.useState<"open" | "missing">("open");
  const [hoveredPipelineSegment, setHoveredPipelineSegment] = React.useState<string | null>(null);

  // Modals & Calendar Navigation State
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [addEventModalOpen, setAddEventModalOpen] = React.useState(false);
  const [modalInitialDate, setModalInitialDate] = React.useState<string | undefined>(undefined);
  const [displayedMonth, setDisplayedMonth] = React.useState(() => new Date());
  const [selectedDay, setSelectedDay] = React.useState<number | null>(null);

  const today = React.useMemo(() => new Date(), []);
  const currentDateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Default events matching Figma layout exactly
  const seedEvents = React.useMemo<DashboardEvent[]>(() => {
    const yr = today.getFullYear();
    const mo = String(today.getMonth() + 1).padStart(2, "0");
    return [
      { id: 1001, title: "Check RTW", migrantName: "Ami Monarch", initials: "AM", actionText: "Check RTW", date: `${yr}-${mo}-18`, color: "bg-[#FB3748]", caseId: 1 },
      { id: 1002, title: "Upload documents", migrantName: "James Brown", initials: "JB", actionText: "Upload documents", date: `${yr}-${mo}-18`, color: "bg-[#7D52F4]", caseId: 2 },
      { id: 1003, title: "Assign CoS", migrantName: "Ravi Patel", initials: "RP", actionText: "Assign CoS", date: `${yr}-${mo}-20`, color: "bg-[#7D52F4]", caseId: 3 },
      { id: 1004, title: "Upload documents", migrantName: "Taylor Johnson", initials: "TJ", actionText: "Upload documents", date: `${yr}-${mo}-25`, color: "bg-[#335CFF]", caseId: 4 },
      { id: 1005, title: "Assign CoS", migrantName: "Carlos Vega", initials: "CV", actionText: "Assign CoS", date: `${yr}-${mo}-28`, color: "bg-[#7D52F4]", caseId: 5 },
    ];
  }, [today]);

  const [events, setEvents] = React.useState<DashboardEvent[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        // Fallthrough
      }
    }
    return seedEvents;
  });

  const startOfToday = React.useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d.getTime();
  }, [today]);

  // ── Parallel data loading ────────────────────────────────────────────────
  React.useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const monthStart = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
        const monthEnd = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0);
        const fmt = (d: Date) => d.toISOString().split("T")[0];

        const [
          statsData, tasksData, calData, eventsData,
          userInfoData, logsData, schedulerData,
        ] = await Promise.allSettled([
          apiClient.get<DashboardStats>(ENDPOINTS.statistics.dashboard, {
            params: { filter: "all" },
          }),
          apiClient.get<{ data: DashboardTask[]; count: number } | DashboardTask[]>(
            ENDPOINTS.tasks.base
          ),
          apiClient.get<CalendarData>(ENDPOINTS.dashboard.calendar, {
            params: { from: fmt(monthStart), to: fmt(monthEnd) },
          }),
          apiClient.get<DashboardEvent[]>(ENDPOINTS.dashboard.events),
          apiClient.get<UserProfile>(ENDPOINTS.users.userInfo),
          apiClient.get<{ logs: LogEntry[]; count: number }>(ENDPOINTS.logs.base, {
            params: { take: "8", sort_by: "date.desc" },
          }),
          apiClient.get<SchedulerEvent[]>(ENDPOINTS.dashboard.schedule, {
            params: { from: fmt(today), to: fmt(monthEnd), filter: "all" },
          }),
        ]);

        if (statsData.status === "fulfilled") setStats(statsData.value);
        if (tasksData.status === "fulfilled") {
          const raw = tasksData.value;
          const arr = Array.isArray(raw) ? raw : raw.data ?? [];
          setTasks(arr);
        }
        if (calData.status === "fulfilled") setCalendarData(calData.value);
        if (eventsData.status === "fulfilled" && Array.isArray(eventsData.value) && eventsData.value.length > 0) {
          setEvents((prev) => {
            const apiItems = eventsData.value;
            const existingIds = new Set(prev.map(e => e.id));
            const merged = [...prev];
            apiItems.forEach(item => {
              if (!existingIds.has(item.id)) merged.push(item);
            });
            return merged;
          });
        }
        if (userInfoData.status === "fulfilled") setUserInfo(userInfoData.value);
        if (logsData.status === "fulfilled") {
          const raw = logsData.value as any;
          const arr = Array.isArray(raw) ? raw : (raw?.logs ?? raw?.data ?? []);
          setLogs(arr);
        }
        if (schedulerData.status === "fulfilled") setSchedulerEvents(schedulerData.value ?? []);

      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Month Navigation for Calendar ───────────────────────────────────────
  const handlePrevMonth = () => {
    setDisplayedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setDisplayedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  React.useEffect(() => {
    async function fetchMonthCalendar() {
      const monthStart = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
      const monthEnd = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0);
      const fmt = (d: Date) => d.toISOString().split("T")[0];
      try {
        const cal = await apiClient.get<CalendarData>(ENDPOINTS.dashboard.calendar, {
          params: { from: fmt(monthStart), to: fmt(monthEnd) },
        });
        if (cal) setCalendarData(cal);
      } catch (err) {
        console.error("Calendar month fetch failed:", err);
      }
    }
    fetchMonthCalendar();
  }, [displayedMonth]);

  // ── Derived values ───────────────────────────────────────────────────────

  // Greeting
  const firstName = userInfo?.personalInfo?.firstName ?? userInfo?.name ?? null;
  const greeting = React.useMemo(() => {
    const h = today.getHours();
    const salutation = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    return firstName ? `${salutation}, ${firstName}` : salutation;
  }, [firstName, today]);

  const activeCasesCount   = stats?.migrants?.active ?? "13";
  const visaApprovedCount  = stats?.leave?.expiring14Days ?? "6";
  const awaitingDecisionCount = stats?.migrants?.out ?? "2";
  const totalTasksCount    = tasks.length ||
    ((stats?.tasksStats?.high ?? 0) + (stats?.tasksStats?.medium ?? 0) + (stats?.tasksStats?.low ?? 0)) || 24;

  // Priority → dot colour
  const PRIORITY_COLORS: Record<string, string> = {
    "3": "bg-[#FB3748]", "2": "bg-[#F6B51E]", "1": "bg-[#335CFF]",
    high: "bg-[#FB3748]", medium: "bg-[#F6B51E]", low: "bg-[#335CFF]",
  };

  function taskDotColor(task: DashboardTask): string {
    const pVal = String(task.priority?.id ?? task.priority?.value ?? "1");
    return PRIORITY_COLORS[pVal] ?? PRIORITY_COLORS[task.priority?.name?.toLowerCase() ?? "low"] ?? "bg-[#335CFF]";
  }

  function taskOwnerName(task: DashboardTask): string {
    const pi = task.case?.migrant?.user?.personalInfo;
    if (!pi) return "Mei Chen";
    return formatFullName(pi.firstName, pi.lastName);
  }

  function taskDueLabel(task: DashboardTask): string {
    if (!task.dueDate) return "13 May";
    return new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  // Calendar dots computed robustly using parseLocalDateParts to eliminate UTC shift bugs!
  const calendarDotDays = React.useMemo(() => {
    const result: Record<number, string> = {};

    // 1. From backend calendarData (visa end dates / milestones)
    Object.entries(calendarData).forEach(([tsStr, items]) => {
      if (!items.length) return;
      const d = new Date(Number(tsStr));
      const parts = parseLocalDateParts(d);
      if (parts.month === displayedMonth.getMonth() && parts.year === displayedMonth.getFullYear()) {
        const hasVisaEnd = items.some((i) => i.isVisaEnd);
        result[parts.day] = hasVisaEnd ? "bg-[#FB3748]" : "bg-[#7D52F4]";
      }
    });

    // 2. From events list (scheduled events & newly added reminders)
    events.forEach((evt) => {
      if (!evt.date) return;
      const parts = parseLocalDateParts(evt.date);
      if (parts.month === displayedMonth.getMonth() && parts.year === displayedMonth.getFullYear()) {
        const colorClass = evt.color ?? "bg-[#7D52F4]";
        if (!result[parts.day] || result[parts.day] !== "bg-[#FB3748]") {
          result[parts.day] = colorClass;
        }
      }
    });

    return result;
  }, [calendarData, events, displayedMonth]);

  // Upcoming events: sorted by date & filtered by startOfToday or selectedDay
  const upcomingEvents = React.useMemo(() => {
    let filtered = [...events];

    if (selectedDay !== null) {
      filtered = filtered.filter((e) => {
        const parts = parseLocalDateParts(e.date);
        return parts.day === selectedDay &&
               parts.month === displayedMonth.getMonth() &&
               parts.year === displayedMonth.getFullYear();
      });
    } else {
      filtered = filtered.filter((e) => {
        const parts = parseLocalDateParts(e.date);
        const eventTime = new Date(parts.year, parts.month, parts.day, 12, 0, 0).getTime();
        return eventTime >= startOfToday;
      });
    }
    return filtered
      .sort((a, b) => {
        const pa = parseLocalDateParts(a.date);
        const pb = parseLocalDateParts(b.date);
        return new Date(pa.year, pa.month, pa.day).getTime() - new Date(pb.year, pb.month, pb.day).getTime();
      })
      .slice(0, 10);
  }, [events, startOfToday, selectedDay, displayedMonth]);

  // Recent activity: map logs to display rows
  const activityRows = React.useMemo(() => {
    if (logs.length > 0) {
      return logs.slice(0, 6).map((log, i) => {
        const userName = log.userName ?? "System";
        const nameParts = userName.split(" ");
        const initials = nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
          : userName.slice(0, 2).toUpperCase();
        const avatarBg = AVATAR_BG_POOL[i % AVATAR_BG_POOL.length];
        const d = log.creationDate ? new Date(log.creationDate) : null;
        const timeLabel = d && !isNaN(d.getTime())
          ? d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
          : "TODAY, 01:12 PM";
        const actionText = log.action ? log.action.charAt(0).toUpperCase() + log.action.slice(1) : "Activity updated";
        const entityStr = log.entityName ? ` — ${log.entityName}` : "";
        const idStr = log.entityIdentifier ? ` #${log.entityIdentifier}` : "";
        const title = `${actionText}${entityStr}${idStr}`;
        return { initials, avatarBg, title, owner: userName, time: timeLabel };
      });
    }
    // Default seed rows matching Figma layout
    return [
      { initials: "TJ", avatarBg: "bg-[#EFEBFF] text-[#7D52F4]", title: "Taylor Johnson arrived in the UK", owner: "Nathan Wood", time: "TODAY, 01:12 PM" },
      { initials: "JP", avatarBg: "bg-[#FEE2E2] text-[#EF4444]", title: "Visa refused for Jin Park", owner: "System", time: "23 MAR, 09:30 AM" },
      { initials: "SR", avatarBg: "bg-[#E1FBF2] text-[#10B981]", title: "CoS assigned for Sofia Reyes", owner: "System", time: "TODAY, 01:12 PM" },
      { initials: "MS", avatarBg: "bg-[#F5F5F5] text-[#171717]", title: "Eligibility cleared for Maria Santos", owner: "System", time: "TODAY, 01:12 PM" },
      { initials: "CV", avatarBg: "bg-[#FFF7ED] text-[#F59E0B]", title: "SMS report submitted for Carlos Vega", owner: "System", time: "23 MAR, 09:30 AM" },
      { initials: "TJ", avatarBg: "bg-[#EFEBFF] text-[#7D52F4]", title: "Phone call with Taylor Johnson", owner: "Nathan Wood", time: "TODAY, 01:12 PM" },
    ];
  }, [logs]);

  // Leave to Remain: expiring visa cases from scheduler, within 60 days
  const ltrAlerts = React.useMemo(() => {
    if (schedulerEvents.length > 0) {
      const nowTime = Date.now();
      return schedulerEvents
        .filter((e) => {
          const end = new Date(e.workEndDate ?? e.workStartDate ?? 0).getTime();
          const diff = end - nowTime;
          return diff > 0 && diff <= 60 * 24 * 3600 * 1000;
        })
        .sort((a, b) => {
          const aEnd = new Date(a.workEndDate ?? a.workStartDate ?? 0).getTime();
          const bEnd = new Date(b.workEndDate ?? b.workStartDate ?? 0).getTime();
          return aEnd - bEnd;
        })
        .slice(0, 5)
        .map((e) => {
          const end = new Date(e.workEndDate ?? e.workStartDate ?? 0);
          const daysLeft = Math.ceil((end.getTime() - nowTime) / (24 * 3600 * 1000));
          const nameParts = (e.migrantName ?? "Unknown").split(" ");
          const initials = nameParts.length >= 2
            ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
            : nameParts[0].slice(0, 2).toUpperCase();
          const isUrgent = daysLeft <= 14;
          return { name: e.migrantName ?? "Unknown", initials, daysLeft, isUrgent };
        });
    }
    // Default seed rows matching Figma layout
    return [
      { name: "Sofia Reyez", initials: "SR", daysLeft: 7, isUrgent: true },
      { name: "James Brown", initials: "JB", daysLeft: 14, isUrgent: true },
      { name: "Mei Cheng", initials: "MC", daysLeft: 37, isUrgent: false },
      { name: "Carlos Vega", initials: "CV", daysLeft: 40, isUrgent: false },
      { name: "Ravi Patel", initials: "RP", daysLeft: 40, isUrgent: false },
    ];
  }, [schedulerEvents]);

  // Case pipeline: derive from stats task/migrant counts
  const pipelineSegments = React.useMemo(() => {
    const high = stats?.tasksStats?.high ?? 26;
    const medium = stats?.tasksStats?.medium ?? 14.5;
    const low = stats?.tasksStats?.low ?? 14.5;
    const active = stats?.migrants?.active ?? 45;
    const total = high + medium + low + active || 100;
    return [
      { color: "bg-[#335CFF]", pct: (high / total) * 100, label: "PRE-COS", count: high },
      { color: "bg-[#7D52F4]", pct: (medium / total) * 100, label: "COS MANAGEMENT", count: 3 },
      { color: "bg-[#F6B51E]", pct: (low / total) * 100, label: "VISA", count: low },
      { color: "bg-[#1FC16B]", pct: (active / total) * 100, label: "ACTIVE", count: active },
    ];
  }, [stats]);

  // Helper to open Add Event modal for a specific date
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
    <div className="px-[40px] py-[32px] pb-[80px] flex flex-col gap-xl font-sans bg-[#F7F7F7] min-h-screen text-left select-none">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-xl shrink-0">
        <div>
          <h1 className="text-[28px] text-[#171717] tracking-[-0.01em] leading-[36px] font-aeonik-medium">
            {greeting}
          </h1>
          <p className="text-[14px] text-[#7B7B7B] tracking-[-0.006em] mt-0.5 leading-[20px] font-sans">
            {currentDateStr}
          </p>
        </div>
        <div className="flex items-center gap-md">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-xs px-xl py-lg h-9 bg-white border border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] hover:border-neutral-300 rounded-[10px] text-[14px] font-semibold leading-[20px] tracking-[-0.006em] transition-all cursor-pointer shadow-xs"
          >
            <RiUploadLine className="size-4 text-[#5C5C5C]" />
            Import
          </button>
          <button 
            onClick={() => router.push("/migrants/create")}
            className="flex items-center gap-xs px-xl py-lg h-9 bg-[#7D52F4] hover:bg-brand-dark text-white rounded-[10px] text-[14px] font-semibold leading-[20px] tracking-[-0.006em] transition-all cursor-pointer shadow-xs"
          >
            <RiAddLine className="size-4 text-white" />
            New migrant
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-[16px] w-full">
        <MetricCard
          title="ACTIVE CASES"
          value={activeCasesCount}
          icon={FoldersLine}
          onClick={() => router.push("/cases?status=active")}
        />
        <MetricCard
          title="VISA APPROVED"
          value={visaApprovedCount}
          icon={SelectBoxCircleLine}
          onClick={() => router.push("/compliance/rtw-checks")}
        />
        <MetricCard
          title="AWAITING DECISION"
          value={awaitingDecisionCount}
          icon={FileWarningLine}
          onClick={() => router.push("/cases?status=awaiting_decision")}
        />
        <MetricCard
          title="OPEN TASKS"
          value={loading ? "…" : totalTasksCount}
          icon={TaskLine}
          onClick={() => router.push("/cases")}
        />
      </div>

      {/* Grid Split: Left (Tasks + Activity) | Right (Calendar + Overview) */}
      <div className="grid grid-cols-12 gap-[24px] w-full items-start">
        {/* Left Column: Tasks + Recent Activity */}
        <div className="col-span-5 flex flex-col gap-[24px]">
          {/* Tasks Card Block */}
          <div className="flex flex-col gap-[12px] w-full">
            <div className="flex items-center justify-between w-full h-[30px]">
              <span className="text-[20px] text-[#171717] tracking-[-0.006em] font-aeonik-medium">
                Tasks
              </span>
              <button 
                onClick={() => router.push("/cases")}
                className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer"
              >
                Go to Cases
              </button>
            </div>

            <div className="bg-white border border-white rounded-[16px] p-[12px_16px_16px] flex flex-col gap-[12px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
              <div className="flex flex-row items-center gap-[8px] w-full">
                <button
                  type="button"
                  onClick={() => setActiveTaskTab("open")}
                  className={`flex flex-col items-start p-[12px_16px] gap-[2px] rounded-[8px] relative transition-all text-left cursor-pointer flex-1 ${
                    activeTaskTab === "open"
                      ? "bg-[#F7F7F7] ring-1 ring-[#262626]"
                      : "bg-[#F7F7F7] hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-medium text-[#171717] tracking-[0.02em] uppercase leading-[12px]">
                      OPEN TASKS
                    </span>
                    <TaskLine className="size-5 text-[#5C5C5C]" />
                  </div>
                  <span className="text-[24px] font-medium text-[#171717] leading-[32px] font-aeonik-medium">
                    {loading ? "…" : totalTasksCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTaskTab("missing")}
                  className={`flex flex-col items-start p-[12px_16px] gap-[2px] rounded-[8px] relative transition-all text-left cursor-pointer flex-1 ${
                    activeTaskTab === "missing"
                      ? "bg-[#F7F7F7] ring-1 ring-[#262626]"
                      : "bg-[#F7F7F7] hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-medium text-[#171717] tracking-[0.02em] uppercase leading-[12px]">
                      MISSING DOCS
                    </span>
                    <FileWarningLine className="size-5 text-[#5C5C5C]" />
                  </div>
                  <span className="text-[24px] font-medium text-[#171717] leading-[32px] font-aeonik-medium">
                    52
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-[8px]">
                {activeTaskTab === "open" ? (
                  <>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-[76px] bg-neutral-50 border border-[#EBEBEB] rounded-[12px] animate-pulse" />
                      ))
                    ) : tasks.length > 0 ? (
                      tasks.slice(0, 5).map((task) => (
                        <TaskItem
                          key={task.id}
                          title={task.title}
                          owner={taskOwnerName(task)}
                          due={taskDueLabel(task)}
                          dotColor={taskDotColor(task)}
                          onClick={() => router.push(task.case?.id ? `/cases/${task.case.id}` : "/cases")}
                        />
                      ))
                    ) : (
                      MISSING_DOC_TASKS.map((t) => (
                        <TaskItem
                          key={t.id}
                          title={t.title}
                          owner={t.owner}
                          due={t.due}
                          dotColor={t.dotColor}
                          onClick={() => router.push("/cases")}
                        />
                      ))
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-[8px]">
                    {MISSING_DOC_TASKS.map((t) => (
                      <TaskItem
                        key={t.id}
                        title={t.title}
                        owner={t.owner}
                        due={t.due}
                        dotColor={t.dotColor}
                        onClick={() => router.push("/compliance/documents")}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity Card Block */}
          <div className="flex flex-col gap-[12px] w-full">
            <div className="flex items-center justify-between w-full h-[30px]">
              <span className="text-[20px] text-[#171717] tracking-[-0.006em] font-aeonik-medium">
                Recent activity
              </span>
              <button
                onClick={() => router.push("/compliance/logs")}
                className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] flex flex-col gap-xl shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
              <div className="flex flex-col">
                {activityRows.map((row, i) => (
                  <ActivityItem
                    key={i}
                    avatarText={row.initials}
                    avatarBg={row.avatarBg}
                    title={row.title}
                    owner={row.owner}
                    time={row.time}
                    onClick={() => router.push("/compliance/logs")}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar + Migrants Overview */}
        <div className="col-span-7 flex flex-col gap-[24px]">
          {/* Calendar Card Block */}
          <div className="flex flex-col gap-[12px] w-full">
            <div className="flex items-center justify-between w-full h-[30px]">
              <span className="text-[20px] text-[#171717] tracking-[-0.006em] font-aeonik-medium">
                Calendar
              </span>
            </div>

            <div className="bg-white rounded-[20px] flex flex-col w-full overflow-hidden border border-[#EBEBEB]">
              <div className="p-[20px] flex flex-col gap-[16px]">
                {/* Header row: Period label + Month Navigation */}
                <div className="flex items-center gap-sm">
                  <div className="flex items-center py-sm pr-sm flex-1">
                    <span className="text-[12px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[16px]">
                      {displayedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-[6px] bg-[#F5F5F5] rounded-[8px] p-[6px]">
                    <button
                      onClick={handlePrevMonth}
                      title="Previous Month"
                      className="size-6 flex items-center justify-center bg-white rounded-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] hover:bg-[#F0F0F0] transition-colors cursor-pointer"
                    >
                      <RiArrowLeftSLine className="size-5 text-[#5C5C5C]" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      title="Next Month"
                      className="size-6 flex items-center justify-center bg-white rounded-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] hover:bg-[#F0F0F0] transition-colors cursor-pointer"
                    >
                      <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex flex-col gap-sm">
                  <div className="grid grid-cols-7 gap-sm">
                    {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day, i) => (
                      <div key={i} className="flex items-center justify-center h-[36px] rounded-[10px]">
                        <span className="text-[12px] font-medium text-[#A4A4A4] tracking-[0.04em] uppercase leading-[16px] text-center">
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const firstDay = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
                    const startDay = (firstDay.getDay() + 6) % 7;
                    const totalDays = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0).getDate();
                    const isCurrentMonth = today.getMonth() === displayedMonth.getMonth() && today.getFullYear() === displayedMonth.getFullYear();
                    const cells: React.ReactNode[] = [];
                    const dotMap = calendarDotDays;

                    for (let e = 0; e < startDay; e++) {
                      cells.push(
                        <div key={`empty-${e}`} className="flex items-center justify-center h-[40px] rounded-[8px]" />
                      );
                    }

                    for (let d = 1; d <= totalDays; d++) {
                      const isToday = isCurrentMonth && d === today.getDate();
                      const isSelected = selectedDay === d;
                      const dotColor = dotMap[d] || null;
                      const hasEvent = Boolean(dotColor);

                      let textColor = "text-[#5C5C5C]";
                      if (isSelected) textColor = "text-white";
                      else if (isToday) textColor = "text-[#7D52F4] font-bold";
                      else if (hasEvent) textColor = "text-[#171717] font-semibold";

                      cells.push(
                        <div key={d} className="flex items-center justify-center h-[40px]">
                          <div
                            onClick={() => setSelectedDay(selectedDay === d ? null : d)}
                            className={`relative flex flex-col items-center justify-center rounded-[10px] cursor-pointer transition-all ${
                              isSelected
                                ? "size-[40px] bg-[#262626] text-white shadow-sm scale-105"
                                : isToday
                                ? "size-[40px] border-2 border-[#7D52F4] bg-[#EFEBFF]/50 text-[#7D52F4] font-bold"
                                : hasEvent
                                ? "size-[40px] bg-[#7D52F4]/10 hover:bg-[#7D52F4]/20 border border-[#7D52F4]/30"
                                : "w-full h-full hover:bg-neutral-100"
                            }`}
                          >
                            <span className={`text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-center ${textColor}`}>
                              {d}
                            </span>
                            {dotColor && (
                              <span
                                className={`absolute bottom-[4px] w-[5px] h-[5px] rounded-full transition-all ${
                                  isSelected ? "bg-white" : dotColor
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      );
                    }

                    const totalCells = startDay + totalDays;
                    const remainingCells = (7 - (totalCells % 7)) % 7;
                    for (let n = 1; n <= remainingCells; n++) {
                      cells.push(
                        <div key={`next-${n}`} className="flex items-center justify-center h-[40px] rounded-[8px]">
                          <span className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-center text-[#D1D1D1]">
                            {n}
                          </span>
                        </div>
                      );
                    }

                    const rows: React.ReactNode[] = [];
                    for (let r = 0; r < cells.length; r += 7) {
                      rows.push(
                        <div key={`row-${r}`} className="grid grid-cols-7 gap-sm">
                          {cells.slice(r, r + 7)}
                        </div>
                      );
                    }
                    return rows;
                  })()}
                </div>
              </div>

              {/* Upcoming Events Widget Header & Rows (Matching Figma Spec exactly) */}
              <div className="p-[4px]">
                <div className="bg-[#F7F7F7] rounded-[16px] p-[20px_20px_16px] flex flex-col gap-[16px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <span className="text-[12px] font-semibold text-[#171717] tracking-[0.04em] uppercase leading-[16px]">
                        {selectedDay !== null
                          ? `${selectedDay} ${MONTH_NAMES_SHORT[displayedMonth.getMonth()]} ${displayedMonth.getFullYear()}`
                          : "UPCOMING"}
                      </span>
                      <span className="inline-flex items-center justify-center min-w-[20px] h-[18px] bg-[#EBEBEB] rounded-[4px] px-[6px] text-[11px] font-semibold text-[#171717] tracking-[0.02em] leading-[12px]">
                        {upcomingEvents.length}
                      </span>
                    </div>

                    <button
                      onClick={() => openAddEventForDay(selectedDay ?? undefined)}
                      className="flex items-center gap-0.5 text-[12px] font-semibold text-[#7D52F4] hover:text-brand-dark transition-colors cursor-pointer"
                    >
                      <RiAddLine className="size-4" />
                      Add event
                    </button>
                  </div>

                  <div className="flex flex-col gap-[12px] max-h-[260px] overflow-y-auto pr-1">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((evt) => {
                        const parts = parseLocalDateParts(evt.date);
                        const dayNum = parts.day;
                        const monthStr = MONTH_NAMES_SHORT[parts.month] ?? "AUG";
                        const dotColor = evt.color ?? "bg-[#7D52F4]";
                        const migrantName = evt.migrantName || evt.title || "Scheduled Event";
                        const actionLabel = evt.actionText || evt.action || evt.eventType || "View details";
                        const initials = evt.initials || migrantName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

                        return (
                          <div
                            key={evt.id}
                            onClick={() => router.push(evt.caseId ? `/cases?caseId=${evt.caseId}` : "/cases")}
                            className="flex items-center gap-[12px] py-1.5 px-2 hover:bg-white rounded-[8px] transition-all cursor-pointer group"
                          >
                            <span className={`size-[6px] rounded-full ${dotColor} shrink-0`} />

                            {selectedDay === null && (
                              <div className="flex flex-col items-center px-[4px] py-[2px] bg-[#EBEBEB] rounded-[4px] min-w-[32px] h-[32px] shrink-0 justify-center">
                                <span className="text-[10px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[14px]">{dayNum}</span>
                                <span className="text-[9px] font-medium text-[#A4A4A4] tracking-[0.04em] uppercase leading-[12px]">{monthStr}</span>
                              </div>
                            )}

                            <div className="size-7 rounded-full bg-[#EFEBFF] text-[#7D52F4] flex items-center justify-center shrink-0 text-[11px] font-semibold">
                              {initials}
                            </div>

                            <div className="flex items-center gap-xs flex-1 min-w-0 text-[14px] leading-[20px]">
                              <span className="font-medium text-[#171717] truncate">{migrantName}</span>
                              <span className="text-[#A4A4A4]">•</span>
                              <span className="text-[#5C5C5C] group-hover:text-[#7D52F4] hover:underline font-normal truncate">
                                {actionLabel}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 flex flex-col items-center gap-sm text-center">
                        <span className="text-[13px] text-[#A4A4A4]">
                          No events scheduled {selectedDay !== null ? `for ${selectedDay} ${MONTH_NAMES_SHORT[displayedMonth.getMonth()]}` : ""}
                        </span>
                        <button
                          onClick={() => openAddEventForDay(selectedDay ?? undefined)}
                          className="text-[13px] font-semibold text-[#7D52F4] hover:underline cursor-pointer"
                        >
                          + Schedule an event for this date
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Migrants Overview Card Block */}
          <div className="flex flex-col gap-[12px] w-full">
            <div className="flex items-center justify-between w-full h-[30px]">
              <span className="text-[20px] text-[#171717] tracking-[-0.006em] font-aeonik-medium">
                Migrants overview
              </span>
              <button
                onClick={() => router.push("/migrants")}
                className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] flex flex-col gap-xl shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
              <div className="grid grid-cols-2 gap-lg w-full">
                <div
                  onClick={() => router.push("/migrants?location=uk")}
                  className="bg-[#E3F7EC] border border-[#A7F3D0] rounded-[12px] p-[12px_16px] flex flex-col justify-between h-[72px] relative hover:shadow-sm hover:border-[#10B981] transition-all cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold text-[#0B4627] tracking-[0.02em] uppercase">
                    IN THE UK
                  </span>
                  <span className="text-[24px] font-semibold text-[#0B4627] leading-none font-aeonik-medium">
                    {stats?.migrants?.in ?? 6}
                  </span>
                  <RiCheckboxCircleLine className="size-4 text-[#0B4627] absolute top-3 right-3 group-hover:scale-110 transition-transform" />
                </div>
                <div
                  onClick={() => router.push("/migrants?location=outside")}
                  className="bg-[#F7F7F7] border border-[#EBEBEB] rounded-[12px] p-[12px_16px] flex flex-col justify-between h-[72px] relative hover:shadow-sm hover:border-neutral-300 transition-all cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold text-[#5C5C5C] tracking-[0.02em] uppercase">
                    OUTSIDE UK
                  </span>
                  <span className="text-[24px] font-semibold text-[#171717] leading-none font-aeonik-medium">
                    {stats?.migrants?.out ?? 10}
                  </span>
                  <RiBriefcaseLine className="size-4 text-[#5C5C5C] absolute top-3 right-3 group-hover:scale-110 transition-transform" />
                </div>
              </div>

              <div className="flex flex-col gap-lg border-t border-[#EBEBEB] pt-[16px]">
                <span className="text-[12px] font-semibold text-[#171717] tracking-[0.04em] uppercase">
                  LEAVE TO REMAIN ALERTS
                </span>
                
                <div className="flex flex-col gap-[12px]">
                  {ltrAlerts.map((alert, i) => (
                    <div
                      key={i}
                      onClick={() => router.push("/migrants?alert=expiring")}
                      className="flex items-center justify-between text-[14px] p-2 hover:bg-[#FAFAFA] rounded-[8px] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-[12px]">
                        <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                          alert.isUrgent ? "bg-[#FEE2E2]" : "bg-[#F5F5F5]"
                        }`}>
                          <span className={`text-[13px] font-medium ${
                            alert.isUrgent ? "text-[#EF4444]" : "text-[#171717]"
                          }`}>{alert.initials}</span>
                        </div>
                        <span className={`font-${alert.isUrgent ? "semibold" : "medium"} ${
                          alert.isUrgent ? "text-[#EF4444]" : "text-[#171717]"
                        }`}>{alert.name}</span>
                      </div>
                      <span className={`text-[13px] font-${alert.isUrgent ? "semibold" : "medium"} ${
                        alert.isUrgent ? "text-[#EF4444]" : "text-[#171717]"
                      }`}>{alert.daysLeft} days</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Case Pipeline Section (Positioned directly below main grid as per Figma spec) */}
      <div className="flex flex-col gap-[12px] w-full mt-4">
        <div className="flex items-center justify-between w-full h-[30px]">
          <span className="text-[20px] text-[#171717] tracking-[-0.006em] font-aeonik-medium">
            Case pipeline
          </span>
        </div>

        <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-[20px] flex flex-col w-full shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          {(() => {
            const segments = pipelineSegments;
            const activeSeg = segments.find(s => s.label === hoveredPipelineSegment)
              ?? segments.find(s => s.label === "COS MANAGEMENT")
              ?? segments[1];

            let left = 0;
            for (const s of segments) {
              if (s.label === activeSeg.label) {
                left += s.pct / 2;
                break;
              }
              left += s.pct;
            }

            return (
              <div className="relative w-full pt-[32px]">
                {/* Floating Tooltip matching Figma Spec exactly */}
                <div
                  className="absolute top-0 flex flex-col items-center -translate-x-1/2 pointer-events-none z-10 transition-all duration-200 ease-out"
                  style={{ left: `${left}%` }}
                >
                  <div className="bg-[#171717] text-white text-[12px] font-semibold px-[10px] py-[4px] rounded-[6px] flex items-center gap-[8px] shadow-[0px_12px_24px_rgba(14,18,27,0.06)] uppercase tracking-[0.04em]">
                    <span className="font-medium text-white leading-4">{activeSeg.label}</span>
                    <span className="bg-[#333333] px-[6px] py-[2px] rounded-[4px] text-[11px] font-semibold text-white leading-3">
                      {activeSeg.count}
                    </span>
                  </div>
                  <div className="w-2 h-2 bg-[#171717] rotate-45 -mt-1" />
                </div>

                <div className="flex gap-[2px] w-full h-[6px]">
                  {segments.map((seg, i) => {
                    const isHovered = (hoveredPipelineSegment === seg.label) || (!hoveredPipelineSegment && activeSeg.label === seg.label);
                    return (
                      <div
                        key={i}
                        onClick={() => router.push(`/cases?stage=${encodeURIComponent(seg.label)}`)}
                        className={`${seg.color} h-full rounded-full transition-all duration-200 cursor-pointer ${
                          isHovered ? "opacity-100 shadow-sm brightness-105 scale-y-125" : "opacity-85 hover:opacity-100"
                        }`}
                        style={{ width: `${seg.pct}%` }}
                        onMouseEnter={() => setHoveredPipelineSegment(seg.label)}
                        onMouseLeave={() => setHoveredPipelineSegment(null)}
                        title={`Click to filter cases by ${seg.label}: ${seg.count}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Modals */}
      <ImportMigrantsModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={() => {
          apiClient.get<DashboardStats>(ENDPOINTS.statistics.dashboard, { params: { filter: "all" } })
            .then((res) => res && setStats(res));
        }}
      />

      <AddEventModal
        open={addEventModalOpen}
        onOpenChange={setAddEventModalOpen}
        initialDate={modalInitialDate}
        onAddEvent={async (newEvent) => {
          const createdEvent: DashboardEvent = {
            id: Date.now(),
            title: newEvent.title,
            migrantName: newEvent.title,
            actionText: "Scheduled Event",
            date: newEvent.date,
            color: newEvent.color ?? "bg-[#7D52F4]",
          };

          // 1. Post to NestJS TypeORM DB backend
          try {
            await apiClient.post(ENDPOINTS.dashboard.events, {
              title: newEvent.title,
              notes: newEvent.title,
              date: newEvent.date,
              color: newEvent.color,
              eventType: "internal",
              action: "call",
              duration: 30,
              employees: "[]",
              clients: "[]",
            });
          } catch (e) {
            console.error("Backend event post failed, saving locally:", e);
          }

          // 2. Persist to local state & localStorage so it persists permanently across reloads
          setEvents((prev) => {
            const nextEvents = [createdEvent, ...prev];
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextEvents));
            } catch (err) {
              console.error("localStorage save failed:", err);
            }
            return nextEvents;
          });

          const parts = parseLocalDateParts(newEvent.date);
          const monthStart = new Date(parts.year, parts.month, 1);
          
          setDisplayedMonth(monthStart);
          setSelectedDay(parts.day);
        }}
      />
    </div>
  );
}
