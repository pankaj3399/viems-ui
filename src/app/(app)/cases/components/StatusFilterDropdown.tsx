"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";

interface StatusOption {
  label: string;
  count: number;
}

interface StatusFilterDropdownProps {
  statuses: StatusOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  statusColors: Record<string, string>;
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
    const color = statusColors[status];
    switch (color) {
      case "warning":
        return "#F6B51E";
      case "success":
        return "#1FC16B";
      case "info":
        return "#3B82F6";
      case "error":
        return "#E02424";
      default:
        return "#9CA3AF";
    }
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
          className={`w-[120px] justify-between font-medium h-8 rounded-[8px] bg-white border-neutral-200 px-[6px] py-[6px] gap-[2px] text-[14px] leading-5 tracking-[-0.006em] ${
            open
              ? "border-[#7D52F4] ring-2 ring-[#7D52F4]/20 text-foreground"
              : value
              ? "border-[#7D52F4] text-[#7D52F4] hover:text-[#7D52F4] hover:border-[#7D52F4]"
              : "border-border text-[#5C5C5C]"
          }`}
        >
          <span className="truncate">{value || "All status"}</span>
          <ChevronDown
            className={`size-5 shrink-0 transition-transform ${
              open ? "rotate-180 text-[#7D52F4]" : "text-[#5C5C5C]"
            }`}
          />
        </Button>
      } />

      <PopoverContent align="start" className="w-[240px] p-0 bg-card border border-border rounded-card shadow-card-large overflow-hidden flex flex-col">
        <div className="max-h-[280px] overflow-y-auto py-xs">
          {/* All statuses option */}
          <button
            type="button"
            onClick={() => setTempValue(null)}
            className="w-full flex items-center justify-between px-lg py-md text-left text-paragraph-sm font-normal transition-colors border-0 bg-transparent cursor-pointer hover:bg-neutral-50"
          >
            <span className="flex items-center gap-sm">
              <span className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                tempValue === null ? "border-2 border-[#7D52F4] bg-white" : "border-neutral-300 bg-white"
              }`}>
                {tempValue === null && <span className="size-2 rounded-full bg-[#7D52F4]" />}
              </span>
              <span className="text-neutral-900 font-normal">All statuses</span>
            </span>
          </button>

          {statuses.map((status) => (
            <button
              key={status.label}
              type="button"
              onClick={() => setTempValue(status.label)}
              className="w-full flex items-center justify-between px-lg py-md text-left text-paragraph-sm font-normal transition-colors border-0 bg-transparent cursor-pointer hover:bg-neutral-50"
            >
              <span className="flex items-center gap-sm min-w-0">
                <span className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                  tempValue === status.label ? "border-2 border-[#7D52F4] bg-white" : "border-neutral-300 bg-white"
                }`}>
                  {tempValue === status.label && <span className="size-2 rounded-full bg-[#7D52F4]" />}
                </span>
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: getDotColor(status.label) }}
                />
                <span className="truncate text-left text-neutral-900 font-normal">{status.label}</span>
              </span>
              <span className={`text-subheading-2xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                status.label === "Visa approved" ? "bg-[#E6F7F0] text-[#1FC16B]" :
                status.label === "Awaiting" ? "bg-[#FFFBEB] text-[#D97706]" :
                status.label === "Eligibility assessment" ? "bg-[#EFF6FF] text-[#1D4ED8]" :
                status.label === "Visa refused" ? "bg-[#FEF2F2] text-[#DC2626]" :
                "bg-[#F4F4F5] text-[#4B5563]"
              }`}>
                {status.count}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-lg py-lg border-t border-neutral-100">
          <span className="text-paragraph-xs text-[#5C5C5C] font-normal">
            {totalCount} results
          </span>
          <div className="flex items-center gap-sm">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="h-8 px-xl text-label-sm bg-[#F5F5F5] border-0 text-[#5C5C5C] hover:bg-neutral-200 rounded-[8px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="h-8 px-xl text-label-sm text-white rounded-[8px]"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
