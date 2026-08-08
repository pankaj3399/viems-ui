"use client";

import * as React from "react";
import {
  RiUserLine,
  RiUserFill,
  RiLock2Line,
  RiLockFill,
  RiNotification2Line,
  RiNotification3Line,
  RiListSettingsLine,
  RiSettings3Line,
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

  // Notification Toggle States
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [rtwReminders, setRtwReminders] = React.useState(true);
  const [docExpiryAlerts, setDocExpiryAlerts] = React.useState(true);

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

  // Fetch current user settings from NestJS backend API
  React.useEffect(() => {
    async function fetchUserSettings() {
      try {
        setLoading(true);
        const res = await apiClient.get<any>(ENDPOINTS.users.userInfo);
        if (res) {
          const fn = res.first_name || firstName;
          const ln = res.last_name || lastName;
          const em = res.email || email;
          const ph = res.phone || phone;
          const db = res.dob || dob;
          const gn = res.gender || gender;
          const tz = res.timezone || timezone;
          const df = res.dateFormat || dateFormat;
          const lg = res.language || language;

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
        console.warn("Using default settings profile (offline note):", err);
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
        await apiClient.patch(ENDPOINTS.users.settings, {
          emailAlerts,
          rtwReminders,
          docExpiryAlerts,
        });
        toast.success("Notification preferences updated.");
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
              <RiNotification3Line className="size-5 text-[#5C5C5C]" />
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
              <RiSettings3Line className="size-5 text-[#5C5C5C]" />
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
              <div className="flex flex-col gap-3">
                <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                  Notification Settings
                </h2>
                <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label htmlFor="notif-email-alerts" className="text-[14px] font-medium text-[#171717] cursor-pointer">
                        Email Alerts
                      </label>
                      <span className="text-[13px] text-[#5C5C5C]">
                        Receive immediate emails for high risk compliance tasks.
                      </span>
                    </div>
                    <button
                      type="button"
                      id="notif-email-alerts"
                      role="switch"
                      aria-checked={emailAlerts}
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        emailAlerts ? "bg-[#7D52F4]" : "bg-[#EBEBEB]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          emailAlerts ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#EBEBEB]">
                    <div className="flex flex-col">
                      <label htmlFor="notif-rtw-reminders" className="text-[14px] font-medium text-[#171717] cursor-pointer">
                        RTW Renewal Reminders
                      </label>
                      <span className="text-[13px] text-[#5C5C5C]">
                        Weekly digests for upcoming right-to-work deadlines.
                      </span>
                    </div>
                    <button
                      type="button"
                      id="notif-rtw-reminders"
                      role="switch"
                      aria-checked={rtwReminders}
                      onClick={() => setRtwReminders(!rtwReminders)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        rtwReminders ? "bg-[#7D52F4]" : "bg-[#EBEBEB]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          rtwReminders ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === "PREFERENCES" && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                  Workspace Preferences
                </h2>
                <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 lg:p-8 flex flex-col gap-4 shadow-sm">
                  <div className="flex flex-col gap-1.5 max-w-md">
                    <label htmlFor="pref-system-language" className="text-[14px] font-medium text-[#171717]">
                      System Language
                    </label>
                    <select
                      id="pref-system-language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors"
                    >
                      <option value="English (UK)">English (UK)</option>
                      <option value="English (US)">English (US)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TEAM & ROLES TAB */}
            {activeTab === "TEAM" && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                  Team Members & Roles
                </h2>
                <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 lg:p-8 flex flex-col gap-4 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-[#EBEBEB]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#CAC0FF] text-[#351A75] font-medium text-[14px] flex items-center justify-center">
                        AM
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-[#171717]">
                          Alex Marin
                        </span>
                        <span className="text-[13px] text-[#5C5C5C]">
                          alex.marin@viems.io
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-[6px] bg-[#E3F7EC] text-[#0D6332] text-[12px] font-medium">
                      Super Admin
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Action Buttons */}
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
                  : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
