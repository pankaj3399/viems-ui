import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-input border border-neutral-200 bg-white px-md py-lg text-paragraph-sm text-neutral-900 transition-all outline-none placeholder:text-neutral-400 hover:border-neutral-400 focus-visible:border-neutral-900 focus-visible:shadow-important-focus disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-300 disabled:opacity-50 aria-invalid:border-error-dark aria-invalid:border-2 aria-invalid:focus-visible:shadow-important-focus md:text-sm dark:bg-neutral-900/30 dark:border-neutral-800 dark:hover:border-neutral-600 dark:text-white dark:placeholder:text-neutral-600 dark:focus-visible:border-neutral-100",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
