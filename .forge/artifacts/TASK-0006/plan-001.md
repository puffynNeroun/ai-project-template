---
schema_version: 1
task_id: TASK-0006
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Add delivery-ready outcome gates to Forge Validator.

TASK-0006 should make `ready_for_pr` tasks and non-legacy `completed` tasks require the latest structurally valid `test_report` to have outcome `PASS` and the latest structurally valid `review_report` to have outcome `ACCEPT`.

This is a narrow validation layer on top of TASK-0004 status-aware artifact presence and TASK-0005 latest-attempt selection. It must preserve structural validation of every live artifact, preserve latest attempt selection by highest numeric filename attempt, and avoid retry-chain, referenced outcome-chain, approval-evidence, append-only Git, orchestration, automatic-transition, package, or schema-migration work.

## Task Interpretation

TASK-0006 does not change which artifact types are required by status. It changes what outcomes are acceptable for the latest required delivery artifacts only when a task is delivery-ready.

Delivery-ready statuses are:

- `ready_for_pr`
- `completed`, except for the explicit TASK-0001 and TASK-0002 completed-task legacy exemption

For those tasks:

- The latest `test_report` for the task must have outcome `PASS`.
- The latest `review_report` for the task must have outcome `ACCEPT`.
- Latest means the highest numeric filename attempt selected by TASK-0005 for the same `task_id + artifact_type` pair.
- The outcome gate runs only when the relevant latest artifact exists and is structurally valid enough to satisfy presence.

Statuses that are not delivery-ready have no test or review outcome gates:

- `proposed`
- `blocked`
- `approved`
- `in_progress`

The task should not make `plan` or `build_report` outcomes part of delivery readiness. Their outcomes remain structurally validated against the artifact contract, but they do not participate in TASK-0006 outcome gates.

## Scope

In scope:

- Require latest structurally valid `test_report` outcome `PASS` for `ready_for_pr` tasks.
- Require latest structurally valid `review_report` outcome `ACCEPT` for `ready_for_pr` tasks.
- Require latest structurally valid `test_report` outcome `PASS` for non-legacy `completed` tasks.
- Require latest structurally valid `review_report` outcome `ACCEPT` for non-legacy `completed` tasks.
- Preserve TASK-0005 latest-attempt selection by highest numeric filename attempt.
- Preserve allowed attempt gaps.
- Preserve structural validation of every discovered live artifact, including non-latest attempts.
- Preserve TASK-0004 status-aware artifact presence rules.
- Preserve TASK-0001 and TASK-0002 as the only completed-task legacy exemptions.
- Ensure TASK-0003 and later completed tasks are not exempt from delivery-ready outcome gates.
- Preserve invalid-task no-cascade behavior.
- Avoid secondary invalid-outcome errors when a required artifact is missing or when the latest required artifact is structurally invalid.
- Keep `plan` and `build_report` outcomes independent from delivery-ready outcome validation.
- Add focused tests for AC-1 through AC-18.
- Update approved documentation to explain delivery-ready outcome gates and deferred semantics.
- Keep Validator runtime read-only.

Out of scope:

- Retry-chain validation.
- Referenced artifact outcome-chain validation.
- Plan outcome gates for task statuses.
- Build-report outcome gates for task statuses.
- Exact-attempt requirements for task statuses.
- Human approval evidence validation.
- Append-only Git-history validation.
- Markdown body validation.
- Automatic task status transitions.
- Agent execution or orchestration.
- GitHub mutation.
- New dependencies.
- Package metadata or lockfile changes.
- Broad Validator refactoring.
- Migration frameworks, configuration systems, schema-version migrations, or new task-contract keys.
- Editing existing tasks, existing artifacts, workflow contracts, role contracts, templates, root project documentation, or GitHub workflow files.

## Allowed Files

Builder may modify only:

- `.forge/tasks/TASK-0006.yaml`
- `tools/forge-validator/src/validate.mjs`
- `tools/forge-validator/test/validate.test.mjs`
- `tools/forge-validator/README.md`
- `.forge/artifacts/README.md`
- `.forge/README.md`
- `docs/TASKS.md`

During Builder execution, `.forge/tasks/TASK-0006.yaml` and `docs/TASKS.md` should be modified only for normal lifecycle synchronization after human plan approval.

## Protected Files

Builder must not modify:

- `.forge/project.yaml`
- `.forge/workflows/feature.yaml`
- `.forge/tasks/task.template.yaml`
- `.forge/tasks/README.md`
- `.forge/tasks/TASK-0001.yaml`
- `.forge/tasks/TASK-0002.yaml`
- `.forge/tasks/TASK-0003.yaml`
- `.forge/tasks/TASK-0004.yaml`
- `.forge/tasks/TASK-0005.yaml`
- `.forge/roles/planner.md`
- `.forge/roles/builder.md`
- `.forge/roles/tester.md`
- `.forge/roles/reviewer.md`
- `.forge/artifacts/templates/plan.md`
- `.forge/artifacts/templates/build-report.md`
- `.forge/artifacts/templates/test-report.md`
- `.forge/artifacts/templates/review-report.md`
- `.forge/artifacts/TASK-0003/plan-001.md`
- `.forge/artifacts/TASK-0003/plan-002.md`
- `.forge/artifacts/TASK-0003/build-report-001.md`
- `.forge/artifacts/TASK-0003/test-report-001.md`
- `.forge/artifacts/TASK-0003/review-report-001.md`
- `.forge/artifacts/TASK-0004/plan-001.md`
- `.forge/artifacts/TASK-0004/plan-002.md`
- `.forge/artifacts/TASK-0004/build-report-001.md`
- `.forge/artifacts/TASK-0004/build-report-002.md`
- `.forge/artifacts/TASK-0004/test-report-001.md`
- `.forge/artifacts/TASK-0004/test-report-002.md`
- `.forge/artifacts/TASK-0004/test-report-003.md`
- `.forge/artifacts/TASK-0004/test-report-004.md`
- `.forge/artifacts/TASK-0004/review-report-001.md`
- `.forge/artifacts/TASK-0004/review-report-002.md`
- `.forge/artifacts/TASK-0005/plan-001.md`
- `.forge/artifacts/TASK-0005/build-report-001.md`
- `.forge/artifacts/TASK-0005/test-report-001.md`
- `.forge/artifacts/TASK-0005/review-report-001.md`
- `.forge/artifacts/TASK-0005/review-report-002.md`
- `.github/workflows/forge-contracts.yml`
- `tools/forge-validator/package.json`
- `tools/forge-validator/pnpm-lock.yaml`
- `AGENTS.md`
- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/AI_WORKFLOW.md`
- `docs/DECISIONS.md`
- Any existing artifact.

## Current Validator Shape

The current validator already:

- Validates project, workflow, task contracts, and live artifacts read-only.
- Retains `tasksById` only for fully valid non-template active task contracts.
- Discovers and structurally validates every live artifact.
- Creates latest artifact summaries by `taskId + artifactType`.
- Selects latest attempts by highest numeric filename attempt.
- Allows attempt gaps.
- Records whether the latest attempt is structurally valid.
- Runs status-aware presence validation using the latest attempt grouping.
- Skips status-aware presence for completed TASK-0001 and TASK-0002 only.

TASK-0006 should build on this shape rather than refactoring it broadly.

## Validation Semantics

### Delivery-Ready Outcome Gates

For every fully valid active task retained in `tasksById`:

1. If task status is `ready_for_pr`, apply both gates:
   - latest `test_report` outcome must be `PASS`;
   - latest `review_report` outcome must be `ACCEPT`.
2. If task status is `completed` and task id is not `TASK-0001` or `TASK-0002`, apply both gates:
   - latest `test_report` outcome must be `PASS`;
   - latest `review_report` outcome must be `ACCEPT`.
3. If task status is `completed` and task id is `TASK-0001` or `TASK-0002`, skip both presence and delivery-ready outcome validation as part of the existing narrow legacy exemption.
4. If task status is `proposed`, `blocked`, `approved`, or `in_progress`, do not require `test_report` outcome `PASS` or `review_report` outcome `ACCEPT`.

### Latest Attempt Selection

Outcome validation must use the same latest attempt selected for presence:

- group by `task_id + artifact_type`;
- compare filename attempts numerically;
- select the highest numeric attempt;
- allow gaps such as attempts `001` and `003`;
- do not use front matter attempt values for selecting latest until after structural validation has confirmed consistency.

### Structural Validation and Cascades

Every discovered live artifact must still be structurally validated, including non-latest attempts.

Outcome gates should run only when the relevant latest artifact is structurally valid. This avoids duplicate errors:

- If required `test_report` is missing, emit the existing missing-artifact error only; do not emit an invalid-outcome error.
- If latest `test_report` exists but is structurally invalid, emit the structural error and invalid-latest-attempt presence error only; do not emit an invalid-outcome error.
- If required `review_report` is missing, emit the existing missing-artifact error only; do not emit an invalid-outcome error.
- If latest `review_report` exists but is structurally invalid, emit the structural error and invalid-latest-attempt presence error only; do not emit an invalid-outcome error.

Invalid task contracts must not enter presence or outcome validation, so they must not receive missing-artifact, invalid-latest-attempt, or invalid-outcome cascades.

### Error Content

Invalid outcome errors should include:

- task id;
- task status;
- artifact type;
- latest attempt number;
- actual outcome;
- expected outcome;
- artifact path.

Example shape:

```text
Contract error in .forge/tasks/TASK-0090.yaml: task TASK-0090 has status 'ready_for_pr' and latest test_report artifact attempt 2 at .forge/artifacts/TASK-0090/test-report-002.md has outcome 'FAIL' but must have outcome 'PASS'.
```

Exact wording may vary, but all required facts must be present and tests should assert them.

## File-Level Implementation Plan

### `.forge/tasks/TASK-0006.yaml`

After human plan approval and before Builder implementation:

- Change `status` from `approved` to `in_progress`.
- Do not change schema, scope, allowed files, protected files, acceptance criteria, or required checks unless a human explicitly asks for a task-definition correction.

### `docs/TASKS.md`

After human plan approval and Builder start:

- Show TASK-0006 as `in_progress`.
- Set Next to Tester for TASK-0006 after implementation work.
- Keep this synchronized with `.forge/tasks/TASK-0006.yaml`.

### `tools/forge-validator/src/validate.mjs`

Make a focused change:

1. Extend structurally valid artifact summaries to include trusted metadata outcome.
   - Current summaries include `taskId`, `artifactType`, `attempt`, `path`, and `structurallyValid`.
   - Add `outcome` only when metadata is parsed. If metadata cannot be parsed, the summary can omit `outcome` and remain `structurallyValid: false`.
   - Because outcome validation only runs for structurally valid latest artifacts, the trusted outcome value should be available and already validated against allowed outcomes.

2. Add a local delivery outcome matrix, for example:

```js
const requiredDeliveryArtifactOutcomesByStatus = {
  ready_for_pr: {
    test_report: 'PASS',
    review_report: 'ACCEPT',
  },
  completed: {
    test_report: 'PASS',
    review_report: 'ACCEPT',
  },
};
```

3. Add a function such as `validateDeliveryArtifactOutcomes(tasksById, latestArtifactsByTaskIdAndType, errors)`.
   - Iterate retained valid tasks in deterministic task id order.
   - Skip completed TASK-0001 and TASK-0002.
   - For statuses without configured gates, do nothing.
   - For `test_report` and `review_report`, read the latest artifact summary from the existing latest grouping.
   - If the latest summary is missing, do nothing because presence validation already reports missing required artifacts.
   - If the latest summary is structurally invalid, do nothing because structural validation and invalid-latest presence already report it.
   - If the latest summary is structurally valid and its `outcome` differs from the expected outcome, add an invalid-outcome error with the required context.

4. Call outcome validation after `validateArtifactPresenceByTaskStatus`.
   - This preserves the conceptual order:
     1. task validation;
     2. artifact structural validation;
     3. latest-attempt grouping;
     4. status-aware presence validation;
     5. delivery-ready outcome validation.

5. Keep runtime read-only.
   - Do not write artifacts.
   - Do not update task statuses.
   - Do not run role commands.
   - Do not call Git or GitHub.

### `tools/forge-validator/test/validate.test.mjs`

Add focused fixture tests without a broad harness rewrite:

- `ready_for_pr` with latest `test_report` outcome `FAIL` fails with invalid-outcome context.
- `ready_for_pr` with latest `review_report` outcome `REJECT` fails with invalid-outcome context.
- `ready_for_pr` with latest `test_report` `PASS` and latest `review_report` `ACCEPT` passes.
- `completed` non-legacy task with latest `test_report` `FAIL` fails.
- `completed` non-legacy task with latest `review_report` `REJECT` fails.
- Earlier failed `test_report` followed by later latest `PASS` passes.
- Earlier rejected `review_report` followed by later latest `ACCEPT` passes.
- Earlier `PASS` test report followed by later latest `FAIL` fails.
- Earlier `ACCEPT` review report followed by later latest `REJECT` fails.
- Missing `test_report` for `ready_for_pr` emits missing-artifact only, not invalid-outcome.
- Structurally invalid latest `test_report` emits structural and invalid-latest errors only, not invalid-outcome.
- Missing `review_report` for `ready_for_pr` emits missing-artifact only, not invalid-outcome.
- Structurally invalid latest `review_report` emits structural and invalid-latest errors only, not invalid-outcome.
- `proposed`, `blocked`, `approved`, and `in_progress` tasks do not require `test_report` `PASS` or `review_report` `ACCEPT`.
- TASK-0001 and TASK-0002 completed legacy tasks remain exempt.
- TASK-0003 and later completed tasks must satisfy the new gates.
- Invalid task contracts do not produce invalid-outcome cascades.
- Plan and build report outcomes do not drive delivery-ready outcome validation.

Use existing helpers such as `writeTask`, `writeValidPlan`, `writeValidBuildReport`, `writeValidTestReport`, `writeValidReviewReport`, and `writeCompleteArtifactChain`. Extend helpers only if it reduces duplication without changing semantics.

### `tools/forge-validator/README.md`

Document:

- delivery-ready statuses;
- latest `test_report` must be `PASS`;
- latest `review_report` must be `ACCEPT`;
- gates run only for structurally valid latest artifacts;
- missing and structurally invalid latest artifacts are handled by presence/structural errors, not duplicate outcome errors;
- legacy completed TASK-0001 and TASK-0002 remain exempt;
- retry chains, referenced outcome chains, approval evidence, append-only history, orchestration, and automatic transitions remain deferred.

### `.forge/artifacts/README.md`

Document the artifact-contract effect:

- latest-attempt selection still controls which artifact is considered for presence and outcome gates;
- `ready_for_pr` and non-legacy `completed` tasks require latest `test_report: PASS` and latest `review_report: ACCEPT`;
- earlier failed or rejected attempts do not fail if a later latest valid attempt has the required outcome;
- latest failed or rejected attempts are not hidden by earlier successful attempts.

### `.forge/README.md`

Update the high-level validator description to say it validates delivery-ready latest artifact outcome gates, while still deferring retry chains, referenced outcome chains, approval evidence, append-only history, orchestration, and automatic transitions.

## Acceptance Criteria Mapping

- AC-1: Preserve current artifact discovery and structural validation; keep existing structural tests passing and add cascade tests with malformed latest artifacts.
- AC-2: Reuse TASK-0005 latest grouping by highest numeric filename attempt; add latest outcome tests with lower-numbered earlier attempts and higher-numbered latest attempts.
- AC-3: Add `ready_for_pr` test where latest structurally valid `test_report` outcome is `FAIL`; expect invalid-outcome error.
- AC-4: Add `ready_for_pr` test where latest structurally valid `review_report` outcome is `REJECT`; expect invalid-outcome error.
- AC-5: Add non-legacy `completed` test where latest structurally valid `test_report` outcome is `FAIL`; expect invalid-outcome error.
- AC-6: Add non-legacy `completed` test where latest structurally valid `review_report` outcome is `REJECT`; expect invalid-outcome error.
- AC-7: Add tests where earlier `FAIL`/`REJECT` attempts are followed by latest `PASS`/`ACCEPT` attempts; expect success.
- AC-8: Add tests where earlier `PASS`/`ACCEPT` attempts are followed by latest `FAIL`/`REJECT` attempts; expect failure.
- AC-9: Add tests proving missing required artifacts and structurally invalid latest required artifacts do not also emit invalid-outcome errors.
- AC-10: Add or preserve tests proving `proposed`, `blocked`, `approved`, and `in_progress` do not require test/review successful outcomes.
- AC-11: Preserve TASK-0001/TASK-0002 completed legacy exemption tests and add/adjust TASK-0003-or-later completed tests to prove outcome gates apply.
- AC-12: Preserve invalid-task no-cascade behavior and add invalid-task fixture with bad latest test/review outcomes to prove no invalid-outcome cascade.
- AC-13: Confirm by source review and tests that no retry-chain, referenced outcome-chain, approval, append-only Git, orchestration, or automatic-transition semantics are added.
- AC-14: Assert invalid-outcome error messages include task id, task status, artifact type, latest attempt, actual outcome, expected outcome, and artifact path.
- AC-15: Ensure test set covers delivery statuses, latest outcome selection, earlier failed/rejected then successful latest, failed/rejected latest, legacy compatibility, invalid-task cascade prevention, and structural validation preservation.
- AC-16: Update approved documentation files with delivery-ready latest outcome gates and deferred lifecycle semantics.
- AC-17: Run verification, keep Validator read-only, and keep changes inside approved files.
- AC-18: Keep `docs/TASKS.md` synchronized with `.forge/tasks/TASK-0006.yaml` during Builder lifecycle status changes.

## Verification Plan

Builder should run:

```bash
git branch --show-current
grep -n '^status:' .forge/tasks/TASK-0006.yaml
git status --porcelain=v1 --untracked-files=all
git diff --check
pnpm -C tools/forge-validator verify
```

Builder should inspect:

```bash
git diff -- tools/forge-validator/src/validate.mjs
git diff -- tools/forge-validator/test/validate.test.mjs
git diff -- tools/forge-validator/README.md .forge/artifacts/README.md .forge/README.md docs/TASKS.md .forge/tasks/TASK-0006.yaml
git diff --name-only
```

Tester and Reviewer should independently rerun:

```bash
git diff --check
pnpm -C tools/forge-validator verify
```

Reports should copy the actual Node reporter summary observed in the current environment and should not infer a test count.

## Risks

- The main implementation risk is producing noisy cascades: invalid-outcome errors must not appear when presence validation already reports a missing artifact or invalid latest attempt.
- The second risk is accidentally validating earlier artifact outcomes instead of the latest numeric attempt selected by TASK-0005.
- The third risk is broadening into retry-chain or referenced outcome-chain validation. TASK-0006 only validates the latest artifact's own outcome value.
- The current validator may need artifact summaries to carry trusted `outcome` metadata. Builder should add this narrowly and only rely on it when `structurallyValid` is true.
- Node test reporter counts have varied across prior handoffs; reports must record actual command output.

## Non-Goals

- Do not require plan outcome `READY_FOR_APPROVAL` for any task status.
- Do not require build report outcome `READY_FOR_TEST` for any task status.
- Do not validate whether a review report references a passing test report.
- Do not validate whether a test report references a successful build report.
- Do not validate retry chains between attempts.
- Do not infer human approval from artifacts.
- Do not create, delete, rename, or rewrite artifacts.
- Do not transition tasks automatically.

## Open Questions

None. TASK-0006 is sufficiently bounded: validate latest delivery artifact outcomes for `ready_for_pr` and non-legacy `completed` tasks only.

## Outcome

READY_FOR_APPROVAL
