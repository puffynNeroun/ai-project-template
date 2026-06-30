---
schema_version: 1
task_id: TASK-0013
artifact_type: build_report
attempt: 1
producing_role: builder
outcome: READY_FOR_TEST
input_artifacts:
  - .forge/artifacts/TASK-0013/plan-001.md
---

# Build Report

## Summary

Implemented TASK-0013 Forge task completion command.

The command automates the final task lifecycle update after an implementation PR has been merged.

## Implemented Files

- `tools/forge-validator/src/complete-task.mjs`
- `tools/forge-validator/test/complete-task.test.mjs`
- `tools/forge-validator/package.json`
- `tools/forge-validator/README.md`
- `.forge/tasks/TASK-0013.yaml`
- `docs/TASKS.md`

## Implemented Behavior

The new command accepts:

~~~bash
pnpm -C tools/forge-validator run task:complete -- --id TASK-0013
~~~

It updates:

- selected task contract status from `ready_for_pr` to `completed`
- `docs/TASKS.md` Now section to `No active task`
- `docs/TASKS.md` Next section to `Define the next task`
- `docs/TASKS.md` Completed section by adding the selected task at the top

## Safety Behavior

The command refuses to run when:

- the task ID is invalid
- the task contract is missing
- the task contract is not `ready_for_pr`
- the task board does not show the selected task as the active `ready_for_pr` task
- the task board does not contain the expected `Prepare PR` line

The command does not create branches, commits, pushes, pull requests, merges, releases, or lifecycle reports.

## Verification

Builder verification command:

~~~bash
pnpm -C tools/forge-validator verify
~~~

Expected result:

~~~text
Forge contract validation passed.
~~~

## Outcome

READY_FOR_TEST
