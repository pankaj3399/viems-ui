"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiLayoutGridLine,
  RiUserLine,
  RiBriefcaseLine,
  RiFileTextLine,
  RiListCheck,
  RiStickyNoteLine,
  RiMore2Line,
  RiUploadLine,
  RiClipboardLine,
  RiBellLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiPencilLine,
  RiGitBranchLine,
  RiMapPinLine,
  RiShieldCheckLine,
} from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { Flag } from "@/components/ui/flag";
import { EditPersonalDetailsModal } from "../components/EditPersonalDetailsModal";
import { EditHomeAddressModal } from "../components/EditHomeAddressModal";
import { EditContactDetailsModal } from "../components/EditContactDetailsModal";
import { CaseHeader } from "./components/CaseHeader";
import { MigrationStatusCard, PersonalDetailsCard, PriorityActionsCard, TimelineCard } from "./components/OverviewCards";
import { ComplianceCard } from "./components/ComplianceCard";
import { DocumentsTab } from "./components/DocumentsTab";
import { NotesTab } from "./components/NotesTab";

// -- CasesIcon (same as sidebar) --
const CasesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M5.5 6.25V4C5.5 3.80109 5.57902 3.61032 5.71967 3.46967C5.86032 3.32902 6.05109 3.25 6.25 3.25H11.0605L12.5605 4.75H16.75C16.9489 4.75 17.1397 4.82902 17.2803 4.96967C17.421 5.11032 17.5 5.30109 17.5 5.5V13C17.5 13.1989 17.421 13.3897 17.2803 13.5303C17.1397 13.671 16.9489 13.75 16.75 13.75H14.5V16C14.5 16.1989 14.421 16.3897 14.2803 16.5303C14.1397 16.671 13.9489 16.75 13.75 16.75H3.25C3.05109 16.75 2.86032 16.671 2.71967 16.5303C2.57902 16.3897 2.5 16.1989 2.5 16V7C2.5 6.80109 2.57902 6.61032 2.71967 6.46967C2.86032 6.32902 3.05109 6.25 3.25 6.25H5.5ZM5.5 7.75H4V15.25H13V13.75H5.5V7.75Z" fill="currentColor"/>
  </svg>
);

function mapBackendCaseToDetail(c: any) {
  const name = [c.migrant?.firstName, c.migrant?.lastName].filter(Boolean).join(" ") || c.migrant?.stageName || "Unknown Migrant";
  
  // Nationality mapping
  const nationalityToCountryCode: Record<string, string> = {
    american: "US",
    indian: "IN",
    chinese: "CN",
    french: "FR",
    "south african": "SA",
    british: "GB",
    nepalese: "NP",
    us: "US",
    cn: "CN",
    in: "IN",
    fr: "FR",
    sa: "SA",
    za: "ZA",
    gb: "GB",
    np: "NP",
  };
  const country = (nationalityToCountryCode[c.migrant?.nationality?.value?.toLowerCase()] || c.migrant?.nationality?.value || "US").toUpperCase();
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

  const migrantId = c.migrantId || c.migrant?.id || "";

  // Resolve emergency contact from localStorage if exists
  let emergency = {
    name: "Morgan Johnson",
    relationship: "Spouse",
    phone: "+1 (555) 012-3456",
    email: "morgan.j@email.com",
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

  // Resolve address details
  const addressLine1 = c.migrant?.contacts?.address_line_1 || "742 Evergreen Terrace";
  const addressLine2 = c.migrant?.contacts?.address_line_2 || "";
  const cityName = c.migrant?.contacts?.city?.name || c.migrant?.contacts?.city || "Los Angeles";
  const stateName = c.migrant?.contacts?.state?.name || c.migrant?.contacts?.state || "CA";
  const zipCode = c.migrant?.contacts?.zip_code || "90026";
  const countryName = c.migrant?.contacts?.country?.name || c.migrant?.contacts?.country || "United States";

  const fullHomeAddress = c.migrant?.contacts?.address_line_1
    ? [c.migrant.contacts.address_line_1, addressLine2, `${cityName}, ${stateName} ${zipCode}`.trim(), countryName].filter(Boolean).join(", ")
    : "742 Evergreen Terrace, Los Angeles, CA 90026";

  return {
    id: c.id.toString(),
    migrantId,
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
      firstName: c.migrant?.firstName || name.split(" ")[0] || "Taylor",
      lastName: c.migrant?.lastName || name.split(" ")[1] || "Johnson",
      gender: c.migrant?.gender || "Male",
      dob: c.migrant?.dateOfBirth ? new Date(c.migrant.dateOfBirth).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "14 Jun 1990",
      maritalStatus: emergency.relationship === "Spouse" ? "Married" : "Single",
      nationality: country,
      nationalityFlag,
      countryOfBirth: "United States",
      countryOfBirthFlag: "🇺🇸",
      cityOfBirth: c.migrant?.placeOfBirth || c.migrant?.place_of_birth || "Los Angeles",
      employer: c.personal?.groupName || "N/A",
      jobTitle: c.personal?.jobTitle || "N/A",
      address: c.migrant?.contacts?.address_line_1 
        ? [c.migrant.contacts.address_line_1, `${cityName}, ${stateName} ${zipCode}`.trim()]
        : ["742 Evergreen Terrace", "Los Angeles, CA 90026"],
    },
    passport: {
      number: c.migrant?.passportNumber || "LQ41932345",
      issueDate: c.migrant?.issuePassportDate ? new Date(c.migrant.issuePassportDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "22 Nov 2022",
      expiryDate: c.migrant?.expiredPassportDate ? new Date(c.migrant.expiredPassportDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "22 Nov 2027",
    },
    contact: {
      email: c.migrant?.user?.email || c.migrant?.email || "taylor.j@email.com",
      phone: c.migrant?.contacts?.phone_1 || "+44 7700 123456",
      homeAddress: fullHomeAddress,
      lastConfirmed: "Not yet verified",
      emergency,
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
  { label: "Overview", icon: RiLayoutGridLine },
  { label: "Personal Details", icon: RiUserLine },
  { label: "Employment", icon: RiBriefcaseLine },
  { label: "Documents", icon: RiFileTextLine },
  { label: "Tasks", icon: RiListCheck },
  { label: "Compliance", icon: RiShieldCheckLine },
  { label: "Timeline", icon: RiGitBranchLine },
  { label: "Notes", icon: RiStickyNoteLine },
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

  const loadCaseDetail = React.useCallback(async () => {
    if (!id) return;
    try {
      const response = await apiClient.get<any>(ENDPOINTS.cases.byId(id));
      const detail = mapBackendCaseToDetail(response);
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
    <div className="w-full flex flex-col font-sans text-[#171717] select-none bg-[#F5F5F5] min-h-full">
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
        />

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

      {/* ====== CONTENT AREA ====== */}
      <div className="flex-1 px-[32px] py-2xl">
        {activeTab === "Overview" ? (
          <div className="flex gap-2xl items-start">
            {/* ====== LEFT COLUMN ====== */}
            <div className="flex-1 flex flex-col gap-2xl min-w-0">
              <MigrationStatusCard location={migrant.location} visa={migrant.visa} />
              <PersonalDetailsCard personalInfo={migrant.personalInfo} passport={migrant.passport} cos={migrant.cos} />
            </div>

            {/* ====== RIGHT COLUMN ====== */}
            <div className="w-[449px] shrink-0 flex flex-col gap-2xl">
              <PriorityActionsCard actions={migrant.priorityActions} />
              <TimelineCard timeline={migrant.timeline} />
              <ComplianceCard
                percentage={migrant.compliance.percentage}
                tasks={migrant.compliance.tasks}
                docs={migrant.compliance.docs}
                items={migrant.compliance.items}
              />
            </div>
          </div>
        ) : activeTab === "Personal Details" ? (
          <div className="flex gap-[24px] items-start w-full font-sans select-none">
            {/* LEFT COLUMN: Personal details widget */}
            <div className="w-[540px] flex flex-col gap-[12px] shrink-0">
              <div className="flex items-center justify-between h-[30px]">
                <h2 className="font-medium text-[20px] text-[#171717] leading-[32px] font-sans">
                  Personal details
                </h2>
                <button
                  type="button"
                  onClick={() => setIsPersonalModalOpen(true)}
                  className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto font-sans"
                >
                  Edit
                </button>
              </div>
              
              {/* Outer white card */}
              <div className="bg-white border border-[#FFFFFF] rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-[540px] h-auto">
                {/* Inner gray container */}
                <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px_20px] w-[532px] h-auto flex flex-col gap-xs">
                  <KVRow label="First Name" value={migrant.personalInfo.firstName} />
                  <KVRow label="Last Name" value={migrant.personalInfo.lastName} />
                  <KVRow label="Date of Birth" value={migrant.personalInfo.dob} />
                  <KVRow label="Gender" value={migrant.personalInfo.gender} />
                  <KVRow label="Marital Status" value={migrant.personalInfo.maritalStatus} />
                  
                  <KVRow label="Nationality">
                    <div className="flex items-center gap-xs">
                      {renderCircularFlag(migrant.personalInfo.nationality, migrant.personalInfo.nationalityFlag)}
                      <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-sans">{migrant.personalInfo.nationality}</span>
                    </div>
                  </KVRow>
                  
                  <KVRow label="Country of Birth">
                    <div className="flex items-center gap-xs">
                      {renderCircularFlag(migrant.personalInfo.countryOfBirth, migrant.personalInfo.countryOfBirthFlag)}
                      <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-sans">{migrant.personalInfo.countryOfBirth}</span>
                    </div>
                  </KVRow>
                  
                  <KVRow label="City of Birth" value={migrant.personalInfo.cityOfBirth} />
                  <KVRow label="Passport Number" value={migrant.passport.number} />
                  <KVRow label="Passport Issue Date" value={migrant.passport.issueDate} />
                  <KVRow label="Passport Expiry Date" value={migrant.passport.expiryDate} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Home address and Contact details widgets */}
            <div className="w-[540px] flex flex-col gap-[24px] shrink-0">
              {/* Home address widget */}
              <div className="flex flex-col gap-[12px] w-[540px]">
                <div className="flex items-center justify-between h-[30px]">
                  <h2 className="font-medium text-[20px] text-[#171717] leading-[32px] font-sans">
                    Home address
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto font-sans"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="bg-white border border-[#FFFFFF] rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-[540px] h-[80px]">
                  <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] w-[532px] h-[72px] flex items-center gap-sm">
                    <RiMapPinLine className="size-5 text-[#171717] shrink-0" />
                    <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] font-sans">
                      {migrant.contact.homeAddress}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact details widget */}
              <div className="flex flex-col gap-[12px] w-[540px]">
                <div className="flex items-center justify-between h-[30px]">
                  <h2 className="font-medium text-[20px] text-[#171717] leading-[32px] font-sans">
                    Contact details
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(true)}
                    className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto font-sans"
                  >
                    Edit
                  </button>
                </div>

                <div className="bg-white border border-[#FFFFFF] rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-[540px] h-auto">
                  <div className="w-[532px] h-auto flex flex-col gap-md">
                    {/* PRIMARY CONTACT Section */}
                    <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px_20px] flex flex-col gap-xs h-auto">
                      <span className="text-[12px] font-semibold tracking-[0.04em] text-[#171717] uppercase mb-xs font-sans">
                        Primary Contact
                      </span>
                      <KVRow label="Email" value={migrant.contact.email} />
                      <KVRow label="Phone" value={migrant.contact.phone} />
                      <KVRow label="Home Address" value={migrant.contact.homeAddress} />
                      <KVRow label="Last Confirmed">
                        <span className="text-[14px] font-medium text-[#A4A4A4] tracking-[-0.006em] font-sans">
                          {migrant.contact.lastConfirmed}
                        </span>
                      </KVRow>
                    </div>

                    {/* EMERGENCY CONTACT Section */}
                    <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px_20px] flex flex-col gap-xs h-auto font-sans">
                      <span className="text-[12px] font-semibold tracking-[0.04em] text-[#171717] uppercase mb-xs font-sans">
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
        ) : activeTab === "Documents" ? (
          <DocumentsTab />
        ) : activeTab === "Notes" ? (
          <NotesTab />
        ) : (
          <div className="bg-white border border-[#F5F5F5] rounded-card p-xl shadow-x-small font-sans select-none text-left">
            <h3 className="text-h6-title text-[#171717]">{activeTab} Section</h3>
            <p className="text-paragraph-sm text-[#7B7B7B] mt-xs">Content for {activeTab} is not yet implemented.</p>
          </div>
        )}
      </div>
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
        </>
      )}
    </div>
  );
}
