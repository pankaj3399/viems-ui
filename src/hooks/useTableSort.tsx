import * as React from "react";
import { RiArrowUpSLine, RiArrowDownSLine, RiExpandUpDownFill } from "@remixicon/react";

export function useTableSort<T>(
  initialField: keyof T | null = null,
  initialDirection: "asc" | "desc" = "asc"
) {
  const [sortField, setSortField] = React.useState<keyof T | null>(initialField);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(initialDirection);

  const handleSort = React.useCallback((field: keyof T) => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortDirection((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortDirection("asc");
      return field;
    });
  }, []);

  const renderSortIcon = React.useCallback(
    (field: keyof T) => {
      if (sortField === field) {
        return sortDirection === "asc" ? (
          <RiArrowUpSLine className="size-3.5 text-[#171717]" />
        ) : (
          <RiArrowDownSLine className="size-3.5 text-[#171717]" />
        );
      }
      return <RiExpandUpDownFill className="size-3 text-[#A4A4A4]" />;
    },
    [sortField, sortDirection]
  );

  return {
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    handleSort,
    renderSortIcon,
  };
}
