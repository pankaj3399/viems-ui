import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-button border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:shadow-primary-focus active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:bg-neutral-50 disabled:text-neutral-300 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-brand-medium text-white hover:bg-brand-dark focus-visible:shadow-primary-focus",
        outline:
          "border-neutral-200 bg-white shadow-x-small text-neutral-900 hover:bg-neutral-50 focus-visible:border-neutral-900 focus-visible:shadow-important-focus",
        secondary:
          "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 focus-visible:shadow-important-focus",
        ghost:
          "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 focus-visible:bg-neutral-50 focus-visible:text-neutral-900",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-neutral-600 hover:underline hover:text-neutral-900",
        "primary-neutral": "bg-neutral-800 text-white hover:bg-neutral-900 focus-visible:shadow-important-focus",
        light: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 focus-visible:shadow-important-focus",
        "brand-link": "text-brand-medium hover:underline hover:text-brand-dark",
      },
      size: {
        default:
          "h-10 gap-xs px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2", // 40px height
        xs: "h-6 gap-xs rounded-compact px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3", // 24px height
        sm: "h-8 gap-xs rounded-compact px-2.5 text-sm in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5", // 32px height
        lg: "h-12 gap-sm px-3 text-base has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5", // 48px height
        icon: "size-10",
        "icon-xs":
          "size-6 rounded-compact in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-compact in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
