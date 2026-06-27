---
schema_version: 1
task_id: TASK-0008
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Implement narrow retry-chain validation for `test_report` and `review_report` artifacts only.

TASK-0008 should make Forge Validator check repeated test and review attempts by looking at the immediately previous same-type artifact attempt. A `test_report` retry is valid only after a previous `FAIL`; a `review_report` retry is valid only after a previous `REJECT`.

The implementation must preserve TASK-0005 latest-attempt selection, TASK-0006 delivery-ready latest outcome gates, TASK-0007 exact `input_artifacts` referenced outcome-chain validation, TASK-0001/TASK-0002 completed-task legacy exemptions, and read-only Validator behavior. It must not validate `plan` or `build_report` retry chains and must not infer retry state from Git history, approval evidence, orchestration, or automatic task transitions.

## Current Validator Behavior

The current Validator:

- Discovers active task contracts and retains only fully valid non-template tasks in `tasksById`.
- Discovers every live artifact under `.forge/artifacts/TASK-*/`.
- Validates every discovered artifact structurally, including non-latest attempts.
- Builds `artifactsByPath`, keyed by repository-relative artifact path.
- Builds `latestArtifactsByTaskIdAndType`, keyed by task id and artifact type, using highest numeric filename attempt.
- Validates TASK-0007 referenced outcome chains against exact `input_artifacts` paths.
- Validates TASK-0005 status-aware presence using latest attempts.
- Validates TASK-0006 delivery-ready latest `test_report` and `review_report` outcomes.
- Sorts final errors deterministically before returning.

Artifact summaries already include enough data for retry validation:

- `taskId`
- `artifactType`
- `attempt`
- `outcome`
- `path`
- `structurallyValid`

TASK-0008 should build on this structure.

## Desired Retry-Chain Behavior

Required behavior:

- `test_report` attempt `1` remains valid without a previous `test_report` attempt.
- `review_report` attempt `1` remains valid without a previous `review_report` attempt.
- `test_report` attempt `N > 1` is valid only when previous same-type attempt `N-1` exists and has outcome `FAIL`.
- `review_report` attempt `N > 1` is valid only when previous same-type attempt `N-1` exists and has outcome `REJECT`.
- `test_report` attempt `N > 1` fails when previous same-type attempt `N-1` has outcome `PASS`.
- `review_report` attempt `N > 1` fails when previous same-type attempt `N-1` has outcome `ACCEPT`.
- Missing previous same-type retry attempts must not produce duplicate retry-chain errors when an existing structural validation error already reports the relevant attempt problem.
- Structurally invalid previous retry attempts must not produce duplicate retry-chain errors.
- Artifacts belonging to invalid task contracts must not produce secondary retry-chain errors.

The validator should also fail a retry attempt `N > 1` when the immediately previous same-type attempt `N-1` is absent and no existing structural/input error already covers that missing predecessor. This follows the task's "valid only when previous same-type attempt N-1 exists" rule while keeping duplicate suppression for already-reported structural cases.

## Implementation Approach

Add a dedicated retry-chain validation step that runs after artifact structural validation and before final error sorting.

Recommended design:

1. Keep using `validateArtifacts` to structurally validate all live artifacts and return `artifactsByPath` plus `latestArtifactsByTaskIdAndType`.
2. Add a closed retry rule constant:

```js
const requiredPreviousRetryOutcomesByArtifactType = {
  test_report: 'FAIL',
  review_report: 'REJECT',
};
```

3. Add helper functions for same-type artifact path construction, using the existing filename slug definitions:
   - `test_report` maps to `test-report`.
   - `review_report` maps to `review-report`.
   - Previous attempt path should be `.forge/artifacts/<taskId>/<slug>-<NNN>.md`.
4. Add `validateArtifactRetryChains(tasksById, artifactsByPath, errors)`.
5. Iterate artifact summaries deterministically by path.
6. Skip any artifact when:
   - its task id is not in `tasksById`;
   - it is not structurally valid;
   - its artifact type is not `test_report` or `review_report`;
   - its attempt is `1`.
7. For retry attempts `N > 1`, compute the previous same-type attempt `N-1`.
8. If the previous attempt is missing:
   - emit a retry-chain error that identifies current artifact path, artifact type, current attempt, missing previous attempt, and expected previous outcome;
   - do not try to infer a previous attempt from Git history or non-adjacent attempts.
9. If the previous attempt exists but is structurally invalid, skip retry-chain validation for that current artifact to avoid duplicate errors.
10. If the previous attempt exists and is structurally valid but its outcome does not match the expected previous outcome, emit a retry-chain error.
11. Preserve the existing order of other validation passes unless tests expose a deterministic error-order concern. Final sorting already provides stable output.

Suggested error shape:

```text
Contract error in .forge/artifacts/TASK-0090/test-report-002.md: test_report attempt 2 requires previous test_report attempt 1 at .forge/artifacts/TASK-0090/test-report-001.md to have outcome 'FAIL' for retry-chain validation, but found outcome 'PASS'.
```

Missing previous attempt error shape:

```text
Contract error in .forge/artifacts/TASK-0090/review-report-003.md: review_report attempt 3 requires previous review_report attempt 2 at .forge/artifacts/TASK-0090/review-report-002.md with outcome 'REJECT' for retry-chain validation.
```

## Test Plan

Add focused fixture tests for:

- `test_report` attempt `1` remains valid without previous `test_report`.
- `review_report` attempt `1` remains valid without previous `review_report`.
- `test_report` attempt `2` passes when attempt `1` outcome is `FAIL`.
- `test_report` attempt `2` fails when attempt `1` outcome is `PASS`.
- `review_report` attempt `2` passes when attempt `1` outcome is `REJECT`.
- `review_report` attempt `2` fails when attempt `1` outcome is `ACCEPT`.
- `test_report` attempt `3` passes only when attempt `2` exists and outcome is `FAIL`.
- `review_report` attempt `3` passes only when attempt `2` exists and outcome is `REJECT`.
- Missing previous `test_report` attempt produces a retry-chain error for attempt `N > 1`, unless the previous path is already structurally invalid and reported.
- Missing previous `review_report` attempt produces a retry-chain error for attempt `N > 1`, unless the previous path is already structurally invalid and reported.
- Structurally invalid previous `test_report` attempt avoids secondary retry-chain errors.
- Structurally invalid previous `review_report` attempt avoids secondary retry-chain errors.
- Structurally invalid current retry artifact avoids retry-chain errors.
- Artifacts under invalid task contracts avoid secondary retry-chain errors.
- `plan` attempt `2` is not checked as a retry chain.
- `build_report` attempt `2` is not checked as a retry chain.
- TASK-0005 latest-attempt selection tests still pass.
- TASK-0006 delivery-ready latest outcome gate tests still pass.
- TASK-0007 exact `input_artifacts` referenced outcome-chain tests still pass.
- Deterministic ordering when multiple retry-chain errors exist.

Use existing fixture helpers where possible. Add small helper options only if they reduce noisy setup without weakening assertions.

## Documentation Plan

Update:

- `tools/forge-validator/README.md`
  - Document retry-chain validation for `test_report` and `review_report`.
  - State that attempt `1` is exempt.
  - State `test_report N > 1` requires previous same-type attempt `N-1` outcome `FAIL`.
  - State `review_report N > 1` requires previous same-type attempt `N-1` outcome `REJECT`.
  - State plan/build retries remain out of scope.

- `.forge/artifacts/README.md`
  - Add a retry-chain validation section near attempt numbering or input artifacts.
  - Clarify that this is not Git-history append-only enforcement.
  - Clarify that retry-chain validation is separate from latest-attempt selection and referenced outcome-chain validation.

- `.forge/README.md`
  - Add retry-chain validation to the Forge Validator capability summary.
  - Keep append-only Git, approval evidence, orchestration, and automatic transitions deferred.

- `docs/TASKS.md`
  - During Builder handoff, move TASK-0008 to `in_progress` and point Next to Tester.

## Files Expected To Change

Builder may modify:

- `.forge/tasks/TASK-0008.yaml`
- `docs/TASKS.md`
- `.forge/README.md`
- `.forge/artifacts/README.md`
- `tools/forge-validator/README.md`
- `tools/forge-validator/src/validate.mjs`
- `tools/forge-validator/test/validate.test.mjs`

Builder may create:

- `.forge/artifacts/TASK-0008/build-report-001.md`

This Planner created:

- `.forge/artifacts/TASK-0008/plan-001.md`

## Explicit Out Of Scope

- Retry-chain validation for `plan` artifacts.
- Retry-chain validation for `build_report` artifacts.
- Inferring retry chains from Git history.
- Append-only Git-history validation.
- Human approval evidence validation.
- Runtime orchestration.
- Automatic task transitions.
- Package dependency changes.
- CI or release workflow changes.
- Release creation.
- Completed task contract modifications.
- Completed artifact modifications.
- Workflow, role contract, template, root README, or product documentation modifications.

## Risk Analysis

- Missing previous attempt behavior must be carefully distinguished from structurally invalid previous attempt behavior. Missing predecessor should fail retry-chain validation, while malformed predecessor should rely on the structural error and avoid duplicate retry errors.
- Existing fixture chains may need small adjustments because TASK-0007 now rejects review artifacts referencing failing test reports; new retry tests should keep referenced input chains semantically valid unless the test is specifically about referenced outcome validation.
- The implementation should not use latest-attempt grouping to validate retry chains. Retry validation needs the immediate previous same-type attempt, not the latest attempt.
- Error messages should be specific enough for users to identify the current retry artifact and expected previous attempt.

## Acceptance Mapping

- AC-1: Add tests proving `test_report` attempt `1` passes without previous same-type attempt.
- AC-2: Add tests proving `review_report` attempt `1` passes without previous same-type attempt.
- AC-3: Add tests proving `test_report N > 1` passes when `N-1` exists and outcome is `FAIL`.
- AC-4: Add tests proving `test_report N > 1` fails when `N-1` outcome is `PASS`.
- AC-5: Add tests proving `review_report N > 1` passes when `N-1` exists and outcome is `REJECT`.
- AC-6: Add tests proving `review_report N > 1` fails when `N-1` outcome is `ACCEPT`.
- AC-7: Add missing predecessor tests and ensure duplicate suppression where structural validation already reports the relevant artifact issue.
- AC-8: Add malformed previous attempt tests that assert structural errors occur without retry-chain duplicates.
- AC-9: Add invalid task contract tests that assert no secondary retry-chain errors.
- AC-10: Keep TASK-0005 latest-attempt tests passing.
- AC-11: Keep TASK-0006 delivery-ready outcome gate tests passing.
- AC-12: Keep TASK-0007 exact referenced outcome-chain tests passing.
- AC-13: Validator remains read-only, verification passes, and implementation stays inside approved scope.
- AC-14: This Planner update sets `.forge/tasks/TASK-0008.yaml` and `docs/TASKS.md` to `approved`; Builder should later synchronize both to `in_progress`.

## Verification Command

Required:

```bash
git diff --check
pnpm -C tools/forge-validator verify
```

Recommended inspections:

```bash
git status --porcelain=v1 --untracked-files=all
git diff -- tools/forge-validator/src/validate.mjs tools/forge-validator/test/validate.test.mjs
git diff -- .forge/README.md .forge/artifacts/README.md tools/forge-validator/README.md docs/TASKS.md
```

## Open Questions

None. The retry-chain scope and required outcomes are explicit.

## Outcome

READY_FOR_APPROVAL
