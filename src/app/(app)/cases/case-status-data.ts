export interface CaseStatusOption {
  value: string;
  label: string;
  dotColor?: string;
  category?: "active" | "pending" | "closed";
}

export const CASE_STATUSES: CaseStatusOption[] = [
  // Green statuses
  { value: "cos_assigned", label: "CoS Assigned", dotColor: "#1FC16B", category: "active" },
  { value: "visa_approved", label: "Visa Approved", dotColor: "#1FC16B", category: "active" },
  { value: "cleared_for_sponsorship", label: "Cleared for sponsorship", dotColor: "#1FC16B", category: "active" },
  // Yellow statuses
  { value: "awaiting_applicant_docs", label: "Awaiting applicant docs", dotColor: "#F6B51E", category: "pending" },
  { value: "awaiting_ukvi_decision", label: "Awaiting UKVI decision", dotColor: "#F6B51E", category: "pending" },
  { value: "awaiting_biometrics", label: "Awaiting biometrics", dotColor: "#F6B51E", category: "pending" },
  { value: "awaiting_interview", label: "Awaiting interview", dotColor: "#F6B51E", category: "pending" },
  { value: "info_requested", label: "Info requested", dotColor: "#F6B51E", category: "pending" },
  { value: "additional_docs_requested", label: "Additional docs requested", dotColor: "#F6B51E", category: "pending" },
  // Blue statuses
  { value: "eligibility_assessment", label: "Eligibility assessment", dotColor: "#335CFF", category: "active" },
  { value: "drafting_cos", label: "Drafting CoS", dotColor: "#335CFF", category: "active" },
  { value: "ready_for_submission", label: "Ready for submission", dotColor: "#335CFF", category: "active" },
  // Red statuses
  { value: "visa_refused", label: "Visa refused", dotColor: "#FB3748", category: "closed" },
  { value: "ineligible_high_risk", label: "Ineligible / High risk", dotColor: "#FB3748", category: "closed" },
  // Gray statuses
  { value: "case_closed", label: "Case closed", dotColor: "#7B7B7B", category: "closed" },
  { value: "application_withdrawn", label: "Application withdrawn", dotColor: "#7B7B7B", category: "closed" },
  { value: "draft", label: "Draft", dotColor: "#7B7B7B", category: "closed" },
];

export interface RefusalReason {
  value: string;
  label: string;
}

export const REFUSAL_REASONS: RefusalReason[] = [
  { value: "cos_needed_prior", label: "CoS needed prior to entry" },
  { value: "incomplete_application", label: "Incomplete application package" },
  { value: "previous_overstay", label: "Previous visa overstay on record" },
  { value: "financial_requirements", label: "Financial requirements not met" },
  { value: "insufficient_evidence", label: "Insufficient evidence of return" },
  { value: "mandatory_not_cleared", label: "Mandatory not cleared" },
  { value: "other", label: "Other" },
];
