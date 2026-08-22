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
import { buildMigrantPatchPayload } from "@/lib/migrantPatchHelper";
import { formatTitleCase } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { toast } from "sonner";

interface EditContactDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  migrantId: string;
  initialData?: any;
  onSuccess: () => void;
}

export function EditContactDetailsModal({
  open,
  onOpenChange,
  migrantId,
  initialData,
  onSuccess,
}: EditContactDetailsModalProps) {
  // Primary Contact states
  const [workEmail, setWorkEmail] = React.useState("");
  const [personalEmail, setPersonalEmail] = React.useState("");
  const [mobilePhone, setMobilePhone] = React.useState("");

  // Emergency Contact states (stored locally as it's a UI-only table for Migrants)
  const [emergencyName, setEmergencyName] = React.useState("");
  const [emergencyRelationship, setEmergencyRelationship] = React.useState("");
  const [emergencyEmail, setEmergencyEmail] = React.useState("");
  const [emergencyPhone, setEmergencyPhone] = React.useState("");

  // Preserved/resolved database states
  const [migrantData, setMigrantData] = React.useState<any>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const populateFromObject = React.useCallback((m: any) => {
    if (!m) return;
    setMigrantData(m);
    
    // Primary Contact mapping
    setWorkEmail(m.user?.email || m.contact?.email || m.workEmail || m.email || "");
    setPersonalEmail(m.contacts?.contact_email || m.contact?.email || m.personalEmail || "");
    setMobilePhone(m.contacts?.phone_1 || m.contact?.phone || m.phone || m.mobilePhone || "");

    // Load emergency contacts from object
    const ec = m.emergencyContact || m.contacts?.emergency_contact || m.emergency_contact || m.contacts || {};
    setEmergencyName(ec.name || ec.emergency_contact_name || "");
    setEmergencyRelationship(ec.relationship || ec.emergency_contact_relationship || "Spouse");
    setEmergencyEmail(ec.email || ec.emergency_contact_email || "");
    setEmergencyPhone(ec.phone || ec.emergency_contact_phone || "");
  }, []);

  React.useEffect(() => {
    if (initialData && open) {
      populateFromObject(initialData);
    }
  }, [initialData, open, populateFromObject]);

  // Load existing details
  React.useEffect(() => {
    let ignore = false;
    async function loadData() {
      if (!open || !migrantId) return;

      try {
        setIsLoading(true);

        // If initialData is already available, avoid overriding with mismatched ID lookup
        if (initialData && (initialData.contact?.email || initialData.contacts?.contact_email || initialData.email)) {
          return;
        }

        // Fetch current migrant details safely by checking case first
        let migrant: any = null;
        try {
          const caseData = await apiClient.get<any>(ENDPOINTS.cases.byId(migrantId));
          if (caseData && (caseData.id || caseData.caseNumber || caseData.migrant)) {
            const realMigrantId = caseData.migrant?.id || caseData.migrant_id || caseData.migrantId;
            if (realMigrantId) {
              try {
                migrant = await apiClient.get<any>(ENDPOINTS.migrants.byId(realMigrantId));
              } catch {}
            }
            if (!migrant) {
              migrant = caseData.migrant || caseData;
            }
          }
        } catch {}

        if (!migrant) {
          try {
            migrant = await apiClient.get<any>(ENDPOINTS.migrants.byId(migrantId));
          } catch {}
        }

        if (!ignore && migrant) {
          populateFromObject(migrant);
        }
      } catch (err) {
        console.error("Failed to load contacts details:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [open, migrantId, initialData, populateFromObject]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!migrantId || !migrantData) return;

    try {
      setIsSaving(true);

      // Build payload matching MigrantClientDto requirements
      const payload = buildMigrantPatchPayload(migrantData, {
        contacts: {
          contact_email: personalEmail || workEmail || migrantData.user?.email || "",
          contact_number: mobilePhone,
          phone_1: mobilePhone,
          emergency_contact: {
            name: emergencyName,
            relationship: emergencyRelationship,
            email: emergencyEmail,
            phone: emergencyPhone,
          },
          emergency_contact_name: emergencyName,
          emergency_contact_relationship: emergencyRelationship,
          emergency_contact_email: emergencyEmail,
          emergency_contact_phone: emergencyPhone,
        },
        emergencyContact: {
          name: emergencyName,
          relationship: emergencyRelationship,
          email: emergencyEmail,
          phone: emergencyPhone,
        },
      });

      await apiClient.patch(ENDPOINTS.migrants.byId(migrantId), payload);
      toast.success("Contact details updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to save contact details:", err);
      toast.error(err?.message || "Failed to save contact details changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[680px] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-[20px] bg-white border border-[#EBEBEB] shadow-regular-medium flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[#EBEBEB] shrink-0">
          <h3 className="text-label-md font-medium text-[#171717] leading-[24px]">
            Contact details
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="size-6 rounded-[6px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0 flex items-center justify-center p-0"
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-[20px] flex flex-col gap-[20px] bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#5C5C5C]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 mb-2"></div>
              <p className="text-paragraph-sm font-medium">Loading details...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-[20px]">
              {/* PRIMARY CONTACT SECTION */}
              <div className="flex flex-col gap-lg">
                <span className="text-[12px] font-semibold tracking-[0.04em] text-[#171717] uppercase">
                  Primary Contact
                </span>
                
                {/* Work Email */}
                <div className="flex flex-col gap-xs w-full">
                  <Label htmlFor="workEmail" className="text-label-sm font-medium text-[#171717]">
                    Work Email
                  </Label>
                  <Input
                    id="workEmail"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="Enter work email"
                    className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717]"
                    required
                  />
                </div>

                {/* Personal Email / Mobile Phone */}
                <div className="flex gap-xl w-full">
                  <div className="flex-1 flex flex-col gap-xs">
                    <Label htmlFor="personalEmail" className="text-label-sm font-medium text-[#171717]">
                      Personal Email
                    </Label>
                    <Input
                      id="personalEmail"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      placeholder="Enter personal email"
                      className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717]"
                      required
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-xs">
                    <Label htmlFor="mobilePhone" className="text-label-sm font-medium text-[#171717]">
                      Mobile Phone
                    </Label>
                    <Input
                      id="mobilePhone"
                      value={mobilePhone}
                      onChange={(e) => setMobilePhone(e.target.value)}
                      placeholder="Enter mobile phone"
                      className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717]"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* EMERGENCY CONTACT SECTION */}
              <div className="flex flex-col gap-lg border-t border-[#EBEBEB] pt-[20px]">
                <span className="text-[12px] font-semibold tracking-[0.04em] text-[#171717] uppercase">
                  Emergency Contact
                </span>

                {/* Full Name */}
                <div className="flex flex-col gap-xs w-full">
                  <Label htmlFor="emergencyName" className="text-label-sm font-medium text-[#171717]">
                    Full Name
                  </Label>
                  <Input
                    id="emergencyName"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Enter emergency contact full name"
                    className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717]"
                    required
                  />
                </div>

                {/* Relationship */}
                <div className="flex flex-col gap-xs w-full">
                  <Label htmlFor="emergencyRelationship" className="text-label-sm font-medium text-[#171717]">
                    Relationship
                  </Label>
                  <Select value={emergencyRelationship} onValueChange={(val) => setEmergencyRelationship(val || "")}>
                    <SelectTrigger id="emergencyRelationship" className="h-10 border border-[#EBEBEB] focus-visible:border-neutral-900 text-[#171717] focus-visible:shadow-important-focus">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#EBEBEB] rounded-card shadow-card-large">
                      <SelectItem value="Spouse" className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">Spouse</SelectItem>
                      <SelectItem value="Parent" className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">Parent</SelectItem>
                      <SelectItem value="Child" className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">Child</SelectItem>
                      <SelectItem value="Sibling" className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">Sibling</SelectItem>
                      <SelectItem value="Other" className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Personal Email / Mobile Phone */}
                <div className="flex gap-xl w-full">
                  <div className="flex-1 flex flex-col gap-xs">
                    <Label htmlFor="emergencyEmail" className="text-label-sm font-medium text-[#171717]">
                      Personal Email
                    </Label>
                    <Input
                      id="emergencyEmail"
                      value={emergencyEmail}
                      onChange={(e) => setEmergencyEmail(e.target.value)}
                      placeholder="Enter emergency personal email"
                      className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717]"
                      required
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-xs">
                    <Label htmlFor="emergencyPhone" className="text-label-sm font-medium text-[#171717]">
                      Mobile Phone
                    </Label>
                    <Input
                      id="emergencyPhone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="Enter emergency mobile phone"
                      className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717]"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <DialogFooter className="px-[20px] py-[16px] border-t border-[#EBEBEB] bg-white flex flex-row items-center justify-end gap-[12px] shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="px-xl py-lg h-9 bg-[#F5F5F5] hover:bg-neutral-200 text-[#5C5C5C] font-semibold rounded-[8px] text-[14px] leading-[20px] tracking-[-0.006em]"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            className="px-xl py-lg h-9 bg-[#7D52F4] hover:bg-brand-dark text-white font-semibold rounded-[8px] text-[14px] leading-[20px] tracking-[-0.006em]"
            disabled={isSaving || isLoading}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
