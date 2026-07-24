"use client";

import * as React from "react";
import { Upload, Sparkles, X, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SmartUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onUploadSuccess?: (files: File[]) => void;
}

export function SmartUploadModal({
  isOpen,
  onClose,
  title = "Upload files with Smart Upload",
  onUploadSuccess,
}: SmartUploadModalProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset state on open/close
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setIsUploading(false);
      setDragActive(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      const droppedFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    if (selectedFiles.length === 0) {
      fileInputRef.current?.click();
      return;
    }

    setIsUploading(true);
    try {
      if (onUploadSuccess) {
        await onUploadSuccess(selectedFiles);
      }
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in select-none">
      {/* Modal Card */}
      <div className="bg-white rounded-[20px] max-w-[480px] w-full p-6 shadow-2xl flex flex-col gap-5 border border-neutral-100 animate-in fade-in zoom-in-95 duration-150 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <h2 className="text-[18px] font-semibold text-[#171717] tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer border-0"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Dashed Drag & Drop Box */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-[16px] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative group ${
            dragActive
              ? "border-[#7D52F4] bg-[#F3E8FF]/30"
              : "border-[#E5E7EB] hover:border-[#7D52F4] bg-white"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,.mp4"
          />

          {/* Sparkles Icon on Top Right of Dropzone */}
          <div className="absolute top-3.5 right-3.5 text-[#7D52F4] p-1">
            <Sparkles className="size-4" />
          </div>

          {/* Upload Icon Pill Container */}
          <div className="size-12 rounded-[14px] bg-[#F3E8FF] flex items-center justify-center text-[#7D52F4] mb-3 group-hover:scale-105 transition-transform shrink-0">
            <Upload className="size-6" />
          </div>

          <span className="text-[14px] font-semibold text-[#171717]">
            Choose a file or drag & drop it here.
          </span>
          <span className="text-[12px] text-[#6B7280] mt-1 font-normal">
            JPEG, PNG, PDF, and MP4 formats, up to 50 MB.
          </span>
        </div>

        {/* Selected Files List Preview */}
        {selectedFiles.length > 0 && (
          <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 bg-[#F9FAFB] rounded-[10px] border border-[#E5E7EB]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="size-4 text-[#7D52F4] shrink-0" />
                  <span className="text-[13px] font-medium text-[#171717] truncate">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-[#6B7280] shrink-0">
                    ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-neutral-400 hover:text-red-500 transition-colors p-1 border-0 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* AI Auto-fill Enabled Banner */}
        <div className="bg-[#F9FAFB] rounded-[14px] p-4 flex flex-col gap-1.5 border border-[#F3F4F6]">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-[6px] bg-[#7D52F4] flex items-center justify-center text-white shrink-0">
              <Sparkles className="size-3" />
            </div>
            <span className="text-[14px] font-semibold text-[#171717]">
              AI auto-fill enabled
            </span>
          </div>
          <p className="text-[13px] text-[#6B7280] font-normal leading-relaxed pl-7">
            Drop your files in and AI categorises them, extracts key details, updates the profile, and flags anything missing or mismatched.
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
            className="h-10 px-5 rounded-[10px] text-[14px] font-medium border-[#E5E7EB] text-[#171717] hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={isUploading}
            className="h-10 px-5 rounded-[10px] text-[14px] font-medium bg-[#7D52F4] hover:bg-[#683fd1] text-white transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1.5 shrink-0" />
                Uploading...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
