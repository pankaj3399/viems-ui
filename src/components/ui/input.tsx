import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-input border border-neutral-200 bg-white px-md py-lg text-paragraph-sm text-neutral-900 transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-neutral-400 focus-visible:border-neutral-900 focus-visible:shadow-important-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-300 disabled:opacity-50 aria-invalid:border-error-dark aria-invalid:border-2 aria-invalid:focus-visible:shadow-important-focus md:text-sm dark:bg-neutral-900/30 dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-600 dark:focus-visible:border-neutral-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
