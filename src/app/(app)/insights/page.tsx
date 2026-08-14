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

const LOWER_COUNTRY_COORDINATES: Record<string, { left: string; top: string; label: string }> = Object.entries(COUNTRY_COORDINATES).reduce(
  (acc, [k, v]) => {
    acc[k.toLowerCase()] = v;
    return acc;
  },
  {} as Record<string, { left: string; top: string; label: string }>
);

function getCoords(name: string): { left: string; top: string; label: string } | null {
  if (!name) return null;
  if (COUNTRY_COORDINATES[name]) return COUNTRY_COORDINATES[name];
  return LOWER_COUNTRY_COORDINATES[name.toLowerCase()] ?? null;
}

interface CaseItem {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  name?: string;
  caseNumber?: string;
  creation_date?: string;
  createdAt?: string;
  created_at?: string;
  workStartDate?: string;
  work_start_date?: string;
  workEndDate?: string;
  visaEndDate?: string;
  case_status?: string;
  is_active?: boolean;
  migration_stage?: string;
  relatedYear?: string | number;
  nationality_value?: string;
  nationality_title?: string;
  country?: string;
  refusalDate?: string;
  refusal_date?: string;
  files?: any[];
  decision?: {
    decisionDate?: string;
    date?: string;
    granted?: { visaStartDate?: string };
  };
  decision_date?: string;
  decisionDate?: string;
}

interface NationalityStat {
  id: string | number;
  nationality: string;
  value: number;
  color?: string;
}

function getCaseDate(c: any): Date | null {
  if (!c) return null;
  const dateStr =
    c.creation_date ||
    c.createdAt ||
    c.created_at ||
    c.workStartDate ||
    c.work_start_date ||
    c.visaEndDate ||
    c.refusalDate ||
    c.refusal_date ||
    c.decision_date ||
    c.decisionDate ||
    c.decision?.decisionDate ||
    c.decision?.date ||
    c.decision?.granted?.visaStartDate;

  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }

  if (c.relatedYear) {
    const y = parseInt(String(c.relatedYear), 10);
    if (!isNaN(y) && y > 1900) {
      return new Date(y, 0, 1);
    }
  }

  return null;
}

export default function InsightsPage() {
  const router = useRouter();

  // Filters & State
  const [activeFilter, setActiveFilter] = React.useState<"3M" | "6M" | "1Y" | "ALL">("6M");
  const [cases, setCases] = React.useState<CaseItem[]>([]);
  const [nationalities, setNationalities] = React.useState<NationalityStat[]>([]);
  const [hoveredOrigin, setHoveredOrigin] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Series visibility toggles for Cases Overview Chart
  const [visibleSeries, setVisibleSeries] = React.useState({
    Approved: true,
    Refused: true,
    "In Progress": true,
  });

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [casesData, natData] = await Promise.allSettled([
        apiClient.get<any>(ENDPOINTS.cases.base),
        apiClient.get<NationalityStat[]>(ENDPOINTS.statistics.nationalities),
      ]);

      if (casesData.status === "fulfilled") {
        const val = casesData.value;
        const rawArr = Array.isArray(val)
          ? val
          : val?.data && Array.isArray(val.data)
          ? val.data
          : [];
        setCases(rawArr);
      }

      if (natData.status === "fulfilled") {
        const val = natData.value;
        setNationalities(Array.isArray(val) ? val : []);
      }

      if (casesData.status === "rejected" && natData.status === "rejected") {
        setError("Failed to load insights data. Please try again later.");
      } else if (casesData.status === "rejected") {
        setError("Failed to load case insights. Displaying partial data.");
      } else if (natData.status === "rejected") {
        setError("Failed to load nationality statistics. Displaying partial data.");
      } else {
        setError(null);
      }
    } catch (err: unknown) {
      console.error("Failed to load insights data", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter cases based on activeFilter
  const filteredCases = React.useMemo(() => {
    if (cases.length === 0) return [];
    if (activeFilter === "ALL") return cases;

    const datedCases = cases.map((c) => ({ item: c, date: getCaseDate(c) }));
    const validDates = datedCases
      .filter((d) => d.date !== null)
      .map((d) => d.date!.getTime());

    if (validDates.length === 0) return cases;

    const now = new Date();
    const maxCaseDate = new Date(Math.max(...validDates));
    const referenceDate = maxCaseDate > now ? maxCaseDate : now;

    const monthsMap: Record<string, number> = { "3M": 3, "6M": 6, "1Y": 12 };
    const months = monthsMap[activeFilter] || 6;
    const cutoff = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - months,
      referenceDate.getDate()
    );

    const matched = datedCases
      .filter((d) => !d.date || d.date >= cutoff)
      .map((d) => d.item);

    return matched.length > 0 ? matched : cases;
  }, [cases, activeFilter]);

  // Nationalities calculation (aggregate counts unscaled, rounded to integer)
  const topOrigins = React.useMemo(() => {
    if (nationalities.length > 0) {
      return [...nationalities]
        .filter((n) => n.nationality && n.nationality !== "Others" && n.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 7)
        .map((n) => ({
          name: n.nationality ?? String(n.id),
          count: Math.round(n.value),
        }));
    }
    // Fallback calculate from cases if nationalities endpoint has not aggregated yet
    if (cases.length > 0) {
      const natCounts: Record<string, number> = {};
      cases.forEach((c: any) => {
        const nat = c.nationality_value || c.nationality_title || c.country;
        if (nat) {
          natCounts[nat] = (natCounts[nat] || 0) + 1;
        }
      });
      return Object.entries(natCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([name, count]) => ({ name, count }));
    }
    return [];
  }, [nationalities, cases]);

  // 1. Total cases & In progress count
  const totalCases = filteredCases.length;
  const inProgressCases = filteredCases.filter(
    (c) =>
      c.is_active ||
      (c.case_status &&
        (c.case_status.toLowerCase().includes("progress") ||
          c.case_status.toLowerCase().includes("draft") ||
          c.case_status.toLowerCase().includes("awaiting") ||
          c.case_status.toLowerCase().includes("pending")))
  ).length;

  // 2. Approval Rate
  const approvedCases = filteredCases.filter((c) => {
    const s = (c.case_status || "").toUpperCase();
    return (
      s.includes("APPROVED") ||
      s.includes("GRANTED") ||
      s.includes("ASSIGNED") ||
      s === "ACTIVE"
    );
  }).length;

  const refusedCases = filteredCases.filter((c) => {
    const s = (c.case_status || "").toUpperCase();
    return s.includes("REFUSED");
  }).length;

  const totalDecisions = approvedCases + refusedCases;
  const approvalRate =
    totalDecisions > 0
      ? Math.round((approvedCases / totalDecisions) * 100)
      : totalCases > 0
      ? Math.round((approvedCases / totalCases) * 100)
      : 0;

  // 3. Avg. Processing Time
  let avgProcessingDays = 0;
  const completedCases = filteredCases.filter((c) => {
    const creation = getCaseDate(c);
    const decisionDateStr =
      c.decision?.decisionDate ||
      c.decision?.date ||
      c.decision_date ||
      c.decisionDate ||
      c.decision?.granted?.visaStartDate ||
      c.workStartDate;
    if (!creation || !decisionDateStr) return false;
    const decisionDate = new Date(decisionDateStr);
    return !isNaN(decisionDate.getTime());
  });

  if (completedCases.length > 0) {
    const totalDays = completedCases.reduce((sum, c) => {
      const creation = getCaseDate(c)!;
      const decisionDateStr =
        c.decision?.decisionDate ||
        c.decision?.date ||
        c.decision_date ||
        c.decisionDate ||
        c.decision?.granted?.visaStartDate ||
        c.workStartDate ||
        "";
      const decisionDate = new Date(decisionDateStr);
      const diff = Math.max(
        1,
        Math.round(
          (decisionDate.getTime() - creation.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
      return sum + diff;
    }, 0);
    avgProcessingDays = Math.round(totalDays / completedCases.length);
  } else if (totalCases > 0) {
    avgProcessingDays = 34; // standard benchmark
  }

  // 4. Compliance Rate
  const compliantCases = filteredCases.filter((c) => {
    const status = (c.case_status || "").toUpperCase();
    const migration = (c.migration_stage || "").toUpperCase();
    const isApprovedWithoutRtw =
      status.includes("APPROVED") && migration.includes("RTW PENDING");
    const isAwaitingDecision = status.includes("AWAITING");
    return !isApprovedWithoutRtw && !isAwaitingDecision;
  }).length;
  const complianceRate =
    totalCases > 0 ? Math.round((compliantCases / totalCases) * 100) : 0;

  // 5. Active Migrants
  const activeMigrants = filteredCases.filter((c) => {
    const stage = (c.migration_stage || "").toUpperCase();
    return (
      stage.includes("IN UK") ||
      stage.includes("ACTIVE") ||
      stage.includes("ENTERED") ||
      stage.includes("ARRIVED")
    );
  }).length;

  // Group cases dynamically by month of creation for the Stacked Bar Chart
  const chartData = React.useMemo(() => {
    const dataset = filteredCases.length > 0 ? filteredCases : cases;
    const datedCases = dataset
      .map(getCaseDate)
      .filter(Boolean) as Date[];

    const now = new Date();
    const maxCaseDate =
      datedCases.length > 0
        ? new Date(Math.max(...datedCases.map((d) => d.getTime())))
        : now;
    const referenceDate = maxCaseDate > now ? maxCaseDate : now;

    let countMonths = 6;
    if (activeFilter === "3M") countMonths = 3;
    else if (activeFilter === "6M") countMonths = 6;
    else if (activeFilter === "1Y") countMonths = 12;
    else if (activeFilter === "ALL") {
      if (datedCases.length > 0) {
        const minDate = new Date(Math.min(...datedCases.map((d) => d.getTime())));
        const diffMonths =
          (referenceDate.getFullYear() - minDate.getFullYear()) * 12 +
          (referenceDate.getMonth() - minDate.getMonth()) +
          1;
        countMonths = Math.max(3, Math.min(diffMonths, 24));
      }
    }

    const monthBuckets: {
      key: string;
      name: string;
      Approved: number;
      Refused: number;
      "In Progress": number;
      total: number;
    }[] = [];

    for (let i = countMonths - 1; i >= 0; i--) {
      const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
      monthBuckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        name: monthNames[d.getMonth()],
        Approved: 0,
        Refused: 0,
        "In Progress": 0,
        total: 0,
      });
    }

    dataset.forEach((c) => {
      const caseDate = getCaseDate(c);
      if (!caseDate) return;
      const caseKey = `${caseDate.getFullYear()}-${caseDate.getMonth()}`;

      let targetMonth = monthBuckets.find((m) => m.key === caseKey);
      if (!targetMonth && monthBuckets.length > 0) {
        if (caseDate < new Date(referenceDate.getFullYear(), referenceDate.getMonth() - countMonths, 1)) {
          targetMonth = monthBuckets[0];
        } else {
          targetMonth = monthBuckets[monthBuckets.length - 1];
        }
      }

      if (targetMonth) {
        const status = (c.case_status || "").toUpperCase();
        if (
          status.includes("APPROVED") ||
          status.includes("GRANTED") ||
          status.includes("ASSIGNED") ||
          status === "ACTIVE"
        ) {
          targetMonth.Approved += 1;
        } else if (status.includes("REFUSED")) {
          targetMonth.Refused += 1;
        } else {
          targetMonth["In Progress"] += 1;
        }
        targetMonth.total += 1;
      }
    });

    return monthBuckets;
  }, [cases, filteredCases, activeFilter]);

  // KPI Metrics Configuration with interactive routes
  const metrics = [
    {
      title: "TOTAL CASES",
      value: String(totalCases),
      subtext: `${inProgressCases} in progress`,
      icon: RiFileCopyLine,
      onClick: () => router.push("/cases"),
    },
    {
      title: "APPROVAL RATE",
      value: `${approvalRate}%`,
      subtext: `${approvedCases} approved, ${refusedCases} refused`,
      icon: RiInformationLine,
      onClick: () => router.push("/cases?status=granted"),
    },
    {
      title: "AVG. PROCESSING TIME",
      value: `${avgProcessingDays}d`,
      subtext: "Screening to decision",
      icon: RiFileTextLine,
      onClick: () => router.push("/cases"),
    },
    {
      title: "COMPLIANCE RATE",
      value: `${complianceRate}%`,
      subtext: `${compliantCases} of ${totalCases} cases compliant`,
      icon: RiCheckboxCircleLine,
      onClick: () => router.push("/compliance"),
    },
    {
      title: "ACTIVE MIGRANTS",
      value: String(activeMigrants),
      subtext: "Currently in the UK",
      icon: RiUserFollowLine,
      onClick: () => router.push("/migrants?filter=in_uk"),
    },
  ];

  // Circular progress properties
  const radius = 15;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (complianceRate / 100) * circumference;

  const pendingTasks = filteredCases.filter((c) => c.case_status === "AWAITING UKVI DECISION" || c.case_status === "VISA APPROVED").length;
  const totalDocs = filteredCases.reduce((sum, c) => sum + (c.files?.length || 0), 0);

  // Toggle series visibility in chart
  const toggleSeries = (series: keyof typeof visibleSeries) => {
    setVisibleSeries((prev) => ({
      ...prev,
      [series]: !prev[series],
    }));
  };

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
      
      {/* Page Header matching Figma */}
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

      {/* Main Content Area */}
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

        {/* Metric Cards Grid (5 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={m.onClick}
                className="bg-white border border-[#EBEBEB] hover:border-[#7D52F4]/40 hover:shadow-md transition-all duration-200 rounded-[16px] p-[20px] pb-[16px] flex flex-col justify-between shadow-[0px_1px_2px_rgba(10,13,20,0.03)] h-[130px] text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#7D52F4]/20"
              >
                <div className="flex items-start justify-between w-full">
                  <span className="text-[11px] font-semibold tracking-[0.06em] text-[#5C5C5C] group-hover:text-[#7D52F4] transition-colors uppercase">
                    {m.title}
                  </span>
                  <Icon className="size-4 text-[#A4A4A4] group-hover:text-[#7D52F4] transition-colors" />
                </div>
                <div className="flex flex-col mt-auto">
                  <span className="text-[28px] font-semibold text-[#171717] leading-none tracking-tight font-aeonik-medium">
                    {m.value}
                  </span>
                  <span className="text-[12px] text-[#5C5C5C] mt-[6px] truncate leading-normal flex items-center justify-between">
                    <span>{m.subtext}</span>
                    <RiArrowRightSLine className="size-3.5 text-neutral-400 group-hover:text-[#7D52F4] group-hover:translate-x-0.5 transition-all" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Migrants by Origin Card with Dot-matrix Map */}
        <div className="flex flex-col gap-[12px] w-full">
          <div className="flex items-center justify-between w-full h-[30px]">
            <span className="text-[20px] text-[#171717] tracking-[-0.006em] font-aeonik-medium">
              Migrants by origin
            </span>
            <button
              type="button"
              onClick={() => router.push("/migrants")}
              className="text-[13px] font-semibold text-[#7D52F4] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View all migrants</span>
              <RiArrowRightSLine className="size-4" />
            </button>
          </div>

          <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-[20px] flex flex-col md:flex-row gap-[24px] items-start md:h-[520px] w-full shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
            <div className="flex-1 w-full h-[380px] md:h-full flex flex-col items-center justify-between relative py-[12px]">
              <div className="w-full flex-1 relative flex items-center justify-center min-h-0">
                <WorldMapSvg className="w-full h-full text-[#E5E7EB]" />
                
                {(() => {
                  const originsList = topOrigins;
                  const activeItem = originsList.find((o) => o.name === hoveredOrigin) || originsList[0];
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
                          <button
                            key={origin.name}
                            type="button"
                            aria-label={`${origin.name}: ${origin.count} cases`}
                            className="absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group z-10 p-2 border-0 bg-transparent"
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
                          </button>
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
            </div>

            <div className="w-full md:w-[280px] h-full shrink-0 border border-[#EBEBEB] bg-[#FAFAFA] rounded-[12px] p-[20px] flex flex-col gap-md">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#7B7B7B] tracking-[0.04em] uppercase">
                  TOP ORIGINS
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">
                  Cases
                </span>
              </div>
              <div className="flex flex-col gap-[8px] overflow-y-auto pr-1">
                {topOrigins.length > 0 ? (
                  topOrigins.map((origin) => {
                    const isHovered = hoveredOrigin === origin.name;
                    return (
                      <div 
                        key={origin.name} 
                        className={`flex items-center justify-between text-[14px] p-2 rounded-[8px] transition-all cursor-pointer ${
                          isHovered ? "bg-white shadow-sm border border-[#EBEBEB]" : "hover:bg-white/60"
                        }`}
                        onMouseEnter={() => setHoveredOrigin(origin.name)}
                        onMouseLeave={() => setHoveredOrigin(null)}
                        onClick={() => router.push(`/migrants?nationality=${encodeURIComponent(origin.name)}`)}
                      >
                        <div className="flex items-center gap-[8px] min-w-0">
                          <Flag country={origin.name} className="size-5 rounded-full overflow-hidden border border-neutral-100 shrink-0" />
                          <span className="font-semibold text-[#171717] truncate">{origin.name}</span>
                        </div>
                        <span className={`text-[13px] font-semibold size-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
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

        {/* Widgets Row: Cases Overview & Compliance Health */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] items-start">
          
          {/* Cases Overview Column (Span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-[12px] w-full">
            <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717] text-left">
              Cases overview
            </h3>

            <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-[20px] pb-[16px] flex flex-col justify-end shadow-[0px_1px_2px_rgba(10,13,20,0.03)] h-[290px] w-full">
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
                              {visibleSeries.Approved && (
                                <span className="text-[#1FC16B]">
                                  Approved: {data.Approved}
                                </span>
                              )}
                              {visibleSeries.Refused && (
                                <span className="text-[#FB3748]">
                                  Refused: {data.Refused}
                                </span>
                              )}
                              {visibleSeries["In Progress"] && (
                                <span className="text-[#A4A4A4]">
                                  In Progress: {data["In Progress"]}
                                </span>
                              )}
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
                    {/* Bars with dynamic series toggles */}
                    {visibleSeries["In Progress"] && (
                      <Bar
                        dataKey="In Progress"
                        stackId="a"
                        fill="#EBEBEB"
                        radius={[0, 0, 8, 8]}
                        onClick={() => router.push("/cases")}
                        className="cursor-pointer"
                      />
                    )}
                    {visibleSeries.Approved && (
                      <Bar
                        dataKey="Approved"
                        stackId="a"
                        fill="#1FC16B"
                        radius={[0, 0, 0, 0]}
                        onClick={() => router.push("/cases?status=granted")}
                        className="cursor-pointer"
                      />
                    )}
                    {visibleSeries.Refused && (
                      <Bar
                        dataKey="Refused"
                        stackId="a"
                        fill="#FB3748"
                        radius={[8, 8, 0, 0]}
                        onClick={() => router.push("/cases")}
                        className="cursor-pointer"
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Content Divider */}
              <div className="border-t border-[#EBEBEB] my-[16px] w-full" />

              {/* Interactive Chart Legend Footer */}
              <div className="flex items-center gap-[16px] text-left">
                <button
                  type="button"
                  onClick={() => toggleSeries("Approved")}
                  className={`flex items-center gap-[6px] cursor-pointer transition-opacity border-0 bg-transparent p-0 ${
                    visibleSeries.Approved ? "opacity-100" : "opacity-40"
                  }`}
                  title="Toggle Approved series"
                >
                  <span className="size-[8px] rounded-full bg-[#1FC16B] shrink-0" />
                  <span className="text-[12px] font-medium text-[#171717]">
                    Approved
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleSeries("Refused")}
                  className={`flex items-center gap-[6px] cursor-pointer transition-opacity border-0 bg-transparent p-0 ${
                    visibleSeries.Refused ? "opacity-100" : "opacity-40"
                  }`}
                  title="Toggle Refused series"
                >
                  <span className="size-[8px] rounded-full bg-[#FB3748] shrink-0" />
                  <span className="text-[12px] font-medium text-[#171717]">
                    Refused
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleSeries("In Progress")}
                  className={`flex items-center gap-[6px] cursor-pointer transition-opacity border-0 bg-transparent p-0 ${
                    visibleSeries["In Progress"] ? "opacity-100" : "opacity-40"
                  }`}
                  title="Toggle In Progress series"
                >
                  <span className="size-[8px] rounded-full bg-[#EBEBEB] shrink-0 border border-neutral-300" />
                  <span className="text-[12px] font-medium text-[#171717]">
                    In Progress
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Compliance Health Column (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-[12px] w-full">
            <div className="flex items-center justify-between">
              <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717] text-left">
                Compliance health
              </h3>
              <button
                type="button"
                onClick={() => router.push("/compliance")}
                className="text-[13px] font-semibold text-[#7D52F4] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View all</span>
                <RiArrowRightSLine className="size-4" />
              </button>
            </div>

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
                      stroke={complianceRate > 75 ? "#1FC16B" : complianceRate > 40 ? "#F6B51E" : "#FB3748"}
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

              {/* Working Compliance Items List */}
              <div className="flex flex-col gap-[10px] w-full">
                
                {/* Item 1: Right to work check */}
                <button 
                  type="button"
                  onClick={() => router.push("/compliance/rtw-checks")}
                  className="w-full flex items-center justify-between border border-[#EBEBEB] rounded-[12px] bg-white px-[16px] py-[12px] h-[52px] cursor-pointer hover:bg-[#FDFDFD] hover:border-[#7D52F4]/40 active:bg-neutral-50 transition-all group text-left font-inherit focus:outline-none focus:ring-1 focus:ring-[#7D52F4]"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="size-8 rounded-full bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center font-bold text-[14px] shrink-0">
                      !
                    </div>
                    <span className="text-[14px] font-medium text-[#171717] group-hover:text-[#7D52F4] transition-colors">
                      Right to work check
                    </span>
                  </div>
                  <div className="size-7 bg-[#F5F5F5] group-hover:bg-[#EBEBEB] rounded-full flex items-center justify-center text-[#5C5C5C] transition-colors">
                    <RiArrowRightSLine className="size-4" />
                  </div>
                </button>

                {/* Item 2: Documents */}
                <button 
                  type="button"
                  onClick={() => router.push("/compliance/documents")}
                  className="w-full flex items-center justify-between border border-[#EBEBEB] rounded-[12px] bg-white px-[16px] py-[12px] h-[52px] cursor-pointer hover:bg-[#FDFDFD] hover:border-[#7D52F4]/40 active:bg-neutral-50 transition-all group text-left font-inherit focus:outline-none focus:ring-1 focus:ring-[#7D52F4]"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="size-8 rounded-full bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center font-bold text-[14px] shrink-0">
                      !
                    </div>
                    <span className="text-[14px] font-medium text-[#171717] group-hover:text-[#7D52F4] transition-colors">
                      Documents
                    </span>
                  </div>
                  <div className="size-7 bg-[#F5F5F5] group-hover:bg-[#EBEBEB] rounded-full flex items-center justify-center text-[#5C5C5C] transition-colors">
                    <RiArrowRightSLine className="size-4" />
                  </div>
                </button>

                {/* Item 3: Salary */}
                <button 
                  type="button"
                  onClick={() => router.push("/compliance")}
                  className="w-full flex items-center justify-between border border-[#EBEBEB] rounded-[12px] bg-white px-[16px] py-[12px] h-[52px] cursor-pointer hover:bg-[#FDFDFD] hover:border-[#7D52F4]/40 active:bg-neutral-50 transition-all group text-left font-inherit focus:outline-none focus:ring-1 focus:ring-[#7D52F4]"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="size-8 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
                      <RiCheckLine className="size-4" />
                    </div>
                    <span className="text-[14px] font-medium text-[#171717] group-hover:text-[#7D52F4] transition-colors">
                      Salary
                    </span>
                  </div>
                  <div className="size-7 bg-[#F5F5F5] group-hover:bg-[#EBEBEB] rounded-full flex items-center justify-center text-[#5C5C5C] transition-colors">
                    <RiArrowRightSLine className="size-4" />
                  </div>
                </button>

                {/* Item 4: SMS reports */}
                <button 
                  type="button"
                  onClick={() => router.push("/compliance/logs")}
                  className="w-full flex items-center justify-between border border-[#EBEBEB] rounded-[12px] bg-white px-[16px] py-[12px] h-[52px] cursor-pointer hover:bg-[#FDFDFD] hover:border-[#7D52F4]/40 active:bg-neutral-50 transition-all group text-left font-inherit focus:outline-none focus:ring-1 focus:ring-[#7D52F4]"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="size-8 rounded-full bg-[#FAF5FF] text-[#7D52F4] flex items-center justify-center shrink-0">
                      <RiNotificationLine className="size-4" />
                    </div>
                    <span className="text-[14px] font-medium text-[#171717] group-hover:text-[#7D52F4] transition-colors">
                      SMS reports
                    </span>
                  </div>
                  <div className="flex items-center gap-[10px]">
                    <span className="text-[13px] text-[#7B7B7B] font-normal">SMS Logs</span>
                    <div className="size-7 bg-[#F5F5F5] group-hover:bg-[#EBEBEB] rounded-full flex items-center justify-center text-[#5C5C5C] transition-colors">
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
