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
  RiSparkling2Line,
} from "@remixicon/react";

interface TimelineEvent {
  id: string;
  badge:
    | "NOTE"
    | "ACTION CREATED"
    | "REMINDER"
    | "MIGRATION STATUS"
    | "DOC UPLOADED"
    | "AI DATA EXTRACTION"
    | "ACTION COMPLETE";
  title: string;
  description: string;
  time: string;
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

const initialTimelineData: TimelineGroup[] = [
  {
    date: "26 MAR 2026",
    events: [
      {
        id: "e1",
        badge: "NOTE",
        title: "Phone call with Taylor",
        description: "Confirmed passport scan will be sent by the end of the week. Reminded about share code",
        time: "01:12 PM",
        actorName: "Nathan Wood",
        actorType: "user",
        actorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        icon: RiFileTextLine,
      },
      {
        id: "e2",
        badge: "ACTION CREATED",
        title: "Action created: Complete RTW check",
        description: "Right to work verification required within 28 days of employment start.",
        time: "01:12 PM",
        actorName: "System",
        actorType: "ai",
        icon: RiCheckboxCircleLine,
      },
    ],
  },
  {
    date: "24 MAR 2026",
    events: [
      {
        id: "e3",
        badge: "REMINDER",
        title: "Reminder sent to migrant",
        description: "Automated email sent to Taylor requesting share code generation",
        time: "01:12 PM",
        actorName: "Viems",
        actorType: "ai",
        icon: RiTimer2Line,
      },
    ],
  },
  {
    date: "23 MAR 2026",
    events: [
      {
        id: "e4",
        badge: "MIGRATION STATUS",
        title: "Migration status: In the UK",
        description: "Entry recorded at Heathrow Terminal 5",
        time: "01:12 PM",
        actorName: "System",
        actorType: "ai",
        icon: RiRepeatLine,
      },
      {
        id: "e5",
        badge: "DOC UPLOADED",
        title: "Proof of accomodation uploaded",
        description: "RAH_tenancy_agreement.pdf (1.5 MB) added to vault.",
        time: "01:12 PM",
        actorName: "Alex Marin",
        actorType: "initials",
        actorInitials: "AM",
        icon: RiUploadCloud2Line,
      },
      {
        id: "e6",
        badge: "AI DATA EXTRACTION",
        title: "AI extracted address from accomodation doc",
        description: "RAH_tenancy_agreement.pdf (1.5 MB) added to vault.",
        time: "01:12 PM",
        actorName: "System",
        actorType: "ai",
        icon: RiSparkling2Line,
      },
      {
        id: "e7",
        badge: "ACTION COMPLETE",
        title: "Action completed: Verify CoS",
        description: "Certificate of Sponsorship verified by compliance team",
        time: "01:12 PM",
        actorName: "Sarah Kim",
        actorType: "initials",
        actorInitials: "SK",
        icon: RiCheckboxCircleLine,
      },
    ],
  },
];

export function TimelineTab({ id }: { id?: string }) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredGroups = React.useMemo(() => {
    if (!searchQuery.trim()) return initialTimelineData;
    const query = searchQuery.toLowerCase();
    return initialTimelineData
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
  }, [searchQuery]);

  return (
    <div className="w-full flex flex-col gap-6 font-sans select-none animate-fade-in text-left max-w-[1104px] mx-auto">
      
      {/* ─── Search & Filter Bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-[320px]">
          <RiSearchLine className="size-4 text-[#A4A4A4] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search timeline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-[13px] bg-white border border-[#EBEBEB] rounded-[8px] outline-none focus:border-[#7D52F4] transition-colors text-[#171717] placeholder:text-[#A4A4A4]"
          />
        </div>
        <button
          type="button"
          className="size-9 rounded-[8px] bg-white border border-[#EBEBEB] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <RiFilter3Line className="size-4" />
        </button>
      </div>

      {/* ─── Timeline Feed (Figma Frame 256 / Group 7 Specs) ──────────────── */}
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
                    
                    {/* Left Key Icon Node (Exact Figma Spec 32px #F7F7F7) */}
                    <div className="absolute -left-[64px] top-3 size-8 rounded-full bg-[#F7F7F7] border border-[#D1D1D1] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center justify-center text-[#171717] shrink-0 z-10">
                      <IconComponent className="size-5" />
                    </div>

                    {/* Main Event Card (Exact Figma Spec Frame 256) */}
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
                            <div className="size-5 rounded-full bg-[#CAC0FF] text-[#351A75] font-medium text-[8px] flex items-center justify-center shrink-0">
                              {event.actorInitials || (event.actorName === "System" || event.actorName === "Viems" ? "AI" : event.actorName.slice(0, 2).toUpperCase())}
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

    </div>
  );
}
