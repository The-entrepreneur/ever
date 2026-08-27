# Change Log

All notable changes to this project, including implementations, rollbacks, audits, build phases, and future steps, will be documented in this file.

## [Unreleased]
### Implementations
- **Complete Two-Mode Sandbox & Live Supabase Architecture**: Fully migrated operational data layer to a dual-mode system:
  - **`SandboxDataContext.tsx`**: Generates and persists rich mock datasets (50 leads, 40 bookings, 60 orders, 20 multi-turn conversation sessions, 12 FAQs, 7 rooms, 8 upsells, 90-day time-series analytics, 25 guest feedback reviews, 4 staff members, WhatsApp/Instagram channel integrations, GDPR/NDPA DPA records, authorized sub-processors, DSR requests, and monthly invoices) in `sessionStorage`.
  - **Console Tabs Integration**: Wired all 12 console tabs (`DashboardTab`, `InboxTab`, `CRMTab`, `BookingsTab`, `KnowledgeBaseTab`, `AnalyticsTab`, `FeedbackTab`, `AgentSettingsTab`, `ChannelsTab`, `StaffTab`, `ComplianceTab`, `BillingTab`) to seamlessly consume `useSandbox()` with reactive in-memory state updates, modal actions, and "Regenerate Demo Data" triggers for sandbox users (`dero@ever.com`, `demo@ever.com`, `test@ever.com`), while routing production accounts to live Supabase PostgreSQL tables.
  - **Feedback & Reviews Tab**: Dynamic calculation of Average Rating, Response Rate, Sentiment distribution, CSV export, rating filter, and auto-response rules.
  - **Agent Settings Tab**: Configuration of bot tone, multi-language priority, operating hours, human-only mode, and Meta HSM template submission with validation.
  - **Channels Tab**: Direct self-service OpenBSP Embedded Signup management for WhatsApp and Instagram channels, along with dynamic live web widget snippet generation.
  - **Staff Management Tab**: Role-based access control (`hotel_manager`, `hotel_receptionist`, `hotel_readonly`), staff invite modal, and handoff alert toggles.
  - **Compliance & Privacy Tab**: DPA contract status, GDPR consent capture toggle, automated retention cleanup triggers, and Data Subject Request (DSR) lifecycle processing.
  - **Billing & Subscription Tab**: Dynamic tier pricing, monthly AI message quotas, Level 2 agency 3% performance fee metrics, and Stripe Customer Portal integration.
- **Hub Frontend (Phase D)**: Successfully wired the Hub's `DashboardTab`, `InboxTab`, `CRMTab`, `KnowledgeBaseTab`, `StaffTab`, and `ComplianceTab` components to live Supabase data. Integrated `recharts` for KPI charts, implemented Supabase Realtime for the unified inbox, configured CRUD interfaces for lead management and knowledge base updates, and natively integrated data fetching for DPA records, sub-processors, and Data Subject Requests (DSR) using the shared `hotel_id` auth context.
- **Subscription Enforcement in Gateway**: Created `base/bot-engine/services/subscription.js` to perform a live Supabase Postgres check on `subscriptions.status` per hotel slug. The gateway now returns `200 {blocked: true}` (not 402) on inactive subs so OpenBSP stops retrying silently. Falls open on DB error to avoid blocking live messages during outages.
- **Webhook Gateway & n8n Decoupling**: Decoupled OpenBSP webhooks from n8n by routing `/api/webhook/openbsp` to `bot-engine`. The bot-engine forwards payloads trimmed to the last 10 messages to the internal n8n containers (`n8n_${HOTEL_SLUG}:5678`), preventing webhook disconnections when n8n workflows are deactivated.
- **N8n Execution Memory Protection**: Added `EXECUTIONS_DATA_SAVE_ON_SUCCESS=none` to GCE and HCA docker-compose files to prevent n8n's SQLite database from crashing due to large conversation payloads.
- **Tier Migration & Subscriptions Layer**: Added `002_subscriptions.sql` migration for Supabase to handle tier (gce, hca) and billing status (active, past_due).
- **Architecture File Renaming**: Standardized template and docker-compose names from `.level1` / `.level2` to `.gce` / `.hca` across the repository and updated `new-client.sh` to enforce `BOT_PORT` uniformly.
- **Sheets Deprecation**: Removed Google Sheets credentials from environment templates, fully migrating to Supabase as the data layer foundation for future dynamic integrations.
- **OpenBSP Integration Architecture Switch**: Unified architecture for WhatsApp and Instagram using OpenBSP API natively for sending messages (via n8n patches).
- **Backend Refactoring**: Extracted all monolithic endpoints from `server.ts` to a dedicated `platform/src/routes/` structure (e.g., `channels.ts`, `orders.ts`, `templates.ts`, `conversations.ts`, etc.).
- **Bot Engine Architecture**: Retained the **Redis locking mechanism** for WhatsApp and Instagram handoffs. Reverted a previous attempt to use OpenBSP's native `PATCH /rest/v1/conversations`, which only applies to built-in agents and not webhook architectures (Mode A).
- **Template Management**: Implemented UI (`AgentSettingsTab.tsx`) and API endpoints (`GET / POST /api/templates`) for Meta HSMs.
- **POS & PMS Integration PRD Alignment**: Rewrote `PRD/POS_Integration_Guide.md` to accurately reflect implementation reality:
  - Standardized router prefix convention (`prefix="/api/v1/..."` declared per router file, mounted cleanly in `main.py`).
  - Documented single unified service endpoint `POST /api/v1/services` with `service_type` body parameter (`laundry`, `housekeeping`, `wakeup`, `restaurant`, `other`).
  - Documented `POSAdapter` interface (`post_folio_charge`) and 4 connection modes (`rest`, `soap`, `webhook`, `fallback`).
  - Standardized environment variables (`POS_INTEGRATION_TYPE`, `POS_REST_BASE_URL`, `POS_REST_AUTH_HEADER`, `POS_SOAP_WSDL`, `POS_WEBHOOK_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `INTERNAL_API_KEY`).
  - Outlined full 29-step end-to-end guest journey spanning pre-stay booking (room search, hold, booking creation, payment link generation, confirmation, upsell, lead capture) extending into in-stay POS/HCA ordering and room folio charge posting.
- **Environment Templates & Security Audit**: Created `base/.env.example` master template, updated `platform/.env.example`, and updated `.gitignore` with global `.env` pattern matching for security.

### Rollbacks
- **OpenBSP Native Pause Reversion**: Reverted Bot Engine (`handoff.js` & `index.js`), Inbox UI (`InboxTab.tsx`), and n8n scripts (`patch-n8n.js`) back to relying entirely on the Redis `handoff:{session_id}` lock for conversation state management, after confirming OpenBSP native pauses do not apply to webhook deployments.

### Build Phases
- **Development**: Environment stabilized (Node.js v22, `npm install` timeout fixes applied).
- **Verification**: Verified the entire platform build via `tsc --noEmit` (0 errors across entire workspace).

### Future Steps
- Connect backend Express/Prisma ORM routes for production hotel tenant operations.
- Monitor OpenBSP embedded signup live tokens in production.
- Test Stripe webhook events with subscription tier status changes.
