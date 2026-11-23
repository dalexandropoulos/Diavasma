# Project / Feature Specification

## 1. Goal
- **Problem:** [What problem this solves in 1-2 sentences]
- **Desired Outcome:** [Concrete end state when this is complete]

## 2. Scope Control
### In Scope (Must Have)
- [Core requirement 1]
- [Core requirement 2]

### Out of Scope (Explicitly Excluded)
- [Feature, optimization, or edge case the agent MUST NOT add]
- [e.g., No GUI, no database migration, no extra config system]

## 3. Inputs, Outputs & Constraints
- **Inputs:** [Files, APIs, CLI args, user events, data schemas]
- **Outputs:** [Generated files, UI state, logs, return payloads]
- **Constraints:** [Offline-only, zero external dependencies, latency limits, target OS/browser]

## 4. Architecture & Data Flow
- **Core Components / Modules:**
  - `component_a`: [Single responsibility]
  - `component_b`: [Single responsibility]
- **Data Flow / State Transitions:** [Input -> Transform/State -> Output]
- **Key Data Structures / Interfaces:** [Primary entities, state objects, or contracts]

## 5. Implementation Stages
1. **Stage 1 — Skeletons:** Define files, types/interfaces, and empty function/method stubs. Stop for review.
2. **Stage 2 — Core Path:** Implement the minimal working end-to-end happy path.
3. **Stage 3 — Edge Cases & Hardening:** Add error handling, retries, or secondary behaviors.

## 6. Acceptance Criteria (Verification)
The task is **NOT done** until every item below passes via the `Verify Command`:
- [ ] [Observable behavior 1 — e.g., Given input X, produces exact output Y]
- [ ] [Observable behavior 2 — e.g., Handles missing/invalid input Z without crashing]
- [ ] [Runtime check — e.g., Runs cleanly with zero unhandled errors/warnings]
