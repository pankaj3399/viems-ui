"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import Sidebar from "@/components/sidebar";
import { Loader2, Bell } from "lucide-react";

export default function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);
  const [userInfo, setUserInfo] = React.useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    const stored = localStorage.getItem("viems-sidebar-open");
    if (stored !== null) {
      setIsSidebarOpen(stored === "true");
    }
  }, []);

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
        const response = await apiClient.get(ENDPOINTS.users.userInfo);
        setUserInfo(response);
        setIsChecking(false);
      } catch (error) {
        console.error("Failed to load user profile:", error);
        // If the token is invalid or request fails, clear session and force login
        router.replace("/login");
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
    return "AM";
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#171717] font-sans select-none">
      {/* Sidebar Navigation */}
      <Sidebar userInfo={userInfo} isOpen={isSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 pr-sm pb-sm pt-0">
        {/* Top Header Bar [1.1] */}
        <header className="h-20 w-full flex items-center justify-between pl-[32px] pr-[40px] shrink-0">
          {/* Left side: Sidebar Collapse Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSidebar}
            className="size-12 rounded-[10px] hover:bg-white/5 flex items-center justify-center text-neutral-400 cursor-pointer transition-colors border-0 bg-transparent shrink-0"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#A4A4A4]"
            >
              <path
                d="M3 4.75C3 4.33579 3.33579 4 3.75 4H16.25C16.6642 4 17 4.33579 17 4.75V15.25C17 15.6642 16.6642 16 16.25 16H3.75C3.33579 16 3 15.6642 3 15.25V4.75ZM4.5 5.5V14.5H7.5V5.5H4.5ZM9 14.5H15.5V5.5H9V14.5Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div className="flex items-center gap-md">
            {/* Notification Bell Icon */}
            <button
              type="button"
              className="relative size-12 rounded-[10px] hover:bg-white/5 flex items-center justify-center text-neutral-400 cursor-pointer transition-colors border-0 bg-transparent shrink-0"
              title="Notifications"
            >
              <Bell className="size-5 text-[#A4A4A4]" />
              <div className="absolute top-[14px] right-[14px] size-1.5 rounded-full bg-[#FB3748] border border-[#171717] shadow-x-small" />
            </button>

            {/* Avatar Circle */}
            <div className="size-12 rounded-full bg-[#CAC0FF] text-[#351A75] font-semibold text-base flex items-center justify-center select-none shadow-x-small shrink-0">
              {getInitials()}
            </div>
          </div>
        </header>

        {/* Gray Main Workspace Panel [Rectangle 6] */}
        <main className="flex-1 bg-[#F7F7F7] rounded-[16px] shadow-x-small overflow-y-auto overflow-x-hidden min-w-0 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
