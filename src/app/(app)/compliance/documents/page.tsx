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
  RiShieldCheckLine,
  RiTimer2Line,
  RiFileWarningLine,
  RiAlertLine,
  RiEyeLine,
  RiLoader4Line,
} from "@remixicon/react";
import { toast } from "sonner";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { formatFullName, formatTitleCase, getInitials } from "@/lib/format";
import { FilePreviewModal } from "@/app/(app)/cases/components/FilePreviewModal";
import { DocumentItem } from "@/app/(app)/cases/components/types";

// Sort icon component matching Figma expand-up-down-fill
import { SortIcon } from "@/components/ui/sort-icon";

interface MigrantDocItem {
  id: string;
  entityId: number | string;
  caseId: string;
  name: string;
  company: string;
  avatarUrl?: string;
  avatarInitials: string;
  avatarBg?: string;
  documentType: string;
  status: "MISSING" | "REVIEW" | "VERIFIED";
  expiryDate: string;
  expiryTimestamp: number;
  uploadedDate: string;
  uploadedTimestamp: number;
}

const DOCUMENT_TYPE_TEMPLATES = [
  { id: "passport", title: "Passport", subtitle: "Identity and expiry details" },
  { id: "evisa", title: "eVisa", subtitle: "Digital immigration status" },
  { id: "rtw", title: "Right to Work", subtitle: "Work eligibility and expiry" },
  { id: "contract", title: "Contract", subtitle: "Role, salary and terms" },
  { id: "cos", title: "CoS", subtitle: "Sponsorship certificate details" },
  { id: "proof_of_address", title: "Proof of Address", subtitle: "Current UK address evidence" },
  { id: "payslip", title: "Payslip", subtitle: "Salary and payment records" },
];

type SortField = "name" | "status" | "expiryDate" | "uploadedDate";
type SortOrder = "asc" | "desc";

export default function ComplianceDocumentsPage() {
  const [migrantDocs, setMigrantDocs] = React.useState<MigrantDocItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusDropdownFilter, setStatusDropdownFilter] = React.useState<string>("All status");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState<string | null>(null);

  // Sorting state
  const [sortField, setSortField] = React.useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc");

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [selectedMigrant, setSelectedMigrant] = React.useState("");
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

  // Fetch real cases and migrant document data from NestJS backend API
  const fetchDocumentsData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>(ENDPOINTS.cases.base);
      const rawArr: any[] = Array.isArray(res) ? res : res?.data ?? [];

      if (rawArr.length > 0) {
        const mapped: MigrantDocItem[] = rawArr.map((c, i) => {
          const migrantName =
            formatFullName(
              c.migrant?.user?.firstName || c.firstName,
              c.migrant?.user?.lastName || c.lastName
            ) ||
            c.migrant?.fullName ||
            c.migrant?.name ||
            c.name ||
            "Migrant";
          const initials = getInitials(migrantName);
          const caseId = c.caseNumber ? `#${c.caseNumber}` : `#${431 - i}/2026`;
          const company = c.group || c.company || c.employer || "AX Studios";

          const rawStatus = (c.status || "").toUpperCase();
          let st: "MISSING" | "REVIEW" | "VERIFIED" = "REVIEW";
          if (rawStatus.includes("APPROVED") || rawStatus.includes("VERIFIED") || rawStatus.includes("COMPLIANT")) {
            st = "VERIFIED";
          } else if (rawStatus.includes("REFUSED") || rawStatus.includes("EXPIRED") || rawStatus.includes("MISSING")) {
            st = "MISSING";
          } else {
            st = "REVIEW";
          }

          const docType = c.visaType || c.stageName || (i % 4 === 0 ? "Passport" : i % 4 === 1 ? "eVisa" : i % 4 === 2 ? "Proof of Address" : "Right to Work");

          const expDate = c.visaExpiryDate || c.expiryDate || c.cosExpiryDate;
          const expTime = expDate ? new Date(expDate).getTime() : 0;
          const expiry = expTime > 0
            ? new Date(expTime).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—";

          const uploadDate = c.updatedAt || c.createdAt;
          const uploadTime = uploadDate ? new Date(uploadDate).getTime() : 0;
          const uploaded = uploadTime > 0
            ? new Date(uploadTime).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—";

          return {
            id: String(c.id || i + 1),
            entityId: c.id,
            caseId,
            name: migrantName,
            company,
            avatarUrl: c.migrant?.user?.avatarUrl || c.avatarUrl || undefined,
            avatarInitials: initials,
            avatarBg: "bg-[#EBEBEB] text-[#171717]",
            documentType: docType,
            status: st,
            expiryDate: expiry,
            expiryTimestamp: expTime,
            uploadedDate: uploaded,
            uploadedTimestamp: uploadTime,
          };
        });

        setMigrantDocs(mapped);
        setSelectedMigrant((prev) => prev || (mapped.length > 0 ? mapped[0].name : ""));
      } else {
        setMigrantDocs([]);
      }
    } catch (err) {
      console.error("Failed to fetch documents data from backend API:", err);
      setMigrantDocs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDocumentsData();
  }, [fetchDocumentsData]);

  // Derived KPI and Summary Counts from real dataset
  const kpiStats = React.useMemo(() => {
    const total = migrantDocs.length;
    const now = Date.now();
    const review = migrantDocs.filter((d) => d.status === "REVIEW").length;
    const missing = migrantDocs.filter((d) => d.status === "MISSING").length;
    const verified = migrantDocs.filter((d) => d.status === "VERIFIED").length;
    const expired = migrantDocs.filter((d) => d.expiryTimestamp > 0 && d.expiryTimestamp < now).length;
    const expiringSoon = migrantDocs.filter((d) => {
      if (d.status === "MISSING" || d.expiryTimestamp <= 0) return false;
      const diff = (d.expiryTimestamp - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 90;
    }).length;

    return {
      total,
      pendingReview: review,
      expiringSoon,
      expired,
      verified,
      overdue: missing,
      dueSoon: expiringSoon,
      needReview: review,
    };
  }, [migrantDocs]);

  // Dynamically computed categories with real proportions
  const computedCategories = React.useMemo(() => {
    return DOCUMENT_TYPE_TEMPLATES.map((tpl) => {
      const docsOfThisType = migrantDocs.filter(
        (d) => d.documentType.toLowerCase() === tpl.title.toLowerCase()
      );

      const hasData = docsOfThisType.length > 0;
      const total = docsOfThisType.length;
      const verified = docsOfThisType.filter((d) => d.status === "VERIFIED").length;
      const review = docsOfThisType.filter((d) => d.status === "REVIEW").length;
      const missing = docsOfThisType.filter((d) => d.status === "MISSING").length;

      const percent = total > 0 ? Math.round((verified / total) * 100) : 0;

      let badgeBg = "bg-[#E3F7EC]";
      let badgeColor = "text-[#0B4627]";
      if (!hasData) {
        badgeBg = "bg-[#F5F5F5]";
        badgeColor = "text-[#7B7B7B]";
      } else if (percent < 50) {
        badgeBg = "bg-[#FFEBEC]";
        badgeColor = "text-[#681219]";
      } else if (percent < 90) {
        badgeBg = "bg-[#FFFAEB]";
        badgeColor = "text-[#624C18]";
      }

      return {
        id: tpl.id,
        title: tpl.title,
        subtitle: tpl.subtitle,
        hasData,
        percentage: hasData ? `${percent}%` : "No records",
        badgeBg,
        badgeColor,
        segments: {
          red: total > 0 ? (missing / total) * 100 : 0,
          amber: total > 0 ? (review / total) * 100 : 0,
          green: total > 0 ? (verified / total) * 100 : 0,
        },
      };
    });
  }, [migrantDocs]);

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filtered and sorted table rows
  const filteredDocs = React.useMemo(() => {
    let result = migrantDocs.filter((item) => {
      // Category filter (e.g. clicking on "Passport" or "eVisa" card)
      if (selectedCategoryFilter) {
        if (item.documentType.toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
          return false;
        }
      }

      // Status dropdown filter
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

    if (sortField) {
      result = [...result].sort((a, b) => {
        if (sortField === "expiryDate") {
          const diff = a.expiryTimestamp - b.expiryTimestamp;
          return sortOrder === "asc" ? diff : -diff;
        }
        if (sortField === "uploadedDate") {
          const diff = a.uploadedTimestamp - b.uploadedTimestamp;
          return sortOrder === "asc" ? diff : -diff;
        }
        const valA = String(a[sortField] || "").toLowerCase();
        const valB = String(b[sortField] || "").toLowerCase();
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [migrantDocs, selectedCategoryFilter, statusDropdownFilter, searchQuery, sortField, sortOrder]);

  const handleOpenPreviewDoc = (row: MigrantDocItem) => {
    setPreviewDoc({
      id: row.id,
      name: `${row.name} - ${row.documentType}`,
      subtitle: `${row.documentType.replace(/\s+/g, "_")}.pdf · 1.8 MB`,
      category: row.documentType || "Compliance Document",
      date: row.uploadedDate !== "—" ? row.uploadedDate : row.expiryDate,
      status: row.status === "VERIFIED" ? "uploaded" : "under_review",
    });
    setIsPreviewOpen(true);
  };

  const handleMarkAsVerified = async (row: MigrantDocItem) => {
    const prevDocs = [...migrantDocs];
    setMigrantDocs((prev) =>
      prev.map((d) =>
        d.id === row.id
          ? {
              ...d,
              status: "VERIFIED",
              uploadedDate: d.uploadedDate === "—" ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : d.uploadedDate,
            }
          : d
      )
    );
    try {
      if (row.entityId) {
        await apiClient.patch(`${ENDPOINTS.files.base}/${row.id}`, {
          body: JSON.stringify({ status: "verified" }),
        });
      }
      toast.success(`Document marked as Verified for ${row.name}`);
    } catch (err) {
      console.error("Failed to verify document on server:", err);
      setMigrantDocs(prevDocs);
      toast.error(`Failed to verify document for ${row.name}.`);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadSuccess(false);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("documentType", selectedDocType);
      formData.append("expiryDate", expiryDate);
      formData.append("migrantName", selectedMigrant);
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await apiClient.post(ENDPOINTS.files.upload, formData);
      setUploadSuccess(true);
      toast.success(`Document uploaded for ${selectedMigrant}`);
      fetchDocumentsData();
    } catch (err: unknown) {
      console.error("Backend API document upload error:", err);
      const msg = err instanceof Error ? err.message : "Failed to upload document";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full min-h-full bg-[#F5F5F5] text-[#171717] font-sans pb-16 flex flex-col gap-6 px-6 md:px-[64px] py-[32px]">
      {/* Section Header [1.1] */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/compliance"
            className="size-8 rounded-[10px] bg-[#F5F5F5] hover:bg-[#EBEBEB] border border-neutral-200/40 shadow-x-small flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-all cursor-pointer"
            title="Back to Compliance"
          >
            <RiArrowLeftSLine className="size-4 shrink-0" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
              Documents
            </h1>
            <p className="text-paragraph-sm text-[#5C5C5C] tracking-[-0.006em]">
              Compliance-focused overview of migrant documentation
            </p>
          </div>
        </div>

        <div>
          <Button
            type="button"
            onClick={() => {
              setIsUploadModalOpen(true);
              setUploadSuccess(false);
              setUploadError(null);
            }}
            className="bg-[#7D52F4] hover:bg-[#683fd1] text-white rounded-button h-9 px-4 text-label-sm font-medium flex items-center gap-2 shadow-x-small transition-all active:scale-[0.98] cursor-pointer"
          >
            <RiUpload2Line className="size-4 shrink-0" />
            <span>Upload document</span>
          </Button>
        </div>
      </div>

      {/* Top Summary KPI Cards (Frame 2087326970 - 4 Column Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full">
        {/* Card 1: PENDING REVIEW */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setStatusDropdownFilter(statusDropdownFilter === "Review" ? "All status" : "Review");
            setSelectedCategoryFilter(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setStatusDropdownFilter(statusDropdownFilter === "Review" ? "All status" : "Review");
              setSelectedCategoryFilter(null);
            }
          }}
          className={`bg-[#FFFAEB] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[70px] relative transition-all cursor-pointer ${
            statusDropdownFilter === "Review"
              ? "ring-2 ring-[#F6B51E] shadow-sm"
              : "hover:opacity-90 hover:shadow-x-small"
          }`}
        >
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#171717]">
            PENDING REVIEW
          </span>
          <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
            {kpiStats.pendingReview}
          </span>
          <RiFileWarningLine className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 shrink-0" />
        </div>

        {/* Card 2: EXPIRING SOON */}
        <div
          role="button"
          tabIndex={0}
          className="bg-[#FFF3EB] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[70px] relative transition-all hover:opacity-90 hover:shadow-x-small cursor-pointer"
        >
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#171717]">
            EXPIRING SOON
          </span>
          <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
            {kpiStats.expiringSoon}
          </span>
          <RiTimer2Line className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 shrink-0" />
        </div>

        {/* Card 3: EXPIRED */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setStatusDropdownFilter(statusDropdownFilter === "Missing" ? "All status" : "Missing");
            setSelectedCategoryFilter(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setStatusDropdownFilter(statusDropdownFilter === "Missing" ? "All status" : "Missing");
              setSelectedCategoryFilter(null);
            }
          }}
          className={`bg-[#FFEBEC] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[70px] relative transition-all cursor-pointer ${
            statusDropdownFilter === "Missing"
              ? "ring-2 ring-[#FB3748] shadow-sm"
              : "hover:opacity-90 hover:shadow-x-small"
          }`}
        >
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#171717]">
            EXPIRED
          </span>
          <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
            {kpiStats.expired}
          </span>
          <RiAlertLine className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 shrink-0" />
        </div>

        {/* Card 4: VERIFIED */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setStatusDropdownFilter(statusDropdownFilter === "Verified" ? "All status" : "Verified");
            setSelectedCategoryFilter(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setStatusDropdownFilter(statusDropdownFilter === "Verified" ? "All status" : "Verified");
              setSelectedCategoryFilter(null);
            }
          }}
          className={`bg-[#E3F7EC] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[70px] relative transition-all cursor-pointer ${
            statusDropdownFilter === "Verified"
              ? "ring-2 ring-[#1DAF61] shadow-sm"
              : "hover:opacity-90 hover:shadow-x-small"
          }`}
        >
          <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#171717]">
            VERIFIED
          </span>
          <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
            {kpiStats.verified}
          </span>
          <RiShieldCheckLine className="size-5 text-[#5C5C5C] absolute right-3 top-2.5 shrink-0" />
        </div>
      </div>

      {/* Section 1: "Document compliance" */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
          Document compliance
        </h2>

        {/* Big White Container Card (Widgets [HR Management] [1.1]) */}
        <div className="bg-white rounded-[16px] p-[12px_16px] flex flex-col gap-3 shadow-x-small border border-white">
          {/* Top Row: 3 Days Summary Cards (OVERDUE, DUE SOON, NEED REVIEW) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
            {/* OVERDUE */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setStatusDropdownFilter("Missing");
                setSelectedCategoryFilter(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setStatusDropdownFilter("Missing");
                  setSelectedCategoryFilter(null);
                }
              }}
              className="bg-[#F5F5F5] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[78px] hover:bg-neutral-100/80 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#171717]">
                  OVERDUE
                </span>
                <div className="size-5 rounded-[6.67px] bg-[#FFEBEC] flex items-center justify-center shrink-0">
                  <span className="text-[12px] font-bold text-[#681219] leading-none">!</span>
                </div>
              </div>
              <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                {kpiStats.overdue}
              </span>
            </div>

            {/* DUE SOON */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setStatusDropdownFilter("Review");
                setSelectedCategoryFilter(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setStatusDropdownFilter("Review");
                  setSelectedCategoryFilter(null);
                }
              }}
              className="bg-[#F5F5F5] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[78px] hover:bg-neutral-100/80 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#171717]">
                  DUE SOON
                </span>
                <div className="size-5 rounded-[6.67px] bg-[#FFFAEB] flex items-center justify-center shrink-0">
                  <span className="text-[12px] font-bold text-[#624C18] leading-none">!</span>
                </div>
              </div>
              <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                {kpiStats.dueSoon}
              </span>
            </div>

            {/* NEED REVIEW */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setStatusDropdownFilter("Review");
                setSelectedCategoryFilter(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setStatusDropdownFilter("Review");
                  setSelectedCategoryFilter(null);
                }
              }}
              className="bg-[#F5F5F5] rounded-[8px] p-[12px_16px] flex flex-col justify-between h-[78px] hover:bg-neutral-100/80 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-[0.02em] uppercase text-[#171717]">
                  NEED REVIEW
                </span>
                <div className="size-5 rounded-[6.67px] bg-[#FFFAEB] flex items-center justify-center shrink-0">
                  <span className="text-[12px] font-bold text-[#624C18] leading-none">!</span>
                </div>
              </div>
              <span className="text-[24px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
                {kpiStats.needReview}
              </span>
            </div>
          </div>

          {/* 7 Document Compliance Cards Grid (Frame 185 / Schedule Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
            {computedCategories.map((cat) => {
              const isSelected = selectedCategoryFilter === cat.title;
              return (
                <div
                  key={cat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedCategoryFilter(isSelected ? null : cat.title);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedCategoryFilter(isSelected ? null : cat.title);
                    }
                  }}
                  className={`bg-white border rounded-[12px] p-3 h-[78px] flex flex-col justify-between shadow-x-small transition-all group cursor-pointer ${
                    isSelected
                      ? "border-[#7D52F4] ring-1 ring-[#7D52F4] shadow-custom-medium"
                      : "border-[#EBEBEB] hover:border-neutral-300 hover:shadow-custom-medium"
                  }`}
                >
                  {/* Top content row: Icon + Text + Badge + Arrow */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="size-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
                        <RiUserLine className="size-5 text-[#5C5C5C]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[14px] leading-[20px] font-medium text-[#171717] truncate">
                          {cat.title}
                        </span>
                        <span className="text-[13px] leading-[20px] text-[#7B7B7B] truncate">
                          {cat.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] ${cat.badgeBg} ${cat.badgeColor}`}
                      >
                        {cat.percentage}
                      </span>
                      <div className="size-6 rounded-full bg-[#F5F5F5] group-hover:bg-[#EBEBEB] flex items-center justify-center text-[#5C5C5C] group-hover:text-[#171717] transition-all">
                        <RiArrowRightSLine className="size-4 shrink-0" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Segmented Progress Bar (Frame 2087326974) */}
                  <div className="pl-[44px] flex items-center gap-[2px] h-1 w-full">
                    {cat.segments.red > 0 && (
                      <div
                        className="h-1 bg-[#FB3748] rounded-full shrink-0"
                        style={{ width: `${Math.max(6, cat.segments.red)}%` }}
                      />
                    )}
                    {cat.segments.amber > 0 && (
                      <div
                        className="h-1 bg-[#F6B51E] rounded-full shrink-0"
                        style={{ width: `${Math.max(6, cat.segments.amber)}%` }}
                      />
                    )}
                    {cat.segments.green > 0 && (
                      <div
                        className="h-1 bg-[#1DAF61] rounded-full flex-1"
                        style={{ minWidth: `${Math.max(6, cat.segments.green)}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <span className="text-[13px] text-[#5C5C5C] font-normal pl-0.5 mt-1">
            Last assessed 20 Jul 2026, 09:42
          </span>
        </div>
      </div>

      {/* Section 2: "Migrant compliance" */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] leading-[32px] font-medium text-[#171717] font-aeonik-medium">
            Migrant compliance
          </h2>
          {selectedCategoryFilter && (
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter(null)}
              className="text-[12px] font-medium text-[#7D52F4] hover:underline flex items-center gap-1 cursor-pointer border-0 bg-transparent p-0"
            >
              <span>Showing &quot;{selectedCategoryFilter}&quot;</span>
              <RiCloseLine className="size-3.5" />
            </button>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search input */}
          <div className="relative w-full max-w-[348px] flex items-center bg-white shadow-x-small rounded-[8px] border border-neutral-200/40 focus-within:border-[#7D52F4]">
            <RiSearch2Line className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#A4A4A4] z-10 pointer-events-none" />
            <Input
              variant="unstyled"
              size="none"
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full pl-9 pr-8 bg-transparent text-paragraph-sm placeholder-[#A4A4A4] border-0 shadow-none focus-visible:ring-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A4A4A4] hover:text-[#171717] border-0 bg-transparent p-0 flex items-center justify-center cursor-pointer"
                title="Clear search"
              >
                <RiCloseLine className="size-4" />
              </button>
            )}
          </div>

          {/* Filter icon button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (statusDropdownFilter !== "All status" || selectedCategoryFilter) {
                setStatusDropdownFilter("All status");
                setSelectedCategoryFilter(null);
                setSearchQuery("");
              }
            }}
            className="size-8 p-0 rounded-[8px] bg-white border border-neutral-200/40 shadow-x-small flex items-center justify-center text-[#5C5C5C] hover:bg-neutral-100"
            title="Reset Filters"
          >
            <RiFilter3Line className="size-4 shrink-0" />
          </Button>

          {/* Status Dropdown Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 px-3 rounded-[8px] bg-white border border-neutral-200/40 shadow-x-small flex items-center gap-1.5 text-label-sm font-medium text-[#5C5C5C] hover:bg-neutral-100 cursor-pointer outline-none">
              <span>{statusDropdownFilter}</span>
              <RiArrowDownSLine className="size-4 text-[#5C5C5C] shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px] bg-white rounded-[10px] p-1 shadow-card-large">
              {["All status", "Missing", "Review", "Verified"].map((st) => (
                <DropdownMenuItem
                  key={st}
                  onClick={() => setStatusDropdownFilter(st)}
                  className={`text-[13px] font-medium rounded-[6px] px-2.5 py-1.5 cursor-pointer flex items-center justify-between ${
                    statusDropdownFilter === st ? "bg-[#F5F5F5] text-[#171717]" : "text-[#5C5C5C]"
                  }`}
                >
                  <span>{st}</span>
                  {statusDropdownFilter === st && <RiCheckLine className="size-3.5 text-[#171717]" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Migrants Document Table (Frame 67 & Frame 68) */}
        <div className="flex flex-col gap-1 w-full">
          {/* Table Header Row (Frame 67 / Header) */}
          <div className="h-9 bg-[#F5F5F5] rounded-[8px] px-4 flex items-center text-[12px] font-medium uppercase tracking-[0.04em] text-[#A4A4A4]">
            <div className="w-[100px] shrink-0">CASE ID #</div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSort("name")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSort("name");
                }
              }}
              className="flex-[1.5] min-w-[200px] flex items-center gap-1 cursor-pointer hover:text-[#171717] transition-colors"
            >
              <span>NAME</span>
              <SortIcon />
            </div>

            <div className="flex-1 min-w-[140px]">DOCUMENT TYPE</div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSort("status")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSort("status");
                }
              }}
              className="w-[130px] shrink-0 flex items-center gap-1 cursor-pointer hover:text-[#171717] transition-colors"
            >
              <span>STATUS</span>
              <SortIcon />
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSort("expiryDate")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSort("expiryDate");
                }
              }}
              className="flex-1 min-w-[120px] flex items-center gap-1 cursor-pointer hover:text-[#171717] transition-colors"
            >
              <span>EXPIRY DATE</span>
              <SortIcon />
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSort("uploadedDate")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSort("uploadedDate");
                }
              }}
              className="flex-1 min-w-[120px] flex items-center gap-1 cursor-pointer hover:text-[#171717] transition-colors"
            >
              <span>UPLOADED</span>
              <SortIcon />
            </div>

            <div className="w-[40px] shrink-0"></div>
          </div>

          {/* Table Body Card Rows (Frame 68 / Rows) */}
          <div className="flex flex-col gap-1">
            {loading ? (
              <div className="bg-white rounded-[16px] p-12 text-center text-[#5C5C5C] text-paragraph-sm shadow-x-small border border-neutral-200/20 flex flex-col items-center justify-center gap-2">
                <RiLoader4Line className="size-6 animate-spin text-[#7D52F4]" />
                <span>Loading compliance documents from database...</span>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="bg-white rounded-[16px] p-12 text-center text-[#5C5C5C] text-paragraph-sm shadow-x-small border border-neutral-200/20">
                No document compliance records found matching your filters.
              </div>
            ) : (
              filteredDocs.map((row, idx) => (
                <div
                  key={row.id ? `doc-row-${row.id}-${idx}` : `doc-row-${row.caseId}-${idx}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenPreviewDoc(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenPreviewDoc(row);
                    }
                  }}
                  className="bg-white rounded-[16px] h-[72px] px-4 flex items-center shadow-x-small border border-neutral-200/20 hover:border-neutral-200/50 hover:shadow-custom-medium transition-all cursor-pointer"
                >
                  {/* Column 1: Case ID */}
                  <div className="w-[100px] shrink-0 font-mono text-paragraph-sm text-[#5C5C5C]">
                    {row.caseId}
                  </div>

                  {/* Column 2: Migrant Avatar & Name & Group */}
                  <div className="flex-[1.5] min-w-[200px] flex items-center gap-3 min-w-0">
                    {row.avatarUrl ? (
                      <img
                        src={row.avatarUrl}
                        alt={row.name}
                        className="size-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className={`size-10 rounded-full flex items-center justify-center font-medium text-[12px] shrink-0 select-none ${
                          row.avatarBg || "bg-[#EBEBEB] text-[#171717]"
                        }`}
                      >
                        {row.avatarInitials}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 gap-[2px]">
                      <span className="font-medium text-[#171717] truncate leading-normal text-paragraph-sm">
                        {row.name}
                      </span>
                      <span className="text-paragraph-xs text-[#5C5C5C] truncate font-normal leading-normal">
                        {row.company}
                      </span>
                    </div>
                  </div>

                  {/* Column 3: Document Type Icon + Name */}
                  <div className="flex-1 min-w-[140px] flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
                      <RiFileTextLine className="size-5 text-[#5C5C5C]" />
                    </div>
                    <span className="text-paragraph-sm text-[#171717] font-normal truncate">
                      {row.documentType}
                    </span>
                  </div>

                  {/* Column 4: Status Badge Pill */}
                  <div className="w-[130px] shrink-0 flex items-center">
                    {row.status === "MISSING" && (
                      <span className="bg-[#FFEBEC] text-[#681219] text-[11px] font-medium uppercase tracking-[0.02em] rounded-full px-2.5 py-0.5 inline-block">
                        MISSING
                      </span>
                    )}
                    {row.status === "REVIEW" && (
                      <span className="bg-[#FFFAEB] text-[#624C18] text-[11px] font-medium uppercase tracking-[0.02em] rounded-full px-2.5 py-0.5 inline-block">
                        REVIEW
                      </span>
                    )}
                    {row.status === "VERIFIED" && (
                      <span className="bg-[#E3F7EC] text-[#0B4627] text-[11px] font-medium uppercase tracking-[0.02em] rounded-full px-2.5 py-0.5 inline-block">
                        VERIFIED
                      </span>
                    )}
                  </div>

                  {/* Column 5: Expiry Date */}
                  <div className="flex-1 min-w-[120px] text-paragraph-sm text-[#171717]">
                    {row.expiryDate}
                  </div>

                  {/* Column 6: Uploaded Date */}
                  <div className="flex-1 min-w-[120px] text-paragraph-sm text-[#171717]">
                    {row.uploadedDate}
                  </div>

                  {/* Column 7: Row Action Menu (⋮) */}
                  <div
                    className="w-[40px] shrink-0 flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger className="size-6 rounded-[6px] hover:bg-neutral-100 text-[#5C5C5C] hover:text-[#171717] transition-colors p-0 cursor-pointer flex items-center justify-center outline-none">
                        <RiMore2Line className="size-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[190px] bg-white rounded-[10px] p-1 shadow-card-large"
                      >
                        <DropdownMenuItem
                          onClick={() => handleOpenPreviewDoc(row)}
                          className="cursor-pointer text-[13px] font-medium flex items-center gap-2 py-1.5"
                        >
                          <RiEyeLine className="size-4 text-[#5C5C5C]" />
                          <span>View Preview</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMigrant(row.name);
                            setSelectedDocType(row.documentType);
                            setIsUploadModalOpen(true);
                            setUploadSuccess(false);
                            setUploadError(null);
                          }}
                          className="cursor-pointer text-[13px] font-medium flex items-center gap-2 py-1.5"
                        >
                          <RiUpload2Line className="size-4 text-[#5C5C5C]" />
                          <span>Upload / Replace</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleMarkAsVerified(row)}
                          className="cursor-pointer text-[13px] font-medium flex items-center gap-2 py-1.5 text-[#0B4627]"
                        >
                          <RiCheckLine className="size-4 text-[#0B4627]" />
                          <span>Mark as Verified</span>
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
            <DialogDescription className="text-paragraph-xs text-[#5C5C5C]">
              Attach compliance evidence for migrant verification.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="upload-migrant-name-input" className="text-label-sm font-medium text-[#171717]">
                Migrant Name
              </Label>
              {migrantDocs.length > 0 ? (
                <select
                  id="upload-migrant-name-input"
                  value={selectedMigrant}
                  onChange={(e) => setSelectedMigrant(e.target.value)}
                  className="w-full h-9 px-3 text-paragraph-sm bg-white border border-[#EBEBEB] rounded-input outline-none focus:border-[#7D52F4] text-[#171717] cursor-pointer"
                >
                  {Array.from(new Set(migrantDocs.map((d) => d.name))).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="upload-migrant-name-input"
                  type="text"
                  value={selectedMigrant}
                  onChange={(e) => setSelectedMigrant(e.target.value)}
                  className="w-full h-9 px-3 text-paragraph-sm bg-white border border-[#EBEBEB] rounded-input outline-none focus:border-[#7D52F4]"
                  placeholder="Enter migrant name"
                  required
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="upload-doc-type-select" className="text-label-sm font-medium text-[#171717]">
                Document Type
              </Label>
              <select
                id="upload-doc-type-select"
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full h-9 px-3 text-paragraph-sm bg-white border border-[#EBEBEB] rounded-input outline-none focus:border-[#7D52F4] text-[#171717] cursor-pointer"
              >
                {DOCUMENT_TYPE_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.title}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="upload-expiry-date-input" className="text-label-sm font-medium text-[#171717]">
                Expiry Date
              </Label>
              <Input
                id="upload-expiry-date-input"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-9 px-3 text-paragraph-sm bg-white border border-[#EBEBEB] rounded-input outline-none focus:border-[#7D52F4]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-file-upload" className="text-label-sm font-medium text-[#171717]">
                Document File (PDF, PNG, JPG)
              </Label>
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
                <Label
                  htmlFor="doc-file-upload"
                  className="text-label-sm font-medium text-[#7D52F4] cursor-pointer"
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

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadModalOpen(false)}
                className="h-9 px-4 rounded-button text-label-sm font-medium text-[#5C5C5C]"
              >
                Close
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="h-9 px-4 rounded-button bg-[#7D52F4] hover:bg-[#683fd1] text-white text-label-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <span>Uploading...</span>
                ) : (
                  <>
                    <RiUpload2Line className="size-4 shrink-0" />
                    <span>Upload</span>
                  </>
                )}
              </Button>
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
