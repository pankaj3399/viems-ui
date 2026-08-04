"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  RiCheckLine,
  RiUploadLine,
  RiShareBoxFill,
  RiCalendarLine,
  RiArrowDownSLine,
  RiUser3Line,
  RiSparklingFill,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
  RiFileTextLine,
  RiBriefcaseLine,
  RiDraftLine,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { toast } from "sonner";

interface PersonalDetailsState {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  countryOfBirth: string;
  cityOfBirth: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  
  // Home Address
  addressLine1: string;
  addressLine2: string;
  city: string;
  postCode: string;
  country: string;
  
  // Contact Details
  personalEmail: string;
  mobilePhone: string;
  
  // Emergency Contact
  emergencyName: string;
  emergencyRelationship: string;
  emergencyEmail: string;
  emergencyPhone: string;

  // Photo / Passport AI
  photoUrl?: string;
  passportUploaded?: boolean;
}

export default function AddMigrantPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState<number>(2); // Default to Step 2: Personal details
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const passportInputRef = React.useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [form, setForm] = React.useState<PersonalDetailsState>({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    countryOfBirth: "",
    cityOfBirth: "",
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postCode: "",
    country: "",
    personalEmail: "",
    mobilePhone: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyEmail: "",
    emergencyPhone: "",
  });

  // Restore draft on mount
  React.useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("viems_add_migrant_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === "object") {
          setForm((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      // Ignore invalid stored draft
    }
  }, []);

  const handleChange = (field: keyof PersonalDetailsState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Photo Upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      toast.success("Photo uploaded successfully as migrant avatar.");
    }
  };

  // Simulated AI Passport Auto-Fill
  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAiProcessing(true);
      toast.info("Processing passport with AI...");
      setTimeout(() => {
        setIsAiProcessing(false);
        setForm((prev) => ({
          ...prev,
          firstName: "Jordan",
          lastName: "Taylor",
          dob: "1992-05-14",
          gender: "Male",
          maritalStatus: "Single",
          nationality: "United States",
          countryOfBirth: "United States",
          passportNumber: "T7030033",
          passportIssueDate: "2021-03-15",
          passportExpiryDate: "2031-03-14",
          passportUploaded: true,
        }));
        toast.success("AI extracted details from passport and auto-filled the fields!");
      }, 1200);
    }
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem("viems_add_migrant_draft", JSON.stringify(form));
      toast.success("Draft saved successfully!");
    } catch {
      toast.error("Failed to save draft.");
    }
  };

  const handleInviteMigrant = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      toast.info("Connecting to server and creating migrant record...");
      
      const payload = {
        first_name: form.firstName,
        last_name: form.lastName,
        gender: form.gender ? form.gender.toUpperCase() : "MALE",
        date_of_birth: form.dob,
        marital_status: form.maritalStatus,
        nationality: form.nationality,
        country_of_birth: form.countryOfBirth,
        city_of_birth: form.cityOfBirth,
        passport_number: form.passportNumber,
        passport_issue_date: form.passportIssueDate,
        passport_expiry_date: form.passportExpiryDate,
        address_line_1: form.addressLine1,
        address_line_2: form.addressLine2,
        city: form.city,
        post_code: form.postCode,
        country: form.country,
        email: form.personalEmail,
        mobile_phone: form.mobilePhone,
        emergency_contact_name: form.emergencyName,
        emergency_contact_relationship: form.emergencyRelationship,
        emergency_contact_email: form.emergencyEmail,
        emergency_contact_phone: form.emergencyPhone,
      };

      await apiClient.post(ENDPOINTS.migrants.base, payload);
      toast.success(`Migrant record created and invite sent to ${form.personalEmail || "migrant"}!`);
      router.push("/migrants");
    } catch {
      toast.error("Failed to create migrant record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-full bg-[#F7F7F7] text-[#171717] font-sans pb-16 flex flex-col flex-1 ">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={passportInputRef}
        onChange={handlePassportUpload}
        accept="image/*,.pdf"
        className="hidden"
      />

      {/* Top Bar Header */}
      <header className="w-full border-b border-[#EBEBEB] bg-white sticky top-0 z-30 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          {/* Left: Cancel Link */}
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors border-0 bg-transparent cursor-pointer"
          >
            Cancel
          </button>

          {/* Center Title */}
          <h1 className="text-[24px] font-medium text-[#171717] tracking-[-0.01em] font-aeonik-medium">
            Add migrant
          </h1>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-sm">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-xl py-lg h-10 bg-[#FFFFFF] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] border border-[#EBEBEB] rounded-[10px] text-[14px] font-medium transition-all cursor-pointer shadow-x-small"
            >
              Save as draft
            </button>

            <button
              type="button"
              onClick={handleInviteMigrant}
              className="px-xl py-lg h-10 bg-[#7D52F4] hover:bg-[#6836E6] text-white rounded-[10px] text-[14px] font-medium transition-all cursor-pointer border-0 flex items-center gap-xs shadow-x-small"
            >
              <RiShareBoxFill className="size-4 text-white shrink-0" />
              <span>Invite migrant</span>
            </button>
          </div>
        </div>
      </header>

      {/* Step Indicator Stepper */}
      <div className="w-full bg-[#F7F7F7] pt-6 pb-4 border-b border-[#EBEBEB] mb-2 select-none">
        <div className="max-w-[728px] mx-auto flex items-center justify-between">
          {/* Step 1: Get started */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            aria-current={activeStep === 1 ? "step" : undefined}
            className="flex items-center gap-xs cursor-pointer border-0 bg-transparent p-0 group"
          >
            <div className="size-5 rounded-full bg-[#7D52F4] text-white flex items-center justify-center shrink-0">
              <RiCheckLine className="size-3.5 text-white" />
            </div>
            <span className="text-[14px] font-medium text-[#171717]">Get started</span>
          </button>

          <div className="h-[1px] w-8 bg-[#EBEBEB]" />

          {/* Step 2: Personal details */}
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            aria-current={activeStep === 2 ? "step" : undefined}
            className="flex items-center gap-xs cursor-pointer border-0 bg-transparent p-0 group"
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

          {/* Step 3: Employment */}
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            aria-current={activeStep === 3 ? "step" : undefined}
            className="flex items-center gap-xs cursor-pointer border-0 bg-transparent p-0 group"
          >
            <div
              className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 ${
                activeStep === 3
                  ? "bg-[#171717] text-white"
                  : activeStep > 3
                  ? "bg-[#7D52F4] text-white"
                  : "bg-[#EBEBEB] text-[#5C5C5C]"
              }`}
            >
              {activeStep > 3 ? <RiCheckLine className="size-3.5 text-white" /> : "3"}
            </div>
            <span
              className={`text-[14px] ${
                activeStep === 3 ? "font-medium text-[#171717]" : "font-normal text-[#5C5C5C]"
              }`}
            >
              Employment
            </span>
          </button>

          <div className="h-[1px] w-8 bg-[#EBEBEB]" />

          {/* Step 4: Documents */}
          <button
            type="button"
            onClick={() => setActiveStep(4)}
            aria-current={activeStep === 4 ? "step" : undefined}
            className="flex items-center gap-xs cursor-pointer border-0 bg-transparent p-0 group"
          >
            <div
              className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 ${
                activeStep === 4
                  ? "bg-[#171717] text-white"
                  : activeStep > 4
                  ? "bg-[#7D52F4] text-white"
                  : "bg-[#EBEBEB] text-[#5C5C5C]"
              }`}
            >
              {activeStep > 4 ? <RiCheckLine className="size-3.5 text-white" /> : "4"}
            </div>
            <span
              className={`text-[14px] ${
                activeStep === 4 ? "font-medium text-[#171717]" : "font-normal text-[#5C5C5C]"
              }`}
            >
              Documents
            </span>
          </button>

          <div className="h-[1px] w-8 bg-[#EBEBEB]" />

          {/* Step 5: Review & Create */}
          <button
            type="button"
            onClick={() => setActiveStep(5)}
            aria-current={activeStep === 5 ? "step" : undefined}
            className="flex items-center gap-xs cursor-pointer border-0 bg-transparent p-0 group"
          >
            <div
              className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 ${
                activeStep === 5 ? "bg-[#171717] text-white" : "bg-[#EBEBEB] text-[#5C5C5C]"
              }`}
            >
              5
            </div>
            <span
              className={`text-[14px] ${
                activeStep === 5 ? "font-medium text-[#171717]" : "font-normal text-[#5C5C5C]"
              }`}
            >
              Review & Create
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[768px] w-full mx-auto flex flex-col gap-6 px-8 py-8 bg-white rounded-[16px] shadow-x-small border border-neutral-200/20 my-6">
        {/* Step Title */}
        <h2 className="text-[20px] font-medium text-[#171717] tracking-[-0.006em] font-aeonik-medium">
          {activeStep === 1
            ? "Get started"
            : activeStep === 2
            ? "Personal details"
            : activeStep === 3
            ? "Employment details"
            : activeStep === 4
            ? "Documents upload"
            : "Review & Create"}
        </h2>

        {/* STEP 2: PERSONAL DETAILS FORM (Matching Figma Mockup) */}
        {activeStep === 2 && (
          <div className="flex flex-col gap-6">
            {/* AI Passport Auto-Fill Banner */}
            <div className="bg-[#EFEBFF] rounded-[8px] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-[6px] bg-[#7D52F4] flex items-center justify-center shrink-0 text-white">
                  <RiSparklingFill className="size-3.5 text-white" />
                </div>
                <span className="text-[13px] font-normal text-[#171717] leading-[20px]">
                  Upload a passport and AI will auto-fill these fields for you.
                </span>
              </div>
              <button
                type="button"
                disabled={isAiProcessing}
                onClick={() => passportInputRef.current?.click()}
                className="bg-[#7D52F4] hover:bg-[#6836E6] text-white text-[14px] font-medium px-3 py-1.5 h-8 rounded-[8px] flex items-center gap-1 shrink-0 cursor-pointer border-0 transition-colors shadow-x-small"
              >
                <RiUploadLine className="size-4 text-white" />
                <span>{isAiProcessing ? "Processing..." : "Upload"}</span>
              </button>
            </div>

            {/* Photo Upload Card */}
            <div className="bg-[#F7F7F7] rounded-[8px] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-[80px] h-[88px] bg-white border border-dashed border-[#D1D1D1] rounded-[8px] flex items-center justify-center shrink-0 overflow-hidden relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="size-8 rounded-full border border-[#EBEBEB] bg-white flex items-center justify-center text-[#5C5C5C]">
                      <RiUser3Line className="size-4 text-[#5C5C5C]" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 max-w-[454px]">
                  <span className="text-[14px] font-medium text-[#171717]">Upload photo</span>
                  <p className="text-[13px] font-normal text-[#171717] leading-[20px]">
                    Photo will be used as the migrant&apos;s avatar across the platform and as their official application photo.{" "}
                    <span className="underline cursor-pointer hover:text-[#5C5C5C]">More info</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border border-[#D1D1D1] hover:bg-neutral-50 text-[#5C5C5C] text-[14px] font-medium px-4 py-2 h-9 rounded-[8px] shrink-0 cursor-pointer shadow-x-small transition-colors"
              >
                Upload photo
              </button>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="firstName" className="text-[14px] font-medium text-[#171717]">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="First name..."
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="lastName" className="text-[14px] font-medium text-[#171717]">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Last name..."
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>
            </div>

            {/* Date of Birth & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="dob" className="text-[14px] font-medium text-[#171717]">Date of Birth</label>
                <div className="relative">
                  <RiCalendarLine className="size-5 text-[#A4A4A4] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="dob"
                    type="text"
                    value={form.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    placeholder="DD / MM / YYYY"
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white pl-10 pr-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
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
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
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

            {/* Marital Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="maritalStatus" className="text-[14px] font-medium text-[#171717]">Marital Status</label>
                <div className="relative">
                  <select
                    id="maritalStatus"
                    value={form.maritalStatus}
                    onChange={(e) => handleChange("maritalStatus", e.target.value)}
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
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

            {/* Nationality & Country of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="nationality" className="text-[14px] font-medium text-[#171717]">Nationality</label>
                <div className="relative">
                  <select
                    id="nationality"
                    value={form.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  >
                    <option value="">Select country...</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="India">India</option>
                    <option value="China">China</option>
                    <option value="France">France</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Nepal">Nepal</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Germany">Germany</option>
                    <option value="Italy">Italy</option>
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
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  >
                    <option value="">Select country...</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="India">India</option>
                    <option value="China">China</option>
                    <option value="France">France</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Nepal">Nepal</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Germany">Germany</option>
                    <option value="Italy">Italy</option>
                  </select>
                  <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* City of Birth */}
            <div className="flex flex-col gap-1">
              <label htmlFor="cityOfBirth" className="text-[14px] font-medium text-[#171717]">City of Birth</label>
              <input
                id="cityOfBirth"
                type="text"
                value={form.cityOfBirth}
                onChange={(e) => handleChange("cityOfBirth", e.target.value)}
                placeholder="City of birth..."
                className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
              />
            </div>

            {/* Passport Number, Passport Issue Date, Passport Expiry Date (3 Columns Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-[#171717]">Passport Number</label>
                <input
                  type="text"
                  value={form.passportNumber}
                  onChange={(e) => handleChange("passportNumber", e.target.value)}
                  placeholder="Passport number..."
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-[#171717]">Passport Issue Date</label>
                <div className="relative">
                  <RiCalendarLine className="size-5 text-[#A4A4A4] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={form.passportIssueDate}
                    onChange={(e) => handleChange("passportIssueDate", e.target.value)}
                    placeholder="DD / MM / YYYY"
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white pl-10 pr-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-[#171717]">Passport Expiry Date</label>
                <div className="relative">
                  <RiCalendarLine className="size-5 text-[#A4A4A4] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={form.passportExpiryDate}
                    onChange={(e) => handleChange("passportExpiryDate", e.target.value)}
                    placeholder="DD / MM / YYYY"
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white pl-10 pr-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>
              </div>
            </div>

            {/* HOME ADDRESS SECTION */}
            <div className="flex flex-col gap-4 pt-4 border-t border-[#EBEBEB]">
              <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#A4A4A4]">
                Home Address
              </span>

              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-[#171717]">Address Line 1</label>
                <input
                  type="text"
                  value={form.addressLine1}
                  onChange={(e) => handleChange("addressLine1", e.target.value)}
                  placeholder="Address Line 1"
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-[#171717]">
                  Address Line 2 <span className="font-normal text-[#5C5C5C]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.addressLine2}
                  onChange={(e) => handleChange("addressLine2", e.target.value)}
                  placeholder="Address Line 2"
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-medium text-[#171717]">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="City"
                    className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-medium text-[#171717]">Post Code</label>
                  <input
                    type="text"
                    value={form.postCode}
                    onChange={(e) => handleChange("postCode", e.target.value)}
                    placeholder="Post Code"
                    className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-[#171717]">Country</label>
                <div className="relative">
                  <select
                    value={form.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="India">India</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                  <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* CONTACT DETAILS SECTION */}
            <div className="flex flex-col gap-4 pt-4 border-t border-[#EBEBEB]">
              <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#A4A4A4]">
                Contact Details
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-medium text-[#171717]">Personal Email</label>
                  <input
                    type="email"
                    value={form.personalEmail}
                    onChange={(e) => handleChange("personalEmail", e.target.value)}
                    placeholder="email@example.com"
                    className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-medium text-[#171717]">Mobile Phone</label>
                  <input
                    type="tel"
                    value={form.mobilePhone}
                    onChange={(e) => handleChange("mobilePhone", e.target.value)}
                    placeholder="+44 7911 234567"
                    className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>
              </div>
            </div>

            {/* EMERGENCY CONTACT SECTION */}
            <div className="flex flex-col gap-4 pt-4 border-t border-[#EBEBEB]">
              <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#A4A4A4]">
                Emergency Contact
              </span>

              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-[#171717]">Full Name</label>
                <input
                  type="text"
                  value={form.emergencyName}
                  onChange={(e) => handleChange("emergencyName", e.target.value)}
                  placeholder="Full Name"
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-[#171717]">Relationship</label>
                <div className="relative">
                  <select
                    value={form.emergencyRelationship}
                    onChange={(e) => handleChange("emergencyRelationship", e.target.value)}
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Child">Child</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                  <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-medium text-[#171717]">Email</label>
                  <input
                    type="email"
                    value={form.emergencyEmail}
                    onChange={(e) => handleChange("emergencyEmail", e.target.value)}
                    placeholder="email@example.com"
                    className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-medium text-[#171717]">Mobile Phone</label>
                  <input
                    type="tel"
                    value={form.emergencyPhone}
                    onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: GET STARTED PLACEHOLDER */}
        {activeStep === 1 && (
          <div className="bg-[#F7F7F7] rounded-[16px] p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
            <RiFileTextLine className="size-12 text-[#7D52F4]" />
            <h3 className="text-[18px] font-medium text-[#171717]">Initial Setup Complete</h3>
            <p className="text-[14px] text-[#5C5C5C] max-w-[400px]">
              You are ready to enter personal details for the new migrant application.
            </p>
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="bg-[#171717] text-white px-xl py-lg rounded-[10px] text-[14px] font-medium hover:bg-[#333333]"
            >
              Continue to Personal details
            </button>
          </div>
        )}

        {/* STEP 3: EMPLOYMENT PLACEHOLDER */}
        {activeStep === 3 && (
          <div className="bg-[#F7F7F7] rounded-[16px] p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
            <RiBriefcaseLine className="size-12 text-[#7D52F4]" />
            <h3 className="text-[18px] font-medium text-[#171717]">Employment Details</h3>
            <p className="text-[14px] text-[#5C5C5C] max-w-[400px]">
              Specify CoS role, salary, job code, and sponsor license details.
            </p>
            <div className="flex gap-sm">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="bg-[#F5F5F5] text-[#5C5C5C] px-xl py-lg rounded-[10px] text-[14px] font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="bg-[#171717] text-white px-xl py-lg rounded-[10px] text-[14px] font-medium hover:bg-[#333333]"
              >
                Next to Documents
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 & 5 PLACEHOLDERS */}
        {(activeStep === 4 || activeStep === 5) && (
          <div className="bg-[#F7F7F7] rounded-[16px] p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
            <RiDraftLine className="size-12 text-[#7D52F4]" />
            <h3 className="text-[18px] font-medium text-[#171717]">
              {activeStep === 4 ? "Documents Upload" : "Review & Create Application"}
            </h3>
            <p className="text-[14px] text-[#5C5C5C] max-w-[400px]">
              {activeStep === 4
                ? "Upload proof of identity, right to work, and qualifications."
                : "Review all migrant data before final submission."}
            </p>
            <div className="flex gap-sm">
              <button
                type="button"
                onClick={() => setActiveStep(activeStep - 1)}
                className="bg-[#F5F5F5] text-[#5C5C5C] px-xl py-lg rounded-[10px] text-[14px] font-medium"
              >
                Back
              </button>
              {activeStep === 5 ? (
                <button
                  type="button"
                  onClick={handleInviteMigrant}
                  className="bg-[#7D52F4] text-white px-xl py-lg rounded-[10px] text-[14px] font-medium hover:bg-[#6836E6]"
                >
                  Create & Invite Migrant
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveStep(5)}
                  className="bg-[#171717] text-white px-xl py-lg rounded-[10px] text-[14px] font-medium hover:bg-[#333333]"
                >
                  Next to Review
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Actions Bar (Back & Next Buttons) */}
        {activeStep === 2 && (
          <div className="flex items-center justify-between pt-6 border-t border-[#EBEBEB] mt-4">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] text-[14px] font-medium px-6 py-2.5 rounded-[10px] transition-all cursor-pointer border-0"
            >
              Back
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="bg-[#171717] hover:bg-[#333333] text-white text-[14px] font-medium px-6 py-2.5 rounded-[10px] transition-all cursor-pointer border-0 shadow-x-small"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
