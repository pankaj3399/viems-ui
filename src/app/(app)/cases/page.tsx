"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import {
  RiSearchLine,
  RiFilterLine,
  RiFilter3Line,
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowLeftDoubleLine,
  RiArrowRightDoubleLine,
  RiMore2Line,
  RiAddLine,
  RiDownloadLine,
  RiShareForwardBoxLine,
  RiGlobalLine,
  RiAlertLine,
  RiHashtag,
  RiListCheck,
  RiFlashlightLine,
  RiBriefcaseLine,
  RiBriefcaseFill,
  RiUser3Line,
  RiUser3Fill,
  RiThumbDownLine,
  RiThumbDownFill,
  RiCloseLine,
  RiEditLine,
  RiGroupLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangeCaseStatusModal } from "./components/ChangeCaseStatusModal";
import { CaseStatusDropdown } from "./components/CaseStatusDropdown";
import { MarkVisaRefusedModal } from "./components/MarkVisaRefusedModal";
import { CountryFilterDropdown } from "./components/CountryFilterDropdown";
import { StatusFilterDropdown } from "./components/StatusFilterDropdown";
import { CaseRowMenu } from "./components/CaseRowMenu";
import { GroupRowMenu } from "./components/GroupRowMenu";
import { EditGroupModal } from "./components/EditGroupModal";
import { ArchiveCaseModal } from "./components/ArchiveCaseModal";
import { DeleteCaseModal } from "./components/DeleteCaseModal";
import { CaseActionModal } from "./components/CaseActionModal";
import { CASE_STATUSES, REFUSAL_REASONS } from "./case-status-data";
import { apiClient } from "@/lib/api-client";
import { formatFullName, getInitials, classifyCaseStage, getCaseAction } from "@/lib/utils";
import { CaseRow, mapBackendCaseToRow, getMappedCasesWithOverrides, isCaseRefused, isCaseInProgress } from "@/lib/case-mapper";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { getCountryInfo } from "@/lib/country";
import { Flag } from "@/components/ui/flag";
import { toast } from "sonner";

const CasesIcon = ({ active, ...props }: { active?: boolean } & React.SVGProps<SVGSVGElement>) => (
  active ? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.5 6.25V4C5.5 3.80109 5.57902 3.61032 5.71967 3.46967C5.86032 3.32902 6.05109 3.25 6.25 3.25H11.0605L12.5605 4.75H16.75C16.9489 4.75 17.1397 4.82902 17.2803 4.96967C17.421 5.11032 17.5 5.30109 17.5 5.5V13C17.5 13.1989 17.421 13.3897 17.2803 13.5303C17.1397 13.671 16.9489 13.75 16.75 13.75H14.5V16C14.5 16.1989 14.421 16.3897 14.2803 16.5303C14.1397 16.671 13.9489 16.75 13.75 16.75H3.25C3.05109 16.75 2.86032 16.671 2.71967 16.5303C2.57902 16.3897 2.5 16.1989 2.5 16V7C2.5 6.80109 2.57902 6.61032 2.71967 6.46967C2.86032 6.32902 3.05109 6.25 3.25 6.25H5.5ZM5.5 7.75H4V15.25H13V13.75H5.5V7.75Z"
        fill="currentColor"
      />
    </svg>
  ) : (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform="translate(2.5, 3)">
        <path
          d="M3 3V0.75C3 0.551088 3.07902 0.360322 3.21967 0.21967C3.36032 0.0790176 3.55109 0 3.75 0H8.5605L10.0605 1.5H14.25C14.4489 1.5 14.6397 1.57902 14.7803 1.71967C14.921 1.86032 15 2.05109 15 2.25V9.75C15 9.94891 14.921 10.1397 14.7803 10.2803C14.6397 10.421 14.4489 10.5 14.25 10.5H12V12.75C12 12.9489 11.921 13.1397 11.7803 13.2803C11.6397 13.421 11.4489 13.5 11.25 13.5H0.75C0.551088 13.5 0.360322 13.421 0.21967 13.2803C0.0790176 13.1397 0 12.9489 0 12.75V3.75C0 3.55109 0.0790176 3.36032 0.21967 3.21967C0.360322 3.07902 0.551088 3 0.75 3H3ZM3 4.5H1.5V12H10.5V10.5H3V4.5ZM4.5 1.5V9H13.5V3H9.4395L7.9395 1.5H4.5Z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
);

const SortIcon = ({
  active = false,
  direction = "asc",
  className = "size-5 text-[#A4A4A4] shrink-0",
}: {
  active?: boolean;
  direction?: "asc" | "desc";
  className?: string;
}) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M10 4.5L14 8.5H6L10 4.5Z"
      fill="currentColor"
      opacity={active && direction === "desc" ? 0.3 : 1}
      className={active && direction === "asc" ? "text-[#171717]" : ""}
    />
    <path
      d="M10 15.5L6 11.5H14L10 15.5Z"
      fill="currentColor"
      opacity={active && direction === "asc" ? 0.3 : 1}
      className={active && direction === "desc" ? "text-[#171717]" : ""}
    />
  </svg>
);


export default function CasesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatusParam = searchParams?.get("status") || null;
  const initialStageParam = searchParams?.get("stage") || null;
  const initialCountryParam = searchParams?.get("country") || null;
  const initialCaseIdParam = searchParams?.get("caseId") || null;
  const initialQuickParam = searchParams?.get("quick") || null;
  const initialNeedsActionParam = searchParams?.get("needsAction") === "true" || initialQuickParam === "needs_action";

  const [activeTab, setActiveTab] = React.useState<"cases" | "groups" | "refusals">("cases");
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [needsActionOnly, setNeedsActionOnly] = React.useState(initialNeedsActionParam);

  // Filter states initialized from URL searchParams
  const [countryFilter, setCountryFilter] = React.useState<string | null>(initialCountryParam);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(() => {
    if (!initialStatusParam) return null;
    const s = initialStatusParam.toLowerCase();
    if (s === "active" || s === "approved") return "Visa Approved";
    if (s === "awaiting_decision" || s === "pending") return "Awaiting applicant docs";
    if (s === "refused") return "Visa Refused";
    return initialStatusParam;
  });
  const [migrationFilter, setMigrationFilter] = React.useState<string | null>(
    () => searchParams?.get("migration") || null
  );
  const [stageFilter, setStageFilter] = React.useState<string | null>(initialStageParam);
  const [severityFilter, setSeverityFilter] = React.useState<string | null>(null);
  const [caseIdFilter, setCaseIdFilter] = React.useState<string | null>(initialCaseIdParam);
  const [quickFilter, setQuickFilter] = React.useState<string | null>(initialQuickParam);

  // Popover filter panel states
  const [filterPanelOpen, setFilterPanelOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("Case status");
  const [tempStatus, setTempStatus] = React.useState<string>("all");
  const [tempCountry, setTempCountry] = React.useState<string>("all");
  const [tempMigration, setTempMigration] = React.useState<string>("all");
  const [tempSeverity, setTempSeverity] = React.useState<string>("all");
  const [tempCaseId, setTempCaseId] = React.useState<string>("");
  const [tempQuickFilter, setTempQuickFilter] = React.useState<string>("all");

  const handleApplyFilters = () => {
    setStatusFilter(tempStatus === "all" ? null : tempStatus);
    setCountryFilter(tempCountry === "all" ? null : tempCountry);
    setMigrationFilter(tempMigration === "all" ? null : tempMigration);
    setSeverityFilter(tempSeverity === "all" ? null : tempSeverity);
    setCaseIdFilter(tempCaseId === "" ? null : tempCaseId);
    setQuickFilter(tempQuickFilter === "all" ? null : tempQuickFilter);
    setFilterPanelOpen(false);
  };

  const handleClearFilters = () => {
    setTempStatus("all");
    setTempCountry("all");
    setTempMigration("all");
    setTempSeverity("all");
    setTempCaseId("");
    setTempQuickFilter("all");
    setStatusFilter(null);
    setCountryFilter(null);
    setMigrationFilter(null);
    setStageFilter(null);
    setSeverityFilter(null);
    setCaseIdFilter(null);
    setQuickFilter(null);
    setNeedsActionOnly(false);
    setFilterPanelOpen(false);
  };

  // Modal states
  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [statusModalRow, setStatusModalRow] = React.useState<CaseRow | null>(null);
  const [refusedModalOpen, setRefusedModalOpen] = React.useState(false);
  const [refusedModalRow, setRefusedModalRow] = React.useState<CaseRow | null>(null);
  const [archiveModalOpen, setArchiveModalOpen] = React.useState(false);
  const [archiveModalRow, setArchiveModalRow] = React.useState<CaseRow | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteModalRow, setDeleteModalRow] = React.useState<CaseRow | null>(null);
  const [actionModalOpen, setActionModalOpen] = React.useState(false);
  const [actionModalRow, setActionModalRow] = React.useState<CaseRow | null>(null);
  const [completedActionCaseIds, setCompletedActionCaseIds] = React.useState<Set<number>>(new Set());

  // Mutable cases state for status updates
  const [cases, setCases] = React.useState<CaseRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadCases = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(
        ENDPOINTS.cases.base
      );

      const rawData = response && (Array.isArray(response) ? response : Array.isArray((response as any).data) ? (response as any).data : null);
      if (!rawData) {
        throw new Error("Invalid response payload from cases endpoint");
      }

      const mapped = getMappedCasesWithOverrides(rawData);
      setCases(mapped);
    } catch (err) {
      console.error("Failed to fetch cases:", err);
      toast.error("Failed to load cases. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCases();
  }, [loadCases]);

  const initialGroupParam = searchParams?.get("group") || null;
  const [selectedGroup, setSelectedGroup] = React.useState<string | null>(initialGroupParam);
  const [editGroupModalOpen, setEditGroupModalOpen] = React.useState(false);

  // Group metadata computation for selectedGroup
  const selectedGroupData = React.useMemo(() => {
    if (!selectedGroup) return null;
    const groupItems = cases.filter(
      (c) => (c.group || "").toLowerCase().trim() === selectedGroup.toLowerCase().trim()
    );
    const sortedIds = groupItems
      .map((i) => i.caseId)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const range =
      sortedIds.length > 0
        ? sortedIds.length === 1
          ? `${sortedIds[0]} - ${sortedIds[0]}`
          : `${sortedIds[0]} - ${sortedIds[sortedIds.length - 1]}`
        : "—";

    return {
      groupName: selectedGroup,
      initial: selectedGroup.charAt(0).toUpperCase(),
      caseIdRange: range,
      casesCount: groupItems.length,
      items: groupItems,
    };
  }, [cases, selectedGroup]);

  const handleUpdateGroupName = (newName: string) => {
    if (!selectedGroup || !newName.trim()) return;
    const oldName = selectedGroup;
    setCases((prev) =>
      prev.map((c) =>
        (c.group || "").toLowerCase().trim() === oldName.toLowerCase().trim()
          ? { ...c, group: newName.trim() }
          : c
      )
    );
    setSelectedGroup(newName.trim());
  };

  const handleArchiveGroup = async (groupName: string) => {
    const groupCases = cases.filter(
      (c) => (c.group || "").toLowerCase().trim() === groupName.toLowerCase().trim() && c.id
    );
    if (groupCases.length === 0) {
      toast.info(`No active cases found in group "${groupName}"`);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("moduleName", "cases");
      formData.append(
        "data",
        JSON.stringify(groupCases.map((c) => ({ id: c.id, caseNumber: c.caseId })))
      );
      await apiClient.delete(ENDPOINTS.cases.toArchive, {
        body: formData,
      });
      toast.success(`Group "${groupName}" (${groupCases.length} cases) archived`);
      if (selectedGroup?.toLowerCase().trim() === groupName.toLowerCase().trim()) {
        setSelectedGroup(null);
      }
      loadCases();
    } catch (err) {
      console.error("Failed to archive group:", err);
      toast.error("Failed to archive group");
    }
  };

  const handleDeleteGroup = async (groupName: string) => {
    const groupCases = cases.filter(
      (c) => (c.group || "").toLowerCase().trim() === groupName.toLowerCase().trim() && c.id
    );
    if (groupCases.length === 0) {
      toast.info(`No active cases found in group "${groupName}"`);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("moduleName", "cases");
      formData.append(
        "data",
        JSON.stringify(groupCases.map((c) => ({ id: c.id, caseNumber: c.caseId })))
      );
      await apiClient.delete(ENDPOINTS.cases.archive, {
        body: formData,
      });
      toast.success(`Group "${groupName}" (${groupCases.length} cases) deleted`);
      if (selectedGroup?.toLowerCase().trim() === groupName.toLowerCase().trim()) {
        setSelectedGroup(null);
      }
      loadCases();
    } catch (err) {
      console.error("Failed to delete group:", err);
      toast.error("Failed to delete group");
    }
  };

  const [importModalOpen, setImportModalOpen] = React.useState(false);

  const handleImportSuccess = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const toastId = toast.loading(`Importing ${files.length} file(s)...`);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("module", "cases");
      await apiClient.post(ENDPOINTS.files.upload, {
        body: formData,
      });
      toast.success(`Successfully imported ${files.length} file(s)`);
      loadCases();
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error(err?.message || "Failed to import files");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortColumn(null);
        setSortDirection("asc");
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter cases by tab and selected group
  const tabCases = React.useMemo(() => {
    return cases.filter((item) => {
      const isRefused = isCaseRefused(item);

      if (activeTab === "refusals") {
        return isRefused;
      } else if (activeTab === "cases" || selectedGroup) {
        if (selectedGroup) {
          const matchesGrp = (item.group || "").toLowerCase().trim() === selectedGroup.toLowerCase().trim();
          if (!matchesGrp) return false;
        }
        const normStage = stageFilter ? stageFilter.toUpperCase().replace(/_/g, " ").trim() : null;
        if (statusFilter === "Visa Refused" || statusFilter === "refused" || normStage === "VISA") {
          return true;
        }
        if (statusFilter) {
          return true;
        }
        return isCaseInProgress(item);
      }
      return true; // groups shows all
    });
  }, [cases, activeTab, selectedGroup, statusFilter, stageFilter]);

  // Derive unique countries and statuses for filter dropdowns
  const uniqueCountries = React.useMemo(() => {
    const seen = new Map<string, { code: string; label: string; flag: string; count: number }>();
    tabCases.forEach((c) => {
      if (
        !c.country ||
        c.country.toUpperCase() === "ALL" ||
        c.country === "All countries" ||
        c.country.trim() === ""
      ) {
        return;
      }
      const existing = seen.get(c.country);
      if (existing) {
        existing.count += 1;
      } else {
        seen.set(c.country, { code: c.countryCode || c.country, label: c.country, flag: c.flag, count: 1 });
      }
    });
    return Array.from(seen.values());
  }, [tabCases]);

  const uniqueStatuses = React.useMemo(() => {
    const seen = new Map<string, { label: string; count: number }>();
    tabCases.forEach((c) => {
      if (
        !c.status ||
        c.status.toUpperCase() === "ALL" ||
        c.status.toLowerCase() === "all status" ||
        c.status.trim() === ""
      ) {
        return;
      }
      const existing = seen.get(c.status);
      if (existing) {
        existing.count += 1;
      } else {
        seen.set(c.status, { label: c.status, count: 1 });
      }
    });
    return Array.from(seen.values());
  }, [tabCases]);

  const statusColorMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    cases.forEach((c) => {
      map[c.status] = c.statusColor;
    });
    return map;
  }, [cases]);

  const renderCircularFlag = (country: string, fallbackFlag: string) => {
    return <Flag country={country} />;
  };

  // Helper: normalize and match search strings flexibly (handles trailing spaces & multi-word queries)
  // Helper: normalize and match search strings flexibly (handles long group titles, trailing spaces & multi-word queries)
  const matchesSearchQuery = (itemFields: (string | undefined)[], queryStr: string) => {
    if (!queryStr || !queryStr.trim()) return true;
    const normQuery = queryStr.toLowerCase().trim();
    const combinedText = itemFields.map((f) => (f || "").toLowerCase()).join(" ");

    // 1. Direct substring match (e.g. searching "ax" or "AX Studios" or "Vikas")
    if (combinedText.includes(normQuery)) return true;

    // 2. Inverse substring match (e.g. clicking long group title "Hun Ni Mud'de Yaar Movie Group part 3" vs case group "Hun Ni Mud'de")
    if (itemFields.some((f) => f && f.length >= 3 && normQuery.includes(f.toLowerCase().trim()))) return true;

    // 3. Forgiving token matching for multi-word search queries
    const words = normQuery.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      const matchedWords = words.filter((w) => combinedText.includes(w));
      if (words.length <= 2) {
        return matchedWords.length === words.length;
      }
      return matchedWords.length / words.length >= 0.5;
    }
    return false;
  };

  // Filter cases based on search, country, status, and Needs Action filter
  const filteredCases = React.useMemo(() => {
    if (searchQuery && searchQuery.trim()) {
      const uniqueGroups = [...new Set(tabCases.map((c) => c.group))];
      console.log("[DEBUG filteredCases] searchQuery:", JSON.stringify(searchQuery), "activeTab:", activeTab);
      console.log("[DEBUG filteredCases] tabCases.length:", tabCases.length, "unique groups:", uniqueGroups.slice(0, 15));
    }
    const result = tabCases.filter((item) => {
      const matchesSearch = matchesSearchQuery(
        [item.name, item.caseId, item.group, item.country, item.migration, item.status],
        searchQuery
      );

      const matchesCountry = !countryFilter || countryFilter === "all" || (
        item.countryCode.toLowerCase() === countryFilter.toLowerCase() ||
        item.country.toLowerCase() === countryFilter.toLowerCase() ||
        countryFilter.toLowerCase().includes(item.countryCode.toLowerCase()) ||
        countryFilter.toLowerCase().includes(item.country.toLowerCase())
      );

      const matchesStatus = !statusFilter || statusFilter === "all" || (
        statusFilter.toLowerCase() === "active" ? (item.status === "Visa Approved" || item.migration === "ACTIVE COMPLIANCE" || item.migration === "IN UK") :
        statusFilter.toLowerCase() === "approved" ? (item.status === "Visa Approved") :
        statusFilter.toLowerCase() === "awaiting_decision" ? (item.status === "Awaiting applicant docs" || item.status === "Drafting CoS") :
        statusFilter.toLowerCase() === "refused" ? (item.status.toLowerCase().includes("refused")) :
        item.status.toLowerCase() === statusFilter.toLowerCase()
      );
      
      const matchesMigration = !migrationFilter || migrationFilter === "all" || (
        migrationFilter === "ACTIVE COMPLIANCE" ? (item.migration === "ACTIVE COMPLIANCE" || item.migration === "IN UK") :
        item.migration.toLowerCase() === migrationFilter.toLowerCase()
      );
      const matchesSeverity = !severityFilter || (
        severityFilter === "RED" ? item.actionColor === "red" :
        severityFilter === "YELLOW" ? item.actionColor === "yellow" :
        severityFilter === "BLUE_GRAY" ? (item.actionColor === "blue" || item.actionColor === "gray") :
        severityFilter === "NONE" ? item.actionColor === "gray" : true
      );
      const matchesCaseId = !caseIdFilter || item.caseId.toLowerCase().includes(caseIdFilter.toLowerCase());

      const normStage = stageFilter ? stageFilter.toUpperCase().replace(/_/g, " ").trim() : null;
      const matchesStage = !normStage || normStage === "ALL" || (
        classifyCaseStage(item) === normStage
      );

      const matchesQuick = !quickFilter || (
        quickFilter === "needs_action" ? (item.actionColor !== "gray" && item.action !== "No action required") :
        quickFilter === "awaiting_upload" ? item.action === "Upload passport" :
        quickFilter === "rtw_pending" ? item.action === "Check RTW" : true
      );

      if (needsActionOnly) {
        return matchesSearch && matchesCountry && matchesStatus && matchesMigration && matchesStage && matchesSeverity && matchesCaseId && matchesQuick && item.actionColor !== "gray" && item.action !== "No action required";
      }
      return matchesSearch && matchesCountry && matchesStatus && matchesMigration && matchesStage && matchesSeverity && matchesCaseId && matchesQuick;
    });
    return result;
  }, [tabCases, searchQuery, needsActionOnly, countryFilter, statusFilter, migrationFilter, stageFilter, severityFilter, caseIdFilter, quickFilter]);

  const groupedData = React.useMemo(() => {
    const groupsMap = new Map<string, CaseRow[]>();

    cases.forEach((c) => {
      const gName = c.group && c.group !== "No Group" ? c.group : "AX Studios";
      if (!groupsMap.has(gName)) {
        groupsMap.set(gName, []);
      }
      groupsMap.get(gName)!.push(c);
    });

    const result: Array<{ groupName: string; initial: string; caseIdRange: string; migrantsCount: number; items: CaseRow[] }> = [];

    groupsMap.forEach((items, gName) => {
      const sortedIds = items
        .map((i) => i.caseId)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      const range =
        sortedIds.length > 0
          ? sortedIds.length === 1
            ? `${sortedIds[0]} - ${sortedIds[0]}`
            : `${sortedIds[0]} - ${sortedIds[sortedIds.length - 1]}`
          : "—";

      result.push({
        groupName: gName,
        initial: gName.charAt(0).toUpperCase(),
        caseIdRange: range,
        migrantsCount: items.length,
        items,
      });
    });

    if (!searchQuery || !searchQuery.trim()) return result;
    return result.filter((g) =>
      matchesSearchQuery([g.groupName, g.caseIdRange], searchQuery)
    );
  }, [filteredCases, searchQuery]);


  const sortedFilteredCases = React.useMemo(() => {
    if (!sortColumn) return filteredCases;
    return [...filteredCases].sort((a, b) => {
      let comparison = 0;
      if (sortColumn === "caseId") {
        comparison = a.caseId.localeCompare(b.caseId, undefined, { numeric: true });
      } else if (sortColumn === "country") {
        comparison = (a.countryCode || a.country).localeCompare(b.countryCode || b.country);
      } else if (sortColumn === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortColumn === "status") {
        comparison = a.status.localeCompare(b.status);
      } else if (sortColumn === "migration") {
        comparison = a.migration.localeCompare(b.migration);
      } else if (sortColumn === "passport") {
        comparison = (a.passportNumber || "").localeCompare(b.passportNumber || "");
      } else if (sortColumn === "refusalDate") {
        comparison = (a.refusalDate || "").localeCompare(b.refusalDate || "");
      } else if (sortColumn === "refusalReason") {
        comparison = (a.refusalReason || "").localeCompare(b.refusalReason || "");
      } else if (sortColumn === "action") {
        comparison = a.action.localeCompare(b.action);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredCases, sortColumn, sortDirection]);

  const sortedGroupedData = React.useMemo(() => {
    if (!sortColumn) return groupedData;
    return [...groupedData].sort((a, b) => {
      let comparison = 0;
      if (sortColumn === "caseIdRange") {
        comparison = a.caseIdRange.localeCompare(b.caseIdRange, undefined, { numeric: true });
      } else if (sortColumn === "groupName") {
        comparison = a.groupName.localeCompare(b.groupName);
      } else if (sortColumn === "migrants") {
        comparison = a.migrantsCount - b.migrantsCount;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [groupedData, sortColumn, sortDirection]);

  const [pageSize, setPageSize] = React.useState(10);

  const isGroupSummaryView = activeTab === "groups" && !selectedGroup;
  const totalCount = isGroupSummaryView ? sortedGroupedData.length : sortedFilteredCases.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  const paginatedCases = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedFilteredCases.slice(start, start + pageSize);
  }, [sortedFilteredCases, safePage, pageSize]);

  const paginatedGroups = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedGroupedData.slice(start, start + pageSize);
  }, [sortedGroupedData, safePage, pageSize]);

  // Helper: show custom styled success toast matching Figma
  const showSuccessToast = (name: string, statusText: string) => {
    toast(`${name}'s case status set as ${statusText}.`, {
      icon: (
        <div className="size-5 rounded-full bg-white flex items-center justify-center shrink-0">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 4L3.5 6L8.5 1" stroke="var(--color-brand-medium)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ),
      className: "!bg-brand-medium !border-brand-medium !shadow-card-large !rounded-card !py-md !px-xl !w-[440px] !max-w-[calc(100vw-2rem)] !flex !items-center !gap-md !h-[50px]",
      classNames: {
        title: "!text-white !font-sans !font-medium !text-paragraph-sm !tracking-[-0.006em]",
      }
    });
  };

  // Handler: change case status with real backend call
  const handleChangeStatus = async (newStatusValue: string, rowOverride?: CaseRow) => {
    const targetRow = rowOverride || statusModalRow;
    if (!targetRow) return;
    const statusOption = CASE_STATUSES.find(
      (s) =>
        s.value === newStatusValue ||
        s.label.toLowerCase() === newStatusValue.toLowerCase() ||
        s.value.toLowerCase().replace(/_/g, " ") === newStatusValue.toLowerCase().replace(/_/g, " ")
    );
    if (!statusOption) return;

    const applyLocalState = () => {
      const overrideKey = targetRow.id || targetRow.caseId;
      if (overrideKey) {
        try {
          const saved = localStorage.getItem("viems_case_status_overrides");
          const overrides = saved ? JSON.parse(saved) : {};
          overrides[overrideKey] = statusOption.label;
          localStorage.setItem("viems_case_status_overrides", JSON.stringify(overrides));
        } catch (e) {}
      }

      setCases((prev) =>
        prev.map((c) =>
          c.caseId === targetRow.caseId || c.id === targetRow.id
            ? {
                ...c,
                status: statusOption.label,
                statusColor: statusOption.dotColor === "#1FC16B"
                  ? ("success" as const)
                  : statusOption.dotColor === "#F6B51E"
                  ? ("warning" as const)
                  : statusOption.dotColor === "#335CFF"
                  ? ("info" as const)
                  : statusOption.dotColor === "#FB3748"
                  ? ("error" as const)
                  : ("gray" as const),
              }
            : c
        )
      );
      showSuccessToast(targetRow.name, statusOption.label);
    };

    if (targetRow.id) {
      try {
        const formData = new FormData();

        const roleId = typeof targetRow.roleId === "number"
          ? targetRow.roleId
          : parseInt(String(targetRow.roleId), 10) || 1;

        formData.append("category", JSON.stringify({ id: roleId }));

        const yearVal = (targetRow as any).relatedYear || (targetRow as any).year || new Date().getFullYear();
        formData.append("relatedYear", String(yearVal));
        formData.append("status", statusOption.label);

        if (statusOption.value === "visa_approved" || statusOption.label.toLowerCase().includes("approved")) {
          formData.append("decision", JSON.stringify({ id: "Granted" }));
        } else if (statusOption.value === "visa_refused" || statusOption.label.toLowerCase().includes("refused")) {
          formData.append("decision", JSON.stringify({ id: "Refused" }));
        } else if (targetRow.outcome) {
          formData.append("decision", JSON.stringify({ id: targetRow.outcome }));
        }

        if (targetRow.cosStatusValue) {
          formData.append("cosStatus", JSON.stringify({ id: targetRow.cosStatusValue }));
        }

        await apiClient.patch(ENDPOINTS.cases.byId(targetRow.id), {
          body: formData,
        });
        applyLocalState();
      } catch (err) {
        console.error("Failed to update status on server:", err);
        toast.error("Failed to update status on server");
      }
    } else {
      applyLocalState();
    }
  };

  // Handler: mark as visa refused with real backend call
  const handleMarkRefused = async (reason: string, customText?: string) => {
    if (!refusedModalRow) return;

    // Update UI status locally first
    setCases((prev) =>
      prev.map((c) =>
        c.caseId === refusedModalRow.caseId
          ? {
              ...c,
              status: "Visa refused",
              statusColor: "error" as const,
            }
          : c
      )
    );

    if (refusedModalRow.id) {
      try {
        const formData = new FormData();

        // category (role) is required by NestJS DTO
        const roleId = typeof refusedModalRow.roleId === "number"
          ? refusedModalRow.roleId
          : parseInt(String(refusedModalRow.roleId), 10) || 1;
        formData.append("category", JSON.stringify({ id: roleId }));

        // Preserve existing relatedYear
        formData.append("relatedYear", String(new Date().getFullYear()));

        // Resolve refusal reason text
        const selectedObj = REFUSAL_REASONS.find((r) => r.value === reason);
        const finalReasonText = reason === "other" 
          ? (customText || "Other") 
          : (selectedObj ? selectedObj.label : reason);

        // Build decision payload with refusal sub-object
        const decisionPayload = {
          id: "Refused",
          refusal: {
            isRefusal: true,
            refusalDate: new Date().toISOString(),
            refusalReason: finalReasonText,
          }
        };
        formData.append("decision", JSON.stringify(decisionPayload));

        // Preserve existing cosStatus so we don't accidentally set an invalid enum value
        if (refusedModalRow.cosStatusValue) {
          formData.append("cosStatus", JSON.stringify({ id: refusedModalRow.cosStatusValue }));
        }

        await apiClient.patch(ENDPOINTS.cases.byId(refusedModalRow.id), {
          body: formData,
        });
        showSuccessToast(refusedModalRow.name, "Visa Refused");
        loadCases();
      } catch (err) {
        console.error("Failed to record refusal on server:", err);
        toast.error("Failed to record refusal on server");
        // Revert local state by reloading cases
        loadCases();
      }
    }
  };

  const handleArchiveCase = async (row: CaseRow) => {
    if (row.id) {
      try {
        const formData = new FormData();
        formData.append("moduleName", "cases");
        formData.append("data", JSON.stringify([{
          id: row.id,
          caseNumber: row.caseId,
        }]));
        await apiClient.delete(ENDPOINTS.cases.toArchive, {
          body: formData,
        });
        toast.success(`Case #${row.caseId} archived`);
        loadCases();
      } catch (err) {
        console.error("Failed to archive case:", err);
        toast.error("Failed to archive case");
      }
    }
  };

  const handleDeleteCase = async (row: CaseRow) => {
    if (row.id) {
      try {
        const formData = new FormData();
        formData.append("moduleName", "cases");
        formData.append("data", JSON.stringify([{
          id: row.id,
          caseNumber: row.caseId,
        }]));
        await apiClient.delete(ENDPOINTS.cases.archive, {
          body: formData,
        });
        toast.success(`Case #${row.caseId} deleted`);
        loadCases();
      } catch (err) {
        console.error("Failed to delete case:", err);
        toast.error("Failed to delete case");
      }
    }
  };

  const handleActionCompleted = (completedId?: number | string) => {
    const idToSave = completedId || actionModalRow?.id;
    const caseIdToSave = actionModalRow?.caseId;

    if (idToSave || caseIdToSave) {
      try {
        const savedActions = localStorage.getItem("viems_completed_actions");
        const list: string[] = savedActions ? JSON.parse(savedActions) : [];
        if (idToSave) list.push(String(idToSave));
        if (caseIdToSave) list.push(String(caseIdToSave));
        localStorage.setItem("viems_completed_actions", JSON.stringify(Array.from(new Set(list))));
      } catch (e) {}

      setCases((prev) =>
        prev.map((c) =>
          c.id === idToSave || c.caseId === caseIdToSave
            ? { ...c, action: "No action required", actionColor: "gray" }
            : c
        )
      );
    }
    loadCases();
  };

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
    return "bg-[#F5F5F5] text-[#5C5C5C]";
  };

  const getStatusBgAndText = (color: CaseRow["statusColor"]) => {
    switch (color) {
      case "warning":
        return "bg-[#FFFAEB] text-[#624C18] hover:bg-[#FEEFC7] hover:text-[#4D3B12]";
      case "success":
        return "bg-[#E3F7EC] text-[#0B4627] hover:bg-[#D0F2DF] hover:text-[#06331C]";
      case "info":
        return "bg-[#EBF1FF] text-[#122368] hover:bg-[#D7E4FF] hover:text-[#0D194B]";
      case "error":
        return "bg-[#FFEBEC] text-[#681219] hover:bg-[#FDD5D7] hover:text-[#520C12]";
      default:
        return "bg-[#F5F5F5] text-[#7B7B7B] hover:bg-[#EBEBEB] hover:text-[#171717]";
    }
  };

  const getStatusDotColor = (color: CaseRow["statusColor"]) => {
    switch (color) {
      case "warning":
        return "bg-[#F6B51E]";
      case "success":
        return "bg-[#1FC16B]";
      case "info":
        return "bg-[#335CFF]";
      case "error":
        return "bg-[#FB3748]";
      default:
        return "bg-[#7B7B7B]";
    }
  };

  const getMigrationBgAndText = (status: string) => {
    return "bg-transparent";
  };

  const getMigrationDotColor = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s.includes("PENDING") || s.includes("REFUSED") || s.includes("WITHDRAWN") || s.includes("SPONSORSHIP")) {
      return "bg-[#FB3748]";
    }
    if (s.includes("ACTIVE") || s.includes("IN UK") || s.includes("APPROVED")) {
      return "bg-[#1FC16B]";
    }
    if (s.includes("PRE") || s.includes("ARRIVAL")) {
      return "bg-[#F6B51E]";
    }
    return "bg-[#7B7B7B]";
  };

  const getMigrationTextColorClass = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s.includes("PENDING") || s.includes("REFUSED") || s.includes("WITHDRAWN") || s.includes("SPONSORSHIP")) {
      return "text-[#681219]";
    }
    if (s.includes("ACTIVE") || s.includes("IN UK") || s.includes("APPROVED")) {
      return "text-[#0B4627]";
    }
    if (s.includes("PRE") || s.includes("ARRIVAL")) {
      return "text-[#624C18]";
    }
    return "text-[#7B7B7B]";
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px] text-neutral-500 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-800 mb-2"></div>
        <p className="text-paragraph-sm font-medium">Loading cases...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col font-sans animate-fade-in text-[#171717] bg-[#F5F5F5] min-h-full">
      <div className="bg-white rounded-t-[16px] flex flex-col shrink-0">
        {selectedGroup ? (
          <div className="px-6 md:px-[64px] pt-[32px] pb-[24px] flex flex-col gap-md md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-lg flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setSelectedGroup(null)}
                className="size-8 rounded-full bg-white border border-[#EBEBEB] text-[#171717] hover:bg-neutral-100 flex items-center justify-center p-0 cursor-pointer shrink-0 shadow-x-small transition-colors"
                aria-label="Back to groups"
              >
                <RiArrowLeftSLine className="size-5 text-[#171717]" />
              </button>

              <div className="size-10 rounded-[10px] bg-[#EBEBEB] text-[#171717] font-medium text-paragraph-md flex items-center justify-center shrink-0">
                {selectedGroupData?.initial || selectedGroup.charAt(0).toUpperCase()}
              </div>

              <div className="flex flex-col min-w-0">
                <h1 className="font-aeonik-medium text-[20px] leading-[28px] tracking-[-0.006em] text-[#171717] truncate">
                  {selectedGroup}
                </h1>
                <p className="text-paragraph-xs text-neutral-500 font-normal">
                  {selectedGroupData?.caseIdRange || "—"} · {selectedGroupData?.casesCount || 0} cases
                </p>
              </div>
            </div>

            <div className="flex items-center gap-md">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditGroupModalOpen(true)}
                className="h-9 px-xl text-label-sm font-medium text-[#171717] flex items-center gap-xs cursor-pointer"
              >
                <RiEditLine className="size-4 text-[#171717]" data-icon="inline-start" />
                Edit
              </Button>
              <GroupRowMenu
                onViewGroup={() => {}}
                onEditGroup={() => setEditGroupModalOpen(true)}
                onArchiveGroup={() => {
                  toast.success(`Group ${selectedGroup} archived`);
                  setSelectedGroup(null);
                }}
                onDeleteGroup={() => {
                  toast.success(`Group ${selectedGroup} deleted`);
                  setSelectedGroup(null);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="px-6 md:px-[64px] pt-[32px] pb-[24px] flex flex-col gap-md md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-xs flex-1 min-w-0">
              <h1 className="font-aeonik-medium text-[24px] leading-[32px] tracking-[-0.006em] text-[#171717]">
                Cases
              </h1>
              <p className="text-[14px] leading-[20px] tracking-[-0.006em] text-[#5C5C5C] font-normal max-w-[600px]">
                Create, track, and manage visa cases for individual or grouped applicants.
              </p>
            </div>
            <div className="flex items-center gap-[12px]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#171717] text-[14px] leading-5 font-medium border-0 rounded-[8px] flex items-center gap-1.5 shadow-x-small cursor-pointer transition-colors"
              >
                <RiShareForwardBoxLine className="size-5 text-[#171717] shrink-0" data-icon="inline-start" />
                <span>Import</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => router.push("/migrants/create")}
                className="h-9 px-3 bg-[#7D52F4] hover:bg-[#6C3EE8] text-white text-[14px] leading-5 font-medium border-0 rounded-[8px] flex items-center gap-1.5 cursor-pointer transition-colors shadow-x-small"
              >
                <RiAddLine className="size-5 text-white shrink-0" data-icon="inline-start" />
                <span>New migrant</span>
              </Button>
            </div>
          </div>
        )}

        <div className="px-6 md:px-[64px] flex items-center gap-6 h-[50px] border-b border-[#EBEBEB]">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("cases")}
            className={`h-full px-xs pb-xs border-b-2 border-x-0 border-t-0 text-label-sm font-semibold rounded-none transition-all inline-flex items-center gap-xs cursor-pointer ${
              activeTab === "cases"
                ? "border-[#171717] text-[#171717] hover:bg-transparent"
                : "border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-transparent"
            }`}
          >
            <div className="size-5 flex items-center justify-center shrink-0">
              <CasesIcon
                active={activeTab === "cases"}
                className={`size-5 shrink-0 ${activeTab === "cases" ? "text-[#171717]" : "text-neutral-400"}`}
              />
            </div>
            <span>Cases</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedGroup(null);
              setActiveTab("groups");
            }}
            className={`h-full px-xs pb-xs border-b-2 border-x-0 border-t-0 text-label-sm font-semibold rounded-none transition-all inline-flex items-center gap-xs cursor-pointer ${
              activeTab === "groups" && !selectedGroup
                ? "border-[#171717] text-[#171717] hover:bg-transparent"
                : "border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-transparent"
            }`}
          >
            <div className="size-5 flex items-center justify-center shrink-0">
              <RiGroupLine
                size={20}
                className={`size-5 shrink-0 ${
                  activeTab === "groups" && !selectedGroup ? "text-[#171717]" : "text-neutral-400"
                }`}
              />
            </div>
            <span>Groups</span>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedGroup(null);
              setActiveTab("refusals");
            }}
            className={`h-full px-xs pb-xs border-b-2 border-x-0 border-t-0 text-label-sm font-semibold rounded-none transition-all inline-flex items-center gap-xs cursor-pointer ${
              activeTab === "refusals"
                ? "border-[#171717] text-[#171717] hover:bg-transparent"
                : "border-transparent text-neutral-400 hover:text-neutral-600 hover:bg-transparent"
            }`}
          >
            <div className="size-5 flex items-center justify-center shrink-0">
              {activeTab === "refusals" ? (
                <RiThumbDownFill size={20} className="size-5 shrink-0 text-[#171717]" />
              ) : (
                <RiThumbDownLine size={20} className="size-5 shrink-0 text-neutral-400" />
              )}
            </div>
            <span>Refusals</span>
          </Button>
        </div>
      </div>

      <div className="px-6 md:px-[64px] py-[32px] flex flex-col gap-[32px] flex-1">
        <div className="flex flex-wrap items-center gap-[12px] h-[32px]">
          <div className="relative w-full max-w-[348px] h-[32px] flex items-center bg-white shadow-x-small rounded-[8px] border border-neutral-200/40 focus-within:border-[#7D52F4]">
            <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-5 text-[#A4A4A4] z-10 pointer-events-none" />
            {selectedGroup && (
              <div className="ml-8 my-1 mr-1 pl-2 pr-1 py-0.5 bg-[#F5F5F5] text-[#171717] rounded-[6px] text-[12px] font-medium flex items-center gap-1 shrink-0 border border-[#EBEBEB]">
                <span className="truncate max-w-[120px]">{selectedGroup}</span>
                <button
                  type="button"
                  onClick={() => setSelectedGroup(null)}
                  className="size-3.5 rounded-full hover:bg-neutral-300 flex items-center justify-center text-[#5C5C5C] border-0 bg-transparent p-0 cursor-pointer"
                  title="Clear group filter"
                >
                  <RiCloseLine className="size-3" />
                </button>
              </div>
            )}
            <Input
              variant="unstyled"
              size="none"
              type="text"
              placeholder={selectedGroup ? "Search in group..." : "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-full ${selectedGroup ? "pl-2" : "pl-9"} pr-8 bg-transparent text-[14px] leading-5 text-[#171717] placeholder-[#A4A4A4] border-0 shadow-none focus-visible:ring-0`}
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

          <div className="relative">
            {(() => {
              const activeFilterCount = (countryFilter ? 1 : 0) + (statusFilter ? 1 : 0) + (migrationFilter ? 1 : 0) + (severityFilter ? 1 : 0) + (caseIdFilter ? 1 : 0) + (quickFilter ? 1 : 0) + (needsActionOnly ? 1 : 0);
              return (
                <button
                  type="button"
                  onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                  className={`size-8 rounded-[8px] flex items-center justify-center transition-all border-0 shadow-x-small cursor-pointer ${
                    activeFilterCount > 0
                      ? "bg-[#171717] text-white"
                      : "bg-white text-[#5C5C5C] hover:bg-neutral-50"
                  }`}
                  title="Open filters"
                >
                  <RiFilter3Line className="size-5 shrink-0" />
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-white text-[#171717] text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              );
            })()}
            
            {filterPanelOpen && (
              <div className="absolute top-[40px] left-0 w-[696px] h-[528px] bg-white border border-[#F5F5F5] rounded-[20px] shadow-card-large z-50 flex font-sans overflow-hidden text-left" style={{ boxShadow: '0px 1px 1px 0.5px rgba(51, 51, 51, 0.04), 0px 3px 3px -1.5px rgba(51, 51, 51, 0.02), 0px 6px 6px -3px rgba(51, 51, 51, 0.04), 0px 12px 12px -6px rgba(51, 51, 51, 0.04), 0px 24px 24px -12px rgba(51, 51, 51, 0.04), 0px 48px 48px -24px rgba(51, 51, 51, 0.04), 0px 0px 0px 1px #F5F5F5, inset 0px -1px 1px -0.5px rgba(51, 51, 51, 0.06)' }}>
                {/* Menus sidebar: width 224px */}
                <div className="w-[224px] h-[528px] bg-white border-r border-[#EBEBEB] p-[12px] flex flex-col gap-[8px] shrink-0">
                  {[
                    { key: "Case status", label: "Case status", icon: RiListCheck },
                    { key: "Country", label: "Country", icon: RiGlobalLine },
                    { key: "Migration status", label: "Migration status", icon: RiBriefcaseLine },
                    { key: "Action severity", label: "Action severity", icon: RiAlertLine },
                    { key: "Case ID", label: "Case ID", icon: RiHashtag },
                    { key: "Quick filters", label: "Quick filters", icon: RiFlashlightLine },
                  ].map((item) => {
                    const IconComp = item.icon;
                    const isActive = selectedCategory === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedCategory(item.key)}
                        className={`w-[200px] h-[36px] px-[8px] gap-[8px] rounded-[8px] flex items-center justify-start cursor-pointer transition-all border-0 ${
                          isActive 
                            ? "bg-[#F5F5F5] text-[#171717] font-medium" 
                            : "bg-white text-[#5C5C5C] hover:bg-neutral-50"
                        }`}
                      >
                        <IconComp className={`size-5 shrink-0 ${isActive ? 'text-[#171717]' : 'text-[#A4A4A4]'}`} />
                        <span className="text-[14px] leading-[20px] tracking-[-0.006em] truncate">{item.label}</span>
                        {isActive && (
                          <RiArrowRightSLine className="size-4 text-[#A4A4A4] ml-auto shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Content area: width 472px */}
                <div className="w-[472px] h-[528px] flex flex-col justify-between items-start bg-white">
                  {/* Header */}
                  <div className="w-[472px] h-[52px] px-[20px] py-[16px] gap-[8px] flex items-center border-b border-[#EBEBEB]">
                    <span className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-[#171717]">
                      {selectedCategory}
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="w-[472px] flex-1 p-[20px] gap-[12px] flex flex-col overflow-y-auto">
                    {/* Category specific content */}
                    {selectedCategory === "Case status" && (
                      <div className="flex flex-col gap-[12px] w-full">
                        {[
                          { value: "all", label: "All statuses", count: tabCases.length, colorClass: "bg-[#F5F5F5] text-[#7B7B7B]" },
                          { value: "Visa Approved", label: "Visa approved", count: tabCases.filter(c => c.status === "Visa Approved").length, colorClass: "bg-[#E3F7EC] text-[#0B4627]" },
                          { value: "Awaiting applicant docs", label: "Awaiting applicant docs", count: tabCases.filter(c => c.status.toLowerCase().includes("awaiting")).length, colorClass: "bg-[#FFFAEB] text-[#624C18]" },
                          { value: "Eligibility assessment", label: "Eligibility assessment", count: tabCases.filter(c => c.status === "Eligibility assessment").length, colorClass: "bg-[#EBF1FF] text-[#122368]" },
                          { value: "Visa Refused", label: "Visa refused", count: tabCases.filter(c => c.status === "Visa Refused").length, colorClass: "bg-[#FFEBEC] text-[#681219]" },
                          { value: "Case closed", label: "Case closed", count: tabCases.filter(c => c.status === "Case closed").length, colorClass: "bg-[#F5F5F5] text-[#7B7B7B]" },
                        ].map((opt, i) => {
                          const checked = tempStatus === opt.value;
                          return (
                            <React.Fragment key={opt.value}>
                              <Label className="flex items-center justify-between cursor-pointer w-full group py-1 px-1 -mx-1 rounded-[6px] hover:bg-neutral-50 transition-colors" onClick={() => setTempStatus(opt.value)}>
                                <input
                                  type="radio"
                                  name="statusFilter"
                                  value={opt.value}
                                  checked={checked}
                                  onChange={() => setTempStatus(opt.value)}
                                  className="sr-only"
                                />
                                <div className="flex items-center gap-[8px]">
                                  {/* Custom Radio Button */}
                                  <div className="relative size-5 shrink-0 flex items-center justify-center">
                                    <div className={`absolute inset-0 rounded-full transition-colors ${checked ? "bg-[#7D52F4]" : "bg-[#EBEBEB] group-hover:bg-neutral-300"}`} />
                                    <div className={`absolute rounded-full bg-white transition-all ${checked ? "inset-[6px]" : "inset-[3.5px] shadow-[0px_2px_4px_-2px_rgba(27,28,29,0.12)]"}`} />
                                  </div>
                                  <span className={`text-[14px] leading-[20px] text-[#171717] group-hover:font-medium ${checked ? "font-medium" : "font-normal"}`}>{opt.label}</span>
                                </div>
                                <span className={`px-[8px] py-[2px] rounded-full text-[11px] font-medium tracking-[0.02em] ${opt.colorClass}`}>
                                  {opt.count}
                                </span>
                              </Label>
                              {i < 5 && <div className="w-full h-0 border-b border-[#EBEBEB]" />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    {selectedCategory === "Country" && (
                      <div className="flex flex-col gap-[12px] w-full">
                        {/* Option 1: All countries */}
                        <React.Fragment key="all">
                          <Label className="flex items-center justify-between cursor-pointer w-full group py-1 px-1 -mx-1 rounded-[6px] hover:bg-neutral-50 transition-colors" onClick={() => setTempCountry("all")}>
                            <input
                              type="radio"
                              name="countryFilter"
                              value="all"
                              checked={tempCountry === "all"}
                              onChange={() => setTempCountry("all")}
                              className="sr-only"
                            />
                            <div className="flex items-center gap-[8px]">
                              <div className="relative size-5 shrink-0 flex items-center justify-center">
                                <div className={`absolute inset-0 rounded-full transition-colors ${tempCountry === "all" ? "bg-[#7D52F4]" : "bg-[#EBEBEB] group-hover:bg-neutral-300"}`} />
                                <div className={`absolute rounded-full bg-white transition-all ${tempCountry === "all" ? "inset-[6px]" : "inset-[3.5px] shadow-[0px_2px_4px_-2px_rgba(27,28,29,0.12)]"}`} />
                              </div>
                              <span className={`text-[14px] leading-[20px] text-[#171717] group-hover:font-medium ${tempCountry === "all" ? "font-medium" : "font-normal"}`}>All countries</span>
                            </div>
                            <span className="px-[8px] py-[2px] rounded-full text-[11px] font-medium tracking-[0.02em] bg-[#F5F5F5] text-[#7B7B7B]">
                              {cases.length}
                            </span>
                          </Label>
                          <div className="w-full h-0 border-b border-[#EBEBEB]" />
                        </React.Fragment>

                        {/* Country List combining dataset countries + default options */}
                        {(() => {
                          const countryList: Array<{ value: string; label: string; count?: number }> = [
                            ...uniqueCountries.map((c) => ({
                              value: c.code,
                              label: `${c.label} (${c.code})`,
                              count: c.count,
                            })),
                            ...[
                              { value: "IN", label: "India (IN)" },
                              { value: "US", label: "United States (US)" },
                              { value: "CN", label: "China (CN)" },
                              { value: "FR", label: "France (FR)" },
                              { value: "SA", label: "South Africa (SA)" },
                            ].filter(
                              (def) =>
                                !uniqueCountries.some(
                                  (u) =>
                                    u.code === def.value ||
                                    u.label.toLowerCase() === def.label.split(" ")[0].toLowerCase()
                                )
                            ),
                          ];

                          return countryList.map((opt, i) => {
                            const checked =
                              tempCountry === opt.value ||
                              tempCountry === opt.label.split(" ")[0] ||
                              (opt.value && tempCountry.toLowerCase() === opt.value.toLowerCase());
                            const count =
                              opt.count !== undefined
                                ? opt.count
                                : cases.filter(
                                    (c) =>
                                      c.countryCode === opt.value ||
                                      c.country === opt.label.split(" ")[0]
                                    ).length;

                            return (
                              <React.Fragment key={opt.value}>
                                <Label
                                  className="flex items-center justify-between cursor-pointer w-full group py-1 px-1 -mx-1 rounded-[6px] hover:bg-neutral-50 transition-colors"
                                  onClick={() => setTempCountry(opt.value)}
                                >
                                  <input
                                    type="radio"
                                    name="countryFilter"
                                    value={opt.value}
                                    checked={Boolean(checked)}
                                    onChange={() => setTempCountry(opt.value)}
                                    className="sr-only"
                                  />
                                  <div className="flex items-center gap-[8px]">
                                    <div className="relative size-5 shrink-0 flex items-center justify-center">
                                      <div
                                        className={`absolute inset-0 rounded-full transition-colors ${
                                          checked ? "bg-[#7D52F4]" : "bg-[#EBEBEB] group-hover:bg-neutral-300"
                                        }`}
                                      />
                                      <div
                                        className={`absolute rounded-full bg-white transition-all ${
                                          checked
                                            ? "inset-[6px]"
                                            : "inset-[3.5px] shadow-[0px_2px_4px_-2px_rgba(27,28,29,0.12)]"
                                        }`}
                                      />
                                    </div>
                                    <Flag country={opt.value} className="size-4 shrink-0" />
                                    <span className={`text-[14px] leading-[20px] text-[#171717] group-hover:font-medium ${checked ? "font-medium" : "font-normal"}`}>
                                      {opt.label}
                                    </span>
                                  </div>
                                  <span className="px-[8px] py-[2px] rounded-full text-[11px] font-medium tracking-[0.02em] bg-[#F5F5F5] text-[#7B7B7B]">
                                    {count}
                                  </span>
                                </Label>
                                {i < countryList.length - 1 && (
                                  <div className="w-full h-0 border-b border-[#EBEBEB]" />
                                )}
                              </React.Fragment>
                            );
                          });
                        })()}
                      </div>
                    )}

                    {selectedCategory === "Migration status" && (
                      <div className="flex flex-col gap-[12px] w-full">
                        {[
                          { value: "all", label: "All migration states" },
                          { value: "ACTIVE COMPLIANCE", label: "Active Compliance" },
                          { value: "IN UK", label: "In UK" },
                          { value: "ARRIVED - RTW PENDING", label: "Arrived - RTW Pending" },
                        ].map((opt, i) => {
                          const checked = tempMigration === opt.value;
                          return (
                            <React.Fragment key={opt.value}>
                              <Label className="flex items-center gap-[8px] cursor-pointer w-full py-1 px-1 -mx-1 rounded-[6px] hover:bg-neutral-50 transition-colors group" onClick={() => setTempMigration(opt.value)}>
                                <input
                                  type="radio"
                                  name="migrationFilter"
                                  value={opt.value}
                                  checked={checked}
                                  onChange={() => setTempMigration(opt.value)}
                                  className="sr-only"
                                />
                                <div className="relative size-5 shrink-0 flex items-center justify-center">
                                  <div className={`absolute inset-0 rounded-full transition-colors ${checked ? "bg-[#7D52F4]" : "bg-[#EBEBEB] group-hover:bg-neutral-300"}`} />
                                  <div className={`absolute rounded-full bg-white transition-all ${checked ? "inset-[6px]" : "inset-[3.5px] shadow-[0px_2px_4px_-2px_rgba(27,28,29,0.12)]"}`} />
                                </div>
                                <span className={`text-[14px] leading-[20px] text-[#171717] group-hover:font-medium ${checked ? "font-medium" : "font-normal"}`}>{opt.label}</span>
                              </Label>
                              {i < 3 && <div className="w-full h-0 border-b border-[#EBEBEB]" />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    {selectedCategory === "Action severity" && (
                      <div className="flex flex-col gap-[12px] w-full">
                        {[
                          { value: "all", label: "All severities", dot: null, count: cases.length },
                          { value: "RED", label: "Critical", dot: "#FB3748", count: cases.filter(c => c.actionColor === "red").length },
                          { value: "YELLOW", label: "Warning", dot: "#F6B51E", count: cases.filter(c => c.actionColor === "yellow").length },
                          { value: "BLUE_GRAY", label: "Info", dot: "#335CFF", count: cases.filter(c => c.actionColor === "blue").length },
                          { value: "NONE", label: "No action needed", dot: "#7B7B7B", count: cases.filter(c => c.actionColor === "gray").length },
                        ].map((opt, i) => {
                          const checked = tempSeverity === opt.value;
                          return (
                            <React.Fragment key={opt.value}>
                              <Label className="flex items-center justify-between cursor-pointer w-full group py-1 px-1 -mx-1 rounded-[6px] hover:bg-neutral-50 transition-colors" onClick={() => setTempSeverity(opt.value)}>
                                <input
                                  type="radio"
                                  name="severityFilter"
                                  value={opt.value}
                                  checked={checked}
                                  onChange={() => setTempSeverity(opt.value)}
                                  className="sr-only"
                                />
                                <div className="flex items-center gap-[8px]">
                                  <div className="relative size-5 shrink-0 flex items-center justify-center">
                                    <div className={`absolute inset-0 rounded-full transition-colors ${checked ? "bg-[#7D52F4]" : "bg-[#EBEBEB] group-hover:bg-neutral-300"}`} />
                                    <div className={`absolute rounded-full bg-white transition-all ${checked ? "inset-[6px]" : "inset-[3.5px] shadow-[0px_2px_4px_-2px_rgba(27,28,29,0.12)]"}`} />
                                  </div>
                                  <div className="flex items-center gap-[6px]">
                                    {opt.dot && (
                                      <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: opt.dot }} />
                                    )}
                                    <span className={`text-[14px] leading-[20px] text-[#171717] group-hover:font-medium ${checked ? "font-medium" : "font-normal"}`}>{opt.label}</span>
                                  </div>
                                </div>
                                <span className="px-[8px] py-[2px] rounded-full text-[11px] font-medium tracking-[0.02em] bg-[#F5F5F5] text-[#0B4627]">
                                  {opt.count}
                                </span>
                              </Label>
                              {i < 4 && <div className="w-full h-0 border-b border-[#EBEBEB]" />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    {selectedCategory === "Quick filters" && (
                      <div className="flex flex-col gap-[12px] w-full">
                        {[
                          { value: "all", label: "All cases" },
                          { value: "needs_action", label: "Needs action" },
                          { value: "awaiting_upload", label: "Awaiting document upload" },
                          { value: "rtw_pending", label: "RTW checks pending" },
                        ].map((opt, i) => {
                          const checked = tempQuickFilter === opt.value;
                          return (
                            <React.Fragment key={opt.value}>
                              <Label className="flex items-center gap-[8px] cursor-pointer w-full py-1 px-1 -mx-1 rounded-[6px] hover:bg-neutral-50 transition-colors group" onClick={() => setTempQuickFilter(opt.value)}>
                                <input
                                  type="radio"
                                  name="quickFilter"
                                  value={opt.value}
                                  checked={checked}
                                  onChange={() => setTempQuickFilter(opt.value)}
                                  className="sr-only"
                                />
                                <div className="relative size-5 shrink-0 flex items-center justify-center">
                                  <div className={`absolute inset-0 rounded-full transition-colors ${checked ? "bg-[#7D52F4]" : "bg-[#EBEBEB] group-hover:bg-neutral-300"}`} />
                                  <div className={`absolute rounded-full bg-white transition-all ${checked ? "inset-[6px]" : "inset-[3.5px] shadow-[0px_2px_4px_-2px_rgba(27,28,29,0.12)]"}`} />
                                </div>
                                <span className={`text-[14px] leading-[20px] text-[#171717] group-hover:font-medium ${checked ? "font-medium" : "font-normal"}`}>{opt.label}</span>
                              </Label>
                              {i < 3 && <div className="w-full h-0 border-b border-[#EBEBEB]" />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    {selectedCategory === "Case ID" && (
                      <div className="flex flex-col gap-[12px] w-full">
                        <span className="text-[13px] text-[#5C5C5C] mb-xs">Search by Case ID Number:</span>
                        <Input
                          type="text"
                          placeholder="e.g. 430/2026"
                          value={tempCaseId}
                          onChange={(e) => setTempCaseId(e.target.value)}
                          className="h-9 shadow-x-small bg-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="w-[472px] h-[68px] px-[20px] py-[16px] flex items-center justify-between border-t border-[#EBEBEB]">
                    <span className="text-[12px] font-normal leading-[16px] text-[#5C5C5C]">
                      {filteredCases.length} results
                    </span>
                    <div className="flex items-center gap-[16px]">
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="w-[109px] h-[36px] bg-[#F5F5F5] hover:bg-neutral-200 text-[#5C5C5C] text-[14px] font-medium leading-[20px] rounded-[8px] flex items-center justify-center border-0 cursor-pointer transition-all"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyFilters}
                        className="w-[109px] h-[36px] bg-[#7D52F4] hover:bg-[#683fd1] text-white text-[14px] font-medium leading-[20px] rounded-[8px] flex items-center justify-center border-0 cursor-pointer transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {(!isGroupSummaryView || selectedGroup) && (
            <>
              <CountryFilterDropdown
                countries={uniqueCountries}
                value={countryFilter}
                onChange={setCountryFilter}
              />

              <StatusFilterDropdown
                statuses={uniqueStatuses}
                value={statusFilter}
                onChange={setStatusFilter}
                statusColors={statusColorMap}
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNeedsActionOnly(!needsActionOnly)}
                className={`h-8 px-3 text-[14px] font-medium justify-center rounded-[8px] border-0 shadow-x-small cursor-pointer transition-colors ${
                  needsActionOnly
                    ? "bg-[#FEF3C7] text-[#D97706] hover:bg-[#FEF3C7]"
                    : "bg-white text-[#171717] hover:bg-neutral-50"
                }`}
              >
                Needs action
              </Button>
            </>
          )}

          {/* View mode switcher [Frame 2087326895] */}
          {isGroupSummaryView && !selectedGroup && (
            <div className="flex items-center gap-[4px] ml-auto p-[2px] bg-white rounded-[8px] border border-[#EBEBEB]">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                className={`size-8 rounded-[6px] flex items-center justify-center border-0 cursor-pointer transition-colors ${
                  viewMode === "table" ? "bg-[#171717] text-white" : "bg-white text-[#5C5C5C] hover:bg-neutral-100"
                }`}
                title="Table View"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
                  <path d="M3.75 3.75H16.25V5.25H3.75V3.75ZM3.75 7.5H16.25V9H3.75V7.5ZM3.75 11.25H16.25V12.75H3.75V11.25ZM3.75 15H16.25V16.5H3.75V15Z" fill="currentColor" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                className={`size-8 rounded-[6px] flex items-center justify-center border-0 cursor-pointer transition-colors ${
                  viewMode === "grid" ? "bg-[#171717] text-white" : "bg-white text-[#5C5C5C] hover:bg-neutral-100"
                }`}
                title="Gallery View"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0">
                  <path d="M3.75 3.75H8.75V8.75H3.75V3.75ZM11.25 3.75H16.25V8.75H11.25V3.75ZM3.75 11.25H8.75V16.25H3.75V11.25ZM11.25 11.25H16.25V16.25H11.25V11.25Z" fill="currentColor" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {filteredCases.length === 0 && !isGroupSummaryView ? (
          <div className="flex flex-col items-center justify-center h-[592px] bg-white rounded-card shadow-x-small border border-neutral-200/20">
            {/* Group 9: Figma-matching stacked vector cards */}
            <div className="w-[77px] h-[88px] flex items-center justify-center relative mb-[24px]">
              <svg width="77" height="88" viewBox="0 0 77 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Vector 1 (Back Card) */}
                <rect x="4" y="8" width="52" height="66" rx="4.46724" fill="#EBEBEB" stroke="#A4A4A4" strokeWidth="1.2" transform="rotate(-5 30 41)" />
                {/* Vector 2 (Middle Card) */}
                <rect x="10" y="11" width="52" height="66" rx="4.46724" fill="#F5F5F5" stroke="#A4A4A4" strokeWidth="1.2" transform="rotate(-2.5 36 44)" />
                {/* Vector 3 & 4 (Front Card) */}
                <rect x="18" y="14" width="52" height="66" rx="4.46724" fill="#FFFFFF" stroke="#A4A4A4" strokeWidth="1.2" />
                {/* Vector 5 (Avatar head) */}
                <circle cx="44" cy="38" r="8" fill="#A4A4A4" />
                {/* Vector 6 (Avatar body) */}
                <path d="M28 62C28 55.3726 33.3726 50 40 50H48C54.6274 50 60 55.3726 60 62V67H28V62Z" fill="#A4A4A4" />
              </svg>
            </div>
            
            {/* Title: H6 Title style */}
            <h3 className="text-[20px] font-[550] leading-[28px] tracking-[-0.006em] text-[#171717] font-sans mb-[7px]">
              No migrant found
            </h3>
            
            {/* Subtitle: Paragraph/Small style */}
            <p className="text-[14px] font-normal leading-[20px] tracking-[-0.006em] text-[#5C5C5C] text-center w-[260px] mb-[24px] font-sans">
              Change your filters or add a new migrant
            </p>
            
            {/* Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
                className="h-9 px-3 text-[14px] font-medium text-[#171717] rounded-[8px] cursor-pointer"
              >
                Clear filters
              </Button>
              <Button
                type="button"
                onClick={() => router.push("/migrants/create")}
                className="h-9 px-3 bg-[#262626] hover:bg-[#333333] text-white text-[14px] font-medium rounded-[8px] flex items-center justify-center gap-[4px] cursor-pointer border-0 transition-colors font-sans"
              >
                <RiAddLine className="size-5 text-white shrink-0" data-icon="inline-start" />
                <span>New migrant</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-full">
              <div className="flex flex-col gap-[8px]">
                {activeTab === "refusals" ? (
                  <div className="h-[36px] bg-[#F5F5F5] rounded-[8px] px-[4px] flex items-center text-[12px] tracking-[-0.006em] text-[#A4A4A4] font-medium">
                    <div className="w-[94px] px-3 py-2 shrink-0">Case ID #</div>
                    <div
                      className="w-[112px] px-3 py-2 shrink-0 flex items-center gap-1 cursor-pointer hover:text-[#171717]"
                      onClick={() => handleSort("country")}
                    >
                      Country
                      <SortIcon active={sortColumn === "country"} direction={sortDirection} />
                    </div>
                    <div
                      className="flex-[1.5] min-w-0 px-3 py-2 flex items-center gap-1 cursor-pointer hover:text-[#171717]"
                      onClick={() => handleSort("name")}
                    >
                      Name
                      <SortIcon active={sortColumn === "name"} direction={sortDirection} />
                    </div>
                    <div
                      className="flex-1 min-w-0 px-3 py-2 flex items-center gap-1 cursor-pointer hover:text-[#171717]"
                      onClick={() => handleSort("passport")}
                    >
                      Passport #
                      <SortIcon active={sortColumn === "passport"} direction={sortDirection} />
                    </div>
                    <div
                      className="flex-1 min-w-0 px-3 py-2 flex items-center gap-1 cursor-pointer hover:text-[#171717]"
                      onClick={() => handleSort("refusalDate")}
                    >
                      Date of refusal
                      <SortIcon active={sortColumn === "refusalDate"} direction={sortDirection} />
                    </div>
                    <div className="flex-[1.5] min-w-0 px-3 py-2">Reason</div>
                    <div className="w-[48px] px-3 py-2 shrink-0"></div>
                  </div>
                ) : isGroupSummaryView ? (
                  <div className="h-[36px] bg-[#F5F5F5] rounded-[8px] px-[4px] flex items-center text-[12px] tracking-[-0.006em] text-[#A4A4A4] font-medium">
                    <div className="w-[198px] px-3 py-2 shrink-0">Case ID range #</div>
                    <div
                      className="flex-[1.5] min-w-0 px-3 py-2 flex items-center gap-1 cursor-pointer hover:text-[#171717]"
                      onClick={() => handleSort("groupName")}
                    >
                      Group name
                      <SortIcon active={sortColumn === "groupName"} direction={sortDirection} />
                    </div>
                    <div
                      className="flex-1 min-w-0 px-3 py-2 flex items-center gap-1 cursor-pointer hover:text-[#171717]"
                      onClick={() => handleSort("migrants")}
                    >
                      Migrants
                      <SortIcon active={sortColumn === "migrants"} direction={sortDirection} />
                    </div>
                    <div className="w-[48px] px-3 py-2 shrink-0"></div>
                  </div>
                ) : (
                  <div className="h-[36px] bg-[#F5F5F5] rounded-[8px] px-[4px] flex items-center text-[12px] tracking-[-0.006em] text-[#A4A4A4] font-medium">
                    <div className="w-[94px] px-3 py-2 shrink-0">Case ID #</div>
                    <div
                      className="w-[112px] px-3 py-2 shrink-0 flex items-center gap-1 cursor-pointer hover:text-[#171717]"
                      onClick={() => handleSort("country")}
                    >
                      Country
                      <SortIcon active={sortColumn === "country"} direction={sortDirection} />
                    </div>
                    <div
                      className="w-[269.5px] flex-1 min-w-[269px] px-3 py-2 flex items-center gap-1 cursor-pointer hover:text-[#171717]"
                      onClick={() => handleSort("name")}
                    >
                      Name
                      <SortIcon active={sortColumn === "name"} direction={sortDirection} />
                    </div>
                    <div
                      className="w-[197.5px] px-3 py-2 shrink-0 flex items-center gap-1 cursor-pointer hover:text-[#171717]"
                      onClick={() => handleSort("status")}
                    >
                      Case Status
                      <SortIcon active={sortColumn === "status"} direction={sortDirection} />
                    </div>
                    <div
                      className="w-[193.5px] px-3 py-2 shrink-0 flex items-center gap-1 cursor-pointer hover:text-[#171717]"
                      onClick={() => handleSort("migration")}
                    >
                      Migration Status
                      <SortIcon active={sortColumn === "migration"} direction={sortDirection} />
                    </div>
                    <div className="w-[182px] px-3 py-2 shrink-0 flex items-center">
                      Compliance Action
                    </div>
                    <div className="w-[48px] px-3 py-2 shrink-0"></div>
                  </div>
                )}

                {activeTab === "refusals" ? (
                  <div className="flex flex-col gap-[4px]">
                    {paginatedCases.map((row, idx) => (
                      <div
                        key={row.id ? `case-refusal-${row.id}` : `case-refusal-${row.caseId}-${idx}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => { if (row.id) router.push(`/cases/${row.id}`); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (row.id) router.push(`/cases/${row.id}`);
                          }
                        }}
                        className="bg-white rounded-[16px] h-[72px] p-1 flex items-center border-2 border-transparent hover:border-white hover:bg-[#F5F5F5] transition-all cursor-pointer shadow-x-small group"
                      >
                        <div className="w-[94px] h-16 p-3 flex items-center font-mono text-[14px] text-[#5C5C5C] shrink-0 truncate">
                          {row.caseId}
                        </div>

                        <div className="w-[112px] h-16 p-3 flex items-center gap-2 shrink-0">
                          <Flag country={row.country} className="size-6 rounded-full shrink-0" />
                          <span className="font-normal text-[#171717] font-sans text-[14px] leading-5">{row.countryCode || row.country}</span>
                        </div>

                        <div className="flex-[1.5] min-w-0 h-16 p-3 flex items-center gap-3">
                          {row.avatarUrl ? (
                            <img 
                              src={row.avatarUrl} 
                              alt={row.name} 
                              className="size-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="size-10 rounded-full bg-[#EBEBEB] text-[#171717] flex items-center justify-center font-medium text-[12px] shrink-0">
                              {row.avatarText || getInitials(row.name) || "A"}
                            </div>
                          )}
                          <div className="flex flex-col justify-center min-w-0 gap-0.5 flex-1">
                            <span className="font-medium text-[#171717] truncate leading-5 text-[14px] tracking-[-0.006em]">
                              {row.name}
                            </span>
                            <span className="text-[12px] leading-4 text-[#5C5C5C] truncate font-normal">
                              {row.group || "No group"}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 h-16 p-3 flex items-center font-medium text-[#171717] font-mono text-[14px]">
                          {row.passportNumber}
                        </div>

                        <div className="flex-1 min-w-0 h-16 p-3 flex items-center font-normal text-[#171717] text-[14px]">
                          {row.refusalDate}
                        </div>

                        <div className="flex-[1.5] min-w-0 h-16 p-3 flex items-center font-normal text-[#171717] text-[14px] truncate">
                          {row.refusalReason}
                        </div>

                        <div className="w-[48px] h-16 p-3 flex items-center justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
                          <CaseRowMenu
                            onViewDetails={() => { if (row.id) router.push(`/cases/${row.id}`); }}
                            onChangeStatus={() => {
                              setStatusModalRow(row);
                              setStatusModalOpen(true);
                            }}
                            onMarkRefused={() => {
                              setRefusedModalRow(row);
                              setRefusedModalOpen(true);
                            }}
                            onArchive={() => {
                              setArchiveModalRow(row);
                              setArchiveModalOpen(true);
                            }}
                            onDelete={() => {
                              setDeleteModalRow(row);
                              setDeleteModalOpen(true);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isGroupSummaryView ? (
                  viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg w-full">
                      {paginatedGroups.map((group, idx) => (
                        <div
                          key={group.groupName + "-" + idx}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedGroup(group.groupName);
                            setActiveTab("cases");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedGroup(group.groupName);
                              setActiveTab("cases");
                            }
                          }}
                          className="bg-white rounded-[16px] h-[160px] p-4 flex flex-col justify-between shadow-x-small border border-neutral-200/20 hover:border-neutral-200/50 hover:shadow-custom-medium transition-all cursor-pointer"
                        >
                          {/* Top Row: Case ID range + Menu */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-paragraph-sm text-[#5C5C5C]">
                              {group.caseIdRange}
                            </span>
                            <div onClick={(e) => e.stopPropagation()}>
                              <GroupRowMenu
                                onViewGroup={() => {
                                  setSelectedGroup(group.groupName);
                                  setActiveTab("cases");
                                }}
                                onEditGroup={() => {
                                  setSelectedGroup(group.groupName);
                                  setEditGroupModalOpen(true);
                                }}
                                onArchiveGroup={() => {
                                  toast.success(`Group ${group.groupName} archived`);
                                }}
                                onDeleteGroup={() => {
                                  toast.success(`Group ${group.groupName} deleted`);
                                }}
                              />
                            </div>
                          </div>

                          {/* Middle: Square/Rounded Initial Avatar */}
                          <div className="flex items-center">
                            <div className="size-10 rounded-[10px] bg-[#EBEBEB] text-[#171717] font-medium text-paragraph-sm flex items-center justify-center shrink-0">
                              {group.initial}
                            </div>
                          </div>

                          {/* Bottom Row: Group Name + Migrants Badge */}
                          <div className="flex items-center justify-between gap-sm min-w-0">
                            <span className="font-medium text-[#171717] truncate text-paragraph-sm">
                              {group.groupName}
                            </span>
                            <div className="w-5 h-[18px] bg-[#EBEBEB] rounded-[4px] text-[11px] font-medium text-[#5C5C5C] flex items-center justify-center shrink-0">
                              {group.migrantsCount}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-[4px]">
                      {paginatedGroups.map((group, idx) => (
                        <div
                          key={`${group.groupName}-${idx}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedGroup(group.groupName);
                            setActiveTab("cases");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedGroup(group.groupName);
                              setActiveTab("cases");
                            }
                          }}
                          className="bg-white rounded-[16px] h-[72px] p-1 flex items-center border-2 border-transparent hover:border-white hover:bg-[#F5F5F5] transition-all cursor-pointer shadow-x-small group"
                        >
                          <div className="w-[198px] h-16 p-3 flex items-center font-mono text-[14px] text-[#5C5C5C] shrink-0 truncate">
                            {group.caseIdRange}
                          </div>

                          <div className="flex-[1.5] min-w-0 h-16 p-3 flex items-center gap-3">
                            <div className="size-10 rounded-[10px] bg-[#EBEBEB] text-[#171717] font-medium text-[16px] flex items-center justify-center shrink-0">
                              {group.initial}
                            </div>
                            <span className="font-medium text-[#171717] truncate text-[14px]">
                              {group.groupName}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 h-16 p-3 flex items-center font-normal text-[#171717] text-[14px]">
                            {group.migrantsCount}
                          </div>

                          <div className="w-[48px] h-16 p-3 flex items-center justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
                            <GroupRowMenu
                              onViewGroup={() => {
                                setSelectedGroup(group.groupName);
                                setActiveTab("cases");
                              }}
                              onEditGroup={() => {
                                setSelectedGroup(group.groupName);
                                setEditGroupModalOpen(true);
                              }}
                              onArchiveGroup={() => {
                                toast.success(`Group ${group.groupName} archived`);
                              }}
                              onDeleteGroup={() => {
                                toast.success(`Group ${group.groupName} deleted`);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col gap-[4px]">
                    {paginatedCases.map((row, idx) => (
                      <div
                        key={row.id ? `case-row-${row.id}` : `case-row-${row.caseId}-${idx}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => { if (row.id) router.push(`/cases/${row.id}`); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (row.id) router.push(`/cases/${row.id}`);
                          }
                        }}
                        className="bg-white rounded-[16px] h-[72px] p-1 flex items-center border-2 border-transparent hover:border-white hover:bg-[#F5F5F5] transition-all cursor-pointer shadow-x-small group"
                      >
                        <div className="w-[94px] h-16 p-3 flex items-center font-mono text-[14px] text-[#5C5C5C] shrink-0 truncate">
                          {row.caseId}
                        </div>

                        <div className="w-[112px] h-16 p-3 flex items-center gap-2 shrink-0">
                          <Flag country={row.country} className="size-6 rounded-full shrink-0" />
                          <span className="font-normal text-[#171717] font-sans text-[14px] leading-5">{row.countryCode || row.country}</span>
                        </div>

                        <div className="w-[269.5px] flex-1 min-w-[269px] h-16 p-3 flex items-center gap-3 shrink-0">
                          {row.avatarUrl ? (
                            <img 
                              src={row.avatarUrl} 
                              alt={row.name} 
                              className="size-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="size-10 rounded-full bg-[#EBEBEB] text-[#171717] flex items-center justify-center font-medium text-[12px] shrink-0">
                              {row.avatarText || getInitials(row.name) || "A"}
                            </div>
                          )}
                          <div className="flex flex-col justify-center min-w-0 gap-0.5 flex-1">
                            <span className="font-medium text-[#171717] truncate leading-5 text-[14px] tracking-[-0.006em]">
                              {row.name}
                            </span>
                            <span className="text-[12px] leading-4 text-[#5C5C5C] truncate font-normal">
                              {row.group || "No group"}
                            </span>
                          </div>
                        </div>

                        <div className="w-[197.5px] h-16 p-3 flex items-center shrink-0">
                          <CaseStatusDropdown
                            currentStatus={row.status}
                            statusColor={row.statusColor}
                            getStatusBgAndText={getStatusBgAndText}
                            getStatusDotColor={getStatusDotColor}
                            onApplyStatus={(newStatus) => {
                              setStatusModalRow(row);
                              // Visa refused requires the refusal reason modal first
                              const norm = newStatus.toLowerCase().replace(/_/g, " ").trim();
                              if (norm === "visa refused" || norm === "visa_refused") {
                                setRefusedModalRow(row);
                                setRefusedModalOpen(true);
                              } else {
                                handleChangeStatus(newStatus, row);
                              }
                            }}
                          />
                        </div>

                        <div className="w-[193.5px] h-16 p-3 flex items-center shrink-0">
                          <div className="h-5 rounded-full px-2 py-0.5 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.02em] bg-white whitespace-nowrap shrink-0">
                            <div className="size-4 flex items-center justify-center shrink-0">
                              <span className={`size-1.5 rounded-full ${getMigrationDotColor(row.migration)}`} />
                            </div>
                            <span className={`${getMigrationTextColorClass(row.migration)} whitespace-nowrap`}>{row.migration}</span>
                          </div>
                        </div>

                        <div className="w-[182px] h-16 p-3 flex items-center shrink-0">
                          <div className="h-6 rounded-full px-2 py-0.5 inline-flex items-center gap-1 bg-white whitespace-nowrap shrink-0">
                            {row.actionColor !== "gray" && row.action !== "No action required" && row.action !== "No action needed" && (
                              <div className="size-4 flex items-center justify-center shrink-0">
                                <span className={`size-1.5 rounded-full ${getActionDotColor(row.actionColor)}`} />
                              </div>
                            )}
                            {row.actionColor !== "gray" && row.action !== "No action required" && row.action !== "No action needed" ? (
                              <button
                                type="button"
                                className="text-[14px] leading-5 font-medium tracking-[-0.006em] text-[#262626] hover:text-[#171717] hover:underline cursor-pointer text-left border-0 bg-transparent p-0 font-inherit focus:outline-none whitespace-nowrap truncate max-w-[150px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionModalRow(row);
                                  actionModalOpen ? null : setActionModalOpen(true);
                                }}
                              >
                                {row.action}
                              </button>
                            ) : (
                              <span className="text-[14px] leading-5 font-medium tracking-[-0.006em] text-[#A4A4A4] whitespace-nowrap">
                                No action needed
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-[48px] h-16 p-3 flex items-center justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
                          <CaseRowMenu
                            onViewDetails={() => { if (row.id) router.push(`/cases/${row.id}`); }}
                            onChangeStatus={() => {
                              setStatusModalRow(row);
                              setStatusModalOpen(true);
                            }}
                            onMarkRefused={() => {
                              setRefusedModalRow(row);
                              setRefusedModalOpen(true);
                            }}
                            onArchive={() => {
                              setArchiveModalRow(row);
                              setArchiveModalOpen(true);
                            }}
                            onDelete={() => {
                              setDeleteModalRow(row);
                              setDeleteModalOpen(true);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="h-8 flex items-center justify-between gap-6 text-[14px] text-[#5C5C5C]">
              <div className="w-[200px] text-left shrink-0 font-normal">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center justify-center gap-2 flex-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-white hover:shadow-x-small disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none border-0 bg-transparent cursor-pointer transition-all"
                  title="First page"
                >
                  <RiArrowLeftDoubleLine className="size-5" />
                </button>

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-white hover:shadow-x-small disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none border-0 bg-transparent cursor-pointer transition-all"
                  title="Previous page"
                >
                  <RiArrowLeftSLine className="size-5" />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = Math.min(totalPages - 4 + i, currentPage - 2 + i);
                    }
                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`size-8 rounded-[8px] text-[14px] font-medium flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#171717] text-white border-0"
                            : "bg-white border border-[#EBEBEB] text-[#171717] hover:bg-neutral-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="size-8 flex items-center justify-center text-[#A4A4A4] font-medium">...</span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(totalPages)}
                        className="size-8 rounded-[8px] bg-white border border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 text-[14px] font-medium flex items-center justify-center cursor-pointer transition-all"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-white hover:shadow-x-small disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none border-0 bg-transparent cursor-pointer transition-all"
                  title="Next page"
                >
                  <RiArrowRightSLine className="size-5" />
                </button>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="size-8 rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:bg-white hover:shadow-x-small disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none border-0 bg-transparent cursor-pointer transition-all"
                  title="Last page"
                >
                  <RiArrowRightDoubleLine className="size-5" />
                </button>
              </div>

              <div className="w-[200px] flex justify-end shrink-0">
                <div className="relative">
                  <select
                    value={pageSize}
                    aria-label="Rows per page"
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-[99px] h-8 bg-white border border-[#EBEBEB] shadow-x-small rounded-[8px] pl-2.5 pr-7 py-1.5 text-[14px] font-normal text-[#5C5C5C] hover:border-neutral-300 focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={48}>48</option>
                    <option value={100}>100</option>
                  </select>
                  <RiArrowDownSLine className="absolute right-2 top-1/2 -translate-y-1/2 size-5 text-[#A4A4A4] pointer-events-none" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <ChangeCaseStatusModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        currentStatus={
          statusModalRow
            ? CASE_STATUSES.find((s) => s.label === statusModalRow.status)?.value || ""
            : ""
        }
        onApply={(newStatus: string) => {
          const norm = newStatus.toLowerCase().replace(/_/g, " ").trim();
          if (norm === "visa refused" || norm === "visa_refused") {
            // Open refusal reason modal instead
            if (statusModalRow) {
              setRefusedModalRow(statusModalRow);
              setRefusedModalOpen(true);
            }
          } else {
            handleChangeStatus(newStatus);
          }
        }}
      />

      <MarkVisaRefusedModal
        open={refusedModalOpen}
        onOpenChange={setRefusedModalOpen}
        caseInfo={
          refusedModalRow
            ? {
                caseId: refusedModalRow.caseId,
                name: refusedModalRow.name,
                avatarText: refusedModalRow.avatarText,
                avatarUrl: refusedModalRow.avatarUrl,
              }
            : null
        }
        onConfirm={handleMarkRefused}
      />

      <ArchiveCaseModal
        open={archiveModalOpen}
        onOpenChange={setArchiveModalOpen}
        caseInfo={
          archiveModalRow
            ? {
                caseId: archiveModalRow.caseId,
                name: archiveModalRow.name,
                avatarText: archiveModalRow.avatarText,
                avatarUrl: archiveModalRow.avatarUrl,
              }
            : null
        }
        onConfirm={() => {
          if (archiveModalRow) {
            handleArchiveCase(archiveModalRow);
          }
        }}
      />

      <DeleteCaseModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        caseInfo={
          deleteModalRow
            ? {
                caseId: deleteModalRow.caseId,
                name: deleteModalRow.name,
                avatarText: deleteModalRow.avatarText,
                avatarUrl: deleteModalRow.avatarUrl,
              }
            : null
        }
        onConfirm={() => {
          if (deleteModalRow) {
            handleDeleteCase(deleteModalRow);
          }
        }}
      />

      <CaseActionModal
        open={actionModalOpen}
        onOpenChange={setActionModalOpen}
        row={actionModalRow}
        onSuccess={handleActionCompleted}
      />

      <EditGroupModal
        open={editGroupModalOpen}
        onOpenChange={setEditGroupModalOpen}
        groupName={selectedGroup || ""}
        onSave={handleUpdateGroupName}
      />
    </div>
  );
}
