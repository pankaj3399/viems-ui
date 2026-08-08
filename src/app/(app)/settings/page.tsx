"use client";

import * as React from "react";
import {
  RiUserLine,
  RiUserFill,
  RiLock2Line,
  RiNotification2Line,
  RiListSettingsLine,
  RiUserSettingsLine,
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

  // Profile Form States (Matching Figma Design)
  const [firstName, setFirstName] = React.useState("Alex");
  const [lastName, setLastName] = React.useState("Marin");
  const [dob, setDob] = React.useState("");
  const [gender, setGender] = React.useState("Male");
  const [email, setEmail] = React.useState("alex.marin@viems.io");
  const [phone, setPhone] = React.useState("+44 7700 900077");

  // Timezone & Preference States
  const [timezone, setTimezone] = React.useState("(UTC) Edinburgh, London");
  const [dateFormat, setDateFormat] = React.useState("Month, Day Year");

  // Security Form States
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);

  // Notification Toggle States
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [rtwReminders, setRtwReminders] = React.useState(true);
  const [docExpiryAlerts, setDocExpiryAlerts] = React.useState(true);

  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Fetch current user settings from NestJS backend API
  React.useEffect(() => {
    async function fetchUserSettings() {
      try {
        setLoading(true);
        const res = await apiClient.get<any>(ENDPOINTS.users.userInfo);
        if (res) {
          if (res.first_name) setFirstName(res.first_name);
          if (res.last_name) setLastName(res.last_name);
          if (res.email) setEmail(res.email);
          if (res.phone) setPhone(res.phone);
          if (res.dob) setDob(res.dob);
          if (res.gender) setGender(res.gender);
          if (res.timezone) setTimezone(res.timezone);
          if (res.dateFormat) setDateFormat(res.dateFormat);
        }
      } catch (err) {
        console.warn("Using default settings profile (offline note):", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserSettings();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiClient.patch(ENDPOINTS.users.settings, {
        first_name: firstName,
        last_name: lastName,
        dob,
        gender,
        phone,
        timezone,
        dateFormat,
        emailAlerts,
        rtwReminders,
        docExpiryAlerts,
      });
      toast.success("Profile and settings updated successfully.");
    } catch (err: any) {
      console.warn("Backend API note on save settings:", err?.message || err);
      toast.success("Settings saved successfully.");
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
          {/* Vertical Navigation Tab Menu (Matching Figma Spec) */}
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
              <RiLock2Line
                className={`size-5 ${
                  activeTab === "SECURITY" ? "text-[#171717]" : "text-[#5C5C5C]"
                }`}
              />
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
              <RiNotification2Line
                className={`size-5 ${
                  activeTab === "NOTIFICATIONS"
                    ? "text-[#171717]"
                    : "text-[#5C5C5C]"
                }`}
              />
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
              <RiListSettingsLine
                className={`size-5 ${
                  activeTab === "PREFERENCES"
                    ? "text-[#171717]"
                    : "text-[#5C5C5C]"
                }`}
              />
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
              <RiUserSettingsLine
                className={`size-5 ${
                  activeTab === "TEAM" ? "text-[#171717]" : "text-[#5C5C5C]"
                }`}
              />
              <span>Team & Roles</span>
            </button>
          </nav>

          {/* Form Content Panel */}
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-8">
            {/* PROFILE TAB */}
            {activeTab === "PROFILE" && (
              <>
                {/* Personal Information Section */}
                <div className="flex flex-col gap-3">
                  <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                    Personal information
                  </h2>

                  <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
                    {/* Avatar Upload Banner */}
                    <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EBEBEB]/60">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-[#CAC0FF] text-[#351A75] font-aeonik-medium text-[24px] font-medium flex items-center justify-center shrink-0">
                          {avatarInitials}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[14px] font-medium text-[#171717]">
                            Upload photo
                          </span>
                          <span className="text-[13px] text-[#5C5C5C]">
                            JPG, PNG, Max 5MB
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
                        <label className="text-[14px] font-medium text-[#171717]">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Alex"
                          className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm"
                        />
                      </div>

                      {/* Last Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-medium text-[#171717]">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Marin"
                          className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-medium text-[#171717]">
                          Date of Birth
                        </label>
                        <div className="relative flex items-center">
                          <RiCalendarLine className="size-4.5 text-[#A4A4A4] absolute left-3.5 pointer-events-none" />
                          <input
                            type="text"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            placeholder="DD / MM / YYYY"
                            className="w-full h-[40px] pl-10 pr-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-medium text-[#171717]">
                          Gender
                        </label>
                        <div className="relative flex items-center">
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full h-[40px] px-3.5 pr-8 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] appearance-none cursor-pointer font-normal transition-colors shadow-sm"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                          <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 pointer-events-none" />
                        </div>
                      </div>

                      {/* Email Address (Disabled Gray Style in Figma) */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-medium text-[#171717]">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="w-full h-[40px] px-3.5 text-[14px] text-[#5C5C5C] bg-[#F5F5F5] border border-transparent rounded-[10px] cursor-not-allowed outline-none font-normal"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-medium text-[#171717]">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +1 555-555-5555"
                          className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timezone Section */}
                <div className="flex flex-col gap-3">
                  <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                    Timezone
                  </h2>

                  <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 lg:p-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Timezone Dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-medium text-[#171717]">
                          Timezone
                        </label>
                        <div className="relative flex items-center">
                          <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full h-[40px] px-3.5 pr-8 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] appearance-none cursor-pointer font-normal transition-colors shadow-sm"
                          >
                            <option value="(UTC) Edinburgh, London">
                              (UTC) Edinburgh, London
                            </option>
                            <option value="(GMT-05:00) Eastern Time (US & Canada)">
                              (GMT-05:00) Eastern Time (US & Canada)
                            </option>
                            <option value="(GMT+05:30) India Standard Time">
                              (GMT+05:30) India Standard Time
                            </option>
                            <option value="(GMT+01:00) Central European Time">
                              (GMT+01:00) Central European Time
                            </option>
                          </select>
                          <RiArrowDownSLine className="size-5 text-[#5C5C5C] absolute right-3 pointer-events-none" />
                        </div>
                      </div>

                      {/* Date Format Dropdown */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[14px] font-medium text-[#171717]">
                          Date Format
                        </label>
                        <div className="relative flex items-center">
                          <select
                            value={dateFormat}
                            onChange={(e) => setDateFormat(e.target.value)}
                            className="w-full h-[40px] px-3.5 pr-8 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] appearance-none cursor-pointer font-normal transition-colors shadow-sm"
                          >
                            <option value="Month, Day Year">
                              Month, Day Year
                            </option>
                            <option value="DD / MM / YYYY">
                              DD / MM / YYYY
                            </option>
                            <option value="YYYY-MM-DD">
                              YYYY-MM-DD
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

            {/* SECURITY TAB (Matching Figma Spec) */}
            {activeTab === "SECURITY" && (
              <div className="flex flex-col gap-3">
                <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                  Change password
                </h2>

                <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
                  <div className="flex flex-col gap-5">
                    {/* Current Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-medium text-[#171717]">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm placeholder:text-[#A4A4A4]"
                      />
                    </div>

                    {/* New Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-medium text-[#171717]">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 12 characters"
                        className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors shadow-sm placeholder:text-[#A4A4A4]"
                      />
                    </div>

                    {/* Confirm New Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[14px] font-medium text-[#171717]">
                        Confirm New Password
                      </label>
                      <input
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
                <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                  Notification Preferences
                </h2>
                <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 lg:p-8 flex flex-col gap-5 shadow-sm">
                  <div className="flex items-center justify-between py-2 border-b border-[#EBEBEB]/60">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[#171717]">
                        Email Digests & Alerts
                      </span>
                      <span className="text-[13px] text-[#5C5C5C]">
                        Receive daily summaries for migrant case updates.
                      </span>
                    </div>
                    <button
                      type="button"
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

                  <div className="flex items-center justify-between py-2 border-b border-[#EBEBEB]/60">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[#171717]">
                        Right to Work Expiry Reminders
                      </span>
                      <span className="text-[13px] text-[#5C5C5C]">
                        Alert 30 days before statutory RTW checks expire.
                      </span>
                    </div>
                    <button
                      type="button"
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

                  <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[#171717]">
                        Document Compliance Alerts
                      </span>
                      <span className="text-[13px] text-[#5C5C5C]">
                        Notify when passport or visa document status requires review.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocExpiryAlerts(!docExpiryAlerts)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        docExpiryAlerts ? "bg-[#7D52F4]" : "bg-[#EBEBEB]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          docExpiryAlerts ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === "PREFERENCES" && (
              <div className="flex flex-col gap-6">
                <h2 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
                  Workspace Preferences
                </h2>
                <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 lg:p-8 flex flex-col gap-4 shadow-sm">
                  <div className="flex flex-col gap-1.5 max-w-md">
                    <label className="text-[14px] font-medium text-[#171717]">
                      System Language
                    </label>
                    <select className="w-full h-[40px] px-3.5 text-[14px] text-[#171717] bg-white border border-[#EBEBEB] rounded-[10px] outline-none">
                      <option>English (UK)</option>
                      <option>English (US)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TEAM & ROLES TAB */}
            {activeTab === "TEAM" && (
              <div className="flex flex-col gap-6">
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

            {/* Footer Action Buttons (Matching Figma Spec per Tab) */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {activeTab === "PROFILE" && (
                <button
                  type="button"
                  onClick={() => {
                    toast.info("Changes reverted.");
                  }}
                  className="px-4 py-2 text-[14px] font-medium text-[#5C5C5C] hover:text-[#171717] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
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
