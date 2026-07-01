---
schema_version: 1
task_id: TASK-0020
artifact_type: build_report
attempt: 1
producing_role: builder
outcome: READY_FOR_TEST
input_artifacts:
  - .forge/artifacts/TASK-0020/plan-001.md
---

# TASK-0020 Build Report — Package normal Forge CLI

## Summary

Implemented a thin packaged Forge CLI entrypoint for the existing Forge Validator commands.

## Changes

- Added the package bin entry for `forge` in tools/forge-validator/package.json.
- Added tools/forge-validator/src/cli.mjs.
- Added CLI dispatch for:
  - forge help
  - forge status
  - forge smoke
  - forge verify
  - forge task new
  - forge task stage
  - forge task complete
  - forge artifact new
- Added tools/forge-validator/test/cli.test.mjs.
- Added minimal Forge CLI usage documentation to README.md.
- Preserved existing pnpm scripts.

## Implementation Notes

The CLI uses a dependency-free child-process dispatch layer.

This avoids rewriting existing command modules and keeps the implementation safe for this task.

## Verification

Direct CLI checks passed:

- node tools/forge-validator/src/cli.mjs help
- node tools/forge-validator/src/cli.mjs status
- node tools/forge-validator/src/cli.mjs smoke
- node tools/forge-validator/src/cli.mjs verify

Existing checks passed:

- pnpm -C tools/forge-validator run status
- pnpm -C tools/forge-validator run workflow:smoke
- pnpm -C tools/forge-validator verify

Final verify summary:

ℹ tests 214
ℹ pass 214
ℹ fail 0
Forge contract validation passed.

## Outcome

READY_FOR_TEST
