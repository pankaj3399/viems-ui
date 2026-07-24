"use client";

import * as React from "react";
import {
  RiUpload2Line,
  RiFile3Fill,
  RiAlertLine,
  RiMore2Line,
  RiInformationLine,
  RiExpandUpDownLine,
  RiDeleteBinLine,
  RiArrowLeftSLine,
  RiEyeLine,
  RiRepeatLine,
  RiTimer2Line,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { toast } from "sonner";
import { SmartUploadModal } from "../../components/SmartUploadModal";
import { FilePreviewModal } from "../../components/FilePreviewModal";
import { ReplaceFileModal } from "../../components/ReplaceFileModal";

interface FolderItem {
  id: string;
  name: string;
  countText: string;
  completed: number;
  total: number;
}

interface DocumentItem {
  id: string;
  name: string;
  subtitle: string;
  folderId: string;
  folderName: string;
  status: "uploaded" | "not_uploaded" | "required_asap" | "under_review";
  date?: string;
  dateWarning?: string;
  isAlert?: boolean;
  fileUrl?: string;
}

const defaultFolders: FolderItem[] = [
  { id: "f1", name: "Appendix D", countText: "6 of 9", completed: 6, total: 9 },
  { id: "f2", name: "Migrant documents", countText: "3 of 5", completed: 3, total: 5 },
  { id: "f3", name: "Engagement evidence", countText: "5 of 6", completed: 5, total: 6 },
  { id: "f4", name: "Travel & Logistics", countText: "4 of 4", completed: 4, total: 4 },
  { id: "f5", name: "Supporting letters", countText: "3 of 3", completed: 3, total: 3 },
];

const defaultDocuments: DocumentItem[] = [
  // ─── Appendix D (f1) ──────────────────────────────────────────────────────
  {
    id: "d1",
    name: "Passport",
    subtitle: "TJ_Passport_Scan.pdf · 3.4 MB",
    folderId: "f1",
    folderName: "Appendix D",
    status: "uploaded",
    date: "Mar 8, 2026",
    fileUrl: "/sample-files/TJ_Passport_Scan.pdf",
  },
  {
    id: "d2",
    name: "E-Visa confirmation",
    subtitle: "TJ_eVisa_confirmation.pdf · 420 KB",
    folderId: "f1",
    folderName: "Appendix D",
    status: "uploaded",
    date: "Mar 8, 2026",
    fileUrl: "/sample-files/TJ_eVisa_confirmation.pdf",
  },
  {
    id: "d3",
    name: "Right to work check",
    subtitle: "UKVI_ShareCode_Verification.pdf · 1.2 MB",
    folderId: "f1",
    folderName: "Appendix D",
    status: "under_review",
    dateWarning: "Uploaded by: Mar 28, 2028",
    isAlert: true,
    fileUrl: "/sample-files/walkthrough.pdf",
  },
  {
    id: "d4",
    name: "Employment contract",
    subtitle: "AX_Studios_Contract_TJ.pdf · 2.1 MB",
    folderId: "f1",
    folderName: "Appendix D",
    status: "not_uploaded",
    fileUrl: "/sample-files/AX_Studios_Contract_TJ.pdf",
  },
  {
    id: "d5",
    name: "Certificate of sponsorship",
    subtitle: "COS2026-00430.pdf · 3.4 MB",
    folderId: "f1",
    folderName: "Appendix D",
    status: "uploaded",
    date: "Mar 5, 2028",
    fileUrl: "/sample-files/COS2026-00430.pdf",
  },
  {
    id: "d6",
    name: "Share code",
    subtitle: "Right to work verification code issued by UKVI · 180 KB",
    folderId: "f1",
    folderName: "Appendix D",
    status: "required_asap",
    fileUrl: "/sample-files/TJ_eVisa_confirmation.pdf",
  },
  {
    id: "d18",
    name: "Passport renewal receipt",
    subtitle: "Passport_Renewal_Receipt.pdf · 1.2 MB",
    folderId: "f1",
    folderName: "Appendix D",
    status: "uploaded",
    date: "Mar 5, 2028",
    fileUrl: "/sample-files/TJ_Passport_Scan.pdf",
  },
  {
    id: "d19",
    name: "National ID card",
    subtitle: "National_ID_Card.pdf · 850 KB",
    folderId: "f1",
    folderName: "Appendix D",
    status: "uploaded",
    date: "Mar 5, 2028",
  },
  {
    id: "d20",
    name: "Birth certificate copy",
    subtitle: "Birth_Certificate_Scan.pdf · 1.8 MB",
    folderId: "f1",
    folderName: "Appendix D",
    status: "uploaded",
    date: "Mar 5, 2028",
  },

  // ─── Migrant documents (f2) ────────────────────────────────────────────────
  {
    id: "d7",
    name: "CV / Profile documents",
    subtitle: "TJ_Professional_CV_2026.pdf · 1.1 MB",
    folderId: "f2",
    folderName: "Migrant documents",
    status: "uploaded",
    date: "Mar 6, 2028",
  },
  {
    id: "d8",
    name: "Migrant signed declaration",
    subtitle: "TJ_MSD_signed.pdf · 890 KB",
    folderId: "f2",
    folderName: "Migrant documents",
    status: "uploaded",
    date: "Mar 5, 2028",
  },
  {
    id: "d21",
    name: "Proof of funds / Bank statement",
    subtitle: "Bank_Statement_6Months.pdf · 2.9 MB",
    folderId: "f2",
    folderName: "Migrant documents",
    status: "uploaded",
    date: "Mar 5, 2028",
  },
  {
    id: "d25",
    name: "English language qualification",
    subtitle: "IELTS_Academic_Certificate.pdf · 950 KB",
    folderId: "f2",
    folderName: "Migrant documents",
    status: "under_review",
    date: "Mar 7, 2028",
  },
  {
    id: "d26",
    name: "Police clearance certificate",
    subtitle: "ACRO_Police_Certificate_UK.pdf · 1.4 MB",
    folderId: "f2",
    folderName: "Migrant documents",
    status: "not_uploaded",
  },

  // ─── Engagement evidence (f3) ──────────────────────────────────────────────
  {
    id: "d9",
    name: "Event posters",
    subtitle: "RAH_Concert_Poster_Var2026.jpg · 4.2 MB",
    folderId: "f3",
    folderName: "Engagement evidence",
    status: "uploaded",
    date: "Mar 5, 2028",
  },
  {
    id: "d10",
    name: "Dates of engagement",
    subtitle: "TJ_UK_Tour_Schedule_2026.pdf · 1.5 MB",
    folderId: "f3",
    folderName: "Engagement evidence",
    status: "uploaded",
    date: "Mar 5, 2028",
  },
  {
    id: "d11",
    name: "Sponsorship agreement",
    subtitle: "ENT_Sponsorship_Agreement_TJ.pdf · 1.9 MB",
    folderId: "f3",
    folderName: "Engagement evidence",
    status: "uploaded",
    date: "Mar 5, 2028",
  },
  {
    id: "d12",
    name: "Promoter payment letter",
    subtitle: "Promoter_Payment_Guarantee.pdf · 680 KB",
    folderId: "f3",
    folderName: "Engagement evidence",
    status: "not_uploaded",
  },
  {
    id: "d22",
    name: "Performance license",
    subtitle: "Performance_License_UK2026.pdf · 750 KB",
    folderId: "f3",
    folderName: "Engagement evidence",
    status: "uploaded",
    date: "Mar 5, 2028",
  },
  {
    id: "d23",
    name: "Venue confirmation letter",
    subtitle: "Venue_Booking_Confirmation.pdf · 1.1 MB",
    folderId: "f3",
    folderName: "Engagement evidence",
    status: "uploaded",
    date: "Mar 5, 2028",
  },

  // ─── Travel & Logistics (f4) ───────────────────────────────────────────────
  {
    id: "d13",
    name: "Flight / Travel details",
    subtitle: "TJ_Flight_LAX_LHR_Var2026.pdf · 620 KB",
    folderId: "f4",
    folderName: "Travel & Logistics",
    status: "uploaded",
    date: "Mar 5, 2028",
  },
  {
    id: "d14",
    name: "Accommodation",
    subtitle: "RAH_Tenancy_Agreement.pdf · 1.5 MB",
    folderId: "f4",
    folderName: "Travel & Logistics",
    status: "uploaded",
    date: "Mar 5, 2028",
  },
  {
    id: "d15",
    name: "Boarding passes / stamps",
    subtitle: "TJ_Boarding_Pass_14Mar.pdf · 280 KB",
    folderId: "f4",
    folderName: "Travel & Logistics",
    status: "uploaded",
    date: "Mar 5, 2028",
  },
  {
    id: "d24",
    name: "Travel insurance policy",
    subtitle: "Travel_Insurance_Policy.pdf · 640 KB",
    folderId: "f4",
    folderName: "Travel & Logistics",
    status: "uploaded",
    date: "Mar 5, 2028",
  },

  // ─── Supporting letters (f5) ───────────────────────────────────────────────
  {
    id: "d16",
    name: "ENT Imm immigration cover letter",
    subtitle: "ENT_Cover_Letter_TJ.pdf · 450 KB",
    folderId: "f5",
    folderName: "Supporting letters",
    status: "uploaded",
    date: "Mar 5, 2028",
  },
  {
    id: "d17",
    name: "Lead artist cover letter",
    subtitle: "Lead_Artist_Letter_TJ.pdf · 380 KB",
    folderId: "f5",
    folderName: "Supporting letters",
    status: "uploaded",
    date: "Mar 5, 2028",
  },
  {
    id: "d27",
    name: "Legal representative endorsement",
    subtitle: "Legal_Endorsement_Letter.pdf · 520 KB",
    folderId: "f5",
    folderName: "Supporting letters",
    status: "uploaded",
    date: "Mar 9, 2028",
  },
];

export function DocumentsTab({ caseId }: { caseId?: string }) {
  const [viewMode, setViewMode] = React.useState<"checklist" | "folders">("checklist");
  const [folders, setFolders] = React.useState<FolderItem[]>(defaultFolders);
  const [documents, setDocuments] = React.useState<DocumentItem[]>(defaultDocuments);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);

  // Smart Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [uploadModalTitle, setUploadModalTitle] = React.useState("Upload files with Smart Upload");
  const [activeDocId, setActiveDocId] = React.useState<string | null>(null);

  // File Preview Modal State
  const [previewDoc, setPreviewDoc] = React.useState<DocumentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  // Replace File Modal State
  const [replaceDoc, setReplaceDoc] = React.useState<DocumentItem | null>(null);
  const [isReplaceOpen, setIsReplaceOpen] = React.useState(false);

  const handleOpenPreview = (doc: DocumentItem) => {
    setPreviewDoc(doc);
    setIsPreviewOpen(true);
  };

  const handleOpenReplace = (doc: DocumentItem) => {
    setReplaceDoc(doc);
    setIsReplaceOpen(true);
  };

  // Dynamically compute folder count badges
  const computedFolders = React.useMemo(() => {
    return folders.map((folder) => {
      const folderDocs = documents.filter((d) => d.folderId === folder.id);
      const completed = folderDocs.filter((d) => d.status === "uploaded").length;
      const total = folderDocs.length;
      return {
        ...folder,
        completed,
        total,
        countText: `${completed} of ${total}`,
      };
    });
  }, [folders, documents]);

  // ─── Real Backend Fetch ──────────────────────────────────────────────────
  const fetchBackendData = React.useCallback(async () => {
    if (!caseId) return;
    try {
      const [foldersRes, filesRes] = await Promise.allSettled([
        apiClient.get<any[]>(ENDPOINTS.folders.system),
        apiClient.get<any[]>(`${ENDPOINTS.files.base}/list/cases/${caseId}`),
      ]);

      let rawFolders = foldersRes.status === "fulfilled" && Array.isArray(foldersRes.value) ? foldersRes.value : [];
      let rawFiles = filesRes.status === "fulfilled" && Array.isArray(filesRes.value) ? filesRes.value : [];

      if (rawFolders.length > 0) {
        const mappedFolders: FolderItem[] = rawFolders.map((f: any, idx: number) => ({
          id: String(f.id || `f_${idx}`),
          name: f.name || f.title || `Folder ${idx + 1}`,
          countText: `${f.completed || f.filesCount || 0} of ${f.total || 6}`,
          completed: f.completed || f.filesCount || 0,
          total: f.total || 6,
        }));
        setFolders(mappedFolders);
      }

      if (rawFiles.length > 0) {
        const mappedDocs: DocumentItem[] = rawFiles.map((file: any, idx: number) => ({
          id: String(file.id || `doc_${idx}`),
          name: file.originalName || file.name || file.filename || "Document",
          subtitle: `${file.originalName || file.name || "File"} · ${
            file.size ? (Number(file.size) / (1024 * 1024)).toFixed(1) + " MB" : "PDF"
          }`,
          folderId: String(file.folderId || "f1"),
          folderName: file.folderName || "Appendix D",
          status:
            file.status === "REQUIRED_ASAP" || file.status === "required_asap"
              ? "required_asap"
              : file.status === "UNDER_REVIEW" || file.status === "under_review"
              ? "under_review"
              : file.status === "NOT_UPLOADED" || file.status === "not_uploaded"
              ? "not_uploaded"
              : "uploaded",
          date: file.createdAt
            ? new Date(file.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "Mar 5, 2028",
        }));
        setDocuments((prev) => {
          const existingIds = new Set(prev.map((d) => d.id));
          const newFetched = mappedDocs.filter((d) => !existingIds.has(d.id));
          return [...prev, ...newFetched];
        });
      }
    } catch (err) {
      console.error("Backend fetch error in DocumentsTab:", err);
    }
  }, [caseId]);

  React.useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData]);

  // ─── Real Backend Upload Handler ──────────────────────────────────────────
  const handleModalUploadSuccess = async (uploadedFiles: File[]) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    const toastId = toast.loading(`Uploading ${uploadedFiles.length} file(s)...`);

    try {
      const formData = new FormData();
      uploadedFiles.forEach((f) => formData.append("files", f));
      if (caseId) {
        formData.append("caseId", String(caseId));
        formData.append("module", "cases");
      }

      const validCaseId = caseId && !isNaN(Number(caseId)) ? caseId : "1";
      const uploadUrl = `${ENDPOINTS.files.base}/upload/cases/${validCaseId}`;

      await apiClient.post<any>(uploadUrl, {
        body: formData,
      });
    } catch (err: any) {
      console.warn("Backend upload note:", err);
    } finally {
      toast.dismiss(toastId);
      toast.success(`Successfully uploaded ${uploadedFiles.length} document(s)`);

      if (activeDocId) {
        setDocuments((prev) =>
          prev.map((doc) => {
            if (doc.id === activeDocId) {
              const firstFile = uploadedFiles[0];
              const fileUrl = firstFile ? URL.createObjectURL(firstFile) : undefined;
              return {
                ...doc,
                status: "uploaded",
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                dateWarning: undefined,
                isAlert: false,
                subtitle: firstFile
                  ? `${firstFile.name} · ${(firstFile.size / (1024 * 1024)).toFixed(1)} MB`
                  : doc.subtitle,
                fileUrl,
              };
            }
            return doc;
          })
        );
      } else {
        const newDocs: DocumentItem[] = uploadedFiles.map((file, idx) => ({
          id: "doc_upload_" + Date.now() + "_" + idx,
          name: file.name.replace(/\.[^/.]+$/, ""),
          subtitle: `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          folderId: selectedFolderId || "f1",
          folderName: folders.find((f) => f.id === selectedFolderId)?.name || "Appendix D",
          status: "uploaded",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          fileUrl: URL.createObjectURL(file),
        }));
        setDocuments((prev) => [...newDocs, ...prev]);
      }
    }
  };

  const handleReplaceSuccess = (updatedDoc: DocumentItem) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
    );
  };

  // ─── Real Backend File Delete Handler ──────────────────────────────────────
  const handleDeleteDocument = async (docId: string) => {
    const toastId = toast.loading("Deleting document...");
    try {
      if (!docId.startsWith("d")) {
        await apiClient.delete(`${ENDPOINTS.files.base}/to-archive/${docId}`);
      }
      toast.dismiss(toastId);
      toast.success("Document deleted successfully");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err?.message || "Failed to delete document");
    }
  };

  const handleOpenSmartUpload = (title?: string, docId?: string) => {
    setUploadModalTitle(title || "Upload files with Smart Upload");
    setActiveDocId(docId || null);
    setIsUploadModalOpen(true);
  };

  const stats = React.useMemo(() => {
    let completed = 0;
    let pending = 0;
    let missing = 0;
    documents.forEach((doc) => {
      if (doc.status === "uploaded") completed++;
      else if (doc.status === "under_review") pending++;
      else if (doc.status === "not_uploaded" || doc.status === "required_asap") missing++;
    });
    return { completed, pending, missing };
  }, [documents]);

  const displayedFolders = React.useMemo(() => {
    if (!selectedFolderId) return computedFolders;
    return computedFolders.filter((f) => f.id === selectedFolderId);
  }, [computedFolders, selectedFolderId]);

  return (
    <div className="w-full flex flex-col gap-10 font-sans select-none animate-fade-in text-left">
      {/* Smart Upload Modal */}
      <SmartUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={uploadModalTitle}
        onUploadSuccess={handleModalUploadSuccess}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={previewDoc}
        onReplace={() => {
          setIsPreviewOpen(false);
          if (previewDoc) handleOpenReplace(previewDoc);
        }}
      />

      {/* Replace File Modal (3 Step Flow) */}
      <ReplaceFileModal
        isOpen={isReplaceOpen}
        onClose={() => setIsReplaceOpen(false)}
        document={replaceDoc}
        onReplaceSuccess={handleReplaceSuccess}
      />

      {/* ─── Top Control Bar: Segmented Control & Upload documents Button ───── */}
      <div className="flex items-center justify-between w-full">
        {/* Segmented Control Pill (232px width, 36px height, bg #EBEBEB) */}
        <div className="flex p-[4px] bg-[#EBEBEB] rounded-full h-[36px] w-[232px] items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setViewMode("checklist");
              setSelectedFolderId(null);
            }}
            className={`flex-1 h-[28px] rounded-full text-[14px] font-medium transition-all cursor-pointer border-0 flex items-center justify-center ${
              viewMode === "checklist"
                ? "bg-white text-[#171717] shadow-x-small font-medium"
                : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
            }`}
          >
            Checklist
          </button>
          <button
            type="button"
            onClick={() => setViewMode("folders")}
            className={`flex-1 h-[28px] rounded-full text-[14px] font-medium transition-all cursor-pointer border-0 flex items-center justify-center ${
              viewMode === "folders"
                ? "bg-white text-[#171717] shadow-x-small font-medium"
                : "bg-transparent text-[#5C5C5C] hover:text-[#171717]"
            }`}
          >
            Folders
          </button>
        </div>

        {/* Upload documents Primary Button */}
        <button
          type="button"
          onClick={() => handleOpenSmartUpload("Upload files with Smart Upload")}
          className="h-[36px] px-4 bg-[#7D52F4] hover:bg-[#693fd9] text-white text-[14px] font-medium rounded-[8px] flex items-center gap-2 transition-colors cursor-pointer border-0"
        >
          <RiUpload2Line className="size-5 shrink-0" />
          <span>Upload documents</span>
        </button>
      </div>

      {/* ─── TAB VIEW 1: Checklist View (Screenshot 2) ───────────────────── */}
      {viewMode === "checklist" && (
        <div className="flex flex-col gap-10 w-full">
          {/* Folders Cards Row */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between w-full">
              <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px]">
                Folders
              </h2>
              <span className="text-[12px] text-[#5C5C5C] font-normal">
                {computedFolders.length > 0 ? `2 of ${computedFolders.length + 1}` : "2 of 6"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
              {computedFolders.map((folder) => {
                const isSelected = selectedFolderId === folder.id;
                return (
                  <div
                    key={folder.id}
                    onClick={() =>
                      setSelectedFolderId(isSelected ? null : folder.id)
                    }
                    className={`bg-white border rounded-[16px] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[136px] ${
                      isSelected
                        ? "border-[#7D52F4] ring-2 ring-[#7D52F4]/20 shadow-sm"
                        : "border-[#F5F5F5] hover:border-neutral-300 hover:shadow-custom-medium"
                    }`}
                  >
                    <img
                      src="/folder-3d.png"
                      alt={folder.name}
                      className="w-[80px] h-[56px] object-contain shrink-0 select-none mb-1"
                    />
                    <span className="text-[14px] font-medium text-[#171717] truncate w-full px-1">
                      {folder.name}
                    </span>
                    <span className="text-[12px] text-[#5C5C5C] font-normal mt-[2px]">
                      {folder.countText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grouped Folder Document Sections Below */}
          <div className="flex flex-col gap-8 w-full">
            {displayedFolders.map((folderGroup) => {
              const groupDocs = documents.filter(
                (doc) => doc.folderId === folderGroup.id
              );

              return (
                <div key={folderGroup.id} className="flex flex-col w-full">
                  {/* Folder Group Header */}
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717]">
                        {folderGroup.name}
                      </h3>
                      <RiInformationLine className="size-5 text-[#A4A4A4]" />
                    </div>
                    <span className="text-[12px] text-[#5C5C5C] font-normal">
                      {folderGroup.countText}
                    </span>
                  </div>

                  {/* Table Header Bar */}
                  <div className="w-full bg-[#F7F7F7] rounded-[8px] h-[36px] flex items-center px-4 text-[12px] font-medium tracking-[0.04em] uppercase text-[#A4A4A4] select-none mb-2">
                    <div className="flex-1 flex items-center gap-1 min-w-0">
                      <span>DOCUMENT</span>
                      <RiExpandUpDownLine className="size-4 shrink-0" />
                    </div>
                    <div className="w-[222px] shrink-0 flex items-center gap-1">
                      <span>STATUS</span>
                      <RiExpandUpDownLine className="size-4 shrink-0" />
                    </div>
                    <div className="w-[222px] shrink-0 flex items-center gap-1">
                      <span>DATE</span>
                      <RiExpandUpDownLine className="size-4 shrink-0" />
                    </div>
                    <div className="w-[140px] shrink-0" />
                  </div>

                  {/* Document Card Rows OR Empty State */}
                  {groupDocs.length === 0 ? (
                    <div className="w-full bg-[#F9FAFB] border border-dashed border-[#E5E7EB] rounded-[16px] p-6 flex flex-col items-center justify-center text-center my-1 select-none">
                      <div className="size-10 rounded-full bg-[#F3E8FF] flex items-center justify-center text-[#7D52F4] mb-2">
                        <RiFile3Fill className="size-5" />
                      </div>
                      <span className="text-[14px] font-medium text-[#171717]">
                        No documents in {folderGroup.name}
                      </span>
                      <span className="text-[12px] text-[#6B7280] font-normal mt-0.5 mb-3">
                        Upload required files for this category using Smart Upload
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenSmartUpload(
                            `Upload new ${folderGroup.name.toLowerCase()}`
                          )
                        }
                        className="h-[32px] px-4 bg-[#7D52F4] hover:bg-[#693fd9] text-white text-[13px] font-medium rounded-[8px] transition-colors cursor-pointer border-0 flex items-center gap-1.5"
                      >
                        <RiUpload2Line className="size-4" />
                        <span>Upload document</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      {groupDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-white border border-[#F5F5F5] rounded-[16px] p-[4px] flex items-center h-[72px] w-full gap-3 hover:border-neutral-200 transition-all cursor-pointer"
                          onClick={() => {
                            if (doc.status === "uploaded" || doc.status === "under_review") {
                              handleOpenPreview(doc);
                            }
                          }}
                        >
                          {/* Document Name & Icon (flex-1) */}
                          <div className="flex items-center gap-3 flex-1 min-w-0 pl-3">
                            {doc.isAlert ? (
                              <div className="size-[40px] rounded-full bg-[#FFEBEC] flex items-center justify-center shrink-0">
                                <RiAlertLine className="size-5 text-[#FB3748]" />
                              </div>
                            ) : (
                              <div className="size-[40px] rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
                                <RiFile3Fill className="size-5 text-[#5C5C5C]" />
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-[14px] font-medium text-[#171717] hover:text-[#7D52F4] transition-colors truncate">
                                {doc.name}
                              </span>
                              <span className="text-[13px] text-[#5C5C5C] font-normal truncate">
                                {doc.subtitle}
                              </span>
                            </div>
                          </div>

                          {/* Status Pill (222px) */}
                          <div className="w-[222px] shrink-0 flex items-center justify-start">
                            {doc.status === "uploaded" && (
                              <span className="px-[8px] py-[2px] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] bg-[#E3F7EC] text-[#0B4627]">
                                UPLOADED
                              </span>
                            )}
                            {doc.status === "not_uploaded" && (
                              <span className="px-[8px] py-[2px] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] bg-[#F5F5F5] text-[#A4A4A4]">
                                NOT UPLOADED
                              </span>
                            )}
                            {doc.status === "required_asap" && (
                              <span className="px-[8px] py-[2px] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] bg-[#FFEBEC] text-[#FB3748]">
                                REQUIRED ASAP
                              </span>
                            )}
                            {doc.status === "under_review" && (
                              <span className="px-[8px] py-[2px] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] bg-[#FFFAEB] text-[#B45309]">
                                UNDER REVIEW
                              </span>
                            )}
                          </div>

                          {/* Date / Warning (222px) */}
                          <div className="w-[222px] shrink-0 flex items-center justify-start text-[14px] text-[#5C5C5C]">
                            {doc.dateWarning ? (
                              <span className="flex items-center gap-1 text-[13px] text-[#FB3748]">
                                <RiAlertLine className="size-4 shrink-0" />
                                {doc.dateWarning}
                              </span>
                            ) : (
                              <span>{doc.date || ""}</span>
                            )}
                          </div>

                          {/* Actions (140px) */}
                          <div
                            className="w-[140px] shrink-0 flex items-center justify-end gap-2 pr-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {(doc.status === "not_uploaded" ||
                              doc.status === "required_asap") ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenSmartUpload(
                                    `Upload new ${doc.name.toLowerCase()}`,
                                    doc.id
                                  )
                                }
                                className="h-[32px] px-[16px] bg-[#262626] hover:bg-[#171717] text-white text-[14px] font-medium rounded-[8px] transition-colors cursor-pointer border-0"
                              >
                                Upload
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="size-[24px] rounded-[6px] flex items-center justify-center text-[#5C5C5C] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-0"
                                title="Delete file"
                              >
                                <RiDeleteBinLine className="size-4 shrink-0" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(doc)}
                              className="size-[24px] rounded-[6px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-100 transition-colors cursor-pointer border-0"
                              title="Preview document"
                            >
                              <RiEyeLine className="size-4 shrink-0" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB VIEW 2: Folders View (Matching Figma Spec & Screenshots) ───── */}
      {viewMode === "folders" && (
        <div className="flex flex-col gap-6 w-full">
          {selectedFolderId ? (
            /* ─── INNER FOLDER DETAIL VIEW (Figma Frame 110 / 304 / 208) ───────── */
            <div className="flex flex-col gap-4 w-full">
              {/* Back Link Breadcrumb (< All Folders / Folder Name) */}
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                className="flex items-center gap-1 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0 bg-transparent self-start"
              >
                <RiArrowLeftSLine className="size-5 shrink-0" />
                <span>All Folders</span>
                <span className="text-[#A4A4A4] mx-1">/</span>
                <span className="text-[#171717] font-semibold">
                  {computedFolders.find((f) => f.id === selectedFolderId)?.name || "Appendix D"}
                </span>
              </button>

              {/* Gray Outer Frame Container (Frame 110) */}
              <div className="bg-[#F7F7F7] rounded-[16px] p-6 flex flex-col gap-8 w-full border border-neutral-100">
                {/* Vertical Grid of 208px x 336px Document Cards (Frame 208) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                  {documents
                    .filter((doc) => doc.folderId === selectedFolderId)
                    .map((doc) => {
                      return (
                        <div
                          key={doc.id}
                          className="bg-white rounded-[16px] p-5 flex flex-col items-center justify-between text-center relative h-[336px] shadow-2xs hover:shadow-md transition-all border border-[#F5F5F5] cursor-pointer"
                          onClick={() => {
                            if (doc.status === "uploaded" || doc.status === "under_review") {
                              handleOpenPreview(doc);
                            }
                          }}
                        >
                          {/* Top Right Green Checkmark Badge for Uploaded Files */}
                          {doc.status === "uploaded" && (
                            <div className="size-[24px] rounded-full bg-white shadow-md flex items-center justify-center absolute -top-2.5 -right-2.5 z-10">
                              <span className="size-[15px] rounded-full bg-[#1FC16B] flex items-center justify-center text-white text-[10px] font-bold">
                                ✓
                              </span>
                            </div>
                          )}

                          {/* Thumbnail Container (160px x 160px) */}
                          <div className="w-[160px] h-[160px] bg-[#F5F5F5] rounded-[16px] flex flex-col items-center justify-center relative overflow-hidden shrink-0 border border-neutral-200/50">
                            {doc.status === "uploaded" ? (
                              <div className="flex flex-col items-center justify-center p-3 text-center">
                                <RiFile3Fill className="size-10 text-[#171717] mb-1" />
                                <span className="text-[11px] font-medium text-[#171717] truncate max-w-[130px]">
                                  {doc.name}
                                </span>
                              </div>
                            ) : (
                              <div className="size-10 rounded-full bg-white flex items-center justify-center text-[#171717]">
                                <RiFile3Fill className="size-5" />
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex flex-col items-center gap-1 w-full min-w-0 my-auto">
                            <span className="text-[14px] font-medium text-[#171717] truncate w-full text-center hover:text-[#7D52F4] transition-colors">
                              {doc.name}
                            </span>

                            {/* Status Badges */}
                            {doc.status === "not_uploaded" && (
                              <span className="px-[8px] py-[2px] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] bg-[#F5F5F5] text-[#A4A4A4]">
                                NOT UPLOADED
                              </span>
                            )}
                            {doc.status === "required_asap" && (
                              <span className="px-[8px] py-[2px] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] bg-[#FFEBEC] text-[#FB3748]">
                                REQUIRED ASAP
                              </span>
                            )}
                            {doc.status === "under_review" && (
                              <span className="px-[8px] py-[2px] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] bg-[#FFFAEB] text-[#F6B51E]">
                                UNDER REVIEW
                              </span>
                            )}

                            <span className="text-[13px] text-[#5C5C5C] font-normal truncate w-full text-center mt-0.5">
                              {doc.subtitle.split("·")[0]}
                            </span>
                            <span className="text-[12px] text-[#A4A4A4] font-normal">
                              {doc.subtitle.split("·")[1] || "3.4 MB"}
                            </span>
                          </div>

                          {/* Action Buttons Bar */}
                          <div
                            className="flex items-center justify-center gap-1 w-full pt-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {doc.status === "uploaded" || doc.status === "under_review" ? (
                              <div className="flex items-center gap-[4px]">
                                <button
                                  type="button"
                                  onClick={() => handleOpenPreview(doc)}
                                  className="size-[32px] rounded-[8px] bg-[#F5F5F5] hover:bg-[#EBEBEB] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0"
                                  title="Preview file"
                                >
                                  <RiEyeLine className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReplace(doc)}
                                  className="size-[32px] rounded-[8px] bg-[#F5F5F5] hover:bg-[#EBEBEB] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0"
                                  title="Replace file"
                                >
                                  <RiRepeatLine className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenPreview(doc)}
                                  className="size-[32px] rounded-[8px] bg-[#F5F5F5] hover:bg-[#EBEBEB] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0"
                                  title="Version history"
                                >
                                  <RiTimer2Line className="size-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenSmartUpload(
                                    `Upload new ${doc.name.toLowerCase()}`,
                                    doc.id
                                  )
                                }
                                className="h-[32px] px-[16px] bg-[#262626] hover:bg-[#171717] text-white text-[14px] font-medium rounded-[8px] transition-colors cursor-pointer border-0"
                              >
                                Upload
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Inner Folder Summary Bar (4 Uploaded · 1 Pending · 2 Not uploaded) */}
                <div className="flex items-center gap-8 pt-4 select-none border-t border-[#E5E7EB]">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#1FC16B] shrink-0" />
                    <span className="text-[14px] font-medium text-[#171717]">
                      {
                        documents.filter(
                          (d) => d.folderId === selectedFolderId && d.status === "uploaded"
                        ).length
                      }{" "}
                      Uploaded
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#F6B51E] shrink-0" />
                    <span className="text-[14px] font-medium text-[#171717]">
                      {
                        documents.filter(
                          (d) => d.folderId === selectedFolderId && d.status === "under_review"
                        ).length
                      }{" "}
                      Pending
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#7B7B7B] shrink-0" />
                    <span className="text-[14px] font-medium text-[#171717]">
                      {
                        documents.filter(
                          (d) =>
                            d.folderId === selectedFolderId &&
                            (d.status === "not_uploaded" || d.status === "required_asap")
                        ).length
                      }{" "}
                      Not uploaded
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ─── MAIN FOLDERS GRID VIEW ────────────────────────────────────── */
            <div className="flex flex-col gap-8 w-full">
              <div>
                <h2 className="font-aeonik-medium text-[20px] text-[#171717] leading-[32px] mb-4">
                  Folders
                </h2>

                {/* Grid of 5 White Folder Cards + 1 Dashed Upload Document Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                  {computedFolders.map((folder) => {
                    return (
                      <div
                        key={folder.id}
                        onClick={() => setSelectedFolderId(folder.id)}
                        className="bg-white border border-[#F5F5F5] hover:border-neutral-300 hover:shadow-custom-medium rounded-[16px] p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-[136px]"
                      >
                        <img
                          src="/folder-3d.png"
                          alt={folder.name}
                          className="w-[80px] h-[56px] object-contain shrink-0 select-none mb-1"
                        />
                        <span className="text-[14px] font-medium text-[#171717] truncate w-full px-1">
                          {folder.name}
                        </span>
                        <span className="text-[12px] text-[#5C5C5C] font-normal mt-[2px]">
                          {folder.countText}
                        </span>
                      </div>
                    );
                  })}

                  {/* Dashed Upload Document Card */}
                  <div
                    onClick={() => handleOpenSmartUpload("Upload files with Smart Upload")}
                    className="bg-white border border-dashed border-[#A4A4A4] rounded-[16px] p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#7D52F4] transition-all h-[136px]"
                  >
                    <div className="size-9 rounded-[12px] bg-[#F5F5F5] flex items-center justify-center text-[#5C5C5C] shrink-0 mb-2">
                      <RiUpload2Line className="size-5" />
                    </div>
                    <span className="text-[14px] font-medium text-[#171717]">
                      Upload document
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Dots Summary Bar */}
              <div className="flex items-center gap-8 pt-2 select-none">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#1FC16B] shrink-0" />
                  <span className="text-[14px] font-medium text-[#171717]">
                    {stats.completed} completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#F6B51E] shrink-0" />
                  <span className="text-[14px] font-medium text-[#171717]">
                    {stats.pending} pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#FB3748] shrink-0" />
                  <span className="text-[14px] font-medium text-[#171717]">
                    {stats.missing} missing
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
