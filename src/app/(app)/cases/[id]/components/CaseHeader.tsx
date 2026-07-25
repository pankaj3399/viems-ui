"use client";

import * as React from "react";
import {
  RiArrowLeftSLine,
  RiArrowDownSLine,
  RiPencilLine,
  RiMore2Line,
  RiStickyNoteLine,
  RiUploadLine,
  RiArchiveLine,
  RiDeleteBinLine,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";

interface CaseHeaderProps {
  name: string;
  avatar?: string;
  visaStatus?: string;
  location?: string;
  caseId: string;
  cosRef: string;
  approvalStatus: string;
  showSocCode?: boolean;
  onBack: () => void;
  onChangeStatus?: () => void;
  onEditHeader?: () => void;
  onAddNote?: () => void;
}

export function CaseHeader({
  name,
  avatar,
  visaStatus,
  location,
  caseId,
  cosRef,
  approvalStatus,
  showSocCode = false,
  onBack,
  onChangeStatus,
  onEditHeader,
  onAddNote,
}: CaseHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  const initials = getInitials(name || "");
  const formattedCaseId = caseId ? `#${caseId.replace(/^#/, '')}` : "#430/2026";
  const formattedCosRef = cosRef ? `COS ${cosRef.replace(/^COS\s*/i, '')}` : "COS 2026-00430";

  return (
    <div className="px-[64px] pt-[32px] pb-[24px] flex items-center justify-between font-sans select-none">
      {/* Left: Back Button + Avatar + Name & Subtitle */}
      <div className="flex items-center gap-[16px] flex-1 min-w-0">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="size-9 bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-[10px] flex items-center justify-center cursor-pointer transition-colors border-0 shrink-0 text-[#5C5C5C] hover:text-[#171717]"
          title="Go back"
        >
          <RiArrowLeftSLine className="size-5" />
        </button>

        {/* Avatar */}
        {avatar && !imgError ? (
          <img
            src={avatar}
            alt={name}
            onError={() => setImgError(true)}
            className="size-14 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="size-14 rounded-full bg-[#EBEBEB] text-[#171717] flex items-center justify-center font-medium text-[20px] shrink-0 font-sans select-none">
            {initials}
          </div>
        )}

        {/* Name + Subtitle */}
        <div className="flex flex-col gap-[2px] flex-1 min-w-0">
          <div className="flex items-center gap-[12px]">
            <h1 className="font-aeonik-medium text-[24px] leading-[32px] font-medium text-[#171717]">
              {name}
            </h1>
            {visaStatus && (
              <span className="inline-flex items-center gap-xs h-4 px-2 bg-[#E3F7EC] text-[#0B4627] rounded-full text-[11px] font-medium uppercase tracking-[0.02em]">
                <span className="size-1.5 rounded-full bg-[#1FC16B]" />
                {visaStatus}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center h-4 px-2 bg-[#EFEBFF] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717]">
                {location}
              </span>
            )}
          </div>

          <div className="flex items-center gap-[8px] text-[#5C5C5C] font-mono text-[13px] leading-[20px]">
            <span>{formattedCaseId}</span>
            <span className="text-[#D1D1D1]">·</span>
            <span>{formattedCosRef}</span>
            {showSocCode && (
              <>
                <span className="text-[#D1D1D1]">·</span>
                <span>SOC 3416 — Arts / Entertainment</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Actions: Status Dropdown Pill | Edit Button | Three-Dots Menu */}
      <div className="flex items-center gap-[12px]">
        {/* Status Split Pill */}
        {(() => {
          const isApprovedStatus = approvalStatus?.toUpperCase().includes("APPROVED");
          const isRefusedStatus = approvalStatus?.toUpperCase().includes("REFUSED");
          const statusDotClass = isApprovedStatus
            ? "bg-[#1FC16B]"
            : isRefusedStatus
            ? "bg-[#FB3748]"
            : "bg-[#F6B51E]";
          const statusTextClass = isApprovedStatus
            ? "text-[#0B4627]"
            : isRefusedStatus
            ? "text-[#9B1C1C]"
            : "text-[#8A5300]";

          return (
            <button
              type="button"
              onClick={onChangeStatus}
              className="h-[36px] bg-white border border-[#EBEBEB] hover:border-[#7D52F4] rounded-full flex items-center p-0 cursor-pointer transition-all shadow-[0px_1px_2px_rgba(10,13,20,0.03)]"
            >
              <div className="px-3 h-full flex items-center border-r border-[#EBEBEB] bg-transparent">
                <span className="text-[13px] font-normal text-[#A4A4A4]">Status</span>
              </div>
              <div className="px-3 h-full flex items-center gap-[6px]">
                <span className={`size-1.5 rounded-full ${statusDotClass}`} />
                <span className={`text-[12px] font-semibold tracking-[0.02em] uppercase ${statusTextClass}`}>
                  {approvalStatus}
                </span>
                <RiArrowDownSLine className="size-4 text-[#5C5C5C]" />
              </div>
            </button>
          );
        })()}

        {/* Edit Button */}
        <button
          type="button"
          onClick={onEditHeader}
          className="h-[36px] px-3.5 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#171717] rounded-[10px] flex items-center gap-[6px] text-[14px] font-medium border-0 cursor-pointer transition-colors"
        >
          <RiPencilLine className="size-4 text-[#171717]" />
          <span>Edit</span>
        </button>

        {/* More Options Dropdown */}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger render={
            <button
              type="button"
              className="size-[36px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#171717] rounded-[10px] flex items-center justify-center border-0 cursor-pointer transition-colors"
              title="More options"
            >
              <RiMore2Line className="size-5 text-[#171717]" />
            </button>
          } />
          <DropdownMenuContent
            align="end"
            className="w-[251px] bg-white border border-[#EBEBEB] rounded-[16px] shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] p-2 gap-[4px] flex flex-col z-50"
          >
            <DropdownMenuItem
              onClick={() => {
                setOpen(false);
                if (onAddNote) onAddNote();
              }}
              className="w-[235px] h-9 px-2 py-2 text-left text-[14px] flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
            >
              <RiStickyNoteLine className="size-5 text-[#5C5C5C]" />
              <span className="flex-1">Add note</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setOpen(false)}
              className="w-[235px] h-9 px-2 py-2 text-left text-[14px] flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
            >
              <RiUploadLine className="size-5 text-[#5C5C5C]" />
              <span className="flex-1">Upload documents</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="w-[235px] h-[1px] bg-[#EBEBEB] my-1 self-center" />

            <DropdownMenuItem
              onClick={() => setOpen(false)}
              className="w-[235px] h-9 px-2 py-2 text-left text-[14px] flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
            >
              <RiArchiveLine className="size-5 text-[#5C5C5C]" />
              <span className="flex-1">Archive</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setOpen(false)}
              className="w-[235px] h-9 px-2 py-2 text-left text-[14px] flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#FB3748] hover:bg-[#FFF5F5]"
            >
              <RiDeleteBinLine className="size-5 text-[#FB3748]" />
              <span className="flex-1">Delete profile</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
