# Data Trading Admin Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add commodity, order, fund, and billing administration to the target portal's data trading center.

**Architecture:** Keep the target portal's React/Tailwind component system and local mock-data model. A focused data module owns typed fixtures, a focused view component owns filtering and business actions, and `PortalManagement` only owns navigation and tab integration.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide React, Vite.

## Global Constraints

- Do not add Ant Design or copy source-project request/state infrastructure.
- Preserve the existing publish-demand and respond-demand workflows.
- All migrated views must work without a backend.

---

### Task 1: Trading admin mock model

**Files:**
- Create: `src/data/tradingAdminData.ts`

- [ ] Define typed commodity, order, fund-account, fund-flow, billing-summary, and billing-record fixtures.
- [ ] Export status-label helpers used by the presentation layer.

### Task 2: Trading admin workspace

**Files:**
- Create: `src/components/trading-management/TradingAdminView.tsx`

- [ ] Add shared search, status filters, summary metrics, compact tables, empty states, and detail dialogs.
- [ ] Add commodity publish/unpublish, order status progression, fund recharge, and billing refresh demo actions.

### Task 3: Portal navigation integration

**Files:**
- Modify: `src/pages/PortalManagement.tsx`

- [ ] Add four data-trading navigation entries and multi-tab titles.
- [ ] Render `TradingAdminView` for each migrated function while preserving demand views.
- [ ] Run `npm run lint` and `npm run build`.
