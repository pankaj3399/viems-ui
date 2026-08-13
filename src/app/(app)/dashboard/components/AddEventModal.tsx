"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  onAddEvent?: (event: { title: string; date: string; color?: string }) => void;
}

export function AddEventModal({
  open,
  onOpenChange,
  initialDate,
  onAddEvent,
}: AddEventModalProps) {
  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState(() => initialDate || new Date().toISOString().split("T")[0]);
  const [color, setColor] = React.useState("bg-[#7D52F4]");

  React.useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    } else {
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [initialDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Build event date at 12:00 PM local time to prevent midnight UTC cutoff/timezone issues
    const [y, m, d] = date.split("-").map(Number);
    const eventDate = new Date(y, m - 1, d, 12, 0, 0);

    if (onAddEvent) {
      onAddEvent({
        title: title.trim(),
        date: eventDate.toISOString(),
        color,
      });
    }
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-aeonik-medium text-[20px]">Schedule Calendar Event</DialogTitle>
          <DialogDescription className="text-paragraph-sm text-[#5C5C5C]">
            Add a key compliance deadline, CoS milestone, or team reminder.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-lg py-md font-sans">
          <div className="flex flex-col gap-xs">
            <label className="text-[13px] font-semibold text-[#171717]">Event Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Right to Work Check Audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-md rounded-[10px] border border-[#EBEBEB] text-[14px] text-[#171717] outline-none focus:border-[#7D52F4]"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-[13px] font-semibold text-[#171717]">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 px-md rounded-[10px] border border-[#EBEBEB] text-[14px] text-[#171717] outline-none focus:border-[#7D52F4]"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-[13px] font-semibold text-[#171717]">Tag Color</label>
            <div className="flex items-center gap-md pt-xs">
              {[
                { name: "Purple", class: "bg-[#7D52F4]" },
                { name: "Red", class: "bg-[#FB3748]" },
                { name: "Yellow", class: "bg-[#F6B51E]" },
                { name: "Blue", class: "bg-[#335CFF]" },
                { name: "Green", class: "bg-[#1FC16B]" },
              ].map((c) => (
                <button
                  key={c.class}
                  type="button"
                  onClick={() => setColor(c.class)}
                  className={`size-6 rounded-full ${c.class} transition-transform ${
                    color === c.class ? "scale-125 ring-2 ring-offset-2 ring-neutral-800" : "hover:scale-110"
                  }`}
                />
              ))}
            </div>
          </div>

          <DialogFooter showCloseButton={false} className="mt-md">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#7D52F4] hover:bg-brand-dark text-white">
              Save Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
