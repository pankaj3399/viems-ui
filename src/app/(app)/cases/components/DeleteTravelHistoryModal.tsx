"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { toast } from "sonner";
import { RiDeleteBinLine } from "@remixicon/react";

interface DeleteTravelHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  migrantId: string | number;
  recordId: number | null;
  recordInfo?: {
    direction: string;
    date: string;
    port: string;
  } | null;
  onSuccess: () => void;
}

export function DeleteTravelHistoryModal({
  open,
  onOpenChange,
  migrantId,
  recordId,
  recordInfo,
  onSuccess,
}: DeleteTravelHistoryModalProps) {
  const [submitting, setSubmitting] = React.useState(false);

  const handleDelete = async () => {
    if (!migrantId || !recordId) return;

    try {
      setSubmitting(true);
      await apiClient.delete(
        ENDPOINTS.migrants.travelHistoryRecord(migrantId, recordId)
      );
      toast.success("Travel history record deleted");
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Failed to delete travel history:", err);
      const message =
        err instanceof Error ? err.message : "Failed to delete record";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[400px] max-w-[95vw] p-0 gap-0 flex flex-col overflow-hidden rounded-[20px] bg-white border border-[#F5F5F5] shadow-card-large font-sans"
      >
        {/* Header */}
        <div className="w-full px-6 py-4 flex items-center gap-3 border-b border-[#EBEBEB] bg-white">
          <div className="size-9 rounded-full bg-[#FFF5F5] flex items-center justify-center text-[#FB3748] shrink-0">
            <RiDeleteBinLine className="size-5" />
          </div>
          <DialogTitle className="text-[16px] font-medium leading-[24px] text-[#171717]">
            Delete Travel Record
          </DialogTitle>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-2">
          <p className="text-[14px] text-[#5C5C5C] leading-[20px]">
            Are you sure you want to delete this travel history entry? This action cannot be undone.
          </p>
          {recordInfo && (
            <div className="mt-2 p-3 bg-[#F5F5F5] rounded-[10px] flex flex-col gap-1 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[#5C5C5C]">Direction:</span>
                <span className="font-medium text-[#171717]">{recordInfo.direction}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5C5C5C]">Date:</span>
                <span className="font-medium text-[#171717]">{recordInfo.date}</span>
              </div>
              {recordInfo.port && recordInfo.port !== "—" && (
                <div className="flex items-center justify-between">
                  <span className="text-[#5C5C5C]">Port:</span>
                  <span className="font-medium text-[#171717]">{recordInfo.port}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-[#EBEBEB] bg-[#FAFAFA] flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="h-[36px] px-4 rounded-[8px] text-[14px] border-[#EBEBEB]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="h-[36px] px-5 rounded-[8px] text-[14px] bg-[#FB3748] hover:bg-[#E02434] text-white"
          >
            {submitting ? "Deleting..." : "Delete Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
