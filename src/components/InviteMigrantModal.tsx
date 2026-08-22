"use client";

import * as React from "react";
import { RiCloseLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    // ui-native-fallback
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
        <Button
          type="button"
          variant="ghost"
          aria-label="Close backdrop"
          className="absolute inset-0 bg-transparent border-0 cursor-default rounded-none hover:bg-transparent"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-[440px] bg-card border border-border shadow-[0px_16px_32px_-12px_rgba(14,18,27,0.1)] rounded-[20px] overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-200">
          {/* Top Right Close Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-5 right-5 size-6 rounded-compact bg-card border border-border shadow-x-small flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer z-20"
            aria-label="Close modal"
          >
            <RiCloseLine className="size-4 text-neutral-500" />
          </Button>

          {/* Modal Content Area */}
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-[20px] flex flex-col gap-[16px]">
              {/* Header Title & Subtitles */}
              <div className="flex flex-col gap-[6px] pr-8">
                <h3
                  id="inviteMigrantModalTitle"
                  className="text-[16px] font-medium text-neutral-900 tracking-[-0.011em] leading-[24px] font-sans"
                >
                  Invite migrant
                </h3>
                <p className="text-[13px] font-normal text-neutral-900 leading-[20px] tracking-[-0.006em]">
                  They will receive a secure link to fill in their details and documents.
                </p>
              </div>

              <p className="text-[13px] font-normal text-neutral-900 leading-[20px] tracking-[-0.006em]">
                The migrant will provide personal details, passport info, and upload documents. You can fill in or edit all the sections separately, before or after.
              </p>

              {/* Email Input Field */}
              <div className="flex flex-col gap-[4px] w-full">
                <Label htmlFor="modalMigrantEmail" className="text-label-sm font-medium text-neutral-900 tracking-[-0.006em]">
                  Migrant email address
                </Label>
                <Input
                  id="modalMigrantEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="j.taylor@email.com"
                  className="w-full h-10 bg-card border-border rounded-input px-3 py-2 text-paragraph-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:border-brand-medium shadow-x-small font-sans"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-[20px] py-[16px] border-t border-border bg-card flex items-center justify-end gap-[12px]">
              <Button
                type="button"
                onClick={onClose}
                className="h-9 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-label-sm font-medium rounded-[8px] transition-colors cursor-pointer border-0 flex items-center justify-center"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSending}
                className="h-9 px-4 bg-brand-medium hover:bg-brand-dark text-white text-label-sm font-medium rounded-[8px] transition-colors cursor-pointer border-0 shadow-x-small flex items-center justify-center disabled:opacity-50"
              >
                {isSending ? "Sending..." : "Send invite"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}

