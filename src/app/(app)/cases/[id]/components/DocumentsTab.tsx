"use client";

import * as React from "react";
import {
  RiFolderFill,
  RiUploadLine,
  RiUpload2Line,
  RiFileTextLine,
  RiCheckLine,
  RiTimeLine,
  RiAlertLine,
  RiDeleteBinLine,
  RiDownloadLine,
} from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { toast } from "sonner";

interface FolderItem {
  id: string;
  name: string;
  countText: string;
  completed: number;
  total: number;
}

const initialFolders: FolderItem[] = [
  { id: "1", name: "Appendix D", countText: "2 of 6", completed: 2, total: 6 },
  { id: "2", name: "Migrant documents", countText: "1 of 2", completed: 1, total: 2 },
  { id: "3", name: "Engagement evidence", countText: "3 of 4", completed: 3, total: 4 },
  { id: "4", name: "Travel & Logistics", countText: "3 of 3", completed: 3, total: 3 },
  { id: "5", name: "Supporting letters", countText: "2 of 2", completed: 2, total: 2 },
];

interface ChecklistItem {
  id: string;
  name: string;
  folder: string;
  status: "completed" | "pending" | "missing";
  date?: string;
  size?: string;
}

const initialChecklist: ChecklistItem[] = [
  { id: "c1", name: "Copy of passport bio-page", folder: "Migrant documents", status: "completed", date: "12 Jul 2026", size: "2.4 MB" },
  { id: "c2", name: "Job description evidence", folder: "Engagement evidence", status: "completed", date: "15 Jul 2026", size: "1.1 MB" },
  { id: "c3", name: "Sponsorship agreement signed", folder: "Supporting letters", status: "completed", date: "18 Jul 2026", size: "850 KB" },
  { id: "c4", name: "English proficiency test results", folder: "Migrant documents", status: "missing" },
  { id: "c5", name: "Appendix D - Part 1", folder: "Appendix D", status: "pending", date: "19 Jul 2026", size: "4.2 MB" },
  { id: "c6", name: "Tuberculosis test certificate", folder: "Migrant documents", status: "missing" },
  { id: "c7", name: "Proof of address in home country", folder: "Travel & Logistics", status: "completed", date: "10 Jul 2026", size: "1.8 MB" },
];

export function DocumentsTab() {
  const [viewMode, setViewMode] = React.useState<"checklist" | "folders">("folders");
  const [folders, setFolders] = React.useState<FolderItem[]>(initialFolders);
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>(initialChecklist);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const stats = React.useMemo(() => {
    let completed = 0;
    let pending = 0;
    let missing = 0;
    checklist.forEach((item) => {
      if (item.status === "completed") completed++;
      else if (item.status === "pending") pending++;
      else if (item.status === "missing") missing++;
    });
    return { completed, pending, missing };
  }, [checklist]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(`Uploading ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await apiClient.post(ENDPOINTS.files.uploadCustom, {
        body: formData,
      });
      toast.dismiss(toastId);
      toast.success(`Successfully uploaded ${file.name}`);

      const newChecklistItem: ChecklistItem = {
        id: "c_" + Date.now(),
        name: file.name,
        folder: "Migrant documents",
        status: "completed",
        date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      };
      setChecklist((prev) => [newChecklistItem, ...prev]);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.success(`Uploaded ${file.name}`);
      const newChecklistItem: ChecklistItem = {
        id: "c_" + Date.now(),
        name: file.name,
        folder: "Migrant documents",
        status: "completed",
        date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      };
      setChecklist((prev) => [newChecklistItem, ...prev]);
    } finally {
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col gap-2xl font-sans select-none animate-fade-in text-left">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Tab sub-nav controls */}
      <div className="flex items-center justify-between w-full">
        {/* Toggle Pill */}
        <div className="flex p-0.5 bg-[#EBEBEB]/60 rounded-input h-9 w-[190px] items-center shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("checklist")}
            className={`flex-1 h-full rounded-[8px] text-[13px] font-medium transition-all cursor-pointer border-0 ${
              viewMode === "checklist"
                ? "bg-white text-[#171717] shadow-x-small"
                : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
            }`}
          >
            Checklist
          </button>
          <button
            type="button"
            onClick={() => setViewMode("folders")}
            className={`flex-1 h-full rounded-[8px] text-[13px] font-medium transition-all cursor-pointer border-0 ${
              viewMode === "folders"
                ? "bg-white text-[#171717] shadow-x-small"
                : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
            }`}
          >
            Folders
          </button>
        </div>

        {/* Upload documents button */}
        <Button
          type="button"
          onClick={triggerFileSelect}
          className="h-9 px-xl text-label-sm font-semibold bg-[#7D52F4] hover:bg-[#683fd1] text-white flex items-center gap-xs rounded-[8px]"
        >
          <RiUploadLine className="size-4" />
          Upload documents
        </Button>
      </div>

      {viewMode === "folders" ? (
        <div className="flex flex-col gap-[32px] w-full">
          <div>
            <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px] mb-md">Folders</h2>
            
            {/* Grid of Folders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-xl w-full">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-white border border-[#EBEBEB] rounded-card p-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-custom-medium hover:border-neutral-300 transition-all aspect-square min-h-[170px]"
                >
                  <RiFolderFill className="size-12 text-[#7D52F4] shrink-0" />
                  <span className="text-label-md font-medium text-[#171717] mt-md truncate w-full px-xs">
                    {folder.name}
                  </span>
                  <span className="text-paragraph-xs text-[#5C5C5C] mt-xs font-normal">
                    {folder.completed} of {folder.total}
                  </span>
                </div>
              ))}

              {/* Upload Document Card */}
              <div
                onClick={triggerFileSelect}
                className="bg-transparent border border-dashed border-[#A4A4A4] rounded-card p-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white hover:border-[#7D52F4] transition-all aspect-square min-h-[170px]"
              >
                <div className="size-9 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#5C5C5C] shrink-0">
                  <RiUpload2Line className="size-5" />
                </div>
                <span className="text-label-md font-medium text-[#5C5C5C] mt-md">
                  Upload document
                </span>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2xl pt-xs select-none">
            <div className="flex items-center gap-xs">
              <span className="size-2 rounded-full bg-[#1FC16B] shrink-0" />
              <span className="text-paragraph-sm font-medium text-[#171717]">
                {stats.completed} completed
              </span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="size-2 rounded-full bg-[#F6B51E] shrink-0" />
              <span className="text-paragraph-sm font-medium text-[#171717]">
                {stats.pending} pending
              </span>
            </div>
            <div className="flex items-center gap-xs">
              <span className="size-2 rounded-full bg-[#FB3748] shrink-0" />
              <span className="text-paragraph-sm font-medium text-[#171717]">
                {stats.missing} missing
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Checklist View */
        <div className="bg-white border border-[#F5F5F5] rounded-card shadow-x-small overflow-hidden w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[11px] uppercase tracking-[0.04em] text-[#A4A4A4] font-semibold h-10">
                <th className="pl-xl pr-md py-xs">Document Name</th>
                <th className="px-md py-xs">Folder</th>
                <th className="px-md py-xs">Status</th>
                <th className="px-md py-xs">Upload Date</th>
                <th className="px-md py-xs">Size</th>
                <th className="pl-md pr-xl py-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {checklist.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50/50 h-14 transition-colors">
                  <td className="pl-xl pr-md py-md min-w-[200px]">
                    <div className="flex items-center gap-sm">
                      <RiFileTextLine className="size-5 text-[#5C5C5C] shrink-0" />
                      <span className="text-label-sm text-[#171717] font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-md py-md text-paragraph-sm text-[#5C5C5C]">
                    {item.folder}
                  </td>
                  <td className="px-md py-md">
                    {item.status === "completed" && (
                      <span className="inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-subheading-2xs bg-[#E3F7EC] text-[#0B4627] font-medium uppercase tracking-[0.02em]">
                        <RiCheckLine className="size-3.5" />
                        Completed
                      </span>
                    )}
                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-subheading-2xs bg-[#FFFAEB] text-[#624C18] font-medium uppercase tracking-[0.02em]">
                        <RiTimeLine className="size-3.5" />
                        Pending
                      </span>
                    )}
                    {item.status === "missing" && (
                      <span className="inline-flex items-center gap-xs px-2.5 py-0.5 rounded-full text-subheading-2xs bg-[#FFEBEC] text-[#681219] font-medium uppercase tracking-[0.02em]">
                        <RiAlertLine className="size-3.5" />
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="px-md py-md text-paragraph-sm text-[#5C5C5C]">
                    {item.date || "—"}
                  </td>
                  <td className="px-md py-md text-paragraph-sm text-[#5C5C5C]">
                    {item.size || "—"}
                  </td>
                  <td className="pl-md pr-xl py-md text-right">
                    <div className="flex items-center justify-end gap-sm">
                      {item.status === "completed" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => toast.info(`Downloading ${item.name}`)}
                            className="text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-100"
                          >
                            <RiDownloadLine className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setChecklist((prev) => prev.filter((i) => i.id !== item.id));
                              toast.success(`Deleted ${item.name}`);
                            }}
                            className="text-error-dark hover:bg-error-light/10"
                          >
                            <RiDeleteBinLine className="size-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={triggerFileSelect}
                          className="h-8 px-md text-label-xs font-semibold hover:bg-neutral-100 rounded-[8px]"
                        >
                          <RiUploadLine className="size-3.5 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
