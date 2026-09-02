---
name: strict-development-enforcer
description: >-
  Strictly enforces development patterns, OWASP ASVS level 2-3 security standards,
  and project rules across all sprints. Use this skill whenever writing, reviewing,
  or refactoring code to ensure compliance with all established guidelines and prevent data leakage.
---

# Strict Development Enforcer

This skill is responsible for enforcing best practices and established patterns across the product.

## Guidelines to Enforce

1. **Design & Typographic Patterns**
   - Ensure consistency with modern web aesthetics (e.g., responsive design, dynamic micro-animations, glassmorphism if applicable).
   - Use established, modern typography (Inter, Roboto, Outfit) over defaults.
   - Maintain a cohesive color palette; avoid raw base colors without design system tokens.

2. **Messaging & Communication Patterns**
   - Ensure user-facing messages, errors, and notifications are clear, professional, and do not leak sensitive backend information.
   - Standardize API response payloads.

3. **Security Patterns (OWASP ASVS Level 2-3)**
   - **Data Leakage Prevention**: Ensure no PII, secrets, or internal stack traces are exposed in logs, error messages, or API responses.
   - **Input Validation**: Strictly validate and sanitize all user inputs.
   - **Authentication & Authorization**: Enforce strict RBAC/ABAC and secure session management.
   - **Secure Communication**: Ensure all endpoints require HTTPS and validate TLS configurations.

4. **Implementation & Architecture**
   - Follow established architecture rules for the current Sprint.
   - Review every change against previous sprint knowledge to prevent regressions.
   - Keep up to date with the latest security standards.

## Agent Instructions

When this skill is active, you MUST:
- Scrutinize every code modification for potential security flaws, specifically OWASP Top 10 vulnerabilities.
- Reject or flag code that violates design or architectural patterns.
- Ensure all new features integrate seamlessly with established design systems.
- Continuously enforce real-time correlation to detect and prevent data leakage paths.
