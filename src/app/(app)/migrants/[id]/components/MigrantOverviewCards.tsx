"use client";

import * as React from "react";
import { RiMapPin2Fill } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/ui/flag";
import { getStatusBadgeStyle } from "@/lib/utils";

// ====== 1. PROFILE CARD (Left Column Top) ======
interface MigrantProfileCardProps {
  name?: string;
  initials?: string;
  avatar?: string;
  employer?: string;
  status?: string;
}

export function MigrantProfileCard({
  name,
  initials,
  avatar,
  employer,
  status = "VISA ACTIVE",
}: MigrantProfileCardProps) {
  const [imgError, setImgError] = React.useState(false);
  const statusStyle = getStatusBadgeStyle(status || "VISA ACTIVE");
  const displayName = name || "—";
  const displayInitials = initials || "—";
  const displayEmployer = employer || "—";

  return (
    <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[32px_16px_24px] flex flex-col items-center shadow-[0px_1px_2px_rgba(10,13,20,0.03)] text-center w-full gap-[16px] shrink-0 font-sans select-none">
      {/* Avatar (80x80) */}
      {avatar && !imgError ? (
        <img
          src={avatar}
          alt={displayName}
          onError={() => setImgError(true)}
          className="size-[80px] rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="size-[80px] rounded-full bg-[#EBEBEB] text-[#171717] flex items-center justify-center font-medium text-[34px] tracking-[-0.015em] shrink-0 overflow-hidden select-none">
          {displayInitials}
        </div>
      )}

      {/* Name & Employer */}
      <div className="flex flex-col items-center gap-[4px]">
        <h3 className="font-aeonik-medium text-[24px] leading-[32px] font-medium text-[#171717]">
          {displayName}
        </h3>
        <span className="text-[14px] font-medium text-[#171717] leading-[20px]">
          {displayEmployer}
        </span>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-[4px] h-[20px] px-[8px] py-[2px] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] ${statusStyle.bg} ${statusStyle.text}`}>
        <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
        <span>{status || "VISA ACTIVE"}</span>
      </div>
    </div>
  );
}

// ====== 2. MIGRATION STATUS CARD (Left Column Middle) ======
interface MigrantMigrationStatusCardProps {
  location?: string;
  visa?: {
    daysLeft?: number;
    totalDays?: number;
    startDate?: string;
    endDate?: string;
    renewalWindow?: string;
    visaType?: string;
  };
}

export function MigrantMigrationStatusCard({
  location = "OUTSIDE UK",
  visa,
}: MigrantMigrationStatusCardProps) {
  const daysLeft = visa?.daysLeft ?? 0;
  const totalDays = visa?.totalDays ?? 0;
  const progressPercent =
    totalDays > 0 ? Math.min(100, Math.max(0, (daysLeft / totalDays) * 100)) : 0;

  return (
    <div className="flex flex-col gap-[12px] w-full font-sans select-none">
      {/* Header with Title + Location Badge */}
      <div className="flex items-center justify-between h-[30px]">
        <div className="flex items-center gap-[8px]">
          <h2 className="font-aeonik-medium text-[20px] leading-[32px] font-medium text-[#171717]">
            Migration status
          </h2>
          <span className="inline-flex items-center h-[16px] px-[8px] py-[2px] bg-[#EFEBFF] text-[#171717] rounded-full text-[11px] font-medium uppercase tracking-[0.02em]">
            {location || "OUTSIDE UK"}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex flex-col gap-[4px] w-full">
        {/* Visa Status & Days Left */}
        <div className="flex items-center justify-between h-[20px]">
          <span className="text-[14px] font-medium text-[#171717]">Visa Status</span>
          <span className="text-[14px] font-medium text-[#171717]">
            {daysLeft > 0 ? `${daysLeft}d left` : "0d left"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[6px] bg-[#EBEBEB] rounded-full overflow-hidden my-[8px]">
          <div
            className="h-full bg-[#7D52F4] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Start and End Dates */}
        <div className="flex items-center justify-between h-[20px]">
          <span className="text-[13px] font-normal text-[#5C5C5C]">{visa?.startDate || "—"}</span>
          <span className="text-[13px] font-normal text-[#5C5C5C] text-right">{visa?.endDate || "—"}</span>
        </div>

        {/* Renewal Window */}
        <div className="flex items-center justify-between py-[8px] mt-[4px] h-[36px]">
          <span className="text-[13px] font-normal text-[#5C5C5C]">Renewal Window</span>
          <span className="text-[14px] font-medium text-[#171717] text-right">
            {visa?.renewalWindow || "—"}
          </span>
        </div>

        {/* Visa Type */}
        <div className="flex items-center justify-between py-[8px] h-[36px]">
          <span className="text-[13px] font-normal text-[#5C5C5C]">Visa Type</span>
          <span className="text-[14px] font-medium text-[#171717] text-right">
            {visa?.visaType || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ====== 3. CASE STATUS CARD (Left Column Bottom) ======
interface MigrantCaseStatusCardProps {
  caseId?: string;
  employer?: string;
  status?: string;
  onViewCase?: () => void;
}

export function MigrantCaseStatusCard({
  caseId,
  employer,
  status = "PENDING",
  onViewCase,
}: MigrantCaseStatusCardProps) {
  const statusStyle = getStatusBadgeStyle(status || "PENDING");
  const displayEmployer = employer || "—";
  const employerInitial = employer && employer.trim().length > 0 ? employer.trim().charAt(0).toUpperCase() : "—";
  const formattedCaseId = caseId ? caseId.replace(/^#/, "") : "—";

  return (
    <div className="flex flex-col gap-[12px] w-full font-sans select-none">
      {/* Header with Title + Status Badge */}
      <div className="flex items-center justify-between h-[30px]">
        <div className="flex items-center gap-[8px]">
          <h2 className="font-aeonik-medium text-[20px] leading-[32px] font-medium text-[#171717]">
            Case status
          </h2>
          <span className={`inline-flex items-center gap-[4px] h-[20px] px-[8px] py-[2px] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`size-1.5 rounded-full ${statusStyle.dot}`} />
            <span>{status || "PENDING"}</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="bg-white border border-[#F5F5F5] rounded-[16px] p-[20px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex flex-col gap-[12px] w-full">
        {/* Case ID */}
        <div className="flex items-center justify-between py-[8px] h-[36px]">
          <span className="text-[13px] font-normal text-[#5C5C5C]">Case ID</span>
          <span className="text-[14px] font-mono font-medium text-[#171717] text-right">
            {formattedCaseId}
          </span>
        </div>

        {/* Group */}
        <div className="flex items-center justify-between py-[8px] h-[36px]">
          <span className="text-[13px] font-normal text-[#5C5C5C]">Group</span>
          <div className="flex items-center gap-[8px]">
            <div className="size-5 rounded-full bg-[#EBEBEB] text-[#171717] text-[12px] font-medium flex items-center justify-center shrink-0">
              {employerInitial}
            </div>
            <span className="text-[14px] font-medium text-[#171717] text-right">
              {displayEmployer}
            </span>
          </div>
        </div>

        {/* View Case Action Button */}
        <Button
          type="button"
          onClick={onViewCase}
          className="w-full h-[36px] bg-[#262626] hover:bg-[#171717] text-white rounded-[8px] text-[14px] font-medium flex items-center justify-center transition-colors cursor-pointer border-0 mt-[4px]"
        >
          View case
        </Button>
      </div>
    </div>
  );
}

// ====== 4. PERSONAL DETAILS CARD (Right Column Top) ======
interface MigrantPersonalDetailsCardProps {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    dob?: string;
    gender?: string;
    maritalStatus?: string;
    nationalityCode?: string;
    countryOfBirthCode?: string;
    cityOfBirth?: string;
  };
  passport?: {
    number?: string;
    issueDate?: string;
    expiryDate?: string;
  };
  onEdit?: () => void;
}

export function MigrantPersonalDetailsCard({
  personalInfo,
  passport,
  onEdit,
}: MigrantPersonalDetailsCardProps) {
  const natCode = personalInfo?.nationalityCode || "";
  const birthCountryCode = personalInfo?.countryOfBirthCode || natCode;

  const rows = [
    { label: "First Name", value: personalInfo?.firstName || "—" },
    { label: "Last Name", value: personalInfo?.lastName || "—" },
    { label: "Date of Birth", value: personalInfo?.dob || "—" },
    { label: "Gender", value: personalInfo?.gender || "—" },
    { label: "Marital Status", value: personalInfo?.maritalStatus || "—" },
    {
      label: "Nationality",
      custom: natCode && natCode !== "UN" ? (
        <div className="flex items-center gap-[6px] justify-end">
          <Flag country={natCode} className="size-5 rounded-full object-cover shrink-0" />
          <span className="text-[14px] font-medium text-[#171717]">{natCode}</span>
        </div>
      ) : (
        <span className="text-[14px] font-medium text-[#171717] text-right">—</span>
      ),
    },
    {
      label: "Country of Birth",
      custom: birthCountryCode && birthCountryCode !== "UN" ? (
        <div className="flex items-center gap-[6px] justify-end">
          <Flag country={birthCountryCode} className="size-5 rounded-full object-cover shrink-0" />
          <span className="text-[14px] font-medium text-[#171717]">{birthCountryCode}</span>
        </div>
      ) : (
        <span className="text-[14px] font-medium text-[#171717] text-right">—</span>
      ),
    },
    { label: "City of Birth", value: personalInfo?.cityOfBirth || "—" },
    { label: "Passport Number", value: passport?.number || "—", isMono: true },
    { label: "Passport Issue Date", value: passport?.issueDate || "—" },
    { label: "Passport Expiry Date", value: passport?.expiryDate || "—" },
  ];

  return (
    <div className="flex flex-col gap-[12px] w-full font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between h-[30px]">
        <h2 className="font-aeonik-medium text-[20px] leading-[32px] font-medium text-[#171717]">
          Personal details
        </h2>
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            onClick={onEdit}
            className="p-0 h-auto text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer bg-transparent border-0"
          >
            Edit
          </Button>
        )}
      </div>

      {/* Widget Card */}
      <div className="bg-white border border-white rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full">
        <div className="bg-[#F7F7F7] rounded-[16px] p-[8px_20px_16px] flex flex-col gap-[2px] w-full">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-[8px] h-[36px]"
            >
              <span className="text-[13px] font-normal text-[#5C5C5C]">{row.label}</span>
              {row.custom ? (
                row.custom
              ) : (
                <span
                  className={`text-[14px] font-medium text-[#171717] text-right ${
                    row.isMono ? "font-mono" : ""
                  }`}
                >
                  {row.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== 5. HOME ADDRESS CARD (Right Column Middle) ======
interface MigrantHomeAddressCardProps {
  address?: string | string[];
  onEdit?: () => void;
}

export function MigrantHomeAddressCard({
  address,
  onEdit,
}: MigrantHomeAddressCardProps) {
  const formattedAddress = Array.isArray(address)
    ? address.filter(Boolean).join("\n")
    : address || "";

  return (
    <div className="flex flex-col gap-[12px] w-full font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between h-[30px]">
        <h2 className="font-aeonik-medium text-[20px] leading-[32px] font-medium text-[#171717]">
          Home address
        </h2>
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            onClick={onEdit}
            className="p-0 h-auto text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer bg-transparent border-0"
          >
            Edit
          </Button>
        )}
      </div>

      {/* Widget Card */}
      <div className="bg-white border border-white rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full">
        <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] flex items-start gap-[8px] w-full">
          <RiMapPin2Fill className="size-5 text-[#171717] shrink-0 mt-[2px]" />
          <div className="text-[14px] font-medium text-[#171717] leading-[20px] whitespace-pre-line flex-1">
            {formattedAddress || "No home address on file"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== 6. CONTACT DETAILS CARD (Right Column Bottom) ======
interface MigrantContactDetailsCardProps {
  contact?: {
    email?: string;
    phone?: string;
    lastConfirmed?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  onEdit?: () => void;
}

export function MigrantContactDetailsCard({
  contact,
  emergencyContact,
  onEdit,
}: MigrantContactDetailsCardProps) {
  return (
    <div className="flex flex-col gap-[12px] w-full font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between h-[30px]">
        <h2 className="font-aeonik-medium text-[20px] leading-[32px] font-medium text-[#171717]">
          Contact details
        </h2>
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            onClick={onEdit}
            className="p-0 h-auto text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer bg-transparent border-0"
          >
            Edit
          </Button>
        )}
      </div>

      {/* Widget Card (Two blocks) */}
      <div className="bg-white border border-white rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] flex flex-col gap-[4px] w-full">
        {/* Primary Contact Block */}
        <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] flex flex-col gap-[2px] w-full">
          <span className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.04em] mb-[6px]">
            PRIMARY CONTACT
          </span>
          <div className="flex items-center justify-between py-[8px] h-[36px]">
            <span className="text-[13px] font-normal text-[#5C5C5C]">Email</span>
            <span className="text-[14px] font-medium text-[#171717] text-right">
              {contact?.email || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-[8px] h-[36px]">
            <span className="text-[13px] font-normal text-[#5C5C5C]">Phone</span>
            <span className="text-[14px] font-medium text-[#171717] text-right">
              {contact?.phone || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-[8px] h-[36px]">
            <span className="text-[13px] font-normal text-[#7B7B7B]">Last Confirmed</span>
            <span className="text-[14px] font-medium text-[#A4A4A4] text-right">
              {contact?.lastConfirmed || "Not yet verified"}
            </span>
          </div>
        </div>

        {/* Emergency Contact Block */}
        <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] flex flex-col gap-[2px] w-full">
          <span className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.04em] mb-[6px]">
            EMERGENCY CONTACT
          </span>
          <div className="flex items-center justify-between py-[8px] h-[36px]">
            <span className="text-[13px] font-normal text-[#5C5C5C]">Name</span>
            <span className="text-[14px] font-medium text-[#171717] text-right">
              {emergencyContact?.name || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-[8px] h-[36px]">
            <span className="text-[13px] font-normal text-[#5C5C5C]">Relationship</span>
            <span className="text-[14px] font-medium text-[#171717] text-right">
              {emergencyContact?.relationship || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-[8px] h-[36px]">
            <span className="text-[13px] font-normal text-[#5C5C5C]">Phone</span>
            <span className="text-[14px] font-medium text-[#171717] text-right">
              {emergencyContact?.phone || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-[8px] h-[36px]">
            <span className="text-[13px] font-normal text-[#5C5C5C]">Email</span>
            <span className="text-[14px] font-medium text-[#171717] text-right">
              {emergencyContact?.email || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
