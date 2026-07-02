---
schema_version: 1
task_id: TASK-0027
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# TASK-0027 Plan — Local Operator Scripts for Forge PR Workflow

## Summary

READY_FOR_APPROVAL.

TASK-0027 will add reusable local operator scripts for the common Forge implementation PR and completion PR workflow.

The goal is to reduce repeated large ChatGPT-generated bash scripts and turn the workflow already used manually into reusable local scripts.

## Planned Files

- `scripts/operator/lib.sh`
- `scripts/operator/check-state.sh`
- `scripts/operator/create-implementation-pr.sh`
- `scripts/operator/check-pr.sh`
- `scripts/operator/merge-implementation-pr.sh`
- `scripts/operator/create-completion-pr.sh`
- `scripts/operator/check-completion-pr.sh`
- `scripts/operator/merge-completion-pr.sh`
- `scripts/operator/post-task-check.sh`
- `docs/OPERATOR_SCRIPTS.md`

## Design Principles

- Keep scripts local, bash-based, and dependency-light.
- Use the existing Git, GitHub CLI, pnpm, and forge-validator toolchain.
- Do not replace forge-validator.
- Do not add autonomous agent execution.
- Do not merge unless the operator explicitly runs a merge script.
- Prefer task IDs, branch names, and PR numbers as arguments.
- Avoid brittle implementation-content greps.
- Fail early with clear messages.
- Keep output compact and useful.

## Script Plan

`lib.sh` will hold shared helpers such as `die`, `require_clean_tree`, `require_task_status`, `require_artifact_chain`, `run_verify_summary`, and PR validation helpers.

`check-state.sh` will inspect local Forge state, optional task status, artifacts, and verification.

`create-implementation-pr.sh` will validate a `ready_for_pr` task, push the branch, and create or reuse an implementation PR.

`check-pr.sh` will inspect implementation PR metadata and CI checks without merging.

`merge-implementation-pr.sh` will validate and merge an implementation PR, update local `main`, and verify that the task remains `ready_for_pr` on `main`.

`create-completion-pr.sh` will create a completion branch, run task completion, commit the completion change, push, and create or reuse a completion PR.

`check-completion-pr.sh` will inspect completion PR metadata and CI checks without merging.

`merge-completion-pr.sh` will validate and merge a completion PR, update local `main`, and verify that the task is `completed`.

`post-task-check.sh` will run final local checks after a completed task, including status, verification, recent commits, Actions runs, and Pages info when available.

## Documentation Plan

`docs/OPERATOR_SCRIPTS.md` will document prerequisites, script order, arguments, examples, implementation PR flow, completion PR flow, safety notes, and limitations.

## Testing Plan

Tester should verify that all scripts exist, `bash -n` passes, scripts use arguments instead of hard-coded TASK-0026 or PR #56/#57 values, documentation exists, workflow smoke passes, and Forge verify passes.

## Out of Scope

This task does not add an autonomous agent runner, OpenAI API integration, SaaS dashboard, npm publishing, or a full public CLI.

## Outcome

READY_FOR_APPROVAL
