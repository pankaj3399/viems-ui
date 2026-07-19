"use client";

import * as React from "react";
import {
  RiArrowRightSLine,
  RiClipboardLine,
  RiFileTextLine,
} from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/ui/flag";

// -- Helper: Key-Value Row --
function KVRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-sm">
      <span className="text-paragraph-compact text-[#5C5C5C]">{label}</span>
      {children ? children : (
        <span className="text-label-sm text-[#171717] text-right">{value}</span>
      )}
    </div>
  );
}

// -- Helper: Section Header --
function SectionHeader({ title, badge, action }: { title: string; badge?: React.ReactNode; action?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-sm">
        <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">{title}</h2>
        {badge}
      </div>
      {action && (
        <button
          type="button"
          className="text-label-sm text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors bg-transparent border-0 p-0"
        >
          {action}
        </button>
      )}
    </div>
  );
}

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
  return (
    <div className="flex flex-col gap-lg">
      <SectionHeader
        title="Migration status"
        badge={
          <span className="inline-flex items-center h-4 px-2 bg-[#EFEBFF] rounded-full text-subheading-2xs text-[#171717]">
            {location}
          </span>
        }
      />

      <div className="bg-white border border-[#F5F5F5] rounded-card p-xl flex flex-col gap-xs shadow-x-small">
        {/* Visa Status + Days Left */}
        <div className="flex items-center justify-between">
          <span className="text-label-sm text-[#171717]">Visa Status</span>
          <span className="text-label-sm text-[#171717]">{visa.daysLeft}d left</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[6px] bg-[#EBEBEB] rounded-full overflow-hidden mt-sm mb-xs">
          <div
            className="h-full bg-[#7D52F4] rounded-full"
            style={{ width: `${(visa.daysLeft / visa.totalDays) * 100}%` }}
          />
        </div>

        {/* Date labels */}
        <div className="flex items-center justify-between">
          <span className="text-paragraph-compact text-[#5C5C5C]">{visa.startDate}</span>
          <span className="text-paragraph-compact text-[#5C5C5C]">{visa.endDate}</span>
        </div>

        {/* Renewal Window */}
        <div className="flex items-center justify-between py-sm mt-xs">
          <span className="text-paragraph-compact text-[#5C5C5C]">Renewal Window</span>
          <span className="text-label-sm text-[#171717]">{visa.renewalWindow}</span>
        </div>
        {/* Visa Type */}
        <div className="flex items-center justify-between py-sm">
          <span className="text-paragraph-compact text-[#5C5C5C]">Visa Type</span>
          <span className="text-label-sm text-[#171717]">{visa.visaType}</span>
        </div>
      </div>
    </div>
  );
}

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
    socCode: string;
  };
}

export function PersonalDetailsCard({ personalInfo, passport, cos }: PersonalDetailsCardProps) {
  return (
    <div className="flex flex-col gap-lg">
      <SectionHeader title="Personal details" action="View all" />

      <div className="bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small flex flex-col">
        {/* PERSONAL INFORMATION */}
        <h4 className="text-subheading-2xs text-[#A4A4A4] mb-lg">Personal Information</h4>
        <KVRow label="Full Name" value={personalInfo.fullName} />
        <KVRow label="Gender" value={personalInfo.gender} />
        <KVRow label="Date of Birth" value={personalInfo.dob} />
        <KVRow label="Nationality">
          <div className="flex items-center gap-xs">
            <Flag country={personalInfo.nationality} />
            <span className="text-label-sm text-[#171717]">{personalInfo.nationality}</span>
          </div>
        </KVRow>
        <KVRow label="Employer" value={personalInfo.employer} />
        <KVRow label="Job Title" value={personalInfo.jobTitle} />
        <KVRow label="Address">
          <div className="flex flex-col items-end">
            {personalInfo.address.map((line: string, i: number) => (
              <span key={i} className="text-label-sm text-[#171717] leading-5">{line}</span>
            ))}
          </div>
        </KVRow>

        <div className="h-px bg-[#F5F5F5] my-xl" />

        {/* PASSPORT */}
        <h4 className="text-subheading-2xs text-[#A4A4A4] mb-lg">Passport</h4>
        <KVRow label="Passport Number" value={passport.number} />
        <KVRow label="Issue Date" value={passport.issueDate} />
        <KVRow label="Expiry Date" value={passport.expiryDate} />

        <div className="h-px bg-[#F5F5F5] my-xl" />

        {/* CERTIFICATE OF SPONSORSHIP */}
        <h4 className="text-subheading-2xs text-[#A4A4A4] mb-lg">Certificate of Sponsorship</h4>
        <KVRow label="Status">
          <Badge variant="success" withDot className="h-4 text-[11px] uppercase tracking-[0.02em] font-medium rounded-full px-2 gap-0 pl-[2px] pr-[8px]">
            {cos.status}
          </Badge>
        </KVRow>
        <KVRow label="CoS Reference" value={cos.reference} />
        <KVRow label="Salary" value={cos.salary} />
        <KVRow label="Start Date" value={cos.startDate} />
        <KVRow label="SOC Code" value={cos.socCode} />
      </div>
    </div>
  );
}

interface PriorityActionsCardProps {
  actions: Array<{ color: string; title: string; desc: string }>;
}

export function PriorityActionsCard({ actions }: PriorityActionsCardProps) {
  return (
    <div className="flex flex-col gap-lg">
      <SectionHeader title="Priority actions" action="View all" />

      {/* Stats Row */}
      <div className="flex gap-sm">
        <div className="flex-1 bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small">
          <div className="flex items-center justify-between mb-xs">
            <span className="text-subheading-2xs text-[#A4A4A4]">Open Tasks</span>
            <RiClipboardLine className="size-5 text-[#A4A4A4]" />
          </div>
          <span className="text-[24px] font-medium text-[#171717]">3</span>
        </div>
        <div className="flex-1 bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small">
          <div className="flex items-center justify-between mb-xs">
            <span className="text-subheading-2xs text-[#A4A4A4]">Missing Docs</span>
            <RiFileTextLine className="size-5 text-[#A4A4A4]" />
          </div>
          <span className="text-[24px] font-medium text-[#171717]">7</span>
        </div>
      </div>

      {/* Action Items */}
      <div className="flex flex-col gap-sm">
        {actions.map((action, i) => (
          <button
            key={i}
            className="bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small flex items-start gap-lg cursor-pointer hover:shadow-custom-medium transition-all text-left w-full"
          >
            <span className="size-2 rounded-full mt-[6px] shrink-0" style={{ backgroundColor: action.color }} />
            <div className="flex flex-col gap-xs flex-1 min-w-0">
              <span className="text-label-sm text-[#171717]">{action.title}</span>
              <span className="text-paragraph-compact text-[#7B7B7B] leading-5">{action.desc}</span>
            </div>
            <RiArrowRightSLine className="size-4 text-[#A4A4A4] shrink-0 mt-[2px]" />
          </button>
        ))}
      </div>
    </div>
  );
}

interface TimelineEvent {
  icon: string;
  title: string;
  by: string;
  time: string;
}

// -- Timeline Icon --
function TimelineIcon({ type }: { type: string }) {
  const iconClass = "size-5 text-[#171717]";
  return (
    <div className="size-8 rounded-full bg-[#F7F7F7] shadow-x-small flex items-center justify-center shrink-0">
      {type === "note" && (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
          <path d="M4 4H16V14H6L4 16V4Z" fill="currentColor" />
        </svg>
      )}
      {type === "task" && <RiClipboardLine className={iconClass} />}
      {type === "migration" && (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
          <path d="M5.5 6.25V4C5.5 3.80109 5.57902 3.61032 5.71967 3.46967C5.86032 3.32902 6.05109 3.25 6.25 3.25H11.0605L12.5605 4.75H16.75C16.9489 4.75 17.1397 4.82902 17.2803 4.96967C17.421 5.11032 17.5 5.30109 17.5 5.5V13C17.5 13.1989 17.421 13.3897 17.2803 13.5303C17.1397 13.671 16.9489 13.75 16.75 13.75H14.5V16C14.5 16.1989 14.421 16.3897 14.2803 16.5303C14.1397 16.671 13.9489 16.75 13.75 16.75H3.25C3.05109 16.75 2.86032 16.671 2.71967 16.5303C2.57902 16.3897 2.5 16.1989 2.5 16V7C2.5 6.80109 2.57902 6.61032 2.71967 6.46967C2.86032 6.32902 3.05109 6.25 3.25 6.25H5.5ZM5.5 7.75H4V15.25H13V13.75H5.5V7.75Z" fill="currentColor" />
        </svg>
      )}
    </div>
  );
}

interface TimelineCardProps {
  timeline: TimelineEvent[];
}

export function TimelineCard({ timeline }: TimelineCardProps) {
  return (
    <div className="flex flex-col gap-lg">
      <SectionHeader title="Timeline" action="View all" />
      <div className="bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small">
        <div className="flex flex-col gap-xl">
          {timeline.map((item, i) => (
            <div key={i} className="flex items-start gap-lg relative">
              {/* Connector line */}
              {i < timeline.length - 1 && (
                <div className="absolute left-4 top-9 w-px h-[calc(100%+8px)] bg-[#EBEBEB]" />
              )}
              <TimelineIcon type={item.icon} />
              <div className="flex flex-col gap-[2px] pt-[6px] min-w-0">
                <span className="text-label-sm text-[#171717] truncate">{item.title}</span>
                <div className="flex items-center gap-[6px]">
                  <span className="text-paragraph-compact text-[#7B7B7B]">{item.by}</span>
                  <span className="text-[8px] font-medium text-[#A4A4A4] uppercase">•</span>
                  <span className="text-subheading-2xs text-[#A4A4A4]">{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
