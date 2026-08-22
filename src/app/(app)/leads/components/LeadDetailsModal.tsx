"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  RiMailLine,
  RiPhoneLine,
  RiFileLine,
  RiCalendarLine,
} from "@remixicon/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { formatLeadDate, getLeadStatusDot, LeadPriorityMeta, getLeadPriorityMeta } from "./lead-utils";

interface LeadDetail {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string;
  descriptionBox?: string;
  status?: string;
  priorityId?: number | null;
  creationDate?: string | null;
  archivationDate?: string | null;
  files?: { id: number; originalName: string; size: number; isDeleted?: boolean }[];
}

interface LeadDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadDetail | null;
  isArchived?: boolean;
  priorities: LeadPriorityMeta[];
  onViewFile?: (fileId: number) => void;
}

function formatFileSize(bytes: number): string {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LeadDetailsModal({
  open,
  onOpenChange,
  lead,
  isArchived = false,
  priorities,
  onViewFile,
}: LeadDetailsModalProps) {
  if (!lead) return null;

  const fullName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Unnamed lead";
  const statusDot = getLeadStatusDot(lead.status || "");
  const priority = getLeadPriorityMeta(lead.priorityId ?? null, priorities);
  const files = (lead.files || []).filter((f) => !f.isDeleted);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[520px] max-w-[calc(100vw-2rem)] p-0 gap-0 flex flex-col overflow-hidden rounded-[20px] bg-white border border-[#F5F5F5] shadow-card-large font-sans grid-cols-none"
        style={{
          boxShadow:
            "0px 1px 1px 0.5px rgba(51, 51, 51, 0.04), 0px 3px 3px -1.5px rgba(51, 51, 51, 0.02), 0px 6px 6px -3px rgba(51, 51, 51, 0.04), 0px 12px 12px -6px rgba(51, 51, 51, 0.04), 0px 24px 24px -12px rgba(51, 51, 51, 0.04), 0px 48px 48px -24px rgba(51, 51, 51, 0.04), 0px 0px 0px 1px #F5F5F5, inset 0px -1px 1px -0.5px rgba(51, 51, 51, 0.06)",
        }}
      >
        {/* Header */}
        <div className="w-full h-[52px] min-h-[52px] px-[20px] py-[16px] flex items-center justify-between border-b border-[#EBEBEB] bg-white shrink-0">
          <h3 className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-[#171717]">
            Lead details{isArchived ? " · archived" : ""}
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="size-6 rounded-[6px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0 flex items-center justify-center p-0 shrink-0"
          >
            <X size={16} strokeWidth={2} />
          </Button>
        </div>

        {/* Body */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto px-[20px] py-[20px] flex flex-col gap-[16px] bg-white">
          {/* Identity */}
          <div className="flex items-center gap-[14px]">
            <Avatar size="lg" className="size-12 rounded-full shrink-0">
              <AvatarFallback className="size-full rounded-full bg-[#EFEBFF] text-[#7D52F4] font-medium text-[13px] leading-none flex items-center justify-center font-sans">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-[4px] min-w-0">
              <span className="text-[16px] font-medium leading-[22px] tracking-[-0.006em] text-[#171717] truncate">
                {fullName}
              </span>
              <div className="flex items-center gap-[10px]">
                <span className="flex items-center gap-[6px]">
                  <span className="size-[6px] rounded-full" style={{ backgroundColor: statusDot }} />
                  <span className="text-[11px] font-medium leading-[12px] tracking-[0.02em] uppercase text-[#5C5C5C]">
                    {lead.status || "—"}
                  </span>
                </span>
                <span className="w-px h-3 bg-[#EBEBEB]" />
                <span className="flex items-center gap-[6px]">
                  <span className="size-[6px] rounded-full" style={{ backgroundColor: priority.color }} />
                  <span className="text-[11px] font-medium leading-[12px] tracking-[0.02em] uppercase text-[#5C5C5C]">
                    {priority.name} priority
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-2 gap-[8px]">
            <div className="rounded-[12px] border border-[#EBEBEB] bg-[#FAFAFA] px-[12px] py-[10px] flex items-center gap-[8px] min-w-0">
              <RiPhoneLine className="size-4 text-[#7B7B7B] shrink-0" />
              <span className="text-[13px] text-[#171717] truncate">{lead.phone || "—"}</span>
            </div>
            <div className="rounded-[12px] border border-[#EBEBEB] bg-[#FAFAFA] px-[12px] py-[10px] flex items-center gap-[8px] min-w-0">
              <RiMailLine className="size-4 text-[#7B7B7B] shrink-0" />
              <span className="text-[13px] text-[#171717] truncate">{lead.email || "—"}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-[8px] text-[13px] text-[#5C5C5C]">
            <RiCalendarLine className="size-4 text-[#7B7B7B]" />
            <span>Created {formatLeadDate(lead.creationDate)}</span>
            {isArchived && lead.archivationDate && (
              <>
                <span className="w-px h-3 bg-[#EBEBEB]" />
                <span>Archived {formatLeadDate(lead.archivationDate)}</span>
              </>
            )}
          </div>

          {/* Description */}
          {(lead.descriptionBox || "").trim().length > 0 && (
            <div className="flex flex-col gap-xs">
              <span className="text-label-sm font-medium text-[#171717]">Description</span>
              <p className="m-0 text-[13px] leading-[20px] text-[#5C5C5C] whitespace-pre-wrap">
                {lead.descriptionBox}
              </p>
            </div>
          )}

          {/* Files */}
          <div className="flex flex-col gap-xs">
            <span className="text-label-sm font-medium text-[#171717]">
              Documents {files.length > 0 ? `(${files.length})` : ""}
            </span>
            {files.length === 0 ? (
              <span className="text-[13px] text-[#A4A4A4]">No documents attached.</span>
            ) : (
              <div className="flex flex-col gap-[6px]">
                {files.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => onViewFile?.(file.id)}
                    disabled={!onViewFile}
                    className={`h-[44px] px-[12px] bg-[#FAFAFA] border border-[#EBEBEB] rounded-[10px] flex items-center gap-[10px] text-left ${onViewFile ? "cursor-pointer hover:bg-[#F5F5F5]" : "cursor-default"} transition-colors`}
                  >
                    <RiFileLine className="size-5 text-[#5C5C5C] shrink-0" />
                    <span className="flex-1 text-[13px] text-[#171717] truncate">{file.originalName}</span>
                    <span className="text-[12px] text-[#A4A4A4] shrink-0">{formatFileSize(file.size)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="w-full h-[68px] min-h-[68px] px-[20px] py-[16px] flex items-center justify-end gap-[12px] border-t border-[#EBEBEB] bg-white shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-[86px] h-[36px] bg-[#F5F5F5] hover:bg-neutral-200 border-0 text-[14px] font-medium text-[#5C5C5C] rounded-[8px]"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
