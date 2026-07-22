"use client";

import * as React from "react";
import { X, ChevronDown, Info } from "lucide-react";
import { REFUSAL_REASONS } from "../case-status-data";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
          className="relative bg-white flex flex-col w-[440px] select-none"
          style={{
            borderRadius: 20,
            border: "1px solid #EBEBEB",
            boxShadow: "0px 16px 32px -12px rgba(14,18,27,0.1)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button — top right */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-5 right-5 z-10 flex items-center justify-center cursor-pointer"
            style={{
              width: 24,
              height: 24,
              background: "#F7F7F7",
              borderRadius: 6,
              border: "none",
            }}
            aria-label="Close"
          >
            <X size={16} color="#5C5C5C" strokeWidth={2} />
          </button>

          {/* ── STEP: select (initial) or custom (Other text) ── */}
          {(step === "select" || step === "custom") && (
            <>
              {/* Content */}
              <div className="flex flex-col items-center gap-xl p-5" style={{ isolation: "isolate" }}>
                {/* Text group */}
                <div className="flex flex-col gap-5 w-full">
                  {/* Avatar + case id + name */}
                  <div className="flex items-center gap-xl w-full">
                    {/* Avatar 56px */}
                    <div className="shrink-0">
                      {caseInfo.avatarUrl ? (
                        <img
                          src={caseInfo.avatarUrl}
                          alt={caseInfo.name}
                          className="rounded-full object-cover"
                          style={{ width: 56, height: 56 }}
                        />
                      ) : (
                        <div
                          className="rounded-full bg-[#CAC0FF] text-[#351A75] flex items-center justify-center text-sm font-semibold select-none"
                          style={{ width: 56, height: 56 }}
                        >
                          {caseInfo.avatarText || caseInfo.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Case info */}
                    <div className="flex flex-col">
                      <span
                        style={{
                          fontFamily: "'Geist Mono', monospace",
                          fontWeight: 400,
                          fontSize: 12,
                          lineHeight: "20px",
                          letterSpacing: "-0.006em",
                          color: "#5C5C5C",
                        }}
                      >
                        #{caseInfo.caseId}
                      </span>
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: 14,
                          lineHeight: "20px",
                          letterSpacing: "-0.006em",
                          color: "#171717",
                        }}
                      >
                        {caseInfo.name}
                      </span>
                    </div>
                  </div>

                  {/* Title + description */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontSize: 16,
                        lineHeight: "24px",
                        letterSpacing: "-0.011em",
                        color: "#171717",
                        margin: 0,
                      }}
                    >
                      Mark as Visa Refused
                    </p>
                    <p
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: "20px",
                        letterSpacing: "-0.006em",
                        color: "#5C5C5C",
                        margin: 0,
                      }}
                    >
                      This will change the case status for {caseInfo.name}.
                    </p>
                  </div>
                </div>

                {/* Select field group */}
                <div className="flex flex-col gap-1 w-full" style={{ zIndex: 1 }}>
                  {/* Label */}
                  <div className="flex items-center">
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontSize: 14,
                        lineHeight: "20px",
                        letterSpacing: "-0.006em",
                        color: "#171717",
                      }}
                    >
                      Reason for refusal
                    </span>
                  </div>

                  {/* Dropdown trigger */}
                  <button
                    type="button"
                    onClick={() => setStep("list")}
                    className="flex items-center w-full cursor-pointer"
                    style={{
                      height: 40,
                      padding: "10px 10px 10px 12px",
                      gap: 8,
                      background: "#FFFFFF",
                      border: "1px solid #EBEBEB",
                      boxShadow: "0px 1px 2px rgba(10,13,20,0.03)",
                      borderRadius: 10,
                    }}
                  >
                    <span
                      className="flex-1 text-left truncate"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: "20px",
                        letterSpacing: "-0.006em",
                        color: selectedLabel ? "#171717" : "#5C5C5C",
                      }}
                    >
                      {selectedLabel || "Select a reason..."}
                    </span>
                    <ChevronDown size={20} color="#A4A4A4" strokeWidth={2} />
                  </button>

                  {/* Hint text */}
                  <div className="flex items-start gap-1 w-full mt-0.5">
                    <Info size={16} color="#A4A4A4" strokeWidth={2} className="shrink-0 mt-0.5" />
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: 12,
                        lineHeight: "16px",
                        color: "#5C5C5C",
                        flex: 1,
                      }}
                    >
                      The refusal reason will be recorded in the case timeline and visible on the cases table.
                    </span>
                  </div>

                  {/* Custom reason textarea — shown when "Other" is selected and step is custom */}
                  {step === "custom" && (
                    <div className="flex flex-col gap-1 mt-xl w-full">
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: 14,
                          lineHeight: "20px",
                          letterSpacing: "-0.006em",
                          color: "#171717",
                        }}
                      >
                        Write the reason
                      </span>
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Custom"
                        rows={3}
                        className="w-full resize-none outline-none"
                        style={{
                          padding: "10px 12px",
                          background: "#FFFFFF",
                          border: "1px solid #EBEBEB",
                          boxShadow: "0px 1px 2px rgba(10,13,20,0.03)",
                          borderRadius: 10,
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: 14,
                          lineHeight: "20px",
                          color: "#171717",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex items-center px-5 py-4"
                style={{
                  borderTop: "1px solid #EBEBEB",
                  gap: 12,
                }}
              >
                <div className="flex items-center justify-end gap-3 flex-1">
                  {/* Cancel */}
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center justify-center cursor-pointer"
                    style={{
                      padding: "8px",
                      background: "#F5F5F5",
                      borderRadius: 8,
                      border: "none",
                      height: 36,
                      minWidth: 70,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: "20px",
                      letterSpacing: "-0.006em",
                      color: "#5C5C5C",
                    }}
                  >
                    Cancel
                  </button>

                  {/* Confirm */}
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={step === "custom" ? !canConfirmCustom : !selectedReason}
                    className="flex items-center justify-center cursor-pointer"
                    style={{
                      padding: "8px",
                      background: step === "custom" && !canConfirmCustom ? "#B39DF7" : "#7D52F4",
                      borderRadius: 8,
                      border: "none",
                      height: 36,
                      minWidth: 77,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: "20px",
                      letterSpacing: "-0.006em",
                      color: "#FFFFFF",
                      cursor: step === "custom" && !canConfirmCustom ? "not-allowed" : "pointer",
                      opacity: !selectedReason && step === "select" ? 0.5 : 1,
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── STEP: list (reason picker) ── */}
          {step === "list" && (
            <>
              {/* Content */}
              <div className="flex flex-col items-center gap-xl p-5">
                {/* Avatar + case info */}
                <div className="flex items-center gap-xl w-full">
                  <div className="shrink-0">
                    {caseInfo.avatarUrl ? (
                      <img
                        src={caseInfo.avatarUrl}
                        alt={caseInfo.name}
                        className="rounded-full object-cover"
                        style={{ width: 56, height: 56 }}
                      />
                    ) : (
                      <div
                        className="rounded-full bg-[#CAC0FF] text-[#351A75] flex items-center justify-center text-sm font-semibold select-none"
                        style={{ width: 56, height: 56 }}
                      >
                        {caseInfo.avatarText || caseInfo.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 400, fontSize: 12, lineHeight: "20px", color: "#5C5C5C" }}>
                      #{caseInfo.caseId}
                    </span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 14, lineHeight: "20px", color: "#171717" }}>
                      {caseInfo.name}
                    </span>
                  </div>
                </div>

                {/* Title + description */}
                <div className="flex flex-col gap-1.5 w-full">
                  <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 16, lineHeight: "24px", color: "#171717", margin: 0 }}>
                    Mark as Visa Refused
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 14, lineHeight: "20px", color: "#5C5C5C", margin: 0 }}>
                    This will change the case status for {caseInfo.name}.
                  </p>
                    {/* Reasons list */}
                <div className="flex flex-col w-full" style={{ gap: 2 }}>
                  {REFUSAL_REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      type="button"
                      onClick={() => setSelectedReason(reason.value)}
                      className="flex items-center justify-between w-full text-left cursor-pointer transition-colors"
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: selectedReason === reason.value ? "#F5F3FF" : "transparent",
                        gap: 12,
                      }}
                    >
                      {/* Left: colored dot + label */}
                      <div className="flex items-center gap-[8px] min-w-0">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              reason.value === "cos_revoked" ||
                              reason.value === "incomplete_application" ||
                              reason.value === "previous_overstay"
                                ? "#1FC16B"
                                : "#F6B51E",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 400,
                            fontSize: 14,
                            lineHeight: "20px",
                            letterSpacing: "-0.006em",
                            color: "#171717",
                          }}
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
                    </button>
                  ))}
                </div>              </div>
              </div>

              {/* Footer */}
              <div
                className="flex items-center px-5 py-4"
                style={{ borderTop: "1px solid #EBEBEB", gap: 12 }}
              >
                <div className="flex items-center justify-end gap-3 flex-1">
                  <button
                    type="button"
                    onClick={() => { setStep("select"); setSelectedReason(null); }}
                    style={{
                      padding: "8px",
                      background: "#F5F5F5",
                      borderRadius: 8,
                      border: "none",
                      height: 36,
                      minWidth: 70,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      color: "#5C5C5C",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyReason}
                    disabled={!canApply}
                    style={{
                      padding: "8px",
                      background: canApply ? "#7D52F4" : "#B39DF7",
                      borderRadius: 8,
                      border: "none",
                      height: 36,
                      minWidth: 77,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      color: "#FFFFFF",
                      cursor: canApply ? "pointer" : "not-allowed",
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
