# Agent Rules & Workspace Harness (Language-Agnostic)

## Project Specifics (Edit per repo)
- **Goal:** 100% offline reading sanctuary, study space, and organizer for books & articles — no ads, zero tracking, zero server dependencies.
- **Language / Runtime:** Vanilla JavaScript (ES6+), HTML5, CSS3, Web Audio API, Service Worker
- **Tooling / Build:** Zero-build, static browser web app (PWA)
- **Entry Point:** `index.html`
- **Verify Command:** `python -m http.server` + Headless Edge CDP runtime verification

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
- Keep responses direct and technical—no filler, greetings, or generic sign-offs.
