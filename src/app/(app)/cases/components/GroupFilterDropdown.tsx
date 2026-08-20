"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";

export interface GroupOption {
  value: string;
  label: string;
  count?: number;
}

interface GroupFilterDropdownProps {
  groups: GroupOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function GroupFilterDropdown({
  groups,
  value,
  onChange,
}: GroupFilterDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [tempValue, setTempValue] = React.useState<string | null>(value);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTempValue(value);
      setSearch("");
    }
    setOpen(newOpen);
  };

  const filteredGroups = React.useMemo(() => {
    if (!search) return groups;
    return groups.filter(
      (g) =>
        g.label.toLowerCase().includes(search.toLowerCase()) ||
        g.value.toLowerCase().includes(search.toLowerCase())
    );
  }, [groups, search]);

  const selectedGroup = React.useMemo(() => {
    if (!value || value === "all") return null;
    return groups.find(
      (g) =>
        g.value.toLowerCase() === value.toLowerCase() ||
        g.label.toLowerCase() === value.toLowerCase()
    );
  }, [groups, value]);

  const selectedLabel =
    !value || value === "all"
      ? "All Cases"
      : selectedGroup
      ? selectedGroup.label
      : value;

  const totalCount = filteredGroups.reduce(
    (acc, g) => (g.value !== "all" ? acc + (g.count || 0) : acc),
    0
  );

  const handleApply = () => {
    onChange(tempValue);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger render={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`w-auto min-w-[130px] px-3 justify-between font-medium h-8 rounded-[8px] bg-white border-neutral-200 py-[6px] gap-2 text-[14px] leading-5 tracking-[-0.006em] shrink-0 cursor-pointer ${
            open
              ? "border-[#7D52F4] ring-2 ring-[#7D52F4]/20 text-foreground"
              : value && value !== "all"
              ? "border-[#7D52F4] text-[#7D52F4] hover:text-[#7D52F4] hover:border-[#7D52F4]"
              : "border-border text-[#5C5C5C] hover:text-neutral-900"
          }`}
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown
            className={`size-4 shrink-0 transition-transform duration-200 ${
              open ? "rotate-180 text-[#7D52F4]" : "text-[#5C5C5C]"
            }`}
          />
        </Button>
      } />

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={4}
        className="w-[260px] p-0 bg-card border border-border rounded-card shadow-card-large overflow-hidden flex flex-col z-50"
      >
        {/* Search */}
        <div className="p-sm border-b border-neutral-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#A4A4A4]" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search groups"
              autoFocus
              className="w-full h-8 pl-8 pr-3 text-paragraph-sm bg-neutral-50 border border-border rounded-input placeholder-[#A4A4A4] focus-visible:border-[#7D52F4] focus-visible:ring-1 focus-visible:ring-[#7D52F4]/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* Options */}
        <div
          role="radiogroup"
          aria-label="Filter cases by group"
          className="max-h-[240px] overflow-y-auto py-xs"
        >
          {/* All cases option */}
          <button
            type="button"
            role="radio"
            aria-checked={tempValue === null || tempValue === "all"}
            onClick={() => setTempValue(null)}
            className="w-full flex items-center justify-between px-lg py-md text-left text-paragraph-sm font-normal transition-colors border-0 bg-transparent cursor-pointer hover:bg-neutral-50"
          >
            <span className="flex items-center gap-sm">
              <span
                className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                  tempValue === null || tempValue === "all"
                    ? "border-2 border-[#7D52F4] bg-white"
                    : "border-neutral-300 bg-white"
                }`}
              >
                {(tempValue === null || tempValue === "all") && (
                  <span className="size-2 rounded-full bg-[#7D52F4]" />
                )}
              </span>
              <span className="text-neutral-900 font-normal">All Cases</span>
            </span>
          </button>

          {filteredGroups
            .filter((g) => g.value !== "all")
            .map((group) => {
              const isSelected =
                tempValue?.toLowerCase() === group.value.toLowerCase() ||
                tempValue?.toLowerCase() === group.label.toLowerCase();
              return (
                <button
                  key={group.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setTempValue(group.value)}
                  className="w-full flex items-center justify-between px-lg py-md text-left text-paragraph-sm font-normal transition-colors border-0 bg-transparent cursor-pointer hover:bg-neutral-50"
                >
                  <span className="flex items-center gap-sm min-w-0">
                    <span
                      className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-2 border-[#7D52F4] bg-white"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <span className="size-2 rounded-full bg-[#7D52F4]" />
                      )}
                    </span>
                    <span className="truncate text-left text-neutral-900 font-normal">
                      {group.label}
                    </span>
                  </span>
                  {group.count !== undefined && (
                    <span className="text-subheading-2xs px-2 py-0.5 bg-[#F4F4F5] text-[#4B5563] rounded-full font-medium shrink-0">
                      {group.count}
                    </span>
                  )}
                </button>
              );
            })}

          {filteredGroups.filter((g) => g.value !== "all").length === 0 && (
            <div className="px-lg py-xl text-paragraph-sm text-neutral-400 text-center">
              No groups found
            </div>
          )}
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
              className="h-8 px-xl text-label-sm bg-[#F5F5F5] border-0 text-[#5C5C5C] hover:bg-neutral-200 rounded-[8px] cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="h-8 px-xl text-label-sm text-white bg-[#7D52F4] hover:bg-[#6C3EE8] rounded-[8px] cursor-pointer border-0"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
