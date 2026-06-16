# Forge Validator

This package validates the current v1 Forge contracts for this repository. It checks `.forge/project.yaml`, `.forge/workflows/feature.yaml`, referenced role files, `.forge/tasks/task.template.yaml`, and active `.forge/tasks/TASK-*.yaml` files.

The validator is read-only. It does not execute project commands, run workflows, persist artifacts, mutate files, or act as a general YAML linter.

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

CI integration is intentionally deferred.
