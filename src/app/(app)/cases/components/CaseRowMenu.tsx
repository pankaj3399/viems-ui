"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, RefreshCw, XCircle, Eye } from "lucide-react";

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

  const menuItems = [
    {
      label: "View case details",
      icon: Eye,
      onClick: onViewDetails,
      variant: "default" as const,
    },
    {
      label: "Change case status",
      icon: RefreshCw,
      onClick: onChangeStatus,
      variant: "default" as const,
    },
    {
      label: "Mark as visa refused",
      icon: XCircle,
      onClick: onMarkRefused,
      variant: "destructive" as const,
    },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger render={
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-[#5C5C5C] hover:bg-neutral-100 hover:text-neutral-900"
        >
          <MoreVertical className="size-5" />
        </Button>
      } />

      <DropdownMenuContent align="end" className="w-[200px] bg-white border border-neutral-200 rounded-card shadow-card-large py-xs">
        {menuItems.map((item) => (
          <DropdownMenuItem
            key={item.label}
            variant={item.variant}
            onClick={item.onClick}
            className="w-full px-lg py-md text-left text-paragraph-sm flex items-center gap-sm cursor-pointer transition-colors border-0 bg-transparent"
          >
            <item.icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
