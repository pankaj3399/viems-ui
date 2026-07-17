"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  User,
  Briefcase,
  FileText,
  ListChecks,
  StickyNote,
  MoreVertical,
  Upload,
  ClipboardList,
  Bell,
  CheckCircle2,
  AlertCircle,
  Pencil,
  GitBranch,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

// -- CasesIcon (same as sidebar) --
const CasesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M5.5 6.25V4C5.5 3.80109 5.57902 3.61032 5.71967 3.46967C5.86032 3.32902 6.05109 3.25 6.25 3.25H11.0605L12.5605 4.75H16.75C16.9489 4.75 17.1397 4.82902 17.2803 4.96967C17.421 5.11032 17.5 5.30109 17.5 5.5V13C17.5 13.1989 17.421 13.3897 17.2803 13.5303C17.1397 13.671 16.9489 13.75 16.75 13.75H14.5V16C14.5 16.1989 14.421 16.3897 14.2803 16.5303C14.1397 16.671 13.9489 16.75 13.75 16.75H3.25C3.05109 16.75 2.86032 16.671 2.71967 16.5303C2.57902 16.3897 2.5 16.1989 2.5 16V7C2.5 6.80109 2.57902 6.61032 2.71967 6.46967C2.86032 6.32902 3.05109 6.25 3.25 6.25H5.5ZM5.5 7.75H4V15.25H13V13.75H5.5V7.75Z" fill="currentColor"/>
  </svg>
);

function mapBackendCaseToDetail(c: any) {
  const name = [c.migrant?.firstName, c.migrant?.lastName].filter(Boolean).join(" ") || c.migrant?.stageName || "Unknown Migrant";
  
  // Nationality mapping
  const country = (c.migrant?.nationality?.value || "US").toUpperCase();
  const flagMap: Record<string, string> = {
    US: "🇺🇸",
    CN: "🇨🇳",
    IN: "🇮🇳",
    FR: "🇫🇷",
    SA: "🇿🇦",
    ZA: "🇿🇦",
    GB: "🇬🇧",
    NP: "🇳🇵",
  };
  const nationalityFlag = flagMap[country] || "🇺🇸";

  // Visa Status
  let visaStatus = "VISA INACTIVE";
  const visaEndDate = c.decision?.granted?.visaEndDate;
  if (visaEndDate) {
    const end = new Date(visaEndDate);
    if (end > new Date()) {
      visaStatus = "VISA ACTIVE";
    }
  }

  // Location
  let location = "OUTSIDE UK";
  if (c.flightEntered?.isEntered) {
    location = "IN UK";
  }

  // Case status / Approval Status
  let approvalStatus = "PENDING";
  if (c.decision?.id === "Granted") {
    approvalStatus = "VISA APPROVED";
  } else if (c.decision?.id === "Refused") {
    approvalStatus = "VISA REFUSED";
  }

  // Calculate days left
  let daysLeft = 0;
  let totalDays = 365;
  if (c.decision?.granted?.visaStartDate && c.decision?.granted?.visaEndDate) {
    const start = new Date(c.decision.granted.visaStartDate);
    const end = new Date(c.decision.granted.visaEndDate);
    totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    daysLeft = Math.max(0, Math.ceil((end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  }

  return {
    id: c.id.toString(),
    name,
    employer: c.personal?.groupName || "Unknown Employer",
    caseId: c.caseIdNumber && c.relatedYear ? `#${c.caseIdNumber}/${c.relatedYear}` : c.caseNumber || `#${c.id}`,
    cosRef: c.cosStatus?.assigned?.cosNumber || "N/A",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    visaStatus,
    location,
    approvalStatus,
    personalInfo: {
      fullName: name,
      gender: c.migrant?.gender || "Male",
      dob: c.migrant?.dateOfBirth || "N/A",
      nationality: country,
      nationalityFlag,
      employer: c.personal?.groupName || "N/A",
      jobTitle: c.personal?.jobTitle || "N/A",
      address: c.migrant?.contacts?.address_line_1 
        ? [c.migrant.contacts.address_line_1, c.migrant.contacts.city, c.migrant.contacts.zip_code].filter(Boolean)
        : ["No address provided"],
    },
    passport: {
      number: c.migrant?.passportNumber || "N/A",
      issueDate: c.migrant?.issuePassportDate || "N/A",
      expiryDate: c.migrant?.expiredPassportDate || "N/A",
    },
    cos: {
      status: c.cosStatus?.id || "N/A",
      reference: c.cosStatus?.assigned?.cosNumber || "N/A",
      salary: c.personal?.jobPay || "N/A",
      startDate: c.cosStatus?.assigned?.assignedDate || "N/A",
      socCode: "N/A",
    },
    visa: {
      daysLeft,
      totalDays,
      startDate: c.decision?.granted?.visaStartDate || "N/A",
      endDate: c.decision?.granted?.visaEndDate || "N/A",
      renewalWindow: "Starts " + (c.decision?.granted?.visaEndDate ? new Date(new Date(c.decision.granted.visaEndDate).setMonth(new Date(c.decision.granted.visaEndDate).getMonth() - 2)).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A"),
      visaType: "Creative Worker",
    },
    timeline: [
      { icon: "task", title: "Case created in the system", by: "System", time: c.creation_date || "N/A" }
    ],
    priorityActions: c.decision?.id === "Refused" ? [
      { color: "#E54D2E", title: "Visa refused", desc: "The visa application was refused by UKVI." }
    ] : [
      { color: "#3B82F6", title: "Case created", desc: "No critical actions pending." }
    ],
    compliance: {
      percentage: c.decision?.id === "Granted" ? 100 : 50,
      notes: 0,
      tasks: 0,
      docs: c.documents?.length || 0,
      items: [
        { icon: c.decision?.id === "Granted" ? "success" : "error", label: "Visa outcome" },
        { icon: "success", label: "Salary" },
      ],
    },
  };
}

const tabs = [
  { label: "Overview", icon: LayoutGrid },
  { label: "Migrant Details", icon: User },
  { label: "Employment Details", icon: Briefcase },
  { label: "Documents", icon: FileText },
  { label: "Tasks", icon: ListChecks },
  { label: "Timeline", icon: GitBranch },
  { label: "Notes", icon: StickyNote },
];

// -- Helper: Key-Value Row --
function KVRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-sm">
      <span className="text-[13px] text-[#5C5C5C] tracking-[-0.006em]">{label}</span>
      {children ? children : (
        <span className="text-[14px] font-medium text-[#171717] text-right tracking-[-0.006em]">{value}</span>
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
        <Button
          variant="link"
          className="text-[14px] font-medium text-[#5C5C5C] tracking-[-0.006em] hover:text-[#171717] p-0 h-auto cursor-pointer"
        >
          {action}
        </Button>
      )}
    </div>
  );
}

// -- Timeline Icon --
function TimelineIcon({ type }: { type: string }) {
  const iconClass = "size-5 text-[#171717]";
  return (
    <div className="size-8 rounded-full bg-[#F7F7F7] shadow-x-small flex items-center justify-center shrink-0">
      {type === "note" && <StickyNote className={iconClass} />}
      {type === "task" && <ClipboardList className={iconClass} />}
      {type === "migration" && <CasesIcon className={iconClass} />}
    </div>
  );
}

// -- Compliance Status Icon --
function ComplianceIcon({ type }: { type: string }) {
  if (type === "error") return (
    <div className="size-5 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
      <AlertCircle className="size-3 text-[#E54D2E]" />
    </div>
  );
  if (type === "success") return (
    <div className="size-5 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
      <CheckCircle2 className="size-3 text-[#16A34A]" />
    </div>
  );
  return (
    <div className="size-5 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
      <Bell className="size-3 text-[#A4A4A4]" />
    </div>
  );
}

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

export default function MigrantOverviewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = React.useState("Overview");

  const [migrant, setMigrant] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    let active = true;
    async function loadCaseDetail() {
      try {
        setLoading(true);
        const response = await apiClient.get<any>(ENDPOINTS.cases.byId(id));
        if (active) {
          const detail = mapBackendCaseToDetail(response);
          setMigrant(detail);
        }
      } catch (err) {
        console.error("Failed to fetch case detail:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadCaseDetail();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px] text-neutral-500 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 mb-2"></div>
        <p className="text-paragraph-sm font-medium">Loading migrant profile...</p>
      </div>
    );
  }

  if (!migrant) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px] text-neutral-500 font-sans">
        <p className="text-paragraph-sm font-medium">Migrant profile not found.</p>
      </div>
    );
  }

  const visaProgress = ((migrant.visa.totalDays - migrant.visa.daysLeft) / migrant.visa.totalDays) * 100;

  return (
    <div className="w-full flex flex-col font-sans text-[#171717] select-none bg-[#F5F5F5] min-h-full">
      {/* ====== WHITE HEADER ====== */}
      <div className="bg-white rounded-t-card flex flex-col shrink-0">
        {/* Top Bar: Back + Name + Badges + Actions */}
        <div className="px-[64px] pt-[32px] pb-2xl flex items-center justify-between">
          {/* Left: Back + Avatar + Info */}
          <div className="flex items-center gap-xl flex-1 min-w-0">
            {/* Back Button */}
            <button
              onClick={() => router.push("/cases")}
              className="size-8 bg-[#F7F7F7] rounded-input shadow-x-small flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors border-0 shrink-0"
            >
              <ChevronLeft className="size-4 text-[#5C5C5C]" />
            </button>

            {/* Avatar */}
            <img
              src={migrant.avatar}
              alt={migrant.name}
              className="size-14 rounded-full object-cover shrink-0"
            />

            {/* Name + Badges + Subtitle */}
            <div className="flex flex-col gap-xs flex-1 min-w-0">
              {/* Name Row */}
              <div className="flex items-center gap-[9px]">
                <h1 className="text-title-aeonik text-[#171717]">{migrant.name}</h1>
                <Badge variant="success" withDot className="h-4 text-[11px] uppercase tracking-[0.02em] font-medium rounded-full px-2 gap-0 pl-[2px] pr-[8px]">
                  {migrant.visaStatus}
                </Badge>
                <span className="inline-flex items-center h-4 px-2 bg-[#EFEBFF] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717]">
                  {migrant.location}
                </span>
              </div>
              {/* Subtitle Row */}
              <div className="flex items-center gap-sm text-[#5C5C5C]">
                <span className="font-mono text-[12px] leading-5 tracking-[-0.006em]">{migrant.caseId}</span>
                <span className="text-[#D1D1D1] text-[16px] leading-5">·</span>
                <span className="text-[13px] leading-5 tracking-[-0.006em]">{migrant.cosRef}</span>
              </div>
            </div>
          </div>

          {/* Right: Status + Edit + More */}
          <div className="flex items-center gap-lg shrink-0">
            {/* Status Pill */}
            <div className="flex items-center h-6 border border-[#EBEBEB] rounded-full overflow-hidden bg-white">
              <div className="px-lg h-full flex items-center border-r border-[#EBEBEB]">
                <span className="text-[12px] font-medium text-[#A4A4A4]">Status</span>
              </div>
              <div className="px-[10px] h-full flex items-center gap-[2px]">
                <span className="size-1.5 rounded-full bg-[#1FC16B]" />
                <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#0B4627] ml-1">{migrant.approvalStatus}</span>
                <ChevronDown className="size-4 text-[#A4A4A4] ml-0.5" />
              </div>
            </div>

            {/* Edit Button */}
            <Button
              variant="secondary"
              size="sm"
              className="h-9 px-sm bg-[#F5F5F5] rounded-[8px] flex items-center gap-xs cursor-pointer hover:bg-neutral-200 transition-colors border-0"
            >
              <Pencil className="size-5 text-[#5C5C5C]" />
              <span className="text-[14px] font-medium text-[#5C5C5C] tracking-[-0.006em] px-xs">Edit</span>
            </Button>

            {/* More Button */}
            <Button
              variant="secondary"
              size="icon-sm"
              className="size-9 bg-[#F5F5F5] rounded-input flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors border-0"
            >
              <MoreVertical className="size-5 text-[#5C5C5C]" />
            </Button>
          </div>
        </div>

        {/* ====== TAB MENU ====== */}
        <div className="px-[64px] flex items-center gap-2xl h-[50px] border-b border-[#EBEBEB]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.label;
            return (
              <Button
                key={tab.label}
                variant="ghost"
                onClick={() => setActiveTab(tab.label)}
                className={`h-full flex items-center gap-[6px] border-b-2 text-[14px] font-medium tracking-[-0.006em] transition-all cursor-pointer rounded-none bg-transparent border-t-0 border-l-0 border-r-0 px-0 pb-0 pt-0 hover:bg-transparent ${
                  isActive
                    ? "border-[#171717] text-[#171717]"
                    : "border-transparent text-[#5C5C5C] hover:text-[#171717]"
                }`}
              >
                <Icon className="size-5" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* ====== CONTENT AREA — 3 Columns ====== */}
      <div className="flex-1 px-[32px] py-2xl">
        <div className="flex gap-2xl items-start">

          {/* ====== LEFT COLUMN ====== */}
          <div className="flex-1 flex flex-col gap-2xl min-w-0">

            {/* Profile Card */}
            <div className="bg-white rounded-card shadow-x-small flex flex-col items-center px-xl pt-[32px] pb-xl">
              <img
                src={migrant.avatar}
                alt={migrant.name}
                className="size-20 rounded-full object-cover mb-xl"
              />
              <h3 className="text-title-aeonik text-[#171717] mb-xs">{migrant.name}</h3>
              <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] mb-lg">{migrant.employer}</span>
              <Badge variant="success" withDot className="h-5 text-[11px] uppercase tracking-[0.02em] font-medium rounded-full px-2 gap-0 pl-[2px] pr-[8px] mb-2xl">
                {migrant.visaStatus}
              </Badge>
              {/* Action Buttons */}
              <div className="flex items-center gap-sm">
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="size-8 bg-[#F5F5F5] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors border-0"
                >
                  <Upload className="size-5 text-[#5C5C5C]" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="size-8 bg-[#F5F5F5] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors border-0"
                >
                  <ClipboardList className="size-5 text-[#5C5C5C]" />
                </Button>
                <Button
                  variant="primary-neutral"
                  size="icon-sm"
                  className="size-8 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors border-0"
                >
                  <StickyNote className="size-5 text-white" />
                </Button>
              </div>
            </div>

            {/* Migration Status */}
            <div className="flex flex-col gap-lg">
              <SectionHeader
                title="Migration status"
                badge={
                  <span className="inline-flex items-center h-4 px-2 bg-[#EFEBFF] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717]">
                    {migrant.location}
                  </span>
                }
              />

              <div className="bg-white border border-[#F5F5F5] rounded-card p-xl flex flex-col gap-xs shadow-x-small">
                {/* Visa Status + Days Left */}
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em]">Visa Status</span>
                  <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em]">{migrant.visa.daysLeft}d left</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-[6px] bg-[#EBEBEB] rounded-full overflow-hidden mt-sm mb-xs">
                  <div
                    className="h-full bg-[#7D52F4] rounded-full"
                    style={{ width: `${visaProgress}%` }}
                  />
                </div>

                {/* Date labels */}
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-[#5C5C5C] tracking-[-0.006em]">{migrant.visa.startDate}</span>
                  <span className="text-[13px] text-[#5C5C5C] tracking-[-0.006em]">{migrant.visa.endDate}</span>
                </div>

                {/* Renewal Window */}
                <div className="flex items-center justify-between py-sm mt-xs">
                  <span className="text-[13px] text-[#5C5C5C] tracking-[-0.006em]">Renewal Window</span>
                  <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em]">{migrant.visa.renewalWindow}</span>
                </div>
                {/* Visa Type */}
                <div className="flex items-center justify-between py-sm">
                  <span className="text-[13px] text-[#5C5C5C] tracking-[-0.006em]">Visa Type</span>
                  <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em]">{migrant.visa.visaType}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex flex-col gap-lg">
              <SectionHeader title="Timeline" action="View all" />
              <div className="bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small">
                <div className="flex flex-col gap-xl">
                  {migrant.timeline.map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-lg">
                      <TimelineIcon type={item.icon} />
                      <div className="flex flex-col gap-[2px] pt-[6px] min-w-0">
                        <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] truncate">{item.title}</span>
                        <div className="flex items-center gap-[6px]">
                          <span className="text-[13px] text-[#7B7B7B] tracking-[-0.006em]">{item.by}</span>
                          <span className="text-[8px] font-medium text-[#A4A4A4] uppercase">•</span>
                          <span className="text-[11px] font-medium text-[#A4A4A4] uppercase tracking-[0.02em]">{item.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ====== MIDDLE COLUMN ====== */}
          <div className="flex-1 flex flex-col gap-2xl min-w-0">
            <SectionHeader title="Personal details" action="View all" />

            <div className="bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small flex flex-col">
              {/* PERSONAL INFORMATION */}
              <h4 className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#A4A4A4] mb-lg">Personal Information</h4>
              <KVRow label="Full Name" value={migrant.personalInfo.fullName} />
              <KVRow label="Gender" value={migrant.personalInfo.gender} />
              <KVRow label="Date of Birth" value={migrant.personalInfo.dob} />
              <KVRow label="Nationality">
                <div className="flex items-center gap-xs">
                  <span className="text-[16px]">{migrant.personalInfo.nationalityFlag}</span>
                  <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em]">{migrant.personalInfo.nationality}</span>
                </div>
              </KVRow>
              <KVRow label="Employer" value={migrant.personalInfo.employer} />
              <KVRow label="Job Title" value={migrant.personalInfo.jobTitle} />
              <KVRow label="Address">
                <div className="flex flex-col items-end">
                  {migrant.personalInfo.address.map((line: any, i: number) => (
                    <span key={i} className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] leading-5">{line}</span>
                  ))}
                </div>
              </KVRow>

              {/* Divider */}
              <div className="h-px bg-[#F5F5F5] my-xl" />

              {/* PASSPORT */}
              <h4 className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#A4A4A4] mb-lg">Passport</h4>
              <KVRow label="Passport Number" value={migrant.passport.number} />
              <KVRow label="Issue Date" value={migrant.passport.issueDate} />
              <KVRow label="Expiry Date" value={migrant.passport.expiryDate} />

              {/* Divider */}
              <div className="h-px bg-[#F5F5F5] my-xl" />

              {/* CERTIFICATE OF SPONSORSHIP */}
              <h4 className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#A4A4A4] mb-lg">Certificate of Sponsorship</h4>
              <KVRow label="Status">
                <Badge variant="success" withDot className="h-4 text-[11px] uppercase tracking-[0.02em] font-medium rounded-full px-2 gap-0 pl-[2px] pr-[8px]">
                  {migrant.cos.status}
                </Badge>
              </KVRow>
              <KVRow label="CoS Reference" value={migrant.cos.reference} />
              <KVRow label="Salary" value={migrant.cos.salary} />
              <KVRow label="Start Date" value={migrant.cos.startDate} />
              <KVRow label="SOC Code" value={migrant.cos.socCode} />
            </div>
          </div>

          {/* ====== RIGHT COLUMN ====== */}
          <div className="flex-1 flex flex-col gap-2xl min-w-0">

            {/* Priority Actions */}
            <div className="flex flex-col gap-lg">
              <SectionHeader title="Priority actions" action="View all" />

              {/* Stats Row */}
              <div className="flex gap-sm">
                <div className="flex-1 bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small">
                  <div className="flex items-center justify-between mb-xs">
                    <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#A4A4A4]">Open Tasks</span>
                    <ClipboardList className="size-5 text-[#A4A4A4]" />
                  </div>
                  <span className="text-[24px] font-medium text-[#171717]">3</span>
                </div>
                <div className="flex-1 bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small">
                  <div className="flex items-center justify-between mb-xs">
                    <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#A4A4A4]">Missing Docs</span>
                    <FileText className="size-5 text-[#A4A4A4]" />
                  </div>
                  <span className="text-[24px] font-medium text-[#171717]">7</span>
                </div>
              </div>

              {/* Action Items */}
              <div className="flex flex-col gap-sm">
                {migrant.priorityActions.map((action: any, i: number) => (
                  <button
                    key={i}
                    className="bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small flex items-start gap-lg cursor-pointer hover:shadow-custom-medium transition-all text-left w-full"
                  >
                    <span className="size-2 rounded-full mt-[6px] shrink-0" style={{ backgroundColor: action.color }} />
                    <div className="flex flex-col gap-xs flex-1 min-w-0">
                      <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em]">{action.title}</span>
                      <span className="text-[13px] text-[#7B7B7B] tracking-[-0.006em] leading-5">{action.desc}</span>
                    </div>
                    <ChevronRight className="size-4 text-[#A4A4A4] shrink-0 mt-[2px]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Compliance Health */}
            <div className="flex flex-col gap-lg">
              <SectionHeader title="Compliance health" action="View all" />

              {/* Donut + Percentage */}
              <div className="bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small">
                <div className="flex items-center gap-lg mb-xl">
                  <DonutChart percentage={migrant.compliance.percentage} />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em]">{migrant.compliance.percentage}% compliant</span>
                    <span className="text-[13px] text-[#7B7B7B] tracking-[-0.006em]">{migrant.compliance.tasks} tasks • {migrant.compliance.docs} docs</span>
                  </div>
                </div>

                {/* Compliance Items */}
                <div className="flex flex-col">
                  {migrant.compliance.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-lg py-lg border-t border-[#F5F5F5] first:border-t-0">
                      <ComplianceIcon type={item.icon} />
                      <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] flex-1">{item.label}</span>
                      {item.extra && <span className="text-[13px] text-[#A4A4A4] tracking-[-0.006em]">{item.extra}</span>}
                      <ChevronRight className="size-4 text-[#A4A4A4] shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
