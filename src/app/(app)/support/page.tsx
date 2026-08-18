"use client";

import * as React from "react";
import {
  RiCustomerService2Line,
  RiBookOpenLine,
  RiMailSendLine,
  RiQuestionAnswerLine,
  RiSearchLine,
  RiCheckLine,
  RiExternalLinkLine,
} from "@remixicon/react";
import { toast } from "sonner";

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    toast.info("Knowledge base search coming soon.");
  };

  return (
    <div className="w-full min-h-full bg-[#F7F7F7] text-[#171717] font-sans pb-24">
      {/* Top Banner / Header */}
      <div className="bg-white border-b border-[#EBEBEB] px-6 lg:px-12 py-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-[28px] leading-[36px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
              Help & Support
            </h1>
            <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C]">
              Access compliance documentation, user guides, and direct caseworker support.
            </p>
          </div>

          {/* All Systems Operational Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E3F7EC] text-[#0D6332] text-[13px] font-medium self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#0D6332] animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pt-8 flex flex-col gap-8">
        {/* Search Header Bar */}
        <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full flex items-center">
              <RiSearchLine className="size-5 text-[#5C5C5C] absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search help articles, visa guidelines, RTW compliance procedures..."
                aria-label="Search knowledge base"
                className="w-full h-[44px] pl-11 pr-4 text-[14px] text-[#171717] bg-[#F7F7F7] border border-[#EBEBEB] rounded-[10px] outline-none focus:border-[#7D52F4] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-5 h-[44px] bg-[#171717] hover:bg-[#262626] text-white text-[14px] font-medium rounded-[10px] transition-colors cursor-pointer shrink-0"
            >
              Search Knowledge Base
            </button>
          </form>
        </div>

        {/* Support Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Documentation */}
          <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 shadow-sm flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-[12px] bg-[#EFEBFF] text-[#7D52F4] flex items-center justify-center">
                <RiBookOpenLine className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] font-medium text-[#171717] font-aeonik-medium">
                  Documentation & Guides
                </h3>
                <p className="text-[13px] text-[#5C5C5C] leading-[20px]">
                  Step-by-step guides for Right to Work checks, Home Office audit readiness, and visa management.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Comprehensive knowledge base hub coming soon.")}
              className="flex items-center gap-1.5 text-[14px] font-medium text-[#7D52F4] hover:underline cursor-pointer self-start"
            >
              <span>Explore Guides</span>
              <RiExternalLinkLine className="size-4" />
            </button>
          </div>

          {/* Email Caseworker Support */}
          <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 shadow-sm flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-[12px] bg-[#EBF1FF] text-[#335CFF] flex items-center justify-center">
                <RiMailSendLine className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] font-medium text-[#171717] font-aeonik-medium">
                  Email Operations Team
                </h3>
                <p className="text-[13px] text-[#5C5C5C] leading-[20px]">
                  Get direct assistance from our immigration specialists for active case escalations and legal reviews.
                </p>
              </div>
            </div>
            <a
              href="mailto:support@viems.io"
              className="flex items-center gap-1.5 text-[14px] font-medium text-[#335CFF] hover:underline cursor-pointer self-start"
            >
              <span>support@viems.io</span>
              <RiExternalLinkLine className="size-4" />
            </a>
          </div>

          {/* Priority Hub / Live Support */}
          <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-6 shadow-sm flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-[12px] bg-[#F7F7F7] text-[#171717] flex items-center justify-center">
                <RiCustomerService2Line className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-medium text-[#171717] font-aeonik-medium">
                    Live Support Desk
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EFEBFF] text-[#7D52F4]">
                    Coming Soon
                  </span>
                </div>
                <p className="text-[13px] text-[#5C5C5C] leading-[20px]">
                  Real-time in-app chat support with dedicated caseworkers for urgent visa deadlines.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Live Chat Support will be enabled in the upcoming release.")}
              className="flex items-center gap-1.5 text-[14px] font-medium text-[#171717] hover:underline cursor-pointer self-start"
            >
              <span>Request Priority Access</span>
              <RiExternalLinkLine className="size-4" />
            </button>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-white border border-[#EBEBEB] rounded-[16px] p-8 shadow-sm flex flex-col gap-6">
          <h3 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
            Frequently Asked Questions
          </h3>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1 pb-4 border-b border-[#EBEBEB]">
              <h4 className="text-[15px] font-medium text-[#171717]">
                How do I initiate a Right to Work check for a new applicant?
              </h4>
              <p className="text-[13px] text-[#5C5C5C] leading-[20px]">
                Navigate to the Compliance section, select &quot;RTW Checks&quot;, and click &quot;New Check&quot; to generate a shareable verification link for the migrant.
              </p>
            </div>

            <div className="flex flex-col gap-1 pb-4 border-b border-[#EBEBEB]">
              <h4 className="text-[15px] font-medium text-[#171717]">
                What happens when a visa or passport is approaching expiry?
              </h4>
              <p className="text-[13px] text-[#5C5C5C] leading-[20px]">
                Automated email and in-app alerts are triggered at 90, 60, and 30-day thresholds prior to expiration according to your Notification preferences.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="text-[15px] font-medium text-[#171717]">
                How can I invite team members to my organization workspace?
              </h4>
              <p className="text-[13px] text-[#5C5C5C] leading-[20px]">
                Go to Settings &gt; Team &amp; Roles and click &quot;Invite member&quot; to assign Admin, Case Manager, or Viewer privileges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
