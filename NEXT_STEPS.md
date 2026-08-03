# Next Steps / Roadmap

This document tracks the upcoming phases and actionable next steps for the EVER platform project. It serves as a living roadmap for development, testing, and deployment.

## [Pending]

### Phase 1: Local Docker Container Integration Run (Immediate)
- [ ] Launch the full stack locally via Docker Compose to verify live inter-container communication: `docker-compose -f base/docker/docker-compose.hca.yml up --build`
- [ ] Test end-to-end HTTP calls from the `bot-engine` container to the `pms-api` container using sample orders.
- [ ] Verify that the `bot-engine` correctly routes intents to the `pms-api` endpoints.

### Phase 2: OpenBSP Production Meta Embedded Signup Validation
- [ ] Verify live Meta WhatsApp Business API (WABA) onboarding through the `ChannelsTab.tsx` dashboard UI.
- [ ] Verify Instagram Graph API token onboarding through the dashboard.
- [ ] Confirm that generated tokens are correctly stored and used by the OpenBSP messaging instances.

### Phase 3: Multi-Tenant Client Onboarding Automation
- [ ] Test automated tenant provisioning using `./scripts/new-client.sh [hotel-slug] hca [n8n-port] [bot-engine-port]`.
- [ ] Seed the `subscriptions` table in Supabase with the first client row: `INSERT INTO subscriptions (hotel_slug, tier, status) VALUES ('grand-horizon', 'hca', 'active');`
- [ ] Verify isolated client container deployment, ensuring each hotel gets its own dedicated environment (n8n, bot-engine, pms-api, redis).
- [ ] Confirm proper generation of `.env` files for newly created client directories.

### Phase 4: Dynamic Knowledge Integration (Future)
- [ ] Transition from manual FAQ management (Google Sheets) to a dynamic data integration model.
- [ ] Implement connectors for third-party platforms and custom APIs to ingest client data directly.
- [ ] Enable the LLM to leverage a 'live' knowledge base to eliminate manual updates and ensure real-time consistency.

## [Completed]
- [x] Webhook Gateway Decoupling & N8n Execution Memory Protection implemented.
- [x] Naming conventions updated to `.gce` and `.hca`.
- [x] Tier migration database schema (`subscriptions`) prepared.
- [x] POS & PMS Integration PRD Alignment (`PRD/POS_Integration_Guide.md`).
- [x] Addition of missing POS & Operational API Endpoints (`PATCH /orders/{id}/status`, `GET /orders/guest/{session_id}`, `GET /services/{request_id}`).
- [x] Confirmed n8n Intent Parsing Integration (`base/n8n-workflows/hca.json`).
- [x] Environment Templates & Security Audit (`base/.env.example`, `platform/.env.example`, `.gitignore` updates).
