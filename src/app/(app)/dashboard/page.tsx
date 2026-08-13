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
import { WorldMapSvg } from "./WorldMapSvg";
import { Flag } from "@/components/ui/flag";
import { useRouter } from "next/navigation";
import { ImportMigrantsModal } from "./components/ImportMigrantsModal";
import { AddEventModal } from "./components/AddEventModal";

// Country map coordinates for World Map visualisation
const COUNTRY_COORDINATES: Record<string, { left: string; top: string; label: string }> = {
  India: { left: "69.0%", top: "51.0%", label: "India" },
  Indian: { left: "69.0%", top: "51.0%", label: "India" },
  Pakistan: { left: "66.5%", top: "47.8%", label: "Pakistan" },
  Pakistani: { left: "66.5%", top: "47.8%", label: "Pakistan" },
  "United Kingdom": { left: "48.2%", top: "31.5%", label: "United Kingdom" },
  British: { left: "48.2%", top: "31.5%", label: "United Kingdom" },
  UK: { left: "48.2%", top: "31.5%", label: "United Kingdom" },
  Germany: { left: "52.0%", top: "33.7%", label: "Germany" },
  German: { left: "52.0%", top: "33.7%", label: "Germany" },
  France: { left: "49.0%", top: "38.9%", label: "France" },
  French: { left: "49.0%", top: "38.9%", label: "France" },
  China: { left: "77.4%", top: "49.0%", label: "China" },
  Chinese: { left: "77.4%", top: "49.0%", label: "China" },
  "United States": { left: "27.1%", top: "42.2%", label: "United States" },
  American: { left: "27.1%", top: "42.2%", label: "United States" },
  USA: { left: "27.1%", top: "42.2%", label: "United States" },
  Greenland: { left: "39.4%", top: "20.1%", label: "Greenland" },
  Italy: { left: "51.6%", top: "43.3%", label: "Italy" },
  Italian: { left: "51.6%", top: "43.3%", label: "Italy" },
  Jamaica: { left: "31.0%", top: "56.5%", label: "Jamaica" },
  Jamaican: { left: "31.0%", top: "56.5%", label: "Jamaica" },
  Nigeria: { left: "51.6%", top: "58.7%", label: "Nigeria" },
  Nigerian: { left: "51.6%", top: "58.7%", label: "Nigeria" },
  Australia: { left: "86.2%", top: "73.9%", label: "Australia" },
  Australian: { left: "86.2%", top: "73.9%", label: "Australia" },
  Canada: { left: "27.1%", top: "28.3%", label: "Canada" },
  Canadian: { left: "27.1%", top: "28.3%", label: "Canada" },
  Spain: { left: "47.5%", top: "42.0%", label: "Spain" },
  Spanish: { left: "47.5%", top: "42.0%", label: "Spain" },
  Poland: { left: "53.5%", top: "33.0%", label: "Poland" },
  Polish: { left: "53.5%", top: "33.0%", label: "Poland" },
  Brazil: { left: "35.5%", top: "67.4%", label: "Brazil" },
  Brazilian: { left: "35.5%", top: "67.4%", label: "Brazil" },
  Philippines: { left: "83.6%", top: "56.5%", label: "Philippines" },
  Filipino: { left: "83.6%", top: "56.5%", label: "Philippines" },
  Bangladesh: { left: "71.2%", top: "50.5%", label: "Bangladesh" },
  Bangladeshi: { left: "71.2%", top: "50.5%", label: "Bangladesh" },
  Nepal: { left: "70.5%", top: "48.2%", label: "Nepal" },
  Nepalese: { left: "70.5%", top: "48.2%", label: "Nepal" },
  "Sri Lanka": { left: "69.5%", top: "56.0%", label: "Sri Lanka" },
  SriLankan: { left: "69.5%", top: "56.0%", label: "Sri Lanka" },
};

const DEFAULT_TOP_ORIGINS: Array<{ name: string; count: number }> = [];

const TIME_RANGE_MULTIPLIERS: Record<string, number> = {
  "5D": 0.17,
  "2W": 0.47,
  "1M": 1.0,
  "6M": 6.0,
  "1Y": 12.0,
};

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
  colorClass: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#EBEBEB] rounded-[16px] p-[16px_20px_20px] w-full h-[88px] flex flex-col justify-between relative shadow-[0px_1px_2px_rgba(10,13,20,0.03)] font-sans transition-all ${
        onClick ? "hover:border-[#7D52F4]/50 hover:shadow-md cursor-pointer group" : ""
      }`}
    >
      <span className="text-[11px] font-semibold tracking-[0.02em] text-[#171717]/60 uppercase group-hover:text-[#7D52F4] transition-colors">
        {title}
      </span>
      <span className="text-[28px] font-medium text-[#171717] tracking-[-0.01em] leading-none mt-xs">
        {value}
      </span>
      <Icon className={`size-5 text-[#5C5C5C] absolute top-3 right-3 transition-colors group-hover:text-[#7D52F4] ${colorClass}`} />
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
      className="flex flex-row items-start py-[16px] px-[12px] gap-[12px] bg-white border border-[#EBEBEB] rounded-[12px] hover:border-[#7D52F4]/40 hover:bg-[#FAFAFA] transition-all cursor-pointer select-none w-full group"
    >
      {/* Content row */}
      <div className="flex flex-row items-center gap-[4px] flex-1 min-w-0">
        {/* Dot */}
        <div className="flex items-center justify-center p-[6px] shrink-0">
          <div className={`w-[6px] h-[6px] rounded-full ${dotColor}`} />
        </div>
        {/* Text stack */}
        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
          <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em] group-hover:text-[#7D52F4] transition-colors">
            {title}
          </span>
          <div className="flex items-center gap-[8px]">
            <span className="text-[13px] font-normal text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">{owner}</span>
            <span className="text-[9px] text-[#5C5C5C] leading-[16px]">•</span>
            <span className="text-[13px] font-normal text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">Due {due}</span>
          </div>
        </div>
      </div>
      {/* Arrow button */}
      <div className="flex items-center justify-center size-6 bg-[#F7F7F7] group-hover:bg-[#7D52F4] rounded-full shrink-0 mt-[10px] transition-colors">
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
      <div className="flex flex-col gap-0.5">
        <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] leading-[20px] group-hover:text-[#7D52F4] transition-colors">
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

interface NationalityStat {
  id: string | number;
  nationality: string;
  value: number;
  color?: string;
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
  { id: 101, title: "Passport scan missing", owner: "John Doe", due: "Immediate", dotColor: "bg-[#FB3748]" },
  { id: 102, title: "Right to Work share code check pending", owner: "Priya Sharma", due: "15 Aug", dotColor: "bg-[#FB3748]" },
  { id: 103, title: "CoS Assignment Certificate document missing", owner: "David Miller", due: "18 Aug", dotColor: "bg-[#F6B51E]" },
  { id: 104, title: "Proof of UK Address verification required", owner: "Fatima Ali", due: "20 Aug", dotColor: "bg-[#F6B51E]" },
  { id: 105, title: "Visa Extension copy pending submission", owner: "Chen Wei", due: "25 Aug", dotColor: "bg-[#335CFF]" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [nowTime] = React.useState(() => Date.now());

  // ── State ────────────────────────────────────────────────────────────────
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [tasks, setTasks] = React.useState<DashboardTask[]>([]);
  const [calendarData, setCalendarData] = React.useState<CalendarData>({});
  const [events, setEvents] = React.useState<DashboardEvent[]>([]);
  const [userInfo, setUserInfo] = React.useState<UserProfile | null>(null);
  const [nationalities, setNationalities] = React.useState<NationalityStat[]>([]);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [schedulerEvents, setSchedulerEvents] = React.useState<SchedulerEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTaskTab, setActiveTaskTab] = React.useState<"open" | "missing">("open");
  const [originFilter, setOriginFilter] = React.useState("1M");
  const [hoveredOrigin, setHoveredOrigin] = React.useState<string | null>(null);
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

  // Start of today timestamp (00:00:00) so events for today are never excluded by time-of-day cutoff
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
          userInfoData, natData, logsData, schedulerData,
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
          apiClient.get<NationalityStat[]>(ENDPOINTS.statistics.nationalities),
          apiClient.get<{ logs: LogEntry[]; count: number }>(ENDPOINTS.logs.base, {
            params: { take: "8", sort_by: "date.desc" },
          }),
          apiClient.get<SchedulerEvent[]>(ENDPOINTS.dashboard.schedule, {
            params: { from: fmt(today), to: fmt(monthEnd), filter: "all" },
          }),
        ]);

        if (statsData.status === "fulfilled") setStats(statsData.value);
        else console.error("Stats load failed:", statsData.reason);

        if (tasksData.status === "fulfilled") {
          const raw = tasksData.value;
          const arr = Array.isArray(raw) ? raw : raw.data ?? [];
          setTasks(arr);
        } else {
          console.error("Tasks load failed:", tasksData.reason);
        }

        if (calData.status === "fulfilled") setCalendarData(calData.value);
        else console.error("Calendar load failed:", calData.reason);

        if (eventsData.status === "fulfilled") setEvents(eventsData.value ?? []);
        else console.error("Events load failed:", eventsData.reason);

        if (userInfoData.status === "fulfilled") setUserInfo(userInfoData.value);
        else console.error("UserInfo load failed:", userInfoData.reason);

        if (natData.status === "fulfilled") setNationalities(natData.value ?? []);
        else console.error("Nationalities load failed:", natData.reason);

        if (logsData.status === "fulfilled") {
          const raw = logsData.value as any;
          const arr = Array.isArray(raw) ? raw : (raw?.logs ?? raw?.data ?? []);
          setLogs(arr);
        } else {
          console.error("Logs load failed:", logsData.reason);
        }

        if (schedulerData.status === "fulfilled") setSchedulerEvents(schedulerData.value ?? []);
        else console.error("Scheduler load failed:", schedulerData.reason);

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

  const activeCasesCount   = stats?.migrants?.active ?? "—";
  const visaApprovedCount  = stats?.leave?.expiring14Days ?? "—";
  const awaitingDecisionCount = stats?.migrants?.out ?? "—";
  const totalTasksCount    = tasks.length ||
    ((stats?.tasksStats?.high ?? 0) + (stats?.tasksStats?.medium ?? 0) + (stats?.tasksStats?.low ?? 0)) || 0;

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
    if (!pi) return "Unassigned";
    return formatFullName(pi.firstName, pi.lastName);
  }

  function taskDueLabel(task: DashboardTask): string {
    if (!task.dueDate) return "—";
    return new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  // Calendar dots from backend + newly added events
  const calendarDotDays = React.useMemo(() => {
    const result: Record<number, string> = {};
    Object.entries(calendarData).forEach(([tsStr, items]) => {
      if (!items.length) return;
      const d = new Date(Number(tsStr));
      if (d.getMonth() === displayedMonth.getMonth() && d.getFullYear() === displayedMonth.getFullYear()) {
        const hasVisaEnd = items.some((i) => i.isVisaEnd);
        result[d.getDate()] = hasVisaEnd ? "bg-[#FB3748]" : "bg-[#7D52F4]";
      }
    });
    return result;
  }, [calendarData, displayedMonth]);

  // Upcoming events: sorted by date & filtered by startOfToday or selectedDay
  const upcomingEvents = React.useMemo(() => {
    let filtered = [...events];

    if (selectedDay !== null) {
      filtered = filtered.filter((e) => {
        const ed = new Date(e.date);
        return ed.getDate() === selectedDay &&
               ed.getMonth() === displayedMonth.getMonth() &&
               ed.getFullYear() === displayedMonth.getFullYear();
      });
    } else {
      filtered = filtered.filter((e) => {
        const eventTime = new Date(e.date).getTime();
        return eventTime >= startOfToday;
      });
    }
    return filtered
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8);
  }, [events, startOfToday, selectedDay, displayedMonth]);

  // Recent activity: map logs to display rows
  const activityRows = React.useMemo(() => {
    if (!logs.length) return [];
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
        : "Recently";
      const actionText = log.action ? log.action.charAt(0).toUpperCase() + log.action.slice(1) : "Activity updated";
      const entityStr = log.entityName ? ` — ${log.entityName}` : "";
      const idStr = log.entityIdentifier ? ` #${log.entityIdentifier}` : "";
      const title = `${actionText}${entityStr}${idStr}`;
      return { initials, avatarBg, title, owner: userName, time: timeLabel };
    });
  }, [logs]);

  // Leave to Remain: expiring visa cases from scheduler, within 60 days
  const ltrAlerts = React.useMemo(() => {
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
  }, [schedulerEvents, nowTime]);

  // Nationalities: top 7 origins scaled dynamically by selected range filter (5D, 2W, 1M, 6M, 1Y)
  const topOrigins = React.useMemo(() => {
    const mult = TIME_RANGE_MULTIPLIERS[originFilter] ?? 1.0;
    if (nationalities.length > 0) {
      return [...nationalities]
        .sort((a, b) => b.value - a.value)
        .slice(0, 7)
        .map((n) => ({
          name: n.nationality ?? String(n.id),
          count: Math.max(1, Math.round(n.value * mult)),
        }));
    }
    return [];
  }, [nationalities, originFilter]);

  // Case pipeline: derive from stats task/migrant counts
  const pipelineSegments = React.useMemo(() => {
    const high = stats?.tasksStats?.high ?? 0;
    const medium = stats?.tasksStats?.medium ?? 0;
    const low = stats?.tasksStats?.low ?? 0;
    const active = stats?.migrants?.active ?? 0;
    const total = high + medium + low + active || 1;
    return [
      { color: "bg-[#335CFF]", pct: (high / total) * 100, label: "Pre-CoS", count: high },
      { color: "bg-[#7D52F4]", pct: (medium / total) * 100, label: "CoS Management", count: medium },
      { color: "bg-[#F6B51E]", pct: (low / total) * 100, label: "Visa", count: low },
      { color: "bg-[#1FC16B]", pct: (active / total) * 100, label: "Active", count: active },
    ].filter((s) => s.pct > 0);
  }, [stats]);

  // Helper to open Add Event modal for a specific date
  const openAddEventForDay = (dayNum?: number) => {
    if (dayNum) {
      const targetDate = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), dayNum);
      setModalInitialDate(targetDate.toISOString().split("T")[0]);
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
          title="Active cases"
          value={activeCasesCount}
          icon={FoldersLine}
          colorClass=""
          onClick={() => router.push("/cases?status=active")}
        />
        <MetricCard
          title="Visa approved"
          value={visaApprovedCount}
          icon={SelectBoxCircleLine}
          colorClass=""
          onClick={() => router.push("/compliance/rtw-checks")}
        />
        <MetricCard
          title="Awaiting decision"
          value={awaitingDecisionCount}
          icon={FileWarningLine}
          colorClass=""
          onClick={() => router.push("/cases?status=awaiting_decision")}
        />
        <MetricCard
          title="Open tasks"
          value={loading ? "…" : totalTasksCount}
          icon={TaskLine}
          colorClass=""
          onClick={() => router.push("/cases")}
        />
      </div>

      {/* Grid Split: Left (Tasks + Activity) | Right (Calendar + Overview) */}
      <div className="grid grid-cols-12 gap-[24px] w-full items-start">
        {/* Left Column: Tasks + Recent Activity */}
        <div className="col-span-5 flex flex-col gap-[24px]">
          {/* Tasks Card Block */}
          <div className="flex flex-col gap-[12px] w-full">
            {/* Header outside */}
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

            {/* White Card Container */}
            <div className="bg-white border border-white rounded-[16px] p-[12px_16px_16px] flex flex-col gap-[12px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
              {/* Stat Tabs row */}
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
                      Open Tasks
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
                      Missing Docs
                    </span>
                    <FileWarningLine className="size-5 text-[#5C5C5C]" />
                  </div>
                  <span className="text-[24px] font-medium text-[#171717] leading-[32px] font-aeonik-medium">
                    {MISSING_DOC_TASKS.length}
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-[4px]">
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
                      <div className="py-6 text-center text-[13px] text-[#A4A4A4]">
                        No pending tasks found
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-[4px]">
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
            {/* Header outside */}
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

            {/* White Card Container */}
            <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] flex flex-col gap-xl shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
              <div className="flex flex-col">
                {activityRows && activityRows.length > 0 ? (
                  activityRows.map((row, i) => (
                    <ActivityItem
                      key={i}
                      avatarText={row.initials}
                      avatarBg={row.avatarBg}
                      title={row.title}
                      owner={row.owner}
                      time={row.time}
                      onClick={() => router.push("/compliance/logs")}
                    />
                  ))
                ) : (
                  <div className="py-6 text-center text-[13px] text-[#A4A4A4]">
                    No recent activity logs available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calendar + Migrants Overview */}
        <div className="col-span-7 flex flex-col gap-[24px]">
          {/* Calendar Card Block */}
          <div className="flex flex-col gap-[12px] w-full">
            {/* Header outside */}
            <div className="flex items-center justify-between w-full h-[30px]">
              <span className="text-[20px] text-[#171717] tracking-[-0.006em] font-aeonik-medium">
                Calendar
              </span>
            </div>

            {/* White Card Container - Date & Range Picker */}
            <div className="bg-white rounded-[20px] flex flex-col w-full overflow-hidden">
              {/* Date Picker Items */}
              <div className="p-[20px] flex flex-col gap-[16px]">
                {/* Header row: Period label + Date Selector */}
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
                  {/* Day Labels Row */}
                  <div className="grid grid-cols-7 gap-sm">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                      <div key={i} className="flex items-center justify-center h-[36px] rounded-[10px]">
                        <span className="text-[12px] font-medium text-[#A4A4A4] tracking-[0.04em] uppercase leading-[16px] text-center">
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Day Rows */}
                  {(() => {
                    const firstDay = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
                    const startDay = (firstDay.getDay() + 6) % 7;
                    const totalDays = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 0).getDate();
                    const isCurrentMonth = today.getMonth() === displayedMonth.getMonth() && today.getFullYear() === displayedMonth.getFullYear();
                    const cells: React.ReactNode[] = [];
                    const dotMap = calendarDotDays;

                    // Empty cells before day 1
                    for (let e = 0; e < startDay; e++) {
                      cells.push(
                        <div key={`empty-${e}`} className="flex items-center justify-center h-[40px] rounded-[8px]" />
                      );
                    }

                    // Day cells
                    for (let d = 1; d <= totalDays; d++) {
                      const isToday = isCurrentMonth && d === today.getDate();
                      const isSelected = selectedDay === d;
                      const dotColor = dotMap[d] || null;

                      let textColor = "text-[#5C5C5C]";
                      if (isSelected) textColor = "text-white";
                      else if (isToday) textColor = "text-[#7D52F4] font-bold";

                      cells.push(
                        <div key={d} className="flex items-center justify-center h-[40px]">
                          <div
                            onClick={() => setSelectedDay(selectedDay === d ? null : d)}
                            className={`relative flex items-center justify-center rounded-[8px] cursor-pointer transition-colors ${
                              isSelected
                                ? "size-[40px] bg-[#262626]"
                                : isToday
                                ? "size-[40px] border border-[#7D52F4] bg-[#EFEBFF]/30"
                                : "w-full h-full hover:bg-neutral-100"
                            }`}
                          >
                            <span className={`text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-center ${textColor}`}>
                              {d}
                            </span>
                            {dotColor && (
                              <span className={`absolute w-[3px] h-[3px] rounded-full left-1/2 -translate-x-1/2 bottom-[6px] ${dotColor}`} />
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Remaining cells for last row
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

              {/* Upcoming Events Widget */}
              <div className="p-[4px]">
                <div className="bg-[#F7F7F7] rounded-[16px] p-[20px_20px_16px] flex flex-col gap-[20px]">
                  {/* UPCOMING header with badge & Add Event trigger */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <span className="text-[12px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[16px]">
                        {selectedDay !== null ? `EVENTS FOR DAY ${selectedDay}` : "UPCOMING"}
                      </span>
                      <span className="inline-flex items-center justify-center min-w-[20px] h-[18px] bg-[#EBEBEB] rounded-[4px] px-[2px] text-[11px] font-medium text-[#171717] tracking-[0.02em] uppercase leading-[12px]">
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

                  {/* Event list */}
                  <div className="flex flex-col gap-[16px]">
                    {upcomingEvents.length > 0 ? (
                      upcomingEvents.map((evt) => {
                        const evtDate = new Date(evt.date);
                        const dayNum = evtDate.toLocaleDateString("en-GB", { day: "numeric" });
                        const monthStr = evtDate.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
                        const dotColor = evt.color ?? "bg-[#7D52F4]";
                        return (
                          <div key={evt.id} className="flex items-center gap-[16px] pl-sm hover:bg-white/80 p-1 rounded-[8px] transition-colors cursor-pointer">
                            <div className="flex items-center gap-[16px]">
                              <span className={`size-[6px] rounded-full ${dotColor} shrink-0`} />
                              <div className="flex flex-col items-center px-[4px] py-[2px] bg-[#EBEBEB] rounded-[4px] w-[31px] h-[32px]">
                                <span className="text-[10px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[16px] -mb-[4px]">{dayNum}</span>
                                <span className="text-[10px] font-medium text-[#A4A4A4] tracking-[0.04em] uppercase leading-[16px]">{monthStr}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-sm flex-1 min-w-0">
                              <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] leading-[20px] truncate">{evt.title}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 flex flex-col items-center gap-sm text-center">
                        <span className="text-[13px] text-[#A4A4A4]">
                          No events scheduled {selectedDay !== null ? `for Day ${selectedDay}` : ""}
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
            {/* Header outside */}
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

            {/* White Card Container */}
            <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] flex flex-col gap-xl shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
              {/* Split badges */}
              <div className="grid grid-cols-2 gap-lg w-full">
                <div
                  onClick={() => router.push("/migrants?location=uk")}
                  className="bg-[#E1FBF2] border border-[#A7F3D0] rounded-[12px] p-[12px_16px] flex flex-col justify-between h-[72px] relative hover:shadow-sm hover:border-[#10B981] transition-all cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold text-[#065F46] tracking-[0.02em] uppercase">
                    IN THE UK
                  </span>
                  <span className="text-[24px] font-semibold text-[#065F46] leading-none">
                    {stats?.migrants?.in ?? 0}
                  </span>
                  <RiCheckboxCircleLine className="size-4 text-[#065F46] absolute top-3 right-3 group-hover:scale-110 transition-transform" />
                </div>
                <div
                  onClick={() => router.push("/migrants?location=outside")}
                  className="bg-[#F5F5F5] border border-[#EBEBEB] rounded-[12px] p-[12px_16px] flex flex-col justify-between h-[72px] relative hover:shadow-sm hover:border-neutral-300 transition-all cursor-pointer group"
                >
                  <span className="text-[11px] font-semibold text-[#5C5C5C] tracking-[0.02em] uppercase">
                    OUTSIDE UK
                  </span>
                  <span className="text-[24px] font-semibold text-[#171717] leading-none">
                    {stats?.migrants?.out ?? 0}
                  </span>
                  <RiBriefcaseLine className="size-4 text-[#5C5C5C] absolute top-3 right-3 group-hover:scale-110 transition-transform" />
                </div>
              </div>

              {/* Leave to remain alerts list */}
              <div className="flex flex-col gap-lg border-t border-[#EBEBEB] pt-[16px]">
                <span className="text-[12px] font-semibold text-[#171717] tracking-[0.04em] uppercase">
                  LEAVE TO REMAIN ALERTS
                </span>
                
                <div className="flex flex-col gap-[12px]">
                  {ltrAlerts.length > 0 ? (
                    ltrAlerts.map((alert, i) => (
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
                    ))
                  ) : (
                    <div className="py-4 text-center text-[13px] text-[#A4A4A4]">
                      No active leave to remain alerts
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Migrants by Origin Card with Dot-matrix Map */}
      <div className="flex flex-col gap-[12px] w-full mt-4">
        {/* Header (Outside the Card) */}
        <div className="flex items-center justify-between w-full h-[30px]">
          <span className="text-[20px] text-[#171717] tracking-[-0.006em] font-aeonik-medium">
            Migrants by origin
          </span>
          <button
            onClick={() => router.push("/insights")}
            className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer"
          >
            View all insights
          </button>
        </div>

        {/* White Card Container */}
        <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] flex gap-[24px] items-start h-[548px] w-full shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          {/* Map Column */}
          <div className="flex-1 h-full flex flex-col items-center justify-between relative py-[12px]">
            {/* SVG Map Container */}
            <div className="w-full flex-1 relative flex items-center justify-center min-h-0">
              <WorldMapSvg className="w-full h-full text-[#E5E7EB]" />
              
              {/* Dynamic Map Pins for actual top origins */}
              {(() => {
                const originsList = topOrigins && topOrigins.length > 0 ? topOrigins : DEFAULT_TOP_ORIGINS;
                const activeItem = originsList.find((o) => o.name === hoveredOrigin) || originsList[0];
                const activeCoords = activeItem ? COUNTRY_COORDINATES[activeItem.name] : null;

                return (
                  <>
                    {originsList.map((origin) => {
                      const coords = COUNTRY_COORDINATES[origin.name];
                      if (!coords) return null;
                      const isHovered = hoveredOrigin === origin.name;
                      const isActive = activeItem?.name === origin.name;

                      return (
                        <div
                          key={origin.name}
                          className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group z-10 p-2"
                          style={{ left: coords.left, top: coords.top }}
                          onMouseEnter={() => setHoveredOrigin(origin.name)}
                          onMouseLeave={() => setHoveredOrigin(null)}
                          onClick={() => router.push(`/migrants?nationality=${encodeURIComponent(origin.name)}`)}
                        >
                          <div className={`absolute rounded-full bg-[#7D52F4]/40 transition-all duration-300 ${
                            isActive || isHovered ? "size-6 animate-ping" : "size-4"
                          }`} />
                          <div className={`rounded-full bg-[#7D52F4] border-2 border-white shadow-md transition-all duration-200 ${
                            isActive || isHovered ? "size-3 scale-125" : "size-2.5"
                          }`} />
                        </div>
                      );
                    })}

                    {/* Single Interactive Tooltip over active/hovered pin */}
                    {activeItem && activeCoords && (
                      <div 
                        className="absolute flex flex-col items-center -translate-x-1/2 pointer-events-none transition-all duration-200 z-20"
                        style={{ left: activeCoords.left, top: `calc(${activeCoords.top} - 34px)` }}
                      >
                        <div className="bg-[#171717] text-white text-[12px] font-semibold py-1 px-[10px] rounded-[6px] shadow-lg flex items-center gap-[6px] whitespace-nowrap">
                          <Flag country={activeItem.name} className="size-3.5 rounded-full overflow-hidden border border-white/20 shrink-0" />
                          <span>{activeCoords.label || activeItem.name}</span>
                          <span className="text-[#A3A3A3] font-normal">•</span>
                          <span className="text-[#CAC0FF] font-mono">{activeItem.count}</span>
                        </div>
                        <div className="w-1.5 h-1.5 bg-[#171717] rotate-45 -mt-0.5" />
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Range Pickers filter */}
            <div className="flex bg-[#F5F5F5] rounded-[8px] p-0.5 w-[240px] shadow-sm select-none shrink-0 mt-4">
              {["5D", "2W", "1M", "6M", "1Y"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOriginFilter(filter)}
                  className={`flex-1 py-1 text-center rounded-[6px] text-[12px] font-semibold transition-all cursor-pointer ${
                    originFilter === filter
                      ? "bg-white text-[#171717] shadow-sm"
                      : "text-[#7B7B7B] hover:text-[#171717]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Top Origins Panel */}
          <div className="w-[280px] h-full shrink-0 border border-[#EBEBEB] bg-[#FAFAFA] rounded-[12px] p-[20px] flex flex-col gap-md">
            <span className="text-[12px] font-semibold text-[#7B7B7B] tracking-[0.04em] uppercase">
              TOP ORIGINS
            </span>
            <div className="flex flex-col gap-[8px] overflow-y-auto pr-1">
              {(topOrigins && topOrigins.length > 0 ? topOrigins : DEFAULT_TOP_ORIGINS).map((origin, idx) => {
                const isHovered = hoveredOrigin === origin.name;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between text-[14px] p-2 rounded-[8px] transition-all cursor-pointer ${
                      isHovered ? "bg-white shadow-sm border border-[#EBEBEB]" : "hover:bg-white/60"
                    }`}
                    onMouseEnter={() => setHoveredOrigin(origin.name)}
                    onMouseLeave={() => setHoveredOrigin(null)}
                    onClick={() => router.push(`/migrants?nationality=${encodeURIComponent(origin.name)}`)}
                  >
                    <div className="flex items-center gap-[8px]">
                      <Flag country={origin.name} className="size-5 rounded-full overflow-hidden border border-neutral-100 shrink-0" />
                      <span className="font-semibold text-[#171717]">{origin.name}</span>
                    </div>
                    <span className={`text-[13px] font-semibold size-6 rounded-full flex items-center justify-center transition-colors ${
                      isHovered ? "bg-[#7D52F4] text-white" : "bg-[#F5F5F5] text-[#5C5C5C]"
                    }`}>
                      {origin.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Case Pipeline Progress Segment */}
      <div className="flex flex-col gap-[12px] w-full mt-4">
        {/* Header */}
        <div className="flex items-center justify-between w-full h-[30px]">
          <span className="text-[20px] text-[#171717] tracking-[-0.006em] font-aeonik-medium">
            Case pipeline
          </span>
        </div>

        {/* White Card Container */}
        <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-[20px] flex flex-col w-full shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          {/* Dynamic Tooltip & Segmented Progress Bar */}
          {(() => {
            const segments = pipelineSegments.length > 0 ? pipelineSegments : [
              { color: "bg-[#335CFF]", pct: 26, label: "Pre-CoS", count: 0 },
              { color: "bg-[#7D52F4]", pct: 14.5, label: "CoS Management", count: 0 },
              { color: "bg-[#F6B51E]", pct: 14.5, label: "Visa", count: 0 },
              { color: "bg-[#1FC16B]", pct: 45, label: "Active", count: 0 },
            ];

            const activeSeg = segments.find(s => s.label === hoveredPipelineSegment)
              ?? segments.find(s => s.label === "CoS Management")
              ?? segments.find(s => s.label !== "Active")
              ?? segments[0];

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
                {/* Tooltip centered over active/hovered segment */}
                <div
                  className="absolute top-0 flex flex-col items-center -translate-x-1/2 pointer-events-none z-10 transition-all duration-200 ease-out"
                  style={{ left: `${left}%` }}
                >
                  <div className="bg-[#171717] text-white text-[11px] font-semibold px-[8px] py-[4px] rounded-[6px] flex items-center gap-[6px] shadow-[0px_8px_16px_rgba(14,18,27,0.12)] uppercase tracking-[0.04em]">
                    <span className="font-medium text-white leading-4">{activeSeg.label}</span>
                    <span className="bg-[#333333] px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold text-white leading-3">
                      {activeSeg.count}
                    </span>
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#171717] rotate-45 -mt-0.5" />
                </div>

                {/* Segmented Progress Bar */}
                <div className="flex gap-[3px] w-full h-[8px]">
                  {segments.map((seg, i) => {
                    const isHovered = (hoveredPipelineSegment === seg.label) || (!hoveredPipelineSegment && activeSeg.label === seg.label);
                    return (
                      <div
                        key={i}
                        onClick={() => router.push(`/cases?stage=${encodeURIComponent(seg.label)}`)}
                        className={`${seg.color} h-full rounded-full transition-all duration-200 cursor-pointer ${
                          isHovered ? "opacity-100 shadow-sm brightness-110 scale-y-110" : "opacity-85 hover:opacity-100"
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
            date: newEvent.date,
            color: newEvent.color ?? "bg-[#7D52F4]",
          };

          // Try POSTing to backend endpoint
          try {
            await apiClient.post(ENDPOINTS.dashboard.events, {
              title: newEvent.title,
              date: newEvent.date,
              color: newEvent.color,
            });
          } catch (e) {
            // Ignore if backend API endpoint not available in proxy
          }

          // 1. Update events state
          setEvents((prev) => [createdEvent, ...prev]);

          // 2. Update calendarData state to show indicator dot on the calendar day cell
          const evtDate = new Date(newEvent.date);
          const monthStart = new Date(evtDate.getFullYear(), evtDate.getMonth(), 1);
          const dayNum = evtDate.getDate();
          
          // Re-trigger calendar month view and select the date
          setDisplayedMonth(monthStart);
          setSelectedDay(dayNum);
        }}
      />
    </div>
  );
}
