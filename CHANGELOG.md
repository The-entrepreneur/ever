# Change Log

All notable changes to this project, including implementations, rollbacks, audits, build phases, and future steps, will be documented in this file.

## [Unreleased]
### Implementations
- **OpenBSP Integration Architecture Switch**: Unified architecture for WhatsApp and Instagram using OpenBSP API natively.
- **Backend Refactoring**: Extracted all monolithic endpoints from `server.ts` to a dedicated `platform/src/routes/` structure (e.g., `channels.ts`, `orders.ts`, `templates.ts`, `conversations.ts`, etc.).
- **Bot Engine Architecture**: Replaced the Redis locking mechanism for WhatsApp/Instagram with OpenBSP's native `PATCH /rest/v1/conversations` API for seamless bot pausing/resuming.
- **Template Management**: Implemented UI (`AgentSettingsTab.tsx`) and API endpoints (`GET / POST /api/templates`) for Meta HSMs.
- **Dashboard UI**: Updated `ChannelsTab.tsx` with dedicated OpenBSP Embedded Signup flows for WhatsApp and Instagram. Wired `InboxTab.tsx` resolve button to successfully trigger a bot un-pause natively.
- **n8n Workflow Updates**: Created `patch-n8n.js` and successfully patched `gce.json` and `hca.json` to natively use OpenBSP's `/rest/v1/messages` and inject automatic `Pause Conversation` steps upon handoff.

### Build Phases
- **Development**: Environment stabilized (Node.js v22, `npm install` timeout fixes applied).
- **Verification**: Built and verified the platform structure via `vite build` and Node typescript transpilation.

### Future Steps
- Monitor OpenBSP embedded signup live tokens in production.
- Potentially wire up the Supabase Webhook listeners for real-time conversation sync.
