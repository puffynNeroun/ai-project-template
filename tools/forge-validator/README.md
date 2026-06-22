# Forge Validator

This package validates the current v1 Forge contracts for this repository. It checks `.forge/project.yaml`, `.forge/workflows/feature.yaml`, referenced role files, `.forge/tasks/task.template.yaml`, active `.forge/tasks/TASK-*.yaml` files, and existing live persistent stage artifacts under `.forge/artifacts/TASK-*/`.

The validator is read-only. It does not execute project commands, run workflows, persist artifacts, mutate files, or act as a general YAML linter.

Existing live artifacts are validated strictly when present. The validator ignores `.forge/artifacts/README.md` and `.forge/artifacts/templates/` as live artifacts.

The validator also enforces status-aware artifact presence for fully valid active task contracts:

| Task status | Required structurally valid artifact types |
| --- | --- |
| `proposed` | None |
| `blocked` | None based only on status |
| `approved` | `plan` |
| `in_progress` | `plan` |
| `ready_for_pr` | `plan`, `build_report`, `test_report`, `review_report` |
| `completed` | `plan`, `build_report`, `test_report`, `review_report` |

Presence validation runs only for active task contracts that pass task-contract validation. Invalid task contracts report their own task-contract errors and do not receive secondary missing-artifact errors.

Malformed artifacts still fail structural validation. For status-aware presence, the validator selects the latest existing attempt for each task and artifact type by highest numeric filename attempt. Attempt gaps are allowed, so `plan-003.md` is latest when `plan-001.md` and `plan-003.md` exist.

The latest existing attempt must be structurally valid to satisfy presence. A malformed latest attempt is not hidden by an earlier valid attempt and produces an invalid-latest-attempt presence error. A malformed earlier attempt still reports its structural error, while a later structurally valid attempt may satisfy presence.

`TASK-0001` and `TASK-0002` are explicit legacy completed-task exemptions because they predate persistent live artifacts. No retroactive artifacts are required or fabricated for them. This exemption does not apply to `TASK-0003` or later tasks.

Artifact outcomes do not affect presence decisions. For delivery-ready statuses, the validator separately requires the latest structurally valid `test_report` to have outcome `PASS` and the latest structurally valid `review_report` to have outcome `ACCEPT`. These delivery-ready outcome gates apply to `ready_for_pr` tasks and non-legacy `completed` tasks only.

Delivery-ready outcome gates run only after the relevant latest artifact exists and is structurally valid. Missing artifacts and structurally invalid latest attempts are reported by the structural and presence checks, without secondary outcome errors.

The validator does not enforce retry-chain semantics, referenced outcome chains, append-only Git history, human approval evidence, runtime orchestration, or automatic status transitions.

## Install

```bash
pnpm -C tools/forge-validator install --frozen-lockfile
```

## Test

```bash
pnpm -C tools/forge-validator test
```

## Validate

```bash
pnpm -C tools/forge-validator validate
```

## Verify

```bash
pnpm -C tools/forge-validator verify
```

## Exit Codes

Validation exits `0` when the Forge contracts are valid. It exits `1` when contract errors are found.

## CI

The repository workflow runs the same frozen install command and `verify` command documented above for pull requests targeting `main` and pushes to `main`.
