# VIEMS — Next.js 16 Modern Frontend

This directory contains the new **Next.js 16 + Tailwind CSS v4 + shadcn/ui** frontend for EEUKNET LTD — VIEMS.

---

## 📊 Migration Phase Tracker (`phases.md`)

Below is the current phase status for the Next.js migration.

### Phase Overview

| # | Phase | Status | Description |
| :---: | :--- | :---: | :--- |
| 0 | Pre-Flight Checks | `[x]` | Verify backend works, database has data, tools are ready |
| 1 | Figma Design Token Extraction | `[x]` | Extract colors, fonts, spacing, radii from Figma |
| 2 | Next.js Project Configuration | `[x]` | Configure proxy, env, fonts, Tailwind theme |
| 3 | Core Library Files | `[x]` | Build auth, API client, types, constants |
| 4 | Authentication Pages | `[x]` | Login, register, password reset, OTP |
| 5 | Application Shell | `[x]` | Sidebar, header, layout, auth guard, WebSocket |
| 6 | Dashboard Module | `[x]` | Dashboard stats, charts, tasks, calendar widget, WorldMapSvg |
| 7 | Migrants Module | `[ ]` | Migrants list, detail, forms, travel history (Placeholder page ready) |
| 8 | Cases Module | `[x]` | Cases list, detail workspace, status tabs, creation modal, custom icons |
| 9 | Leads Module | `[ ]` | Leads list, create, edit |
| 10 | Files & Documents Module | `[ ]` | File explorer, upload, download, folder management |
| 11 | Supporting Pages & Analytics | `[x]` | Insights data visualizer, 63+ UI component library showcase |
| 12 | Admin Module | `[ ]` | Employees, assignments, archive, logs (Placeholder page ready) |
| 13 | Polish & Edge Cases | `[ ]` | Skeletons, errors, empty states, accessibility |
| 14 | Testing & QA | `[ ]` | Cross-browser, responsive, API verification |
| 15 | Production Deployment | `[ ]` | Build, Nginx config, DNS switch, monitoring |
| 16 | Cleanup | `[ ]` | Remove old frontend, update docs |

*Master phase tracker checklist: [`migration/phases.md`](./migration/phases.md).*

---

## 🚀 Getting Started

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### Key Routes & Pages

- **`/dashboard`**: Main Dashboard with World Map SVG, Charts, Tasks, & Calendar
- **`/cases`**: Cases Directory with status tabs, search, pagination, & creation modal
- **`/cases/[id]`**: Case Detail Workspace with stage tracker, assignees, notes, & documents
- **`/insights`**: Data Visualizer & Analytics Suite
- **`/library`**: Design System Tokens & 63+ UI Component Showcase
- **`/(auth)/login`**: Authentication & OTP Verification flow
