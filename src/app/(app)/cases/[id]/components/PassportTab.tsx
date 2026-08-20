"use client";

import * as React from "react";
import {
  RiDownloadLine,
  RiEyeLine,
  RiFile3Fill,
} from "@remixicon/react";
import { Flag } from "@/components/ui/flag";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { FilePreviewModal } from "../../components/FilePreviewModal";

interface PassportTabProps {
  migrant?: any;
  onEditPassport?: () => void;
}

export function PassportTab({ migrant, onEditPassport }: PassportTabProps) {
  const [imgError, setImgError] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const surname = migrant?.personalInfo?.lastName || migrant?.passport?.surname || "—";
  const givenNames = migrant?.personalInfo?.firstName || migrant?.passport?.givenNames || "—";
  const fullName = migrant?.name || (surname !== "—" || givenNames !== "—" ? `${givenNames} ${surname}`.trim() : "—");
  const nationality = migrant?.personalInfo?.country || migrant?.personalInfo?.nationality || "—";
  const nationalityCode = migrant?.personalInfo?.nationalityCode || "";
  const dob = migrant?.personalInfo?.dob || "—";
  const gender = migrant?.personalInfo?.gender || "—";
  const genderShort = gender !== "—" ? gender.charAt(0).toUpperCase() : "—";
  const maritalStatus = migrant?.personalInfo?.maritalStatus || "—";
  const placeOfBirth = migrant?.personalInfo?.placeOfBirth || migrant?.personalInfo?.countryOfBirth || "—";
  const cityOfBirth = migrant?.personalInfo?.cityOfBirth || "—";
  const passportNumber = migrant?.passport?.number || "—";
  const issueDate = migrant?.passport?.issueDate || "—";
  const expiryDate = migrant?.passport?.expiryDate || "—";
  const issuingAuthority = migrant?.passport?.issuingAuthority || "—";
  const avatar = migrant?.avatar;

  const mrzCode = passportNumber !== "—"
    ? `P<USA${(surname !== "—" ? surname : "DOE").toUpperCase()}<<${(givenNames !== "—" ? givenNames : "JOHN").toUpperCase()}<<<<<<<<<<<<<<<<<< ${passportNumber}USA9006145M2711225<<<<<<<<<<<<<<04`
    : "—";

  const daysLeft = React.useMemo(() => {
    if (!expiryDate || expiryDate === "—") return null;
    const expTime = new Date(expiryDate).getTime();
    if (isNaN(expTime)) return null;
    return Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24));
  }, [expiryDate]);

  const progressPercent = React.useMemo(() => {
    if (!issueDate || !expiryDate || issueDate === "—" || expiryDate === "—") return 50;
    const start = new Date(issueDate).getTime();
    const end = new Date(expiryDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return 50;
    const total = end - start;
    const elapsed = Date.now() - start;
    const pct = Math.min(100, Math.max(0, ((end - Date.now()) / total) * 100));
    return Math.round(pct);
  }, [issueDate, expiryDate]);

  return (
    <div className="flex gap-[24px] items-start w-full font-sans select-none max-w-full">
      {/* LEFT COLUMN: Passport Visual Card & File Action Card (634px) */}
      <div className="w-[634px] shrink-0 flex flex-col gap-[16px]">
        {/* Dark Passport Card (Frame 2087326806) */}
        <div className="w-full bg-[#262626] rounded-[16px] p-[32px_40px_26px] flex flex-col gap-[28px] text-white shadow-card-large">
          {/* Header text */}
          <div className="flex flex-col gap-[4px]">
            <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
              {nationality !== "—" ? nationality.toUpperCase() : "UNITED STATES OF AMERICA"}
            </span>
            <h2 className="font-aeonik-medium text-[20px] leading-[32px] text-white">
              Passport
            </h2>
          </div>

          {/* Photo & Name Section */}
          <div className="flex items-start gap-[24px]">
            {/* Passport Photo */}
            <div className="w-[126px] h-[148px] rounded-[16px] overflow-hidden bg-neutral-800 shrink-0 border border-white/10 flex items-center justify-center">
              {avatar && !imgError ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-[24px] font-medium text-white/70">
                  {getInitials(fullName !== "—" ? fullName : "")}
                </span>
              )}
            </div>

            {/* Names Stack */}
            <div className="flex flex-col gap-[20px] pt-1">
              <div className="flex flex-col gap-[2px]">
                <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
                  SURNAME
                </span>
                <span className="font-aeonik-medium text-[20px] leading-[28px] text-white">
                  {surname}
                </span>
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
                  GIVEN NAMES
                </span>
                <span className="font-aeonik-medium text-[20px] leading-[28px] text-white">
                  {givenNames}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="flex flex-col gap-[20px]">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-[24px]">
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
                  NATIONALITY
                </span>
                <span className="text-[14px] font-medium text-white">
                  {nationality}
                </span>
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
                  DATE OF BIRTH
                </span>
                <span className="text-[14px] font-medium text-white">
                  {dob}
                </span>
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
                  GENDER
                </span>
                <span className="text-[14px] font-medium text-white">
                  {genderShort}
                </span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-[24px]">
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
                  PLACE OF BIRTH
                </span>
                <div className="flex items-center gap-[6px]">
                  <Flag country={nationalityCode} className="size-4 rounded-full object-cover shrink-0" />
                  <span className="text-[14px] font-medium text-white">
                    {placeOfBirth}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
                  DATE OF ISSUE
                </span>
                <span className="text-[14px] font-medium text-white">
                  {issueDate}
                </span>
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
                  DATE OF EXPIRY
                </span>
                <span className="text-[14px] font-medium text-white">
                  {expiryDate}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-white/10 my-0.5" />

          {/* MRZ Code */}
          <div className="font-mono text-[12px] leading-[16px] text-white/40 tracking-[0.04em] uppercase break-all">
            {mrzCode}
          </div>
        </div>

        {/* Passport File Card Row */}
        <div className="w-full h-[72px] bg-white border border-[#F5F5F5] rounded-[16px] p-[4px_24px_4px_4px] flex items-center justify-between shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
              <RiFile3Fill className="size-5 text-[#5C5C5C]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-medium text-[#171717] leading-[20px]">
                Passport Document
              </span>
              <span className="text-[13px] font-normal text-[#5C5C5C] leading-[20px]">
                PDF Document · Passport Copy
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsPreviewOpen(true)}
              aria-label="Download passport document"
              className="size-10 bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-[10px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors border-0 cursor-pointer p-0"
              title="Download passport document"
            >
              <RiDownloadLine className="size-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsPreviewOpen(true)}
              aria-label="Preview passport document"
              className="h-10 px-3.5 bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-[10px] flex items-center gap-1.5 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors border-0 cursor-pointer"
            >
              <RiEyeLine className="size-5" />
              <span>Preview</span>
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Passport Details & Validity Widgets (444px) */}
      <div className="w-[444px] shrink-0 flex flex-col gap-[24px]">
        {/* Passport details Widget */}
        <div className="flex flex-col gap-[12px] w-full">
          <div className="flex items-center justify-between h-[30px]">
            <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">
              Passport details
            </h2>
            {onEditPassport && (
              <Button
                type="button"
                variant="ghost"
                onClick={onEditPassport}
                className="bg-transparent border-0 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors p-0 h-auto font-sans"
              >
                Edit
              </Button>
            )}
          </div>

          <div className="bg-white border border-white rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full">
            <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] w-full flex flex-col gap-[8px]">
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] font-normal text-[#5C5C5C]">Passport Number</span>
                <span className="text-[14px] font-medium text-[#171717] font-mono">{passportNumber}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] font-normal text-[#5C5C5C]">Surname</span>
                <span className="text-[14px] font-medium text-[#171717]">{surname}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] font-normal text-[#5C5C5C]">Given Names</span>
                <span className="text-[14px] font-medium text-[#171717]">{givenNames}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] font-normal text-[#5C5C5C]">Nationality</span>
                <div className="flex items-center gap-1.5">
                  <Flag country={nationalityCode} className="size-4 rounded-full object-cover shrink-0" />
                  <span className="text-[14px] font-medium text-[#171717]">{nationalityCode}</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] font-normal text-[#5C5C5C]">Date of Birth</span>
                <span className="text-[14px] font-medium text-[#171717]">{dob}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] font-normal text-[#5C5C5C]">Gender</span>
                <span className="text-[14px] font-medium text-[#171717]">{gender}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] font-normal text-[#5C5C5C]">Marital Status</span>
                <span className="text-[14px] font-medium text-[#171717]">{maritalStatus}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] font-normal text-[#5C5C5C]">Place of Birth</span>
                <span className="text-[14px] font-medium text-[#171717]">{placeOfBirth}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] font-normal text-[#5C5C5C]">City of Birth</span>
                <span className="text-[14px] font-medium text-[#171717]">{cityOfBirth}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] font-normal text-[#5C5C5C]">Date of Issue</span>
                <span className="text-[14px] font-medium text-[#171717]">{issueDate}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] font-normal text-[#5C5C5C]">Date of Expiry</span>
                <span className="text-[14px] font-medium text-[#171717]">{expiryDate}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[13px] font-normal text-[#5C5C5C]">Issuing Authority</span>
                <span className="text-[14px] font-medium text-[#171717] text-right">{issuingAuthority}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Validity Widget */}
        <div className="flex flex-col gap-[12px] w-full">
          <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">
            Validity
          </h2>

          <div className="bg-white border border-white rounded-[16px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] p-[4px] w-full">
            <div className="bg-[#F7F7F7] rounded-[16px] p-[16px_20px] w-full flex flex-col gap-[8px]">
              <span className="text-[14px] font-medium text-[#171717]">
                {daysLeft !== null ? (daysLeft <= 0 ? "Expired" : `${daysLeft}d left`) : "—"}
              </span>

              {/* Progress bar */}
              <div className="w-full h-[6px] bg-[#EBEBEB] rounded-full overflow-hidden my-1">
                <div
                  className="h-full bg-[#7D52F4] rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[13px] text-[#5C5C5C]">
                <span>Issued {issueDate}</span>
                <span>Expires {expiryDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={{
          id: passportNumber !== "—" ? passportNumber : String(migrant?.id || "passport"),
          name: `${fullName !== "—" ? fullName : "Migrant"} - Passport Scan`,
          subtitle: `${passportNumber !== "—" ? passportNumber : "passport"}.pdf · 2.4 MB`,
          category: "Passport & Identity Scan",
          date: issueDate !== "—" ? issueDate : undefined,
          status: "uploaded",
          migrantName: fullName !== "—" ? fullName : undefined,
          caseNumber: migrant?.caseId || undefined,
          employer: migrant?.employer || undefined,
        }}
      />
    </div>
  );
}
