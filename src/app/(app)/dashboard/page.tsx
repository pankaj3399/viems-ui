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

// Sub-components
function MetricCard({
  title,
  value,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) {
  return (
    <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-[16px_20px_20px] w-full h-[88px] flex flex-col justify-between relative shadow-[0px_1px_2px_rgba(10,13,20,0.03)] font-sans">
      <span className="text-[11px] font-semibold tracking-[0.02em] text-[#171717]/60 uppercase">
        {title}
      </span>
      <span className="text-[28px] font-medium text-[#171717] tracking-[-0.01em] leading-none mt-xs">
        {value}
      </span>
      <Icon className={`size-5 text-[#5C5C5C] absolute top-3 right-3 ${colorClass}`} />
    </div>
  );
}

function TaskItem({
  title,
  owner,
  due,
  dotColor,
}: {
  title: string;
  owner: string;
  due: string;
  dotColor: string;
}) {
  return (
    <div className="flex flex-row items-start py-[16px] px-[12px] gap-[12px] bg-white border border-[#EBEBEB] rounded-[12px] hover:border-neutral-300 transition-colors cursor-pointer select-none w-full">
      {/* Content row */}
      <div className="flex flex-row items-center gap-[4px] flex-1 min-w-0">
        {/* Dot */}
        <div className="flex items-center justify-center p-[6px] shrink-0">
          <div className={`w-[6px] h-[6px] rounded-full ${dotColor}`} />
        </div>
        {/* Text stack */}
        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
          <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]">
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
      <div className="flex items-center justify-center size-6 bg-[#F7F7F7] rounded-full shrink-0 mt-[10px]">
        <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
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
}: {
  avatarText: string;
  avatarBg: string;
  title: string;
  owner: string;
  time: string;
}) {
  return (
    <div className="flex items-start gap-[12px] py-[12px] first:pt-0 last:pb-0 border-b border-[#F5F5F5] last:border-0 relative font-sans">
      <div className={`size-8 rounded-full ${avatarBg} flex items-center justify-center shrink-0`}>
        <span className="text-[13px] font-medium text-[#171717]">{avatarText}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] leading-[20px]">
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

  const today = React.useMemo(() => new Date(), []);
  const currentDateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Parallel data loading ────────────────────────────────────────────────
  React.useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        // Build calendar date range for current month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
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

        if (logsData.status === "fulfilled") setLogs(logsData.value?.logs ?? []);
        else console.error("Logs load failed:", logsData.reason);

        if (schedulerData.status === "fulfilled") setSchedulerEvents(schedulerData.value ?? []);
        else console.error("Scheduler load failed:", schedulerData.reason);

      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Calendar dots from backend
  const calendarDotDays = React.useMemo(() => {
    const result: Record<number, string> = {};
    Object.entries(calendarData).forEach(([tsStr, items]) => {
      if (!items.length) return;
      const d = new Date(Number(tsStr));
      if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
        const hasVisaEnd = items.some((i) => i.isVisaEnd);
        result[d.getDate()] = hasVisaEnd ? "bg-[#FB3748]" : "bg-[#7D52F4]";
      }
    });
    return result;
  }, [calendarData, today]);

  // Upcoming events: next 3 sorted by date
  const upcomingEvents = React.useMemo(() => {
    return [...events]
      .filter((e) => new Date(e.date).getTime() >= nowTime)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events, nowTime]);

  // Recent activity: map logs to display rows
  const activityRows = React.useMemo(() => {
    if (!logs.length) return null; // show static fallback
    return logs.slice(0, 6).map((log, i) => {
      const nameParts = (log.userName ?? "System").split(" ");
      const initials = nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
        : nameParts[0].slice(0, 2).toUpperCase();
      const avatarBg = AVATAR_BG_POOL[i % AVATAR_BG_POOL.length];
      const timeLabel = new Date(log.creationDate).toLocaleString("en-GB", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      });
      const title = `${log.action} — ${log.entityName} #${log.entityIdentifier}`;
      return { initials, avatarBg, title, owner: log.userName ?? "System", time: timeLabel };
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

  // Nationalities: top 7 origins
  const topOrigins = React.useMemo(() => {
    if (!nationalities.length) return null; // show static fallback
    return [...nationalities]
      .sort((a, b) => b.value - a.value)
      .slice(0, 7)
      .map((n) => ({
        name: n.nationality ?? String(n.id),
        count: Math.round(n.value),
      }));
  }, [nationalities]);

  // Case pipeline: derive from stats task/migrant counts (high=pre-cos, medium=cos, low=visa, active=concluded)
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
          <button className="flex items-center gap-xs px-xl py-lg h-9 bg-white border border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] rounded-[10px] text-[14px] font-semibold leading-[20px] tracking-[-0.006em] transition-all cursor-pointer">
            <RiUploadLine className="size-4 text-[#5C5C5C]" />
            Import
          </button>
          <button 
            onClick={() => router.push("/cases")}
            className="flex items-center gap-xs px-xl py-lg h-9 bg-[#7D52F4] hover:bg-brand-dark text-white rounded-[10px] text-[14px] font-semibold leading-[20px] tracking-[-0.006em] transition-all cursor-pointer"
          >
            <RiAddLine className="size-4 text-white" />
            New migrant
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-[16px] w-full">
        <MetricCard title="Active cases" value={activeCasesCount} icon={FoldersLine} colorClass="" />
        <MetricCard title="Visa approved" value={visaApprovedCount} icon={SelectBoxCircleLine} colorClass="" />
        <MetricCard title="Awaiting decision" value={awaitingDecisionCount} icon={FileWarningLine} colorClass="" />
        <MetricCard title="Open tasks" value={loading ? "…" : totalTasksCount} icon={TaskLine} colorClass="" />
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
                className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors"
              >
                Go to Cases
              </button>
            </div>

            {/* White Card Container - Widgets [HR Management] */}
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
                    52
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-[4px]">
                {activeTaskTab === "open" ? (
                  <>
                    {loading ? (
                      // Skeleton placeholders while loading
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
                        />
                      ))
                    ) : (
                      // Fallback static data while backend tasks are empty
                      <>
                        <TaskItem title="Complete RTW check" owner="Mei Chen" due="13 May" dotColor="bg-[#FB3748]" />
                        <TaskItem title="Upload Migrant Signed Docs (MSDs)" owner="James Brown" due="13 May" dotColor="bg-[#F6B51E]" />
                        <TaskItem title="Upload documents" owner="Ravi Patel" due="13 May" dotColor="bg-[#335CFF]" />
                        <TaskItem title="Review and report" owner="Yash Parmar" due="13 May" dotColor="bg-[#FB3748]" />
                        <TaskItem title="Plan visa renewal" owner="Taylor Johnson" due="13 May" dotColor="bg-[#335CFF]" />
                      </>
                    )}
                  </>
                ) : (
                  <div className="py-8 text-center text-neutral-400 text-paragraph-sm">
                    All documents parsed and accounted for.
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
              <button className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors">
                View all
              </button>
            </div>

            {/* White Card Container */}
            <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] flex flex-col gap-xl shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
              <div className="flex flex-col">
                {activityRows ? (
                  activityRows.map((row, i) => (
                    <ActivityItem
                      key={i}
                      avatarText={row.initials}
                      avatarBg={row.avatarBg}
                      title={row.title}
                      owner={row.owner}
                      time={row.time}
                    />
                  ))
                ) : (
                  // Fallback static rows
                  <>
                    <ActivityItem avatarText="TJ" avatarBg="bg-[#EFEBFF] text-[#7D52F4]" title="Taylor Johnson arrived in the UK" owner="Nathan Wood" time="today, 01:12 PM" />
                    <ActivityItem avatarText="JP" avatarBg="bg-[#FEE2E2] text-[#EF4444]" title="Visa refused for Jin Park" owner="System" time="23 Mar, 09:30 AM" />
                    <ActivityItem avatarText="SR" avatarBg="bg-[#E1FBF2] text-[#10B981]" title="CoS assigned for Sofia Reyes" owner="System" time="today, 01:12 PM" />
                    <ActivityItem avatarText="MS" avatarBg="bg-[#EFEBFF] text-[#7D52F4]" title="Eligibility cleared for Maria Santos" owner="System" time="today, 01:12 PM" />
                    <ActivityItem avatarText="CV" avatarBg="bg-[#F5F5F5] text-[#171717]" title="SMS report submitted for Carlos Vega" owner="System" time="23 Mar, 09:30 AM" />
                    <ActivityItem avatarText="TJ" avatarBg="bg-[#EFEBFF] text-[#7D52F4]" title="Phone call with Taylor Johnson" owner="Nathan Wood" time="today, 01:12 PM" />
                  </>
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
                      TODAY
                    </span>
                  </div>
                  <div className="flex items-center gap-[6px] bg-[#F5F5F5] rounded-[8px] p-[6px]">
                    <button className="size-6 flex items-center justify-center bg-white rounded-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] cursor-pointer">
                      <RiArrowLeftSLine className="size-5 text-[#5C5C5C]" />
                    </button>
                    <button className="size-6 flex items-center justify-center bg-white rounded-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] cursor-pointer">
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
                    // Compute current month's calendar layout
                    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                    // 0=Sun→convert to 0=Mon
                    const startDay = (firstDay.getDay() + 6) % 7;
                    const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                    const selectedDay = today.getDate();
                    const cells: React.ReactNode[] = [];

                    // Use live calendarDotDays from backend (falls back to {} when loading)
                    const dotMap = calendarDotDays;

                    // Empty cells before day 1
                    for (let e = 0; e < startDay; e++) {
                      cells.push(
                        <div key={`empty-${e}`} className="flex items-center justify-center h-[40px] rounded-[8px]" />
                      );
                    }

                    // Day cells
                    for (let d = 1; d <= totalDays; d++) {
                      const isSelected = d === selectedDay;
                      const dotColor = dotMap[d] || null;

                      // Determine text color
                      let textColor = "text-[#5C5C5C]";
                      if (isSelected) textColor = "text-white";
                      else if (d <= 4) textColor = "text-[#A4A4A4]"; // first few days lighter in design

                      cells.push(
                        <div key={d} className="flex items-center justify-center h-[40px]">
                          <div
                            className={`relative flex items-center justify-center rounded-[8px] cursor-pointer ${
                              isSelected
                                ? "size-[40px] bg-[#262626]"
                                : "w-full h-full hover:bg-neutral-50"
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

                    // Fill remaining cells for last row (next month days)
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

                    // Render rows
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
                  {/* UPCOMING header with badge */}
                  <div className="flex items-center gap-sm">
                    <span className="text-[12px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[16px]">
                      UPCOMING
                    </span>
                    <span className="inline-flex items-center justify-center min-w-[20px] h-[18px] bg-[#EBEBEB] rounded-[4px] px-[2px] text-[11px] font-medium text-[#171717] tracking-[0.02em] uppercase leading-[12px]">
                      {upcomingEvents.length || events.length || 6}
                    </span>
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
                          <div key={evt.id} className="flex items-center gap-[16px] pl-sm">
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
                      // Fallback static upcoming events
                      <>
                        {/* Event row 1 */}
                        <div className="flex items-center gap-[16px] pl-sm">
                          <div className="flex items-center gap-[16px]">
                            <span className="size-[6px] rounded-full bg-[#FB3748] shrink-0" />
                            <div className="flex flex-col items-center px-[4px] py-[2px] bg-[#F7F7F7] rounded-[4px] w-[31px] h-[32px]">
                              <span className="text-[10px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[16px] -mb-[4px]">12</span>
                              <span className="text-[10px] font-medium text-[#A4A4A4] tracking-[0.04em] uppercase leading-[16px]">MAY</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-sm flex-1">
                            <div className="flex items-center gap-sm">
                              <div className="size-8 rounded-full bg-[#EBEBEB] flex items-center justify-center shrink-0">
                                <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] leading-[20px]">AM</span>
                              </div>
                              <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] leading-[20px]">Ami Monarch</span>
                            </div>
                            <span className="text-[9px] text-[#5C5C5C]">•</span>
                            <span className="text-[13px] font-medium text-[#171717] tracking-[-0.006em] leading-[20px] underline">Check RTW</span>
                          </div>
                        </div>

                        {/* Event row 2 */}
                        <div className="flex items-center gap-[16px] pl-sm">
                          <div className="flex items-center gap-[16px]">
                            <span className="size-[6px] rounded-full bg-[#7D52F4] shrink-0" />
                            <div className="flex flex-col items-center px-[4px] py-[2px] bg-[#F7F7F7] rounded-[4px] w-[31px] h-[32px]">
                              <span className="text-[10px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[16px] -mb-[4px]">13</span>
                              <span className="text-[10px] font-medium text-[#A4A4A4] tracking-[0.04em] uppercase leading-[16px]">MAY</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-sm flex-1">
                            <div className="flex items-center gap-sm">
                              <div className="size-8 rounded-full bg-[#EBEBEB] flex items-center justify-center shrink-0">
                                <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] leading-[20px]">JB</span>
                              </div>
                              <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] leading-[20px]">James Brown</span>
                            </div>
                            <span className="text-[9px] text-[#5C5C5C]">•</span>
                            <span className="text-[13px] text-[#5C5C5C] tracking-[-0.006em] leading-[20px]">Upload documents</span>
                          </div>
                        </div>

                        {/* Event row 3 */}
                        <div className="flex items-center gap-[16px] pl-sm">
                          <div className="flex items-center gap-[16px]">
                            <span className="size-[6px] rounded-full bg-[#7D52F4] shrink-0" />
                            <div className="flex flex-col items-center px-[4px] py-[2px] bg-[#F7F7F7] rounded-[4px] w-[31px] h-[32px]">
                              <span className="text-[10px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[16px] -mb-[4px]">14</span>
                              <span className="text-[10px] font-medium text-[#A4A4A4] tracking-[0.04em] uppercase leading-[16px]">MAY</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-sm flex-1">
                            <div className="flex items-center gap-sm">
                              <div className="size-8 rounded-full bg-[#EBEBEB] flex items-center justify-center shrink-0">
                                <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] leading-[20px]">RP</span>
                              </div>
                              <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] leading-[20px]">Ravi Patel</span>
                            </div>
                            <span className="text-[9px] text-[#5C5C5C]">•</span>
                            <span className="text-[13px] text-[#5C5C5C] tracking-[-0.006em] leading-[20px]">Assign CoS</span>
                          </div>
                        </div>
                      </>
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
              <button className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors">
                View all
              </button>
            </div>

            {/* White Card Container */}
            <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] flex flex-col gap-xl shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
              {/* Split badges */}
              <div className="grid grid-cols-2 gap-lg w-full">
                <div className="bg-[#E1FBF2] border border-[#A7F3D0] rounded-[12px] p-[12px_16px] flex flex-col justify-between h-[72px] relative">
                  <span className="text-[11px] font-semibold text-[#065F46] tracking-[0.02em] uppercase">
                    IN THE UK
                  </span>
                  <span className="text-[24px] font-semibold text-[#065F46] leading-none">
                    {stats?.migrants?.in || 6}
                  </span>
                  <RiCheckboxCircleLine className="size-4 text-[#065F46] absolute top-3 right-3" />
                </div>
                <div className="bg-[#F5F5F5] border border-[#EBEBEB] rounded-[12px] p-[12px_16px] flex flex-col justify-between h-[72px] relative">
                  <span className="text-[11px] font-semibold text-[#5C5C5C] tracking-[0.02em] uppercase">
                    OUTSIDE UK
                  </span>
                  <span className="text-[24px] font-semibold text-[#171717] leading-none">
                    {stats?.migrants?.out || 10}
                  </span>
                  <RiBriefcaseLine className="size-4 text-[#5C5C5C] absolute top-3 right-3" />
                </div>
              </div>

              {/* Leave to remain alerts list */}
              <div className="flex flex-col gap-lg border-t border-[#EBEBEB] pt-[16px]">
                <span className="text-[12px] font-semibold text-[#171717] tracking-[0.04em] uppercase">
                  LEAVE TO REMAIN ALERTS
                </span>
                
                <div className="flex flex-col gap-[12px]">
                  {(ltrAlerts.length > 0 ? ltrAlerts : [
                    { name: "Sofia Reyes", initials: "SR", daysLeft: 7, isUrgent: true },
                    { name: "James Brown", initials: "JB", daysLeft: 14, isUrgent: true },
                    { name: "Mei Cheng",   initials: "MC", daysLeft: 37, isUrgent: false },
                    { name: "Carlos Vega", initials: "CV", daysLeft: 40, isUrgent: false },
                    { name: "Ravi Patel",  initials: "RP", daysLeft: 40, isUrgent: false },
                  ]).map((alert, i) => (
                    <div key={i} className="flex items-center justify-between text-[14px]">
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

      {/* Migrants by Origin Card with Dot-matrix Map */}
      <div className="flex flex-col gap-[12px] w-full">
        {/* Header (Outside the Card) */}
        <div className="flex items-center justify-between w-full h-[30px]">
          <span className="text-[20px] text-[#171717] tracking-[-0.006em] font-aeonik-medium">
            Migrants by origin
          </span>
          <button className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors">
            View all insights
          </button>
        </div>

        {/* White Card Container */}
        <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] flex gap-[24px] items-start h-[548px] w-full shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          {/* Map Column */}
          <div className="flex-1 h-full flex flex-col items-center justify-between relative py-[12px]">
            {/* SVG Map (using the high-fidelity user dot-matrix SVG) */}
            <div className="w-full flex-1 relative flex items-center justify-center min-h-0">
              <WorldMapSvg className="w-full h-full text-[#E5E7EB]" />
              
              {/* Paris France Marker */}
              <div 
                className="absolute size-3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                style={{ left: "55.6%", top: "28.7%" }}
              >
                <div className="absolute size-5 rounded-full bg-[#7D52F4]/40 animate-ping" />
                <div className="size-2 rounded-full bg-[#7D52F4]" />
              </div>

              {/* Custom interactive tooltip over Paris */}
              <div 
                className="absolute flex flex-col items-center -translate-x-1/2 pointer-events-none"
                style={{ left: "55.6%", top: "24.5%" }}
              >
                <div className="bg-[#171717] text-white text-[12px] font-semibold py-1 px-[10px] rounded-[4px] shadow-lg flex items-center gap-[6px]">
                  <span>Paris, France</span>
                </div>
                <div className="w-1.5 h-1.5 bg-[#171717] rotate-45 -mt-0.5" />
              </div>
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
            <div className="flex flex-col gap-[14px] overflow-y-auto pr-1">
              {(topOrigins ?? [
                { name: "China", count: 2 },
                { name: "India", count: 2 },
                { name: "France", count: 3 },
                { name: "Greenland", count: 1 },
                { name: "Italy", count: 1 },
                { name: "Jamaica", count: 2 },
                { name: "United States", count: 2 },
              ]).map((origin, idx) => (
                <div key={idx} className="flex items-center justify-between text-[14px]">
                  <div className="flex items-center gap-[8px]">
                    <Flag country={origin.name} className="size-5 rounded-full overflow-hidden border border-neutral-100" />
                    <span className="font-semibold text-[#171717]">{origin.name}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#5C5C5C] bg-[#F5F5F5] size-5 rounded-full flex items-center justify-center">
                    {origin.count}
                  </span>
                </div>
              ))}
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
        <div className="bg-white border border-[#FFFFFF] rounded-[16px] px-[16px] pt-[12px] pb-[16px] h-[34px] flex items-center w-full shadow-[0px_1px_2px_rgba(10,13,20,0.03)] relative">
          {/* Dynamic tooltip over the largest non-green segment */}
          {pipelineSegments.length > 0 && (() => {
            // Show tooltip over the first non-green segment (CoS Management or first)
            const tipSeg = pipelineSegments.find(s => s.label !== "Active") ?? pipelineSegments[0];
            // Compute left % = midpoint of that segment
            let left = 0;
            for (const s of pipelineSegments) {
              if (s.label === tipSeg.label) { left += s.pct / 2; break; }
              left += s.pct;
            }
            return (
              <div
                className="absolute top-[-36px] flex flex-col items-center -translate-x-1/2 pointer-events-none z-10"
                style={{ left: `${left}%` }}
              >
                <div className="bg-[#171717] text-white text-[11px] font-semibold px-[6px] py-[4px] rounded-[4px] flex items-center gap-[6px] shadow-[0px_12px_24px_rgba(14,18,27,0.06)] uppercase tracking-[0.04em]">
                  <span className="font-medium text-white leading-4">{tipSeg.label}</span>
                  <span className="bg-[#333333] px-1 py-0.5 rounded-[4px] text-[10px] font-semibold text-white leading-3">
                    {tipSeg.count}
                  </span>
                </div>
                <div className="w-1.5 h-1.5 bg-[#171717] rotate-45 -mt-0.5" />
              </div>
            );
          })()}

          {/* Segmented Progress Bar */}
          <div className="flex gap-[2px] w-full h-[6px]">
            {(pipelineSegments.length > 0 ? pipelineSegments : [
              { color: "bg-[#335CFF]", pct: 26, label: "Pre-CoS", count: 0 },
              { color: "bg-[#7D52F4]", pct: 14.5, label: "CoS Management", count: 0 },
              { color: "bg-[#F6B51E]", pct: 14.5, label: "Visa", count: 0 },
              { color: "bg-[#1FC16B]", pct: 45, label: "Active", count: 0 },
            ]).map((seg, i) => (
              <div
                key={i}
                className={`${seg.color} h-[6px] rounded-full`}
                style={{ width: `${seg.pct}%` }}
                title={`${seg.label}: ${seg.count}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
