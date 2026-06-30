---
schema_version: 1
task_id: TASK-0014
artifact_type: build_report
attempt: 1
producing_role: builder
outcome: READY_FOR_TEST
input_artifacts:
  - .forge/artifacts/TASK-0014/plan-001.md
---

# Build Report

## Summary

Implemented TASK-0014 Forge stage transition command.

The command automates lifecycle stage transitions before PR creation.

## Implemented Files

- `tools/forge-validator/src/stage-task.mjs`
- `tools/forge-validator/test/stage-task.test.mjs`
- `tools/forge-validator/package.json`
- `tools/forge-validator/README.md`
- `.forge/tasks/TASK-0014.yaml`
- `docs/TASKS.md`

## Implemented Behavior

The new command supports:

~~~bash
pnpm -C tools/forge-validator run task:stage -- --id TASK-0014 --stage planner
pnpm -C tools/forge-validator run task:stage -- --id TASK-0014 --stage builder
pnpm -C tools/forge-validator run task:stage -- --id TASK-0014 --stage tester
pnpm -C tools/forge-validator run task:stage -- --id TASK-0014 --stage reviewer
~~~

Supported transitions:

- planner: `proposed` -> `approved`
- builder: `approved` -> `in_progress`
- tester: keeps `in_progress`
- reviewer: `in_progress` -> `ready_for_pr`

## Safety Behavior

The command validates task ID, stage name, task contract status, active task board line, and Next step before writing.

The command does not create artifact reports, branches, commits, pushes, pull requests, merges, releases, or task completion updates.

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
