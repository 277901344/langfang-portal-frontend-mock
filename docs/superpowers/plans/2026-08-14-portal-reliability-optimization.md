# Portal Reliability Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make local development asset loading resilient and reduce the initial route bundle while preserving the portal's UI and mock behavior.

**Architecture:** Public files are addressed through one base-aware helper, and image error handling is centralized in one idempotent function. Route pages are loaded with `React.lazy` behind one `Suspense` boundary so shared providers and layout stay eager.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, React Router 7, Vitest

## Global Constraints

- `npm run dev` is the primary runtime target.
- Do not redesign UI, alter business copy, change route URLs, or change mock API behavior.
- Do not stop the unrelated Vite processes on ports 3000 and 3001.
- The project has no Git metadata, so worktree and commit steps are unavailable.

---

### Task 1: Public Asset URL And Image Fallback

**Files:**
- Create: `src/lib/publicAssets.ts`
- Create: `src/lib/publicAssets.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/pages/Home.tsx`
- Modify: `src/components/PageBanner.tsx`
- Modify: `src/components/AuthShell.tsx`
- Modify: `src/pages/DocumentCenter.tsx`
- Modify: `src/pages/Scenarios.tsx`
- Modify: `src/pages/ScenarioDetail.tsx`

**Interfaces:**
- Produces: `publicAssetUrl(path: string, baseUrl?: string): string`
- Produces: `applyImageFallback(image: Pick<HTMLImageElement, 'src' | 'dataset'>, fallbackSrc: string): void`

- [ ] **Step 1: Install the declared test runner**

Run: `npm install --save-dev vitest@^3.2.4`

- [ ] **Step 2: Write failing tests**

Test normalization of `assets/x.png`, `/assets/x.png`, and `public/assets/x.png` against both `/` and `./` bases. Test that absolute `https:`, `data:`, and `blob:` URLs remain unchanged. Test that image fallback applies once and cannot recurse.

- [ ] **Step 3: Run the tests and confirm RED**

Run: `npm test -- src/lib/publicAssets.test.ts`

Expected: FAIL because `src/lib/publicAssets.ts` does not exist.

- [ ] **Step 4: Implement the minimal helpers**

`publicAssetUrl` strips an optional `public/` prefix and leading slashes, preserves external/data/blob URLs, and prefixes local paths with the supplied base or `import.meta.env.BASE_URL`. `applyImageFallback` sets `dataset.imageFallbackApplied` before changing `src` and no-ops on subsequent calls.

- [ ] **Step 5: Replace inconsistent public URLs and add fallbacks**

Use `publicAssetUrl` for home video/poster/architecture images, banner mappings and custom banner images, authentication background/logo, and document downloads. Apply `applyImageFallback` to display-critical and remote content images, using the local banner image as the fallback.

- [ ] **Step 6: Run focused and full tests**

Run: `npm test -- src/lib/publicAssets.test.ts`

Run: `npm test`

Expected: all tests PASS.

### Task 2: Route-Level Code Splitting

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: existing page exports and route paths
- Produces: lazy route chunks with unchanged URLs and elements

- [ ] **Step 1: Capture the current bundle baseline**

Run: `npm run build`

Expected: one entry JavaScript chunk around 941 KB and a Vite chunk-size warning.

- [ ] **Step 2: Convert page modules to lazy imports**

Keep providers, `Layout`, and `AccessWizardModal` eager. Use `lazy(() => import(...).then(module => ({ default: module.NamedExport })))` for named exports and direct lazy imports for default exports. Remove the unused `OperationsManagement` import.

- [ ] **Step 3: Add one route loading boundary**

Wrap `Routes` with `Suspense` and an accessible `role="status"` loading element that uses stable dimensions and existing neutral/blue styles.

- [ ] **Step 4: Verify compilation and bundle output**

Run: `npm run lint`

Run: `npm run build`

Expected: both commands exit 0, route chunks are emitted, and the initial entry chunk is materially smaller than 941 KB.

### Task 3: Runtime Regression Verification

**Files:**
- Modify only if verification exposes a reproducible defect in Task 1 or Task 2.

**Interfaces:**
- Consumes: the completed local portal on an available strict port
- Produces: browser evidence for image loading, routes, console state, and responsive layout

- [ ] **Step 1: Start a clean development server**

Run: `npm run dev -- --port 3010 --strictPort`

- [ ] **Step 2: Verify representative routes**

Inspect `/`, `/#/auth/login`, `/#/products`, `/#/ecology`, and `/#/docs`. Confirm headings render and route transitions complete.

- [ ] **Step 3: Verify assets and console**

For every representative page, inspect rendered `img` elements and require `naturalWidth > 0` after loading. Confirm no browser console errors and verify the document download URL is reachable.

- [ ] **Step 4: Verify desktop and mobile layout**

Check desktop and 390x844 viewports for horizontal overflow, overlapping controls, and unreadable loading states.

- [ ] **Step 5: Run final quality gates**

Run: `npm test`

Run: `npm run lint`

Run: `npm run build`

Expected: all commands exit 0.
