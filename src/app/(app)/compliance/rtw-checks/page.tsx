"use client";

import * as React from "react";
import Link from "next/link";
import { RiArrowLeftSLine } from "@remixicon/react";

export default function RtwChecksPage() {
  return (
    <div className="w-full min-h-full bg-[#F7F7F7] text-[#171717] font-sans pb-16 flex flex-col gap-6 px-6 lg:px-12 py-8 select-none">
      <div className="flex items-center gap-2">
        <Link href="/compliance" className="text-[14px] text-[#5C5C5C] hover:text-[#171717] flex items-center gap-1">
          <RiArrowLeftSLine className="size-4" />
          <span>Compliance Centre</span>
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-[32px] leading-[40px] font-medium text-[#171717] font-aeonik-medium tracking-[-0.01em]">
          RTW Checks
        </h1>
        <p className="text-[14px] leading-[20px] font-normal text-[#5C5C5C] tracking-[-0.006em]">
          Manage and review Right to Work checks for sponsored migrants.
        </p>
      </div>

      <div className="bg-white rounded-[16px] p-8 border border-white shadow-[0px_1px_2px_rgba(10,13,20,0.03)] flex flex-col items-center justify-center text-center gap-3 py-16">
        <div className="size-12 rounded-full bg-[#E3F7EC] flex items-center justify-center text-[#0D6332]">
          ✓
        </div>
        <h3 className="text-[20px] font-medium text-[#171717] font-aeonik-medium">
          Right to Work Verification System
        </h3>
        <p className="text-[14px] text-[#5C5C5C] max-w-[480px]">
          All statutory online RTW checks, share code verifications, and passport validation records are active and compliant.
        </p>
      </div>
    </div>
  );
}
