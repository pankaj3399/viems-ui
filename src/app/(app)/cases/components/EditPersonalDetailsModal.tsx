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
import { XIcon, Calendar } from "lucide-react";
import { toast } from "sonner";

interface EditPersonalDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  migrantId: string;
  initialData?: any;
  onSuccess: () => void;
}

const DEFAULT_NATIONALITIES = [
  { id: "1", value: "American" },
  { id: "2", value: "British" },
  { id: "3", value: "Canadian" },
  { id: "4", value: "Australian" },
  { id: "5", value: "Indian" },
  { id: "6", value: "Irish" },
  { id: "7", value: "German" },
  { id: "8", value: "French" },
  { id: "9", value: "Spanish" },
  { id: "10", value: "Italian" },
];

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

// Parse DD / MM / YYYY or date string to YYYY-MM-DD
function parseDisplayDate(displayVal: string): string | null {
  if (!displayVal) return null;
  const cleaned = displayVal.trim();
  if (!cleaned || cleaned === "—" || cleaned === "-" || cleaned === "NaN-NaN-NaN") {
    return null;
  }
  const parts = cleaned.replace(/\s+/g, "").split("/");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    if (day && month && year && year.length === 4) {
      return `${year}-${month}-${day}`;
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  const dateObj = new Date(cleaned);
  if (!isNaN(dateObj.getTime())) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return null;
}

// Format YYYY-MM-DD to DD / MM / YYYY
function formatDisplayDate(isoVal: string): string {
  if (!isoVal || isoVal === "—" || isoVal === "-" || isoVal === "NaN-NaN-NaN") return "";
  const cleaned = isoVal.trim();
  if (/\d{2}\s*\/\s*\d{2}\s*\/\s*\d{4}/.test(cleaned)) {
    return cleaned;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(cleaned);
  if (match) {
    const [, y, m, d] = match;
    return `${d} / ${m} / ${y}`;
  }
  const dateObj = new Date(cleaned);
  if (isNaN(dateObj.getTime())) {
    return "";
  }
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day} / ${month} / ${year}`;
}

export function EditPersonalDetailsModal({
  open,
  onOpenChange,
  migrantId,
  initialData,
  onSuccess,
}: EditPersonalDetailsModalProps) {
  // Form states
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [maritalStatus, setMaritalStatus] = React.useState("");
  const [countryOfBirth, setCountryOfBirth] = React.useState("");
  const [nationality, setNationality] = React.useState("");
  const [cityOfBirth, setCityOfBirth] = React.useState("");
  const [stageName, setStageName] = React.useState("");
  const [withStageName, setWithStageName] = React.useState(false);

  // Passport states
  const [passportId, setPassportId] = React.useState<number | string | null>(null);
  const [passportNumber, setPassportNumber] = React.useState("");
  const [passportIssueDate, setPassportIssueDate] = React.useState("");
  const [passportExpiryDate, setPassportExpiryDate] = React.useState("");

  // Preserved database states
  const [migrantData, setMigrantData] = React.useState<any>(null);
  const [contacts, setContacts] = React.useState<any>(null);

  // Dropdown options lists
  const [nationalities, setNationalities] = React.useState<{ id: string; value: string }[]>(DEFAULT_NATIONALITIES);
  const [hasRealNationalities, setHasRealNationalities] = React.useState(false);
  const [countries, setCountries] = React.useState<{ id: string; value: string }[]>(DEFAULT_COUNTRIES);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const populateFromObject = React.useCallback((m: any) => {
    if (!m) return;
    setMigrantData(m);
    const pInfo = m.personalInfo || m.user?.personalInfo || {};
    const firstNameVal = m.first_name || pInfo.firstName || m.firstName || "";
    const lastNameVal = m.last_name || pInfo.lastName || m.lastName || "";
    setFirstName(firstNameVal);
    setLastName(lastNameVal);
    setDob(formatDisplayDate(pInfo.dob || pInfo.dateOfBirth || m.date_of_birth || m.dateOfBirth || ""));
    setGender(pInfo.gender || pInfo.sex || m.gender || m.sex || "");
    setMaritalStatus(pInfo.maritalStatus || m.marital_status || m.maritalStatus || "");
    setCountryOfBirth(pInfo.countryOfBirth || pInfo.countryOfBirthCode || m.country_of_birth || m.countryOfBirth || "");
    
    if (pInfo.nationality?.id) {
      setNationality(pInfo.nationality.id.toString());
    } else if (pInfo.nationalityCode) {
      setNationality(pInfo.nationalityCode);
    } else if (pInfo.nationality) {
      setNationality(pInfo.nationality);
    }

    setCityOfBirth(pInfo.cityOfBirth || m.place_of_birth || m.city_of_birth || "");
    setStageName(m.stage_name || "");
    setWithStageName(Boolean(m.with_stage_name));
    setContacts(m.contacts || null);

    const activePassport = Array.isArray(m.passports)
      ? m.passports.find((p: any) => p.is_actual === true) || m.passports[0]
      : m.passport;

    if (activePassport) {
      setPassportId(activePassport.id || null);
      const rawNum = activePassport.passport_number || activePassport.number || "";
      setPassportNumber(rawNum === "—" || rawNum === "-" ? "" : rawNum);
      setPassportIssueDate(formatDisplayDate(activePassport.issue_passport_date || activePassport.issueDate || ""));
      setPassportExpiryDate(formatDisplayDate(activePassport.expired_passport_date || activePassport.expiryDate || ""));
    }
  }, []);

  React.useEffect(() => {
    if (initialData && open) {
      populateFromObject(initialData);
    }
  }, [initialData, open, populateFromObject]);

  React.useEffect(() => {
    async function loadData() {
      if (!open || !migrantId) return;

      try {
        setIsLoading(true);

        // 1. Fetch initdata nationalities and countries safely
        try {
          const initData = await apiClient.get<any>(ENDPOINTS.initData.byName("start"));
          if (initData?.Nationalities && Array.isArray(initData.Nationalities) && initData.Nationalities.length > 0) {
            setNationalities(initData.Nationalities);
            setHasRealNationalities(true);
          }
          if (initData?.Countries && Array.isArray(initData.Countries) && initData.Countries.length > 0) {
            setCountries(initData.Countries);
          }
        } catch {
          // Keep defaults
        }

        // If initialData is already available and populated, avoid overriding with mismatched ID lookup
        if (initialData && (initialData.personalInfo?.firstName || initialData.firstName || initialData.name)) {
          return;
        }

        // 2. Fetch migrant profile safely by checking case first
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
        console.error("Failed to load edit modal details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [open, migrantId, initialData, populateFromObject]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!migrantId) return;

    try {
      setIsSaving(true);

      const isoDob = parseDisplayDate(dob);
      const isoIssueDate = parseDisplayDate(passportIssueDate);
      const isoExpiryDate = parseDisplayDate(passportExpiryDate);

      // Build payload matching MigrantClientDto requirements
      const contactEmail = contacts?.contact_email || "";

      const resolvedNationality = hasRealNationalities
        ? (nationality ? (isNaN(Number(nationality)) ? nationality : Number(nationality)) : null)
        : (migrantData?.user?.personalInfo?.nationality?.id || migrantData?.personalInfo?.nationality || null);

      const overrides: any = {
        first_name: firstName,
        last_name: lastName,
        gender: gender || null,
        date_of_birth: isoDob || null,
        marital_status: maritalStatus || null,
        country_of_birth: countryOfBirth || null,
        nationality: resolvedNationality,
        place_of_birth: cityOfBirth || null,
        stage_name: stageName,
        with_stage_name: Boolean(withStageName),
        contacts: {
          contact_email: contactEmail,
          address_line_1: contacts?.address_line_1 || "",
          address_line_2: contacts?.address_line_2 || "",
          zip_code: contacts?.zip_code || "",
          phone_1: contacts?.phone_1 || "",
          country: contacts?.country?.id || null,
          state: contacts?.state?.id || null,
          city: contacts?.city?.id || null,
        },
      };

      const cleanPassportNumber = (passportNumber || "").replace(/^[—\-]+$/, "").trim();
      if (cleanPassportNumber) {
        overrides.passport = {
          ...(passportId ? { id: typeof passportId === "number" ? passportId : parseInt(passportId as string, 10) } : {}),
          passport_number: cleanPassportNumber,
          place_of_issue: cityOfBirth || countryOfBirth || null,
          issue_passport_date: isoIssueDate || null,
          expired_passport_date: isoExpiryDate || null,
          is_actual: true,
        };
      }

      const payload = buildMigrantPatchPayload(migrantData, overrides);

      await apiClient.patch(ENDPOINTS.migrants.byId(migrantId), payload);
      toast.success("Personal details updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to save personal details:", err);
      const errorMsg = typeof err?.message === "string" && err.message ? err.message : "Failed to save personal details";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[680px] h-[764px] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-[20px] bg-white border border-[#EBEBEB] shadow-regular-medium flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[#EBEBEB] shrink-0">
          <h3 className="text-label-md font-medium text-[#171717] leading-[24px]">
            Personal details
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

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-[20px] flex flex-col gap-[16px] bg-white">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-[#5C5C5C]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 mb-2"></div>
              <p className="text-paragraph-sm font-medium">Loading details...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-[16px]">
              {/* Row 1: First Name / Last Name */}
              <div className="flex gap-xl w-full">
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="firstName" className="text-label-sm font-medium text-[#171717]">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717] placeholder-neutral-400"
                    required
                  />
                </div>
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="lastName" className="text-label-sm font-medium text-[#171717]">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717] placeholder-neutral-400"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Date of Birth / Gender */}
              <div className="flex gap-xl w-full">
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="dob" className="text-label-sm font-medium text-[#171717]">
                    Date of Birth
                  </Label>
                  <div className="relative w-full">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#5C5C5C] pointer-events-none" />
                    <Input
                      id="dob"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      placeholder="DD / MM / YYYY"
                      className="pl-[40px] border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717] placeholder-neutral-400"
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="gender" className="text-label-sm font-medium text-[#171717]">
                    Gender
                  </Label>
                  <Select value={gender} onValueChange={(val) => setGender(val || "")}>
                    <SelectTrigger id="gender" className="h-10 border border-[#EBEBEB] focus-visible:border-neutral-900 text-[#171717] focus-visible:shadow-important-focus">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#EBEBEB] rounded-card shadow-card-large">
                      <SelectItem value="Male" className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">Male</SelectItem>
                      <SelectItem value="Female" className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Marital Status */}
              <div className="flex gap-xl w-full">
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="maritalStatus" className="text-label-sm font-medium text-[#171717]">
                    Marital Status
                  </Label>
                  <Select value={maritalStatus} onValueChange={(val) => setMaritalStatus(val || "")}>
                    <SelectTrigger id="maritalStatus" className="h-10 border border-[#EBEBEB] focus-visible:border-neutral-900 text-[#171717] focus-visible:shadow-important-focus">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#EBEBEB] rounded-card shadow-card-large">
                      <SelectItem value="Single" className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">Single</SelectItem>
                      <SelectItem value="Married" className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">Married</SelectItem>
                      <SelectItem value="Divorced" className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">Divorced</SelectItem>
                      <SelectItem value="Widowed" className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Nationality / Country of Birth */}
              <div className="flex gap-xl w-full">
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="nationality" className="text-label-sm font-medium text-[#171717]">
                    Nationality
                  </Label>
                  <Select value={nationality} onValueChange={(val) => setNationality(val || "")}>
                    <SelectTrigger id="nationality" className="h-10 border border-[#EBEBEB] focus-visible:border-neutral-900 text-[#171717] focus-visible:shadow-important-focus">
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#EBEBEB] rounded-card shadow-card-large max-h-60 overflow-y-auto">
                      {nationalities.map((nat) => (
                        <SelectItem key={nat.id} value={nat.id} className="text-[#171717] hover:bg-neutral-50 py-[10px] px-lg">
                          {nat.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="countryOfBirth" className="text-label-sm font-medium text-[#171717]">
                    Country of Birth
                  </Label>
                  <Select value={countryOfBirth} onValueChange={(val) => setCountryOfBirth(val || "")}>
                    <SelectTrigger id="countryOfBirth" className="h-10 border border-[#EBEBEB] focus-visible:border-neutral-900 text-[#171717] focus-visible:shadow-important-focus">
                      <SelectValue placeholder="Select country of birth" />
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

              {/* Row 5: City of Birth */}
              <div className="flex flex-col gap-xs w-full">
                <Label htmlFor="cityOfBirth" className="text-label-sm font-medium text-[#171717]">
                  City of Birth
                </Label>
                <Input
                  id="cityOfBirth"
                  value={cityOfBirth}
                  onChange={(e) => setCityOfBirth(e.target.value)}
                  placeholder="Enter city of birth"
                  className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717] placeholder-neutral-400"
                />
              </div>

              {/* Row 6: Passport Number */}
              <div className="flex flex-col gap-xs w-full">
                <Label htmlFor="passportNumber" className="text-label-sm font-medium text-[#171717]">
                  Passport Number
                </Label>
                <Input
                  id="passportNumber"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  placeholder="Enter passport number"
                  className="border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717] placeholder-neutral-400"
                />
              </div>

              {/* Row 7: Passport Issue Date / Passport Expiry Date */}
              <div className="flex gap-xl w-full">
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="passportIssueDate" className="text-label-sm font-medium text-[#171717]">
                    Passport Issue Date
                  </Label>
                  <div className="relative w-full">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#5C5C5C] pointer-events-none" />
                    <Input
                      id="passportIssueDate"
                      value={passportIssueDate}
                      onChange={(e) => setPassportIssueDate(e.target.value)}
                      placeholder="DD / MM / YYYY"
                      className="pl-[40px] border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717] placeholder-neutral-400"
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-xs">
                  <Label htmlFor="passportExpiryDate" className="text-label-sm font-medium text-[#171717]">
                    Passport Expiry Date
                  </Label>
                  <div className="relative w-full">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#5C5C5C] pointer-events-none" />
                    <Input
                      id="passportExpiryDate"
                      value={passportExpiryDate}
                      onChange={(e) => setPassportExpiryDate(e.target.value)}
                      placeholder="DD / MM / YYYY"
                      className="pl-[40px] border border-[#EBEBEB] focus-visible:border-neutral-900 focus-visible:shadow-important-focus text-[#171717] placeholder-neutral-400"
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
            className="px-xl py-lg h-9 bg-[#7D52F4] hover:bg-brand-dark text-white font-semibold rounded-[8px] text-[14px] leading-[20px] tracking-[-0.006em] disabled:opacity-50"
            disabled={isSaving || isLoading}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
