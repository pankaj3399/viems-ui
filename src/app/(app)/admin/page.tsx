"use client";

import * as React from "react";
import {
  RiGroupLine,
  RiTimeLine,
  RiFileWarningLine,
  RiMore2Line,
  RiArrowUpDownLine,
  RiDeleteBinLine,
  RiMailSendLine,
  RiUserSettingsLine,
  RiSearchLine,
  RiCloseLine,
  RiFileCopyLine,
  RiRefreshLine,
} from "@remixicon/react";
import { toast } from "sonner";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { EditMemberModal, TeamMember } from "@/components/EditMemberModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

type SortField = "name" | "role" | "smsRole" | null;
type SortDirection = "asc" | "desc";
type FilterTab = "all" | "active" | "invited" | "sms";

const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Alex Marin",
    firstName: "Alex",
    lastName: "Marin",
    email: "alex.marin@viems.io",
    avatarText: "AM",
    role: "ADMIN",
    smsRole: "—",
    status: "active",
  },
  {
    id: "2",
    name: "Nathan Wood",
    firstName: "Nathan",
    lastName: "Wood",
    email: "nathan.wood@viems.io",
    avatarImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    avatarText: "NW",
    role: "AUTHORISING OFFICER",
    smsRole: "Level 1",
    status: "active",
  },
  {
    id: "3",
    name: "Sarah Kim",
    firstName: "Sarah",
    lastName: "Kim",
    email: "sarah.kim@viems.io",
    avatarText: "GS",
    role: "COMPLIANCE OFFICER",
    smsRole: "Level 2",
    status: "active",
  },
  {
    id: "4",
    name: "Elena Petrova",
    firstName: "Elena",
    lastName: "Petrova",
    email: "elena.petrova@viems.io",
    avatarText: "EP",
    role: "HR MANAGER",
    smsRole: "Level 2",
    status: "active",
  },
  {
    id: "5",
    name: "Ami Monarch",
    firstName: "Ami",
    lastName: "Monarch",
    email: "ami.monarch@viems.io",
    avatarText: "AM",
    role: "INVITED",
    smsRole: "View only",
    status: "invited",
  },
];

export default function AdminTeamPage() {
  const [members, setMembers] = React.useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilterTab, setActiveFilterTab] = React.useState<FilterTab>("all");
  const [sortField, setSortField] = React.useState<SortField>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc");

  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null);

  // 1. Fetch Real Team Members from Backend API
  const fetchEmployees = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<any>(ENDPOINTS.employees.base);
      const rawList = Array.isArray(response)
        ? response
        : response && Array.isArray(response.data)
        ? response.data
        : null;

      if (rawList && rawList.length > 0) {
        const transformed: TeamMember[] = rawList.map((emp: any) => {
          const fName = emp.firstName || emp.user?.personalInfo?.firstName || "";
          const lName = emp.lastName || emp.user?.personalInfo?.lastName || "";
          const fullName = `${fName} ${lName}`.trim() || emp.email || "Team Member";
          const initials = fullName
            .split(" ")
            .map((p: string) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          const jobTitle = (emp.jobTitle || emp.user?.role?.value || "COMPLIANCE OFFICER").toUpperCase();
          const userStatus = (emp.userStatus || emp.user?.status?.value || "active").toLowerCase();
          const isInvited = userStatus.includes("invite") || userStatus.includes("pending");

          let sms = "—";
          if (jobTitle.includes("AUTHORISING") || jobTitle.includes("LEVEL 1")) {
            sms = "Level 1";
          } else if (jobTitle.includes("COMPLIANCE") || jobTitle.includes("HR") || jobTitle.includes("LEVEL 2")) {
            sms = "Level 2";
          } else if (isInvited) {
            sms = "View only";
          }

          return {
            id: String(emp.id),
            name: fullName,
            firstName: fName,
            lastName: lName,
            email: emp.email || emp.user?.email || "member@viems.io",
            avatarText: initials || "TM",
            avatarImage: emp.avatar ? `/api/files/image/${emp.avatar}` : undefined,
            role: isInvited ? "INVITED" : jobTitle,
            smsRole: sms,
            status: isInvited ? "invited" : "active",
          };
        });

        setMembers(transformed);
      }
    } catch (err) {
      console.warn("Could not load backend employees, using initialized organization data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Dynamic Metrics calculation
  const activeMembersCount = React.useMemo(
    () => members.filter((m) => m.status === "active").length,
    [members]
  );
  const pendingInvitesCount = React.useMemo(
    () => members.filter((m) => m.status === "invited").length,
    [members]
  );
  const smsUsersCount = React.useMemo(
    () => members.filter((m) => m.smsRole && m.smsRole !== "—").length,
    [members]
  );

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter & Search
  const filteredAndSortedMembers = React.useMemo(() => {
    let result = members;

    // Filter Tab
    if (activeFilterTab === "active") {
      result = result.filter((m) => m.status === "active");
    } else if (activeFilterTab === "invited") {
      result = result.filter((m) => m.status === "invited");
    } else if (activeFilterTab === "sms") {
      result = result.filter((m) => m.smsRole && m.smsRole !== "—");
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.smsRole.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortField) {
      result = [...result].sort((a, b) => {
        let valA = "";
        let valB = "";
        if (sortField === "name") {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (sortField === "role") {
          valA = a.role.toLowerCase();
          valB = b.role.toLowerCase();
        } else if (sortField === "smsRole") {
          valA = a.smsRole.toLowerCase();
          valB = b.smsRole.toLowerCase();
        }
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [members, activeFilterTab, searchQuery, sortField, sortDirection]);

  // Actions
  const handleAddMember = (newMember: TeamMember) => {
    setMembers((prev) => [newMember, ...prev]);
  };

  const handleUpdateMember = (updated: TeamMember) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleRemoveMember = async (id: string, name: string) => {
    try {
      if (!isNaN(Number(id))) {
        await apiClient.delete(`${ENDPOINTS.employees.base}/to-archive/${id}`).catch((err) => {
          console.warn("Backend remove failed:", err);
        });
      }
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success(`Removed ${name} from organization team`);
    } catch {
      toast.error(`Failed to remove ${name}. Please try again.`);
    }
  };

  const handleResendInvite = async (email: string, id: string) => {
    try {
      if (!isNaN(Number(id))) {
        await apiClient.post(`${ENDPOINTS.employees.sendRegistrationLink}/${id}`).catch((err) => {
          console.warn("Backend resend failed:", err);
        });
      }
      toast.success(`Invitation email resent to ${email}`);
    } catch {
      toast.error(`Failed to resend invitation to ${email}`);
    }
  };

  const handleCopyEmail = (email: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(email);
      toast.success(`Copied ${email} to clipboard`);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    const r = role.toUpperCase();
    if (r === "ADMIN" || r.includes("ADMIN")) {
      return {
        bg: "bg-[#EFEBFF]",
        text: "text-[#7D52F4]",
      };
    }
    if (r === "INVITED") {
      return {
        bg: "bg-[#FFF3EB]",
        text: "text-[#F6B51E]",
      };
    }
    return {
      bg: "bg-[#EBF1FF]",
      text: "text-[#335CFF]",
    };
  };

  return (
    <div className="w-full flex flex-col font-sans text-[#171717] select-none bg-[#F7F7F7] min-h-full pb-[80px]">
      {/* ─── Top Page Header [Rectangle 7 & Section Header [1.1]] ─── */}
      <div className="bg-white rounded-t-[16px] border-b border-[#EBEBEB] flex flex-col shrink-0">
        <div className="px-6 md:px-[64px] py-[32px] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-aeonik-medium text-[24px] leading-[32px] text-[#171717]">
              Team
            </h1>
            <p className="text-[14px] leading-[20px] text-[#5C5C5C] font-normal tracking-[-0.006em]">
              Analytics and trends across your sponsorship cases and migrants.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchEmployees}
              className="size-9 bg-white border border-[#EBEBEB] rounded-[8px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 shadow-x-small transition-all cursor-pointer"
              title="Refresh Team Data"
              aria-label="Refresh team members list"
            >
              <RiRefreshLine className={`size-4.5 ${isLoading ? "animate-spin text-[#7D52F4]" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content Canvas ─── */}
      <div className="px-6 md:px-[64px] pt-[32px] flex flex-col gap-[32px] w-full max-w-[1232px] mx-auto">
        {/* ─── 3 Interactive Stat Metric Cards [Days] ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px] w-full">
          {/* Card 1: ACTIVE MEMBERS */}
          <button
            type="button"
            onClick={() => setActiveFilterTab(activeFilterTab === "active" ? "all" : "active")}
            className={`bg-white rounded-[8px] p-[16px] flex flex-col justify-between relative shadow-x-small border text-left cursor-pointer transition-all duration-200 min-h-[70px] ${
              activeFilterTab === "active"
                ? "border-[#171717] ring-2 ring-[#171717]/10"
                : "border-[#EBEBEB]/60 hover:border-[#171717]/40"
            }`}
          >
            <div className="flex flex-col gap-[2px] pr-8">
              <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717]">
                ACTIVE MEMBERS
              </span>
              <span className="font-aeonik-medium text-[24px] leading-[32px] text-[#171717]">
                {activeMembersCount}
              </span>
            </div>
            <RiGroupLine className="size-5 text-[#5C5C5C] absolute top-3 right-4 shrink-0" />
          </button>

          {/* Card 2: PENDING INVITES */}
          <button
            type="button"
            onClick={() => setActiveFilterTab(activeFilterTab === "invited" ? "all" : "invited")}
            className={`bg-white rounded-[8px] p-[16px] flex flex-col justify-between relative shadow-x-small border text-left cursor-pointer transition-all duration-200 min-h-[70px] ${
              activeFilterTab === "invited"
                ? "border-[#F6B51E] ring-2 ring-[#F6B51E]/20"
                : "border-[#EBEBEB]/60 hover:border-[#F6B51E]/40"
            }`}
          >
            <div className="flex flex-col gap-[2px] pr-8">
              <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717]">
                PENDING INVITES
              </span>
              <span className="font-aeonik-medium text-[24px] leading-[32px] text-[#171717]">
                {pendingInvitesCount}
              </span>
            </div>
            <RiTimeLine className="size-5 text-[#5C5C5C] absolute top-3 right-4 shrink-0" />
          </button>

          {/* Card 3: SMS USERS */}
          <button
            type="button"
            onClick={() => setActiveFilterTab(activeFilterTab === "sms" ? "all" : "sms")}
            className={`bg-white rounded-[8px] p-[16px] flex flex-col justify-between relative shadow-x-small border text-left cursor-pointer transition-all duration-200 min-h-[70px] ${
              activeFilterTab === "sms"
                ? "border-[#335CFF] ring-2 ring-[#335CFF]/20"
                : "border-[#EBEBEB]/60 hover:border-[#335CFF]/40"
            }`}
          >
            <div className="flex flex-col gap-[2px] pr-8">
              <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717]">
                SMS USERS
              </span>
              <span className="font-aeonik-medium text-[24px] leading-[32px] text-[#171717]">
                {smsUsersCount}
              </span>
            </div>
            <RiFileWarningLine className="size-5 text-[#5C5C5C] absolute top-3 right-4 shrink-0" />
          </button>
        </div>

        {/* ─── Members List Section [Frame 2087326847] ─── */}
        <div className="flex flex-col gap-[16px] w-full">
          {/* Section Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3">
              <h2 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717]">
                Members
              </h2>
              {activeFilterTab !== "all" && (
                <button
                  type="button"
                  onClick={() => setActiveFilterTab("all")}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#171717] text-white flex items-center gap-1 hover:bg-[#262626] transition-colors cursor-pointer"
                >
                  <span>Filter: {activeFilterTab.toUpperCase()}</span>
                  <RiCloseLine className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="w-[240px] md:w-[280px] h-9 bg-white border border-[#EBEBEB] rounded-[8px] px-3 flex items-center gap-2 shadow-x-small focus-within:border-[#171717] transition-all">
                <RiSearchLine className="size-4 text-[#A4A4A4] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members..."
                  className="w-full bg-transparent text-[13px] text-[#171717] placeholder:text-[#A4A4A4] border-0 outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-[#A4A4A4] hover:text-[#171717] cursor-pointer"
                  >
                    <RiCloseLine className="size-4" />
                  </button>
                )}
              </div>

              {/* Invite member Button */}
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="h-9 px-4 bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium rounded-[8px] shadow-x-small transition-all flex items-center justify-center cursor-pointer shrink-0"
              >
                Invite member
              </button>
            </div>
          </div>

          {/* Table Container [Frame 67] */}
          <div className="flex flex-col gap-[8px] w-full">
            {/* Table Header Row */}
            <div className="h-9 px-4 rounded-[8px] bg-[#F7F7F7] flex items-center text-[12px] font-medium uppercase tracking-[0.04em] text-[#A4A4A4]">
              {/* Member Column */}
              <div className="flex-1 min-w-[200px] px-3">
                <button
                  type="button"
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1.5 hover:text-[#171717] transition-colors border-0 bg-transparent p-0 cursor-pointer uppercase text-[12px] font-medium text-[#A4A4A4]"
                >
                  <span>MEMBER</span>
                  <RiArrowUpDownLine className="size-4 shrink-0" />
                </button>
              </div>

              {/* Role Column */}
              <div className="flex-1 min-w-[160px] px-3">
                <button
                  type="button"
                  onClick={() => handleSort("role")}
                  className="flex items-center gap-1.5 hover:text-[#171717] transition-colors border-0 bg-transparent p-0 cursor-pointer uppercase text-[12px] font-medium text-[#A4A4A4]"
                >
                  <span>ROLE</span>
                  <RiArrowUpDownLine className="size-4 shrink-0" />
                </button>
              </div>

              {/* SMS Role Column */}
              <div className="flex-1 min-w-[160px] px-3">
                <button
                  type="button"
                  onClick={() => handleSort("smsRole")}
                  className="flex items-center gap-1.5 hover:text-[#171717] transition-colors border-0 bg-transparent p-0 cursor-pointer uppercase text-[12px] font-medium text-[#A4A4A4]"
                >
                  <span>SMS ROLE</span>
                  <RiArrowUpDownLine className="size-4 shrink-0" />
                </button>
              </div>

              {/* Actions Column Spacer */}
              <div className="w-[48px] shrink-0" />
            </div>

            {/* Table Rows [Frame 68] */}
            <div className="flex flex-col gap-[4px] w-full">
              {filteredAndSortedMembers.length === 0 ? (
                <div className="w-full bg-white rounded-[16px] p-12 border border-[#EBEBEB] shadow-x-small flex flex-col items-center justify-center text-center gap-3">
                  <div className="size-12 rounded-full bg-neutral-100 flex items-center justify-center text-[#5C5C5C]">
                    <RiGroupLine className="size-6" />
                  </div>
                  <h3 className="text-[16px] font-medium text-[#171717] font-aeonik-medium">
                    No team members found
                  </h3>
                  <p className="text-[13px] text-[#5C5C5C] max-w-sm">
                    {searchQuery || activeFilterTab !== "all"
                      ? "No team members matched your current filter criteria."
                      : "Start building your team by inviting your first collaborator."}
                  </p>
                  {searchQuery || activeFilterTab !== "all" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveFilterTab("all");
                      }}
                      className="mt-2 text-[13px] font-medium text-[#7D52F4] hover:underline cursor-pointer"
                    >
                      Reset filters
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsInviteModalOpen(true)}
                      className="mt-2 h-9 px-4 bg-[#171717] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] shadow-x-small transition-all cursor-pointer"
                    >
                      Invite Member
                    </button>
                  )}
                </div>
              ) : (
                filteredAndSortedMembers.map((member) => {
                  const badge = getRoleBadgeStyle(member.role);

                  return (
                    <div
                      key={member.id}
                      className="h-[72px] bg-white rounded-[16px] p-1 border border-[#EBEBEB]/40 shadow-x-small hover:border-[#EBEBEB] transition-all flex items-center"
                    >
                      {/* Member Info Cell */}
                      <div className="flex-1 min-w-[200px] px-3 flex items-center gap-3">
                        {member.avatarImage ? (
                          <Avatar className="size-10 rounded-full shrink-0">
                            <AvatarImage src={member.avatarImage} alt={member.name} />
                            <AvatarFallback className="bg-[#CAC0FF] text-[#351A75] font-medium text-[16px]">
                              {member.avatarText || "NW"}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="size-10 rounded-full bg-[#CAC0FF] text-[#351A75] font-medium text-[16px] flex items-center justify-center shrink-0">
                            {member.avatarText || "AM"}
                          </div>
                        )}

                        <div className="flex flex-col min-w-0">
                          <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em] truncate">
                            {member.name}
                          </span>
                          <span className="text-[12px] text-[#5C5C5C] leading-[16px] truncate">
                            {member.email}
                          </span>
                        </div>
                      </div>

                      {/* Role Cell */}
                      <div className="flex-1 min-w-[160px] px-3 flex items-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[12px] ${badge.bg} ${badge.text}`}
                        >
                          {member.role}
                        </span>
                      </div>

                      {/* SMS Role Cell */}
                      <div className="flex-1 min-w-[160px] px-3 flex items-center">
                        <span className="text-[14px] text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
                          {member.smsRole}
                        </span>
                      </div>

                      {/* Action 3-dots Menu Cell */}
                      <div className="w-[48px] shrink-0 flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="size-7 rounded-[6px] hover:bg-neutral-100 flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0 bg-transparent outline-none">
                            <RiMore2Line className="size-4.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white border border-[#EBEBEB] rounded-[10px] shadow-card-large p-1 min-w-[170px] z-50"
                          >
                            <DropdownMenuItem
                              onClick={() => setEditingMember(member)}
                              className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#171717] hover:bg-neutral-50 rounded-[6px] cursor-pointer"
                            >
                              <RiUserSettingsLine className="size-4 text-[#5C5C5C]" />
                              <span>Edit Permissions</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleCopyEmail(member.email)}
                              className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#171717] hover:bg-neutral-50 rounded-[6px] cursor-pointer"
                            >
                              <RiFileCopyLine className="size-4 text-[#5C5C5C]" />
                              <span>Copy Email</span>
                            </DropdownMenuItem>

                            {member.status === "invited" && (
                              <DropdownMenuItem
                                onClick={() => handleResendInvite(member.email, member.id)}
                                className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#171717] hover:bg-neutral-50 rounded-[6px] cursor-pointer"
                              >
                                <RiMailSendLine className="size-4 text-[#5C5C5C]" />
                                <span>Resend Invite</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="my-1 border-t border-[#EBEBEB]" />

                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#FB3748] hover:bg-red-50 rounded-[6px] cursor-pointer"
                            >
                              <RiDeleteBinLine className="size-4 text-[#FB3748]" />
                              <span>Remove Member</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Member Modal Dialog */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSendInvite={handleAddMember}
      />

      {/* Edit Member Modal Dialog */}
      <EditMemberModal
        isOpen={!!editingMember}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onUpdateMember={handleUpdateMember}
      />
    </div>
  );
}
