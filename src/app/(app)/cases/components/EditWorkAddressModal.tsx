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
import { XIcon, Trash2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

interface AddressItem {
  id: string;
  type: string;
  line1: string;
  line2: string;
  city: string;
  postCode: string;
  country: string;
}

interface EditWorkAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  migrantId: string;
  initialData?: any;
  onSuccess: () => void;
}

export function EditWorkAddressModal({
  open,
  onOpenChange,
  caseId,
  migrantId,
  initialData,
  onSuccess,
}: EditWorkAddressModalProps) {
  const [addresses, setAddresses] = React.useState<AddressItem[]>([
    {
      id: "main",
      type: "Hotel",
      line1: "Royal Albert Hall",
      line2: "",
      city: "London",
      postCode: "SW7 2AP",
      country: "United Kingdom",
    },
    {
      id: "second",
      type: "Office",
      line1: "45 Cromwell Road",
      line2: "",
      city: "London",
      postCode: "SW7 2EF",
      country: "United States",
    },
  ]);

  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && initialData) {
      const mainLine1 = initialData.mainWorkAddressLine1 || "Royal Albert Hall";
      const mainLine2 = initialData.mainWorkAddressLine2 || "";
      const secondLine1 = initialData.secondWorkAddressLine1 || "45 Cromwell Road";
      const secondLine2 = initialData.secondWorkAddressLine2 || "";

      setAddresses([
        {
          id: "main",
          type: "Hotel",
          line1: mainLine1,
          line2: mainLine2,
          city: "London",
          postCode: "SW7 2AP",
          country: "United Kingdom",
        },
        {
          id: "second",
          type: "Office",
          line1: secondLine1,
          line2: secondLine2,
          city: "London",
          postCode: "SW7 2EF",
          country: "United States",
        },
      ]);
    }
  }, [open, initialData]);

  const handleUpdateField = (id: string, field: keyof AddressItem, value: string) => {
    setAddresses((prev) =>
      prev.map((addr) => (addr.id === id ? { ...addr, [field]: value } : addr))
    );
  };

  const handleRemove = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const handleAddAddress = () => {
    setAddresses((prev) => [
      ...prev,
      {
        id: `addr_${Date.now()}`,
        type: "Office",
        line1: "",
        line2: "",
        city: "",
        postCode: "",
        country: "United Kingdom",
      },
    ]);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (typeof window !== "undefined" && caseId) {
        const savedWorkAddresses = {
          mainWorkAddressLine1: addresses[0]?.line1 || "",
          mainWorkAddressLine2: addresses[0]?.line2 ? `${addresses[0].line2}, ${addresses[0].city}` : `${addresses[0]?.city || ""}, ${addresses[0]?.postCode || ""}`.trim(),
          secondWorkAddressLine1: addresses[1]?.line1 || "",
          secondWorkAddressLine2: addresses[1]?.line2 ? `${addresses[1].line2}, ${addresses[1].city}` : `${addresses[1]?.city || ""}, ${addresses[1]?.postCode || ""}`.trim(),
        };
        localStorage.setItem(`work_address_${caseId}`, JSON.stringify(savedWorkAddresses));
      }

      toast.success("Address history saved successfully");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save address history");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[680px] w-[680px] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-[20px] bg-white border border-[#EBEBEB] shadow-regular-medium flex flex-col font-sans select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[#EBEBEB] shrink-0 h-[56px]">
          <h3 className="text-[16px] font-medium text-[#171717] leading-[24px]">
            Edit address history
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-[20px_20px_28px] flex flex-col gap-[32px] bg-white w-full">
          {addresses.map((addr, idx) => (
            <div key={addr.id} className="flex flex-col gap-[16px] w-full">
              {/* Section Header */}
              <div className="flex items-center justify-between h-[36px]">
                <span className="text-[12px] font-medium tracking-[0.04em] text-[#171717] uppercase font-inter">
                  {idx === 0 ? "MAIN ADDRESS" : idx === 1 ? "SECOND ADDRESS" : `ADDRESS ${idx + 1}`}
                </span>
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(addr.id)}
                    className="flex items-center justify-center gap-[4px] px-[8px] h-[36px] bg-white text-[#FB3748] hover:bg-[#FFF5F5] rounded-[8px] text-[14px] font-medium transition-colors cursor-pointer"
                  >
                    <Trash2Icon className="size-5 text-[#FB3748]" />
                    Remove
                  </button>
                )}
              </div>

              {/* Address Type */}
              <div className="flex flex-col gap-[4px] w-full max-w-[320px]">
                <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">Address Type</Label>
                <Select
                  value={addr.type}
                  onValueChange={(v) => v && handleUpdateField(addr.id, "type", v)}
                >
                  <SelectTrigger className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
                    <SelectValue placeholder="Address Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hotel">Hotel</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Site">Site</SelectItem>
                    <SelectItem value="Branch">Branch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address Line 1 */}
              <div className="flex flex-col gap-[4px] w-full">
                <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">Address Line 1</Label>
                <Input
                  value={addr.line1}
                  onChange={(e) => handleUpdateField(addr.id, "line1", e.target.value)}
                  className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full"
                />
              </div>

              {/* Address Line 2 */}
              <div className="flex flex-col gap-[4px] w-full">
                <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">
                  Address Line 2 <span className="text-[#5C5C5C] font-normal">(Optional)</span>
                </Label>
                <Input
                  value={addr.line2}
                  onChange={(e) => handleUpdateField(addr.id, "line2", e.target.value)}
                  className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full"
                />
              </div>

              {/* City & Post Code */}
              <div className="flex gap-[16px] w-full">
                <div className="flex-[3] min-w-0 flex flex-col gap-[4px]">
                  <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">City</Label>
                  <Input
                    value={addr.city}
                    onChange={(e) => handleUpdateField(addr.id, "city", e.target.value)}
                    className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full"
                  />
                </div>
                <div className="flex-[2] min-w-0 flex flex-col gap-[4px]">
                  <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">Post Code</Label>
                  <Input
                    value={addr.postCode}
                    onChange={(e) => handleUpdateField(addr.id, "postCode", e.target.value)}
                    className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="flex flex-col gap-[4px] w-full">
                <Label className="text-[14px] font-medium text-[#171717] leading-[20px]">Country</Label>
                <Select
                  value={addr.country}
                  onValueChange={(v) => v && handleUpdateField(addr.id, "country", v)}
                >
                  <SelectTrigger className="h-[40px] rounded-[10px] border border-[#EBEBEB] text-[14px] px-[12px] text-[#171717] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] w-full">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          {/* Add another address button */}
          <button
            type="button"
            onClick={handleAddAddress}
            className="w-full h-[44px] rounded-[12px] border border-dashed border-[#E5E7EB] text-[#7D52F4] hover:border-[#7D52F4]/40 hover:bg-[#7D52F4]/5 font-medium text-[14px] flex items-center justify-center gap-[6px] transition-all cursor-pointer"
          >
            <PlusIcon className="size-4" />
            Add another address
          </button>
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
