"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LeadPriorityMeta } from "./lead-utils";

interface ChangeLeadPriorityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPriorityId: number | null;
  priorities: LeadPriorityMeta[];
  leadName: string;
  onApply: (newPriorityId: number) => void;
}

export function ChangeLeadPriorityModal({
  open,
  onOpenChange,
  currentPriorityId,
  priorities,
  leadName,
  onApply,
}: ChangeLeadPriorityModalProps) {
  const [selected, setSelected] = React.useState<number | null>(currentPriorityId);
  const [prevOpen, setPrevOpen] = React.useState(open);

  // Re-sync the selection each time the dialog opens (render-time state adjustment)
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelected(currentPriorityId);
    }
  }

  const handleApply = () => {
    if (selected != null && Number(selected) !== Number(currentPriorityId)) {
      onApply(Number(selected));
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[340px] max-w-[340px] p-0 gap-0 flex flex-col overflow-hidden rounded-[20px] bg-white border border-[#F5F5F5] shadow-card-large font-sans grid-cols-none"
        style={{
          boxShadow:
            "0px 1px 1px 0.5px rgba(51, 51, 51, 0.04), 0px 3px 3px -1.5px rgba(51, 51, 51, 0.02), 0px 6px 6px -3px rgba(51, 51, 51, 0.04), 0px 12px 12px -6px rgba(51, 51, 51, 0.04), 0px 24px 24px -12px rgba(51, 51, 51, 0.04), 0px 48px 48px -24px rgba(51, 51, 51, 0.04), 0px 0px 0px 1px #F5F5F5, inset 0px -1px 1px -0.5px rgba(51, 51, 51, 0.06)",
        }}
      >
        {/* Header */}
        <div className="w-full h-[52px] min-h-[52px] px-[20px] py-[16px] flex items-center justify-between border-b border-[#EBEBEB] bg-white shrink-0">
          <h3 className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-[#171717] truncate pr-2">
            Set priority{leadName ? ` — ${leadName}` : ""}
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="size-6 rounded-[6px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0 flex items-center justify-center p-0 shrink-0"
          >
            <X size={16} strokeWidth={2} />
          </Button>
        </div>

        {/* Priority options */}
        <div className="w-full px-[12px] py-[12px] flex flex-col bg-white">
          {priorities.map((priority, index) => {
            const isSelected = Number(selected) === Number(priority.id);
            const isCurrent = Number(currentPriorityId) === Number(priority.id);
            return (
              <React.Fragment key={priority.id}>
                <button
                  type="button"
                  onClick={() => setSelected(Number(priority.id))}
                  className={`group w-full h-[36px] min-h-[36px] flex items-center justify-between px-[8px] transition-colors rounded-[8px] cursor-pointer text-left border-0 bg-transparent shrink-0 focus-visible:outline-none focus-visible:bg-neutral-50 ${
                    isSelected ? "bg-[#F5F3FF]" : "hover:bg-neutral-50"
                  }`}
                >
                  {/* Left: Dot + Label */}
                  <div className="flex items-center gap-[8px] min-w-0">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: priority.color || "#7B7B7B" }}
                    />
                    <span
                      className={`text-[14px] leading-[20px] tracking-[-0.006em] text-[#171717] truncate group-hover:font-medium group-focus-visible:font-medium ${
                        isSelected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {priority.name}
                      {isCurrent ? " (current)" : ""}
                    </span>
                  </div>

                  {/* Right: Radio Circle */}
                  <div className="size-5 shrink-0 relative flex items-center justify-center">
                    <div
                      className={`size-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#7D52F4] border-2 border-[#7D52F4]"
                          : "bg-white border-2 border-[#EBEBEB] hover:border-neutral-300"
                      }`}
                    >
                      {isSelected && <div className="size-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>

                {index < priorities.length - 1 && (
                  <div className="mx-[8px] h-px bg-[#EBEBEB] shrink-0 my-xs" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer */}
        <div className="w-full h-[68px] min-h-[68px] px-[20px] py-[16px] flex items-center justify-end gap-[12px] border-t border-[#EBEBEB] bg-white shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-[86px] h-[36px] bg-[#F5F5F5] hover:bg-neutral-200 border-0 text-[14px] font-medium text-[#5C5C5C] rounded-[8px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            disabled={selected == null || Number(selected) === Number(currentPriorityId)}
            className="w-[86px] h-[36px] bg-[#7D52F4] hover:bg-[#683fd1] text-white text-[14px] font-medium rounded-[8px]"
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
