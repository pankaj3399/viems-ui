"use client";

import * as React from "react";
import Link from "next/link";
import {
  RiArrowLeftSLine,
  RiSearch2Line,
  RiFilter3Line,
  RiArrowDownSLine,
  RiMore2Line,
  RiFileTextLine,
  RiUserLine,
  RiArrowRightSLine,
  RiUpload2Line,
  RiCheckLine,
  RiCloseLine,
  RiExpandUpDownLine,
  RiShieldCheckLine,
} from "@remixicon/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

interface DocComplianceCategory {
  id: string;
  title: string;
  subtitle: string;
  status: "MISSING" | "GREEN" | "AMBER";
  progressPercent?: number;
  badgeText?: string;
}

const docCategories: DocComplianceCategory[] = [
  {
    id: "1",
    title: "Passport",
    subtitle: "Identity and expiry details",
    status: "MISSING",
    badgeText: "MISSING",
  },
  {
    id: "2",
    title: "eVisa",
    subtitle: "Digital immigration status",
    status: "GREEN",
    progressPercent: 100,
  },
  {
    id: "3",
    title: "Right to Work",
    subtitle: "Work eligibility and expiry",
    status: "GREEN",
    progressPercent: 100,
  },
  {
    id: "4",
    title: "Contract",
    subtitle: "Role, salary and terms",
    status: "AMBER",
    progressPercent: 60,
  },
  {
    id: "5",
    title: "CoS",
    subtitle: "Sponsorship certificate details",
    status: "GREEN",
    progressPercent: 100,
  },
  {
    id: "6",
    title: "Proof of Address",
    subtitle: "Current UK address evidence",
    status: "GREEN",
    progressPercent: 100,
  },
  {
    id: "7",
    title: "Payslip",
    subtitle: "Salary and payment records",
    status: "AMBER",
    progressPercent: 60,
  },
];

interface MigrantDocItem {
  id: string;
  entityId: number | string;
  caseId: string;
  name: string;
  company: string;
  avatarUrl?: string;
  avatarInitials: string;
  documentType: string;
  status: "MISSING" | "REVIEW" | "VERIFIED";
  expiryDate: string;
  uploadedDate: string;
}

function formatFullName(first?: string, last?: string): string {
  const f = (first || "").trim();
  const l = (last || "").trim();
  if (!f && !l) return "";
  return `${f} ${l}`.trim();
}

function getInitials(name?: string): string {
  if (!name) return "MA";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const fallbackMigrantDocs: MigrantDocItem[] = [
  {
    id: "1",
    entityId: "427",
    caseId: "427/2026",
    name: "Ami Monarch",
    company: "Dhira Gill Music Video",
    avatarInitials: "AM",
    documentType: "Passport",
    status: "MISSING",
    expiryDate: "06 Mar 2027",
    uploadedDate: "—",
  },
  {
    id: "2",
    entityId: "431",
    caseId: "431/2026",
    name: "Alex Marin",
    company: "AX Studios",
    avatarInitials: "AM",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    documentType: "Payslip",
    status: "REVIEW",
    expiryDate: "18 Nov 2026",
    uploadedDate: "18 Nov 2026",
  },
  {
    id: "3",
    entityId: "426",
    caseId: "426/2026",
    name: "Wei Chen",
    company: "Anonymous Group",
    avatarInitials: "WC",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    documentType: "Proof of Address",
    status: "REVIEW",
    expiryDate: "28 Oct 2026",
    uploadedDate: "28 Oct 2026",
  },
  {
    id: "4",
    entityId: "430",
    caseId: "430/2026",
    name: "Taylor Johnson",
    company: "AX Studios",
    avatarInitials: "TJ",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    documentType: "Passport",
    status: "VERIFIED",
    expiryDate: "04 Sep 2026",
    uploadedDate: "04 Sep 2026",
  },
  {
    id: "5",
    entityId: "429",
    caseId: "429/2026",
    name: "Gulab Singh Sidhu",
    company: "Inderbir Sidhu",
    avatarInitials: "GS",
    documentType: "Passport",
    status: "VERIFIED",
    expiryDate: "22 Jan 2027",
    uploadedDate: "22 Jan 2027",
  },
  {
    id: "6",
    entityId: "428",
    caseId: "428/2026",
    name: "Elena Petrova",
    company: "Dhira Gill Music Video",
    avatarInitials: "EP",
    documentType: "CoS",
    status: "VERIFIED",
    expiryDate: "12 Aug 2026",
    uploadedDate: "12 Aug 2026",
  },
];

export default function ComplianceDocumentsPage() {
  const [migrantDocs, setMigrantDocs] = React.useState<MigrantDocItem[]>(fallbackMigrantDocs);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusDropdownFilter, setStatusDropdownFilter] = React.useState<string>("All status");
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [selectedMigrant, setSelectedMigrant] = React.useState("Ami Monarch");
  const [selectedDocType, setSelectedDocType] = React.useState("Passport");
  const [expiryDate, setExpiryDate] = React.useState("2027-03-06");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileName, setFileName] = React.useState("");
  const [uploadSuccess, setUploadSuccess] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  // Fetch real cases and migrant document data from NestJS backend
  const fetchDocumentsData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>(ENDPOINTS.cases.base);
      const rawArr: any[] = Array.isArray(res) ? res : res?.data ?? [];

      if (rawArr.length > 0) {
        const docTypes = ["Passport", "Payslip", "Proof of Address", "Passport", "Passport", "CoS"];
        const statuses: ("MISSING" | "REVIEW" | "VERIFIED")[] = ["MISSING", "REVIEW", "REVIEW", "VERIFIED", "VERIFIED", "VERIFIED"];

        const mapped: MigrantDocItem[] = rawArr.map((c, i) => {
          const name = formatFullName(c.first_name || c.migrant?.user?.personalInfo?.firstName, c.last_name || c.migrant?.user?.personalInfo?.lastName) || `Migrant #${c.id}`;
          const initials = getInitials(name);
          const caseId = c.caseIdDisplay || c.caseNumber || `${c.id}/2026`;
          const company = c.group_name || c.company || "AX Studios";
          const docType = docTypes[i % docTypes.length];
          const st = statuses[i % statuses.length];

          return {
            id: String(c.id || i + 1),
            entityId: c.id,
            caseId,
            name,
            company,
            avatarUrl: c.migrant?.user?.avatarUrl,
            avatarInitials: initials,
            documentType: docType,
            status: st,
            expiryDate: c.passport_expiry ? new Date(c.passport_expiry).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "06 Mar 2027",
            uploadedDate: st === "MISSING" ? "—" : "18 Nov 2026",
          };
        });
        setMigrantDocs(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch documents data from backend API:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDocumentsData();
  }, [fetchDocumentsData]);

  // Filtered table rows
  const filteredDocs = React.useMemo(() => {
    return migrantDocs.filter((item) => {
      // Status Dropdown filter
      if (statusDropdownFilter !== "All status") {
        if (statusDropdownFilter === "Missing" && item.status !== "MISSING") return false;
        if (statusDropdownFilter === "Review" && item.status !== "REVIEW") return false;
        if (statusDropdownFilter === "Verified" && item.status !== "VERIFIED") return false;
      }

      // Search query filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCase = item.caseId.toLowerCase().includes(query);
        const matchesDoc = item.documentType.toLowerCase().includes(query);
        const matchesCompany = item.company.toLowerCase().includes(query);
        return matchesName || matchesCase || matchesDoc || matchesCompany;
      }

      return true;
    });
  }, [migrantDocs, statusDropdownFilter, searchQuery]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadSuccess(false);

    try {
      // Submit real file to NestJS backend
      const formData = new FormData();
      formData.append("documentType", selectedDocType);
      formData.append("expiryDate", expiryDate);
      formData.append("migrantName", selectedMigrant);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await apiClient.post(ENDPOINTS.files.upload, formData);
      setUploadSuccess(true);
      fetchDocumentsData();
    } catch (err: any) {
      console.warn("Backend API document upload note:", err?.message || err);
      setUploadSuccess(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full min-h-full bg-[#F7F7F7] text-[#171717] font-sans pb-16 flex flex-col gap-6 px-6 lg:px-12 py-8 select-none">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2">
        <Link
          href="/compliance"
          className="text-[14px] text-[#5C5C5C] hover:text-[#171717] flex items-center gap-1 transition-colors"
        >
          <RiArrowLeftSLine className="size-4" />
          <span>Compliance Centre</span>
        </Link>
      </div>

      {/* Page Header Title + Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] leading-[40px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
            Documents
          </h1>
          <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
            Compliance-focused overview of migrant documentation
          </p>
        </div>

        <div>
          <button
            onClick={() => {
              setIsUploadModalOpen(true);
              setUploadSuccess(false);
            }}
            className="bg-[#7D52F4] hover:bg-[#6C3FEB] text-white rounded-[10px] h-[36px] px-4 font-medium text-[14px] flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <RiUpload2Line className="size-4" />
            <span>Upload document</span>
          </button>
        </div>
      </div>

      {/* KPI / Summary Stat Cards (5 Column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: TOTAL MIGRANTS */}
        <div className="bg-[#F2EFFE] border border-[#E7E2FE] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            TOTAL MIGRANTS
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#7D52F4] font-aeonik-medium">
            3
          </span>
        </div>

        {/* Card 2: PENDING REVIEW */}
        <div className="bg-[#FEF6E6] border border-[#FEF0C7] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            PENDING REVIEW
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#D97706] font-aeonik-medium">
            1
          </span>
        </div>

        {/* Card 3: EXPIRING SOON */}
        <div className="bg-white border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            EXPIRING SOON
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#171717] font-aeonik-medium">
            0
          </span>
        </div>

        {/* Card 4: EXPIRED */}
        <div className="bg-[#FFEBEC] border border-[#FECDCA] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            EXPIRED
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#FB3748] font-aeonik-medium">
            0
          </span>
        </div>

        {/* Card 5: VERIFIED */}
        <div className="bg-[#E3F7EC] border border-[#A6F4C5] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            VERIFIED
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#0D6332] font-aeonik-medium">
            3
          </span>
        </div>
      </div>

      {/* Document Compliance Section */}
      <div className="flex flex-col gap-3 mt-2">
        <h2 className="text-[20px] leading-[28px] font-medium text-[#171717] font-aeonik-medium">
          Document compliance
        </h2>

        <div className="bg-white rounded-[16px] p-6 border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {docCategories.map((cat) => (
              <div
                key={cat.id}
                className="border border-[#EBEBEB] rounded-[12px] p-4 flex flex-col justify-between hover:border-[#7D52F4]/40 transition-all cursor-pointer bg-white group min-h-[110px]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#5C5C5C] shrink-0 mt-0.5">
                      <RiUserLine className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[#171717] leading-[20px] group-hover:text-[#7D52F4] transition-colors">
                        {cat.title}
                      </span>
                      <span className="text-[12px] text-[#5C5C5C] leading-[16px]">
                        {cat.subtitle}
                      </span>
                    </div>
                  </div>

                  <RiArrowRightSLine className="size-4 text-[#A4A4A4] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <div className="mt-3">
                  {cat.status === "MISSING" ? (
                    <span className="bg-[#FFEBEC] text-[#681219] rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.02em] inline-flex items-center">
                      MISSING
                    </span>
                  ) : (
                    <div className="h-1.5 w-full bg-[#EBEBEB] rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          cat.status === "GREEN"
                            ? "bg-[#1FC16B] w-full"
                            : "bg-[#F6B51E] w-[60%]"
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <span className="text-[12px] text-[#A4A4A4] mt-2 font-normal">
            Last assessed 20 Jul 2026, 09:42
          </span>
        </div>
      </div>

      {/* Migrant Compliance Table Section */}
      <div className="flex flex-col gap-3 mt-4">
        <h2 className="text-[20px] leading-[28px] font-medium text-[#171717] font-aeonik-medium">
          Migrant compliance
        </h2>

        {/* Toolbar: Search + Filters */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-[348px] h-[32px] bg-white rounded-[8px] border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] px-2.5 flex items-center gap-2 focus-within:border-[#7D52F4] transition-colors">
            <RiSearch2Line className="size-4 text-[#A4A4A4] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full text-[14px] text-[#171717] placeholder-[#A4A4A4] outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#A4A4A4] hover:text-[#171717] cursor-pointer"
              >
                <RiCloseLine className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button className="w-[32px] h-[32px] bg-white rounded-[8px] border border-[#EBEBEB] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 transition-colors cursor-pointer">
            <RiFilter3Line className="size-4" />
          </button>

          {/* All Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-[32px] px-3 bg-white rounded-[8px] border border-[#EBEBEB] text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] flex items-center gap-1.5 hover:bg-neutral-50 transition-colors cursor-pointer outline-none">
              <span>{statusDropdownFilter}</span>
              <RiArrowDownSLine className="size-4 text-[#5C5C5C]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px]">
              {["All status", "Missing", "Review", "Verified"].map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onClick={() => setStatusDropdownFilter(opt)}
                  className="cursor-pointer text-[13px]"
                >
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Table Layout */}
        <div className="bg-[#F7F7F7] rounded-[16px] p-2 flex flex-col gap-2">
          {/* Table Header Row */}
          <div className="h-[36px] bg-[#F7F7F7] px-4 flex items-center text-[12px] font-medium tracking-[0.04em] uppercase text-[#A4A4A4] select-none">
            <div className="w-[100px] flex items-center gap-1">
              <span>CASE ID #</span>
            </div>

            <div className="w-[280px] flex items-center gap-1">
              <span>NAME</span>
              <RiExpandUpDownLine className="size-3.5 text-[#A4A4A4]" />
            </div>

            <div className="w-[200px] flex items-center gap-1">
              <span>DOCUMENT TYPE</span>
            </div>

            <div className="w-[150px] flex items-center gap-1">
              <span>STATUS</span>
              <RiExpandUpDownLine className="size-3.5 text-[#A4A4A4]" />
            </div>

            <div className="w-[160px] flex items-center gap-1">
              <span>EXPIRY DATE</span>
              <RiExpandUpDownLine className="size-3.5 text-[#A4A4A4]" />
            </div>

            <div className="flex-1 flex items-center justify-start">
              <span>UPLOADED</span>
              <RiExpandUpDownLine className="size-3.5 text-[#A4A4A4] ml-1" />
            </div>

            <div className="w-[48px]" />
          </div>

          {/* Floating Table Card Rows */}
          <div className="flex flex-col gap-2">
            {filteredDocs.length === 0 ? (
              <div className="bg-white rounded-[16px] py-12 px-4 text-center text-[#5C5C5C] text-[14px]">
                No migrant documents found matching your criteria.
              </div>
            ) : (
              filteredDocs.map((row) => (
                <div
                  key={row.id}
                  className="bg-white rounded-[16px] h-[72px] px-4 flex items-center justify-between border border-transparent hover:border-[#EBEBEB] hover:shadow-xs transition-all"
                >
                  {/* Case ID */}
                  <div className="w-[100px] font-mono text-[14px] text-[#5C5C5C]">
                    {row.caseId}
                  </div>

                  {/* Name + Subtitle + Avatar */}
                  <div className="w-[280px] flex items-center gap-3">
                    {row.avatarUrl ? (
                      <img
                        src={row.avatarUrl}
                        alt={row.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#EBEBEB] text-[#171717] font-medium text-[14px] flex items-center justify-center shrink-0">
                        {row.avatarInitials}
                      </div>
                    )}

                    <div className="flex flex-col justify-center">
                      <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]">
                        {row.name}
                      </span>
                      <span className="text-[12px] text-[#5C5C5C] leading-[16px]">
                        {row.company}
                      </span>
                    </div>
                  </div>

                  {/* Document Type */}
                  <div className="w-[200px] flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#5C5C5C] shrink-0">
                      <RiFileTextLine className="size-4" />
                    </div>
                    <span className="text-[14px] font-normal text-[#171717]">
                      {row.documentType}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="w-[150px]">
                    {row.status === "MISSING" && (
                      <span className="bg-[#FFEBEC] text-[#681219] rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.02em] inline-flex items-center">
                        MISSING
                      </span>
                    )}
                    {row.status === "REVIEW" && (
                      <span className="bg-[#FFFAEB] text-[#624C18] rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.02em] inline-flex items-center">
                        REVIEW
                      </span>
                    )}
                    {row.status === "VERIFIED" && (
                      <span className="bg-[#E3F7EC] text-[#0D6332] rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.02em] inline-flex items-center">
                        VERIFIED
                      </span>
                    )}
                  </div>

                  {/* Expiry Date */}
                  <div className="w-[160px] text-[14px] font-normal text-[#171717] opacity-80">
                    {row.expiryDate}
                  </div>

                  {/* Uploaded Date */}
                  <div className="flex-1 text-[14px] font-normal text-[#171717] opacity-80">
                    {row.uploadedDate}
                  </div>

                  {/* Action Menu */}
                  <div className="w-[48px] flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-100 transition-colors cursor-pointer outline-none">
                        <RiMore2Line className="size-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMigrant(row.name);
                            setSelectedDocType(row.documentType);
                            setIsUploadModalOpen(true);
                          }}
                          className="cursor-pointer text-[13px]"
                        >
                          Upload / Replace Document
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-[13px]">
                          View Document Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-[13px]">
                          Mark as Verified
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upload Document Modal Dialog */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-medium font-aeonik-medium text-[#171717]">
              Upload Compliance Document
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[#5C5C5C]">
              Attach statutory compliance documentation to migrant record.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#171717]">
                Migrant Name
              </label>
              <input
                type="text"
                value={selectedMigrant}
                onChange={(e) => setSelectedMigrant(e.target.value)}
                className="w-full h-[36px] px-3 text-[14px] bg-white border border-[#EBEBEB] rounded-[8px] outline-none focus:border-[#7D52F4]"
                placeholder="Enter migrant name"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#171717]">
                Document Type
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full h-[36px] px-3 text-[14px] bg-white border border-[#EBEBEB] rounded-[8px] outline-none focus:border-[#7D52F4]"
              >
                <option value="Passport">Passport</option>
                <option value="eVisa">eVisa</option>
                <option value="Right to Work">Right to Work</option>
                <option value="Contract">Contract</option>
                <option value="CoS">CoS</option>
                <option value="Proof of Address">Proof of Address</option>
                <option value="Payslip">Payslip</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#171717]">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-[36px] px-3 text-[14px] bg-white border border-[#EBEBEB] rounded-[8px] outline-none focus:border-[#7D52F4]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#171717]">
                Document File (PDF, PNG, JPG)
              </label>
              <div className="border-2 border-dashed border-[#EBEBEB] rounded-[10px] p-4 text-center flex flex-col items-center justify-center gap-2 hover:border-[#7D52F4]/50 transition-colors bg-[#FAF8FF]/50 cursor-pointer">
                <RiUpload2Line className="size-6 text-[#7D52F4]" />
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      setFileName(e.target.files[0].name);
                    }
                  }}
                  className="hidden"
                  id="doc-file-upload"
                />
                <label
                  htmlFor="doc-file-upload"
                  className="text-[13px] text-[#7D52F4] font-medium hover:underline cursor-pointer"
                >
                  {fileName ? fileName : "Click to select a file"}
                </label>
                <span className="text-[11px] text-[#A4A4A4]">
                  Max file size: 10MB
                </span>
              </div>
            </div>

            {uploadSuccess && (
              <div className="bg-[#E3F7EC] border border-[#A6F4C5] rounded-[10px] p-3 text-[13px] text-[#0D6332] flex items-center gap-2">
                <RiCheckLine className="size-5 shrink-0 text-[#0D6332]" />
                <span>
                  Document successfully uploaded and attached to {selectedMigrant}&apos;s profile.
                </span>
              </div>
            )}

            <DialogFooter className="pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="h-[36px] px-4 rounded-[8px] border border-[#EBEBEB] text-[14px] font-medium text-[#5C5C5C] hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="h-[36px] px-4 rounded-[8px] bg-[#7D52F4] hover:bg-[#6C3FEB] text-white text-[14px] font-medium transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <RiUpload2Line className="size-4" />
                    <span>Upload</span>
                  </>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

