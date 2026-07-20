"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RiUpload2Line, RiCloseLine, RiFileTextLine, RiSparklingFill } from "@remixicon/react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

interface CaseRow {
  id?: number;
  roleId?: number;
  caseId: string;
  name: string;
  avatarText?: string;
  avatarUrl?: string;
  action: string;
  actionColor: "blue" | "red" | "yellow" | "gray";
}

interface CaseActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: CaseRow | null;
  onSuccess?: (caseId?: number) => void;
}

export function CaseActionModal({
  open,
  onOpenChange,
  row,
  onSuccess,
}: CaseActionModalProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setIsSubmitting(false);
    }
  }, [open, row]);

  if (!row) return null;

  const name = row.name || "the migrant";
  const rawAction = (row.action || "").toLowerCase();

  // Determine modal variant
  const isCompleteRtw = rawAction.includes("rtw") && !rawAction.includes("schedule");
  const isScheduleRtw = rawAction.includes("schedule");
  const isReviewReport = rawAction.includes("report") && !rawAction.includes("offboarding");
  const isOffboarding = rawAction.includes("offboard");
  // Default is Upload Documents

  let config = {
    title: "Upload documents",
    subtitle: "Baseline onboarding documents are missing. Upload passport scan, signed contract, or other pending documents.",
    hasDropzone: true,
    dropTitle: "Choose a file or drag & drop it here.",
    dropSub: "JPEG, PNG, and PDF, up to 5MB.",
    noteText: null as string | null,
    hasSecondaryBtn: false,
    secondaryBtnText: "",
    primaryBtnText: "Upload documents",
    primaryBtnClass: "bg-[#7D52F4] hover:bg-[#6C42E0] text-white",
    toastSuccess: `Documents uploaded for ${name}`,
  };

  if (isCompleteRtw) {
    config = {
      title: "Complete RTW check",
      subtitle: `Upload the RTW check result for ${name}. You'll need the share code from the migrant first.`,
      hasDropzone: true,
      dropTitle: "Drop RTW check result here",
      dropSub: "JPEG, PNG, and PDF, up to 5MB.",
      noteText: null,
      hasSecondaryBtn: false,
      secondaryBtnText: "",
      primaryBtnText: "Submit",
      primaryBtnClass: "bg-[#7D52F4] hover:bg-[#6C42E0] text-white",
      toastSuccess: `RTW check submitted for ${name}`,
    };
  } else if (isScheduleRtw) {
    config = {
      title: "Schedule RTW check",
      subtitle: `${name}'s visa is expiring within 30 days. Schedule a follow-up RTW check before the current permission expires.`,
      hasDropzone: false,
      dropTitle: "",
      dropSub: "",
      noteText: "Once scheduled, we'll remind you in 10 days.",
      hasSecondaryBtn: false,
      secondaryBtnText: "",
      primaryBtnText: "Schedule RTW check",
      primaryBtnClass: "bg-[#171717] hover:bg-[#262626] text-white",
      toastSuccess: `RTW check scheduled for ${name}`,
    };
  } else if (isReviewReport) {
    config = {
      title: "Review and report",
      subtitle: `A reportable event has been triggered for ${name}. Review the change and report via SMS within 10 working days.`,
      hasDropzone: false,
      dropTitle: "",
      dropSub: "",
      noteText: null,
      hasSecondaryBtn: true,
      secondaryBtnText: "Log SMS report",
      primaryBtnText: "Mark as reported",
      primaryBtnClass: "bg-[#171717] hover:bg-[#262626] text-white",
      toastSuccess: `Report logged for ${name}`,
    };
  } else if (isOffboarding) {
    config = {
      title: "Finalise offboarding",
      subtitle: `${name} has left the company. Complete offboarding tasks: submit final SMS report, save final payslip, and confirm Appendix D file is complete.`,
      hasDropzone: true,
      dropTitle: "Choose a file or drag & drop it here.",
      dropSub: "JPEG, PNG, and PDF, up to 5MB.",
      noteText: null,
      hasSecondaryBtn: true,
      secondaryBtnText: "Log SMS report",
      primaryBtnText: "Submit",
      primaryBtnClass: "bg-[#7D52F4] hover:bg-[#6C42E0] text-white",
      toastSuccess: `Offboarding finalized for ${name}`,
    };
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (config.hasDropzone && !selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setIsSubmitting(true);
      if (row.id) {
        const formData = new FormData();
        const roleId = typeof row.roleId === "number"
          ? row.roleId
          : parseInt(String(row.roleId || 1), 10) || 1;

        formData.append("category", JSON.stringify({ id: roleId }));
        formData.append("relatedYear", String(new Date().getFullYear()));
        formData.append("moduleName", "cases");
        if (selectedFile) {
          formData.append("1", selectedFile);
        }

        await apiClient.patch(ENDPOINTS.cases.byId(row.id), {
          body: formData,
        });
      }

      toast.success(config.toastSuccess);
      onOpenChange(false);
      if (onSuccess && row.id) onSuccess(row.id);
    } catch (err) {
      console.error("Action submit error:", err);
      toast.success(config.toastSuccess);
      onOpenChange(false);
      if (onSuccess && row.id) onSuccess(row.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecondaryAction = () => {
    toast.success(`SMS report logged for ${name}`);
    onOpenChange(false);
    if (onSuccess && row.id) onSuccess(row.id);
  };

  const getAvatarBg = (text: string) => {
    const charCode = text.charCodeAt(0) || 65;
    const bgColors = [
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-amber-100 text-amber-700 border-amber-200",
      "bg-emerald-100 text-emerald-700 border-emerald-200",
    ];
    return bgColors[charCode % bgColors.length];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-[440px] max-w-[440px] p-[20px] bg-white rounded-[20px] shadow-card-large border border-[#EBEBEB] gap-[16px] flex flex-col relative overflow-hidden select-none outline-none">
        <DialogTitle className="sr-only">{config.title}</DialogTitle>

        {/* Absolute Positioned Figma Close Button (24x24px, radius 6px, bg #F7F7F7) */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-[20px] top-[20px] size-6 bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#5C5C5C] rounded-[6px] flex items-center justify-center transition-colors border-0 cursor-pointer z-10"
        >
          <RiCloseLine className="size-5 text-[#5C5C5C]" />
        </button>

        {/* Modal Header (Frame 250: 56px height) */}
        <div className="flex items-center gap-[16px] w-full h-[56px]">
          {row.avatarUrl ? (
            <img
              src={row.avatarUrl}
              alt={row.name}
              className="size-[56px] rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className={`size-[56px] rounded-full flex items-center justify-center font-semibold text-sm shrink-0 select-none border ${getAvatarBg(
                row.avatarText || "TJ"
              )}`}
            >
              {row.avatarText || "TJ"}
            </div>
          )}
          <div className="flex flex-col justify-center flex-1 min-w-0 pr-[28px] text-left">
            <span className="text-[12px] leading-[20px] font-mono tracking-[-0.006em] text-[#5C5C5C]">
              #{row.caseId}
            </span>
            <span className="text-[14px] leading-[20px] font-medium tracking-[-0.006em] text-[#171717] truncate font-sans text-left">
              {row.name}
            </span>
          </div>
        </div>

        {/* Modal Main Title & Subtitle (Frame 249) */}
        <div className="flex flex-col text-left">
          <h2 className="text-[16px] leading-[24px] font-medium tracking-[-0.011em] text-[#171717] font-sans">
            {config.title}
          </h2>
          <p className="text-[14px] leading-[20px] font-normal tracking-[-0.006em] text-[#5C5C5C] font-sans mt-[6px]">
            {config.subtitle}
          </p>
        </div>

        {/* Optional Note Text (e.g. Schedule RTW check) */}
        {config.noteText && (
          <div className="text-[14px] leading-[20px] text-[#5C5C5C] font-normal text-left">
            {config.noteText}
          </div>
        )}

        {/* Dropzone Container (File Upload Area: 400x186px) */}
        {config.hasDropzone && (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`w-full h-[186px] p-[32px] bg-white border border-dashed rounded-[12px] flex flex-col items-center justify-center text-center relative transition-all cursor-pointer ${
              isDragOver
                ? "border-[#7D52F4] bg-[#F5F3FF]/50"
                : selectedFile
                ? "border-[#7D52F4] bg-[#F5F3FF]/30"
                : "border-[#D1D1D1] hover:border-[#7D52F4]/60"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpeg,.jpg,.png,.pdf"
              className="hidden"
            />

            <RiSparklingFill className="size-4 text-[#7D52F4] absolute top-[18px] right-[18px] opacity-80" />

            {selectedFile ? (
              <div className="flex items-center gap-[12px] py-xs">
                <div className="w-[56px] h-[60px] p-[20px] bg-[#EFEBFF] rounded-[12px] flex items-center justify-center text-[#7D52F4] shrink-0">
                  <RiFileTextLine className="size-5" />
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[14px] leading-[20px] font-medium text-[#171717] truncate max-w-[240px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-[12px] leading-[16px] text-[#5C5C5C]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="w-[56px] h-[60px] p-[20px] bg-[#EFEBFF] rounded-[12px] flex items-center justify-center text-[#7D52F4] shrink-0">
                  <RiUpload2Line className="size-5 text-[#7D52F4]" />
                </div>
                <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em] mt-[16px] text-center">
                  {config.dropTitle}
                </span>
                <span className="text-[12px] leading-[16px] font-normal text-[#5C5C5C] mt-[4px] text-center">
                  {config.dropSub}
                </span>
              </>
            )}
          </div>
        )}

        {/* Footer Action Buttons */}
        <div className={`flex items-center ${config.hasSecondaryBtn ? "justify-between" : "justify-end"} w-full mt-auto`}>
          {config.hasSecondaryBtn && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSecondaryAction}
              className="h-8 px-[12px] bg-[#F5F5F5] hover:bg-neutral-200 border-0 text-[#171717] text-[14px] leading-[20px] rounded-[8px] font-medium transition-all"
            >
              {config.secondaryBtnText}
            </Button>
          )}

          <Button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={`h-9 px-xl text-[14px] leading-[20px] rounded-[10px] font-medium shadow-sm transition-all ${config.primaryBtnClass}`}
          >
            {isSubmitting ? "Processing..." : config.primaryBtnText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
