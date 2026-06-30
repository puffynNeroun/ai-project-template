---
schema_version: 1
task_id: TASK-0012
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Fix the Forge task scaffold command so it supports the common pnpm argument separator form.

The command currently works with direct arguments:

~~~bash
pnpm -C tools/forge-validator run task:new --id TASK-0012 --title "Example"
~~~

But it rejects the common form:

~~~bash
pnpm -C tools/forge-validator run task:new -- --id TASK-0012 --title "Example"
~~~

This task will update argument parsing so both forms work.

## Goals

- Accept a leading `--` argument separator.
- Preserve existing direct argument usage.
- Keep rejecting unknown non-separator arguments.
- Add tests for both supported usage styles.
- Update README documentation.
- Preserve existing scaffold behavior.
- Preserve existing Forge Validator verification behavior.

## Non-Goals

- Do not add the task completion command in this task.
- Do not change lifecycle validation policy.
- Do not change existing validator rules.
- Do not modify completed task evidence.
- Do not create branches, commits, pushes, pull requests, merges, or releases automatically.

## Proposed Implementation

### 1. Update argument parser

Update `parseArgs` in:

~~~text
tools/forge-validator/src/scaffold-task.mjs
~~~

When the parser sees a standalone `--`, it should ignore it and continue parsing the remaining arguments.

Expected accepted inputs:

~~~text
--id TASK-0012 --title Example
-- --id TASK-0012 --title Example
~~~

Unknown arguments other than the standalone separator should still throw an error.

### 2. Update tests

Update:

~~~text
tools/forge-validator/test/scaffold-task.test.mjs
~~~

Add coverage for:

- direct argument usage;
- leading separator usage;
- unknown argument rejection.

### 3. Update README

Update:

~~~text
tools/forge-validator/README.md
~~~

Document both supported forms:

~~~bash
pnpm -C tools/forge-validator run task:new --id TASK-0012 --title "Example task"
pnpm -C tools/forge-validator run task:new -- --id TASK-0012 --title "Example task"
~~~

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
