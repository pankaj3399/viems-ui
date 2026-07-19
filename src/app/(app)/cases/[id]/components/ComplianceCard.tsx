"use client";

import * as React from "react";
import {
  RiArrowRightSLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiBellLine,
} from "@remixicon/react";

// -- Donut Chart (SVG) --
function DonutChart({ percentage }: { percentage: number }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0">
      <circle cx="24" cy="24" r={radius} fill="none" stroke="#EBEBEB" strokeWidth="5" />
      <circle
        cx="24" cy="24" r={radius} fill="none"
        stroke="#F59E0B" strokeWidth="5"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
    </svg>
  );
}

// -- Compliance Status Icon --
function ComplianceIcon({ type }: { type: string }) {
  if (type === "error") return (
    <div className="size-5 rounded-full bg-error-light flex items-center justify-center shrink-0">
      <RiAlertLine className="size-3 text-[#E54D2E]" />
    </div>
  );
  if (type === "success") return (
    <div className="size-5 rounded-full bg-success-light flex items-center justify-center shrink-0">
      <RiCheckboxCircleLine className="size-3 text-[#16A34A]" />
    </div>
  );
  return (
    <div className="size-5 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
      <RiBellLine className="size-3 text-[#A4A4A4]" />
    </div>
  );
}

interface ComplianceItem {
  icon: string;
  label: string;
  extra?: string;
}

interface ComplianceCardProps {
  percentage: number;
  tasks: number;
  docs: number;
  items: ComplianceItem[];
}

export function ComplianceCard({ percentage, tasks, docs, items }: ComplianceCardProps) {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between">
        <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">Compliance health</h2>
        <button
          type="button"
          className="text-label-sm text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors bg-transparent border-0 p-0"
        >
          View all
        </button>
      </div>

      {/* Donut + Percentage */}
      <div className="bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small">
        <div className="flex items-center gap-lg mb-xl">
          <DonutChart percentage={percentage} />
          <div className="flex flex-col">
            <span className="text-label-sm text-[#171717]">{percentage}% compliant</span>
            <span className="text-paragraph-compact text-[#7B7B7B]">{tasks} tasks • {docs} docs</span>
          </div>
        </div>

        {/* Compliance Items */}
        <div className="flex flex-col">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-lg py-lg border-t border-[#F5F5F5] first:border-t-0">
              <ComplianceIcon type={item.icon} />
              <span className="text-label-sm text-[#171717] flex-1">{item.label}</span>
              {item.extra && <span className="text-paragraph-compact text-[#A4A4A4]">{item.extra}</span>}
              <RiArrowRightSLine className="size-4 text-[#A4A4A4] shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
