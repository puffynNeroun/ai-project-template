---
schema_version: 1
task_id: TASK-0019
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Prepare Forge v0.2.1 release notes.

This is a documentation-only task. It should not create the actual v0.2.1 tag or GitHub release.

## Goal

Create:

docs/releases/v0.2.1.md

The release notes should explain that v0.2.1 is a patch release after v0.2.0 and includes the new project bootstrap guide.

## Release notes should include

- Release title.
- Release status.
- Summary of the patch release.
- Reference to docs/BOOTSTRAP_PROJECT.md.
- Explanation of why this belongs after v0.2.0.
- Verification baseline.
- Smoke workflow status.
- Test count.
- Checklist for later v0.2.1 tag creation.
- Explicit note that this task does not create the release.

## Commands to mention

pnpm -C tools/forge-validator run status

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
