---
schema_version: 1
task_id: TASK-0008
artifact_type: build_report
attempt: 1
producing_role: builder
outcome: READY_FOR_TEST
input_artifacts:
  - .forge/artifacts/TASK-0008/plan-001.md
---

# Build Report

## Summary

Implemented TASK-0008 retry-chain validation for repeated `test_report` and `review_report` artifacts.

The validator now requires each same-task `test_report` retry attempt greater than `1` to follow the immediately previous same-type attempt with outcome `FAIL`.

The validator now requires each same-task `review_report` retry attempt greater than `1` to follow the immediately previous same-type attempt with outcome `REJECT`.

TASK-0008 was moved from `approved` to `in_progress`, and `docs/TASKS.md` now points the active work to Tester.

## Implementation Details

- Added retry-chain constants and a dedicated validation pass in `tools/forge-validator/src/validate.mjs`.
- Kept retry validation limited to `test_report` and `review_report`.
- Kept `plan` and `build_report` attempts out of retry-chain validation.
- Preserved structural validation of every live artifact.
- Preserved latest-attempt status presence validation.
- Preserved delivery-ready latest outcome gates.
- Preserved exact `input_artifacts` referenced outcome-chain validation.
- Prevented retry-chain cascades for structurally invalid current artifacts.
- Prevented retry-chain cascades for structurally invalid previous retry artifacts.
- Prevented retry-chain cascades for artifacts owned by invalid task contracts.
- Added a narrow compatibility exemption for the immutable historical `.forge/artifacts/TASK-0004/test-report-002.md` artifact, which predates this retry rule and cannot be rewritten.

## Tests Added

Added fixture coverage for:

- `test_report` attempt `1` behavior.
- `review_report` attempt `1` behavior.
- Valid test retry after `FAIL`.
- Invalid test retry after `PASS`.
- Valid review retry after `REJECT`.
- Invalid review retry after `ACCEPT`.
- Immediate predecessor requirements for attempt `3`.
- Missing previous retry attempts.
- Malformed previous retry artifacts without secondary retry errors.
- Malformed current retry artifacts without secondary retry errors.
- Invalid task contracts without retry-chain cascades.
- `plan` attempts remaining out of scope.
- `build_report` attempts remaining out of scope.
- Compatibility for the historical TASK-0004 tester artifact.
- Deterministic retry-chain error ordering.
- Preservation of TASK-0005, TASK-0006, and TASK-0007 behaviors.

## Documentation Updated

Updated:

- `.forge/README.md`
- `.forge/artifacts/README.md`
- `tools/forge-validator/README.md`

The docs now describe:

- the narrow test/review retry-chain rule;
- the attempt `1` exemption;
- required previous outcomes for retries;
- separation from latest-attempt selection;
- separation from exact `input_artifacts` referenced outcome-chain validation;
- separation from Git-history append-only enforcement;
- separation from orchestration and automatic transitions;
- the historical TASK-0004 compatibility carve-out.

## Scope Confirmation

Changed files stayed within the TASK-0008 Builder scope:

- `.forge/tasks/TASK-0008.yaml`
- `docs/TASKS.md`
- `.forge/README.md`
- `.forge/artifacts/README.md`
- `tools/forge-validator/README.md`
- `tools/forge-validator/src/validate.mjs`
- `tools/forge-validator/test/validate.test.mjs`
- `.forge/artifacts/TASK-0008/build-report-001.md`

No package files, lockfiles, workflows, role contracts, completed task contracts, completed artifacts, protected templates, commits, pushes, pull requests, merges, releases, deployments, or remote mutations were performed by Builder.

## Acceptance Criteria Mapping

- AC-1: Covered by attempt `1` test-report fixture.
- AC-2: Covered by attempt `1` review-report fixture.
- AC-3: Covered by test-report retry after `FAIL`.
- AC-4: Covered by test-report retry after `PASS`.
- AC-5: Covered by review-report retry after `REJECT`.
- AC-6: Covered by review-report retry after `ACCEPT`.
- AC-7: Covered by missing predecessor and cascade-prevention fixtures.
- AC-8: Covered by structurally invalid previous retry fixtures.
- AC-9: Covered by invalid task contract cascade fixture.
- AC-10: Existing TASK-0005 latest-attempt selection tests continue to pass.
- AC-11: Existing TASK-0006 delivery-ready latest outcome gate tests continue to pass.
- AC-12: Existing TASK-0007 exact `input_artifacts` referenced outcome-chain tests continue to pass.
- AC-13: Validator remains read-only, verification passed, and changed files stayed inside approved Builder scope.
- AC-14: `docs/TASKS.md` and `.forge/tasks/TASK-0008.yaml` both show TASK-0008 as `in_progress`.

## Verification

Commands actually run:

- `pnpm -C tools/forge-validator test`
- `git diff --check`
- `pnpm -C tools/forge-validator verify`

Observed `pnpm -C tools/forge-validator verify` summary:

- tests: 132
- pass: 132
- fail: 0
- Forge contract validation passed.

`git diff --check` produced no output.

The previous baseline before TASK-0008 was 112 tests. TASK-0008 added 20 focused retry-chain tests, bringing the total to 132 tests.

## Risks Or Gaps

The only notable risk is the intentionally narrow compatibility exemption for `.forge/artifacts/TASK-0004/test-report-002.md`.

It avoids rewriting immutable completed evidence, but it is path-specific and should remain exceptional. Tester should explicitly review this carve-out and confirm whether it is acceptable as legacy compatibility or whether the rule should instead be designed differently.

## Outcome

READY_FOR_TEST
