"use client";

import * as React from "react";
import {
  RiSearchLine,
  RiFilter3Line,
  RiPushpinLine,
  RiPushpinFill,
  RiAtLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NoteItem {
  id: string;
  authorName: string;
  avatarText: string;
  avatarBg: string;
  date: string;
  content: string;
  pinned: boolean;
}

const defaultNotes: NoteItem[] = [
  {
    id: "n1",
    authorName: "Nathan Wood",
    avatarText: "NW",
    avatarBg: "bg-[#CAC0FF] text-[#351A75]",
    date: "11 Mar 2026",
    content: "Spoke with Taylor over the phone, he'll send the passport scan by end of week. Reminded him about the share code as well.",
    pinned: true,
  },
  {
    id: "n2",
    authorName: "Alex Marin",
    avatarText: "AM",
    avatarBg: "bg-[#FFECC0] text-[#71330A]",
    date: "8 Mar 2026",
    content: "Appendix D review flagged 2 missing qualification documents. @Sarah Kim can you chase Berklee College for a replacement certificate?",
    pinned: false,
  },
  {
    id: "n3",
    authorName: "Sarah Kim",
    avatarText: "SK",
    avatarBg: "bg-[#FFD9C0] text-[#71330A]",
    date: "8 Mar 2026",
    content: "Contract uploaded to vault. AI auto-extracted 7 fields — all matched correctly, no manual corrections needed.",
    pinned: false,
  },
];

export function NotesTab({ id }: { id?: string }) {
  const storageKey = id ? `viems_case_notes_${id}` : "viems_case_notes";
  const [notes, setNotes] = React.useState<NoteItem[]>(defaultNotes);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [newNoteText, setNewNoteText] = React.useState("");
  const [shouldPinNewNote, setShouldPinNewNote] = React.useState(false);
  const [showMentions, setShowMentions] = React.useState(false);

  // Load notes from localStorage when storageKey changes
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          return;
        }
      }
      setNotes(defaultNotes);
    } catch (e) {
      console.error("Failed to load notes from storage", e);
      setNotes(defaultNotes);
    }
  }, [storageKey]);

  // Save notes to localStorage on state change
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch (e) {
      console.error("Failed to save notes to storage", e);
    }
  }, [notes, storageKey]);

  const handlePostNote = () => {
    if (!newNoteText.trim()) return;

    const newNote: NoteItem = {
      id: "n_" + Date.now(),
      authorName: "Alex Marin",
      avatarText: "AM",
      avatarBg: "bg-[#FFECC0] text-[#71330A]",
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      content: newNoteText,
      pinned: shouldPinNewNote,
    };

    setNotes((prev) => [newNote, ...prev]);
    toast.success("Note posted successfully");
    setNewNoteText("");
    setShouldPinNewNote(false);
  };

  const togglePin = (pinId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === pinId ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewNoteText(val);
    if (val.endsWith("@")) {
      setShowMentions(true);
    } else if (!val.includes("@") || val.endsWith(" ")) {
      setShowMentions(false);
    }
  };

  const insertMention = (name: string) => {
    setNewNoteText((prev) => {
      const index = prev.lastIndexOf("@");
      if (index === -1) return prev + name;
      return prev.slice(0, index + 1) + name + " ";
    });
    setShowMentions(false);
  };

  const filteredNotes = React.useMemo(() => {
    if (!searchQuery) return notes;
    return notes.filter((n) =>
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const recentNotes = filteredNotes.filter((n) => !n.pinned);

  return (
    <div className="w-full flex flex-col gap-2xl font-sans select-none animate-fade-in text-left">
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-md w-full">
        <div className="relative w-full max-w-[348px]">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#A4A4A4] z-10" />
          <input
            type="text"
            placeholder="Search notes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-9 pr-4 bg-white text-paragraph-sm placeholder-[#A4A4A4] border border-neutral-200 rounded-input focus-visible:outline-none focus-visible:border-[#7D52F4] focus-visible:ring-1 focus-visible:ring-[#7D52F4]/20 transition-all font-sans"
          />
        </div>
        <button
          type="button"
          className="size-8 rounded-[8px] bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 cursor-pointer transition-colors"
        >
          <RiFilter3Line className="size-4" />
        </button>
      </div>

      <div>
        <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px] mb-md">Notes</h2>

        {/* Input box */}
        <div className="bg-white border border-neutral-200 rounded-card p-xl shadow-x-small flex flex-col relative w-full gap-lg mb-2xl">
          <textarea
            placeholder="Add a note. Type @ to mention someone."
            value={newNoteText}
            onChange={handleInputChange}
            className="w-full min-h-[80px] border-0 outline-none resize-none text-paragraph-sm text-[#171717] placeholder-neutral-400 font-sans"
          />

          {showMentions && (
            <div className="absolute left-xl bottom-14 bg-white border border-neutral-200 rounded-compact shadow-card-large p-xs z-50 flex flex-col gap-xs w-[180px]">
              {["Sarah Kim", "Nathan Wood", "Alex Marin"].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => insertMention(name)}
                  className="w-full px-lg py-md text-left text-paragraph-xs hover:bg-neutral-50 rounded-compact border-0 bg-transparent text-[#171717] font-medium cursor-pointer"
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Bottom Bar inside input */}
          <div className="flex items-center justify-between border-t border-[#F5F5F5] pt-lg">
            <div className="flex items-center gap-xs">
              <button
                type="button"
                onClick={() => setShouldPinNewNote((p) => !p)}
                className={`size-8 rounded-[8px] flex items-center justify-center transition-colors cursor-pointer border-0 bg-transparent ${
                  shouldPinNewNote
                    ? "text-[#7D52F4] hover:bg-[#F5F3FF]"
                    : "text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
                }`}
              >
                <RiPushpinLine className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowMentions((m) => !m)}
                className="size-8 rounded-[8px] flex items-center justify-center text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors cursor-pointer border-0 bg-transparent"
              >
                <RiAtLine className="size-5" />
              </button>
            </div>

            <Button
              type="button"
              onClick={handlePostNote}
              className="h-9 px-xl text-label-sm font-semibold bg-[#262626] hover:bg-[#333333] text-white rounded-[8px]"
            >
              Post note
            </Button>
          </div>
        </div>

        {/* Pinned Notes section */}
        {pinnedNotes.length > 0 && (
          <div className="flex flex-col gap-lg mb-2xl">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#A4A4A4] font-sans">
              Pinned ({pinnedNotes.length})
            </h4>
            <div className="flex flex-col gap-md">
              {pinnedNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white border border-[#EBEBEB] rounded-card p-xl shadow-x-small flex flex-col gap-md relative"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-md">
                      <div className={`size-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 select-none ${note.avatarBg}`}>
                        {note.avatarText}
                      </div>
                      <div className="flex items-center gap-xs text-[#171717] text-label-sm font-medium">
                        <span>{note.authorName}</span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-paragraph-xs text-neutral-400 font-normal">{note.date}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePin(note.id)}
                      className="size-6 flex items-center justify-center text-[#7D52F4] hover:text-[#683fd1] cursor-pointer border-0 bg-transparent"
                    >
                      <RiPushpinFill className="size-4" />
                    </button>
                  </div>
                  {/* Content */}
                  <p className="text-paragraph-sm text-[#171717] font-normal leading-6 pr-lg">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Notes section */}
        <div className="flex flex-col gap-lg">
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#A4A4A4] font-sans">
            Recent ({recentNotes.length})
          </h4>
          {recentNotes.length === 0 ? (
            <div className="text-center py-xl text-paragraph-sm text-neutral-400 bg-white border border-neutral-100 rounded-card shadow-x-small">
              No recent notes found
            </div>
          ) : (
            <div className="flex flex-col gap-md">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white border border-[#EBEBEB] rounded-card p-xl shadow-x-small flex flex-col gap-md relative animate-fade-in"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-md">
                      <div className={`size-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 select-none ${note.avatarBg}`}>
                        {note.avatarText}
                      </div>
                      <div className="flex items-center gap-xs text-[#171717] text-label-sm font-medium">
                        <span>{note.authorName}</span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-paragraph-xs text-neutral-400 font-normal">{note.date}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePin(note.id)}
                      className="size-6 flex items-center justify-center text-neutral-400 hover:text-[#7D52F4] cursor-pointer border-0 bg-transparent transition-colors"
                    >
                      <RiPushpinLine className="size-4" />
                    </button>
                  </div>
                  {/* Content */}
                  <p className="text-paragraph-sm text-[#171717] font-normal leading-6 pr-lg">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
