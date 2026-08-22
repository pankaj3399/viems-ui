import * as React from "react";

export interface SortIconProps {
  active?: boolean;
  direction?: "asc" | "desc";
  className?: string;
}

/**
 * Sort icon component matching Figma expand-up-down-fill
 */
export function SortIcon({
  active = false,
  direction = "asc",
  className = "size-3 text-[#A4A4A4] shrink-0",
}: SortIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 4L7 9H17L12 4Z"
        opacity={active && direction === "desc" ? 0.3 : 1}
        className={active && direction === "asc" ? "text-[#171717]" : ""}
      />
      <path
        d="M12 20L17 15H7L12 20Z"
        opacity={active && direction === "asc" ? 0.3 : 1}
        className={active && direction === "desc" ? "text-[#171717]" : ""}
      />
    </svg>
  );
}
