"use client";

import * as React from "react";
import { RiCloseLine, RiPushpinLine, RiPushpinFill, RiAtLine } from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { toast } from "sonner";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
  onNoteAdded?: (note: any) => void;
}

export function AddNoteModal({ isOpen, onClose, caseId, onNoteAdded }: AddNoteModalProps) {
  const [text, setText] = React.useState("");
  const [isPinned, setIsPinned] = React.useState(false);
  const [showMentionHint, setShowMentionHint] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setText("");
      setIsPinned(false);
      setShowMentionHint(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePostNote = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);

    try {
      // 1. Post to backend API if caseId is present
      if (caseId) {
        try {
          await apiClient.patch(ENDPOINTS.cases.byId(caseId), {
            body: { notes: text.trim() },
          });
        } catch (apiErr) {
          console.warn("Backend API note update warning", apiErr);
        }
      }

      // 2. Persist to localStorage for immediate UI synchronization
      const noteStorageKey = caseId ? `viems_case_notes_${caseId}` : "viems_case_notes";
      const saved = localStorage.getItem(noteStorageKey);
      const existing = saved ? JSON.parse(saved) : [];
      const newNote = {
        id: "n_" + Date.now(),
        authorName: "Alex Marin",
        avatarText: "AM",
        avatarBg: "bg-[#FFECC0] text-[#71330A]",
        date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
        content: text.trim(),
        pinned: isPinned,
      };
      const updatedNotes = [newNote, ...existing];
      localStorage.setItem(noteStorageKey, JSON.stringify(updatedNotes));

      if (onNoteAdded) {
        onNoteAdded(newNote);
      }

      toast.success("Note posted successfully");
      onClose();
    } catch (err) {
      console.error("Failed to post note:", err);
      toast.error("Failed to post note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMentionClick = () => {
    setText((prev) => prev + "@");
    setShowMentionHint(true);
    setTimeout(() => setShowMentionHint(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      {/* Modal Container: 440px wide, rounded-20px */}
      <div className="w-[440px] bg-white border border-[#EBEBEB] rounded-[20px] shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Content Area */}
        <div className="p-[20px] flex flex-col gap-[16px] relative bg-white">
          {/* Compact Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-[20px] right-[20px] size-6 bg-[#F7F7F7] hover:bg-neutral-200 rounded-[6px] flex items-center justify-center cursor-pointer transition-colors border-0 text-[#5C5C5C]"
          >
            <RiCloseLine className="size-4 text-[#5C5C5C]" />
          </button>

          {/* Title & Subtitle */}
          <div className="flex flex-col gap-[6px] pr-8">
            <h3 className="font-aeonik-medium text-[16px] leading-[24px] tracking-[-0.011em] text-[#171717]">
              Add note
            </h3>
            <p className="text-[14px] leading-[20px] tracking-[-0.006em] text-[#5C5C5C]">
              Add a note or update regarding this case. Notes are saved to the case timeline.
            </p>
          </div>

          {/* Textarea Box (142px height, 10px rounded, 1px #EBEBEB border) */}
          <div className="w-full h-[142px] bg-white border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[10px] p-[10px_16px] flex flex-col justify-between focus-within:border-[#7D52F4] transition-colors relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a note. Type @ to mention someone."
              className="w-full h-[70px] resize-none border-none outline-none text-[14px] leading-[20px] tracking-[-0.006em] text-[#171717] placeholder:text-[#7B7B7B] bg-transparent font-sans"
              autoFocus
            />

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-[8px]">
                {/* Pin toggle button */}
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`size-[28px] rounded-[8px] border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex items-center justify-center cursor-pointer transition-colors ${
                    isPinned ? "bg-[#7D52F4] text-white border-[#7D52F4]" : "bg-white text-[#5C5C5C] hover:bg-[#F5F5F5]"
                  }`}
                  title={isPinned ? "Unpin note" : "Pin note"}
                >
                  {isPinned ? <RiPushpinFill className="size-[16px]" /> : <RiPushpinLine className="size-[16px]" />}
                </button>

                {/* Mention button */}
                <button
                  type="button"
                  onClick={handleMentionClick}
                  className="size-[28px] bg-white border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-[#F5F5F5] text-[#5C5C5C] transition-colors"
                  title="Mention someone"
                >
                  <RiAtLine className="size-[16px]" />
                </button>

                {showMentionHint && (
                  <span className="text-[12px] text-[#7D52F4] font-medium animate-fade-in">
                    Type a teammate's name
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-[16px_20px] flex items-center justify-end gap-[12px] border-t border-[#EBEBEB] bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-[36px] px-[12px] bg-[#F5F5F5] hover:bg-neutral-200 text-[14px] font-medium text-[#5C5C5C] rounded-[8px] border-0 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePostNote}
            disabled={!text.trim() || isLoading}
            className="h-[36px] px-[16px] bg-[#262626] hover:bg-[#171717] text-[14px] font-medium text-white rounded-[8px] border-0 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            {isLoading ? "Posting..." : "Post note"}
          </button>
        </div>

      </div>
    </div>
  );
}
