---
schema_version: 1
task_id: TASK-0014
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Add a controlled Forge task stage transition command.

The command should automate the repetitive manual lifecycle updates before PR creation:

- planner: `proposed` -> `approved`
- builder: `approved` -> `in_progress`
- tester: keep `in_progress`, move Next from Tester to Reviewer
- reviewer: `in_progress` -> `ready_for_pr`

## Proposed command

~~~bash
pnpm -C tools/forge-validator run task:stage -- --id TASK-0014 --stage planner
pnpm -C tools/forge-validator run task:stage -- --id TASK-0014 --stage builder
pnpm -C tools/forge-validator run task:stage -- --id TASK-0014 --stage tester
pnpm -C tools/forge-validator run task:stage -- --id TASK-0014 --stage reviewer
~~~

## Implementation plan

Create:

~~~text
tools/forge-validator/src/stage-task.mjs
tools/forge-validator/test/stage-task.test.mjs
~~~

Update:

~~~text
tools/forge-validator/package.json
tools/forge-validator/README.md
~~~

## Required behavior

The command should validate before writing:

- task ID format
- stage name
- task contract existence
- current task contract status
- current `docs/TASKS.md` Now line
- current `docs/TASKS.md` Next line

The command should refuse invalid transitions and avoid partial writes.

## Stage mapping

Planner:

- requires task status `proposed`
- requires board task line with `proposed`
- requires Next `Run Planner for TASK-XXXX`
- writes task status `approved`
- writes board task line with `approved`
- writes Next `Run Builder for TASK-XXXX`

Builder:

- requires task status `approved`
- requires board task line with `approved`
- requires Next `Run Builder for TASK-XXXX`
- writes task status `in_progress`
- writes board task line with `in_progress`
- writes Next `Run Tester for TASK-XXXX`

Tester:

- requires task status `in_progress`
- requires board task line with `in_progress`
- requires Next `Run Tester for TASK-XXXX`
- keeps task status `in_progress`
- keeps board task line with `in_progress`
- writes Next `Run Reviewer for TASK-XXXX`

Reviewer:

- requires task status `in_progress`
- requires board task line with `in_progress`
- requires Next `Run Reviewer for TASK-XXXX`
- writes task status `ready_for_pr`
- writes board task line with `ready_for_pr`
- writes Next `Prepare PR for TASK-XXXX`

## Non-goals

The command must not:

- create artifact reports
- create branches
- create commits
- push
- create PRs
- merge PRs
- complete tasks after merge

## Verification

Run:

~~~bash
pnpm -C tools/forge-validator verify
~~~

Expected result:

~~~text
Forge contract validation passed.
~~~

## Outcome

READY_FOR_APPROVAL
