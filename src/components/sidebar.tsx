"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { formatFullName, getInitials as getInitialsHelper } from "@/lib/utils";
import {
  LayoutGrid,
  Users,
  FolderOpen,
  PieChart,
  Sliders,
  Settings,
  Headphones,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import {
  RiSettings2Line,
  RiEqualizerLine,
  RiHeadphoneLine,
  RiStarLine,
  RiLogoutBoxRLine,
  RiArrowRightSLine,
} from "@remixicon/react";

const CasesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M5.5 6.25V4C5.5 3.80109 5.57902 3.61032 5.71967 3.46967C5.86032 3.32902 6.05109 3.25 6.25 3.25H11.0605L12.5605 4.75H16.75C16.9489 4.75 17.1397 4.82902 17.2803 4.96967C17.421 5.11032 17.5 5.30109 17.5 5.5V13C17.5 13.1989 17.421 13.3897 17.2803 13.5303C17.1397 13.671 16.9489 13.75 16.75 13.75H14.5V16C14.5 16.1989 14.421 16.3897 14.2803 16.5303C14.1397 16.671 13.9489 16.75 13.75 16.75H3.25C3.05109 16.75 2.86032 16.671 2.71967 16.5303C2.57902 16.3897 2.5 16.1989 2.5 16V7C2.5 6.80109 2.57902 6.61032 2.71967 6.46967C2.86032 6.32902 3.05109 6.25 3.25 6.25H5.5ZM5.5 7.75H4V15.25H13V13.75H5.5V7.75Z"
      fill="currentColor"
    />
  </svg>
);

interface SidebarProps {
  userInfo?: {
    personalInfo?: {
      firstName?: string;
      lastName?: string;
    };
    email?: string;
    avatar?: string;
    role?: {
      value?: string;
    } | null;
  } | null;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ userInfo, isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Nav Items definition
  const mainNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutGrid,
    },
    {
      name: "Migrants",
      href: "/migrants",
      icon: Users,
    },
    {
      name: "Cases",
      href: "/cases",
      icon: CasesIcon,
    },
    {
      name: "Insights",
      href: "/insights",
      icon: PieChart,
    },
    ...(!userInfo || isAdmin(userInfo)
      ? [
          {
            name: "Admin",
            href: "/admin",
            icon: Sliders,
          },
        ]
      : []),
  ];

  const supportNavItems = [
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
    {
      name: "Support",
      href: "/support",
      icon: Headphones,
    },
  ];

  const getFallbackName = () => {
    if (userInfo?.email) {
      const username = userInfo.email.split("@")[0];
      return username
        .split(/[._-]/)
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }
    return "Alex Marin";
  };

  const getFullName = () => {
    const name = formatFullName(
      userInfo?.personalInfo?.firstName,
      userInfo?.personalInfo?.lastName
    );
    if (name && name !== "Unknown Migrant") return name;
    return getFallbackName();
  };

  const getInitials = () => {
    const fullName = getFullName();
    return getInitialsHelper(fullName);
  };

  const getEmail = () => {
    return userInfo?.email || "alex@viems.com";
  };

  return (
    <aside
      className={`h-full flex flex-col bg-[#171717] rounded-[16px] text-white select-none shrink-0 font-sans overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* ─── Sidebar Header [Sidebar] [1.1] ──────────────────────────────────── */}
      <div
        className={`h-[88px] w-full flex items-center bg-[#171717] shrink-0 transition-all duration-300 relative ${
          isOpen ? "px-6 justify-between" : "justify-center"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Header Card [Sidebar] [1.0] */}
          <div className="size-10 rounded-full bg-[#262626] shrink-0" />
          <span
            className={`text-title-aeonik text-white whitespace-nowrap transition-all duration-300 ${
              isOpen
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-2 pointer-events-none w-0 overflow-hidden"
            }`}
          >
            Viems
          </span>
        </div>

        {isOpen && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="size-10 rounded-[10px] hover:bg-white/5 flex items-center justify-center text-neutral-400 cursor-pointer transition-colors border-0 bg-transparent shrink-0"
            title="Collapse Sidebar"
          >
            <svg
              width="15"
              height="14"
              viewBox="0 0 15 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#A4A4A4]"
            >
              <path
                d="M14.25 0C14.4489 0 14.6397 0.0790176 14.7803 0.21967C14.921 0.360322 15 0.551088 15 0.75L15 12.75C15 12.9489 14.921 13.1397 14.7803 13.2803C14.6397 13.421 14.4489 13.5 14.25 13.5L0.75 13.5C0.551088 13.5 0.360322 13.421 0.21967 13.2803C0.0790176 13.1397 0 12.9489 0 12.75L0 0.75C0 0.551088 0.0790176 0.360322 0.21967 0.21967C0.360322 0.0790176 0.551088 0 0.75 0L14.25 0ZM9.75 1.5L1.5 1.5L1.5 12L9.75 12L9.75 1.5ZM13.5 1.5L11.25 1.5L11.25 12H13.5L13.5 1.5Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
      </div>

      {/* ─── Content Navigation Group ────────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col py-6 gap-6 bg-[#171717] overflow-y-auto transition-all duration-300 ${
          isOpen ? "items-stretch" : "items-center"
        }`}
      >
        <nav
          className={`flex flex-col gap-2 transition-all duration-300 ${
            isOpen ? "items-start px-6" : "items-center"
          }`}
        >
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center rounded-[8px] transition-all duration-300 border-0 group ${
                  isOpen ? "w-[208px] h-12 px-4 justify-start gap-3" : "size-12 justify-center"
                } ${
                  isActive
                    ? "bg-[#262626] text-white"
                    : "text-[#5C5C5C] hover:bg-[#1f1f1f] hover:text-white"
                }`}
                title={item.name}
              >
                <Icon
                  className={`size-6 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-[#5C5C5C] group-hover:text-white"
                  }`}
                />
                <span
                  className={`text-paragraph-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    isOpen
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 pointer-events-none w-0 overflow-hidden"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ─── Supporting Content Group (Pushes to bottom) ───────────────────── */}
        <div
          className={`mt-auto flex flex-col gap-6 transition-all duration-300 ${
            isOpen ? "items-stretch" : "items-center"
          }`}
        >
          <nav
            className={`flex flex-col gap-2 transition-all duration-300 ${
              isOpen ? "items-start px-6" : "items-center"
            }`}
          >
            {supportNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center rounded-[8px] transition-all duration-300 border-0 group ${
                    isOpen ? "w-[208px] h-12 px-4 justify-start gap-3" : "size-12 justify-center"
                  } ${
                    isActive
                      ? "bg-[#262626] text-white"
                      : "text-[#5C5C5C] hover:bg-[#1f1f1f] hover:text-white"
                  }`}
                  title={item.name}
                >
                  <Icon
                    className={`size-6 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-[#5C5C5C] group-hover:text-white"
                    }`}
                  />
                  <span
                    className={`text-paragraph-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      isOpen
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-2 pointer-events-none w-0 overflow-hidden"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ─── Sidebar Footer [Sidebar] [1.1] ──────────────────────────────────── */}
      <div className="h-[88px] w-full flex items-center justify-center bg-[#171717] border-t border-[#262626]/20 shrink-0">
        <UserProfileDropdown
          userInfo={userInfo}
          align="start"
          side="top"
          trigger={
            <button
              type="button"
              className={`rounded-[10px] border border-[#262626] bg-[#171717] flex items-center transition-all duration-300 hover:bg-[#262626] cursor-pointer ${
                isOpen ? "w-[208px] h-16 px-3 justify-start gap-3" : "size-16 justify-center"
              }`}
              title="User Profile Menu"
            >
              <div className="size-10 rounded-full bg-[#CAC0FF] text-[#351A75] font-semibold text-base flex items-center justify-center shrink-0">
                {getInitials()}
              </div>
              <div
                className={`flex flex-col items-start text-left min-w-0 transition-all duration-300 ${
                  isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 pointer-events-none w-0 overflow-hidden"
                }`}
              >
                <span className="font-sans text-paragraph-sm font-semibold text-white truncate w-full">
                  {getFullName()}
                </span>
                <span className="text-paragraph-xs text-neutral-400 truncate w-full">
                  {getEmail()}
                </span>
              </div>
            </button>
          }
        />
      </div>
    </aside>
  );
}
