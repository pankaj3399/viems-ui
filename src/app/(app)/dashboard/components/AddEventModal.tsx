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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  onAddEvent?: (event: { title: string; date: string; color?: string }) => void;
}

function formatLocalDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function AddEventModalForm({
  initialDate,
  onClose,
  onAddEvent,
}: {
  initialDate?: string;
  onClose: () => void;
  onAddEvent?: (event: { title: string; date: string; color?: string }) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState(() => initialDate || formatLocalDate());
  const [color, setColor] = React.useState("bg-[#7D52F4]");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (onAddEvent) {
      onAddEvent({
        title: title.trim(),
        date,
        color,
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg py-md font-sans">
      <div className="flex flex-col gap-xs">
        <Label htmlFor="add-event-title" className="text-[13px] font-semibold text-[#171717]">Event Title</Label>
        <Input
          id="add-event-title"
          type="text"
          required
          placeholder="e.g. Right to Work Check Audit"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full h-10 px-md rounded-[10px] border border-[#EBEBEB] text-[14px] text-[#171717] outline-none focus:border-[#7D52F4]"
        />
      </div>

      <div className="flex flex-col gap-xs">
        <Label htmlFor="add-event-date" className="text-[13px] font-semibold text-[#171717]">Date</Label>
        <Input
          id="add-event-date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full h-10 px-md rounded-[10px] border border-[#EBEBEB] text-[14px] text-[#171717] outline-none focus:border-[#7D52F4]"
        />
      </div>

      <div className="flex flex-col gap-xs">
        <Label id="add-event-color-label" className="text-[13px] font-semibold text-[#171717]">Tag Color</Label>
        <div role="group" aria-labelledby="add-event-color-label" className="flex items-center gap-md pt-xs">
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
              aria-label={c.name}
              aria-pressed={color === c.class}
              onClick={() => setColor(c.class)}
              className={`size-6 rounded-full ${c.class} transition-transform ${
                color === c.class ? "scale-125 ring-2 ring-offset-2 ring-neutral-800" : "hover:scale-110"
              }`}
            />
          ))}
        </div>
      </div>

      <DialogFooter showCloseButton={false} className="mt-md">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#7D52F4] hover:bg-brand-dark text-white">
          Save Event
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddEventModal({
  open,
  onOpenChange,
  initialDate,
  onAddEvent,
}: AddEventModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-aeonik-medium text-[20px]">Schedule Calendar Event</DialogTitle>
          <DialogDescription className="text-paragraph-sm text-[#5C5C5C]">
            Add a key compliance deadline, CoS milestone, or team reminder.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <AddEventModalForm
            key={initialDate || "default"}
            initialDate={initialDate}
            onClose={() => onOpenChange(false)}
            onAddEvent={onAddEvent}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
