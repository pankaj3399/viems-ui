"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-card-large group-[.toaster]:rounded-card group-[.toaster]:p-xl group-[.toaster]:flex group-[.toaster]:gap-lg group-[.toaster]:items-center group-[.toaster]:border",
          title: "!text-label-sm !font-semibold !text-neutral-900 dark:!text-white",
          description: "!text-neutral-500 dark:!text-neutral-400 !text-paragraph-xs",
          actionButton:
            "group-[.toast]:bg-brand-medium group-[.toast]:text-white group-[.toast]:rounded-button group-[.toast]:text-label-sm group-[.toast]:px-md group-[.toast]:py-sm hover:group-[.toast]:bg-brand-dark transition-all",
          cancelButton:
            "group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-600 group-[.toast]:rounded-button group-[.toast]:text-label-sm group-[.toast]:px-md group-[.toast]:py-sm hover:group-[.toast]:bg-neutral-200 transition-all",
          success:
            "!bg-success-light !text-success-dark !border-success-dark/20",
          error:
            "!bg-error-light !text-error-dark !border-error-dark/20",
          warning:
            "!bg-warning-light !text-warning-dark !border-warning-dark/20",
          info:
            "!bg-info-light !text-info-dark !border-info-dark/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
