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
  RiIdCardLine,
  RiSendPlane2Line,
  RiAtLine,
  RiCalendarCheckLine,
  RiPlaneLine,
  RiFileList3Line,
  RiQuillPenLine,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { getTokenPayload } from "@/lib/auth";
import { toast } from "sonner";
import { InviteMigrantModal } from "@/components/InviteMigrantModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  socCode: string;

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
  { id: "passport", title: "Passport", status: "missing" },
  { id: "passport_photo", title: "Passport Photo", status: "missing" },
  { id: "cv", title: "CV / Profile documents", status: "missing" },
  { id: "signed_docs", title: "Migrant signed docs", status: "missing" },
  { id: "employment_contract", title: "Employment contract", status: "missing" },
  { id: "sponsorship_agreement", title: "Sponsorship agreement", status: "missing" },
  { id: "flight_details", title: "Flight / Travel details", status: "missing" },
  { id: "accommodation", title: "Hotel / Accommodation", status: "missing" },
  { id: "proof_english", title: "Proof of English", status: "missing" },
  { id: "bank_statement", title: "Bank Statement", status: "missing" },
];

function formatToIsoDate(dateStr: string): string | null {
  if (!dateStr || !dateStr.trim()) return null;
  const cleaned = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    const [y, m, d] = cleaned.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
      return cleaned;
    }
    return null;
  }
  const parts = cleaned.split(/[\/\-\s]+/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (
      !isNaN(day) &&
      !isNaN(month) &&
      !isNaN(year) &&
      year >= 1900 &&
      year <= 2100 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
    ) {
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
        const mm = String(month).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        return `${year}-${mm}-${dd}`;
      }
    }
  }
  return null;
}

function QuickInvitePanel({
  inviteEmail,
  setInviteEmail,
  onSendInvite,
  isSending,
}: {
  inviteEmail: string;
  setInviteEmail: (val: string) => void;
  onSendInvite: (e: React.FormEvent) => void;
  isSending: boolean;
}) {
  return (
    <div className="w-full max-w-[728px] mx-auto bg-[#262626] rounded-[16px] p-[24px] pb-[26px] flex flex-col md:flex-row items-start gap-[12px] shadow-card-large mt-4">
      <div className="size-[40px] rounded-full bg-[#7D52F4] flex items-center justify-center shrink-0 shadow-x-small">
        <RiUserAddFill className="size-[20px] text-white" />
      </div>

      <div className="flex-1 flex flex-col gap-[16px] w-full">
        <div className="flex flex-col gap-[4px]">
          <h3 className="text-[14px] font-medium text-white tracking-[-0.006em] leading-[20px]">
            Invite the migrant to fill in their details
          </h3>
          <p className="text-[13px] font-normal text-[#D1D1D1] tracking-[-0.006em] leading-[20px]">
            Skip ahead by sending them a secure link. You can complete the admin sections later.
          </p>
        </div>

        <form onSubmit={onSendInvite} className="flex flex-col sm:flex-row items-center gap-[8px] w-full">
          <div className="flex-1 w-full">
            <Label htmlFor="quickInviteEmail" className="sr-only">
              Migrant email address
            </Label>
            <input
              id="quickInviteEmail"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Migrant email address"
              className="w-full h-[40px] bg-[#333333] border border-[#7B7B7B] rounded-[10px] px-[12px] py-[10px] text-[14px] text-white placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4]"
            />
          </div>
          <button
            type="submit"
            disabled={isSending}
            className="h-[40px] px-[16px] bg-white hover:bg-neutral-100 text-[#171717] text-[14px] font-medium rounded-[10px] shrink-0 transition-colors cursor-pointer border-0 w-full sm:w-auto disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send invite"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AddMigrantPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState<number>(1);
  const [viewMode, setViewMode] = React.useState<"admin" | "user">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get("view") || params.get("mode");
      if (urlView === "user") return "user";
      if (urlView === "admin") return "admin";
    }
    return "admin";
  });
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = React.useState(false);
  const [isSendingInvite, setIsSendingInvite] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const passportInputRef = React.useRef<HTMLInputElement | null>(null);
  const cosInputRef = React.useRef<HTMLInputElement | null>(null);
  const docUploadInputRef = React.useRef<HTMLInputElement | null>(null);
  const itemFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const activeUploadItemIdRef = React.useRef<string | null>(null);
  const cosTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const [checklist, setChecklist] = React.useState<ChecklistItem[]>(defaultChecklist);

  React.useEffect(() => {
    let isMounted = true;

    async function checkUserIdentity() {
      try {
        const payload = getTokenPayload();
        let userRole = payload?.role ? String(payload.role).toLowerCase() : "";

        if (!userRole) {
          interface UserInfoRes {
            email?: string;
            role?: { value?: string } | string;
          }
          const res = await apiClient.get<any>(ENDPOINTS.users.userInfo);
          const userData: UserInfoRes | undefined = res?.data?.data || res?.data;
          if (userData) {
            const r = typeof userData.role === "object" ? userData.role?.value || "" : userData.role || "";
            userRole = String(r).toLowerCase();
          }
        }

        if (!isMounted) return;

        if (userRole === "migrant" || userRole === "user" || userRole === "applicant") {
          setViewMode("user");
        } else if (
          userRole === "superadmin" ||
          userRole === "supervisor" ||
          userRole === "admin" ||
          userRole === "employee"
        ) {
          setViewMode("admin");
        }
      } catch {
        // Retain default view
      }
    }

    checkUserIdentity();

    return () => {
      isMounted = false;
    };
  }, []);

  // Clean up timers on unmount
  React.useEffect(() => {
    return () => {
      if (cosTimerRef.current) clearTimeout(cosTimerRef.current);
    };
  }, []);

  const handleDroppedFiles = async (files: FileList | null, targetItemId?: string) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "video/mp4",
    ];
    const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".pdf", ".mp4", ".webp"];

    for (const file of fileArray) {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS.includes(ext);
      if (!isValidType) {
        toast.error(`File "${file.name}" is an unsupported format.`);
        if (docUploadInputRef.current) docUploadInputRef.current.value = "";
        if (itemFileInputRef.current) itemFileInputRef.current.value = "";
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the 50 MB limit.`);
        if (docUploadInputRef.current) docUploadInputRef.current.value = "";
        if (itemFileInputRef.current) itemFileInputRef.current.value = "";
        return;
      }
    }

    toast.info(`Uploading ${fileArray.length} file(s)...`);
    try {
      const formData = new FormData();
      fileArray.forEach((file) => formData.append("file", file));
      await apiClient.post(ENDPOINTS.files.upload, formData);
      toast.success("File(s) uploaded successfully!");
    } catch {
      toast.error("Failed to upload document to server.");
      if (docUploadInputRef.current) docUploadInputRef.current.value = "";
      if (itemFileInputRef.current) itemFileInputRef.current.value = "";
      return;
    }

    setChecklist((prev) => {
      let updated = [...prev];
      if (targetItemId) {
        updated = updated.map((item) =>
          item.id === targetItemId
            ? { ...item, status: "uploaded" as const, fileName: fileArray[0].name }
            : item
        );
      } else {
        fileArray.forEach((file) => {
          const firstMissingIndex = updated.findIndex((item) => item.status === "missing");
          if (firstMissingIndex !== -1) {
            updated[firstMissingIndex] = {
              ...updated[firstMissingIndex],
              status: "uploaded" as const,
              fileName: file.name,
            };
          }
        });
      }
      return updated;
    });

    if (docUploadInputRef.current) docUploadInputRef.current.value = "";
    if (itemFileInputRef.current) itemFileInputRef.current.value = "";
  };

  const handleDocDropSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleDroppedFiles(e.target.files);
  };

  const handleItemFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const itemId = activeUploadItemIdRef.current;
    if (itemId && e.target.files) {
      handleDroppedFiles(e.target.files, itemId);
    }
  };

  const handleItemUpload = (itemId: string) => {
    activeUploadItemIdRef.current = itemId;
    itemFileInputRef.current?.click();
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCosAiProcessing, setIsCosAiProcessing] = React.useState(false);

  // Additional work addresses state with stable IDs
  const [extraAddresses, setExtraAddresses] = React.useState<
    Array<{ id: string; addressLine1: string; city: string; postCode: string }>
  >([]);

  const handleAddAnotherAddress = () => {
    setExtraAddresses((prev) => [
      ...prev,
      {
        id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        addressLine1: "",
        city: "",
        postCode: "",
      },
    ]);
    toast.info("New work address field added.");
  };

  // Step 1 Invite Email & Toast States
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [showInviteToast, setShowInviteToast] = React.useState(false);
  const [toastEmail, setToastEmail] = React.useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);

  // Auto-dismiss invite toast notification
  React.useEffect(() => {
    if (!showInviteToast) return;
    const timer = setTimeout(() => setShowInviteToast(false), 5000);
    return () => clearTimeout(timer);
  }, [showInviteToast]);

  const handleSendQuickInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    const targetEmail = inviteEmail.trim();
    try {
      await apiClient.post(ENDPOINTS.employees.sendRegistrationLink, { email: targetEmail });
      setToastEmail(targetEmail);
      setShowInviteToast(true);
      setInviteEmail("");
    } catch {
      toast.error("Failed to send invite request.");
    }
  };

  // CoS Upload AI Simulation
  const handleCosUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCosAiProcessing(true);
      toast.info("Processing CoS document (demo mode)...");
      if (cosTimerRef.current) clearTimeout(cosTimerRef.current);
      cosTimerRef.current = setTimeout(() => {
        setIsCosAiProcessing(false);
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
    startDate: "",
    endDate: "",
    contractType: "",
    hoursPerWeek: "",
    annualSalary: "",
    workAddressLine1: "",
    workAddressLine2: "",
    workCity: "",
    workPostCode: "",
    socCode: "3416",
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

  // Autosave form to draft whenever form changes (debounced & excluding sensitive identity fields)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const { passportNumber, dob, personalEmail, mobilePhone, ...nonSensitive } = form;
        localStorage.setItem("viems_add_migrant_draft", JSON.stringify(nonSensitive));
      } catch {
        // Ignore localStorage write errors
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form]);

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

    if (!form.firstName.trim() || !form.lastName.trim() || !form.passportNumber.trim()) {
      toast.error("Please complete required personal identity details (First Name, Last Name, Passport Number) before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      toast.info("Creating migrant record...");

      const payload = {
        first_name: form.firstName.trim() || null,
        last_name: form.lastName.trim() || null,
        gender: form.gender ? form.gender.toUpperCase() : null,
        date_of_birth: formatToIsoDate(form.dob),
        marital_status: form.maritalStatus || null,
        nationality: form.nationality || null,
        country_of_birth: form.countryOfBirth || null,
        city_of_birth: form.cityOfBirth || null,
        contacts: {
          email: form.personalEmail || null,
          mobile_phone: form.mobilePhone || null,
          address_line_1: form.addressLine1 || null,
          address_line_2: form.addressLine2 || null,
          city: form.city || null,
          post_code: form.postCode || null,
          country: form.country || null,
          emergency_contact_name: form.emergencyName || null,
          emergency_contact_relationship: form.emergencyRelationship || null,
          emergency_contact_email: form.emergencyEmail || null,
          emergency_contact_phone: form.emergencyPhone || null,
        },
        passport: {
          passport_number: form.passportNumber.trim() || null,
          issue_date: formatToIsoDate(form.passportIssueDate),
          expiry_date: formatToIsoDate(form.passportExpiryDate),
        },
        employment: {
          employer_sponsor: form.employerSponsor || null,
          job_title: form.jobTitle || null,
          soc_code: form.socCode || "3416",
          start_date: formatToIsoDate(form.startDate),
          end_date: formatToIsoDate(form.endDate),
          contract_type: form.contractType || null,
          hours_per_week: form.hoursPerWeek || null,
          annual_salary: form.annualSalary || null,
          cos_reference: form.cosReference || null,
          additional_addresses: extraAddresses.map(({ id, ...rest }) => rest),
        },
        checklist_summary: checklist.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          fileName: c.fileName || null,
        })),
      };

      await apiClient.post(ENDPOINTS.migrants.base, payload);

      try {
        localStorage.removeItem("viems_add_migrant_draft");
      } catch {
        // Ignore localStorage removal errors
      }

      toast.success("Migrant record created successfully!");
      router.push("/migrants");
    } catch {
      toast.error("Failed to create migrant record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-full bg-[#F5F5F5] text-[#171717] font-sans pb-16 flex flex-col flex-1">
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
      <input
        type="file"
        ref={itemFileInputRef}
        onChange={handleItemFileSelected}
        accept="image/*,.pdf,.png,.jpg,.jpeg,.mp4"
        className="hidden"
      />

      {/* Top Bar Header (Figma Frame 244 / Frame 108) */}
      <header className="w-full border-b border-[#EBEBEB] bg-white sticky top-0 z-30 px-8 lg:px-[64px] py-4 lg:py-[32px]">
        <div className="max-w-[1368px] mx-auto h-10 flex items-center justify-between gap-[24px]">
          {/* Left Section (Frame 2087326933) */}
          <div className="w-[266px] h-10 flex items-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="h-10 px-[10px] text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors border-0 bg-transparent cursor-pointer flex items-center gap-1 font-sans"
            >
              Cancel
            </button>
          </div>

          {/* Center Section (Title: Add migrant) */}
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-[24px] leading-[32px] font-medium text-[#171717] tracking-[-0.01em] font-aeonik-medium text-center">
              Add migrant
            </h1>
          </div>

          {/* Right Section (Frame 265 Action Buttons) */}
          <div className="w-[266px] h-10 flex items-center justify-end gap-[8px]">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-[115px] h-10 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] rounded-[10px] text-[14px] font-medium transition-all cursor-pointer border-0 flex items-center justify-center"
            >
              Save as draft
            </button>

            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="w-[143px] h-10 bg-[#7D52F4] hover:bg-[#6836E6] text-white rounded-[10px] text-[14px] font-medium transition-all cursor-pointer border-0 flex items-center justify-center gap-[4px] shadow-x-small"
            >
              <RiShareBoxFill className="size-5 text-white shrink-0" />
              <span>Invite migrant</span>
            </button>
          </div>
        </div>
      </header>

      {/* Step Indicator Stepper */}
      <div className="w-full bg-[#F5F5F5] pt-6 pb-4 border-b border-[#EBEBEB] mb-2">
        <div className="max-w-[728px] mx-auto flex items-center justify-between">
          {/* Step 1: Get started */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            aria-current={activeStep === 1 ? "step" : undefined}
            className="flex items-center gap-xs cursor-pointer border-0 bg-transparent p-0 group transition-all hover:opacity-90"
          >
            <div
              className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 transition-all ${
                activeStep === 1
                  ? "bg-[#171717] text-white"
                  : activeStep > 1
                  ? "bg-[#7D52F4] text-white group-hover:bg-[#683fd1]"
                  : "bg-[#EBEBEB] text-[#5C5C5C] group-hover:bg-neutral-300"
              }`}
            >
              {activeStep > 1 ? <RiCheckLine className="size-3.5 text-white" /> : "1"}
            </div>
            <span
              className={`text-[14px] font-medium transition-colors ${
                activeStep === 1 ? "text-[#171717]" : "text-[#5C5C5C] group-hover:text-[#171717]"
              }`}
            >
              {viewMode === "admin" ? "Get started" : "Welcome"}
            </span>
          </button>

          <div className="h-[1px] w-8 bg-[#EBEBEB]" />

          {/* Step 2: Personal details */}
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            aria-current={activeStep === 2 ? "step" : undefined}
            className="flex items-center gap-xs cursor-pointer border-0 bg-transparent p-0 group transition-all hover:opacity-90"
          >
            <div
              className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 transition-all ${
                activeStep === 2
                  ? "bg-[#171717] text-white"
                  : activeStep > 2
                  ? "bg-[#7D52F4] text-white group-hover:bg-[#683fd1]"
                  : "bg-[#EBEBEB] text-[#5C5C5C] group-hover:bg-neutral-300"
              }`}
            >
              {activeStep > 2 ? <RiCheckLine className="size-3.5 text-white" /> : "2"}
            </div>
            <span
              className={`text-[14px] font-medium transition-colors ${
                activeStep === 2 ? "text-[#171717]" : "text-[#5C5C5C] group-hover:text-[#171717]"
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
            className="flex items-center gap-xs cursor-pointer border-0 bg-transparent p-0 group transition-all hover:opacity-90"
          >
            <div
              className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 transition-all ${
                activeStep === 3
                  ? "bg-[#171717] text-white"
                  : activeStep > 3
                  ? "bg-[#7D52F4] text-white group-hover:bg-[#683fd1]"
                  : "bg-[#EBEBEB] text-[#5C5C5C] group-hover:bg-neutral-300"
              }`}
            >
              {activeStep > 3 ? <RiCheckLine className="size-3.5 text-white" /> : "3"}
            </div>
            <span
              className={`text-[14px] transition-colors ${
                activeStep === 3 ? "font-medium text-[#171717]" : "font-normal text-[#5C5C5C] group-hover:text-[#171717]"
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
            className="flex items-center gap-xs cursor-pointer border-0 bg-transparent p-0 group transition-all hover:opacity-90"
          >
            <div
              className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 transition-all ${
                activeStep === 4
                  ? "bg-[#171717] text-white"
                  : activeStep > 4
                  ? "bg-[#7D52F4] text-white group-hover:bg-[#683fd1]"
                  : "bg-[#EBEBEB] text-[#5C5C5C] group-hover:bg-neutral-300"
              }`}
            >
              {activeStep > 4 ? <RiCheckLine className="size-3.5 text-white" /> : "4"}
            </div>
            <span
              className={`text-[14px] transition-colors ${
                activeStep === 4 ? "font-medium text-[#171717]" : "font-normal text-[#5C5C5C] group-hover:text-[#171717]"
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
            className="flex items-center gap-xs cursor-pointer border-0 bg-transparent p-0 group transition-all hover:opacity-90"
          >
            <div
              className={`size-5 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 transition-all ${
                activeStep === 5 ? "bg-[#171717] text-white" : "bg-[#EBEBEB] text-[#5C5C5C] group-hover:bg-neutral-300"
              }`}
            >
              5
            </div>
            <span
              className={`text-[14px] transition-colors ${
                activeStep === 5 ? "font-medium text-[#171717]" : "font-normal text-[#5C5C5C] group-hover:text-[#171717]"
              }`}
            >
              {viewMode === "admin" ? "Review & Create" : "Review & Submit"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[768px] w-full mx-auto flex flex-col gap-6 px-8 py-8 bg-white rounded-[16px] shadow-x-small border border-neutral-200/20 my-6">
        {/* Step Title (hidden for Step 1 as Step 1 has its own hero title) */}
        {activeStep !== 1 && (
          <h2 className="text-[20px] font-medium text-[#171717] tracking-[-0.006em] font-aeonik-medium">
            {activeStep === 2
              ? "Personal details"
              : activeStep === 3
              ? "Employment details"
              : activeStep === 4
              ? "Documents upload"
              : "Review & Create"}
          </h2>
        )}

        {/* STEP 2: PERSONAL DETAILS FORM */}
        {activeStep === 2 && (
          <div className="flex flex-col gap-6">
            {/* AI Passport Auto-Fill Banner */}
            <div className="bg-[#EFEBFF] rounded-[8px] p-3 px-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-[6px] bg-[#7D52F4] flex items-center justify-center shrink-0 text-white">
                  <RiFileTextLine className="size-3.5 text-white" />
                </div>
                <span className="text-[13px] font-normal text-[#171717] leading-[20px]">
                  Upload a passport and AI will auto-fill these fields for you.
                </span>
              </div>
              <button
                type="button"
                disabled={isAiProcessing}
                onClick={() => passportInputRef.current?.click()}
                className="bg-[#7D52F4] hover:bg-[#6836E6] text-white text-[14px] font-medium px-3 py-1.5 h-8 rounded-[8px] flex items-center gap-1.5 shrink-0 cursor-pointer border-0 transition-colors shadow-x-small"
              >
                <RiUpload2Line className="size-4 text-white" />
                <span>{isAiProcessing ? "Processing..." : "Upload"}</span>
              </button>
            </div>

            {/* Photo Upload Card */}
            <div className="bg-[#F5F5F5] rounded-[8px] p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-[80px] h-[88px] bg-white border border-dashed border-[#D1D1D1] rounded-[8px] flex items-center justify-center shrink-0 overflow-hidden relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Avatar" className="w-full h-full object-cover" />
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
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border border-[#D1D1D1] hover:bg-neutral-50 text-[#5C5C5C] text-[14px] font-medium px-4 py-2 h-9 rounded-[8px] shrink-0 cursor-pointer shadow-x-small transition-colors"
              >
                Upload photo
              </button>
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <Label htmlFor="firstName" className="text-[14px] font-medium text-[#171717]">
                  First Name
                </Label>
                <input
                  id="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder=""
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="lastName" className="text-[14px] font-medium text-[#171717]">
                  Last Name
                </Label>
                <input
                  id="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder=""
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>
            </div>

            {/* Date of Birth & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <Label htmlFor="dob" className="text-[14px] font-medium text-[#171717]">
                  Date of Birth
                </Label>
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
                <Label htmlFor="gender" className="text-[14px] font-medium text-[#171717]">
                  Gender
                </Label>
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
                <Label htmlFor="maritalStatus" className="text-[14px] font-medium text-[#171717]">
                  Marital Status
                </Label>
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
                <Label htmlFor="nationality" className="text-[14px] font-medium text-[#171717]">
                  Nationality
                </Label>
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
                <Label htmlFor="countryOfBirth" className="text-[14px] font-medium text-[#171717]">
                  Country of Birth
                </Label>
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

            {/* Passport Number, Issue Date & Expiry Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <Label htmlFor="passportNumber" className="text-[14px] font-medium text-[#171717]">
                  Passport Number
                </Label>
                <input
                  id="passportNumber"
                  type="text"
                  value={form.passportNumber}
                  onChange={(e) => handleChange("passportNumber", e.target.value)}
                  placeholder="Enter passport number"
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="passportIssueDate" className="text-[14px] font-medium text-[#171717]">
                  Issue Date
                </Label>
                <div className="relative">
                  <RiCalendarLine className="size-5 text-[#A4A4A4] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="passportIssueDate"
                    type="text"
                    value={form.passportIssueDate}
                    onChange={(e) => handleChange("passportIssueDate", e.target.value)}
                    placeholder="DD / MM / YYYY"
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white pl-10 pr-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="passportExpiryDate" className="text-[14px] font-medium text-[#171717]">
                  Expiry Date
                </Label>
                <div className="relative">
                  <RiCalendarLine className="size-5 text-[#A4A4A4] absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    id="passportExpiryDate"
                    type="text"
                    value={form.passportExpiryDate}
                    onChange={(e) => handleChange("passportExpiryDate", e.target.value)}
                    placeholder="DD / MM / YYYY"
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white pl-10 pr-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  />
                </div>
              </div>
            </div>

            {/* Email Address & Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <Label htmlFor="personalEmail" className="text-[14px] font-medium text-[#171717]">
                  Email Address
                </Label>
                <input
                  id="personalEmail"
                  type="email"
                  value={form.personalEmail}
                  onChange={(e) => handleChange("personalEmail", e.target.value)}
                  placeholder="e.g. name@example.com"
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="mobilePhone" className="text-[14px] font-medium text-[#171717]">
                  Phone Number
                </Label>
                <input
                  id="mobilePhone"
                  type="tel"
                  value={form.mobilePhone}
                  onChange={(e) => handleChange("mobilePhone", e.target.value)}
                  placeholder="e.g. +1 555-555-5555"
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: GET STARTED / WELCOME LANDING */}
        {activeStep === 1 && viewMode === "admin" && (
          <div className="w-full flex flex-col items-center justify-center py-4 gap-8">
            {/* Admin View Hero Header */}
            <div className="flex flex-col items-center text-center max-w-[586px] mx-auto">
              <h2 className="text-[32px] leading-[36px] font-medium text-[#171717] text-center font-aeonik-medium tracking-[-0.01em]">
                New sponsorship case
              </h2>
              <p className="text-[16px] font-normal text-[#5C5C5C] leading-[24px] tracking-[-0.011em] max-w-[446px] mx-auto mt-2">
                Invite the migrant to complete their details, or fill everything in yourself. Either way works.
              </p>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center gap-[11px] mt-6 mb-6">
                <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#F5F5F5] rounded-full">
                  <RiFlashlightFill className="size-4 text-[#7B7B7B] shrink-0" />
                  <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em] leading-[12px]">
                    10–15 MINS TO COMPLETE
                  </span>
                </div>

                <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#F5F5F5] rounded-full">
                  <RiSaveFill className="size-4 text-[#7B7B7B] shrink-0" />
                  <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em] leading-[12px]">
                    PROGRESS SAVES AUTOMATICALLY
                  </span>
                </div>

                <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#F5F5F5] rounded-full">
                  <RiShieldFill className="size-4 text-[#7B7B7B] shrink-0" />
                  <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em] leading-[12px]">
                    ENCRYPTED &amp; PRIVATE
                  </span>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="flex justify-center mb-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="h-[40px] px-[20px] bg-[#7D52F4] hover:bg-[#6836E6] text-white text-[14px] font-medium rounded-[10px] transition-all cursor-pointer border-0 shadow-x-small flex items-center justify-center"
                >
                  Get started
                </button>
              </div>
            </div>

            {/* Dark Banner Card for Quick Invite */}
            <QuickInvitePanel
              inviteEmail={inviteEmail}
              setInviteEmail={setInviteEmail}
              onSendInvite={handleSendQuickInvite}
              isSending={isSendingInvite}
            />
          </div>
        )}

        {/* STEP 1: USER VIEW (MIGRANT VISA APPLICATION LANDING) */}
        {activeStep === 1 && viewMode === "user" && (
          <div className="w-full flex flex-col items-center justify-center py-2 gap-12">
            {/* Hero Header & Badges */}
            <div className="flex flex-col items-center text-center max-w-[586px] mx-auto">
              <h1 className="text-[40px] leading-[44px] font-medium text-[#7D52F4] text-center font-aeonik-medium tracking-[-0.01em]">
                Viems has invited you to complete your visa application
              </h1>
              <p className="text-[16px] font-normal text-[#5C5C5C] leading-[24px] tracking-[-0.011em] max-w-[446px] mx-auto mt-3">
                This should take around 10-15 minutes.
              </p>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center gap-[11px] mt-6 mb-6">
                <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#F5F5F5] rounded-full">
                  <RiFlashlightFill className="size-4 text-[#7B7B7B] shrink-0" />
                  <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em] leading-[12px]">
                    10–15 MINS TO COMPLETE
                  </span>
                </div>

                <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#F5F5F5] rounded-full">
                  <RiSaveFill className="size-4 text-[#7B7B7B] shrink-0" />
                  <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em] leading-[12px]">
                    PROGRESS SAVES AUTOMATICALLY
                  </span>
                </div>

                <div className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-[#F5F5F5] rounded-full">
                  <RiShieldFill className="size-4 text-[#7B7B7B] shrink-0" />
                  <span className="text-[11px] font-medium text-[#7B7B7B] uppercase tracking-[0.02em] leading-[12px]">
                    ENCRYPTED &amp; PRIVATE
                  </span>
                </div>
              </div>

              {/* Primary Action Button */}
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

            {/* Section 1: Three steps; you handle the first two */}
            <div className="w-full flex flex-col items-center gap-6">
              <div className="flex flex-col items-center text-center max-w-[586px] mx-auto gap-2">
                <h2 className="text-[40px] leading-[44px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
                  Three steps; you handle the first two
                </h2>
                <p className="text-[16px] leading-[24px] font-normal text-[#5C5C5C] tracking-[-0.011em]">
                  Your sponsor takes over once you submit. You can save and return any time. Nothing is sent until you&apos;re ready.
                </p>
              </div>

              {/* 3 Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-[728px]">
                {/* Card 1 */}
                <div className="bg-[#F5F5F5] rounded-[16px] p-6 flex flex-col items-start gap-6">
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

                {/* Card 2 */}
                <div className="bg-[#F5F5F5] rounded-[16px] p-6 flex flex-col items-start gap-6">
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

                {/* Card 3 */}
                <div className="bg-[#F5F5F5] rounded-[16px] p-6 flex flex-col items-start gap-6">
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

            {/* Section 2: Gather these before you start */}
            <div className="w-full flex flex-col gap-6 max-w-[728px] mx-auto">
              <div className="flex flex-col gap-2">
                <h2 className="text-[40px] leading-[44px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
                  Gather these before you start
                </h2>
                <p className="text-[16px] leading-[24px] font-normal text-[#5C5C5C] tracking-[-0.011em] max-w-[586px]">
                  Some documents you&apos;ll have already. Others you may need a few minutes to find or generate. Your sponsor handles the rest.
                </p>
              </div>

              {/* Group 1: Have ready */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                    Have ready
                  </h3>
                  <span className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                    2 items (already in your pocket)
                  </span>
                </div>
                <div className="bg-[#F5F5F5] rounded-[16px] p-6 flex flex-col gap-4">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3">
                    <RiFileTextLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        Valid passport
                      </span>
                      <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                        You will need your passport number, expiry date, and nationality. A colour scan of the bio-data page will be needed in the next step.
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-[#EBEBEB]" />
                  {/* Item 2 */}
                  <div className="flex items-start gap-3">
                    <RiAtLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        Email address and phone number
                      </span>
                      <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                        We will use your email to send confirmations and your phone as a backup contact. Include your country code.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: You may need to obtain */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                    You may need to obtain
                  </h3>
                  <span className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                    2 items (gotta be ready)
                  </span>
                </div>
                <div className="bg-[#F5F5F5] rounded-[16px] p-6 flex flex-col gap-4">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3">
                    <RiCalendarCheckLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        Posters, schedule, or performance dates
                      </span>
                      <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                        Event posters, engagement schedules, or booking confirmations showing where you&apos;re performing in the UK.
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-[#EBEBEB]" />
                  {/* Item 2 */}
                  <div className="flex items-start gap-3">
                    <RiPlaneLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        Flight and accommodation
                      </span>
                      <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                        Booking confirmations for your flights and where you&apos;ll be staying — hotel, tenancy, or a letter from your host.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 3: Your sponsor will provide */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                    Your sponsor will provide
                  </h3>
                  <span className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                    2 items (check your inbox)
                  </span>
                </div>
                <div className="bg-[#F5F5F5] rounded-[16px] p-6 flex flex-col gap-4">
                  {/* Item 1 */}
                  <div className="flex items-start gap-3">
                    <RiFileList3Line className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        Signed declaration &amp; consent forms
                      </span>
                      <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                        Your sponsor will email these to you. You&apos;ll sign and upload them in the next step. Check your inbox for emails from Viems.
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-[1px] bg-[#EBEBEB]" />
                  {/* Item 2 */}
                  <div className="flex items-start gap-3">
                    <RiQuillPenLine className="size-5 text-[#5C5C5C] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] leading-[20px] font-medium text-[#171717] tracking-[-0.006em]">
                        Lead artist cover letter (if applicable)
                      </span>
                      <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
                        If you&apos;re performing with a group, the lead artist may send a short letter confirming your involvement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Let's get your application started */}
            <div className="w-full flex flex-col items-center gap-4 text-center mt-4">
              <h2 className="text-[40px] leading-[44px] font-medium text-[#171717] font-aeonik-medium max-w-[477px] mx-auto tracking-[-0.01em]">
                Let&apos;s get your application started.
              </h2>
              <p className="text-[16px] leading-[24px] font-normal text-[#5C5C5C] tracking-[-0.011em] max-w-[446px] mx-auto">
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
                  <RiFileTextLine className="size-3.5 text-white" />
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
              <Label htmlFor="cosReference" className="text-[14px] font-medium text-[#171717]">
                CoS Reference (if available)
              </Label>
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
                <Label htmlFor="employerSponsor" className="text-[14px] font-medium text-[#171717]">
                  Employer / Sponsor
                </Label>
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

            {/* Job Title & SOC Code Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <Label htmlFor="jobTitle" className="text-[14px] font-medium text-[#171717]">
                  Job Title
                </Label>
                <div className="relative">
                  <select
                    id="jobTitle"
                    value={form.jobTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      const socMap: Record<string, string> = {
                        "Senior Software Engineer": "2136",
                        "Software Engineer": "2136",
                        "Product Manager": "2139",
                        "Data Scientist": "2135",
                        "Business Analyst": "2423",
                        "Marketing Specialist": "3543",
                      };
                      setForm((prev) => ({
                        ...prev,
                        jobTitle: val,
                        socCode: socMap[val] || prev.socCode || "3416",
                      }));
                    }}
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

              <div className="flex flex-col gap-1">
                <Label htmlFor="socCode" className="text-[14px] font-medium text-[#171717]">
                  SOC Code
                </Label>
                <input
                  id="socCode"
                  type="text"
                  value={form.socCode}
                  onChange={(e) => handleChange("socCode", e.target.value)}
                  placeholder="e.g. 2136"
                  className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                />
              </div>
            </div>

            {/* Start Date & End Date (Grid Row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <Label htmlFor="startDate" className="text-[14px] font-medium text-[#171717]">
                  Start Date
                </Label>
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
                <Label htmlFor="endDate" className="text-[14px] font-medium text-[#171717]">
                  End Date
                </Label>
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
                <Label htmlFor="contractType" className="text-[14px] font-medium text-[#171717]">
                  Contract
                </Label>
                <div className="relative">
                  <select
                    id="contractType"
                    value={form.contractType}
                    onChange={(e) => handleChange("contractType", e.target.value)}
                    className="h-10 w-full rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] appearance-none cursor-pointer focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small"
                  >
                    <option value="">Select contract type...</option>
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
                  <Label htmlFor="hoursPerWeek" className="text-[14px] font-medium text-[#171717]">
                    Hours/Week
                  </Label>
                  <RiInformationLine className="size-4 text-[#A4A4A4]" />
                </div>
                <input
                  id="hoursPerWeek"
                  type="text"
                  value={form.hoursPerWeek}
                  onChange={(e) => handleChange("hoursPerWeek", e.target.value)}
                  placeholder="37.5"
                  className="h-10 rounded-[10px] border border-transparent bg-[#F5F5F5] px-3 text-[14px] text-[#171717] focus:outline-none focus:bg-white focus:border-[#7D52F4]"
                />
              </div>

              <div className="md:col-span-3 flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <Label htmlFor="annualSalary" className="text-[14px] font-medium text-[#171717]">
                    Annual Salary
                  </Label>
                  <RiInformationLine className="size-4 text-[#A4A4A4]" />
                </div>
                <input
                  id="annualSalary"
                  type="text"
                  value={form.annualSalary}
                  onChange={(e) => handleChange("annualSalary", e.target.value)}
                  placeholder="£"
                  className="h-10 rounded-[10px] border border-transparent bg-[#F5F5F5] px-3 text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:bg-white focus:border-[#7D52F4]"
                />
              </div>
            </div>

            {/* Address Details */}
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="workAddressLine1" className="text-[14px] font-medium text-[#171717]">
                  Address
                </Label>
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
                <Label htmlFor="workAddressLine2" className="text-[14px] font-medium text-[#171717]">
                  Address Line 2 <span className="font-normal text-[#5C5C5C]">(Optional)</span>
                </Label>
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
                  <Label htmlFor="workCity" className="text-[14px] font-medium text-[#171717]">
                    City
                  </Label>
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
                  <Label htmlFor="workPostCode" className="text-[14px] font-medium text-[#171717]">
                    Post Code
                  </Label>
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

              {/* Dynamic Additional Addresses with Stable Key */}
              {extraAddresses.map((addr, idx) => (
                <div key={addr.id} className="flex flex-col gap-4 pt-4 border-t border-dashed border-[#EBEBEB]">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-medium text-[#A4A4A4] uppercase">Additional Address {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setExtraAddresses((prev) => prev.filter((item) => item.id !== addr.id))}
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
                      setExtraAddresses((prev) =>
                        prev.map((item) => (item.id === addr.id ? { ...item, addressLine1: val } : item))
                      );
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
                        setExtraAddresses((prev) =>
                          prev.map((item) => (item.id === addr.id ? { ...item, city: val } : item))
                        );
                      }}
                      placeholder="City"
                      className="h-10 rounded-[10px] border border-[#EBEBEB] bg-white px-3 text-[14px] text-[#171717] shadow-x-small"
                    />
                    <input
                      type="text"
                      value={addr.postCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExtraAddresses((prev) =>
                          prev.map((item) => (item.id === addr.id ? { ...item, postCode: val } : item))
                        );
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

              {/* Drag & Drop Upload Container */}
              <div className="w-full bg-[#F5F5F5] border border-[#EBEBEB] rounded-[16px] p-[24px] flex flex-col gap-[24px] shadow-x-small">
                {/* File Upload Button Dropzone */}
                <button
                  type="button"
                  onClick={() => docUploadInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDroppedFiles(e.dataTransfer.files);
                  }}
                  className="w-full bg-white border border-dashed border-[#D1D1D1] hover:border-[#7D52F4] rounded-[12px] p-[32px] flex flex-col items-center justify-center gap-[20px] cursor-pointer transition-colors group text-left font-sans"
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
                </button>

                {/* AI Smart Categorisation Banner */}
                <div className="w-full bg-[#F5F5F5] border border-[#EBEBEB] rounded-[8px] p-3 flex items-start gap-3">
                  <div className="size-6 rounded-[6px] bg-[#7D52F4] flex items-center justify-center shrink-0 text-white mt-0.5">
                    <RiFileTextLine className="size-3.5 text-white" />
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

              {/* Document Checklist Items List */}
              <div className="w-full flex flex-col gap-[4px]">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="w-full min-h-[48px] bg-[#F5F5F5] hover:bg-[#F2F2F2] rounded-[12px] px-[12px] py-[8px] flex items-center justify-between transition-colors"
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
            <div className="bg-[#F5F5F5] border border-[#F5F5F5] rounded-[16px] p-5 flex flex-col gap-3 shadow-x-small">
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
            <div className="bg-[#F5F5F5] border border-[#F5F5F5] rounded-[16px] p-5 flex flex-col gap-3 shadow-x-small">
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
                    {form.firstName || form.lastName ? `${form.firstName} ${form.lastName}`.trim() : "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Date of Birth</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.dob || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Gender</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.gender || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Marital Status</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.maritalStatus || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Nationality</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.nationality || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Country of Birth</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.countryOfBirth || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Passport Number</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.passportNumber || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Issue Date</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.passportIssueDate || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Expiry Date</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.passportExpiryDate || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Email</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.personalEmail || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Phone</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.mobilePhone || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. EMPLOYMENT CARD */}
            <div className="bg-[#F5F5F5] border border-[#F5F5F5] rounded-[16px] p-5 flex flex-col gap-3 shadow-x-small">
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
                    {form.employerSponsor || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Job Title</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.jobTitle || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">SOC Code</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.socCode || "3416 (Arts/Entertainment)"}
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
                    {form.contractType || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Hours/Week</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.hoursPerWeek || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Annual Salary</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.annualSalary ? `£${form.annualSalary}/year` : "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">Address</span>
                  <span className="text-[14px] font-medium text-[#171717] text-right">
                    {form.workAddressLine1 ? `${form.workAddressLine1}, ${form.workCity}, ${form.workPostCode}` : "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[13px] text-[#5C5C5C]">CoS Reference</span>
                  <span className="text-[14px] font-medium text-[#171717]">
                    {form.cosReference || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. DOCUMENTS CARD */}
            <div className="bg-[#F5F5F5] border border-[#F5F5F5] rounded-[16px] p-5 flex flex-col gap-3 shadow-x-small">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.04em]">
                  DOCUMENTS
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
            {(!form.firstName || !form.lastName || !form.passportNumber || checklist.some((i) => i.status === "missing")) && (
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
            )}

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

        {/* Bottom Actions Bar (Back & Next Buttons for Step 2) */}
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

      {/* Alert & Notification & Toast */}
      {showInviteToast && (
        <div className="fixed bottom-6 right-6 z-50 w-[390px] bg-[#1FC16B] rounded-[12px] p-[14px] pb-[16px] text-white shadow-card-large flex items-start gap-[12px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="size-[20px] rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
            <RiCheckboxCircleFill className="size-[20px] text-white" />
          </div>
          <div className="flex-1 flex flex-col gap-[4px]">
            <h4 className="text-[14px] font-medium text-white tracking-[-0.006em] leading-[20px]">
              Invite sent to {toastEmail}
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
        key={isInviteModalOpen ? form.personalEmail || "open" : "closed"}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSendInvite={async (email) => {
          try {
            await apiClient.post(ENDPOINTS.employees.sendRegistrationLink, { email });
            setToastEmail(email);
            setShowInviteToast(true);
          } catch (err) {
            toast.error("Failed to send invite link.");
            throw err;
          }
        }}
        defaultEmail={form.personalEmail || ""}
      />
    </div>
  );
}
