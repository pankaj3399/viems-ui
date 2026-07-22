"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CASE_STATUSES, isMatchingStatus } from "../case-status-data";

interface CaseStatusDropdownProps {
  currentStatus: string;
  statusColor: "success" | "warning" | "error" | "info" | "gray";
  getStatusBgAndText: (color: "success" | "warning" | "error" | "info" | "gray") => string;
  getStatusDotColor: (color: "success" | "warning" | "error" | "info" | "gray") => string;
  onApplyStatus: (newStatus: string) => void;
}

export function CaseStatusDropdown({
  currentStatus,
  statusColor,
  getStatusBgAndText,
  getStatusDotColor,
  onApplyStatus,
}: CaseStatusDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(currentStatus);

  React.useEffect(() => {
    if (open) {
      const match = CASE_STATUSES.find((s) => isMatchingStatus(currentStatus, s));
      setSelected(match ? match.value : currentStatus);
    }
  }, [open, currentStatus]);

  const handleApply = () => {
    onApplyStatus(selected);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-xs px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] cursor-pointer hover:opacity-80 hover:scale-[1.02] transition-all border-0 ${getStatusBgAndText(statusColor)}`}
        >
          <span className={`size-1.5 rounded-full ${getStatusDotColor(statusColor)}`} />
          {currentStatus}
        </button>
      } />

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="w-[340px] p-0 gap-0 overflow-hidden rounded-[20px] bg-white border border-[#F5F5F5] shadow-card-large font-sans z-50 flex flex-col h-[480px] max-h-[480px]"
        style={{
          boxShadow:
            "0px 1px 1px 0.5px rgba(51, 51, 51, 0.04), 0px 3px 3px -1.5px rgba(51, 51, 51, 0.02), 0px 6px 6px -3px rgba(51, 51, 51, 0.04), 0px 12px 12px -6px rgba(51, 51, 51, 0.04), 0px 24px 24px -12px rgba(51, 51, 51, 0.04), 0px 48px 48px -24px rgba(51, 51, 51, 0.04), 0px 0px 0px 1px #F5F5F5, inset 0px -1px 1px -0.5px rgba(51, 51, 51, 0.06)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — 52px */}
        <div className="w-full h-[52px] min-h-[52px] px-[20px] py-[16px] flex items-center border-b border-[#EBEBEB] bg-white shrink-0">
          <h3 className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-[#171717]">
            Change case status
          </h3>
        </div>

        {/* Scrollable status list — Displays 7-10 options at a time */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto px-[20px] py-[12px] flex flex-col bg-white">
          {CASE_STATUSES.map((status, index) => {
            const isSelected = isMatchingStatus(selected, status);
            return (
              <React.Fragment key={status.value}>
                <button
                  type="button"
                  onClick={() => setSelected(status.value)}
                  className={`w-full h-[36px] min-h-[36px] flex items-center justify-between px-xs transition-colors rounded-[8px] cursor-pointer text-left border-0 bg-transparent shrink-0 ${
                    isSelected ? "bg-[#F5F3FF]" : "hover:bg-neutral-50"
                  }`}
                >
                  {/* Left: Dot + Label */}
                  <div className="flex items-center gap-[8px] min-w-0">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: status.dotColor || "#7B7B7B" }}
                    />
                    <span className="text-[14px] font-normal leading-[20px] tracking-[-0.006em] text-[#171717] truncate">
                      {status.label}
                    </span>
                  </div>

                  {/* Right: Radio Circle */}
                  <div className="size-5 shrink-0 relative flex items-center justify-center">
                    <div
                      className={`size-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#7D52F4] border-2 border-[#7D52F4]"
                          : "bg-white border-2 border-[#EBEBEB] hover:border-neutral-300"
                      }`}
                    >
                      {isSelected && <div className="size-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>

                {index < CASE_STATUSES.length - 1 && (
                  <div className="w-full h-px bg-[#EBEBEB] shrink-0 my-xs" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer — 68px */}
        <div className="w-full h-[68px] min-h-[68px] px-[20px] py-[16px] flex items-center justify-end gap-[12px] border-t border-[#EBEBEB] bg-white shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-[86px] h-[36px] bg-[#F5F5F5] hover:bg-neutral-200 border-0 text-[14px] font-medium text-[#5C5C5C] rounded-[8px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="w-[86px] h-[36px] bg-[#7D52F4] hover:bg-[#683fd1] text-white text-[14px] font-medium rounded-[8px]"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
