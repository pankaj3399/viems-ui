import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  label?: string
}

export function PageHeader({ title, label, className, ...props }: PageHeaderProps) {
  return (
    <div 
      className={cn(
        "flex flex-row items-center justify-between w-full bg-brand-medium rounded-separator py-7 px-10 text-white shadow-md select-none", 
        className
      )}
      {...props}
    >
      <h3 className="text-h3-title truncate">{title}</h3>
      {label && <span className="text-label-xl opacity-60 font-medium">{label}</span>}
    </div>
  )
}
