"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/utils";

interface CaseInfo {
  caseId: string;
  name: string;
  avatarText?: string;
  avatarUrl?: string;
}

interface DeleteCaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseInfo: CaseInfo | null;
  onConfirm: () => void;
}

export function DeleteCaseModal({
  open,
  onOpenChange,
  caseInfo,
  onConfirm,
}: DeleteCaseModalProps) {
  const [typedLastName, setTypedLastName] = React.useState("");

  const expectedLastName = React.useMemo(() => {
    if (!caseInfo?.name) return "";
    const parts = caseInfo.name.trim().split(/\s+/);
    return parts.length > 0 ? parts[parts.length - 1] : "";
  }, [caseInfo?.name]);

  React.useEffect(() => {
    if (!open) {
      setTypedLastName("");
    }
  }, [open]);

  if (!caseInfo) return null;

  const isConfirmed =
    expectedLastName.length > 0
      ? typedLastName.trim().toLowerCase() === expectedLastName.trim().toLowerCase()
      : true;

  const handleDelete = () => {
    if (isConfirmed) {
      onConfirm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[440px] max-w-[440px] p-0 gap-0 overflow-visible border-0 bg-transparent shadow-none"
      >
        <div
          className="relative bg-white flex flex-col w-[440px] rounded-[20px] border border-[#EBEBEB] shadow-card-large overflow-hidden font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button — top right */}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onOpenChange(false)}
            className="absolute top-5 right-5 z-10 size-6 bg-[#F5F5F5] hover:bg-neutral-200 text-[#5C5C5C] hover:text-[#171717] rounded-[6px] p-0 transition-colors cursor-pointer border-0"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </Button>

          {/* Content */}
          <div className="flex flex-col items-start gap-xl p-5">
            {/* Avatar + case id + name */}
            <div className="flex items-center gap-xl w-full pr-[28px]">
              <div className="shrink-0">
                {caseInfo.avatarUrl ? (
                  <img
                    src={caseInfo.avatarUrl}
                    alt={caseInfo.name}
                    className="size-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="size-14 rounded-full bg-[#EBEBEB] text-[#171717] flex items-center justify-center text-[12px] font-medium select-none">
                    {caseInfo.avatarText || getInitials(caseInfo.name)}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <span className="font-mono font-normal text-[12px] leading-[20px] tracking-[-0.006em] text-[#5C5C5C]">
                  #{caseInfo.caseId}
                </span>
                <span className="font-sans font-medium text-[14px] leading-[20px] tracking-[-0.006em] text-[#171717]">
                  {caseInfo.name}
                </span>
              </div>
            </div>

            {/* Title + Description */}
            <div className="flex flex-col gap-1.5 w-full">
              <p className="font-sans font-medium text-[16px] leading-[24px] tracking-[-0.011em] text-[#171717] m-0">
                Delete case
              </p>
              <p className="font-sans font-normal text-[14px] leading-[20px] tracking-[-0.006em] text-[#5C5C5C] m-0">
                This will permanently delete this case and all associated data including documents, compliance records, and timeline history. This action cannot be undone.
              </p>
            </div>

            {/* Last name confirmation input */}
            {expectedLastName ? (
              <div className="flex flex-col gap-2 w-full pt-1">
                <Label
                  htmlFor="confirm-last-name"
                  className="font-sans text-[13px] leading-[18px] text-[#5C5C5C] font-normal"
                >
                  To confirm deletion, please type the migrant's last name{" "}
                  <span className="font-semibold text-[#171717]">"{expectedLastName}"</span>:
                </Label>
                <Input
                  id="confirm-last-name"
                  type="text"
                  placeholder={`Type "${expectedLastName}" to confirm`}
                  value={typedLastName}
                  onChange={(e) => setTypedLastName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isConfirmed) {
                      e.preventDefault();
                      handleDelete();
                    }
                  }}
                  className="h-10 text-[14px] bg-white border border-neutral-200 focus-visible:border-neutral-900 rounded-[10px] px-3 font-normal"
                  autoComplete="off"
                  autoFocus
                />
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-5 py-4 border-t border-[#EBEBEB] gap-3 bg-white">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              className="h-9 min-w-[70px] px-3 bg-[#F5F5F5] hover:bg-neutral-200 text-[#5C5C5C] hover:text-[#171717] rounded-[8px] text-[14px] font-medium transition-colors border-0 cursor-pointer shadow-none"
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={!isConfirmed}
              onClick={handleDelete}
              className="h-9 px-4 bg-[#FB3748] hover:bg-[#E02434] text-white rounded-[8px] text-[14px] font-medium transition-colors border-0 cursor-pointer shadow-x-small disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              Delete case
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
