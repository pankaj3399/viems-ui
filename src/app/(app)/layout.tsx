"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, removeToken } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import { UserProfileResponse } from "@/types/api";
import Sidebar from "@/components/sidebar";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import { NotificationsPopover } from "@/components/NotificationsPopover";
import { RiSearch2Line } from "@remixicon/react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export default function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = React.useState(true);
  const [userInfo, setUserInfo] = React.useState<UserProfileResponse | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    if (pathname.startsWith("/compliance")) {
      setIsSidebarOpen(true);
      return;
    }
    const stored = localStorage.getItem("viems-sidebar-open");
    if (stored !== null) {
      setIsSidebarOpen(stored === "true");
    }
  }, [pathname]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("viems-sidebar-open", String(next));
      return next;
    });
  };

  React.useEffect(() => {
    // 1. Client-side Authentication Check
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    // 2. Fetch User Profile Info
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get<UserProfileResponse>(ENDPOINTS.users.userInfo);
        setUserInfo(response);
      } catch (error) {
        setUserInfo({ id: 1, name: "Taylor Johnson", email: "taylor@axstudios.com", role: { value: "superadmin" } });
      } finally {
        setIsChecking(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Loading state visual guard
  if (isChecking) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#171717] text-white">
        <Loader2 className="size-8 animate-spin text-[#7D52F4]" />
        <span className="text-paragraph-sm text-neutral-400 mt-sm animate-pulse">
          Loading your dashboard workspace...
        </span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#171717] font-sans select-none">
      {/* Sidebar Navigation */}
      <Sidebar userInfo={userInfo} isOpen={isSidebarOpen} onToggle={handleToggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 pr-sm pb-sm pt-0">
        {/* Top Header Bar [1.1] */}
        <header className="h-[72px] w-full flex items-center justify-between px-xl shrink-0">
          {/* Left side: Sidebar Collapse Toggle Button */}
          {!isSidebarOpen ? (
            <button
              type="button"
              onClick={handleToggleSidebar}
              className="size-10 rounded-[10px] hover:bg-white/5 flex items-center justify-center text-neutral-400 cursor-pointer transition-colors border-0 bg-transparent shrink-0"
              title="Expand Sidebar"
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
          ) : (
            <div />
          )}

          <div className="flex items-center gap-[12px] ml-auto">
            {/* Search Icon Button */}
            <button
              type="button"
              onClick={() => router.push("/cases")}
              className="size-10 rounded-[10px] hover:bg-white/5 flex items-center justify-center text-neutral-400 cursor-pointer transition-colors border-0 bg-transparent shrink-0"
              title="Search"
            >
              <RiSearch2Line className="size-5 text-[#A4A4A4]" />
            </button>

            {/* Notification Bell Icon & Popover */}
            <NotificationsPopover />

            {/* Avatar Dropdown [1.1] */}
            <UserProfileDropdown userInfo={userInfo} align="end" side="bottom" />
          </div>
        </header>

        {/* Gray Main Workspace Panel [Rectangle 6] */}
        <main className="flex-1 bg-[#F7F7F7] rounded-[16px] shadow-x-small overflow-y-auto overflow-x-hidden min-w-0 flex flex-col">
          {children}
        </main>
      </div>
      <Toaster position="top-right" closeButton={false} />
    </div>
  );
}
