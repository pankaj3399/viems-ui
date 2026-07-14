# VIEMS Frontend Migration — Documentation Hub

> **Goal:** Replace the old Webpack + Vanilla JS frontend (`/front`) with a new **Next.js 16 + Tailwind CSS v4 + shadcn/ui** frontend (`/nextjs`), while reusing the existing NestJS backend and MySQL database with zero backend changes.

---

## Quick Start

1. Read **[Phase Tracker](./migration/phases.md)** first — it tells you exactly what to do, in what order, with checkboxes.
2. When you need to understand the backend, open **[Backend Reference](./migration/backend.md)** — every endpoint, every env variable, every rule.
3. For project structure and Figma translation rules, read **[Frontend Roadmap](./migration/frontend-roadmap.md)**.
4. For architecture diagrams and local dev setup, read **[Architecture & Setup](./migration/architecture-and-setup.md)**.
5. For knowing what to reuse from the old codebase and QA checklists, read **[Reuse & QA](./migration/reuse-and-qa.md)**.

---

## Documents

### 📋 [phases.md](./migration/phases.md) — Phase Tracker & Master Checklist
The single source of truth for tracking progress. Contains **17 phases** from pre-flight checks through production deployment and cleanup. Every phase has granular checkboxes tied to specific endpoints, files, and verifications. **Mark items as you complete them.**

### 🔧 [backend.md](./migration/backend.md) — Backend Reference (Do Not Modify)
Complete reference of the NestJS backend: module map, every API endpoint with auth requirements and roles, JWT authentication system, RBAC roles, WebSocket events, file storage, email, cron jobs, environment variables, database architecture, error messages, and a "Critical Rules — What You Must Never Do" section. **Read this before making any API call.**

### 🏗️ [architecture-and-setup.md](./migration/architecture-and-setup.md) — Architecture & Local Dev Setup
Development vs. production topology diagrams, tech stack comparison table, and step-by-step instructions for configuring the Next.js rewrite proxy, environment variables, and starting both servers locally.

### 🗺️ [frontend-roadmap.md](./migration/frontend-roadmap.md) — Frontend Development Roadmap
Next.js project directory structure, page-to-route inventory map (old frontend views → new Next.js App Router paths), Figma-to-Tailwind CSS translation rules, and a condensed phase overview.

### ✅ [reuse-and-qa.md](./migration/reuse-and-qa.md) — Code Reuse & QA Strategy
What to copy from the old frontend (constants, auth key, API paths, role logic) vs. what to rewrite from scratch (DHTMLX, Webpack, SCSS, global state). Local testing checklists for API, auth, roles, and design alignment.

---

## File Structure

```
nextjs/
├── migration.md                        ← You are here (this index file)
├── migration/
│   ├── phases.md                       ← Master checklist (start here)
│   ├── backend.md                      ← Full backend reference
│   ├── architecture-and-setup.md       ← Architecture diagrams & dev setup
│   ├── frontend-roadmap.md             ← Project structure & Figma rules
│   └── reuse-and-qa.md                 ← What to reuse/rewrite & QA checklists
```
