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

### Phase 4: Dynamic Knowledge Integration & Production Hardening
- [ ] Deploy Migration 014 to production Supabase project (`014_guest_360_memory_and_pgvector.sql`).
- [ ] Connect production n8n workflows directly to Supabase REST endpoints for hotels, rooms, and faqs (sever Google Sheets nodes).
- [ ] Run OpenAI embedding generation script on existing production `public.faqs` rows.
- [ ] Validate live tool calling with Groq / LLaMA 3.3 function calling mode.

## [Completed]
- [x] GUEST 360 MEMORY data architecture (`public.guests`, `lookup_guest_360`, `upsert_guest_360` in Migration 014).
- [x] pgvector Semantic RAG Knowledge Base Engine (`match_faqs`, 1536-dim HNSW cosine distance index in Migration 014 and `rag.js`).
- [x] Canonical Hospitality Tool Calling Specification (`definitions.js`, `executor.js`, and bot-engine `/api/tools/execute`).
- [x] Console CRM GUEST 360 MEMORY Suite (`CRMTab.tsx` telemetry card and `SandboxDataContext.tsx` enriched profile generator).
- [x] Webhook Gateway Decoupling & N8n Execution Memory Protection implemented.
- [x] Naming conventions updated to `.gce` and `.hca`.
- [x] Tier migration database schema (`subscriptions`) prepared.
- [x] POS & PMS Integration PRD Alignment (`PRD/POS_Integration_Guide.md`).
- [x] Addition of missing POS & Operational API Endpoints (`PATCH /orders/{id}/status`, `GET /orders/guest/{session_id}`, `GET /services/{request_id}`).
- [x] Confirmed n8n Intent Parsing Integration (`base/n8n-workflows/hca.json`).
- [x] Environment Templates & Security Audit (`base/.env.example`, `platform/.env.example`, `.gitignore` updates).
