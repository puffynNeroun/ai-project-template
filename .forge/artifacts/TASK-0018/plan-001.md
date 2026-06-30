---
schema_version: 1
task_id: TASK-0018
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Add project bootstrap documentation for using this template after the v0.2.0 release.

This task is documentation-only. It should not change CLI behavior, CI behavior, tags, releases, package files, or historical evidence.

## Target file

Create:

docs/BOOTSTRAP_PROJECT.md

## Document goals

The document should explain how to start a real product from this template without chaos.

It should cover:

1. Creating a new repository from the template.
2. Cloning the new repository.
3. Running first verification commands.
4. Renaming project-specific placeholders.
5. Editing the first product documents.
6. Starting the first Forge task.
7. Running the lifecycle from planner to completion.
8. Working with Cursor, Codex, or another AI assistant.
9. Applying the process to Pixardia.

## Commands to include

pnpm -C tools/forge-validator run status

pnpm -C tools/forge-validator run workflow:smoke

pnpm -C tools/forge-validator verify

pnpm -C tools/forge-validator run task:new -- --id TASK-0001 --title "Define product foundation"

pnpm -C tools/forge-validator run task:stage -- --id TASK-0001 --stage planner

pnpm -C tools/forge-validator run artifact:new -- --id TASK-0001 --type plan

pnpm -C tools/forge-validator run task:complete -- --id TASK-0001

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
