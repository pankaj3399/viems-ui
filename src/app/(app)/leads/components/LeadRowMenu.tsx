"use client";

import * as React from "react";
import {
  RiMore2Line,
  RiEyeLine,
  RiEditLine,
  RiArrowUpDownLine,
  RiSortDesc,
  RiExchangeLine,
  RiArchiveLine,
  RiRefreshLine,
  RiDeleteBinLine,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeadRowMenuProps {
  isArchived?: boolean;
  onViewDetails: () => void;
  onEdit?: () => void;
  onChangeStatus?: () => void;
  onChangePriority?: () => void;
  onConvert?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
}

const itemClassName =
  "w-[235px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[8px] font-medium text-[#171717] hover:bg-[#F5F5F5]";
const itemIconClassName = "size-5 text-[#5C5C5C]";

export function LeadRowMenu({
  isArchived = false,
  onViewDetails,
  onEdit,
  onChangeStatus,
  onChangePriority,
  onConvert,
  onArchive,
  onRestore,
  onDelete,
}: LeadRowMenuProps) {
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
        {isArchived ? (
          <>
            <DropdownMenuItem onClick={onViewDetails} className={itemClassName}>
              <RiEyeLine className={itemIconClassName} />
              <span className="flex-1">View lead</span>
            </DropdownMenuItem>
            {onRestore && (
              <DropdownMenuItem onClick={onRestore} className={itemClassName}>
                <RiRefreshLine className={itemIconClassName} />
                <span className="flex-1">Restore lead</span>
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className={`${itemClassName} !text-[#FB3748] [&_svg]:!text-[#FB3748]`}
              >
                <RiDeleteBinLine className={itemIconClassName} />
                <span className="flex-1">Delete permanently</span>
              </DropdownMenuItem>
            )}
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={onViewDetails} className={itemClassName}>
              <RiEyeLine className={itemIconClassName} />
              <span className="flex-1">View lead</span>
            </DropdownMenuItem>

            {onConvert && (
              <DropdownMenuItem onClick={onConvert} className={itemClassName}>
                <RiExchangeLine className={itemIconClassName} />
                <span className="flex-1">Convert to migrant</span>
              </DropdownMenuItem>
            )}

            {onChangeStatus && (
              <>
                <div className="mx-[4px] h-px bg-[#EBEBEB]" />
                <DropdownMenuItem onClick={onChangeStatus} className={itemClassName}>
                  <RiArrowUpDownLine className={itemIconClassName} />
                  <span className="flex-1">Change status</span>
                </DropdownMenuItem>
              </>
            )}

            {onChangePriority && (
              <DropdownMenuItem onClick={onChangePriority} className={itemClassName}>
                <RiSortDesc className={itemIconClassName} />
                <span className="flex-1">Change priority</span>
              </DropdownMenuItem>
            )}

            {onEdit && (
              <>
                <div className="mx-[4px] h-px bg-[#EBEBEB]" />
                <DropdownMenuItem onClick={onEdit} className={itemClassName}>
                  <RiEditLine className={itemIconClassName} />
                  <span className="flex-1">Edit lead</span>
                </DropdownMenuItem>
              </>
            )}

            {onArchive && (
              <>
                <div className="mx-[4px] h-px bg-[#EBEBEB]" />
                <DropdownMenuItem onClick={onArchive} className={itemClassName}>
                  <RiArchiveLine className={itemIconClassName} />
                  <span className="flex-1">Archive lead</span>
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
