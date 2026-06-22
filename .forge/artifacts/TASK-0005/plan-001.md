---
schema_version: 1
task_id: TASK-0005
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Implement latest-attempt selection for status-aware artifact presence validation in Forge Validator.

TASK-0004 added status-aware presence checks that accept any structurally valid positive attempt. TASK-0005 should tighten only that presence decision: for each `task_id` and `artifact_type`, the validator should select the highest-numbered existing artifact attempt and require that latest existing attempt to be structurally valid before it satisfies status-aware presence.

All live artifacts, including older and malformed attempts, must still receive structural validation. This task must not add retry-chain, outcome-chain, approval evidence, append-only Git-history, orchestration, or automatic transition semantics.

## Task Interpretation

The task changes artifact presence satisfaction, not artifact discovery, task status rules, artifact structural validation, or workflow execution.

For each discovered live artifact whose filename can identify a supported artifact type and numeric positive attempt, Builder should treat the filename attempt as an existing attempt candidate for that `task_id + artifact_type` pair. The latest existing attempt is the candidate with the highest numeric attempt, regardless of gaps.

Presence validation should then evaluate only that latest existing attempt for each required artifact type:

- If no attempt exists for the required type, report a missing-artifact error.
- If the latest existing attempt exists and is structurally valid, it satisfies presence.
- If the latest existing attempt exists but is structurally invalid, report an invalid-latest-attempt presence error even if an earlier attempt is structurally valid.
- If an earlier attempt is malformed but a later attempt is structurally valid, structural validation still reports the earlier error, and the later valid attempt satisfies presence.
- If attempts `001` and `003` exist, attempt `003` is the latest; no attempt-gap error should be introduced.

Artifact outcomes remain independent from presence decisions. A structurally valid `test_report` with `FAIL` or `review_report` with `REJECT` can still satisfy presence for its artifact type if it is the latest attempt.

## Scope

In scope:

- Preserve structural validation of every discovered live artifact, including non-latest attempts.
- Retain latest existing attempt metadata by `task_id` and `artifact_type`.
- Select latest attempts by highest numeric filename attempt.
- Allow attempt gaps.
- Require the latest existing attempt for a required artifact type to be structurally valid before presence is satisfied.
- Add clear errors for missing required artifact types and invalid latest attempts.
- Preserve TASK-0004 status-aware presence requirements for `proposed`, `blocked`, `approved`, `in_progress`, `ready_for_pr`, and `completed`.
- Preserve the TASK-0001 and TASK-0002 completed-task legacy exemption only.
- Preserve invalid-task no-cascade behavior.
- Preserve outcome-independent presence decisions.
- Add focused tests for AC-1 through AC-15.
- Update approved documentation to describe latest-attempt presence semantics.
- Keep Validator runtime read-only.

Out of scope:

- Retry-chain validation.
- Referenced artifact outcome-chain validation.
- Requiring `PASS` test reports.
- Requiring `ACCEPT` review reports.
- Exact-attempt requirements based on task status.
- Human approval evidence validation.
- Append-only Git-history validation.
- Markdown body validation.
- Automatic task status transitions.
- Agent execution or orchestration.
- GitHub mutation.
- New dependencies, package metadata changes, or lockfile changes.
- Broad Validator architecture refactors beyond latest-attempt selection.
- Migration frameworks, configuration systems, schema-version migrations, or new task-contract keys.
- Editing existing tasks, existing artifacts, workflow contracts, role contracts, templates, root project documentation, or GitHub workflow files.

## Allowed Files

Builder may modify only:

- `.forge/tasks/TASK-0005.yaml`
- `tools/forge-validator/src/validate.mjs`
- `tools/forge-validator/test/validate.test.mjs`
- `tools/forge-validator/README.md`
- `.forge/artifacts/README.md`
- `.forge/README.md`
- `docs/TASKS.md`

During Builder work, `.forge/tasks/TASK-0005.yaml` and `docs/TASKS.md` should be changed only for workflow status synchronization if the plan is approved and Builder begins implementation.

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

The validator currently:

- Discovers task contracts and retains `tasksById` only for fully valid active task contracts.
- Discovers all live artifacts under `.forge/artifacts/TASK-*/`.
- Structurally validates every discovered live artifact.
- Returns a valid artifact summary only when an artifact adds no structural errors.
- Groups structurally valid artifacts by `taskId` and `artifactType`.
- Satisfies status-aware presence if at least one structurally valid artifact exists for the required type.

TASK-0005 should keep the same validation order and read-only posture, but adjust artifact grouping so presence knows both:

- the latest existing attempt for each `taskId + artifactType`; and
- whether that latest attempt is structurally valid.

## Implementation Plan

1. Confirm approved Builder entry.
   - Builder should start only after human plan approval.
   - Verify branch is `task/TASK-0005-latest-artifact-attempt`.
   - Verify `.forge/tasks/TASK-0005.yaml` is approved before implementation begins.
   - If it remains `proposed`, stop rather than implementing.

2. Synchronize Builder lifecycle state after approval.
   - Change TASK-0005 from `approved` to `in_progress`.
   - Update `docs/TASKS.md` to show the same status and next stage.
   - Do not perform any automatic lifecycle transition beyond this Builder-stage bookkeeping.

3. Extend artifact summaries.
   - Keep structural validation of every discovered live artifact.
   - Preserve the artifact-local error-count checkpoint.
   - Parse filename information before front matter validation as the validator already does.
   - Return, or otherwise record, an artifact attempt summary for every artifact whose path and filename identify:
     - a task id;
     - a supported artifact type;
     - a positive numeric filename attempt.
   - Include at least `{ taskId, artifactType, attempt, path, structurallyValid }`.
   - `structurallyValid` should be true only when the artifact adds no structural errors.
   - If the filename is invalid enough that the artifact type or attempt cannot be determined, still emit structural errors, but do not include it in latest-attempt presence selection.

4. Build latest-attempt grouping.
   - Replace or supplement `validArtifactsByTaskIdAndType` with a grouping such as:

```js
Map<taskId, Map<artifactType, {
  attempt: number,
  path: string,
  structurallyValid: boolean
}>>
```

   - When two candidates exist for the same `taskId + artifactType`, keep the one with the higher numeric `attempt`.
   - Attempts are compared numerically, not lexicographically.
   - No attempt-gap validation is added.
   - Duplicate identical attempt filenames cannot normally coexist in one directory; no new duplicate-attempt policy is needed.

5. Update presence validation.
   - Keep `requiredArtifactTypesByStatus` unchanged from TASK-0004.
   - Keep `legacyCompletedTaskIdsWithoutArtifacts` unchanged.
   - Keep presence validation limited to fully valid active tasks in `tasksById`.
   - For each required artifact type:
     - If no latest candidate exists, emit a missing-artifact error.
     - If a latest candidate exists and `structurallyValid` is true, presence is satisfied.
     - If a latest candidate exists and `structurallyValid` is false, emit an invalid-latest-attempt error.
   - Missing-artifact and invalid-latest-attempt errors must include task id, task status, artifact type, and the latest attempt/path when applicable.

6. Preserve malformed-attempt behavior.
   - Malformed latest attempt:
     - The malformed artifact still reports its structural error.
     - Earlier valid attempts for the same task/type do not satisfy presence.
     - Presence validation emits an invalid-latest-attempt error for the required type.
   - Malformed earlier attempt:
     - The malformed artifact still reports its structural error.
     - A later structurally valid attempt for the same task/type satisfies presence.
     - No missing or invalid-latest presence error is emitted for that type.

7. Preserve existing exclusions.
   - Do not add retry-chain validation.
   - Do not require artifact outcome chains.
   - Do not require `PASS` or `ACCEPT` outcomes.
   - Do not add human approval evidence checks.
   - Do not validate append-only history through Git.
   - Do not execute roles, mutate Git, call GitHub, or orchestrate workflow stages.

8. Update documentation in approved files.
   - `tools/forge-validator/README.md`: explain latest-attempt selection for presence, malformed latest behavior, malformed earlier behavior, attempt gaps, and deferred semantics.
   - `.forge/artifacts/README.md`: explain latest-attempt presence semantics in the artifact contract.
   - `.forge/README.md`: update the high-level validator description to say latest-attempt presence is implemented while retry chains and outcome chains remain deferred.

## Test Plan

Add fixture-based tests using existing helpers where possible:

- Latest valid attempt satisfies required presence when attempts `001` and `002` exist.
- Highest numeric attempt is selected for presence, not the first discovered path.
- Attempt gaps are allowed; attempts `001` and `003` select `003`.
- Latest malformed required artifact does not satisfy presence even when an earlier valid attempt exists.
- Latest malformed required artifact reports both structural failure and invalid-latest presence context.
- Earlier malformed artifact still reports structural failure while a later valid attempt satisfies presence.
- Required status matrix from TASK-0004 remains unchanged for `proposed`, `blocked`, `approved`, `in_progress`, `ready_for_pr`, and `completed`.
- TASK-0001 and TASK-0002 remain the only completed-task legacy exemptions.
- TASK-0003 and later completed tasks remain non-exempt.
- Invalid task contracts do not enter presence validation and do not receive missing-artifact or invalid-latest-attempt cascades.
- Outcome-independent presence remains true when the latest structurally valid `test_report` has `FAIL` and latest structurally valid `review_report` has `REJECT`.
- Existing structural artifact validation tests continue to pass.

## Acceptance Criteria Mapping

- AC-1: Preserve all artifact discovery and structural validation paths; add tests where non-latest malformed artifacts still fail structurally.
- AC-2: Add numeric latest-attempt grouping by `taskId + artifactType`; test that the highest attempt is selected.
- AC-3: Do not validate contiguous attempt sequences; test `001` plus `003` selects `003`.
- AC-4: Test malformed earlier attempt plus later valid attempt: structural error remains, presence is satisfied.
- AC-5: Test earlier valid attempt plus later malformed attempt: structural error remains, presence is not satisfied.
- AC-6: Update missing and invalid-latest messages to include task id, task status, artifact type, and latest attempt/path when applicable; assert message content.
- AC-7: Keep TASK-0004 status matrix constant and existing matrix tests passing.
- AC-8: Keep `legacyCompletedTaskIdsWithoutArtifacts` limited to TASK-0001 and TASK-0002; preserve non-exemption tests for TASK-0003 and later.
- AC-9: Preserve task-local validation checkpoints and `tasksById` behavior; add or keep invalid-task no-cascade tests for missing and invalid-latest errors.
- AC-10: Keep outcomes out of grouping and presence decisions; test latest valid FAIL/REJECT artifacts satisfy type presence.
- AC-11: Confirm no retry-chain, outcome-chain, approval, append-only Git, orchestration, or automatic-transition semantics were added by code review and tests.
- AC-12: Cover latest valid attempts, malformed latest attempts, malformed earlier attempts, attempt gaps, matrix preservation, legacy compatibility, invalid-task cascade prevention, and structural validation.
- AC-13: Update approved documentation files with latest-attempt semantics, malformed behavior, attempt gaps, legacy compatibility, and deferred lifecycle semantics.
- AC-14: Run verification, keep Validator runtime read-only, and keep changed files within approved scope.
- AC-15: Keep `docs/TASKS.md` synchronized with `.forge/tasks/TASK-0005.yaml` during Builder lifecycle status changes.

## Verification Plan

Builder should run:

```bash
git branch --show-current
grep -n '^status:' .forge/tasks/TASK-0005.yaml
git status --porcelain=v1 --untracked-files=all
git diff --check
pnpm -C tools/forge-validator verify
```

Before handoff, Builder should inspect:

- `git diff -- tools/forge-validator/src/validate.mjs`
- `git diff -- tools/forge-validator/test/validate.test.mjs`
- `git diff -- tools/forge-validator/README.md .forge/artifacts/README.md .forge/README.md docs/TASKS.md .forge/tasks/TASK-0005.yaml`
- `git diff --name-only` to confirm only approved files and the Builder artifact changed.

Tester and Reviewer should independently rerun the same verification command and inspect focused latest-attempt cases.

## Risks

- The key implementation risk is accidentally grouping only structurally valid artifacts before selecting latest attempts. That would incorrectly allow an older valid artifact to satisfy presence when a later malformed attempt exists.
- Filename parsing must be handled carefully. Artifacts with invalid slugs or invalid attempt suffixes should still fail structurally, but may not have enough reliable metadata to participate in latest-attempt presence selection.
- Error wording must clearly distinguish no existing attempt from an existing latest attempt that is malformed.
- The existing Node test runner may report aggregate counts differently by environment; handoff reports should record actual command output rather than inferred counts.

## Open Questions

None. The task contract defines the latest-attempt semantics, legacy boundary, invalid-task behavior, and deferred semantics sufficiently for a bounded implementation.

## Outcome

READY_FOR_APPROVAL
