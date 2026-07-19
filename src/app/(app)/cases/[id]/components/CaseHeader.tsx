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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CaseHeaderProps {
  name: string;
  avatar: string;
  visaStatus: string;
  location: string;
  caseId: string;
  cosRef: string;
  approvalStatus: string;
  onBack: () => void;
}

export function CaseHeader({
  name,
  avatar,
  visaStatus,
  location,
  caseId,
  cosRef,
  approvalStatus,
  onBack,
}: CaseHeaderProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="px-[64px] pt-[32px] pb-2xl flex items-center justify-between">
      {/* Left: Back + Avatar + Info */}
      <div className="flex items-center gap-xl flex-1 min-w-0">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="size-8 bg-[#F7F7F7] rounded-input shadow-x-small flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors border-0 shrink-0"
        >
          <RiArrowLeftSLine className="size-4 text-[#5C5C5C]" />
        </button>

        {/* Avatar */}
        <img
          src={avatar}
          alt={name}
          className="size-14 rounded-full object-cover shrink-0"
        />

        {/* Name + Badges + Subtitle */}
        <div className="flex flex-col gap-xs flex-1 min-w-0">
          {/* Name Row */}
          <div className="flex items-center gap-[9px]">
            <h1 className="text-title-aeonik text-[#171717]">{name}</h1>
            <Badge variant="success" withDot className="h-4 text-[11px] uppercase tracking-[0.02em] font-medium rounded-full px-2 gap-0 pl-[2px] pr-[8px]">
              {visaStatus}
            </Badge>
            <span className="inline-flex items-center h-4 px-2 bg-[#EFEBFF] rounded-full text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717]">
              {location}
            </span>
          </div>
          {/* Subtitle Row */}
          <div className="flex items-center gap-sm text-[#5C5C5C]">
            <span className="font-mono text-paragraph-xs">{caseId}</span>
            <span className="text-[#D1D1D1] text-[16px] leading-5">·</span>
            <span className="text-paragraph-compact">{cosRef}</span>
          </div>
        </div>
      </div>

      {/* Right: Status + Edit + More */}
      <div className="flex items-center gap-lg shrink-0">
        {/* Status Pill */}
        <div className="flex items-center h-6 border border-[#EBEBEB] rounded-full overflow-hidden bg-white">
          <div className="px-lg h-full flex items-center border-r border-[#EBEBEB]">
            <span className="text-paragraph-xs font-medium text-[#A4A4A4]">Status</span>
          </div>
          <div className="px-[10px] h-full flex items-center gap-[2px]">
            <span className="size-1.5 rounded-full bg-[#1FC16B]" />
            <span className="text-subheading-2xs text-[#0B4627] ml-1">{approvalStatus}</span>
            <RiArrowDownSLine className="size-4 text-[#A4A4A4] ml-0.5" />
          </div>
        </div>

        {/* Edit Button */}
        <Button
          variant="secondary"
          size="sm"
          className="h-9 px-sm bg-[#F5F5F5] rounded-[8px] flex items-center gap-xs cursor-pointer hover:bg-neutral-200 transition-colors border-0"
        >
          <RiPencilLine className="size-5 text-[#5C5C5C]" />
          <span className="text-label-sm text-[#5C5C5C] px-xs">Edit</span>
        </Button>

        {/* More Button Dropdown */}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger render={
            <Button
              variant="secondary"
              size="icon-sm"
              className="size-9 bg-[#F5F5F5] rounded-input flex items-center justify-center cursor-pointer hover:bg-neutral-200 transition-colors border-0"
            >
              <RiMore2Line className="size-5 text-[#5C5C5C]" />
            </Button>
          } />
          <DropdownMenuContent
            align="end"
            className="w-[251px] bg-white border border-[#EBEBEB] rounded-[16px] shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] p-2 gap-[4px] flex flex-col"
          >
            <DropdownMenuItem
              onClick={() => {}}
              className="w-[235px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
            >
              <RiStickyNoteLine className="size-5 text-[#5C5C5C]" />
              <span className="flex-1">Add note</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {}}
              className="w-[235px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
            >
              <RiUploadLine className="size-5 text-[#5C5C5C]" />
              <span className="flex-1">Upload documents</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="w-[235px] h-[1px] bg-[#EBEBEB] my-xs self-center" />

            <DropdownMenuItem
              onClick={() => {}}
              className="w-[235px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
            >
              <RiArchiveLine className="size-5 text-[#5C5C5C]" />
              <span className="flex-1">Archive</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {}}
              className="w-[235px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#FB3748] hover:bg-[#FFF5F5]"
            >
              <RiDeleteBinLine className="size-5 text-[#FB3748]" />
              <span className="flex-1">Delete case</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
