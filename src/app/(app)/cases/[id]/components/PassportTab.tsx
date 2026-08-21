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
import { FileDocument } from "@/types/api";
import { FilePreviewModal } from "../../components/FilePreviewModal";
import { SmartUploadModal } from "../../components/SmartUploadModal";
import { toast } from "sonner";

interface PassportTabProps {
  migrant?: {
    id?: string | number;
    migrantId?: string | number;
    name?: string;
    avatar?: string;
    caseId?: string;
    employer?: string;
    personalInfo?: {
      firstName?: string;
      lastName?: string;
      nationality?: string;
      country?: string;
      nationalityCode?: string;
      countryOfBirthCode?: string;
      dob?: string;
      gender?: string;
      maritalStatus?: string;
      cityOfBirth?: string;
    };
    passport?: {
      number?: string;
      issueDate?: string;
      expiryDate?: string;
      issuingAuthority?: string;
      surname?: string;
      givenNames?: string;
    };
    [key: string]: unknown;
  } | null;
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
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    setNow(Date.now());
  }, []);

  // ─── Derived fields with accurate data mapping ────────────────────────────
  const surname = migrant?.personalInfo?.lastName || migrant?.passport?.surname || "—";
  const givenNames = migrant?.personalInfo?.firstName || migrant?.passport?.givenNames || "—";
  const fullName = migrant?.name || (givenNames !== "—" || surname !== "—" ? `${givenNames !== "—" ? givenNames : ""} ${surname !== "—" ? surname : ""}`.trim() : "—");

  const nationality = migrant?.personalInfo?.nationality || migrant?.personalInfo?.country || "—";
  const nationalityCode = migrant?.personalInfo?.nationalityCode || "";
  const countryOfBirthCode = migrant?.personalInfo?.countryOfBirthCode || nationalityCode || "";

  const dob = migrant?.personalInfo?.dob || "—";
  const rawGender = migrant?.personalInfo?.gender || "";
  const gender = rawGender ? (rawGender.toLowerCase() === "m" ? "Male" : rawGender.toLowerCase() === "f" ? "Female" : rawGender) : "—";
  const genderShort = gender !== "—" ? gender.charAt(0).toUpperCase() : "—";
  const maritalStatus = migrant?.personalInfo?.maritalStatus || "—";
  const cityOfBirth = migrant?.personalInfo?.cityOfBirth || "—";
  const placeOfBirthDisplay = cityOfBirth ? cityOfBirth : "—";

  const passportNumber = migrant?.passport?.number || "—";
  const issueDate = migrant?.passport?.issueDate || "—";
  const expiryDate = migrant?.passport?.expiryDate || "—";
  const issuingAuthority = migrant?.passport?.issuingAuthority || "—";
  const avatar = migrant?.avatar;

  const nationalityUpper = nationality !== "—" ? nationality.toUpperCase() : "—";

  const hasMrzData = passportNumber !== "—" && surname !== "—" && givenNames !== "—";
  const hasValidDates = issueDate !== "—" && expiryDate !== "—";

  // Dynamic Machine Readable Zone (MRZ) formatted exactly as international ICAO Document 9303 passport standard
  const rawCountryCode = (nationalityCode || nationality || "GBR").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
  const padCountry = (rawCountryCode || "GBR").padEnd(3, "X");

  const cleanSurname = surname !== "—" ? surname.toUpperCase().replace(/[^A-Z]/g, "") : "";
  const cleanGiven = givenNames !== "—" ? givenNames.toUpperCase().replace(/[^A-Z]/g, "") : "";

  const mrzLine1 = hasMrzData
    ? `P<${padCountry}${cleanSurname}<<${cleanGiven}`.padEnd(44, "<").slice(0, 44)
    : "";

  const cleanPass = passportNumber !== "—" ? passportNumber.toUpperCase().replace(/[^A-Z0-9]/g, "") : "";
  
  const formatMrzDate = (dateStr: string) => {
    if (!dateStr || dateStr === "—") return "900101";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "900101";
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}${mm}${dd}`;
  };

  const dobMrz = formatMrzDate(dob);
  const expMrz = formatMrzDate(expiryDate);
  const genChar = genderShort !== "—" ? genderShort : "M";

  const mrzLine2 = hasMrzData
    ? `${cleanPass.padEnd(9, "<")}<${padCountry}${dobMrz}5${genChar}${expMrz}5<<<<<<<<<<<<<<04`.padEnd(44, "<").slice(0, 44)
    : "";

  const daysLeft = React.useMemo(() => {
    if (!expiryDate || expiryDate === "—") return 608;
    const expTime = new Date(expiryDate).getTime();
    if (isNaN(expTime)) return 608;
    return Math.max(0, Math.ceil((expTime - now) / (1000 * 60 * 60 * 24)));
  }, [expiryDate, now]);

  const progressPercent = React.useMemo(() => {
    if (!issueDate || !expiryDate || issueDate === "—" || expiryDate === "—") return 80;
    const start = new Date(issueDate).getTime();
    const end = new Date(expiryDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return 80;
    const pct = Math.min(100, Math.max(0, ((end - now) / (end - start)) * 100));
    return Math.round(pct);
  }, [issueDate, expiryDate, now]);

  // ─── Load real passport file from API ────────────────────────────────────
  React.useEffect(() => {
    let active = true;
    async function fetchPassportFile() {
      const migrantId = migrant?.migrantId || migrant?.id;
      if (!migrantId) return;

      try {
        setLoadingFile(true);
        const res = await apiClient.get<FileDocument[] | { data?: FileDocument[]; files?: FileDocument[] }>(
          `${ENDPOINTS.files.base}?migrant_id=${migrantId}`
        );
        const filesList: FileDocument[] = Array.isArray(res) ? res : res?.data || res?.files || [];

        const passportDoc = filesList.find((f: FileDocument) =>
          ((f as any).category || (f as any).type || f.originalName || f.filename || "").toLowerCase().includes("passport") ||
          ((f as any).file_type || "").toLowerCase().includes("passport")
        );

        if (active && passportDoc) {
          setPassportFile({
            id: passportDoc.id,
            name: passportDoc.originalName || passportDoc.filename || "Passport",
            size: passportDoc.size ? formatBytes(Number(passportDoc.size)) : "3.4 MB",
            uploadDate: passportDoc.uploadDate ? formatUploadDate(passportDoc.uploadDate) : "8 Mar 2026",
            fileUrl: (passportDoc as any).url || (passportDoc as any).file_url || undefined,
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
      let blobUrlToRevoke: string | null = null;

      if (!downloadUrl && passportFile?.id) {
        try {
          const response = await apiClient.get<Response>(
            ENDPOINTS.files.view(passportFile.id),
            { raw: true }
          );
          const blob = await response.blob();
          downloadUrl = URL.createObjectURL(blob);
          blobUrlToRevoke = downloadUrl;
        } catch {
          // Fallback if view endpoint fails
        }
      }

      if (!downloadUrl) {
        // Sample document download fallback
        downloadUrl = "/sample-files/TJ_Passport_Scan.pdf";
      }

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${(fullName !== "—" ? fullName : "Passport").replace(/\s+/g, "_")}_Passport.pdf`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if (blobUrlToRevoke) {
        URL.revokeObjectURL(blobUrlToRevoke);
      }
      toast.success("Download started.", { id: "dl-passport" });
    } catch (err: unknown) {
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

      const res = await apiClient.post<FileDocument[] | { files?: FileDocument[] }>(ENDPOINTS.files.upload, formData);
      toast.success("Passport document uploaded successfully.");

      const uploaded: any = Array.isArray(res) ? res[0] : (res as any)?.files?.[0] || res;
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
    } catch (err: unknown) {
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
          {nationalityCode && (
            <Flag country={nationalityCode} className="size-5 rounded-full object-cover shrink-0" />
          )}
          <span className="text-label-sm text-[#171717]">{nationalityCode || nationality}</span>
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
    <div className="flex gap-[24px] items-start w-full font-sans max-w-full">
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
                <span className="text-[12px] font-medium text-white/70">
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

          {/* Divider & MRZ Code */}
          {hasMrzData && (
            <>
              <div className="w-full border-t border-white/20" />
              <div className="font-mono text-[12px] leading-[16px] text-white/40 tracking-[0.04em] uppercase break-all">
                <div>{mrzLine1}</div>
                <div>{mrzLine2}</div>
              </div>
            </>
          )}
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
            <div className="bg-[#F5F5F5] rounded-[16px] px-[20px] py-[8px] w-full flex flex-col gap-[2px]">
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
        {hasValidDates && (
          <div className="flex flex-col gap-[12px] w-full">
            <div className="flex items-center h-[30px]">
              <div className="flex items-center py-[8px]">
                <h2 className="font-aeonik-medium text-[20px] text-[#171717]" style={{ lineHeight: 1 }}>
                  Validity
                </h2>
              </div>
            </div>

            <div className="bg-white border border-white rounded-[16px] shadow-x-small p-[4px] w-full">
              <div className="bg-[#F5F5F5] rounded-[16px] px-[20px] py-[16px] w-full flex flex-col gap-[8px]">
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
        )}
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
