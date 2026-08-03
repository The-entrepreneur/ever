---
name: change-log
description: Manages a comprehensive change log for projects, tracking implementations, rollbacks, audits, build phases, and future steps. Use this skill to record, retrieve, and analyze project evolution, ensuring an in-depth and contextual history of all modifications.
---

# Change Log Skill

## Overview

This skill provides a structured approach to maintaining a detailed change log for any project. It enables the agent to record and retrieve information about project modifications, including their context, impact, and associated actions, fostering transparency and historical insight into project development.

## Core Capabilities

### 1. Track Changes
Record all modifications made to the project, including code changes, configuration updates, and documentation revisions. Each entry should capture the nature of the change, the date, and the responsible party.

### 2. Document Implementations
Log details of new features, bug fixes, or system enhancements that have been successfully implemented. This includes the scope of the implementation, relevant dates, and any associated tickets or references.

### 3. Record Rollbacks
Maintain a clear history of any changes that were reverted or rolled back, including the reasons for the rollback, the affected components, and the date of the action.

### 4. Audit Trail
Create an auditable record of significant events, decisions, and approvals related to project changes, ensuring accountability and compliance.

### 5. Monitor Build Phases
Track the progress and status of different build phases (e.g., development, testing, staging, production), noting key milestones and deployments.

### 6. Outline Next Steps/Implementations
Document planned future changes, upcoming features, or subsequent implementation phases, providing a forward-looking view of the project roadmap.

## Usage Guidelines

To effectively utilize this skill, you MUST maintain and update both `CHANGELOG.md` and `NEXT_STEPS.md` consistently whenever the project state changes. 

1. **CHANGELOG.md**: Maintain a structured Markdown file to record all implementations, rollbacks, and historical changes. Provide sufficient context for future reference (e.g., date, what was changed, why).
2. **NEXT_STEPS.md**: Maintain a living roadmap tracking upcoming phases, actionable tasks, and pending features. 

**Critical Rule:** Whenever a task is completed, you must:
- Move the item from `NEXT_STEPS.md` (Pending) to `NEXT_STEPS.md` (Completed) or remove it if no longer relevant.
- Add an entry to `CHANGELOG.md` detailing the implemented change.

## Resources

This skill will leverage two primary files within the project root directory:
- `CHANGELOG.md`: For storing all historical change log entries.
- `NEXT_STEPS.md`: For tracking the roadmap and upcoming phases.
