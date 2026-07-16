/**
 * Application Constants — Decision arrays, months, filters, roles, and regexes.
 *
 * Ported from:
 * - front/public/initStartData.js (Decision, Months, CreatedBy, WaysToFilterByDates)
 * - server/src/constants/userRoles.ts (USER_ROLES)
 * - server/src/constants/datatypes.ts (OUTCOME_OPTIONS, LEAD_STATUSES, etc.)
 * - front/public/common/initGlobalObject.js (validation regexes)
 */

// ─── Decision / Outcome ──────────────────────────────────────────────────────

export interface DecisionItem {
  id: string;
  value: string;
  name: string;
  content: string;
  /** Fields that should be disabled when this decision is selected */
  disabled: string[];
}

export const DECISIONS: DecisionItem[] = [
  {
    id: "Pending",
    value: "pending",
    name: "Pending",
    content: "Pending",
    disabled: [
      "flightVisa",
      "flightEntered",
      "flightDeparture",
      "refusal",
      "withdrawn",
    ],
  },
  {
    id: "Granted",
    value: "granted",
    name: "Granted",
    content: "Granted",
    disabled: ["refusal", "withdrawn"],
  },
  {
    id: "Refused",
    value: "refusal",
    name: "Refused",
    content: "Refused",
    disabled: [
      "flightVisa",
      "flightEntered",
      "flightDeparture",
      "withdrawn",
    ],
  },
  {
    id: "Withdrawn",
    value: "withdrawn",
    name: "Withdrawn",
    content: "Withdrawn",
    disabled: [
      "flightVisa",
      "flightEntered",
      "flightDeparture",
      "refusal",
    ],
  },
];

// ─── Months ──────────────────────────────────────────────────────────────────

export interface MonthItem {
  id: number;
  value: string;
  name: string;
  content: string;
  short: string;
}

export const MONTHS: MonthItem[] = [
  { id: 1, value: "1", name: "January", content: "January", short: "Jan" },
  { id: 2, value: "2", name: "February", content: "February", short: "Feb" },
  { id: 3, value: "3", name: "March", content: "March", short: "Mar" },
  { id: 4, value: "4", name: "April", content: "April", short: "Apr" },
  { id: 5, value: "5", name: "May", content: "May", short: "May" },
  { id: 6, value: "6", name: "June", content: "June", short: "June" },
  { id: 7, value: "7", name: "July", content: "July", short: "July" },
  { id: 8, value: "8", name: "August", content: "August", short: "Aug" },
  {
    id: 9,
    value: "9",
    name: "September",
    content: "September",
    short: "Sept",
  },
  { id: 10, value: "10", name: "October", content: "October", short: "Oct" },
  {
    id: 11,
    value: "11",
    name: "November",
    content: "November",
    short: "Nov",
  },
  {
    id: 12,
    value: "12",
    name: "December",
    content: "December",
    short: "Dec",
  },
];

// ─── Filter Options ──────────────────────────────────────────────────────────

export interface FilterItem {
  id: string;
  value: string;
  name: string;
  content: string;
}

export const CREATED_BY: FilterItem[] = [
  { id: "all", value: "all", name: "All", content: "All" },
  { id: "personal", value: "personal", name: "Me", content: "Me" },
  {
    id: "others",
    value: "others",
    name: "Different users",
    content: "Different users",
  },
];

export const WAYS_TO_FILTER_BY_DATES: FilterItem[] = [
  {
    id: "isCreationDate",
    value: "isCreationDate",
    name: "Created",
    content: "Created",
  },
  {
    id: "isArchivationDate",
    value: "isArchivationDate",
    name: "Archived",
    content: "Archived",
  },
];

// ─── User Roles ──────────────────────────────────────────────────────────────

export const USER_ROLES = {
  SUPERADMIN: "superadmin",
  SUPERVISOR: "supervisor",
  AGENT: "agent",
  MIGRANT: "migrant",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// ─── Outcome Options (from server/src/constants/datatypes.ts) ────────────────

export const OUTCOME_OPTIONS = {
  GRANTED: "Granted",
  REFUSED: "Refused",
  WITHDRAWN: "Withdrawn",
  PENDING: "Pending",
} as const;

export type OutcomeOption =
  (typeof OUTCOME_OPTIONS)[keyof typeof OUTCOME_OPTIONS];

// ─── Lead Statuses ───────────────────────────────────────────────────────────

export const LEAD_STATUSES = {
  ACTIVE: "Active",
  REFUSED: "Refused",
  COMPLETED: "Completed",
} as const;

export type LeadStatus = (typeof LEAD_STATUSES)[keyof typeof LEAD_STATUSES];

// ─── Case Statuses ───────────────────────────────────────────────────────────

export const CASE_STATUSES = {
  IN_PROGRESS: "In Progress",
  DONE: "Done",
} as const;

// ─── Archive Request Statuses ────────────────────────────────────────────────

export const ARCHIVE_REQUEST_STATUSES = {
  ACTIVE: "active",
  CANCELLED: "cancelled",
  GRANTED: "granted",
  REFUSED: "refused",
} as const;

// ─── COS Statuses ────────────────────────────────────────────────────────────

export const COS_STATUSES = {
  ASSIGNED: "Assigned",
  USED: "Used",
  WITHDRAWN: "Withdrawn",
} as const;

// ─── PPS Statuses ────────────────────────────────────────────────────────────

export const PPS_STATUSES = {
  PASSED: "Passed",
  REFUSED: "Refused",
} as const;

// ─── Travel History ──────────────────────────────────────────────────────────

export const TRAVEL_DIRECTIONS = {
  ENTERING: "Entering",
  LEAVING: "Leaving",
} as const;

export const TRAVEL_STATUSES = {
  CONFIRMED: "Confirmed",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
} as const;

// ─── Sexes & Titles ──────────────────────────────────────────────────────────

export const SEXES = {
  MALE: "Male",
  FEMALE: "Female",
} as const;

export const TITLES = {
  MISS: "Miss",
  MR: "Mr",
  MRS: "Mrs",
  MS: "Ms",
} as const;

// ─── Validation Regexes (from initGlobalObject.js) ───────────────────────────

/** Email validation — must start with alphanumeric, supports dots/hyphens/underscores */
export const EMAIL_REGEX =
  /^[a-zA-Z\d][a-zA-Z\d.\-_]+@[a-zA-Z]+(\.[a-zA-Z]{2,})+$/;

/** Name validation — no special characters like < > , . ? / : ; etc. */
export const NAME_REGEX =
  /^[^<>,./\\?:;"'{}|@#%$^&()*_\-+=!]*$/;

/** Text validation — similar to name but allows commas, periods, colons, etc. */
export const TEXT_REGEX =
  /^[^<>?/"'{}\\|@#%$^&()*+=!]*$/;

/** Number-only validation */
export const NUMBER_REGEX = /^\d+$/;

/** User name validation — letters, spaces, hyphens only; cannot start with hyphen */
export const USER_NAME_REGEX = /^(?!-)[a-zA-Z\s-]+$/;

// ─── Misc ────────────────────────────────────────────────────────────────────

/** Default number of rows shown in dashboard tables */
export const DASHBOARD_ROWS_COUNT = 10;

/** Number of years shown in reports year range selector */
export const REPORTS_YEAR_RANGE = 5;

/** Path to the default avatar SVG */
export const DEFAULT_AVATAR = "/assets/images/avatar.svg";
