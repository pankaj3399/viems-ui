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
import { WorldMapSvg } from "../dashboard/WorldMapSvg";
import { Flag } from "@/components/ui/flag";

const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

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
  Romania: { left: "55.2%", top: "37.5%", label: "Romania" },
  Romanian: { left: "55.2%", top: "37.5%", label: "Romania" },
  Ukraine: { left: "57.5%", top: "34.0%", label: "Ukraine" },
  Ukrainian: { left: "57.5%", top: "34.0%", label: "Ukraine" },
  Vietnam: { left: "77.0%", top: "54.0%", label: "Vietnam" },
  Vietnamese: { left: "77.0%", top: "54.0%", label: "Vietnam" },
  Turkey: { left: "57.0%", top: "41.0%", label: "Turkey" },
  Turkish: { left: "57.0%", top: "41.0%", label: "Turkey" },
  "South Africa": { left: "54.0%", top: "78.0%", label: "South Africa" },
  "South African": { left: "54.0%", top: "78.0%", label: "South Africa" },
  Ghana: { left: "47.5%", top: "58.0%", label: "Ghana" },
  Ghanaian: { left: "47.5%", top: "58.0%", label: "Ghana" },
  Kenya: { left: "58.5%", top: "61.0%", label: "Kenya" },
  Kenyan: { left: "58.5%", top: "61.0%", label: "Kenya" },
};

const TIME_RANGE_MULTIPLIERS: Record<string, number> = {
  "5D": 0.17,
  "2W": 0.47,
  "1M": 1.0,
  "6M": 6.0,
  "1Y": 12.0,
};

interface NationalityStat {
  id: string | number;
  nationality: string;
  value: number;
  color?: string;
}

function getCaseDate(c: any): Date | null {
  const dateStr = c.creation_date || c.createdAt || c.decision?.granted?.visaStartDate;
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export default function InsightsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = React.useState<"3M" | "6M" | "1Y" | "ALL">("6M");
  const [cases, setCases] = React.useState<any[]>([]);
  const [nationalities, setNationalities] = React.useState<NationalityStat[]>([]);
  const [originFilter, setOriginFilter] = React.useState("1M");
  const [hoveredOrigin, setHoveredOrigin] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [casesData, natData] = await Promise.allSettled([
          apiClient.get<any[]>(ENDPOINTS.cases.base),
          apiClient.get<NationalityStat[]>(ENDPOINTS.statistics.nationalities),
        ]);

        if (casesData.status === "fulfilled") setCases(Array.isArray(casesData.value) ? casesData.value : []);
        if (natData.status === "fulfilled") setNationalities(natData.value ?? []);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load insights data", err);
        setError("Failed to load data. Please try again later.");
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
      const caseDate = getCaseDate(c);
      if (!caseDate) return false;
      return caseDate >= cutoff;
    });
  }, [cases, activeFilter]);

  // Nationalities calculation (aggregate counts unscaled, rounded to integer)
  const topOrigins = React.useMemo(() => {
    if (nationalities.length > 0) {
      return [...nationalities]
        .sort((a, b) => b.value - a.value)
        .slice(0, 7)
        .map((n) => ({
          name: n.nationality ?? String(n.id),
          count: Math.round(n.value),
        }));
    }
    return [];
  }, [nationalities]);

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
  const completedCases = filteredCases.filter((c) => {
    const creation = getCaseDate(c);
    const decisionDateStr = c.decision?.decisionDate || c.decision?.date || c.decision_date || c.decision?.granted?.visaStartDate;
    if (!creation || !decisionDateStr) return false;
    const decisionDate = new Date(decisionDateStr);
    return !isNaN(decisionDate.getTime());
  });

  if (completedCases.length > 0) {
    const totalDays = completedCases.reduce((sum, c) => {
      const creation = getCaseDate(c)!;
      const decisionDateStr = c.decision?.decisionDate || c.decision?.date || c.decision_date || c.decision?.granted?.visaStartDate;
      const decisionDate = new Date(decisionDateStr);
      const diff = Math.max(0, Math.round((decisionDate.getTime() - creation.getTime()) / (1000 * 60 * 60 * 24)));
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

  // Group cases dynamically by month of creation for the Stacked Bar Chart
  const chartData = React.useMemo(() => {
    const now = new Date();
    let countMonths = 6;
    if (activeFilter === "3M") countMonths = 3;
    else if (activeFilter === "6M") countMonths = 6;
    else if (activeFilter === "1Y") countMonths = 12;
    else if (activeFilter === "ALL") {
      const datedCases = cases.map(getCaseDate).filter(Boolean) as Date[];
      if (datedCases.length > 0) {
        const minDate = new Date(Math.min(...datedCases.map((d) => d.getTime())));
        const diffMonths = (now.getFullYear() - minDate.getFullYear()) * 12 + (now.getMonth() - minDate.getMonth()) + 1;
        countMonths = Math.max(3, Math.min(diffMonths, 24));
      }
    }

    const monthBuckets: { key: string; name: string; Approved: number; Refused: number; "In Progress": number; total: number }[] = [];
    for (let i = countMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthBuckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: monthNames[d.getMonth()],
        Approved: 0,
        Refused: 0,
        "In Progress": 0,
        total: 0,
      });
    }

    filteredCases.forEach((c) => {
      const caseDate = getCaseDate(c);
      if (!caseDate) return;
      const caseKey = `${caseDate.getFullYear()}-${caseDate.getMonth()}`;

      const targetMonth = monthBuckets.find((m) => m.key === caseKey);
      if (targetMonth) {
        const status = (c.case_status || "").toUpperCase();
        if (status === "GRANTED" || status.includes("APPROVED")) {
          targetMonth.Approved += 1;
        } else if (status === "REFUSED" || status.includes("REFUSED")) {
          targetMonth.Refused += 1;
        } else {
          targetMonth["In Progress"] += 1;
        }
        targetMonth.total += 1;
      }
    });

    return monthBuckets;
  }, [cases, filteredCases, activeFilter]);

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

  const pendingTasks = filteredCases.filter(c => c.case_status === "AWAITING UKVI DECISION" || c.case_status === "VISA APPROVED").length;
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
    <div className="w-full flex flex-col font-sans animate-fade-in text-[#171717] select-none bg-[#F7F7F7] min-h-full pb-[80px]">
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
                  <span className="text-[28px] font-semibold text-[#171717] leading-none tracking-tight font-aeonik-medium">
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

        {/* Migrants by Origin Card with Dot-matrix Map (Moved from Dashboard to Insights per Figma spec) */}
        <div className="flex flex-col gap-[12px] w-full">
          <div className="flex items-center justify-between w-full h-[30px]">
            <span className="text-[20px] text-[#171717] tracking-[-0.006em] font-aeonik-medium">
              Migrants by origin
            </span>
          </div>

          <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-[20px] flex gap-[24px] items-start h-[520px] w-full shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
            <div className="flex-1 h-full flex flex-col items-center justify-between relative py-[12px]">
              <div className="w-full flex-1 relative flex items-center justify-center min-h-0">
                <WorldMapSvg className="w-full h-full text-[#E5E7EB]" />
                
                {(() => {
                  const originsList = topOrigins;
                  const activeItem = originsList.find((o) => o.name === hoveredOrigin) || originsList[0];
                  
                  const getCoords = (name: string) => {
                    if (!name) return null;
                    if (COUNTRY_COORDINATES[name]) return COUNTRY_COORDINATES[name];
                    const lower = name.toLowerCase();
                    for (const [k, v] of Object.entries(COUNTRY_COORDINATES)) {
                      if (k.toLowerCase() === lower) return v;
                    }
                    return null;
                  };

                  const activeCoords = activeItem ? getCoords(activeItem.name) : null;
                  const unmappedOrigins = originsList.filter((o) => !getCoords(o.name));

                  return (
                    <>
                      {originsList.map((origin) => {
                        const coords = getCoords(origin.name);
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

                      {unmappedOrigins.length > 0 && (
                        <div className="absolute bottom-2 left-2 bg-[#FAF5FF] border border-[#E9D8FD] text-[#6B21A8] text-[11px] font-medium px-2.5 py-1 rounded-[6px] shadow-xs flex items-center gap-1.5 z-10">
                          <span>Unsupported locations: {unmappedOrigins.map((u) => u.name).join(", ")}</span>
                        </div>
                      )}

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

              <div className="flex bg-[#F5F5F5] rounded-[8px] p-0.5 w-[240px] shadow-sm select-none shrink-0 mt-4">
                {["5D", "2W", "1M", "6M", "1Y"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setOriginFilter(filter)}
                    className={`flex-1 py-1 text-center rounded-[6px] text-[12px] font-semibold transition-all cursor-pointer border-0 ${
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

            <div className="w-[280px] h-full shrink-0 border border-[#EBEBEB] bg-[#FAFAFA] rounded-[12px] p-[20px] flex flex-col gap-md">
              <span className="text-[12px] font-semibold text-[#7B7B7B] tracking-[0.04em] uppercase">
                TOP ORIGINS
              </span>
              <div className="flex flex-col gap-[8px] overflow-y-auto pr-1">
                {topOrigins.length > 0 ? (
                  topOrigins.map((origin, idx) => {
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
                  })
                ) : (
                  <div className="py-8 flex items-center justify-center text-[13px] text-[#A4A4A4] font-medium">
                    No origin data available
                  </div>
                )}
              </div>
            </div>
          </div>
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
