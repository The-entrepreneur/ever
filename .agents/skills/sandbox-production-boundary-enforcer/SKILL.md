---
name: sandbox-production-boundary-enforcer
description: >-
  Strictly enforces the architectural boundary between Sandbox Mode (demo accounts)
  and Live Production Mode (real hotel client accounts). Ensures that synthetic mock data,
  sample transactions, and seeded records NEVER leak into live accounts, and that production accounts
  strictly display real data, authentic tenant settings, and clean zero-states.
---

# Sandbox & Production Boundary Enforcer

This skill guarantees that Ever maintains strict separation between **Sandbox Mode** and **Live Production Mode** across all frontend surfaces, console tabs, API endpoints, and database interactions.

---

## 1. Core Architectural Boundary

Ever operates in two distinct execution modes:

| Mode | Trigger / Criteria | Permitted Data & Behavior |
|---|---|---|
| **Sandbox Mode** (`isSandbox === true`) | Specific demo accounts (`SANDBOX_EMAILS`: `dero@ever.com`, `demo@ever.com`, `test@ever.com`) or explicit sandbox activation. | Rich synthetic mock data, interactive simulations, sample financial ledgers, simulated PMS transactions, and demo reset capabilities (`regenerate()`). |
| **Live Production Mode** (`isSandbox === false`) | Any authenticated real hotel client, partner, or production hotel account. | **STRICTLY REAL DATA ONLY**. Direct queries to Supabase / PostgreSQL. If no records exist, render authentic clean zero-states. Real property profile, real contract fee rates, real payment methods, and live tenant ledger. |

---

## 2. Strict Rules & Invariants

### Rule 1: Zero Mock Data Leakage into Live Accounts
- **NEVER** fall back to hardcoded demo numbers (e.g. `14250`, `1850.00`, `299`, fake invoices, fake guest names) when a real account has empty or zero records.
- **NEVER** use default fallback objects that contain mock property names (e.g. `"The Grand Azure Hotel"`), simulated room counts, or synthetic ledger entries for non-sandbox users.
- Use explicit ternary or conditional branch logic:
  ```typescript
  const { isSandbox, data: sandboxData } = useSandbox();

  if (isSandbox && sandboxData) {
    // 1. Sandbox demo mock data
  } else {
    // 2. Real database query / authentic zero-state
  }
  ```

### Rule 2: Clean Production Zero-States
When a real hotel account has not yet accumulated live data (e.g., new property onboarded):
- Display informative, professional production empty states:
  - *No billing cycles completed yet. Invoices are generated at the end of each monthly period.*
  - *No qualifying guest transactions recorded. Ledger will track real-time bookings once your channel integration is live.*
- Provide real tenant configuration controls (real payment gateway connection, real billing contact, real contract tier).

### Rule 3: Dynamic Commercial Tier & Attribution Rate
- Live tenant commercial configurations (base fee, attribution rate, active operational modules) must be loaded from the real hotel record (`public.hotels` or authentic client record), not a static mock constant.
- If real settings are loading or unconfigured, show real defaults derived from the tenant's authenticated profile or a loading skeleton.

### Rule 4: Admin & Seeder Isolation
- Database seeders, demo generator utilities, and mock simulation mutations must be gated behind sandbox validation and must **NEVER** write mock records to production tenant UUIDs.

---

## 3. Pre-Commit / Code Review Checklist

Before approving or completing any frontend tab, component, or backend endpoint:

- [ ] Does this component consume `useSandbox()`?
- [ ] Are all mock arrays, synthetic charts, and demo metrics guarded by `if (isSandbox)`?
- [ ] Does a live user (`isSandbox === false`) see only real data from the database or an authentic zero-state?
- [ ] Are there any hidden fallback constants (`|| 14250`, `|| "The Grand Azure Hotel"`) that would render on a real account?
- [ ] Has the component been tested in both modes (Sandbox vs Live)?
