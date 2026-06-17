---
schema_version: 1
task_id: TASK-0004
artifact_type: plan
attempt: 2
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Add status-aware artifact-presence validation to Forge Validator. The validator should continue to structurally validate every existing live artifact, then require the presence of structurally valid artifact types according to task status.

This attempt supersedes `.forge/artifacts/TASK-0004/plan-001.md` because the first plan allowed an ambiguous best-effort task summary for invalid task contracts. This revision resolves that ambiguity: status-aware artifact-presence validation must operate only on non-template task contracts that fully pass normal task-contract validation.

The implementation must remain read-only, preserve the existing single-file validator architecture, avoid new dependencies, and avoid lifecycle semantics such as latest-attempt selection, retry-chain validation, PASS/ACCEPT enforcement, approval evidence, append-only Git history checks, orchestration, and automatic status transitions.

## Task Interpretation

TASK-0004 builds directly on TASK-0003. TASK-0003 made existing live artifacts structurally authoritative when present, but deliberately did not require artifacts based on task lifecycle status. TASK-0004 adds only status-aware artifact presence checks.

The approved status matrix is:

- `proposed`: require no artifact types.
- `blocked`: require no additional artifact types based only on status; any existing artifacts still undergo TASK-0003 structural validation.
- `approved`: require at least one structurally valid `plan`.
- `in_progress`: require at least one structurally valid `plan`.
- `ready_for_pr`: require at least one structurally valid `plan`, `build_report`, `test_report`, and `review_report`.
- `completed`: require the same four artifact types, except for the explicit TASK-0001 and TASK-0002 legacy exemption.

`blocked` is intentionally non-prescriptive because the workflow can enter it from Planner, Builder, Tester, or Reviewer paths, and status alone does not identify the last completed stage.

TASK-0001 and TASK-0002 are completed legacy tasks that predate persistent live stage artifacts. They must pass without fabricated retroactive artifacts. This exemption must be explicit and narrow, must not apply to TASK-0003 or later, and must not introduce a migration framework, configuration system, schema migration, or new task-contract key.

Any structurally valid positive attempt may satisfy a required artifact type. Presence validation must not care whether that attempt is `001`, whether it is the latest, or whether downstream outcomes are PASS/ACCEPT.

## Scope

In scope:

- Retain task status information from task validation for later artifact-presence validation, but only for fully valid active task contracts.
- Group only structurally valid discovered artifacts by task id and artifact type.
- Add a clear status-to-required-artifact-types matrix.
- Add the explicit TASK-0001 and TASK-0002 legacy completed-task compatibility boundary.
- Validate in this order:
  1. task contracts;
  2. live artifact discovery and structural validation;
  3. status-aware artifact-presence validation for fully valid active task contracts only.
- Ensure malformed task contracts do not receive secondary missing-artifact errors.
- Ensure malformed artifacts never satisfy presence requirements.
- Emit missing-artifact errors that include task id, task status, and missing artifact type.
- Preserve deterministic error ordering.
- Keep all validator behavior read-only.
- Update focused tests for every supported status, legacy compatibility, valid cases, missing-artifact failures, and invalid-task cascade prevention.
- Update documentation to describe implemented presence checks and still-deferred lifecycle semantics.
- Keep `docs/TASKS.md` synchronized with TASK-0004 status during implementation.

Out of scope:

- Latest-attempt selection.
- Exact-attempt requirements.
- Retry-chain validation.
- Referenced artifact outcome-chain validation.
- Requiring `PASS` test reports.
- Requiring `ACCEPT` review reports.
- Human approval evidence validation.
- Append-only Git-history enforcement.
- Markdown body validation.
- Automatic task status transitions.
- Agent execution or orchestration.
- GitHub mutation.
- New dependencies.
- Package metadata or lockfile changes.
- Broad Validator refactoring.
- Migration frameworks, configuration systems, schema migrations, or new task-contract keys for legacy compatibility.
- A new validation framework for recovering partial information from invalid task contracts.

## Allowed Files

Builder may modify only the implementation subset needed from TASK-0004 `allowed_files`:

- `.forge/tasks/TASK-0004.yaml`
- `tools/forge-validator/src/validate.mjs`
- `tools/forge-validator/test/validate.test.mjs`
- `tools/forge-validator/README.md`
- `.forge/artifacts/README.md`
- `.forge/README.md`
- `docs/TASKS.md`

During Builder execution, `.forge/tasks/TASK-0004.yaml` and `docs/TASKS.md` should be modified only for lifecycle/status synchronization if required by the approved workflow. The core implementation should be in the validator source, validator tests, and the three approved documentation files.

Stage handoff artifacts are not implementation scope expansion. Each later role may create only its own new TASK-0004 artifact path under the existing artifact contract.

## Protected Files

Builder must not modify:

- `.forge/project.yaml`
- `.forge/workflows/feature.yaml`
- `.forge/tasks/task.template.yaml`
- `.forge/tasks/README.md`
- `.forge/tasks/TASK-0001.yaml`
- `.forge/tasks/TASK-0002.yaml`
- `.forge/tasks/TASK-0003.yaml`
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
- `.github/workflows/forge-contracts.yml`
- `tools/forge-validator/package.json`
- `tools/forge-validator/pnpm-lock.yaml`
- `AGENTS.md`
- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/AI_WORKFLOW.md`
- `docs/DECISIONS.md`
- Any existing artifact.

## Current Validator Architecture

`tools/forge-validator/src/validate.mjs` is a single-file read-only validator. It parses project, workflow, task, and artifact contracts using filesystem reads and the existing `yaml` dependency.

The current validation flow is:

1. `validateProject` validates `.forge/project.yaml`.
2. `validateWorkflow` validates `.forge/workflows/feature.yaml`.
3. `validateTasks` discovers task files and validates each task contract.
4. `validateArtifacts` discovers live artifacts and structurally validates each artifact.
5. `validateRepository` returns sorted errors.

Task validation currently returns task file paths, not task metadata. Artifact validation currently validates paths, filenames, YAML front matter, metadata consistency, input paths, and minimal input composition. It does not retain a list of structurally valid artifact summaries for later use.

Because TASK-0004 needs task statuses during artifact-presence validation, Builder should change task validation to retain a small task summary for each fully valid active task rather than reparsing task YAML later. A suitable summary is `{ id, status, path }` or a map keyed by task id. The task template must not be included in presence validation.

Because TASK-0004 needs only valid artifacts to satisfy presence, Builder should have artifact validation return summaries only after an artifact passes structural validation. A suitable summary is `{ taskId, artifactType, path }`. Malformed artifacts should still emit structural errors but should not be added to the valid-artifact grouping.

## Proposed Design

### Task Status Retention

Modify task validation so `tasksById` contains only fully valid active task contracts.

Required behavior:

- Validate each task contract normally.
- Record a task-local error-count checkpoint before validating each task.
- Add `{ id, status, path }` to `tasksById` only when:
  - the file is a real `TASK-<number>.yaml` task, not `.forge/tasks/task.template.yaml`;
  - parsing succeeded;
  - all normal task-contract checks for that task succeeded;
  - no task-local validation error was added.
- Do not add malformed or otherwise invalid task contracts to `tasksById`.
- Do not run status-aware artifact-presence checks for invalid task contracts.
- Do not reparse task YAML later.
- Let invalid task contracts report their own task-contract errors without secondary missing-artifact presence errors.

One concrete shape is:

```js
async function validateTask(repositoryRoot, taskPath, workflow, project, errors) {
  const taskErrorCountBefore = errors.length;
  const task = await parseYamlFile(repositoryRoot, taskPath, errors);

  if (!validateRequiredObject(task, taskPath, errors)) {
    return null;
  }

  // Existing normal task-contract checks stay here.

  const taskIsValid = errors.length === taskErrorCountBefore;
  const isTemplate = taskPath === taskTemplatePath;
  if (!isTemplate && taskIsValid) {
    return { id: task.id, status: task.status, path: taskPath };
  }

  return null;
}
```

Builder may adapt this exact shape to the current function layout, but the checkpoint rule is mandatory. A task with a usable-looking `id` and `status` but any other contract defect, such as an unknown `required_checks` key, must not enter `tasksById`.

Change `validateTasks` to return both:

- the existing task file list needed by artifact discovery;
- an active task summary map keyed by task id for presence validation.

Example shape:

```js
return {
  taskFiles,
  tasksById,
};
```

### Structurally Valid Artifact Grouping

Change `validateArtifact` to return a summary only if the artifact is structurally valid enough to satisfy presence:

```js
{
  taskId,
  artifactType: parsedFilename.definition.type,
  path: artifactPath,
}
```

Use a local error count checkpoint inside `validateArtifact`:

- Record `const errorCountBefore = errors.length`.
- Run filename, front matter, metadata, and input validation.
- Return a summary only when `errors.length === errorCountBefore`.
- If parsing or validation fails, return `null`.

This ensures malformed artifacts never satisfy status-aware presence requirements. It also preserves TASK-0003 structural validation as authoritative.

In `validateArtifacts`, collect non-null summaries into a grouping:

```js
Map<taskId, Map<artifactType, Set<artifactPath>>>
```

Only the existence of at least one path in the set matters for presence. The path set is useful for deterministic behavior and future inspection, but TASK-0004 must not select a latest or exact attempt.

### Status Matrix

Represent the matrix as an explicit constant near artifact definitions:

```js
const requiredArtifactTypesByStatus = {
  proposed: [],
  blocked: [],
  approved: ['plan'],
  in_progress: ['plan'],
  ready_for_pr: ['plan', 'build_report', 'test_report', 'review_report'],
  completed: ['plan', 'build_report', 'test_report', 'review_report'],
};
```

This makes `blocked` behavior explicit and keeps status-to-presence logic easy to inspect. Do not infer requirements from workflow stages.

### Legacy Compatibility Boundary

Represent the TASK-0001 and TASK-0002 exemption as a narrow local constant:

```js
const legacyCompletedTaskIdsWithoutArtifacts = new Set(['TASK-0001', 'TASK-0002']);
```

In status-aware presence validation:

- If `task.status === 'completed'` and the task id is in this set, skip presence checks.
- Do not apply the exemption to any other status.
- Do not apply the exemption to TASK-0003 or later.
- Do not add a task YAML key, project config, migration registry, schema-version migration, or generalized compatibility framework.
- Do not create artifact files for TASK-0001 or TASK-0002.

### Presence Validation Function

Add a focused function such as:

```js
function validateArtifactPresenceByTaskStatus(tasksById, validArtifactsByTaskIdAndType, errors) {
  for (const task of [...tasksById.values()].sort((left, right) => left.id.localeCompare(right.id))) {
    if (task.status === 'completed' && legacyCompletedTaskIdsWithoutArtifacts.has(task.id)) {
      continue;
    }

    const requiredTypes = requiredArtifactTypesByStatus[task.status] ?? [];
    const validTypes = validArtifactsByTaskIdAndType.get(task.id) ?? new Map();

    for (const artifactType of requiredTypes) {
      if (!validTypes.get(artifactType)?.size) {
        errors.push(`Contract error in ${task.path}: task ${task.id} has status '${task.status}' and requires at least one structurally valid ${artifactType} artifact.`);
      }
    }
  }
}
```

The exact message may vary, but it must include:

- task id;
- task status;
- missing artifact type.

For deterministic error ordering:

- Add only fully valid active tasks to `tasksById`.
- Iterate task ids sorted lexicographically.
- Iterate required artifact types in the order defined by the matrix.
- Continue returning `errors: [...errors].sort()` from `validateRepository`.

### Validation Order

Keep the externally visible order:

1. Validate project, workflow, and task contracts.
2. Retain summaries only for non-template active task contracts with no task-local validation errors.
3. Discover live artifacts and structurally validate all discovered live artifacts.
4. Group only structurally valid artifacts by task id and artifact type.
5. Run status-aware presence validation using retained valid task summaries and the valid artifact grouping.
6. Return sorted errors.

This order means malformed artifacts can produce structural errors and still fail to satisfy presence. Malformed task contracts, however, do not receive secondary presence errors; they report their own task-contract errors only.

### Read-only Behavior

All implementation should continue to use only read/stat/readdir operations in validator code. Test fixture helpers may write to temporary fixture directories, as they already do. Validator runtime must not create artifacts, update task status, run agents, invoke Git, invoke GitHub, or mutate files.

## Implementation Steps

1. At Builder start, confirm the task is approved by a human.
   - Verify branch is `task/TASK-0004-status-aware-artifacts`.
   - Verify `.forge/tasks/TASK-0004.yaml` is `approved`.
   - If the task remains `proposed`, stop; Builder must not implement before approval.

2. Synchronize lifecycle status for Builder work.
   - Change `.forge/tasks/TASK-0004.yaml` from `approved` to `in_progress`.
   - Update `docs/TASKS.md` to show TASK-0004 as `in_progress` and point Next to testing after Builder completion.
   - Keep these edits within the approved task files.

3. Update task validation return data in `tools/forge-validator/src/validate.mjs`.
   - Preserve existing task contract checks.
   - Add a task-local error-count checkpoint before validating each task.
   - Return active task summaries only for non-template task contracts that parse successfully and add no task-local validation errors.
   - Do not add invalid task contracts to `tasksById`.
   - Keep task template validation separate from active task presence validation.
   - Do not reparse task YAML later.

4. Add status-aware presence constants.
   - Add `requiredArtifactTypesByStatus`.
   - Add `legacyCompletedTaskIdsWithoutArtifacts`.
   - Keep both constants local to the validator implementation.

5. Update artifact structural validation to return valid summaries.
   - Add error-count checkpointing in `validateArtifact`.
   - Return `{ taskId, artifactType, path }` only for structurally valid artifacts.
   - Return `null` for malformed artifacts.

6. Group valid artifact summaries.
   - Build `Map<taskId, Map<artifactType, Set<path>>>` in `validateArtifacts`.
   - Preserve existing artifact discovery and structural checks.
   - Do not group invalid or partially valid artifacts.

7. Add `validateArtifactPresenceByTaskStatus`.
   - Iterate sorted valid active task summaries.
   - Skip only completed TASK-0001 and TASK-0002.
   - Read required types from the explicit matrix.
   - Push one missing-artifact error per missing required type.
   - Include task id, task status, and missing artifact type in every message.
   - Produce no presence errors for task contracts absent from `tasksById`.

8. Wire the new function into `validateRepository`.
   - Validate tasks first and retain only valid summaries.
   - Validate artifacts and retain valid grouping.
   - Run presence validation after artifact structural validation.
   - Keep final sorted error behavior.

9. Update tests in `tools/forge-validator/test/validate.test.mjs`.
   - Prefer fixture-driven tests over reliance on real repository state where practical.
   - Existing artifact helper functions can be adapted for arbitrary task ids and statuses.
   - Add helpers to write task files with a requested status and to write complete artifact chains for a task.
   - Add the invalid-task cascade-prevention case described below.
   - Keep existing structural tests passing.

10. Update documentation.
   - `tools/forge-validator/README.md`: explain status-aware presence checks, read-only behavior, legacy TASK-0001/TASK-0002 exemption, and deferred lifecycle semantics.
   - `.forge/artifacts/README.md`: replace the TASK-0003-era "absence is not an error based on task status" wording with the new matrix and legacy compatibility note.
   - `.forge/README.md`: update the validator overview and deferred list so status-aware presence requirements are no longer described as deferred, while latest-attempt, append-only, approval, orchestration, and automatic status transitions remain deferred.
   - `docs/TASKS.md`: keep task board status synchronized.

11. Before Builder handoff, run required checks and inspect scope.
   - `git status --porcelain=v1 --untracked-files=all`
   - `git diff --name-only`
   - `git diff --check`
   - `pnpm -C tools/forge-validator verify`
   - Confirm protected files and existing artifacts are unchanged.

## Test Plan

Add focused tests for status-aware presence validation, ideally grouped after the existing structural artifact tests.

Recommended helper updates:

- Add `taskContractContent({ id, status })` or a small function that derives a test task from the existing template and fills required fields.
- Add `writeTask(fixtureRoot, id, status)` for active task fixtures.
- Generalize artifact metadata helpers to accept `task_id`, `attempt`, `outcome`, and input paths.
- Add `writeCompleteArtifactChain(fixtureRoot, taskId, options)` for plan/build/test/review setup.
- Use fixture paths rather than modifying the real repository.

Required tests:

- Proposed task without artifacts passes.
- Blocked task without artifacts passes.
- Blocked task with a malformed existing artifact still fails structural validation.
- Approved task without plan fails.
- Approved task with a structurally valid plan passes.
- In-progress task without plan fails.
- In-progress task with a structurally valid plan passes.
- Ready-for-pr missing `plan` fails.
- Ready-for-pr missing `build_report` fails.
- Ready-for-pr missing `test_report` fails.
- Ready-for-pr missing `review_report` fails.
- Ready-for-pr with all four structurally valid artifact types passes.
- Completed TASK-0003-style task with all four structurally valid artifact types passes.
- Completed non-legacy task missing a required type fails.
- TASK-0001 and TASK-0002 pass without retroactive artifacts.
- TASK-0003 or later does not receive the legacy exemption.
- A valid non-001 positive attempt, such as `plan-002.md`, can satisfy presence.
- Outcomes are not used for presence decisions; for example a `test_report` with `FAIL` and a `review_report` with `REJECT` can still satisfy presence when structurally valid.
- Missing-artifact errors include task status and artifact type.
- A task with a usable-looking id/status but another task-contract defect reports the task-contract defect and does not also produce status-aware missing-artifact errors.
- Current repository passes.
- All existing tests continue passing.

For the invalid-task cascade-prevention test, create a fixture task such as `TASK-0099` with `status: approved` and an unrelated task-contract defect, such as `required_checks: [missing_check]`. Assert that validation reports the unknown required check and does not report a missing `plan` artifact for that task.

For missing-type tests, avoid brittle dependencies on unrelated fixture artifacts. Create a fresh fixture task id such as `TASK-0090`, write only the artifacts needed for that scenario, and assert the specific missing type in the error.

For the current repository test, remember that TASK-0001 and TASK-0002 are legacy exempt, TASK-0003 has a complete artifact chain, and TASK-0004 will be proposed or in_progress depending on lifecycle state during implementation.

## Documentation Plan

Update only the approved documentation files:

- `tools/forge-validator/README.md`
- `.forge/artifacts/README.md`
- `.forge/README.md`
- `docs/TASKS.md` if status synchronization is needed

The documentation should state:

- The validator still structurally validates every existing live artifact under `.forge/artifacts/TASK-<number>/`.
- Status-aware presence validation is now implemented.
- Presence validation runs only for active task contracts that fully pass task-contract validation.
- Invalid task contracts report their own task-contract errors and do not receive secondary missing-artifact presence errors.
- `proposed` and `blocked` do not require artifacts based only on status.
- `approved` and `in_progress` require at least one structurally valid plan.
- `ready_for_pr` requires plan, build report, test report, and review report.
- `completed` requires those four artifact types except for TASK-0001 and TASK-0002.
- TASK-0001 and TASK-0002 are legacy pre-artifact completed tasks and no retroactive artifacts should be fabricated for them.
- TASK-0003 and later completed tasks are not exempt.
- Any structurally valid positive attempt may satisfy presence.
- Latest-attempt selection, retry-chain validation, PASS/ACCEPT outcome-chain enforcement, approval evidence, append-only Git-history enforcement, orchestration, and automatic transitions remain deferred.

## Acceptance Criteria Mapping for AC-1 through AC-14

- AC-1: `requiredArtifactTypesByStatus.proposed` is empty, and tests show a proposed task without artifacts passes.
- AC-2: `requiredArtifactTypesByStatus.blocked` is empty, and tests show blocked without artifacts passes while blocked with malformed existing artifacts still fails structural validation.
- AC-3: `requiredArtifactTypesByStatus.approved` requires `plan`, and tests cover missing-plan failure plus valid-plan success.
- AC-4: `requiredArtifactTypesByStatus.in_progress` requires `plan`, and tests cover missing-plan failure plus valid-plan success.
- AC-5: `requiredArtifactTypesByStatus.ready_for_pr` requires `plan`, `build_report`, `test_report`, and `review_report`, and tests cover each missing type plus the all-present success case.
- AC-6: `requiredArtifactTypesByStatus.completed` requires all four types, with only the explicit legacy skip applied before missing-artifact checks.
- AC-7: `legacyCompletedTaskIdsWithoutArtifacts` contains only TASK-0001 and TASK-0002; tests prove those tasks pass without retroactive artifacts and TASK-0003 or later does not receive the exemption.
- AC-8: Valid artifact grouping accepts any structurally valid positive attempt, and tests prove a non-001 attempt satisfies presence.
- AC-9: Implementation consults only fully valid task status and artifact type presence; docs and tests show no latest-attempt, retry-chain, outcome-chain, approval, append-only Git, orchestration, automatic-transition, or invalid-task recovery semantics are introduced.
- AC-10: Missing-artifact errors include task id, task status, and missing artifact type, and invalid task contracts do not produce secondary missing-artifact errors.
- AC-11: Tests cover all supported statuses, valid cases, missing-artifact failures, malformed blocked artifacts, legacy compatibility, non-legacy completed behavior, non-001 attempts, outcome-independent presence, invalid-task cascade prevention, and existing tests continue passing.
- AC-12: Approved docs explain the implemented matrix, blocked behavior, legacy compatibility, invalid-task cascade-prevention behavior, and deferred lifecycle semantics.
- AC-13: Validator runtime remains read-only, `verify` passes, protected files remain unchanged, and implementation changes stay within TASK-0004 allowed files.
- AC-14: `docs/TASKS.md` and `.forge/tasks/TASK-0004.yaml` show the same TASK-0004 lifecycle status after Builder synchronization.

## Verification Plan

Builder should run:

```bash
git branch --show-current
git status --porcelain=v1 --untracked-files=all
git diff --name-only
git diff --check
pnpm -C tools/forge-validator verify
```

Builder should also confirm:

- Branch is `task/TASK-0004-status-aware-artifacts`.
- TASK-0004 was `approved` before Builder changed it to `in_progress`.
- `.forge/tasks/TASK-0004.yaml` and `docs/TASKS.md` are synchronized.
- No protected file changed.
- No existing artifact changed.
- `tools/forge-validator/package.json` and `tools/forge-validator/pnpm-lock.yaml` are unchanged.
- No dependency installation, commit, push, pull request, merge, release, deployment, or remote mutation occurred.

Tester and Reviewer should rerun the same validator verification command and inspect the actual diff, especially `validate.mjs` and `validate.test.mjs`.

## Risks

- If invalid task contracts are added to `tasksById`, validator output may cascade with misleading missing-artifact errors. Use task-local error-count checkpointing and only retain fully valid active task contracts.
- If invalid artifacts are grouped before structural validation completes, malformed artifacts may incorrectly satisfy presence. Use artifact-local error-count checkpointing and only group valid summaries.
- If task files are reparsed during artifact validation, behavior may become harder to reason about and slower. Retain summaries from task validation instead.
- If the completed-task exemption is generalized, TASK-0003 or later could incorrectly bypass presence checks. Keep the exemption as a narrow two-id constant.
- If `blocked` requirements are inferred from workflow stages, the validator may over-require artifacts because status alone does not identify the blocking stage. Keep `blocked` requirements empty.
- If outcome values are used for presence, TASK-0004 would accidentally enforce PASS/ACCEPT chains. Presence must depend only on structural validity and artifact type.
- Adding TASK-0004 plan artifacts may make future TASK-0004 fixture assumptions different from the real repository. Tests should use fixtures for matrix behavior where possible.
- Error messages may duplicate structural and presence errors for malformed artifacts. That is acceptable for invalid artifacts because malformed artifacts do not satisfy presence; invalid task contracts are the special case that must avoid secondary presence errors.

## Open Questions

None blocking.

One implementation choice is left to Builder judgment: whether to return `{ taskFiles, tasksById }` directly from `validateTasks` or use a similarly small structure. Prefer the smallest readable change that avoids task reparsing, avoids invalid-task summaries, and avoids broad refactoring.

## Outcome

READY_FOR_APPROVAL
