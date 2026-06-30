---
schema_version: 1
task_id: TASK-0017
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Prepare Forge v0.2.0 release notes.

This task is documentation-only. It should not create a tag, GitHub release, package publish, or code behavior change.

## Goal

Create:

docs/releases/v0.2.0.md

The document should summarize what changed since v0.1.0 and give a clear checklist for tagging v0.2.0 later.

## Release notes should include

- Release title.
- Release status.
- Highlights.
- Added lifecycle commands.
- Verification baseline.
- Current command list.
- Test count.
- Smoke workflow status.
- Release checklist for later tag creation.
- Explicit note that this task does not create the actual release.

## Commands to mention

pnpm -C tools/forge-validator run status

pnpm -C tools/forge-validator run task:new -- --id TASK-XXXX --title "..."

pnpm -C tools/forge-validator run task:stage -- --id TASK-XXXX --stage planner

pnpm -C tools/forge-validator run artifact:new -- --id TASK-XXXX --type plan

pnpm -C tools/forge-validator run task:complete -- --id TASK-XXXX

pnpm -C tools/forge-validator run workflow:smoke

pnpm -C tools/forge-validator verify

## Verification

Run:

pnpm -C tools/forge-validator run workflow:smoke

pnpm -C tools/forge-validator verify

Expected:

workflow smoke passes
tests 203
pass 203
fail 0
Forge contract validation passed.

## Outcome

READY_FOR_APPROVAL
