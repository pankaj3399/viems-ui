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
import { XIcon } from "lucide-react";
import { toast } from "sonner";

interface EditHomeAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  migrantId: string;
  initialData?: any;
  onSuccess: () => void;
}

const DEFAULT_COUNTRIES = [
  { id: "1", value: "United States" },
  { id: "2", value: "United Kingdom" },
  { id: "3", value: "Canada" },
  { id: "4", value: "Australia" },
  { id: "5", value: "India" },
  { id: "6", value: "Ireland" },
  { id: "7", value: "Germany" },
  { id: "8", value: "France" },
  { id: "9", value: "Spain" },
  { id: "10", value: "Italy" },
];

export function EditHomeAddressModal({
  open,
  onOpenChange,
  migrantId,
  initialData,
  onSuccess,
}: EditHomeAddressModalProps) {
  // Form states
  const [addressLine1, setAddressLine1] = React.useState("");
  const [addressLine2, setAddressLine2] = React.useState("");
  const [city, setCity] = React.useState("");
  const [postCode, setPostCode] = React.useState("");
  const [selectedCountryName, setSelectedCountryName] = React.useState("United States");

  // Preserved/resolved database states
  const [migrantData, setMigrantData] = React.useState<any>(null);
  const [countries, setCountries] = React.useState<{ id: string; value: string }[]>(DEFAULT_COUNTRIES);
  const [hasRealCountries, setHasRealCountries] = React.useState(false);
  const [citiesList, setCitiesList] = React.useState<{ id: string; value: string }[]>([]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const populateFromObject = React.useCallback((m: any) => {
    if (!m) return;
    setMigrantData(m);
    const c = m.contacts || m.contact || m;
    const pInfo = m.personalInfo || {};

    const addr1 = c.address_line_1 || c.addressLine1 || (Array.isArray(pInfo.address) ? pInfo.address[0] : "") || "";
    const addr2 = c.address_line_2 || c.addressLine2 || (Array.isArray(pInfo.address) && pInfo.address.length > 1 ? pInfo.address[1] : "") || "";
    const zip = c.zip_code || c.postCode || c.postcode || "";

    setAddressLine1(addr1);
    setAddressLine2(addr2);
    setPostCode(zip);
    
    if (c.city?.name) {
      setCity(c.city.name);
    } else if (typeof c.city === "string") {
      setCity(c.city);
    } else {
      setCity("");
    }

    if (c.country?.name) {
      setSelectedCountryName(c.country.name);
    } else if (typeof c.country === "string") {
      setSelectedCountryName(c.country);
    } else {
      setSelectedCountryName("");
    }
  }, []);

  React.useEffect(() => {
    if (initialData && open) {
      populateFromObject(initialData);
    }
  }, [initialData, open, populateFromObject]);

  // Load countries list and migrant's existing contacts
  React.useEffect(() => {
    async function loadData() {
      if (!open || !migrantId) return;

      try {
        setIsLoading(true);

        // 1. Fetch initdata countries safely
        try {
          const initData = await apiClient.get<any>(ENDPOINTS.initData.byName("start"));
          if (initData?.Countries && Array.isArray(initData.Countries) && initData.Countries.length > 0) {
            setCountries(initData.Countries);
            setHasRealCountries(true);
          }
        } catch {
          // Keep default
        }

        // If initialData is already available, avoid overriding with mismatched ID lookup
        if (initialData && (initialData.personalInfo?.address || initialData.contacts?.address_line_1 || initialData.contact?.homeAddress)) {
          return;
        }

        // 2. Fetch current migrant details safely by checking case first
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

        if (migrant) {
          populateFromObject(migrant);
        }
      } catch (err) {
        console.error("Failed to load address details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [open, migrantId, initialData, populateFromObject]);

  // Find country ID from name
  const currentCountryId = React.useMemo(() => {
    const found = countries.find(
      (c) => c.value.toLowerCase() === selectedCountryName.toLowerCase()
    );
    return found ? found.id : null;
  }, [countries, selectedCountryName]);

  // Load cities list when country changes
  React.useEffect(() => {
    async function loadCities() {
      if (!currentCountryId) return;
      try {
        // Query cities for this country (stateId as null to get default regions)
        const res = await apiClient.get<any>(
          `${ENDPOINTS.geodata.states}?country=${currentCountryId}`
        );
        if (res.Cities) {
          setCitiesList(res.Cities);
        }
      } catch (err) {
        console.error("Failed to fetch cities for country:", err);
      }
    }
    loadCities();
  }, [currentCountryId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!migrantId || !migrantData) return;

    try {
      setIsSaving(true);

      // Attempt to resolve city ID from citiesList if typed city matches
      let resolvedCityId = migrantData.contacts?.city?.id;
      const matchedCity = citiesList.find(
        (c) => c.value.toLowerCase() === city.trim().toLowerCase()
      );
      if (matchedCity) {
        resolvedCityId = parseInt(matchedCity.id, 10);
      }

      // Build payload preserving unchanged details
      const contactsPatch: any = {
        address_line_1: addressLine1,
        address_line_2: addressLine2 || null,
        zip_code: postCode,
        city: resolvedCityId || null,
      };

      if (hasRealCountries && currentCountryId) {
        contactsPatch.country = parseInt(currentCountryId, 10);
      } else if (migrantData.contacts?.country?.id) {
        contactsPatch.country = migrantData.contacts.country.id;
      }

      const payload = buildMigrantPatchPayload(migrantData, {
        contacts: contactsPatch,
      });

      await apiClient.patch(ENDPOINTS.migrants.byId(migrantId), payload);
      toast.success("Home address updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to save address:", err);
      toast.error(err?.message || "Failed to save address changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[680px] p-0 gap-0 overflow-hidden rounded-[20px] bg-white border border-[#EBEBEB] shadow-regular-medium flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[#EBEBEB] shrink-0">
          <h3 className="text-label-md font-medium text-[#171717] leading-[24px]">
            Home address
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
        <form onSubmit={handleSave} className="p-[20px] flex flex-col gap-[16px] bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#5C5C5C]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 mb-2"></div>
              <p className="text-paragraph-sm font-medium">Loading details...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-[16px]">
              {/* Address Line 1 */}
              <div className="flex flex-col gap-xs w-full">
                <Label htmlFor="addressLine1" className="text-label-sm font-medium text-[#171717]">
                  Address Line 1
                </Label>
                <Input
                  id="addressLine1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Enter address line 1"
                  className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717]"
                  required
                />
              </div>

              {/* Address Line 2 */}
              <div className="flex flex-col gap-xs w-full">
                <Label htmlFor="addressLine2" className="text-label-sm font-medium text-[#171717]">
                  Address Line 2 <span className="text-[#5C5C5C] font-normal">(Optional)</span>
                </Label>
                <Input
                  id="addressLine2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Enter address line 2"
                  className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717]"
                />
              </div>

              {/* City / Post Code */}
              <div className="flex gap-xl w-full">
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="city" className="text-label-sm font-medium text-[#171717]">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
                    className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717]"
                    required
                  />
                </div>
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="postCode" className="text-label-sm font-medium text-[#171717]">
                    Post Code
                  </Label>
                  <Input
                    id="postCode"
                    value={postCode}
                    onChange={(e) => setPostCode(e.target.value)}
                    placeholder="Enter post code"
                    className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717]"
                    required
                  />
                </div>
              </div>

              {/* Country */}
              <div className="flex flex-col gap-xs w-full">
                <Label htmlFor="country" className="text-label-sm font-medium text-[#171717]">
                  Country
                </Label>
                <Select value={selectedCountryName} onValueChange={(val) => setSelectedCountryName(val || "")}>
                  <SelectTrigger id="country" className="h-10 border border-[#EBEBEB] focus-visible:border-neutral-900 text-[#171717] focus-visible:shadow-important-focus">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#EBEBEB] rounded-card shadow-card-large max-h-60 overflow-y-auto">
                    {countries.map((c) => (
                      <SelectItem key={c.id || c.value} value={c.value} className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">
                        {c.value}
                      </SelectItem>
                    )) || (
                      <SelectItem value="United States" className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">
                        United States
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
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
