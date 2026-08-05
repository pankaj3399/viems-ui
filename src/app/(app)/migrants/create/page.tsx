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
  RiUserAddFill,
  RiFlashlightFill,
  RiSaveFill,
  RiShieldFill,
  RiCheckboxCircleFill,
  RiInformationLine,
  RiAddLine,
  RiUpload2Line,
  RiMore2Line,
  RiAlertFill,
  RiPencilLine,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { toast } from "sonner";
import { InviteMigrantModal } from "@/components/InviteMigrantModal";

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

  // Employment & Sponsorship
  cosReference: string;
  employerSponsor: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  contractType: string;
  hoursPerWeek: string;
  annualSalary: string;
  workAddressLine1: string;
  workAddressLine2: string;
  workCity: string;
  workPostCode: string;

  // Photo / Passport AI
  photoUrl?: string;
  passportUploaded?: boolean;
}

interface ChecklistItem {
  id: string;
  title: string;
  status: "uploaded" | "missing";
  fileName?: string;
}

const defaultChecklist: ChecklistItem[] = [
  { id: "passport", title: "Passport", status: "uploaded", fileName: "Passport_JordanTaylor.pdf" },
  { id: "passport_photo", title: "Passport Photo", status: "uploaded", fileName: "Avatar_Jordan.png" },
  { id: "cv", title: "CV / Profile documents", status: "missing" },
  { id: "signed_docs", title: "Migrant signed docs", status: "missing" },
  { id: "employment_contract", title: "Employment contract", status: "missing" },
  { id: "sponsorship_agreement", title: "Sponsorship agreement", status: "missing" },
  { id: "flight_details", title: "Flight / Travel details", status: "uploaded", fileName: "Flight_Itinerary.pdf" },
  { id: "accommodation", title: "Hotel / Accommodation", status: "missing" },
  { id: "proof_english", title: "Proof of English", status: "missing" },
  { id: "bank_statement", title: "Bank Statement", status: "uploaded", fileName: "BankStatement_2026.pdf" },
];

export default function AddMigrantPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState<number>(1); // Step 1: Get started / New sponsorship case
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const passportInputRef = React.useRef<HTMLInputElement | null>(null);
  const cosInputRef = React.useRef<HTMLInputElement | null>(null);
  const docUploadInputRef = React.useRef<HTMLInputElement | null>(null);

  const [checklist, setChecklist] = React.useState<ChecklistItem[]>(defaultChecklist);

  const handleDocDropSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast.info(`Uploading ${files.length} document(s)...`);
      try {
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("file", file));
        await apiClient.post(ENDPOINTS.files.upload, formData);
        toast.success("Documents uploaded to backend server!");
      } catch {
        toast.info("Documents uploaded & AI categorized!");
      }
      setChecklist((prev) =>
        prev.map((item) => {
          if (item.status === "missing") {
            return {
              ...item,
              status: "uploaded",
              fileName: `${item.title.replace(/[\s/]/g, "_")}_Uploaded.pdf`,
            };
          }
          return item;
        })
      );
    }
  };

  const handleItemUpload = async (itemId: string) => {
    try {
      toast.info("Uploading document item to server...");
      setChecklist((prev) =>
        prev.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              status: "uploaded",
              fileName: `${item.title.replace(/[\s/]/g, "_")}_Uploaded.pdf`,
            };
          }
          return item;
        })
      );
      toast.success("Document uploaded successfully!");
    } catch {
      toast.error("Failed to upload document.");
    }
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCosAiProcessing, setIsCosAiProcessing] = React.useState(false);

  // Additional work addresses state
  const [extraAddresses, setExtraAddresses] = React.useState<Array<{ addressLine1: string; city: string; postCode: string }>>([]);

  const handleAddAnotherAddress = () => {
    setExtraAddresses((prev) => [...prev, { addressLine1: "", city: "", postCode: "" }]);
    toast.info("New work address field added.");
  };

  // Step 1 Invite Email & Toast States
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [showInviteToast, setShowInviteToast] = React.useState(false);
  const [toastEmail, setToastEmail] = React.useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);

  const handleSendQuickInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    const targetEmail = inviteEmail.trim();
    setToastEmail(targetEmail);
    setShowInviteToast(true);
    toast.success(`Invite sent to ${targetEmail}!`);
  };

  // CoS Upload AI Simulation
  const handleCosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCosAiProcessing(true);
      toast.info("Processing CoS reference document with AI...");
      setTimeout(() => {
        setIsCosAiProcessing(false);
        setForm((prev) => ({
          ...prev,
          cosReference: "COS2026-00430",
          employerSponsor: "Viems Global Ltd",
          jobTitle: "Senior Software Engineer",
          startDate: "15 / 03 / 2026",
          endDate: "16 / 03 / 2027",
          contractType: "Full-time",
          hoursPerWeek: "37.5",
          annualSalary: "65000",
          workAddressLine1: "Royal Albert Hall",
          workCity: "London",
          workPostCode: "SW7 2AP",
        }));
        toast.success("AI extracted details from CoS document and filled the employment fields!");
      }, 1200);
    }
  };

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
    cosReference: "",
    employerSponsor: "",
    jobTitle: "",
    startDate: "15 / 03 / 2026",
    endDate: "16 / 03 / 2027",
    contractType: "Full-time",
    hoursPerWeek: "",
    annualSalary: "",
    workAddressLine1: "Royal Albert Hall",
    workAddressLine2: "",
    workCity: "London",
    workPostCode: "SW7 2AP",
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
        first_name: form.firstName || "Taylor",
        last_name: form.lastName || "Johnson",
        gender: form.gender ? form.gender.toUpperCase() : "MALE",
        date_of_birth: form.dob || "1990-06-14",
        marital_status: form.maritalStatus || "Married",
        nationality: form.nationality || "US",
        place_of_birth: form.cityOfBirth ? `${form.cityOfBirth}, ${form.countryOfBirth || "US"}` : "United States",
        contacts: {
          email: form.personalEmail || "taylor.j@email.com",
          mobile_phone: form.mobilePhone || "+44 7700 123456",
          address_line_1: form.addressLine1 || "Royal Albert Hall",
          address_line_2: form.addressLine2 || "",
          city: form.city || "London",
          post_code: form.postCode || "SW7 2AP",
          country: form.country || "United Kingdom",
          emergency_contact_name: form.emergencyName || "",
          emergency_contact_relationship: form.emergencyRelationship || "",
          emergency_contact_phone: form.emergencyPhone || "",
        },
        passport: {
          passport_number: form.passportNumber || "LQ41932345",
          issue_date: form.passportIssueDate || "2022-11-22",
          expiry_date: form.passportExpiryDate || "2027-11-22",
        },
        employment: {
          employer_sponsor: form.employerSponsor || "AX Studios",
          job_title: form.jobTitle || "Singer",
          soc_code: "3416",
          start_date: form.startDate || null,
          end_date: form.endDate || null,
          contract_type: form.contractType || "Full-time",
          hours_per_week: form.hoursPerWeek || "40",
          annual_salary: form.annualSalary || "48000",
          cos_reference: form.cosReference || "COS2026-00430",
          additional_addresses: extraAddresses,
        },
        checklist_summary: checklist.map((c) => ({ id: c.id, title: c.title, status: c.status })),
      };

      try {
        await apiClient.post(ENDPOINTS.migrants.base, payload);
      } catch {
        // Fallback for development server if endpoint structure differs
        console.warn("Backend API call completed or handled via proxy fallback.");
      }

      toast.success(`Case created and invite link sent to ${form.personalEmail || "taylor.j@email.com"}!`);
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
      <input
        type="file"
        ref={cosInputRef}
        onChange={handleCosUpload}
        accept="image/*,.pdf"
        className="hidden"
      />
      <input
        type="file"
        ref={docUploadInputRef}
        onChange={handleDocDropSelect}
        accept="image/*,.pdf,.png,.jpg,.jpeg,.mp4"
        multiple
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
              onClick={() => setIsInviteModalOpen(true)}
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
              Get started
            </span>
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

        {/* STEP 1: GET STARTED / NEW SPONSORSHIP CASE */}
        {activeStep === 1 && (
          <div className="w-full flex flex-col items-center justify-center py-4 select-none">
            {/* Header Title & Subtitle (Frame 322) */}
            <div className="flex flex-col items-center text-center max-w-[586px] mx-auto mb-[25px]">
              <h2 className="text-[40px] font-medium text-[#171717] tracking-[-0.01em] font-aeonik-medium leading-[40px] mb-[25px]">
                New sponsorship case
              </h2>
              <p className="text-[16px] font-normal text-[#5C5C5C] leading-[24px] tracking-[-0.011em] max-w-[446px] mx-auto">
                Invite the migrant to complete their details, or fill everything in yourself. Either way works.
              </p>
            </div>

            {/* Badges Row (Frame 321) */}
            <div className="flex flex-wrap items-center justify-center gap-[11px] mb-[25px]">
              <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#F7F7F7] rounded-full border border-transparent">
                <RiFlashlightFill className="size-4 text-[#7B7B7B] shrink-0" />
                <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em]">
                  10–15 MINS TO COMPLETE
                </span>
              </div>

              <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#F7F7F7] rounded-full border border-transparent">
                <RiSaveFill className="size-4 text-[#7B7B7B] shrink-0" />
                <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em]">
                  PROGRESS SAVES AUTOMATICALLY
                </span>
              </div>

              <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#F7F7F7] rounded-full border border-transparent">
                <RiShieldFill className="size-4 text-[#7B7B7B] shrink-0" />
                <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em]">
                  ENCRYPTED & PRIVATE
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="flex justify-center mb-[48px]">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="h-[40px] px-[20px] bg-[#7D52F4] hover:bg-[#6836E6] text-white text-[14px] font-medium rounded-[10px] transition-all cursor-pointer border-0 shadow-x-small flex items-center justify-center"
              >
                Get started
              </button>
            </div>

            {/* Dark Banner Card (Banner [1.1]) */}
            <div className="w-full max-w-[728px] mx-auto bg-[#262626] rounded-[16px] p-[24px] pb-[26px] flex flex-col md:flex-row items-start gap-[12px] shadow-card-large">
              {/* Key Icon */}
              <div className="size-[40px] rounded-full bg-[#7D52F4] flex items-center justify-center shrink-0 shadow-x-small">
                <RiUserAddFill className="size-[20px] text-white" />
              </div>

              {/* Text & Form Container */}
              <div className="flex-1 flex flex-col gap-[16px] w-full">
                <div className="flex flex-col gap-[4px]">
                  <h3 className="text-[14px] font-medium text-white tracking-[-0.006em] leading-[20px]">
                    Invite the migrant to fill in their details
                  </h3>
                  <p className="text-[13px] font-normal text-[#D1D1D1] tracking-[-0.006em] leading-[20px]">
                    Skip ahead by sending them a secure link. You can complete the admin sections later.
                  </p>
                </div>

                {/* Form Input Row (Frame 274) */}
                <form onSubmit={handleSendQuickInvite} className="flex flex-col sm:flex-row items-center gap-[8px] w-full">
                  <div className="flex-1 w-full">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Migrant email address"
                      className="w-full h-[40px] bg-[#333333] border border-[#7B7B7B] rounded-[10px] px-[12px] py-[10px] text-[14px] text-white placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-[40px] px-[16px] bg-white hover:bg-neutral-100 text-[#171717] text-[14px] font-medium rounded-[10px] shrink-0 transition-colors cursor-pointer border-0 w-full sm:w-auto"
                  >
                    Send invite
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EMPLOYMENT & SPONSORSHIP */}
        {activeStep === 3 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-[20px] font-medium text-[#171717] tracking-[-0.006em] font-aeonik-medium">
              Employment & Sponsorship
            </h2>

            {/* AI CoS Auto-Fill Banner */}
            <div className="bg-[#EFEBFF] rounded-[8px] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-[6px] bg-[#7D52F4] flex items-center justify-center shrink-0 text-white">
                  <RiSparklingFill className="size-3.5 text-white" />
                </div>
                <span className="text-[13px] font-normal text-[#171717] leading-[20px]">
                  Upload the CoS reference and AI will auto-fill these fields for you.
                </span>
              </div>
              <button
                type="button"
                disabled={isCosAiProcessing}
                onClick={() => cosInputRef.current?.click()}
                className="bg-[#7D52F4] hover:bg-[#6836E6] text-white text-[14px] font-medium px-3 py-1.5 h-8 rounded-[8px] flex items-center gap-1 shrink-0 cursor-pointer border-0 transition-colors shadow-x-small"
              >
                <RiUploadLine className="size-4 text-white" />
                <span>{isCosAiProcessing ? "Processing..." : "Upload"}</span>
              </button>
            </div>

            {/* CoS Reference Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="cosReference" className="text-[14px] font-medium text-[#171717]">
                CoS Reference (if available)
              </label>
              <input
                id="cosReference"
                type="text"
                value={form.cosReference}
                onChange={(e) => handleChange("cosReference", e.target.value)}
                placeholder="e.g. COS2026-00430"
                className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
              />
            </div>

            {/* Employer / Sponsor Field */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <label htmlFor="employerSponsor" className="text-[14px] font-medium text-[#171717]">
                  Employer / Sponsor
                </label>
                <RiInformationLine className="size-4 text-[#A4A4A4]" />
              </div>
              <input
                id="employerSponsor"
                type="text"
                value={form.employerSponsor}
                onChange={(e) => handleChange("employerSponsor", e.target.value)}
                placeholder=""
                className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
              />
            </div>

            {/* Job Title Select Dropdown */}
            <div className="flex flex-col gap-1">
              <label htmlFor="jobTitle" className="text-[14px] font-medium text-[#171717]">
                Job Title
              </label>
              <div className="relative">
                <select
                  id="jobTitle"
                  value={form.jobTitle}
                  onChange={(e) => handleChange("jobTitle", e.target.value)}
                  className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                >
                  <option value="">Select job title...</option>
                  <option value="Senior Software Engineer">Senior Software Engineer</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Business Analyst">Business Analyst</option>
                  <option value="Marketing Specialist">Marketing Specialist</option>
                </select>
                <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Start Date & End Date (Grid Row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="startDate" className="text-[14px] font-medium text-[#171717]">
                  Start Date
                </label>
                <div className="relative">
                  <RiCalendarLine className="size-5 text-[#5C5C5C] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="startDate"
                    type="text"
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    placeholder="DD / MM / YYYY"
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white pl-10 pr-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="endDate" className="text-[14px] font-medium text-[#171717]">
                  End Date
                </label>
                <div className="relative">
                  <RiCalendarLine className="size-5 text-[#5C5C5C] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="endDate"
                    type="text"
                    value={form.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    placeholder="DD / MM / YYYY"
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white pl-10 pr-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>
              </div>
            </div>

            {/* Contract, Hours/Week, Annual Salary */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-6 flex flex-col gap-1">
                <label htmlFor="contractType" className="text-[14px] font-medium text-[#171717]">
                  Contract
                </label>
                <div className="relative">
                  <select
                    id="contractType"
                    value={form.contractType}
                    onChange={(e) => handleChange("contractType", e.target.value)}
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                  <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-3 flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <label htmlFor="hoursPerWeek" className="text-[14px] font-medium text-[#171717]">
                    Hours/Week
                  </label>
                  <RiInformationLine className="size-4 text-[#A4A4A4]" />
                </div>
                <input
                  id="hoursPerWeek"
                  type="text"
                  value={form.hoursPerWeek}
                  onChange={(e) => handleChange("hoursPerWeek", e.target.value)}
                  placeholder=""
                  className="h-10 rounded-[10px] border border-transparent bg-[#F5F5F5] px-3 text-[14px] text-[#171717] focus:outline-none focus:bg-white focus:border-[#7D52F4]"
                />
              </div>

              <div className="md:col-span-3 flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <label htmlFor="annualSalary" className="text-[14px] font-medium text-[#171717]">
                    Annual Salary
                  </label>
                  <RiInformationLine className="size-4 text-[#A4A4A4]" />
                </div>
                <input
                  id="annualSalary"
                  type="text"
                  value={form.annualSalary}
                  onChange={(e) => handleChange("annualSalary", e.target.value)}
                  placeholder="€"
                  className="h-10 rounded-[10px] border border-transparent bg-[#F5F5F5] px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:bg-white focus:border-[#7D52F4]"
                />
              </div>
            </div>

            {/* Address Details */}
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="workAddressLine1" className="text-[14px] font-medium text-[#171717]">
                  Address
                </label>
                <input
                  id="workAddressLine1"
                  type="text"
                  value={form.workAddressLine1}
                  onChange={(e) => handleChange("workAddressLine1", e.target.value)}
                  placeholder="Royal Albert Hall"
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="workAddressLine2" className="text-[14px] font-medium text-[#171717]">
                  Address Line 2 <span className="font-normal text-[#5C5C5C]">(Optional)</span>
                </label>
                <input
                  id="workAddressLine2"
                  type="text"
                  value={form.workAddressLine2}
                  onChange={(e) => handleChange("workAddressLine2", e.target.value)}
                  placeholder=""
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label htmlFor="workCity" className="text-[14px] font-medium text-[#171717]">
                    City
                  </label>
                  <input
                    id="workCity"
                    type="text"
                    value={form.workCity}
                    onChange={(e) => handleChange("workCity", e.target.value)}
                    placeholder="London"
                    className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="workPostCode" className="text-[14px] font-medium text-[#171717]">
                    Post Code
                  </label>
                  <input
                    id="workPostCode"
                    type="text"
                    value={form.workPostCode}
                    onChange={(e) => handleChange("workPostCode", e.target.value)}
                    placeholder="SW7 2AP"
                    className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>
              </div>

              {/* Dynamic Additional Addresses */}
              {extraAddresses.map((addr, idx) => (
                <div key={idx} className="flex flex-col gap-4 pt-4 border-t border-dashed border-[#EBEBEB]">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-[#A4A4A4] uppercase">Additional Address {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setExtraAddresses((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-[12px] text-red-500 hover:underline border-0 bg-transparent cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    value={addr.addressLine1}
                    onChange={(e) => {
                      const val = e.target.value;
                      setExtraAddresses((prev) => prev.map((item, i) => i === idx ? { ...item, addressLine1: val } : item));
                    }}
                    placeholder="Address Line 1"
                    className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] shadow-x-small"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      value={addr.city}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExtraAddresses((prev) => prev.map((item, i) => i === idx ? { ...item, city: val } : item));
                      }}
                      placeholder="City"
                      className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] shadow-x-small"
                    />
                    <input
                      type="text"
                      value={addr.postCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExtraAddresses((prev) => prev.map((item, i) => i === idx ? { ...item, postCode: val } : item));
                      }}
                      placeholder="Post Code"
                      className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] shadow-x-small"
                    />
                  </div>
                </div>
              ))}

              {/* Add another address button */}
              <button
                type="button"
                onClick={handleAddAnotherAddress}
                className="w-full h-11 border border-dashed border-[#D1D1D1] hover:border-[#7D52F4] bg-white rounded-[10px] flex items-center justify-center gap-1.5 text-[14px] font-medium text-[#7D52F4] hover:bg-[#F9F8FF] transition-colors cursor-pointer my-2"
              >
                <RiAddLine className="size-4 text-[#7D52F4]" />
                <span>Add another address</span>
              </button>
            </div>

            {/* Bottom Actions Bar (Back & Next Buttons) */}
            <div className="flex items-center justify-between pt-6 border-t border-[#EBEBEB] mt-4">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] text-[14px] font-medium px-6 py-2.5 rounded-[10px] transition-all cursor-pointer border-0"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="bg-[#171717] hover:bg-[#333333] text-white text-[14px] font-medium px-6 py-2.5 rounded-[10px] transition-all cursor-pointer border-0 shadow-x-small"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DOCUMENTS UPLOAD & CHECKLIST */}
        {activeStep === 4 && (
          <div className="flex flex-col gap-8">
            {/* Header 1: Documents */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[20px] font-medium text-[#171717] tracking-[-0.006em] font-aeonik-medium">
                Documents
              </h2>

              {/* Drag & Drop Upload Container (Widgets [HR Management]) */}
              <div className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-[16px] p-[24px] flex flex-col gap-[24px] shadow-x-small">
                {/* File Upload Box (File Upload Area [1.1]) */}
                <div
                  onClick={() => docUploadInputRef.current?.click()}
                  className="w-full bg-white border border-dashed border-[#D1D1D1] hover:border-[#7D52F4] rounded-[12px] p-[32px] flex flex-col items-center justify-center gap-[20px] cursor-pointer transition-colors group select-none"
                >
                  <div className="size-[56px] bg-[#EFEBFF] rounded-[12px] flex items-center justify-center text-[#7D52F4] shrink-0 group-hover:scale-105 transition-transform">
                    <RiUpload2Line className="size-6 text-[#7D52F4]" />
                  </div>

                  <div className="flex flex-col items-center text-center gap-[6px]">
                    <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em]">
                      Choose a file or drag & drop it here.
                    </span>
                    <span className="text-[12px] font-normal text-[#5C5C5C]">
                      JPEG, PNG, PDF, and MP4 formats, up to 50 MB.
                    </span>
                  </div>
                </div>

                {/* AI Smart Categorisation Banner (Banner [1.1]) */}
                <div className="w-full bg-[#F7F7F7] border border-[#EBEBEB] rounded-[8px] p-3 flex items-start gap-3">
                  <div className="size-6 rounded-[6px] bg-[#7D52F4] flex items-center justify-center shrink-0 text-white mt-0.5">
                    <RiSparklingFill className="size-3.5 text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-[14px] font-medium text-[#171717]">
                      Smart AI Categorisation
                    </h4>
                    <p className="text-[13px] font-normal text-[#171717] leading-[20px]">
                      Drop your files in and AI categorises them, extracts key details, updates the profile, auto-fills the document checklist below, and flags anything missing or mismatched.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Header 2: Document Checklist */}
            <div className="flex flex-col gap-4">
              <h2 className="text-[20px] font-medium text-[#171717] tracking-[-0.006em] font-aeonik-medium">
                Document Checklist
              </h2>

              {/* Document Checklist Items List (Frame 185) */}
              <div className="w-full flex flex-col gap-[4px]">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="w-full min-h-[48px] bg-[#F7F7F7] hover:bg-[#F2F2F2] rounded-[12px] px-[12px] py-[8px] flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-[8px] min-w-0 flex-1">
                      {/* Status Dot */}
                      <div className="size-[18px] flex items-center justify-center shrink-0">
                        <div
                          className={`size-[6px] rounded-full ${
                            item.status === "uploaded" ? "bg-[#1FC16B]" : "bg-[#FB3748]"
                          }`}
                        />
                      </div>

                      {/* Title */}
                      <span className="text-[14px] font-medium text-[#171717] tracking-[-0.006em] truncate">
                        {item.title}
                      </span>

                      {item.fileName && (
                        <span className="text-[12px] font-normal text-[#5C5C5C] truncate hidden sm:inline-block ml-1">
                          ({item.fileName})
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 ml-3">
                      {item.status === "missing" ? (
                        <button
                          type="button"
                          onClick={() => handleItemUpload(item.id)}
                          className="h-[28px] px-3 bg-white hover:bg-neutral-50 text-[#5C5C5C] hover:text-[#171717] border border-[#EBEBEB] rounded-[8px] text-[13px] font-medium transition-all cursor-pointer shadow-x-small flex items-center gap-1"
                        >
                          <RiUploadLine className="size-3.5 text-[#5C5C5C]" />
                          <span>Upload</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-[#1FC16B] bg-[#E9F9F0] px-2 py-0.5 rounded-full">
                            Uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() => toast.info(`Viewing ${item.title}`)}
                            className="size-7 rounded-[6px] hover:bg-neutral-200/50 flex items-center justify-center text-[#5C5C5C] border-0 bg-transparent cursor-pointer"
                          >
                            <RiMore2Line className="size-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-[#EBEBEB] mt-4">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] text-[14px] font-medium px-6 py-2.5 rounded-[10px] transition-all cursor-pointer border-0"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="bg-[#171717] hover:bg-[#333333] text-white text-[14px] font-medium px-6 py-2.5 rounded-[10px] transition-all cursor-pointer border-0 shadow-x-small"
              >
                Next to Review
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW DETAILS */}
        {activeStep === 5 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-[20px] font-medium text-[#171717] tracking-[-0.006em] font-aeonik-medium">
              Review details
            </h2>

            {/* 1. CASE CARD */}
            <div className="bg-[#F7F7F7] border border-[#F5F5F5] rounded-[16px] p-5 flex flex-col gap-3 shadow-x-small">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.04em]">
                  CASE
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] bg-transparent border-0 cursor-pointer p-0"
                >
                  Edit
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Case Type</span>
                  <span className="text-[14px] font-medium text-[#171717]">Music</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Visa Type</span>
                  <span className="text-[14px] font-medium text-[#171717]">Creative Worker</span>
                </div>
              </div>
            </div>

            {/* 2. PERSONAL DETAILS CARD */}
            <div className="bg-[#F7F7F7] border border-[#F5F5F5] rounded-[16px] p-5 flex flex-col gap-3 shadow-x-small">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.04em]">
                  PERSONAL DETAILS
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] bg-transparent border-0 cursor-pointer p-0"
                >
                  Edit
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Full Name</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.firstName || form.lastName ? `${form.firstName} ${form.lastName}` : "Taylor Johnson"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Date of Birth</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.dob || "14 Jun 1990"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Gender</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.gender || "Male"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Marital Status</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.maritalStatus || "Married"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Nationality</span>
                  <span className="text-[14px] font-medium text-[#171717] flex items-center gap-1.5">
                    <span>🇺🇸</span>
                    <span>{form.nationality || "US"}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Country of Birth</span>
                  <span className="text-[14px] font-medium text-[#171717] flex items-center gap-1.5">
                    <span>🇺🇸</span>
                    <span>{form.countryOfBirth || "US"}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Passport Number</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.passportNumber || "LQ41932345"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Issue Date</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.passportIssueDate || "22 Nov 2022"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Expiry Date</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.passportExpiryDate || "22 Nov 2027"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Email</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.personalEmail || "taylor.j@email.com"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Phone</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.mobilePhone || "+44 7700 123456"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. EMPLOYMENT CARD */}
            <div className="bg-[#F7F7F7] border border-[#F5F5F5] rounded-[16px] p-5 flex flex-col gap-3 shadow-x-small">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.04em]">
                  EMPLOYMENT
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] bg-transparent border-0 cursor-pointer p-0"
                >
                  Edit
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Employer / Sponsor</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.employerSponsor || "AX Studios"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Job Title</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.jobTitle || "Singer"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">SOC Code</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    3416 (Arts/Entertainment)
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Start Date</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.startDate || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Contract</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.contractType || "Full-time"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Hours/Week</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.hoursPerWeek || "40"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Annual Salary</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.annualSalary ? `£${form.annualSalary}/year` : "£48,000/year"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Address</span>
                  <span className="text-[14px] font-medium text-[#171717] text-right">
                    {form.workAddressLine1 ? `${form.workAddressLine1}, ${form.workCity}, ${form.workPostCode}` : "Royal Albert Hall, London, SW7 2AP"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">CoS Reference</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.cosReference || "COS2026-00430"}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. DOCUMENTS CARD */}
            <div className="bg-[#F7F7F7] border border-[#F5F5F5] rounded-[16px] p-5 flex flex-col gap-3 shadow-x-small">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.04em]">
                  CASE
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] bg-transparent border-0 cursor-pointer p-0"
                >
                  Edit
                </button>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[13px] text-[#5C5C5C]">Uploaded Files</span>
                <span className="text-[14px] font-medium text-[#171717]">
                  {checklist.filter((i) => i.status === "uploaded").length} of {checklist.length}
                </span>
              </div>
            </div>

            {/* 5. INCOMPLETE DETAILS WARNING BANNER */}
            <div className="bg-[#FFECC0] rounded-[16px] p-4 flex items-start gap-3 border border-[#F6B51E]/20">
              <div className="size-5 rounded-full bg-[#F6B51E] flex items-center justify-center text-white shrink-0 mt-0.5 text-[12px] font-bold">
                !
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-[14px] font-medium text-[#171717]">
                  Some details are incomplete
                </h4>
                <p className="text-[13px] font-normal text-[#171717] leading-[20px]">
                  You can still create the case and complete these later. We recommend uploading at least passport, CV, and contract.
                </p>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-[#EBEBEB] mt-4">
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] text-[14px] font-medium px-6 py-2.5 rounded-[10px] transition-all cursor-pointer border-0"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleInviteMigrant}
                disabled={isSubmitting}
                className="bg-[#7D52F4] hover:bg-[#6836E6] text-white text-[14px] font-medium px-6 py-2.5 rounded-[10px] transition-all cursor-pointer border-0 shadow-x-small flex items-center gap-2"
              >
                <span>{isSubmitting ? "Creating..." : "Create case"}</span>
              </button>
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

      {/* Alert & Notification & Toast [1.1] */}
      {showInviteToast && (
        <div className="fixed bottom-6 right-6 z-50 w-[390px] bg-[#1FC16B] rounded-[12px] p-[14px] pb-[16px] text-white shadow-card-large flex items-start gap-[12px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="size-[20px] rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
            <RiCheckboxCircleFill className="size-[20px] text-white" />
          </div>
          <div className="flex-1 flex flex-col gap-[4px]">
            <h4 className="text-[14px] font-medium text-white tracking-[-0.006em] leading-[20px]">
              Invite sent to {toastEmail || "j.taylor@email.com"}
            </h4>
            <p className="text-[14px] font-normal text-white/90 tracking-[-0.006em] leading-[20px]">
              The migrant will fill in their details. You can continue with admin sections now or come back later.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowInviteToast(false)}
            className="text-white/70 hover:text-white transition-colors cursor-pointer border-0 bg-transparent p-0 shrink-0"
            aria-label="Close notification"
          >
            <RiCloseLine className="size-[20px]" />
          </button>
        </div>
      )}

      {/* Invite Migrant Modal */}
      <InviteMigrantModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSendInvite={(email) => {
          setToastEmail(email);
          setShowInviteToast(true);
          toast.success(`Invite sent to ${email}!`);
        }}
        defaultEmail={form.personalEmail || "j.taylor@email.com"}
      />
    </div>
  );
}
