"use client";

import * as React from "react";
import {
  RiSearchLine,
  RiFilter3Line,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiTimer2Line,
  RiRepeatLine,
  RiUploadCloud2Line,
  RiFolder2Line,
} from "@remixicon/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

interface TimelineEvent {
  id: string;
  badge:
    | "NOTE"
    | "ACTION CREATED"
    | "REMINDER"
    | "MIGRATION STATUS"
    | "DOC UPLOADED"
    | "AI DATA EXTRACTION"
    | "ACTION COMPLETE"
    | "CASE CREATED"
    | "CASE UPDATED";
  title: string;
  description: string;
  time: string;
  timestamp: number;
  actorName: string;
  actorType: "user" | "ai" | "initials";
  actorAvatar?: string;
  actorInitials?: string;
  icon: React.ElementType;
}

interface TimelineGroup {
  date: string;
  events: TimelineEvent[];
}

export function TimelineTab({ id }: { id?: string }) {
  const [timelineGroups, setTimelineGroups] = React.useState<TimelineGroup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  const loadTimelineEvents = React.useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const events: TimelineEvent[] = [];

      // 1. Fetch case details
      try {
        const caseData = await apiClient.get<any>(ENDPOINTS.cases.byId(id));
        if (caseData) {
          const createdAt = caseData.createdAt ? new Date(caseData.createdAt) : new Date();
          events.push({
            id: `case_created_${id}`,
            badge: "CASE CREATED",
            title: `Case #${caseData.caseNumber || id} created`,
            description: `Initial visa application record created for ${caseData.migrant?.name || caseData.migrant?.fullName || "migrant"}.`,
            time: createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            timestamp: createdAt.getTime(),
            actorName: "System",
            actorType: "ai",
            icon: RiFolder2Line,
          });

          if (caseData.status && caseData.updatedAt && caseData.updatedAt !== caseData.createdAt) {
            const updatedAt = new Date(caseData.updatedAt);
            events.push({
              id: `case_status_${id}`,
              badge: "CASE UPDATED",
              title: `Status: ${caseData.status}`,
              description: caseData.decision?.id
                ? `Visa decision recorded: ${caseData.decision.id}`
                : `Case status transitioned to ${caseData.status}`,
              time: updatedAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              timestamp: updatedAt.getTime(),
              actorName: "System",
              actorType: "ai",
              icon: RiRepeatLine,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load case data for timeline:", err);
      }

      // 2. Fetch case files
      try {
        const files = await apiClient.get<any[]>(`${ENDPOINTS.files.base}/list/cases/${id}`);
        if (Array.isArray(files)) {
          files.forEach((file, idx) => {
            const fileDate = file.createdAt ? new Date(file.createdAt) : new Date();
            const fileName = file.originalName || file.name || file.filename || "Document";
            events.push({
              id: `file_${file.id || idx}`,
              badge: "DOC UPLOADED",
              title: `${fileName} uploaded`,
              description: `Added to ${file.folderName || "case vault"}${file.size ? ` (${(Number(file.size) / (1024 * 1024)).toFixed(1)} MB)` : ""}.`,
              time: fileDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              timestamp: fileDate.getTime(),
              actorName: "Case Manager",
              actorType: "initials",
              actorInitials: "CM",
              icon: RiUploadCloud2Line,
            });
          });
        }
      } catch (err) {
        console.error("Failed to load files for timeline:", err);
      }

      // 3. Load case notes from localStorage
      try {
        const storageKey = `viems_case_notes_${id}`;
        const savedNotes = localStorage.getItem(storageKey);
        if (savedNotes) {
          const parsed = JSON.parse(savedNotes);
          if (Array.isArray(parsed)) {
            parsed.forEach((note) => {
              events.push({
                id: `note_${note.id}`,
                badge: "NOTE",
                title: `Note from ${note.authorName || "Advisor"}`,
                description: note.content || "",
                time: "12:00 PM",
                timestamp: Date.now() - 3600000,
                actorName: note.authorName || "Advisor",
                actorType: "initials",
                actorInitials: note.avatarText || "AD",
                icon: RiFileTextLine,
              });
            });
          }
        }
      } catch (err) {
        console.error("Failed to parse notes for timeline:", err);
      }

      // Group events by date (descending)
      events.sort((a, b) => b.timestamp - a.timestamp);

      const groupMap = new Map<string, TimelineEvent[]>();
      events.forEach((evt) => {
        const dateKey = new Date(evt.timestamp)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .toUpperCase();
        if (!groupMap.has(dateKey)) {
          groupMap.set(dateKey, []);
        }
        groupMap.get(dateKey)!.push(evt);
      });

      const groups: TimelineGroup[] = [];
      groupMap.forEach((evts, date) => {
        groups.push({ date, events: evts });
      });

      setTimelineGroups(groups);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadTimelineEvents();
  }, [loadTimelineEvents]);

  const filteredGroups = React.useMemo(() => {
    if (!searchQuery.trim()) return timelineGroups;
    const query = searchQuery.toLowerCase();
    return timelineGroups
      .map((group) => ({
        ...group,
        events: group.events.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.description.toLowerCase().includes(query) ||
            e.badge.toLowerCase().includes(query) ||
            e.actorName.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.events.length > 0);
  }, [timelineGroups, searchQuery]);

  return (
    <div className="w-full flex flex-col gap-6 font-sans animate-fade-in text-left max-w-[1104px] mx-auto">
      {/* ─── Search & Filter Bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-[320px]">
          <RiSearchLine className="size-4 text-[#A4A4A4] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-9 pr-3 text-[13px] bg-white border border-border rounded-input outline-none focus-visible:ring-1 focus-visible:ring-[#7D52F4] text-[#171717] placeholder:text-[#A4A4A4]"
          />
        </div>
      </div>

      {loading ? (
        <div className="w-full py-12 flex flex-col items-center justify-center text-[#A4A4A4]">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-800 mb-2"></div>
          <span className="text-[13px]">Loading timeline events...</span>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-8 text-center flex flex-col items-center justify-center shadow-x-small">
          <div className="size-12 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#5C5C5C] mb-3">
            <RiTimer2Line className="size-6" />
          </div>
          <h4 className="text-[15px] font-medium text-[#171717]">No activity recorded yet</h4>
          <p className="text-[13px] text-[#7B7B7B] mt-1 max-w-sm">
            Activity and timeline milestones will appear here as documents are uploaded, actions are completed, and notes are posted.
          </p>
        </div>
      ) : (
        /* ─── Timeline Feed ────────────────────────────────────────────────── */
        <div className="relative w-full pt-2 flex flex-col gap-8">
          {filteredGroups.map((group) => (
            <div key={group.date} className="flex flex-col gap-4 w-full relative">
              {/* Date Header with Node Dot */}
              <div className="flex items-center gap-3 pl-10 relative">
                {/* Continuous Line Segment through Date Header */}
                <div className="absolute left-[15px] top-0 bottom-0 w-[1px] bg-[#D1D1D1]" />
                <div className="relative z-10 size-2.5 rounded-full bg-[#D1D1D1] border border-[#D1D1D1] shrink-0 -ml-[1px]" />
                <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#171717] leading-[16px] ml-1">
                  {group.date}
                </span>
              </div>

              {/* Events List under Date */}
              <div className="flex flex-col gap-5 relative pl-12 border-l border-[#D1D1D1] ml-[15px]">
                {group.events.map((event) => {
                  const IconComponent = event.icon;
                  return (
                    <div key={event.id} className="relative flex items-start gap-4">
                      {/* Left Key Icon Node */}
                      <div className="absolute -left-[64px] top-3 size-8 rounded-full bg-[#F5F5F5] border border-[#D1D1D1] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center justify-center text-[#171717] shrink-0 z-10">
                        <IconComponent className="size-5" />
                      </div>

                      {/* Main Event Card */}
                      <div className="flex-1 bg-white border border-white shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[16px] p-[16px] flex items-start justify-between gap-[48px] transition-all hover:border-neutral-200">
                        {/* Left Column: Badge & Content */}
                        <div className="flex flex-col gap-2 min-w-0 flex-1">
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#EFEBFF] text-[#171717] text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px]">
                              {event.badge}
                            </span>
                          </div>

                          <div className="flex flex-col gap-[2px]">
                            <h4 className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]">
                              {event.title}
                            </h4>
                            <p className="text-[13px] text-[#7B7B7B] font-normal leading-[20px] tracking-[-0.006em]">
                              {event.description}
                            </p>
                          </div>
                        </div>

                        {/* Right Column: Time & User Profile */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-[11px] font-medium uppercase text-[#A4A4A4] tracking-[0.02em] leading-[12px]">
                            {event.time}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {event.actorType === "user" && event.actorAvatar ? (
                              <img
                                src={event.actorAvatar}
                                alt={event.actorName}
                                className="size-5 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="size-5 rounded-full bg-[#EBEBEB] text-[#171717] font-medium text-[8px] flex items-center justify-center shrink-0">
                                {event.actorInitials ||
                                  (event.actorName === "System" || event.actorName === "Viems"
                                    ? "AI"
                                    : event.actorName.slice(0, 2).toUpperCase())}
                              </div>
                            )}
                            <span className="text-[13px] font-normal text-[#7B7B7B] tracking-[-0.006em]">
                              {event.actorName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
