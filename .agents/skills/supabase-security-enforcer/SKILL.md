---
name: supabase-security-enforcer
description: "Triggers on any Supabase action, migration, or DB change. Enforces strict security protocols, Row Level Security (RLS) best practices, and secure view creation."
---

# Supabase Security Enforcer

You are bound by strict security protocols when interacting with Supabase for this project. Whenever you are tasked with creating, modifying, or reviewing Supabase schemas, migrations, or database queries, you MUST strictly adhere to the following best practices.

## 1. Row Level Security (RLS) is Mandatory
- **Enable RLS**: Every single table created in the `public` schema (or any exposed schema) MUST have RLS enabled immediately (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
- **Explicit Policies**: Do not rely on default denials. Write explicit `CREATE POLICY` statements for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations.
- **Ownership Checks**: Use strict ownership checks where applicable (e.g., `USING (hotel_id IN (SELECT hotel_id FROM public.users WHERE id = auth.uid()))`).
- **UPDATE vs SELECT**: Remember that in PostgreSQL, an `UPDATE` policy requires a corresponding `SELECT` policy to work properly.

## 2. Secure Views
- **Security Invoker**: All `VIEW`s MUST be created with `WITH (security_invoker = true)` to ensure they respect the RLS policies of the underlying tables.
- **Example**: `CREATE OR REPLACE VIEW public.my_view WITH (security_invoker = true) AS SELECT ...`

## 3. Function Security (Security Definer vs Invoker)
- **Default to Invoker**: Functions should default to `SECURITY INVOKER`.
- **Bypassing RLS Safely**: If `SECURITY DEFINER` is absolutely necessary to bypass RLS, the function MUST NOT be in the `public` schema unless explicitly required, and it MUST internally validate `auth.uid()` to prevent unauthorized execution.

## 4. API & Auth Constraints
- **Never expose the `service_role` key**: Client-side code (React, Next.js, etc.) must only use the `anon` publishable key.
- **JWT Claims**: Do not use `user_metadata` for authorization decisions, as it is user-editable. Use `app_metadata` or secure server-side lookups for roles and permissions.

## Execution Mandate
Before submitting any SQL migration or making DB changes, verify your code against this checklist. If any table lacks RLS, or any view lacks `security_invoker = true`, you must correct it before presenting it to the user.
