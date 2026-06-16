# Forge Validator

This package validates the current v1 Forge contracts for this repository. It checks `.forge/project.yaml`, `.forge/workflows/feature.yaml`, referenced role files, `.forge/tasks/task.template.yaml`, active `.forge/tasks/TASK-*.yaml` files, and existing live persistent stage artifacts under `.forge/artifacts/TASK-*/`.

The validator is read-only. It does not execute project commands, run workflows, persist artifacts, mutate files, or act as a general YAML linter.

Artifact validation is structural only. Existing live artifacts are validated strictly when present, but missing artifacts are not an error based on task status. The validator ignores `.forge/artifacts/README.md` and `.forge/artifacts/templates/` as live artifacts.

The validator does not enforce latest-attempt selection, retry-chain semantics, append-only Git history, human approval evidence, status-aware artifact requirements, runtime orchestration, or automatic status transitions.

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
