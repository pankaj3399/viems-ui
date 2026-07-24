"use client";

import * as React from "react";
import {
  X,
  Upload,
  Sparkles,
  CheckCircle2,
  Calendar,
  Info,
  Loader2,
  FileText,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DocumentItem {
  id: string;
  name: string;
  subtitle: string;
  folderId: string;
  folderName: string;
  status: "uploaded" | "not_uploaded" | "required_asap" | "under_review";
  date?: string;
  dateWarning?: string;
  isAlert?: boolean;
}

interface ReplaceFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: DocumentItem | null;
  onReplaceSuccess?: (updatedDoc: DocumentItem) => void;
}

export function ReplaceFileModal({
  isOpen,
  onClose,
  document,
  onReplaceSuccess,
}: ReplaceFileModalProps) {
  const [step, setStep] = React.useState<"form" | "scanning" | "confirm">("form");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [documentType, setDocumentType] = React.useState(document?.name || "Passport");
  const [passportNumber, setPassportNumber] = React.useState("123456789");
  const [startDate, setStartDate] = React.useState("2026-03-15");
  const [endDate, setEndDate] = React.useState("2027-03-16");
  const [notes, setNotes] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset modal state on open/close
  React.useEffect(() => {
    if (isOpen) {
      setStep("form");
      setSelectedFile(null);
      setDragActive(false);
      if (document) {
        setDocumentType(document.name);
      }
    }
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  const fileName = document.subtitle.split("·")[0]?.trim() || `${document.name}.pdf`;
  const fileSize = document.subtitle.split("·")[1]?.trim() || "3.4 MB";

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartReplace = async () => {
    setStep("scanning");

    // Simulate AI extraction delay
    setTimeout(() => {
      setStep("confirm");
    }, 1400);
  };

  const handleConfirmReplacement = () => {
    const updated: DocumentItem = {
      ...document,
      status: "uploaded",
      subtitle: selectedFile
        ? `${selectedFile.name} · ${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : document.subtitle,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      dateWarning: undefined,
      isAlert: false,
    };

    toast.success(`${document.name} replaced successfully`, {
      description: "AI automatically extracted 9 fields and updated the profile details.",
    });

    if (onReplaceSuccess) {
      onReplaceSuccess(updated);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
      
      {/* ─── STEP 1: FORM MODAL (Left Card in Screenshot) ───────────────────── */}
      {step === "form" && (
        <div className="bg-white rounded-[20px] max-w-[480px] w-full p-6 shadow-2xl flex flex-col gap-5 border border-neutral-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            <h2 className="text-[18px] font-semibold text-[#171717] tracking-tight">
              Replace file
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer border-0"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Current File Banner */}
          <div className="bg-[#F9FAFB] rounded-[14px] p-4 flex items-center justify-between border border-[#F3F4F6]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-[8px] bg-[#171717] text-white flex items-center justify-center shrink-0">
                <FileText className="size-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-semibold text-[#171717] truncate">
                  {document.name}
                </span>
                <span className="text-[12px] text-[#6B7280] truncate">
                  {fileName} · {fileSize}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#E3F7EC] text-[#0B4627] text-[10px] font-bold uppercase shrink-0 tracking-wider">
              CURRENT
            </span>
          </div>

          {/* Document Type Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#171717]">
              Document Type
            </label>
            <div className="relative">
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full h-10 px-3 pr-8 rounded-[10px] border border-[#E5E7EB] bg-white text-[14px] font-medium text-[#171717] focus:outline-hidden focus:border-[#7D52F4] appearance-none cursor-pointer"
              >
                <option value="Passport">Passport</option>
                <option value="E-Visa confirmation">E-Visa confirmation</option>
                <option value="Right to work check">Right to work check</option>
                <option value="Employment contract">Employment contract</option>
                <option value="Certificate of sponsorship">Certificate of sponsorship</option>
              </select>
              <ChevronDown className="size-4 text-[#6B7280] absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Dashed Drag & Drop Box */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[16px] p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative group ${
              dragActive || selectedFile
                ? "border-[#7D52F4] bg-[#F3E8FF]/30"
                : "border-[#E5E7EB] hover:border-[#7D52F4] bg-white"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf,.mp4"
            />

            {/* Sparkles Icon */}
            <div className="absolute top-3 right-3 text-[#7D52F4]">
              <Sparkles className="size-4" />
            </div>

            {/* Upload Icon Pill Container */}
            <div className="size-10 rounded-[12px] bg-[#F3E8FF] flex items-center justify-center text-[#7D52F4] mb-2.5 group-hover:scale-105 transition-transform shrink-0">
              <Upload className="size-5" />
            </div>

            <span className="text-[13px] font-semibold text-[#171717]">
              {selectedFile ? selectedFile.name : "Choose a file or drag & drop it here."}
            </span>
            <span className="text-[11px] text-[#6B7280] mt-0.5">
              {selectedFile
                ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB · Ready to replace`
                : "JPEG, PNG, PDF, and MP4 formats, up to 50 MB."}
            </span>
          </div>

          {/* Form Fields: Passport Number */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <label className="text-[13px] font-medium text-[#171717]">
                Passport Number
              </label>
              <Info className="size-3.5 text-[#A4A4A4]" />
            </div>
            <input
              type="text"
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              className="w-full h-10 px-3 rounded-[10px] border border-[#E5E7EB] text-[14px] text-[#171717] focus:outline-hidden focus:border-[#7D52F4]"
            />
          </div>

          {/* Form Fields: Start Date & End Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#171717]">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 rounded-[10px] border border-[#E5E7EB] text-[13px] text-[#171717]"
                />
                <Calendar className="size-4 text-[#A4A4A4] absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#171717]">
                End Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 rounded-[10px] border border-[#E5E7EB] text-[13px] text-[#171717]"
                />
                <Calendar className="size-4 text-[#A4A4A4] absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Form Fields: Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#171717]">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this document"
              className="w-full p-2.5 rounded-[10px] border border-[#E5E7EB] text-[13px] text-[#171717] focus:outline-hidden focus:border-[#7D52F4] resize-none"
            />
          </div>

          {/* AI Auto-fill Enabled Banner */}
          <div className="bg-[#F9FAFB] rounded-[14px] p-3.5 flex flex-col gap-1 border border-[#F3F4F6]">
            <div className="flex items-center gap-2">
              <div className="size-4.5 rounded-[5px] bg-[#7D52F4] flex items-center justify-center text-white shrink-0">
                <Sparkles className="size-3" />
              </div>
              <span className="text-[13px] font-semibold text-[#171717]">
                AI auto-fill enabled
              </span>
            </div>
            <p className="text-[12px] text-[#6B7280] leading-relaxed pl-6">
              When you upload this document, AI will automatically extract information and update their profile.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-5 rounded-[10px] text-[14px] font-medium border-[#E5E7EB] text-[#171717] hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleStartReplace}
              className="h-10 px-5 rounded-[10px] text-[14px] font-medium bg-[#7D52F4] hover:bg-[#683fd1] text-white"
            >
              Replace
            </Button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: AI SCANNING PROGRESS MODAL (Middle Card in Screenshot) ── */}
      {step === "scanning" && (
        <div className="bg-white rounded-[20px] max-w-[440px] w-full p-8 shadow-2xl flex flex-col items-center justify-center text-center gap-5 border border-neutral-100 animate-in fade-in zoom-in-95 duration-150 relative">
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 absolute top-4 right-4 cursor-pointer border-0"
          >
            <X className="size-4" />
          </button>

          <div className="w-full text-left font-semibold text-[16px] text-[#171717]">
            Replace file
          </div>

          <div className="size-14 rounded-[16px] bg-[#F3E8FF] flex items-center justify-center text-[#7D52F4] my-2 relative">
            <Sparkles className="size-7 animate-pulse" />
            <Loader2 className="size-16 text-[#7D52F4]/30 animate-spin absolute" />
          </div>

          <div className="flex flex-col items-center text-center gap-1">
            <h3 className="text-[16px] font-semibold text-[#171717]">
              AI is scanning {selectedFile ? selectedFile.name : "TJ_Passport.pdf..."}
            </h3>
            <p className="text-[13px] text-[#6B7280] font-normal">
              Extracting fields and verifying document...
            </p>
          </div>
        </div>
      )}

      {/* ─── STEP 3: CONFIRM EXTRACTED FIELDS MODAL (Right Card in Screenshot) ── */}
      {step === "confirm" && (
        <div className="bg-white rounded-[20px] max-w-[480px] w-full p-6 shadow-2xl flex flex-col gap-5 border border-neutral-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-8 rounded-[6px] bg-[#171717] text-white flex items-center justify-center shrink-0">
                <FileText className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-semibold text-[#171717] truncate">
                  {document.name}
                </span>
                <span className="text-[12px] text-[#6B7280] truncate">
                  {selectedFile ? selectedFile.name : "TJ_Passport_Scan.pdf"} · 3.4 MB
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer border-0"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Success Upload Pill Banner */}
          <div className="bg-[#E3F7EC] text-[#0B4627] rounded-[10px] p-3 flex items-center gap-2 font-medium text-[13px]">
            <CheckCircle2 className="size-4 text-[#1FC16B] shrink-0" />
            <span>
              {selectedFile ? selectedFile.name : "TJ_Passport.pdf"} uploaded successfully
            </span>
          </div>

          {/* Extracted Fields Container */}
          <div className="bg-[#F9FAFB] rounded-[16px] p-5 flex flex-col gap-4 border border-[#F3F4F6]">
            <div className="flex items-center justify-between w-full border-b border-neutral-200/80 pb-3">
              <span className="text-[13px] font-semibold text-[#171717]">
                9 inputs extracted with AI
              </span>
              <Sparkles className="size-4 text-[#7D52F4]" />
            </div>

            {/* Photo */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] text-[#6B7280] font-normal">Photo</span>
              <div className="size-20 rounded-[12px] overflow-hidden bg-neutral-200 border border-neutral-300">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                  alt="Taylor Johnson Photo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Extracted Key-Value Rows */}
            <div className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                <span className="text-[#6B7280]">First Name</span>
                <span className="font-semibold text-[#171717]">Taylor</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                <span className="text-[#6B7280]">Last Name</span>
                <span className="font-semibold text-[#171717]">Johnson</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                <span className="text-[#6B7280]">Date of Birth</span>
                <span className="font-semibold text-[#171717]">14 Jun 1990</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                <span className="text-[#6B7280]">Gender</span>
                <span className="font-semibold text-[#171717]">Male</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                <span className="text-[#6B7280]">Nationality</span>
                <span className="font-semibold text-[#171717] flex items-center gap-1.5">
                  🇺🇸 US
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                <span className="text-[#6B7280]">Country of Birth</span>
                <span className="font-semibold text-[#171717] flex items-center gap-1.5">
                  🇺🇸 US
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                <span className="text-[#6B7280]">Passport Number</span>
                <span className="font-semibold text-[#171717]">LQ41932345</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-neutral-200/60">
                <span className="text-[#6B7280]">Passport Expiry</span>
                <span className="font-semibold text-[#171717]">22 Nov 2027</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-5 rounded-[10px] text-[14px] font-medium border-[#E5E7EB] text-[#171717] hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReplacement}
              className="h-10 px-5 rounded-[10px] text-[14px] font-medium bg-[#171717] hover:bg-black text-white"
            >
              Confirm
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
