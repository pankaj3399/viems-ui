"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  RiSettings2Line,
  RiMoreFill,
  RiNotification3Line,
  RiCheckLine,
  RiExternalLinkLine,
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
  getIconForEntity,
  getTargetUrl,
  type LogEntry,
  type LogsResponse,
} from "@/lib/notifications";

interface NotificationItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  time: string;
  caseRef: string;
  targetUrl: string;
  isUnread?: boolean;
  hasBlueDot?: boolean;
  hasMenu?: boolean;
  isHighlighted?: boolean;
}

export function NotificationsPopover() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchNotifications = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<LogsResponse>(ENDPOINTS.logs.base, {
        params: { take: "15", sort_by: "date.desc" },
      });
      const rawLogs: LogEntry[] = Array.isArray(res) ? res : res?.logs ?? res?.data ?? [];
      const readIds = getReadIds();

      if (rawLogs.length > 0) {
        const mapped: NotificationItem[] = rawLogs.map((log, i) => {
          const userName = log.userName ?? "System";
          const entityName = log.entityName ?? "Case";
          const idStr = log.entityIdentifier ? `#${log.entityIdentifier}` : "";
          const actionText = log.action ? log.action.charAt(0).toUpperCase() + log.action.slice(1) : "Updated";
          const title = `${userName} ${log.action ?? "updated"} ${entityName} ${idStr}`.trim();
          const description = log.newValue
            ? `Updated value to: ${log.newValue}`
            : `${actionText} ${entityName} in system.`;
          const timeAgo = formatTimeAgo(log.creationDate);
          const icon = getIconForEntity(entityName, log.action);
          const logId = String(log.id ?? `log-${i}`);
          const isReadInStorage = readIds.includes(logId);
          const targetUrl = getTargetUrl(entityName, log.entityIdentifier, log.action);

          return {
            id: logId,
            icon,
            title,
            description,
            time: timeAgo,
            caseRef: idStr || `#${log.id ?? "430/2026"}`,
            targetUrl,
            isUnread: !isReadInStorage,
            hasBlueDot: (log.action || "").toLowerCase().includes("overdue") || (log.action || "").toLowerCase().includes("pending"),
            hasMenu: true,
            isHighlighted: i === 0 && !isReadInStorage,
          };
        });
        setNotifications(mapped);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to fetch notification logs:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();

    const handleUpdate = () => {
      const readIds = getReadIds();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isUnread: !readIds.includes(n.id),
        }))
      );
    };

    window.addEventListener("viems_notifications_updated", handleUpdate);
    return () => {
      window.removeEventListener("viems_notifications_updated", handleUpdate);
    };
  }, [fetchNotifications]);

  const hasUnread = notifications.some((n) => n.isUnread);

  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    persistAllRead(allIds);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isUnread: false, hasBlueDot: false, isHighlighted: false }))
    );
  };

  const handleItemClick = (item: NotificationItem) => {
    persistReadId(item.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isUnread: false, isHighlighted: false } : n))
    );
    router.push(item.targetUrl);
  };

  const handleToggleItemRead = (item: NotificationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isUnread) {
      persistReadId(item.id);
    } else {
      removeReadId(item.id);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isUnread: !n.isUnread } : n))
    );
  };

  return (
    <Popover>
      <PopoverTrigger
        className="relative size-10 rounded-[10px] hover:bg-white/5 active:bg-white/10 flex items-center justify-center text-neutral-400 cursor-pointer transition-colors border-0 bg-transparent shrink-0 outline-none"
        title="Notifications"
      >
        <RiNotification3Line className="size-5 text-[#A4A4A4]" />
        {hasUnread && (
          <div className="absolute top-[10px] right-[10px] size-1.5 rounded-full bg-[#FB3748] border-2 border-[#171717] shadow-x-small" />
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[420px] p-0 bg-white border border-[#EBEBEB] rounded-[24px] shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] overflow-hidden font-sans select-none"
      >
        {/* Header */}
        <div className="h-[56px] px-[20px] py-[16px] flex items-center justify-between bg-white border-b border-dashed border-[#EBEBEB]">
          <span className="text-[16px] font-medium text-[#5C5C5C] leading-[24px] tracking-[-0.011em]">
            Notifications
          </span>
          <div className="flex items-center gap-[16px]">
            {notifications.length > 0 && hasUnread && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[#7D52F4] hover:text-[#6938EE] active:opacity-70 text-[12px] font-medium leading-[16px] transition-colors cursor-pointer border-0 bg-transparent flex items-center"
              >
                Mark all as read
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push("/notifications")}
              className="size-6 rounded-[6px] hover:bg-neutral-100 flex items-center justify-center text-[#A4A4A4] hover:text-[#171717] transition-colors cursor-pointer border-0 bg-transparent"
              title="All notifications"
            >
              <RiSettings2Line className="size-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-[8px_8px_0px] flex flex-col max-h-[480px] overflow-y-auto">
          {loading ? (
            <div className="py-[48px] flex flex-col items-center justify-center gap-2 text-[#7B7B7B]">
              <div className="size-5 border-2 border-[#7D52F4] border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px]">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-[48px] text-center text-[#7B7B7B] text-[13px]">
              No recent notifications
            </div>
          ) : (
            notifications.map((item, idx) => {
              const IconComponent = item.icon;
              const isStatusChange = item.title.toLowerCase().includes("status");
              return (
                <React.Fragment key={item.id}>
                  {idx > 0 && (
                    <div className="w-[404px] border-t border-[#EBEBEB] mx-auto" />
                  )}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleItemClick(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleItemClick(item);
                      }
                    }}
                    className={`w-full min-h-[124px] p-[16px] rounded-[12px] flex items-start gap-[16px] transition-colors relative cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#7D52F4]/30 ${
                      item.isHighlighted ? "bg-[#F5F5F5]" : "bg-white hover:bg-[#F9F9F9]"
                    }`}
                  >
                    {/* Icon */}
                    <div className="size-[36px] rounded-full bg-white border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center justify-center shrink-0">
                      {isStatusChange ? (
                        <div className="size-[10px] rounded-full bg-[#7B7B7B] border-2 border-white shadow-[0px_2px_4px_rgba(27,28,29,0.04)]" />
                      ) : (
                        <IconComponent className="size-5 text-[#7D52F4]" />
                      )}
                    </div>

                    {/* Text Stack */}
                    <div className="flex-1 flex flex-col gap-[8px] min-w-0">
                      {/* Content */}
                      <div className="flex flex-col gap-[4px] relative pr-6">
                        {/* Title */}
                        <div className="flex items-center gap-[8px]">
                          <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]">
                            {item.title}
                          </span>
                          {item.hasBlueDot && (
                            <div className="size-[6px] rounded-full bg-[#335CFF] shrink-0" />
                          )}
                        </div>

                        {/* Unread indicator */}
                        {item.isUnread && (
                          <div className="absolute right-0 top-[7px] size-[6px] rounded-full bg-[#FB3748] shrink-0" />
                        )}

                        {/* Menu dropdown */}
                        {item.hasMenu && (
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Notification item options"
                              className="absolute right-0 top-0 size-5 text-[#A4A4A4] hover:text-[#171717] flex items-center justify-center cursor-pointer border-0 bg-transparent outline-none"
                              title="Options"
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemClick(item);
                                }}
                                className="text-[13px] text-[#171717] flex items-center gap-2 cursor-pointer py-1.5"
                              >
                                <RiExternalLinkLine className="size-4 text-[#5C5C5C]" />
                                <span>View item</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {/* Description */}
                        <p className="text-[13px] font-normal text-[#5C5C5C] leading-[20px] tracking-[-0.006em] line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Metadata Row */}
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
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-[8px_20px_20px] bg-white">
          <button
            type="button"
            onClick={() => router.push("/notifications")}
            className="w-[380px] h-[32px] bg-[#F5F5F5] hover:bg-[#EBEBEB] active:bg-[#E0E0E0] rounded-[8px] flex items-center justify-center text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-all cursor-pointer border-0 mx-auto"
          >
            View all notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
