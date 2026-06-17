---
schema_version: 1
task_id: TASK-0004
artifact_type: review_report
attempt: 1
producing_role: reviewer
outcome: REJECT
input_artifacts:
  - .forge/artifacts/TASK-0004/plan-002.md
  - .forge/artifacts/TASK-0004/build-report-002.md
  - .forge/artifacts/TASK-0004/test-report-004.md
---

# Review Report

## Summary

REJECT.

I independently inspected the TASK-0004 implementation, tests, documentation, and diff from approval commit `150177f316699a3e331c543b8e65bea0079dcc7c`. I did not merely trust the Builder or Tester reports.

The implementation appears aligned with the approved plan and acceptance criteria, but independent Reviewer verification did not match the required test evidence. The complete verification command exited successfully and reported `Forge contract validation passed.`, but its Node summary reported `tests 1`, `pass 1`, and `fail 0`, not the expected `73`, `73`, and `0`. The targeted filtered command also exited successfully but reported `tests 1`, `pass 1`, and `fail 0`, not the expected `6`, `6`, and `0`.

`test-report-004.md` is the authoritative Tester input for this review. Test reports 001, 002, and 003 remain historical attempts.

## Inputs

- `.forge/artifacts/TASK-0004/plan-002.md`
- `.forge/artifacts/TASK-0004/build-report-001.md`
- `.forge/artifacts/TASK-0004/build-report-002.md`
- `.forge/artifacts/TASK-0004/test-report-001.md`
- `.forge/artifacts/TASK-0004/test-report-002.md`
- `.forge/artifacts/TASK-0004/test-report-003.md`
- `.forge/artifacts/TASK-0004/test-report-004.md`
- `AGENTS.md`
- `.forge/project.yaml`
- `.forge/workflows/feature.yaml`
- `.forge/tasks/TASK-0004.yaml`
- `.forge/roles/reviewer.md`
- `.forge/artifacts/README.md`
- `.forge/artifacts/templates/review-report.md`
- `.forge/README.md`
- `docs/TASKS.md`
- `tools/forge-validator/src/validate.mjs`
- `tools/forge-validator/test/validate.test.mjs`
- `tools/forge-validator/README.md`
- `tools/forge-validator/package.json`
- `tools/forge-validator/pnpm-lock.yaml`
- Implementation diff from `150177f316699a3e331c543b8e65bea0079dcc7c`

## Scope Review

ACCEPT with respect to file boundaries.

- Branch is `task/TASK-0004-status-aware-artifacts`.
- TASK-0004 remains `in_progress`.
- `docs/TASKS.md` also shows TASK-0004 as `in_progress`.
- The implementation diff from the approval commit is limited to:
  - `.forge/README.md`
  - `.forge/artifacts/README.md`
  - `.forge/tasks/TASK-0004.yaml`
  - `docs/TASKS.md`
  - `tools/forge-validator/README.md`
  - `tools/forge-validator/src/validate.mjs`
  - `tools/forge-validator/test/validate.test.mjs`
- Package metadata and lockfile have no tracked diff.
- Protected files inspected for this review have no tracked diff.
- No dependency, workflow, schema, migration, or configuration framework was added.
- Reviewer created only this review artifact and did not modify implementation, documentation, task status, task board, package files, workflows, role contracts, templates, or existing artifacts.

## Implementation Review

ACCEPT.

The implementation matches the approved design:

- Task validation uses `taskErrorCountBefore` as a task-local error-count checkpoint.
- Only fully valid non-template active task contracts enter `tasksById`.
- Malformed or otherwise invalid task contracts do not enter presence validation.
- Invalid task contracts do not receive secondary missing-artifact errors.
- Task YAML is not reparsed later for presence checks.
- Every discovered live artifact remains structurally validated.
- Artifact validation uses `artifactErrorCountBefore` as an artifact-local error-count checkpoint.
- Only structurally valid artifacts enter grouping.
- Artifacts are grouped by task id and artifact type.
- Any structurally valid positive attempt can satisfy presence.
- No latest-attempt or exact-attempt selection was introduced.
- Final deterministic error sorting remains intact through the existing sorted error return.
- Validator runtime remains read-only.

## Test Evidence Review

REJECT.

Commands run:

- `pnpm -C tools/forge-validator verify`: exit 0.
- `node --test --test-name-pattern="malformed required artifact|later valid artifact|invalid task contracts|legacy TASK-0001|legacy TASK-0002|TASK-0003 and later" ./test/validate.test.mjs` from `tools/forge-validator`: exit 0.
- `git diff --check`: exit 0.

Observed complete verification output:

```text
$ pnpm run test && pnpm run validate
$ node --test ./test/validate.test.mjs
✔ test/validate.test.mjs (3493.579308ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3498.987957
$ node ./src/validate.mjs ../..
Forge contract validation passed.
```

Observed targeted filtered output:

```text
✔ test/validate.test.mjs (396.070709ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 401.384229
```

The commands succeeded, but the printed summaries do not match the review brief's required evidence of 73 full-suite tests and 6 targeted tests. This conflicts with the current Tester handoff in `test-report-004.md`.

The test source does contain focused fixture coverage for the required behavior areas, including malformed required artifacts, later valid artifacts after malformed artifacts, invalid task cascade prevention, legacy exemptions, non-exemption for TASK-0003 and later, non-001 attempts, outcome-independent presence, and status matrix cases. The blocking issue is the mismatch between required verification evidence and observed command output.

## Status Matrix Review

ACCEPT.

- `proposed`: no required artifact types.
- `blocked`: no status-only required artifact types.
- `approved`: requires `plan`.
- `in_progress`: requires `plan`.
- `ready_for_pr`: requires `plan`, `build_report`, `test_report`, and `review_report`.
- `completed`: requires the same four artifact types, subject only to the explicit legacy exemption.

## Legacy Compatibility Review

ACCEPT.

- Only completed TASK-0001 and TASK-0002 are exempt.
- TASK-0003 and later are not exempt.
- The exemption is checked only for `completed` tasks.
- No retroactive artifacts were fabricated.
- No generalized migration or compatibility framework was added.

## Error and Isolation Review

ACCEPT.

- Missing-artifact errors contain task id, task status, and missing artifact type.
- Invalid task contracts do not produce presence cascades.
- Malformed artifacts can produce structural errors and missing-presence errors.
- Malformed required artifacts cannot satisfy presence.
- A later valid artifact can satisfy presence after an earlier malformed artifact.
- Deterministic final sorting remains intact.

## Documentation Review

ACCEPT.

The following files match the implemented behavior:

- `tools/forge-validator/README.md`
- `.forge/artifacts/README.md`
- `.forge/README.md`

The documentation covers status-aware presence validation, blocked behavior, valid-task-only validation, malformed artifact behavior, any-positive-attempt behavior, legacy compatibility, read-only validation, and deferred lifecycle semantics.

## Acceptance Criteria Review for AC-1 through AC-14

- AC-1: ACCEPT. Proposed tasks require no artifacts.
- AC-2: ACCEPT. Blocked tasks have no status-only artifact requirement, while existing artifacts remain structurally validated.
- AC-3: ACCEPT. Approved tasks require a structurally valid plan.
- AC-4: ACCEPT. In-progress tasks require a structurally valid plan.
- AC-5: ACCEPT. Ready-for-pr tasks require plan, build report, test report, and review report.
- AC-6: ACCEPT. Completed tasks require all four artifact types except for the explicit legacy exemption.
- AC-7: ACCEPT. TASK-0001 and TASK-0002 are the only legacy completed-task exemptions, no retroactive artifacts are fabricated, and TASK-0003 or later is not exempt.
- AC-8: ACCEPT. Any structurally valid positive attempt may satisfy presence.
- AC-9: ACCEPT. Latest-attempt, retry-chain, outcome-chain, approval, append-only Git, orchestration, and automatic-transition semantics remain deferred.
- AC-10: ACCEPT. Missing-artifact errors identify task id, status, and artifact type.
- AC-11: REJECT. The test source covers the required behavior areas, but independent verification did not produce the required 73 full-suite and 6 targeted test summaries.
- AC-12: ACCEPT. Documentation explains implemented checks, blocked behavior, legacy compatibility, invalid-task behavior, and deferred lifecycle semantics.
- AC-13: REJECT. Validator behavior remains read-only and verification exits successfully, but required test evidence did not match the expected counts.
- AC-14: ACCEPT. `.forge/tasks/TASK-0004.yaml` and `docs/TASKS.md` both show TASK-0004 as `in_progress`.

## Findings

1. Blocking: Independent test evidence does not match the required Reviewer evidence.

   `pnpm -C tools/forge-validator verify` exited 0 and Forge contract validation passed, but the observed Node summary was `tests 1`, `pass 1`, `fail 0` rather than the expected `tests 73`, `pass 73`, `fail 0`. The targeted command also exited 0 but reported `tests 1`, `pass 1`, `fail 0` rather than the expected `tests 6`, `pass 6`, `fail 0`. This contradicts the authoritative Tester handoff and prevents acceptance.

## Risks

- The implementation appears correct, but human delivery approval would rest on contradictory test evidence unless the test-count reporting discrepancy is resolved.
- Historical Tester reports 002 and 003 already documented a similar mismatch; report 004 asserts corrected evidence that I could not reproduce with the required commands.

## Delivery Recommendation

Do not advance TASK-0004 to human delivery approval yet. Resolve the verification evidence discrepancy or update the required evidence standard so the Reviewer can reconcile the command output with the expected test counts.

## Outcome

REJECT
