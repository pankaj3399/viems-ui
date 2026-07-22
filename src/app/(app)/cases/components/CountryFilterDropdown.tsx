"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flag } from "@/components/ui/flag";
import { ChevronDown, Check, Search } from "lucide-react";

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
  const resultCount = filteredCountries.reduce((acc, c) => acc + (c.count || 0), 0);

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
          className={`w-auto min-w-[130px] px-3 justify-between font-medium h-8 rounded-[8px] bg-white border-neutral-200 py-[6px] gap-2 text-[14px] leading-5 tracking-[-0.006em] shrink-0 ${
            open
              ? "border-[#7D52F4] ring-2 ring-[#7D52F4]/20 text-foreground"
              : value
              ? "border-[#7D52F4] text-[#7D52F4] hover:text-[#7D52F4] hover:border-[#7D52F4]"
              : "border-border text-[#5C5C5C]"
          }`}
        >
          <span className="flex items-center gap-2 truncate">
            {value && (
              <Flag country={selectedCountry?.code || value} className="size-4 shrink-0" />
            )}
            <span>{selectedLabel || "All countries"}</span>
          </span>
          <ChevronDown
            className={`size-5 shrink-0 transition-transform ${
              open ? "rotate-180 text-[#7D52F4]" : "text-[#5C5C5C]"
            }`}
          />
        </Button>
      } />

      <PopoverContent align="start" className="w-[260px] p-0 bg-card border border-border rounded-card shadow-card-large overflow-hidden flex flex-col">
        {/* Search */}
        <div className="p-sm border-b border-neutral-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#A4A4A4]" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries"
              autoFocus
              className="w-full h-8 pl-8 pr-3 text-paragraph-sm bg-neutral-50 border border-border rounded-input placeholder-[#A4A4A4] focus-visible:border-[#7D52F4] focus-visible:ring-1 focus-visible:ring-[#7D52F4]/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* Options */}
        <div className="max-h-[240px] overflow-y-auto py-xs">
          {/* All countries option */}
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
              <span className="text-neutral-900 font-normal">All countries</span>
            </span>
          </button>

          {filteredCountries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => setTempValue(country.code)}
              className="w-full flex items-center justify-between px-lg py-md text-left text-paragraph-sm font-normal transition-colors border-0 bg-transparent cursor-pointer hover:bg-neutral-50"
            >
              <span className="flex items-center gap-sm min-w-0">
                <span className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                  tempValue === country.code ? "border-2 border-[#7D52F4] bg-white" : "border-neutral-300 bg-white"
                }`}>
                  {tempValue === country.code && <span className="size-2 rounded-full bg-[#7D52F4]" />}
                </span>
                <Flag country={country.code} className="size-4 shrink-0" />
                <span className="truncate text-left text-neutral-900 font-normal">{country.label}</span>
              </span>
              {country.count !== undefined && (
                <span className="text-subheading-2xs px-2 py-0.5 bg-[#E6F7F0] text-[#1FC16B] rounded-full font-medium shrink-0">
                  {country.count}
                </span>
              )}
            </button>
          ))}

          {filteredCountries.length === 0 && (
            <div className="px-lg py-xl text-paragraph-sm text-neutral-400 text-center">
              No countries found
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
