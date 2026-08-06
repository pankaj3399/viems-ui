"use client";

import * as React from "react";
import { RiCloseLine } from "@remixicon/react";

interface InviteMigrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvite: (email: string) => Promise<void> | void;
  defaultEmail?: string;
}

export function InviteMigrantModal({
  isOpen,
  onClose,
  onSendInvite,
  defaultEmail = "",
}: InviteMigrantModalProps) {
  const [email, setEmail] = React.useState(defaultEmail || "");
  const [isSending, setIsSending] = React.useState(false);
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  const triggerRef = React.useRef<Element | null>(null);

  React.useEffect(() => {
    setEmail(defaultEmail || "");
  }, [defaultEmail]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      triggerRef.current = document.activeElement;
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      if (triggerRef.current && "focus" in triggerRef.current) {
        (triggerRef.current as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    setIsSending(true);
    try {
      await onSendInvite(email.trim());
      onClose();
    } catch {
      // Keep dialog open on failure so user can retry
    } finally {
      setIsSending(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="fixed inset-0 z-50 m-auto p-0 bg-transparent backdrop:bg-black/40 backdrop:backdrop-blur-xs border-0 outline-none max-w-none max-h-none overflow-visible"
    >
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Backdrop button to close */}
        <button
          type="button"
          aria-label="Close backdrop"
          className="absolute inset-0 bg-transparent border-0 cursor-default"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-[440px] bg-white border border-[#EBEBEB] shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] rounded-[20px] overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-200">
          {/* Top Right Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 size-6 rounded-[6px] bg-white border border-[#EBEBEB] shadow-x-small flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-50 transition-colors cursor-pointer border-0 z-20"
            aria-label="Close modal"
          >
            <RiCloseLine className="size-4 text-[#5C5C5C]" />
          </button>

          {/* Modal Content Area */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-[20px] flex flex-col gap-[16px]">
              {/* Header Title & Subtitles */}
              <div className="flex flex-col gap-[6px]">
                <h3
                  id="inviteMigrantModalTitle"
                  className="text-[16px] font-medium text-[#171717] tracking-[-0.011em] leading-[24px] font-sans"
                >
                  Invite migrant
                </h3>
                <p className="text-[13px] font-normal text-[#171717] leading-[20px] tracking-[-0.006em]">
                  They will receive a secure link to fill in their details and documents.
                </p>
              </div>

              <p className="text-[13px] font-normal text-[#171717] leading-[20px] tracking-[-0.006em]">
                The migrant will provide personal details, passport info, and upload documents. You can fill in or edit all the sections separately, before or after.
              </p>

              {/* Email Input Field */}
              <div className="flex flex-col gap-[4px] w-full">
                <label htmlFor="modalMigrantEmail" className="text-[14px] font-medium text-[#171717] tracking-[-0.006em]">
                  Migrant email address
                </label>
                <input
                  id="modalMigrantEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="j.taylor@email.com"
                  className="w-full h-[40px] bg-white border border-[#EBEBEB] rounded-[10px] px-[12px] py-[10px] text-[14px] text-[#171717] placeholder:text-[#A4A4A4] focus:outline-none focus:border-[#7D52F4] focus:ring-1 focus:ring-[#7D52F4] shadow-x-small font-sans"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-[20px] py-[16px] border-t border-[#EBEBEB] bg-white flex items-center justify-end gap-[12px]">
              <button
                type="button"
                onClick={onClose}
                className="h-[36px] px-[16px] bg-[#F5F5F5] hover:bg-[#EBEBEB] text-[#5C5C5C] text-[14px] font-medium rounded-[8px] transition-colors cursor-pointer border-0 flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="h-[36px] px-[16px] bg-[#7D52F4] hover:bg-[#6836E6] text-white text-[14px] font-medium rounded-[8px] transition-colors cursor-pointer border-0 shadow-x-small flex items-center justify-center disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send invite"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}
