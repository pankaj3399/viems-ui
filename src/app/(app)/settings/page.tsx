"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  RiUserLine,
  RiUserFill,
  RiLock2Line,
  RiLockFill,
  RiNotification2Line,
  RiNotification3Fill,
  RiListSettingsLine,
  RiSettings3Fill,
  RiUserSettingsLine,
  RiGroupFill,
  RiGroupLine,
  RiCalendarLine,
  RiMore2Line,
  RiFileCopyLine,
  RiMailSendLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiSearchLine,
  RiCloseLine,
} from "@remixicon/react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { UserProfileResponse, UserSettingsResponse, EmployeeResponse } from "@/types/api";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { EditMemberModal, TeamMember } from "@/components/EditMemberModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

type SettingsTab = "PROFILE" | "SECURITY" | "NOTIFICATIONS" | "PREFERENCES" | "TEAM";

// ─── Custom Switch Component matching AlignUI / Figma EXACTLY ──────────────
function SettingsSwitch({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative w-[33px] h-[20px] cursor-pointer shrink-0 outline-none disabled:opacity-50 disabled:cursor-not-allowed group hover:opacity-95 transition-opacity focus-visible:ring-2 focus-visible:ring-[#7D52F4]/50 rounded-full border-0 bg-transparent p-0"
    >
      {/* Track: 28px x 16px */}
      <span
        className={`absolute rounded-full transition-all duration-200 group-hover:brightness-95 ${
          checked ? "bg-[#7D52F4]" : "bg-[#EBEBEB] group-hover:bg-[#E0E0E0]"
        }`}
        style={{
          width: 28,
          height: 16,
          top: 2,
          left: 2.5,
        }}
      />
      {/* Thumb: 12px x 12px white circle */}
      <span
        className="absolute rounded-full bg-white flex items-center justify-center transition-all duration-200 shadow-[0px_4px_8px_rgba(27,28,29,0.06),0px_2px_4px_rgba(14,18,27,0.08)]"
        style={{
          width: 12,
          height: 12,
          top: 4,
          left: checked ? 16.5 : 4.5,
        }}
      >
        {/* Inner Dot: 4px x 4px */}
        <span
          className={`w-1 h-1 rounded-full transition-colors duration-200 ${
            checked ? "bg-[#7D52F4]" : "bg-[#EBEBEB]"
          }`}
        />
      </span>
    </button>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state synced with URL query param
  const tabParam = searchParams.get("tab")?.toUpperCase() as SettingsTab | undefined;
  const initialTab: SettingsTab =
    tabParam && ["PROFILE", "SECURITY", "NOTIFICATIONS", "PREFERENCES", "TEAM"].includes(tabParam)
      ? tabParam
      : "PROFILE";

  const [activeTab, setActiveTab] = React.useState<SettingsTab>(initialTab);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.replace(`/settings?tab=${tab.toLowerCase()}`, { scroll: false });
  };

  React.useEffect(() => {
    if (tabParam && ["PROFILE", "SECURITY", "NOTIFICATIONS", "PREFERENCES", "TEAM"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Profile Form States
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [timezone, setTimezone] = React.useState("(UTC) Edinburgh, London");
  const [dateFormat, setDateFormat] = React.useState("Month, Day Year");
  const [language, setLanguage] = React.useState("English (UK)");

  // Timezone options from backend
  const [timezoneOptions, setTimezoneOptions] = React.useState<Array<{ id: string; name: string }>>([
    { id: "1", name: "(UTC) Edinburgh, London" },
    { id: "2", name: "(UTC -05:00) New York" },
    { id: "3", name: "(UTC +01:00) Paris, Berlin" },
    { id: "4", name: "(UTC +05:30) Mumbai, New Delhi" },
    { id: "5", name: "(UTC +08:00) Singapore, Beijing" },
    { id: "6", name: "(UTC +09:00) Tokyo" },
    { id: "7", name: "(UTC +10:00) Sydney" },
  ]);

  // Security Form States
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Email Digest Frequency
  const [digestFrequency, setDigestFrequency] = React.useState<"Real-time" | "Daily" | "Weekly" | "Off">("Real-time");

  // Notification Channel Toggles [email, push]
  const [notifMentions, setNotifMentions] = React.useState<[boolean, boolean]>([true, true]);
  const [notifStatusChanges, setNotifStatusChanges] = React.useState<[boolean, boolean]>([true, true]);
  const [notifUrgentAlerts, setNotifUrgentAlerts] = React.useState<[boolean, boolean]>([true, true]);
  const [notifExpiryWarnings, setNotifExpiryWarnings] = React.useState<[boolean, boolean]>([false, true]);
  const [notifMigrantActions, setNotifMigrantActions] = React.useState<[boolean, boolean]>([true, false]);
  const [notifDocUploads, setNotifDocUploads] = React.useState<[boolean, boolean]>([false, false]);
  const [notifReminders, setNotifReminders] = React.useState<[boolean, boolean]>([true, true]);
  const [notifSystem, setNotifSystem] = React.useState<[boolean, boolean]>([true, true]);

  // Team & Roles State
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = React.useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = React.useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null);
  const [memberToRemove, setMemberToRemove] = React.useState<{ id: string; name: string } | null>(null);

  const [currentUserId, setCurrentUserId] = React.useState<number | string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Snapshot for restoring state on Cancel
  const [profileSnapshot, setProfileSnapshot] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    avatarUrl: null as string | null,
    timezone: "(UTC) Edinburgh, London",
    dateFormat: "Month, Day Year",
    language: "English (UK)",
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 1. Fetch current user info and settings from NestJS backend API
  React.useEffect(() => {
    async function fetchUserSettings() {
      try {
        setLoading(true);
        // Fetch user profile info
        try {
          const userRes = await apiClient.get<UserProfileResponse>(ENDPOINTS.users.userInfo);
          if (userRes) {
            if (userRes.id) setCurrentUserId(userRes.id);
            const fn = userRes.first_name || userRes.firstName || firstName;
            const ln = userRes.last_name || userRes.lastName || lastName;
            const em = userRes.email || email;
            const ph = userRes.phone || userRes.personalInfo?.workPhone || phone;
            const db = userRes.dob || userRes.personalInfo?.dateOfBirth || dob;
            const gn = userRes.gender || userRes.personalInfo?.sex || gender;
            const av =
              userRes.avatar &&
              userRes.avatar !== "undefined" &&
              userRes.avatar !== "null"
                ? `/api/files/image/${userRes.avatar}`
                : null;

            setFirstName(fn);
            setLastName(ln);
            setEmail(em);
            setPhone(ph);
            setDob(db);
            setGender(gn);
            if (av) setAvatarUrl(av);

            setProfileSnapshot((prev) => ({
              ...prev,
              firstName: fn,
              lastName: ln,
              email: em,
              phone: ph,
              dob: db,
              gender: gn,
              avatarUrl: av,
            }));
          }
        } catch (err) {
          console.warn("Could not load backend profile info:", err);
        }

        // Fetch timezones from backend
        try {
          const tzRes = await apiClient.get<any>(ENDPOINTS.users.settings);
          if (Array.isArray(tzRes) && tzRes.length > 0) {
            const mapped = tzRes.map((t: any) => ({
              id: String(t.id),
              name: t.name || t.content || `(UTC) Timezone ${t.id}`,
            }));
            setTimezoneOptions(mapped);
            if (mapped[0]) {
              setTimezone(mapped[0].name);
              setProfileSnapshot((prev) => ({ ...prev, timezone: mapped[0].name }));
            }
          } else if (tzRes && typeof tzRes === "object") {
            if (tzRes.timezone) {
              setTimezone(tzRes.timezone);
              setProfileSnapshot((prev) => ({ ...prev, timezone: tzRes.timezone }));
            }
            if (tzRes.dateFormat) {
              setDateFormat(tzRes.dateFormat);
              setProfileSnapshot((prev) => ({ ...prev, dateFormat: tzRes.dateFormat }));
            }
          }
        } catch (err) {
          console.warn("Using standard timezones list:", err);
        }

        // Fetch & validate notification preferences from settings endpoint
        try {
          const settingsRes = await apiClient.get<UserSettingsResponse>(ENDPOINTS.users.settings);
          if (settingsRes) {
            if (settingsRes.id) setCurrentUserId(settingsRes.id);
            if (settingsRes.digestFrequency && ["Real-time", "Daily", "Weekly", "Off"].includes(settingsRes.digestFrequency)) {
              setDigestFrequency(settingsRes.digestFrequency);
            }
            if (Array.isArray(settingsRes.notifMentions) && settingsRes.notifMentions.length === 2) {
              setNotifMentions([Boolean(settingsRes.notifMentions[0]), Boolean(settingsRes.notifMentions[1])]);
            }
            if (Array.isArray(settingsRes.notifStatusChanges) && settingsRes.notifStatusChanges.length === 2) {
              setNotifStatusChanges([Boolean(settingsRes.notifStatusChanges[0]), Boolean(settingsRes.notifStatusChanges[1])]);
            }
            if (Array.isArray(settingsRes.notifUrgentAlerts) && settingsRes.notifUrgentAlerts.length === 2) {
              setNotifUrgentAlerts([Boolean(settingsRes.notifUrgentAlerts[0]), Boolean(settingsRes.notifUrgentAlerts[1])]);
            }
            if (Array.isArray(settingsRes.notifExpiryWarnings) && settingsRes.notifExpiryWarnings.length === 2) {
              setNotifExpiryWarnings([Boolean(settingsRes.notifExpiryWarnings[0]), Boolean(settingsRes.notifExpiryWarnings[1])]);
            }
            if (Array.isArray(settingsRes.notifMigrantActions) && settingsRes.notifMigrantActions.length === 2) {
              setNotifMigrantActions([Boolean(settingsRes.notifMigrantActions[0]), Boolean(settingsRes.notifMigrantActions[1])]);
            }
            if (Array.isArray(settingsRes.notifDocUploads) && settingsRes.notifDocUploads.length === 2) {
              setNotifDocUploads([Boolean(settingsRes.notifDocUploads[0]), Boolean(settingsRes.notifDocUploads[1])]);
            }
            if (Array.isArray(settingsRes.notifReminders) && settingsRes.notifReminders.length === 2) {
              setNotifReminders([Boolean(settingsRes.notifReminders[0]), Boolean(settingsRes.notifReminders[1])]);
            }
            if (Array.isArray(settingsRes.notifSystem) && settingsRes.notifSystem.length === 2) {
              setNotifSystem([Boolean(settingsRes.notifSystem[0]), Boolean(settingsRes.notifSystem[1])]);
            }
          }
        } catch (err) {
          console.warn("Using default settings profile:", err);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchUserSettings();
  }, []);

  // 2. Fetch Team Members when Team tab is active
  const fetchTeamMembers = React.useCallback(async () => {
    setIsLoadingTeam(true);
    try {
      const response = await apiClient.get<EmployeeResponse[] | { data: EmployeeResponse[] }>(
        ENDPOINTS.employees.base
      );
      const rawList = Array.isArray(response)
        ? response
        : response && Array.isArray(response.data)
        ? response.data
        : null;

      if (rawList !== null) {
        const transformed: TeamMember[] = rawList.map((emp: EmployeeResponse) => {
          const fName = emp.firstName || emp.user?.personalInfo?.firstName || "";
          const lName = emp.lastName || emp.user?.personalInfo?.lastName || "";
          const fullName = `${fName} ${lName}`.trim() || emp.email || "Team Member";
          const initials = getInitials(fullName) || "TM";

          const jobTitle = emp.jobTitle || emp.user?.role?.value || "";
          const userStatus = (emp.userStatus || emp.user?.status?.value || "active").toLowerCase();
          const isInvited = userStatus.includes("invite") || userStatus.includes("pending");

          return {
            id: String(emp.id),
            name: fullName,
            firstName: fName,
            lastName: lName,
            email: emp.email || emp.user?.email || "",
            avatarText: initials,
            avatarImage: emp.avatar ? `/api/files/image/${emp.avatar}` : undefined,
            role: isInvited ? "INVITED" : (jobTitle ? jobTitle.toUpperCase() : "—"),
            smsRole: emp.smsRole || "—",
            status: isInvited ? "invited" : "active",
          };
        });
        setTeamMembers(transformed);
      }
    } catch (err) {
      console.warn("Could not load backend employees:", err);
    } finally {
      setIsLoadingTeam(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === "TEAM") {
      fetchTeamMembers();
    }
  }, [activeTab, fetchTeamMembers]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file exceeds 5MB size limit.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast.error("Please upload a valid JPG or PNG image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setAvatarUrl(base64Data);
      try {
        await apiClient.patch(ENDPOINTS.users.profile, {
          personal: {
            avatar: base64Data,
          },
        });
        toast.success("Profile photo updated successfully.");
      } catch {
        toast.success("Photo selected.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCancelProfile = () => {
    setFirstName(profileSnapshot.firstName);
    setLastName(profileSnapshot.lastName);
    setEmail(profileSnapshot.email);
    setPhone(profileSnapshot.phone);
    setDob(profileSnapshot.dob);
    setGender(profileSnapshot.gender);
    setAvatarUrl(profileSnapshot.avatarUrl);
    setTimezone(profileSnapshot.timezone);
    setDateFormat(profileSnapshot.dateFormat);
    setLanguage(profileSnapshot.language);
    toast.info("Changes reverted.");
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || saving) return;
    if (activeTab === "TEAM") return;

    setSaving(true);
    try {
      if (activeTab === "PROFILE") {
        await apiClient.patch(ENDPOINTS.users.profile, {
          personal: {
            firstName,
            lastName,
            gender,
            dateOfBirth: dob,
            workPhone: phone,
          },
        });
        const patchUrl = currentUserId ? ENDPOINTS.users.settingsById(currentUserId) : ENDPOINTS.users.settings;
        await apiClient.patch(patchUrl, {
          timezone,
          dateFormat,
        }).catch(() => null);

        setProfileSnapshot({
          firstName,
          lastName,
          email,
          phone,
          dob,
          gender,
          avatarUrl,
          timezone,
          dateFormat,
          language,
        });
        toast.success("Profile updated successfully.");
      } else if (activeTab === "SECURITY") {
        if (!currentPassword) {
          toast.error("Please enter your current password.");
          setSaving(false);
          return;
        }
        if (!newPassword || newPassword.length < 12) {
          toast.error("New password must be at least 12 characters.");
          setSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          toast.error("New passwords do not match.");
          setSaving(false);
          return;
        }
        const patchUrl = currentUserId ? ENDPOINTS.users.settingsById(currentUserId) : ENDPOINTS.users.settings;
        await apiClient.patch(patchUrl, {
          currentPassword,
          newPassword,
          confirmPassword,
        }).catch(async () => {
          await apiClient.post(ENDPOINTS.auth.newPassword, {
            currentPassword,
            newPassword,
            confirmPassword,
          });
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password updated successfully.");
      } else if (activeTab === "NOTIFICATIONS") {
        const patchUrl = currentUserId ? ENDPOINTS.users.settingsById(currentUserId) : ENDPOINTS.users.settings;
        await apiClient.patch(patchUrl, {
          digestFrequency,
          notifMentions,
          notifStatusChanges,
          notifUrgentAlerts,
          notifExpiryWarnings,
          notifMigrantActions,
          notifDocUploads,
          notifReminders,
          notifSystem,
        });
        toast.success("Notification preferences saved.");
      } else if (activeTab === "PREFERENCES") {
        const patchUrl = currentUserId ? ENDPOINTS.users.settingsById(currentUserId) : ENDPOINTS.users.settings;
        await apiClient.patch(patchUrl, {
          language,
        });
        toast.success("Preferences updated successfully.");
      } else {
        toast.success("Settings updated.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings.";
      console.error("Save settings error:", err);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // Team Actions
  const handleAddTeamMember = (newMember: TeamMember) => {
    setTeamMembers((prev) => [newMember, ...prev]);
  };

  const handleUpdateTeamMember = (updated: TeamMember) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleRemoveTeamMember = async (id: string, name: string) => {
    try {
      if (!isNaN(Number(id))) {
        await apiClient.delete(`${ENDPOINTS.employees.base}/to-archive/${id}`);
      }
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success(`Removed ${name} from organization team`);
    } catch {
      toast.error(`Failed to remove ${name}. Please try again.`);
    }
  };

  const handleResendInvite = async (email: string, id: string) => {
    try {
      if (!isNaN(Number(id))) {
        await apiClient.post(`${ENDPOINTS.employees.sendRegistrationLink}/${id}`);
      }
      toast.success(`Invitation email resent to ${email}`);
    } catch {
      toast.error(`Failed to resend invitation to ${email}`);
    }
  };

  const handleCopyEmail = async (emailToCopy: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(emailToCopy);
        toast.success(`Copied ${emailToCopy} to clipboard`);
      } catch {
        toast.error("Failed to copy email to clipboard");
      }
    }
  };

  const filteredTeamMembers = React.useMemo(() => {
    if (!teamSearchQuery.trim()) return teamMembers;
    const q = teamSearchQuery.toLowerCase().trim();
    return teamMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }, [teamMembers, teamSearchQuery]);

  const avatarInitials =
    (((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase().trim()) || "AM";

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
    <div className="w-full min-h-full bg-[#F5F5F5] text-[#171717] font-sans pb-[80px]">
      {/* ─── Top Page Header [Section Header 1.1] ─── */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#EBEBEB] rounded-t-[16px] px-6 md:px-[64px] py-[32px] shrink-0">
        <div className="max-w-[1232px] mx-auto flex flex-col gap-1">
          <h1 className="font-aeonik-medium text-[24px] leading-[32px] font-medium text-[#171717] tracking-[-0.01em]">
            Settings
          </h1>
          <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
            Create, track, and manage visa cases for individual or grouped applicants.
          </p>
        </div>
      </div>

      {/* ─── Main Content Canvas ─── */}
      <div className="max-w-[1232px] mx-auto px-6 md:px-[64px] pt-[32px]">
        <div className="grid grid-cols-1 md:grid-cols-[252px_1fr] gap-[40px] items-start">
          {/* ─── Tab Menu Horizontal [1.1] ─── */}
          <nav className="sticky top-[152px] self-start flex flex-col gap-[24px] pt-1 shrink-0" aria-label="Settings navigation">
            {/* Profile Tab */}
            <button
              type="button"
              onClick={() => handleTabChange("PROFILE")}
              className={`flex items-center gap-[6px] text-left cursor-pointer transition-colors outline-none group border-0 bg-transparent p-0 ${
                activeTab === "PROFILE" ? "text-[#171717]" : "text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              {activeTab === "PROFILE" ? (
                <RiUserFill className="size-5 text-[#171717] shrink-0" />
              ) : (
                <RiUserLine className="size-5 text-[#5C5C5C] group-hover:text-[#171717] shrink-0 transition-colors" />
              )}
              <span className="text-[14px] font-medium leading-[20px] tracking-[-0.006em]">
                Profile
              </span>
            </button>

            {/* Security Tab */}
            <button
              type="button"
              onClick={() => handleTabChange("SECURITY")}
              className={`flex items-center gap-[6px] text-left cursor-pointer transition-colors outline-none group border-0 bg-transparent p-0 ${
                activeTab === "SECURITY" ? "text-[#171717]" : "text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              {activeTab === "SECURITY" ? (
                <RiLockFill className="size-5 text-[#171717] shrink-0" />
              ) : (
                <RiLock2Line className="size-5 text-[#5C5C5C] group-hover:text-[#171717] shrink-0 transition-colors" />
              )}
              <span className="text-[14px] font-medium leading-[20px] tracking-[-0.006em]">
                Security
              </span>
            </button>

            {/* Notifications Tab */}
            <button
              type="button"
              onClick={() => handleTabChange("NOTIFICATIONS")}
              className={`flex items-center gap-[6px] text-left cursor-pointer transition-colors outline-none group border-0 bg-transparent p-0 ${
                activeTab === "NOTIFICATIONS" ? "text-[#171717]" : "text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              {activeTab === "NOTIFICATIONS" ? (
                <RiNotification3Fill className="size-5 text-[#171717] shrink-0" />
              ) : (
                <RiNotification2Line className="size-5 text-[#5C5C5C] group-hover:text-[#171717] shrink-0 transition-colors" />
              )}
              <span className="text-[14px] font-medium leading-[20px] tracking-[-0.006em]">
                Notifications
              </span>
            </button>

            {/* Preferences Tab */}
            <button
              type="button"
              onClick={() => handleTabChange("PREFERENCES")}
              className={`flex items-center gap-[6px] text-left cursor-pointer transition-colors outline-none group border-0 bg-transparent p-0 ${
                activeTab === "PREFERENCES" ? "text-[#171717]" : "text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              {activeTab === "PREFERENCES" ? (
                <RiSettings3Fill className="size-5 text-[#171717] shrink-0" />
              ) : (
                <RiListSettingsLine className="size-5 text-[#5C5C5C] group-hover:text-[#171717] shrink-0 transition-colors" />
              )}
              <span className="text-[14px] font-medium leading-[20px] tracking-[-0.006em]">
                Preferences
              </span>
            </button>

            {/* Team & Roles Tab */}
            <button
              type="button"
              onClick={() => handleTabChange("TEAM")}
              className={`flex items-center gap-[6px] text-left cursor-pointer transition-colors outline-none group border-0 bg-transparent p-0 ${
                activeTab === "TEAM" ? "text-[#171717]" : "text-[#5C5C5C] hover:text-[#171717]"
              }`}
            >
              {activeTab === "TEAM" ? (
                <RiGroupFill className="size-5 text-[#171717] shrink-0" />
              ) : (
                <RiUserSettingsLine className="size-5 text-[#5C5C5C] group-hover:text-[#171717] shrink-0 transition-colors" />
              )}
              <span className="text-[14px] font-medium leading-[20px] tracking-[-0.006em]">
                Team & Roles
              </span>
            </button>
          </nav>

          {/* ─── Right Content Form Views [Widgets 1.1] ─── */}
          <div className="w-full max-w-[916px]">
            {/* ════════════════ PROFILE TAB ════════════════ */}
            {activeTab === "PROFILE" && (
              <form onSubmit={handleSaveSettings} className="flex flex-col gap-[32px]">
                {/* 1. Personal Information Widget */}
                <div className="flex flex-col gap-[24px]">
                  {/* Header */}
                  <h2 className="font-aeonik-medium text-[20px] leading-[32px] font-medium text-[#171717]">
                    Personal information
                  </h2>

                  {/* Card Body */}
                  <div className="bg-white rounded-[16px] p-[32px] border border-[#EBEBEB] shadow-x-small flex flex-col gap-[24px]">
                    {/* Banner / Avatar Section */}
                    <div className="flex items-center gap-[16px] py-[12px]">
                      {/* 80x80 Avatar Circle */}
                      <div className="size-20 rounded-full bg-[#EBEBEB] text-[#171717] font-medium text-[12px] flex items-center justify-center shrink-0 overflow-hidden select-none">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt=""
                            onError={() => setAvatarUrl(null)}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="font-medium text-[#171717] text-[12px] tracking-tight">AM</span>
                        )}
                      </div>

                      {/* Info & Upload Button */}
                      <div className="flex items-center gap-[32px]">
                        <div className="flex flex-col gap-[6px]">
                          <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]">
                            Upload photo
                          </span>
                          <span className="text-[13px] font-normal text-[#171717] leading-[20px] tracking-[-0.006em]">
                            JPG, PNG, Max 5MB
                          </span>
                        </div>

                        {/* ui-native-ok: Label used as file upload button trigger */}
                        <Label
                          htmlFor="settings-photo-upload"
                          className="h-[36px] px-[16px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] rounded-[8px] text-[14px] font-medium tracking-[-0.006em] transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        >
                          Upload photo
                          {/* ui-native-ok: Hidden file input for custom styled upload button */}
                          <input
                            id="settings-photo-upload"
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </Label>
                      </div>
                    </div>

                    {/* Inputs Grid (2 Columns, 24px gap) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[24px] gap-y-[24px]">
                      {/* First Name */}
                      <div className="flex flex-col gap-[4px]">
                        <Label
                          htmlFor="settings-first-name"
                          className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]"
                        >
                          First Name
                        </Label>
                        <Input
                          id="settings-first-name"
                          type="text"
                          disabled={loading}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Alex"
                          className="w-full h-[40px] px-[12px] text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] shadow-x-small outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4]/20 transition-all placeholder:text-[#A4A4A4] disabled:opacity-50"
                        />
                      </div>

                      {/* Last Name */}
                      <div className="flex flex-col gap-[4px]">
                        <Label
                          htmlFor="settings-last-name"
                          className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]"
                        >
                          Last Name
                        </Label>
                        <Input
                          id="settings-last-name"
                          type="text"
                          disabled={loading}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Marin"
                          className="w-full h-[40px] px-[12px] text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] shadow-x-small outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4]/20 transition-all placeholder:text-[#A4A4A4] disabled:opacity-50"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div className="flex flex-col gap-[4px]">
                        <Label
                          htmlFor="settings-dob"
                          className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]"
                        >
                          Date of Birth
                        </Label>
                        <div className="relative flex items-center">
                          <RiCalendarLine className="size-5 text-[#A4A4A4] absolute left-[12px] pointer-events-none z-10" />
                          <Input
                            id="settings-dob"
                            type="date"
                            disabled={loading}
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            placeholder="YYYY-MM-DD"
                            className="w-full h-[40px] pl-[40px] pr-[12px] text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] shadow-x-small outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4]/20 transition-all placeholder:text-[#A4A4A4] disabled:opacity-50"
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="flex flex-col gap-[4px]">
                        <Label
                          htmlFor="settings-gender"
                          className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]"
                        >
                          Gender
                        </Label>
                        <Select value={gender} onValueChange={(val) => { if (val) setGender(val); }}>
                          <SelectTrigger
                            id="settings-gender"
                            className="w-full h-[40px] px-[12px] text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] shadow-x-small font-normal"
                          >
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-[#EBEBEB] rounded-[10px] shadow-card-large z-50">
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Non-binary">Non-binary</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Email Address */}
                      <div className="flex flex-col gap-[4px]">
                        <Label
                          htmlFor="settings-email"
                          className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]"
                        >
                          Email Address
                        </Label>
                        <Input
                          id="settings-email"
                          type="email"
                          value={email}
                          disabled
                          className="w-full h-[40px] px-[12px] text-[14px] text-[#5C5C5C] bg-[#F5F5F5] border border-transparent rounded-[10px] cursor-not-allowed outline-none font-normal"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="flex flex-col gap-[4px]">
                        <Label
                          htmlFor="settings-phone"
                          className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]"
                        >
                          Phone Number
                        </Label>
                        <Input
                          id="settings-phone"
                          type="text"
                          disabled={loading}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +1 555-555-5555"
                          className="w-full h-[40px] px-[12px] text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] shadow-x-small outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4]/20 transition-all placeholder:text-[#A4A4A4] disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Timezone Widget */}
                <div className="flex flex-col gap-[24px]">
                  {/* Header */}
                  <h2 className="font-aeonik-medium text-[20px] leading-[32px] font-medium text-[#171717]">
                    Timezone
                  </h2>

                  {/* Card Body */}
                  <div className="bg-white rounded-[16px] p-[32px] border border-[#EBEBEB] shadow-x-small flex flex-col gap-[24px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[24px] gap-y-[24px]">
                      {/* Timezone Select */}
                      <div className="flex flex-col gap-[4px]">
                        <Label
                          htmlFor="settings-timezone"
                          className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]"
                        >
                          Timezone
                        </Label>
                        <Select value={timezone} onValueChange={(val) => { if (val) setTimezone(val); }}>
                          <SelectTrigger
                            id="settings-timezone"
                            className="w-full h-[40px] px-[12px] text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] shadow-x-small font-normal"
                          >
                            <SelectValue placeholder="Select Timezone" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-[#EBEBEB] rounded-[10px] shadow-card-large z-50">
                            {timezoneOptions.map((tz) => (
                              <SelectItem key={tz.id} value={tz.name}>
                                {tz.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date Format Select */}
                      <div className="flex flex-col gap-[4px]">
                        <Label
                          htmlFor="settings-date-format"
                          className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]"
                        >
                          Date Format
                        </Label>
                        <Select value={dateFormat} onValueChange={(val) => { if (val) setDateFormat(val); }}>
                          <SelectTrigger
                            id="settings-date-format"
                            className="w-full h-[40px] px-[12px] text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] shadow-x-small font-normal"
                          >
                            <SelectValue placeholder="Select Date Format" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-[#EBEBEB] rounded-[10px] shadow-card-large z-50">
                            <SelectItem value="Month, Day Year">Month, Day Year</SelectItem>
                            <SelectItem value="DD / MM / YYYY">DD / MM / YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Footer Action Buttons */}
                <div className="flex items-center justify-end gap-[12px] pt-[8px]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelProfile}
                    className="h-[36px] px-[16px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] rounded-[8px] text-[14px] font-medium tracking-[-0.006em] border-0 transition-colors cursor-pointer flex items-center justify-center shadow-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || saving}
                    className="h-[36px] px-[20px] bg-[#171717] hover:bg-[#262626] text-white rounded-[8px] text-[14px] font-medium tracking-[-0.006em] transition-colors cursor-pointer shadow-x-small disabled:opacity-50 flex items-center justify-center"
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            )}

            {/* ════════════════ SECURITY TAB [Settings/Security] ════════════════ */}
            {activeTab === "SECURITY" && (
              <form onSubmit={handleSaveSettings} className="flex flex-col gap-[32px]">
                <div className="flex flex-col gap-[24px]">
                  {/* Header: Change password */}
                  <h2 className="font-aeonik-medium text-[20px] leading-[32px] font-medium text-[#171717]">
                    Change password
                  </h2>

                  {/* White Card: Frame 2087326843 */}
                  <div className="bg-white rounded-[16px] p-[32px] border border-[#EBEBEB] shadow-x-small flex flex-col gap-[24px]">
                    {/* Current Password */}
                    <div className="flex flex-col gap-[4px]">
                      <Label
                        htmlFor="security-current-password"
                        className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]"
                      >
                        Current Password
                      </Label>
                      <Input
                        id="security-current-password"
                        type="password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full h-[40px] px-[12px] text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] shadow-x-small outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4]/20 transition-all placeholder:text-[#A4A4A4]"
                      />
                    </div>

                    {/* New Password */}
                    <div className="flex flex-col gap-[4px]">
                      <Label
                        htmlFor="security-new-password"
                        className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]"
                      >
                        New Password
                      </Label>
                      <Input
                        id="security-new-password"
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 12 characters"
                        className="w-full h-[40px] px-[12px] text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] shadow-x-small outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4]/20 transition-all placeholder:text-[#A4A4A4]"
                      />
                    </div>

                    {/* Confirm New Password */}
                    <div className="flex flex-col gap-[4px]">
                      <Label
                        htmlFor="security-confirm-password"
                        className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]"
                      >
                        Confirm New Password
                      </Label>
                      <Input
                        id="security-confirm-password"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full h-[40px] px-[12px] text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] shadow-x-small outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4]/20 transition-all placeholder:text-[#A4A4A4]"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons: Buttons [1.1] */}
                <div className="flex items-center justify-end pt-[8px]">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-[141px] h-[36px] bg-[#171717] hover:bg-[#262626] text-white rounded-[8px] text-[14px] font-medium tracking-[-0.006em] transition-colors cursor-pointer shadow-x-small disabled:opacity-50 flex items-center justify-center p-[8px]"
                  >
                    {saving ? "Updating..." : "Update password"}
                  </Button>
                </div>
              </form>
            )}

            {/* ════════════════ NOTIFICATIONS TAB ════════════════ */}
            {activeTab === "NOTIFICATIONS" && (
              <form onSubmit={handleSaveSettings} className="flex flex-col gap-[32px]">
                {/* Email Digest Section */}
                <div className="flex flex-col gap-[16px]">
                  <div className="flex flex-col gap-[4px]">
                    <h2 className="font-aeonik-medium text-[20px] leading-[32px] font-medium text-[#171717]">
                      Email digest
                    </h2>
                    <p className="text-[14px] text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
                      Receive a summary of activity and pending actions.
                    </p>
                  </div>

                  <div className="bg-white rounded-[16px] p-[32px] border border-[#EBEBEB] shadow-x-small flex flex-col gap-[20px]">
                    <span className="text-[14px] font-medium text-[#171717] leading-[20px]">
                      Your preferred email digest frequency.
                    </span>
                    <div className="flex items-center gap-[8px] flex-wrap">
                      {(["Real-time", "Daily", "Weekly", "Off"] as const).map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          id={`digest-freq-${freq.toLowerCase()}`}
                          aria-pressed={digestFrequency === freq}
                          onClick={() => setDigestFrequency(freq)}
                          className={`px-[16px] py-[8px] rounded-[8px] text-[14px] font-medium transition-all cursor-pointer border-0 ${
                            digestFrequency === freq
                              ? "bg-[#171717] text-white shadow-sm"
                              : "bg-[#F5F5F5] text-[#5C5C5C] hover:bg-[#EBEBEB] hover:text-[#171717]"
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notification Channels Section */}
                <div className="flex flex-col gap-[16px]">
                  <div className="flex flex-col gap-[4px]">
                    <h2 className="font-aeonik-medium text-[20px] leading-[32px] font-medium text-[#171717]">
                      Notifications channels
                    </h2>
                    <p className="text-[14px] text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
                      Choose which notifications you receive by email and push notifications.
                    </p>
                  </div>

                  <div className="bg-white rounded-[16px] p-[32px] border border-[#EBEBEB] shadow-x-small flex flex-col">
                    {/* Header Columns */}
                    <div className="flex items-center justify-end gap-[38px] pb-[16px]">
                      <span className="w-[33px] text-[13px] font-normal text-black text-center leading-[20px]">
                        Email
                      </span>
                      <span className="w-[33px] text-[13px] font-normal text-black text-center leading-[20px]">
                        Push
                      </span>
                    </div>

                    {/* Rows */}
                    {[
                      {
                        id: "mentions",
                        label: "Mentions",
                        desc: "When someone @mentions you in a note",
                        state: notifMentions,
                        setState: setNotifMentions,
                      },
                      {
                        id: "status-changes",
                        label: "Status changes",
                        desc: "When a case status is updated",
                        state: notifStatusChanges,
                        setState: setNotifStatusChanges,
                      },
                      {
                        id: "urgent-alerts",
                        label: "Urgent alerts",
                        desc: "RTW overdue, salary flags, compliance breaches",
                        state: notifUrgentAlerts,
                        setState: setNotifUrgentAlerts,
                      },
                      {
                        id: "expiry-warnings",
                        label: "Expiry warnings",
                        desc: "Visa or passport approaching expiry",
                        state: notifExpiryWarnings,
                        setState: setNotifExpiryWarnings,
                      },
                      {
                        id: "migrant-actions",
                        label: "Migrant actions",
                        desc: "When a migrant submits information or takes action",
                        state: notifMigrantActions,
                        setState: setNotifMigrantActions,
                      },
                      {
                        id: "doc-uploads",
                        label: "Document uploads",
                        desc: "When documents are added to a case",
                        state: notifDocUploads,
                        setState: setNotifDocUploads,
                      },
                      {
                        id: "reminders",
                        label: "Reminders",
                        desc: "Upcoming deadlines and scheduled tasks",
                        state: notifReminders,
                        setState: setNotifReminders,
                      },
                      {
                        id: "system",
                        label: "System",
                        desc: "Audits, compliance visits, platform updates",
                        state: notifSystem,
                        setState: setNotifSystem,
                      },
                    ].map((row, idx, arr) => (
                      <React.Fragment key={row.id}>
                        <div className="flex items-center justify-between py-[12px]">
                          <div className="flex flex-col gap-[2px] pr-4">
                            <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]">
                              {row.label}
                            </span>
                            <span className="text-[13px] text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
                              {row.desc}
                            </span>
                          </div>

                          <div className="flex items-center gap-[38px] shrink-0">
                            {/* Email Toggle */}
                            <SettingsSwitch
                              id={`notif-${row.id}-email`}
                              checked={row.state[0]}
                              onChange={(checked) => row.setState([checked, row.state[1]])}
                              ariaLabel={`${row.label} email notifications`}
                            />

                            {/* Push Toggle */}
                            <SettingsSwitch
                              id={`notif-${row.id}-push`}
                              checked={row.state[1]}
                              onChange={(checked) => row.setState([row.state[0], checked])}
                              ariaLabel={`${row.label} push notifications`}
                            />
                          </div>
                        </div>
                        {idx < arr.length - 1 && <div className="w-full border-t border-[#EBEBEB]" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Footer Button: Save preferences */}
                <div className="flex items-center justify-end pt-[8px]">
                  <Button
                    type="submit"
                    id="settings-save-preferences-btn"
                    disabled={saving}
                    className="w-[140px] h-[36px] bg-[#171717] hover:bg-[#262626] text-white rounded-[8px] text-[14px] font-medium tracking-[-0.006em] transition-colors cursor-pointer shadow-x-small disabled:opacity-50 flex items-center justify-center"
                  >
                    {saving ? "Saving..." : "Save preferences"}
                  </Button>
                </div>
              </form>
            )}

            {/* ════════════════ PREFERENCES TAB ════════════════ */}
            {activeTab === "PREFERENCES" && (
              <form onSubmit={handleSaveSettings} className="flex flex-col gap-[32px]">
                <div className="flex flex-col gap-[24px]">
                  <h2 className="font-aeonik-medium text-[20px] leading-[32px] font-medium text-[#171717]">
                    Workspace Preferences
                  </h2>

                  <div className="bg-white rounded-[16px] p-[32px] border border-[#EBEBEB] shadow-x-small flex flex-col gap-[20px]">
                    <div className="flex flex-col gap-[6px] max-w-[380px]">
                      <Label
                        htmlFor="pref-language"
                        className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]"
                      >
                        System Language
                      </Label>
                      <Select value={language} onValueChange={(val) => { if (val) setLanguage(val); }}>
                        <SelectTrigger
                          id="pref-language"
                          className="w-full h-[40px] px-[12px] text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] shadow-x-small font-normal"
                        >
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-[#EBEBEB] rounded-[10px] shadow-card-large z-50">
                          <SelectItem value="English (UK)">English (UK)</SelectItem>
                          <SelectItem value="English (US)">English (US)</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-[12px] pt-[8px]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLanguage("English (UK)")}
                    className="h-[36px] px-[16px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] rounded-[8px] text-[14px] font-medium tracking-[-0.006em] border-0 transition-colors cursor-pointer shadow-none"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-[36px] px-[20px] bg-[#171717] hover:bg-[#262626] text-white rounded-[8px] text-[14px] font-medium tracking-[-0.006em] transition-colors cursor-pointer shadow-x-small disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save preferences"}
                  </Button>
                </div>
              </form>
            )}

            {/* ════════════════ TEAM & ROLES TAB ════════════════ */}
            {activeTab === "TEAM" && (
              <div className="flex flex-col gap-[24px]">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-aeonik-medium text-[20px] leading-[32px] font-medium text-[#171717]">
                      Team members
                    </h2>
                    <p className="text-[14px] text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
                      Manage team access, permissions, and roles across your workspace.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <div className="w-[200px] md:w-[240px] h-[36px] bg-white border border-[#EBEBEB] rounded-[8px] px-3 flex items-center gap-2 shadow-x-small focus-within:border-[#171717] transition-all">
                      <RiSearchLine className="size-4 text-[#A4A4A4] shrink-0" />
                      <Input
                        variant="unstyled"
                        size="none"
                        type="text"
                        aria-label="Search team members"
                        placeholder="Search team..."
                        value={teamSearchQuery}
                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                        className="w-full text-[13px] text-[#171717] placeholder:text-[#A4A4A4] border-0 shadow-none focus-visible:ring-0 focus-visible:border-transparent p-0 h-auto bg-transparent"
                      />
                      {teamSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setTeamSearchQuery("")}
                          className="text-[#A4A4A4] hover:text-[#171717] cursor-pointer border-0 bg-transparent p-0"
                        >
                          <RiCloseLine className="size-4" />
                        </button>
                      )}
                    </div>

                    {/* Invite Button */}
                    <Button
                      type="button"
                      id="settings-invite-member-btn"
                      onClick={() => setIsInviteModalOpen(true)}
                      className="h-[36px] px-[16px] bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium rounded-[8px] tracking-[-0.006em] shadow-x-small transition-colors cursor-pointer shrink-0 flex items-center justify-center border-0"
                    >
                      Invite member
                    </Button>
                  </div>
                </div>

                {/* Team Members List Card */}
                <div className="bg-white rounded-[16px] p-[24px] md:p-[32px] border border-[#EBEBEB] shadow-x-small flex flex-col gap-[16px]">
                  {isLoadingTeam ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#5C5C5C]">
                      <RiRefreshLine className="size-6 animate-spin text-[#7D52F4]" />
                      <span className="text-[13px]">Loading team members...</span>
                    </div>
                  ) : filteredTeamMembers.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                      <div className="size-10 rounded-full bg-neutral-100 flex items-center justify-center text-[#5C5C5C]">
                        <RiGroupLine className="size-5" />
                      </div>
                      <span className="text-[14px] font-medium text-[#171717]">
                        {teamSearchQuery ? "No members matching your search" : "No team members found"}
                      </span>
                      <Button
                        type="button"
                        onClick={() => setIsInviteModalOpen(true)}
                        className="h-[36px] px-[16px] bg-[#171717] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] shadow-x-small transition-colors cursor-pointer"
                      >
                        Invite your first team member
                      </Button>
                    </div>
                  ) : (
                    filteredTeamMembers.map((member, idx, arr) => {
                      const badge = getRoleBadgeStyle(member.role);

                      return (
                        <React.Fragment key={member.id}>
                          <div className="flex items-center justify-between py-[8px]">
                            {/* Avatar + Info */}
                            <div className="flex items-center gap-[12px] min-w-0">
                              {member.avatarImage ? (
                                <Avatar className="size-10 rounded-full shrink-0">
                                  <AvatarImage src={member.avatarImage} alt={member.name} />
                                  <AvatarFallback className="bg-[#EBEBEB] text-[#171717] font-medium text-[12px]">
                                    {member.avatarText || getInitials(member.name)}
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="size-10 rounded-full bg-[#EBEBEB] text-[#171717] font-medium text-[12px] flex items-center justify-center shrink-0">
                                  {member.avatarText || getInitials(member.name)}
                                </div>
                              )}

                              <div className="flex flex-col min-w-0">
                                <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em] truncate">
                                  {member.name}
                                </span>
                                <span className="text-[13px] text-[#5C5C5C] leading-[18px] truncate">
                                  {member.email || "—"}
                                </span>
                              </div>
                            </div>

                            {/* Role Badge + Action Menu */}
                            <div className="flex items-center gap-[12px] shrink-0">
                              <span
                                className={`px-[8px] py-[2px] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] leading-[14px] ${badge.bg} ${badge.text}`}
                              >
                                {member.role}
                              </span>

                              <DropdownMenu>
                                <DropdownMenuTrigger className="size-8 rounded-[6px] hover:bg-neutral-100 flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer border-0 bg-transparent outline-none">
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

                                  {member.email && (
                                    <DropdownMenuItem
                                      onClick={() => handleCopyEmail(member.email)}
                                      className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#171717] hover:bg-neutral-50 rounded-[6px] cursor-pointer"
                                    >
                                      <RiFileCopyLine className="size-4 text-[#5C5C5C]" />
                                      <span>Copy Email</span>
                                    </DropdownMenuItem>
                                  )}

                                  {member.status === "invited" && member.email && (
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
                                    onClick={() => setMemberToRemove({ id: member.id, name: member.name })}
                                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#FB3748] hover:bg-red-50 rounded-[6px] cursor-pointer"
                                  >
                                    <RiDeleteBinLine className="size-4 text-[#FB3748]" />
                                    <span>Remove Member</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {idx < arr.length - 1 && <div className="w-full border-t border-[#EBEBEB]" />}
                        </React.Fragment>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSendInvite={handleAddTeamMember}
      />

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={!!editingMember}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onUpdateMember={handleUpdateTeamMember}
      />

      {/* Remove Member Confirmation Dialog */}
      {memberToRemove && (
        <Dialog open={!!memberToRemove} onOpenChange={(open) => { if (!open) setMemberToRemove(null); }}>
          <DialogContent className="max-w-[420px] p-6 bg-white rounded-[16px] border border-[#EBEBEB] shadow-card-large font-sans">
            <div className="flex flex-col gap-3 pr-8">
              <h3 className="text-h6-title text-[#171717]">Remove team member</h3>
              <p className="text-paragraph-sm text-[#5C5C5C]">
                Are you sure you want to remove <span className="font-semibold text-[#171717]">{memberToRemove.name}</span> from the organization? They will no longer have access to this workspace.
              </p>
            </div>
            <DialogFooter className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMemberToRemove(null)}
                className="h-9 px-4 rounded-[8px] text-[13px] border-[#EBEBEB] text-[#5C5C5C] hover:bg-[#F5F5F5]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  handleRemoveTeamMember(memberToRemove.id, memberToRemove.name);
                  setMemberToRemove(null);
                }}
                className="h-9 px-4 rounded-[8px] text-[13px] bg-[#FB3748] hover:bg-[#D92D3E] text-white"
              >
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="w-full min-h-full bg-[#F5F5F5] flex items-center justify-center p-12">
          <RiRefreshLine className="size-8 animate-spin text-[#7D52F4]" />
        </div>
      }
    >
      <SettingsContent />
    </React.Suspense>
  );
}
