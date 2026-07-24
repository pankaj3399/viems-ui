"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiLayoutGridLine,
  RiLayoutGridFill,
  RiUserLine,
  RiUserFill,
  RiBriefcaseLine,
  RiBriefcaseFill,
  RiFileTextLine,
  RiFileTextFill,
  RiListCheck,
  RiCheckboxCircleFill,
  RiStickyNoteLine,
  RiStickyNoteFill,
  RiMore2Line,
  RiUploadLine,
  RiClipboardLine,
  RiBellLine,
  RiFolderShieldLine,
  RiFolderShieldFill,
  RiGitBranchLine,
  RiGitBranchFill,
  RiMapPinLine,
  RiAlertLine,
  RiCheckboxCircleLine,
} from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatFullName } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { Flag } from "@/components/ui/flag";
import { EditPersonalDetailsModal } from "../components/EditPersonalDetailsModal";
import { EditHomeAddressModal } from "../components/EditHomeAddressModal";
import { EditContactDetailsModal } from "../components/EditContactDetailsModal";
import { EditEmploymentDetailsModal } from "../components/EditEmploymentDetailsModal";
import { EditWorkAddressModal } from "../components/EditWorkAddressModal";
import { ChangeCaseStatusModal } from "../components/ChangeCaseStatusModal";
import { CASE_STATUSES, isMatchingStatus } from "../case-status-data";
import { toast } from "sonner";
import { AddNoteModal } from "../components/AddNoteModal";
import { CaseHeader } from "./components/CaseHeader";
import { MigrationStatusCard, PersonalDetailsCard, PriorityActionsCard, TimelineCard, ProfileCard } from "./components/OverviewCards";
import { ComplianceCard } from "./components/ComplianceCard";
import { DocumentsTab } from "./components/DocumentsTab";
import { NotesTab } from "./components/NotesTab";
import { TasksTab } from "./components/TasksTab";
import { TimelineTab } from "./components/TimelineTab";
import { ComplianceTab } from "./components/ComplianceTab";

// -- CasesIcon (same as sidebar) --
const CasesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M5.5 6.25V4C5.5 3.80109 5.57902 3.61032 5.71967 3.46967C5.86032 3.32902 6.05109 3.25 6.25 3.25H11.0605L12.5605 4.75H16.75C16.9489 4.75 17.1397 4.82902 17.2803 4.96967C17.421 5.11032 17.5 5.30109 17.5 5.5V13C17.5 13.1989 17.421 13.3897 17.2803 13.5303C17.1397 13.671 16.9489 13.75 16.75 13.75H14.5V16C14.5 16.1989 14.421 16.3897 14.2803 16.5303C14.1397 16.671 13.9489 16.75 13.75 16.75H3.25C3.05109 16.75 2.86032 16.671 2.71967 16.5303C2.57902 16.3897 2.5 16.1989 2.5 16V7C2.5 6.80109 2.57902 6.61032 2.71967 6.46967C2.86032 6.32902 3.05109 6.25 3.25 6.25H5.5ZM5.5 7.75H4V15.25H13V13.75H5.5V7.75Z" fill="currentColor"/>
  </svg>
);

const countryMap: Record<string, { code: string; full: string; half: string; flag: string }> = {
  us: { code: "US", full: "United States", half: "USA", flag: "🇺🇸" },
  usa: { code: "US", full: "United States", half: "USA", flag: "🇺🇸" },
  american: { code: "US", full: "United States", half: "USA", flag: "🇺🇸" },
  "united states": { code: "US", full: "United States", half: "USA", flag: "🇺🇸" },
  gb: { code: "GB", full: "United Kingdom", half: "UK", flag: "🇬🇧" },
  uk: { code: "GB", full: "United Kingdom", half: "UK", flag: "🇬🇧" },
  british: { code: "GB", full: "United Kingdom", half: "UK", flag: "🇬🇧" },
  "united kingdom": { code: "GB", full: "United Kingdom", half: "UK", flag: "🇬🇧" },
  in: { code: "IN", full: "India", half: "Ind", flag: "🇮🇳" },
  indian: { code: "IN", full: "India", half: "Ind", flag: "🇮🇳" },
  india: { code: "IN", full: "India", half: "Ind", flag: "🇮🇳" },
  cn: { code: "CN", full: "China", half: "Chn", flag: "🇨🇳" },
  chinese: { code: "CN", full: "China", half: "Chn", flag: "🇨🇳" },
  china: { code: "CN", full: "China", half: "Chn", flag: "🇨🇳" },
  fr: { code: "FR", full: "France", half: "Fra", flag: "🇫🇷" },
  french: { code: "FR", full: "France", half: "Fra", flag: "🇫🇷" },
  france: { code: "FR", full: "France", half: "Fra", flag: "🇫🇷" },
  za: { code: "ZA", full: "South Africa", half: "SA", flag: "🇿🇦" },
  sa: { code: "ZA", full: "South Africa", half: "SA", flag: "🇿🇦" },
  "south african": { code: "ZA", full: "South Africa", half: "SA", flag: "🇿🇦" },
  "south africa": { code: "ZA", full: "South Africa", half: "SA", flag: "🇿🇦" },
  np: { code: "NP", full: "Nepal", half: "Nep", flag: "🇳🇵" },
  nepalese: { code: "NP", full: "Nepal", half: "Nep", flag: "🇳🇵" },
  nepal: { code: "NP", full: "Nepal", half: "Nep", flag: "🇳🇵" },
  pk: { code: "PK", full: "Pakistan", half: "Pak", flag: "🇵🇰" },
  pakistani: { code: "PK", full: "Pakistan", half: "Pak", flag: "🇵🇰" },
  pakistan: { code: "PK", full: "Pakistan", half: "Pak", flag: "🇵🇰" },
  de: { code: "DE", full: "Germany", half: "Ger", flag: "🇩🇪" },
  german: { code: "DE", full: "Germany", half: "Ger", flag: "🇩🇪" },
  germany: { code: "DE", full: "Germany", half: "Ger", flag: "🇩🇪" },
  it: { code: "IT", full: "Italy", half: "Ita", flag: "🇮🇹" },
  italian: { code: "IT", full: "Italy", half: "Ita", flag: "🇮🇹" },
  italy: { code: "IT", full: "Italy", half: "Ita", flag: "🇮🇹" },
  gl: { code: "GL", full: "Greenland", half: "Grl", flag: "🇬🇱" },
  greenland: { code: "GL", full: "Greenland", half: "Grl", flag: "🇬🇱" },
  jm: { code: "JM", full: "Jamaica", half: "Jam", flag: "🇯🇲" },
  jamaica: { code: "JM", full: "Jamaica", half: "Jam", flag: "🇯🇲" },
};

function getCountryInfo(raw: string): { code: string; full: string; half: string; flag: string } {
  if (!raw) return { code: "UN", full: "Unknown", half: "UNK", flag: "🌐" };
  const clean = raw.trim().toLowerCase().replace(/_/g, " ");
  
  if (countryMap[clean]) {
    return countryMap[clean];
  }
  
  const code = (clean.length === 2 ? clean : clean.slice(0, 2)).toUpperCase();
  const words = clean.split(" ");
  const full = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const half = full.length > 3 ? full.slice(0, 3) : full;
  
  const flagMap: Record<string, string> = {
    US: "🇺🇸", CN: "🇨🇳", IN: "🇮🇳", FR: "🇫🇷", ZA: "🇿🇦",
    GB: "🇬🇧", NP: "🇳🇵", DE: "🇩🇪", PK: "🇵🇰", IT: "🇮🇹",
    GL: "🇬🇱", JM: "🇯🇲"
  };
  const flag = flagMap[code] || "🌐";
  
  return { code, full, half, flag };
}

function sanitizeFirstAndLastName(rawFirst: string, rawLast: string) {
  let first = (rawFirst || "").trim();
  let last = (rawLast || "").trim();

  if (first && last) {
    const firstParts = first.split(/\s+/);
    const lastParts = last.split(/\s+/);

    if (firstParts.length > 1 && last.toLowerCase().includes(firstParts[0].toLowerCase())) {
      first = firstParts[0];
      if (lastParts.length > 1) {
        last = lastParts[lastParts.length - 1];
      } else if (last.toLowerCase() === rawFirst.trim().toLowerCase()) {
        last = firstParts.slice(1).join(" ");
      }
    } else if (last.toLowerCase() === first.toLowerCase() && firstParts.length > 1) {
      first = firstParts[0];
      last = firstParts.slice(1).join(" ");
    }
  } else if (first && !last) {
    const firstParts = first.split(/\s+/);
    if (firstParts.length > 1) {
      first = firstParts[0];
      last = firstParts.slice(1).join(" ");
    }
  }

  return { firstName: first, lastName: last };
}

function mapBackendCaseToDetail(c: any) {
  const m = c.migrant || c;
  const pInfo = m.user?.personalInfo || {};
  const activePassport = Array.isArray(m.passports)
    ? (m.passports.find((p: any) => p.is_actual) || m.passports[0] || {})
    : (m.passport || {});

  const rawFirstName = m.first_name || pInfo.firstName || m.firstName || "";
  const rawLastName = m.last_name || pInfo.lastName || m.lastName || "";
  const { firstName, lastName } = sanitizeFirstAndLastName(rawFirstName, rawLastName);
  const name = formatFullName(firstName, lastName) || m.stage_name || m.stageName || "Unknown Migrant";

  const rawGender = m.gender || pInfo.sex || m.sex || "";
  const genderDisplay = rawGender ? (rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase()) : "";

  const rawDob = m.date_of_birth || pInfo.dateOfBirth || m.dateOfBirth || "";
  const dobDisplay = rawDob ? (isNaN(new Date(rawDob).getTime()) ? rawDob : new Date(rawDob).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })) : "";

  const rawNationality = m.nationality?.name || m.nationality?.value || m.nationality?.title || pInfo.nationality?.name || pInfo.nationality?.value || (typeof m.nationality === "string" ? m.nationality : "");
  const { code: nationalityCode, full: country, flag: nationalityFlag } = getCountryInfo(rawNationality);

  const rawCityOfBirth = m.place_of_birth || m.city_of_birth || m.cityOfBirth || "";
  const rawCountryOfBirth = m.country_of_birth || m.contacts?.country?.name || m.countryOfBirth || "";
  const { code: countryOfBirthCode, flag: countryOfBirthFlag } = getCountryInfo(rawCountryOfBirth);

  const passportNumber = activePassport.passport_number || m.passportNumber || activePassport.passportNumber || "";
  const rawIssueDate = activePassport.issue_passport_date || m.issuePassportDate || activePassport.issuePassportDate || "";
  const passportIssueDate = rawIssueDate ? (isNaN(new Date(rawIssueDate).getTime()) ? rawIssueDate : new Date(rawIssueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })) : "";

  const rawExpiryDate = activePassport.expired_passport_date || m.expiredPassportDate || activePassport.expiredPassportDate || "";
  const passportExpiryDate = rawExpiryDate ? (isNaN(new Date(rawExpiryDate).getTime()) ? rawExpiryDate : new Date(rawExpiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })) : "";

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
  } else if (c.status || c.case_status) {
    const s = (c.status || c.case_status).toUpperCase().replace(/_/g, " ");
    if (s.includes("APPROVED") || s.includes("GRANTED")) approvalStatus = "VISA APPROVED";
    else if (s.includes("REFUSED")) approvalStatus = "VISA REFUSED";
    else approvalStatus = s;
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

  const migrantId = c.migrantId || m.id || c.id || "";

  // Resolve emergency contact from localStorage if exists
  let emergency = {
    name: "",
    relationship: "",
    phone: "",
    email: "",
  };
  if (typeof window !== "undefined" && migrantId) {
    const stored = localStorage.getItem(`emergency_${migrantId}`);
    if (stored) {
      try {
        emergency = JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
  }
  let localEmp: any = null;
  let localWork: any = null;
  if (typeof window !== "undefined" && c.id) {
    const storedEmp = localStorage.getItem(`employment_${c.id}`);
    if (storedEmp) {
      try { localEmp = JSON.parse(storedEmp); } catch (e) {}
    }
    const storedWork = localStorage.getItem(`work_address_${c.id}`);
    if (storedWork) {
      try { localWork = JSON.parse(storedWork); } catch (e) {}
    }
  }

  // Resolve address details
  const addressLine1 = m.contacts?.address_line_1 || "";
  const addressLine2 = m.contacts?.address_line_2 || "";
  const cityName = m.contacts?.city?.name || m.contacts?.city || "";
  const stateName = m.contacts?.state?.name || m.contacts?.state || "";
  const zipCode = m.contacts?.zip_code || "";
  const countryName = m.contacts?.country?.name || m.contacts?.country || "";

  const fullHomeAddress = m.contacts?.address_line_1
    ? [m.contacts.address_line_1, addressLine2, [cityName, stateName, zipCode].filter(Boolean).join(" ").trim(), countryName].filter(Boolean).join(", ")
    : "";

  // Dynamic Open Tasks count
  const openTasksCount = Array.isArray(c.tasks) ? c.tasks.filter((t: any) => !t.isCompleted).length : 0;
  
  // Dynamic Documents count
  const docsCount = Array.isArray(c.documents) ? c.documents.length : 0;
  const missingDocsCount = Math.max(0, 10 - docsCount);

  // Dynamic Priority Actions list
  const priorityActions = Array.isArray(c.priorityActions) && c.priorityActions.length > 0 ? c.priorityActions : (
    c.decision?.id === "Refused" ? [
      { color: "#FB3748", title: "Visa refused", desc: "The visa application was refused by UKVI." }
    ] : openTasksCount > 0 || missingDocsCount > 0 ? [
      ...(missingDocsCount > 0 ? [{
        color: "#FB3748",
        title: "Complete RTW check & Upload Documents",
        desc: `${missingDocsCount} required documents awaiting migrant upload.`,
      }] : []),
      ...(openTasksCount > 0 ? [{
        color: "#F6B51E",
        title: "Action required on open tasks",
        desc: `${openTasksCount} pending tasks require attention.`,
      }] : []),
    ] : []
  );

  // Dynamic Timeline events
  const timeline = Array.isArray(c.logs) && c.logs.length > 0 ? c.logs.map((log: any) => ({
    icon: log.type === "note" ? "note" : log.type === "task" ? "task" : "migration",
    title: log.message || log.title || "Case activity recorded",
    by: log.user || log.author || "System",
    time: log.createdAt ? new Date(log.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).toUpperCase() : "TODAY",
  })) : [];

  // Dynamic Compliance Health calculation
  const compliancePercentage = c.decision?.id === "Granted" ? 100 : c.decision?.id === "Refused" ? 30 : docsCount > 5 ? 75 : 50;

  return {
    id: c.id.toString(),
    migrantId,
    name,
    employer: c.personal?.groupName || c.employer || m.employer || "",
    caseId: c.caseIdNumber && c.relatedYear ? `#${c.caseIdNumber}/${c.relatedYear}` : c.caseNumber || `#${c.id}`,
    cosRef: c.cosStatus?.assigned?.cosNumber || c.cosReference || "",
    avatar: m.avatar || "",
    visaStatus,
    location,
    approvalStatus,
    openTasksCount,
    missingDocsCount,
    personalInfo: {
      fullName: name,
      firstName: firstName,
      lastName: lastName,
      gender: genderDisplay,
      dob: dobDisplay,
      maritalStatus: m.maritalStatus || m.marital_status || m.personalInfo?.maritalStatus || c.personal?.maritalStatus || "—",
      nationality: country,
      nationalityCode: nationalityCode,
      nationalityFlag,
      countryOfBirth: rawCountryOfBirth,
      countryOfBirthCode: countryOfBirthCode,
      countryOfBirthFlag,
      cityOfBirth: rawCityOfBirth,
      employer: c.personal?.groupName || c.employer || m.employer || "",
      jobTitle: c.personal?.jobTitle || "",
      address: m.contacts?.address_line_1 
        ? [m.contacts.address_line_1, `${cityName}, ${stateName} ${zipCode}`.trim()].filter(Boolean)
        : [],
    },
    passport: {
      number: passportNumber,
      issueDate: passportIssueDate,
      expiryDate: passportExpiryDate,
    },
    contact: {
      email: m.user?.email || m.contacts?.contact_email || m.email || "",
      phone: m.contacts?.phone_1 || "",
      homeAddress: fullHomeAddress,
      addressLine1: addressLine1,
      addressLine2: [addressLine2, cityName, stateName, zipCode].filter(Boolean).join(", "),
      lastConfirmed: "Not yet verified",
      emergency: {
        name: emergency.name || "",
        relationship: emergency.relationship || "",
        phone: emergency.phone || "",
        email: emergency.email || "",
      },
    },
    cos: {
      status: c.cosStatus?.id || (approvalStatus === "VISA APPROVED" ? "ASSIGNED" : "DRAFT"),
      reference: c.cosStatus?.assigned?.cosNumber || c.cosReference || "",
      salary: c.personal?.jobPay ? (String(c.personal.jobPay).startsWith("$") || String(c.personal.jobPay).startsWith("£") ? c.personal.jobPay : `$${c.personal.jobPay}`) : "",
      startDate: c.cosStatus?.assigned?.assignedDate ? new Date(c.cosStatus.assigned.assignedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
      socCode: c.personal?.jobSocCode || c.personal?.socCode || "",
    },
    visa: {
      daysLeft,
      totalDays,
      startDate: c.decision?.granted?.visaStartDate ? new Date(c.decision.granted.visaStartDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
      endDate: c.decision?.granted?.visaEndDate ? new Date(c.decision.granted.visaEndDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
      renewalWindow: c.decision?.granted?.visaEndDate ? ("Starts " + new Date(new Date(c.decision.granted.visaEndDate).setMonth(new Date(c.decision.granted.visaEndDate).getMonth() - 2)).toLocaleDateString("en-US", { month: "short", year: "numeric" })) : "",
      visaType: c.personal?.visaType || c.visaType || "",
    },
    timeline,
    priorityActions,
    compliance: {
      percentage: compliancePercentage,
      notes: c.notes?.length || 0,
      tasks: openTasksCount,
      docs: docsCount,
      items: [
        { icon: c.decision?.id === "Granted" ? "success" : "error", label: "Right to work check" },
        { icon: docsCount >= 5 ? "success" : "error", label: "Documents" },
        { icon: c.personal?.jobPay ? "success" : "error", label: "Salary" },
        { icon: "bell", label: "SMS reports", extra: "None yet" },
      ],
    },
    employment: {
      cosReference: c.cosStatus?.assigned?.cosNumber || c.cosReference || "",
      socCode: c.personal?.jobSocCode || c.personal?.socCode || "",
      employer: localEmp?.employer || c.personal?.groupName || c.employer || m.employer || "",
      jobTitle: localEmp?.jobTitle || c.personal?.jobTitle || "",
      startDate: localEmp?.startDate || (c.decision?.granted?.visaStartDate ? new Date(c.decision.granted.visaStartDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""),
      endDate: localEmp?.endDate || (c.decision?.granted?.visaEndDate ? new Date(c.decision.granted.visaEndDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""),
      contract: localEmp?.contract || c.personal?.employmentType || c.personal?.contractType || "",
      grossSalary: localEmp?.grossSalary || (c.personal?.jobPay ? (String(c.personal.jobPay).includes("year") || String(c.personal.jobPay).startsWith("£") ? c.personal.jobPay : `£${c.personal.jobPay}/year`) : ""),
      hoursPerWeek: localEmp?.hoursPerWeek || c.personal?.hoursPerWeek || "",
      mainWorkAddressLine1: localWork?.mainWorkAddressLine1 || localEmp?.mainWorkAddressLine1 || c.personal?.workAddress1 || "",
      mainWorkAddressLine2: localWork?.mainWorkAddressLine2 || localEmp?.mainWorkAddressLine2 || c.personal?.workAddress2 || "",
      secondWorkAddressLine1: localWork?.secondWorkAddress1 || c.personal?.secondWorkAddress1 || "",
      secondWorkAddressLine2: localWork?.secondWorkAddress2 || c.personal?.secondWorkAddress2 || "",
    },
  };
}

const tabs = [
  { label: "Overview", iconLine: RiLayoutGridLine, iconFill: RiLayoutGridFill },
  { label: "Personal Details", iconLine: RiUserLine, iconFill: RiUserFill },
  { label: "Employment", iconLine: RiBriefcaseLine, iconFill: RiBriefcaseFill },
  { label: "Documents", iconLine: RiFileTextLine, iconFill: RiFileTextFill },
  { label: "Tasks", iconLine: RiListCheck, iconFill: RiListCheck },
  { label: "Compliance", iconLine: RiFolderShieldLine, iconFill: RiFolderShieldFill },
  { label: "Timeline", iconLine: RiGitBranchLine, iconFill: RiGitBranchFill },
  { label: "Notes", iconLine: RiStickyNoteLine, iconFill: RiStickyNoteFill },
];

// -- Helper: Key-Value Row --
function KVRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-sm font-inter">
      <span className="text-[13px] text-[#5C5C5C] tracking-[-0.006em] font-inter font-normal">{label}</span>
      {children ? children : (
        <span className="text-[14px] font-medium text-[#171717] text-right tracking-[-0.006em] font-inter">{value || "—"}</span>
      )}
    </div>
  );
}

const renderCircularFlag = (country: string, fallbackFlag: string) => {
  return <Flag country={country} />;
};

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
      {type === "note" && <RiStickyNoteLine className={iconClass} />}
      {type === "task" && <RiClipboardLine className={iconClass} />}
      {type === "migration" && <CasesIcon className={iconClass} />}
    </div>
  );
}

// -- Compliance Status Icon --
function ComplianceIcon({ type }: { type: string }) {
  if (type === "error") return (
    <div className="size-5 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
      <RiAlertLine className="size-3 text-[#E54D2E]" />
    </div>
  );
  if (type === "success") return (
    <div className="size-5 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
      <RiCheckboxCircleLine className="size-3 text-[#16A34A]" />
    </div>
  );
  return (
    <div className="size-5 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
      <RiBellLine className="size-3 text-[#A4A4A4]" />
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

  const [isPersonalModalOpen, setIsPersonalModalOpen] = React.useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);
  const [isEmploymentModalOpen, setIsEmploymentModalOpen] = React.useState(false);
  const [isWorkAddressModalOpen, setIsWorkAddressModalOpen] = React.useState(false);
  const [isChangeStatusOpen, setIsChangeStatusOpen] = React.useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = React.useState(false);

  const loadCaseDetail = React.useCallback(async () => {
    if (!id) return;
    try {
      const caseResponse = await apiClient.get<any>(ENDPOINTS.cases.byId(id));
      const migrantId = caseResponse?.migrantId || caseResponse?.migrant?.id || id;
      let fullMigrantData = null;
      if (migrantId) {
        try {
          fullMigrantData = await apiClient.get<any>(ENDPOINTS.migrants.byId(migrantId));
        } catch (e) {
          console.error("Failed to fetch full migrant details:", e);
        }
      }
      const combined = {
        ...caseResponse,
        migrant: {
          ...(caseResponse?.migrant || {}),
          ...(fullMigrantData || {}),
        },
      };
      const detail = mapBackendCaseToDetail(combined);
      setMigrant(detail);
    } catch (err) {
      console.error("Failed to fetch case detail:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    setLoading(true);
    loadCaseDetail();
  }, [loadCaseDetail]);

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
    <div className="w-full flex flex-col font-sans text-[#171717] select-none bg-[#F5F5F5] min-h-full overflow-x-hidden">
      {/* ====== WHITE HEADER ====== */}
      <div className="bg-white rounded-t-card flex flex-col shrink-0">
        <CaseHeader
          name={migrant.name}
          avatar={migrant.avatar}
          visaStatus={migrant.visaStatus}
          location={migrant.location}
          caseId={migrant.caseId}
          cosRef={migrant.cosRef}
          approvalStatus={migrant.approvalStatus}
          onBack={() => router.push("/cases")}
          onChangeStatus={() => setIsChangeStatusOpen(true)}
          onAddNote={() => setIsAddNoteOpen(true)}
        />

        {/* ====== TAB MENU ====== */}
        <div className="px-[64px] flex items-center gap-2xl h-[50px] border-b border-[#EBEBEB]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.label;
            const IconComponent = isActive ? tab.iconFill : tab.iconLine;
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
                <IconComponent className="size-5" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* ====== CONTENT AREA ====== */}
      <div className="flex-1 px-[32px] py-2xl max-w-full overflow-x-hidden">
        {activeTab === "Overview" ? (
          <div className="flex gap-[24px] items-start w-full">
            {/* ====== COLUMN 1 (Left 303.5px): Profile & Migration Status & Timeline ====== */}
            <div className="w-[303px] shrink-0 flex flex-col gap-[24px]">
              <ProfileCard
                name={migrant.name}
                initials={migrant.name ? migrant.name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "—"}
                avatar={migrant.avatar}
                employer={migrant.employer}
                status={migrant.approvalStatus === "VISA APPROVED" ? "VISA APPROVED" : "AWAITING APPLICANT DOCS"}
                onAddNote={() => setIsAddNoteOpen(true)}
                onUpload={() => setActiveTab("Documents")}
                onDocuments={() => setActiveTab("Documents")}
              />
              <MigrationStatusCard location={migrant.location} visa={migrant.visa} />
              <TimelineCard timeline={migrant.timeline} onViewAll={() => setActiveTab("Timeline")} />
            </div>

            {/* ====== COLUMN 2 (Center Flex): Personal Details ====== */}
            <div className="flex-1 min-w-0 flex flex-col gap-[24px]">
              <PersonalDetailsCard
                personalInfo={migrant.personalInfo}
                passport={migrant.passport}
                cos={migrant.cos}
                onViewAll={() => setActiveTab("Personal Details")}
              />
            </div>

            {/* ====== COLUMN 3 (Right 380px): Priority Actions & Compliance Health ====== */}
            <div className="w-[380px] shrink-0 flex flex-col gap-[24px]">
              <PriorityActionsCard
                actions={migrant.priorityActions}
                openTasks={migrant.openTasksCount}
                missingDocs={migrant.missingDocsCount}
                onViewAll={() => setActiveTab("Tasks")}
              />
              <ComplianceCard
                percentage={migrant.compliance.percentage}
                tasks={migrant.compliance.tasks}
                docs={migrant.compliance.docs}
                items={migrant.compliance.items}
              />
            </div>
          </div>
        ) : activeTab === "Personal Details" ? (
          <div className="flex gap-[24px] items-start w-full font-inter select-none max-w-full">
            {/* LEFT COLUMN: Personal details widget */}
            <div className="flex-1 min-w-0 max-w-[540px] flex flex-col gap-[12px]">
              <div className="flex items-center justify-between h-[30px]">
                <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">
                  Personal details
                </h2>
                <button
                  type="button"
                  onClick={() => setIsPersonalModalOpen(true)}
                  className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto font-inter"
                >
                  Edit
                </button>
              </div>
              
              {/* Outer white card */}
              <div className="bg-white border border-[#FFFFFF] rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full h-[450px]">
                {/* Inner gray container */}
                <div className="bg-[#F7F7F7] rounded-[16px] p-[8px_20px_16px] w-full h-[442px] flex flex-col gap-[8px] justify-between">
                  <KVRow label="First Name" value={migrant.personalInfo.firstName} />
                  <KVRow label="Last Name" value={migrant.personalInfo.lastName} />
                  <KVRow label="Date of Birth" value={migrant.personalInfo.dob} />
                  <KVRow label="Gender" value={migrant.personalInfo.gender} />
                  <KVRow label="Marital Status" value={migrant.personalInfo.maritalStatus} />
                  
                  <KVRow label="Nationality">
                    {migrant.personalInfo.nationality ? (
                      <div className="flex items-center gap-xs font-inter">
                        {renderCircularFlag(migrant.personalInfo.nationality, migrant.personalInfo.nationalityFlag)}
                        <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-inter">
                          {migrant.personalInfo.nationalityCode}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-inter">—</span>
                    )}
                  </KVRow>
                  
                  <KVRow label="Country of Birth">
                    {migrant.personalInfo.countryOfBirth ? (
                      <div className="flex items-center gap-xs font-inter">
                        {renderCircularFlag(migrant.personalInfo.countryOfBirth, migrant.personalInfo.countryOfBirthFlag)}
                        <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-inter">
                          {migrant.personalInfo.countryOfBirthCode}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-inter">—</span>
                    )}
                  </KVRow>
                  
                  <KVRow label="City of Birth" value={migrant.personalInfo.cityOfBirth} />
                  <KVRow label="Passport Number" value={migrant.passport.number} />
                  <KVRow label="Passport Issue Date" value={migrant.passport.issueDate} />
                  <KVRow label="Passport Expiry Date" value={migrant.passport.expiryDate} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Home address and Contact details widgets */}
            <div className="flex-1 min-w-0 max-w-[540px] flex flex-col gap-[24px]">
              {/* Home address widget */}
              <div className="flex flex-col gap-[12px] w-full">
                <div className="flex items-center justify-between h-[30px]">
                  <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">
                    Home address
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto font-inter"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="bg-white border border-[#FFFFFF] rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full h-[80px]">
                  <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] w-full h-[72px] flex items-center gap-[8px]">
                    <RiMapPinLine className="size-5 text-[#171717] shrink-0" />
                    <div className="flex flex-col text-left font-inter">
                      {migrant.contact.addressLine1 || migrant.contact.addressLine2 ? (
                        <>
                          {migrant.contact.addressLine1 && (
                            <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-inter">
                              {migrant.contact.addressLine1}
                            </span>
                          )}
                          {migrant.contact.addressLine2 && (
                            <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-inter">
                              {migrant.contact.addressLine2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-inter">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact details widget */}
              <div className="flex flex-col gap-[12px] w-full">
                <div className="flex items-center justify-between h-[30px]">
                  <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">
                    Contact details
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(true)}
                    className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto font-inter"
                  >
                    Edit
                  </button>
                </div>

                <div className="bg-white border border-[#FFFFFF] rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full h-[424px]">
                  <div className="w-full h-[416px] flex flex-col gap-[4px]">
                    {/* PRIMARY CONTACT Section */}
                    <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px_20px] w-full h-[206px] flex flex-col justify-between font-inter">
                      <span className="text-[12px] font-semibold tracking-[0.04em] text-[#171717] uppercase mb-xs font-inter">
                        Primary Contact
                      </span>
                      <KVRow label="Email" value={migrant.contact.email} />
                      <KVRow label="Phone" value={migrant.contact.phone} />
                      <KVRow label="Home Address" value={migrant.contact.homeAddress} />
                      <KVRow label="Last Confirmed">
                        <span className="text-[14px] font-medium text-[#A4A4A4] tracking-[-0.006em] font-inter">
                          {migrant.contact.lastConfirmed}
                        </span>
                      </KVRow>
                    </div>

                    {/* EMERGENCY CONTACT Section */}
                    <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px_20px] w-full h-[206px] flex flex-col justify-between font-inter">
                      <span className="text-[12px] font-semibold tracking-[0.04em] text-[#171717] uppercase mb-xs font-inter">
                        Emergency Contact
                      </span>
                      <KVRow label="Name" value={migrant.contact.emergency.name} />
                      <KVRow label="Relationship" value={migrant.contact.emergency.relationship} />
                      <KVRow label="Phone" value={migrant.contact.emergency.phone} />
                      <KVRow label="Email" value={migrant.contact.emergency.email} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Employment" ? (
          <div className="flex gap-[24px] items-start w-full font-inter select-none max-w-full">
            {/* LEFT COLUMN: Employment details widget */}
            <div className="flex-1 min-w-0 max-w-[540px] flex flex-col gap-[12px]">
              <div className="flex items-center justify-between h-[30px]">
                <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">
                  Employment details
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEmploymentModalOpen(true)}
                  className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto font-inter"
                >
                  Edit
                </button>
              </div>

              {/* Outer white card */}
              <div className="bg-white border border-[#FFFFFF] rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full h-[340px]">
                {/* Inner gray container */}
                <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] w-full h-[332px] flex flex-col justify-between">
                  <KVRow label="CoS Reference" value={migrant.employment?.cosReference} />
                  <KVRow label="SOC Code" value={migrant.employment?.socCode} />
                  <KVRow label="Employer" value={migrant.employment?.employer} />
                  <KVRow label="Job Title" value={migrant.employment?.jobTitle} />
                  <KVRow label="Start/End Date" value={migrant.employment?.startDate && migrant.employment?.endDate ? `${migrant.employment.startDate} – ${migrant.employment.endDate}` : "—"} />
                  <KVRow label="Contract" value={migrant.employment?.contract} />
                  <KVRow label="Gross Salary" value={migrant.employment?.grossSalary} />
                  <KVRow label="Hours/Week" value={migrant.employment?.hoursPerWeek} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Work address widget */}
            <div className="flex-1 min-w-0 max-w-[540px] flex flex-col gap-[12px]">
              <div className="flex items-center justify-between h-[30px]">
                <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">
                  Work address
                </h2>
                <button
                  type="button"
                  onClick={() => setIsWorkAddressModalOpen(true)}
                  className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto font-inter"
                >
                  Edit
                </button>
              </div>

              {/* Outer white card */}
              <div className="bg-white border border-[#FFFFFF] rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full h-[220px]">
                <div className="w-full h-[212px] flex flex-col gap-[4px]">
                  {/* MAIN ADDRESS Section */}
                  <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] w-full h-[104px] flex flex-col justify-between font-inter">
                    <span className="text-[12px] font-medium tracking-[0.04em] text-[#171717] uppercase font-inter">
                      MAIN ADDRESS
                    </span>
                    <div className="flex items-center gap-[8px]">
                      <RiMapPinLine className="size-5 text-[#171717] shrink-0" />
                      <div className="flex flex-col text-left font-inter">
                        <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-inter">
                          {migrant.employment?.mainWorkAddressLine1}
                        </span>
                        <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-inter">
                          {migrant.employment?.mainWorkAddressLine2}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECOND ADDRESS Section */}
                  <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] w-full h-[104px] flex flex-col justify-between font-inter">
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[12px] font-medium tracking-[0.04em] text-[#171717] uppercase font-inter">
                        SECOND ADDRESS
                      </span>
                      <span className="bg-[#EBEBEB] text-[#7B7B7B] text-[11px] font-medium px-[8px] py-[2px] rounded-full uppercase tracking-[0.02em] font-inter">
                        UNVERIFIED
                      </span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <RiMapPinLine className="size-5 text-[#171717] shrink-0" />
                      <div className="flex flex-col text-left font-inter">
                        <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-inter">
                          {migrant.employment?.secondWorkAddressLine1}
                        </span>
                        <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-inter">
                          {migrant.employment?.secondWorkAddressLine2}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Documents" ? (
          <DocumentsTab caseId={id} />
        ) : activeTab === "Tasks" ? (
          <TasksTab caseId={id} />
        ) : activeTab === "Timeline" ? (
          <TimelineTab id={id} />
        ) : activeTab === "Compliance" ? (
          <ComplianceTab id={id} />
        ) : activeTab === "Notes" ? (
          <NotesTab id={id} />
        ) : (
          <div className="bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small font-sans select-none text-left">
            <h3 className="text-h6-title text-[#171717]">{activeTab} Section</h3>
            <p className="text-paragraph-sm text-[#7B7B7B] mt-xs">Content for {activeTab} is not yet implemented.</p>
          </div>
        )}
      </div>
      <ChangeCaseStatusModal
        open={isChangeStatusOpen}
        onOpenChange={setIsChangeStatusOpen}
        currentStatus={migrant.approvalStatus}
        onApply={async (newStatus: string) => {
          try {
            if (id) {
              const matching = CASE_STATUSES.find((s) => isMatchingStatus(newStatus, s));
              const statusLabel = matching ? matching.label : newStatus;
              const formData = new FormData();
              formData.append("status", statusLabel);
              if (newStatus.toLowerCase().includes("approved") || newStatus === "visa_approved") {
                formData.append("decision", JSON.stringify({ id: "Granted" }));
              } else if (newStatus.toLowerCase().includes("refused") || newStatus === "visa_refused") {
                formData.append("decision", JSON.stringify({ id: "Refused" }));
              }
              await apiClient.patch(ENDPOINTS.cases.byId(id), {
                body: formData,
              });
              toast.success("Case status updated");
              loadCaseDetail();
            }
          } catch (err) {
            console.error("Failed to update status:", err);
            toast.error("Failed to update case status");
          }
        }}
      />
      {migrant.migrantId && (
        <>
          <EditPersonalDetailsModal
            open={isPersonalModalOpen}
            onOpenChange={setIsPersonalModalOpen}
            migrantId={migrant.migrantId}
            onSuccess={loadCaseDetail}
          />
          <EditHomeAddressModal
            open={isAddressModalOpen}
            onOpenChange={setIsAddressModalOpen}
            migrantId={migrant.migrantId}
            onSuccess={loadCaseDetail}
          />
          <EditContactDetailsModal
            open={isContactModalOpen}
            onOpenChange={setIsContactModalOpen}
            migrantId={migrant.migrantId}
            onSuccess={loadCaseDetail}
          />
          <EditEmploymentDetailsModal
            open={isEmploymentModalOpen}
            onOpenChange={setIsEmploymentModalOpen}
            caseId={id}
            migrantId={migrant.migrantId}
            initialData={migrant.employment}
            onSuccess={loadCaseDetail}
          />
          <EditWorkAddressModal
            open={isWorkAddressModalOpen}
            onOpenChange={setIsWorkAddressModalOpen}
            caseId={id}
            migrantId={migrant.migrantId}
            initialData={migrant.employment}
            onSuccess={loadCaseDetail}
          />
          <AddNoteModal
            isOpen={isAddNoteOpen}
            onClose={() => setIsAddNoteOpen(false)}
            caseId={id}
            onNoteAdded={loadCaseDetail}
          />
        </>
      )}
    </div>
  );
}
