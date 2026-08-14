"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RiArrowLeftLine,
  RiSearchLine,
  RiFilter3Line,
  RiHistoryLine,
  RiRefreshLine,
  RiUser3Line,
  RiFileTextLine,
  RiShieldCheckLine,
  RiInformationLine,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

interface LogEntry {
  id: number | string;
  userName: string;
  userEmail?: string;
  action: string;
  entityName: string;
  entityIdentifier?: string;
  creationDate: string;
  newValue?: string;
  oldValue?: string;
  ipAddress?: string;
}

type LogsResponse =
  | LogEntry[]
  | { logs?: LogEntry[]; data?: LogEntry[]; count?: number };

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
  created: { bg: "bg-[#E1FBF2]", text: "text-[#065F46]" },
  uploaded: { bg: "bg-[#EFEBFF]", text: "text-[#7D52F4]" },
  updated: { bg: "bg-[#EFF6FF]", text: "text-[#1D4ED8]" },
  assigned: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]" },
  exported: { bg: "bg-[#F3E8FF]", text: "text-[#6B21A8]" },
  automated: { bg: "bg-[#F3F4F6]", text: "text-[#374151]" },
};

export default function ActivityLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState<string>("all");

  const fetchLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<LogsResponse>(
        ENDPOINTS.logs.base,
        { params: { take: "50", sort_by: "date.desc" } }
      );

      let loaded: LogEntry[] = [];
      if (Array.isArray(res)) {
        loaded = res;
      } else if (res && typeof res === "object") {
        if (Array.isArray(res.logs)) loaded = res.logs;
        else if (Array.isArray(res.data)) loaded = res.data;
      }

      setLogs(loaded);
    } catch (err: unknown) {
      console.error("Failed to fetch logs:", err);
      setLogs([]);
      setError("Failed to load audit activity logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.userName?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q) ||
        log.entityName?.toLowerCase().includes(q) ||
        log.entityIdentifier?.toLowerCase().includes(q);

      const matchesFilter =
        actionFilter === "all" ||
        log.action?.toLowerCase().includes(actionFilter.toLowerCase());

      return matchesSearch && matchesFilter;
    });
  }, [logs, searchQuery, actionFilter]);

  return (
    <div className="px-[40px] py-[32px] pb-[80px] flex flex-col gap-xl font-sans bg-[#F7F7F7] min-h-screen text-left select-none">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-xl shrink-0">
        <div className="flex items-center gap-md">
          <button
            onClick={() => router.back()}
            className="size-9 rounded-[10px] bg-white border border-[#EBEBEB] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:border-neutral-300 transition-all cursor-pointer shadow-xs"
          >
            <RiArrowLeftLine className="size-5" />
          </button>
          <div>
            <h1 className="text-[28px] text-[#171717] tracking-[-0.01em] leading-[36px] font-aeonik-medium">
              Recent Activity & Audit Logs
            </h1>
            <p className="text-[14px] text-[#7B7B7B] tracking-[-0.006em] mt-0.5 leading-[20px]">
              Complete history of compliance actions, document uploads, and system events.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-xs px-xl py-lg h-9 bg-white border border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] hover:border-neutral-300 rounded-[10px] text-[14px] font-semibold leading-[20px] tracking-[-0.006em] transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RiRefreshLine className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-[16px_20px] flex items-center justify-between gap-md shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
        <div className="flex items-center gap-md flex-1 max-w-[480px] bg-[#F7F7F7] border border-[#EBEBEB] rounded-[10px] px-md py-xs">
          <RiSearchLine className="size-4 text-[#A4A4A4]" />
          <input
            type="text"
            placeholder="Search by user, action, case ID, or document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[14px] text-[#171717] outline-none placeholder:text-[#A4A4A4]"
          />
        </div>

        <div className="flex items-center gap-md">
          <div className="flex items-center gap-xs text-[13px] font-medium text-[#5C5C5C]">
            <RiFilter3Line className="size-4 text-[#7B7B7B]" />
            <span>Filter:</span>
          </div>
          <div className="flex bg-[#F5F5F5] rounded-[8px] p-0.5 select-none">
            {[
              { id: "all", label: "All Activity" },
              { id: "updated", label: "Updates" },
              { id: "uploaded", label: "Uploads" },
              { id: "created", label: "Created" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActionFilter(f.id)}
                className={`px-md py-1 rounded-[6px] text-[12px] font-semibold transition-all cursor-pointer ${
                  actionFilter === f.id
                    ? "bg-white text-[#171717] shadow-sm"
                    : "text-[#7B7B7B] hover:text-[#171717]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white border border-[#EBEBEB] rounded-[16px] overflow-hidden shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
        <div className="px-[20px] py-[16px] border-b border-[#EBEBEB] flex items-center justify-between bg-[#FAFAFA]">
          <div className="flex items-center gap-sm">
            <RiHistoryLine className="size-5 text-[#7D52F4]" />
            <span className="text-[14px] font-semibold text-[#171717]">
              Activity History ({filteredLogs.length})
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#F5F5F5]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-[20px] flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-md">
                  <div className="size-10 rounded-full bg-neutral-100" />
                  <div className="flex flex-col gap-xs">
                    <div className="w-48 h-4 bg-neutral-100 rounded" />
                    <div className="w-32 h-3 bg-neutral-100 rounded" />
                  </div>
                </div>
                <div className="w-24 h-4 bg-neutral-100 rounded" />
              </div>
            ))
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const actionKey = Object.keys(ACTION_COLORS).find((k) =>
                log.action?.toLowerCase().includes(k)
              ) ?? "automated";
              const badgeStyle = ACTION_COLORS[actionKey];

              const d = log.creationDate ? new Date(log.creationDate) : null;
              const formattedDate = d && !isNaN(d.getTime())
                ? d.toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recently";

              const initials = (log.userName || "System")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={log.id}
                  className="p-[16px_20px] flex items-center justify-between hover:bg-[#FAFAFA] transition-colors"
                >
                  <div className="flex items-center gap-[16px] min-w-0">
                    <div className="size-10 rounded-full bg-[#EFEBFF] text-[#7D52F4] flex items-center justify-center text-[14px] font-semibold shrink-0">
                      {initials}
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-md flex-wrap">
                        <span className="text-[14px] font-semibold text-[#171717]">
                          {log.userName || "System"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] ${badgeStyle.bg} ${badgeStyle.text}`}
                        >
                          {log.action}
                        </span>
                      </div>

                      <div className="flex items-center gap-xs text-[13px] text-[#5C5C5C]">
                        <span>{log.entityName}</span>
                        {log.entityIdentifier && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[#7D52F4] font-medium">
                              {log.entityIdentifier}
                            </span>
                          </>
                        )}
                        {log.newValue && (
                          <>
                            <span>•</span>
                            <span className="text-[#171717]">{`"${log.newValue}"`}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-[13px] text-[#A4A4A4] font-medium shrink-0 pl-md">
                    {formattedDate}
                  </div>
                </div>
              );
            })
          ) : error ? (
            <div className="py-12 flex flex-col items-center justify-center gap-xs text-center">
              <RiInformationLine className="size-8 text-[#FB3748]" />
              <span className="text-[14px] font-semibold text-[#171717]">{error}</span>
              <button
                type="button"
                onClick={fetchLogs}
                className="mt-2 text-[13px] font-medium text-[#7D52F4] hover:underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center gap-xs text-center">
              <RiInformationLine className="size-8 text-[#A4A4A4]" />
              <span className="text-[14px] font-semibold text-[#171717]">No activity logs found</span>
              <span className="text-[13px] text-[#7B7B7B]">Try adjusting your search query or filter settings.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
