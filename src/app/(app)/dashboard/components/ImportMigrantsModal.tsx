"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RiUploadCloud2Line, RiFileExcelLine, RiCheckLine } from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

interface ImportMigrantsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImportMigrantsModal({
  open,
  onOpenChange,
  onSuccess,
}: ImportMigrantsModalProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError("File size exceeds the 10MB limit.");
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setUploadSuccess(false);
        setUploadError(null);
      }
    }
    if (e.target) e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError("File size exceeds the 10MB limit.");
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setUploadSuccess(false);
        setUploadError(null);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      let success = false;
      try {
        await apiClient.post(`${ENDPOINTS.migrants.base}/import`, formData);
        success = true;
      } catch (err1) {
        try {
          await apiClient.post(`${ENDPOINTS.files.base}/upload/migrants/1`, formData);
          success = true;
        } catch (err2) {
          throw err2;
        }
      }

      if (success) {
        setIsUploading(false);
        setUploadSuccess(true);
        if (onSuccess) onSuccess();

        setTimeout(() => {
          onOpenChange(false);
          setSelectedFile(null);
          setUploadSuccess(false);
        }, 1000);
      }
    } catch (err: any) {
      console.error("Import upload failed:", err);
      setIsUploading(false);
      setUploadSuccess(false);
      setUploadError(err?.message || "Failed to import file. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-aeonik-medium text-[20px]">Import Migrants & CoS Data</DialogTitle>
          <DialogDescription className="text-paragraph-sm text-[#5C5C5C]">
            Upload a CSV or Excel spreadsheet containing migrant records, visa details, or CoS assignments.
          </DialogDescription>
        </DialogHeader>

        <div className="py-md flex flex-col gap-lg font-sans">
          {uploadError && (
            <div className="bg-[#FFEBEC] border border-[#FECDCA] rounded-[10px] p-3 text-[13px] text-[#FB3748]">
              {uploadError}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />

          <button
            type="button"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-[12px] p-2xl flex flex-col items-center justify-center gap-md cursor-pointer transition-colors ${
              selectedFile
                ? "border-brand-medium bg-brand-light/30"
                : "border-[#EBEBEB] hover:border-brand-medium bg-[#FAFAFA]"
            }`}
          >
            {selectedFile ? (
              <div className="flex items-center gap-md">
                <RiFileExcelLine className="size-8 text-brand-medium shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[14px] font-semibold text-[#171717] truncate max-w-[240px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-[12px] text-[#7B7B7B]">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="size-10 rounded-full bg-[#EFEBFF] flex items-center justify-center text-[#7D52F4]">
                  <RiUploadCloud2Line className="size-5" />
                </div>
                <div className="text-center">
                  <span className="text-[14px] font-semibold text-[#171717]">
                    Click to browse
                  </span>{" "}
                  <span className="text-[14px] text-[#5C5C5C]">or drag and drop</span>
                  <p className="text-[12px] text-[#A4A4A4] mt-1">
                    Supports .CSV, .XLSX (max 10MB)
                  </p>
                </div>
              </>
            )}
          </button>

          {uploadSuccess && (
            <div className="flex items-center gap-xs p-md bg-[#E1FBF2] text-[#065F46] rounded-[8px] text-[13px] font-medium">
              <RiCheckLine className="size-4 shrink-0" />
              Imported successfully! Refreshing dataset...
            </div>
          )}
        </div>

        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isUploading || uploadSuccess}
            className="bg-[#7D52F4] hover:bg-brand-dark text-white"
          >
            {isUploading ? "Processing..." : "Start Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
