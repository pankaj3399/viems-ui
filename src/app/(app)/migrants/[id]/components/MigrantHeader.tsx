"use client";

import * as React from "react";
import {
  RiArrowLeftSLine,
  RiArrowDownSLine,
  RiEditBoxLine,
  RiMore2Line,
  RiStickyNoteLine,
  RiUploadLine,
  RiArchiveLine,
  RiDeleteBinLine,
  RiExchangeLine,
} from "@remixicon/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

interface MigrantHeaderProps {
  name?: string;
  avatar?: string;
  caseId?: string;
  cosRef?: string;
  socCode?: string;
  jobTitle?: string;
  approvalStatus?: string;
  onBack: () => void;
  onEditHeader?: () => void;
  onAddNote?: () => void;
  onChangeStatus?: () => void;
  onUpload?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

function getStatusDotColor(status?: string) {
  if (!status) return "#A4A4A4";
  const s = status.toUpperCase();
  if (s.includes("APPROVED") || s.includes("ACTIVE") || s.includes("GRANTED")) return "#1FC16B";
  if (s.includes("REFUSED") || s.includes("EXPIRED") || s.includes("REJECTED")) return "#FB3748";
  if (s.includes("PENDING") || s.includes("DRAFT")) return "#F59E0B";
  return "#A4A4A4";
}

function getStatusTextColor(status?: string) {
  if (!status) return "#0B4627";
  const s = status.toUpperCase();
  if (s.includes("APPROVED") || s.includes("ACTIVE") || s.includes("GRANTED")) return "#0B4627";
  if (s.includes("REFUSED") || s.includes("EXPIRED") || s.includes("REJECTED")) return "#7F1D1D";
  if (s.includes("PENDING") || s.includes("DRAFT")) return "#92400E";
  return "#0B4627";
}

export function MigrantHeader({
  name,
  avatar,
  caseId,
  cosRef,
  socCode,
  jobTitle,
  approvalStatus,
  onBack,
  onEditHeader,
  onAddNote,
  onChangeStatus,
  onUpload,
  onArchive,
  onDelete,
}: MigrantHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  const displayName = name || "—";
  const initials = getInitials(name || "") || "—";
  const formattedCaseId = caseId ? `#${caseId.replace(/^#/, "")}` : null;
  const formattedCosRef = cosRef ? `COS ${cosRef.replace(/^COS\s*/i, "")}` : null;
  const formattedSoc = socCode
    ? `SOC ${socCode}${jobTitle ? ` — ${jobTitle}` : ""}`
    : jobTitle || null;

  const subtitleParts = [formattedCaseId, formattedCosRef, formattedSoc].filter(Boolean);

  const dotColor = getStatusDotColor(approvalStatus);
  const textColor = getStatusTextColor(approvalStatus);
  const statusLabel = approvalStatus || "VISA APPROVED";

  return (
    <div className="px-[64px] pt-[32px] pb-[24px] flex items-center justify-between font-sans select-none bg-white rounded-t-[16px]">
      {/* Left: Back Button + Avatar + Name & Subtitle */}
      <div className="flex items-center gap-[16px] flex-1 min-w-0">
        {/* Back Button: 32×32, #F7F7F7, rounded-[10px], shadow-x-small */}
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="size-[32px] p-0 bg-[#F7F7F7] hover:bg-[#EBEBEB] shadow-x-small rounded-[10px] flex items-center justify-center cursor-pointer transition-colors border-0 shrink-0 text-[#5C5C5C] hover:text-[#171717]"
          title="Go back"
        >
          <RiArrowLeftSLine className="size-5" />
        </Button>

        {/* Avatar: 56×56 */}
        {avatar && !imgError ? (
          <img
            src={avatar}
            alt={displayName}
            onError={() => setImgError(true)}
            className="size-[56px] rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="size-[56px] rounded-full bg-[#EBEBEB] text-[#171717] flex items-center justify-center font-medium text-[20px] shrink-0 font-sans select-none">
            {initials}
          </div>
        )}

        {/* Name + Subtitle: gap-[4px] */}
        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
          <h1 className="font-aeonik-medium text-[24px] leading-[32px] text-[#171717]">
            {displayName}
          </h1>

          {subtitleParts.length > 0 && (
            <div className="flex items-center gap-[8px] leading-[20px] text-[#5C5C5C]">
              {subtitleParts.map((part, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-[#D1D1D1] text-[16px]">·</span>}
                  <span className={part?.startsWith("#") ? "font-mono text-[12px]" : "text-[13px]"}>
                    {part}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions: Status Pill + Edit Button + More Options */}
      <div className="flex items-center gap-[12px] shrink-0">
        {/* Status pill: "Status | ● VISA APPROVED ▾" */}
        {/* Matches Figma: white bg, border #EBEBEB, border-radius 96px, h-[24px] */}
        <div className="flex items-center bg-white border border-[#EBEBEB] rounded-[96px] h-[24px] overflow-hidden">
          {/* "Status" label cell */}
          <div className="flex items-center justify-center px-[12px] h-full border-r border-[#EBEBEB]">
            <span className="text-[12px] font-medium leading-[16px] text-[#A4A4A4] whitespace-nowrap">
              Status
            </span>
          </div>
          {/* Status value cell */}
          <Button
            type="button"
            variant="ghost"
            onClick={onChangeStatus}
            className="flex items-center gap-[2px] px-[10px] h-full rounded-none bg-white hover:bg-[#F5F5F5] transition-colors cursor-pointer border-0"
          >
            {/* Dot indicator */}
            <span className="size-[6px] rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
            {/* Status text */}
            <span
              className="text-[11px] font-medium leading-[12px] tracking-[0.02em] uppercase whitespace-nowrap mx-[4px]"
              style={{ color: textColor }}
            >
              {statusLabel}
            </span>
            {/* Chevron */}
            <RiArrowDownSLine className="size-4 text-[#A4A4A4] shrink-0" />
          </Button>
        </div>

        {/* Edit Button: h-[36px], #F5F5F5, rounded-[8px] */}
        {onEditHeader && (
          <Button
            type="button"
            variant="ghost"
            onClick={onEditHeader}
            className="h-[36px] px-[8px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] rounded-[8px] flex items-center gap-[4px] border-0 cursor-pointer transition-colors"
          >
            <RiEditBoxLine className="size-5 text-[#5C5C5C]" />
            <span className="text-label-sm text-[#5C5C5C]">Edit</span>
          </Button>
        )}

        {/* More Options Dropdown: 36×36, #F5F5F5, rounded-[10px] */}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="size-[36px] p-0 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] rounded-[10px] flex items-center justify-center border-0 cursor-pointer transition-colors"
                title="More options"
              >
                <RiMore2Line className="size-5 text-[#5C5C5C]" />
              </Button>
            }
          />
          <DropdownMenuContent
            align="end"
            className="w-[240px] bg-white border border-[#EBEBEB] rounded-[16px] shadow-regular-medium p-2 gap-[4px] flex flex-col z-50"
          >
            {onChangeStatus && (
              <DropdownMenuItem
                onClick={() => {
                  setOpen(false);
                  onChangeStatus();
                }}
                className="w-full h-9 px-2 py-2 text-left text-[14px] flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
              >
                <RiExchangeLine className="size-5 text-[#5C5C5C]" />
                <span className="flex-1">Change status</span>
              </DropdownMenuItem>
            )}

            {onAddNote && (
              <DropdownMenuItem
                onClick={() => {
                  setOpen(false);
                  onAddNote();
                }}
                className="w-full h-9 px-2 py-2 text-left text-[14px] flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
              >
                <RiStickyNoteLine className="size-5 text-[#5C5C5C]" />
                <span className="flex-1">Add note</span>
              </DropdownMenuItem>
            )}

            {onUpload && (
              <DropdownMenuItem
                onClick={() => {
                  setOpen(false);
                  onUpload();
                }}
                className="w-full h-9 px-2 py-2 text-left text-[14px] flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
              >
                <RiUploadLine className="size-5 text-[#5C5C5C]" />
                <span className="flex-1">Upload documents</span>
              </DropdownMenuItem>
            )}

            {(onAddNote || onUpload || onChangeStatus) && (onArchive || onDelete) && (
              <DropdownMenuSeparator className="w-full h-[1px] bg-[#EBEBEB] my-1" />
            )}

            {onArchive && (
              <DropdownMenuItem
                onClick={() => {
                  setOpen(false);
                  onArchive();
                }}
                className="w-full h-9 px-2 py-2 text-left text-[14px] flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
              >
                <RiArchiveLine className="size-5 text-[#5C5C5C]" />
                <span className="flex-1">Archive</span>
              </DropdownMenuItem>
            )}

            {onDelete && (
              <DropdownMenuItem
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                className="w-full h-9 px-2 py-2 text-left text-[14px] flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#FB3748] hover:bg-[#FFF5F5]"
              >
                <RiDeleteBinLine className="size-5 text-[#FB3748]" />
                <span className="flex-1">Delete profile</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
