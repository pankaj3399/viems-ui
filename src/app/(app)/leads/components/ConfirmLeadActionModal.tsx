"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

interface LeadInfo {
  id?: number;
  name: string;
}

interface ConfirmLeadActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Which confirmation to show */
  action: "archive" | "delete" | "restore";
  leadInfo: LeadInfo | null;
  onConfirm: () => void;
  busy?: boolean;
}

const COPY = {
  archive: {
    title: "Archive lead",
    description:
      "Archiving will move this lead out of your active leads list. The lead can be restored later from the Archive tab.",
    confirmLabel: "Archive lead",
  },
  delete: {
    title: "Delete lead permanently",
    description:
      "This will permanently delete the archived lead along with its documents. This action cannot be undone.",
    confirmLabel: "Delete forever",
  },
  restore: {
    title: "Restore lead",
    description:
      "The lead will be moved back to your active leads list together with its documents.",
    confirmLabel: "Restore lead",
  },
} as const;

export function ConfirmLeadActionModal({
  open,
  onOpenChange,
  action,
  leadInfo,
  onConfirm,
  busy = false,
}: ConfirmLeadActionModalProps) {
  if (!leadInfo) return null;

  const copy = COPY[action];
  const isDelete = action === "delete";

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!busy) onOpenChange(next); }}>
      <DialogContent
        showCloseButton={false}
        className="w-[440px] max-w-[440px] p-0 gap-0 overflow-visible border-0 bg-transparent shadow-none"
      >
        <div
          className="relative bg-white flex flex-col w-[440px] rounded-[20px] border border-[#EBEBEB] shadow-card-large overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onOpenChange(false)}
            disabled={busy}
            className="absolute top-5 right-5 z-10 size-6 bg-[#F5F5F5] hover:bg-neutral-200 text-[#5C5C5C] hover:text-[#171717] rounded-[6px] p-0 transition-colors cursor-pointer border-0"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </Button>

          {/* Content */}
          <div className="flex flex-col items-start gap-xl p-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-xl w-full pr-[28px]">
              <div className="size-14 rounded-full bg-[#EFEBFF] text-[#7D52F4] flex items-center justify-center text-[12px] font-medium select-none shrink-0">
                {getInitials(leadInfo.name)}
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-normal text-[12px] leading-[20px] tracking-[-0.006em] text-[#5C5C5C]">
                  #{leadInfo.id ?? "—"}
                </span>
                <span className="font-sans font-medium text-[14px] leading-[20px] tracking-[-0.006em] text-[#171717]">
                  {leadInfo.name}
                </span>
              </div>
            </div>

            {/* Title + Description */}
            <div className="flex flex-col gap-1.5 w-full">
              <p className="font-sans font-medium text-[16px] leading-[24px] tracking-[-0.011em] text-[#171717] m-0">
                {copy.title}
              </p>
              <p className={`font-sans font-normal text-[14px] leading-[20px] tracking-[-0.006em] m-0 ${isDelete ? "text-[#681219]" : "text-[#5C5C5C]"}`}>
                {copy.description}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-5 py-4 border-t border-[#EBEBEB] gap-3 bg-white">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="h-9 min-w-[70px] px-3 bg-[#F5F5F5] hover:bg-neutral-200 text-[#5C5C5C] hover:text-[#171717] rounded-[8px] text-[14px] font-medium transition-colors border-0 cursor-pointer shadow-none"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={() => onConfirm()}
              disabled={busy}
              className={`h-9 px-4 text-white rounded-[8px] text-[14px] font-medium transition-colors border-0 cursor-pointer shadow-x-small ${
                isDelete
                  ? "bg-[#B42318] hover:bg-[#912018]"
                  : action === "restore"
                    ? "bg-[#7D52F4] hover:bg-[#683fd1]"
                    : "bg-[#262626] hover:bg-[#171717]"
              }`}
            >
              {busy ? "Working…" : copy.confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
