"use client";

import * as React from "react";
import {
  X,
  Download,
  RotateCw,
  Maximize2,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  fileUrl?: string;
}

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: DocumentItem | null;
  onReplace?: () => void;
}

export function FilePreviewModal({
  isOpen,
  onClose,
  document,
  onReplace,
}: FilePreviewModalProps) {
  const [activeTab, setActiveTab] = React.useState<"details" | "ai" | "history">("details");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [zoomLevel, setZoomLevel] = React.useState(100);
  const totalPages = 4;

  if (!isOpen || !document) return null;

  const fileName = document.subtitle.split("·")[0]?.trim() || `${document.name}.pdf`;
  const fileSize = document.subtitle.split("·")[1]?.trim() || "3.4 MB";
  const uploadDate = document.date || "Mar 8, 2026";

  const handleDownload = () => {
    // Create a mock download link
    const element = window.document.createElement("a");
    const file = new Blob([`Mock file content for ${document.name}`], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
      {/* Modal Container */}
      <div className="bg-white rounded-[20px] max-w-[1240px] w-full h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* ─── Top Header Bar ─────────────────────────────────────────── */}
        <div className="h-[64px] px-6 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          {/* Document Title Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-[10px] bg-[#171717] flex items-center justify-center text-white shrink-0">
              <FileText className="size-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[16px] font-semibold text-[#171717] truncate leading-tight">
                {document.name}
              </h2>
              <p className="text-[13px] text-[#6B7280] font-normal truncate mt-0.5">
                {fileName} · {fileSize} · Uploaded {uploadDate}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onReplace}
              className="h-9 px-3.5 rounded-[8px] border-[#E5E7EB] text-[13px] font-medium text-[#171717] hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="size-3.5 text-[#5C5C5C]" />
              <span>Replace</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDownload}
              className="h-9 px-3.5 rounded-[8px] border-[#E5E7EB] text-[13px] font-medium text-[#171717] hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="size-3.5 text-[#5C5C5C]" />
              <span>Download</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="size-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer border-0 ml-1"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* ─── Main Body: Split View (Canvas Left + Sidebar Right) ────── */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: Document Canvas & Controls */}
          <div className="flex-1 bg-[#F5F5F5] flex flex-col overflow-hidden relative">
            
            {/* Toolbar Controls Bar */}
            <div className="h-[48px] bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between text-[13px] text-[#171717] font-medium shrink-0">
              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                  className="size-7 rounded-[6px] hover:bg-neutral-100 flex items-center justify-center text-[#5C5C5C] border-0 cursor-pointer"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-12 text-center text-[13px] font-medium">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
                  className="size-7 rounded-[6px] hover:bg-neutral-100 flex items-center justify-center text-[#5C5C5C] border-0 cursor-pointer"
                >
                  <Plus className="size-4" />
                </button>
                <div className="h-4 w-px bg-neutral-200 mx-1" />
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="px-2.5 py-1 rounded-[6px] hover:bg-neutral-100 text-[#5C5C5C] hover:text-[#171717] border-0 cursor-pointer"
                >
                  Fit
                </button>
              </div>

              {/* Page Pagination */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="size-7 rounded-[6px] hover:bg-neutral-100 flex items-center justify-center text-[#5C5C5C] disabled:opacity-30 border-0 cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-[13px] font-medium text-[#171717]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="size-7 rounded-[6px] hover:bg-neutral-100 flex items-center justify-center text-[#5C5C5C] disabled:opacity-30 border-0 cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* View Tools */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] hover:bg-neutral-100 text-[#5C5C5C] hover:text-[#171717] border-0 cursor-pointer"
                >
                  <RotateCw className="size-3.5" />
                  <span>Rotate</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] hover:bg-neutral-100 text-[#5C5C5C] hover:text-[#171717] border-0 cursor-pointer"
                >
                  <Maximize2 className="size-3.5" />
                  <span>Fullscreen</span>
                </button>
              </div>
            </div>

            {/* Document Paper Preview Canvas */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto relative">
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transition: "transform 0.15s ease" }}
                className="bg-white rounded-[12px] shadow-xl max-w-[540px] w-full p-8 min-h-[620px] flex flex-col gap-6 text-[#171717] border border-neutral-200/80 relative"
              >
                {/* Paper Header */}
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[10px] font-bold">
                      PDF
                    </span>
                    <span className="text-[14px] font-semibold text-[#171717]">
                      {document.name}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#A4A4A4]">Page {currentPage} of {totalPages}</span>
                </div>

                {/* ─── REAL PDF VIEWER IFRAME ─────────────────────────────── */}
                <div className="w-full flex-1 min-h-[560px] rounded-[8px] overflow-hidden bg-neutral-100 border border-neutral-200">
                  <iframe
                    src={document.fileUrl || `/sample-files/${document.name.toLowerCase().includes("passport") ? "TJ_Passport_Scan.pdf" : document.name.toLowerCase().includes("visa") ? "TJ_eVisa_confirmation.pdf" : document.name.toLowerCase().includes("contract") ? "AX_Studios_Contract_TJ.pdf" : "walkthrough.pdf"}`}
                    className="w-full h-full min-h-[560px] border-0"
                    title={document.name}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Page Thumbnails Strip */}
            <div className="h-[72px] bg-white border-t border-[#E5E7EB] flex items-center justify-center gap-3 px-4 shrink-0">
              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-12 h-14 rounded-[8px] border-2 flex flex-col items-center justify-center transition-all cursor-pointer bg-[#F9FAFB] ${
                    currentPage === page
                      ? "border-[#171717] bg-white shadow-xs"
                      : "border-[#E5E7EB] hover:border-neutral-400"
                  }`}
                >
                  <div className="w-6 h-7 border border-neutral-300 rounded flex flex-col gap-1 p-1 bg-white mb-1">
                    <div className="h-1 bg-neutral-300 rounded w-full" />
                    <div className="h-1 bg-neutral-200 rounded w-3/4" />
                  </div>
                  <span className="text-[11px] font-medium text-[#171717]">{page}</span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT SIDEBAR: Details / AI Fields / History */}
          <div className="w-[340px] bg-white border-l border-[#E5E7EB] flex flex-col shrink-0">
            {/* Tabs Header */}
            <div className="flex items-center gap-6 px-6 pt-4 border-b border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={`pb-3 text-[14px] font-medium transition-colors border-b-2 cursor-pointer ${
                  activeTab === "details"
                    ? "border-[#7D52F4] text-[#171717]"
                    : "border-transparent text-[#6B7280] hover:text-[#171717]"
                }`}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`pb-3 text-[14px] font-medium transition-colors border-b-2 cursor-pointer ${
                  activeTab === "ai"
                    ? "border-[#7D52F4] text-[#171717]"
                    : "border-transparent text-[#6B7280] hover:text-[#171717]"
                }`}
              >
                AI fields
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`pb-3 text-[14px] font-medium transition-colors border-b-2 cursor-pointer ${
                  activeTab === "history"
                    ? "border-[#7D52F4] text-[#171717]"
                    : "border-transparent text-[#6B7280] hover:text-[#171717]"
                }`}
              >
                History
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
              {activeTab === "details" && (
                <>
                  {/* Document Information Section */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A4A4A4]">
                      DOCUMENT INFORMATION
                    </h3>
                    
                    <div className="flex flex-col gap-2.5 text-[13px]">
                      <div className="flex justify-between items-center py-1 border-b border-neutral-100">
                        <span className="text-[#6B7280]">Document Type</span>
                        <span className="font-semibold text-[#171717]">{document.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-neutral-100">
                        <span className="text-[#6B7280]">File Name</span>
                        <span className="font-medium text-[#171717] truncate max-w-[180px]">
                          {fileName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-neutral-100">
                        <span className="text-[#6B7280]">File Size</span>
                        <span className="font-medium text-[#171717]">{fileSize}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-neutral-100">
                        <span className="text-[#6B7280]">Format</span>
                        <span className="font-medium text-[#171717]">.pdf</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-neutral-100">
                        <span className="text-[#6B7280]">Pages</span>
                        <span className="font-medium text-[#171717]">{totalPages}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-neutral-100">
                        <span className="text-[#6B7280]">Uploaded</span>
                        <span className="font-medium text-[#171717]">{uploadDate}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-neutral-100">
                        <span className="text-[#6B7280]">Uploaded by</span>
                        <span className="font-medium text-[#171717]">Alex Marin</span>
                      </div>
                    </div>
                  </div>

                  {/* Case Context Card */}
                  <div className="flex flex-col gap-2.5 pt-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A4A4A4]">
                      CASE
                    </h3>
                    <div className="bg-[#F9FAFB] rounded-[12px] p-3.5 flex items-center gap-3 border border-[#F3F4F6]">
                      <div className="size-10 rounded-full bg-neutral-800 text-white font-medium flex items-center justify-center shrink-0">
                        TJ
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[14px] font-semibold text-[#171717] truncate">
                          Taylor Johnson
                        </span>
                        <span className="text-[12px] text-[#6B7280] font-normal truncate">
                          #438/2026 · AX Studios
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "ai" && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A4A4A4]">
                      AI EXTRACTED FIELDS
                    </h3>
                    <p className="text-[12px] text-[#6B7280] leading-relaxed">
                      Fields automatically extracted by AI when this document was uploaded.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 pt-2 text-[13px]">
                    <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <span className="text-[#6B7280]">Visa Type</span>
                      <div className="flex items-center gap-1.5 font-medium text-[#171717]">
                        <span>Creative Worker</span>
                        <span className="text-[#10B981] font-bold text-[12px]">✓</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <span className="text-[#6B7280]">Grant Date</span>
                      <div className="flex items-center gap-1.5 font-medium text-[#171717]">
                        <span>Mar 8, 2028</span>
                        <span className="text-[#10B981] font-bold text-[12px]">✓</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <span className="text-[#6B7280]">Expiry Date</span>
                      <div className="flex items-center gap-1.5 font-medium text-[#171717]">
                        <span>Mar 8, 2027</span>
                        <span className="text-[#10B981] font-bold text-[12px]">✓</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                      <span className="text-[#6B7280]">Conditions</span>
                      <div className="flex items-center gap-1.5 font-medium text-[#171717]">
                        <span>...</span>
                        <span className="text-[#F59E0B] font-bold text-[12px]">!</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="flex flex-col gap-5 text-[13px]">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#A4A4A4]">
                    DOCUMENT HISTORY TRAIL
                  </h3>

                  <div className="flex flex-col gap-5 pl-2 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-px before:bg-neutral-200">
                    {/* Item 1 */}
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="size-7 rounded-full bg-[#F3E8FF] text-[#7D52F4] flex items-center justify-center shrink-0 border border-white">
                        <Sparkles className="size-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0 pt-0.5">
                        <span className="font-semibold text-[#171717]">
                          AI extracted visa details
                        </span>
                        <span className="text-[#6B7280] text-[12px]">
                          System · 13 Mar 2026, 14:06
                        </span>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="size-7 rounded-full bg-neutral-100 text-[#5C5C5C] flex items-center justify-center shrink-0 border border-white">
                        <FileText className="size-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0 pt-0.5">
                        <span className="font-semibold text-[#171717]">
                          Uploaded document
                        </span>
                        <span className="text-[#6B7280] text-[12px]">
                          Alex Marin · 13 Mar 2026, 14:06
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onReplace}
                      className="h-8 px-3 rounded-[6px] text-[12px] font-medium border-[#E5E7EB] text-[#171717] hover:bg-neutral-50 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="size-3 text-[#5C5C5C]" />
                      <span>Replace</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDownload}
                      className="h-8 px-3 rounded-[6px] text-[12px] font-medium border-[#E5E7EB] text-[#171717] hover:bg-neutral-50 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="size-3 text-[#5C5C5C]" />
                      <span>Download</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
