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
  RiFocus2Line,
  RiEyeLine,
  RiPencilLine,
  RiArchiveLine,
  RiDeleteBinLine,
  RiMore2Line,
} from "@remixicon/react";

interface CaseRowMenuProps {
  onChangeStatus: () => void;
  onMarkRefused: () => void;
  onViewDetails: () => void;
}

export function CaseRowMenu({
  onChangeStatus,
  onMarkRefused,
  onViewDetails,
}: CaseRowMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger render={
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-[#5C5C5C] hover:bg-neutral-100 hover:text-neutral-900 rounded-[8px]"
        >
          <RiMore2Line className="size-5" />
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
          <RiFocus2Line className="size-5 text-[#5C5C5C]" />
          <span className="flex-1">Focus</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onViewDetails}
          className="w-[235px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
        >
          <RiEyeLine className="size-5 text-[#5C5C5C]" />
          <span className="flex-1">Details</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={onChangeStatus}
          className="w-[235px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]"
        >
          <RiPencilLine className="size-5 text-[#5C5C5C]" />
          <span className="flex-1">Edit</span>
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
          onClick={onMarkRefused}
          className="w-[235px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#FB3748] hover:bg-[#FFF5F5]"
        >
          <RiDeleteBinLine className="size-5 text-[#FB3748]" />
          <span className="flex-1">Delete case</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
