# Change Log

All notable changes to this project, including implementations, rollbacks, audits, build phases, and future steps, will be documented in this file.

## [Unreleased]
### Implementations
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
- **Dashboard UI**: Updated `ChannelsTab.tsx` with dedicated OpenBSP Embedded Signup flows for WhatsApp and Instagram. Wired `InboxTab.tsx` resolve button to hit `/api/conversations/resolve` which clears the Redis lock in the Bot Engine.
- **POS & PMS Integration PRD Alignment**: Rewrote `PRD/POS_Integration_Guide.md` to accurately reflect implementation reality:
  - Standardized router prefix convention (`prefix="/api/v1/..."` declared per router file, mounted cleanly in `main.py`).
  - Documented single unified service endpoint `POST /api/v1/services` with `service_type` body parameter (`laundry`, `housekeeping`, `wakeup`, `restaurant`, `other`).
  - Documented `POSAdapter` interface (`post_folio_charge`) and 4 connection modes (`rest`, `soap`, `webhook`, `fallback`).
  - Standardized environment variables (`POS_INTEGRATION_TYPE`, `POS_REST_BASE_URL`, `POS_REST_AUTH_HEADER`, `POS_SOAP_WSDL`, `POS_WEBHOOK_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `INTERNAL_API_KEY`).
  - Outlined full 29-step end-to-end guest journey spanning pre-stay booking (room search, hold, booking creation, payment link generation, confirmation, upsell, lead capture) extending into in-stay POS/HCA ordering and room folio charge posting.
- **FastAPI POS & Service Endpoints**: Added missing endpoints:
  - `PATCH /api/v1/orders/{order_id}/status` (Kitchen / staff order status updates).
  - `GET /api/v1/orders/guest/{session_id}` (Guest order history query).
  - `GET /api/v1/services/{request_id}` (Service request detail lookup).
- **Environment Templates & Security Audit**: Created `base/.env.example` master template, updated `platform/.env.example`, and updated `.gitignore` with global `.env` pattern matching for security.

### Rollbacks
- **OpenBSP Native Pause Reversion**: Reverted Bot Engine (`handoff.js` & `index.js`), Inbox UI (`InboxTab.tsx`), and n8n scripts (`patch-n8n.js`) back to relying entirely on the Redis `handoff:{session_id}` lock for conversation state management, after confirming OpenBSP native pauses do not apply to webhook deployments.

### Build Phases
- **Development**: Environment stabilized (Node.js v22, `npm install` timeout fixes applied).
- **Verification**: Built and verified the platform structure via `vite build` and Node typescript transpilation.

### Future Steps
- Monitor OpenBSP embedded signup live tokens in production.
- Potentially wire up the Supabase Webhook listeners for real-time conversation sync.
