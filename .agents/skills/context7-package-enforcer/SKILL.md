---
name: context7-package-enforcer
description: >-
  Strictly enforces package installation standards. Ensures only updated, stable, and standard
  versions of dependencies are added to the project, utilizing Context7 principles.
---

# Context7 Package Enforcer

This skill is responsible for ensuring the stability and security of all packages integrated into the product.

## Guidelines to Enforce Before Installing Any Package

1. **Verify Stability and Standard Version**:
   - Never use beta, alpha, or deprecated packages for core functionalities unless explicitly approved.
   - Always verify the package version using `npm view <package> version` before installation.
   
2. **Context7 Authentication**:
   - When communicating with external validation systems or registries that require Context7, use the provided API Key:
     `ctx7sk-e029c790-e138-4dbf-98bb-a07ad003d944`
   - Store this securely or pass it via headers in automated scripts if a Context7 validation endpoint is requested by the user.

3. **Vulnerability Checks**:
   - Run `npm audit` after installing any new package. If high/critical vulnerabilities are introduced, immediately rollback the installation and look for alternatives.
   
## Agent Instructions

When this skill is active, you MUST:
- Scrutinize every package addition request.
- Run terminal commands to check the latest version of the requested package before adding it to `package.json`.
- Reject packages that have not been updated in over 2 years unless strictly necessary and verified.
