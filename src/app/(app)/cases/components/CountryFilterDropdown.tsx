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

  const filteredCountries = React.useMemo(() => {
    if (!search) return countries;
    return countries.filter((c) =>
      c.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [countries, search]);

  const selectedLabel = value
    ? countries.find((c) => c.code === value)?.label
    : null;

  const totalCount = countries.reduce((acc, c) => acc + (c.count || 0), 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={`w-[135px] justify-between font-medium h-8 rounded-[8px] bg-white border-neutral-200 px-[6px] py-[6px] gap-[2px] text-[14px] leading-5 tracking-[-0.006em] ${
            open
              ? "border-[#7D52F4] ring-2 ring-[#7D52F4]/20 text-foreground"
              : value
              ? "border-[#7D52F4] text-[#7D52F4] hover:text-[#7D52F4] hover:border-[#7D52F4]"
              : "border-border text-[#5C5C5C]"
          }`}
        >
          <span className="truncate flex items-center gap-xs">
            {value && (
              <Flag country={value} className="size-4 shrink-0" />
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

      <PopoverContent align="start" className="w-[220px] p-0 bg-card border border-border rounded-card shadow-card-large overflow-hidden">
        {/* Search */}
        <div className="p-sm border-b border-neutral-100">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[#A4A4A4]" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              autoFocus
              className="w-full h-8 pl-8 pr-3 text-paragraph-sm bg-neutral-50 border border-border rounded-input placeholder-[#A4A4A4] focus-visible:border-[#7D52F4] focus-visible:ring-1 focus-visible:ring-[#7D52F4]/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* Options */}
        <div className="max-h-[240px] overflow-y-auto py-xs">
          {/* All countries option */}
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
            <span>All countries</span>
            <div className="flex items-center gap-sm shrink-0">
              <span className="text-subheading-2xs px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-medium">
                {totalCount}
              </span>
              {!value && <Check className="size-3.5 text-[#7D52F4]" />}
            </div>
          </Button>

          {filteredCountries.map((country) => (
            <Button
              key={country.code}
              type="button"
              variant="ghost"
              onClick={() => {
                onChange(country.code);
                setOpen(false);
              }}
              className={`w-full justify-between px-lg py-md text-left text-paragraph-sm font-normal rounded-none h-auto transition-colors border-0 bg-transparent ${
                value === country.code
                  ? "bg-[#F5F3FF] text-[#7D52F4] hover:bg-[#F5F3FF] font-medium"
                  : "text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              <span className="flex items-center gap-sm min-w-0">
                <Flag country={country.code} className="size-4 shrink-0" />
                <span className="truncate text-left">{country.label}</span>
              </span>
              <div className="flex items-center gap-sm shrink-0">
                {country.count !== undefined && (
                  <span className="text-subheading-2xs px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full font-medium">
                    {country.count}
                  </span>
                )}
                {value === country.code && (
                  <Check className="size-3.5 text-[#7D52F4]" />
                )}
              </div>
            </Button>
          ))}

          {filteredCountries.length === 0 && (
            <div className="px-lg py-xl text-paragraph-sm text-neutral-400 text-center">
              No countries found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
