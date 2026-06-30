---
schema_version: 1
task_id: TASK-0013
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Add a controlled Forge task completion command to automate the final lifecycle update for a task after its implementation PR has been merged.

The command should replace the manual completion steps:

- task contract status: `ready_for_pr` -> `completed`;
- task board Now: active task -> `No active task`;
- task board Next: `Prepare PR for TASK-XXXX` -> `Define the next task`;
- task board Completed: add the task to the top of the Completed section.

## Goals

- Provide a safe `task:complete` command.
- Accept a task ID from CLI arguments.
- Validate task ID format before writing files.
- Refuse to complete missing tasks.
- Refuse to complete tasks that are not `ready_for_pr`.
- Refuse to update the task board when the selected task is not active in `docs/TASKS.md`.
- Update the selected task contract to `completed`.
- Update `docs/TASKS.md` consistently.
- Document command usage.
- Add tests for success and refusal cases.
- Preserve existing Forge Validator verification behavior.

## Non-Goals

- Do not create branches, commits, pushes, pull requests, merges, or releases.
- Do not create lifecycle artifacts automatically.
- Do not change validation policy.
- Do not complete tasks that are not `ready_for_pr`.
- Do not modify completed historical evidence outside the selected task contract and task board.

## Proposed Implementation

### 1. Add completion module

Create:

~~~text
tools/forge-validator/src/complete-task.mjs
~~~

The module should export testable functions for:

- parsing CLI arguments;
- validating task IDs;
- reading and updating task contract status;
- validating task board active task state;
- updating `docs/TASKS.md`;
- rendering a concise success message.

### 2. Add package script

Update `tools/forge-validator/package.json` with:

~~~text
task:complete
~~~

Expected usage:

~~~bash
pnpm -C tools/forge-validator run task:complete -- --id TASK-0013
~~~

### 3. Validate before writes

Before writing files, the command should check:

- task ID format is valid;
- task contract exists;
- task contract status is `ready_for_pr`;
- `docs/TASKS.md` has the selected task in Now with `ready_for_pr`;
- `docs/TASKS.md` has `Prepare PR for TASK-XXXX` in Next;
- Completed section exists.

If validation fails, the command should exit non-zero and avoid partial writes.

### 4. Update files

On success, update:

~~~text
.forge/tasks/TASK-XXXX.yaml
docs/TASKS.md
~~~

The task contract should become:

~~~text
status: completed
~~~

The board should become:

~~~text
Now: No active task
Next: Define the next task
Completed: selected task inserted at top
~~~

### 5. Add tests

Create:

~~~text
tools/forge-validator/test/complete-task.test.mjs
~~~

Test cases should cover:

- successful completion in a fixture repository;
- invalid task ID rejection;
- missing task contract rejection;
- non-ready task rejection;
- board mismatch rejection;
- existing completed line handling;
- no branch, commit, push, pull request, merge, or release behavior.

### 6. Update README

Document:

- purpose;
- usage;
- required arguments;
- refusal behavior;
- files the command edits;
- actions the command intentionally does not perform.

## Verification Plan

Run:

~~~bash
pnpm -C tools/forge-validator verify
~~~

Expected result:

~~~text
tests pass
Forge contract validation passed.
~~~

## Outcome

READY_FOR_APPROVAL
