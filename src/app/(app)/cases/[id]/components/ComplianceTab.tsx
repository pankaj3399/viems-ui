"use client";

import * as React from "react";
import {
  RiAlertLine,
  RiArrowRightSLine,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiTimer2Line,
  RiArrowUpDownLine,
  RiArrowDownSLine,
  RiCalendarLine,
} from "@remixicon/react";

// ─── Donut Chart Component (75% Compliant) ──────────────────────────────────
function ComplianceDonutChart({ percentage = 75 }: { percentage?: number }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative size-[67px] flex items-center justify-center shrink-0">
      <svg width="67" height="67" viewBox="0 0 67 67" className="rotate-[-90deg]">
        <circle
          cx="33.5"
          cy="33.5"
          r={radius}
          fill="none"
          stroke="#EBEBEB"
          strokeWidth="8"
        />
        <circle
          cx="33.5"
          cy="33.5"
          r={radius}
          fill="none"
          stroke="#F6B51E"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function ComplianceTab({ id }: { id?: string }) {
  const [priorityFilter, setPriorityFilter] = React.useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [docFilter, setDocFilter] = React.useState<"ALL" | "MISSING" | "EXPIRING">("ALL");

  return (
    <div className="w-full flex flex-col gap-8 font-sans select-none animate-fade-in text-left max-w-[1104px] mx-auto">
      
      {/* ─── Top Banner: Attention Needed ──────────────────────────────────── */}
      <div className="w-full bg-[#FFF5EB] border border-[#FDE8D3] rounded-[12px] px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 text-[13px] text-[#171717] font-medium">
          <RiAlertLine className="size-4 text-[#FB3748] shrink-0" />
          <span>Attention needed · 3 actions need attention · </span>
          <span className="text-[#FB3748] font-bold">1 high risk</span>
        </div>
        <button
          type="button"
          className="text-[13px] font-medium text-[#171717] underline hover:text-black flex items-center gap-1 cursor-pointer bg-transparent border-0"
        >
          Review actions <RiArrowRightSLine className="size-4" />
        </button>
      </div>

      {/* ─── Top Stats & Widgets Row (Matching Figma Auto-Layout Spec) ─────── */}
      <div className="flex items-stretch gap-3 w-full">
        
        {/* Widget 1: COMPLIANCE HEALTH (Donut Chart) */}
        <div className="bg-white border border-[#F5F5F5] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[16px] p-3 flex flex-col justify-between items-center w-[189px] h-[204px] shrink-0">
          <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] text-center leading-[12px]">
            COMPLIANCE HEALTH
          </span>

          <div className="flex flex-col items-center gap-1 my-auto">
            <ComplianceDonutChart percentage={75} />
            <span className="font-aeonik-medium text-[24px] font-medium text-[#171717] leading-[32px] mt-1">
              75%
            </span>
            <span className="text-[13px] text-[#7B7B7B] font-normal leading-[20px]">
              3 tasks • 4 docs
            </span>
          </div>
        </div>

        {/* 2x2 Grid for Top Stat Cards */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          
          {/* Card 2: DOCUMENTS */}
          <div className="bg-[#EFEBFF] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[98px] relative">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
                DOCUMENTS
              </span>
              <span className="font-aeonik-medium text-[24px] font-medium text-[#351A75] leading-[32px]">
                8/12
              </span>
            </div>
            <span className="text-[13px] text-[#7B7B7B] font-normal">4 missing</span>
            <RiFileTextLine className="size-5 text-[#5C5C5C] absolute top-3 right-4" />
          </div>

          {/* Card 3: TASKS COMPLETED */}
          <div className="bg-[#E3F7EC] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[98px] relative">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
                TASKS COMPLETED
              </span>
              <span className="font-aeonik-medium text-[24px] font-medium text-[#171717] leading-[32px]">
                12/15
              </span>
            </div>
            <span className="text-[13px] text-[#7B7B7B] font-normal">3 remaining</span>
            <RiCheckboxCircleLine className="size-5 text-[#5C5C5C] absolute top-3 right-4" />
          </div>

          {/* Card 4: OPEN ACTIONS */}
          <div className="bg-[#FFFAEB] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[98px] relative">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
                OPEN ACTIONS
              </span>
              <span className="font-aeonik-medium text-[24px] font-medium text-[#624C18] leading-[32px]">
                2
              </span>
            </div>
            <span className="text-[13px] text-[#7B7B7B] font-normal">Immediate action</span>
            <RiAlertLine className="size-5 text-[#681219] absolute top-3 right-4" />
          </div>

          {/* Card 5: RISKS */}
          <div className="bg-[#FFEBEC] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[98px] relative">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
                RISKS
              </span>
              <span className="font-aeonik-medium text-[24px] font-medium text-[#681219] leading-[32px]">
                3
              </span>
            </div>
            <span className="text-[13px] text-[#7B7B7B] font-normal">1 critical</span>
            <RiTimer2Line className="size-5 text-[#5C5C5C] absolute top-3 right-4" />
          </div>

        </div>

        {/* Widget 6: EVISA REMAINING (Progress Bar Widget) */}
        <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[12px_20px] flex flex-col justify-between w-[449px] h-[204px] shrink-0 shadow-2xs">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
              EVISA REMAINING
            </span>
            <span className="font-aeonik-medium text-[24px] font-medium text-[#171717] leading-[32px]">
              325d left
            </span>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden mt-1">
              <div className="h-full w-[80%] bg-[#7D52F4] rounded-full" />
            </div>

            <div className="flex items-center justify-between text-[13px] text-[#5C5C5C] mt-1">
              <span>15 Mar 2026</span>
              <span>31 Mar 2027</span>
            </div>
          </div>

          {/* Footer Details */}
          <div className="flex flex-col gap-1 pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#5C5C5C]">Renewal Window</span>
              <span className="font-medium text-[#171717]">Starts Jan 2027</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#5C5C5C]">Visa Type</span>
              <span className="font-medium text-[#171717]">Creative Worker</span>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Middle Section: Priority Tasks & Risk Profile ──────────────────── */}
      <div className="flex items-start gap-6 w-full">
        
        {/* Left Column: Priority Tasks */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          
          <div className="flex items-center justify-between">
            <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717]">
              Priority tasks
            </h3>
            <button type="button" className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer bg-transparent border-0">
              Go to Tasks
            </button>
          </div>

          {/* Filter Pills Bar */}
          <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-4 flex flex-col gap-3 shadow-2xs">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-[#F5F5F5] p-1 rounded-full text-[11px] font-medium uppercase tracking-[0.02em]">
                <button
                  type="button"
                  onClick={() => setPriorityFilter("ALL")}
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                    priorityFilter === "ALL" ? "bg-white text-[#171717] shadow-2xs" : "text-[#5C5C5C]"
                  }`}
                >
                  ALL (3)
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter("HIGH")}
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1.5 ${
                    priorityFilter === "HIGH" ? "bg-white text-[#171717] shadow-2xs" : "text-[#5C5C5C]"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-[#FB3748]" />
                  HIGH (1)
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter("MEDIUM")}
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1.5 ${
                    priorityFilter === "MEDIUM" ? "bg-white text-[#171717] shadow-2xs" : "text-[#5C5C5C]"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-[#F6B51E]" />
                  MEDIUM (1)
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter("LOW")}
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors flex items-center gap-1.5 ${
                    priorityFilter === "LOW" ? "bg-white text-[#171717] shadow-2xs" : "text-[#5C5C5C]"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-[#7B7B7B]" />
                  LOW (1)
                </button>
              </div>

              <div className="flex items-center gap-1 text-[12px] text-[#A4A4A4]">
                <span>ACTION</span>
                <span className="ml-4">DUE</span>
                <RiArrowUpDownLine className="size-3.5 text-[#A4A4A4]" />
              </div>
            </div>

            {/* Task Rows */}
            <div className="flex flex-col gap-2">
              
              {/* Row 1 */}
              <div className="p-3 bg-white border border-[#EBEBEB] rounded-[12px] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-6 rounded-[8px] bg-[#FFEBEC] text-[#681219] flex items-center justify-center font-bold text-[12px] shrink-0">
                    !
                  </div>
                  <span className="text-[14px] font-medium text-[#171717]">
                    Complete right-to-work check
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[14px] font-medium text-[#FB3748]">
                    <RiCalendarLine className="size-4 text-[#FB3748]" />
                    <span>Overdue by 2 days</span>
                  </div>
                  <span className="text-[13px] text-[#5C5C5C]">Due 16 July 2026</span>
                  <button type="button" className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] border-0 cursor-pointer">
                    <RiArrowRightSLine className="size-4" />
                  </button>
                </div>
              </div>

              {/* Row 2 */}
              <div className="p-3 bg-white border border-[#EBEBEB] rounded-[12px] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-6 rounded-[8px] bg-[#FFFAEB] text-[#624C18] flex items-center justify-center font-bold text-[12px] shrink-0">
                    !
                  </div>
                  <span className="text-[14px] font-medium text-[#171717]">
                    Review address discrepancy
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[14px] font-medium text-[#E6A819]">
                    <RiCalendarLine className="size-4 text-[#E6A819]" />
                    <span>Due in 5 days</span>
                  </div>
                  <span className="text-[13px] text-[#5C5C5C]">Due 16 July 2026</span>
                  <button type="button" className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] border-0 cursor-pointer">
                    <RiArrowRightSLine className="size-4" />
                  </button>
                </div>
              </div>

              {/* Row 3 */}
              <div className="p-3 bg-white border border-[#EBEBEB] rounded-[12px] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-6 rounded-[8px] bg-[#FFFAEB] text-[#624C18] flex items-center justify-center font-bold text-[12px] shrink-0">
                    !
                  </div>
                  <span className="text-[14px] font-medium text-[#171717]">
                    Verify salary against CoS details
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[14px] font-medium text-[#E6A819]">
                    <RiCalendarLine className="size-4 text-[#E6A819]" />
                    <span>Due in 7 days</span>
                  </div>
                  <span className="text-[13px] text-[#5C5C5C]">Due 16 July 2026</span>
                  <button type="button" className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] border-0 cursor-pointer">
                    <RiArrowRightSLine className="size-4" />
                  </button>
                </div>
              </div>

              {/* Row 4 */}
              <div className="p-3 bg-white border border-[#EBEBEB] rounded-[12px] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-6 rounded-[8px] bg-[#F5F5F5] text-[#5C5C5C] flex items-center justify-center font-bold text-[12px] shrink-0">
                    !
                  </div>
                  <span className="text-[14px] font-medium text-[#171717]">
                    Request updated passport copy
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[14px] font-medium text-[#5C5C5C]">
                    <RiCalendarLine className="size-4 text-[#5C5C5C]" />
                    <span>Due in 14 days</span>
                  </div>
                  <span className="text-[13px] text-[#5C5C5C]">Due 16 July 2026</span>
                  <button type="button" className="size-6 rounded-full bg-[#F7F7F7] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] border-0 cursor-pointer">
                    <RiArrowRightSLine className="size-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Right Column: Risk Profile */}
        <div className="w-[350px] shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717]">
              Risk profile
            </h3>
          </div>

          <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-4 flex flex-col gap-4 shadow-2xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-[#171717]">Overall exposure</span>
                <span className="text-[12px] text-[#7B7B7B]">1 high • 2 medium</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#FFEBEC] text-[#FB3748] text-[10px] font-bold uppercase tracking-wider">
                ▲ HIGH
              </span>
            </div>

            {/* Risk Items */}
            <div className="flex flex-col gap-3 text-[13px]">
              
              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="font-medium text-[#171717]">Immigration status</span>
                  <span className="text-[11px] text-[#7B7B7B]">1 unresolved issue</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                    <div className="w-[75%] h-full bg-[#FB3748] rounded-full" />
                  </div>
                  <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="font-medium text-[#171717]">Documents</span>
                  <span className="text-[11px] text-[#7B7B7B]">2 need review</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                    <div className="w-[50%] h-full bg-[#F6B51E] rounded-full" />
                  </div>
                  <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="font-medium text-[#171717]">Employment conditions</span>
                  <span className="text-[11px] text-[#7B7B7B]">Documents</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                    <div className="w-[100%] h-full bg-[#10B981] rounded-full" />
                  </div>
                  <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="font-medium text-[#171717]">Reporting duties</span>
                  <span className="text-[11px] text-[#7B7B7B]">Documents</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
                    <div className="w-[100%] h-full bg-[#10B981] rounded-full" />
                  </div>
                  <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
                </div>
              </div>

            </div>

            <div className="pt-2 border-t border-neutral-100 text-[11px] text-[#A4A4A4]">
              Last assessed 20 Jul 2026, 09:42
            </div>

          </div>
        </div>

      </div>

      {/* ─── Compliance Breakdown Section ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 w-full">
        <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717]">
          Compliance breakdown
        </h3>

        <div className="bg-white border border-[#F5F5F5] rounded-[16px] divide-y divide-neutral-100 overflow-hidden shadow-2xs">
          
          {/* Header Row */}
          <div className="bg-[#F7F7F7] px-4 py-2.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.04em] text-[#A4A4A4]">
            <span className="w-1/3">CHECK</span>
            <div className="w-1/3 flex items-center gap-1">
              <span>STATUS</span>
              <RiArrowUpDownLine className="size-3" />
            </div>
            <div className="w-1/3 flex items-center justify-end gap-1">
              <span>DUE</span>
              <RiArrowUpDownLine className="size-3" />
            </div>
          </div>

          {/* Table Rows */}
          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Right to work</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#FFEBEC] text-[#FB3748] text-[10px] font-bold uppercase tracking-wider">
                AT RISK
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>22 May 2026</span>
              <RiArrowDownSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Contact details</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#FFFAEB] text-[#B45309] text-[10px] font-bold uppercase tracking-wider">
                NEEDS REVIEW
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>22 May 2026</span>
              <RiArrowDownSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Salary &amp; role</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#E3F7EC] text-[#0B4627] text-[10px] font-bold uppercase tracking-wider">
                COMPLIANT
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>22 May 2026</span>
              <RiArrowDownSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Absence monitoring</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#E3F7EC] text-[#0B4627] text-[10px] font-bold uppercase tracking-wider">
                COMPLIANT
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>22 May 2026</span>
              <RiArrowDownSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>

        </div>
      </div>

      {/* ─── Required Documents Section ────────────────────────────────────── */}
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center justify-between">
          <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717]">
            Required documents
          </h3>
          <button type="button" className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer bg-transparent border-0">
            Go to Documents
          </button>
        </div>

        <div className="bg-white border border-[#F5F5F5] rounded-[16px] divide-y divide-neutral-100 overflow-hidden shadow-2xs">
          
          {/* Header Row */}
          <div className="bg-[#F7F7F7] px-4 py-2.5 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.04em] text-[#A4A4A4]">
            <span className="w-1/3">DOCUMENT</span>
            <div className="w-1/3 flex items-center gap-1">
              <span>STATUS</span>
              <RiArrowUpDownLine className="size-3" />
            </div>
            <div className="w-1/3 flex items-center justify-end gap-1">
              <span>EXPIRY</span>
              <RiArrowUpDownLine className="size-3" />
            </div>
          </div>

          {/* Document Rows */}
          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Right to work share code</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#FFEBEC] text-[#FB3748] text-[10px] font-bold uppercase tracking-wider">
                MISSING
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>—</span>
              <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Proof of address</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#FFFAEB] text-[#B45309] text-[10px] font-bold uppercase tracking-wider">
                NEEDS REVIEW
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>—</span>
              <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>

          <div className="px-4 py-3.5 flex items-center justify-between text-[14px]">
            <span className="w-1/3 font-medium text-[#171717]">Passport</span>
            <div className="w-1/3">
              <span className="px-2 py-0.5 rounded-full bg-[#E3F7EC] text-[#0B4627] text-[10px] font-bold uppercase tracking-wider">
                VERIFIED
              </span>
            </div>
            <div className="w-1/3 flex items-center justify-end gap-2 text-[13px] text-[#5C5C5C]">
              <span>4 Feb 2027</span>
              <RiArrowRightSLine className="size-4 text-[#A4A4A4]" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
