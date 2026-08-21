import * as React from "react";
import { RiArrowUpSLine, RiArrowDownSLine, RiExpandUpDownFill } from "@remixicon/react";

interface SortState<T> {
  field: keyof T | null;
  direction: "asc" | "desc";
}

export function useTableSort<T>(
  initialField: keyof T | null = null,
  initialDirection: "asc" | "desc" = "asc"
) {
  const [sortState, setSortState] = React.useState<SortState<T>>({
    field: initialField,
    direction: initialDirection,
  });

  const handleSort = React.useCallback((field: keyof T) => {
    setSortState((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return {
        field,
        direction: "asc",
      };
    });
  }, []);

  const setSortField = React.useCallback((field: React.SetStateAction<keyof T | null>) => {
    setSortState((prev) => ({
      ...prev,
      field: typeof field === "function" ? (field as (p: keyof T | null) => keyof T | null)(prev.field) : field,
    }));
  }, []);

  const setSortDirection = React.useCallback((direction: React.SetStateAction<"asc" | "desc">) => {
    setSortState((prev) => ({
      ...prev,
      direction: typeof direction === "function" ? (direction as (p: "asc" | "desc") => "asc" | "desc")(prev.direction) : direction,
    }));
  }, []);

  const renderSortIcon = React.useCallback(
    (field: keyof T) => {
      if (sortState.field === field) {
        return sortState.direction === "asc" ? (
          <RiArrowUpSLine className="size-5 text-[#171717]" />
        ) : (
          <RiArrowDownSLine className="size-5 text-[#171717]" />
        );
      }
      return <RiExpandUpDownFill className="size-5 text-[#A4A4A4]" />;
    },
    [sortState.field, sortState.direction]
  );

  return {
    sortField: sortState.field,
    setSortField,
    sortDirection: sortState.direction,
    setSortDirection,
    handleSort,
    renderSortIcon,
  };
}
