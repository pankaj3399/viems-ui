"use client";

import * as React from "react";
import { RiCloseLine, RiMailLine, RiUserLine } from "@remixicon/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { TeamMember } from "@/components/EditMemberModal";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvite: (memberData: TeamMember) => void;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  onSendInvite,
}: InviteMemberModalProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("Compliance Officer");
  const [smsRole, setSmsRole] = React.useState("Level 2");
  const [isSending, setIsSending] = React.useState(false);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setName("");
      setEmail("");
      setRole("Compliance Officer");
      setSmsRole("Level 2");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim() || !name || !name.trim()) {
      toast.error("Please provide both name and email address");
      return;
    }

    setIsSending(true);
    const parts = name.trim().split(" ");
    const firstName = parts[0] || name.trim();
    const lastName = parts.slice(1).join(" ") || "";
    const initials = parts
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "TM";

    const formattedRole = role.toUpperCase();
    const isInvited = formattedRole === "INVITED";
    const rawSms = smsRole === "None" ? "—" : smsRole;

    try {
      const response = await apiClient.post<any>(ENDPOINTS.employees.base, {
        firstName,
        lastName,
        email: email.trim(),
        jobTitle: role,
        userStatus: isInvited ? "invited" : "active",
      });

      const createdId = response?.id || response?.data?.id;
      const backendId = createdId ? String(createdId) : `local-${Date.now()}`;

      if (createdId) {
        await apiClient.post(
          `${ENDPOINTS.employees.sendRegistrationLink}/${createdId}`
        ).catch((e) => console.log("Auto-registration email trigger:", e));
      }

      const newMember: TeamMember = {
        id: backendId,
        name: name.trim(),
        firstName,
        lastName,
        email: email.trim(),
        avatarText: initials,
        role: formattedRole,
        smsRole: rawSms,
        status: isInvited ? "invited" : "active",
      };

      onSendInvite(newMember);
      toast.success(`Invitation successfully sent to ${email.trim()}`);
      onClose();
    } catch {
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="w-full max-w-[460px] p-0 bg-white border border-[#EBEBEB] shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] rounded-[20px] overflow-visible gap-0 z-50 flex flex-col"
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
            {/* Header Title & Subtitle */}
            <div className="flex flex-col gap-[4px] pr-8">
              <DialogTitle className="text-[20px] font-medium leading-[28px] text-[#171717] font-aeonik-medium">
                Invite Team Member
              </DialogTitle>
              <DialogDescription className="text-[13px] text-[#5C5C5C] leading-[18px]">
                Send an email invitation to collaborate on your sponsorship cases.
              </DialogDescription>
            </div>

            {/* Input Fields */}
            <div className="flex flex-col gap-[14px]">
              {/* Full Name */}
              <div className="flex flex-col gap-[6px]">
                <label
                  htmlFor="invite-member-name"
                  className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.02em]"
                >
                  Full Name
                </label>
                <div className="h-10 px-3 bg-white border border-[#EBEBEB] rounded-[10px] flex items-center gap-2 shadow-x-small focus-within:border-[#171717] transition-all">
                  <RiUserLine className="size-4 text-[#A4A4A4] shrink-0" />
                  <input
                    id="invite-member-name"
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-[14px] text-[#171717] placeholder:text-[#A4A4A4] border-0 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-[6px]">
                <label
                  htmlFor="invite-member-email"
                  className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.02em]"
                >
                  Email Address
                </label>
                <div className="h-10 px-3 bg-white border border-[#EBEBEB] rounded-[10px] flex items-center gap-2 shadow-x-small focus-within:border-[#171717] transition-all">
                  <RiMailLine className="size-4 text-[#A4A4A4] shrink-0" />
                  <input
                    id="invite-member-email"
                    type="email"
                    required
                    placeholder="name@viems.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-[14px] text-[#171717] placeholder:text-[#A4A4A4] border-0 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Role and SMS Role Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* System Role Dropdown */}
                <div className="flex flex-col gap-[6px]">
                  <label
                    htmlFor="invite-member-role"
                    className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.02em]"
                  >
                    Role
                  </label>
                  <Select
                    value={role}
                    onValueChange={(val) => {
                      if (val) setRole(val);
                    }}
                  >
                    <SelectTrigger
                      id="invite-member-role"
                      className="w-full h-10 rounded-[10px] border-[#EBEBEB] bg-white text-[14px] text-[#171717] shadow-x-small font-normal"
                    >
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
                  <label
                    htmlFor="invite-member-sms-role"
                    className="text-[12px] font-medium text-[#171717] uppercase tracking-[0.02em]"
                  >
                    SMS Role
                  </label>
                  <Select
                    value={smsRole}
                    onValueChange={(val) => {
                      if (val) setSmsRole(val);
                    }}
                  >
                    <SelectTrigger
                      id="invite-member-sms-role"
                      className="w-full h-10 rounded-[10px] border-[#EBEBEB] bg-white text-[14px] text-[#171717] shadow-x-small font-normal"
                    >
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
              disabled={isSending}
              className="h-9 px-5 bg-[#171717] hover:bg-[#262626] text-white text-[13px] font-medium rounded-[8px] transition-colors cursor-pointer"
            >
              {isSending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
