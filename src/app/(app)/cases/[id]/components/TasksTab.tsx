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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface TaskItem {
  id: string;
  category: "General" | "Compliance" | "Reporting" | "Documents" | "Visa & Immigration";
  title: string;
  description: string;
  status: "crucial" | "completed" | "under_review" | "general";
  isCompleted: boolean;
}

const initialTasks: TaskItem[] = [
  // General (1 of 3 completed)
  {
    id: "t1",
    category: "General",
    title: "Onboard Migrant",
    description: "Walk the migrant through the information and steps required to begin.",
    status: "general",
    isCompleted: false,
  },
  {
    id: "t2",
    category: "General",
    title: "Assign Case Manager",
    description: "Assign a primary immigration advisor to oversee this case.",
    status: "completed",
    isCompleted: true,
  },
  {
    id: "t3",
    category: "General",
    title: "Confirm Case Scope",
    description: "Review target start date and sponsor license constraints.",
    status: "completed",
    isCompleted: true,
  },

  // Compliance (1 of 3 completed)
  {
    id: "t4",
    category: "Compliance",
    title: "Complete RTW check",
    description:
      "No share code result has been uploaded. The employer must verify migrant's right to work in the UK before employment commences or within 28 days.",
    status: "crucial",
    isCompleted: false,
  },
  {
    id: "t5",
    category: "Compliance",
    title: "Verify address with proof document",
    description: "Confirm migrant home address against utility bill or bank statement.",
    status: "completed",
    isCompleted: true,
  },
  {
    id: "t6",
    category: "Compliance",
    title: "Check passport validity",
    description: "Ensure migrant passport has at least 6 months validity from intended travel date.",
    status: "completed",
    isCompleted: true,
  },

  // Reporting (1 of 1 completed)
  {
    id: "t7",
    category: "Reporting",
    title: "Schedule first SMS report",
    description: "Set up automated UKVI SMS report notification schedule for key milestones.",
    status: "completed",
    isCompleted: true,
  },

  // Documents (0 of 3 completed)
  {
    id: "t8",
    category: "Documents",
    title: "Upload Migrant Signed Docs (MSDs)",
    description: "Upload documents that have been reviewed and signed by the migrant.",
    status: "under_review",
    isCompleted: false,
  },
  {
    id: "t9",
    category: "Documents",
    title: "Upload qualification certificates",
    description:
      "Degree certificate and ENIC/NARIC statement are both missing. Required for Appendix D compliance and SOC code justification.",
    status: "crucial",
    isCompleted: false,
  },
  {
    id: "t10",
    category: "Documents",
    title: "Upload visa grant letter",
    description:
      "Visa decision letter not yet stored in vault. Required to confirm visa conditions and expiry date on file.",
    status: "crucial",
    isCompleted: false,
  },

  // Visa & Immigration (0 of 1 completed)
  {
    id: "t11",
    category: "Visa & Immigration",
    title: "Plan visa renewal",
    description:
      "Current visa expires 31 Mar 2027. The renewal window opens approximately 10 months before expiry. Set a reminder for January 2027.",
    status: "general",
    isCompleted: false,
  },
];

export function TasksTab({ caseId }: { caseId?: string }) {
  const [tasks, setTasks] = React.useState<TaskItem[]>(initialTasks);

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

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.isCompleted;
          toast.success(nextState ? `"${t.title}" marked as complete` : `"${t.title}" marked as pending`);
          return { ...t, isCompleted: nextState, status: nextState ? "completed" : t.status };
        }
        return t;
      })
    );
  };

  const handleResolve = (task: TaskItem) => {
    toast.info(`Resolving "${task.title}"`, {
      description: "Opening action handler...",
    });
    handleToggleComplete(task.id);
  };

  return (
    <div className="w-full flex flex-col gap-8 font-sans select-none animate-fade-in text-left">
      
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
