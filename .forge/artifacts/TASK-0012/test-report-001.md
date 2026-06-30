---
schema_version: 1
task_id: TASK-0012
artifact_type: test_report
attempt: 1
producing_role: tester
outcome: PASS
input_artifacts:
  - .forge/artifacts/TASK-0012/plan-001.md
  - .forge/artifacts/TASK-0012/build-report-001.md
---

# Test Report

## Summary

Tested TASK-0012 scaffold argument separator handling.

Outcome: PASS.

## Tested Scope

Verified that the scaffold command now accepts both supported invocation forms:

~~~bash
pnpm -C tools/forge-validator run task:new --id TASK-0012 --title "Example"
pnpm -C tools/forge-validator run task:new -- --id TASK-0012 --title "Example"
~~~

Verified that unknown non-separator arguments are still rejected.

## Commands Run

~~~bash
pnpm -C tools/forge-validator verify
pnpm -C tools/forge-validator run task:new --id TASK-9998 --title "Smoke direct"
pnpm -C tools/forge-validator run task:new -- --id TASK-9999 --title "Smoke separator"
~~~

## Observed Results

Forge Validator verification passed.

~~~text
tests 148
pass 148
fail 0
Forge contract validation passed.
~~~

Both live smoke checks reached the expected active-task guard:

~~~text
docs/TASKS.md already has an active task.
~~~

This confirms both argument forms were parsed successfully before scaffold safety validation stopped the command.

## Notes

The task intentionally does not change scaffold lifecycle behavior. It only fixes handling of the standalone `--` separator.
