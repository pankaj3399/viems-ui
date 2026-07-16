# VIEMS Migration — Phase Tracker

> **How to use this file:** This is the master checklist for the entire migration. Work through it top to bottom. Mark items `[x]` when complete, `[/]` when in progress. Do not skip phases — each one depends on the previous.

---

## Phase Overview

| # | Phase | Status | Description |
| :---: | :--- | :---: | :--- |
| 0 | Pre-Flight Checks | `[x]` | Verify backend works, database has data, tools are ready |
| 1 | Figma Design Token Extraction | `[x]` | Extract colors, fonts, spacing, radii from Figma |
| 2 | Next.js Project Configuration | `[x]` | Configure proxy, env, fonts, Tailwind theme |
| 3 | Core Library Files | `[x]` | Build auth, API client, types, constants |
| 4 | Authentication Pages | `[x]` | Login, register, password reset, OTP |
| 5 | Application Shell | `[x]` | Sidebar, header, layout, auth guard, WebSocket |
| 6 | Dashboard Module | `[ ]` | Dashboard stats, charts, tasks, schedule |
| 7 | Migrants Module | `[ ]` | Migrants list, detail, forms, travel history |
| 8 | Cases Module | `[ ]` | Cases list, detail, templates, groups, refusals |
| 9 | Leads Module | `[ ]` | Leads list, create, edit |
| 10 | Files & Documents Module | `[ ]` | File explorer, upload, download, folder management |
| 11 | Supporting Pages | `[ ]` | Search, profile, settings, requests |
| 12 | Admin Module | `[ ]` | Employees, assignments, archive, logs |
| 13 | Polish & Edge Cases | `[ ]` | Skeletons, errors, empty states, accessibility |
| 14 | Testing & QA | `[ ]` | Cross-browser, responsive, API verification |
| 15 | Production Deployment | `[ ]` | Build, Nginx config, DNS switch, monitoring |
| 16 | Cleanup | `[ ]` | Remove old frontend, update docs |

---

## Phase 0: Pre-Flight Checks

Before writing any code, confirm the development environment is ready.

- [x] **MySQL running** — Verify the `eeuknet-ltd-viems` database is accessible and has data (migrants, cases, users).
- [x] **Geodata loaded** — The `geodata.sql` file (~93MB) has been imported. Check: `SELECT COUNT(*) FROM countries;` returns rows.
- [x] **Backend starts** — Run `cd server && npm run start:dev`. Confirm it starts without errors on port `8081`.
- [x] **Swagger accessible** — Open `http://localhost:8081/api` in browser. You should see the Swagger UI with all endpoints listed.
- [x] **Test login works** — Use Swagger or curl to test `POST /auth/login` with valid credentials. Confirm you receive a JWT token.
- [x] **WebSocket port open** — Confirm port `8082` is available and not blocked by another process.
- [x] **MinIO/S3 accessible** — If testing file uploads, confirm MinIO is running on `http://localhost:9000` (or use the docker-compose minio config).
- [x] **Node.js version** — Confirm `node -v` returns v20+ (required for Next.js 16).
- [x] **Next.js project exists** — Confirm `nextjs/` directory exists with `package.json`, `node_modules` are installed (`npm install`).
- [x] **Figma file access** — Confirm you can open the Figma design file and toggle Dev Mode (`Shift+D`).

---

## Phase 1: Figma Design Token Extraction

Extract every visual value from Figma. Do NOT start coding until this phase is complete — you need these values to configure Tailwind.

### Colors
- [x] Extract **primary color** (hex/HSL) from Figma variables or the most prominent brand color.
- [x] Extract **background color** (page background, card backgrounds).
- [x] Extract **foreground/text color** (primary text, secondary/muted text).
- [x] Extract **border colors** (card borders, input borders, dividers).
- [x] Extract **accent/success/warning/error colors** (status badges, alerts, toast notifications).
- [x] Extract **sidebar background** and **sidebar text/icon** colors.
- [x] Document all colors in a table:
  | Token Name | Hex Value | Usage |
  | :--- | :--- | :--- |
  | brand-light | #EFEBFF | Badge backgrounds, accent links bg |
  | brand-medium | #7D52F4 | Primary buttons, active markers, sidebar selection |
  | brand-dark | #351A75 | Button hover states, text links |
  | success-light | #E3F7EC | Success badge backgrounds (approved status) |
  | success-dark | #0B4627 | Success badge text colors |
  | warning-light | #FFFAEB | Warning badge backgrounds (pending check status) |
  | warning-dark | #624C18 | Warning badge text colors |
  | error-light | #FFEBEC | Error badge backgrounds, destructive invalid inputs bg |
  | error-dark | #681219 | Destructive buttons, error borders, invalid state text |
  | info-light | #EBF1FF | Info badge backgrounds |
  | info-dark | #122368 | Info badge text colors |
  | neutral-50 | #F7F7F7 | Mockup outer framework, collapsible sidebar bg |
  | neutral-100 | #F5F5F5 | Card body grey variant, divider lines |
  | neutral-200 | #EBEBEB | Standard border separator lines, input borders |
  | neutral-300 | #D1D1D1 | Disabled text labels |
  | neutral-400 | #A3A3A3 | Secondary muted descriptions |
  | neutral-500 | #7B7B7B | Sublabel helper caption colors |
  | neutral-600 | #5C5C5C | Secondary body text |
  | neutral-700 | #333333 | Sidebar custom action hover bg |
  | neutral-800 | #262626 | Important buttons bg, dark theme card backgrounds |
  | neutral-900 | #171717 | Primary body text |

### Typography
- [x] Identify **font family** (e.g., Inter, Outfit, Geist). Note which weights are used (400, 500, 600, 700).
- [x] Extract **heading sizes** (h1 through h4 — font-size, line-height, font-weight).
- [x] Extract **body text size** (font-size, line-height).
- [x] Extract **small/caption text size** (labels, helper text, timestamps).
- [x] Extract **letter-spacing** if any headers use tracked-out text.
  | Style Class | Font Family | Size | Weight | Line Height | Tracking |
  | :--- | :--- | :---: | :---: | :---: | :---: |
  | `.text-h3-title` | Aeonik | 40px | 600 (SemiBold) | 48px | -0.01em |
  | `.text-h5-title` | Aeonik | 24px | 600 (SemiBold) | 32px | -0.005em |
  | `.text-h6-title` | Inter | 20px | 550 (Medium) | 28px | -0.006em |
  | `.text-label-xl` | Inter | 24px | 500 (Medium) | 32px | -0.015em |
  | `.text-label-lg` | Inter | 18px | 500 (Medium) | 24px | -0.015em |
  | `.text-label-md` | Inter | 16px | 500 (Medium) | 24px | -0.011em |
  | `.text-label-sm` | Inter | 14px | 500 (Medium) | 20px | -0.006em |
  | `.text-label-xs` | Inter | 12px | 500 (Medium) | 16px | - |
  | `.text-label-compact` | Inter | 13px | 500 (Medium) | 20px | -0.006em |
  | `.text-paragraph-md` | Inter | 16px | 400 (Regular) | 24px | -0.011em |
  | `.text-paragraph-sm` | Inter | 14px | 400 (Regular) | 20px | -0.006em |
  | `.text-paragraph-xs` | Inter | 12px | 400 (Regular) | 16px | - |
  | `.text-paragraph-compact` | Inter | 13px | 400 (Regular) | 20px | -0.006em |
  | `.text-subheading-2xs` | Inter | 11px | 500 (Medium) | 12px | 0.02em (UPPER) |
  | `.text-subheading-xs` | Inter | 12px | 500 (Medium) | 16px | 0.04em (UPPER) |

### Spacing & Layout
- [x] Identify the **spacing scale** (is it 4px increments? 8px? Check padding and gaps).
- [x] Extract **page padding** (distance from viewport edge to content area).
- [x] Extract **card padding** (inner padding of card components).
- [x] Extract **grid gap** (spacing between cards in a grid).
- [x] Extract **sidebar width** (fixed width in pixels).
- [x] Extract **header height** (fixed height in pixels).

### Border Radii
- [x] Extract border radius for **cards** (usually 8px, 12px, or 16px).
- [x] Extract border radius for **buttons** (usually 6px or 8px).
- [x] Extract border radius for **inputs** (usually 6px or 8px).
- [x] Extract border radius for **avatars** (usually `50%` / fully rounded).

### Shadows & Effects
- [x] Extract **card shadow** (box-shadow values from Figma effects panel).
- [x] Extract **dropdown/popover shadow** (usually deeper than card shadow).
- [x] Note any **backdrop blur** effects (glassmorphism on modals, etc.).

### Breakpoints
- [x] Confirm **desktop artboard width** (usually 1440px or 1920px).
- [x] Check if there is a **mobile artboard** (usually 375px).
- [x] Check if there is a **tablet artboard** (usually 768px or 1024px).

---

## Phase 2: Next.js Project Configuration

Apply the design tokens to the project infrastructure.

### API Proxy
- [ ] Update `nextjs/next.config.ts` with `rewrites()` rule: `/api/:path*` → `http://localhost:8081/:path*`.
- [ ] Verify the rewrite works: start both backend and frontend, open browser DevTools, make a fetch to `/api/initdata/start` and confirm it returns data (not a 404).

### Environment Variables
- [ ] Create `nextjs/.env.local` with:
  ```
  NEXT_PUBLIC_API_URL=/api
  NEXT_PUBLIC_WS_URL=http://localhost:8082
  ```
- [x] Add `.env.local` to `.gitignore` (confirm it's already there).

### Fonts
- [x] Install the font identified in Phase 1 using `next/font/google` in `layout.tsx`.
- [x] Set the CSS variable (e.g., `--font-sans`) on the `<html>` element.
- [ ] Verify the font loads — inspect any text element in browser DevTools → Computed tab → `font-family` should show the correct font, not a system fallback.

### Tailwind Theme
- [x] Update `src/app/globals.css` `@theme` block with all color tokens from Phase 1.
- [x] Add font-family variables to the theme.
- [x] Add custom border-radius values if they differ from Tailwind defaults.
- [ ] Verify the theme works: create a test `<div className="bg-primary text-primary-foreground p-6 rounded-lg">Hello</div>` and confirm it renders with the correct Figma colors.

---

## Phase 3: Core Library Files

Build the foundational utilities that every page will depend on.

### Auth Library (`src/lib/auth.ts`)
- [x] Implement `getToken(): string | null` — reads from `localStorage["viems.auth.token"]`.
- [x] Implement `setToken(token: string): void` — writes to localStorage.
- [x] Implement `removeToken(): void` — clears from localStorage.
- [x] Implement `isAuthenticated(): boolean` — returns `true` if token exists and is not expired.
- [x] Test: Set a token manually in localStorage, call `getToken()`, confirm it returns the value.

### API Client (`src/lib/api-client.ts`)
- [x] Create a `apiClient` object with `get()`, `post()`, `put()`, `patch()`, `delete()` methods.
- [x] Each method wraps `fetch()` and auto-attaches `Authorization: Bearer <token>` header.
- [x] Handle `401` responses globally: call `removeToken()` and redirect to `/login`.
- [x] Handle `403` responses: throw an error that the calling component can catch and display.
- [x] Support `multipart/form-data` for file uploads (do NOT set `Content-Type` header — let the browser set it with the boundary).
- [ ] Test: Call `apiClient.get("/users/userinfo")` after logging in. Confirm you get user data back.

### API Endpoints Registry (`src/lib/api-endpoints.ts`)
- [x] Create a constant object mirroring every endpoint from the old `front/public/common/apiurl.js`.
- [x] Use the `NEXT_PUBLIC_API_URL` env variable as the base.
- [x] Example: `ENDPOINTS.auth.login = "/api/auth/login"`.

### TypeScript Types (`src/types/api.ts`)
- [x] Define `User` interface (id, email, role, status, personalInfo, avatar).
- [x] Define `Migrant` interface (id, firstName, lastName, dateOfBirth, nationalityId, cases, etc.).
- [x] Define `Case` interface (id, migrantId, caseTypeId, status, submissionDate, etc.).
- [x] Define `Lead` interface.
- [x] Define `Employee` interface.
- [x] Define `Task` interface.
- [x] Define `FileDocument` interface.
- [x] Define all API response wrapper types.
- [x] Note: You can refine these as you discover actual response shapes. Start with the basics and add fields as you build each page.

### Constants (`src/lib/constants.ts`)
- [x] Copy `Decision` array (Pending, Granted, Refused, Withdrawn) from `initStartData.js`.
- [x] Copy `Months` array from `initStartData.js`.
- [x] Copy `CreatedBy` filter options from `initStartData.js`.
- [x] Copy `WaysToFilterByDates` from `initStartData.js`.

---

## Phase 4: Authentication Pages

### Login Page (`/login`)
- [x] Build login form with email input, password input, submit button — styled from Figma.
- [x] Wire form submission to `POST /auth/login`.
- [x] On success (no OTP): store token, redirect to `/dashboard`.
- [x] On success (OTP enabled): show OTP input screen.
- [x] On error: display the backend error message in a toast/alert.
- [x] Handle "Account locked" error (3 wrong attempts) — show the specific message.
- [ ] Test with valid credentials — confirm login works end to end.
- [ ] Test with wrong credentials — confirm error message appears.

### OTP Verification (conditional screen within login)
- [x] Build 6-digit OTP input (can use `input-otp` library, already installed).
- [x] Wire submission to `POST /auth/otppass`.
- [x] On success: store token, redirect to `/dashboard`.
- [x] On error: show error, allow retry (up to 3 attempts).

### Registration Page (`/register`)
- [x] Build registration form matching Figma design.
- [x] Wire to `POST /auth/register`.
- [x] Only accessible via invite link (check for required query parameters).

### Reset Password Page (`/reset-password`)
- [x] Build "forgot password" form (email input).
- [x] Wire to `POST /auth/reset`.
- [x] Show success message: "Check your email for a reset link."

### Create Password Page (`/create-password`)
- [x] Build password creation form (new password + confirm password).
- [x] Wire to `POST /auth/createpass`.
- [x] Validate that passwords match before submitting.
- [x] Only accessible from invite/reset email links (check for expiry query param).

---

## Phase 5: Application Shell

### Sidebar Navigation
- [x] Build sidebar component matching Figma nav design.
- [x] Include menu items: Dashboard, Migrants, Cases, File Explorer, Search, Profile, Settings.
- [x] Include admin-only items (visible only for `superadmin`/`supervisor`): Admin section with Employees, Assignments, Archive, Logs.
- [x] Highlight the active route.
- [x] Show user avatar and name at the bottom of the sidebar.
- [ ] Make sidebar collapsible if Figma shows a collapsed state.

### Header Bar
- [ ] Build top header with: page title (or breadcrumbs), global search input, notification bell icon, user avatar dropdown.
- [ ] Wire search input to navigate to `/search?q={query}` on Enter.
- [ ] Wire notification bell to show a dropdown with recent notifications.
- [ ] Wire avatar dropdown to show: Profile, Settings, Logout.
- [x] Logout action: call `removeToken()`, redirect to `/login`.

### Auth Guard (`(app)/layout.tsx`)
- [x] On mount, check if `isAuthenticated()` returns `true`.
- [x] If not authenticated, redirect to `/login`.
- [x] Fetch current user info via `GET /users/userinfo` to get role, name, avatar.
- [x] Store user info in React Context (create `AuthContext` / `UserContext`).
- [x] Pass user info to sidebar and header components.

### Admin Guard (`admin/layout.tsx`)
- [ ] Check if current user's role is `superadmin` or `supervisor`.
- [ ] If not, redirect to `/dashboard` or show "Access Denied" page.

### WebSocket Connection
- [ ] Establish Socket.IO connection in `(app)/layout.tsx` after auth check.
- [ ] Pass JWT token as query parameter in the handshake.
- [ ] Listen for `caseNotifications`, `leadNotifications`, `requestNotifications`, `archivingManagementNotifications`.
- [ ] On receiving a notification, show a toast (Sonner) and optionally trigger data refetch.
- [ ] Disconnect the socket on logout or when leaving the app shell.

---

## Phase 6: Dashboard Module

### Dashboard Home (`/dashboard`)
- [ ] Fetch summary stats from `GET /statistics/dashboard`.
- [ ] Build stats cards row (Total Cases, Active Migrants, Pending Tasks, etc.) — styled from Figma.
- [ ] Fetch nationality breakdown from `GET /statistics/nationalities`.
- [ ] Build nationality pie/bar chart using Recharts.
- [ ] Fetch conversion data from `GET /statistics/conversion`.
- [ ] Build conversion chart using Recharts.
- [ ] Add loading skeletons while data is fetching.

### Tasks Page (`/dashboard/tasks`)
- [ ] Fetch tasks from `GET /tasks`.
- [ ] Build task list/table — styled from Figma.
- [ ] Implement "Create Task" form (modal or inline).
- [ ] Implement task edit and status update (`PUT /tasks/:id`).
- [ ] Show "My Tasks" for agents, "All Tasks" for admins (check user role).

### Working Cases (`/dashboard/working-cases`)
- [ ] Fetch cases with `GET /cases?data=migrantsActive`.
- [ ] Build cases grid/table — styled from Figma.
- [ ] Link each case row to its detail page (`/cases/[id]`).

### Schedule (`/dashboard/schedule`)
- [ ] Fetch schedule from `GET /dashboard/schedule` and `GET /dashboard/calendar`.
- [ ] Build a calendar component (use a React calendar library or build from scratch).
- [ ] Display events from `GET /events`.

### Reports (`/dashboard/reports`)
- [ ] Fetch report data from `GET /statistics/reports`.
- [ ] Build report charts — styled from Figma.

### Leads (`/dashboard/leads`)
- [ ] Fetch leads from `GET /leads`.
- [ ] Build leads data table — styled from Figma.
- [ ] Implement create lead form (`POST /leads`).
- [ ] Implement edit lead (`PUT /leads/:id`).

---

## Phase 7: Migrants Module

### Migrants List (`/migrants`)
- [ ] Fetch migrants from `GET /migrants` with pagination, search, and filter parameters.
- [ ] Build data table component with columns from Figma.
- [ ] Implement pagination controls.
- [ ] Implement search bar that filters the list.
- [ ] Implement "Create Migrant" button → opens form.
- [ ] Create migrant form with fields: firstName, lastName, dateOfBirth, nationalityId, photo upload.
- [ ] Wire form to `POST /migrants` (create) and `PUT /migrants/:id` (edit).
- [ ] Test: create a migrant, verify it appears in the list.

### Migrant Detail (`/migrants/[id]`)
- [ ] Fetch migrant data from `GET /migrants/:id`.
- [ ] Build tabbed detail view (Personal Info, Cases, Documents, Travel History) — styled from Figma.
- [ ] Personal Info tab: display and allow editing of migrant fields.
- [ ] Cases tab: fetch from `GET /migrants/cases`, display linked cases.
- [ ] Documents tab: fetch files linked to this migrant, display with download links.
- [ ] Travel History tab: fetch from `GET /migrants/:id/travel-history`.
- [ ] Add "Archive" action for admins (`POST /migrants/archive`).

---

## Phase 8: Cases Module

### Cases List (`/cases`)
- [ ] Fetch cases from `GET /cases` with filters and pagination.
- [ ] Build data table — styled from Figma.
- [ ] Implement status column with colored badges (Pending, Granted, Refused, Withdrawn).
- [ ] Implement "Create Case" button → opens case form.
- [ ] Wire case form to `POST /cases` and `PUT /cases/:id`.

### Case Detail (`/cases/[id]`)
- [ ] Fetch case from `GET /cases/:id`.
- [ ] Build tabbed view (Details, Documents, Timeline) — styled from Figma.
- [ ] Details tab: show case info, assigned employee, linked migrant.
- [ ] Documents tab: show/upload case documents.
- [ ] Implement case status changes and updates.

### Templates (`/cases/templates`)
- [ ] Fetch from `GET /case-templates`.
- [ ] Build template list.
- [ ] Implement CRUD for templates.

### Refusals (`/cases/refusals`)
- [ ] Fetch from `GET /migrants/credibility` and `GET /migrants/credibility/insights`.
- [ ] Build credibility analysis views with charts.

---

## Phase 9: Leads Module

- [ ] Already partially done in Phase 6 (Dashboard Leads tab).
- [ ] If leads has its own dedicated page, build `/leads` with the full CRUD interface.
- [ ] Implement archive (`POST /leads/archive`) and restore (`POST /leads/restore`) for admins.

---

## Phase 10: Files & Documents Module

### File Explorer (`/files`)
- [ ] Fetch system folders from `GET /folders/system`.
- [ ] Fetch custom folders from `GET /folders/custom`.
- [ ] Build folder tree navigation (sidebar or collapsible tree) — styled from Figma.
- [ ] Build document grid/list view for the selected folder.
- [ ] Implement file download with token-authenticated URLs:
  ```
  /api/files/view/{id}?Authorization=Bearer {token}
  ```
- [ ] Implement file upload (drag-and-drop zone) wired to `POST /files/upload`.
- [ ] Support different upload endpoints based on document type:
  - [ ] `POST /files/upload/custom`
  - [ ] `POST /files/upload/right-to-work`
  - [ ] `POST /files/upload/background-check`
- [ ] Implement folder operations: create, rename (`PUT /folders/custom/rename`), move (`PUT /folders/custom/move`).
- [ ] Implement file operations: rename (`PUT /files/rename`), soft-delete (`POST /files/archive`).

---

## Phase 11: Supporting Pages

### Search (`/search`)
- [ ] Receive query from URL param `?q=`.
- [ ] Fetch results from `GET /search?q={query}`.
- [ ] Display grouped results (migrants, cases, leads) — styled from Figma.
- [ ] Make each result clickable → navigates to the entity detail page.

### Profile (`/profile`)
- [ ] Fetch from `GET /users/profile`.
- [ ] Build profile view with avatar, personal info — styled from Figma.
- [ ] Implement profile edit with photo upload (`PATCH /users/profile`).

### Settings (`/settings`)
- [ ] Fetch from `GET /users/settings`.
- [ ] Build settings form (notification preferences, timezone, etc.) — styled from Figma.
- [ ] Implement custom fields management (`GET /custom-fields`, `POST /custom-fields`, etc.).
- [ ] Wire save to `PATCH /users/settings/:id`.

### Requests (`/requests`)
- [ ] Fetch from `GET /archive-requests/user` (for agents).
- [ ] Build request list — styled from Figma.
- [ ] Implement cancel action (`POST /archive-requests/cancel`).

---

## Phase 12: Admin Module

### Employees (`/admin/employees`)
- [ ] Fetch from `GET /employees`.
- [ ] Build employee table — styled from Figma.
- [ ] Implement actions:
  - [ ] "Send Registration Link" → `POST /employees/send-registration-link`
  - [ ] "Unblock Login" → `POST /employees/restore-blocked`
  - [ ] "Reset Password" → `POST /employees/restore-password`
- [ ] Implement create/edit employee forms.

### Assignments (`/admin/assignments`)
- [ ] Fetch from `GET /cases/assignments`.
- [ ] Build assignment distribution view — styled from Figma.

### Archive (`/admin/archive`)
- [ ] Build archive management with tabs for Migrants, Cases, Leads.
- [ ] Show archived items with restore actions.
- [ ] Implement bulk archive with preview:
  1. `GET /cases/bulk-archive/preview` → show preview table.
  2. `POST /cases/bulk-archive` → execute.
- [ ] Implement bulk restore similarly.
- [ ] Implement archiving schedule management:
  - [ ] Fetch from `GET /archiving/settings`.
  - [ ] Update via `PUT /archiving/settings`.
  - [ ] Show archiving log from `GET /archiving/log`.

### Logs (`/admin/logs`)
- [ ] Fetch from `GET /logs`.
- [ ] Build audit log table with filters (date range, user, action type) — styled from Figma.

---

## Phase 13: Polish & Edge Cases

- [ ] Add **loading skeletons** to every page that fetches data (use shadcn Skeleton component).
- [ ] Add **empty states** for every list/table (illustration + "No data yet" message).
- [ ] Add **error boundaries** wrapping each route group to catch render errors gracefully.
- [ ] Add **error states** for failed API calls ("Something went wrong. Try again." + Retry button).
- [ ] Add **confirmation dialogs** for all destructive actions (archive, delete, bulk operations).
- [ ] Add **toast notifications** using Sonner for success/error feedback on form submissions.
- [ ] Replace all `<img>` tags with `next/image` `<Image>` component for optimized loading.
- [ ] Add **keyboard navigation**: all interactive elements reachable with Tab, activated with Enter.
- [ ] Add **aria-labels** on icon-only buttons (e.g., notification bell, sidebar toggle).
- [ ] Use semantic HTML: `<main>`, `<nav>`, `<header>`, `<section>`, `<aside>`.
- [ ] Test **slow network** (Chrome DevTools → Network → Slow 3G): confirm skeletons appear and pages don't break.

---

## Phase 14: Testing & QA

### API Verification
- [ ] Open each page with browser DevTools Network tab open. Confirm zero `4xx` or `5xx` errors.
- [ ] Verify response payload shapes match the TypeScript types in `src/types/api.ts`.
- [ ] Test every form submission (create, edit, delete) and confirm the data persists correctly.

### Auth Testing
- [ ] Test login with valid credentials → confirm redirect to `/dashboard`.
- [ ] Test login with wrong password → confirm error message shown.
- [ ] Test login with wrong password 3 times → confirm lockout message.
- [ ] Test OTP flow (if `OTP_LOGIN=true`) → confirm full cycle works.
- [ ] Test accessing `/dashboard` without a token → confirm redirect to `/login`.
- [ ] Test with expired token → confirm redirect to `/login`.
- [ ] Test logout → confirm token removed, redirect to `/login`, back button doesn't return to app.

### Role Testing
- [ ] Login as **Agent** → confirm admin menu items are hidden. Try navigating to `/admin/employees` directly → confirm redirect/block.
- [ ] Login as **Superadmin** → confirm all menu items visible, admin pages accessible.

### Responsive Testing
- [ ] Test at `1024px` (iPad landscape) — confirm layouts don't overflow.
- [ ] Test at `1280px` (laptop) — confirm comfortable spacing.
- [ ] Test at `1440px` (standard desktop) — this should match Figma exactly.
- [ ] Test at `1920px` (full HD) — confirm content doesn't stretch too wide.

### Cross-Browser
- [ ] Test in Chrome (primary).
- [ ] Test in Firefox — confirm no layout differences.
- [ ] Test in Safari — confirm no WebKit-specific issues.

### Performance
- [ ] Run Lighthouse audit. Target scores:
  - [ ] Performance: > 80
  - [ ] Accessibility: > 90
  - [ ] Best Practices: > 90
- [ ] Confirm no Cumulative Layout Shift (CLS) issues — all images must have explicit width/height.

---

## Phase 15: Production Deployment

### Build
- [ ] Run `cd nextjs && npm run build`. Confirm zero build errors.
- [ ] Run `npm run start` to test the production build locally. Visit `http://localhost:3000` and run through critical flows.

### Server Setup
- [ ] Set up the production `.env.production` with the correct API URL (the real backend domain, or `/api` if behind the same Nginx).
- [ ] Install PM2 or configure the hosting platform (Vercel/Docker).
- [ ] Start the Next.js production server:
  ```bash
  pm2 start npm --name "viems-nextjs" -- run start
  ```

### Nginx Update
- [ ] Update the production Nginx config to proxy `/` to the Next.js server (port 3000) instead of serving old static files.
- [ ] Keep `/server/*` proxy to NestJS backend (port 8081) unchanged.
- [ ] Keep `/socket.io/` proxy to WebSocket (port 8082) unchanged.
- [ ] Test the Nginx config: `nginx -t` (syntax check), then `nginx -s reload`.

### DNS / Domain
- [ ] Confirm the production domain points to the server running Nginx.
- [ ] Test HTTPS/SSL certificate is valid.

### Smoke Test Production
- [ ] Test login on the production URL.
- [ ] Test creating a migrant.
- [ ] Test uploading a document.
- [ ] Test WebSocket notifications.
- [ ] Test admin panel access.
- [ ] Monitor server logs for the first 24 hours.

---

## Phase 16: Cleanup

Only do this after **2 weeks of stable production** with zero critical bugs.

- [ ] Remove the `/front` directory from the repository (or move to a `_deprecated/` folder).
- [ ] Remove old Webpack/Babel/DHTMLX dependencies from root `package.json`.
- [ ] Update Docker `docker-compose.yml` to remove old frontend volume mounts.
- [ ] Update `startapp.sh` script to not reference old frontend build commands.
- [ ] Update root `README.md` to document the new Next.js stack.
- [ ] Update Nginx configs to remove old static file serving blocks.
- [ ] Archive this migration documentation (keep it in the repo for historical reference, but add a note that it's completed).

---

> **Remember:** Each phase must be fully checked off before moving to the next. If you discover a missing endpoint or a design change, add it to the relevant phase and mark it unchecked.
