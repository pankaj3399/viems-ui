"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, removeToken } from "@/lib/auth";
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
        removeToken();
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
      <Sidebar userInfo={userInfo} isOpen={isSidebarOpen} onToggle={handleToggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 pr-sm pb-sm pt-0">
        {/* Top Header Bar [1.1] */}
        <header className="h-20 w-full flex items-center pl-[32px] pr-[40px] shrink-0">
          {/* Left side: Sidebar Collapse Toggle Button */}
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={handleToggleSidebar}
              className="size-12 rounded-[10px] hover:bg-white/5 flex items-center justify-center text-neutral-400 cursor-pointer transition-colors border-0 bg-transparent shrink-0"
              title="Expand Sidebar"
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

          <div className="flex items-center gap-md ml-auto">
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
