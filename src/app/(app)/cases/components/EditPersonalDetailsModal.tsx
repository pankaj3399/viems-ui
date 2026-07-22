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
import { XIcon, Sparkles, Upload, Calendar } from "lucide-react";
import { toast } from "sonner";

interface EditPersonalDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  migrantId: string;
  onSuccess: () => void;
}

// Parse DD / MM / YYYY to YYYY-MM-DD
function parseDisplayDate(displayVal: string): string {
  if (!displayVal) return "";
  const cleaned = displayVal.replace(/\s+/g, "");
  const parts = cleaned.split("/");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
    if (day && month && year && year.length === 4) {
      return `${year}-${month}-${day}`;
    }
  }
  return displayVal;
}

// Format YYYY-MM-DD to DD / MM / YYYY
function formatDisplayDate(isoVal: string): string {
  if (!isoVal) return "";
  if (/\d{2}\s*\/\s*\d{2}\s*\/\s*\d{4}/.test(isoVal)) {
    return isoVal;
  }
  const dateObj = new Date(isoVal);
  if (isNaN(dateObj.getTime())) {
    return isoVal;
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
  onSuccess,
}: EditPersonalDetailsModalProps) {
  // Form states
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [maritalStatus, setMaritalStatus] = React.useState("Married");
  const [nationality, setNationality] = React.useState("");
  const [countryOfBirth, setCountryOfBirth] = React.useState("United States");
  const [cityOfBirth, setCityOfBirth] = React.useState("");
  const [passportNumber, setPassportNumber] = React.useState("");
  const [passportIssueDate, setPassportIssueDate] = React.useState("");
  const [passportExpiryDate, setPassportExpiryDate] = React.useState("");

  // Preserved database states
  const [passportId, setPassportId] = React.useState<number | null>(null);
  const [stageName, setStageName] = React.useState("");
  const [withStageName, setWithStageName] = React.useState(false);
  const [contacts, setContacts] = React.useState<any>(null);

  // Dropdown options lists
  const [nationalities, setNationalities] = React.useState<{ id: string; value: string }[]>([]);
  const [countries, setCountries] = React.useState<{ id: string; value: string }[]>([]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      if (!open || !migrantId) return;

      try {
        setIsLoading(true);

        // Fetch initdata nationalities
        const initData = await apiClient.get<any>(ENDPOINTS.initData.byName("start"));
        if (initData.Nationalities) {
          setNationalities(initData.Nationalities);
        }
        if (initData.Countries) {
          setCountries(initData.Countries);
        }

        // Fetch migrant profile
        const migrant = await apiClient.get<any>(ENDPOINTS.migrants.byId(migrantId));
        if (migrant) {
          setFirstName(migrant.user?.personalInfo?.firstName || "");
          setLastName(migrant.user?.personalInfo?.lastName || "");
          setDob(formatDisplayDate(migrant.user?.personalInfo?.dateOfBirth || ""));
          setGender(migrant.user?.personalInfo?.sex || "");
          
          if (migrant.user?.personalInfo?.nationality?.id) {
            setNationality(migrant.user.personalInfo.nationality.id.toString());
          }

          setCityOfBirth(migrant.place_of_birth || "");
          
          setStageName(migrant.stage_name || "");
          setWithStageName(migrant.with_stage_name || false);
          setContacts(migrant.contacts || null);

          // Get active passport
          const activePassport = migrant.passports?.find((p: any) => p.is_actual === true);
          if (activePassport) {
            setPassportId(activePassport.id);
            setPassportNumber(activePassport.passport_number || "");
            setPassportIssueDate(formatDisplayDate(activePassport.issue_passport_date || ""));
            setPassportExpiryDate(formatDisplayDate(activePassport.expired_passport_date || ""));
          }
        }
      } catch (err) {
        console.error("Failed to load edit modal details:", err);
        toast.error("Failed to load personal details");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [open, migrantId]);

  // AI autofill simulation
  const handleUploadClick = () => {
    const toastId = toast.loading("Parsing passport with AI...");

    setTimeout(() => {
      setFirstName("Taylor");
      setLastName("Johnson");
      setDob("14 / 06 / 1990");
      setGender("Male");
      setMaritalStatus("Married");

      const americanNat = nationalities.find(
        (n) => n.value.toLowerCase() === "american" || n.value.toLowerCase() === "united states"
      );
      if (americanNat) {
        setNationality(americanNat.id);
      }
      
      setCountryOfBirth("United States");
      setCityOfBirth("Los Angeles");
      setPassportNumber("LQ41932345");
      setPassportIssueDate("22 / 11 / 2022");
      setPassportExpiryDate("22 / 11 / 2027");

      toast.dismiss(toastId);
      toast.success("AI Autofilled fields from passport successfully!");
    }, 1200);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!migrantId) return;

    try {
      setIsSaving(true);

      const rawStageName = stageName || `${firstName}${lastName}`;
      const cleanStageName = rawStageName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || `migrant${migrantId}`;

      const isoDob = parseDisplayDate(dob);
      const isoIssueDate = parseDisplayDate(passportIssueDate);
      const isoExpiryDate = parseDisplayDate(passportExpiryDate);

      // Build payload matching MigrantClientDto requirements
      const contactEmail = contacts?.contact_email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

      const payload: any = {
        first_name: firstName,
        last_name: lastName,
        gender: gender || null,
        date_of_birth: isoDob || null,
        nationality: nationality ? (isNaN(Number(nationality)) ? nationality : Number(nationality)) : null,
        place_of_birth: cityOfBirth || null,
        stage_name: cleanStageName,
        with_stage_name: Boolean(withStageName),
        deletedFiles: [],
        logs: [],
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

      if (passportNumber || isoIssueDate || isoExpiryDate || passportId) {
        payload.passport = {
          ...(passportId ? { id: typeof passportId === "number" ? passportId : parseInt(passportId, 10) } : {}),
          ...(passportNumber ? { passport_number: passportNumber } : {}),
          ...(isoIssueDate ? { issue_passport_date: isoIssueDate } : {}),
          ...(isoExpiryDate ? { expired_passport_date: isoExpiryDate } : {}),
        };
      }

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
        className="w-[680px] h-[764px] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-[20px] bg-white border border-[#EBEBEB] shadow-regular-medium flex flex-col font-sans select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[#EBEBEB] shrink-0">
          <h3 className="text-label-md font-medium text-[#171717] leading-[24px]">
            Personal details
          </h3>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-[#171717]/40 hover:text-[#171717] transition-colors p-0.5 rounded-full hover:bg-neutral-50 cursor-pointer"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-[20px] flex flex-col gap-[16px] bg-white">
          {/* AI Auto-fill Banner */}
          <div className="flex items-center justify-between p-[12px_24px_12px_8px] gap-lg bg-[#F7F7F7] rounded-[8px] shrink-0">
            <div className="flex items-center gap-lg">
              <div className="size-6 rounded-[6.4px] bg-[#7D52F4] flex items-center justify-center shrink-0">
                <Sparkles className="size-3.5 text-[#EFEBFF] fill-[#EFEBFF]" />
              </div>
              <span className="text-[13px] leading-[20px] text-[#171717] tracking-[-0.006em]">
                Upload a passport and AI will auto-fill these fields for you.
              </span>
            </div>
            <button
              type="button"
              onClick={handleUploadClick}
              className="flex items-center gap-xs px-md py-[6px] h-8 bg-[#171717] hover:bg-neutral-800 text-white rounded-[8px] text-[14px] font-medium leading-[20px] tracking-[-0.006em] transition-all cursor-pointer select-none"
            >
              <Upload className="size-3.5 text-white" />
              Upload
            </button>
          </div>

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
