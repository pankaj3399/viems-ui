import * as React from "react";
import {
  RiAtLine,
  RiFocus2Line,
  RiRecordCircleLine,
  RiFileListLine,
  RiChatSmile2Line,
  RiFileUploadLine,
  RiFileChartLine,
} from "@remixicon/react";

export interface LogEntry {
  id: number | string;
  userName?: string;
  userEmail?: string;
  action?: string;
  entityName?: string;
  entityIdentifier?: string;
  creationDate?: string;
  newValue?: string;
  oldValue?: string;
  ipAddress?: string;
}

export type LogsResponse =
  | LogEntry[]
  | { logs?: LogEntry[]; data?: LogEntry[]; count?: number };

export const STORAGE_KEY_READ_NOTIFS = "viems_read_notification_ids";

export function getReadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_READ_NOTIFS);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function persistReadId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getReadIds();
    if (!current.includes(id)) {
      localStorage.setItem(STORAGE_KEY_READ_NOTIFS, JSON.stringify([...current, id]));
      window.dispatchEvent(new Event("viems_notifications_updated"));
    }
  } catch (e) {
    console.error("Failed to persist notification read ID:", e);
  }
}

export function persistAllRead(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const current = getReadIds();
    const next = Array.from(new Set([...current, ...ids]));
    localStorage.setItem(STORAGE_KEY_READ_NOTIFS, JSON.stringify(next));
    window.dispatchEvent(new Event("viems_notifications_updated"));
  } catch (e) {
    console.error("Failed to persist all notification read IDs:", e);
  }
}

export function removeReadId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getReadIds();
    const next = current.filter((item) => item !== id);
    localStorage.setItem(STORAGE_KEY_READ_NOTIFS, JSON.stringify(next));
    window.dispatchEvent(new Event("viems_notifications_updated"));
  } catch (e) {
    console.error("Failed to remove notification read ID:", e);
  }
}

export function formatTimeAgo(dateStr?: string): string {
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

export function getGroupLabel(dateStr?: string): string {
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

export function getIconForEntity(entityName?: string, action?: string): React.ComponentType<{ className?: string }> {
  const e = (entityName || "").toLowerCase();
  const a = (action || "").toLowerCase();
  if (e.includes("file") || a.includes("file") || a.includes("upload") || a.includes("doc")) return RiFileUploadLine;
  if (e.includes("task") || a.includes("task") || e.includes("rtw")) return RiFocus2Line;
  if (e.includes("user") || e.includes("employee") || a.includes("mention")) return RiAtLine;
  if (a.includes("status") || a.includes("stage") || a.includes("change")) return RiRecordCircleLine;
  if (e.includes("report") || a.includes("report")) return RiFileChartLine;
  if (e.includes("message") || a.includes("message")) return RiChatSmile2Line;
  return RiFileListLine;
}

export function getCategoryForLog(
  entityName?: string,
  action?: string
): "mentions" | "tasks" | "cases" | "messages" | "documents" {
  const e = (entityName || "").toLowerCase();
  const a = (action || "").toLowerCase();
  if (e.includes("file") || a.includes("file") || a.includes("upload") || a.includes("doc")) return "documents";
  if (e.includes("task") || a.includes("task") || e.includes("rtw")) return "tasks";
  if (e.includes("user") || e.includes("note") || a.includes("mention")) return "mentions";
  if (e.includes("chat") || e.includes("message")) return "messages";
  return "cases";
}

export function getTargetUrl(entityName?: string, entityIdentifier?: string, _action?: string): string {
  const e = (entityName || "").toLowerCase();
  const rawId = entityIdentifier ? entityIdentifier.replace(/^#/, "").trim() : "";
  const encodedId = rawId ? encodeURIComponent(rawId) : "";

  if (e.includes("case") || e.includes("sponsorship")) {
    return encodedId ? `/cases/${encodedId}` : "/cases";
  }
  if (e.includes("migrant") || e.includes("worker") || e.includes("applicant")) {
    return encodedId ? `/migrants/${encodedId}` : "/migrants";
  }
  if (e.includes("file") || e.includes("doc") || e.includes("upload")) {
    return "/compliance/documents";
  }
  if (e.includes("task") || e.includes("rtw") || e.includes("check")) {
    return "/compliance/rtw-checks";
  }
  if (e.includes("log") || e.includes("audit")) {
    return "/compliance/logs";
  }
  return encodedId ? `/cases/${encodedId}` : "/cases";
}
