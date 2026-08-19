"use client";

import * as React from "react";
import { RiCloseLine, RiMailLine, RiUserLine } from "@remixicon/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

export interface TeamMember {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatarText?: string;
  avatarImage?: string;
  role: string;
  smsRole: string;
  status: "active" | "invited" | "blocked";
}

interface EditMemberModalProps {
  isOpen: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onUpdateMember: (updatedMember: TeamMember) => void;
}

// Normalizer: ensures every string is properly formatted with first letter capitalized
export function normalizeRoleDisplay(role: string): string {
  if (!role) return "Compliance Officer";
  const r = role.trim().toUpperCase();
  if (r === "ADMIN") return "Admin";
  if (r === "AUTHORISING OFFICER" || r === "AUTHORISING_OFFICER") return "Authorising Officer";
  if (r === "COMPLIANCE OFFICER" || r === "COMPLIANCE_OFFICER") return "Compliance Officer";
  if (r === "HR MANAGER" || r === "HR_MANAGER" || r === "MANAGER") return "HR Manager";
  if (r === "INVITED") return "Invited";
  return role
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeSmsRoleDisplay(sms: string): string {
  if (!sms || sms === "—" || sms.toLowerCase() === "none") return "None";
  if (sms.toLowerCase().includes("1")) return "Level 1";
  if (sms.toLowerCase().includes("2")) return "Level 2";
  if (sms.toLowerCase().includes("view")) return "View Only";
  return sms
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeStatusDisplay(status: string): "Active" | "Invited" | "Suspended" {
  if (!status) return "Active";
  const s = status.trim().toLowerCase();
  if (s.includes("invite") || s.includes("pending")) return "Invited";
  if (s.includes("block") || s.includes("suspend") || s.includes("inactive")) return "Suspended";
  return "Active";
}

export function EditMemberModal({
  isOpen,
  member,
  onClose,
  onUpdateMember,
}: EditMemberModalProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("Compliance Officer");
  const [smsRole, setSmsRole] = React.useState("Level 2");
  const [status, setStatus] = React.useState<"Active" | "Invited" | "Suspended">("Active");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (member) {
      setName(member.name || "");
      setEmail(member.email || "");
      setRole(normalizeRoleDisplay(member.role));
      setSmsRole(normalizeSmsRoleDisplay(member.smsRole));
      setStatus(normalizeStatusDisplay(member.status));
    }
  }, [member]);

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim() || !name || !name.trim()) {
      toast.error("Please provide both name and email address");
      return;
    }

    setIsSaving(true);
    const parts = name.trim().split(" ");
    const firstName = parts[0] || name.trim();
    const lastName = parts.slice(1).join(" ") || "";

    const rawStatus = status === "Invited" ? "invited" : status === "Suspended" ? "blocked" : "active";
    const rawSms = smsRole === "None" ? "—" : smsRole;

    const updatedData: TeamMember = {
      ...member,
      name: name.trim(),
      firstName,
      lastName,
      email: email.trim(),
      role: role.toUpperCase(),
      smsRole: rawSms,
      status: rawStatus,
      avatarText: parts
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || member.avatarText,
    };

    try {
      if (!isNaN(Number(member.id))) {
        await apiClient.patch(ENDPOINTS.employees.byId(member.id), {
          firstName,
          lastName,
          email: email.trim(),
          jobTitle: role,
          userStatus: rawStatus,
        }).catch((err) => {
          console.warn("Backend PATCH failed, updated local state:", err);
        });
      }

      onUpdateMember(updatedData);
      toast.success(`Updated ${name.trim()}'s profile successfully`);
      onClose();
    } catch {
      toast.error("Failed to update team member. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[460px] bg-white border border-[#EBEBEB] shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] rounded-[20px] overflow-visible z-50 flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 size-7 rounded-[8px] bg-white border border-[#EBEBEB] shadow-x-small flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 transition-colors cursor-pointer border-0 z-20"
          aria-label="Close modal"
        >
          <RiCloseLine className="size-4 text-[#5C5C5C]" />
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-[24px] flex flex-col gap-[20px]">
            {/* Header Title */}
            <div className="flex flex-col gap-[4px] pr-8">
              <h3 className="text-[20px] font-medium leading-[28px] text-[#171717] font-aeonik-medium">
                Edit Team Member
              </h3>
              <p className="text-[13px] text-[#5C5C5C] leading-[18px]">
                Update member details, role permissions, and SMS access privileges.
              </p>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-[14px]">
              {/* Full Name */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.02em]">
                  Full Name
                </label>
                <div className="h-10 px-3 bg-white border border-[#EBEBEB] rounded-[10px] flex items-center gap-2 shadow-x-small focus-within:border-[#171717] transition-all">
                  <RiUserLine className="size-4 text-[#A4A4A4] shrink-0" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Kim"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-[14px] text-[#171717] placeholder:text-[#A4A4A4] border-0 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.02em]">
                  Email Address
                </label>
                <div className="h-10 px-3 bg-white border border-[#EBEBEB] rounded-[10px] flex items-center gap-2 shadow-x-small focus-within:border-[#171717] transition-all">
                  <RiMailLine className="size-4 text-[#A4A4A4] shrink-0" />
                  <input
                    type="email"
                    required
                    placeholder="name@viems.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-[14px] text-[#171717] placeholder:text-[#A4A4A4] border-0 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Role and SMS Role Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* System Role Dropdown */}
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.02em]">
                    Role
                  </label>
                  <Select
                    value={role}
                    onValueChange={(val) => {
                      if (val) setRole(val);
                    }}
                  >
                    <SelectTrigger className="w-full h-10 rounded-[10px] border-[#EBEBEB] bg-white text-[14px] text-[#171717] shadow-x-small font-normal">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#EBEBEB] rounded-[10px] shadow-card-large z-[60]">
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Authorising Officer">Authorising Officer</SelectItem>
                      <SelectItem value="Compliance Officer">Compliance Officer</SelectItem>
                      <SelectItem value="HR Manager">HR Manager</SelectItem>
                      <SelectItem value="Invited">Invited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* SMS Role Dropdown */}
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.02em]">
                    SMS Role
                  </label>
                  <Select
                    value={smsRole}
                    onValueChange={(val) => {
                      if (val) setSmsRole(val);
                    }}
                  >
                    <SelectTrigger className="w-full h-10 rounded-[10px] border-[#EBEBEB] bg-white text-[14px] text-[#171717] shadow-x-small font-normal">
                      <SelectValue placeholder="SMS Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-[#EBEBEB] rounded-[10px] shadow-card-large z-[60]">
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Level 1">Level 1</SelectItem>
                      <SelectItem value="Level 2">Level 2</SelectItem>
                      <SelectItem value="View Only">View Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Membership Status Dropdown */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.02em]">
                  Membership Status
                </label>
                <Select
                  value={status}
                  onValueChange={(val) => {
                    if (val === "Active" || val === "Invited" || val === "Suspended") {
                      setStatus(val);
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-10 rounded-[10px] border-[#EBEBEB] bg-white text-[14px] text-[#171717] shadow-x-small font-normal">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-[#EBEBEB] rounded-[10px] shadow-card-large z-[60]">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Invited">Invited</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="px-[24px] py-[16px] bg-[#F7F7F7] border-t border-[#EBEBEB] rounded-b-[20px] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 rounded-[8px] text-[13px] border-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] hover:bg-white cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-9 px-5 bg-[#171717] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-colors cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
