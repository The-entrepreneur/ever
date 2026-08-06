-- ═══════════════════════════════════════════════════════════════════════════
-- EVER Platform — Migration: Secure Inbox Sessions View
-- ═══════════════════════════════════════════════════════════════════════════

-- Secure the inbox_sessions view so that it respects the Row Level Security (RLS)
-- policies of the underlying tables.
ALTER VIEW public.inbox_sessions SET (security_invoker = true);
