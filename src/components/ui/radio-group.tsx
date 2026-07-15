"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative flex size-5 shrink-0 rounded-full border border-neutral-200 bg-white transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-neutral-900 focus-visible:shadow-important-focus disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:border-neutral-200 disabled:opacity-50 aria-invalid:border-error-dark aria-invalid:border-2 data-checked:border-brand-medium data-checked:bg-brand-medium data-checked:hover:bg-brand-dark data-checked:hover:border-brand-dark dark:border-neutral-800 dark:bg-neutral-900/30 dark:data-checked:bg-brand-medium",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-5 items-center justify-center"
      >
        <span className="size-2 rounded-full bg-white shadow-[0px_2px_4px_-2px_rgba(27,28,29,0.12)]" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
