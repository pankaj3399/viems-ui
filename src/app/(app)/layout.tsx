"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";
import Sidebar from "@/components/sidebar";
import { Loader2 } from "lucide-react";

export default function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);
  const [userInfo, setUserInfo] = React.useState<any>(null);

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

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar userInfo={userInfo} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F7F7F7] min-w-0">
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
