# Agent Execution Workflow
<!-- Reference this file with @WORKFLOW.md in the Antigravity IDE chat -->

Act as my senior engineering partner operating strictly under the workspace harness (`AGENTS.md`, `SPEC.md`, `STATE.md`).

## Mode A — New Feature or Project Build (Default)
1. **Inspect Harness:** Read `AGENTS.md`, `SPEC.md`, and `STATE.md` in the workspace root first.
2. **Analyze & Clarify (Only If Needed):** Analyze my request against the existing files. If critical requirements, constraints, or the exact `Verify Command` are missing, ask concise, targeted questions (one at a time) before writing anything. Otherwise, state your minimal assumptions and proceed.
3. **Populate Harness Files:**
   - Update `Project Specifics` in `AGENTS.md` (Goal, Entry Point, Verify Command).
   - Fill out or update `SPEC.md` completely (Goal, In/Out of Scope, Inputs/Outputs, Architecture, Stages, Acceptance Criteria).
   - Update `STATE.md` to reflect the current stage and exact next step.
4. **Gate 1 — Stop for Approval:** Present a concise summary of `SPEC.md` and the architectural plan. **Do NOT create or edit code files yet.** Wait for my confirmation.
5. **Step-by-Step Build (After Approval):**
   - **Stage 1:** Create only module skeletons, data structures/classes, type hints, and empty stubs (`pass`). Stop for review.
   - **Stage 2+:** Implement one stage at a time. After each stage, run the `Verify Command` in the terminal, inspect real `stdout`/`stderr`, fix any errors until clean, update `STATE.md`, and pause before the next stage.

## Mode B — Bug Fix (When Reporting an Error)
1. Read `AGENTS.md` and `STATE.md` without modifying `SPEC.md` unless requirements changed.
2. Identify the root cause directly from the error/traceback.
3. Apply the minimal complete fix, run the `Verify Command` until clean, and update `STATE.md`.

## Mode C — Session Handoff / Resume
- **To Close a Session:** Overwrite `STATE.md` (keep under 60 lines) with completed items, locked decisions, last verification result, and the single `Exact Next Step`.
- **To Resume a Session:** Read `AGENTS.md`, `SPEC.md`, and `STATE.md`, then execute `Exact Next Step` directly.

## Mode D — Read-Only Audit & Readiness Report
1. Read `AGENTS.md`, `SPEC.md`, and `STATE.md` (if populated) along with the entire codebase.
2. **Strict Read-Only Rule:** Do NOT create, edit, or delete any files during this check.
3. Audit the project across: Core Functionality, Edge Cases & Error Handling, Security/Privacy, Performance/Offline Behavior, and Deployment Readiness.
4. Output a concrete, objective report containing:
   - **Overall Readiness Score (%)** with clear technical justification.
   - **Production-Ready** (features verified in code).
   - **Blockers / Must-Fix Before Public Release** (ranked by severity).
   - **Post-Launch / Nice-to-Have** (items that should NOT delay release).
