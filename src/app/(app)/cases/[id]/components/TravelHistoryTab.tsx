"use client";

import * as React from "react";
import {
  RiSearchLine,
  RiFilter3Line,
  RiSuitcase2Line,
  RiAddLine,
  RiMore2Line,
  RiEditBoxLine,
  RiDeleteBinLine,
  RiCheckLine,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { useTableSort } from "@/hooks/useTableSort";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RawTravelHistoryRecord } from "@/types/api";
import { TravelHistoryModal, TravelHistoryRecordData } from "@/app/(app)/cases/components/TravelHistoryModal";
import { DeleteTravelHistoryModal } from "@/app/(app)/cases/components/DeleteTravelHistoryModal";

interface TravelHistoryRow {
  id: number;
  direction: "IN" | "OUT";
  date: string;
  dateValue: number;
  rawDate: string;
  port: string;
  routeFlight: string;
  method: string;
  status?: string;
  notes?: string;
  country?: string;
}

interface TravelHistoryTabProps {
  migrant?: { id?: string | number; [key: string]: unknown } | null;
  migrantId?: string | number;
}

function formatTableDate(rawDate?: string): string {
  if (!rawDate || rawDate === "—" || rawDate === "-") return "—";
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return rawDate;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function TravelHistoryTab({ migrant, migrantId: propMigrantId }: TravelHistoryTabProps) {
  const effectiveMigrantId = propMigrantId || migrant?.id || (migrant as any)?.migrantId;
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [directionFilter, setDirectionFilter] = React.useState<"ALL" | "IN" | "OUT">("ALL");
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  
  const { sortField, sortDirection, setSortField, setSortDirection, handleSort, renderSortIcon } = useTableSort<TravelHistoryRow>();
  const [records, setRecords] = React.useState<TravelHistoryRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<TravelHistoryRecordData | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [recordToDelete, setRecordToDelete] = React.useState<{
    id: number;
    direction: string;
    date: string;
    port: string;
  } | null>(null);

  const fetchTravelHistory = React.useCallback(async () => {
    if (!effectiveMigrantId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.get<RawTravelHistoryRecord[]>(
        ENDPOINTS.migrants.travelHistory(effectiveMigrantId)
      );
      if (Array.isArray(res)) {
        const mapped: TravelHistoryRow[] = res.map((r: any, idx: number) => {
          const rawDate = r.travelDate || r.date || "";
          const d = rawDate ? new Date(rawDate) : null;
          const dateValue = d && !isNaN(d.getTime()) ? d.getTime() : 0;
          const numId = typeof r.id === "number" ? r.id : idx + 1;
          const rawDir = (r.direction || r.type || "IN").toUpperCase();
          const direction: "IN" | "OUT" = rawDir === "OUT" || rawDir === "LEAVING" ? "OUT" : "IN";

          return {
            id: numId,
            direction,
            date: formatTableDate(rawDate),
            rawDate,
            dateValue,
            port: r.airport || r.port || r.location || "—",
            routeFlight: r.flightNumber || r.routeFlight || "—",
            method: r.airline || r.method || r.transport || "Air",
            status: r.status,
            notes: r.notes,
            country: r.country,
          };
        });
        setRecords(mapped);
      }
    } catch (err: unknown) {
      console.error("Failed to load travel history:", err);
    } finally {
      setLoading(false);
    }
  }, [effectiveMigrantId]);

  React.useEffect(() => {
    fetchTravelHistory();
  }, [fetchTravelHistory]);

  const filteredRecords = React.useMemo(() => {
    const list = records.filter((item) => {
      // Direction filter
      if (directionFilter !== "ALL" && item.direction !== directionFilter) {
        return false;
      }

      // Search query
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
  }, [records, searchQuery, directionFilter, sortField, sortDirection]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (row: TravelHistoryRow) => {
    setEditingRecord({
      id: row.id,
      direction: row.direction === "IN" ? "Entering" : "Leaving",
      travelDate: row.rawDate,
      airport: row.port !== "—" ? row.port : "",
      flightNumber: row.routeFlight !== "—" ? row.routeFlight : "",
      method: row.method !== "—" ? row.method : "Air",
      country: row.country || "UK",
      status: row.status || "Confirmed",
      notes: row.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (row: TravelHistoryRow) => {
    setRecordToDelete({
      id: row.id,
      direction: row.direction,
      date: row.date,
      port: row.port,
    });
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-[32px] w-full font-sans select-none max-w-[1104px]">
      {/* Toolbar / Filters Row */}
      <div className="flex items-center justify-between gap-[12px] w-full">
        <div className="flex items-center gap-[12px]">
          {/* Search Bar */}
          <div className="w-[348px] h-[32px] bg-white border border-[#EBEBEB] rounded-[8px] px-[8px] py-[6px] flex items-center gap-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] focus-within:border-[#171717] focus-within:ring-1 focus-within:ring-[#171717]">
            <RiSearchLine className="size-5 text-[#A4A4A4] shrink-0" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-full border-0 bg-transparent p-0 text-[14px] font-normal text-[#171717] placeholder:text-[#A4A4A4] shadow-none focus-visible:ring-0 focus-visible:shadow-none leading-[20px]"
            />
          </div>

          {/* Filter Popover */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Filter records"
                  className={`size-8 bg-white border rounded-[8px] flex items-center justify-center transition-colors cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)] ${
                    directionFilter !== "ALL"
                      ? "border-[#171717] text-[#171717] bg-[#F5F5F5]"
                      : "border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717]"
                  }`}
                  title="Filter direction"
                >
                  <RiFilter3Line className="size-4 shrink-0" />
                </Button>
              }
            />
            <PopoverContent
              align="start"
              className="w-[180px] p-2 bg-white rounded-[12px] border border-[#EBEBEB] shadow-regular-medium flex flex-col gap-1 z-50 font-sans"
            >
              <div className="px-2 py-1 text-[11px] font-semibold text-[#A4A4A4] uppercase tracking-[0.04em]">
                Filter Direction
              </div>
              <button
                type="button"
                onClick={() => {
                  setDirectionFilter("ALL");
                  setIsFilterOpen(false);
                }}
                className={`w-full px-2 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center justify-between text-left transition-colors cursor-pointer border-0 bg-transparent ${
                  directionFilter === "ALL"
                    ? "bg-[#F5F5F5] text-[#171717]"
                    : "text-[#5C5C5C] hover:bg-[#FAFAFA]"
                }`}
              >
                <span>All Movements</span>
                {directionFilter === "ALL" && <RiCheckLine className="size-4 text-[#171717]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirectionFilter("IN");
                  setIsFilterOpen(false);
                }}
                className={`w-full px-2 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center justify-between text-left transition-colors cursor-pointer border-0 bg-transparent ${
                  directionFilter === "IN"
                    ? "bg-[#E3F7EC] text-[#0B4627]"
                    : "text-[#5C5C5C] hover:bg-[#FAFAFA]"
                }`}
              >
                <span>IN (Arrivals)</span>
                {directionFilter === "IN" && <RiCheckLine className="size-4 text-[#0B4627]" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirectionFilter("OUT");
                  setIsFilterOpen(false);
                }}
                className={`w-full px-2 py-1.5 rounded-[6px] text-[13px] font-medium flex items-center justify-between text-left transition-colors cursor-pointer border-0 bg-transparent ${
                  directionFilter === "OUT"
                    ? "bg-[#FFECC0] text-[#624C18]"
                    : "text-[#5C5C5C] hover:bg-[#FAFAFA]"
                }`}
              >
                <span>OUT (Departures)</span>
                {directionFilter === "OUT" && <RiCheckLine className="size-4 text-[#624C18]" />}
              </button>
            </PopoverContent>
          </Popover>
        </div>

        {/* Add Record Action */}
        <Button
          type="button"
          onClick={handleOpenAdd}
          className="h-[32px] px-3 bg-[#171717] hover:bg-[#262626] text-white rounded-[8px] flex items-center gap-[6px] text-[13px] font-medium shadow-[0px_1px_2px_rgba(10,13,20,0.03)] cursor-pointer transition-colors"
        >
          <RiAddLine className="size-4" />
          <span>Add Record</span>
        </Button>
      </div>

      {/* Table Section */}
      <div className="flex flex-col gap-[8px] w-full">
        {/* Table Header */}
        <div className="h-[36px] bg-[#F5F5F5] rounded-[8px] px-4 flex items-center gap-[24px] w-full">
          {/* Badge spacer column */}
          <div className="w-[48px] shrink-0" />

          {/* DATE Header */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("date")}
            className="w-[116px] flex items-center gap-1 text-[12px] font-medium text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>DATE</span>
            {renderSortIcon("date")}
          </Button>

          {/* PORT Header */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("port")}
            className="w-[352px] flex items-center gap-1 text-[12px] font-medium text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>PORT</span>
            {renderSortIcon("port")}
          </Button>

          {/* ROUTE/FLIGHT Header */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("routeFlight")}
            className="w-[352px] flex items-center gap-1 text-[12px] font-medium text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>ROUTE/FLIGHT</span>
            {renderSortIcon("routeFlight")}
          </Button>

          {/* METHOD Header */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleSort("method")}
            className="w-[132px] flex items-center gap-1 text-[12px] font-medium text-[#A4A4A4] hover:text-[#171717] uppercase tracking-[0.04em] cursor-pointer bg-transparent hover:bg-transparent border-0 p-0 text-left transition-colors justify-start"
          >
            <span>METHOD</span>
            {renderSortIcon("method")}
          </Button>

          {/* Actions spacer */}
          <div className="w-[36px] shrink-0" />
        </div>

        {/* Table Rows */}
        <div className="flex flex-col gap-[4px] w-full">
          {loading ? (
            <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-8 text-center flex flex-col items-center justify-center">
              <span className="text-[14px] font-medium text-[#5C5C5C] animate-pulse">Loading travel history...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="size-12 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#A4A4A4]">
                <RiSuitcase2Line className="size-6" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[15px] font-medium text-[#171717]">No travel history found</span>
                <span className="text-[13px] text-[#7B7B7B]">
                  {searchQuery || directionFilter !== "ALL"
                    ? "Try adjusting your search query or filter."
                    : "No movement records have been added for this migrant yet."}
                </span>
              </div>
              <Button
                type="button"
                onClick={handleOpenAdd}
                variant="outline"
                className="mt-2 text-[13px] rounded-[8px] h-[34px]"
              >
                <RiAddLine className="size-4 mr-1.5" />
                Add First Travel Record
              </Button>
            </div>
          ) : (
            filteredRecords.map((row) => (
              <div
                key={row.id}
                className="group w-full h-[56px] bg-white border border-transparent hover:border-[#EBEBEB] rounded-[16px] px-4 flex items-center gap-[24px] transition-all shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
              >
                {/* Direction Badge (IN / OUT) */}
                <div className="w-[48px] shrink-0 flex items-center">
                  {row.direction === "IN" ? (
                    <span className="px-[6px] py-[2px] bg-[#E3F7EC] text-[#0B4627] rounded-full text-[11px] font-medium tracking-[0.02em] uppercase">
                      IN
                    </span>
                  ) : (
                    <span className="px-[6px] py-[2px] bg-[#FFECC0] text-[#624C18] rounded-full text-[11px] font-medium tracking-[0.02em] uppercase">
                      OUT
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="w-[116px] text-[14px] font-medium text-[#171717] tracking-[-0.006em] truncate">
                  {row.date}
                </div>

                {/* Port */}
                <div className="w-[352px] text-[14px] font-medium text-[#7B7B7B] tracking-[-0.006em] truncate">
                  {row.port}
                </div>

                {/* Route/Flight */}
                <div className="w-[352px] text-[14px] font-medium text-[#7B7B7B] tracking-[-0.006em] truncate">
                  {row.routeFlight}
                </div>

                {/* Method */}
                <div className="w-[132px] text-[14px] font-medium text-[#7B7B7B] tracking-[-0.006em] truncate">
                  {row.method}
                </div>

                {/* Row Actions Menu */}
                <div className="w-[36px] shrink-0 flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          className="size-7 opacity-0 group-hover:opacity-100 hover:bg-[#F5F5F5] rounded-[6px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-all cursor-pointer border-0"
                          title="Record options"
                        >
                          <RiMore2Line className="size-4" />
                        </button>
                      }
                    />
                    <DropdownMenuContent
                      align="end"
                      className="w-[150px] bg-white border border-[#EBEBEB] rounded-[12px] shadow-regular-medium p-1 flex flex-col gap-0.5 z-50 font-sans"
                    >
                      <DropdownMenuItem
                        onClick={() => handleOpenEdit(row)}
                        className="px-2.5 py-1.5 text-[13px] font-medium text-[#171717] hover:bg-[#F5F5F5] rounded-[6px] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <RiEditBoxLine className="size-4 text-[#5C5C5C]" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 bg-[#EBEBEB]" />
                      <DropdownMenuItem
                        onClick={() => handleOpenDelete(row)}
                        className="px-2.5 py-1.5 text-[13px] font-medium text-[#FB3748] hover:bg-[#FFF5F5] rounded-[6px] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <RiDeleteBinLine className="size-4 text-[#FB3748]" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <TravelHistoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        migrantId={effectiveMigrantId}
        record={editingRecord}
        onSuccess={fetchTravelHistory}
      />

      {/* Delete Modal */}
      <DeleteTravelHistoryModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        migrantId={effectiveMigrantId}
        recordId={recordToDelete?.id || null}
        recordInfo={recordToDelete}
        onSuccess={fetchTravelHistory}
      />
    </div>
  );
}
