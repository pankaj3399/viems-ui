"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { formatFullName, getInitials as getInitialsHelper } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  RiSettings2Line,
  RiEqualizerLine,
  RiHeadphoneLine,
  RiStarLine,
  RiLogoutBoxRLine,
  RiArrowRightSLine,
} from "@remixicon/react";

interface UserProfileDropdownProps {
  userInfo?: any;
  trigger?: React.ReactElement;
  align?: "start" | "end" | "center";
  side?: "top" | "bottom" | "left" | "right";
}

export function UserProfileDropdown({
  userInfo,
  trigger,
  align = "end",
  side = "bottom",
}: UserProfileDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  const getInitials = () => {
    const name = formatFullName(
      userInfo?.personalInfo?.firstName,
      userInfo?.personalInfo?.lastName
    );
    if (name && name !== "Unknown Migrant") {
      return getInitialsHelper(name);
    }
    if (userInfo?.email) {
      return userInfo.email[0].toUpperCase();
    }
    return "AM";
  };

  const getFullName = () => {
    const name = formatFullName(
      userInfo?.personalInfo?.firstName,
      userInfo?.personalInfo?.lastName
    );
    if (name && name !== "Unknown Migrant") return name;
    return "Alex Marin";
  };

  const getEmail = () => {
    return userInfo?.email || "alex@viems.com";
  };

  const defaultTrigger = (
    <button
      type="button"
      className="size-12 rounded-full bg-[#CAC0FF] text-[#351A75] font-semibold text-base flex items-center justify-center select-none shadow-x-small shrink-0 cursor-pointer hover:opacity-90 transition-opacity border-0"
      title="User Profile Menu"
    >
      {getInitials()}
    </button>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger render={trigger || defaultTrigger} />

      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={8}
        className="w-[296px] bg-white border border-[#EBEBEB] rounded-[18px] p-[6px] gap-[4px] flex flex-col z-50 font-sans cursor-default outline-none shadow-card-large"
        style={{
          boxShadow:
            "0px 20px 20px -10px rgba(23, 23, 23, 0.04), 0px 10px 10px -5px rgba(23, 23, 23, 0.04), 0px 6px 6px -3px rgba(23, 23, 23, 0.04), 0px 3px 3px -1.5px rgba(23, 23, 23, 0.04), 0px 1px 1px -0.5px rgba(23, 23, 23, 0.04), 0px 0px 0px 1px rgba(23, 23, 23, 0.08), inset 0px -1px 1px -0.5px rgba(23, 23, 23, 0.06)",
        }}
      >
        {/* Header row / User Profile Card */}
        <div className="w-[284px] h-[56px] px-2 py-2 flex items-center gap-[12px] bg-white rounded-[10px] shrink-0">
          <div className="size-10 rounded-full bg-[#CAC0FF] text-[#351A75] font-semibold text-base flex items-center justify-center shrink-0">
            {getInitials()}
          </div>
          <div className="flex flex-col text-left min-w-0 flex-1">
            <span className="text-[14px] font-medium leading-[20px] tracking-[-0.006em] text-[#171717] truncate">
              {getFullName()}
            </span>
            <span className="text-[13px] font-medium leading-[20px] tracking-[-0.006em] text-[#A4A4A4] truncate">
              {getEmail()}
            </span>
          </div>
          <span className="inline-flex items-center h-4 px-2 py-0.5 bg-[#EFEBFF] rounded-full text-[12px] font-medium leading-[12px] text-[#7D52F4] shrink-0">
            Admin
          </span>
        </div>

        {/* Divider */}
        <div className="w-[284px] h-px bg-[#EBEBEB] my-0.5 shrink-0" />

        {/* Item: Settings */}
        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="w-[284px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[12px] font-medium text-[#5C5C5C] hover:bg-neutral-50 hover:text-neutral-900"
        >
          <RiSettings2Line className="size-5 text-[#A4A4A4]" />
          <span className="flex-1">Settings</span>
        </DropdownMenuItem>

        {/* Item: Preferences */}
        <DropdownMenuItem
          onClick={() => {}}
          className="w-[284px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center justify-between cursor-pointer transition-colors border-0 bg-[#F7F7F7] rounded-[12px] font-medium text-[#171717] hover:bg-neutral-100"
        >
          <div className="flex items-center gap-[8px] min-w-0">
            <RiEqualizerLine className="size-5 text-[#171717]" />
            <span className="truncate">Preferences</span>
          </div>
          <RiArrowRightSLine className="size-5 text-[#A4A4A4]" />
        </DropdownMenuItem>

        {/* Divider */}
        <div className="w-[284px] h-px bg-[#EBEBEB] my-0.5 shrink-0" />

        {/* Item: Help & support */}
        <DropdownMenuItem
          onClick={() => router.push("/support")}
          className="w-[284px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[12px] font-medium text-[#5C5C5C] hover:bg-neutral-50 hover:text-neutral-900"
        >
          <RiHeadphoneLine className="size-5 text-[#A4A4A4]" />
          <span className="flex-1">Help & support</span>
        </DropdownMenuItem>

        {/* Item: What's new */}
        <DropdownMenuItem
          onClick={() => {}}
          className="w-[284px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[12px] font-medium text-[#5C5C5C] hover:bg-neutral-50 hover:text-neutral-900"
        >
          <RiStarLine className="size-5 text-[#A4A4A4]" />
          <span className="flex-1">What&apos;s new</span>
        </DropdownMenuItem>

        {/* Divider */}
        <div className="w-[284px] h-px bg-[#EBEBEB] my-0.5 shrink-0" />

        {/* Item: Sign out */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="w-[284px] h-9 px-2 py-2 text-left text-paragraph-sm flex items-center gap-[8px] cursor-pointer transition-colors border-0 bg-transparent rounded-[12px] font-medium text-[#5C5C5C] hover:bg-neutral-50 hover:text-neutral-900"
        >
          <RiLogoutBoxRLine className="size-5 text-[#681219]" />
          <span className="flex-1">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
