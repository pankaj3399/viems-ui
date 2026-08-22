import { LEAD_STATUSES } from "@/lib/constants";

export interface LeadPriorityMeta {
  id: number;
  name: string;
  color: string;
}

/** Fallback priority meta (mirrors server seed: 1=Low, 2=Medium, 3=High) */
export const LEAD_PRIORITIES_FALLBACK: LeadPriorityMeta[] = [
  { id: 1, name: "Low", color: "#3FBB33" },
  { id: 2, name: "Medium", color: "#FDA253" },
  { id: 3, name: "High", color: "#ED383A" },
];

/** Selectable lead statuses shown in the status picker, per server enum */
export const LEAD_STATUS_OPTIONS = [
  { value: LEAD_STATUSES.ACTIVE, dotColor: "#1FC16B" },
  { value: LEAD_STATUSES.COMPLETED, dotColor: "#335CFF" },
  { value: LEAD_STATUSES.REFUSED, dotColor: "#FB3748" },
] as const;

export function getLeadStatusDot(status: string): string {
  const normalized = (status || "").toLowerCase().trim();
  switch (normalized) {
    case "active":
      return "#1FC16B";
    case "completed":
      return "#335CFF";
    case "refused":
      return "#FB3748";
    default:
      return "#7B7B7B";
  }
}

/** Tinted pill classes per status (mirrors the Cases page getStatusBgAndText) */
export function getLeadStatusPillClasses(status: string): string {
  const normalized = (status || "").toLowerCase().trim();
  switch (normalized) {
    case "active":
      return "bg-[#E3F7EC] text-[#0B4627] hover:bg-[#D0F2DF] hover:text-[#06331C]";
    case "completed":
      return "bg-[#EBF1FF] text-[#122368] hover:bg-[#D7E4FF] hover:text-[#0D194B]";
    case "refused":
      return "bg-[#FFEBEC] text-[#681219] hover:bg-[#FDD5D7] hover:text-[#520C12]";
    default:
      return "bg-[#F5F5F5] text-[#7B7B7B] hover:bg-[#EBEBEB] hover:text-[#171717]";
  }
}

export function getLeadPriorityMeta(
  priorityId: number | null | undefined,
  priorities: LeadPriorityMeta[]
): LeadPriorityMeta {
  if (priorityId == null) {
    return { id: 0, name: "—", color: "#7B7B7B" };
  }
  const found = priorities.find((p) => Number(p.id) === Number(priorityId));
  return found || LEAD_PRIORITIES_FALLBACK.find((p) => Number(p.id) === Number(priorityId)) || { id: Number(priorityId), name: `#${priorityId}`, color: "#7B7B7B" };
}

/** Server sends creationDate as "YYYY-MM-DDTHH:mm:ss" */
export function formatLeadDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
