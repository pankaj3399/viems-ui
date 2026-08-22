"use client";

import * as React from "react";
import {
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiTimer2Line,
  RiInformationLine,
  RiMore2Line,
  RiUpload2Line,
} from "@remixicon/react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api-endpoints";

interface TaskItem {
  id: string;
  hasBackendId?: boolean;
  category: "General" | "Compliance" | "Reporting" | "Documents" | "Visa & Immigration";
  title: string;
  description: string;
  status: "crucial" | "completed" | "under_review" | "general";
  isCompleted: boolean;
}

interface RawTaskPayload {
  id?: string | number;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  status?: string;
  isCompleted?: boolean;
  completed?: boolean;
}

type TasksApiResponse =
  | RawTaskPayload[]
  | { data?: RawTaskPayload[]; tasks?: RawTaskPayload[]; count?: number };

const VALID_CATEGORIES: readonly TaskItem["category"][] = [
  "General",
  "Compliance",
  "Reporting",
  "Documents",
  "Visa & Immigration",
];

const VALID_STATUSES: readonly TaskItem["status"][] = [
  "crucial",
  "completed",
  "under_review",
  "general",
];

function isTaskCategory(cat: string): cat is TaskItem["category"] {
  return (VALID_CATEGORIES as readonly string[]).includes(cat);
}

function isTaskStatus(st: string): st is TaskItem["status"] {
  return (VALID_STATUSES as readonly string[]).includes(st);
}

export function TasksTab({ caseId }: { caseId?: string }) {
  const [tasks, setTasks] = React.useState<TaskItem[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isCancelled = false;

    async function fetchTasks() {
      if (!caseId) {
        if (!isCancelled) {
          setTasks([]);
          setError(null);
        }
        return;
      }
      try {
        setError(null);
        const res = await apiClient.get<TasksApiResponse>(`${ENDPOINTS.tasks.base}?caseId=${caseId}`);
        let rawTasks: RawTaskPayload[] = [];
        if (Array.isArray(res)) {
          rawTasks = res;
        } else if (res && typeof res === "object") {
          if (Array.isArray(res.data)) rawTasks = res.data;
          else if (Array.isArray(res.tasks)) rawTasks = res.tasks;
        }

        if (!isCancelled) {
          if (rawTasks.length > 0) {
            const mapped: TaskItem[] = rawTasks.map((t: RawTaskPayload, i: number) => {
              const cat: TaskItem["category"] = t.category && isTaskCategory(t.category) ? t.category : "General";
              const rawStatus = t.status || (t.isCompleted || t.completed ? "completed" : "general");
              const st: TaskItem["status"] = isTaskStatus(rawStatus) ? rawStatus : (t.isCompleted || t.completed ? "completed" : "general");
              const hasBackendId = t.id !== undefined && t.id !== null;
              return {
                id: String(t.id ?? `t-${i}`),
                hasBackendId,
                category: cat,
                title: t.title || t.name || "Task",
                description: t.description || "",
                status: st,
                isCompleted: Boolean(t.isCompleted || t.completed || st === "completed"),
              };
            });
            setTasks(mapped);
          } else {
            setTasks([]);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setTasks([]);
          setError("Failed to load tasks for this case.");
        }
      }
    }

    fetchTasks();
    return () => {
      isCancelled = true;
    };
  }, [caseId]);

  const stats = React.useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const crucial = tasks.filter((t) => t.status === "crucial" && !t.isCompleted).length;
    const underReview = tasks.filter((t) => t.status === "under_review" && !t.isCompleted).length;
    return { total, completed, crucial, underReview };
  }, [tasks]);

  const categories: ("General" | "Compliance" | "Reporting" | "Documents" | "Visa & Immigration")[] = [
    "General",
    "Compliance",
    "Reporting",
    "Documents",
    "Visa & Immigration",
  ];

  const handleToggleComplete = async (taskId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;
    const prevTask = { ...targetTask };
    const nextState = !targetTask.isCompleted;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, isCompleted: nextState, status: nextState ? "completed" : "general" }
          : t
      )
    );

    if (targetTask.hasBackendId) {
      try {
        const formData = new FormData();
        formData.append("completed", String(nextState));
        formData.append("status", nextState ? "completed" : "pending");
        await apiClient.patch(`${ENDPOINTS.tasks.base}/${taskId}`, { body: formData });
        toast.success(
          nextState
            ? `"${targetTask.title}" marked as complete`
            : `"${targetTask.title}" marked as pending`
        );
      } catch (err) {
        console.error("Failed to update task on backend:", err);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? prevTask : t))
        );
        toast.error(`Failed to update task "${targetTask.title}". Please try again.`);
      }
    } else {
      toast.success(
        nextState
          ? `"${targetTask.title}" marked as complete`
          : `"${targetTask.title}" marked as pending`
      );
    }
  };

  const handleResolve = (task: TaskItem) => {
    toast.info(`Resolving "${task.title}"`, {
      description: "Action initiated for task",
    });
    handleToggleComplete(task.id);
  };

  return (
    <div className="w-full flex flex-col gap-8 font-sans animate-fade-in text-left">
      {error && (
        <div className="bg-[#FFEBEC] border border-[#FECDCA] rounded-[10px] p-4 text-[14px] text-[#FB3748] flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* ─── Top 4 Stat Summary Cards (Exact Figma Spec Frame 107) ─────────── */}
      <div className="flex items-center gap-2 w-full">
        {/* TOTAL TASKS */}
        <div className="bg-[#EFEBFF] rounded-[8px] p-[12px_16px] flex justify-between items-start h-[70px] flex-1 relative">
          <div className="flex flex-col gap-[2px]">
            <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
              TOTAL TASKS
            </span>
            <span className="font-aeonik-medium text-[24px] font-medium text-[#351A75] leading-[32px]">
              {stats.total}
            </span>
          </div>
          <RiFileTextLine className="size-5 text-[#5C5C5C] shrink-0 absolute top-2 right-4" />
        </div>

        {/* COMPLETED TASKS */}
        <div className="bg-[#E3F7EC] rounded-[8px] p-[12px_16px] flex justify-between items-start h-[70px] flex-1 relative">
          <div className="flex flex-col gap-[2px]">
            <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
              COMPLETED TASKS
            </span>
            <span className="font-aeonik-medium text-[24px] font-medium text-[#0B4627] leading-[32px]">
              {stats.completed}
            </span>
          </div>
          <RiCheckboxCircleLine className="size-5 text-[#5C5C5C] shrink-0 absolute top-2 right-4" />
        </div>

        {/* CRUCIAL (REQUIRED) */}
        <div className="bg-[#FFEBEC] rounded-[8px] p-[12px_16px] flex justify-between items-start h-[70px] flex-1 relative">
          <div className="flex flex-col gap-[2px]">
            <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
              CRUCIAL (REQUIRED)
            </span>
            <span className="font-aeonik-medium text-[24px] font-medium text-[#681219] leading-[32px]">
              {stats.crucial}
            </span>
          </div>
          <RiAlertLine className="size-5 text-[#681219] shrink-0 absolute top-2 right-4" />
        </div>

        {/* UNDER REVIEW */}
        <div className="bg-[#FFFAEB] rounded-[8px] p-[12px_16px] flex justify-between items-start h-[70px] flex-1 relative">
          <div className="flex flex-col gap-[2px]">
            <span className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#171717] leading-[12px]">
              UNDER REVIEW
            </span>
            <span className="font-aeonik-medium text-[24px] font-medium text-[#624C18] leading-[32px]">
              {stats.underReview}
            </span>
          </div>
          <RiTimer2Line className="size-5 text-[#5C5C5C] shrink-0 absolute top-2 right-4" />
        </div>
      </div>

      {/* ─── Categorized Task Sections ──────────────────────────────────────── */}
      <div className="flex flex-col gap-8 w-full">
        {categories.map((cat) => {
          const categoryTasks = tasks.filter((t) => t.category === cat);
          const catCompleted = categoryTasks.filter((t) => t.isCompleted).length;
          const catTotal = categoryTasks.length;

          if (categoryTasks.length === 0) return null;

          return (
            <div key={cat} className="flex flex-col gap-3 w-full">
              {/* Category Header */}
              <div className="flex items-center justify-between w-full px-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-aeonik-medium text-[20px] leading-[32px] text-[#171717]">
                    {cat}
                  </h3>
                  <RiInformationLine className="size-5 text-[#A4A4A4]" />
                </div>
                <span className="text-[12px] text-[#5C5C5C] font-normal">
                  {catCompleted} of {catTotal}
                </span>
              </div>

              {/* Task Rows Card Group */}
              <div className="bg-white border border-[#F5F5F5] rounded-[16px] divide-y divide-neutral-100 overflow-hidden shadow-2xs">
                {categoryTasks.map((task) => {
                  return (
                    <div
                      key={task.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                    >
                      {/* Left Side: Icon Badge & Content */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Status Icon Badges (Figma Spec 2) */}
                        {task.isCompleted ? (
                          <div className="size-7 rounded-full bg-[#E3F7EC] text-[#0B4627] flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5">
                            ✓
                          </div>
                        ) : task.status === "crucial" ? (
                          <div className="size-7 rounded-full bg-[#FFEBEC] text-[#FB3748] flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5">
                            !
                          </div>
                        ) : task.status === "under_review" ? (
                          <div className="size-7 rounded-full bg-[#FFFAEB] text-[#B45309] flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5">
                            !
                          </div>
                        ) : (
                          <div className="size-7 rounded-full bg-[#F3E8FF] text-[#7D52F4] flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5">
                            !
                          </div>
                        )}

                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-[14px] font-semibold transition-colors truncate ${
                              task.isCompleted ? "text-[#5C5C5C] line-through" : "text-[#171717]"
                            }`}
                          >
                            {task.title}
                          </span>
                          <p className="text-[13px] text-[#6B7280] font-normal leading-relaxed mt-0.5">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Side: Resolve Button & Row Dropdown Menu */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!task.isCompleted && (
                          <button
                            type="button"
                            onClick={() => handleResolve(task)}
                            className="h-8 px-4 bg-[#262626] hover:bg-[#171717] text-white text-[13px] font-medium rounded-[8px] transition-colors cursor-pointer border-0"
                          >
                            Resolve
                          </button>
                        )}

                        {/* Row Dropdown Menu (Screenshot 2 Spec) */}
                        <DropdownMenu>
                          <DropdownMenuTrigger className="size-8 rounded-[6px] flex items-center justify-center text-[#5C5C5C] hover:text-[#171717] hover:bg-neutral-100 transition-colors cursor-pointer border-0 bg-transparent">
                            <RiMore2Line className="size-4 shrink-0" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[200px] p-1.5 rounded-[12px] bg-white border border-neutral-200 shadow-lg text-[13px]"
                          >
                            <DropdownMenuItem
                              onClick={() => handleToggleComplete(task.id)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[#171717] hover:bg-neutral-100 cursor-pointer font-medium"
                            >
                              <RiCheckboxCircleLine className="size-4 text-[#5C5C5C]" />
                              <span>{task.isCompleted ? "Mark as pending" : "Mark as complete"}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                toast.info(`Upload documents for "${task.title}"`, {
                                  description: "Opening upload dialog...",
                                })
                              }
                              className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[#171717] hover:bg-neutral-100 cursor-pointer font-medium"
                            >
                              <RiUpload2Line className="size-4 text-[#5C5C5C]" />
                              <span>Upload documents</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-1 border-t border-neutral-100" />

                            <DropdownMenuItem
                              onClick={() =>
                                toast.info(`Task Details`, {
                                  description: task.description,
                                })
                              }
                              className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[#171717] hover:bg-neutral-100 cursor-pointer font-medium"
                            >
                              <RiInformationLine className="size-4 text-[#5C5C5C]" />
                              <span>More information</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
