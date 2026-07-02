# Forge Operator Scripts

This document describes the local operator scripts used to reduce repeated copy-paste shell commands during Forge tasks.

The scripts are intentionally small bash helpers. They do not replace Forge Validator, GitHub CLI, or the human approval flow.

## Prerequisites

Run scripts from anywhere inside the repository. They use `git rev-parse --show-toplevel` to find the repo root.

Required tools:

- Git
- GitHub CLI (`gh`)
- pnpm
- bash

You must already be authenticated with GitHub CLI when using PR scripts.

## Script List

| Script | Purpose |
| --- | --- |
| `scripts/operator/check-state.sh` | Inspect local Forge state and run verify. |
| `scripts/operator/create-implementation-pr.sh` | Push the task branch and create or reuse an implementation PR. |
| `scripts/operator/check-pr.sh` | Inspect an implementation PR and check CI without merging. |
| `scripts/operator/merge-implementation-pr.sh` | Merge an implementation PR and verify `main`. |
| `scripts/operator/create-completion-pr.sh` | Complete a task after implementation merge and open a completion PR. |
| `scripts/operator/check-completion-pr.sh` | Inspect a completion PR and check CI without merging. |
| `scripts/operator/merge-completion-pr.sh` | Merge a completion PR and verify the task is completed on `main`. |
| `scripts/operator/post-task-check.sh` | Run final cleanup and status checks after a completed task. |
| `scripts/operator/lib.sh` | Shared helper functions used by the scripts. |

## Normal Flow

After Builder, Tester, and Reviewer have completed and the task is `ready_for_pr`, use:

`bash scripts/operator/check-state.sh TASK-0027`

Then create the implementation PR:

`bash scripts/operator/create-implementation-pr.sh TASK-0027 "TASK-0027: Add local operator scripts"`

Check PR CI:

`bash scripts/operator/check-pr.sh 58`

Merge implementation PR only when the PR is clean and CI is green:

`bash scripts/operator/merge-implementation-pr.sh 58 TASK-0027`

Then create the completion PR:

`bash scripts/operator/create-completion-pr.sh TASK-0027`

Check completion PR CI:

`bash scripts/operator/check-completion-pr.sh 59`

Merge completion PR:

`bash scripts/operator/merge-completion-pr.sh 59 TASK-0027`

Finally run:

`bash scripts/operator/post-task-check.sh TASK-0027`

## Safety Model

The scripts separate check actions from merge actions.

Checking a PR does not merge it.

Creating a PR does not merge it.

Merging only happens when the operator explicitly runs a script whose name begins with `merge-`.

## Limitations

These are local helper scripts, not a full public CLI.

They do not add autonomous AI execution, OpenAI API integration, a SaaS dashboard, npm publishing, or automatic task implementation.

They are designed for personal operator workflow first.

## Troubleshooting

If a script fails after partially changing task status, inspect:

`git status --short --branch`

Then run:

`pnpm -C tools/forge-validator run status`

and recover by completing the missing artifact or commit for that stage.

Prefer fixing the actual state instead of resetting unless you understand exactly what changed.
