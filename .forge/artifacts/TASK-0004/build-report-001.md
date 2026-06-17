---
schema_version: 1
task_id: TASK-0004
artifact_type: build_report
attempt: 1
producing_role: builder
outcome: READY_FOR_TEST
input_artifacts:
  - .forge/artifacts/TASK-0004/plan-002.md
---

# Build Report

## Summary

Implemented TASK-0004 status-aware artifact-presence validation in Forge Validator.

The validator now retains only fully valid active task contracts for presence checks, groups only structurally valid live artifacts by task id and artifact type, and enforces the approved status matrix with the explicit TASK-0001/TASK-0002 completed-task legacy exemption.

TASK-0004 was transitioned from `approved` to `in_progress` before implementation, and `docs/TASKS.md` was synchronized to point Next to Tester.

## Inputs

- `.forge/artifacts/TASK-0004/plan-002.md`
- `.forge/tasks/TASK-0004.yaml`
- `.forge/roles/builder.md`
- Repository contracts and current Validator implementation.

## Implementation

- Added `requiredArtifactTypesByStatus` for the approved matrix:
  - `proposed`: none.
  - `blocked`: none based only on status.
  - `approved`: `plan`.
  - `in_progress`: `plan`.
  - `ready_for_pr`: `plan`, `build_report`, `test_report`, `review_report`.
  - `completed`: the same four artifact types.
- Added the narrow `TASK-0001` and `TASK-0002` completed-task legacy exemption.
- Changed task validation to return `{ id, status, path }` summaries only for non-template active task contracts with no task-local validation errors.
- Changed artifact validation to return summaries only for artifacts that add no structural validation errors.
- Added valid artifact grouping as `Map<taskId, Map<artifactType, Set<artifactPath>>>`.
- Added status-aware presence validation after task validation and artifact structural validation.
- Preserved deterministic behavior through sorted task iteration, matrix-ordered artifact type checks, and existing final sorted errors.
- Kept Validator runtime read-only and did not add dependencies or broaden the architecture.

## Files Changed

- `.forge/tasks/TASK-0004.yaml`
- `docs/TASKS.md`
- `tools/forge-validator/src/validate.mjs`
- `tools/forge-validator/test/validate.test.mjs`
- `tools/forge-validator/README.md`
- `.forge/artifacts/README.md`
- `.forge/README.md`
- `.forge/artifacts/TASK-0004/build-report-001.md`

## Tests Added

Added fixture-based coverage for:

- Proposed tasks without artifacts.
- Blocked tasks without artifacts.
- Blocked tasks with malformed existing artifacts.
- Approved and in-progress tasks with and without valid plans.
- Ready-for-pr tasks missing each required artifact type.
- Ready-for-pr tasks with all four artifact types.
- Completed non-legacy tasks with and without required artifacts.
- TASK-0001 and TASK-0002 legacy compatibility.
- TASK-0003 and later non-exemption.
- Non-001 positive attempts satisfying presence.
- FAIL and REJECT outcomes satisfying type presence when structurally valid.
- Missing-artifact error content.
- Invalid task contracts avoiding secondary missing-artifact errors.

Existing structural artifact tests continue to pass.

## Documentation Updated

- `tools/forge-validator/README.md` now documents status-aware presence validation, the matrix, valid-task-only behavior, malformed artifact behavior, legacy exemptions, read-only behavior, and deferred lifecycle semantics.
- `.forge/artifacts/README.md` now documents status-aware presence validation, any-positive-attempt behavior, blocked behavior, legacy exemptions, and deferred attempt/outcome-chain semantics.
- `.forge/README.md` now states that status-aware artifact presence is implemented while latest-attempt validation, retry chains, outcome chains, approvals, append-only history, orchestration, and automatic transitions remain deferred.

## Acceptance Criteria Mapping for AC-1 through AC-14

- AC-1: Implemented `proposed` as no required artifact types and added a passing fixture test.
- AC-2: Implemented `blocked` as no status-only required artifact types and added tests for blocked without artifacts plus blocked with malformed artifact structural failure.
- AC-3: Implemented `approved` requiring `plan` and added missing-plan and valid-plan tests.
- AC-4: Implemented `in_progress` requiring `plan` and added missing-plan and valid-plan tests.
- AC-5: Implemented `ready_for_pr` requiring `plan`, `build_report`, `test_report`, and `review_report`, with tests for each missing type and all-present success.
- AC-6: Implemented `completed` requiring all four artifact types except the explicit legacy exemption, with passing and failing non-legacy tests.
- AC-7: Added only TASK-0001/TASK-0002 as legacy exemptions, with tests confirming they pass and TASK-0003 or later is not exempt.
- AC-8: Added grouping of any structurally valid positive attempt and tested `plan-002.md` satisfying presence.
- AC-9: Kept validation limited to valid task status and artifact type presence; no latest-attempt, retry-chain, outcome-chain, approval, append-only Git, orchestration, automatic-transition, or invalid-task recovery semantics were added.
- AC-10: Missing-artifact errors include task id, status, and missing artifact type; invalid task contracts do not produce secondary missing-artifact errors.
- AC-11: Added tests for all required statuses, valid cases, missing-artifact failures, malformed blocked artifacts, legacy compatibility, non-legacy completed behavior, non-001 attempts, outcome-independent presence, invalid-task cascade prevention, and existing tests.
- AC-12: Updated approved documentation to explain the implemented matrix, blocked behavior, legacy compatibility, invalid-task cascade prevention, and deferred lifecycle semantics.
- AC-13: Validator runtime remains read-only, verification passed before this build report, and changes stayed within approved files.
- AC-14: `.forge/tasks/TASK-0004.yaml` and `docs/TASKS.md` both show TASK-0004 as `in_progress`.

## Verification

Commands run before this build report was created:

- `git status --porcelain=v1 --untracked-files=all`: exit 0; listed the seven approved implementation/documentation files.
- `git diff --name-only`: exit 0; listed the seven approved implementation/documentation files.
- `git diff --check`: exit 0.
- `pnpm -C tools/forge-validator test`: exit 0.
- `pnpm -C tools/forge-validator verify`: exit 0; tests passed and Forge contract validation passed.

Commands run after this build report was created:

- `git branch --show-current`: exit 0; output `task/TASK-0004-status-aware-artifacts`.
- `grep -n '^status:' .forge/tasks/TASK-0004.yaml`: exit 0; output `5:status: in_progress`.
- `git status --porcelain=v1 --untracked-files=all`: exit 0; listed the seven approved implementation/documentation files and `.forge/artifacts/TASK-0004/build-report-001.md`.
- `git diff --name-only`: exit 0; listed the seven approved implementation/documentation files.
- `git diff --check`: exit 0.
- `pnpm -C tools/forge-validator verify`: exit 0; tests passed and Forge contract validation passed with this build report present.

## Scope Confirmation

- No files outside TASK-0004 permitted writes were intentionally modified.
- `.forge/artifacts/TASK-0004/plan-001.md` and `.forge/artifacts/TASK-0004/plan-002.md` were not modified.
- TASK-0003 artifacts were not modified.
- `tools/forge-validator/package.json` and `tools/forge-validator/pnpm-lock.yaml` were not modified.
- No dependency installation, commit, push, pull request, merge, release, deployment, or remote mutation was performed.

## Deferred Semantics

The implementation does not add latest-attempt selection, exact-attempt requirements, retry-chain validation, PASS requirements for test reports, ACCEPT requirements for review reports, outcome-chain enforcement, human approval evidence validation, append-only Git-history validation, Markdown body validation, automatic lifecycle transitions beyond the explicit Builder start transition, agent execution, orchestration, Git mutation, or GitHub mutation.

## Risks or Follow-up

No known implementation limitation requires Builder follow-up before Tester.

Tester should independently verify the actual diff, especially the no-cascade rule for invalid task contracts and the malformed-artifact behavior where structural errors do not satisfy presence.

## Outcome

READY_FOR_TEST
