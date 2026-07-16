"use client";

import * as React from "react";

export default function AdminPage() {
  return (
    <div className="p-10 flex flex-col gap-xl font-sans animate-fade-in">
      <div className="border-b border-neutral-200 pb-xl">
        <h1 className="text-h3-title font-extrabold text-neutral-900 tracking-tight">
          Admin Portal
        </h1>
        <p className="text-paragraph-sm text-neutral-500 mt-xs">
          Manage system configurations, user permissions, and audit logs.
        </p>
      </div>
      <div className="bg-white border border-neutral-200 rounded-card p-xl shadow-x-small flex flex-col items-center justify-center min-h-[300px] text-center">
        <span className="text-paragraph-sm font-semibold text-neutral-700">Admin Control Center</span>
        <span className="text-paragraph-xs text-neutral-400 max-w-sm mt-xs leading-normal">
          Employees administration, case assignments logs, and archives will be integrated in Phase 8.
        </span>
      </div>
    </div>
  );
}
