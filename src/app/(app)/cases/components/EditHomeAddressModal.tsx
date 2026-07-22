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
import { XIcon } from "lucide-react";
import { toast } from "sonner";

interface EditHomeAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  migrantId: string;
  onSuccess: () => void;
}

export function EditHomeAddressModal({
  open,
  onOpenChange,
  migrantId,
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
  const [countries, setCountries] = React.useState<{ id: string; value: string }[]>([]);
  const [citiesList, setCitiesList] = React.useState<{ id: string; value: string }[]>([]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Load countries list and migrant's existing contacts
  React.useEffect(() => {
    async function loadData() {
      if (!open || !migrantId) return;

      try {
        setIsLoading(true);

        // Fetch initdata countries
        const initData = await apiClient.get<any>(ENDPOINTS.initData.byName("start"));
        if (initData.Countries) {
          setCountries(initData.Countries);
        }

        // Fetch current migrant details
        const migrant = await apiClient.get<any>(ENDPOINTS.migrants.byId(migrantId));
        if (migrant) {
          setMigrantData(migrant);
          const c = migrant.contacts;
          if (c) {
            setAddressLine1(c.address_line_1 || "");
            setAddressLine2(c.address_line_2 || "");
            setPostCode(c.zip_code || "");
            
            // If city is an object with a name, display it
            if (c.city?.name) {
              setCity(c.city.name);
            } else if (typeof c.city === "string") {
              setCity(c.city);
            }

            // Set country
            if (c.country?.name) {
              setSelectedCountryName(c.country.name);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load address details:", err);
        toast.error("Failed to load address details");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [open, migrantId]);

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
      const payload: any = {
        first_name: migrantData.first_name || migrantData.user?.personalInfo?.firstName || migrantData.user?.firstName || "",
        last_name: migrantData.last_name || migrantData.user?.personalInfo?.lastName || migrantData.user?.lastName || "",
        gender: migrantData.gender || migrantData.user?.personalInfo?.sex || null,
        date_of_birth: migrantData.date_of_birth || migrantData.user?.personalInfo?.dateOfBirth || null,
        nationality: migrantData.nationality?.id || (typeof migrantData.nationality === "number" ? migrantData.nationality : null),
        place_of_birth: migrantData.place_of_birth || null,
        stage_name: (migrantData.stage_name || `${migrantData.first_name || ""}${migrantData.last_name || ""}`).replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || `migrant${migrantId}`,
        with_stage_name: migrantData.with_stage_name ?? true,
        deletedFiles: [],
        logs: [],
        contacts: {
          contact_email: migrantData.contacts?.contact_email || migrantData.user?.email || "",
          address_line_1: addressLine1,
          address_line_2: addressLine2 || null,
          zip_code: postCode,
          phone_1: migrantData.contacts?.phone_1 || "",
          phone_2: migrantData.contacts?.phone_2 || null,
          phone_3: migrantData.contacts?.phone_3 || null,
          phone_4: migrantData.contacts?.phone_4 || null,
          country: currentCountryId ? parseInt(currentCountryId, 10) : migrantData.contacts?.country?.id,
          state: migrantData.contacts?.state?.id || null,
          city: resolvedCityId || null,
        },
      };

      // Handle active passport if any
      const activePassport = migrantData.passports?.find((p: any) => p.is_actual === true);
      if (activePassport) {
        payload.passport = {
          id: activePassport.id,
          passport_number: activePassport.passport_number,
          issue_passport_date: activePassport.issue_passport_date,
          expired_passport_date: activePassport.expired_passport_date,
        };
      }

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
        className="w-[680px] p-0 gap-0 overflow-hidden rounded-[20px] bg-white border border-[#EBEBEB] shadow-regular-medium flex flex-col font-sans select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[#EBEBEB] shrink-0">
          <h3 className="text-label-md font-medium text-[#171717] leading-[24px]">
            Home address
          </h3>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-[#171717]/40 hover:text-[#171717] transition-colors p-0.5 rounded-full hover:bg-neutral-50 cursor-pointer"
          >
            <XIcon className="size-5" />
          </button>
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
