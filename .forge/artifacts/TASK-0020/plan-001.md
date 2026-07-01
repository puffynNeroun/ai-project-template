---
schema_version: 1
task_id: TASK-0020
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# TASK-0020 Plan — Package normal Forge CLI

## Goal

Add a normal packaged Forge CLI entrypoint so users can run concise Forge commands instead of long pnpm package-script commands.

Current style:

- pnpm -C tools/forge-validator run status
- pnpm -C tools/forge-validator run workflow:smoke
- pnpm -C tools/forge-validator verify

Target style:

- forge status
- forge task new -- --id TASK-XXXX --title "Task title"
- forge task stage -- --id TASK-XXXX --stage planner
- forge task complete -- --id TASK-XXXX
- forge artifact new -- --id TASK-XXXX --type plan
- forge smoke
- forge verify

## Scope

This task adds a thin CLI dispatch layer on top of the existing Forge Validator commands.

It must not rewrite the lifecycle implementation.

## Implementation Plan

### 1. Add package bin entry

Update tools/forge-validator/package.json with a bin entry that exposes forge from ./src/cli.mjs.

Existing pnpm scripts must remain unchanged.

### 2. Add CLI entrypoint

Create tools/forge-validator/src/cli.mjs.

The entrypoint should support:

- forge help
- forge status
- forge smoke
- forge verify
- forge task new
- forge task stage
- forge task complete
- forge artifact new

The CLI should forward remaining arguments to the existing command behavior.

### 3. Reuse existing commands

The CLI should not duplicate lifecycle business logic from existing command files.

Relevant existing files:

- src/status.mjs
- src/scaffold-task.mjs
- src/stage-task.mjs
- src/complete-task.mjs
- src/scaffold-artifact.mjs
- src/workflow-smoke.mjs
- src/validate.mjs

Preferred approach:

- direct module reuse if practical.

Acceptable approach:

- dependency-free child-process dispatch if existing files execute immediately and are not easy to import cleanly.

The safe choice is more important than architectural vanity.

### 4. Add tests

Add tools/forge-validator/test/cli.test.mjs.

Tests should cover:

- help output exits successfully
- unknown command exits non-zero
- forge status dispatches successfully
- nested command routing works
- argument forwarding is covered where practical

Tests must not depend on global installation.

### 5. Add minimal docs

Update README.md with a small section showing the concise CLI commands.

This is not the full README rewrite. Full README rewrite belongs to TASK-0021.

### 6. Verification

Final checks:

- pnpm -C tools/forge-validator run status
- pnpm -C tools/forge-validator run workflow:smoke
- pnpm -C tools/forge-validator verify

Expected result:

- tests pass
- fail 0
- Forge contract validation passed

The test count may increase after adding CLI tests.

## Risks

### Risk 1 — Existing command files may execute immediately

Some existing .mjs files may execute immediately when imported.

Mitigation:

- use controlled child-process dispatch first if direct imports are unsafe.

### Risk 2 — Argument forwarding may break current separator behavior

Existing commands currently support pnpm separator usage.

Mitigation:

- preserve existing pnpm scripts
- test forwarded arguments for nested commands

### Risk 3 — README scope creep

TASK-0020 only needs minimal CLI usage docs.

Mitigation:

- do not rewrite the full README in this task

## Acceptance Mapping

- AC-01: Add package bin entry.
- AC-02: Implement forge status.
- AC-03: Implement forge task new, forge task stage, and forge task complete.
- AC-04: Implement forge artifact new.
- AC-05: Implement forge smoke.
- AC-06: Implement forge verify.
- AC-07: Preserve existing pnpm scripts.
- AC-08: Add CLI tests.
- AC-09: Add minimal README usage docs.
- AC-10: Run status, smoke, and verify successfully.

## Decision

This plan is ready for approval.
