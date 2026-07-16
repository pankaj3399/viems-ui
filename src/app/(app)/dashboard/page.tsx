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

export default function DashboardPage() {
  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cardsData = [
    {
      title: "Total Working Cases",
      value: "148",
      description: "+12.4% from last month",
      icon: Briefcase,
      color: "text-[#7D52F4]",
    },
    {
      title: "Active Migrants Profiles",
      value: "1,204",
      description: "64 active cases this week",
      icon: Users,
      color: "text-[#CAC0FF]",
    },
    {
      title: "Tasks Completed",
      value: "92%",
      description: "+4% increase in completion speed",
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      title: "Upcoming Appointments",
      value: "18",
      description: "Next appointment scheduled at 10 AM",
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
              Recent events across active agent assignments.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-lg border-t border-neutral-100 pt-lg">
            <div className="flex gap-md text-paragraph-xs">
              <span className="text-neutral-400 select-none font-semibold">10:45 AM</span>
              <span className="text-neutral-700 font-medium">
                <strong>Sophia Williams</strong> assigned case <span className="text-[#7D52F4] font-semibold underline">#89204</span>
              </span>
            </div>
            <div className="flex gap-md text-paragraph-xs">
              <span className="text-neutral-400 select-none font-semibold">09:12 AM</span>
              <span className="text-neutral-700 font-medium">
                Migrant profile <strong>Juan Gomez</strong> updated by Agent 04
              </span>
            </div>
            <div className="flex gap-md text-paragraph-xs">
              <span className="text-neutral-400 select-none font-semibold">Yesterday</span>
              <span className="text-neutral-700 font-medium">
                System backup completed automatically in TZ UTC
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
