"use client";

import * as React from "react";
import { RiCloseLine, RiGroupLine } from "@remixicon/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EditGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  onSave?: (newName: string) => void;
}

export function EditGroupModal({
  open,
  onOpenChange,
  groupName,
  onSave,
}: EditGroupModalProps) {
  const [name, setName] = React.useState(groupName);
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(groupName);
      setDescription("");
    }
  }, [open, groupName]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }
    setIsSubmitting(true);
    try {
      if (onSave) {
        onSave(name.trim());
      }
      toast.success("Group details updated successfully");
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update group:", err);
      toast.error("Failed to update group details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[440px] max-w-[440px] p-0 gap-0 overflow-hidden border-0 bg-transparent shadow-none"
      >
        <div
          className="relative bg-white flex flex-col w-[440px] rounded-[20px] border border-[#EBEBEB] shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="absolute top-5 right-5 z-10 size-6 bg-[#F5F5F5] hover:bg-neutral-200 rounded-[6px] flex items-center justify-center cursor-pointer transition-colors border-0 text-[#5C5C5C]"
          >
            <RiCloseLine className="size-4 text-[#5C5C5C]" />
          </button>

          {/* Content */}
          <div className="flex flex-col items-start gap-xl p-5">
            {/* Header */}
            <div className="flex items-center gap-xl w-full pr-8">
              <div className="size-14 rounded-[10px] bg-[#EBEBEB] text-[#171717] font-medium text-paragraph-md flex items-center justify-center shrink-0">
                {name ? name.charAt(0).toUpperCase() : <RiGroupLine className="size-6 text-[#5C5C5C]" />}
              </div>
              <div className="flex flex-col">
                <span className="font-aeonik-medium text-[16px] leading-[24px] tracking-[-0.011em] text-[#171717]">
                  Edit group
                </span>
                <span className="text-paragraph-xs text-[#5C5C5C]">
                  Update group name and settings
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-md w-full">
              <div className="flex flex-col gap-xs">
                <Label htmlFor="group-name" className="text-label-xs text-[#5C5C5C]">
                  Group Name
                </Label>
                <Input
                  id="group-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AX Studios"
                  className="h-9 shadow-x-small bg-white"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-xs">
                <Label htmlFor="group-notes" className="text-label-xs text-[#5C5C5C]">
                  Notes / Description (Optional)
                </Label>
                <Input
                  id="group-notes"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Production crew visa batch"
                  className="h-9 shadow-x-small bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-5 py-4 border-t border-[#EBEBEB] gap-3 bg-white">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 px-xl text-label-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!name.trim() || isSubmitting}
              onClick={handleSave}
              className="h-9 px-xl text-label-sm font-medium text-white cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
