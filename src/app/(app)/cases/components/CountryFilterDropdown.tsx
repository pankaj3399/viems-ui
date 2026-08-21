"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flag } from "@/components/ui/flag";
import { RiArrowDownSLine, RiSearchLine } from "@remixicon/react";

interface CountryOption {
  code: string;
  label: string;
  flag: string;
  count?: number;
}

interface CountryFilterDropdownProps {
  countries: CountryOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function CountryFilterDropdown({
  countries,
  value,
  onChange,
}: CountryFilterDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [tempValue, setTempValue] = React.useState<string | null>(value);

  // Sync temp value when popover opens
  React.useEffect(() => {
    if (open) {
      setTempValue(value);
      setSearch("");
    }
  }, [open, value]);

  const filteredCountries = React.useMemo(() => {
    if (!search) return countries;
    return countries.filter((c) =>
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [countries, search]);

  const selectedCountry = React.useMemo(() => {
    if (!value) return null;
    return countries.find(
      (c) =>
        c.code === value ||
        c.label === value ||
        c.code.toLowerCase() === value.toLowerCase()
    );
  }, [countries, value]);

  const selectedLabel = selectedCountry ? selectedCountry.label : value;

  const totalCount = countries.reduce((acc, c) => acc + (c.count || 0), 0);

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
          className="h-8 w-auto min-w-[125px] px-[10px] py-[6px] justify-between font-medium rounded-[8px] bg-white border-0 shadow-x-small gap-2 text-[14px] leading-5 tracking-[-0.006em] shrink-0 text-[#171717] hover:bg-neutral-50 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2 truncate">
            {value && (
              <Flag country={selectedCountry?.code || value} className="size-4 shrink-0" />
            )}
            <span>{selectedLabel || "All countries"}</span>
          </span>
          <RiArrowDownSLine
            className={`size-5 shrink-0 text-[#5C5C5C] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </Button>
      } />

      <PopoverContent align="start" className="w-[290px] p-0 bg-card border border-border rounded-card shadow-card-large overflow-hidden flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-neutral-100">
          <div className="relative">
            <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-[#A4A4A4] pointer-events-none z-10" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries"
              autoFocus
              className="w-full h-8 pl-8 pr-3 text-[13px] bg-neutral-50 border border-border rounded-input placeholder-[#A4A4A4] focus-visible:border-brand-medium focus-visible:ring-1 focus-visible:ring-brand-medium/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* Options */}
        <div className="max-h-[260px] overflow-y-auto py-xs">
          {/* All countries option */}
          <button // ui-native-ok
            type="button"
            onClick={() => setTempValue(null)}
            className="group w-full flex items-center justify-between px-4 py-2.5 text-left text-paragraph-sm font-normal transition-colors border-0 bg-transparent cursor-pointer hover:bg-neutral-50 focus-visible:outline-none focus-visible:bg-neutral-50"
          >
            <span className="flex items-center gap-sm">
              <span className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                tempValue === null ? "border-2 border-[#7D52F4] bg-white" : "border-neutral-300 bg-white"
              }`}>
                {tempValue === null && <span className="size-2 rounded-full bg-[#7D52F4]" />}
              </span>
              <span className={`text-neutral-900 text-[14px] group-hover:font-medium group-focus-visible:font-medium ${tempValue === null ? "font-medium" : "font-normal"}`}>All countries</span>
            </span>
          </button>

          {filteredCountries.map((country) => {
            const isSelected = tempValue === country.code;

            return (
              <button // ui-native-ok
                key={country.code}
                type="button"
                onClick={() => setTempValue(country.code)}
                className="group w-full flex items-center justify-between px-4 py-2.5 text-left text-paragraph-sm font-normal transition-colors border-0 bg-transparent cursor-pointer hover:bg-neutral-50 focus-visible:outline-none focus-visible:bg-neutral-50"
              >
                <span className="flex items-center gap-sm min-w-0 pr-2">
                  <span className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? "border-2 border-[#7D52F4] bg-white" : "border-neutral-300 bg-white"
                  }`}>
                    {isSelected && <span className="size-2 rounded-full bg-[#7D52F4]" />}
                  </span>
                  <Flag country={country.code} className="size-4 shrink-0" />
                  <span className={`truncate text-left text-neutral-900 text-[14px] group-hover:font-medium group-focus-visible:font-medium ${isSelected ? "font-medium" : "font-normal"}`}>
                    {country.label}
                  </span>
                </span>
                {country.count !== undefined && (
                  <span className="text-[12px] px-2 py-0.5 rounded-full font-medium bg-[#F4F4F5] text-[#5C5C5C] shrink-0">
                    {country.count}
                  </span>
                )}
              </button>
            );
          })}

          {filteredCountries.length === 0 && (
            <div className="px-4 py-6 text-paragraph-sm text-neutral-400 text-center">
              No countries found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 bg-white">
          <span className="text-[13px] text-[#5C5C5C] font-normal whitespace-nowrap shrink-0">
            {filteredCountries.length} results
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
