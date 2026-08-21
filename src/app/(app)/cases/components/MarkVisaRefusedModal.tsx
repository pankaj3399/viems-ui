"use client";

import * as React from "react";
import { X, ChevronDown, Info } from "lucide-react";
import { REFUSAL_REASONS } from "../case-status-data";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

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

type Step = "select" | "list" | "custom";

export function MarkVisaRefusedModal({
  open,
  onOpenChange,
  caseInfo,
  onConfirm,
}: MarkVisaRefusedModalProps) {
  const [step, setStep] = React.useState<Step>("select");
  const [selectedReason, setSelectedReason] = React.useState<string | null>(null);
  const [customReason, setCustomReason] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setStep("select");
      setSelectedReason(null);
      setCustomReason("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (!selectedReason) return;
    onConfirm(selectedReason, selectedReason === "other" ? customReason : undefined);
    onOpenChange(false);
  };

  const handleApplyReason = () => {
    if (!selectedReason) return;
    if (selectedReason === "other") {
      setStep("custom");
    } else {
      handleConfirm();
    }
  };

  const selectedLabel = REFUSAL_REASONS.find((r) => r.value === selectedReason)?.label;

  const canConfirmCustom = selectedReason === "other" && customReason.trim().length > 0;
  const canApply = !!selectedReason;

  if (!caseInfo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[440px] max-w-[440px] p-0 gap-0 overflow-visible border-0 bg-transparent shadow-none"
      >
        <div
          className="relative bg-white flex flex-col w-[440px] rounded-[20px] border border-[#EBEBEB] shadow-card-large overflow-hidden"
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

          {/* ── STEP: select (initial) or custom (Other text) ── */}
          {(step === "select" || step === "custom") && (
            <>
              {/* Content */}
              <div className="flex flex-col items-center gap-xl p-5 isolate">
                {/* Text group */}
                <div className="flex flex-col gap-5 w-full">
                  {/* Avatar + case id + name */}
                  <div className="flex items-center gap-xl w-full pr-[28px]">
                    {/* Avatar 56px */}
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

                    {/* Case info */}
                    <div className="flex flex-col">
                      <span className="font-mono font-normal text-[12px] leading-[20px] tracking-[-0.006em] text-[#5C5C5C]">
                        #{caseInfo.caseId}
                      </span>
                      <span className="font-sans font-medium text-[14px] leading-[20px] tracking-[-0.006em] text-[#171717]">
                        {caseInfo.name}
                      </span>
                    </div>
                  </div>

                  {/* Title + description */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <p className="font-sans font-medium text-[16px] leading-[24px] tracking-[-0.011em] text-[#171717] m-0">
                      Mark as Visa Refused
                    </p>
                    <p className="font-sans font-normal text-[14px] leading-[20px] tracking-[-0.006em] text-[#5C5C5C] m-0">
                      This will change the case status for {caseInfo.name}.
                    </p>
                  </div>
                </div>

                {/* Select field group */}
                <div className="flex flex-col gap-1 w-full z-10">
                  {/* Label */}
                  <div className="flex items-center">
                    <span className="font-sans font-medium text-[14px] leading-[20px] tracking-[-0.006em] text-[#171717]">
                      Reason for refusal
                    </span>
                  </div>

                  {/* Dropdown trigger */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("list")}
                    className="flex items-center justify-between w-full h-10 px-3 py-2.5 bg-white hover:bg-neutral-50 border border-[#EBEBEB] hover:border-neutral-300 shadow-x-small rounded-[10px] cursor-pointer transition-colors text-left font-normal"
                  >
                    <span
                      className={`flex-1 text-left truncate font-sans text-[14px] leading-[20px] tracking-[-0.006em] ${
                        selectedLabel ? "text-[#171717]" : "text-[#5C5C5C]"
                      }`}
                    >
                      {selectedLabel || "Select a reason..."}
                    </span>
                    <ChevronDown size={20} className="text-[#A4A4A4] shrink-0 ml-2" />
                  </Button>

                  {/* Hint text */}
                  <div className="flex items-start gap-1 w-full mt-0.5">
                    <Info size={16} className="text-[#A4A4A4] shrink-0 mt-0.5" />
                    <span className="font-sans font-normal text-[12px] leading-[16px] text-[#5C5C5C] flex-1">
                      The refusal reason will be recorded in the case timeline and visible on the cases table.
                    </span>
                  </div>

                  {/* Custom reason textarea */}
                  {step === "custom" && (
                    <div className="flex flex-col gap-1 mt-xl w-full">
                      <span className="font-sans font-medium text-[14px] leading-[20px] tracking-[-0.006em] text-[#171717]">
                        Write the reason
                      </span>
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Custom"
                        rows={3}
                        className="w-full resize-none outline-none p-3 bg-white border border-[#EBEBEB] focus:border-[#7D52F4] shadow-x-small rounded-[10px] font-sans font-normal text-[14px] leading-[20px] text-[#171717] transition-colors"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end px-5 py-4 border-t border-[#EBEBEB] gap-3 bg-white">
                {/* Cancel */}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                  className="h-9 min-w-[70px] px-3 bg-[#F5F5F5] hover:bg-neutral-200 text-[#5C5C5C] hover:text-[#171717] rounded-[8px] text-[14px] font-medium transition-colors border-0 cursor-pointer shadow-none"
                >
                  Cancel
                </Button>

                {/* Confirm */}
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={step === "custom" ? !canConfirmCustom : !selectedReason}
                  className="h-9 min-w-[77px] px-4 bg-[#7D52F4] hover:bg-[#683fd1] text-white rounded-[8px] text-[14px] font-medium transition-colors border-0 cursor-pointer shadow-x-small disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm
                </Button>
              </div>
            </>
          )}

          {/* ── STEP: list (reason picker) ── */}
          {step === "list" && (
            <>
              {/* Content */}
              <div className="flex flex-col items-center gap-xl p-5">
                {/* Avatar + case info */}
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
                    <span className="font-mono font-normal text-[12px] leading-[20px] text-[#5C5C5C]">
                      #{caseInfo.caseId}
                    </span>
                    <span className="font-sans font-medium text-[14px] leading-[20px] text-[#171717]">
                      {caseInfo.name}
                    </span>
                  </div>
                </div>

                {/* Title + description */}
                <div className="flex flex-col gap-1.5 w-full">
                  <p className="font-sans font-medium text-[16px] leading-[24px] text-[#171717] m-0">
                    Mark as Visa Refused
                  </p>
                  <p className="font-sans font-normal text-[14px] leading-[20px] text-[#5C5C5C] m-0">
                    This will change the case status for {caseInfo.name}.
                  </p>

                  {/* Reasons list */}
                  <div className="flex flex-col w-full gap-1 mt-2">
                    {REFUSAL_REASONS.map((reason) => (
                      <Button
                        key={reason.value}
                        type="button"
                        variant="ghost"
                        onClick={() => setSelectedReason(reason.value)}
                        className={`group flex items-center justify-between w-full h-auto px-3 py-2.5 rounded-[8px] text-left cursor-pointer transition-colors border-0 ${
                          selectedReason === reason.value ? "bg-[#F5F3FF] hover:bg-[#EFEBFF]" : "hover:bg-neutral-100"
                        }`}
                      >
                        {/* Left: colored dot + label */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`size-2 rounded-full shrink-0 ${
                              reason.value === "cos_revoked" ||
                              reason.value === "incomplete_application" ||
                              reason.value === "previous_overstay"
                                ? "bg-[#1FC16B]"
                                : "bg-[#F6B51E]"
                            }`}
                          />
                          <span
                            className={`font-sans text-[14px] leading-[20px] tracking-[-0.006em] text-[#171717] truncate group-hover:font-medium group-focus-visible:font-medium ${
                              selectedReason === reason.value ? "font-medium" : "font-normal"
                            }`}
                          >
                            {reason.label}
                          </span>
                        </div>

                        {/* Right: Radio selection circle */}
                        <div className="size-5 shrink-0 relative flex items-center justify-center">
                          <div
                            className={`size-5 rounded-full flex items-center justify-center transition-all ${
                              selectedReason === reason.value
                                ? "bg-[#7D52F4] border-2 border-[#7D52F4]"
                                : "bg-white border-2 border-[#EBEBEB] hover:border-neutral-300"
                            }`}
                          >
                            {selectedReason === reason.value && (
                              <div className="size-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end px-5 py-4 border-t border-[#EBEBEB] gap-3 bg-white">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setStep("select");
                    setSelectedReason(null);
                  }}
                  className="h-9 min-w-[70px] px-3 bg-[#F5F5F5] hover:bg-neutral-200 text-[#5C5C5C] hover:text-[#171717] rounded-[8px] text-[14px] font-medium transition-colors border-0 cursor-pointer shadow-none"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleApplyReason}
                  disabled={!canApply}
                  className="h-9 min-w-[77px] px-4 bg-[#7D52F4] hover:bg-[#683fd1] text-white rounded-[8px] text-[14px] font-medium transition-colors border-0 cursor-pointer shadow-x-small disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
