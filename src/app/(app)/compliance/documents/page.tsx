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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatFullName, getInitials } from "@/lib/format";

import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { FilePreviewModal } from "@/app/(app)/cases/components/FilePreviewModal";
import { DocumentItem } from "@/app/(app)/cases/components/types";

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

const fallbackMigrantDocs: MigrantDocItem[] = [];

export default function ComplianceDocumentsPage() {
  const [migrantDocs, setMigrantDocs] = React.useState<MigrantDocItem[]>([]);
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
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  // File Preview Modal State
  const [previewDoc, setPreviewDoc] = React.useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const handleOpenPreviewDoc = (row: MigrantDocItem) => {
    setPreviewDoc({
      id: row.id,
      name: `${row.name} - ${row.documentType}`,
      subtitle: `${row.documentType.replace(/\s+/g, "_")}.pdf · 1.8 MB`,
      category: row.documentType || "Compliance Document",
      date: row.uploadedDate || row.expiryDate || "15 May 2026",
      status: row.status === "VERIFIED" ? "uploaded" : "under_review",
    });
    setIsPreviewOpen(true);
  };

  // Fetch real cases and migrant document data from NestJS backend
  const fetchDocumentsData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>(ENDPOINTS.cases.base);
      const rawArr: any[] = Array.isArray(res) ? res : res?.data ?? [];

      if (rawArr.length > 0) {
        const mapped: MigrantDocItem[] = rawArr.map((c, i) => {
          const name = formatFullName(c.first_name || c.migrant?.user?.personalInfo?.firstName, c.last_name || c.migrant?.user?.personalInfo?.lastName) || `Migrant #${c.id}`;
          const initials = getInitials(name);
          const caseId = c.caseIdDisplay || c.caseNumber || `${c.id}/2026`;
          const company = c.group_name || c.company || "AX Studios";
          const docType = c.doc_type || "Passport";
          
          let st: "MISSING" | "REVIEW" | "VERIFIED" = "VERIFIED";
          if (c.doc_status) {
            const upper = String(c.doc_status).toUpperCase();
            if (upper === "MISSING") st = "MISSING";
            else if (upper === "REVIEW" || upper === "PENDING") st = "REVIEW";
            else st = "VERIFIED";
          }

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

  // Derived KPI Counts
  const kpis = React.useMemo(() => {
    return {
      total: migrantDocs.length,
      review: migrantDocs.filter((d) => d.status === "REVIEW").length,
      expiringSoon: migrantDocs.filter((d) => (d as any).status === "DUE" || (d as any).status === "EXPIRING_SOON").length,
      expired: migrantDocs.filter((d) => d.status === "MISSING").length,
      verified: migrantDocs.filter((d) => d.status === "VERIFIED").length,
    };
  }, [migrantDocs]);

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
    setUploadError(null);

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
      console.error("Backend API document upload error:", err?.message || err);
      setUploadError(err?.message || "Failed to upload document. Please try again.");
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
            type="button"
            onClick={() => {
              setIsUploadModalOpen(true);
              setUploadSuccess(false);
              setUploadError(null);
            }}
            className="bg-[#7D52F4] hover:bg-[#6C3FEB] text-white rounded-[10px] h-[36px] px-4 font-medium text-[14px] flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <RiUpload2Line className="size-4" />
            <span>Upload document</span>
          </button>
        </div>
      </div>

      {/* KPI / Summary Stat Cards (5 Column Grid - Dynamic Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: TOTAL MIGRANTS */}
        <div className="bg-[#F2EFFE] border border-[#E7E2FE] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            TOTAL MIGRANTS
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#7D52F4] font-aeonik-medium">
            {kpis.total}
          </span>
        </div>

        {/* Card 2: PENDING REVIEW */}
        <div className="bg-[#FEF6E6] border border-[#FEF0C7] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            PENDING REVIEW
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#D97706] font-aeonik-medium">
            {kpis.review}
          </span>
        </div>

        {/* Card 3: EXPIRING SOON */}
        <div className="bg-white border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            EXPIRING SOON
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#171717] font-aeonik-medium">
            {kpis.expiringSoon}
          </span>
        </div>

        {/* Card 4: EXPIRED */}
        <div className="bg-[#FFEBEC] border border-[#FECDCA] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            EXPIRED
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#FB3748] font-aeonik-medium">
            {kpis.expired}
          </span>
        </div>

        {/* Card 5: VERIFIED */}
        <div className="bg-[#E3F7EC] border border-[#A6F4C5] rounded-[16px] p-4 flex flex-col justify-between h-[88px] transition-all hover:shadow-xs">
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#5C5C5C]">
            VERIFIED
          </span>
          <span className="text-[28px] leading-[32px] font-semibold text-[#0D6332] font-aeonik-medium">
            {kpis.verified}
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
                className="bg-[#FAFAFA] rounded-[12px] p-4 border border-[#EBEBEB] flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-medium text-[#171717]">
                    {cat.title}
                  </span>
                  {cat.status === "MISSING" && (
                    <span className="px-2 py-0.5 rounded-[6px] bg-[#FFEBEC] text-[#FB3748] text-[11px] font-medium">
                      MISSING
                    </span>
                  )}
                  {cat.status === "AMBER" && (
                    <span className="px-2 py-0.5 rounded-[6px] bg-[#FEF6E6] text-[#D97706] text-[11px] font-medium">
                      AMBER
                    </span>
                  )}
                  {cat.status === "GREEN" && (
                    <span className="px-2 py-0.5 rounded-[6px] bg-[#E3F7EC] text-[#0D6332] text-[11px] font-medium">
                      100%
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#5C5C5C] leading-snug">
                  {cat.subtitle}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Migrants Document Table Section */}
      <div className="flex flex-col gap-3 mt-4">
        {/* Controls Bar: Search & Status Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex items-center w-full sm:w-[320px]">
            <RiSearch2Line className="size-4 text-[#A4A4A4] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by migrant, case ID or document..."
              className="w-full h-[36px] pl-9 pr-8 text-[13px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] shadow-xs placeholder:text-[#A4A4A4] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-[#A4A4A4] hover:text-[#171717] cursor-pointer"
              >
                <RiCloseLine className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <select
                value={statusDropdownFilter}
                onChange={(e) => setStatusDropdownFilter(e.target.value)}
                className="h-[36px] pl-3 pr-8 text-[13px] font-medium text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] shadow-xs appearance-none cursor-pointer transition-colors"
              >
                <option value="All status">All status</option>
                <option value="Missing">Missing</option>
                <option value="Review">Review</option>
                <option value="Verified">Verified</option>
              </select>
              <RiArrowDownSLine className="size-4 text-[#5C5C5C] absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Box */}
        <div className="bg-white rounded-[16px] border border-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center px-6 py-3 bg-[#FAFAFA] border-b border-[#EBEBEB] text-[12px] font-medium text-[#5C5C5C] uppercase tracking-wider">
            <div className="flex-1 min-w-[200px]">MIGRANT / CASE</div>
            <div className="flex-1 min-w-[140px]">DOCUMENT TYPE</div>
            <div className="w-[120px]">STATUS</div>
            <div className="flex-1 min-w-[120px]">EXPIRY DATE</div>
            <div className="flex-1 min-w-[120px]">UPLOADED</div>
            <div className="w-[48px]"></div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#EBEBEB]">
            {filteredDocs.length === 0 ? (
              <div className="p-8 text-center text-[#5C5C5C] text-[14px]">
                No document compliance records found matching your filters.
              </div>
            ) : (
              filteredDocs.map((row, idx) => (
                <div
                  key={row.id ? `doc-${row.id}-${idx}` : `doc-${row.caseId}-${idx}`}
                  className="flex items-center px-6 py-3.5 hover:bg-[#FAFAFA] transition-colors"
                >
                  {/* Migrant / Case Column */}
                  <div className="flex-1 min-w-[200px] flex items-center gap-3">
                    {row.avatarUrl ? (
                      <img
                        src={row.avatarUrl}
                        alt={row.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#EBEBEB] text-[#171717] font-medium text-[13px] flex items-center justify-center shrink-0">
                        {row.avatarInitials}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[#171717]">
                        {row.name}
                      </span>
                      <span className="text-[12px] text-[#5C5C5C]">
                        {row.caseId} • {row.company}
                      </span>
                    </div>
                  </div>

                  {/* Document Type */}
                  <div className="flex-1 min-w-[140px] text-[14px] font-medium text-[#171717]">
                    {row.documentType}
                  </div>

                  {/* Status Badge */}
                  <div className="w-[120px]">
                    {row.status === "MISSING" && (
                      <span className="px-2.5 py-1 rounded-[6px] bg-[#FFEBEC] text-[#FB3748] text-[12px] font-medium inline-block">
                        MISSING
                      </span>
                    )}
                    {row.status === "REVIEW" && (
                      <span className="px-2.5 py-1 rounded-[6px] bg-[#FEF6E6] text-[#D97706] text-[12px] font-medium inline-block">
                        REVIEW
                      </span>
                    )}
                    {row.status === "VERIFIED" && (
                      <span className="px-2.5 py-1 rounded-[6px] bg-[#E3F7EC] text-[#0D6332] text-[12px] font-medium inline-block">
                        VERIFIED
                      </span>
                    )}
                  </div>

                  {/* Expiry Date */}
                  <div className="flex-1 min-w-[120px] text-[14px] text-[#171717]">
                    {row.expiryDate}
                  </div>

                  {/* Uploaded Date */}
                  <div className="flex-1 min-w-[120px] text-[14px] text-[#5C5C5C]">
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
                            setUploadSuccess(false);
                            setUploadError(null);
                          }}
                          className="cursor-pointer text-[13px]"
                        >
                          Upload / Replace Document
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenPreviewDoc(row)}
                          className="cursor-pointer text-[13px]"
                        >
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
        <DialogContent className="sm:max-w-[480px] p-6 rounded-[20px] bg-white border border-[#EBEBEB] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-medium font-aeonik-medium text-[#171717]">
              Upload Document
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#5C5C5C]">
              Attach compliance evidence for migrant verification.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="upload-migrant-name-input" className="text-[13px] font-medium text-[#171717]">
                Migrant Name
              </Label>
              <Input
                id="upload-migrant-name-input"
                type="text"
                value={selectedMigrant}
                onChange={(e) => setSelectedMigrant(e.target.value)}
                className="w-full h-[36px] px-3 text-[14px] bg-white border border-[#EBEBEB] rounded-[8px] outline-none focus:border-[#7D52F4]"
                placeholder="Enter migrant name"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="upload-doc-type-select" className="text-[13px] font-medium text-[#171717]">
                Document Type
              </Label>
              {/* ui-native-fallback */}
              <select
                id="upload-doc-type-select"
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
              <Label htmlFor="upload-expiry-date-input" className="text-[13px] font-medium text-[#171717]">
                Expiry Date
              </Label>
              <Input
                id="upload-expiry-date-input"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-[36px] px-3 text-[14px] bg-white border border-[#EBEBEB] rounded-[8px] outline-none focus:border-[#7D52F4]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-file-upload" className="text-[13px] font-medium text-[#171717]">
                Document File (PDF, PNG, JPG)
              </Label>
              <div className="border-2 border-dashed border-[#EBEBEB] rounded-[10px] p-4 text-center flex flex-col items-center justify-center gap-2 hover:border-[#7D52F4]/50 transition-colors bg-[#FAF8FF]/50 cursor-pointer">
                <RiUpload2Line className="size-6 text-[#7D52F4]" />
                {/* ui-native-fallback */}
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
                <Label
                  htmlFor="doc-file-upload"
                  className="text-[13px] font-medium text-[#7D52F4] cursor-pointer"
                >
                  {fileName ? fileName : "Click to select a file"}
                </Label>
                <span className="text-[11px] text-[#A4A4A4]">Maximum file size: 25MB</span>
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

            {uploadError && (
              <div className="bg-[#FFEBEC] border border-[#FECDCA] rounded-[10px] p-3 text-[13px] text-[#FB3748] flex items-center gap-2">
                <RiCloseLine className="size-5 shrink-0 text-[#FB3748]" />
                <span>{uploadError}</span>
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
      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={previewDoc}
      />
    </div>
  );
}
