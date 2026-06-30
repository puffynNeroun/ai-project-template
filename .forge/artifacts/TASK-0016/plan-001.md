---
schema_version: 1
task_id: TASK-0016
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Add a Forge workflow smoke command.

The command should validate the full local lifecycle on a temporary fixture repository.

Target command:

pnpm -C tools/forge-validator run workflow:smoke

## Goals

The smoke workflow should prove that the Forge CLI commands work together as one lifecycle.

Expected lifecycle:

1. Create a task.
2. Transition planner stage.
3. Create plan artifact.
4. Transition builder stage.
5. Create build_report artifact.
6. Transition tester stage.
7. Create test_report artifact.
8. Transition reviewer stage.
9. Create review_report artifact.
10. Complete the task.
11. Assert final task board state.

## Proposed files

Create:

- tools/forge-validator/src/workflow-smoke.mjs
- tools/forge-validator/test/workflow-smoke.test.mjs

Update:

- tools/forge-validator/package.json
- tools/forge-validator/README.md

## Implementation approach

The smoke command should use a temporary directory.

The temporary repository should contain the minimal files required for the lifecycle commands:

- docs/TASKS.md
- .forge/tasks directory
- .forge/artifacts directory

The command should reuse existing command modules where possible:

- scaffold-task
- stage-task
- scaffold-artifact
- complete-task

## Safety

The smoke command must not touch the real repository state except for normal test execution output.

The command must not:

- create Git branches
- create commits
- push
- create pull requests
- merge pull requests
- create releases

## Verification

Run:

pnpm -C tools/forge-validator verify

Expected:

tests pass
Forge contract validation passed.

## Outcome

READY_FOR_APPROVAL
