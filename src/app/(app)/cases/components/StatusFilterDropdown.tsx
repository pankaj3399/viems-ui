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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`w-[104px] justify-between font-medium h-8 rounded-[8px] bg-white border-neutral-200 px-[6px] py-[6px] gap-[2px] text-[14px] leading-5 tracking-[-0.006em] ${
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

      <PopoverContent align="start" className="w-[200px] p-0 bg-card border border-border rounded-card shadow-card-large overflow-hidden">
        <div className="max-h-[240px] overflow-y-auto py-xs">
          {/* All status option */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={`w-full justify-between px-lg py-md text-left text-paragraph-sm font-normal rounded-none h-auto transition-colors border-0 bg-transparent ${
              !value
                ? "bg-[#F5F3FF] text-[#7D52F4] hover:bg-[#F5F3FF] font-medium"
                : "text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            <span>All status</span>
            <div className="flex items-center gap-sm shrink-0">
              <span className="text-subheading-2xs px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-medium">
                {totalCount}
              </span>
              {!value && <Check className="size-3.5 text-[#7D52F4]" />}
            </div>
          </Button>

          {statuses.map((status) => (
            <Button
              key={status.label}
              type="button"
              variant="ghost"
              onClick={() => {
                onChange(status.label);
                setOpen(false);
              }}
              className={`w-full justify-between px-lg py-md text-left text-paragraph-sm font-normal rounded-none h-auto transition-colors border-0 bg-transparent ${
                value === status.label
                  ? "bg-[#F5F3FF] text-[#7D52F4] hover:bg-[#F5F3FF] font-medium"
                  : "text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              <span className="flex items-center gap-sm min-w-0">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: getDotColor(status.label) }}
                />
                <span className="truncate text-left">{status.label}</span>
              </span>
              <div className="flex items-center gap-sm shrink-0">
                <span className="text-subheading-2xs px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-medium">
                  {status.count}
                </span>
                {value === status.label && (
                  <Check className="size-3.5 text-[#7D52F4]" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
