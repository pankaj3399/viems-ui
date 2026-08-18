"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Bell } from "lucide-react";
import {
  RiAtLine,
  RiFocus2Line,
  RiRecordCircleLine,
  RiFileListLine,
  RiChatSmile2Line,
  RiFileUploadLine,
  RiFileChartLine,
  RiSettings2Line,
  RiMoreFill,
  RiNotification3Line,
} from "@remixicon/react";

interface NotificationItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  time: string;
  caseRef: string;
  isUnread?: boolean;
  hasBlueDot?: boolean;
  hasMenu?: boolean;
  isHighlighted?: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    icon: RiAtLine,
    title: "Sarah Kim mentioned you in a note",
    description: "“@Alex Marin can you chase Berklee for the qualification docs?”",
    time: "10 min ago",
    caseRef: "#430/2026",
    isUnread: true,
  },
  {
    id: "2",
    icon: RiFocus2Line,
    title: "RTW check overdue",
    description: "The 27d deadline has passed. Complete the digital share code to avoid penalties.",
    time: "1h ago",
    caseRef: "#430/2026",
    hasBlueDot: true,
    hasMenu: true,
    isHighlighted: true,
  },
  {
    id: "3",
    icon: RiRecordCircleLine,
    title: "Case status changed: Taylor Johnson",
    description: "#430/2026 moved from Awaiting UKVI Decision to Visa Refused.",
    time: "Yesterday",
    caseRef: "#430/2026",
    isUnread: true,
  },
  {
    id: "4",
    icon: RiFileListLine,
    title: "Details completed: Sofia Reyez",
    description: "The migrant has submitted their personal information.",
    time: "2d ago",
    caseRef: "#430/2026",
    isUnread: true,
  },
  {
    id: "5",
    icon: RiChatSmile2Line,
    title: "New message from Live Nation UK",
    description: "“Hi Alex, please find attached the updated event schedule for Amara Osei’s tour dates.”",
    time: "3d ago",
    caseRef: "#430/2026",
  },
  {
    id: "6",
    icon: RiFileUploadLine,
    title: "Document uploaded: Carlos Vega",
    description: "Flight booking confirmation uploaded to #430/2026. AI extracted 4 fields.",
    time: "3d ago",
    caseRef: "#430/2026",
  },
  {
    id: "7",
    icon: RiFileChartLine,
    title: "SMS report due in 3 days",
    description: "Reportable event for Carlos Vega: Address change. Log in on SMS by 27 Mar 2026.",
    time: "3d ago",
    caseRef: "#430/2026",
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

function getIconForEntity(entityName?: string, action?: string) {
  const e = (entityName || "").toLowerCase();
  const a = (action || "").toLowerCase();
  if (e.includes("file") || a.includes("file") || a.includes("upload")) return RiFileUploadLine;
  if (e.includes("task") || a.includes("task")) return RiFocus2Line;
  if (e.includes("user") || e.includes("employee")) return RiAtLine;
  if (a.includes("status") || a.includes("stage")) return RiRecordCircleLine;
  return RiFileListLine;
}

export function NotificationsPopover() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        const res = await apiClient.get<any>(ENDPOINTS.logs.base, {
          params: { take: "10", sort_by: "date.desc" },
        });
        const rawLogs: any[] = Array.isArray(res) ? res : res?.logs ?? res?.data ?? [];
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
            return {
              id: String(log.id ?? i),
              icon,
              title,
              description,
              time: timeAgo,
              caseRef: idStr || "#430/2026",
              isUnread: i < 3,
            };
          });
          setNotifications(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch notification logs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const hasUnread = notifications.some((n) => n.isUnread || n.hasBlueDot);

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isUnread: false, hasBlueDot: false }))
    );
  };

  return (
    <Popover>
      <PopoverTrigger
        className="relative size-10 rounded-[10px] hover:bg-white/5 flex items-center justify-center text-neutral-400 cursor-pointer transition-colors border-0 bg-transparent shrink-0 outline-none"
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
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="px-[12px] py-[6px] bg-[#F5F5F5] hover:bg-[#E0E0E0] active:bg-[#D4D4D4] text-[#5C5C5C] hover:text-[#171717] rounded-[8px] text-[13px] font-medium transition-all cursor-pointer border-0 flex items-center justify-center"
            >
              Mark all as read
            </button>
            <button
              type="button"
              onClick={() => router.push("/notifications")}
              className="size-6 rounded-[6px] hover:bg-neutral-100 flex items-center justify-center text-[#A4A4A4] transition-colors cursor-pointer border-0 bg-transparent"
              title="Notification settings"
            >
              <RiSettings2Line className="size-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-[8px_8px_0px] flex flex-col gap-2 max-h-[480px] overflow-y-auto">
          {notifications.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <React.Fragment key={item.id}>
                {idx > 0 && (
                  <div className="w-full border-t border-[#EBEBEB] my-0.5" />
                )}
                <div
                  className={`w-full p-[16px] rounded-[12px] flex items-start gap-[16px] transition-colors relative ${
                    item.isHighlighted ? "bg-[#F5F5F5]" : "bg-white hover:bg-[#F9F9F9]"
                  }`}
                >
                  {/* Icon */}
                  <div className="size-[36px] rounded-full bg-white border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center justify-center shrink-0">
                    <IconComponent className="size-5 text-[#7D52F4]" />
                  </div>

                  {/* Text Stack */}
                  <div className="flex-1 flex flex-col gap-[8px] min-w-0">
                    {/* Content */}
                    <div className="flex flex-col gap-[4px] relative pr-5">
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

                      {/* Menu icon */}
                      {item.hasMenu && (
                        <button
                          type="button"
                          onClick={() => router.push("/notifications")}
                          className="absolute right-0 top-0 size-5 text-[#A4A4A4] hover:text-[#171717] flex items-center justify-center cursor-pointer border-0 bg-transparent"
                          title="Options"
                        >
                          <RiMoreFill className="size-4" />
                        </button>
                      )}

                      {/* Description */}
                      <p className="text-[13px] font-normal text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
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
          })}
        </div>

        {/* Footer */}
        <div className="p-[12px_16px_16px] bg-white border-t border-[#EBEBEB] mt-2">
          <button
            type="button"
            onClick={() => router.push("/notifications")}
            className="w-full h-[32px] bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-[8px] flex items-center justify-center text-[14px] font-medium text-[#5C5C5C] transition-colors cursor-pointer border-0"
          >
            View all notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
