"use client";

import * as React from "react";
import {
  RiArrowLeftSLine,
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
  onBack: () => void;
  onEditHeader?: () => void;
  onAddNote?: () => void;
  onChangeStatus?: () => void;
  onUpload?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export function MigrantHeader({
  name,
  avatar,
  caseId,
  cosRef,
  socCode,
  jobTitle,
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

  return (
    <div className="px-[64px] pt-[32px] pb-[24px] flex items-center justify-between font-sans select-none bg-white rounded-t-[16px]">
      {/* Left: Back Button + Avatar + Name & Subtitle */}
      <div className="flex items-center gap-[16px] flex-1 min-w-0">
        {/* Back Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="size-8 p-0 bg-[#F7F7F7] hover:bg-[#EBEBEB] shadow-[0px_1px_2px_rgba(10,13,20,0.03)] rounded-[10px] flex items-center justify-center cursor-pointer transition-colors border-0 shrink-0 text-[#5C5C5C] hover:text-[#171717]"
          title="Go back"
        >
          <RiArrowLeftSLine className="size-5" />
        </Button>

        {/* Avatar */}
        {avatar && !imgError ? (
          <img
            src={avatar}
            alt={displayName}
            onError={() => setImgError(true)}
            className="size-14 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="size-14 rounded-full bg-[#EBEBEB] text-[#171717] flex items-center justify-center font-medium text-[20px] shrink-0 font-sans select-none">
            {initials}
          </div>
        )}

        {/* Name + Subtitle */}
        <div className="flex flex-col gap-[4px] flex-1 min-w-0">
          <h1 className="font-aeonik-medium text-[24px] leading-[32px] font-medium text-[#171717]">
            {displayName}
          </h1>

          {subtitleParts.length > 0 && (
            <div className="flex items-center gap-[8px] text-[13px] leading-[20px] text-[#5C5C5C]">
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

      {/* Right Actions: Edit Button + More Options */}
      <div className="flex items-center gap-[12px]">
        {/* Edit Button */}
        {onEditHeader && (
          <Button
            type="button"
            variant="ghost"
            onClick={onEditHeader}
            className="h-[40px] px-[12px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] rounded-[10px] flex items-center gap-[4px] text-[14px] font-medium border-0 cursor-pointer transition-colors"
          >
            <RiEditBoxLine className="size-5 text-[#5C5C5C]" />
            <span>Edit</span>
          </Button>
        )}

        {/* More Options Dropdown */}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="size-[40px] p-0 bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] hover:text-[#171717] rounded-[10px] flex items-center justify-center border-0 cursor-pointer transition-colors"
                title="More options"
              >
                <RiMore2Line className="size-5 text-[#5C5C5C]" />
              </Button>
            }
          />
          <DropdownMenuContent
            align="end"
            className="w-[240px] bg-white border border-[#EBEBEB] rounded-[16px] shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] p-2 gap-[4px] flex flex-col z-50"
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
