"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { RiArrowDownSLine } from "@remixicon/react";

interface StatusOption {
  label: string;
  count: number;
}

interface StatusFilterDropdownProps {
  statuses: StatusOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  statusColors?: Record<string, string>;
}

function formatStatusLabel(label: string) {
  if (!label) return "";
  if (label.includes("_") || (label === label.toUpperCase() && label.length > 3)) {
    return label
      .toLowerCase()
      .split(/[\s_]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return label;
}

export function StatusFilterDropdown({
  statuses,
  value,
  onChange,
  statusColors,
}: StatusFilterDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [tempValue, setTempValue] = React.useState<string | null>(value);

  // Sync temp value when popover opens
  React.useEffect(() => {
    if (open) {
      setTempValue(value);
    }
  }, [open, value]);

  const getDotColor = (status: string) => {
    const normalized = (status || "").toLowerCase().replace(/_/g, " ").trim();
    if (statusColors && statusColors[status]) {
      return statusColors[status];
    }
    if (
      normalized.includes("withdrawn") ||
      normalized.includes("refused") ||
      normalized.includes("rejected") ||
      normalized.includes("rtw pending")
    ) {
      return "#FB3748";
    }
    if (
      normalized.includes("active") ||
      normalized.includes("compliance") ||
      normalized.includes("approved") ||
      normalized.includes("granted") ||
      normalized.includes("entered")
    ) {
      return "#1FC16B";
    }
    if (
      normalized.includes("pre") ||
      normalized.includes("awaiting") ||
      normalized.includes("pending") ||
      normalized.includes("assessment") ||
      normalized.includes("in progress") ||
      normalized.includes("in_progress")
    ) {
      return "#F6B51E";
    }
    return "#7B7B7B";
  };

  const totalCount = statuses.reduce((acc, s) => acc + (s.count || 0), 0);

  const handleApply = () => {
    onChange(tempValue);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-auto min-w-[104px] px-[10px] py-[6px] justify-between font-medium rounded-[8px] bg-white border-0 shadow-x-small gap-2 text-[14px] leading-5 tracking-[-0.006em] shrink-0 text-[#171717] hover:bg-neutral-50 transition-all cursor-pointer"
        >
          <span className="truncate">{value ? formatStatusLabel(value) : "All status"}</span>
          <RiArrowDownSLine
            className={`size-5 shrink-0 text-[#5C5C5C] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </Button>
      } />

      <PopoverContent align="start" className="w-[300px] p-0 bg-card border border-border rounded-card shadow-card-large overflow-hidden flex flex-col">
        <div className="max-h-[300px] overflow-y-auto py-xs">
          {/* All statuses option */}
          <button // ui-native-ok
            type="button"
            onClick={() => setTempValue(null)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-left text-paragraph-sm font-normal transition-colors border-0 bg-transparent cursor-pointer hover:bg-neutral-50"
          >
            <span className="flex items-center gap-sm">
              <span className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                tempValue === null ? "border-2 border-[#7D52F4] bg-white" : "border-neutral-300 bg-white"
              }`}>
                {tempValue === null && <span className="size-2 rounded-full bg-[#7D52F4]" />}
              </span>
              <span className="text-neutral-900 font-normal text-[14px]">All statuses</span>
            </span>
          </button>

          {statuses.map((status) => {
            const isSelected = tempValue === status.label;
            const dotColor = getDotColor(status.label);

            return (
              <button // ui-native-ok
                key={status.label}
                type="button"
                onClick={() => setTempValue(status.label)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left text-paragraph-sm font-normal transition-colors border-0 bg-transparent cursor-pointer hover:bg-neutral-50"
              >
                <span className="flex items-center gap-sm min-w-0 pr-2">
                  <span className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? "border-2 border-[#7D52F4] bg-white" : "border-neutral-300 bg-white"
                  }`}>
                    {isSelected && <span className="size-2 rounded-full bg-[#7D52F4]" />}
                  </span>
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span
                    className={`truncate text-left text-neutral-900 text-[14px] ${
                      isSelected ? "font-medium" : "font-normal"
                    }`}
                  >
                    {formatStatusLabel(status.label)}
                  </span>
                </span>
                <span className="text-[12px] px-2 py-0.5 rounded-full font-medium bg-[#F4F4F5] text-[#5C5C5C] shrink-0">
                  {status.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 bg-white">
          <span className="text-[13px] text-[#5C5C5C] font-normal whitespace-nowrap shrink-0">
            {totalCount} results
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="h-8 px-3 text-[13px] font-medium bg-[#F5F5F5] border-0 text-[#5C5C5C] hover:bg-neutral-200 rounded-[8px] cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="h-8 px-4 text-[13px] font-medium bg-brand-medium hover:bg-brand-dark text-white rounded-[8px] border-0 cursor-pointer"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
