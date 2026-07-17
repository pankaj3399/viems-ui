"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CASE_STATUSES, type CaseStatusOption } from "../case-status-data";

interface ChangeCaseStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: string;
  onApply: (newStatus: string) => void;
}

export function ChangeCaseStatusModal({
  open,
  onOpenChange,
  currentStatus,
  onApply,
}: ChangeCaseStatusModalProps) {
  const [selected, setSelected] = React.useState(currentStatus);

  React.useEffect(() => {
    if (open) {
      setSelected(currentStatus);
    }
  }, [open, currentStatus]);

  const handleApply = () => {
    onApply(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[340px] p-0 gap-0 overflow-hidden rounded-[20px]"
      >
        {/* Header */}
        <div className="px-[20px] py-xl border-b border-[#EBEBEB]">
          <h3 className="text-label-lg font-semibold text-[#171717]">
            Change case status
          </h3>
        </div>

        {/* Scrollable status list — shows ~7-10 items at a time */}
        <div className="max-h-[420px] overflow-y-auto px-[20px] py-lg">
          <RadioGroup
            value={selected}
            onValueChange={setSelected}
            className="flex flex-col"
          >
            {CASE_STATUSES.map((status, index) => (
              <React.Fragment key={status.value}>
                <Label
                  className={`flex items-center gap-lg px-xs py-[12px] cursor-pointer transition-colors select-none rounded-compact ${
                    selected === status.value
                      ? "bg-[#F5F3FF]"
                      : "hover:bg-neutral-50"
                  }`}
                >
                  <RadioGroupItem value={status.value} />
                  <div className="flex items-center gap-sm">
                    {status.dotColor && (
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: status.dotColor }}
                      />
                    )}
                    <span className="text-paragraph-sm text-[#171717] font-medium">
                      {status.label}
                    </span>
                  </div>
                </Label>
                {index < CASE_STATUSES.length - 1 && (
                  <Separator className="bg-[#EBEBEB]" />
                )}
              </React.Fragment>
            ))}
          </RadioGroup>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t border-[#EBEBEB] bg-transparent px-[20px] py-xl flex-row justify-end gap-sm">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 px-xl rounded-button font-semibold text-neutral-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={selected === currentStatus}
            className="h-9 px-xl rounded-button font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
