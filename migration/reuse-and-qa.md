# Code Reuse, Testing, and Quality Assurance Strategy

This document details what assets/logic to copy from the old frontend, what to rewrite, and the local testing verification checklists.

---

## 1. What to Reuse vs. What to Rewrite

### Code & Config Elements to Reuse (Copy and Adapt)
You can directly migrate and refactor these specific structures:
*   **Constant Arrays:** Copy month lists, decision mappings (pending, granted, refused, withdrawn), and filter types from `front/public/initStartData.js` and paste them into `nextjs/src/lib/constants.ts`.
*   **Token Access Keys:** Keep using `viems.auth.token` as the `localStorage` key. This allows seamless session preservation if you run both frontends in parallel.
*   **API Route Lists:** Convert paths defined in `front/public/common/apiurl.js` directly into endpoints inside `nextjs/src/lib/api-endpoints.ts`.
*   **User Role Validation Logic:** Extract the role parsing logic (`isAdmin`, `isAgent`) from `front/public/common/initGlobalObject.js` and adapt it to your React Auth Context.

### Items to Rewrite (Do NOT copy)
*   **All DHTMLX layouts, forms, and grids:** These must be built from scratch using clean Next.js TSX elements styled with Tailwind and shadcn UI primitives.
*   **Webpack/Babel Settings:** Let Next.js handle compilation. Do not copy old webpack configurations.
*   **Vanilla CSS and custom SCSS files:** All element style rules are replaced with inline Tailwind utilities or global variables in `globals.css`.
*   **Global Window Variables (`window.global.VIEMS`):** Replaced by standard React Context, hook structures, or state libraries like Zustand.

---

## 2. Local Testing & Verification Checklist

Before considering a page migration complete, verify the following points locally:

### 2.1 API Validation
- [ ] Inspect the browser Network tab when loading the page: verify no HTTP calls fail with 401 (Unauthorized), 403 (Forbidden), or 500 (Server Error).
- [ ] Confirm JSON payloads match between old and new frontends (check structure, variable keys, and date formats).

### 2.2 Auth State
- [ ] Attempt to load a protected path (e.g., `/dashboard`) when the token is missing: verify you are redirected to `/login`.
- [ ] Verify logging out deletes the token from `localStorage` and redirects to `/login`.

### 2.3 Role Actions
- [ ] Log in as an Agent: confirm that admin pages (`/admin/*`) are blocked or hidden from the sidebar.
- [ ] Log in as an Admin: confirm you can access the Employees panel.

### 2.4 Pixel-Perfect Design Alignment
- [ ] Check container layouts against Figma screenshots.
- [ ] Verify font weights, colors, line heights, and margins match the inspected values in Figma.
- [ ] Test the page at minimum mobile resolution (320px) up to widescreen desktop resolution (1920px+) to ensure no elements break or overlap.
