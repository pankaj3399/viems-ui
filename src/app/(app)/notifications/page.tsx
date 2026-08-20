"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RiSearch2Line,
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiCloseLine,
  RiCheckLine,
  RiExternalLinkLine,
  RiMoreFill,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import {
  getReadIds,
  persistReadId,
  persistAllRead,
  removeReadId,
  formatTimeAgo,
  getGroupLabel,
  getIconForEntity,
  getCategoryForLog,
  getTargetUrl,
  type LogEntry,
  type LogsResponse,
} from "@/lib/notifications";

interface PageNotificationItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  time: string;
  caseRef: string;
  group: string;
  targetUrl: string;
  isUnread?: boolean;
  category: "mentions" | "tasks" | "cases" | "messages" | "documents";
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = React.useState<PageNotificationItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState<string>("all");
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [loading, setLoading] = React.useState(true);

  const fetchPageNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<LogsResponse>(ENDPOINTS.logs.base, {
        params: { take: "100", sort_by: "date.desc" },
      });
      const rawLogs: LogEntry[] = Array.isArray(res) ? res : res?.logs ?? res?.data ?? [];
      const readIds = getReadIds();

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
          const logId = String(log.id ?? `log-${i}`);
          const isReadInStorage = readIds.includes(logId);
          const targetUrl = getTargetUrl(entityName, log.entityIdentifier, log.action);

          return {
            id: logId,
            group,
            icon,
            title,
            description,
            time: timeAgo,
            caseRef: idStr || `#${log.id ?? "430/2026"}`,
            targetUrl,
            isUnread: !isReadInStorage,
            category,
          };
        });
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to fetch page notification logs:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPageNotifications();

    const handleUpdate = () => {
      const readIds = getReadIds();
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          isUnread: !readIds.includes(item.id),
        }))
      );
    };

    window.addEventListener("viems_notifications_updated", handleUpdate);
    return () => {
      window.removeEventListener("viems_notifications_updated", handleUpdate);
    };
  }, [fetchPageNotifications]);

  const handleMarkAllRead = () => {
    const allIds = items.map((i) => i.id);
    persistAllRead(allIds);
    setItems((prev) => prev.map((item) => ({ ...item, isUnread: false })));
  };

  const handleItemClick = (item: PageNotificationItem) => {
    persistReadId(item.id);
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isUnread: false } : i))
    );
    router.push(item.targetUrl);
  };

  const handleToggleItemRead = (item: PageNotificationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isUnread) {
      persistReadId(item.id);
    } else {
      removeReadId(item.id);
    }
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isUnread: !i.isUnread } : i))
    );
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
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const groups = React.useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
    
    if (unreadOnly) {
      return [["UNREAD ONLY", paginatedItems] as [string, PageNotificationItem[]]];
    }

    const map = new Map<string, PageNotificationItem[]>();
    paginatedItems.forEach((item) => {
      const existing = map.get(item.group) || [];
      existing.push(item);
      map.set(item.group, existing);
    });
    return Array.from(map.entries());
  }, [filteredItems, safeCurrentPage, itemsPerPage, unreadOnly]);

  const filterCategoryLabels: Record<string, string> = {
    all: "All notifications",
    mentions: "Mentions",
    tasks: "Task updates",
    cases: "Case updates",
    messages: "Messages",
    documents: "Documents",
  };

  const hasUnread = items.some((i) => i.isUnread);

  return (
    <div className="px-[40px] py-[32px] pb-[80px] flex flex-col gap-xl font-sans bg-[#F7F7F7] min-h-screen select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-xl shrink-0">
        <div>
          <h1 className="text-[24px] text-[#171717] tracking-[-0.01em] leading-[32px] font-aeonik-medium">
            Notifications
          </h1>
          <p className="text-[14px] text-[#5C5C5C] tracking-[-0.006em] mt-1 leading-[20px] font-sans">
            Track and manage activity across your cases, migrants, documents, and tasks.
          </p>
        </div>
        {items.length > 0 && hasUnread && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="w-[133px] h-[40px] bg-[#F5F5F5] hover:bg-[#EBEBEB] active:bg-[#E0E0E0] text-[#5C5C5C] hover:text-[#171717] rounded-[10px] text-[14px] font-medium transition-all cursor-pointer border-0 flex items-center justify-center shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Toolbar / Filters Row */}
      <div className="flex items-center gap-[12px] w-full">
        {/* Search Bar */}
        <div className="w-[348px] h-[32px] bg-white border border-[#EBEBEB] rounded-[8px] px-[8px] py-[6px] flex items-center gap-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <RiSearch2Line className="size-5 text-[#A4A4A4] shrink-0" />
          <input
            type="text"
            aria-label="Search notifications"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-[14px] font-normal text-[#171717] placeholder:text-[#A4A4A4] border-0 outline-none leading-[20px] tracking-[-0.006em]"
          />
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-[32px] px-[12px] bg-white border border-[#EBEBEB] rounded-[8px] flex items-center gap-[6px] text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] hover:bg-[#FAFAFA] cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)] outline-none transition-colors"
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

        {/* Unread Only Toggle Badge */}
        {unreadOnly ? (
          <button
            type="button"
            onClick={() => setUnreadOnly(false)}
            className="h-[32px] px-[12px] bg-[#171717] hover:bg-[#262626] active:bg-[#0A0A0A] text-white rounded-[8px] text-[14px] font-medium transition-all cursor-pointer border border-[#171717] flex items-center gap-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          >
            <span>Unread only</span>
            <RiCloseLine className="size-4 text-white" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setUnreadOnly(true)}
            className="h-[32px] px-[12px] bg-white hover:bg-neutral-50 active:bg-neutral-100 text-[#5C5C5C] hover:text-[#171717] rounded-[8px] text-[14px] font-medium transition-all cursor-pointer border border-[#EBEBEB] flex items-center gap-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
          >
            <span>Unread only</span>
          </button>
        )}
      </div>

      {/* Grouped Notifications List */}
      <div className="flex flex-col gap-[32px] w-full">
        {loading ? (
          <div className="py-[80px] flex flex-col items-center justify-center gap-3 bg-white border border-[#EBEBEB] rounded-[16px] text-neutral-500">
            <div className="size-6 border-2 border-[#7D52F4] border-t-transparent rounded-full animate-spin" />
            <span className="text-[14px]">Loading notifications from system...</span>
          </div>
        ) : groups.length === 0 || (groups.length === 1 && groups[0][1].length === 0) ? (
          <div className="py-[60px] text-center bg-white border border-[#EBEBEB] rounded-[16px] text-neutral-400 text-[14px]">
            {searchQuery || filterCategory !== "all" || unreadOnly
              ? "No notifications match your current filters."
              : "No notifications found."}
          </div>
        ) : (
          groups.map(([groupTitle, groupItems]) => (
            <div key={groupTitle} className="flex flex-col gap-[8px] w-full">
              {/* Group Section Header */}
              <div className="flex items-center gap-[8px] h-[16px]">
                <span className="text-[12px] font-medium text-[#171717] tracking-[0.04em] uppercase leading-[16px]">
                  {groupTitle}
                </span>
              </div>

              {/* Items Card List */}
              <div className="flex flex-col gap-[8px] w-full">
                {groupItems.map((item) => {
                  const IconComp = item.icon;
                  const isStatusChange = item.title.toLowerCase().includes("status");
                  return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleItemClick(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleItemClick(item);
                        }
                      }}
                      className="w-full text-left h-auto min-h-[104px] bg-white border border-[#EBEBEB] hover:border-neutral-300 rounded-[12px] p-[16px] flex items-start gap-[16px] transition-all cursor-pointer shadow-[0px_1px_2px_rgba(10,13,20,0.03)] relative group focus:outline-none focus:ring-1 focus:ring-[#7D52F4]/30"
                    >
                      {/* Left Icon */}
                      <div className="size-[36px] rounded-full bg-white border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center justify-center shrink-0">
                        {isStatusChange ? (
                          <div className="size-[10px] rounded-full bg-[#FB3748] border-2 border-white shadow-[0px_2px_4px_rgba(27,28,29,0.04)]" />
                        ) : (
                          <IconComp className="size-5 text-[#7D52F4]" />
                        )}
                      </div>

                      {/* Text Content */}
                      <div className="flex-1 flex flex-col gap-[8px] min-w-0 pr-8">
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

                      {/* Action dropdown button */}
                      <div className="absolute right-3 top-3" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label="Notification actions"
                            className="size-7 rounded-[6px] hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-800 transition-colors border-0 bg-transparent outline-none cursor-pointer"
                          >
                            <RiMoreFill className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[150px] bg-white border border-[#EBEBEB] rounded-[10px] p-1 shadow-card-large">
                            <DropdownMenuItem
                              onClick={(e) => handleToggleItemRead(item, e)}
                              className="text-[13px] text-[#171717] flex items-center gap-2 cursor-pointer py-1.5"
                            >
                              <RiCheckLine className="size-4 text-[#5C5C5C]" />
                              <span>{item.isUnread ? "Mark as read" : "Mark as unread"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleItemClick(item)}
                              className="text-[13px] text-[#171717] flex items-center gap-2 cursor-pointer py-1.5"
                            >
                              <RiExternalLinkLine className="size-4 text-[#5C5C5C]" />
                              <span>View details</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer Group */}
      <div className="flex items-center justify-between w-full h-[32px] mt-2 border-t border-[#EBEBEB] pt-[24px]">
        {/* Left: Page summary */}
        <span className="text-[14px] font-normal text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
          Page {safeCurrentPage} of {totalPages}
        </span>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-[8px]">
          {/* First page */}
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage === 1}
            className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
            title="First page"
          >
            <RiArrowLeftDoubleLine className="size-5 text-[#5C5C5C]" />
          </button>

          {/* Prev page */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage === 1}
            className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
            title="Previous page"
          >
            <RiArrowLeftSLine className="size-5 text-[#5C5C5C]" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
            const pageNum = i + 1;
            const isActive = safeCurrentPage === pageNum;
            const isSecond = pageNum === 2 && !isActive;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`size-8 rounded-[8px] flex items-center justify-center text-[14px] font-medium transition-colors border-0 cursor-pointer ${
                  isActive
                    ? "bg-[#171717] text-white"
                    : isSecond
                    ? "bg-white border border-[#EBEBEB] text-[#171717] hover:bg-neutral-50"
                    : "bg-white text-[#5C5C5C] hover:bg-neutral-50"
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
                safeCurrentPage === totalPages
                  ? "bg-[#171717] text-white"
                  : "bg-white text-[#5C5C5C] hover:bg-neutral-50"
              }`}
            >
              {totalPages}
            </button>
          )}

          {/* Next page */}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, safeCurrentPage + 1))}
            disabled={safeCurrentPage === totalPages}
            className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
            title="Next page"
          >
            <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
          </button>

          {/* Last page */}
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage === totalPages}
            className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-40 transition-colors border-0 cursor-pointer"
            title="Last page"
          >
            <RiArrowRightDoubleLine className="size-5 text-[#5C5C5C]" />
          </button>
        </div>

        {/* Right: Items per page selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="min-w-[100px] h-[32px] px-[10px] py-[6px] bg-white border border-[#EBEBEB] rounded-[8px] flex items-center justify-between gap-[6px] text-[14px] font-normal text-[#5C5C5C] hover:text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] cursor-pointer outline-none shrink-0 transition-colors whitespace-nowrap"
          >
            <span className="whitespace-nowrap">{itemsPerPage} / page</span>
            <RiArrowDownSLine className="size-4 text-[#A4A4A4] shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[110px] bg-white border border-[#EBEBEB] rounded-[12px] shadow-card-large p-1">
            {[10, 20, 50, 100].map((num) => (
              <DropdownMenuItem
                key={num}
                onClick={() => {
                  setItemsPerPage(num);
                  setCurrentPage(1);
                }}
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
