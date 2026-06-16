---
schema_version: 1
task_id: TASK-XXXX
artifact_type: build_report
attempt: 1
producing_role: builder
outcome: READY_FOR_TEST
input_artifacts:
  - .forge/artifacts/TASK-XXXX/plan-001.md
---

# Build Report

## Input Artifacts

List the plan artifact and any returned test or review artifact used as input.

## Summary

Concise implementation summary.

## Changed Files

Repository-relative changed paths.

## Implementation Notes

Important details for Tester and Reviewer.

## Acceptance Criteria Addressed

Acceptance criteria addressed by the build.

## Checks Run

Commands run and results.

## Deviations From Plan

Any deviations from the approved plan, or `None`.

## Known Limitations

Known limitations, or `None`.

## Repository State

Current branch, status summary, and notable uncommitted state.

## Outcome

`READY_FOR_TEST` or `BLOCKED`.
