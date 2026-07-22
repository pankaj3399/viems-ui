"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
            boxShadow: "0px 16px 32px -12px rgba(14, 18, 27, 0.1)",
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

          {/* Content */}
          <div className="flex flex-col items-start gap-xl p-5">
            {/* Avatar + case id + name */}
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

            {/* Title + Description */}
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
                Delete case
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
                This will permanently delete this case and all associated data including documents, compliance records, and timeline history. This action cannot be undone.
              </p>
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

              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
                className="flex items-center justify-center cursor-pointer text-white font-sans"
                style={{
                  padding: "8px 16px",
                  background: "#FB3748",
                  borderRadius: 8,
                  border: "none",
                  height: 36,
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: "20px",
                  letterSpacing: "-0.006em",
                }}
              >
                Delete case
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
