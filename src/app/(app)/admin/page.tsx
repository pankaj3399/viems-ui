"use client";

import * as React from "react";
import {
  RiShieldKeyholeLine,
  RiShieldUserLine,
  RiFileList3Line,
  RiKey2Line,
  RiNotificationBadgeLine,
  RiArrowRightLine,
} from "@remixicon/react";
import { toast } from "sonner";

export default function AdminPage() {
  return (
    <div className="w-full min-h-full bg-[#F7F7F7] text-[#171717] font-sans pb-24 select-none">
      {/* Top Banner / Header */}
      <div className="bg-white border-b border-[#EBEBEB] px-6 lg:px-12 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] leading-[36px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
              Admin Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#EFEBFF] text-[#7D52F4]">
              Coming Soon
            </span>
          </div>
          <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C]">
            Manage organization configurations, user roles, security policies, and audit logs.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-8 flex flex-col gap-8">
        {/* Main Hero Card */}
        <div className="w-full bg-white border border-[#EBEBEB] rounded-[16px] p-8 lg:p-12 shadow-sm flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#EFEBFF] text-[#7D52F4] flex items-center justify-center shadow-sm shrink-0">
            <RiShieldKeyholeLine className="size-8" />
          </div>

          <div className="w-full max-w-xl text-center flex flex-col gap-2">
            <h2 className="w-full text-[24px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
              Advanced Admin Suite in Development
            </h2>
            <p className="w-full text-[14px] text-[#5C5C5C] leading-[22px]">
              We are building a comprehensive management portal for enterprise compliance officers.
              Full admin controls, role-based access control (RBAC), and automated compliance audit logging will be released shortly.
            </p>
          </div>

          <button
            type="button"
            onClick={() => toast.success("You will be notified when Admin Portal features are released!")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium rounded-[10px] transition-colors cursor-pointer shadow-sm"
          >
            <RiNotificationBadgeLine className="size-4.5" />
            <span>Notify Me on Launch</span>
          </button>
        </div>

        {/* Feature Preview Grid */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[18px] font-medium text-[#171717] font-aeonik-medium">
            Upcoming Modules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Roles & Permissions */}
            <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[10px] bg-[#F7F7F7] text-[#171717] flex items-center justify-center">
                  <RiShieldUserLine className="size-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F7F7F7] text-[#5C5C5C]">
                  In Progress
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-[16px] font-medium text-[#171717] font-aeonik-medium">
                  Custom Roles & RBAC
                </h4>
                <p className="text-[13px] text-[#5C5C5C] leading-[18px]">
                  Configure granular permissions for caseworkers, legal reviewers, and HR admins.
                </p>
              </div>
            </div>

            {/* Card 2: Audit Logs */}
            <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[10px] bg-[#F7F7F7] text-[#171717] flex items-center justify-center">
                  <RiFileList3Line className="size-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F7F7F7] text-[#5C5C5C]">
                  Planned
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-[16px] font-medium text-[#171717] font-aeonik-medium">
                  Compliance Audit Logs
                </h4>
                <p className="text-[13px] text-[#5C5C5C] leading-[18px]">
                  Full tamper-proof activity tracking for Home Office audits and legal verifications.
                </p>
              </div>
            </div>

            {/* Card 3: SSO & Security */}
            <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-[10px] bg-[#F7F7F7] text-[#171717] flex items-center justify-center">
                  <RiKey2Line className="size-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F7F7F7] text-[#5C5C5C]">
                  Planned
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-[16px] font-medium text-[#171717] font-aeonik-medium">
                  Enterprise SSO & Security
                </h4>
                <p className="text-[13px] text-[#5C5C5C] leading-[18px]">
                  SAML 2.0, Okta, Azure AD integration, and IP-whitelisting controls.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
