"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RiSearch2Line,
  RiArrowDownSLine,
  RiAtLine,
  RiFocus2Line,
  RiRecordCircleLine,
  RiFileListLine,
  RiChatSmile2Line,
  RiFileUploadLine,
  RiFileChartLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiDoubleQuotesL,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface PageNotificationItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  time: string;
  caseRef: string;
  group: "TODAY" | "YESTERDAY" | "21 MAY 2026";
  isUnread?: boolean;
  category: "mentions" | "tasks" | "cases" | "messages" | "documents";
}

const ALL_NOTIFICATIONS: PageNotificationItem[] = [
  {
    id: "1",
    group: "TODAY",
    icon: RiAtLine,
    title: "Sarah Kim mentioned you in a note",
    description: "“@Alex Marin can you chase Berklee for the qualification docs?”",
    time: "10 min ago",
    caseRef: "#430/2026",
    isUnread: true,
    category: "mentions",
  },
  {
    id: "2",
    group: "YESTERDAY",
    icon: RiFocus2Line,
    title: "RTW check overdue",
    description: "The 27d deadline has passed. Complete the digital share code to avoid penalties.",
    time: "Yesterday",
    caseRef: "#430/2026",
    isUnread: false,
    category: "tasks",
  },
  {
    id: "3",
    group: "YESTERDAY",
    icon: RiRecordCircleLine,
    title: "Case status changed: Taylor Johnson",
    description: "#430/2026 moved from Awaiting UKVI Decision to Visa Refused.",
    time: "Yesterday",
    caseRef: "#430/2026",
    isUnread: true,
    category: "cases",
  },
  {
    id: "4",
    group: "YESTERDAY",
    icon: RiFileListLine,
    title: "Details completed: Sofia Reyez",
    description: "The migrant has submitted their personal information.",
    time: "2d ago",
    caseRef: "#430/2026",
    isUnread: true,
    category: "documents",
  },
  {
    id: "5",
    group: "21 MAY 2026",
    icon: RiFileListLine,
    title: "Details completed: Sofia Reyez",
    description: "The migrant has submitted their personal information.",
    time: "2d ago",
    caseRef: "#430/2026",
    isUnread: false,
    category: "documents",
  },
  {
    id: "6",
    group: "21 MAY 2026",
    icon: RiChatSmile2Line,
    title: "New message from Live Nation UK",
    description: "“Hi Alex, please find attached the updated event schedule for Amara Osei’s tour dates.”",
    time: "3d ago",
    caseRef: "#430/2026",
    isUnread: false,
    category: "messages",
  },
  {
    id: "7",
    group: "21 MAY 2026",
    icon: RiFileUploadLine,
    title: "Document uploaded: Carlos Vega",
    description: "Flight booking confirmation uploaded to #430/2026. AI extracted 4 fields.",
    time: "3d ago",
    caseRef: "#430/2026",
    isUnread: false,
    category: "documents",
  },
  {
    id: "8",
    group: "21 MAY 2026",
    icon: RiFileChartLine,
    title: "SMS report due in 3 days",
    description: "Reportable event for Carlos Vega: Address change. Log in on SMS by 27 Mar 2026.",
    time: "3d ago",
    caseRef: "#430/2026",
    isUnread: false,
    category: "tasks",
  },
];

import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getGroupLabel(dateStr?: string): string {
  if (!dateStr) return "TODAY";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "TODAY";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "TODAY";
  if (date.toDateString() === yesterday.toDateString()) return "YESTERDAY";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
}

function getIconForEntity(entityName?: string, action?: string) {
  const e = (entityName || "").toLowerCase();
  const a = (action || "").toLowerCase();
  if (e.includes("file") || a.includes("file") || a.includes("upload")) return RiFileUploadLine;
  if (e.includes("task") || a.includes("task")) return RiFocus2Line;
  if (e.includes("user") || e.includes("employee")) return RiAtLine;
  if (a.includes("status") || a.includes("stage")) return RiRecordCircleLine;
  return RiFileListLine;
}

function getCategoryForLog(entityName?: string, action?: string): "mentions" | "tasks" | "cases" | "messages" | "documents" {
  const e = (entityName || "").toLowerCase();
  const a = (action || "").toLowerCase();
  if (e.includes("file") || a.includes("file") || a.includes("upload") || a.includes("doc")) return "documents";
  if (e.includes("task") || a.includes("task")) return "tasks";
  if (e.includes("user") || e.includes("note") || a.includes("mention")) return "mentions";
  if (e.includes("chat") || e.includes("message")) return "messages";
  return "cases";
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = React.useState<PageNotificationItem[]>(ALL_NOTIFICATIONS);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function fetchPageNotifications() {
      try {
        setLoading(true);
        const res = await apiClient.get<any>(ENDPOINTS.logs.base, {
          params: { take: "50", sort_by: "date.desc" },
        });
        const rawLogs: any[] = Array.isArray(res) ? res : res?.logs ?? res?.data ?? [];
        if (rawLogs.length > 0) {
          const mapped: PageNotificationItem[] = rawLogs.map((log, i) => {
            const userName = log.userName ?? "System";
            const entityName = log.entityName ?? "Case";
            const idStr = log.entityIdentifier ? `#${log.entityIdentifier}` : "";
            const actionText = log.action ? log.action.charAt(0).toUpperCase() + log.action.slice(1) : "Updated";
            const title = `${userName} ${log.action ?? "updated"} ${entityName} ${idStr}`.trim();
            const description = log.newValue
              ? `Updated value to: ${log.newValue}`
              : `${actionText} ${entityName} in system.`;
            const timeAgo = formatTimeAgo(log.creationDate);
            const group = getGroupLabel(log.creationDate);
            const icon = getIconForEntity(entityName, log.action);
            const category = getCategoryForLog(entityName, log.action);
            return {
              id: String(log.id ?? i),
              group: group as any,
              icon,
              title,
              description,
              time: timeAgo,
              caseRef: idStr || "#430/2026",
              isUnread: i < 4,
              category,
            };
          });
          setItems(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch page notification logs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPageNotifications();
  }, []);

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isUnread: false })));
  };

  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      if (unreadOnly && !item.isUnread) return false;
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.caseRef.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, unreadOnly, filterCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const groups = React.useMemo(() => {
    const map = new Map<string, PageNotificationItem[]>();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
    paginatedItems.forEach((item) => {
      const existing = map.get(item.group) || [];
      existing.push(item);
      map.set(item.group, existing);
    });
    return Array.from(map.entries());
  }, [filteredItems, currentPage, itemsPerPage]);

  const filterCategoryLabels: Record<string, string> = {
    all: "All notifications",
    mentions: "Mentions",
    tasks: "Task updates",
    cases: "Case updates",
    messages: "Messages",
    documents: "Documents",
  };

  return (
    <div className="px-[40px] py-[32px] pb-[80px] flex flex-col gap-xl font-sans bg-[#F7F7F7] min-h-screen select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-xl shrink-0">
        <div>
          <h1 className="text-[28px] text-[#171717] tracking-[-0.01em] leading-[36px] font-aeonik-medium">
            Notifications
          </h1>
          <p className="text-[14px] text-[#7B7B7B] tracking-[-0.006em] mt-1 leading-[20px] font-sans">
            Create, track, and manage visa cases for individual or grouped applicants.
          </p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="px-[16px] py-[8px] h-9 bg-[#F5F5F5] hover:bg-[#E0E0E0] active:bg-[#D4D4D4] text-[#5C5C5C] hover:text-[#171717] rounded-[8px] text-[14px] font-medium transition-all cursor-pointer border-0 flex items-center justify-center"
        >
          Mark all as read
        </button>
      </div>

      {/* Toolbar / Filters Row */}
      <div className="flex items-center gap-[12px] w-full">
        {/* Search Bar */}
        <div className="w-[348px] h-[32px] bg-white border border-[#EBEBEB] rounded-[8px] px-[8px] py-[6px] flex items-center gap-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <RiSearch2Line className="size-5 text-[#A4A4A4] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-[14px] font-normal text-[#171717] placeholder:text-[#A4A4A4] border-0 outline-none leading-[20px]"
          />
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-[32px] px-[12px] bg-white border border-[#EBEBEB] rounded-[8px] flex items-center gap-[6px] text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)] outline-none"
          >
            <span>{filterCategoryLabels[filterCategory] ?? "All notifications"}</span>
            <RiArrowDownSLine className="size-5 text-[#5C5C5C]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px] bg-white border border-[#EBEBEB] rounded-[12px] shadow-card-large p-1">
            {[
              { id: "all", label: "All notifications" },
              { id: "mentions", label: "Mentions" },
              { id: "tasks", label: "Task updates" },
              { id: "cases", label: "Case updates" },
              { id: "messages", label: "Messages" },
              { id: "documents", label: "Documents" },
            ].map((cat) => (
              <DropdownMenuItem
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                onSelect={() => setFilterCategory(cat.id)}
                className={`text-[14px] cursor-pointer rounded-[6px] px-3 py-2 transition-colors ${
                  filterCategory === cat.id
                    ? "bg-[#F5F5F5] font-semibold text-[#171717]"
                    : "text-[#5C5C5C] hover:bg-[#F5F5F5] hover:text-[#171717]"
                }`}
              >
                {cat.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Unread Only Toggle */}
        <button
          type="button"
          onClick={() => setUnreadOnly(!unreadOnly)}
          className={`h-[32px] px-[12px] rounded-[8px] text-[14px] font-medium transition-all cursor-pointer border-0 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] ${
            unreadOnly
              ? "bg-[#171717] text-white"
              : "bg-white text-[#5C5C5C] hover:text-[#171717]"
          }`}
        >
          Unread only
        </button>
      </div>

      {/* Grouped Notifications List */}
      <div className="flex flex-col gap-[32px] w-full">
        {groups.length === 0 ? (
          <div className="py-[60px] text-center bg-white border border-[#EBEBEB] rounded-[16px] text-neutral-400 text-[14px]">
            No notifications match your current filters.
          </div>
        ) : (
          groups.map(([groupTitle, groupItems]) => (
            <div key={groupTitle} className="flex flex-col gap-[8px] w-full">
              {/* Group Section Header */}
              <div className="flex items-center gap-[8px] h-[16px]">
                <span className="text-[12px] font-semibold text-[#171717] tracking-[0.04em] uppercase leading-[16px]">
                  {groupTitle}
                </span>
              </div>

              {/* Items Card List */}
              <div className="flex flex-col gap-[8px] w-full">
                {groupItems.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => router.push("/cases")}
                      className="w-full h-auto min-h-[104px] bg-white border border-[#EBEBEB] hover:border-neutral-300 rounded-[12px] p-[16px] flex items-start gap-[16px] transition-all cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
                    >
                      {/* Left Icon */}
                      <div className="size-[36px] rounded-full bg-white border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center justify-center shrink-0">
                        <IconComp className="size-5 text-[#7D52F4]" />
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 flex flex-col gap-[8px] min-w-0">
                        <div className="flex flex-col gap-[4px]">
                          <div className="flex items-center gap-[8px]">
                            <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]">
                              {item.title}
                            </span>
                            {item.isUnread && (
                              <div className="size-[6px] rounded-full bg-[#FB3748] shrink-0" />
                            )}
                          </div>
                          <p className="text-[13px] font-normal text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
                            {item.description}
                          </p>
                        </div>

                        {/* Metadata Footer */}
                        <div className="flex items-center gap-[8px]">
                          <span className="text-[12px] font-medium text-[#A4A4A4] leading-[16px]">
                            {item.time}
                          </span>
                          <span className="text-[12px] text-[#D1D1D1]">•</span>
                          <span className="text-[12px] font-mono text-[#5C5C5C] leading-[20px]">
                            {item.caseRef}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer Group [1.1] */}
      <div className="flex items-center justify-between w-full h-[32px] mt-2 border-t border-[#EBEBEB] pt-[24px]">
        {/* Left: Page summary */}
        <span className="text-[14px] font-normal text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
          Page {currentPage} of {totalPages}
        </span>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-[8px]">
          {/* First page */}
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
            title="First page"
          >
            «
          </button>

          {/* Prev page */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
            title="Previous page"
          >
            <RiArrowLeftSLine className="size-5 text-[#5C5C5C]" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`size-8 rounded-[8px] flex items-center justify-center text-[14px] font-medium transition-colors border-0 cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-[#171717] text-white"
                    : "bg-white border border-[#EBEBEB] text-[#171717] hover:bg-neutral-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && <span className="text-[14px] text-[#A4A4A4] px-1">...</span>}

          {totalPages > 5 && (
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              className={`size-8 rounded-[8px] flex items-center justify-center text-[14px] font-medium transition-colors border-0 cursor-pointer ${
                currentPage === totalPages
                  ? "bg-[#171717] text-white"
                  : "bg-transparent text-[#5C5C5C] hover:bg-neutral-200"
              }`}
            >
              {totalPages}
            </button>
          )}

          {/* Next page */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
            title="Next page"
          >
            <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
          </button>

          {/* Last page */}
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
            title="Last page"
          >
            »
          </button>
        </div>

        {/* Right: Items per page selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-[32px] px-[10px] bg-white border border-[#EBEBEB] rounded-[8px] flex items-center gap-[4px] text-[14px] font-normal text-[#5C5C5C] hover:text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] cursor-pointer outline-none"
          >
            <span>{itemsPerPage} / page</span>
            <RiArrowDownSLine className="size-5 text-[#A4A4A4]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[110px] bg-white border border-[#EBEBEB] rounded-[12px] shadow-card-large p-1">
            {[10, 20, 50, 100].map((num) => (
              <DropdownMenuItem
                key={num}
                onClick={() => setItemsPerPage(num)}
                className="text-[14px] text-[#171717] cursor-pointer rounded-[6px] px-3 py-1.5 hover:bg-[#F5F5F5]"
              >
                {num} / page
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
