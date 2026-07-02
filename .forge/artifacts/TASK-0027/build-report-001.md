---
schema_version: 1
task_id: TASK-0027
artifact_type: build_report
attempt: 1
producing_role: builder
outcome: READY_FOR_TEST
input_artifacts:
  - .forge/artifacts/TASK-0027/plan-001.md
---

# TASK-0027 Build Report — Local Operator Scripts

## Summary

READY_FOR_TEST.

Reusable local operator scripts were added for the Forge implementation PR and completion PR workflow.

## Built Files

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

## Implementation Notes

The scripts are bash-based and use existing project tooling:

- Git
- GitHub CLI
- pnpm
- Forge Validator

The implementation intentionally does not add:

- autonomous agent execution;
- OpenAI API integration;
- SaaS dashboard;
- npm publishing;
- GitHub Actions changes.

## Safety Notes

The scripts separate PR inspection from merge actions.

Merge actions only occur in explicitly named merge scripts:

- `merge-implementation-pr.sh`
- `merge-completion-pr.sh`

The scripts prefer task status, artifact presence, PR metadata, CI status, and Forge verification over brittle content greps.

## Checks Performed

- `bash -n` on every operator script
- documentation presence check
- executable bit check
- `pnpm -C tools/forge-validator run status`
- `pnpm -C tools/forge-validator run workflow:smoke`
- `pnpm -C tools/forge-validator verify`

## Outcome

READY_FOR_TEST
