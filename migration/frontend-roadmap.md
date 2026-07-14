# Next.js Frontend Development Roadmap

This document outlines the phased migration timeline, page inventory mapping, folder layout structure, and Figma layout conversion rules.

---

## 1. Project Directory Structure

Use the following folder structure inside `/nextjs/src` to keep views, components, hooks, and endpoints modular:

```
src/
├── app/
│   ├── globals.css              # Custom Tailwind variables and theme overrides
│   ├── layout.tsx               # Root HTML wrapper (fonts, theme providers)
│   │
│   ├── (auth)/                  # Public Pages (login, password registers)
│   │   ├── login/page.tsx
│   │   └── ...
│   │
│   └── (app)/                   # Protected App Pages (dashboard, migrants)
│       ├── layout.tsx           # App Shell (Sidebar, Header, socket connection)
│       ├── dashboard/page.tsx
│       ├── migrants/page.tsx
│       └── ...
│
├── components/
│   ├── ui/                      # shadcn/ui components (buttons, dialogs, inputs)
│   ├── layout/                  # Navigation Sidebar, Top Header
│   └── forms/                   # Case and Migrant form logic
│
├── lib/
│   ├── api-client.ts            # Fetch helper appending Authorization bearer header
│   └── api-endpoints.ts         # Endpoint mappings (matching old apiurl.js)
│
├── hooks/
│   ├── use-auth.ts              # Authentication state provider
│   └── use-socket.ts            # Socket.io notification listener
│
└── types/
    └── api.ts                   # Types matching backend responses
```

---

## 2. Page & View Inventory Map

Mirror the old frontend views into Next.js App Router paths:

| Old View Layout | Next.js Page Route | Access Level |
| :--- | :--- | :--- |
| Login Page | `/login` | Public |
| Registration Page | `/register` | Public |
| Dashboard Home | `/dashboard` | Protected (Agent/Admin) |
| Active Working Cases | `/dashboard/working-cases` | Protected (Agent/Admin) |
| Task Boards | `/dashboard/tasks` | Protected (Agent/Admin) |
| Scheduler Calendar | `/dashboard/schedule` | Protected (Agent/Admin) |
| Migrants List | `/migrants` | Protected (Agent/Admin) |
| Migrant Detail Tab | `/migrants/[id]` | Protected (Agent/Admin) |
| Cases Grid | `/cases` | Protected (Agent/Admin) |
| Case Detail Tab | `/cases/[id]` | Protected (Agent/Admin) |
| File Explorer Tree | `/files` | Protected (Agent/Admin) |
| Settings Tab | `/settings` | Protected (Agent/Admin) |
| Admin: Employees | `/admin/employees` | Protected (Admin Only) |
| Admin: Case Assignments | `/admin/assignments` | Protected (Admin Only) |
| Admin: Archive Panel | `/admin/archive` | Protected (Admin Only) |
| Admin: System Logs | `/admin/logs` | Protected (Admin Only) |

---

## 3. Figma Visual Translation Rules

When designing components from Figma frames:
*   **Inspect Container Layout:** If a container has auto-layout enabled, translate to flexbox:
    *   *Direction Vertical:* Use class `flex flex-col`
    *   *Direction Horizontal:* Use class `flex flex-row items-center`
    *   *Gap: 12px:* Use class `gap-3`
*   **Inspect Spacing:** 
    *   *Padding: 24px:* Use class `p-6`
    *   *Padding Top-Bottom 16px, Left-Right 8px:* Use class `py-4 px-2`
*   **Inspect Border Radii:** 
    *   *Corner radius 8px:* Use class `rounded-lg`
    *   *Corner radius 12px:* Use class `rounded-xl`
*   **Inspect Font Weights:**
    *   *Regular (400):* Use class `font-normal`
    *   *Medium (500):* Use class `font-medium`
    *   *Semi-bold (600):* Use class `font-semibold`

---

## 4. Phase-by-Phase Roadmap

### Phase 1: Core Setup
- [ ] Configure rewrite proxy settings in `next.config.ts`.
- [ ] Construct the HTTP `api-client.ts` wrapper adding token headers.
- [ ] Define global styles matching Figma style guidelines in `globals.css`.

### Phase 2: Auth Pages
- [ ] Build `/login` with email/password inputs.
- [ ] Support OTP interface screens.
- [ ] Build `/register` and `/reset-password` templates.

### Phase 3: Application Shell
- [ ] Implement Sidebar navigation listing main dashboard options.
- [ ] Implement Top header bar displaying active user avatar profile details.
- [ ] Connect client Socket.io hooks to listen for realtime notification events.

### Phase 4: Primary Modules
- [ ] Assemble `/dashboard` containing statistic summaries and charts.
- [ ] Assemble `/migrants` listing active applicants.
- [ ] Assemble `/migrants/[id]` displaying details and files.
- [ ] Assemble `/cases` displaying files and timeline events.

### Phase 5: Secondary Modules & Admin Panel
- [ ] Build `/files` showing file explorer hierarchies.
- [ ] Build `/settings` containing custom field options.
- [ ] Build `/admin/employees` enabling account controls (lock, reset, invite).
- [ ] Build `/admin/logs` audit dashboard list.
