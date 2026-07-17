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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { REFUSAL_REASONS, type RefusalReason } from "../case-status-data";
import { ChevronDown, AlertTriangle, Check } from "lucide-react";

interface CaseInfo {
  caseId: string;
  name: string;
  avatarText?: string;
  avatarUrl?: string;
}

interface MarkVisaRefusedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseInfo: CaseInfo | null;
  onConfirm: (reason: string, customText?: string) => void;
}

export function MarkVisaRefusedModal({
  open,
  onOpenChange,
  caseInfo,
  onConfirm,
}: MarkVisaRefusedModalProps) {
  const [selectedReason, setSelectedReason] = React.useState<string | null>(null);
  const [customReason, setCustomReason] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setSelectedReason(null);
      setCustomReason("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (!selectedReason) return;
    if (selectedReason === "other") {
      onConfirm(selectedReason, customReason);
    } else {
      onConfirm(selectedReason);
    }
    onOpenChange(false);
  };

  const isOther = selectedReason === "other";
  const canConfirm = selectedReason && (isOther ? customReason.trim().length > 0 : true);

  if (!caseInfo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[440px] p-0 gap-0 overflow-visible"
      >
        <DialogHeader className="px-2xl pt-2xl pb-lg">
          {/* Case Info Header */}
          <div className="flex items-center gap-lg mb-lg">
            {caseInfo.avatarUrl ? (
              <img
                src={caseInfo.avatarUrl}
                alt={caseInfo.name}
                className="size-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="size-10 rounded-full bg-[#CAC0FF] text-[#351A75] flex items-center justify-center text-xs font-semibold shrink-0 select-none">
                {caseInfo.avatarText || caseInfo.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-label-sm font-semibold text-[#171717] truncate">
                {caseInfo.name}
              </span>
              <span className="text-paragraph-xs text-[#5C5C5C]">
                Case {caseInfo.caseId}
              </span>
            </div>
          </div>
          <DialogTitle>Mark as Visa Refused</DialogTitle>
          <DialogDescription>
            This will change the case status for {caseInfo.name} to &quot;Visa
            Refused&quot;. This action can be reverted later.
          </DialogDescription>
        </DialogHeader>

        <div className="px-2xl pb-lg">
          {/* Reason Selector */}
          <Label className="text-label-sm font-medium text-[#171717] mb-sm block">
            Reason for refusal
          </Label>
          <Select value={selectedReason} onValueChange={setSelectedReason}>
            <SelectTrigger className="w-full h-10 px-lg text-paragraph-sm">
              <SelectValue placeholder="Select a reason..." />
            </SelectTrigger>
            <SelectContent className="w-[392px] bg-white border border-neutral-200 rounded-card shadow-card-large">
              {REFUSAL_REASONS.map((reason) => (
                <SelectItem key={reason.value} value={reason.value} className="px-lg py-md text-[#171717]">
                  {reason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Other Reason Textarea */}
          {isOther && (
            <div className="mt-lg animate-in fade-in-0 slide-in-from-top-2 duration-200">
              <Label className="text-label-sm font-medium text-[#171717] mb-sm block">
                Write the reason
              </Label>
              <Textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe the reason for refusal..."
                rows={4}
                className="w-full px-lg py-md rounded-input border border-neutral-200 bg-white text-paragraph-sm placeholder-[#A4A4A4] focus-visible:border-[#7D52F4] focus-visible:ring-2 focus-visible:ring-[#7D52F4]/20 transition-all resize-none font-sans"
              />
            </div>
          )}

          {/* Info Note - shown when a reason is selected */}
          {selectedReason && !isOther && (
            <div className="mt-lg animate-in fade-in-0 slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-sm p-lg rounded-input bg-[#FFFAEB] border border-[#FDE68A]/50">
                <AlertTriangle className="size-4 text-[#D97706] shrink-0 mt-0.5" />
                <p className="text-paragraph-xs text-[#92400E] leading-relaxed">
                  Marking this case as refused will update the case status and may
                  trigger automated notifications to the applicant and compliance
                  team.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t-0 bg-transparent px-2xl pt-sm pb-2xl flex-row justify-end gap-sm">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-button font-semibold text-neutral-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="h-9 px-4 rounded-button font-semibold bg-[#E02424] hover:bg-[#C81E1E] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
