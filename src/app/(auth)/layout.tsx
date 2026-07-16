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
      <header className="h-20 w-full flex items-center px-8 bg-[#171717] shrink-0 select-none">
        {/* Left Side: Synergy Logo & Brand Name */}
        <div className="flex items-center gap-md">
          {/* Synergy Logo Icon (simple dark neutral circle matching the screenshot) */}
          <div className="size-8 rounded-full bg-neutral-700 shrink-0" />
          <span className="text-h5-title font-bold text-white tracking-tight font-sans">
            Viems
          </span>
        </div>
      </header>

      {/* ─── Figma Inner Canvas (Frame-within-a-frame) ───────────────────────── */}
      <main className="flex-1 flex flex-col mx-sm mb-sm rounded-card bg-[#F7F7F7] border border-neutral-200 overflow-hidden shadow-card-large min-h-[calc(100vh-80px-8px)]">
        {/* Children Container */}
        <div className="flex-1 flex flex-col items-center justify-start p-xl overflow-y-auto pt-[34px]">
          <div className="w-full max-w-[440px] pb-xl">
            {children}
          </div>
        </div>
      </main>

      <Toaster position="top-right" closeButton richColors />
    </div>
  );
}
