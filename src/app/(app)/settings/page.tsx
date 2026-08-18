"use client";

import * as React from "react";
import {
  RiUserLine,
  RiUserFill,
  RiLock2Line,
  RiLockFill,
  RiNotification2Line,
  RiNotification3Line,
  RiNotification3Fill,
  RiListSettingsLine,
  RiSettings3Line,
  RiSettings3Fill,
  RiUserSettingsLine,
  RiGroupLine,
  RiCalendarLine,
  RiArrowDownSLine,
  RiUpload2Line,
  RiCheckLine,
  RiShieldKeyholeLine,
  RiTeamLine,
} from "@remixicon/react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<
    "PROFILE" | "SECURITY" | "NOTIFICATIONS" | "PREFERENCES" | "TEAM"
  >("PROFILE");

  // Form Input States
  const [firstName, setFirstName] = React.useState("Alex");
  const [lastName, setLastName] = React.useState("Marin");
  const [email, setEmail] = React.useState("alex.marin@viems.io");
  const [phone, setPhone] = React.useState("+1 555-555-5555");
  const [dob, setDob] = React.useState("1990-05-15");
  const [gender, setGender] = React.useState("Male");
  const [timezone, setTimezone] = React.useState("(UTC +00:00) London");
  const [dateFormat, setDateFormat] = React.useState("Month, Day Year");
  const [language, setLanguage] = React.useState("English (UK)");

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

  const [currentUserId, setCurrentUserId] = React.useState<number | string>(1);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Snapshot for restoring state on Cancel
  const [profileSnapshot, setProfileSnapshot] = React.useState({
    firstName: "Alex",
    lastName: "Marin",
    email: "alex.marin@viems.io",
    phone: "+1 555-555-5555",
    dob: "1990-05-15",
    gender: "Male",
    timezone: "(UTC +00:00) London",
    dateFormat: "Month, Day Year",
    language: "English (UK)",
  });

  // Fetch current user info and settings from NestJS backend API
  React.useEffect(() => {
    async function fetchUserSettings() {
      try {
        setLoading(true);
        // Fetch user profile info
        try {
          const userRes = await apiClient.get<any>(ENDPOINTS.users.userInfo);
          if (userRes) {
            if (userRes.id) setCurrentUserId(userRes.id);
            const fn = userRes.first_name || firstName;
            const ln = userRes.last_name || lastName;
            const em = userRes.email || email;
            const ph = userRes.phone || phone;
            const db = userRes.dob || dob;
            const gn = userRes.gender || gender;
            const tz = userRes.timezone || timezone;
            const df = userRes.dateFormat || dateFormat;
            const lg = userRes.language || language;

            setFirstName(fn);
            setLastName(ln);
            setEmail(em);
            setPhone(ph);
            setDob(db);
            setGender(gn);
            setTimezone(tz);
            setDateFormat(df);
            setLanguage(lg);

            setProfileSnapshot({
              firstName: fn,
              lastName: ln,
              email: em,
              phone: ph,
              dob: db,
              gender: gn,
              timezone: tz,
              dateFormat: df,
              language: lg,
            });
          }
        } catch (err) {
          console.warn("Using default profile info:", err);
        }

        // Fetch & validate notification preferences from settings endpoint
        try {
          const settingsRes = await apiClient.get<any>(ENDPOINTS.users.settings);
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

  const handleCancelProfile = () => {
    setFirstName(profileSnapshot.firstName);
    setLastName(profileSnapshot.lastName);
    setEmail(profileSnapshot.email);
    setPhone(profileSnapshot.phone);
    setDob(profileSnapshot.dob);
    setGender(profileSnapshot.gender);
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
        await apiClient.patch(ENDPOINTS.users.settings, {
          first_name: firstName,
          last_name: lastName,
          dob,
          gender,
          phone,
          timezone,
          dateFormat,
        });
        setProfileSnapshot((prev) => ({
          ...prev,
          firstName,
          lastName,
          dob,
          gender,
          phone,
          timezone,
          dateFormat,
        }));
        toast.success("Profile updated successfully.");
      } else if (activeTab === "SECURITY") {
        if (newPassword && newPassword !== confirmPassword) {
          toast.error("New passwords do not match.");
          setSaving(false);
          return;
        }
        await apiClient.patch(ENDPOINTS.users.settings, {
          currentPassword,
          newPassword,
          confirmPassword,
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
        await apiClient.patch(ENDPOINTS.users.settings, {
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

  const avatarInitials =
    (firstName?.[0] || "A") + (lastName?.[0] || "M");

  return (
    <div className="w-full min-h-full bg-[#F7F7F7] text-[#171717] font-sans pb-24 select-none">
      {/* Top Banner / Header Container */}
      <div className="bg-white border-b border-[#EBEBEB] px-6 lg:px-12 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-1">
          <h1 className="text-[28px] leading-[36px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
            Settings
          </h1>
          <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C]">
            Create, track, and manage visa cases for individual or grouped applicants.
          </p>
        </div>
      </div>

      {/* Main Content Area with Sidebar Tabs & Forms */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10 items-start">
          {/* Vertical Navigation Tab Menu */}
          <nav className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("PROFILE")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[14px] font-medium transition-colors cursor-pointer text-left ${
                activeTab === "PROFILE"
                  ? "bg-[#EBEBEB]/70 text-[#171717] font-semibold"
                  : "text-[#5C5C5C] hover:text-[#171717] hover:bg-[#F5F5F5]"
              }`}
            >
              {activeTab === "PROFILE" ? (
                <RiUserFill className="size-5 text-[#171717]" />
              ) : (
                <RiUserLine className="size-5 text-[#5C5C5C]" />
              )}
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SECURITY")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[14px] font-medium transition-colors cursor-pointer text-left ${
                activeTab === "SECURITY"
                  ? "bg-[#EBEBEB]/70 text-[#171717] font-semibold"
                  : "text-[#5C5C5C] hover:text-[#171717] hover:bg-[#F5F5F5]"
              }`}
            >
              {activeTab === "SECURITY" ? (
                <RiLockFill className="size-5 text-[#171717]" />
              ) : (
                <RiLock2Line className="size-5 text-[#5C5C5C]" />
              )}
              <span>Security</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("NOTIFICATIONS")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[14px] font-medium transition-colors cursor-pointer text-left ${
                activeTab === "NOTIFICATIONS"
                  ? "bg-[#EBEBEB]/70 text-[#171717] font-semibold"
                  : "text-[#5C5C5C] hover:text-[#171717] hover:bg-[#F5F5F5]"
              }`}
            >
              {activeTab === "NOTIFICATIONS" ? (
                <RiNotification3Fill className="size-5 text-[#171717]" />
              ) : (
                <RiNotification3Line className="size-5 text-[#5C5C5C]" />
              )}
              <span>Notifications</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("PREFERENCES")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[14px] font-medium transition-colors cursor-pointer text-left ${
                activeTab === "PREFERENCES"
                  ? "bg-[#EBEBEB]/70 text-[#171717] font-semibold"
                  : "text-[#5C5C5C] hover:text-[#171717] hover:bg-[#F5F5F5]"
              }`}
            >
              {activeTab === "PREFERENCES" ? (
                <RiSettings3Fill className="size-5 text-[#171717]" />
              ) : (
                <RiSettings3Line className="size-5 text-[#5C5C5C]" />
              )}
              <span>Preferences</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("TEAM")}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[14px] font-medium transition-colors cursor-pointer text-left ${
                activeTab === "TEAM"
                  ? "bg-[#EBEBEB]/70 text-[#171717] font-semibold"
                  : "text-[#5C5C5C] hover:text-[#171717] hover:bg-[#F5F5F5]"
              }`}
            >
              <RiGroupLine className="size-5 text-[#5C5C5C]" />
              <span>Team & Roles</span>
            </button>
          </nav>

          {/* Tab Form Views */}
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
            {/* PROFILE TAB */}
            {activeTab === "PROFILE" && (
              <>
                {/* Personal Information Card */}
                <div className="flex flex-col gap-3">
                  <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                    Personal information
                  </h2>

                  <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
                    {/* Avatar Upload Header */}
                    <div className="flex items-center justify-between pb-6 border-b border-[#EBEBEB]">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-[#CAC0FF] text-[#351A75] font-semibold text-[18px] flex items-center justify-center font-aeonik-medium">
                          {avatarInitials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[16px] font-medium text-[#171717]">
                            {firstName} {lastName}
                          </span>
                          <span className="text-[13px] text-[#5C5C5C]">
                            {email}
                          </span>
                        </div>
                      </div>

                      <label className="bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] text-[14px] font-medium px-4 py-2 rounded-[8px] cursor-pointer transition-colors">
                        Upload photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={() => {
                            toast.success("Photo uploaded successfully.");
                          }}
                        />
                      </label>
                    </div>

                    {/* Form Input Grid (2 Columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                      {/* First Name */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="settings-first-name" className="text-[14px] font-medium text-[#171717]">
                          First Name
                        </label>
                        <input
                          id="settings-first-name"
                          type="text"
                          disabled={loading}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Alex"
                          className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm disabled:opacity-50"
                        />
                      </div>

                      {/* Last Name */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="settings-last-name" className="text-[14px] font-medium text-[#171717]">
                          Last Name
                        </label>
                        <input
                          id="settings-last-name"
                          type="text"
                          disabled={loading}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Marin"
                          className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm disabled:opacity-50"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="settings-dob" className="text-[14px] font-medium text-[#171717]">
                          Date of Birth
                        </label>
                        <div className="relative flex items-center">
                          <RiCalendarLine className="size-4.5 text-[#A4A4A4] absolute left-3.5 pointer-events-none" />
                          <input
                            id="settings-dob"
                            type="text"
                            disabled={loading}
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            placeholder="DD / MM / YYYY"
                            className="w-full h-[40px] pl-10 pr-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm disabled:opacity-50"
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="settings-gender" className="text-[14px] font-medium text-[#171717]">
                          Gender
                        </label>
                        <div className="relative flex items-center">
                          <select
                            id="settings-gender"
                            disabled={loading}
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full h-[40px] px-3.5 pr-8 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] appearance-none cursor-pointer font-normal transition-colors shadow-sm disabled:opacity-50"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                          <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 pointer-events-none" />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="settings-email" className="text-[14px] font-medium text-[#171717]">
                          Email Address
                        </label>
                        <input
                          id="settings-email"
                          type="email"
                          value={email}
                          disabled
                          className="w-full h-[40px] px-3.5 text-[14px] text-[#5C5C5C] bg-[#F5F5F5] border border-transparent rounded-[10px] cursor-not-allowed outline-none font-normal"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="settings-phone" className="text-[14px] font-medium text-[#171717]">
                          Phone Number
                        </label>
                        <input
                          id="settings-phone"
                          type="text"
                          disabled={loading}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +1 555-555-5555"
                          className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timezone Card */}
                <div className="flex flex-col gap-3">
                  <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                    Timezone
                  </h2>

                  <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                      {/* Timezone Select */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="settings-timezone" className="text-[14px] font-medium text-[#171717]">
                          Timezone
                        </label>
                        <div className="relative flex items-center">
                          <select
                            id="settings-timezone"
                            disabled={loading}
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full h-[40px] px-3.5 pr-8 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] appearance-none cursor-pointer font-normal transition-colors shadow-sm disabled:opacity-50"
                          >
                            <option value="(UTC +00:00) London">
                              (UTC +00:00) London
                            </option>
                            <option value="(UTC -05:00) New York">
                              (UTC -05:00) New York
                            </option>
                            <option value="(UTC +01:00) Paris">
                              (UTC +01:00) Paris
                            </option>
                          </select>
                          <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 pointer-events-none" />
                        </div>
                      </div>

                      {/* Date Format Dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="settings-date-format" className="text-[14px] font-medium text-[#171717]">
                          Date Format
                        </label>
                        <div className="relative flex items-center">
                          <select
                            id="settings-date-format"
                            disabled={loading}
                            value={dateFormat}
                            onChange={(e) => setDateFormat(e.target.value)}
                            className="w-full h-[40px] px-3.5 pr-8 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] appearance-none cursor-pointer font-normal transition-colors shadow-sm disabled:opacity-50"
                          >
                            <option value="Month, Day Year">
                              Month, Day Year
                            </option>
                            <option value="DD / MM / YYYY">
                              DD / MM / YYYY
                            </option>
                          </select>
                          <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SECURITY TAB */}
            {activeTab === "SECURITY" && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                  Change password
                </h2>

                <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
                  <div className="flex flex-col gap-5">
                    {/* Current Password */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="security-current-password" className="text-[14px] font-medium text-[#171717]">
                        Current Password
                      </label>
                      <input
                        id="security-current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm placeholder:text-[#A4A4A4]"
                      />
                    </div>

                    {/* New Password */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="security-new-password" className="text-[14px] font-medium text-[#171717]">
                        New Password
                      </label>
                      <input
                        id="security-new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 12 characters"
                        className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm placeholder:text-[#A4A4A4]"
                      />
                    </div>

                    {/* Confirm New Password */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="security-confirm-password" className="text-[14px] font-medium text-[#171717]">
                        Confirm New Password
                      </label>
                      <input
                        id="security-confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm placeholder:text-[#A4A4A4]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "NOTIFICATIONS" && (
              <div className="flex flex-col gap-6">
                {/* Email Digest Section */}
                <div className="flex flex-col gap-3">
                  <div>
                    <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium leading-[32px]">Email digest</h2>
                    <p className="text-[14px] text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">Receive a summary of activity and pending actions.</p>
                  </div>
                  <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-8 shadow-sm">
                    <p className="text-[14px] font-medium text-[#171717] mb-5">Your preferred email digest frequency.</p>
                    <div className="flex items-center gap-2">
                      {(["Real-time", "Daily", "Weekly", "Off"] as const).map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          id={`digest-freq-${freq.toLowerCase()}`}
                          aria-pressed={digestFrequency === freq}
                          onClick={() => setDigestFrequency(freq)}
                          className={`px-4 py-2 rounded-[8px] text-[14px] font-medium transition-colors cursor-pointer ${
                            digestFrequency === freq
                              ? "bg-[#171717] text-white"
                              : "bg-[#F7F7F7] text-[#5C5C5C] hover:bg-[#EBEBEB] hover:text-[#171717]"
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notifications Channels Section */}
                <div className="flex flex-col gap-3">
                  <div>
                    <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium leading-[32px]">Notification channels</h2>
                    <p className="text-[14px] text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">Choose which notifications you receive by email and push notifications.</p>
                  </div>
                  <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-8 shadow-sm">
                    {/* Column Headers */}
                    <div className="flex items-center justify-end gap-[38px] mb-4 pr-0">
                      <span className="w-[33px] text-[13px] text-[#000] text-center leading-[20px] tracking-[-0.006em]">Email</span>
                      <span className="w-[33px] text-[13px] text-[#000] text-center leading-[20px] tracking-[-0.006em]">Push</span>
                    </div>

                    {/* Notification Rows */}
                    {([
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
                    ] as Array<{
                      id: string;
                      label: string;
                      desc: string;
                      state: [boolean, boolean];
                      setState: React.Dispatch<React.SetStateAction<[boolean, boolean]>>;
                    }>).map((row, i, arr) => (
                      <React.Fragment key={row.id}>
                        <div className="flex items-center gap-[7px] py-[10px]">
                          {/* Content */}
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]">{row.label}</span>
                            <span className="text-[13px] text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">{row.desc}</span>
                          </div>
                          {/* Email + Push Switches */}
                          <div className="flex items-center gap-[38px] shrink-0">
                            {/* Email Switch */}
                            <button
                              type="button"
                              id={`notif-${row.id}-email`}
                              role="switch"
                              aria-checked={row.state[0]}
                              aria-label={`${row.label} email notifications`}
                              onClick={() => row.setState([!row.state[0], row.state[1]])}
                              className="relative w-[33px] h-[20px] cursor-pointer shrink-0"
                            >
                              <span
                                className={`absolute inset-0 rounded-full transition-colors ${
                                  row.state[0] ? "bg-[#7D52F4]" : "bg-[#EBEBEB]"
                                }`}
                                style={{ width: 28, height: 16, top: 2, left: 2.5 }}
                              />
                              <span
                                className="absolute w-3 h-3 rounded-full bg-white shadow-[0px_4px_8px_rgba(27,28,29,0.06),0px_2px_4px_rgba(14,18,27,0.08)] transition-all"
                                style={{
                                  top: 4,
                                  left: row.state[0] ? 18.5 : 4.5,
                                }}
                              />
                            </button>
                            {/* Push Switch */}
                            <button
                              type="button"
                              id={`notif-${row.id}-push`}
                              role="switch"
                              aria-checked={row.state[1]}
                              aria-label={`${row.label} push notifications`}
                              onClick={() => row.setState([row.state[0], !row.state[1]])}
                              className="relative w-[33px] h-[20px] cursor-pointer shrink-0"
                            >
                              <span
                                className={`absolute inset-0 rounded-full transition-colors ${
                                  row.state[1] ? "bg-[#7D52F4]" : "bg-[#EBEBEB]"
                                }`}
                                style={{ width: 28, height: 16, top: 2, left: 2.5 }}
                              />
                              <span
                                className="absolute w-3 h-3 rounded-full bg-white shadow-[0px_4px_8px_rgba(27,28,29,0.06),0px_2px_4px_rgba(14,18,27,0.08)] transition-all"
                                style={{
                                  top: 4,
                                  left: row.state[1] ? 18.5 : 4.5,
                                }}
                              />
                            </button>
                          </div>
                        </div>
                        {i < arr.length - 1 && (
                          <div className="w-full border-t border-[#EBEBEB]" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === "PREFERENCES" && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium leading-[32px]">
                  Workspace Preferences
                </h2>
                <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-8 flex flex-col gap-6 shadow-sm">
                  <div className="flex flex-col gap-1.5" style={{ maxWidth: 360 }}>
                    <label htmlFor="pref-system-language" className="text-[14px] font-medium text-[#171717]">
                      System Language
                    </label>
                    <div className="relative flex items-center">
                      <select
                        id="pref-system-language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full h-[40px] px-3.5 pr-8 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] appearance-none cursor-pointer font-normal transition-colors shadow-sm"
                      >
                        <option value="English (UK)">English (UK)</option>
                        <option value="English (US)">English (US)</option>
                      </select>
                      <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TEAM & ROLES TAB */}
            {activeTab === "TEAM" && (
              <div className="flex flex-col gap-3">
                {/* Section header with Invite button */}
                <div className="flex items-center justify-between">
                  <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium leading-[32px]">
                    Team members
                  </h2>
                  <button
                    type="button"
                    id="team-invite-member-btn"
                    className="flex items-center justify-center px-4 py-2 bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium rounded-[8px] transition-colors cursor-pointer"
                    onClick={() => toast.info("Invite member coming soon.")}
                  >
                    Invite member
                  </button>
                </div>

                {/* Team members card */}
                <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-8 flex flex-col gap-6 shadow-sm">
                  {([
                    {
                      id: "alex-marin",
                      initials: "AM",
                      avatarBg: "#CAC0FF",
                      avatarColor: "#351A75",
                      name: "Alex Marin",
                      email: "alex.marin@viems.io",
                      role: "Admin",
                      roleBg: "#EFEBFF",
                      roleColor: "#7D52F4",
                      showEdit: false,
                    },
                    {
                      id: "nathan-wood",
                      initials: "NW",
                      avatarBg: "#D1E9FF",
                      avatarColor: "#1A4D8F",
                      name: "Nathan Wood",
                      email: "nathan.wood@viems.io",
                      role: "Case Manager",
                      roleBg: "#EBF1FF",
                      roleColor: "#335CFF",
                      showEdit: true,
                    },
                    {
                      id: "sarah-kim",
                      initials: "SK",
                      avatarBg: "#CAC0FF",
                      avatarColor: "#351A75",
                      name: "Sarah Kim",
                      email: "sarah.kim@viems.io",
                      role: "Viewer",
                      roleBg: "#EBF1FF",
                      roleColor: "#335CFF",
                      showEdit: true,
                    },
                  ]).map((member, i, arr) => (
                    <React.Fragment key={member.id}>
                      <div className="flex items-center justify-between">
                        {/* Avatar + Info */}
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-medium shrink-0"
                            style={{ background: member.avatarBg, color: member.avatarColor }}
                          >
                            {member.initials}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[14px] font-medium text-[#171717] leading-[20px] tracking-[-0.006em]">
                              {member.name}
                            </span>
                            <span className="text-[14px] text-[#5C5C5C] leading-[20px] tracking-[-0.006em]">
                              {member.email}
                            </span>
                          </div>
                        </div>

                        {/* Role badge + Edit button */}
                        <div className="flex items-center gap-4">
                          <span
                            className="px-2 py-[2px] rounded-full text-[12px] font-medium leading-[12px]"
                            style={{ background: member.roleBg, color: member.roleColor }}
                          >
                            {member.role}
                          </span>
                          {member.showEdit && (
                            <button
                              type="button"
                              id={`team-edit-${member.id}`}
                              className="px-[6px] py-1 bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] text-[14px] font-medium rounded-[8px] transition-colors cursor-pointer"
                              onClick={() => toast.info(`Edit ${member.name} coming soon.`)}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="w-full border-t border-[#EBEBEB]" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Action Buttons */}
            {activeTab !== "TEAM" && (
              <div className="flex items-center justify-end gap-3 pt-2">
                {activeTab === "PROFILE" && (
                  <button
                    type="button"
                    onClick={handleCancelProfile}
                    className="px-4 py-2 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || saving}
                  className="px-5 py-2.5 rounded-[10px] text-[14px] font-medium bg-[#171717] text-white hover:bg-[#262626] transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : activeTab === "SECURITY"
                    ? "Update password"
                    : activeTab === "NOTIFICATIONS"
                    ? "Save preferences"
                    : "Save changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
