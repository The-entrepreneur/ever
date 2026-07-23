# Change Log

All notable changes to this project, including implementations, rollbacks, audits, build phases, and future steps, will be documented in this file.

## [Unreleased]
### Implementations
- **OpenBSP Integration Architecture Switch**: Unified architecture for WhatsApp and Instagram using OpenBSP API natively for sending messages (via n8n patches).
- **Backend Refactoring**: Extracted all monolithic endpoints from `server.ts` to a dedicated `platform/src/routes/` structure (e.g., `channels.ts`, `orders.ts`, `templates.ts`, `conversations.ts`, etc.).
- **Bot Engine Architecture**: Retained the **Redis locking mechanism** for WhatsApp and Instagram handoffs. Reverted a previous attempt to use OpenBSP's native `PATCH /rest/v1/conversations`, which only applies to built-in agents and not webhook architectures (Mode A).
- **Template Management**: Implemented UI (`AgentSettingsTab.tsx`) and API endpoints (`GET / POST /api/templates`) for Meta HSMs.
- **Dashboard UI**: Updated `ChannelsTab.tsx` with dedicated OpenBSP Embedded Signup flows for WhatsApp and Instagram. Wired `InboxTab.tsx` resolve button to hit `/api/conversations/resolve` which clears the Redis lock in the Bot Engine.
- **n8n Workflow Updates**: Created `patch-n8n.js` and successfully patched `gce.json` and `hca.json` to natively use OpenBSP's `/rest/v1/messages`. Retained the existing `Check Handoff Status` logic in n8n.

### Rollbacks
- **OpenBSP Native Pause Reversion**: Reverted Bot Engine (`handoff.js` & `index.js`), Inbox UI (`InboxTab.tsx`), and n8n scripts (`patch-n8n.js`) back to relying entirely on the Redis `handoff:{session_id}` lock for conversation state management, after confirming OpenBSP native pauses do not apply to webhook deployments.

### Build Phases
- **Development**: Environment stabilized (Node.js v22, `npm install` timeout fixes applied).
- **Verification**: Built and verified the platform structure via `vite build` and Node typescript transpilation.

### Future Steps
- Monitor OpenBSP embedded signup live tokens in production.
- Potentially wire up the Supabase Webhook listeners for real-time conversation sync.
