"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  RiDeleteBinLine,
  RiFileLine,
  RiAttachment2,
} from "@remixicon/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadPriorityMeta } from "./lead-utils";

export interface LeadFormValues {
  firstName: string;
  lastName: string;
  contactNumber: string;
  contactEmail: string;
  descriptionBox: string;
  priorityId: string;
}

interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: Partial<LeadFormValues> | null;
  leadId?: number | null;
  priorities: LeadPriorityMeta[];
  existingFiles?: { id: number; originalName: string; size: number }[];
  onSubmit: (
    values: LeadFormValues,
    newFiles: File[],
    deletedFileIds: number[]
  ) => Promise<void>;
}

const inputClassName =
  "border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717] placeholder-neutral-400 bg-white";

function formatFileSize(bytes: number): string {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LeadFormModal({
  open,
  onOpenChange,
  mode,
  initial,
  leadId,
  priorities,
  existingFiles = [],
  onSubmit,
}: LeadFormModalProps) {
  const buildDefaults = React.useCallback(
    (): LeadFormValues => ({
      firstName: "",
      lastName: "",
      contactNumber: "",
      contactEmail: "",
      descriptionBox: "",
      priorityId: priorities.length
        ? String(priorities[Math.max(0, priorities.length - 1)].id)
        : "3",
      ...(initial || {}),
    }),
    // Recompute defaults each time the dialog opens
    [priorities, initial]
  );

  const [values, setValues] = React.useState<LeadFormValues>(buildDefaults);
  const [newFiles, setNewFiles] = React.useState<File[]>([]);
  const [deletedFileIds, setDeletedFileIds] = React.useState<number[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  // Reset all local state each time the dialog opens (render-time state adjustment)
  const [prevOpenKey, setPrevOpenKey] = React.useState("");
  const openKey = open ? `${open}:${mode}:${leadId ?? "new"}` : "";
  if (openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    if (open) {
      setValues(buildDefaults());
      setNewFiles([]);
      setDeletedFileIds([]);
      setSubmitting(false);
    }
  }

  const setField = (field: keyof LeadFormValues, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const isValid =
    values.firstName.trim().length > 0 &&
    values.lastName.trim().length > 0 &&
    values.contactNumber.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(values, newFiles, deletedFileIds);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const remainingFiles = existingFiles.filter((f) => !deletedFileIds.includes(f.id));

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!submitting) onOpenChange(next); }}>
      <DialogContent
        showCloseButton={false}
        className="w-[560px] max-w-[calc(100vw-2rem)] h-auto max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden rounded-[20px] bg-white border border-[#F5F5F5] shadow-card-large font-sans grid-cols-none"
        style={{
          boxShadow:
            "0px 1px 1px 0.5px rgba(51, 51, 51, 0.04), 0px 3px 3px -1.5px rgba(51, 51, 51, 0.02), 0px 6px 6px -3px rgba(51, 51, 51, 0.04), 0px 12px 12px -6px rgba(51, 51, 51, 0.04), 0px 24px 24px -12px rgba(51, 51, 51, 0.04), 0px 48px 48px -24px rgba(51, 51, 51, 0.04), 0px 0px 0px 1px #F5F5F5, inset 0px -1px 1px -0.5px rgba(51, 51, 51, 0.06)",
        }}
      >
        {/* Header */}
        <div className="w-full h-[52px] min-h-[52px] px-[20px] py-[16px] flex items-center justify-between border-b border-[#EBEBEB] bg-white shrink-0">
          <h3 className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-[#171717]">
            {mode === "create" ? "New lead" : "Edit lead"}
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="size-6 rounded-[6px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0 flex items-center justify-center p-0 shrink-0"
          >
            <X size={16} strokeWidth={2} />
          </Button>
        </div>

        {/* Scrollable body */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto px-[20px] py-[20px] flex flex-col gap-[16px] bg-white">
          {/* Name row */}
          <div className="flex gap-xl w-full">
            <div className="flex-1 flex flex-col gap-xs">
              <Label htmlFor="leadFirstName" className="text-label-sm font-medium text-[#171717]">
                First Name <span className="text-[#FB3748]">*</span>
              </Label>
              <Input
                id="leadFirstName"
                value={values.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                placeholder="Enter first name"
                className={inputClassName}
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-xs">
              <Label htmlFor="leadLastName" className="text-label-sm font-medium text-[#171717]">
                Last Name <span className="text-[#FB3748]">*</span>
              </Label>
              <Input
                id="leadLastName"
                value={values.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                placeholder="Enter last name"
                className={inputClassName}
                required
              />
            </div>
          </div>

          {/* Contact row */}
          <div className="flex gap-xl w-full">
            <div className="flex-1 flex flex-col gap-xs">
              <Label htmlFor="leadContactNumber" className="text-label-sm font-medium text-[#171717]">
                Contact Number <span className="text-[#FB3748]">*</span>
              </Label>
              <Input
                id="leadContactNumber"
                type="tel"
                value={values.contactNumber}
                onChange={(e) => setField("contactNumber", e.target.value)}
                placeholder="+44 0000 000000"
                className={inputClassName}
                required
              />
            </div>
            <div className="flex-1 flex flex-col gap-xs">
              <Label htmlFor="leadContactEmail" className="text-label-sm font-medium text-[#171717]">
                Contact Email
              </Label>
              <Input
                id="leadContactEmail"
                type="email"
                value={values.contactEmail}
                onChange={(e) => setField("contactEmail", e.target.value)}
                placeholder="name@email.com"
                className={inputClassName}
              />
            </div>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-xs w-full">
            <Label htmlFor="leadPriority" className="text-label-sm font-medium text-[#171717]">
              Priority
            </Label>
            <Select
              value={values.priorityId}
              onValueChange={(val) => setField("priorityId", val || "")}
              items={priorities.map((p) => ({ value: String(p.id), label: p.name }))}
            >
              <SelectTrigger id="leadPriority" className="h-10 border border-[#EBEBEB] focus-visible:border-neutral-900 text-[#171717] focus-visible:shadow-important-focus bg-white w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-xs w-full">
            <Label htmlFor="leadDescription" className="text-label-sm font-medium text-[#171717]">
              Description
            </Label>
            <Textarea
              id="leadDescription"
              value={values.descriptionBox}
              onChange={(e) => setField("descriptionBox", e.target.value)}
              placeholder="Add details about this lead — source of enquiry, services they need, notes…"
              rows={4}
              className={`${inputClassName} resize-none`}
            />
          </div>

          {/* Files — edit mode: existing files with remove; both modes: attach new */}
          <div className="flex flex-col gap-xs w-full">
            <Label className="text-label-sm font-medium text-[#171717]">Documents</Label>

            {(remainingFiles.length > 0 || newFiles.length > 0) && (
              <div className="flex flex-col gap-[6px]">
                {remainingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="h-[44px] px-[12px] bg-[#FAFAFA] border border-[#EBEBEB] rounded-[10px] flex items-center gap-[10px]"
                  >
                    <RiFileLine className="size-5 text-[#5C5C5C] shrink-0" />
                    <span className="flex-1 text-[13px] text-[#171717] truncate">{file.originalName}</span>
                    <span className="text-[12px] text-[#A4A4A4] shrink-0">{formatFileSize(file.size)}</span>
                    <button
                      type="button"
                      onClick={() => setDeletedFileIds((prev) => [...prev, file.id])}
                      aria-label={`Remove ${file.originalName}`}
                      className="size-6 rounded-[6px] hover:bg-[#FFEBEC] text-[#FB3748] flex items-center justify-center cursor-pointer border-0 bg-transparent shrink-0"
                    >
                      <RiDeleteBinLine className="size-4" />
                    </button>
                  </div>
                ))}
                {newFiles.map((file, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="h-[44px] px-[12px] bg-[#FAFAFA] border border-[#EBEBEB] rounded-[10px] flex items-center gap-[10px]"
                  >
                    <RiFileLine className="size-5 text-[#5C5C5C] shrink-0" />
                    <span className="flex-1 text-[13px] text-[#171717] truncate">{file.name}</span>
                    <span className="text-[12px] text-[#A4A4A4] shrink-0">{formatFileSize(file.size)}</span>
                    <button
                      type="button"
                      onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label={`Remove ${file.name}`}
                      className="size-6 rounded-[6px] hover:bg-[#FFEBEC] text-[#FB3748] flex items-center justify-center cursor-pointer border-0 bg-transparent shrink-0"
                    >
                      <RiDeleteBinLine className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="mt-[2px] h-[40px] px-[12px] border border-dashed border-[#D4D4D4] hover:border-brand-medium rounded-[10px] flex items-center justify-center gap-[8px] text-[13px] font-medium text-[#5C5C5C] hover:text-[#171717] cursor-pointer transition-colors select-none">
              <RiAttachment2 className="size-4" />
              Attach files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setNewFiles((prev) => [...prev, ...files]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full h-[68px] min-h-[68px] px-[20px] py-[16px] flex items-center justify-end gap-[12px] border-t border-[#EBEBEB] bg-white shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="w-[86px] h-[36px] bg-[#F5F5F5] hover:bg-neutral-200 border-0 text-[14px] font-medium text-[#5C5C5C] rounded-[8px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="min-w-[100px] h-[36px] bg-[#7D52F4] hover:bg-[#683fd1] text-white text-[14px] font-medium rounded-[8px]"
          >
            {submitting ? "Saving…" : mode === "create" ? "Create lead" : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
