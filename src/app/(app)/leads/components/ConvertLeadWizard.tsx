"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  RiCheckLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFileLine,
  RiExchangeLine,
  RiUserLine,
  RiFolderOpenLine,
} from "@remixicon/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMAIL_REGEX } from "@/lib/constants";

export interface ConvertWizardCaseCategory {
  id: string | number;
  name: string;
}

interface LeadForConversion {
  id?: number;
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  contactEmail?: string | null;
  descriptionBox?: string;
  files?: { id: number; originalName: string; size: number; isDeleted?: boolean }[];
}

interface ConvertLeadWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadForConversion | null;
  caseCategories: ConvertWizardCaseCategory[];
  onSubmit: (payload: {
    email: string;
    contacts: { contact_email?: string; phone_1?: string };
    categoryId?: number;
    relatedYear?: number;
    leadFiles: number[];
  }) => Promise<void>;
}

const STEPS = ["Migrant details", "Case setup", "Documents"] as const;

const inputClassName =
  "border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717] placeholder-neutral-400 bg-white";

const EMAIL_PLACEHOLDER = "name@email.com";

export function ConvertLeadWizard({
  open,
  onOpenChange,
  lead,
  caseCategories,
  onSubmit,
}: ConvertLeadWizardProps) {
  const [activeStep, setActiveStep] = React.useState(1);

  // Step 1 — migrant details
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [contactNumber, setContactNumber] = React.useState("");

  // Step 2 — case setup
  const [openCase, setOpenCase] = React.useState(true);
  const [categoryId, setCategoryId] = React.useState<string>("");
  const [relatedYear, setRelatedYear] = React.useState<string>(String(new Date().getFullYear()));

  // Step 3 — documents
  const [selectedFileIds, setSelectedFileIds] = React.useState<number[]>([]);

  const [submitting, setSubmitting] = React.useState(false);

  const leadFiles = (lead?.files || []).filter((f) => !f.isDeleted);

  // Reset all state whenever the wizard opens for a (new) lead — render-time state adjustment
  const [prevOpenKey, setPrevOpenKey] = React.useState<string>("");
  const openKey = open ? `${open}-${lead?.id ?? "none"}` : "";
  if (openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    if (open && lead) {
      setActiveStep(1);
      setFirstName(lead.firstName || "");
      setLastName(lead.lastName || "");
      setEmail(lead.contactEmail || "");
      setContactNumber(lead.contactNumber || "");
      setOpenCase(true);
      setCategoryId(caseCategories.length ? String(caseCategories[0].id) : "");
      setRelatedYear(String(new Date().getFullYear()));
      setSelectedFileIds([]);
      setSubmitting(false);
    }
  }

  const emailValid = EMAIL_REGEX.test(email.trim());
  const namesValid = firstName.trim().length > 0 && lastName.trim().length > 0;
  const step1Valid = namesValid && emailValid;
  const step2Valid = !openCase || categoryId.length > 0;

  const canContinue =
    (activeStep === 1 && step1Valid) ||
    (activeStep === 2 && step2Valid) ||
    activeStep === 3;

  const handleToggleFile = (fileId: number) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleSubmit = async () => {
    if (!lead?.id || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        email: email.trim(),
        contacts: {
          contact_email: email.trim(),
          phone_1: contactNumber.trim() || undefined,
        },
        categoryId: openCase && categoryId ? Number(categoryId) : undefined,
        relatedYear: openCase ? Number(relatedYear) || new Date().getFullYear() : undefined,
        leadFiles: selectedFileIds,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!submitting) onOpenChange(next); }}>
      <DialogContent
        showCloseButton={false}
        className="w-[640px] max-w-[calc(100vw-2rem)] p-0 gap-0 flex flex-col overflow-hidden rounded-[20px] bg-white border border-[#F5F5F5] shadow-card-large font-sans grid-cols-none"
        style={{
          boxShadow:
            "0px 1px 1px 0.5px rgba(51, 51, 51, 0.04), 0px 3px 3px -1.5px rgba(51, 51, 51, 0.02), 0px 6px 6px -3px rgba(51, 51, 51, 0.04), 0px 12px 12px -6px rgba(51, 51, 51, 0.04), 0px 24px 24px -12px rgba(51, 51, 51, 0.04), 0px 48px 48px -24px rgba(51, 51, 51, 0.04), 0px 0px 0px 1px #F5F5F5, inset 0px -1px 1px -0.5px rgba(51, 51, 51, 0.06)",
        }}
      >
        {/* Header */}
        <div className="w-full h-[52px] min-h-[52px] px-[20px] py-[16px] flex items-center justify-between border-b border-[#EBEBEB] bg-white shrink-0">
          <div className="flex items-center gap-[8px] min-w-0">
            <RiExchangeLine className="size-4 text-[#7D52F4] shrink-0" />
            <h3 className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-[#171717] truncate">
              Convert to migrant
              <span className="text-[#7B7B7B] font-normal"> — {`${firstName} ${lastName}`.trim()}</span>
            </h3>
          </div>
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

        {/* Stepper */}
        <div className="w-full h-[44px] min-h-[44px] px-[20px] flex items-center gap-[8px] border-b border-[#EBEBEB] bg-white shrink-0 overflow-x-auto">
          {STEPS.map((label, idx) => {
            const stepNumber = idx + 1;
            const isLast = idx === STEPS.length - 1;
            return (
              <React.Fragment key={label}>
                <button
                  type="button"
                  onClick={() => { if (stepNumber < activeStep) setActiveStep(stepNumber); }}
                  aria-current={activeStep === stepNumber ? "step" : undefined}
                  className={`group flex items-center gap-[8px] ${stepNumber < activeStep ? "cursor-pointer" : "cursor-default"} border-0 bg-transparent p-0`}
                >
                  <div className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 transition-all ${
                    activeStep === stepNumber
                      ? "bg-[#171717] text-white"
                      : activeStep > stepNumber
                        ? "bg-[#7D52F4] text-white group-hover:bg-[#683fd1]"
                        : "bg-[#EBEBEB] text-[#5C5C5C]"
                  }`}>
                    {activeStep > stepNumber ? <RiCheckLine className="size-3.5 text-white" /> : stepNumber}
                  </div>
                  <span className={`text-[13px] leading-[16px] whitespace-nowrap transition-colors ${
                    activeStep === stepNumber ? "text-[#171717] font-medium" : "text-[#5C5C5C]"
                  }`}>
                    {label}
                  </span>
                </button>
                {!isLast && <div className="h-[1px] w-8 bg-[#EBEBEB] shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Scrollable body */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto px-[20px] py-[20px] flex flex-col gap-[16px] bg-white">
          {/* ─── Step 1: Migrant details ─── */}
          {activeStep === 1 && (
            <>
              <p className="text-[13px] text-[#5C5C5C] leading-[18px] m-0">
                A migrant profile will be created with a login account. The lead will be marked as{" "}
                <span className="font-medium text-[#171717]">Completed</span>.
              </p>

              <div className="flex gap-xl w-full">
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="convFirstName" className="text-label-sm font-medium text-[#171717]">
                    First Name <span className="text-[#FB3748]">*</span>
                  </Label>
                  <Input
                    id="convFirstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className={inputClassName}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="convLastName" className="text-label-sm font-medium text-[#171717]">
                    Last Name <span className="text-[#FB3748]">*</span>
                  </Label>
                  <Input
                    id="convLastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-xs w-full">
                <Label htmlFor="convEmail" className="text-label-sm font-medium text-[#171717]">
                  Migrant Email <span className="text-[#FB3748]">*</span>
                </Label>
                <Input
                  id="convEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={EMAIL_PLACEHOLDER}
                  aria-invalid={email.length > 0 && !emailValid}
                  className={`${inputClassName} ${email.length > 0 && !emailValid ? "!border-[#FB3748]" : ""}`}
                />
                {email.length > 0 && !emailValid && (
                  <span className="text-[11px] text-[#FB3748] leading-[14px]">
                    Enter a valid email address — it becomes the migrant&apos;s login.
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-xs w-full">
                <Label htmlFor="convPhone" className="text-label-sm font-medium text-[#171717]">
                  Phone Number
                </Label>
                <Input
                  id="convPhone"
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+44 0000 000000"
                  className={inputClassName}
                />
              </div>
            </>
          )}

          {/* ─── Step 2: Case setup ─── */}
          {activeStep === 2 && (
            <>
              <button
                type="button"
                onClick={() => setOpenCase((prev) => !prev)}
                className={`w-full h-[56px] px-[14px] rounded-[12px] border flex items-center gap-[12px] cursor-pointer text-left transition-colors ${
                  openCase ? "border-[#7D52F4]/40 bg-[#FAF8FF]" : "border-[#EBEBEB] bg-white hover:bg-neutral-50"
                }`}
              >
                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${openCase ? "bg-[#EFEBFF] text-[#7D52F4]" : "bg-[#F5F5F5] text-[#7B7B7B]"}`}>
                  <RiFolderOpenLine className="size-5" />
                </div>
                <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                  <span className="text-[14px] font-medium text-[#171717] leading-[20px]">
                    Open a case for this migrant
                  </span>
                  <span className="text-[12px] text-[#7B7B7B] leading-[16px] truncate">
                    The case will be pre-filled with the case type you select below.
                  </span>
                </div>
                <Checkbox checked={openCase} onCheckedChange={(checked) => setOpenCase(Boolean(checked))} />
              </button>

              {openCase && (
                <>
                  <div className="flex flex-col gap-xs w-full">
                    <Label htmlFor="convCategory" className="text-label-sm font-medium text-[#171717]">
                      Case Type <span className="text-[#FB3748]">*</span>
                    </Label>
                    <Select
                      value={categoryId}
                      onValueChange={(val) => setCategoryId(val || "")}
                      items={caseCategories.map((category) => ({ value: String(category.id), label: category.name }))}
                    >
                      <SelectTrigger id="convCategory" className="h-10 border border-[#EBEBEB] focus-visible:border-neutral-900 text-[#171717] focus-visible:shadow-important-focus bg-white w-full">
                        <SelectValue placeholder="Select case type" />
                      </SelectTrigger>
                      <SelectContent>
                        {caseCategories.map((category) => (
                          <SelectItem key={String(category.id)} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-xs w-full">
                    <Label htmlFor="convYear" className="text-label-sm font-medium text-[#171717]">
                      Related Year
                    </Label>
                    <Select value={relatedYear} onValueChange={(val) => setRelatedYear(val || "")}>
                      <SelectTrigger id="convYear" className="h-10 border border-[#EBEBEB] focus-visible:border-neutral-900 text-[#171717] focus-visible:shadow-important-focus bg-white w-full">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2].map((offset) => {
                          const year = new Date().getFullYear() + offset;
                          return (
                            <SelectItem key={year} value={String(year)}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {!openCase && (
                <div className="rounded-[12px] bg-[#FFFAEB] border border-[#FEF0C7] px-[14px] py-[12px] flex items-start gap-[10px]">
                  <RiUserLine className="size-4 text-[#DC6803] shrink-0 mt-[2px]" />
                  <p className="m-0 text-[13px] text-[#624C18] leading-[18px]">
                    Only the migrant profile will be created — the lead will still be marked as Completed.
                    You can open a case later from the Cases page.
                  </p>
                </div>
              )}
            </>
          )}

          {/* ─── Step 3: Documents ─── */}
          {activeStep === 3 && (
            <>
              <p className="text-[13px] text-[#5C5C5C] leading-[18px] m-0">
                This lead has attached documents. Choose which ones to copy to the migrant profile.
              </p>

              {leadFiles.length === 0 ? (
                <div className="h-[72px] rounded-[12px] border border-dashed border-[#D4D4D4] flex items-center justify-center">
                  <span className="text-[13px] text-[#A4A4A4]">This lead has no attached documents.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-[6px]">
                  {leadFiles.map((file) => {
                    const checked = selectedFileIds.includes(file.id);
                    return (
                      <label
                        key={file.id}
                        className={`h-[44px] px-[12px] rounded-[10px] border flex items-center gap-[10px] cursor-pointer transition-colors ${
                          checked ? "border-[#7D52F4]/40 bg-[#FAF8FF]" : "border-[#EBEBEB] bg-[#FAFAFA] hover:bg-[#F5F5F5]"
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => handleToggleFile(file.id)}
                        />
                        <RiFileLine className="size-5 text-[#5C5C5C] shrink-0" />
                        <span className="flex-1 text-[13px] text-[#171717] truncate">{file.originalName}</span>
                        <span className="text-[12px] text-[#A4A4A4] shrink-0">
                          {file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Review summary */}
              <div className="mt-[4px] rounded-[12px] border border-[#EBEBEB] bg-[#FAFAFA] px-[14px] py-[12px] flex flex-col gap-[6px]">
                <span className="text-[12px] font-medium text-[#A4A4A4] uppercase tracking-[0.04em] leading-[16px]">
                  Summary
                </span>
                <div className="flex items-center justify-between gap-[12px]">
                  <span className="text-[13px] text-[#5C5C5C]">Migrant profile</span>
                  <span className="text-[13px] font-medium text-[#171717] truncate">
                    {`${firstName} ${lastName}`.trim()} · {email || "—"}
                  </span>
                </div>
                <div className="h-px bg-[#EBEBEB]" />
                <div className="flex items-center justify-between gap-[12px]">
                  <span className="text-[13px] text-[#5C5C5C]">Case</span>
                  <span className="text-[13px] font-medium text-[#171717]">
                    {!openCase
                      ? "None"
                      : `${
                          caseCategories.find((c) => String(c.id) === categoryId)?.name || "—"
                        } · ${relatedYear}`}
                  </span>
                </div>
                <div className="h-px bg-[#EBEBEB]" />
                <div className="flex items-center justify-between gap-[12px]">
                  <span className="text-[13px] text-[#5C5C5C]">Documents to carry over</span>
                  <span className="text-[13px] font-medium text-[#171717]">
                    {selectedFileIds.length} of {leadFiles.length}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="w-full h-[68px] min-h-[68px] px-[20px] py-[16px] flex items-center justify-between gap-[12px] border-t border-[#EBEBEB] bg-white shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            disabled={activeStep === 1 || submitting}
            className="h-[36px] px-[12px] bg-white border border-[#EBEBEB] text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] rounded-[8px] gap-[4px]"
          >
            <RiArrowLeftSLine className="size-4" />
            Back
          </Button>

          <div className="flex items-center gap-[12px]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="w-[86px] h-[36px] bg-[#F5F5F5] hover:bg-neutral-200 border-0 text-[14px] font-medium text-[#5C5C5C] rounded-[8px]"
            >
              Cancel
            </Button>
            {activeStep < STEPS.length ? (
              <Button
                type="button"
                onClick={() => setActiveStep((prev) => Math.min(STEPS.length, prev + 1))}
                disabled={!canContinue}
                className="h-[36px] px-[16px] bg-[#7D52F4] hover:bg-[#683fd1] text-white text-[14px] font-medium rounded-[8px] gap-[4px]"
              >
                Continue
                <RiArrowRightSLine className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canContinue || submitting}
                className="min-w-[120px] h-[36px] bg-[#7D52F4] hover:bg-[#683fd1] text-white text-[14px] font-medium rounded-[8px] gap-[6px]"
              >
                {submitting ? "Converting…" : "Convert to migrant"}
                <RiExchangeLine className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
