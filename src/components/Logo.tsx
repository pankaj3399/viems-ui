import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Viems Brand SVG Logo Icon
 * Renders the two converging wing paths forming the "V" icon.
 * Defaults to using `currentColor` (or `text-brand-medium`) to respect design system tokens.
 * Figma: Group 636 (width: 41px, height: 32.59px, color: #7D52F4)
 */
export function LogoIcon({
  size,
  width = 41,
  height = 33,
  className,
  ...props
}: LogoIconProps) {
  // If size is provided as a number, compute proportional height matching 41:33 aspect ratio
  const computedWidth = size !== undefined ? (typeof size === "number" ? size : size) : width;
  const computedHeight =
    size !== undefined
      ? typeof size === "number"
        ? Math.round((size * 33) / 41)
        : undefined
      : height;

  return (
    <svg
      width={computedWidth}
      height={computedHeight}
      viewBox="0 0 41 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 text-brand-medium", className)}
      aria-label="viems"
      role="img"
      {...props}
    >
      <path
        d="M0.0674336 0.715702L18.51 32.3517C18.7538 32.7698 19.3936 32.5969 19.3936 32.113V17.7509C19.3936 13.7628 17.3053 10.066 13.8896 8.00732L0.721635 0.0709877C0.301304 -0.182343 -0.179734 0.291718 0.0674336 0.715702Z"
        fill="currentColor"
      />
      <path
        d="M40.9326 0.715702L22.49 32.3517C22.2462 32.7698 21.6064 32.5969 21.6064 32.113V17.7509C21.6064 13.7628 23.6947 10.066 27.1104 8.00732L40.2784 0.0709877C40.6987 -0.182343 41.1797 0.291718 40.9326 0.715702Z"
        fill="currentColor"
      />
    </svg>
  );
}

export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: LogoSize | number;
  withText?: boolean;
  text?: string;
  href?: string;
  iconClassName?: string;
  textClassName?: string;
}

const sizeConfig: Record<LogoSize, { iconSize: number; textClass: string; gapClass: string }> = {
  xs: { iconSize: 18, textClass: "text-label-xs font-medium font-aeonik-medium", gapClass: "gap-xs" },
  sm: { iconSize: 24, textClass: "text-label-md font-medium font-aeonik-medium", gapClass: "gap-xs" },
  md: { iconSize: 32, textClass: "text-[20px] font-medium font-aeonik-medium leading-none", gapClass: "gap-sm" },
  lg: { iconSize: 41, textClass: "text-[24px] font-medium font-aeonik-medium leading-[32px]", gapClass: "gap-sm" },
  xl: { iconSize: 48, textClass: "text-h3-title font-medium font-aeonik-medium", gapClass: "gap-md" },
};

/**
 * Viems Full Logo Component
 * Combines the brand LogoIcon with "viems" typography (Aeonik 500) and link capabilities.
 */
export function Logo({
  size = "lg",
  withText = true,
  text = "viems",
  href,
  iconClassName,
  textClassName,
  className,
  ...props
}: LogoProps) {
  const isNamedSize = typeof size === "string" && size in sizeConfig;
  const config = isNamedSize ? sizeConfig[size as LogoSize] : null;
  const iconSize = typeof size === "number" ? size : config?.iconSize ?? 41;
  const textClass = config?.textClass ?? "text-[24px] font-medium font-aeonik-medium leading-[32px]";
  const gapClass = config?.gapClass ?? "gap-sm";

  const content = (
    <div
      className={cn("inline-flex items-center select-none", gapClass, className)}
      {...props}
    >
      <LogoIcon size={iconSize} className={iconClassName} />
      {withText && (
        <span
          className={cn(
            "text-foreground tracking-[-0.01em]",
            textClass,
            textClassName
          )}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-medium rounded-md"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
