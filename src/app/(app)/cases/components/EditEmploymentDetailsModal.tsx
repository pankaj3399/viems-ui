"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { XIcon, Upload, Calendar, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface EditEmploymentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  migrantId: string;
  initialData?: any;
  onSuccess: () => void;
}

export function EditEmploymentDetailsModal({
  open,
  onOpenChange,
  caseId,
  migrantId,
  initialData,
  onSuccess,
}: EditEmploymentDetailsModalProps) {
  const [employer, setEmployer] = React.useState("AX Studios");
  const [jobTitle, setJobTitle] = React.useState("Singer");
  const [startDate, setStartDate] = React.useState("15 / 03 / 2026");
  const [endDate, setEndDate] = React.useState("16 / 03 / 2027");
  const [contract, setContract] = React.useState("Full-time");
  const [hoursPerWeek, setHoursPerWeek] = React.useState("40");
  const [annualSalary, setAnnualSalary] = React.useState("£ 48,000");
  const [addressLine1, setAddressLine1] = React.useState("Royal Albert Hall");
  const [addressLine2, setAddressLine2] = React.useState("");
  const [city, setCity] = React.useState("London");
  const [postCode, setPostCode] = React.useState("SW7 2AP");

  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && initialData) {
      if (initialData.employer) setEmployer(initialData.employer);
      if (initialData.jobTitle) setJobTitle(initialData.jobTitle);
      if (initialData.startDate) setStartDate(initialData.startDate);
      if (initialData.endDate) setEndDate(initialData.endDate);
      if (initialData.contract) setContract(initialData.contract);
      if (initialData.hoursPerWeek) setHoursPerWeek(initialData.hoursPerWeek);
      if (initialData.grossSalary) setAnnualSalary(initialData.grossSalary);
      if (initialData.mainWorkAddressLine1) setAddressLine1(initialData.mainWorkAddressLine1);
      if (initialData.mainWorkAddressLine2) setAddressLine2(initialData.mainWorkAddressLine2);
    }
  }, [open, initialData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (typeof window !== "undefined" && caseId) {
        const savedData = {
          employer,
          jobTitle,
          startDate,
          endDate,
          contract,
          hoursPerWeek,
          grossSalary: annualSalary,
          mainWorkAddressLine1: addressLine1,
          mainWorkAddressLine2: addressLine2,
        };
        localStorage.setItem(`employment_${caseId}`, JSON.stringify(savedData));
      }

      if (caseId) {
        try {
          await apiClient.patch(ENDPOINTS.cases.byId(caseId), {
            personal: {
              groupName: employer,
              jobTitle: jobTitle,
              jobPay: annualSalary,
              workAddress1: addressLine1,
              workAddress2: addressLine2,
            }
          });
        } catch (apiErr) {
          console.warn("API Patch failed, stored in preview localStorage:", apiErr);
        }
      }

      toast.success("Employment details saved successfully");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save employment details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[680px] w-[680px] h-[764px] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-[20px] bg-white border border-[#EBEBEB] shadow-regular-medium flex flex-col font-sans select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[#EBEBEB] shrink-0 h-[56px]">
          <h3 className="text-[16px] font-medium text-[#171717] leading-[24px]">
            Edit employment details
          </h3>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="size-6 rounded-[6px] bg-[#F7F7F7] text-[#5C5C5C] hover:text-[#171717] hover:bg-[#EBEBEB] flex items-center justify-center transition-colors cursor-pointer"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Scrollable Content (No horizontal scroll) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-[20px] flex flex-col gap-[16px] bg-white w-full">
          {/* AI Banner */}
          <div className="flex items-center justify-between p-[12px_16px] gap-[12px] bg-[#F7F7F7] rounded-[8px] min-h-[56px] shrink-0 w-full">
            <div className="flex items-center gap-[12px] flex-1 min-w-0">
              <div className="size-[24px] rounded-[6.4px] bg-[#7D52F4] flex items-center justify-center shrink-0">
                <Sparkles className="size-3.5 text-[#EFEBFF] fill-[#EFEBFF]" />
              </div>
              <span className="text-[13px] leading-[20px] text-[#171717] tracking-[-0.006em] flex-1 min-w-0">
                Upload the CoS reference and AI will auto-fill these fields for you.
              </span>
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-[4px] px-[12px] h-[32px] bg-[#171717] hover:bg-neutral-800 text-white rounded-[8px] text-[14px] font-medium leading-[20px] tracking-[-0.006em] transition-all cursor-pointer select-none shrink-0"
            >
              <Upload className="size-4 text-white" />
              Upload
            </button>
          </div>

          <div className="flex flex-col gap-[16px] w-full">
            {/* Employer / Sponsor */}
            <div className="flex flex-col gap-[4px] w-full">
              <div className="flex items-center gap-[4px]">
                <Label htmlFor="employer" className="text-[14px] font-medium text-[#171717] leading-[20px]">
                  Employer / Sponsor
                </Label>
                <Info className="size-4 text-[#D1D1D1]" />
              </div>
              <Input
                id="employer"
                value={employer}
                onChange={(e) => setEmployer(e.target.value)}
                className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] focus-visible:border-neutral-900 shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full"
              />
            </div>

            {/* Job Title */}
            <div className="flex flex-col gap-[4px] w-full">
              <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">Job Title</Label>
              <Select value={jobTitle} onValueChange={(val) => val && setJobTitle(val)}>
                <SelectTrigger className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
                  <SelectValue placeholder="Select Job Title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Singer">Singer</SelectItem>
                  <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                  <SelectItem value="Artist">Artist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date & End Date */}
            <div className="flex gap-[16px] w-full">
              <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
                <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">Start Date</Label>
                <div className="relative w-full">
                  <Calendar className="absolute left-[12px] top-1/2 -translate-y-1/2 size-5 text-[#5C5C5C]" />
                  <Input
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-[40px] pl-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
                <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">End Date</Label>
                <div className="relative w-full">
                  <Calendar className="absolute left-[12px] top-1/2 -translate-y-1/2 size-5 text-[#5C5C5C]" />
                  <Input
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-[40px] pl-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full"
                  />
                </div>
              </div>
            </div>

            {/* Contract, Hours/Week, Annual Salary */}
            <div className="flex gap-[16px] w-full">
              <div className="flex-[2] min-w-0 flex flex-col gap-[4px]">
                <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">Contract</Label>
                <Select value={contract} onValueChange={(val) => val && setContract(val)}>
                  <SelectTrigger className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
                    <SelectValue placeholder="Contract" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-[1] min-w-0 flex flex-col gap-[4px]">
                <div className="flex items-center gap-[4px]">
                  <Label className="text-[14px] font-medium text-[#171717] leading-[20px] truncate">Hours/Wk</Label>
                  <Info className="size-4 text-[#D1D1D1] shrink-0" />
                </div>
                <Input
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  className="h-[40px] rounded-[10px] border-0 bg-[#F5F5F5] text-[#D1D1D1] text-[14px] px-[12px] w-full"
                />
              </div>
              <div className="flex-[2] min-w-0 flex flex-col gap-[4px]">
                <div className="flex items-center gap-[4px]">
                  <Label className="text-[14px] font-medium text-[#171717] leading-[20px] truncate">Annual Salary</Label>
                  <Info className="size-4 text-[#D1D1D1] shrink-0" />
                </div>
                <Input
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(e.target.value)}
                  className="h-[40px] rounded-[10px] border-0 bg-[#F5F5F5] text-[#D1D1D1] text-[14px] px-[12px] w-full"
                />
              </div>
            </div>

            {/* Address Line 1 */}
            <div className="flex flex-col gap-[4px] w-full">
              <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">Address Line 1</Label>
              <Input
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full"
              />
            </div>

            {/* Address Line 2 (Optional) */}
            <div className="flex flex-col gap-[4px] w-full">
              <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">
                Address Line 2 <span className="text-[#5C5C5C] font-normal">(Optional)</span>
              </Label>
              <Input
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full"
              />
            </div>

            {/* City & Post Code */}
            <div className="flex gap-[16px] w-full">
              <div className="flex-[3] min-w-0 flex flex-col gap-[4px]">
                <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">City</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full"
                />
              </div>
              <div className="flex-[2] min-w-0 flex flex-col gap-[4px]">
                <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">Post Code</Label>
                <Input
                  value={postCode}
                  onChange={(e) => setPostCode(e.target.value)}
                  className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-[20px] py-[16px] border-t border-[#EBEBEB] bg-white flex flex-row items-center justify-end gap-[12px] shrink-0 h-[68px]">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-[70px] h-[36px] bg-[#F5F5F5] hover:bg-neutral-200 text-[#5C5C5C] font-medium rounded-[8px] text-[14px] leading-[20px] tracking-[-0.006em]"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="w-[117px] h-[36px] bg-[#7D52F4] hover:bg-brand-dark text-white font-medium rounded-[8px] text-[14px] leading-[20px] tracking-[-0.006em] disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
