"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { formatFullName, getInitials as getInitialsHelper } from "@/lib/utils";
import {
  RiPieChartLine,
  RiPieChartFill,
  RiShieldFill,
  RiShieldLine,
  RiFolderShieldFill,
  RiFolderShieldLine,
  RiFileCheckLine,
  RiFileCheckFill,
  RiFileTextLine,
  RiFileTextFill,
  RiArrowUpSLine,
  RiCustomerService2Line,
  RiCustomerService2Fill,
  RiLayoutGridLine,
  RiLayoutGridFill,
  RiUserLine,
  RiUserFill,
  RiTeamLine,
  RiTeamFill,
  RiArrowRightSLine,
  RiSettings2Line,
  RiLayoutRightLine,
} from "@remixicon/react";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { LogoIcon } from "@/components/Logo";

const CasesIcon = ({ active, className, ...props }: { active?: boolean; className?: string } & React.SVGProps<SVGSVGElement>) => (
  active ? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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
      className={className}
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

interface SidebarProps {
  userInfo?: {
    personalInfo?: {
      firstName?: string;
      lastName?: string;
    };
    email?: string;
    avatar?: string | number;
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

  React.useEffect(() => {
    if (pathname.startsWith("/compliance")) {
      setIsComplianceOpen(true);
    }
  }, [pathname]);

  const mainNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
    },
    {
      name: "Compliance",
      href: "/compliance",
    },
    {
      name: "Migrants",
      href: "/migrants",
    },
    {
      name: "Cases",
      href: "/cases",
    },
    {
      name: "Insights",
      href: "/insights",
    },
    ...(!userInfo || isAdmin(userInfo)
      ? [
          {
            name: "Team",
            href: "/team",
          },
        ]
      : []),
  ];

  const supportNavItems = [
    {
      name: "Settings",
      href: "/settings",
    },
    {
      name: "Support",
      href: "/support",
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
      className={`h-full flex flex-col bg-[#171717] rounded-[16px] text-white shrink-0 font-sans overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Header Card [Sidebar] [1.0] */}
      <div
        className={`h-16 w-full flex items-center bg-[#171717] rounded-[10px] shrink-0 transition-all duration-300 isolate ${
          isOpen ? "py-3 pl-2 pr-[18px] gap-2 justify-between" : "p-2 justify-center"
        }`}
      >
        <button
          type="button"
          aria-label={!isOpen && onToggle ? "Expand sidebar" : "Go to dashboard"}
          className="flex items-center gap-2 bg-transparent border-0 text-left p-0 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => {
            if (!isOpen && onToggle) {
              onToggle();
            } else {
              router.push("/dashboard");
            }
          }}
          title={!isOpen ? "Expand Sidebar" : "viems"}
        >
          {/* Viems Logo SVG (41px x 33px) */}
          <LogoIcon width={41} height={33} className="shrink-0 text-brand-medium" />

          {/* Text: viems (Aeonik 500, 24px, #FFFFFF) */}
          <div
            className={`flex flex-col justify-center items-start transition-all duration-300 ${
              isOpen
                ? "w-[141px] opacity-100 translate-x-0"
                : "w-0 opacity-0 -translate-x-2 pointer-events-none overflow-hidden"
            }`}
          >
            <span className="font-aeonik-medium font-medium text-[24px] leading-[32px] text-white tracking-[-0.01em]">
              viems
            </span>
          </div>
        </button>

        {isOpen && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="size-6 rounded-[6px] p-0.5 flex items-center justify-center text-[#A4A4A4] hover:text-white hover:bg-white/5 cursor-pointer transition-colors border-0 bg-transparent shrink-0"
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <RiLayoutRightLine size={20} className="size-5 shrink-0" />
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

            if (item.name === "Compliance") {
              const isComplianceActive = pathname.startsWith("/compliance");

              return (
                <div key="Compliance" className={`flex flex-col gap-1 ${isOpen ? "w-[208px]" : "items-center justify-center"}`}>
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
                    className={`relative flex items-center rounded-[8px] transition-all duration-300 border-0 cursor-pointer group ${
                      isOpen ? "w-[208px] h-9 px-2.5 justify-start gap-2" : "size-10 justify-center p-0"
                    } ${
                      isComplianceActive
                        ? "bg-[#262626] text-white"
                        : "text-white hover:bg-[#262626]/50"
                    }`}
                  >
                    {isComplianceActive ? (
                      <RiShieldFill size={20} className="size-5 shrink-0 text-white transition-colors" />
                    ) : (
                      <RiShieldLine size={20} className="size-5 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                    )}
                    {isOpen && (
                      <>
                        <span className="text-[14px] font-medium whitespace-nowrap flex-1 text-left truncate text-white">
                          Compliance
                        </span>
                        <RiArrowUpSLine
                          size={20}
                          className={`size-5 text-[#5C5C5C] group-hover:text-white transition-all ml-auto shrink-0 ${
                            isComplianceOpen ? "" : "rotate-180"
                          }`}
                        />
                      </>
                    )}
                  </button>

                  {/* Accordion Submenu Items (Indented 34px / pl-6) */}
                  {isOpen && isComplianceOpen && (
                    <div className="flex flex-col gap-1 w-full pl-6">
                      {/* Subitem 1: Compliance Centre */}
                      <Link
                        href="/compliance"
                        className={`relative flex items-center gap-2 h-9 px-2.5 rounded-[8px] transition-all border-0 text-[14px] font-medium group ${
                          pathname === "/compliance"
                            ? "bg-[#262626] text-white"
                            : "text-white hover:bg-[#262626]/50"
                        }`}
                      >
                        {pathname === "/compliance" ? (
                          <RiFolderShieldFill size={20} className="size-5 shrink-0 text-white transition-colors" />
                        ) : (
                          <RiFolderShieldLine size={20} className="size-5 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                        )}
                        <span className="whitespace-nowrap truncate text-white">Compliance Centre</span>
                      </Link>

                      {/* Subitem 2: RTW Checks */}
                      <Link
                        href="/compliance/rtw-checks"
                        className={`relative flex items-center gap-2 h-9 px-2.5 rounded-[8px] transition-all border-0 text-[14px] font-medium group ${
                          pathname.startsWith("/compliance/rtw-checks")
                            ? "bg-[#262626] text-white"
                            : "text-white hover:bg-[#262626]/50"
                        }`}
                      >
                        {pathname.startsWith("/compliance/rtw-checks") ? (
                          <RiFileCheckFill size={20} className="size-5 shrink-0 text-white transition-colors" />
                        ) : (
                          <RiFileCheckLine size={20} className="size-5 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                        )}
                        <span className="whitespace-nowrap truncate text-white">RTW Checks</span>
                      </Link>

                      {/* Subitem 3: Documents */}
                      <Link
                        href="/compliance/documents"
                        className={`relative flex items-center gap-2 h-9 px-2.5 rounded-[8px] transition-all border-0 text-[14px] font-medium group ${
                          pathname.startsWith("/compliance/documents")
                            ? "bg-[#262626] text-white"
                            : "text-white hover:bg-[#262626]/50"
                        }`}
                      >
                        {pathname.startsWith("/compliance/documents") ? (
                          <RiFileTextFill size={20} className="size-5 shrink-0 text-white transition-colors" />
                        ) : (
                          <RiFileTextLine size={20} className="size-5 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                        )}
                        <span className="whitespace-nowrap truncate text-white">Documents</span>
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
                  isOpen ? "w-[208px] h-9 px-2.5 justify-start gap-2" : "size-10 justify-center p-0"
                } ${
                  isActive
                    ? "bg-[#262626] text-white"
                    : "text-white hover:bg-[#262626]/50"
                }`}
                title={item.name}
              >
                {item.name === "Dashboard" ? (
                  isActive ? (
                    <RiLayoutGridFill size={20} className="size-5 shrink-0 text-white transition-colors" />
                  ) : (
                    <RiLayoutGridLine size={20} className="size-5 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                  )
                ) : item.name === "Migrants" ? (
                  isActive ? (
                    <RiUserFill size={20} className="size-5 shrink-0 text-white transition-colors" />
                  ) : (
                    <RiUserLine size={20} className="size-5 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                  )
                ) : item.name === "Cases" ? (
                  <CasesIcon
                    active={isActive}
                    className={`size-5 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-[#5C5C5C] group-hover:text-white"
                    }`}
                  />
                ) : item.name === "Insights" ? (
                  isActive ? (
                    <RiPieChartFill size={20} className="size-5 shrink-0 text-white transition-colors" />
                  ) : (
                    <RiPieChartLine size={20} className="size-5 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                  )
                ) : item.name === "Team" || item.name === "Admin" ? (
                  isActive ? (
                    <RiTeamFill size={20} className="size-5 shrink-0 text-white transition-colors" />
                  ) : (
                    <RiTeamLine size={20} className="size-5 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                  )
                ) : null}
                {isOpen && (
                  <>
                    <span className="text-[14px] font-medium whitespace-nowrap flex-1 text-left truncate text-white">
                      {item.name}
                    </span>
                    {item.name === "Dashboard" && isActive && (
                      <RiArrowRightSLine size={20} className="size-5 text-white shrink-0 ml-auto" />
                    )}
                  </>
                )}
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

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex items-center rounded-[8px] transition-all duration-300 border-0 group ${
                    isOpen ? "w-[208px] h-9 px-2.5 justify-start gap-2" : "size-10 justify-center p-0"
                  } ${
                    isActive
                      ? "bg-[#262626] text-white"
                      : "text-white hover:bg-[#262626]/50"
                  }`}
                  title={item.name}
                >
                  {item.name === "Settings" ? (
                    <RiSettings2Line
                      size={20}
                      className={`size-5 shrink-0 transition-colors ${
                        isActive ? "text-white" : "text-[#5C5C5C] group-hover:text-white"
                      }`}
                    />
                  ) : item.name === "Support" ? (
                    isActive ? (
                      <RiCustomerService2Fill size={20} className="size-5 shrink-0 text-white transition-colors" />
                    ) : (
                      <RiCustomerService2Line size={20} className="size-5 shrink-0 text-[#5C5C5C] group-hover:text-white transition-colors" />
                    )
                  ) : null}
                  {isOpen && (
                    <span className="text-[14px] font-medium whitespace-nowrap flex-1 text-left truncate text-white">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="h-[88px] w-full flex items-center justify-center bg-[#171717] border-t border-[#262626]/40 shrink-0 px-3">
        <UserProfileDropdown
          userInfo={userInfo}
          align="start"
          side="top"
          trigger={
            <button
              type="button"
              className={`rounded-[10px] border border-[#262626] bg-[#171717] flex items-center transition-all duration-300 hover:bg-[#262626] cursor-pointer ${
                isOpen ? "w-[248px] h-16 p-3 justify-start gap-3" : "size-12 justify-center"
              }`}
              title="User Profile Menu"
            >
              <div className="size-10 rounded-full bg-[#EBEBEB] text-[#171717] font-medium text-[12px] flex items-center justify-center shrink-0">
                {getInitials()}
              </div>
              <div
                className={`flex flex-col items-start text-left min-w-0 flex-1 transition-all duration-300 ${
                  isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 pointer-events-none w-0 overflow-hidden"
                }`}
              >
                <span className="font-sans text-[14px] font-medium text-white truncate w-full leading-[20px] tracking-[-0.006em]">
                  {getFullName()}
                </span>
                <span className="text-[12px] text-[#A4A4A4] truncate w-full leading-[16px]">
                  {getEmail()}
                </span>
              </div>
              {isOpen && (
                <RiArrowRightSLine size={20} className="size-5 text-[#5C5C5C] shrink-0" />
              )}
            </button>
          }
        />
      </div>
    </aside>
  );
}
