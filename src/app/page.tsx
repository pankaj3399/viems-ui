"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  React.useEffect(() => {
    // Check if the user is logged in
    if (isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background px-xl py-3xl overflow-hidden">
      {/* Background Gradients matching auth pages */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--color-brand-light),_transparent_50%),_radial-gradient(ellipse_at_bottom_left,_var(--color-neutral-100),_transparent_50%)] opacity-80 dark:opacity-20" />
      <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-brand-medium/5 blur-3xl -z-10 animate-pulse" />

      {/* Loading state container */}
      <div className="flex flex-col items-center gap-lg text-center max-w-[280px]">
        {/* Sleek brand icon loader */}
        <div className="relative flex items-center justify-center size-16 rounded-card bg-card border border-border shadow-custom-medium animate-fade-in">
          <Loader2 className="size-8 animate-spin text-brand-medium" />
        </div>
        <div className="flex flex-col gap-xs animate-fade-in [animation-delay:200ms]">
          <h1 className="text-label-lg font-bold text-neutral-900 dark:text-white">
            Connecting to VIEMS
          </h1>
          <p className="text-paragraph-xs text-neutral-400 leading-normal">
            Verifying your security credentials and preparing workspace...
          </p>
        </div>
      </div>
    </div>
  );
}
