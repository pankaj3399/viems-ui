import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 transition-all outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-300 disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "rounded-input border border-neutral-200 bg-white text-paragraph-sm text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-400 focus-visible:border-neutral-900 focus-visible:shadow-important-focus aria-invalid:border-error-dark aria-invalid:border-2 aria-invalid:focus-visible:shadow-important-focus md:text-sm dark:bg-neutral-900/30 dark:border-neutral-800 dark:hover:border-neutral-600 dark:text-white dark:placeholder:text-neutral-600 dark:focus-visible:border-neutral-100",
        unstyled:
          "border-0 bg-transparent p-0 rounded-none shadow-none ring-0 focus-visible:ring-0 focus-visible:shadow-none focus-visible:outline-none focus:outline-none focus:ring-0 focus:border-0 dark:bg-transparent",
        ghost:
          "border-0 bg-transparent rounded-input hover:bg-neutral-100 focus-visible:bg-neutral-100 dark:bg-transparent dark:hover:bg-neutral-800",
      },
      size: {
        default:
          "h-10 px-md py-lg text-paragraph-sm file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground md:text-sm",
        sm: "h-8 px-sm py-xs text-[13px]",
        xs: "h-6 px-xs py-0 text-xs",
        none: "h-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Input({
  className,
  type,
  variant = "default",
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> & {
    htmlSize?: number
  }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }

