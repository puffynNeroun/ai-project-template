---
schema_version: 1
task_id: TASK-0010
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Add a read-only Forge lifecycle status command to reduce manual checking during task execution.

The command should summarize the repository lifecycle state without modifying files, Git state, branches, commits, pull requests, merges, or task artifacts.

## Goals

- Provide a fast read-only lifecycle status command.
- Show the current Git branch and working tree status.
- Show the current task board state from `docs/TASKS.md`.
- Detect the active task from the task board when possible.
- Show expected artifact presence for the selected task.
- Show whether stale verification text exists in selected task artifacts.
- Document the command.
- Add tests for the new command behavior.
- Preserve the existing `verify` behavior.

## Non-Goals

- Do not change Forge validation rules.
- Do not change retry-chain validation policy.
- Do not automatically create or edit artifacts.
- Do not create branches, commits, pushes, pull requests, merges, or releases.
- Do not modify completed task evidence.
- Do not add a web UI, database, or long-running service.

## Proposed Implementation

### 1. Add a status module

Create `tools/forge-validator/src/status.mjs`.

The module should expose status-command logic that can be tested independently.

The implementation should read repository files and Git state, then print a concise report.

### 2. Add package script

Update `tools/forge-validator/package.json` with a script such as:

- `status`

The command should be runnable through:

~~~bash
pnpm -C tools/forge-validator run status
~~~

### 3. Report Git state

The status command should report:

- current branch;
- whether the working tree is clean;
- changed files when the working tree is dirty.

The command must be read-only.

### 4. Report task board state

The status command should read `docs/TASKS.md` and report:

- Now section;
- Next section;
- Later section if present;
- active task ID when a task is listed in Now.

If the board says no active task, the command should say so clearly.

### 5. Report artifact readiness

For the active or selected task, report expected artifact files:

- plan report;
- build report;
- test report;
- review report.

The command should indicate present or missing for each expected artifact.

### 6. Report stale verification guard

For the selected task artifact directory, scan for stale verification text patterns that previously caused mistakes.

The command should report either:

- no stale verification text found;
- or a list of matching files and lines.

### 7. Add tests

Create `tools/forge-validator/test/status.test.mjs`.

Tests should cover:

- no active task;
- active task detection;
- clean artifact presence report;
- missing artifact report;
- stale verification text detection;
- read-only behavior.

### 8. Update documentation

Update `tools/forge-validator/README.md` with:

- command purpose;
- command usage;
- example output shape;
- note that the command is read-only.

## Validation Plan

Run:

~~~bash
pnpm -C tools/forge-validator verify
~~~

Expected result:

~~~text
tests 132 or more
fail 0
Forge contract validation passed.
~~~

The test count may increase if status-command tests are added.

## Risks

- The command could duplicate validation logic if it becomes too complex.
- Git output may vary by environment, so tests should avoid depending on fragile machine-specific formatting.
- The command must remain read-only and must not become a hidden workflow automation tool.

## Acceptance Criteria Mapping

- AC-01: Implement status command.
- AC-02: Report branch and working tree status.
- AC-03: Report task board state.
- AC-04: Report active task or no active task.
- AC-05: Report expected artifact files.
- AC-06: Report stale verification text status.
- AC-07: Document command in README.
- AC-08: Add tests.
- AC-09: Preserve verify success.
