"use client";

import * as React from "react";

export default function InsightsPage() {
  return (
    <div className="p-10 flex flex-col gap-xl font-sans animate-fade-in">
      <div className="border-b border-neutral-200 pb-xl">
        <h1 className="text-h3-title font-extrabold text-neutral-900 tracking-tight">
          System Insights
        </h1>
        <p className="text-paragraph-sm text-neutral-500 mt-xs">
          Analytics dashboard showing statistical indicators, charts, and predictions.
        </p>
      </div>
      <div className="bg-white border border-neutral-200 rounded-card p-xl shadow-x-small flex flex-col items-center justify-center min-h-[300px] text-center">
        <span className="text-paragraph-sm font-semibold text-neutral-700">Analytics Insights Pipeline</span>
        <span className="text-paragraph-xs text-neutral-400 max-w-sm mt-xs leading-normal">
          Interactive charts and metrics summary data will be integrated during Phase 6.
        </span>
      </div>
    </div>
  );
}
