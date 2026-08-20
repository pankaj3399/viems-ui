"use client";

import * as React from "react";
import {
  RiSearchLine,
  RiFilter3Line,
  RiSuitcase2Line,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { useTableSort } from "@/hooks/useTableSort";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RawTravelHistoryRecord } from "@/types/api";

interface TravelHistoryRow {
  id: number;
  direction: "IN" | "OUT";
  date: string;
  dateValue: number;
  port: string;
  routeFlight: string;
  method: string;
}

interface TravelHistoryTabProps {
  migrant?: { id?: string | number; [key: string]: unknown } | null;
}

export function TravelHistoryTab({ migrant }: TravelHistoryTabProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { sortField, sortDirection, setSortField, setSortDirection, handleSort, renderSortIcon } = useTableSort<TravelHistoryRow>();
  const [records, setRecords] = React.useState<TravelHistoryRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    async function fetchTravelHistory() {
      if (!migrant?.id) return;
      try {
        setLoading(true);
        const res = await apiClient.get<RawTravelHistoryRecord[]>(ENDPOINTS.migrants.travelHistory(migrant.id));
        if (active && Array.isArray(res)) {
          const mapped: TravelHistoryRow[] = res.map((r: RawTravelHistoryRecord, idx: number) => {
            const rawDate = r.date || r.travelDate || "";
            const d = rawDate ? new Date(rawDate) : null;
            const dateValue = d && !isNaN(d.getTime()) ? d.getTime() : 0;
            const numId = typeof r.id === "number" ? r.id : (r.id !== undefined && r.id !== null && !isNaN(Number(r.id)) ? Number(r.id) : null);
            return {
              id: numId !== null ? numId : idx + 1,
              direction: (r.direction || r.type || "IN").toUpperCase() === "OUT" ? "OUT" : "IN",
              date: r.date || r.travelDate || "—",
              dateValue,
              port: r.port || r.location || "—",
              routeFlight: r.routeFlight || r.flightNumber || "—",
              method: r.method || r.transport || "—",
            };
          });
          setRecords(mapped);
        }
      } catch (err: unknown) {
        if (active) console.error("Failed to load travel history:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchTravelHistory();
    return () => {
      active = false;
    };
  }, [migrant?.id]);

  const filteredRecords = React.useMemo(() => {
    const list = records.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.direction.toLowerCase().includes(q) ||
          item.date.toLowerCase().includes(q) ||
          item.port.toLowerCase().includes(q) ||
          item.routeFlight.toLowerCase().includes(q) ||
          item.method.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (!sortField) return list;

    return [...list].sort((a, b) => {
      if (sortField === "date") {
        return sortDirection === "asc"
          ? a.dateValue - b.dateValue
          : b.dateValue - a.dateValue;
      }
      const valA = (a[sortField] || "").toString().toLowerCase();
      const valB = (b[sortField] || "").toString().toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [records, searchQuery, sortField, sortDirection]);

  return (
    <div className="flex flex-col gap-[32px] w-full font-sans select-none max-w-[1104px]">
      {/* Toolbar / Filters Row */}
      <div className="flex items-center gap-[12px] w-full">
        {/* Search Bar */}
        <div className="w-[348px] h-[32px] bg-white border border-[#EBEBEB] rounded-[8px] px-[8px] py-[6px] flex items-center gap-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] focus-within:border-brand-medium focus-within:ring-2 focus-within:ring-brand-medium/20">
          <RiSearchLine className="size-5 text-[#A4A4A4] shrink-0" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search travel history..."
            className="h-full border-0 bg-transparent p-0 text-[14px] font-normal text-[#171717] placeholder:text-[#A4A4A4] shadow-none focus-visible:ring-0 focus-visible:shadow-none leading-[20px]"
          />
        </div>

        {/* Filter Reset Button */}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => {
            setSearchQuery("");
            setSortField(null);
            setSortDirection("asc");
          }}
          aria-label="Reset filter"
          className="size-8 bg-white border border-[#EBEBEB] rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          title="Reset filter"
        >
          <RiFilter3Line className="size-4 shrink-0 text-[#5C5C5C]" aria-hidden="true" />
        </Button>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-[8px] w-full">
        {/* Table Header */}
        <div className="h-[36px] bg-[#F5F5F5] rounded-[8px] px-4 flex items-center gap-[24px] w-full">
          {/* Badge spacer column */}
          <div className="w-[48px] shrink-0" />

          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("date")}
            className="w-[116px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>DATE</span>
            {renderSortIcon("date")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("port")}
            className="w-[352px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>PORT</span>
            {renderSortIcon("port")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("routeFlight")}
            className="w-[352px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>ROUTE/FLIGHT</span>
            {renderSortIcon("routeFlight")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("method")}
            className="w-[132px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>METHOD</span>
            {renderSortIcon("method")}
          </Button>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col gap-[4px] w-full">
          {loading ? (
            <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-8 text-center flex flex-col items-center justify-center">
              <span className="text-[14px] font-medium text-[#5C5C5C] animate-pulse">Loading travel history...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-8 text-center flex flex-col items-center justify-center gap-2">
              <RiSuitcase2Line className="size-8 text-[#A4A4A4]" />
              <span className="text-[14px] font-medium text-[#5C5C5C]">No travel history records found</span>
            </div>
          ) : (
            filteredRecords.map((row) => (
              <div
                key={row.id}
                className="w-full h-[56px] bg-white border border-transparent hover:border-[#EBEBEB] rounded-[16px] px-4 flex items-center gap-[24px] transition-all shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
              >
                {/* Direction Badge (IN / OUT) */}
                <div className="w-[48px] shrink-0 flex items-center">
                  {row.direction === "IN" ? (
                    <span className="px-[6px] py-[2px] bg-[#E3F7EC] text-[#0B4627] rounded-full text-[11px] font-semibold tracking-[0.02em] uppercase">
                      IN
                    </span>
                  ) : (
                    <span className="px-[6px] py-[2px] bg-[#FFECC0] text-[#624C18] rounded-full text-[11px] font-semibold tracking-[0.02em] uppercase">
                      OUT
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="w-[116px] text-[14px] font-medium text-[#171717]">
                  {row.date}
                </div>

                {/* Port */}
                <div className="w-[352px] text-[14px] font-medium text-[#7B7B7B]">
                  {row.port}
                </div>

                {/* Route/Flight */}
                <div className="w-[352px] text-[14px] font-medium text-[#7B7B7B]">
                  {row.routeFlight}
                </div>

                {/* Method */}
                <div className="w-[132px] text-[14px] font-medium text-[#7B7B7B]">
                  {row.method}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
