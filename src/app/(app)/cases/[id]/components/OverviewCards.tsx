"use client";

import * as React from "react";
import {
  RiArrowRightSLine,
  RiClipboardLine,
  RiFileTextLine,
  RiUploadLine,
  RiStickyNoteLine,
  RiListCheck,
} from "@remixicon/react";
import { Flag } from "@/components/ui/flag";

// -- Helper: Key-Value Row --
function KVRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-xs">
      <span className="text-[13px] font-normal text-[#5C5C5C] tracking-[-0.006em]">{label}</span>
      {children ? children : (
        <span className="text-[14px] font-medium text-[#171717] text-right tracking-[-0.006em]">{value || "—"}</span>
      )}
    </div>
  );
}

// -- Helper: Section Header --
function SectionHeader({ title, badge, action, onAction }: { title: string; badge?: React.ReactNode; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-xs">
        <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">{title}</h2>
        {badge}
      </div>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors bg-transparent border-0 p-0 tracking-[-0.006em]"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// ====== PROFILE CARD (Column 1 Top) ======
export function ProfileCard({ name, initials, employer, status }: any) {
  const normStatus = (status || "").toUpperCase();
  const isApproved = normStatus.includes("APPROVED") || normStatus.includes("ACTIVE");
  const isInactive = normStatus.includes("INACTIVE");
  const isRefused = normStatus.includes("REFUSED");

  const badgeBg = isApproved
    ? "bg-[#E3F7EC] text-[#0B4627]"
    : isInactive
    ? "bg-[#F3F4F6] text-[#374151]"
    : isRefused
    ? "bg-[#FDE8E8] text-[#9B1C1C]"
    : "bg-[#FFFAEB] text-[#624C18]";

  const dotBg = isApproved
    ? "bg-[#1FC16B]"
    : isInactive
    ? "bg-[#9CA3AF]"
    : isRefused
    ? "bg-[#FB3748]"
    : "bg-[#F6B51E]";

  return (
    <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[24px_16px_20px] flex flex-col items-center shadow-[0px_1px_2px_rgba(10,13,20,0.03)] text-center w-full shrink-0">
      <div className="size-[80px] rounded-full bg-[#EBEBEB] text-[#171717] flex items-center justify-center font-medium text-[34px] tracking-[-0.015em] mb-md font-sans overflow-hidden">
        {initials || "—"}
      </div>
      <h3 className="font-aeonik-medium text-[24px] leading-[32px] text-[#171717] mb-[2px]">{name || "Unknown Migrant"}</h3>
      <span className="text-[14px] font-medium text-[#171717] mb-md">{employer || "—"}</span>
      
      <span className={`inline-flex items-center gap-xs px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] mb-lg ${badgeBg}`}>
        <span className={`size-1.5 rounded-full ${dotBg}`} />
        {status || "DRAFT"}
      </span>

      <div className="flex items-center gap-sm">
        <button
          type="button"
          className="size-8 rounded-[8px] bg-[#F5F5F5] hover:bg-neutral-200 flex items-center justify-center text-[#5C5C5C] border-0 cursor-pointer transition-colors"
          title="Upload"
        >
          <RiUploadLine className="size-4" />
        </button>
        <button
          type="button"
          className="size-8 rounded-[8px] bg-[#F5F5F5] hover:bg-neutral-200 flex items-center justify-center text-[#5C5C5C] border-0 cursor-pointer transition-colors"
          title="Documents"
        >
          <RiFileTextLine className="size-4" />
        </button>
        <button
          type="button"
          className="size-8 rounded-[8px] bg-[#171717] hover:bg-[#333] flex items-center justify-center text-white border-0 cursor-pointer transition-colors"
          title="Add Note"
        >
          <RiStickyNoteLine className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ====== MIGRATION STATUS CARD (Column 1 Middle) ======
interface MigrationStatusCardProps {
  location: string;
  visa: {
    daysLeft: number;
    totalDays: number;
    startDate: string;
    endDate: string;
    renewalWindow: string;
    visaType: string;
  };
}

export function MigrationStatusCard({ location, visa }: MigrationStatusCardProps) {
  const daysLeft = visa?.daysLeft ?? 0;
  const totalDays = visa?.totalDays ?? 365;
  const progressWidth = totalDays > 0 ? Math.min(100, Math.max(0, (daysLeft / totalDays) * 100)) : 0;

  return (
    <div className="flex flex-col gap-xs w-full">
      <SectionHeader
        title="Migration status"
        badge={
          <span className="inline-flex items-center h-4 px-2 bg-[#EFEBFF] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717]">
            {location || "OUTSIDE UK"}
          </span>
        }
      />

      <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] flex flex-col gap-xs shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
        {/* Visa Status + Days Left */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-medium text-[#171717]">Visa Status</span>
          <span className="text-[14px] font-medium text-[#171717]">{daysLeft}d left</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[6px] bg-[#EBEBEB] rounded-full overflow-hidden mt-xs mb-xs">
          <div
            className="h-full bg-[#7D52F4] rounded-full transition-all"
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* Date labels */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#5C5C5C] font-normal">{visa?.startDate || "—"}</span>
          <span className="text-[13px] text-[#5C5C5C] font-normal">{visa?.endDate || "—"}</span>
        </div>

        {/* Renewal Window */}
        <div className="flex items-center justify-between py-xs mt-xs">
          <span className="text-[13px] text-[#5C5C5C] font-normal">Renewal Window</span>
          <span className="text-[14px] font-medium text-[#171717]">{visa?.renewalWindow || "—"}</span>
        </div>
        {/* Visa Type */}
        <div className="flex items-center justify-between py-xs">
          <span className="text-[13px] text-[#5C5C5C] font-normal">Visa Type</span>
          <span className="text-[14px] font-medium text-[#171717]">{visa?.visaType || "—"}</span>
        </div>
      </div>
    </div>
  );
}

// ====== PERSONAL DETAILS CARD (Column 2) ======
interface PersonalDetailsCardProps {
  personalInfo: {
    fullName: string;
    gender: string;
    dob: string;
    nationality: string;
    nationalityFlag: string;
    employer: string;
    jobTitle: string;
    address: string[];
  };
  passport: {
    number: string;
    issueDate: string;
    expiryDate: string;
  };
  cos: {
    status: string;
    reference: string;
    salary: string;
    startDate: string;
    socCode?: string;
  };
  onViewAll?: () => void;
}

export function PersonalDetailsCard({ personalInfo, passport, cos, onViewAll }: PersonalDetailsCardProps) {
  const cosStatus = cos?.status || "DRAFT";
  const isAssigned = cosStatus.toUpperCase() === "ASSIGNED";

  return (
    <div className="flex flex-col gap-xs w-full">
      <SectionHeader title="Personal details" action="View all" onAction={onViewAll} />

      <div className="bg-white border border-white rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] flex flex-col gap-[4px] w-full">
        {/* PERSONAL INFORMATION CARD */}
        <div className="bg-[#F7F7F7] border border-white rounded-[16px] p-[20px_20px_16px] flex flex-col gap-[2px]">
          <h4 className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.04em] mb-xs">PERSONAL INFORMATION</h4>
          <KVRow label="Full Name" value={personalInfo?.fullName} />
          <KVRow label="Gender" value={personalInfo?.gender} />
          <KVRow label="Date of Birth" value={personalInfo?.dob} />
          <KVRow label="Nationality">
            {personalInfo?.nationality ? (
              <div className="flex items-center gap-xs">
                <Flag country={personalInfo.nationality} className="size-4 shrink-0" />
                <span className="text-[14px] font-medium text-[#171717]">{personalInfo.nationality}</span>
              </div>
            ) : (
              <span className="text-[14px] font-medium text-[#171717]">—</span>
            )}
          </KVRow>
          <KVRow label="Employer" value={personalInfo?.employer} />
          <KVRow label="Job Title" value={personalInfo?.jobTitle} />
          <KVRow label="Address" value={personalInfo?.address?.length ? personalInfo.address.join(", ") : "—"} />
        </div>

        {/* PASSPORT CARD */}
        <div className="bg-[#F7F7F7] border border-white rounded-[16px] p-[20px_20px_16px] flex flex-col gap-[2px]">
          <h4 className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.04em] mb-xs">PASSPORT</h4>
          <KVRow label="Passport Number" value={passport?.number} />
          <KVRow label="Issue Date" value={passport?.issueDate} />
          <KVRow label="Expiry Date" value={passport?.expiryDate} />
        </div>

        {/* CERTIFICATE OF SPONSORSHIP CARD */}
        <div className="bg-[#F7F7F7] border border-white rounded-[16px] p-[20px_20px_16px] flex flex-col gap-[2px]">
          <h4 className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.04em] mb-xs">CERTIFICATE OF SPONSORSHIP</h4>
          <KVRow label="Status">
            <span className={`px-[8px] py-[2px] rounded-full text-[11px] font-medium tracking-[0.02em] uppercase ${
              isAssigned ? "bg-[#E3F7EC] text-[#0B4627]" : "bg-[#F3F4F6] text-[#374151]"
            }`}>
              {cosStatus}
            </span>
          </KVRow>
          <KVRow label="CoS Reference" value={cos?.reference} />
          <KVRow label="Salary" value={cos?.salary} />
          <KVRow label="Start Date" value={cos?.startDate} />
        </div>
      </div>
    </div>
  );
}

// ====== PRIORITY ACTIONS CARD (Column 3 Top) ======
interface PriorityActionsCardProps {
  actions?: Array<{ color: string; title: string; desc: string }>;
  openTasks?: number;
  missingDocs?: number;
  onViewAll?: () => void;
}

export function PriorityActionsCard({ actions = [], openTasks = 0, missingDocs = 0, onViewAll }: PriorityActionsCardProps) {
  return (
    <div className="flex flex-col gap-xs w-full">
      <SectionHeader title="Priority actions" action="View all" onAction={onViewAll} />

      {/* Stats Row */}
      <div className="flex gap-sm w-full">
        <div className="flex-1 bg-white border border-[#F5F5F5] rounded-[16px] p-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <div className="flex items-center justify-between mb-xs">
            <span className="text-[11px] font-medium text-[#A4A4A4] uppercase tracking-[0.04em]">OPEN TASKS</span>
            <RiClipboardLine className="size-5 text-[#A4A4A4]" />
          </div>
          <span className="text-[24px] font-medium text-[#171717] font-sans">{openTasks}</span>
        </div>
        <div className="flex-1 bg-white border border-[#F5F5F5] rounded-[16px] p-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <div className="flex items-center justify-between mb-xs">
            <span className="text-[11px] font-medium text-[#A4A4A4] uppercase tracking-[0.04em]">MISSING DOCS</span>
            <RiFileTextLine className="size-5 text-[#A4A4A4]" />
          </div>
          <span className="text-[24px] font-medium text-[#171717] font-sans">{missingDocs}</span>
        </div>
      </div>

      {/* Action Items */}
      <div className="flex flex-col gap-xs w-full">
        {actions.length === 0 ? (
          <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] text-center text-[13px] text-[#7B7B7B]">
            No critical priority actions pending.
          </div>
        ) : (
          actions.map((action, i) => (
            <button
              key={i}
              type="button"
              className="bg-white border border-[#F5F5F5] rounded-[16px] p-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-start gap-md cursor-pointer hover:shadow-custom-medium transition-all text-left w-full"
            >
              <span className="size-2 rounded-full mt-[6px] shrink-0" style={{ backgroundColor: action.color || "#FB3748" }} />
              <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                <span className="text-[14px] font-medium text-[#171717]">{action.title}</span>
                <span className="text-[13px] font-normal text-[#7B7B7B] leading-tight">{action.desc}</span>
              </div>
              <RiArrowRightSLine className="size-4 text-[#A4A4A4] shrink-0 mt-[2px]" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ====== TIMELINE CARD (Column 1 Bottom) ======
interface TimelineEvent {
  icon: string;
  title: string;
  by: string;
  time: string;
}

function TimelineIcon({ type }: { type: string }) {
  const iconClass = "size-4 text-[#171717]";
  return (
    <div className="size-8 rounded-full bg-[#F7F7F7] shadow-x-small flex items-center justify-center shrink-0">
      {type === "note" ? (
        <RiStickyNoteLine className={iconClass} />
      ) : type === "task" ? (
        <RiClipboardLine className={iconClass} />
      ) : (
        <RiListCheck className={iconClass} />
      )}
    </div>
  );
}

interface TimelineCardProps {
  timeline?: TimelineEvent[];
  onViewAll?: () => void;
}

export function TimelineCard({ timeline = [], onViewAll }: TimelineCardProps) {
  return (
    <div className="flex flex-col gap-xs w-full">
      <SectionHeader title="Timeline" action="View all" onAction={onViewAll} />
      <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
        {timeline.length === 0 ? (
          <p className="text-[13px] text-[#7B7B7B] text-center py-2 font-normal">
            No timeline events recorded yet.
          </p>
        ) : (
          <div className="flex flex-col gap-lg">
            {timeline.map((item, i) => (
              <div key={i} className="flex items-start gap-md relative">
                {/* Connector line */}
                {i < timeline.length - 1 && (
                  <div className="absolute left-4 top-8 w-px h-[calc(100%+12px)] bg-[#EBEBEB]" />
                )}
                <TimelineIcon type={item.icon} />
                <div className="flex flex-col gap-[2px] pt-[2px] min-w-0">
                  <span className="text-[14px] font-medium text-[#171717] truncate">{item.title}</span>
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[13px] text-[#7B7B7B] font-normal">{item.by}</span>
                    <span className="text-[8px] font-medium text-[#A4A4A4] uppercase">•</span>
                    <span className="text-[11px] font-medium text-[#A4A4A4] uppercase tracking-[0.02em]">{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
