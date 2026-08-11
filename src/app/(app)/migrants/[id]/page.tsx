"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  RiLayoutGridLine,
  RiLayoutGridFill,
  RiFileTextLine,
  RiFileTextFill,
  RiSuitcase2Line,
  RiSuitcase2Fill,
  RiMapPinLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { formatFullName, getInitials } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { CaseHeader } from "../../cases/[id]/components/CaseHeader";
import { ProfileCard, MigrationStatusCard, PersonalDetailsCard } from "../../cases/[id]/components/OverviewCards";
import { PassportTab } from "../../cases/[id]/components/PassportTab";
import { CasesTab } from "../../cases/[id]/components/CasesTab";
import { TravelHistoryTab } from "../../cases/[id]/components/TravelHistoryTab";
import { EditPersonalDetailsModal } from "../../cases/components/EditPersonalDetailsModal";
import { EditHomeAddressModal } from "../../cases/components/EditHomeAddressModal";
import { EditContactDetailsModal } from "../../cases/components/EditContactDetailsModal";
import { ChangeCaseStatusModal } from "../../cases/components/ChangeCaseStatusModal";
import { AddNoteModal } from "../../cases/components/AddNoteModal";
import { toast } from "sonner";
import { Flag } from "@/components/ui/flag";

const CasesTabIcon = ({ active, className }: { active?: boolean; className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M5.5 6.25V4C5.5 3.80109 5.57902 3.61032 5.71967 3.46967C5.86032 3.32902 6.05109 3.25 6.25 3.25H11.0605L12.5605 4.75H16.75C16.9489 4.75 17.1397 4.82902 17.2803 4.96967C17.421 5.11032 17.5 5.30109 17.5 5.5V13C17.5 13.1989 17.421 13.3897 17.2803 13.5303C17.1397 13.671 16.9489 13.75 16.75 13.75H14.5V16C14.5 16.1989 14.421 16.3897 14.2803 16.5303C14.1397 16.671 13.9489 16.75 13.75 16.75H3.25C3.05109 16.75 2.86032 16.671 2.71967 16.5303C2.57902 16.3897 2.5 16.1989 2.5 16V7C2.5 6.80109 2.57902 6.61032 2.71967 6.46967C2.86032 6.32902 3.05109 6.25 3.25 6.25H5.5ZM5.5 7.75H4V15.25H13V13.75H5.5V7.75Z" fill="currentColor"/>
  </svg>
);

const migrantTabs = [
  { label: "Overview", iconLine: RiLayoutGridLine, iconFill: RiLayoutGridFill },
  { label: "Passport", iconLine: RiFileTextLine, iconFill: RiFileTextFill },
  { label: "Cases", iconLine: (props: React.SVGProps<SVGSVGElement>) => <CasesTabIcon active={false} {...props} />, iconFill: (props: React.SVGProps<SVGSVGElement>) => <CasesTabIcon active={true} {...props} /> },
  { label: "UK Travel History", iconLine: RiSuitcase2Line, iconFill: RiSuitcase2Fill },
];

function sanitizeFirstAndLastName(rawFirst: string, rawLast: string) {
  let first = (rawFirst || "").trim();
  let last = (rawLast || "").trim();
  if (first && !last) {
    const parts = first.split(/\s+/);
    if (parts.length > 1) {
      first = parts[0];
      last = parts.slice(1).join(" ");
    }
  }
  return { firstName: first, lastName: last };
}

function mapBackendMigrantToDetail(c: any) {
  const m = c.migrant || c;
  const pInfo = m.user?.personalInfo || {};
  const activePassport = Array.isArray(m.passports)
    ? (m.passports.find((p: any) => p.is_actual) || m.passports[0] || {})
    : (m.passport || {});

  const rawFirstName = m.first_name || pInfo.firstName || m.firstName || "Taylor";
  const rawLastName = m.last_name || pInfo.lastName || m.lastName || "Johnson";
  const { firstName, lastName } = sanitizeFirstAndLastName(rawFirstName, rawLastName);
  const name = formatFullName(firstName, lastName) || "Taylor Johnson";

  const rawGender = m.gender || pInfo.sex || m.sex || "Male";
  const genderDisplay = rawGender ? (rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase()) : "Male";

  const rawDob = m.date_of_birth || pInfo.dateOfBirth || m.dateOfBirth || "1990-06-14";
  const dobDisplay = rawDob ? (isNaN(new Date(rawDob).getTime()) ? rawDob : new Date(rawDob).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })) : "14 Jun 1990";

  const passportNumber = activePassport.passport_number || m.passportNumber || activePassport.passportNumber || "LQ41932345";
  const rawIssueDate = activePassport.issue_passport_date || m.issuePassportDate || activePassport.issuePassportDate || "2022-11-22";
  const passportIssueDate = rawIssueDate ? (isNaN(new Date(rawIssueDate).getTime()) ? rawIssueDate : new Date(rawIssueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })) : "22 Nov 2022";

  const rawExpiryDate = activePassport.expired_passport_date || m.expiredPassportDate || activePassport.expiredPassportDate || "2027-11-22";
  const passportExpiryDate = rawExpiryDate ? (isNaN(new Date(rawExpiryDate).getTime()) ? rawExpiryDate : new Date(rawExpiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })) : "22 Nov 2027";

  return {
    id: c.id || 1,
    name,
    avatar: m.avatar || "/sample-files/avatar.png",
    caseId: c.caseIdDisplay || c.caseNumber || `${c.id || 430}/2026`,
    cosRef: c.cosNumber || "COS 2026-00430",
    approvalStatus: c.case_status || "VISA APPROVED",
    visaStatus: "VISA ACTIVE",
    location: "IN UK",
    employer: c.group_name || "AX Studios",
    personalInfo: {
      fullName: name,
      firstName,
      lastName,
      gender: genderDisplay,
      dob: dobDisplay,
      maritalStatus: "Married",
      nationality: "United States",
      nationalityCode: "US",
      nationalityFlag: "🇺🇸",
      employer: c.group_name || "AX Studios",
      jobTitle: "Creative Worker",
      address: ["742 Evergreen Terrace", "Los Angeles, CA 90026"],
    },
    passport: {
      number: passportNumber,
      issueDate: passportIssueDate,
      expiryDate: passportExpiryDate,
    },
    cos: {
      status: "ASSIGNED",
      reference: c.cosNumber || "COS 2026-00430",
      salary: "£38,500 / year",
      startDate: "15 Mar 2026",
      socCode: "3416",
    },
    visa: {
      daysLeft: 325,
      totalDays: 365,
      startDate: "15 Mar 2026",
      endDate: "31 Mar 2027",
      renewalWindow: "Starts Jan 2027",
      visaType: "Creative Worker",
    },
    contact: {
      email: m.email || "taylor.j@email.com",
      phone: "+44 7700 123456",
      homeAddress: "742 Evergreen Terrace, Los Angeles, CA 90026",
      lastConfirmed: "Not yet verified",
    },
    emergencyContact: {
      name: "Morgan Johnson",
      relationship: "Spouse",
      phone: "+1 (555) 012-3456",
      email: "morgan.j@email.com",
    },
  };
}

export default function MigrantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = React.useState("Overview");
  const [migrant, setMigrant] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Modals
  const [isPersonalModalOpen, setIsPersonalModalOpen] = React.useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);
  const [isChangeStatusOpen, setIsChangeStatusOpen] = React.useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = React.useState(false);

  const loadMigrantDetail = React.useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      let migrantData: any = null;
      let caseData: any = null;
      
      try {
        migrantData = await apiClient.get<any>(ENDPOINTS.migrants.byId(id));
      } catch (e) {}

      try {
        caseData = await apiClient.get<any>(ENDPOINTS.cases.byId(id));
      } catch (e) {}
      
      const combined = {
        ...(caseData || {}),
        ...(migrantData || {}),
        migrant: migrantData || caseData?.migrant || caseData,
        id,
      };

      const detail = mapBackendMigrantToDetail(combined);
      setMigrant(detail);
    } catch (err) {
      console.error("Failed to load migrant details:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadMigrantDetail();
  }, [loadMigrantDetail]);

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px] text-neutral-500 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 mb-2"></div>
        <p className="text-paragraph-sm font-medium">Loading migrant profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans text-[#171717] select-none bg-[#F5F5F5] min-h-full overflow-x-hidden">
      {/* ====== HEADER ====== */}
      <div className="bg-white rounded-t-card flex flex-col shrink-0">
        <CaseHeader
          name={migrant.name}
          avatar={migrant.avatar}
          visaStatus={migrant.visaStatus}
          location={migrant.location}
          caseId={migrant.caseId}
          cosRef={migrant.cosRef}
          socCode={migrant.cos?.socCode}
          approvalStatus={migrant.approvalStatus}
          onBack={() => router.push("/migrants")}
          onChangeStatus={() => setIsChangeStatusOpen(true)}
          onAddNote={() => setIsAddNoteOpen(true)}
        />

        {/* ====== TAB MENU (Overview, Passport, Cases, UK Travel History) ====== */}
        <div className="px-[64px] flex items-center gap-2xl h-[50px] border-b border-[#EBEBEB]">
          {migrantTabs.map((tab) => {
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
          <div className="flex gap-[24px] items-start w-full font-sans select-none max-w-full">
            {/* COLUMN 1: Profile & Migration Status */}
            <div className="w-[303px] shrink-0 flex flex-col gap-[24px]">
              <ProfileCard
                name={migrant.name}
                initials={getInitials(migrant.name || "") || "TJ"}
                avatar={migrant.avatar}
                employer={migrant.employer}
                status={migrant.approvalStatus}
                onAddNote={() => setIsAddNoteOpen(true)}
              />
              <MigrationStatusCard location={migrant.location} visa={migrant.visa} />
              
              {/* Case status card */}
              <div className="flex flex-col gap-xs w-full">
                <div className="flex items-center justify-between">
                  <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">Case status</h2>
                  <span className="inline-flex items-center gap-xs h-4 px-2 bg-[#E3F7EC] text-[#0B4627] rounded-full text-[11px] font-medium uppercase tracking-[0.02em]">
                    <span className="size-1.5 rounded-full bg-[#1FC16B]" />
                    VISA APPROVED
                  </span>
                </div>
                <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] flex flex-col gap-3 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#5C5C5C]">Case ID</span>
                    <span className="text-[14px] font-mono text-[#171717]">{migrant.caseId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#5C5C5C]">Group</span>
                    <span className="text-[14px] font-medium text-[#171717]">{migrant.employer}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/cases/${id}`)}
                    className="mt-2 w-full h-9 bg-[#262626] hover:bg-[#171717] text-white rounded-[8px] text-[14px] font-medium transition-colors cursor-pointer border-0 flex items-center justify-center"
                  >
                    View case
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Personal Details & Address */}
            <div className="flex-1 min-w-0 flex flex-col gap-[24px]">
              {/* Personal Details */}
              <div className="flex flex-col gap-[12px] w-full">
                <div className="flex items-center justify-between h-[30px]">
                  <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">Personal details</h2>
                  <button
                    type="button"
                    onClick={() => setIsPersonalModalOpen(true)}
                    className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto"
                  >
                    Edit
                  </button>
                </div>
                <div className="bg-white border border-white rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full">
                  <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] w-full flex flex-col gap-[8px]">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[13px] font-normal text-[#5C5C5C]">First Name</span>
                      <span className="text-[14px] font-medium text-[#171717]">{migrant.personalInfo.firstName}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[13px] font-normal text-[#5C5C5C]">Last Name</span>
                      <span className="text-[14px] font-medium text-[#171717]">{migrant.personalInfo.lastName}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[13px] font-normal text-[#5C5C5C]">Date of Birth</span>
                      <span className="text-[14px] font-medium text-[#171717]">{migrant.personalInfo.dob}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[13px] font-normal text-[#5C5C5C]">Gender</span>
                      <span className="text-[14px] font-medium text-[#171717]">{migrant.personalInfo.gender}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[13px] font-normal text-[#5C5C5C]">Marital Status</span>
                      <span className="text-[14px] font-medium text-[#171717]">{migrant.personalInfo.maritalStatus}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[13px] font-normal text-[#5C5C5C]">Nationality</span>
                      <div className="flex items-center gap-1.5 font-medium text-[#171717]">
                        <Flag country={migrant.personalInfo.nationalityCode} className="size-4 rounded-full object-cover shrink-0" />
                        <span>{migrant.personalInfo.nationalityCode}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[13px] font-normal text-[#5C5C5C]">Country of Birth</span>
                      <div className="flex items-center gap-1.5 font-medium text-[#171717]">
                        <Flag country={migrant.personalInfo.countryOfBirthCode || migrant.personalInfo.nationalityCode} className="size-4 rounded-full object-cover shrink-0" />
                        <span>{migrant.personalInfo.countryOfBirthCode || migrant.personalInfo.nationalityCode}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[13px] font-normal text-[#5C5C5C]">City of Birth</span>
                      <span className="text-[14px] font-medium text-[#171717]">{migrant.personalInfo.cityOfBirth || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[13px] font-normal text-[#5C5C5C]">Passport Number</span>
                      <span className="text-[14px] font-medium text-[#171717] font-mono">{migrant.passport.number}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[13px] font-normal text-[#5C5C5C]">Passport Issue Date</span>
                      <span className="text-[14px] font-medium text-[#171717]">{migrant.passport.issueDate}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[13px] font-normal text-[#5C5C5C]">Passport Expiry Date</span>
                      <span className="text-[14px] font-medium text-[#171717]">{migrant.passport.expiryDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Home address */}
              <div className="flex flex-col gap-[12px] w-full">
                <div className="flex items-center justify-between h-[30px]">
                  <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">Home address</h2>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto"
                  >
                    Edit
                  </button>
                </div>
                <div className="bg-white border border-white rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full">
                  <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] w-full">
                    <span className="flex items-center gap-2 text-[14px] font-medium text-[#171717]">
                      <RiMapPinLine className="size-4 text-[#5C5C5C] shrink-0" />
                      {migrant.contact?.homeAddress || "No home address on file"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact details */}
              <div className="flex flex-col gap-[12px] w-full">
                <div className="flex items-center justify-between h-[30px]">
                  <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">Contact details</h2>
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(true)}
                    className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto"
                  >
                    Edit
                  </button>
                </div>
                <div className="bg-white border border-white rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full flex flex-col gap-1">
                  <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] w-full flex flex-col gap-2">
                    <span className="text-[12px] font-semibold text-[#171717] uppercase tracking-[0.04em]">PRIMARY CONTACT</span>
                    <div className="flex items-center justify-between py-1"><span className="text-[13px] text-[#5C5C5C]">Email</span><span className="text-[14px] font-medium text-[#171717]">{migrant.contact.email}</span></div>
                    <div className="flex items-center justify-between py-1"><span className="text-[13px] text-[#5C5C5C]">Phone</span><span className="text-[14px] font-medium text-[#171717]">{migrant.contact.phone}</span></div>
                    <div className="flex items-center justify-between py-1"><span className="text-[13px] text-[#5C5C5C]">Home Address</span><span className="text-[14px] font-medium text-[#171717]">{migrant.contact.homeAddress}</span></div>
                    <div className="flex items-center justify-between py-1"><span className="text-[13px] text-[#5C5C5C]">Last Confirmed</span><span className="text-[14px] font-medium text-[#A4A4A4]">{migrant.contact.lastConfirmed}</span></div>
                  </div>
                  <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] w-full flex flex-col gap-2">
                    <span className="text-[12px] font-semibold text-[#171717] uppercase tracking-[0.04em]">EMERGENCY CONTACT</span>
                    <div className="flex items-center justify-between py-1"><span className="text-[13px] text-[#5C5C5C]">Name</span><span className="text-[14px] font-medium text-[#171717]">{migrant.emergencyContact.name}</span></div>
                    <div className="flex items-center justify-between py-1"><span className="text-[13px] text-[#5C5C5C]">Relationship</span><span className="text-[14px] font-medium text-[#171717]">{migrant.emergencyContact.relationship}</span></div>
                    <div className="flex items-center justify-between py-1"><span className="text-[13px] text-[#5C5C5C]">Phone</span><span className="text-[14px] font-medium text-[#171717]">{migrant.emergencyContact.phone}</span></div>
                    <div className="flex items-center justify-between py-1"><span className="text-[13px] text-[#5C5C5C]">Email</span><span className="text-[14px] font-medium text-[#171717]">{migrant.emergencyContact.email}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Cases History */}
            <div className="w-[300px] shrink-0 flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[12px] w-full">
                <div className="flex items-center justify-between h-[30px]">
                  <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">Cases history</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("Cases")}
                    className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto"
                  >
                    View all
                  </button>
                </div>
                <div className="bg-white border border-white rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full">
                  <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] w-full flex items-center justify-between">
                    <span className="text-[13px] text-[#5C5C5C]">Case ID</span>
                    <span className="text-[14px] font-mono font-medium text-[#171717]">{migrant.caseId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Passport" ? (
          <PassportTab migrant={migrant} onEditPassport={() => setIsPersonalModalOpen(true)} />
        ) : activeTab === "Cases" ? (
          <CasesTab migrant={migrant} migrantId={id} />
        ) : (
          <TravelHistoryTab migrant={migrant} />
        )}
      </div>

      {/* Modals */}
      <ChangeCaseStatusModal
        open={isChangeStatusOpen}
        onOpenChange={setIsChangeStatusOpen}
        currentStatus={migrant.approvalStatus}
        onApply={(newStatus: string) => {
          setMigrant((prev: any) => ({ ...prev, approvalStatus: newStatus }));
          toast.success("Migrant status updated");
        }}
      />
      <AddNoteModal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        caseId={id}
        onNoteAdded={() => {
          toast.success("Note added to migrant profile");
          loadMigrantDetail();
        }}
      />
      <EditPersonalDetailsModal
        open={isPersonalModalOpen}
        onOpenChange={setIsPersonalModalOpen}
        migrantId={id}
        onSuccess={() => loadMigrantDetail()}
      />
      <EditHomeAddressModal
        open={isAddressModalOpen}
        onOpenChange={setIsAddressModalOpen}
        migrantId={id}
        onSuccess={() => loadMigrantDetail()}
      />
      <EditContactDetailsModal
        open={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
        migrantId={id}
        onSuccess={() => loadMigrantDetail()}
      />
    </div>
  );
}
