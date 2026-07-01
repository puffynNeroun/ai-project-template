---
schema_version: 1
task_id: TASK-0022
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# TASK-0022 Plan — Add Forge Demo Scenario

## Goal

Add a concise demo scenario that shows how Forge guides a small AI-assisted development task from definition through planning, building, testing, review, PR readiness, and completion.

The demo should help a first-time GitHub visitor understand Forge by seeing the workflow in action.

## Current Problem

The README now explains Forge well, but the repository still lacks a simple end-to-end demo.

A visitor can read what Forge is, but they do not yet have a fast "show me how this works" path.

TASK-0022 fills that gap with `docs/DEMO.md`.

## Planned Files

Modify only:

- `docs/DEMO.md`
- `README.md`
- `.forge/tasks/TASK-0022.yaml`
- `docs/TASKS.md`
- `.forge/artifacts/TASK-0022/plan-001.md`
- `.forge/artifacts/TASK-0022/build-report-001.md`
- `.forge/artifacts/TASK-0022/test-report-001.md`
- `.forge/artifacts/TASK-0022/review-report-001.md`

## Demo Document Structure

Create `docs/DEMO.md` with this structure:

1. Title
2. What this demo shows
3. Demo scenario
4. Starting point
5. Step 1 — define a small task
6. Step 2 — write a plan
7. Step 3 — build the change
8. Step 4 — test the change
9. Step 5 — review the change
10. Step 6 — open and merge implementation PR
11. Step 7 — complete the task
12. What artifacts were created
13. What Forge prevented
14. Commands used in the demo
15. What to try next

## Demo Scenario

Use a realistic but small documentation task as the example.

Example scenario:

"Add a short FAQ section to a product README."

The demo should make clear that this is an example workflow, not a command that the repository automatically performs.

## Accuracy Rules

The demo must not claim unimplemented features.

Do not claim that Forge has:

- a real autonomous agent runner;
- npm publishing;
- global install by default;
- web UI;
- TUI;
- Telegram approval flow;
- SaaS dashboard;
- automatic GitHub PR creation without `gh`;
- automatic code generation.

Correct framing:

- Forge is local-first.
- Forge provides lifecycle commands and validation.
- A human or AI assistant can follow the workflow.
- GitHub PR actions are performed through normal Git/GitHub CLI commands.
- Current reliable commands remain `pnpm -C tools/forge-validator ...`.

## README Update

Add a small link to the demo from README.md.

Best location:

- after the Quickstart section, or
- near the Example Workflow section.

Keep the README change minimal. The main content belongs in `docs/DEMO.md`.

## Acceptance Criteria Mapping

- AC-01: `docs/DEMO.md` exists and explains an end-to-end workflow.
- AC-02: Demo shows lifecycle from definition through completion.
- AC-03: Demo documents artifacts at each lifecycle stage.
- AC-04: Demo avoids unimplemented agent/UI/SaaS/npm claims.
- AC-05: Demo explains how Forge reduces chaotic AI coding.
- AC-06: README links to `docs/DEMO.md`.
- AC-07: status, smoke, and verify pass.

## Verification Plan

Run:

- `pnpm -C tools/forge-validator run status`
- `pnpm -C tools/forge-validator run workflow:smoke`
- `pnpm -C tools/forge-validator verify`

Also run content checks to confirm:

- `docs/DEMO.md` exists;
- README references `docs/DEMO.md`;
- demo mentions task contracts, plan, build report, test report, review report, PR, completion, and verification;
- demo does not claim npm publishing, SaaS, UI, or autonomous agent features.

Expected verification baseline:

- tests 214
- pass 214
- fail 0
- Forge contract validation passed

## Risks

### Risk 1 — Demo becomes too long

Mitigation:

Keep it practical and readable. The demo should be an entry point, not a full manual.

### Risk 2 — Demo overclaims automation

Mitigation:

Use exact current commands and clearly separate human/AI actions from Forge validation.

### Risk 3 — README scope creep

Mitigation:

Only add a small demo link to README. Do not rewrite README again.

## Decision

This plan is ready for approval.
