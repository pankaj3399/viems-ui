/**
 * TypeScript type definitions for all VIEMS API entities.
 *
 * Derived from the actual backend entity files in /server/src/.
 * These are starter types — fields will be refined as we build each page
 * and observe actual response payloads from the backend.
 */

// ─── Shared / Lookup Types ───────────────────────────────────────────────────

export interface Role {
  id: number;
  value: string;
  title: string;
}

export interface Status {
  id: number;
  value: string;
  title: string;
}

export interface Nationality {
  id: number;
  value: string;
}

export interface Timezone {
  id: number;
  value: string;
}

export interface Priority {
  id: number;
  value: string;
  name: string;
}

export interface DocumentCategory {
  id: number;
  value: string;
}

// ─── User Notifications ──────────────────────────────────────────────────────

export interface UserNotifications {
  cases: boolean;
  leads: boolean;
  requests: boolean;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface UserPersonalInfo {
  id: number;
  title: string | null;
  firstName: string;
  lastName: string;
  noLastName: boolean;
  dateOfBirth: string | null;
  sex: string | null;
  nationality: string | null; // transformed to id string by backend
  timezone: Timezone | null;
  avatars: FileDocument[];
  notifications: UserNotifications | null;
  useCustomFields: boolean;
}

export interface User {
  id: number;
  email: string;
  role: Role;
  status: Status;
  personalInfo: UserPersonalInfo;
  isDeleted: boolean;
  justRestored: boolean;
  creationDate: string;
  updationDate: string;
  statusUpdationDate: string;
  archivationDate: string | null;
  restoredDate: string | null;
}

/**
 * Extended user info returned by getUserInfo() in the old frontend.
 * Flattened firstName/lastName and notification preferences.
 */
export interface UserInfo extends User {
  firstName: string;
  lastName: string;
  notifications: UserNotifications;
  timeZoneId: number;
}

// ─── Migrant ─────────────────────────────────────────────────────────────────

export interface MigrantContacts {
  id: number;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  state: string | null;
  postCode: string | null;
}

export interface MigrantPassport {
  id: number;
  passportNumber: string;
  nationality: Nationality | null;
  issueDate: string | null;
  expiryDate: string | null;
}

export interface TravelHistory {
  id: number;
  direction: string; // "Entering" | "Leaving"
  status: string; // "Confirmed" | "Pending" | "Cancelled"
  source: string; // "Manual" | "Auto"
  date: string | null;
  flightNumber: string | null;
  port: string | null;
  notes: string | null;
}

export interface Migrant {
  id: number;
  migrantId?: string;
  user: User;
  stage_name: string;
  with_stage_name: boolean;
  place_of_birth: string;
  contacts: MigrantContacts | null;
  passports: MigrantPassport[];
  files: FileDocument[];
  cases: CaseEntity[];
  isRefused: boolean;
  travelHistory: TravelHistory[];
  creation_date: string;
  updation_date: string;
}

// ─── Case ────────────────────────────────────────────────────────────────────

export interface CaseRole {
  id: number;
  value: string;
  name: string;
}

export interface CaseTasks {
  personal: boolean | null;
  category: boolean | null;
  documents: boolean | null;
  rlmt: boolean | null;
  cosStatus: boolean | null;
  biometricDone: boolean | null;
  decision: boolean | null;
  flightEntered: boolean | null;
  flightDeparture: boolean | null;
  pps: boolean | null;
  priority: Priority | null;
}

export interface CaseEntity {
  id: number;
  caseNumber: string | null;
  caseIdNumber: number | null;
  relatedYear: number;
  migrant: Migrant;
  role: CaseRole | null;
  outcome: string | null; // "Granted" | "Refused" | "Withdrawn" | "Pending"
  employee: Employee | null;
  fieldStatus: CaseTasks | null;
  files: FileDocument[];
  isDeleted: boolean;
  justRestored: boolean;
  creation_date: string;
  updation_date: string;
  archivationDate: string | null;
  restoredDate: string | null;
}

// ─── Lead ────────────────────────────────────────────────────────────────────

export interface Lead {
  id: number;
  status: string; // "Active" | "Refused" | "Completed"
  firstName: string;
  lastName: string;
  contactNumber: string;
  contactEmail: string | null;
  descriptionBox: string;
  isDeleted: boolean;
  justRestored: boolean;
  priority: number | null; // transformed to id by backend
  files: FileDocument[];
  creator: string | null; // transformed to id string by backend
  creationDate: string;
  updationDate: string;
  archivationDate: string | null;
  statusUpdationDate: string | null;
  restoredDate: string | null;
}

// ─── Employee ────────────────────────────────────────────────────────────────

export interface EmployeeContacts {
  id: number;
  phone: string | null;
  personalEmail: string | null;
}

export interface Employee {
  id: string; // transformed to string by backend
  user: User;
  contacts: EmployeeContacts | null;
  cases: CaseEntity[];
  creationDate: string;
  updationDate: string;
}

// ─── File / Document ─────────────────────────────────────────────────────────

export interface FileDocument {
  id: number;
  originalName: string;
  filename: string;
  size: number;
  mimetype: string;
  filetype: DocumentCategory | null;
  uploadDate: string;
  updationDate: string;
  isDeleted: boolean;
  editable: boolean;
  archivationDate: string | null;
  inRecycleBin: boolean;
}

// ─── Folder ──────────────────────────────────────────────────────────────────

export interface SystemFolder {
  id: number;
  name: string;
}

export interface CustomFolder {
  id: number;
  name: string;
  parentId: number | null;
}

// ─── Dashboard / Events ──────────────────────────────────────────────────────

export interface SchedulerEvent {
  id: number;
  title: string;
  type: string;
  category: string;
  startDate: string;
  endDate: string;
  description: string | null;
}

// ─── Archive Request ─────────────────────────────────────────────────────────

export interface ArchiveRequest {
  id: number;
  status: string; // "active" | "cancelled" | "granted" | "refused"
  priority: string; // "high" | "usual"
  creationDate: string;
}

// ─── Custom Field ────────────────────────────────────────────────────────────

export interface CustomField {
  id: number;
  name: string;
  type: string;
  value: string | null;
}

// ─── Auth Responses ──────────────────────────────────────────────────────────

/** Standard login response (OTP_LOGIN=false) */
export interface LoginResponse {
  token: string;
}

/** OTP login response (OTP_LOGIN=true) — no token, just a status */
export interface OtpLoginResponse {
  status: number;
}

/** OTP verification response — returns the JWT */
export interface OtpVerifyResponse {
  token: string;
}

// ─── Generic API Response Wrappers ───────────────────────────────────────────

/** Paginated list response (used by CRUD endpoints) */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  total: number;
  page: number;
  pageCount: number;
}

/** Generic API error shape from the backend */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

// ─── Init Data (dropdown values loaded at startup) ───────────────────────────

export interface InitDataItem {
  id: number | string;
  value: string;
  name: string;
  content: string;
}

export interface InitStartData {
  Titles: InitDataItem[];
  Genders: InitDataItem[];
  Nationalities: InitDataItem[];
  CaseCategories: InitDataItem[];
  Employees: InitDataItem[];
  CaseStatus: InitDataItem[];
  Departments: InitDataItem[];
  JobTitles: InitDataItem[];
  TaskPriorities: InitDataItem[];
  JobStatuses: InitDataItem[];
  EmployeeStatuses: InitDataItem[];
  ArchivingStatuses: InitDataItem[];
  LeadStatus: InitDataItem[];
  LeadPriority: InitDataItem[];
  ReportTypes: InitDataItem[];
  EventTypes: InitDataItem[];
  EventCategories: InitDataItem[];
  ProbationStatuses: InitDataItem[];
  Roles: InitDataItem[];
  UsersByRole: {
    employees: InitDataItem[];
    admins: InitDataItem[];
    supervisors: InitDataItem[];
    agents: InitDataItem[];
  };
  [key: string]: unknown;
}
