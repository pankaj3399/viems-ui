"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeToken, isAdmin } from "@/lib/auth";
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
}

export default function Sidebar({ userInfo }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Handle Logout
  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

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

  // Helper to extract user initials for avatar
  const getInitials = () => {
    if (
      userInfo?.personalInfo?.firstName &&
      userInfo?.personalInfo?.lastName
    ) {
      return `${userInfo.personalInfo.firstName[0]}${userInfo.personalInfo.lastName[0]}`.toUpperCase();
    }
    if (userInfo?.email) {
      return userInfo.email[0].toUpperCase();
    }
    return "AM"; // Default fallback (Alex Marin)
  };

  const getFullName = () => {
    if (
      userInfo?.personalInfo?.firstName &&
      userInfo?.personalInfo?.lastName
    ) {
      return `${userInfo.personalInfo.firstName} ${userInfo.personalInfo.lastName}`;
    }
    return "Alex Marin";
  };

  const getEmail = () => {
    return userInfo?.email || "alex@viems.com";
  };

  return (
    <aside className="w-[272px] h-screen sticky top-0 flex flex-col bg-[#171717] border-r border-neutral-800 text-white select-none shrink-0 font-sans">
      {/* ─── Sidebar Header [Sidebar] [1.1] ──────────────────────────────────── */}
      <div className="h-[88px] w-full flex items-center justify-start px-xl gap-md border-b border-neutral-800 bg-[#171717] shrink-0">
        <div className="flex items-center gap-md w-full">
          {/* Synergy Logo Icon (simple dark neutral circle matching the screenshot) */}
          <div className="size-10 rounded-full bg-neutral-700 shrink-0" />
          <span className="text-h5-title font-semibold text-white tracking-tight">
            Viems
          </span>
        </div>
      </div>

      {/* ─── Content Navigation Group ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-xl py-xl gap-xl bg-[#171717] overflow-y-auto">
        <nav className="flex flex-col gap-sm">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-md px-[10px] py-[8px] h-9 rounded-lg transition-colors text-label-sm font-semibold select-none group border-0 ${
                  isActive
                    ? "bg-[#262626] text-white"
                    : "text-neutral-400 hover:bg-[#1f1f1f] hover:text-white"
                }`}
              >
                {/* Active Indicator Bar (Rectangle 1 from Figma specs) */}
                {isActive && (
                  <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-5 bg-[#7D52F4] rounded-r-md" />
                )}

                <Icon
                  className={`size-5 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-[#5C5C5C] group-hover:text-white"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ─── Supporting Content Group (Pushes to bottom) ───────────────────── */}
        <div className="mt-auto flex flex-col gap-sm">
          <nav className="flex flex-col gap-sm">
            {supportNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center gap-md px-[10px] py-[8px] h-9 rounded-lg transition-colors text-label-sm font-semibold select-none group border-0 ${
                    isActive
                      ? "bg-[#262626] text-white"
                      : "text-neutral-400 hover:bg-[#1f1f1f] hover:text-white"
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-5 bg-[#7D52F4] rounded-r-md" />
                  )}

                  <Icon
                    className={`size-5 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-[#5C5C5C] group-hover:text-white"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ─── Sidebar Footer [Sidebar] [1.1] ──────────────────────────────────── */}
      <div className="h-[88px] w-full flex items-center justify-center px-xl border-t border-neutral-800 bg-[#171717] shrink-0">
        {/* User Profile Card [Sidebar] [1.1] */}
        <div className="w-[248px] h-[64px] rounded-lg border border-neutral-800 bg-[#171717] p-3 flex items-center justify-between gap-md select-none">
          <div className="flex items-center gap-md min-w-0">
            {/* Avatar [1.1] */}
            <div className="size-10 rounded-full bg-[#CAC0FF] text-[#351A75] font-semibold text-label-md flex items-center justify-center shrink-0">
              {getInitials()}
            </div>

            {/* Text details */}
            <div className="flex flex-col min-w-0">
              <span className="text-label-sm font-semibold text-white truncate max-w-[120px]">
                {getFullName()}
              </span>
              <span className="text-paragraph-xs text-neutral-400 truncate max-w-[120px]">
                {getEmail()}
              </span>
            </div>
          </div>

          {/* Logout Button (replacing the right arrow button for functional logout) */}
          <button
            type="button"
            onClick={handleLogout}
            className="size-7 rounded-md hover:bg-[#262626] flex items-center justify-center text-neutral-500 hover:text-white transition-colors border-0 bg-transparent cursor-pointer shrink-0"
            title="Log Out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
