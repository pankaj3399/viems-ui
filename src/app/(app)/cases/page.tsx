"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  Plus,
  ArrowDownToLine,
} from "lucide-react";

interface CaseRow {
  caseId: string;
  country: string;
  flag: string;
  name: string;
  group: string;
  avatarText?: string;
  avatarUrl?: string;
  status: string;
  statusColor: "warning" | "success" | "info" | "error" | "gray";
  migration: string;
  action: string;
  actionColor: "blue" | "red" | "yellow" | "gray";
}

const mockCases: CaseRow[] = [
  {
    caseId: "431/2026",
    country: "US",
    flag: "🇺🇸",
    name: "Alex Marin",
    group: "AX Studios",
    avatarText: "AM",
    avatarUrl: "https://i.pravatar.cc/150?u=431",
    status: "AWAITING UKVI DECISION",
    statusColor: "warning",
    migration: "N/A - PRE-VISA",
    action: "Upload passport",
    actionColor: "blue",
  },
  {
    caseId: "430/2026",
    country: "US",
    flag: "🇺🇸",
    name: "Taylor Johnson",
    group: "AX Studios",
    avatarText: "TJ",
    avatarUrl: "https://i.pravatar.cc/150?u=430",
    status: "VISA APPROVED",
    statusColor: "success",
    migration: "ARRIVED - RTW PENDING",
    action: "Check RTW",
    actionColor: "red",
  },
  {
    caseId: "429/2026",
    country: "CN",
    flag: "🇨🇳",
    name: "Gulab Singh Sidhu",
    group: "Inderbir Sidhu",
    avatarText: "GS",
    avatarUrl: "https://i.pravatar.cc/150?u=429",
    status: "VISA APPROVED",
    statusColor: "success",
    migration: "ACTIVE COMPLIANCE",
    action: "Report issue",
    actionColor: "yellow",
  },
  {
    caseId: "428/2026",
    country: "IN",
    flag: "🇮🇳",
    name: "Elena Petrova",
    group: "Dhira Gill Music Video",
    avatarText: "EP",
    avatarUrl: "https://i.pravatar.cc/150?u=428",
    status: "VISA APPROVED",
    statusColor: "success",
    migration: "VISA EXPIRING (<30 DAYS)",
    action: "Re-verify visa (<30d)",
    actionColor: "yellow",
  },
  {
    caseId: "427/2026",
    country: "IN",
    flag: "🇮🇳",
    name: "Ami Monarch",
    group: "Dhira Gill Music Video",
    avatarText: "AM",
    avatarUrl: "https://i.pravatar.cc/150?u=427",
    status: "AWAITING BIOMETRICS",
    statusColor: "warning",
    migration: "ACTIVE COMPLIANCE",
    action: "No action required",
    actionColor: "gray",
  },
  {
    caseId: "426/2026",
    country: "FR",
    flag: "🇫🇷",
    name: "Wei Chen",
    group: "Anonymous Group",
    avatarText: "WC",
    avatarUrl: "https://i.pravatar.cc/150?u=426",
    status: "VISA APPROVED",
    statusColor: "success",
    migration: "IN UK",
    action: "Select quarterly audit",
    actionColor: "blue",
  },
  {
    caseId: "425/2026",
    country: "FR",
    flag: "🇫🇷",
    name: "James Brown",
    group: "Anonymous Group",
    avatarText: "JB",
    avatarUrl: "https://i.pravatar.cc/150?u=425",
    status: "ELIGIBILITY ASSESSMENT",
    statusColor: "info",
    migration: "ACTIVE COMPLIANCE",
    action: "No action required",
    actionColor: "gray",
  },
  {
    caseId: "424/2026",
    country: "FR",
    flag: "🇫🇷",
    name: "Sofia Reyez",
    group: "Anonymous Group",
    avatarText: "SR",
    avatarUrl: "https://i.pravatar.cc/150?u=424",
    status: "VISA REFUSED",
    statusColor: "error",
    migration: "VISA REFUSED",
    action: "Report event",
    actionColor: "red",
  },
  {
    caseId: "423/2026",
    country: "SA",
    flag: "🇿🇦",
    name: "Juma Omondi",
    group: "Bhai Tera Star Hai Film",
    avatarText: "JO",
    avatarUrl: "https://i.pravatar.cc/150?u=423",
    status: "AWAITING APPLICANT DOCS",
    statusColor: "warning",
    migration: "ACTIVE COMPLIANCE",
    action: "Upload documents",
    actionColor: "blue",
  },
  {
    caseId: "422/2026",
    country: "CN",
    flag: "🇨🇳",
    name: "Ravi Patel",
    group: "Bhai Tera Star Hai Film",
    avatarText: "RP",
    avatarUrl: "https://i.pravatar.cc/150?u=422",
    status: "CASE CLOSED",
    statusColor: "gray",
    migration: "ARCHIVED (STATUTORY RETENTION PHASE)",
    action: "Statutory retention phase",
    actionColor: "gray",
  },
];

export default function CasesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"cases" | "groups" | "refusals">("cases");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [needsActionOnly, setNeedsActionOnly] = React.useState(false);

  const renderCircularFlag = (country: string, fallbackFlag: string) => {
    switch (country.toUpperCase()) {
      case "US":
        return (
          <svg className="size-5 rounded-full border border-neutral-100 shadow-x-small shrink-0 object-cover" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" fill="#F0F0F0" />
            <rect y="1.8" width="24" height="1.8" fill="#D80027" />
            <rect y="5.4" width="24" height="1.8" fill="#D80027" />
            <rect y="9.0" width="24" height="1.8" fill="#D80027" />
            <rect y="12.6" width="24" height="1.8" fill="#D80027" />
            <rect y="16.2" width="24" height="1.8" fill="#D80027" />
            <rect y="19.8" width="24" height="1.8" fill="#D80027" />
            <rect width="11" height="11.5" fill="#0052B4" />
            <circle cx="2.5" cy="2.5" r="0.6" fill="white" />
            <circle cx="5.5" cy="2.5" r="0.6" fill="white" />
            <circle cx="8.5" cy="2.5" r="0.6" fill="white" />
            <circle cx="4" cy="5.5" r="0.6" fill="white" />
            <circle cx="7" cy="5.5" r="0.6" fill="white" />
            <circle cx="2.5" cy="8.5" r="0.6" fill="white" />
            <circle cx="5.5" cy="8.5" r="0.6" fill="white" />
            <circle cx="8.5" cy="8.5" r="0.6" fill="white" />
          </svg>
        );
      case "CN":
        return (
          <svg className="size-5 rounded-full border border-neutral-100 shadow-x-small shrink-0 object-cover" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" fill="#D80027" />
            <polygon points="5,3 5.5,4.5 7,4.5 5.8,5.5 6.2,7 5,6 3.8,7 4.2,5.5 3,4.5 4.5,4.5" fill="#FFDA44" />
            <polygon points="9,2 9.2,2.6 9.8,2.6 9.3,3 9.5,3.6 9,3.2 8.5,3.6 8.7,3 8.2,2.6 8.8,2.6" fill="#FFDA44" transform="scale(0.8) translate(2, 0.5)" />
            <polygon points="9,2 9.2,2.6 9.8,2.6 9.3,3 9.5,3.6 9,3.2 8.5,3.6 8.7,3 8.2,2.6 8.8,2.6" fill="#FFDA44" transform="scale(0.8) translate(3, 2)" />
            <polygon points="9,2 9.2,2.6 9.8,2.6 9.3,3 9.5,3.6 9,3.2 8.5,3.6 8.7,3 8.2,2.6 8.8,2.6" fill="#FFDA44" transform="scale(0.8) translate(3, 4)" />
            <polygon points="9,2 9.2,2.6 9.8,2.6 9.3,3 9.5,3.6 9,3.2 8.5,3.6 8.7,3 8.2,2.6 8.8,2.6" fill="#FFDA44" transform="scale(0.8) translate(2, 5.5)" />
          </svg>
        );
      case "IN":
        return (
          <svg className="size-5 rounded-full border border-neutral-100 shadow-x-small shrink-0 object-cover" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="8" fill="#FF9933" />
            <rect y="8" width="24" height="8" fill="#FFFFFF" />
            <rect y="16" width="24" height="8" fill="#128807" />
            <circle cx="12" cy="12" r="2" stroke="#000080" strokeWidth="0.5" fill="none" />
            <circle cx="12" cy="12" r="0.5" fill="#000080" />
          </svg>
        );
      case "FR":
        return (
          <svg className="size-5 rounded-full border border-neutral-100 shadow-x-small shrink-0 object-cover" viewBox="0 0 24 24" fill="none">
            <rect width="8" height="24" fill="#002395" />
            <rect x="8" width="8" height="24" fill="#FFFFFF" />
            <rect x="16" width="8" height="24" fill="#ED2939" />
          </svg>
        );
      case "SA":
      case "ZA":
        return (
          <svg className="size-5 rounded-full border border-neutral-100 shadow-x-small shrink-0 object-cover" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" fill="#E21C21" />
            <rect y="12" width="24" height="12" fill="#002395" />
            <path d="M0 0 L10 12 L0 24" fill="none" stroke="#FFFFFF" strokeWidth="3" />
            <path d="M0 0 L10 12 L0 24" fill="none" stroke="#007A3D" strokeWidth="1.8" />
            <rect y="10.8" width="24" height="2.4" fill="#007A3D" />
            <path d="M0 4 L6.5 12 L0 20 Z" fill="#F6B51E" />
          </svg>
        );
      default:
        return (
          <div className="size-5 rounded-full overflow-hidden flex items-center justify-center bg-neutral-50 border border-neutral-200/40 text-xs shrink-0 select-none">
            {fallbackFlag}
          </div>
        );
    }
  };

  // Filter cases based on search and Needs Action filter
  const filteredCases = React.useMemo(() => {
    return mockCases.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caseId.includes(searchQuery) ||
        item.group.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (needsActionOnly) {
        return matchesSearch && item.actionColor !== "gray" && item.action !== "No action required";
      }
      return matchesSearch;
    });
  }, [searchQuery, needsActionOnly]);

  const getStatusClasses = (color: CaseRow["statusColor"]) => {
    switch (color) {
      case "warning":
        return "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]/50";
      case "success":
        return "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]/50";
      case "info":
        return "bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]/50";
      case "error":
        return "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]/50";
      default:
        return "bg-neutral-100 text-neutral-600 border-neutral-200/50";
    }
  };

  const getActionDotColor = (color: CaseRow["actionColor"]) => {
    switch (color) {
      case "blue":
        return "bg-[#335CFF]";
      case "red":
        return "bg-[#FB3748]";
      case "yellow":
        return "bg-[#F6B51E]";
      default:
        return "transparent";
    }
  };

  const getActionTextClass = (color: CaseRow["actionColor"]) => {
    if (color === "gray") {
      return "text-neutral-400 font-normal text-paragraph-sm";
    }
    return "text-[#5C5C5C] hover:text-[#171717] font-medium underline cursor-pointer text-paragraph-sm";
  };

  const getAvatarBg = (text: string) => {
    const t = text.toUpperCase();
    if (t === "GS" || t === "AM") {
      return "bg-[#FFECC0] text-[#71330A]";
    }
    if (t === "EP" || t === "JB" || t === "TJ") {
      return "bg-[#CAC0FF] text-[#351A75]";
    }
    if (t === "JO" || t === "SR") {
      return "bg-[#FFD9C0] text-[#71330A]";
    }
    return "bg-neutral-100 text-neutral-600";
  };

  const getStatusBgAndText = (color: CaseRow["statusColor"]) => {
    switch (color) {
      case "warning":
        return "bg-[#FFFAEB] text-[#624C18]";
      case "success":
        return "bg-[#E3F7EC] text-[#0B4627]";
      case "info":
        return "bg-[#EBF5FF] text-[#1E429F]";
      case "error":
        return "bg-[#FDE8E8] text-[#9B1C1C]";
      default:
        return "bg-[#F3F4F6] text-[#374151]";
    }
  };

  const getStatusDotColor = (color: CaseRow["statusColor"]) => {
    switch (color) {
      case "warning":
        return "bg-[#F6B51E]";
      case "success":
        return "bg-[#1FC16B]";
      case "info":
        return "bg-[#3B82F6]";
      case "error":
        return "bg-[#E02424]";
      default:
        return "bg-[#9CA3AF]";
    }
  };

  const getMigrationBgAndText = (status: string) => {
    return "bg-transparent";
  };

  const getMigrationDotColor = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("PENDING") || s.includes("REFUSED")) {
      return "bg-[#FB3748]";
    }
    if (s.includes("ACTIVE") || s.includes("IN UK")) {
      return "bg-[#1FC16B]";
    }
    return "bg-[#7B7B7B]";
  };

  const getMigrationTextColorClass = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("PENDING") || s.includes("REFUSED")) {
      return "text-[#681219] font-semibold";
    }
    if (s.includes("ACTIVE") || s.includes("IN UK")) {
      return "text-[#262626] font-semibold";
    }
    return "text-[#7B7B7B] font-semibold";
  };

  return (
    <div className="w-full flex flex-col font-sans animate-fade-in text-[#171717] select-none bg-[#F7F7F7] min-h-full">
      <div className="bg-white rounded-t-[16px] flex flex-col shrink-0">
        <div className="px-6 md:px-[64px] pt-[40px] pb-[24px] flex flex-col gap-md md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-xs flex-1 min-w-0">
            <h1 className="text-h3-title font-semibold tracking-tight text-[#171717]">
              Cases
            </h1>
            <p className="text-paragraph-sm text-neutral-500 max-w-[600px]">
              Create, track, and manage visa cases for individual or grouped applicants.
            </p>
          </div>
          <div className="flex items-center gap-md">
            <button
              type="button"
              className="h-9 px-4 rounded-[8px] border border-neutral-200 bg-white text-neutral-700 text-label-sm font-semibold inline-flex items-center gap-sm hover:bg-neutral-50 hover:text-neutral-900 cursor-pointer transition-colors shadow-x-small"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-neutral-500 shrink-0">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Import
            </button>
            <button
              type="button"
              className="h-9 px-4 rounded-[8px] bg-[#7D52F4] text-white text-label-sm font-semibold inline-flex items-center gap-sm hover:bg-[#693bde] cursor-pointer transition-colors shadow-x-small border-0"
            >
              <Plus className="size-4" />
              New migrant
            </button>
          </div>
        </div>

        <div className="px-6 md:px-[64px] flex items-center gap-6 h-[50px] select-none border-b border-[#EBEBEB]">
          <button
            onClick={() => setActiveTab("cases")}
            className={`h-full px-xs pb-2 border-b-2 text-label-sm font-semibold transition-all inline-flex items-center gap-sm cursor-pointer ${
              activeTab === "cases"
                ? "border-[#171717] text-[#171717]"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
              <path d="M5.5 6.25V4C5.5 3.80109 5.57902 3.61032 5.71967 3.46967C5.86032 3.32902 6.05109 3.25 6.25 3.25H11.0605L12.5605 4.75H16.75C16.9489 4.75 17.1397 4.82902 17.2803 4.96967C17.421 5.11032 17.5 5.30109 17.5 5.5V13C17.5 13.1989 17.421 13.3897 17.2803 13.5303C17.1397 13.671 16.9489 13.75 16.75 13.75H14.5V16C14.5 16.1989 14.421 16.3897 14.2803 16.5303C14.1397 16.671 13.9489 16.75 13.75 16.75H3.25C3.05109 16.75 2.86032 16.671 2.71967 16.5303C2.57902 16.3897 2.5 16.1989 2.5 16V7C2.5 6.80109 2.57902 6.61032 2.71967 6.46967C2.86032 6.32902 3.05109 6.25 3.25 6.25H5.5ZM5.5 7.75H4V15.25H13V13.75H5.5V7.75Z" fill="currentColor" />
            </svg>
            <span>Cases</span>
            <div className="w-5 h-[18px] bg-[#F5F5F5] rounded-[4px] text-[11px] font-medium text-[#171717] flex items-center justify-center shrink-0">
              13
            </div>
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`h-full px-xs pb-2 border-b-2 text-label-sm font-semibold transition-all inline-flex items-center gap-sm cursor-pointer ${
              activeTab === "groups"
                ? "border-[#171717] text-[#171717]"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Groups</span>
          </button>
          <button
            onClick={() => setActiveTab("refusals")}
            className={`h-full px-xs pb-2 border-b-2 text-label-sm font-semibold transition-all inline-flex items-center gap-sm cursor-pointer ${
              activeTab === "refusals"
                ? "border-[#171717] text-[#171717]"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
              <path d="M11.95 13.0002L16.75 13.0002C17.1478 13.0002 17.5294 12.8422 17.8107 12.5609C18.092 12.2796 18.25 11.8981 18.25 11.5002L18.25 9.92223C18.2502 9.72621 18.212 9.53205 18.1375 9.35073L15.8155 3.71523C15.759 3.5778 15.663 3.46023 15.5396 3.37744C15.4163 3.29465 15.2711 3.25038 15.1225 3.25023L2.5 3.25023C2.30109 3.25023 2.11032 3.32925 1.96967 3.4699C1.82902 3.61055 1.75 3.80132 1.75 4.00023L1.75 11.5002C1.75 11.6991 1.82901 11.8899 1.96967 12.0306C2.11032 12.1712 2.30109 12.2502 2.5 12.2502L5.1115 12.2502C5.23157 12.2502 5.34989 12.279 5.45652 12.3342C5.56315 12.3894 5.65497 12.4694 5.72425 12.5675L9.814 18.362C9.8657 18.4352 9.94194 18.4876 10.0289 18.5094C10.1159 18.5313 10.2078 18.5213 10.288 18.4812L11.6485 17.8002C12.0314 17.6089 12.3372 17.2922 12.5153 16.903C12.6933 16.5137 12.7329 16.0753 12.6272 15.6605L11.95 13.0002ZM6.25 11.0592L6.25 4.75023L14.62 4.75023L16.75 9.92223L16.75 11.5002L11.95 11.5002C11.7215 11.5003 11.4961 11.5525 11.2909 11.6529C11.0857 11.7533 10.9062 11.8993 10.766 12.0796C10.6257 12.26 10.5286 12.47 10.4819 12.6936C10.4352 12.9172 10.4402 13.1486 10.4965 13.37L11.1737 16.031C11.1949 16.114 11.1871 16.2017 11.1515 16.2797C11.1159 16.3576 11.0546 16.4209 10.978 16.4592L10.4822 16.7067L6.94975 11.7027C6.76225 11.4372 6.52225 11.2197 6.25 11.0592ZM4.75 10.7502L3.25 10.7502L3.25 4.75023L4.75 4.75023L4.75 10.7502Z" fill="currentColor" />
            </svg>
            <span>Refusals</span>
          </button>
        </div>
      </div>

      <div className="px-6 md:px-[64px] py-[32px] flex flex-col gap-[24px] flex-1">
        <div className="flex flex-wrap items-center gap-md">
          <div className="relative w-full max-w-[348px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#A4A4A4]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-4 bg-white border border-neutral-200 rounded-[8px] text-paragraph-sm placeholder-[#A4A4A4] focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900/10 transition-all font-sans shadow-x-small"
            />
          </div>

          <button
            type="button"
            className="size-8 rounded-[8px] border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-500 cursor-pointer transition-colors shadow-x-small shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
              <path d="M8.5 14.5H11.5V13H8.5V14.5ZM3.25 5.5V7H16.75V5.5H3.25ZM5.5 10.75H14.5V9.25H5.5V10.75Z" fill="currentColor" />
            </svg>
          </button>

          <button
            type="button"
            className="h-8 w-[125px] px-2 rounded-[8px] border border-neutral-200 bg-white hover:bg-neutral-50 text-[13px] font-medium text-[#5C5C5C] flex items-center justify-between cursor-pointer transition-colors shadow-x-small shrink-0"
          >
            All countries
            <ChevronDown className="size-3.5 text-neutral-400" />
          </button>

          <button
            type="button"
            className="h-8 w-[104px] px-2 rounded-[8px] border border-neutral-200 bg-white hover:bg-neutral-50 text-[13px] font-medium text-[#5C5C5C] flex items-center justify-between cursor-pointer transition-colors shadow-x-small shrink-0"
          >
            All status
            <ChevronDown className="size-3.5 text-neutral-400" />
          </button>

          <button
            type="button"
            onClick={() => setNeedsActionOnly(!needsActionOnly)}
            className={`h-8 w-[108px] px-2 rounded-[8px] text-[13px] font-medium transition-colors cursor-pointer border text-center justify-center flex items-center shadow-x-small shrink-0 ${
              needsActionOnly
                ? "bg-[#FEF3C7] border-[#FDE68A] text-[#D97706]"
                : "bg-white border-neutral-200 hover:bg-neutral-50 text-[#5C5C5C]"
            }`}
          >
            Needs action
          </button>
        </div>

        <div className="w-full select-none">
          <div className="flex flex-col gap-sm">
            <div className="px-xl h-11 flex items-center bg-[#F7F7F7] shrink-0 text-[12px] uppercase tracking-wider text-neutral-400 font-semibold mb-xs">
              <div className="basis-[70px] shrink-0 grow-0">Case ID #</div>
              <div className="basis-[90px] shrink-0 grow-0 flex items-center gap-[4px] cursor-pointer">
                Country
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#A4A4A4] shrink-0">
                  <path d="m7 15 5 5 5-5"/>
                  <path d="m7 9 5-5 5 5"/>
                </svg>
              </div>
              <div className="flex-[2] min-w-0 flex items-center gap-[4px] cursor-pointer">
                Name
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#A4A4A4] shrink-0">
                  <path d="m7 15 5 5 5-5"/>
                  <path d="m7 9 5-5 5 5"/>
                </svg>
              </div>
              <div className="flex-[2] min-w-0 flex items-center gap-[4px] cursor-pointer">
                Case Status
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#A4A4A4] shrink-0">
                  <path d="m7 15 5 5 5-5"/>
                  <path d="m7 9 5-5 5 5"/>
                </svg>
              </div>
              <div className="flex-[2] min-w-0 flex items-center gap-[4px] cursor-pointer">
                Migration Status
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#A4A4A4] shrink-0">
                  <path d="m7 15 5 5 5-5"/>
                  <path d="m7 9 5-5 5 5"/>
                </svg>
              </div>
              <div className="flex-[2] min-w-0">Compliance Action</div>
              <div className="w-[32px] shrink-0"></div>
            </div>

            <div className="flex flex-col gap-sm">
              {filteredCases.map((row) => (
                <div
                  key={row.caseId}
                  onClick={() => router.push(`/cases/${row.caseId.replace('/', '-')}`)}
                  className="bg-white rounded-[16px] h-[72px] px-xl flex items-center shadow-x-small border border-neutral-200/20 hover:border-neutral-200/50 hover:shadow-custom-medium transition-all cursor-pointer"
                >
                  <div className="basis-[70px] shrink-0 grow-0 font-medium text-[#5C5C5C] font-mono text-paragraph-sm">
                    {row.caseId}
                  </div>

                  <div className="basis-[90px] shrink-0 grow-0 flex items-center gap-xs">
                    {renderCircularFlag(row.country, row.flag)}
                    <span className="font-semibold text-neutral-700 font-sans text-paragraph-sm">{row.country}</span>
                  </div>

                  <div className="flex-[2] min-w-0 flex items-center gap-md">
                    <img 
                      src={row.avatarUrl} 
                      alt={row.name} 
                      className={`size-10 rounded-full object-cover shrink-0 ${!row.avatarUrl ? 'hidden' : ''}`}
                    />
                    {!row.avatarUrl && (
                      <div className={`size-10 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 select-none ${getAvatarBg(row.avatarText || "AM")}`}>
                        {row.avatarText}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-[#171717] truncate leading-normal text-paragraph-sm">
                        {row.name}
                      </span>
                      <span className="text-[11px] text-neutral-400 truncate mt-0.5 font-medium leading-none">
                        {row.group}
                      </span>
                    </div>
                  </div>

                  <div className="flex-[2] min-w-0 flex items-center">
                    <span className={`inline-flex items-center gap-xs px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${getStatusBgAndText(row.statusColor)}`}>
                      <span className={`size-1.5 rounded-full ${getStatusDotColor(row.statusColor)}`} />
                      {row.status}
                    </span>
                  </div>

                  <div className="flex-[2] min-w-0 flex items-center">
                    <span className="inline-flex items-center gap-xs text-[11px] font-semibold uppercase tracking-wider">
                      <span className={`size-1.5 rounded-full ${getMigrationDotColor(row.migration)}`} />
                      <span className={getMigrationTextColorClass(row.migration)}>{row.migration}</span>
                    </span>
                  </div>

                  <div className="flex-[2] min-w-0 flex items-center gap-xs">
                    {row.actionColor !== "gray" && (
                      <span className={`size-1.5 rounded-full shrink-0 ${getActionDotColor(row.actionColor)}`} />
                    )}
                    <span className={getActionTextClass(row.actionColor)}>
                      {row.action}
                    </span>
                  </div>

                  <div className="w-[32px] shrink-0 flex justify-end">
                    <button
                      type="button"
                      className="size-8 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-900 border-0 bg-transparent cursor-pointer transition-colors"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-md md:flex-row md:items-center pt-lg border-t border-neutral-200/40 text-paragraph-sm text-neutral-500 select-none justify-between relative">
          <span className="text-neutral-400 font-medium w-[150px] shrink-0">Page 1 of 16</span>

          <div className="flex items-center gap-xs justify-center flex-1">
            {/* Double Arrow Left */}
            <button
              disabled
              className="size-8 rounded-[8px] flex items-center justify-center text-neutral-400 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-400 border-0 bg-transparent cursor-pointer transition-colors"
            >
              <ChevronsLeft className="size-4" />
            </button>

            {/* Arrow Left */}
            <button
              disabled
              className="size-8 rounded-[8px] flex items-center justify-center text-neutral-400 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-400 border-0 bg-transparent cursor-pointer transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-xs">
              <button
                onClick={() => setCurrentPage(1)}
                className={`size-8 rounded-[8px] text-paragraph-sm font-semibold flex items-center justify-center border-0 cursor-pointer transition-colors ${
                  currentPage === 1 ? "bg-neutral-950 text-white" : "bg-transparent text-neutral-400 hover:text-neutral-900"
                }`}
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className={`size-8 rounded-[8px] text-paragraph-sm font-semibold flex items-center justify-center transition-colors border cursor-pointer ${
                  currentPage === 2 
                    ? "bg-neutral-950 text-white border-transparent" 
                    : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage(3)}
                className={`size-8 rounded-[8px] text-paragraph-sm font-semibold flex items-center justify-center border-0 bg-transparent text-neutral-400 hover:text-neutral-900 cursor-pointer transition-colors`}
              >
                3
              </button>
              <button
                onClick={() => setCurrentPage(4)}
                className={`size-8 rounded-[8px] text-paragraph-sm font-semibold flex items-center justify-center border-0 bg-transparent text-neutral-400 hover:text-neutral-900 cursor-pointer transition-colors`}
              >
                4
              </button>
              <button
                onClick={() => setCurrentPage(5)}
                className={`size-8 rounded-[8px] text-paragraph-sm font-semibold flex items-center justify-center border-0 bg-transparent text-neutral-400 hover:text-neutral-900 cursor-pointer transition-colors`}
              >
                5
              </button>
              <span className="size-8 flex items-center justify-center text-neutral-400 font-semibold select-none">...</span>
              <button
                onClick={() => setCurrentPage(16)}
                className={`size-8 rounded-[8px] text-paragraph-sm font-semibold flex items-center justify-center border-0 bg-transparent text-neutral-400 hover:text-neutral-900 cursor-pointer transition-colors`}
              >
                16
              </button>
            </div>

            {/* Arrow Right */}
            <button
              className="size-8 rounded-[8px] flex items-center justify-center text-neutral-400 hover:text-neutral-900 border-0 bg-transparent cursor-pointer transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Double Arrow Right */}
            <button
              className="size-8 rounded-[8px] flex items-center justify-center text-neutral-400 hover:text-neutral-900 border-0 bg-transparent cursor-pointer transition-colors"
            >
              <ChevronsRight className="size-4" />
            </button>
          </div>

          <div className="w-[150px] shrink-0 flex justify-end">
            {/* Size Dropdown Selector */}
            <button
              type="button"
              className="h-8 px-3 rounded-[8px] border border-neutral-200 bg-white text-[13px] font-medium text-[#5C5C5C] flex items-center gap-xs cursor-pointer shadow-x-small hover:bg-neutral-50 transition-colors"
            >
              10 / page
              <ChevronDown className="size-3 text-neutral-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
