"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { formatFullName, getInitials as getInitialsHelper } from "@/lib/utils";
import {
  LayoutGrid,
  Users,
  Sliders,
  Settings,
  Headphones,
} from "lucide-react";
import {
  RiPieChartLine,
  RiPieChartFill,
  RiShieldCheckLine,
  RiShieldCheckFill,
  RiShieldFill,
  RiShieldLine,
  RiFolderShieldFill,
  RiFileCheckLine,
  RiFileTextLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiCustomerService2Line,
  RiCustomerService2Fill,
  RiLayoutGridLine,
  RiLayoutGridFill,
  RiGroupLine,
  RiGroupFill,
  RiEqualizerLine,
  RiEqualizerFill,
} from "@remixicon/react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";

const CasesIcon = ({ active, ...props }: { active?: boolean } & React.SVGProps<SVGSVGElement>) => (
  active ? (
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
  ) : (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform="translate(2.5, 3)">
        <path
          d="M3 3V0.75C3 0.551088 3.07902 0.360322 3.21967 0.21967C3.36032 0.0790176 3.55109 0 3.75 0H8.5605L10.0605 1.5H14.25C14.4489 1.5 14.6397 1.57902 14.7803 1.71967C14.921 1.86032 15 2.05109 15 2.25V9.75C15 9.94891 14.921 10.1397 14.7803 10.2803C14.6397 10.421 14.4489 10.5 14.25 10.5H12V12.75C12 12.9489 11.921 13.1397 11.7803 13.2803C11.6397 13.421 11.4489 13.5 11.25 13.5H0.75C0.551088 13.5 0.360322 13.421 0.21967 13.2803C0.0790176 13.1397 0 12.9489 0 12.75V3.75C0 3.55109 0.0790176 3.36032 0.21967 3.21967C0.360322 3.07902 0.551088 3 0.75 3H3ZM3 4.5H1.5V12H10.5V10.5H3V4.5ZM4.5 1.5V9H13.5V3H9.4395L7.9395 1.5H4.5Z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
);

const SettingsIcon = ({ active, ...props }: { active?: boolean } & React.SVGProps<SVGSVGElement>) => (
  active ? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M5.68934 2.17484L7.64459 0.21959C7.78524 0.0789866 7.97597 0 8.17484 0C8.37371 0 8.56444 0.0789866 8.70509 0.21959L10.6603 2.17484H13.4248C13.6238 2.17484 13.8145 2.25386 13.9552 2.39451C14.0958 2.53516 14.1748 2.72593 14.1748 2.92484V5.68934L16.1301 7.64459C16.2707 7.78524 16.3497 7.97597 16.3497 8.17484C16.3497 8.37371 16.2707 8.56444 16.1301 8.70509L14.1748 10.6603V13.4248C14.1748 13.6238 14.0958 13.8145 13.9552 13.9552C13.8145 14.0958 13.6238 14.1748 13.4248 14.1748H10.6603L8.70509 16.1301C8.56444 16.2707 8.37371 16.3497 7.64459 16.1301L5.68934 14.1748H2.92484C2.72593 14.1748 2.53516 14.0958 2.39451 13.9552C2.25386 13.8145 2.17484 13.6238 2.17484 13.4248V10.6603L0.21959 8.70509C0.0789866 8.56444 0 8.37371 0 8.17484C0 7.97597 0.0789866 7.78524 0.21959 7.64459L2.17484 5.68934V2.92484C2.17484 2.72593 2.25386 2.53516 2.39451 2.39451C2.53516 2.25386 2.72593 2.17484 2.92484 2.17484H5.68934ZM8.17484 10.4248C8.77158 10.4248 9.34387 10.1878 9.76583 9.76583C10.1878 9.34387 10.4248 8.77158 10.4248 8.17484C10.4248 7.5781 10.1878 7.00581 9.76583 6.58385C9.34387 6.16189 8.77158 5.92484 8.17484 5.92484C7.5781 5.92484 7.00581 6.16189 6.58385 6.58385C6.16189 7.00581 5.92484 7.5781 5.92484 8.17484C5.92484 8.77158 6.16189 9.34387 6.58385 9.76583C7.00581 10.1878 7.5781 10.4248 8.17484 10.4248V10.4248Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  ) : (
    <Settings {...props} />
  )
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
  const [isComplianceOpen, setIsComplianceOpen] = React.useState(true);

  // Nav Items definition using original icons (LayoutGrid, Users, CasesIcon, PieChart, Sliders, SettingsIcon, Headphones)
  const mainNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutGrid,
    },
    {
      name: "Compliance",
      href: "/compliance",
      icon: RiShieldCheckLine,
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
      icon: RiPieChartLine,
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
      icon: SettingsIcon,
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
      {/* Sidebar Header */}
      <div
        className={`h-[88px] w-full flex items-center bg-[#171717] shrink-0 transition-all duration-300 relative ${
          isOpen ? "px-6 justify-between" : "justify-center"
        }`}
      >
        <button
          type="button"
          className={`flex items-center gap-3 bg-transparent border-0 text-left p-0 ${!isOpen && onToggle ? "cursor-pointer" : ""}`}
          onClick={!isOpen ? onToggle : undefined}
          title={!isOpen ? "Expand Sidebar" : undefined}
        >
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
        </button>

        {isOpen && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="size-10 rounded-[10px] hover:bg-white/5 flex items-center justify-center text-neutral-400 cursor-pointer transition-colors border-0 bg-transparent shrink-0"
            title="Collapse Sidebar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A4A4A4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <rect width="18" height="18" x="3" y="3" rx="3" />
              <path d="M9 3v18" />
            </svg>
          </button>
        )}
      </div>

      {/* Content Navigation Group */}
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

            if (item.name === "Compliance") {
              const isComplianceActive = pathname.startsWith("/compliance");

              return (
                <div key="Compliance" className="flex flex-col gap-1 w-full">
                  <button
                    type="button"
                    aria-label="Compliance"
                    onClick={() => {
                      if (!isOpen) {
                        router.push("/compliance");
                      } else {
                        setIsComplianceOpen((prev) => !prev);
                      }
                    }}
                    className={`relative flex items-center justify-between rounded-[8px] transition-all duration-300 border-0 cursor-pointer group ${
                      isOpen ? "w-[208px] h-9 px-2.5" : "size-12 justify-center"
                    } ${
                      isComplianceActive
                        ? "text-white"
                        : "text-[#5C5C5C] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <RiShieldFill
                        className={`size-5 shrink-0 transition-colors ${
                          isComplianceActive ? "text-white" : "text-[#5C5C5C] group-hover:text-white"
                        }`}
                      />
                      {isOpen && (
                        <span
                          className={`text-[14px] font-medium whitespace-nowrap transition-colors ${
                            isComplianceActive ? "text-white" : "text-[#5C5C5C] group-hover:text-white"
                          }`}
                        >
                          Compliance
                        </span>
                      )}
                    </div>
                    {isOpen && (
                      <RiArrowUpSLine
                        className={`size-5 text-[#7B7B7B] transition-transform ${
                          isComplianceOpen ? "" : "rotate-180"
                        }`}
                      />
                    )}
                  </button>

                  {/* Accordion Submenu Items (Indented 34px / pl-6) */}
                  {isOpen && isComplianceOpen && (
                    <div className="flex flex-col gap-1 w-full pl-6">
                      {/* Subitem 1: Compliance Centre */}
                      <Link
                        href="/compliance"
                        className={`relative flex items-center gap-2 h-9 px-2.5 rounded-[8px] transition-all border-0 text-[14px] font-medium ${
                          pathname === "/compliance"
                            ? "bg-[#262626] text-white"
                            : "text-[#5C5C5C] hover:bg-[#1f1f1f] hover:text-white"
                        }`}
                      >
                        <RiFolderShieldFill className={`size-5 shrink-0 ${pathname === "/compliance" ? "text-white" : "text-[#5C5C5C]"}`} />
                        <span className="whitespace-nowrap truncate">Compliance Centre</span>
                      </Link>

                      {/* Subitem 2: RTW Checks */}
                      <Link
                        href="/compliance/rtw-checks"
                        className={`relative flex items-center gap-2 h-9 px-2.5 rounded-[8px] transition-all border-0 text-[14px] font-medium ${
                          pathname.startsWith("/compliance/rtw-checks")
                            ? "bg-[#262626] text-white"
                            : "text-[#5C5C5C] hover:bg-[#1f1f1f] hover:text-white"
                        }`}
                      >
                        <RiFileCheckLine className={`size-5 shrink-0 ${pathname.startsWith("/compliance/rtw-checks") ? "text-white" : "text-[#5C5C5C]"}`} />
                        <span className="whitespace-nowrap truncate">RTW Checks</span>
                      </Link>

                      {/* Subitem 3: Documents */}
                      <Link
                        href="/compliance/documents"
                        className={`relative flex items-center gap-2 h-9 px-2.5 rounded-[8px] transition-all border-0 text-[14px] font-medium ${
                          pathname.startsWith("/compliance/documents")
                            ? "bg-[#262626] text-white"
                            : "text-[#5C5C5C] hover:bg-[#1f1f1f] hover:text-white"
                        }`}
                      >
                        <RiFileTextLine className={`size-5 shrink-0 ${pathname.startsWith("/compliance/documents") ? "text-white" : "text-[#5C5C5C]"}`} />
                        <span className="whitespace-nowrap truncate">Documents</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

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
                {item.name === "Dashboard" ? (
                  isActive ? (
                    <RiLayoutGridFill className="size-6 shrink-0 text-white transition-colors" />
                  ) : (
                    <RiLayoutGridLine className="size-6 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                  )
                ) : item.name === "Compliance" ? (
                  isActive ? (
                    <RiShieldCheckFill className="size-6 shrink-0 text-white transition-colors" />
                  ) : (
                    <RiShieldCheckLine className="size-6 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                  )
                ) : item.name === "Migrants" ? (
                  isActive ? (
                    <RiGroupFill className="size-6 shrink-0 text-white transition-colors" />
                  ) : (
                    <RiGroupLine className="size-6 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                  )
                ) : item.name === "Cases" ? (
                  <CasesIcon
                    active={isActive}
                    className={`size-6 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-[#5C5C5C] group-hover:text-white"
                    }`}
                  />
                ) : item.name === "Insights" ? (
                  isActive ? (
                    <RiPieChartFill className="size-6 shrink-0 text-white transition-colors" />
                  ) : (
                    <RiPieChartLine className="size-6 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                  )
                ) : item.name === "Admin" ? (
                  isActive ? (
                    <RiEqualizerFill className="size-6 shrink-0 text-white transition-colors" />
                  ) : (
                    <RiEqualizerLine className="size-6 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                  )
                ) : (
                  <Icon
                    className={`size-6 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-[#5C5C5C] group-hover:text-white"
                    }`}
                  />
                )}
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

        {/* Supporting Content Group */}
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
                  {item.name === "Settings" ? (
                    <SettingsIcon
                      active={isActive}
                      className={`size-6 shrink-0 transition-colors ${
                        isActive ? "text-white" : "text-[#5C5C5C] group-hover:text-white"
                      }`}
                    />
                  ) : item.name === "Support" ? (
                    isActive ? (
                      <RiCustomerService2Fill className="size-6 shrink-0 text-white transition-colors" />
                    ) : (
                      <RiCustomerService2Line className="size-6 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                    )
                  ) : (
                    <Icon
                      className={`size-6 shrink-0 transition-colors ${
                        isActive ? "text-white" : "text-[#5C5C5C] group-hover:text-white"
                      }`}
                    />
                  )}
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

      {/* Sidebar Footer */}
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
