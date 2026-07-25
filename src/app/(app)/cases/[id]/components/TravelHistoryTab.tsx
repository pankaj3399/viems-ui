"use client";

import * as React from "react";
import {
  RiSearchLine,
  RiFilterLine,
  RiExpandUpDownFill,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

interface TravelHistoryRow {
  id: number;
  direction: "IN" | "OUT";
  date: string;
  port: string;
  routeFlight: string;
  method: string;
}

const DEFAULT_TRAVEL_HISTORY: TravelHistoryRow[] = [
  {
    id: 1,
    direction: "IN",
    date: "14 Mar 2026",
    port: "London Heathrow (T5)",
    routeFlight: "BA268 Los Angeles (LAX)",
    method: "Air",
  },
  {
    id: 2,
    direction: "OUT",
    date: "25 Dec 2024",
    port: "London Gatwick (S)",
    routeFlight: "VS24 Los Angeles (LAX)",
    method: "Air",
  },
  {
    id: 3,
    direction: "IN",
    date: "10 Jun 2024",
    port: "London St Pancras",
    routeFlight: "—",
    method: "Air",
  },
  {
    id: 4,
    direction: "OUT",
    date: "12 Sep 2023",
    port: "London Heathrow (T3)",
    routeFlight: "BA269 Los Angeles (LAX)...",
    method: "Rail (Eurostar)",
  },
  {
    id: 5,
    direction: "IN",
    date: "15 Mar 2023",
    port: "London Heathrow (T5)",
    routeFlight: "BA268 Los Angeles (LAX)...",
    method: "Air",
  },
];

interface TravelHistoryTabProps {
  migrant?: any;
}

export function TravelHistoryTab({ migrant }: TravelHistoryTabProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [records, setRecords] = React.useState<TravelHistoryRow[]>(DEFAULT_TRAVEL_HISTORY);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function fetchTravelHistory() {
      if (!migrant?.id) return;
      try {
        setLoading(true);
        const res = await apiClient.get<any>(ENDPOINTS.migrants.travelHistory(migrant.id));
        if (Array.isArray(res) && res.length > 0) {
          const mapped: TravelHistoryRow[] = res.map((r: any, idx: number) => ({
            id: r.id || idx + 1,
            direction: (r.direction || r.type || "IN").toUpperCase() === "OUT" ? "OUT" : "IN",
            date: r.date || r.travelDate || "14 Mar 2026",
            port: r.port || r.location || "London Heathrow (T5)",
            routeFlight: r.routeFlight || r.flightNumber || "BA268 Los Angeles (LAX)",
            method: r.method || r.transport || "Air",
          }));
          setRecords(mapped);
        }
      } catch (err) {
        console.error("Failed to load travel history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTravelHistory();
  }, [migrant?.id]);

  const filteredRecords = React.useMemo(() => {
    return records.filter((item) => {
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
  }, [records, searchQuery]);

  return (
    <div className="flex flex-col gap-[32px] w-full font-sans select-none max-w-[1104px]">
      {/* Toolbar / Filters Row */}
      <div className="flex items-center gap-[12px] w-full">
        {/* Search Bar */}
        <div className="w-[348px] h-[32px] bg-white border border-[#EBEBEB] rounded-[8px] px-[8px] py-[6px] flex items-center gap-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <RiSearchLine className="size-5 text-[#A4A4A4] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-[14px] font-normal text-[#171717] placeholder:text-[#A4A4A4] border-0 outline-none leading-[20px]"
          />
        </div>

        {/* Filter Button */}
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          className="size-8 bg-white border border-[#EBEBEB] rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          title="Reset filter"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
            <path d="M8.5 14.5H11.5V13H8.5V14.5ZM3.25 5.5V7H16.75V5.5H3.25ZM5.5 10.75H14.5V9.25H5.5V10.75Z" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-[8px] w-full">
        {/* Table Header */}
        <div className="h-[36px] bg-[#F5F5F5] rounded-[8px] px-4 flex items-center gap-[24px] w-full">
          {/* Badge spacer column */}
          <div className="w-[48px] shrink-0" />

          <div className="w-[116px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>DATE</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
          <div className="w-[352px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>PORT</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
          <div className="w-[352px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>ROUTE/FLIGHT</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
          <div className="w-[132px] flex items-center gap-1 text-[12px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
            <span>METHOD</span>
            <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col gap-[4px] w-full">
          {filteredRecords.map((row) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}
