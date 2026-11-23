import argparse
from datetime import date
from pathlib import Path


class HarnessInitializer:
    """Initializes AGENTS.md, SPEC.md, STATE.md, and WORKFLOW.md in a target repository."""

    def __init__(self, target_dir: Path, python_mode: bool = False, force: bool = False) -> None:
        self.target_dir = target_dir.resolve()
        self.python_mode = python_mode
        self.force = force

    def initialize(self) -> None:
        """Create the target directory if missing and write all harness files."""
        self.target_dir.mkdir(parents=True, exist_ok=True)
        templates = {
            "AGENTS.md": self._agents_template(),
            "SPEC.md": self._spec_template(),
            "STATE.md": self._state_template(),
            "WORKFLOW.md": self._workflow_template(),
        }

        for filename, content in templates.items():
            file_path = self.target_dir / filename
            if file_path.exists() and not self.force:
                print(f"[SKIP] {filename} already exists (use --force to overwrite)")
                continue
            file_path.write_text(content.strip() + "\n", encoding="utf-8")
            print(f"[OK]   Created {file_path}")

    def _agents_template(self) -> str:
        if self.python_mode:
            return """# Agent Rules & Workspace Harness

## Project Specifics (Edit per repo)
- **Goal:** [1-2 sentences describing what this project does]
- **Entry Point:** `uv run main.py`
- **Verify Command:** `uv run main.py --dry-run`

## Tech Stack & Tooling
- **Environment:** Use `uv` exclusively (`uv run`, `uv add`, `uv sync`). Never use bare `pip` or global `python`.
- **Core Defaults:** Python 3.12+, standard library first, `pathlib.Path` for filesystem paths, `loguru` for logging.
- **Preferred Libraries:** `polars` (with `fastexcel`) over `pandas`, `duckdb`, `playwright`, `apscheduler`, `pywin32`, `plotly`/`dash`, `rich`/`textual`.

## Architecture & Coding Standards
- **OOP by Default:** Use clean, pragmatic Object-Oriented Programming for small, medium, and large scripts. Avoid over-engineering and unnecessary abstraction layers. Skip OOP only for trivial standalone snippets.
- **Skeleton-First Co-Programming:** For new modules or features, create class and method skeletons with type annotations and `pass` statements first. Wait for confirmation before implementing method bodies sequentially.
- **Code Quality:** Write idiomatic Python with practical type hints and resilient, self-healing error handling where appropriate. Keep comments concise, paragraph-level when needed, and strictly technical—no obvious inline noise or artificial line wrapping.

## Workflow & Scope Control
- **Context First:** Before acting, read `SPEC.md` and `STATE.md` if they exist in the repository.
- **Plan Before Code:** Present a concise architectural plan before creating or modifying files. Proceed only after approval.
- **Strict Scope:** Never add unrequested features, unsolicited refactors, or extra boilerplate tests. If something appears necessary, state why in one sentence and wait for confirmation.
- **Separate Debugging:** Never mix bug fixes with new-feature staging. For bugs, identify the root cause directly and apply the minimal complete fix.

## Verification Gate (Mandatory)
- Never declare a task "done" without runtime verification.
- Run the agreed verification command in the terminal using `uv run`.
- Inspect actual `stdout`, `stderr`, and logs. If execution fails, fix against the real traceback and re-run until clean.

## Session Continuity
- After completing a stage, update `STATE.md` with: completed items, architectural decisions made, and the exact next step.
- Keep responses direct and technical—no filler, greetings, or generic sign-offs."""

        return """# Agent Rules & Workspace Harness (Language-Agnostic)

## Project Specifics (Edit per repo)
- **Goal:** [1-2 sentences describing what this project does]
- **Language / Runtime:** [e.g., JavaScript (ES6+), Python 3.12, Odin, Go]
- **Tooling / Build:** [e.g., npm, uv, odin build, cargo — never mix incompatible tools]
- **Entry Point:** [e.g., `index.html`, `src/main.odin`, `app.py`]
- **Verify Command:** [exact build, run, lint, or test command to prove the code works]

## Architecture & Coding Standards
- **Pragmatic Design:** Choose the simplest clean architecture that fits the language and domain (OOP, modular procedural, or state machines). Avoid over-engineering and unnecessary abstraction layers.
- **Standard Library First:** Prefer built-in language features and standard libraries before introducing external dependencies.
- **Skeleton-First Co-Programming:** For new modules or features, define data structures, interfaces, and function/method signatures with empty stubs first. Wait for confirmation before implementing bodies sequentially.
- **Code Quality:** Write idiomatic code for the chosen language with explicit types where supported and clear, resilient error handling. Keep comments concise, paragraph-level when needed, and strictly technical—no obvious inline noise or artificial line wrapping.

## Workflow & Scope Control
- **Context First:** Before acting, read `SPEC.md` and `STATE.md` if they exist in the repository.
- **Plan Before Code:** Present a concise architectural plan before creating or modifying files. Proceed only after approval.
- **Strict Scope:** Never add unrequested features, unsolicited refactors, or extra boilerplate tests. If something appears necessary, state why in one sentence and wait for confirmation.
- **Separate Debugging:** Never mix bug fixes with new-feature staging. For bugs, identify the root cause directly and apply the minimal complete fix.

## Verification Gate (Mandatory)
- Never declare a task "done" without verifying the actual runtime or build output.
- Run the agreed `Verify Command` in the terminal (or inspect console/runtime behavior for browser apps).
- Check actual `stdout`, `stderr`, compiler warnings, and logs. If anything fails, fix against the real error output and re-run until clean.

## Session Continuity
- After completing a stage, update `STATE.md` with: completed items, key architectural decisions made, and the exact next step.
- Keep responses direct and technical—no filler, greetings, or generic sign-offs."""

    def _spec_template(self) -> str:
        return """# Project / Feature Specification

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
- [ ] [Runtime check — e.g., Runs cleanly with zero unhandled errors/warnings]"""

    def _state_template(self) -> str:
        today = date.today().isoformat()
        return f"""# Project State & Session Handoff
<!-- Keep this file under 60 lines. Overwrite outdated entries; do not turn it into a changelog. -->

## Current Phase
- **Stage:** Stage 0 — Specification
- **Status:** Planning
- **Last Updated:** {today}

## Exact Next Step
- Complete sections 1-3 of `SPEC.md` and approve the architectural plan before creating code skeletons.

## Completed & Verified
- [x] Initialized workspace harness (`AGENTS.md`, `SPEC.md`, `STATE.md`, `WORKFLOW.md`)

## Locked Decisions (Do Not Revisit)
- **[Architecture]:** Pending initial plan approval.

## Open Issues / Blockers
- None

## Last Verification
- **Command:** `N/A`
- **Result:** Pending initial implementation"""

    def _workflow_template(self) -> str:
        return """# Agent Execution Workflow
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
   - **Post-Launch / Nice-to-Have** (items that should NOT delay release)."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scaffold Antigravity IDE harness files.")
    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="Target project directory (defaults to current directory).",
    )
    parser.add_argument(
        "--python",
        action="store_true",
        help="Use the Python/uv AGENTS.md template instead of the language-agnostic one.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing harness files if present.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    initializer = HarnessInitializer(
        target_dir=Path(args.path),
        python_mode=args.python,
        force=args.force,
    )
    initializer.initialize()