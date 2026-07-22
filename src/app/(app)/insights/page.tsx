"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RiFileCopyLine,
  RiInformationLine,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiUserFollowLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiNotificationLine,
} from "@remixicon/react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export default function InsightsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = React.useState<"3M" | "6M" | "1Y" | "ALL">("6M");
  const [cases, setCases] = React.useState<any[]>([]);
  const [tasksCount, setTasksCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [casesRes, tasksRes] = await Promise.all([
          apiClient.get<{ data: any[]; count: number }>(ENDPOINTS.cases.base),
          apiClient.get<{ data: any[]; count: number }>(ENDPOINTS.tasks.base).catch(() => ({ data: [], count: 0 }))
        ]);
        setCases(casesRes.data || []);
        setTasksCount(tasksRes.count ?? tasksRes.data?.length ?? 0);
      } catch (err: any) {
        console.error("Failed to load insights data:", err);
        setError("Failed to load insights data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter cases based on activeFilter
  const filteredCases = React.useMemo(() => {
    if (activeFilter === "ALL") return cases;
    const now = new Date();
    const monthsMap: Record<string, number> = { "3M": 3, "6M": 6, "1Y": 12 };
    const months = monthsMap[activeFilter] || 6;
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());

    return cases.filter((c) => {
      const dateStr = c.creation_date || c.createdAt || c.decision?.granted?.visaStartDate;
      if (!dateStr) return true;
      return new Date(dateStr) >= cutoff;
    });
  }, [cases, activeFilter]);

  // 1. Total cases & In progress count
  const totalCases = filteredCases.length;
  const inProgressCases = filteredCases.filter(
    (c) => c.is_active || c.case_status?.toLowerCase().includes("progress") || c.case_status?.toLowerCase().includes("draft")
  ).length;

  // 2. Approval Rate
  const approvedCases = filteredCases.filter(
    (c) => c.case_status?.toUpperCase() === "GRANTED" || c.case_status?.toUpperCase() === "VISA APPROVED"
  ).length;
  const refusedCases = filteredCases.filter(
    (c) => c.case_status?.toUpperCase() === "REFUSED" || c.case_status?.toUpperCase() === "VISA REFUSED"
  ).length;
  const totalDecisions = approvedCases + refusedCases;
  const approvalRate = totalDecisions > 0 ? Math.round((approvedCases / totalDecisions) * 100) : 0;

  // 3. Avg. Processing Time
  let avgProcessingDays = 0;
  const completedCases = filteredCases.filter(c => c.creation_date && c.decision?.granted?.visaEndDate);
  if (completedCases.length > 0) {
    const totalDays = completedCases.reduce((sum, c) => {
      const start = new Date(c.creation_date).getTime();
      const end = new Date(c.decision.granted.visaEndDate).getTime();
      const diff = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
      return sum + diff;
    }, 0);
    avgProcessingDays = Math.round(totalDays / completedCases.length);
  }

  // 4. Compliance Rate
  const compliantCases = filteredCases.filter((c) => {
    const status = c.case_status?.toUpperCase();
    const migration = (c.migration_stage || "").toUpperCase();
    const isApprovedWithoutRtw = status === "VISA APPROVED" && migration !== "IN UK";
    const isAwaitingDecision = status === "AWAITING UKVI DECISION";
    return !isApprovedWithoutRtw && !isAwaitingDecision;
  }).length;
  const complianceRate = totalCases > 0 ? Math.round((compliantCases / totalCases) * 100) : 0;

  // 5. Active Migrants
  const activeMigrants = filteredCases.filter(
    (c) => c.migration_stage?.toUpperCase() === "ENTERED" || c.migration_stage?.toUpperCase() === "IN UK"
  ).length;

  // Group cases dynamically by month of creation for the Stacked Bar Chart (keyed by year + month)
  const chartData = React.useMemo(() => {
    const now = new Date();
    const last5Months: { key: string; name: string; Approved: number; Refused: number; "In Progress": number; total: number }[] = [];
    
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last5Months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: monthNames[d.getMonth()],
        Approved: 0,
        Refused: 0,
        "In Progress": 0,
        total: 0,
      });
    }

    filteredCases.forEach((c) => {
      const dateStr = c.creation_date || c.createdAt;
      if (!dateStr) return;
      const createdDate = new Date(dateStr);
      const caseKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}`;
      
      const targetMonth = last5Months.find(m => m.key === caseKey);
      if (targetMonth) {
        const status = c.case_status?.toUpperCase();
        if (status === "GRANTED" || status === "VISA APPROVED") {
          targetMonth.Approved += 1;
        } else if (status === "REFUSED" || status === "VISA REFUSED") {
          targetMonth.Refused += 1;
        } else {
          targetMonth["In Progress"] += 1;
        }
        targetMonth.total += 1;
      }
    });

    return last5Months;
  }, [filteredCases]);

  // KPI Metrics Configuration
  const metrics = [
    {
      title: "TOTAL CASES",
      value: String(totalCases),
      subtext: `${inProgressCases} in progress`,
      icon: RiFileCopyLine,
    },
    {
      title: "APPROVAL RATE",
      value: `${approvalRate}%`,
      subtext: `${approvedCases} approved, ${refusedCases} refused`,
      icon: RiInformationLine,
    },
    {
      title: "AVG. PROCESSING TIME",
      value: `${avgProcessingDays}d`,
      subtext: "Screening to decision",
      icon: RiFileTextLine,
    },
    {
      title: "COMPLIANCE RATE",
      value: `${complianceRate}%`,
      subtext: `${compliantCases} of ${totalCases} cases compliant`,
      icon: RiCheckboxCircleLine,
    },
    {
      title: "ACTIVE MIGRANTS",
      value: String(activeMigrants),
      subtext: "Currently in the UK",
      icon: RiUserFollowLine,
    },
  ];

  // Circular progress properties
  const radius = 15;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (complianceRate / 100) * circumference;

  const pendingTasks = tasksCount !== null ? tasksCount : filteredCases.filter(c => c.case_status === "AWAITING UKVI DECISION" || c.case_status === "VISA APPROVED").length;
  const totalDocs = filteredCases.reduce((sum, c) => sum + (c.files?.length || 0), 0);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px] text-neutral-500 font-sans">
        <div className="flex flex-col items-center gap-xs">
          <svg className="animate-spin h-8 w-8 text-[#7D52F4]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-paragraph-sm font-medium mt-sm">Loading insights...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans animate-fade-in text-[#171717] select-none bg-[#F7F7F7] min-h-full">
      {/* Page Header */}
      <div className="bg-white rounded-t-[16px] flex flex-col shrink-0">
        <div className="px-6 md:px-[64px] pt-[40px] pb-[24px] flex flex-col gap-md md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-xs flex-1 min-w-0">
            <h1 className="font-aeonik-medium text-[24px] leading-[32px] text-[#171717]">
              Insights
            </h1>
            <p className="text-paragraph-sm text-neutral-500 max-w-[600px]">
              Analytics and trends across your sponsorship cases and migrants.
            </p>
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center bg-[#F5F5F5] p-[4px] rounded-full h-[28px] shrink-0">
            {(["3M", "6M", "1Y", "ALL"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`h-full px-[12px] text-[11px] font-semibold rounded-full transition-all cursor-pointer border-0 ${
                  activeFilter === filter
                    ? "bg-white text-[#171717] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                    : "text-[#5C5C5C] hover:text-[#171717]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="border-b border-[#EBEBEB] w-full h-0" />
      </div>

      <div className="px-6 md:px-[64px] py-[32px] flex flex-col gap-[24px] flex-1">
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-[12px] text-red-700 text-paragraph-sm font-medium">
            {error}
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-[12px] text-amber-800 text-paragraph-sm font-medium">
            No cases found for the selected time filter.
          </div>
        ) : null}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#EBEBEB] rounded-[16px] p-[20px] pb-[16px] flex flex-col justify-between shadow-[0px_1px_2px_rgba(10,13,20,0.03)] h-[130px]"
              >
                <div className="flex items-start justify-between w-full">
                  <span className="text-[11px] font-semibold tracking-[0.06em] text-[#5C5C5C] uppercase">
                    {m.title}
                  </span>
                  <Icon className="size-4 text-[#A4A4A4]" />
                </div>
                <div className="flex flex-col mt-auto">
                  <span className="text-[28px] font-semibold text-[#171717] leading-none tracking-tight">
                    {m.value}
                  </span>
                  <span className="text-[12px] text-[#5C5C5C] mt-[6px] truncate leading-normal">
                    {m.subtext}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Widgets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] items-start">
          {/* Cases Overview Column (Span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-[12px] w-full">
            <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717] text-left">
              Cases overview
            </h3>
            <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-[20px] pb-[16px] flex flex-col justify-end shadow-[0px_1px_2px_rgba(10,13,20,0.03)] h-[273px] w-full">
              {/* Stacked Chart Container */}
              <div className="w-full h-[185px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 15, right: 0, left: 0, bottom: 0 }}
                    barGap={0}
                  >
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#5C5C5C", fontSize: 11, fontWeight: 500 }}
                      dy={8}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(235, 235, 235, 0.2)" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-[#EBEBEB] p-xs rounded-[8px] shadow-custom-medium text-[12px] text-left font-sans flex flex-col gap-[2px]">
                              <span className="font-semibold text-[#171717] mb-[2px]">
                                {data.name} Cases
                              </span>
                              <span className="text-[#1FC16B]">
                                Approved: {data.Approved}
                              </span>
                              <span className="text-[#FB3748]">
                                Refused: {data.Refused}
                              </span>
                              <span className="text-[#A4A4A4]">
                                In Progress: {data["In Progress"]}
                              </span>
                              <div className="border-t border-[#EBEBEB] my-1" />
                              <span className="font-medium text-[#171717]">
                                Total: {data.total}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Stacked Bars representing Approved, Refused, and In Progress */}
                    <Bar
                      dataKey="In Progress"
                      stackId="a"
                      fill="#EBEBEB"
                      radius={[0, 0, 8, 8]}
                    />
                    <Bar
                      dataKey="Approved"
                      stackId="a"
                      fill="#1FC16B"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="Refused"
                      stackId="a"
                      fill="#FB3748"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Content Divider */}
              <div className="border-t border-[#EBEBEB] my-[16px] w-full" />

              {/* Chart Legend Footer */}
              <div className="flex items-center gap-[16px] text-left">
                <div className="flex items-center gap-[6px]">
                  <span className="size-[8px] rounded-full bg-[#1FC16B] shrink-0" />
                  <span className="text-[12px] font-medium text-[#171717]">
                    Approved
                  </span>
                </div>
                <div className="flex items-center gap-[6px]">
                  <span className="size-[8px] rounded-full bg-[#FB3748] shrink-0" />
                  <span className="text-[12px] font-medium text-[#171717]">
                    Refused
                  </span>
                </div>
                <div className="flex items-center gap-[6px]">
                  <span className="size-[8px] rounded-full bg-[#EBEBEB] shrink-0" />
                  <span className="text-[12px] font-medium text-[#171717]">
                    In Progress
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Health Column (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-[12px] w-full">
            <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717] text-left">
              Compliance health
            </h3>
            <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-[20px] pb-[16px] flex flex-col gap-[20px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
              {/* Progress Gauge */}
              <div className="flex items-center gap-[16px] w-full">
                {/* Custom SVG Circular Gauge */}
                <div className="relative size-[40px] shrink-0">
                  <svg className="size-full transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r={radius}
                      stroke="#EBEBEB"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r={radius}
                      stroke="#F6B51E"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Progress Labels */}
                <div className="flex flex-col text-left">
                  <span className="text-[14px] font-semibold text-[#171717] leading-[20px]">
                    {complianceRate}% compliant
                  </span>
                  <span className="text-[13px] text-[#7B7B7B] leading-[20px] flex items-center gap-[4px] mt-[2px]">
                    <span>{pendingTasks} tasks</span>
                    <span>•</span>
                    <span>{totalDocs} docs</span>
                  </span>
                </div>
              </div>

              {/* Compliance Items List */}
              <div className="flex flex-col gap-[10px] w-full">
                {/* Item 1: Right to work check */}
                <button 
                  type="button"
                  onClick={() => router.push("/cases")}
                  className="w-full flex items-center justify-between border border-[#EBEBEB] rounded-[12px] bg-white px-[16px] py-[12px] h-[52px] cursor-pointer hover:bg-[#FDFDFD] active:bg-neutral-50 transition-colors group text-left font-inherit focus:outline-none focus:ring-1 focus:ring-[#7D52F4]"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="size-8 rounded-full bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center font-bold text-[14px] shrink-0">
                      !
                    </div>
                    <span className="text-[14px] font-medium text-[#171717] group-hover:text-[#7D52F4] transition-colors">
                      Right to work check
                    </span>
                  </div>
                  <div
                    className="size-7 bg-[#F5F5F5] group-hover:bg-[#EBEBEB] rounded-full flex items-center justify-center text-[#5C5C5C] transition-colors"
                  >
                    <RiArrowRightSLine className="size-4" />
                  </div>
                </button>

                {/* Item 2: Documents */}
                <button 
                  type="button"
                  onClick={() => router.push("/migrants")}
                  className="w-full flex items-center justify-between border border-[#EBEBEB] rounded-[12px] bg-white px-[16px] py-[12px] h-[52px] cursor-pointer hover:bg-[#FDFDFD] active:bg-neutral-50 transition-colors group text-left font-inherit focus:outline-none focus:ring-1 focus:ring-[#7D52F4]"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="size-8 rounded-full bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center font-bold text-[14px] shrink-0">
                      !
                    </div>
                    <span className="text-[14px] font-medium text-[#171717] group-hover:text-[#7D52F4] transition-colors">
                      Documents
                    </span>
                  </div>
                  <div
                    className="size-7 bg-[#F5F5F5] group-hover:bg-[#EBEBEB] rounded-full flex items-center justify-center text-[#5C5C5C] transition-colors"
                  >
                    <RiArrowRightSLine className="size-4" />
                  </div>
                </button>

                {/* Item 3: Salary */}
                <button 
                  type="button"
                  onClick={() => router.push("/cases")}
                  className="w-full flex items-center justify-between border border-[#EBEBEB] rounded-[12px] bg-white px-[16px] py-[12px] h-[52px] cursor-pointer hover:bg-[#FDFDFD] active:bg-neutral-50 transition-colors group text-left font-inherit focus:outline-none focus:ring-1 focus:ring-[#7D52F4]"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="size-8 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                      <RiCheckLine className="size-4" />
                    </div>
                    <span className="text-[14px] font-medium text-[#171717] group-hover:text-[#7D52F4] transition-colors">
                      Salary
                    </span>
                  </div>
                  <div
                    className="size-7 bg-[#F5F5F5] group-hover:bg-[#EBEBEB] rounded-full flex items-center justify-center text-[#5C5C5C] transition-colors"
                  >
                    <RiArrowRightSLine className="size-4" />
                  </div>
                </button>

                {/* Item 4: SMS reports */}
                <button 
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center justify-between border border-[#EBEBEB] rounded-[12px] bg-white px-[16px] py-[12px] h-[52px] cursor-pointer hover:bg-[#FDFDFD] active:bg-neutral-50 transition-colors group text-left font-inherit focus:outline-none focus:ring-1 focus:ring-[#7D52F4]"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="size-8 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center shrink-0">
                      <RiNotificationLine className="size-4" />
                    </div>
                    <span className="text-[14px] font-medium text-[#171717] group-hover:text-[#7D52F4] transition-colors">
                      SMS reports
                    </span>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <span className="text-[14px] text-[#7B7B7B]">None yet</span>
                    <div
                      className="size-7 bg-[#F5F5F5] group-hover:bg-[#EBEBEB] rounded-full flex items-center justify-center text-[#5C5C5C] transition-colors"
                    >
                      <RiArrowRightSLine className="size-4" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
