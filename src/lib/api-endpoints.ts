/**
 * API Endpoints Registry — Every backend endpoint as a typed constant.
 *
 * Mirrors `front/public/common/apiurl.js` with a structured object.
 * Uses "/api" as base since the Next.js rewrite proxy routes to the backend.
 */

const API_BASE = "/api";

export const ENDPOINTS = {
  // ─── Authentication ────────────────────────────────────────────────────────
  auth: {
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    reset: `${API_BASE}/auth/reset`,
    newPassword: `${API_BASE}/auth/newpass`,
    createPassword: `${API_BASE}/auth/createpass`,
    otpVerify: `${API_BASE}/auth/otppass`,
  },

  // ─── Users ─────────────────────────────────────────────────────────────────
  users: {
    base: `${API_BASE}/users`,
    userInfo: `${API_BASE}/users/userinfo`,
    settings: `${API_BASE}/users/settings`,
    /** PATCH /users/settings/:id */
    settingsById: (id: number | string) =>
      `${API_BASE}/users/settings/${id}`,
    profile: `${API_BASE}/users/profile`,
    verify: `${API_BASE}/users/verify`,
    /** GET /users/:id — contact card */
    byId: (id: number | string) => `${API_BASE}/users/${id}`,
  },

  // ─── Init Data ─────────────────────────────────────────────────────────────
  initData: {
    /** GET /initdata/:name — loads dropdown data by category */
    byName: (name: string) => `${API_BASE}/initdata/${name}`,
  },

  // ─── Geodata ───────────────────────────────────────────────────────────────
  geodata: {
    states: `${API_BASE}/geodata/states`,
  },

  // ─── Job Info ──────────────────────────────────────────────────────────────
  jobInfo: {
    jobTitles: `${API_BASE}/jobinfo/jobTitles`,
  },

  // ─── Migrants ──────────────────────────────────────────────────────────────
  migrants: {
    base: `${API_BASE}/migrants`,
    /** GET /migrants/:id */
    byId: (id: number | string) => `${API_BASE}/migrants/${id}`,
    cases: `${API_BASE}/migrants/cases`,
    credibility: `${API_BASE}/migrants/credibility`,
    credibilityInsights: `${API_BASE}/migrants/credibility/insights`,
    /** GET /migrants/:id/travel-history */
    travelHistory: (id: number | string) =>
      `${API_BASE}/migrants/${id}/travel-history`,
    archive: `${API_BASE}/migrants/archive`,
    restore: `${API_BASE}/migrants/restore`,
  },

  // ─── Cases ─────────────────────────────────────────────────────────────────
  cases: {
    base: `${API_BASE}/cases`,
    active: `${API_BASE}/cases?data=migrantsActive`,
    /** GET /cases/:id */
    byId: (id: number | string) => `${API_BASE}/cases/${id}`,
    assignments: `${API_BASE}/cases/assignments`,
    archive: `${API_BASE}/cases/archive`,
    toArchive: `${API_BASE}/cases/to-archive`,
    restore: `${API_BASE}/cases/restore`,
    bulkArchive: `${API_BASE}/cases/bulk-archive`,
    bulkArchivePreview: `${API_BASE}/cases/bulk-archive/preview`,
    bulkRestore: `${API_BASE}/cases/bulk-restore`,
    bulkRestorePreview: `${API_BASE}/cases/bulk-restore/preview`,
  },

  // ─── Case Templates ───────────────────────────────────────────────────────
  caseTemplates: {
    base: `${API_BASE}/case-templates`,
    /** PUT/DELETE /case-templates/:id */
    byId: (id: number | string) => `${API_BASE}/case-templates/${id}`,
  },

  // ─── Leads ─────────────────────────────────────────────────────────────────
  leads: {
    base: `${API_BASE}/leads`,
    /** PUT /leads/:id */
    byId: (id: number | string) => `${API_BASE}/leads/${id}`,
    archive: `${API_BASE}/leads/archive`,
    restore: `${API_BASE}/leads/restore`,
  },

  // ─── Dashboard & Statistics ────────────────────────────────────────────────
  dashboard: {
    schedule: `${API_BASE}/dashboard/schedule`,
    calendar: `${API_BASE}/dashboard/calendar`,
    events: `${API_BASE}/events`,
  },

  statistics: {
    nationalities: `${API_BASE}/statistics/nationalities`,
    conversion: `${API_BASE}/statistics/conversion`,
    reports: `${API_BASE}/statistics/reports`,
    dashboard: `${API_BASE}/statistics/dashboard`,
  },

  // ─── Tasks ─────────────────────────────────────────────────────────────────
  tasks: {
    base: `${API_BASE}/tasks`,
    /** PUT /tasks/:id */
    byId: (id: number | string) => `${API_BASE}/tasks/${id}`,
  },

  // ─── Employees (Admin Only) ────────────────────────────────────────────────
  employees: {
    base: `${API_BASE}/employees`,
    /** PUT /employees/:id */
    byId: (id: number | string) => `${API_BASE}/employees/${id}`,
    sendRegistrationLink: `${API_BASE}/employees/send-registration-link`,
    restoreBlocked: `${API_BASE}/employees/restore-blocked`,
    restorePassword: `${API_BASE}/employees/restore-password`,
  },

  // ─── Files & Documents ─────────────────────────────────────────────────────
  files: {
    base: `${API_BASE}/files`,
    /** GET /files/view/:id — download/view (supports ?Authorization= query param) */
    view: (id: number | string) => `${API_BASE}/files/view/${id}`,
    create: `${API_BASE}/files/create`,
    edit: `${API_BASE}/files/edit`,
    archive: `${API_BASE}/files/archive`,
    rename: `${API_BASE}/files/rename`,
    upload: `${API_BASE}/files/upload`,
    uploadCustom: `${API_BASE}/files/upload/custom`,
    uploadRightToWork: `${API_BASE}/files/upload/right-to-work`,
    uploadBackgroundCheck: `${API_BASE}/files/upload/background-check`,
    /** GET /files/image/:id — photo/avatar */
    image: (id: number | string) => `${API_BASE}/files/image/${id}`,
    // Custom documents
    custom: `${API_BASE}/files/custom`,
    customView: (id: number | string) =>
      `${API_BASE}/files/custom/view/${id}`,
    customRename: `${API_BASE}/files/custom/rename`,
    // Employee documents (admin only)
    listEmployees: `${API_BASE}/files/list/employees`,
  },

  // ─── Folders ───────────────────────────────────────────────────────────────
  folders: {
    system: `${API_BASE}/folders/system`,
    custom: `${API_BASE}/folders/custom`,
    customRename: `${API_BASE}/folders/custom/rename`,
    customMove: `${API_BASE}/folders/custom/move`,
    archive: `${API_BASE}/folders/archive`,
  },

  // ─── Templates ─────────────────────────────────────────────────────────────
  templates: {
    base: `${API_BASE}/templates`,
  },

  // ─── Search ────────────────────────────────────────────────────────────────
  search: {
    base: `${API_BASE}/search`,
  },

  // ─── Logs (Admin Only) ─────────────────────────────────────────────────────
  logs: {
    base: `${API_BASE}/logs`,
  },

  // ─── Archive Requests ──────────────────────────────────────────────────────
  archiveRequests: {
    base: `${API_BASE}/archive-requests`,
    updateStatus: `${API_BASE}/archive-requests/status`,
    complete: `${API_BASE}/archive-requests/complete`,
    byUser: `${API_BASE}/archive-requests/user`,
    cancel: `${API_BASE}/archive-requests/cancel`,
  },

  // ─── Archiving Management (Admin Only) ─────────────────────────────────────
  archiving: {
    settings: `${API_BASE}/archiving/settings`,
    log: `${API_BASE}/archiving/log`,
  },

  // ─── Custom Fields ─────────────────────────────────────────────────────────
  customFields: {
    base: `${API_BASE}/custom-fields`,
    types: `${API_BASE}/custom-fields/types`,
    delete: `${API_BASE}/custom-fields/delete`,
  },
} as const;
