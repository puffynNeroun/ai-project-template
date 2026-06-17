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

Malformed artifacts still fail structural validation and do not satisfy presence requirements. Any structurally valid positive attempt may satisfy the required artifact type; the validator does not select the latest attempt.

`TASK-0001` and `TASK-0002` are explicit legacy completed-task exemptions because they predate persistent live artifacts. No retroactive artifacts are required or fabricated for them. This exemption does not apply to `TASK-0003` or later tasks.

The validator does not enforce latest-attempt selection, retry-chain semantics, outcome chains, append-only Git history, human approval evidence, runtime orchestration, or automatic status transitions.

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
