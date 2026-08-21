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
  RiArrowDownSLine,
  RiUser3Line,
} from "@remixicon/react";
import { toast } from "sonner";

const ONBOARDING_DRAFT_KEY = "viems_onboarding_draft";

export default function MigrantOnboardingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState<number>(1);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [passportUploaded, setPassportUploaded] = React.useState(false);

  const photoInputRef = React.useRef<HTMLInputElement | null>(null);
  const passportInputRef = React.useRef<HTMLInputElement | null>(null);

  // Form State for User View
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    countryOfBirth: "",
    passportNumber: "",
    passportIssueDate: "",
    personalEmail: "",
    mobilePhone: "",
  });

  // Restore saved draft on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(ONBOARDING_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.form) setForm((prev) => ({ ...prev, ...parsed.form }));
        if (parsed.activeStep && parsed.activeStep <= 2) setActiveStep(parsed.activeStep);
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
        JSON.stringify({ form, activeStep })
      );
    } catch {
      // Ignore write errors
    }
  }, [form, activeStep]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      toast.success("Photo uploaded successfully");
    }
  };

  const handlePassportSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPassportUploaded(true);
      toast.success("Passport uploaded for AI parsing");
    }
  };

  const handleNextStep2 = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setValidationError("First name and last name are required.");
      return;
    }
    if (!form.dob.trim()) {
      setValidationError("Date of birth is required.");
      return;
    }
    if (!form.passportNumber.trim()) {
      setValidationError("Passport number is required.");
      return;
    }
    if (!form.personalEmail.trim()) {
      setValidationError("Email address is required.");
      return;
    }

    setValidationError(null);
    toast.success("Personal details saved successfully.");
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col font-sans">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={photoInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        aria-label="Upload photo file"
        className="hidden"
      />
      <input
        type="file"
        ref={passportInputRef}
        onChange={handlePassportSelect}
        accept="image/*,.pdf"
        aria-label="Upload passport file"
        className="hidden"
      />

      {/* User View Header */}
      <header className="w-full border-b border-[#EBEBEB] bg-white sticky top-0 z-30 px-8 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-[#171717] flex items-center justify-center text-white font-aeonik-medium text-[16px]">
              V
            </div>
            <span className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
              Viems
            </span>
          </div>

          <div className="size-9 rounded-full bg-[#CAC0FF] flex items-center justify-center text-[#351A75] font-medium text-[14px]">
            AM
          </div>
        </div>
      </header>

      {/* Stepper Header (User View) */}
      <div className="w-full bg-[#F7F7F7] pt-6 pb-4 border-b border-[#EBEBEB] select-none">
        <div className="max-w-[728px] mx-auto flex items-center justify-between px-4">
          {/* Step 1: Welcome */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            aria-current={activeStep === 1 ? "step" : undefined}
            className="flex items-center gap-xs cursor-pointer border-0 bg-transparent p-0"
          >
            <div
              className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 ${
                activeStep === 1
                  ? "bg-[#171717] text-white"
                  : activeStep > 1
                  ? "bg-[#7D52F4] text-white"
                  : "bg-[#EBEBEB] text-[#5C5C5C]"
              }`}
            >
              {activeStep > 1 ? <RiCheckLine className="size-3.5 text-white" /> : "1"}
            </div>
            <span
              className={`text-[14px] font-medium ${
                activeStep === 1 ? "text-[#171717]" : "text-[#5C5C5C]"
              }`}
            >
              Welcome
            </span>
          </button>

          <div className="h-[1px] w-8 bg-[#EBEBEB]" />

          {/* Step 2: Personal details */}
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            aria-current={activeStep === 2 ? "step" : undefined}
            className="flex items-center gap-xs cursor-pointer border-0 bg-transparent p-0"
          >
            <div
              className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 ${
                activeStep === 2
                  ? "bg-[#171717] text-white"
                  : activeStep > 2
                  ? "bg-[#7D52F4] text-white"
                  : "bg-[#EBEBEB] text-[#5C5C5C]"
              }`}
            >
              {activeStep > 2 ? <RiCheckLine className="size-3.5 text-white" /> : "2"}
            </div>
            <span
              className={`text-[14px] font-medium ${
                activeStep === 2 ? "text-[#171717]" : "text-[#5C5C5C]"
              }`}
            >
              Personal details
            </span>
          </button>

          <div className="h-[1px] w-8 bg-[#EBEBEB]" />

          {/* Step 3: Employment (Disabled until implemented) */}
          <button
            type="button"
            disabled
            className="flex items-center gap-xs border-0 bg-transparent p-0 opacity-50 cursor-not-allowed"
          >
            <div className="size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 bg-[#EBEBEB] text-[#5C5C5C]">
              3
            </div>
            <span className="text-[14px] font-normal text-[#5C5C5C]">Employment</span>
          </button>

          <div className="h-[1px] w-8 bg-[#EBEBEB]" />

          {/* Step 4: Documents (Disabled until implemented) */}
          <button
            type="button"
            disabled
            className="flex items-center gap-xs border-0 bg-transparent p-0 opacity-50 cursor-not-allowed"
          >
            <div className="size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 bg-[#EBEBEB] text-[#5C5C5C]">
              4
            </div>
            <span className="text-[14px] font-normal text-[#5C5C5C]">Documents</span>
          </button>

          <div className="h-[1px] w-8 bg-[#EBEBEB]" />

          {/* Step 5: Review & Submit (Disabled until implemented) */}
          <button
            type="button"
            disabled
            className="flex items-center gap-xs border-0 bg-transparent p-0 opacity-50 cursor-not-allowed"
          >
            <div className="size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 bg-[#EBEBEB] text-[#5C5C5C]">
              5
            </div>
            <span className="text-[14px] font-normal text-[#5C5C5C]">Review &amp; Submit</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-[768px] w-full mx-auto flex flex-col gap-6 px-8 py-8 bg-white rounded-[16px] shadow-x-small border border-neutral-200/20 my-6">
        {activeStep !== 1 && (
          <h2 className="text-[20px] font-medium text-[#171717] tracking-[-0.006em] font-aeonik-medium">
            Personal details
          </h2>
        )}

        {/* STEP 1: WELCOME LANDING */}
        {activeStep === 1 && (
          <div className="w-full flex flex-col items-center justify-center py-2 select-none gap-12">
            <div className="flex flex-col items-center text-center max-w-[586px] mx-auto">
              <h1 className="text-[40px] leading-[44px] font-medium text-[#7D52F4] text-center font-aeonik-medium tracking-[-0.01em]">
                Viems has invited you to complete your visa application
              </h1>
              <p className="text-[16px] font-normal text-[#5C5C5C] leading-[24px] tracking-[-0.011em] max-w-[446px] mx-auto mt-3">
                This should take around 10-15 minutes.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-[11px] mt-6 mb-6">
                <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#F7F7F7] rounded-full">
                  <RiFlashlightFill className="size-4 text-[#7B7B7B] shrink-0" />
                  <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em] leading-[12px]">
                    10–15 MINS TO COMPLETE
                  </span>
                </div>

                <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#F7F7F7] rounded-full">
                  <RiSaveFill className="size-4 text-[#7B7B7B] shrink-0" />
                  <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em] leading-[12px]">
                    PROGRESS SAVES AUTOMATICALLY
                  </span>
                </div>

                <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#F7F7F7] rounded-full">
                  <RiShieldFill className="size-4 text-[#7B7B7B] shrink-0" />
                  <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em] leading-[12px]">
                    ENCRYPTED &amp; PRIVATE
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="h-[40px] px-[20px] bg-[#7D52F4] hover:bg-[#6836E6] text-white text-[14px] font-medium rounded-[10px] transition-all cursor-pointer border-0 shadow-x-small flex items-center justify-center"
                >
                  Get started
                </button>
              </div>
            </div>

            {/* Three steps overview */}
            <div className="w-full flex flex-col items-center gap-6">
              <div className="flex flex-col items-center text-center max-w-[586px] mx-auto gap-2">
                <h2 className="text-[40px] leading-[44px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
                  Three steps; you handle the first two
                </h2>
                <p className="text-[16px] leading-[24px] font-normal text-[#5C5C5C] tracking-[-0.011em]">
                  Your sponsor takes over once you submit. You can save and return any time. Nothing is sent until you&apos;re ready.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-[728px]">
                <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col items-start gap-6">
                  <div className="w-[52px] h-[52px] rounded-[12px] bg-white shadow-[0px_3px_3px_-1.5px_rgba(0,0,0,0.04),0px_1px_1px_-0.5px_rgba(0,0,0,0.04),0px_0px_0px_1px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0 border border-neutral-200/50">
                    <RiIdCardLine className="size-8 text-[#171717]" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                      Your details
                    </h3>
                    <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                      Fill in personal information from your passport — nationality, expiry, contact details.
                    </p>
                  </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col items-start gap-6">
                  <div className="w-[52px] h-[52px] rounded-[12px] bg-white shadow-[0px_3px_3px_-1.5px_rgba(0,0,0,0.04),0px_1px_1px_-0.5px_rgba(0,0,0,0.04),0px_0px_0px_1px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0 border border-neutral-200/50">
                    <RiUpload2Line className="size-8 text-[#171717]" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                      Upload documents
                    </h3>
                    <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                      Upload whatever you have ready now. You can come back to add the rest later — nothing is lost.
                    </p>
                  </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col items-start gap-6">
                  <div className="w-[52px] h-[52px] rounded-[12px] bg-white shadow-[0px_3px_3px_-1.5px_rgba(0,0,0,0.04),0px_1px_1px_-0.5px_rgba(0,0,0,0.04),0px_0px_0px_1px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0 border border-neutral-200/50">
                    <RiSendPlane2Line className="size-8 text-[#171717]" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                      Submit
                    </h3>
                    <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                      Review your answers, then send it securely to your sponsor. They&apos;ll take it from there.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gather these before you start */}
            <div className="w-full flex flex-col gap-6 max-w-[728px] mx-auto">
              <div className="flex flex-col gap-2">
                <h2 className="text-[40px] leading-[44px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
                  Gather these before you start
                </h2>
                <p className="text-[16px] leading-[24px] font-normal text-[#5C5C5C] tracking-[-0.011em] max-w-[586px]">
                  Some documents you&apos;ll have already. Others you may need a few minutes to find or generate. Your sponsor handles the rest.
                </p>
              </div>

              {/* Group 1 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                    Have ready
                  </h3>
                  <span className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                    2 items (already in your pocket)
                  </span>
                </div>
                <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <RiFileTextLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">
                        Valid passport
                      </span>
                      <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C]">
                        You will need your passport number, expiry date, and nationality. A colour scan of the bio-data page will be needed in the next step.
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-[#EBEBEB]" />
                  <div className="flex items-start gap-3">
                    <RiAtLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">
                        Email address and phone number
                      </span>
                      <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C]">
                        We will use your email to send confirmations and your phone as a backup contact. Include your country code.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                    You may need to obtain
                  </h3>
                  <span className="text-[14px] leading-[20px] font-normal text-[#5C5C5C]">
                    2 items (gotta be ready)
                  </span>
                </div>
                <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <RiCalendarCheckLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">
                        Posters, schedule, or performance dates
                      </span>
                      <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C]">
                        Event posters, engagement schedules, or booking confirmations showing where you&apos;re performing in the UK.
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-[#EBEBEB]" />
                  <div className="flex items-start gap-3">
                    <RiPlaneLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">
                        Flight and accommodation
                      </span>
                      <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C]">
                        Booking confirmations for your flights and where you&apos;ll be staying — hotel, tenancy, or a letter from your host.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3 */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                    Your sponsor will provide
                  </h3>
                  <span className="text-[14px] leading-[20px] font-normal text-[#5C5C5C]">
                    2 items (check your inbox)
                  </span>
                </div>
                <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <RiFileList3Line className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">
                        Signed declaration &amp; consent forms
                      </span>
                      <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C]">
                        Your sponsor will email these to you. You&apos;ll sign and upload them in the next step. Check your inbox for emails from Viems.
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-[#EBEBEB]" />
                  <div className="flex items-start gap-3">
                    <RiQuillPenLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717]">
                        Lead artist cover letter (if applicable)
                      </span>
                      <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C]">
                        If you&apos;re performing with a group, the lead artist may send a short letter confirming your involvement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Let's get your application started */}
            <div className="w-full flex flex-col items-center gap-4 text-center mt-4">
              <h2 className="text-[40px] leading-[44px] font-medium text-[#171717] font-aeonik-medium max-w-[477px] mx-auto tracking-[-0.01em]">
                Let&apos;s get your application started.
              </h2>
              <p className="text-[16px] leading-[24px] font-normal text-[#5C5C5C] max-w-[446px] mx-auto">
                Ready when you are
              </p>
              <div className="flex justify-center mt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="h-[40px] px-[20px] bg-[#7D52F4] hover:bg-[#6836E6] text-white text-[14px] font-medium rounded-[10px] transition-all cursor-pointer border-0 shadow-x-small flex items-center justify-center"
                >
                  Get started
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PERSONAL DETAILS */}
        {activeStep === 2 && (
          <div className="flex flex-col gap-6">
            {validationError && (
              <div className="p-3 bg-[#FFEBEC] border border-[#FB3748]/30 text-[#681219] rounded-[8px] text-[13px]">
                {validationError}
              </div>
            )}

            {/* Passport Banner */}
            <div className="bg-[#EFEBFF] rounded-[8px] p-3 px-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-[6px] bg-[#7D52F4] flex items-center justify-center shrink-0 text-white">
                  <RiFileTextLine className="size-3.5 text-white" />
                </div>
                <span className="text-[13px] font-normal text-[#171717] leading-[20px]">
                  {passportUploaded
                    ? "Passport uploaded! Fields can be updated below."
                    : "Upload a passport and AI will auto-fill these fields for you."}
                </span>
              </div>
              <button
                type="button"
                onClick={() => passportInputRef.current?.click()}
                className="bg-[#7D52F4] hover:bg-[#6836E6] text-white text-[14px] font-medium px-3 py-1.5 h-8 rounded-[8px] flex items-center gap-1.5 shrink-0 cursor-pointer border-0 transition-colors shadow-x-small"
              >
                <RiUpload2Line className="size-4 text-white" />
                <span>Upload</span>
              </button>
            </div>

            {/* Photo Upload Card */}
            <div className="bg-[#F7F7F7] rounded-[8px] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-[80px] h-[88px] bg-white border border-dashed border-[#D1D1D1] rounded-[8px] flex items-center justify-center shrink-0 overflow-hidden relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Uploaded application photo preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-8 rounded-full border border-[#EBEBEB] bg-white shadow-x-small flex items-center justify-center text-[#5C5C5C]">
                      <RiUser3Line className="size-5 text-[#5C5C5C]" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 max-w-[454px]">
                  <span className="text-[14px] font-medium text-[#171717]">Upload photo</span>
                  <p className="text-[13px] font-normal text-[#171717] leading-[20px]">
                    Photo will be used as your official application photo
                  </p>
                  <p className="text-[13px] font-normal text-[#A4A4A4] leading-[20px]">
                    JPG or PNG, min 400 x 514px. Max 10 MB. Plain background, no filters.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="bg-white border border-[#D1D1D1] hover:bg-neutral-50 text-[#5C5C5C] text-[14px] font-medium px-4 py-2 h-9 rounded-[8px] shrink-0 cursor-pointer shadow-x-small transition-colors"
              >
                Upload photo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="firstName" className="text-[14px] font-medium text-[#171717]">
                  First Name <span className="text-[#FB3748]">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder=""
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] shadow-x-small"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="lastName" className="text-[14px] font-medium text-[#171717]">
                  Last Name <span className="text-[#FB3748]">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder=""
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] shadow-x-small"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="dob" className="text-[14px] font-medium text-[#171717]">
                  Date of Birth <span className="text-[#FB3748]">*</span>
                </label>
                <div className="relative">
                  <RiCalendarLine className="size-5 text-[#A4A4A4] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="dob"
                    type="text"
                    value={form.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    placeholder="DD / MM / YYYY"
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white pl-10 pr-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] shadow-x-small"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="gender" className="text-[14px] font-medium text-[#171717]">Gender</label>
                <div className="relative">
                  <select
                    id="gender"
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] shadow-x-small"
                  >
                    <option value="">Select gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="maritalStatus" className="text-[14px] font-medium text-[#171717]">Marital Status</label>
                <div className="relative">
                  <select
                    id="maritalStatus"
                    value={form.maritalStatus}
                    onChange={(e) => handleChange("maritalStatus", e.target.value)}
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] shadow-x-small"
                  >
                    <option value="">Select marital status...</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Civil Partnership">Civil Partnership</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                  <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="nationality" className="text-[14px] font-medium text-[#171717]">Nationality</label>
                <div className="relative">
                  <select
                    id="nationality"
                    value={form.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] shadow-x-small"
                  >
                    <option value="">Select country...</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="India">India</option>
                    <option value="China">China</option>
                  </select>
                  <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="countryOfBirth" className="text-[14px] font-medium text-[#171717]">Country of Birth</label>
                <div className="relative">
                  <select
                    id="countryOfBirth"
                    value={form.countryOfBirth}
                    onChange={(e) => handleChange("countryOfBirth", e.target.value)}
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] shadow-x-small"
                  >
                    <option value="">Select country...</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="India">India</option>
                    <option value="China">China</option>
                  </select>
                  <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="passportNumber" className="text-[14px] font-medium text-[#171717]">
                  Passport Number <span className="text-[#FB3748]">*</span>
                </label>
                <input
                  id="passportNumber"
                  type="text"
                  value={form.passportNumber}
                  onChange={(e) => handleChange("passportNumber", e.target.value)}
                  placeholder="Enter passport number"
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] shadow-x-small"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="passportIssueDate" className="text-[14px] font-medium text-[#171717]">Issue Date</label>
                <div className="relative">
                  <RiCalendarLine className="size-5 text-[#A4A4A4] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="passportIssueDate"
                    type="text"
                    value={form.passportIssueDate}
                    onChange={(e) => handleChange("passportIssueDate", e.target.value)}
                    placeholder="DD / MM / YYYY"
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white pl-10 pr-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] shadow-x-small"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="personalEmail" className="text-[14px] font-medium text-[#171717]">
                  Email Address <span className="text-[#FB3748]">*</span>
                </label>
                <input
                  id="personalEmail"
                  type="email"
                  value={form.personalEmail}
                  onChange={(e) => handleChange("personalEmail", e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] shadow-x-small"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="mobilePhone" className="text-[14px] font-medium text-[#171717]">Phone Number</label>
                <input
                  id="mobilePhone"
                  type="tel"
                  value={form.mobilePhone}
                  onChange={(e) => handleChange("mobilePhone", e.target.value)}
                  placeholder="e.g. +1 555-555-5555"
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] shadow-x-small"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-[#EBEBEB] mt-4">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] text-[14px] font-medium px-6 py-2.5 rounded-[10px] cursor-pointer border-0 transition-all"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleNextStep2}
                className="bg-[#171717] hover:bg-[#333333] text-white text-[14px] font-medium px-6 py-2.5 rounded-[10px] cursor-pointer border-0 shadow-x-small transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
