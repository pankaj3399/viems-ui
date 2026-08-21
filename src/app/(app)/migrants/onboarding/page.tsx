"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RiCheckLine,
  RiFlashlightFill,
  RiSaveFill,
  RiShieldFill,
  RiIdCardLine,
  RiUpload2Line,
  RiSendPlane2Line,
  RiFileTextLine,
  RiAtLine,
  RiCalendarCheckLine,
  RiPlaneLine,
  RiFileList3Line,
  RiQuillPenLine,
  RiCalendarLine,
  RiUser3Line,
  RiSearch2Line,
  RiNotification3Line,
  RiBriefcaseLine,
  RiMore2Line,
  RiCloseLine,
  RiAddLine,
  RiAlertFill,
  RiInformationLine,
} from "@remixicon/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Flag } from "@/components/ui/flag";

const ONBOARDING_DRAFT_KEY = "viems_onboarding_draft";

interface ChecklistItem {
  id: string;
  title: string;
  status: "uploaded" | "missing";
  fileName?: string;
}

const defaultChecklistItems: ChecklistItem[] = [
  { id: "passport", title: "Passport", status: "missing" },
  { id: "passport_photo", title: "Passport Photo", status: "missing" },
  { id: "cv", title: "CV / Profile documents", status: "missing" },
  { id: "signed_docs", title: "Migrant signed docs", status: "missing" },
  { id: "employment_contract", title: "Employment contract", status: "missing" },
  { id: "sponsorship_agreement", title: "Sponsorship agreement", status: "missing" },
  { id: "flight_details", title: "Flight / Travel details", status: "missing" },
  { id: "accommodation", title: "Hotel / Accommodation", status: "missing" },
  { id: "boarding_passes", title: "Stamps / Boarding passes", status: "missing" },
  { id: "event_posters", title: "Event posters", status: "missing" },
  { id: "dates_engagements", title: "Dates of engagements", status: "missing" },
  { id: "lead_artist_letter", title: "Lead artist cover letter", status: "missing" },
];

export default function MigrantOnboardingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState<number>(1);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [passportUploaded, setPassportUploaded] = React.useState(false);
  const [cosUploaded, setCosUploaded] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"login" | "register">("login");
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const photoInputRef = React.useRef<HTMLInputElement | null>(null);
  const passportInputRef = React.useRef<HTMLInputElement | null>(null);
  const cosInputRef = React.useRef<HTMLInputElement | null>(null);
  const genericFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const activeChecklistUploadId = React.useRef<string | null>(null);

  // Form State
  const [form, setForm] = React.useState({
    // Personal
    firstName: "Taylor",
    lastName: "Johnson",
    dob: "14 / 06 / 1990",
    gender: "Male",
    maritalStatus: "Married",
    nationality: "United States",
    countryOfBirth: "United States",
    cityOfBirth: "Los Angeles",
    passportNumber: "LQ41932345",
    passportIssueDate: "22 / 11 / 2022",
    passportExpiryDate: "22 / 11 / 2027",

    // Home address
    addressLine1: "742 Evergreen Terrace",
    addressLine2: "Apt 4B",
    city: "Springfield",
    postCode: "97477",
    country: "United States",

    // Contact details
    personalEmail: "taylor.j@email.com",
    mobilePhone: "+44 7700 123456",

    // Emergency contact
    emergencyName: "Morgan Johnson",
    emergencyRelationship: "Spouse",
    emergencyPhone: "+44 7700 987654",
    emergencyEmail: "morgan.j@email.com",

    // Employment
    cosReference: "COS2026-00430",
    employerSponsor: "AX Studios",
    jobTitle: "Singer",
    socCode: "3416",
    startDate: "15 / 03 / 2026",
    endDate: "16 / 03 / 2027",
    contractType: "Full-time",
    hoursPerWeek: "40",
    annualSalary: "£48,000/year",
    workAddressLine1: "Royal Albert Hall",
    workAddressLine2: "Kensington Gore",
    workCity: "London",
    workPostCode: "SW7 2AP",
  });

  const [extraAddresses, setExtraAddresses] = React.useState<
    Array<{ id: string; addressLine1: string; addressLine2: string; city: string; postCode: string }>
  >([]);

  const [checklist, setChecklist] = React.useState<ChecklistItem[]>(() => {
    // initialize sample with some uploaded items to match figma
    return defaultChecklistItems.map((item) => {
      if (item.id === "passport") return { ...item, status: "uploaded", fileName: "passport-scan.pdf" };
      if (item.id === "passport_photo") return { ...item, status: "uploaded", fileName: "avatar.png" };
      if (item.id === "flight_details") return { ...item, status: "uploaded", fileName: "flight-confirmation.pdf" };
      return item;
    });
  });

  // Restore saved draft on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.form) setForm((prev) => ({ ...prev, ...parsed.form }));
        if (parsed.activeStep && parsed.activeStep <= 5) setActiveStep(parsed.activeStep);
        if (parsed.checklist) setChecklist(parsed.checklist);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save draft to localStorage on form/step change
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        ONBOARDING_DRAFT_KEY,
        JSON.stringify({ form, activeStep, checklist })
      );
    } catch {
      // Ignore write errors
    }
  }, [form, activeStep, checklist]);

  const handleChange = (field: string, value: string | null) => {
    setForm((prev) => ({ ...prev, [field]: value ?? "" }));
    setValidationError(null);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setChecklist((prev) =>
        prev.map((c) => (c.id === "passport_photo" ? { ...c, status: "uploaded", fileName: file.name } : c))
      );
      toast.success("Photo uploaded successfully");
    }
  };

  const handlePassportSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPassportUploaded(true);
      setChecklist((prev) =>
        prev.map((c) => (c.id === "passport" ? { ...c, status: "uploaded", fileName: file.name } : c))
      );
      toast.success("Passport uploaded! AI auto-filled your personal details.");
    }
  };

  const handleCosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCosUploaded(true);
      toast.success("CoS Reference uploaded! Sponsorship fields auto-filled.");
    }
  };

  const handleGenericFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeChecklistUploadId.current) {
      const targetId = activeChecklistUploadId.current;
      setChecklist((prev) =>
        prev.map((item) =>
          item.id === targetId ? { ...item, status: "uploaded", fileName: file.name } : item
        )
      );
      toast.success(`Uploaded ${file.name}`);
      activeChecklistUploadId.current = null;
    }
  };

  const triggerChecklistUpload = (id: string) => {
    activeChecklistUploadId.current = id;
    genericFileInputRef.current?.click();
  };

  const handleNextStep = () => {
    if (activeStep === 2) {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        setValidationError("First name and last name are required.");
        toast.error("Please fill in required fields.");
        return;
      }
      if (!form.passportNumber.trim()) {
        setValidationError("Passport number is required.");
        toast.error("Passport number is required.");
        return;
      }
    }
    setValidationError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveStep((prev) => Math.min(5, prev + 1));
  };

  const handlePrevStep = () => {
    setValidationError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = () => {
    try {
      localStorage.removeItem(ONBOARDING_DRAFT_KEY);
    } catch {
      // Ignore removal error
    }
    setIsSubmitted(true);
    toast.success("Application submitted successfully to your sponsor!");
  };

  const uploadedCount = checklist.filter((c) => c.status === "uploaded").length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-text">
      {/* Hidden File Inputs */}
      {/* ui-native-fallback */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        aria-label="Upload photo file"
        className="hidden"
      />
      {/* ui-native-fallback */}
      <input
        type="file"
        ref={passportInputRef}
        onChange={handlePassportSelect}
        accept="image/*,.pdf"
        aria-label="Upload passport file"
        className="hidden"
      />
      {/* ui-native-fallback */}
      <input
        type="file"
        ref={cosInputRef}
        onChange={handleCosSelect}
        accept="image/*,.pdf"
        aria-label="Upload CoS file"
        className="hidden"
      />
      {/* ui-native-fallback */}
      <input
        type="file"
        ref={genericFileInputRef}
        onChange={handleGenericFileUpload}
        accept="image/*,.pdf,.png,.jpg,.jpeg,.mp4"
        aria-label="Upload document file"
        className="hidden"
      />

      {/* Top Header Bar (Matching Figma Dark Navigation Bar) */}
      <header className="w-full bg-[#171717] text-white px-6 lg:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between select-none">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-[#2E2E2E] flex items-center justify-center text-white font-aeonik-medium text-[16px]">
            V
          </div>
          <span className="text-[18px] font-medium text-white font-aeonik-medium tracking-tight">
            Viems
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-input text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Search"
          >
            <RiSearch2Line className="size-5" />
          </Button>
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 rounded-input text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Notifications"
            >
              <RiNotification3Line className="size-5" />
            </Button>
            <span className="absolute top-2 right-2 size-2 rounded-full bg-[#FB3748] ring-2 ring-[#171717]" />
          </div>
          <div
            className="size-8 rounded-full bg-[#CAC0FF] flex items-center justify-center text-[#351A75] font-medium text-[13px] cursor-pointer shadow-x-small"
            onClick={() => setIsAuthModalOpen(true)}
            title="Click to view Account / Sign in options"
          >
            AM
          </div>
        </div>
      </header>

      {/* Stepper Header (Matching Figma Steps: 1 Welcome, 2 Personal details, 3 Employment, 4 Documents, 5 Review & Submit) */}
      {!isSubmitted && (
        <div className="w-full bg-white pt-6 pb-2 border-b border-[#EBEBEB] select-none">
          <div className="max-w-[840px] mx-auto flex items-center justify-between px-4">
            {/* Step 1: Welcome */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveStep(1)}
              aria-current={activeStep === 1 ? "step" : undefined}
              className="flex items-center gap-2 cursor-pointer p-0 h-auto hover:bg-transparent font-sans"
            >
              <div
                className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 transition-colors ${
                  activeStep === 1
                    ? "bg-[#171717] text-white"
                    : activeStep > 1
                    ? "bg-brand-medium text-white"
                    : "bg-[#EBEBEB] text-[#5C5C5C]"
                }`}
              >
                {activeStep > 1 ? <RiCheckLine className="size-3.5 text-white" /> : "1"}
              </div>
              <span
                className={`text-[14px] transition-colors ${
                  activeStep === 1
                    ? "font-medium text-[#171717]"
                    : "hidden sm:inline font-normal text-[#8C8C8C]"
                }`}
              >
                Welcome
              </span>
            </Button>

            {/* Step 2: Personal details */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveStep(2)}
              aria-current={activeStep === 2 ? "step" : undefined}
              className="flex items-center gap-2 cursor-pointer p-0 h-auto hover:bg-transparent font-sans"
            >
              <div
                className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 transition-colors ${
                  activeStep === 2
                    ? "bg-[#171717] text-white"
                    : activeStep > 2
                    ? "bg-brand-medium text-white"
                    : "bg-[#EBEBEB] text-[#5C5C5C]"
                }`}
              >
                {activeStep > 2 ? <RiCheckLine className="size-3.5 text-white" /> : "2"}
              </div>
              <span
                className={`text-[14px] transition-colors ${
                  activeStep === 2
                    ? "font-medium text-[#171717]"
                    : "hidden sm:inline font-normal text-[#8C8C8C]"
                }`}
              >
                Personal details
              </span>
            </Button>

            {/* Step 3: Employment */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveStep(3)}
              aria-current={activeStep === 3 ? "step" : undefined}
              className="flex items-center gap-2 cursor-pointer p-0 h-auto hover:bg-transparent font-sans"
            >
              <div
                className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 transition-colors ${
                  activeStep === 3
                    ? "bg-[#171717] text-white"
                    : activeStep > 3
                    ? "bg-brand-medium text-white"
                    : "bg-[#EBEBEB] text-[#5C5C5C]"
                }`}
              >
                {activeStep > 3 ? <RiCheckLine className="size-3.5 text-white" /> : "3"}
              </div>
              <span
                className={`text-[14px] transition-colors ${
                  activeStep === 3
                    ? "font-medium text-[#171717]"
                    : "hidden sm:inline font-normal text-[#8C8C8C]"
                }`}
              >
                Employment
              </span>
            </Button>

            {/* Step 4: Documents */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveStep(4)}
              aria-current={activeStep === 4 ? "step" : undefined}
              className="flex items-center gap-2 cursor-pointer p-0 h-auto hover:bg-transparent font-sans"
            >
              <div
                className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 transition-colors ${
                  activeStep === 4
                    ? "bg-[#171717] text-white"
                    : activeStep > 4
                    ? "bg-brand-medium text-white"
                    : "bg-[#EBEBEB] text-[#5C5C5C]"
                }`}
              >
                {activeStep > 4 ? <RiCheckLine className="size-3.5 text-white" /> : "4"}
              </div>
              <span
                className={`text-[14px] transition-colors ${
                  activeStep === 4
                    ? "font-medium text-[#171717]"
                    : "hidden sm:inline font-normal text-[#8C8C8C]"
                }`}
              >
                Documents
              </span>
            </Button>

            {/* Step 5: Review & Submit */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveStep(5)}
              aria-current={activeStep === 5 ? "step" : undefined}
              className="flex items-center gap-2 cursor-pointer p-0 h-auto hover:bg-transparent font-sans"
            >
              <div
                className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 transition-colors ${
                  activeStep === 5
                    ? "bg-[#171717] text-white"
                    : "bg-[#EBEBEB] text-[#5C5C5C]"
                }`}
              >
                5
              </div>
              <span
                className={`text-[14px] transition-colors ${
                  activeStep === 5
                    ? "font-medium text-[#171717]"
                    : "hidden sm:inline font-normal text-[#8C8C8C]"
                }`}
              >
                Review &amp; Submit
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[840px] w-full mx-auto flex flex-col gap-6 px-4 sm:px-6 md:px-8 py-8 sm:py-10 bg-white min-h-[calc(100vh-140px)]">
        {/* ========================================================================= */}
        {/* STEP 1: WELCOME LANDING (Cases / Add migrant / Migrant POV)               */}
        {/* ========================================================================= */}
        {activeStep === 1 && !isSubmitted && (
          <div className="w-full flex flex-col items-center justify-center py-4 select-none">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center max-w-[640px] mx-auto">
              <h1 className="text-[32px] sm:text-[40px] leading-[40px] sm:leading-[48px] font-medium text-[#171717] text-center font-aeonik-medium tracking-tight">
                <span className="text-brand-medium">Viems</span> has invited you to complete your visa application
              </h1>
              <p className="text-[15px] text-[#5C5C5C] leading-[24px] max-w-[480px] mx-auto mt-2">
                This should take around 10-15 minutes.
              </p>

              {/* 3 Badges */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-6 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F5] rounded-full">
                  <RiFlashlightFill className="size-3.5 text-[#5C5C5C] shrink-0" />
                  <span className="text-[11px] font-medium text-[#5C5C5C] uppercase tracking-wider">
                    10–15 MINS TO COMPLETE
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F5] rounded-full">
                  <RiSaveFill className="size-3.5 text-[#5C5C5C] shrink-0" />
                  <span className="text-[11px] font-medium text-[#5C5C5C] uppercase tracking-wider">
                    PROGRESS SAVES AUTOMATICALLY
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5F5F5] rounded-full">
                  <RiShieldFill className="size-3.5 text-[#5C5C5C] shrink-0" />
                  <span className="text-[11px] font-medium text-[#5C5C5C] uppercase tracking-wider">
                    ENCRYPTED &amp; PRIVATE
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="h-10 px-6 bg-brand-medium hover:bg-brand-dark text-white text-[14px] font-medium rounded-[10px] transition-all cursor-pointer shadow-x-small"
                >
                  Get started
                </Button>
              </div>
            </div>

            {/* Three steps overview */}
            <div className="w-full flex flex-col items-center gap-6 mt-16">
              <div className="flex flex-col items-center text-center max-w-[640px] mx-auto gap-2">
                <h2 className="text-[28px] sm:text-[36px] leading-[36px] sm:leading-[44px] font-medium text-[#171717] font-aeonik-medium tracking-tight">
                  Three steps; you handle the first two
                </h2>
                <p className="text-[15px] text-[#5C5C5C] leading-[24px] max-w-[560px]">
                  Your sponsor takes over once you submit. You can save and return any time. Nothing is sent until you&apos;re ready.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
                <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col items-start gap-4 border border-[#EBEBEB]">
                  <div className="size-12 rounded-[12px] bg-white shadow-xs flex items-center justify-center shrink-0 border border-[#EBEBEB]">
                    <RiIdCardLine className="size-6 text-[#171717]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                      Your details
                    </h3>
                    <p className="text-[14px] text-[#5C5C5C] leading-[22px]">
                      Fill in personal information from your passport — nationality, expiry, contact details.
                    </p>
                  </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col items-start gap-4 border border-[#EBEBEB]">
                  <div className="size-12 rounded-[12px] bg-white shadow-xs flex items-center justify-center shrink-0 border border-[#EBEBEB]">
                    <RiUpload2Line className="size-6 text-[#171717]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                      Upload documents
                    </h3>
                    <p className="text-[14px] text-[#5C5C5C] leading-[22px]">
                      Upload whatever you have ready now. You can come back to add the rest later — nothing is lost.
                    </p>
                  </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col items-start gap-4 border border-[#EBEBEB]">
                  <div className="size-12 rounded-[12px] bg-white shadow-xs flex items-center justify-center shrink-0 border border-[#EBEBEB]">
                    <RiSendPlane2Line className="size-6 text-[#171717]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                      Submit
                    </h3>
                    <p className="text-[14px] text-[#5C5C5C] leading-[22px]">
                      Review your answers, then send it securely to your sponsor. They&apos;ll take it from there.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gather these before you start */}
            <div className="w-full flex flex-col gap-6 mt-16 max-w-[840px] mx-auto">
              <div className="flex flex-col gap-2">
                <h2 className="text-[28px] sm:text-[36px] leading-[36px] sm:leading-[44px] font-medium text-[#171717] font-aeonik-medium tracking-tight">
                  Gather these before you start
                </h2>
                <p className="text-[15px] text-[#5C5C5C] leading-[24px] max-w-[560px]">
                  Some documents you&apos;ll have already. Others you may need a few minutes to find or generate. Your sponsor handles the rest.
                </p>
              </div>

              {/* Group 1: Have ready */}
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                    Have ready
                  </h3>
                  <span className="text-[14px] text-[#5C5C5C]">
                    2 items (already in your pocket)
                  </span>
                </div>
                <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col gap-4 border border-[#EBEBEB]">
                  <div className="flex items-start gap-3">
                    <RiFileTextLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-medium text-[#171717]">
                        Valid passport
                      </span>
                      <p className="text-[14px] text-[#5C5C5C] leading-[20px]">
                        You will need your passport number, expiry date, and nationality. A colour scan of the bio-data page will be needed in the next step.
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-[#EBEBEB]" />
                  <div className="flex items-start gap-3">
                    <RiAtLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-medium text-[#171717]">
                        Email address and phone number
                      </span>
                      <p className="text-[14px] text-[#5C5C5C] leading-[20px]">
                        We will use your email to send confirmations and your phone as a backup contact. Include your country code.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: You may need to obtain */}
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                    You may need to obtain
                  </h3>
                  <span className="text-[14px] text-[#5C5C5C]">
                    2 items (gotta be ready)
                  </span>
                </div>
                <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col gap-4 border border-[#EBEBEB]">
                  <div className="flex items-start gap-3">
                    <RiCalendarCheckLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-medium text-[#171717]">
                        Posters, schedule, or performance dates
                      </span>
                      <p className="text-[14px] text-[#5C5C5C] leading-[20px]">
                        Event posters, engagement schedules, or booking confirmations showing where you&apos;re performing in the UK.
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-[#EBEBEB]" />
                  <div className="flex items-start gap-3">
                    <RiPlaneLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-medium text-[#171717]">
                        Flight and accommodation
                      </span>
                      <p className="text-[14px] text-[#5C5C5C] leading-[20px]">
                        Booking confirmations for your flights and where you&apos;ll be staying — hotel, tenancy, or a letter from your host.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Your sponsor will provide */}
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                    Your sponsor will provide
                  </h3>
                  <span className="text-[14px] text-[#5C5C5C]">
                    2 items (check your inbox)
                  </span>
                </div>
                <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col gap-4 border border-[#EBEBEB]">
                  <div className="flex items-start gap-3">
                    <RiFileList3Line className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-medium text-[#171717]">
                        Signed declaration &amp; consent forms
                      </span>
                      <p className="text-[14px] text-[#5C5C5C] leading-[20px]">
                        Your sponsor will email these to you. You&apos;ll sign and upload them in the next step. Check your inbox for emails from Viems.
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-[#EBEBEB]" />
                  <div className="flex items-start gap-3">
                    <RiQuillPenLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-medium text-[#171717]">
                        Lead artist cover letter (if applicable)
                      </span>
                      <p className="text-[14px] text-[#5C5C5C] leading-[20px]">
                        If you&apos;re performing with a group, the lead artist may send a short letter confirming your involvement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Let's get your application started */}
            <div className="w-full flex flex-col items-center gap-4 text-center mt-20 mb-8">
              <h2 className="text-[28px] sm:text-[36px] leading-[36px] sm:leading-[44px] font-medium text-[#171717] font-aeonik-medium max-w-[560px] mx-auto tracking-tight">
                Let&apos;s get your application started.
              </h2>
              <p className="text-[15px] text-[#5C5C5C] max-w-[480px] mx-auto">
                Ready when you are
              </p>
              <div className="flex justify-center mt-2">
                <Button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="h-10 px-6 bg-brand-medium hover:bg-brand-dark text-white text-[14px] font-medium rounded-[10px] transition-all cursor-pointer shadow-x-small"
                >
                  Get started
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: PERSONAL DETAILS (Matching media_1787321687402.png)               */}
        {/* ========================================================================= */}
        {activeStep === 2 && !isSubmitted && (
          <div className="flex flex-col gap-6 max-w-[840px] w-full mx-auto">
            <h2 className="text-[24px] font-medium text-[#171717] tracking-tight font-aeonik-medium">
              Personal details
            </h2>

            {validationError && (
              <div className="p-3 bg-error-light border border-error-dark/20 text-error-dark rounded-input text-paragraph-compact">
                {validationError}
              </div>
            )}

            {/* Passport Banner */}
            <div className="bg-[#F0EBFF] rounded-[10px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#E4D9FF]">
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-[6px] bg-[#7D52F4] flex items-center justify-center shrink-0 text-white">
                  <RiFileTextLine className="size-3.5 text-white" />
                </div>
                <span className="text-[14px] font-normal text-[#171717] leading-[20px]">
                  {passportUploaded
                    ? "Passport uploaded! AI auto-filled your personal details below."
                    : "Upload a passport and AI will auto-fill these fields for you."}
                </span>
              </div>
              <Button
                type="button"
                onClick={() => passportInputRef.current?.click()}
                className="w-full sm:w-auto bg-[#7D52F4] hover:bg-[#6C3EE8] text-white text-[13px] font-medium px-4 py-1.5 h-8 rounded-[8px] flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <RiUpload2Line className="size-3.5 text-white" />
                <span>Upload</span>
              </Button>
            </div>

            {/* Photo Upload Card */}
            <div className="bg-[#F7F7F7] rounded-[10px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#EBEBEB]">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-[80px] h-[88px] bg-white border border-dashed border-[#D1D1D1] rounded-[8px] flex items-center justify-center shrink-0 overflow-hidden relative shadow-xs">
                  {photoPreview ? (
                    // ui-native-fallback
                    <img
                      src={photoPreview}
                      alt="Uploaded application photo preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-8 rounded-full border border-[#EBEBEB] bg-white shadow-xs flex items-center justify-center text-[#8C8C8C]">
                      <RiUser3Line className="size-5 text-[#8C8C8C]" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 max-w-[480px]">
                  <span className="text-[14px] font-medium text-[#171717]">Upload photo</span>
                  <p className="text-[13px] font-normal text-[#171717] leading-[18px]">
                    Photo will be used as your official application photo
                  </p>
                  <p className="text-[13px] font-normal text-[#8C8C8C] leading-[18px]">
                    JPG or PNG, min 400 x 514px. Max 10 MB. Plain background, no filters.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => photoInputRef.current?.click()}
                className="w-full sm:w-auto bg-white border border-[#E0E0E0] hover:bg-[#F9F9F9] text-[#171717] text-[13px] font-medium px-4 py-2 h-9 rounded-[8px] shrink-0 shadow-xs cursor-pointer"
              >
                Upload photo
              </Button>
            </div>

            {/* Personal Details Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName" className="text-[13px] font-medium text-[#171717]">
                  First Name <span className="text-error-dark">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName" className="text-[13px] font-medium text-[#171717]">
                  Last Name <span className="text-error-dark">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dob" className="text-[13px] font-medium text-[#171717]">
                  Date of Birth <span className="text-error-dark">*</span>
                </Label>
                <div className="relative">
                  <RiCalendarLine className="size-4 text-[#8C8C8C] absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="dob"
                    type="text"
                    value={form.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    placeholder="DD / MM / YYYY"
                    className="h-10 w-full rounded-[10px] border-[#EBEBEB] bg-white pl-9 pr-3 text-[14px] text-[#171717] placeholder:text-[#8C8C8C] focus-visible:border-brand-medium shadow-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gender" className="text-[13px] font-medium text-[#171717]">
                  Gender
                </Label>
                <Select value={form.gender} onValueChange={(val) => handleChange("gender", val)}>
                  <SelectTrigger id="gender" className="h-10 rounded-[10px] border-[#EBEBEB] bg-white shadow-xs text-[14px]">
                    <SelectValue placeholder="Select gender..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maritalStatus" className="text-[13px] font-medium text-[#171717]">
                  Marital Status
                </Label>
                <Select value={form.maritalStatus} onValueChange={(val) => handleChange("maritalStatus", val)}>
                  <SelectTrigger id="maritalStatus" className="h-10 rounded-[10px] border-[#EBEBEB] bg-white shadow-xs text-[14px]">
                    <SelectValue placeholder="Select marital status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Civil Partnership">Civil Partnership</SelectItem>
                    <SelectItem value="Divorced">Divorced</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cityOfBirth" className="text-[13px] font-medium text-[#171717]">
                  City of Birth
                </Label>
                <Input
                  id="cityOfBirth"
                  type="text"
                  value={form.cityOfBirth}
                  onChange={(e) => handleChange("cityOfBirth", e.target.value)}
                  placeholder="Enter city of birth"
                  className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nationality" className="text-[13px] font-medium text-[#171717]">
                  Nationality
                </Label>
                <Select value={form.nationality} onValueChange={(val) => handleChange("nationality", val)}>
                  <SelectTrigger id="nationality" className="h-10 rounded-[10px] border-[#EBEBEB] bg-white shadow-xs text-[14px]">
                    <SelectValue placeholder="Select country..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="countryOfBirth" className="text-[13px] font-medium text-[#171717]">
                  Country of Birth
                </Label>
                <Select value={form.countryOfBirth} onValueChange={(val) => handleChange("countryOfBirth", val)}>
                  <SelectTrigger id="countryOfBirth" className="h-10 rounded-[10px] border-[#EBEBEB] bg-white shadow-xs text-[14px]">
                    <SelectValue placeholder="Select country..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="passportNumber" className="text-[13px] font-medium text-[#171717]">
                  Passport Number <span className="text-error-dark">*</span>
                </Label>
                <Input
                  id="passportNumber"
                  type="text"
                  value={form.passportNumber}
                  onChange={(e) => handleChange("passportNumber", e.target.value)}
                  placeholder="Select country"
                  className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="passportIssueDate" className="text-[13px] font-medium text-[#171717]">
                  Issue Date
                </Label>
                <div className="relative">
                  <RiCalendarLine className="size-4 text-[#8C8C8C] absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="passportIssueDate"
                    type="text"
                    value={form.passportIssueDate}
                    onChange={(e) => handleChange("passportIssueDate", e.target.value)}
                    placeholder="DD / MM / YYYY"
                    className="h-10 w-full rounded-[10px] border-[#EBEBEB] bg-white pl-9 pr-3 text-[14px] text-[#171717] placeholder:text-[#8C8C8C] focus-visible:border-brand-medium shadow-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="personalEmail" className="text-[13px] font-medium text-[#171717]">
                  Email Address <span className="text-error-dark">*</span>
                </Label>
                <Input
                  id="personalEmail"
                  type="email"
                  value={form.personalEmail}
                  onChange={(e) => handleChange("personalEmail", e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mobilePhone" className="text-[13px] font-medium text-[#171717]">
                  Phone Number
                </Label>
                <Input
                  id="mobilePhone"
                  type="tel"
                  value={form.mobilePhone}
                  onChange={(e) => handleChange("mobilePhone", e.target.value)}
                  placeholder="e.g. +1 555-555-5555"
                  className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-[#EBEBEB] mt-4">
              <Button
                type="button"
                onClick={handlePrevStep}
                className="bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#171717] text-[14px] font-medium px-5 h-9 rounded-[8px] cursor-pointer border-0 transition-all shadow-xs"
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium px-6 h-9 rounded-[8px] cursor-pointer border-0 shadow-xs transition-all"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: EMPLOYMENT & SPONSORSHIP (Matching media_1787321666857.png)        */}
        {/* ========================================================================= */}
        {activeStep === 3 && !isSubmitted && (
          <div className="flex flex-col gap-6 max-w-[840px] w-full mx-auto">
            <h2 className="text-[24px] font-medium text-[#171717] tracking-tight font-aeonik-medium">
              Employment &amp; Sponsorship
            </h2>

            {/* CoS Banner */}
            <div className="bg-[#F0EBFF] rounded-[10px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#E4D9FF]">
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-[6px] bg-[#7D52F4] flex items-center justify-center shrink-0 text-white">
                  <RiBriefcaseLine className="size-3.5 text-white" />
                </div>
                <span className="text-[14px] font-normal text-[#171717] leading-[20px]">
                  {cosUploaded
                    ? "CoS reference uploaded! Sponsorship fields auto-filled below."
                    : "Upload the CoS reference and AI will auto-fill these fields for you."}
                </span>
              </div>
              <Button
                type="button"
                onClick={() => cosInputRef.current?.click()}
                className="w-full sm:w-auto bg-[#7D52F4] hover:bg-[#6C3EE8] text-white text-[13px] font-medium px-4 py-1.5 h-8 rounded-[8px] flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <RiUpload2Line className="size-3.5 text-white" />
                <span>Upload</span>
              </Button>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cosReference" className="text-[13px] font-medium text-[#171717]">
                CoS Reference (if available)
              </Label>
              <Input
                id="cosReference"
                type="text"
                value={form.cosReference}
                onChange={(e) => handleChange("cosReference", e.target.value)}
                placeholder="e.g. COS2026-00430"
                className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="employerSponsor" className="text-[13px] font-medium text-[#171717] flex items-center gap-1">
                <span>Employer / Sponsor</span>
                <RiInformationLine className="size-3.5 text-[#8C8C8C]" />
              </Label>
              <Input
                id="employerSponsor"
                type="text"
                value={form.employerSponsor}
                onChange={(e) => handleChange("employerSponsor", e.target.value)}
                placeholder="Enter employer or sponsor name"
                className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jobTitle" className="text-[13px] font-medium text-[#171717]">
                Job Title
              </Label>
              <Select value={form.jobTitle} onValueChange={(val) => handleChange("jobTitle", val)}>
                <SelectTrigger id="jobTitle" className="h-10 rounded-[10px] border-[#EBEBEB] bg-white shadow-xs text-[14px]">
                  <SelectValue placeholder="Select job title..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Singer">Singer</SelectItem>
                  <SelectItem value="Musician">Musician</SelectItem>
                  <SelectItem value="Dancer">Dancer</SelectItem>
                  <SelectItem value="Choreographer">Choreographer</SelectItem>
                  <SelectItem value="Actor">Actor</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                  <SelectItem value="Producer">Producer</SelectItem>
                  <SelectItem value="Sound Engineer">Sound Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="startDate" className="text-[13px] font-medium text-[#171717]">
                  Start Date
                </Label>
                <div className="relative">
                  <RiCalendarLine className="size-4 text-[#8C8C8C] absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="startDate"
                    type="text"
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    placeholder="15 / 03 / 2026"
                    className="h-10 w-full rounded-[10px] border-[#EBEBEB] bg-white pl-9 pr-3 text-[14px] text-[#171717] placeholder:text-[#8C8C8C] focus-visible:border-brand-medium shadow-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="endDate" className="text-[13px] font-medium text-[#171717]">
                  End Date
                </Label>
                <div className="relative">
                  <RiCalendarLine className="size-4 text-[#8C8C8C] absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="endDate"
                    type="text"
                    value={form.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    placeholder="16 / 03 / 2027"
                    className="h-10 w-full rounded-[10px] border-[#EBEBEB] bg-white pl-9 pr-3 text-[14px] text-[#171717] placeholder:text-[#8C8C8C] focus-visible:border-brand-medium shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contractType" className="text-[13px] font-medium text-[#171717]">
                  Contract
                </Label>
                <Select value={form.contractType} onValueChange={(val) => handleChange("contractType", val)}>
                  <SelectTrigger id="contractType" className="h-10 rounded-[10px] border-[#EBEBEB] bg-white shadow-xs text-[14px]">
                    <SelectValue placeholder="Contract..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Fixed-term">Fixed-term</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="hoursPerWeek" className="text-[13px] font-medium text-[#171717] flex items-center gap-1">
                  <span>Hours/Week</span>
                  <RiInformationLine className="size-3.5 text-[#8C8C8C]" />
                </Label>
                <Input
                  id="hoursPerWeek"
                  type="text"
                  value={form.hoursPerWeek}
                  onChange={(e) => handleChange("hoursPerWeek", e.target.value)}
                  placeholder="40"
                  className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="annualSalary" className="text-[13px] font-medium text-[#171717] flex items-center gap-1">
                  <span>Annual Salary</span>
                  <RiInformationLine className="size-3.5 text-[#8C8C8C]" />
                </Label>
                <Input
                  id="annualSalary"
                  type="text"
                  value={form.annualSalary}
                  onChange={(e) => handleChange("annualSalary", e.target.value)}
                  placeholder="€"
                  className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="workAddressLine1" className="text-[13px] font-medium text-[#171717]">
                Address
              </Label>
              <Input
                id="workAddressLine1"
                type="text"
                value={form.workAddressLine1}
                onChange={(e) => handleChange("workAddressLine1", e.target.value)}
                placeholder="Royal Albert Hall"
                className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="workAddressLine2" className="text-[13px] font-medium text-[#171717] flex items-center justify-between">
                <span>Address Line 2</span>
                <span className="text-[12px] text-[#8C8C8C] font-normal">(Optional)</span>
              </Label>
              <Input
                id="workAddressLine2"
                type="text"
                value={form.workAddressLine2}
                onChange={(e) => handleChange("workAddressLine2", e.target.value)}
                placeholder=""
                className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="workCity" className="text-[13px] font-medium text-[#171717]">
                  City
                </Label>
                <Input
                  id="workCity"
                  type="text"
                  value={form.workCity}
                  onChange={(e) => handleChange("workCity", e.target.value)}
                  placeholder="London"
                  className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="workPostCode" className="text-[13px] font-medium text-[#171717]">
                  Post Code
                </Label>
                <Input
                  id="workPostCode"
                  type="text"
                  value={form.workPostCode}
                  onChange={(e) => handleChange("workPostCode", e.target.value)}
                  placeholder="SW7 2AP"
                  className="h-10 rounded-[10px] border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus-visible:border-brand-medium shadow-xs"
                />
              </div>
            </div>

            {/* Extra Addresses */}
            {extraAddresses.map((addr, idx) => (
              <div key={addr.id} className="p-4 bg-[#F7F7F7] rounded-[12px] border border-[#EBEBEB] flex flex-col gap-4 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setExtraAddresses((prev) => prev.filter((a) => a.id !== addr.id))}
                  className="absolute top-2 right-2 size-7 text-[#8C8C8C] hover:text-error-dark"
                  aria-label="Remove address"
                >
                  <RiCloseLine className="size-4" />
                </Button>
                <h4 className="text-[13px] font-semibold text-[#171717]">Additional Work Address #{idx + 1}</h4>
                <Input
                  placeholder="Address Line 1"
                  value={addr.addressLine1}
                  onChange={(e) =>
                    setExtraAddresses((prev) =>
                      prev.map((a) => (a.id === addr.id ? { ...a, addressLine1: e.target.value } : a))
                    )
                  }
                  className="h-10 rounded-[10px] border-[#EBEBEB] bg-white text-[14px]"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="City"
                    value={addr.city}
                    onChange={(e) =>
                      setExtraAddresses((prev) =>
                        prev.map((a) => (a.id === addr.id ? { ...a, city: e.target.value } : a))
                      )
                    }
                    className="h-10 rounded-[10px] border-[#EBEBEB] bg-white text-[14px]"
                  />
                  <Input
                    placeholder="Postcode"
                    value={addr.postCode}
                    onChange={(e) =>
                      setExtraAddresses((prev) =>
                        prev.map((a) => (a.id === addr.id ? { ...a, postCode: e.target.value } : a))
                      )
                    }
                    className="h-10 rounded-[10px] border-[#EBEBEB] bg-white text-[14px]"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setExtraAddresses((prev) => [
                  ...prev,
                  { id: String(Date.now()), addressLine1: "", addressLine2: "", city: "", postCode: "" },
                ])
              }
              className="w-full h-11 border-dashed border-[#D1D1D1] hover:border-brand-medium text-brand-medium hover:text-brand-dark bg-white hover:bg-[#F9F9F9] rounded-[10px] text-[14px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RiAddLine className="size-4" />
              <span>Add another address</span>
            </Button>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-[#EBEBEB] mt-4">
              <Button
                type="button"
                onClick={handlePrevStep}
                className="bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#171717] text-[14px] font-medium px-5 h-9 rounded-[8px] cursor-pointer border-0 transition-all shadow-xs"
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium px-6 h-9 rounded-[8px] cursor-pointer border-0 shadow-xs transition-all"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: DOCUMENTS & CHECKLIST (Matching media_1787321674670.png)           */}
        {/* ========================================================================= */}
        {activeStep === 4 && !isSubmitted && (
          <div className="flex flex-col gap-6 max-w-[840px] w-full mx-auto">
            <h2 className="text-[24px] font-medium text-[#171717] tracking-tight font-aeonik-medium">
              Documents
            </h2>

            {/* Drag & Drop Dropzone */}
            <div
              onClick={() => genericFileInputRef.current?.click()}
              className="w-full bg-[#F7F7F7] rounded-[16px] p-6 border border-[#EBEBEB] cursor-pointer"
            >
              <div className="w-full border border-dashed border-[#D1D1D1] rounded-[12px] p-8 flex flex-col items-center justify-center text-center gap-2 bg-[#FAFAFA] hover:bg-white transition-colors">
                <div className="size-10 rounded-[10px] bg-[#F0EBFF] flex items-center justify-center text-[#7D52F4] shadow-xs">
                  <RiUpload2Line className="size-5" />
                </div>
                <span className="text-[14px] font-medium text-[#171717]">
                  Choose a file or drag &amp; drop it here.
                </span>
                <span className="text-[12px] text-[#8C8C8C]">
                  JPEG, PNG, PDF, and MP4 formats, up to 50 MB.
                </span>
              </div>
            </div>

            {/* AI Auto-fill Banner */}
            <div className="bg-[#F0EBFF] rounded-[10px] p-4 flex items-start gap-3 border border-[#E4D9FF]">
              <div className="size-6 rounded-[6px] bg-[#7D52F4] flex items-center justify-center shrink-0 text-white mt-0.5">
                <RiFileList3Line className="size-3.5 text-white" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-medium text-[#171717]">AI auto-fill enabled</span>
                <p className="text-[12px] font-normal text-[#5C5C5C] leading-[18px]">
                  Drop your files in and AI categorises them, extracts key details, updates the profile, auto-fills the document checklist below, and flags anything missing or mismatched.
                </p>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="flex flex-col gap-3 mt-2">
              <h3 className="text-[18px] font-medium text-[#171717] font-aeonik-medium">Document Checklist</h3>

              <div className="flex flex-col gap-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 px-4 bg-[#F7F7F7] hover:bg-[#F2F2F2] rounded-[8px] border border-[#F0F0F0] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`size-2 rounded-full shrink-0 ${
                          item.status === "uploaded" ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-[#171717]">{item.title}</span>
                        {item.fileName && (
                          <span className="text-[12px] text-[#8C8C8C]">{item.fileName}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "uploaded" ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => triggerChecklistUpload(item.id)}
                          className="size-8 rounded-compact text-[#8C8C8C] hover:text-[#171717] hover:bg-white"
                          aria-label={`Options for ${item.title}`}
                        >
                          <RiMore2Line className="size-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => triggerChecklistUpload(item.id)}
                          className="h-8 px-3 bg-white border border-[#E0E0E0] hover:bg-[#F9F9F9] text-[#171717] text-[12px] font-medium rounded-[6px] shadow-xs"
                        >
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-[#EBEBEB] mt-4">
              <Button
                type="button"
                onClick={handlePrevStep}
                className="bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#171717] text-[14px] font-medium px-5 h-9 rounded-[8px] cursor-pointer border-0 transition-all shadow-xs"
              >
                Back
              </Button>

              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleNextStep}
                  className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] p-0 h-auto"
                >
                  Skip for now
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium px-6 h-9 rounded-[8px] cursor-pointer border-0 shadow-xs transition-all"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: REVIEW & SUBMIT (Matching media_1787321678256.png)                  */}
        {/* ========================================================================= */}
        {activeStep === 5 && !isSubmitted && (
          <div className="flex flex-col gap-6 max-w-[840px] w-full mx-auto">
            <h2 className="text-[24px] font-medium text-[#171717] tracking-tight font-aeonik-medium">
              Review details
            </h2>

            {/* Section: CASE */}
            <div className="bg-[#F7F7F7] rounded-[12px] p-6 flex flex-col gap-4 border border-[#EBEBEB]">
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-semibold text-[#171717] tracking-wider uppercase">
                  CASE
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveStep(1)}
                  className="text-[13px] text-[#7D52F4] hover:underline p-0 h-auto font-medium hover:bg-transparent"
                >
                  Edit
                </Button>
              </div>
              <div className="flex flex-col gap-3 text-[14px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Case Type</span>
                  <span className="font-medium text-[#171717]">Music</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Visa Type</span>
                  <span className="font-medium text-[#171717]">Creative Worker</span>
                </div>
              </div>
            </div>

            {/* Section: PERSONAL DETAILS */}
            <div className="bg-[#F7F7F7] rounded-[12px] p-6 flex flex-col gap-4 border border-[#EBEBEB]">
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-semibold text-[#171717] tracking-wider uppercase">
                  PERSONAL DETAILS
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveStep(2)}
                  className="text-[13px] text-[#7D52F4] hover:underline p-0 h-auto font-medium hover:bg-transparent"
                >
                  Edit
                </Button>
              </div>
              <div className="flex flex-col gap-3 text-[14px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Full Name</span>
                  <span className="font-medium text-[#171717]">{form.firstName} {form.lastName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Date of Birth</span>
                  <span className="font-medium text-[#171717]">{form.dob}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Gender</span>
                  <span className="font-medium text-[#171717]">{form.gender}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Marital Status</span>
                  <span className="font-medium text-[#171717]">{form.maritalStatus}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Nationality</span>
                  <div className="flex items-center gap-1.5 font-medium text-[#171717]">
                    <Flag country={form.nationality} className="size-4" />
                    <span>US</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Country of Birth</span>
                  <div className="flex items-center gap-1.5 font-medium text-[#171717]">
                    <Flag country={form.countryOfBirth} className="size-4" />
                    <span>US</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Passport Number</span>
                  <span className="font-medium text-[#171717]">{form.passportNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Issue Date</span>
                  <span className="font-medium text-[#171717]">{form.passportIssueDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Expiry Date</span>
                  <span className="font-medium text-[#171717]">{form.passportExpiryDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Email</span>
                  <span className="font-medium text-[#171717]">{form.personalEmail}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Phone</span>
                  <span className="font-medium text-[#171717]">{form.mobilePhone}</span>
                </div>
              </div>
            </div>

            {/* Section: EMPLOYMENT */}
            <div className="bg-[#F7F7F7] rounded-[12px] p-6 flex flex-col gap-4 border border-[#EBEBEB]">
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-semibold text-[#171717] tracking-wider uppercase">
                  EMPLOYMENT
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveStep(3)}
                  className="text-[13px] text-[#7D52F4] hover:underline p-0 h-auto font-medium hover:bg-transparent"
                >
                  Edit
                </Button>
              </div>
              <div className="flex flex-col gap-3 text-[14px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Employer / Sponsor</span>
                  <span className="font-medium text-[#171717]">{form.employerSponsor}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Job Title</span>
                  <span className="font-medium text-[#171717]">{form.jobTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">SOC Code</span>
                  <span className="font-medium text-[#171717]">{form.socCode} (Arts/Entertainment)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Start Date</span>
                  <span className="font-medium text-[#171717]">{form.startDate || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Contract</span>
                  <span className="font-medium text-[#171717]">{form.contractType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Hours/Week</span>
                  <span className="font-medium text-[#171717]">{form.hoursPerWeek}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Annual Salary</span>
                  <span className="font-medium text-[#171717]">{form.annualSalary}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">Address</span>
                  <span className="font-medium text-[#171717]">{form.workAddressLine1}, {form.workCity}, {form.workPostCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5C5C5C]">CoS Reference</span>
                  <span className="font-medium text-[#171717]">{form.cosReference}</span>
                </div>
              </div>
            </div>

            {/* Section: DOCUMENTS (CASE) */}
            <div className="bg-[#F7F7F7] rounded-[12px] p-6 flex flex-col gap-4 border border-[#EBEBEB]">
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-semibold text-[#171717] tracking-wider uppercase">
                  CASE
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveStep(4)}
                  className="text-[13px] text-[#7D52F4] hover:underline p-0 h-auto font-medium hover:bg-transparent"
                >
                  Edit
                </Button>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#5C5C5C]">Uploaded Files</span>
                <span className="font-medium text-[#171717]">{uploadedCount} of {checklist.length}</span>
              </div>
            </div>

            {/* Incomplete details warning alert */}
            {uploadedCount < checklist.length && (
              <div className="p-4 bg-[#FFF8E6] border border-[#FFE7A3] rounded-[10px] flex items-start gap-3 text-[#946300]">
                <RiAlertFill className="size-5 text-[#946300] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-[#946300]">Some details are incomplete</span>
                  <p className="text-[13px] text-[#946300] leading-normal mt-0.5">
                    You can still create the case and complete these later. We recommend uploading at least passport, CV, and contract.
                  </p>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-[#EBEBEB] mt-4">
              <Button
                type="button"
                onClick={handlePrevStep}
                className="bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#171717] text-[14px] font-medium px-5 h-9 rounded-[8px] cursor-pointer border-0 transition-all shadow-xs"
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={handleFinalSubmit}
                className="bg-[#7D52F4] hover:bg-[#6C3EE8] text-white text-[14px] font-medium px-6 py-2 h-9 rounded-[8px] cursor-pointer border-0 shadow-xs transition-all"
              >
                Create case
              </Button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBMITTED SUCCESS SCREEN                                                  */}
        {/* ========================================================================= */}
        {isSubmitted && (
          <div className="w-full flex flex-col items-center text-center py-12 px-4 gap-6 select-none animate-in fade-in zoom-in-95 duration-200">
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-x-small">
              <RiCheckLine className="size-8 stroke-[2.5]" />
            </div>
            <div className="flex flex-col gap-2 max-w-[480px]">
              <h2 className="text-h5-title font-semibold text-neutral-900 font-aeonik-medium">
                Application submitted to your sponsor
              </h2>
              <p className="text-paragraph-md text-neutral-500 leading-normal">
                Thank you, {form.firstName}! Your details and uploaded documents have been sent securely to <strong className="text-neutral-800">{form.employerSponsor || "your sponsor"}</strong>. You will receive an email confirmation shortly.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setActiveStep(1);
              }}
              className="h-10 px-6 bg-brand-medium hover:bg-brand-dark text-white rounded-button text-label-sm font-medium shadow-x-small"
            >
              Return to overview
            </Button>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* AUTH MODAL: LOG IN & CREATE ACCOUNT (Figma Add new migrant - Log in)      */}
      {/* ========================================================================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-[440px] bg-card border border-border shadow-regular-medium rounded-card p-6 flex flex-col gap-6">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 size-7 rounded-compact text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              aria-label="Close"
            >
              <RiCloseLine className="size-4" />
            </Button>

            {/* Segmented Control */}
            <div className="w-[296px] h-9 p-1 bg-neutral-100 rounded-full mx-auto flex items-center gap-1 select-none">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAuthMode("register")}
                className={`flex-1 h-7 rounded-full text-label-xs font-medium transition-all ${
                  authMode === "register"
                    ? "bg-brand-medium text-white shadow-x-small hover:bg-brand-medium hover:text-white"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-transparent"
                }`}
              >
                Create account
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAuthMode("login")}
                className={`flex-1 h-7 rounded-full text-label-xs font-medium transition-all ${
                  authMode === "login"
                    ? "bg-brand-medium text-white shadow-x-small hover:bg-brand-medium hover:text-white"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-transparent"
                }`}
              >
                Log in
              </Button>
            </div>

            {/* Title & Subtitle */}
            <div className="flex flex-col items-center text-center gap-1">
              <h3 className="text-h5-title font-semibold text-neutral-900">
                {authMode === "login" ? "Log in to Viems" : "Create an account"}
              </h3>
              <p className="text-paragraph-sm text-neutral-500">
                Join Viems and get started today.
              </p>
            </div>

            {/* Social Logins */}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => toast.info("Apple Sign-in simulated")}
                className="flex-1 h-10 bg-black hover:bg-neutral-900 text-white rounded-button text-label-sm font-medium flex items-center justify-center gap-2 border-0 shadow-x-small"
              >
                <svg width="14" height="16" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.2005 7.96903C10.2216 10.239 12.1919 10.9944 12.2137 11.004C12.1971 11.0573 11.8989 12.0805 11.1757 13.1374C10.5505 14.0512 9.90163 14.9616 8.87947 14.9805C7.87509 14.999 7.55213 14.3849 6.40384 14.3849C5.25591 14.3849 4.89708 14.9616 3.94633 14.999C2.95968 15.0364 2.20834 14.0109 1.57798 13.1005C0.289852 11.2382 -0.694542 7.83808 0.62725 5.54296C1.28389 4.40319 2.45735 3.68144 3.73104 3.66293C4.6999 3.64445 5.61436 4.31475 6.20666 4.31475C6.79859 4.31475 7.90986 3.50866 9.07812 3.62704C9.5672 3.6474 10.9401 3.8246 11.8216 5.11495C11.7506 5.15898 10.1835 6.07125 10.2005 7.96903ZM8.31293 2.39498C8.83675 1.76092 9.1893 0.878249 9.09312 0C8.33808 0.0303463 7.42507 0.503138 6.88349 1.13685C6.39814 1.69803 5.97308 2.59623 6.08777 3.4571C6.92935 3.52221 7.78909 3.02944 8.31293 2.39498Z" fill="white"/>
                </svg>
                <span>{authMode === "login" ? "Log In" : "Sign Up"} with Apple</span>
              </Button>

              <Button
                type="button"
                onClick={() => toast.info("Google Sign-in simulated")}
                className="flex-1 h-10 bg-[#F14336] hover:bg-[#d83529] text-white rounded-button text-label-sm font-medium flex items-center justify-center gap-2 border-0 shadow-x-small"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.1531 8.63647V11.541H14.2718C14.091 12.4751 13.5482 13.2661 12.7342 13.7979L15.218 15.6866C16.6651 14.3775 17.5 12.4547 17.5 10.1706C17.5 9.63884 17.4513 9.12742 17.3609 8.63656L10.1531 8.63647Z" fill="white"/>
                  <path d="M3.32103 6.63867C2.79926 7.64773 2.50012 8.78639 2.50012 10C2.50012 11.2136 2.79926 12.3523 3.32103 13.3613C3.32103 13.3681 5.86747 11.425 5.86747 11.425C5.71441 10.975 5.62394 10.4977 5.62394 9.99993C5.62394 9.50214 5.71441 9.02489 5.86747 8.57489L3.32103 6.63867Z" fill="white"/>
                  <path d="M10.153 5.48638C11.2801 5.48638 12.2819 5.86819 13.082 6.60457L15.2736 4.45685C13.9447 3.24323 12.2194 2.5 10.153 2.5C7.16135 2.5 4.5802 4.1841 3.32092 6.63866L5.86728 8.57504C6.47254 6.80229 8.1632 5.48638 10.153 5.48638Z" fill="white"/>
                  <path d="M5.86399 11.4277L5.30381 11.848L3.32092 13.3616C4.5802 15.8093 7.1612 17.5003 10.1528 17.5003C12.2191 17.5003 13.9515 16.8321 15.2178 15.6866L12.734 13.798C12.0522 14.248 11.1825 14.5207 10.1528 14.5207C8.16304 14.5207 6.47245 13.2048 5.86712 11.4321L5.86399 11.4277Z" fill="white"/>
                </svg>
                <span>{authMode === "login" ? "Log In" : "Sign Up"} with Google</span>
              </Button>
            </div>

            {/* OR Separator */}
            <div className="flex items-center gap-2 text-neutral-400 text-label-xs font-semibold select-none">
              <div className="h-[1px] bg-neutral-200 flex-1" />
              <span>OR</span>
              <div className="h-[1px] bg-neutral-200 flex-1" />
            </div>

            {/* Email & Password Fields */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="authEmail" className="text-label-sm font-medium text-neutral-900">
                  Email Address
                </Label>
                <div className="relative">
                  <RiAtLine className="size-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                  <Input
                    id="authEmail"
                    type="email"
                    placeholder="name@company.com"
                    defaultValue={form.personalEmail}
                    className="pl-9 h-10 rounded-input border-neutral-200 bg-card text-paragraph-sm shadow-x-small"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="authPassword" className="text-label-sm font-medium text-neutral-900">
                  Password
                </Label>
                <Input
                  id="authPassword"
                  type="password"
                  placeholder="••••••••"
                  className="h-10 rounded-input border-neutral-200 bg-card text-paragraph-sm shadow-x-small"
                />
              </div>

              {authMode === "login" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox id="authKeep" className="size-4 rounded-compact" />
                    <Label htmlFor="authKeep" className="text-label-sm font-normal text-neutral-600 cursor-pointer">
                      Keep me logged in
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => toast.info("Password reset instructions sent.")}
                    className="text-label-sm text-brand-medium hover:text-brand-dark p-0 h-auto font-medium"
                  >
                    Forgot password?
                  </Button>
                </div>
              )}

              <Button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  toast.success(authMode === "login" ? "Logged in successfully!" : "Account created successfully!");
                }}
                className="w-full h-10 bg-brand-medium hover:bg-brand-dark text-white rounded-button text-label-sm font-medium shadow-x-small mt-2"
              >
                {authMode === "login" ? "Log In" : "Create account"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
