"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  RiLayoutMasonryLine,
  RiLayoutMasonryFill,
  RiPassportLine,
  RiPassportFill,
  RiFoldersLine,
  RiFoldersFill,
  RiSuitcase2Line,
  RiSuitcase2Fill,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { formatFullName, getInitials } from "@/lib/utils";
import { getCountryInfo } from "@/lib/country";
import { toast } from "sonner";
import { MigrantHeader } from "./components/MigrantHeader";
import {
  MigrantProfileCard,
  MigrantMigrationStatusCard,
  MigrantCaseStatusCard,
  MigrantPersonalDetailsCard,
  MigrantHomeAddressCard,
  MigrantContactDetailsCard,
} from "./components/MigrantOverviewCards";
import { PassportTab } from "@/app/(app)/cases/[id]/components/PassportTab";
import { CasesTab } from "@/app/(app)/cases/[id]/components/CasesTab";
import { TravelHistoryTab } from "@/app/(app)/cases/[id]/components/TravelHistoryTab";
import { EditPersonalDetailsModal } from "@/app/(app)/cases/components/EditPersonalDetailsModal";
import { EditHomeAddressModal } from "@/app/(app)/cases/components/EditHomeAddressModal";
import { EditContactDetailsModal } from "@/app/(app)/cases/components/EditContactDetailsModal";
import { ChangeCaseStatusModal } from "@/app/(app)/cases/components/ChangeCaseStatusModal";
import { AddNoteModal } from "@/app/(app)/cases/components/AddNoteModal";
import { ArchiveCaseModal } from "@/app/(app)/cases/components/ArchiveCaseModal";
import { DeleteCaseModal } from "@/app/(app)/cases/components/DeleteCaseModal";
import { SmartUploadModal } from "@/app/(app)/cases/components/SmartUploadModal";
import { Button } from "@/components/ui/button";

const migrantTabs = [
  { label: "Overview", iconLine: RiLayoutMasonryLine, iconFill: RiLayoutMasonryFill },
  { label: "Passport", iconLine: RiPassportLine, iconFill: RiPassportFill },
  { label: "Cases", iconLine: RiFoldersLine, iconFill: RiFoldersFill },
  { label: "Travel History", iconLine: RiSuitcase2Line, iconFill: RiSuitcase2Fill },
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
  const pInfo = m.personalInfo || m.user?.personalInfo || c.personalInfo || c.user?.personalInfo || {};
  const activePassport = Array.isArray(m.passports)
    ? m.passports.find((p: any) => p.is_actual) || m.passports[0] || {}
    : m.passport || {};

  const rawFirstName =
    m.first_name ||
    pInfo.firstName ||
    pInfo.first_name ||
    m.firstName ||
    c.first_name ||
    c.firstName ||
    c.migrant?.firstName ||
    c.migrant?.first_name ||
    "";
  const rawLastName =
    m.last_name ||
    pInfo.lastName ||
    pInfo.last_name ||
    m.lastName ||
    c.last_name ||
    c.lastName ||
    c.migrant?.lastName ||
    c.migrant?.last_name ||
    "";
  const { firstName, lastName } = sanitizeFirstAndLastName(rawFirstName, rawLastName);
  const name =
    formatFullName(firstName, lastName) ||
    c.name ||
    m.name ||
    m.stage_name ||
    m.stageName ||
    c.stage_name ||
    c.stageName ||
    "Unknown Migrant";

  const rawGender =
    m.gender ||
    m.sex ||
    pInfo.sex ||
    pInfo.gender ||
    c.gender ||
    c.personal?.gender ||
    c.personal?.sex ||
    "";
  const genderDisplay = rawGender
    ? rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase()
    : "—";

  const rawDob =
    m.date_of_birth ||
    m.dateOfBirth ||
    m.dob ||
    pInfo.dateOfBirth ||
    pInfo.date_of_birth ||
    pInfo.dob ||
    c.date_of_birth ||
    c.dateOfBirth ||
    "";
  const dobDisplay = rawDob
    ? isNaN(new Date(rawDob).getTime())
      ? rawDob
      : new Date(rawDob).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
    : "—";

  const passportNumber =
    activePassport.passport_number ||
    m.passportNumber ||
    activePassport.passportNumber ||
    "";
  const rawIssueDate =
    activePassport.issue_passport_date ||
    m.issuePassportDate ||
    activePassport.issuePassportDate ||
    "";
  const passportIssueDate = rawIssueDate
    ? isNaN(new Date(rawIssueDate).getTime())
      ? rawIssueDate
      : new Date(rawIssueDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
    : "—";

  const rawExpiryDate =
    activePassport.expired_passport_date ||
    m.expiredPassportDate ||
    activePassport.expiredPassportDate ||
    "";
  const passportExpiryDate = rawExpiryDate
    ? isNaN(new Date(rawExpiryDate).getTime())
      ? rawExpiryDate
      : new Date(rawExpiryDate).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
    : "—";

  const rawNationality =
    m.nationality_value ||
    m.nationality?.value ||
    m.nationality?.name ||
    m.nationality?.title ||
    pInfo.nationality?.name ||
    pInfo.nationality?.value ||
    pInfo.nationality?.title ||
    pInfo.nationalityCode ||
    (typeof m.nationality === "string" ? m.nationality : "") ||
    c.nationality_value ||
    c.nationality_title ||
    c.country ||
    "";
  const { code: nationalityCode, full: nationalityFull, flag: nationalityFlag } =
    getCountryInfo(rawNationality);

  const rawCountryOfBirth =
    pInfo.countryOfBirth ||
    pInfo.country_of_birth ||
    m.country_of_birth ||
    c.country_of_birth ||
    "";
  const { code: countryOfBirthCode } = getCountryInfo(rawCountryOfBirth);

  const rawCityOfBirth =
    pInfo.cityOfBirth ||
    pInfo.city_of_birth ||
    m.city_of_birth ||
    c.city_of_birth ||
    m.place_of_birth ||
    "";

  // Location
  let location = "OUTSIDE UK";
  if (c.flightEntered?.isEntered || m.flightEntered?.isEntered) {
    location = "IN UK";
  }

  // Visa Status & Calculation
  let visaStatus = "VISA INACTIVE";
  const visaStartDate = c.decision?.granted?.visaStartDate || c.flightVisa?.visaStartDate || c.visaStartDate;
  const visaEndDate = c.decision?.granted?.visaEndDate || c.flightVisa?.visaEndDate || c.visaEndDate;

  let daysLeft = 0;
  let totalDays = 0;

  if (visaEndDate) {
    const end = new Date(visaEndDate);
    if (end > new Date()) {
      visaStatus = "VISA ACTIVE";
    }
    if (visaStartDate) {
      const start = new Date(visaStartDate);
      totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    daysLeft = Math.max(0, Math.ceil((end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
  }

  // Renewal Window
  let renewalWindow = "—";
  if (visaEndDate) {
    const end = new Date(visaEndDate);
    if (!isNaN(end.getTime())) {
      const renewalDate = new Date(end);
      renewalDate.setMonth(renewalDate.getMonth() - 2);
      renewalWindow = `Starts ${renewalDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
    }
  }

  // Case & Approval Status
  let approvalStatus = "PENDING";
  if (c.decision?.id === "Granted") {
    approvalStatus = "VISA APPROVED";
  } else if (c.decision?.id === "Refused") {
    approvalStatus = "VISA REFUSED";
  } else if (c.case_status || c.status) {
    const s = (c.case_status || c.status).toUpperCase().replace(/_/g, " ");
    if (s.includes("APPROVED") || s.includes("GRANTED")) approvalStatus = "VISA APPROVED";
    else if (s.includes("REFUSED")) approvalStatus = "VISA REFUSED";
    else approvalStatus = s;
  }

  // Employer / Group
  const employer = c.personal?.groupName || c.group_name || c.employer || m.employer || m.group_name || m.lead?.group?.name || "—";

  // Case ID & CoS
  const caseIdDisplay = c.caseIdNumber && c.relatedYear
    ? `${c.caseIdNumber}/${c.relatedYear}`
    : c.caseIdDisplay || c.caseNumber || (c.id ? `${c.id}` : "—");

  const cosRef = c.cosStatus?.assigned?.cosNumber || c.cosNumber || c.cosReference || m.cases?.[0]?.cosNumber || "";
  const socCode = c.personal?.jobSocCode || c.personal?.socCode || c.socCode || m.cases?.[0]?.jobSocCode || "";
  const jobTitle = c.personal?.jobTitle || c.category?.name || c.visaType || m.cases?.[0]?.jobTitle || m.jobTitle || "";

  // Address
  const addressLine1 = m.contacts?.address_line_1 || "";
  const addressLine2 = m.contacts?.address_line_2 || "";
  const cityName = m.contacts?.city?.name || m.contacts?.city || "";
  const stateName = m.contacts?.state?.name || m.contacts?.state || "";
  const zipCode = m.contacts?.zip_code || "";
  const countryName = m.contacts?.country?.name || m.contacts?.country || "";

  const addressLines = [
    addressLine1,
    addressLine2,
    [cityName, stateName, zipCode].filter(Boolean).join(" ").trim(),
    countryName,
  ].filter(Boolean);

  const fullHomeAddress = addressLines.length > 0 ? addressLines.join("\n") : "";

  // Emergency contact from database object
  const realMigrantId = c.migrant?.id || c.migrant_id || m.id || c.id || "";
  const migrantIdStr = String(realMigrantId);
  const ec = m.emergencyContact || m.contacts?.emergency_contact || m.emergency_contact || m.contacts || {};
  const emergency = {
    name: ec.name || ec.emergency_contact_name || "",
    relationship: ec.relationship || ec.emergency_contact_relationship || "",
    phone: ec.phone || ec.emergency_contact_phone || "",
    email: ec.email || ec.emergency_contact_email || "",
  };

  return {
    id: m.id || c.id || 1,
    migrantId: migrantIdStr,
    caseNumericId: c.id,
    name,
    avatar: m.avatar || m.photo_url || pInfo.avatars?.[0]?.url || "",
    avatarText: getInitials(name) || "—",
    caseId: caseIdDisplay,
    cosRef,
    approvalStatus,
    visaStatus,
    location,
    employer,
    personalInfo: {
      fullName: name,
      firstName,
      lastName,
      gender: genderDisplay,
      dob: dobDisplay,
      maritalStatus: m.marital_status || m.maritalStatus || pInfo.maritalStatus || "—",
      nationality: nationalityFull,
      nationalityCode: nationalityCode,
      nationalityFlag: nationalityFlag,
      countryOfBirthCode:
        countryOfBirthCode && countryOfBirthCode !== "UN" ? countryOfBirthCode : nationalityCode,
      cityOfBirth: rawCityOfBirth || "—",
      employer,
      jobTitle: jobTitle || "—",
      address: addressLines,
    },
    passport: {
      number: passportNumber || "—",
      issueDate: passportIssueDate,
      expiryDate: passportExpiryDate,
    },
    cos: {
      status: c.cosStatus?.id || (approvalStatus === "VISA APPROVED" ? "ASSIGNED" : "DRAFT"),
      reference: cosRef,
      salary: c.personal?.jobPay ? `$${c.personal.jobPay}` : "",
      startDate: visaStartDate ? new Date(visaStartDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "",
      socCode,
      jobTitle,
    },
    visa: {
      daysLeft,
      totalDays: totalDays || 0,
      startDate: visaStartDate ? new Date(visaStartDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
      endDate: visaEndDate ? new Date(visaEndDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—",
      renewalWindow,
      visaType: c.personal?.visaType || c.visaType || c.category?.name || "—",
    },
    contact: {
      email: m.user?.email || m.contacts?.contact_email || m.email || "—",
      phone: m.contacts?.phone_1 || m.phone || "—",
      homeAddress: fullHomeAddress,
      lastConfirmed: m.contacts?.lastConfirmed || "Not yet verified",
    },
    emergencyContact: {
      name: emergency.name || "—",
      relationship: emergency.relationship || "—",
      phone: emergency.phone || "—",
      email: emergency.email || "—",
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
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);

  const loadMigrantDetail = React.useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      let migrantData: any = null;
      let caseData: any = null;

      // 1. Try fetching as Case first
      try {
        const caseRes = await apiClient.get<any>(ENDPOINTS.cases.byId(id));
        if (caseRes && (caseRes.id || caseRes.caseNumber || caseRes.migrant || caseRes.personal)) {
          caseData = caseRes;
        }
      } catch (e: any) {
        const status = e?.status || e?.response?.status;
        if (status && status !== 404 && status !== 400) {
          throw e;
        }
      }

      if (caseData) {
        // ID is a Case ID: lookup the linked migrant ID specifically
        const linkedMigrantId = caseData.migrant?.id || caseData.migrant_id || caseData.migrantId;
        if (linkedMigrantId) {
          try {
            migrantData = await apiClient.get<any>(ENDPOINTS.migrants.byId(linkedMigrantId));
          } catch (e) {}
        }
      } else {
        // ID is a Migrant ID
        try {
          migrantData = await apiClient.get<any>(ENDPOINTS.migrants.byId(id));
        } catch (e) {}

        if (migrantData) {
          try {
            const casesRes = await apiClient.get<any>(`${ENDPOINTS.cases.base}?migrant_id=${id}`);
            const casesArr = Array.isArray(casesRes) ? casesRes : casesRes?.data || [];
            if (casesArr.length > 0) {
              caseData = casesArr[0];
            }
          } catch (e) {}

          if (!caseData && Array.isArray(migrantData.cases) && migrantData.cases.length > 0) {
            caseData = migrantData.cases[0];
          }
        }
      }

      const combined = {
        ...(caseData || {}),
        migrant: {
          ...(caseData?.migrant || {}),
          ...(migrantData || {}),
        },
        id,
      };

      const detail = mapBackendMigrantToDetail(combined);
      setMigrant(detail);
    } catch (err) {
      console.error("Failed to load migrant details:", err);
      toast.error("Failed to load migrant details");
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

  if (!migrant) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px] text-neutral-500 font-sans gap-3">
        <p className="text-paragraph-sm font-medium">Migrant profile not found.</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/migrants")}
        >
          Back to Migrants
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans text-[#171717] select-none bg-[#F5F5F5] min-h-full overflow-x-hidden">
      {/* ====== HEADER ====== */}
      <div className="bg-white rounded-t-[16px] flex flex-col shrink-0">
        <MigrantHeader
          name={migrant.name}
          avatar={migrant.avatar}
          caseId={migrant.caseId}
          cosRef={migrant.cosRef}
          socCode={migrant.cos?.socCode}
          jobTitle={migrant.cos?.jobTitle}
          approvalStatus={migrant.approvalStatus}
          onBack={() => router.push("/migrants")}
          onEditHeader={() => setIsPersonalModalOpen(true)}
          onChangeStatus={() => setIsChangeStatusOpen(true)}
          onAddNote={() => setIsAddNoteOpen(true)}
          onUpload={() => setIsUploadOpen(true)}
          onArchive={() => setIsArchiveOpen(true)}
          onDelete={() => setIsDeleteOpen(true)}
        />

        {/* ====== TAB MENU (Overview, Passport, Cases, Travel History) ====== */}
        <div className="px-[64px] flex items-center gap-[24px] h-[50px] border-b border-[#EBEBEB]">
          {migrantTabs.map((tab) => {
            const isActive = activeTab === tab.label;
            const IconComponent = isActive ? tab.iconFill : tab.iconLine;
            return (
              <Button
                key={tab.label}
                variant="ghost"
                onClick={() => setActiveTab(tab.label)}
                className={`relative h-full flex items-center gap-[6px] text-[14px] font-medium tracking-[-0.006em] transition-all cursor-pointer rounded-none bg-transparent border-none px-0 pb-0 pt-0 hover:bg-transparent ${
                  isActive
                    ? "text-[#171717]"
                    : "text-[#5C5C5C] hover:text-[#171717]"
                }`}
              >
                <IconComponent className="size-5" />
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#171717]" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* ====== CONTENT AREA ====== */}
      <div className="flex-1 px-[64px] py-[32px] max-w-full overflow-x-hidden">
        {activeTab === "Overview" ? (
          <div className="flex gap-[24px] items-start w-full font-sans select-none max-w-full">
            {/* COLUMN 1: Profile, Migration Status, Case Status (width: 303px) */}
            <div className="w-[303px] shrink-0 flex flex-col gap-[24px]">
              <MigrantProfileCard
                name={migrant.name}
                initials={migrant.avatarText}
                avatar={migrant.avatar}
                employer={migrant.employer}
                status={migrant.visaStatus}
              />

              <MigrantMigrationStatusCard
                location={migrant.location}
                visa={migrant.visa}
              />

              <MigrantCaseStatusCard
                caseId={migrant.caseId}
                employer={migrant.employer}
                status={migrant.approvalStatus}
                onViewCase={() => router.push(`/cases/${migrant.caseNumericId || id}`)}
              />
            </div>

            {/* COLUMN 2: Personal Details, Home Address, Contact Details (flex-1) */}
            <div className="flex-1 min-w-0 flex flex-col gap-[24px]">
              <MigrantPersonalDetailsCard
                personalInfo={migrant.personalInfo}
                passport={migrant.passport}
                onEdit={() => setIsPersonalModalOpen(true)}
              />

              <MigrantHomeAddressCard
                address={migrant.contact?.homeAddress}
                onEdit={() => setIsAddressModalOpen(true)}
              />

              <MigrantContactDetailsCard
                contact={migrant.contact}
                emergencyContact={migrant.emergencyContact}
                onEdit={() => setIsContactModalOpen(true)}
              />
            </div>
          </div>
        ) : activeTab === "Passport" ? (
          <PassportTab
            migrant={migrant}
            onEditPassport={() => setIsPersonalModalOpen(true)}
            onPassportUploaded={() => loadMigrantDetail()}
          />
        ) : activeTab === "Cases" ? (
          <CasesTab migrant={migrant} migrantId={migrant.migrantId || id} />
        ) : (
          <TravelHistoryTab migrant={migrant} migrantId={migrant.migrantId || id} />
        )}
      </div>

      {/* Modals */}
      <ChangeCaseStatusModal
        open={isChangeStatusOpen}
        onOpenChange={setIsChangeStatusOpen}
        currentStatus={migrant.approvalStatus}
        onApply={async (newStatus: string) => {
          try {
            if (!id) {
              toast.error("Invalid migrant ID");
              return;
            }
            let success = false;
            try {
              await apiClient.patch(ENDPOINTS.cases.byId(id), {
                case_status: newStatus,
                status: newStatus,
              });
              success = true;
            } catch (caseErr: unknown) {
              console.error("Initial case endpoint update failed:", caseErr);
              const statusCode =
                typeof caseErr === "object" && caseErr !== null
                  ? (caseErr as { status?: number; response?: { status?: number } })
                      .status ||
                    (caseErr as { status?: number; response?: { status?: number } })
                      .response?.status
                  : undefined;
              if (statusCode === 404 || statusCode === 405) {
                await apiClient.patch(ENDPOINTS.migrants.byId(migrant.migrantId || id), {
                  case_status: newStatus,
                  status: newStatus,
                });
                success = true;
              } else {
                throw caseErr;
              }
            }
            if (success) {
              toast.success("Migrant status updated successfully");
              loadMigrantDetail();
            }
          } catch (err: unknown) {
            console.error("Failed to update status:", err);
            const message =
              err instanceof Error ? err.message : "Failed to update status";
            toast.error(message);
          }
        }}
      />
      <AddNoteModal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        caseId={migrant.caseNumericId || id}
        onNoteAdded={() => {
          toast.success("Note added to migrant profile");
          loadMigrantDetail();
        }}
      />
      <EditPersonalDetailsModal
        open={isPersonalModalOpen}
        onOpenChange={setIsPersonalModalOpen}
        migrantId={migrant.migrantId || id}
        initialData={migrant}
        onSuccess={() => loadMigrantDetail()}
      />
      <EditHomeAddressModal
        open={isAddressModalOpen}
        onOpenChange={setIsAddressModalOpen}
        migrantId={migrant.migrantId || id}
        initialData={migrant}
        onSuccess={() => loadMigrantDetail()}
      />
      <EditContactDetailsModal
        open={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
        migrantId={migrant.migrantId || id}
        initialData={migrant}
        onSuccess={() => loadMigrantDetail()}
      />
      <ArchiveCaseModal
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        caseInfo={{
          caseId: migrant.caseId,
          name: migrant.name,
          avatarText: migrant.avatarText,
          avatarUrl: migrant.avatar,
        }}
        onConfirm={async () => {
          try {
            const targetId = migrant?.migrantId || id;
            if (!targetId) return;
            let success = false;
            try {
              await apiClient.delete(ENDPOINTS.cases.toArchive, {
                data: { data: [{ id: targetId }] },
              });
              success = true;
            } catch (e) {
              await apiClient.delete(`${ENDPOINTS.migrants.base}/to-archive`, {
                data: { data: [{ id: targetId }] },
              });
              success = true;
            }
            if (success) {
              toast.success("Migrant profile archived");
              router.push("/migrants");
            }
          } catch (e) {
            console.error("Failed to archive migrant:", e);
            toast.error("Failed to archive migrant");
          }
        }}
      />
      <DeleteCaseModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        caseInfo={{
          caseId: migrant.caseId,
          name: migrant.name,
          avatarText: migrant.avatarText,
          avatarUrl: migrant.avatar,
        }}
        onConfirm={async () => {
          try {
            const targetId = migrant?.migrantId || id;
            if (!targetId) return;
            let success = false;
            try {
              await apiClient.delete(ENDPOINTS.cases.archive, {
                data: { data: [{ id: targetId }] },
              });
              success = true;
            } catch (e) {
              await apiClient.delete(`${ENDPOINTS.migrants.base}/archive`, {
                data: { data: [{ id: targetId }] },
              });
              success = true;
            }
            if (success) {
              toast.success("Migrant profile deleted");
              router.push("/migrants");
            }
          } catch (e) {
            console.error("Failed to delete migrant:", e);
            toast.error("Failed to delete migrant");
          }
        }}
      />
      <SmartUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload migrant documents"
        onUploadSuccess={async (files: File[]) => {
          try {
            const formData = new FormData();
            files.forEach((f: File) => formData.append("files", f));
            formData.append("migrant_id", migrant?.migrantId || id);
            await apiClient.post(ENDPOINTS.files.upload, formData);
            toast.success("Documents uploaded successfully");
            loadMigrantDetail();
          } catch (e) {
            console.error("Failed to upload files:", e);
            toast.error("Failed to upload documents");
          }
        }}
      />
    </div>
  );
}
