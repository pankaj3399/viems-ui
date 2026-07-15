"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Toaster } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#171717] overflow-x-hidden antialiased">
      {/* ─── Figma Header Bar (Height 80px) ─────────────────────────────────── */}
      <header className="h-20 w-full flex items-center justify-between px-8 bg-[#171717] shrink-0 select-none">
        {/* Left Side: Synergy Logo & Brand Name */}
        <div className="flex items-center gap-md">
          {/* Synergy Logo Icon (simple dark neutral circle matching the screenshot) */}
          <div className="size-8 rounded-full bg-neutral-700 shrink-0" />
          <span className="text-h5-title font-bold text-white tracking-tight font-sans">
            Viems
          </span>
        </div>

        {/* Right Side: Dynamic Action Area */}
        <div className="flex items-center gap-xl">
          {pathname === "/login" && (
            <div className="flex items-center gap-md">
              <span className="text-paragraph-sm text-neutral-400 font-medium hidden sm:inline">
                Don't have an account?
              </span>
              <Link
                href="/register"
                className="px-lg py-[7px] bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 hover:border-neutral-300 rounded-button shadow-x-small text-label-sm font-semibold transition-all duration-200"
              >
                Register
              </Link>
            </div>
          )}

          {pathname === "/register" && (
            <div className="flex items-center gap-md">
              <span className="text-paragraph-sm text-neutral-400 font-medium hidden sm:inline">
                Already have an account?
              </span>
              <Link
                href="/login"
                className="px-lg py-[7px] bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 hover:border-neutral-300 rounded-button shadow-x-small text-label-sm font-semibold transition-all duration-200"
              >
                Log In
              </Link>
            </div>
          )}

          {pathname !== "/login" && pathname !== "/register" && (
            <Link
              href="/login"
              className="flex items-center gap-xs px-lg py-[7px] bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 hover:border-neutral-300 rounded-button shadow-x-small text-label-sm font-semibold transition-all duration-200"
            >
              <ArrowLeft className="size-4" />
              Back to Log In
            </Link>
          )}
        </div>
      </header>

      {/* ─── Figma Inner Canvas (Frame-within-a-frame) ───────────────────────── */}
      <main className="flex-1 flex flex-col mx-xs mb-xs rounded-card bg-[#F7F7F7] border border-neutral-200 overflow-hidden shadow-card-large min-h-[calc(100vh-80px-8px)]">
        {/* Centered Children Container */}
        <div className="flex-1 flex items-center justify-center p-xl overflow-y-auto">
          <div className="w-full max-w-[440px] py-xl">
            {children}
          </div>
        </div>
      </main>

      <Toaster position="top-right" closeButton richColors />
    </div>
  );
}
