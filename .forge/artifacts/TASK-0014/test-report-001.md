---
schema_version: 1
task_id: TASK-0014
artifact_type: test_report
attempt: 1
producing_role: tester
outcome: PASS
input_artifacts:
  - .forge/artifacts/TASK-0014/plan-001.md
  - .forge/artifacts/TASK-0014/build-report-001.md
---

# Test Report

## Summary

Verified TASK-0014 Forge stage transition command.

Outcome: PASS.

## Tested Scope

Tested the new stage transition command and the full Forge Validator verification suite.

Covered files:

- `tools/forge-validator/src/stage-task.mjs`
- `tools/forge-validator/test/stage-task.test.mjs`
- `tools/forge-validator/package.json`
- `tools/forge-validator/README.md`
- `.forge/tasks/TASK-0014.yaml`
- `docs/TASKS.md`

## Test Coverage

The new tests cover:

- direct CLI arguments
- pnpm separator arguments
- unknown argument rejection
- task ID validation
- stage name validation
- planner transition
- builder transition
- tester transition
- reviewer transition
- wrong current status rejection
- board mismatch rejection
- missing task contract rejection
- no partial contract update when board validation fails

## Verification

Ran:

~~~bash
pnpm -C tools/forge-validator verify
~~~

Observed result:

~~~text
tests 180
pass 180
fail 0
Forge contract validation passed.
~~~

## Outcome

PASS
