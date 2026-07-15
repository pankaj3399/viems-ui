"use client";

import * as React from "react";

export default function MigrantsPage() {
  return (
    <div className="p-10 flex flex-col gap-xl font-sans animate-fade-in">
      <div className="border-b border-neutral-200 pb-xl">
        <h1 className="text-h3-title font-extrabold text-neutral-900 tracking-tight">
          Migrants Workspace
        </h1>
        <p className="text-paragraph-sm text-neutral-500 mt-xs">
          Manage and search system migrant cases, files, and eligibility records.
        </p>
      </div>
      <div className="bg-white border border-neutral-200 rounded-card p-xl shadow-x-small flex flex-col items-center justify-center min-h-[300px] text-center">
        <span className="text-paragraph-sm font-semibold text-neutral-700">Migrant Directory Pipeline</span>
        <span className="text-paragraph-xs text-neutral-400 max-w-sm mt-xs leading-normal">
          Migrants database interface and records tables will be fully integrated during Phase 7.
        </span>
      </div>
    </div>
  );
}
