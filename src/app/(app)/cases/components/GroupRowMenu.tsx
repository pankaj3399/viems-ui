"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  RiEyeLine,
  RiArchiveLine,
  RiDeleteBinLine,
  RiMore2Line,
} from "@remixicon/react";

interface GroupRowMenuProps {
  onViewGroup?: () => void;
  onArchiveGroup?: () => void;
  onDeleteGroup?: () => void;
}

export function GroupRowMenu({
  onViewGroup,
  onArchiveGroup,
  onDeleteGroup,
}: GroupRowMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-6 text-[#5C5C5C] hover:bg-neutral-100 hover:text-neutral-900 rounded-[6px] p-0 flex items-center justify-center border-0 bg-transparent cursor-pointer"
          >
            <RiMore2Line className="size-5" />
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        className="w-[200px] bg-white border border-[#EBEBEB] rounded-[16px] shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] p-2 gap-[4px] flex flex-col font-sans z-50"
      >
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onViewGroup?.();
          }}
          className="w-full h-9 px-3 py-2 text-left text-paragraph-sm flex items-center gap-[10px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
        >
          <RiEyeLine className="size-5 text-[#171717]" />
          <span className="flex-1">View group</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="w-full h-[1px] bg-[#EBEBEB] my-1" />

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onArchiveGroup?.();
          }}
          className="w-full h-9 px-3 py-2 text-left text-paragraph-sm flex items-center gap-[10px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
        >
          <RiArchiveLine className="size-5 text-[#171717]" />
          <span className="flex-1">Archive</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDeleteGroup?.();
          }}
          className="w-full h-9 px-3 py-2 text-left text-paragraph-sm flex items-center gap-[10px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#FB3748] hover:bg-[#FFF5F5]"
        >
          <RiDeleteBinLine className="size-5 text-[#FB3748]" />
          <span className="flex-1">Delete group</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
