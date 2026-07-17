"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Briefcase,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

export default function DashboardPage() {
  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [stats, setStats] = React.useState<any>(null);
  const [recentCases, setRecentCases] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    async function loadStatsAndCases() {
      try {
        setLoading(true);
        const [statsData, casesData] = await Promise.all([
          apiClient.get<any>(ENDPOINTS.statistics.dashboard, {
            params: { filter: "all" }
          }),
          apiClient.get<{ data: any[]; count: number }>(ENDPOINTS.cases.base, {
            params: { take: "3", sort_by: "creation_date.DESC" }
          })
        ]);
        if (active) {
          setStats(statsData);
          setRecentCases(casesData.data || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics/cases:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadStatsAndCases();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px] text-neutral-500 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 mb-2"></div>
        <p className="text-paragraph-sm font-medium">Loading dashboard stats...</p>
      </div>
    );
  }

  const cardsData = [
    {
      title: "Total Working Cases",
      value: stats?.migrants?.active?.toString() || "0",
      description: "Active visa cases in progress",
      icon: Briefcase,
      color: "text-[#7D52F4]",
    },
    {
      title: "Migrants In UK / Out UK",
      value: `${stats?.migrants?.in || 0} / ${stats?.migrants?.out || 0}`,
      description: "Based on travel history reports",
      icon: Users,
      color: "text-[#CAC0FF]",
    },
    {
      title: "Expiring Visa Alerts (<14d)",
      value: (stats?.leave?.expiring7Days + stats?.leave?.expiring14Days || 0).toString(),
      description: "Visas expiring within two weeks",
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      title: "Urgent/High Priority Tasks",
      value: stats?.tasksStats?.high?.toString() || "0",
      description: "Requires immediate attention",
      icon: CalendarDays,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="p-10 flex flex-col gap-xl font-sans animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-xs md:flex-row md:items-center md:justify-between border-b border-neutral-200 pb-xl">
        <div>
          <h1 className="text-h3-title font-extrabold text-neutral-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-paragraph-sm text-neutral-500 mt-xs">
            {currentDateStr}
          </p>
        </div>
        <div className="inline-flex items-center gap-xs px-3 py-1 bg-emerald-100 text-emerald-800 rounded-separator text-label-xs font-semibold">
          <TrendingUp className="size-3.5" />
          System Operational
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-xl">
        {cardsData.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="border border-neutral-200 bg-white shadow-x-small hover:shadow-card-large transition-all duration-300 rounded-card">
              <CardHeader className="flex flex-row items-center justify-between pb-sm space-y-0">
                <CardTitle className="text-label-sm font-semibold text-neutral-500">
                  {card.title}
                </CardTitle>
                <Icon className={`size-5 ${card.color} shrink-0`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-neutral-900 tracking-tight">
                  {card.value}
                </div>
                <p className="text-paragraph-xs text-neutral-400 mt-xs font-medium">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Workspace Body Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Left main block */}
        <Card className="lg:col-span-2 border border-neutral-200 bg-white shadow-x-small rounded-card">
          <CardHeader>
            <CardTitle className="text-label-lg font-bold text-neutral-900">
              Active Case Progression
            </CardTitle>
            <CardDescription className="text-paragraph-sm text-neutral-400">
              Overview of files and visa processing states across working departments.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-t border-neutral-100">
            <div className="flex flex-col items-center gap-xs text-center">
              <span className="text-paragraph-sm font-semibold text-neutral-700">
                Visual Analytics Loading...
              </span>
              <span className="text-paragraph-xs text-neutral-400 max-w-xs leading-normal">
                Department cases data pipeline is established. Phase 6 will fully integrate dynamic chart components.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Right side activity tracker */}
        <Card className="border border-neutral-200 bg-white shadow-x-small rounded-card">
          <CardHeader>
            <CardTitle className="text-label-lg font-bold text-neutral-900">
              Live System Activity
            </CardTitle>
            <CardDescription className="text-paragraph-sm text-neutral-400">
              Recent case additions in the system.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-lg border-t border-neutral-100 pt-lg">
            {recentCases.length === 0 ? (
              <p className="text-paragraph-xs text-neutral-400">No recent system activity.</p>
            ) : (
              recentCases.map((c, i) => {
                const dateStr = c.creation_date ? new Date(c.creation_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently";
                const name = [c.first_name, c.last_name].filter(Boolean).join(" ") || "Unknown Migrant";
                return (
                  <div key={i} className="flex gap-md text-paragraph-xs">
                    <span className="text-neutral-400 select-none font-semibold w-[80px] shrink-0">{dateStr}</span>
                    <span className="text-neutral-700 font-medium truncate">
                      Case <strong className="text-[#7D52F4] font-semibold underline">#{c.caseIdDisplay || c.caseNumber || c.id}</strong> added for <strong>{name}</strong>
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
