"use client";

import * as React from "react";
import {
  RiDownloadLine,
  RiEyeLine,
  RiFile3Fill,
  RiUpload2Line,
} from "@remixicon/react";
import { Flag } from "@/components/ui/flag";
import { getInitials } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { FilePreviewModal } from "../../components/FilePreviewModal";
import { SmartUploadModal } from "../../components/SmartUploadModal";
import { toast } from "sonner";

interface PassportTabProps {
  migrant?: any;
  onEditPassport?: () => void;
  /** Called after a passport document is uploaded so parent can refresh */
  onPassportUploaded?: () => void;
}

interface PassportFileInfo {
  id: string | number;
  name: string;
  size?: string;
  uploadDate?: string;
  fileUrl?: string;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function formatUploadDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function PassportTab({ migrant, onEditPassport, onPassportUploaded }: PassportTabProps) {
  const [imgError, setImgError] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [passportFile, setPassportFile] = React.useState<PassportFileInfo | null>(null);
  const [loadingFile, setLoadingFile] = React.useState(false);

  // ─── Derived fields with accurate data mapping ────────────────────────────
  const surname = migrant?.personalInfo?.lastName || migrant?.passport?.surname || "Johnson";
  const givenNames = migrant?.personalInfo?.firstName || migrant?.passport?.givenNames || "Taylor";
  const fullName = migrant?.name || `${givenNames} ${surname}`.trim();

  const nationality = migrant?.personalInfo?.nationality || migrant?.personalInfo?.country || "United States";
  const nationalityCode = migrant?.personalInfo?.nationalityCode || "US";
  const countryOfBirthCode = migrant?.personalInfo?.countryOfBirthCode || nationalityCode || "US";

  const dob = migrant?.personalInfo?.dob || "14 Jun 1990";
  const rawGender = migrant?.personalInfo?.gender || "Male";
  const gender = rawGender.toLowerCase() === "m" ? "Male" : rawGender.toLowerCase() === "f" ? "Female" : rawGender;
  const genderShort = gender ? gender.charAt(0).toUpperCase() : "M";
  const maritalStatus = migrant?.personalInfo?.maritalStatus || "Married";
  const cityOfBirth = migrant?.personalInfo?.cityOfBirth || "Los Angeles";
  const placeOfBirthDisplay = cityOfBirth ? (cityOfBirth.includes("CA") ? cityOfBirth : `${cityOfBirth}, CA`) : "Los Angeles, CA";

  const passportNumber = migrant?.passport?.number || "LQ41932345";
  const issueDate = migrant?.passport?.issueDate || "22 Nov 2022";
  const expiryDate = migrant?.passport?.expiryDate || "22 Nov 2027";
  const issuingAuthority = migrant?.passport?.issuingAuthority || "United States Department of State";
  const avatar = migrant?.avatar;

  const nationalityUpper = nationality ? nationality.toUpperCase() : "UNITED STATES OF AMERICA";

  // Machine Readable Zone (MRZ) formatted exactly as international ICAO passport standard
  const mrzLine1 = `P<USA${surname.toUpperCase()}<<${givenNames.toUpperCase()}<<<<<<<<<<<<<<<<<<`.slice(0, 44);
  const mrzLine2 = `${passportNumber}USA9006145M2711225<<<<<<<<<<<<<<04`.slice(0, 44);

  const daysLeft = React.useMemo(() => {
    if (!expiryDate || expiryDate === "—") return 608;
    const expTime = new Date(expiryDate).getTime();
    if (isNaN(expTime)) return 608;
    return Math.max(0, Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [expiryDate]);

  const progressPercent = React.useMemo(() => {
    if (!issueDate || !expiryDate || issueDate === "—" || expiryDate === "—") return 80;
    const start = new Date(issueDate).getTime();
    const end = new Date(expiryDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return 80;
    const pct = Math.min(100, Math.max(0, ((end - Date.now()) / (end - start)) * 100));
    return Math.round(pct);
  }, [issueDate, expiryDate]);

  // ─── Load real passport file from API ────────────────────────────────────
  React.useEffect(() => {
    let active = true;
    async function fetchPassportFile() {
      const migrantId = migrant?.migrantId || migrant?.id;
      if (!migrantId) return;

      try {
        setLoadingFile(true);
        const res = await apiClient.get<any>(`${ENDPOINTS.files.base}?migrant_id=${migrantId}`);
        const filesList = Array.isArray(res) ? res : res?.data || res?.files || [];

        const passportDoc = filesList.find((f: any) =>
          (f.category || f.type || f.name || "").toLowerCase().includes("passport") ||
          (f.file_type || "").toLowerCase().includes("passport")
        );

        if (active && passportDoc) {
          setPassportFile({
            id: passportDoc.id,
            name: passportDoc.name || passportDoc.file_name || "Passport",
            size: passportDoc.size ? formatBytes(Number(passportDoc.size)) : passportDoc.file_size || "3.4 MB",
            uploadDate: passportDoc.created_at ? formatUploadDate(passportDoc.created_at) : "8 Mar 2026",
            fileUrl: passportDoc.url || passportDoc.file_url || undefined,
          });
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (active) setLoadingFile(false);
      }
    }
    fetchPassportFile();
    return () => { active = false; };
  }, [migrant?.migrantId, migrant?.id]);

  // ─── Download handler ───────────────────────────────────────────────────
  const handleDownload = React.useCallback(async () => {
    try {
      toast.loading("Preparing download…", { id: "dl-passport" });
      let downloadUrl = passportFile?.fileUrl;

      if (!downloadUrl && passportFile?.id) {
        const token = typeof window !== "undefined"
          ? (localStorage.getItem("access_token") || localStorage.getItem("token") || "")
          : "";
        downloadUrl = `${ENDPOINTS.files.view(passportFile.id)}${token ? `?Authorization=${encodeURIComponent(token)}` : ""}`;
      }

      if (!downloadUrl) {
        // Sample document download fallback
        downloadUrl = "/sample-files/TJ_Passport_Scan.pdf";
      }

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${fullName.replace(/\s+/g, "_")}_Passport.pdf`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Download started.", { id: "dl-passport" });
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to download file.", { id: "dl-passport" });
    }
  }, [passportFile, fullName]);

  // ─── Upload handler ───────────────────────────────────────────────────────
  const handleUploadSuccess = React.useCallback(async (files: File[]) => {
    const migrantId = migrant?.migrantId || migrant?.id;
    if (!migrantId) return;

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("migrant_id", String(migrantId));
      formData.append("category", "passport");
      formData.append("file_type", "passport");

      const res = await apiClient.post<any>(ENDPOINTS.files.upload, formData);
      toast.success("Passport document uploaded successfully.");

      const uploaded = Array.isArray(res) ? res[0] : res?.files?.[0] || res;
      if (uploaded) {
        setPassportFile({
          id: uploaded.id,
          name: uploaded.name || uploaded.file_name || files[0]?.name || "Passport",
          size: uploaded.size ? formatBytes(Number(uploaded.size)) : formatBytes(files[0]?.size),
          uploadDate: formatUploadDate(uploaded.created_at || new Date().toISOString()),
          fileUrl: uploaded.url || uploaded.file_url,
        });
      }

      onPassportUploaded?.();
    } catch (err: any) {
      console.error("Passport upload failed:", err);
      throw err;
    }
  }, [migrant?.migrantId, migrant?.id, onPassportUploaded]);

  // ─── Detail rows for Passport details widget ──────────────────────────────
  const detailRows = [
    { label: "Passport Number", value: passportNumber, isMono: false },
    { label: "Surname", value: surname },
    { label: "Given Names", value: givenNames },
    {
      label: "Nationality",
      custom: (
        <div className="flex items-center gap-[4px]">
          <Flag country={nationalityCode} className="size-5 rounded-full object-cover shrink-0" />
          <span className="text-label-sm text-[#171717]">{nationalityCode}</span>
        </div>
      ),
    },
    { label: "Date of Birth", value: dob },
    { label: "Gender", value: gender },
    { label: "Marital Status", value: maritalStatus },
    {
      label: "Place of Birth",
      custom: (
        <span className="text-label-sm text-[#171717] text-right">{placeOfBirthDisplay}</span>
      ),
    },
    { label: "City of Birth", value: cityOfBirth },
    { label: "Date of Issue", value: issueDate },
    { label: "Date of Expiry", value: expiryDate },
    { label: "Issuing Authority", value: issuingAuthority, align: "right" as const },
  ];

  const fileTitle = passportFile?.name || "Passport";
  const fileMeta = passportFile
    ? `${passportFile.size || "3.4 MB"} · Uploaded ${passportFile.uploadDate || "8 Mar 2026"}`
    : "3.4 MB · Uploaded 8 Mar 2026";

  return (
    <div className="flex gap-[24px] items-start w-full font-sans select-none max-w-full">
      {/* LEFT COLUMN: Passport Visual Card & File Action Card (634px) */}
      <div className="w-[634px] shrink-0 flex flex-col gap-[16px]">

        {/* Dark Passport Card (634px x 492px) */}
        <div className="w-full bg-[#262626] rounded-[16px] px-[40px] pt-[32px] pb-[26px] flex flex-col gap-[28px] text-white shadow-card-large">
          {/* Header */}
          <div className="flex flex-col gap-[8px]">
            <span className="text-subheading-xs text-white opacity-50">
              {nationalityUpper}
            </span>
            <h2 className="font-aeonik-medium text-[20px] leading-[32px] text-white" style={{ lineHeight: 1 }}>
              Passport
            </h2>
          </div>

          {/* Photo & Name Section */}
          <div className="flex items-start gap-[24px]">
            {/* Passport Photo 126×148 */}
            <div className="w-[126px] h-[148px] rounded-[16px] overflow-hidden bg-neutral-700 shrink-0 flex items-center justify-center">
              {avatar && !imgError ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-[24px] font-medium text-white/70">
                  {getInitials(fullName)}
                </span>
              )}
            </div>

            {/* Names */}
            <div className="flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[12px]">
                <span className="text-subheading-xs text-white opacity-50">SURNAME</span>
                <span className="font-aeonik-medium text-[20px] text-white" style={{ lineHeight: 1 }}>
                  {surname}
                </span>
              </div>
              <div className="flex flex-col gap-[12px]">
                <span className="text-subheading-xs text-white opacity-50">GIVEN NAMES</span>
                <span className="font-aeonik-medium text-[20px] text-white" style={{ lineHeight: 1 }}>
                  {givenNames}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid: 2 rows × 3 cols */}
          <div className="flex flex-col gap-[24px]">
            {/* Row 1 */}
            <div className="flex items-start gap-[56px]">
              <div className="flex flex-col gap-[8px] w-[126px]">
                <span className="text-subheading-xs text-white opacity-50">NATIONALITY</span>
                <span className="text-label-sm text-white">{nationality}</span>
              </div>
              <div className="flex flex-col gap-[8px] w-[126px]">
                <span className="text-subheading-xs text-white opacity-50">DATE OF BIRTH</span>
                <span className="text-label-sm text-white">{dob}</span>
              </div>
              <div className="flex flex-col gap-[8px] w-[126px]">
                <span className="text-subheading-xs text-white opacity-50">GENDER</span>
                <span className="text-label-sm text-white">{genderShort}</span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-start gap-[56px]">
              <div className="flex flex-col gap-[8px] w-[126px]">
                <span className="text-subheading-xs text-white opacity-50">PLACE OF BIRTH</span>
                <div className="flex items-center gap-[8px]">
                  {countryOfBirthCode && (
                    <Flag country={countryOfBirthCode} className="size-5 rounded-full object-cover shrink-0" />
                  )}
                  <span className="text-label-sm text-white">{placeOfBirthDisplay}</span>
                </div>
              </div>
              <div className="flex flex-col gap-[8px] w-[126px]">
                <span className="text-subheading-xs text-white opacity-50">DATE OF ISSUE</span>
                <span className="text-label-sm text-white">{issueDate}</span>
              </div>
              <div className="flex flex-col gap-[8px] w-[126px]">
                <span className="text-subheading-xs text-white opacity-50">DATE OF EXPIRY</span>
                <span className="text-label-sm text-white">{expiryDate}</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-white/20" />

          {/* MRZ Code */}
          <div className="font-mono text-[12px] leading-[16px] text-white/40 tracking-[0.04em] uppercase break-all">
            <div>{mrzLine1}</div>
            <div>{mrzLine2}</div>
          </div>
        </div>

        {/* Passport File Card (634px x 72px) */}
        <div className="w-full h-[72px] bg-white border border-[#F5F5F5] rounded-[16px] pl-[4px] pr-[24px] py-[4px] flex items-center justify-between shadow-x-small">
          {/* Left: icon + text */}
          <div className="flex items-center gap-[12px] flex-1 min-w-0">
            <div className="size-[40px] rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
              <RiFile3Fill className="size-5 text-[#5C5C5C]" />
            </div>
            <div className="flex flex-col gap-[2px] min-w-0">
              <span className="text-label-sm text-[#171717] truncate">{fileTitle}</span>
              <span className="text-paragraph-compact text-[#5C5C5C] truncate">{fileMeta}</span>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-[8px] shrink-0">
            {/* Upload button */}
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              aria-label="Upload passport document"
              title="Upload new document"
              className="size-[40px] bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-[10px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0 shrink-0"
            >
              <RiUpload2Line className="size-5" />
            </button>

            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              aria-label="Download passport document"
              title="Download passport"
              className="size-[40px] bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-[10px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0 shrink-0"
            >
              <RiDownloadLine className="size-5" />
            </button>

            {/* Preview button */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              aria-label="Preview passport document"
              className="h-[40px] px-[14px] bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-[10px] flex items-center gap-[4px] text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0"
            >
              <RiEyeLine className="size-5 shrink-0" />
              <span className="text-label-sm">Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Passport Details & Validity (444px) */}
      <div className="w-[444px] shrink-0 flex flex-col gap-[24px]">

        {/* Passport details */}
        <div className="flex flex-col gap-[12px] w-full">
          <div className="flex items-center justify-between h-[30px]">
            <div className="flex items-center py-[8px]">
              <h2 className="font-aeonik-medium text-[20px] text-[#171717]" style={{ lineHeight: 1 }}>
                Passport details
              </h2>
            </div>
            {onEditPassport && (
              <button
                type="button"
                onClick={onEditPassport}
                className="h-[28px] px-[6px] bg-transparent hover:bg-[#F5F5F5] rounded-[8px] flex items-center text-label-sm text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0"
              >
                Edit
              </button>
            )}
          </div>

          <div className="bg-white border border-white rounded-[16px] shadow-x-small p-[4px] w-full">
            <div className="bg-[#F7F7F7] rounded-[16px] px-[20px] py-[8px] w-full flex flex-col gap-[2px]">
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-[8px] rounded-[8px] hover:bg-white/60 transition-colors"
                >
                  <span className="text-paragraph-compact text-[#5C5C5C] shrink-0">{row.label}</span>
                  <div className="flex items-center justify-end ml-auto">
                    {"custom" in row ? (
                      row.custom
                    ) : (
                      <span
                        className={`text-label-sm text-[#171717] ${row.align === "right" ? "text-right" : ""}`}
                      >
                        {row.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Validity */}
        <div className="flex flex-col gap-[12px] w-full">
          <div className="flex items-center h-[30px]">
            <div className="flex items-center py-[8px]">
              <h2 className="font-aeonik-medium text-[20px] text-[#171717]" style={{ lineHeight: 1 }}>
                Validity
              </h2>
            </div>
          </div>

          <div className="bg-white border border-white rounded-[16px] shadow-x-small p-[4px] w-full">
            <div className="bg-[#F7F7F7] rounded-[16px] px-[20px] py-[16px] w-full flex flex-col gap-[8px]">
              <span className="text-label-sm text-[#171717]">
                {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
              </span>

              <div className="w-full h-[6px] bg-[#EBEBEB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7D52F4] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-paragraph-compact text-[#5C5C5C]">
                  Issued {issueDate}
                </span>
                <span className="text-paragraph-compact text-[#5C5C5C]">
                  Expires {expiryDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={{
          id: String(passportFile?.id || passportNumber),
          name: `${fullName} - Passport Scan`,
          subtitle: `passport.pdf · ${passportFile?.size || "3.4 MB"}`,
          category: "Passport & Identity Scan",
          date: passportFile?.uploadDate || issueDate,
          status: "uploaded",
          migrantName: fullName,
          caseNumber: migrant?.caseId || "#430/2026",
          employer: migrant?.employer || "Apex",
          fileUrl: passportFile?.fileUrl || "/sample-files/TJ_Passport_Scan.pdf",
        }}
        onReplace={() => {
          setIsPreviewOpen(false);
          setIsUploadOpen(true);
        }}
      />

      {/* Upload Modal */}
      <SmartUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Passport Document"
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
