"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import {
  RiSearchLine,
  RiFilter3Line,
  RiArrowLeftSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightSLine,
  RiArrowRightDoubleLine,
  RiArrowDownSLine,
  RiAddLine,
  RiCloseLine,
  RiUserStarLine,
  RiLightbulbLine,
  RiLightbulbFill,
  RiArchiveLine,
  RiArchiveFill,
} from "@remixicon/react";
import { apiClient } from "@/lib/api-client";
import { formatFullName, getInitials, cn } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { useTableSort } from "@/hooks/useTableSort";
import { toast } from "sonner";
import { StatusFilterDropdown } from "../cases/components/StatusFilterDropdown";
import { LeadRowMenu } from "./components/LeadRowMenu";
import { ChangeLeadStatusModal } from "./components/ChangeLeadStatusModal";
import { ChangeLeadPriorityModal } from "./components/ChangeLeadPriorityModal";
import { LeadFormModal, type LeadFormValues } from "./components/LeadFormModal";
import { ConvertLeadWizard, type ConvertWizardCaseCategory } from "./components/ConvertLeadWizard";
import { ConfirmLeadActionModal } from "./components/ConfirmLeadActionModal";
import { LeadDetailsModal } from "./components/LeadDetailsModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LEAD_PRIORITIES_FALLBACK,
  getLeadStatusPillClasses,
  getLeadPriorityMeta,
  formatLeadDate,
  type LeadPriorityMeta,
} from "./components/lead-utils";

interface LeadFile {
  id: number;
  originalName: string;
  size: number;
  isDeleted?: boolean;
}

interface LeadRow {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string | null;
  phone: string;
  status: string;
  priorityId: number | null;
  creationDate: string | null;
  archivationDate?: string | null;
  descriptionBox?: string;
  files?: LeadFile[];
}

/** Shape returned by the NestJS leads endpoints (camelCase via class-transformer) */
interface RawLead {
  id?: number;
  firstName?: string;
  lastName?: string;
  contactEmail?: string | null;
  contactNumber?: string | null;
  status?: string;
  priority?: number | string | null;
  creationDate?: string | null;
  archivationDate?: string | null;
  descriptionBox?: string | null;
  files?: LeadFile[];
}

interface RawPriority {
  id: number | string;
  name?: string;
  title?: string;
  color?: string;
  content?: string;
}

interface RawCaseCategory {
  id: number | string;
  name?: string;
  title?: string;
  value?: string;
}

interface RawInitData {
  LeadPriorities?: RawPriority[];
  Priorities?: RawPriority[];
  CaseCategories?: RawCaseCategory[];
}

type ConfirmAction = "archive" | "delete" | "restore";

function mapLeadRow(l: RawLead, isArchived = false): LeadRow {
  return {
    id: Number(l.id),
    firstName: l.firstName ?? "",
    lastName: l.lastName ?? "",
    name: formatFullName(l.firstName, l.lastName) || "Unnamed lead",
    email: l.contactEmail ?? null,
    phone: l.contactNumber ?? "",
    status: l.status ?? "Active",
    priorityId: l.priority != null ? Number(l.priority) : null,
    creationDate: l.creationDate ?? null,
    archivationDate: isArchived ? (l.archivationDate ?? null) : undefined,
    descriptionBox: l.descriptionBox ?? "",
    files: Array.isArray(l.files) ? l.files : [],
  };
}

function normalizeLeadsResponse(res: unknown): { rows: RawLead[] } {
  const source = Array.isArray(res)
    ? res
    : (res as { data?: RawLead[] | null })?.data ?? [];
  return { rows: Array.isArray(source) ? source : [] };
}

function normalizePriorityList(rawPriorities: RawPriority[]): LeadPriorityMeta[] {
  if (!Array.isArray(rawPriorities) || rawPriorities.length === 0) return [];
  const mapped = rawPriorities.map((p) => ({
    id: Number(p.id),
    name: p.name || p.title || `#${p.id}`,
    color: p.color || p.content || "#7B7B7B",
  }));
  // Server seeds are Low(1)/Medium(2)/High(3) — display Low first to match priority ids order
  return mapped.sort((a, b) => Number(a.id) - Number(b.id));
}

export default function LeadsPage() {
  const [activeTab, setActiveTab] = React.useState<"leads" | "archive">("leads");
  const [leads, setLeads] = React.useState<LeadRow[]>([]);
  const [archivedLeads, setArchivedLeads] = React.useState<LeadRow[]>([]);
  const [isAdminUser, setIsAdminUser] = React.useState(false);

  const [priorities, setPriorities] = React.useState<LeadPriorityMeta[]>(LEAD_PRIORITIES_FALLBACK);
  const [caseCategories, setCaseCategories] = React.useState<ConvertWizardCaseCategory[]>([]);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = React.useState<string | null>(null);
  const [priorityMenuOpen, setPriorityMenuOpen] = React.useState(false);
  const { sortField, sortDirection, handleSort, renderSortIcon } = useTableSort<LeadRow>();

  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Modals
  const [formModalOpen, setFormModalOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [selectedLead, setSelectedLead] = React.useState<LeadRow | null>(null);

  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [priorityModalOpen, setPriorityModalOpen] = React.useState(false);

  const [convertWizardOpen, setConvertWizardOpen] = React.useState(false);
  const [convertLeadFull, setConvertLeadFull] = React.useState<LeadRow | null>(null);

  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [detailsLead, setDetailsLead] = React.useState<LeadRow | null>(null);

  const [confirmAction, setConfirmAction] = React.useState<{ action: ConfirmAction; lead: LeadRow } | null>(null);
  const [confirmBusy, setConfirmBusy] = React.useState(false);

  // ─── Data fetching ────────────────────────────────────────────────────────

  const fetchUserInfo = React.useCallback(async () => {
    try {
      const info = await apiClient.get<{ role?: { value?: string } }>(ENDPOINTS.users.userInfo);
      const roleValue = (info?.role?.value || "").toLowerCase();
      setIsAdminUser(roleValue === "superadmin" || roleValue === "supervisor");
    } catch {
      setIsAdminUser(false);
    }
  }, []);

  const fetchInitData = React.useCallback(async () => {
    try {
      const initData = await apiClient.get<RawInitData>(ENDPOINTS.initData.byName("start"));
      const leadPriorities = normalizePriorityList(initData?.LeadPriorities || initData?.Priorities || []);
      if (leadPriorities.length) setPriorities(leadPriorities);
      const categories: ConvertWizardCaseCategory[] = Array.isArray(initData?.CaseCategories)
        ? initData.CaseCategories.map((c) => ({
            id: c.id,
            name: c.name || c.title || c.value || `Category ${c.id}`,
          }))
        : [];
      setCaseCategories(categories);
    } catch (err) {
      console.error("Failed to load init data:", err);
    }
  }, []);

  const fetchLeads = React.useCallback(async () => {
    try {
      setError(null);
      const res = await apiClient.get<unknown>(ENDPOINTS.leads.base);
      setLeads(normalizeLeadsResponse(res).rows.map((l) => mapLeadRow(l)));
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      setLeads([]);
      setError("Failed to load leads from the server.");
      toast.error(err instanceof Error ? err.message : "Failed to load leads");
    }
  }, []);

  const fetchArchivedLeads = React.useCallback(async () => {
    try {
      const res = await apiClient.get<unknown>(ENDPOINTS.leads.archive);
      setArchivedLeads(normalizeLeadsResponse(res).rows.map((l) => mapLeadRow(l, true)));
    } catch (err) {
      console.error("Failed to fetch archived leads:", err);
      setArchivedLeads([]);
    }
  }, []);

  React.useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchUserInfo(), fetchInitData(), fetchLeads()]);
      setLoading(false);
    };
    init();
  }, [fetchUserInfo, fetchInitData, fetchLeads]);

  // ─── Derived data ─────────────────────────────────────────────────────────

  const sourceRows = activeTab === "leads" ? leads : archivedLeads;

  const availableStatuses = React.useMemo(() => {
    const counts = new Map<string, number>();
    sourceRows.forEach((lead) => {
      const label = lead.status || "Unknown";
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
  }, [sourceRows]);

  const hasActiveFilters = Boolean(searchQuery || statusFilter || priorityFilter);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
    setPriorityFilter(null);
    setCurrentPage(1);
  };

  const filteredRows = React.useMemo(() => {
    let rows = [...sourceRows];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      rows = rows.filter((lead) =>
        [
          `${lead.firstName} ${lead.lastName}`,
          `${lead.lastName} ${lead.firstName}`,
          lead.email || "",
          lead.phone,
          lead.descriptionBox || "",
          lead.status,
          String(lead.id),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    if (statusFilter) rows = rows.filter((lead) => lead.status === statusFilter);
    if (priorityFilter) {
      rows = rows.filter((lead) => Number(lead.priorityId) === Number(priorityFilter));
    }

    const dir = sortDirection === "asc" ? 1 : -1;
    if (sortField === "name") {
      rows.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()) * dir);
    } else if (sortField === "phone") {
      rows.sort((a, b) => a.phone.localeCompare(b.phone) * dir);
    } else if (sortField === "status") {
      rows.sort((a, b) => a.status.localeCompare(b.status) * dir);
    } else if (sortField === "priorityId") {
      rows.sort((a, b) => ((a.priorityId ?? 0) - (b.priorityId ?? 0)) * dir);
    } else if (sortField === "creationDate") {
      rows.sort(
        (a, b) => (new Date(a.creationDate || 0).getTime() - new Date(b.creationDate || 0).getTime()) * dir
      );
    }
    return rows;
  }, [sourceRows, searchQuery, statusFilter, priorityFilter, sortField, sortDirection]);

  // Filter/pagination handlers reset the page explicitly (no reset effect needed)
  const applySearchQuery = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  const applyStatusFilter = (value: string | null) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  const applyPriorityFilter = (value: string | null) => {
    setPriorityFilter(value);
    setCurrentPage(1);
  };
  const applyItemsPerPage = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };
  const switchTab = (tab: "leads" | "archive") => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setCurrentPage(1);
    if (tab === "archive" && isAdminUser && archivedLeads.length === 0) {
      fetchArchivedLeads();
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRows = filteredRows.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  const pageNumbers = React.useMemo(() => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("...");
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safeCurrentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  const getLeadName = (lead: LeadRow) =>
    lead.name || formatFullName(lead.firstName, lead.lastName) || "Unnamed lead";

  // ─── Actions ──────────────────────────────────────────────────────────────

  const refreshAll = React.useCallback(() => {
    fetchLeads();
    if (isAdminUser) fetchArchivedLeads();
  }, [fetchLeads, fetchArchivedLeads, isAdminUser]);

  const handleFormSubmit = async (
    values: LeadFormValues,
    newFiles: File[],
    deletedFileIds: number[]
  ) => {
    try {
      const formData = new FormData();
      formData.append("firstName", values.firstName.trim());
      formData.append("lastName", values.lastName.trim());
      formData.append("contactNumber", values.contactNumber.trim());
      formData.append("contactEmail", values.contactEmail.trim());
      formData.append("descriptionBox", values.descriptionBox);
      formData.append("priority", String(values.priorityId));
      newFiles.forEach((file) => formData.append("files", file));

      if (formMode === "create") {
        await apiClient.post(ENDPOINTS.leads.base, formData);
        toast.success("Lead created successfully");
      } else {
        if (deletedFileIds.length > 0) {
          formData.append("deletedFiles", JSON.stringify(deletedFileIds));
        }
        await apiClient.patch(ENDPOINTS.leads.byId(selectedLead!.id), formData);
        toast.success("Lead updated successfully");
      }
      refreshAll();
    } catch (err) {
      console.error("Failed to save lead:", err);
      throw err;
    }
  };

  const openEditModal = (lead: LeadRow) => {
    setSelectedLead(lead);
    setFormMode("edit");
    setFormModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedLead(null);
    setFormMode("create");
    setFormModalOpen(true);
  };

  /** Load the full lead (with files/description) before opening detail-dependent views */
  const loadFullLead = async (lead: LeadRow): Promise<LeadRow | null> => {
    const base = activeTab === "archive" ? ENDPOINTS.leads.archive : ENDPOINTS.leads.base;
    try {
      const full = await apiClient.get<RawLead>(`${base}/${lead.id}`);
      return {
        ...lead,
        descriptionBox: full?.descriptionBox ?? lead.descriptionBox ?? "",
        files: Array.isArray(full?.files) ? (full.files as LeadFile[]) : lead.files ?? [],
      };
    } catch (err) {
      console.error("Failed to load lead details:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load lead details");
      return null;
    }
  };

  const openDetailsModal = async (lead: LeadRow) => {
    setDetailsLead(lead);
    setDetailsModalOpen(true);
    const full = await loadFullLead(lead);
    if (full) setDetailsLead(full);
  };

  const openConvertWizard = async (lead: LeadRow) => {
    const full = await loadFullLead(lead);
    if (!full) return;
    setConvertLeadFull(full);
    setConvertWizardOpen(true);
  };

  interface ConvertResponse {
    migrant?: { id?: number | string };
    case?: { id?: number | string; caseNumber?: string } | null;
  }

  const handleConvertSubmit = async (payload: {
    email: string;
    contacts: { contact_email?: string; phone_1?: string };
    passportNumber?: string;
    categoryId?: number;
    relatedYear?: number;
    leadFiles: number[];
  }) => {
    if (!convertLeadFull?.id) return;
    try {
      const result = await apiClient.post<ConvertResponse>(
        ENDPOINTS.leads.convert(convertLeadFull.id),
        payload
      );
      const caseOpened = Boolean(result?.case);
      toast.success(
        caseOpened
          ? `${getLeadName(convertLeadFull)} converted to a migrant profile and a case was opened`
          : `${getLeadName(convertLeadFull)} converted to a migrant profile`
      );
      refreshAll();
      setActiveTab("leads");
    } catch (err) {
      console.error("Lead conversion failed:", err);
      toast.error(err instanceof Error ? err.message : "Lead conversion failed");
      throw err;
    }
  };

  const handleStatusChange = async (lead: LeadRow, newStatus: string) => {
    try {
      await apiClient.patch(ENDPOINTS.leads.byId(lead.id), { status: newStatus });
      toast.success(`Lead status updated to ${newStatus}`);
      refreshAll();
    } catch (err) {
      console.error("Failed to update lead status:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update lead status");
    }
  };

  const handlePriorityChange = async (lead: LeadRow, newPriorityId: number) => {
    try {
      await apiClient.patch(ENDPOINTS.leads.byId(lead.id), { priority: newPriorityId });
      toast.success("Lead priority updated");
      refreshAll();
    } catch (err) {
      console.error("Failed to update lead priority:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update lead priority");
    }
  };

  const buildBulkData = (leadsToChange: LeadRow[]) =>
    leadsToChange.map((lead) => ({
      id: lead.id,
      name: `${lead.firstName} ${lead.lastName}`.trim(),
    }));

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const { action, lead } = confirmAction;
    setConfirmBusy(true);
    try {
      if (action === "archive") {
        const formData = new FormData();
        formData.append("data", JSON.stringify(buildBulkData([lead])));
        await apiClient.delete(ENDPOINTS.leads.toArchive, { body: formData });
        toast.success(`${getLeadName(lead)} moved to archive`);
      } else if (action === "restore") {
        const formData = new FormData();
        formData.append("data", JSON.stringify(buildBulkData([lead])));
        await apiClient.patch(ENDPOINTS.leads.restore, formData);
        toast.success(`${getLeadName(lead)} restored to active leads`);
      } else {
        const formData = new FormData();
        formData.append("data", JSON.stringify(buildBulkData([lead])));
        await apiClient.delete(ENDPOINTS.leads.archive, { body: formData });
        toast.success(`${getLeadName(lead)} permanently deleted`);
      }
      setConfirmAction(null);
      refreshAll();
    } catch (err) {
      console.error(`Failed to ${action} lead:`, err);
      toast.error(err instanceof Error ? err.message : `Failed to ${action} lead`);
    } finally {
      setConfirmBusy(false);
    }
  };

  const statusColorsMap = React.useMemo(
    () => ({
      Active: "#1FC16B",
      Completed: "#335CFF",
      Refused: "#FB3748",
    }),
    []
  );

  // ─── Render helpers ───────────────────────────────────────────────────────

  const isArchivedTab = activeTab === "archive";

  const getPillDotClass = (status: string): string => {
    switch ((status || "").toLowerCase().trim()) {
      case "active":
        return "bg-[#1FC16B]";
      case "completed":
        return "bg-[#335CFF]";
      case "refused":
        return "bg-[#FB3748]";
      default:
        return "bg-[#7B7B7B]";
    }
  };

  const renderLeadRows = () => {
    if (loading && activeTab === "leads") {
      return (
        <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-2 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <span className="text-[14px] font-medium text-[#5C5C5C] animate-pulse">Loading leads…</span>
        </div>
      );
    }
    if (loading && activeTab === "archive") {
      return (
        <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-2 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <span className="text-[14px] font-medium text-[#5C5C5C] animate-pulse">Loading archived leads…</span>
        </div>
      );
    }
    if (error && activeTab === "leads") {
      return (
        <div className="w-full bg-white border border-[#FECDCA] rounded-[16px] p-8 text-center flex flex-col items-center justify-center gap-xs shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <span className="text-[14px] font-semibold text-[#FB3748]">{error}</span>
          <Button type="button" variant="link" onClick={fetchLeads} className="mt-2 text-[13px] font-medium text-[#7D52F4] hover:underline cursor-pointer">
            Retry
          </Button>
        </div>
      );
    }
    if (sourceRows.length === 0) {
      return (
        <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-3 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <div className="size-12 rounded-full bg-[#FAF8FF] border border-[#E5DBFF] flex items-center justify-center text-[#7D52F4]">
            <RiUserStarLine className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-[16px] font-semibold text-[#171717]">
              {activeTab === "leads" ? "No leads yet" : "Archive is empty"}
            </h3>
            <p className="text-[14px] text-[#5C5C5C]">
              {activeTab === "leads"
                ? "Capture enquiries as leads and convert them into migrant profiles when they're ready."
                : "Archived leads will appear here once they are moved out of the active list."}
            </p>
          </div>
          {activeTab === "leads" && (
            <Button
              type="button"
              size="sm"
              onClick={openCreateModal}
              className="mt-2 h-9 px-4 bg-brand-medium hover:bg-brand-dark text-white rounded-[10px] text-[14px] font-semibold transition-all cursor-pointer"
            >
              + New Lead
            </Button>
          )}
        </div>
      );
    }
    if (filteredRows.length === 0) {
      return (
        <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-12 text-center flex flex-col items-center justify-center gap-3 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]">
          <div className="size-12 rounded-full bg-[#FAF8FF] border border-[#E5DBFF] flex items-center justify-center text-[#7D52F4]">
            <RiUserStarLine className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-[16px] font-semibold text-[#171717]">No leads match your filters</h3>
            <p className="text-[14px] text-[#5C5C5C]">Try adjusting your search query or clear your active filters.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="mt-2 h-9 px-4 rounded-[10px] text-[14px] font-medium border-[#EBEBEB] text-[#171717] hover:bg-neutral-50 cursor-pointer"
          >
            Clear filters
          </Button>
        </div>
      );
    }

    return currentRows.map((lead) => {
      const name = getLeadName(lead);
      const priorityMeta = getLeadPriorityMeta(lead.priorityId, priorities);
      const openStatus = () => {
        setSelectedLead(lead);
        setStatusModalOpen(true);
      };
      const openPriority = () => {
        setSelectedLead(lead);
        setPriorityModalOpen(true);
      };

      return (
        <div
          key={`lead-${lead.id}`}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("[role='menu']")) return;
            openDetailsModal(lead);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("[role='menu']")) return;
              e.preventDefault();
              openDetailsModal(lead);
            }
          }}
          className="w-full bg-white rounded-[16px] h-[72px] p-1 flex items-center border-2 border-transparent hover:border-white hover:bg-[#F5F5F5] transition-all cursor-pointer shadow-x-small group"
        >
          {/* Lead ID # */}
          <div className="w-[94px] h-16 p-3 flex items-center font-mono text-[14px] text-[#5C5C5C] shrink-0 truncate">
            {lead.id}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0 h-16 p-3 flex items-center gap-3 shrink-0">
            <div className="size-10 rounded-full bg-[#EBEBEB] text-[#171717] flex items-center justify-center font-medium text-[12px] shrink-0">
              {getInitials(name) || "L"}
            </div>
            <div className="flex flex-col justify-center min-w-0 gap-0.5 flex-1">
              <span className="font-medium text-[#171717] truncate leading-5 text-[14px] tracking-[-0.006em]">
                {name}
              </span>
              <span className="text-[12px] leading-4 text-[#5C5C5C] truncate font-normal">
                {lead.email || "No email"}
              </span>
            </div>
          </div>

          {/* Contact */}
          <div className="w-[170px] h-16 p-3 flex items-center shrink-0">
            <span className="font-normal text-[#171717] font-sans text-[14px] leading-5 truncate">
              {lead.phone || "—"}
            </span>
          </div>

          {/* Priority */}
          <div className="w-[150px] h-16 p-3 flex items-center shrink-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openPriority(); }}
              title="Change priority"
              className="h-5 rounded-full px-2 py-0.5 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.02em] bg-white whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 border-0 hover:bg-[#F5F5F5]"
            >
              <span className="size-4 flex items-center justify-center shrink-0">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: priorityMeta.color }} />
              </span>
              <span className="whitespace-nowrap">{priorityMeta.name}</span>
            </button>
          </div>

          {/* Status */}
          <div className="w-[197.5px] h-16 p-3 flex items-center shrink-0">
            {!isArchivedTab ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openStatus(); }}
                title="Change status"
                className={`h-5 rounded-full px-2 py-0.5 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.02em] whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 border-0 ${getLeadStatusPillClasses(lead.status)}`}
              >
                <span className="size-4 flex items-center justify-center shrink-0">
                  <span className={`size-1.5 rounded-full ${getPillDotClass(lead.status)}`} />
                </span>
                <span className="whitespace-nowrap">{lead.status}</span>
              </button>
            ) : (
              <div className={`h-5 rounded-full px-2 py-0.5 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.02em] whitespace-nowrap shrink-0 border-0 ${getLeadStatusPillClasses(lead.status)}`}>
                <span className="size-4 flex items-center justify-center shrink-0">
                  <span className={`size-1.5 rounded-full ${getPillDotClass(lead.status)}`} />
                </span>
                <span className="whitespace-nowrap">{lead.status}</span>
              </div>
            )}
          </div>

          {/* Created / Archived */}
          <div className="w-[110px] h-16 p-3 flex items-center shrink-0">
            <span className="text-[13px] font-normal leading-[18px] tracking-[-0.006em] text-[#5C5C5C] whitespace-nowrap font-sans">
              {formatLeadDate(activeTab === "archive" ? lead.archivationDate : lead.creationDate)}
            </span>
          </div>

          {/* Actions */}
          <div className="w-[48px] h-16 p-3 flex items-center justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
            <LeadRowMenu
              isArchived={activeTab === "archive"}
              onViewDetails={() => openDetailsModal(lead)}
              {...(activeTab === "leads"
                ? {
                    onEdit: () => openEditModal(lead),
                    onChangeStatus: openStatus,
                    onChangePriority: openPriority,
                    onConvert: () => openConvertWizard(lead),
                    onArchive: () => setConfirmAction({ action: "archive", lead }),
                  }
                : {
                    ...(isAdminUser
                      ? {
                          onRestore: () => setConfirmAction({ action: "restore", lead }),
                          onDelete: () => setConfirmAction({ action: "delete", lead }),
                        }
                      : {}),
                  })}
            />
          </div>
        </div>
      );
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full flex flex-col font-sans animate-fade-in text-[#171717] bg-[#F5F5F5] min-h-full">
      {/* White header block: title + tabs (like Cases) */}
      <div className="bg-white rounded-t-[16px] flex flex-col shrink-0">
        <div className="px-6 md:px-[64px] pt-[32px] pb-[24px] flex flex-col gap-md md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-xs flex-1 min-w-0">
            <h1 className="font-aeonik-medium text-[24px] leading-[32px] tracking-[-0.006em] text-[#171717]">
              Leads
            </h1>
            <p className="text-[14px] leading-[20px] tracking-[-0.006em] text-[#5C5C5C] font-normal max-w-[600px]">
              Track incoming enquiries, prioritise follow-ups, and convert warm leads into migrant profiles.
            </p>
          </div>
          <div className="flex items-center gap-md mt-md md:mt-0">
            {activeTab === "leads" && (
              <Button
                type="button"
                size="sm"
                onClick={openCreateModal}
                className="h-9 px-3 bg-[#7D52F4] hover:bg-[#6C3EE8] text-white text-[14px] leading-5 font-medium border-0 rounded-[8px] flex items-center gap-1.5 cursor-pointer transition-colors shadow-x-small"
              >
                <RiAddLine className="size-5 text-white shrink-0" data-icon="inline-start" />
                <span>New lead</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs (Leads / Archive) — with icons, like Cases */}
        <div className="px-6 md:px-[64px] flex items-center gap-6 h-[50px] border-b border-[#EBEBEB]">
          {([
            { key: "leads" as const, label: "Leads", icon: activeTab === "leads" ? RiLightbulbFill : RiLightbulbLine },
            ...(isAdminUser
              ? [{ key: "archive" as const, label: "Archive", icon: activeTab === "archive" ? RiArchiveFill : RiArchiveLine }]
              : []),
          ]).map((tab) => {
            const TabIcon = tab.icon;
            return (
              <Button
                key={tab.key}
                variant="ghost"
                onClick={() => switchTab(tab.key)}
                className={`h-full px-xs pb-xs border-b-2 border-x-0 border-t-0 text-label-sm font-semibold rounded-none transition-all inline-flex items-center gap-xs cursor-pointer ${
                  activeTab === tab.key
                    ? "border-[#171717] text-[#171717] hover:bg-transparent"
                    : "border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-transparent"
                }`}
              >
                <span className="size-5 flex items-center justify-center shrink-0">
                  <TabIcon className={`size-5 shrink-0 ${activeTab === tab.key ? "text-[#171717]" : "text-neutral-400"}`} />
                </span>
                <span>{tab.label}</span>
                <span className="min-w-[20px] h-[18px] px-[5px] rounded-full text-[11px] font-medium flex items-center justify-center bg-neutral-100 text-neutral-500">
                  {tab.key === "leads" ? leads.length : archivedLeads.length}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Gray content area */}
      <div className="px-6 md:px-[64px] py-[32px] pb-[80px] flex flex-col gap-[32px] flex-1 w-full">

        {/* Header / Toolbar */}
        <div className="flex flex-wrap items-center gap-[12px] w-full h-[32px]">
          {/* Search Bar (wide, like Cases) */}
          <div className="relative w-full max-w-[570px] h-[32px] flex items-center bg-white shadow-x-small rounded-[8px] border border-neutral-200/40 focus-within:border-[#7D52F4] transition-all">
            <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-5 text-[#A4A4A4] z-10 pointer-events-none" />
            <Input
              variant="unstyled"
              size="none"
              type="text"
              value={searchQuery}
              onChange={(e) => applySearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full h-full pl-9 pr-8 bg-transparent text-[14px] font-normal leading-5 text-[#171717] placeholder-[#A4A4A4] border-0 shadow-none focus-visible:ring-0 focus-visible:shadow-none font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => applySearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A4A4A4] hover:text-[#171717] border-0 bg-transparent p-0 flex items-center justify-center cursor-pointer"
                title="Clear search"
              >
                <RiCloseLine className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Reset — black when filters active, like Cases */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              aria-label="Reset filters"
              title="Reset filters"
              className="size-8 rounded-[8px] flex items-center justify-center transition-all border-0 shadow-x-small cursor-pointer bg-[#171717] text-white hover:bg-[#333333]"
            >
              <RiFilter3Line className="size-5 shrink-0" />
            </button>
          )}

          {/* Status Filter */}
          <StatusFilterDropdown
            statuses={availableStatuses}
            value={statusFilter}
            onChange={(val: string | null) => applyStatusFilter(val)}
            statusColors={statusColorsMap}
          />

          {/* Priority Filter */}
          <DropdownMenu open={priorityMenuOpen} onOpenChange={setPriorityMenuOpen}>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 px-[12px] py-[6px] border border-[#EBEBEB] rounded-[8px] text-[14px] font-normal flex items-center gap-[6px] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] cursor-pointer outline-none shrink-0 transition-colors",
                    priorityFilter
                      ? "bg-white text-[#171717] border-[#7D52F4]/40 ring-1 ring-[#7D52F4]/20"
                      : "bg-white text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50"
                  )}
                >
                  {priorityFilter ? (
                    <>
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: getLeadPriorityMeta(Number(priorityFilter), priorities).color }}
                      />
                      {getLeadPriorityMeta(Number(priorityFilter), priorities).name}
                    </>
                  ) : (
                    "Priority"
                  )}
                  <RiArrowDownSLine className="size-4 text-[#A4A4A4]" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-[160px] bg-white border border-[#EBEBEB] rounded-[10px] shadow-card-large p-1">
              <DropdownMenuItem
                onClick={() => {
                  applyPriorityFilter(null);
                  setPriorityMenuOpen(false);
                }}
                className="text-[13px] text-[#171717] hover:bg-[#F5F5F5] rounded-[6px] px-2 py-1.5 cursor-pointer"
              >
                All priorities
              </DropdownMenuItem>
              {priorities.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => {
                    applyPriorityFilter(String(p.id));
                    setPriorityMenuOpen(false);
                  }}
                  className="text-[13px] text-[#171717] hover:bg-[#F5F5F5] rounded-[6px] px-2 py-1.5 cursor-pointer flex items-center gap-[8px]"
                >
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  {p.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <div className="flex flex-col gap-[8px] w-full">
          {/* Header Row */}
          <div className="h-[36px] bg-[#F5F5F5] rounded-[8px] px-[4px] flex items-center text-[12px] tracking-[-0.006em] text-[#A4A4A4] font-medium w-full">
            <div className="w-[94px] px-3 py-2 shrink-0">Lead ID #</div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSort("name")}
              className="flex-1 min-w-0 h-auto p-0 px-3 py-2 justify-start flex items-center gap-1 font-medium text-[12px] text-[#A4A4A4] hover:text-[#171717] cursor-pointer"
            >
              Name
              {renderSortIcon("name")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSort("phone")}
              className="w-[170px] h-auto p-0 px-3 py-2 justify-start shrink-0 flex items-center gap-1 font-medium text-[12px] text-[#A4A4A4] hover:text-[#171717] cursor-pointer"
            >
              Contact
              {renderSortIcon("phone")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSort("priorityId")}
              className="w-[150px] h-auto p-0 px-3 py-2 justify-start shrink-0 flex items-center gap-1 font-medium text-[12px] text-[#A4A4A4] hover:text-[#171717] cursor-pointer"
            >
              Priority
              {renderSortIcon("priorityId")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSort("status")}
              className="w-[197.5px] h-auto p-0 px-3 py-2 justify-start shrink-0 flex items-center gap-1 font-medium text-[12px] text-[#A4A4A4] hover:text-[#171717] cursor-pointer"
            >
              Status
              {renderSortIcon("status")}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSort("creationDate")}
              className="w-[110px] h-auto p-0 px-3 py-2 justify-start shrink-0 flex items-center gap-1 font-medium text-[12px] text-[#A4A4A4] hover:text-[#171717] cursor-pointer"
            >
              {activeTab === "archive" ? "Archived" : "Created"}
              {renderSortIcon("creationDate")}
            </Button>

            <div className="w-[48px] h-[36px] px-3 py-2 shrink-0" />
          </div>

          {/* Rows */}
          <div className="flex flex-col gap-[4px] w-full">{renderLeadRows()}</div>
        </div>

        {/* Pagination */}
        {!loading && !error && filteredRows.length > 0 && (
          <div className="flex flex-row items-center justify-between w-full h-[32px] gap-[24px]">
            <div className="w-[200px] h-[32px] py-[6px] flex items-center shrink-0">
              <span className="text-[14px] font-normal leading-[20px] tracking-[-0.006em] text-[#5C5C5C] font-sans">
                Page {safeCurrentPage} of {totalPages}
              </span>
            </div>

            <div className="flex flex-row items-center justify-center gap-[8px] flex-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="size-8 p-0 rounded-[8px] text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border-0 shrink-0"
                title="First page"
              >
                <RiArrowLeftDoubleLine className="size-5 text-[#5C5C5C]" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="size-8 p-0 rounded-[8px] text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border-0 shrink-0"
                title="Previous page"
              >
                <RiArrowLeftSLine className="size-5 text-[#5C5C5C]" />
              </Button>

              <div className="flex flex-row items-center gap-[8px]">
                {pageNumbers.map((p, pIdx) => {
                  if (p === "...") {
                    return (
                      <span key={`ellipsis-${pIdx}`} className="size-8 flex items-center justify-center text-[14px] font-medium text-[#5C5C5C]">
                        …
                      </span>
                    );
                  }
                  const pageNum = Number(p);
                  const isActive = safeCurrentPage === pageNum;
                  return (
                    <Button
                      key={`page-${pageNum}`}
                      type="button"
                      variant={isActive ? "primary-neutral" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`size-8 p-0 rounded-[8px] text-[14px] font-medium leading-[20px] flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-[#171717] text-white border-0 hover:bg-[#171717]"
                          : "bg-white border border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="size-8 p-0 rounded-[8px] text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border-0 shrink-0"
                title="Next page"
              >
                <RiArrowRightSLine className="size-5 text-[#5C5C5C]" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="size-8 p-0 rounded-[8px] text-[#5C5C5C] hover:bg-neutral-200 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer border-0 shrink-0"
                title="Last page"
              >
                <RiArrowRightDoubleLine className="size-5 text-[#5C5C5C]" />
              </Button>
            </div>

            <div className="w-[200px] h-[32px] flex items-center justify-end shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-[99px] h-8 px-[10px] py-[6px] rounded-[8px] border border-[#EBEBEB] bg-white text-[14px] font-normal text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 flex items-center justify-between shadow-[0px_1px_2px_rgba(10,13,20,0.03)] cursor-pointer outline-none shrink-0"
                    >
                      <span className="leading-[20px]">{itemsPerPage} / page</span>
                      <RiArrowDownSLine className="size-5 text-[#A4A4A4]" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-[110px] bg-white border border-[#EBEBEB] rounded-[10px] shadow-card-large p-1">
                  {[10, 20, 50, 100].map((size) => (
                    <DropdownMenuItem
                      key={size}
                      onClick={() => applyItemsPerPage(size)}
                      className="text-[13px] text-[#171717] hover:bg-[#F5F5F5] rounded-[6px] px-2 py-1.5 cursor-pointer"
                    >
                      {size} / page
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <LeadFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        mode={formMode}
        leadId={selectedLead?.id ?? null}
        initial={
          formMode === "edit" && selectedLead
            ? {
                firstName: selectedLead.firstName,
                lastName: selectedLead.lastName,
                contactNumber: selectedLead.phone,
                contactEmail: selectedLead.email ?? "",
                descriptionBox: selectedLead.descriptionBox ?? "",
                priorityId: selectedLead.priorityId != null ? String(selectedLead.priorityId) : "",
              }
            : null
        }
        priorities={priorities}
        existingFiles={(selectedLead?.files || []).filter((f) => !f.isDeleted)}
        onSubmit={handleFormSubmit}
      />

      {/* Status / Priority Modals */}
      {selectedLead && (
        <>
          <ChangeLeadStatusModal
            open={statusModalOpen}
            onOpenChange={setStatusModalOpen}
            currentStatus={selectedLead.status}
            leadName={getLeadName(selectedLead)}
            onApply={(newStatus) => handleStatusChange(selectedLead, newStatus)}
          />
          <ChangeLeadPriorityModal
            open={priorityModalOpen}
            onOpenChange={setPriorityModalOpen}
            currentPriorityId={selectedLead.priorityId}
            priorities={priorities}
            leadName={getLeadName(selectedLead)}
            onApply={(newPriorityId) => handlePriorityChange(selectedLead, newPriorityId)}
          />
        </>
      )}

      {/* Conversion Wizard */}
      <ConvertLeadWizard
        open={convertWizardOpen}
        onOpenChange={setConvertWizardOpen}
        lead={
          convertLeadFull
            ? {
                id: convertLeadFull.id,
                firstName: convertLeadFull.firstName,
                lastName: convertLeadFull.lastName,
                contactNumber: convertLeadFull.phone,
                contactEmail: convertLeadFull.email,
                descriptionBox: convertLeadFull.descriptionBox,
                files: convertLeadFull.files,
              }
            : null
        }
        caseCategories={caseCategories}
        onSubmit={handleConvertSubmit}
      />

      {/* Archive / Restore / Delete Confirmation */}
      <ConfirmLeadActionModal
        open={Boolean(confirmAction)}
        onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
        action={confirmAction?.action ?? "archive"}
        leadInfo={confirmAction ? { id: confirmAction.lead.id, name: getLeadName(confirmAction.lead) } : null}
        onConfirm={handleConfirmAction}
        busy={confirmBusy}
      />

      {/* Details */}
      <LeadDetailsModal
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        lead={detailsLead}
        isArchived={activeTab === "archive"}
        priorities={priorities}
      />
    </div>
  );
}
