---
schema_version: 1
task_id: TASK-0007
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Implement referenced artifact outcome-chain validation in Forge Validator.

TASK-0007 should make the Validator check whether artifacts named in `input_artifacts` have compatible outcomes for the artifact that references them. This is distinct from TASK-0006, which checks the latest delivery-ready `test_report` and `review_report` outcomes for task statuses. TASK-0007 checks only the outcomes of explicitly referenced input artifacts.

The implementation must preserve structural validation of every live artifact, TASK-0005 latest-attempt selection, TASK-0006 delivery-ready latest outcome gates, and the TASK-0001/TASK-0002 completed-task legacy exemption. It must not add retry-chain validation, require input artifacts to reference latest attempts, enforce append-only Git history, require human approval evidence, add orchestration, or automatically transition task status.

## Task Interpretation

The current artifact contract validates that `input_artifacts` paths exist and refer to structurally valid artifacts. TASK-0007 adds a semantic compatibility check after those existing structural/input checks have enough information to avoid noisy cascades.

The rule is local to each artifact reference:

- The referencing artifact has an `artifact_type`.
- Each referenced artifact has an `artifact_type` and `outcome`.
- If that pair appears in the explicit compatibility matrix, the referenced artifact must have the required outcome.
- If the pair is not in the matrix, TASK-0007 should not invent an outcome rule.

This is not retry-chain validation. A later attempt does not invalidate an earlier referenced attempt merely because it exists. The Validator should validate the exact artifact paths listed in `input_artifacts`, not chase newer attempts or infer replacement chains.

## Scope

In scope:

- Add referenced input artifact outcome-chain validation to Forge Validator.
- Validate the exact artifact paths listed in each live artifact's `input_artifacts`.
- Use the explicit compatibility matrix below.
- Report deterministic referenced-outcome-chain errors.
- Avoid secondary referenced-outcome-chain errors when a referenced artifact is missing or structurally invalid.
- Avoid referenced-outcome-chain errors for invalid task contracts that are already excluded from downstream validation flows.
- Preserve every existing structural artifact validation.
- Preserve TASK-0005 latest-attempt selection for status-aware presence.
- Preserve TASK-0006 delivery-ready latest outcome gates.
- Preserve TASK-0001 and TASK-0002 as the only completed-task legacy exemptions.
- Add focused tests for positive and negative chains, cascade prevention, deterministic ordering, and preservation of existing behavior.
- Update Validator and Forge artifact documentation.
- Keep Validator read-only.

Out of scope:

- Retry-chain validation.
- Requiring `input_artifacts` to reference latest attempts.
- Checking whether a later artifact supersedes an earlier referenced artifact.
- Adding new latest-artifact outcome gates beyond TASK-0006.
- Changing TASK-0006 delivery-ready status gates.
- Human approval evidence validation.
- Append-only Git-history validation.
- Markdown body validation.
- Runtime orchestration.
- Automatic task transitions.
- GitHub mutation.
- New dependencies or package metadata changes.
- Schema-version migration, configuration systems, or new task-contract keys.

## Referenced Outcome Matrix

The future Validator should enforce exactly these referenced artifact outcome compatibility rules:

| Referencing artifact type | Referenced artifact type | Required referenced outcome |
| --- | --- | --- |
| `build_report` | `plan` | `READY_FOR_APPROVAL` |
| `test_report` | `plan` | `READY_FOR_APPROVAL` |
| `test_report` | `build_report` | `READY_FOR_TEST` |
| `review_report` | `plan` | `READY_FOR_APPROVAL` |
| `review_report` | `build_report` | `READY_FOR_TEST` |
| `review_report` | `test_report` | `PASS` |

Examples:

- A `review_report` referencing a `test_report` with outcome `FAIL` must fail referenced outcome-chain validation.
- A `review_report` referencing a `test_report` with outcome `BLOCKED` must fail referenced outcome-chain validation.
- A `test_report` referencing a `build_report` with outcome `BLOCKED` must fail referenced outcome-chain validation.
- A `build_report` referencing a `plan` with outcome `BLOCKED` must fail referenced outcome-chain validation.
- A `review_report` referencing a `build_report` with outcome `READY_FOR_TEST` and a `test_report` with outcome `PASS` should pass this new rule.

The matrix should not be broadened during implementation without a task-definition revision.

## Allowed Files

Builder may modify only:

- `tools/forge-validator/src/validate.mjs`
- `tools/forge-validator/test/validate.test.mjs`
- `tools/forge-validator/README.md`
- `.forge/artifacts/README.md`
- `.forge/README.md`
- `docs/TASKS.md`
- `.forge/tasks/TASK-0007.yaml`

Builder may create its own new Builder artifact for TASK-0007 according to the persistent artifact contract.

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
- `.forge/tasks/TASK-0006.yaml`
- `.forge/roles/planner.md`
- `.forge/roles/builder.md`
- `.forge/roles/tester.md`
- `.forge/roles/reviewer.md`
- `.forge/artifacts/templates/plan.md`
- `.forge/artifacts/templates/build-report.md`
- `.forge/artifacts/templates/test-report.md`
- `.forge/artifacts/templates/review-report.md`
- Existing artifacts for TASK-0003 through TASK-0006
- `.github/workflows/forge-contracts.yml`
- `tools/forge-validator/package.json`
- `tools/forge-validator/pnpm-lock.yaml`
- `AGENTS.md`
- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/AI_WORKFLOW.md`
- `docs/DECISIONS.md`

## Current Validator Architecture

The Validator currently:

- Discovers project, workflow, task, and live artifact files.
- Validates task contracts and retains only fully valid task contracts for status-aware checks.
- Discovers live artifacts for active task files.
- Parses artifact YAML front matter.
- Validates artifact filename, task id, artifact type, attempt, producing role, outcome, and `input_artifacts`.
- Checks that referenced input artifact paths exist.
- Validates every discovered live artifact, including non-latest attempts.
- Groups artifacts by `task_id + artifact_type` and selects the highest numeric filename attempt for latest-attempt presence and delivery-ready outcome checks.
- Applies status-aware artifact presence rules.
- Applies TASK-0006 delivery-ready latest outcome gates.

TASK-0007 should reuse the artifact parsing and input path validation path rather than reparsing artifact files later.

## Proposed Design

Add a dedicated referenced outcome-chain validation step that runs after live artifacts are parsed and after the referenced input artifact set is known.

Recommended design:

- Extend artifact summaries, if needed, so each discovered artifact summary includes:
  - repository-relative `path`;
  - `taskId`;
  - `artifactType`;
  - numeric filename `attempt`;
  - parsed `outcome`;
  - parsed `input_artifacts`;
  - `structurallyValid`.
- Build an `artifactsByPath` map from repository-relative artifact paths to artifact summaries.
- Keep tracking whether each artifact is structurally valid using the existing artifact-local error-count checkpoint.
- Add a constant such as `requiredReferencedArtifactOutcomesByType` for the exact matrix:
  - `build_report: { plan: 'READY_FOR_APPROVAL' }`
  - `test_report: { plan: 'READY_FOR_APPROVAL', build_report: 'READY_FOR_TEST' }`
  - `review_report: { plan: 'READY_FOR_APPROVAL', build_report: 'READY_FOR_TEST', test_report: 'PASS' }`
- For each structurally valid referencing artifact, inspect its `input_artifacts` in deterministic sorted order.
- For each input path:
  - If the existing input validation already reported that the reference is missing, skip referenced outcome validation for that path.
  - If the referenced artifact summary is absent, skip to avoid duplicate errors.
  - If the referenced artifact summary exists but is not structurally valid, skip to avoid duplicate errors.
  - If the referencing artifact type has no rule for the referenced artifact type, skip.
  - If the referenced outcome does not equal the required outcome, emit a referenced-outcome-chain error.

Error messages should include:

- referencing artifact path;
- referencing artifact type;
- referenced artifact path;
- referenced artifact type;
- referenced actual outcome;
- expected referenced outcome.

Suggested shape:

```text
Contract error in .forge/artifacts/TASK-0090/review-report-001.md: review_report input artifact .forge/artifacts/TASK-0090/test-report-001.md has outcome 'FAIL' but must have outcome 'PASS' to satisfy referenced outcome-chain validation.
```

The new check must not use latest-attempt grouping to replace `input_artifacts`. It should validate the exact referenced paths.

## Implementation Steps

1. Read the current `validateArtifacts` and `validateArtifactInputs` flow.
2. Extend artifact summaries with `inputArtifacts` from parsed metadata if that is not already retained.
3. Return both `latestArtifactsByTaskIdAndType` and an `artifactsByPath` map, or otherwise expose artifact summaries by path without reparsing files.
4. Add the explicit referenced outcome matrix constant.
5. Add a `validateReferencedArtifactOutcomeChains` function.
6. Run the new function after artifact structural/input validation and before or after status-aware presence checks; ordering should preserve final deterministic error sorting.
7. Ensure the new function skips malformed referencing artifacts, missing referenced paths, and structurally invalid referenced artifacts to avoid secondary errors.
8. Ensure invalid task contracts still do not receive secondary referenced-outcome-chain errors through the existing active task filtering and task retention behavior.
9. Add focused tests.
10. Update documentation.
11. Run verification.

## Test Plan

Add fixture-based Validator tests for:

- Positive build chain: `build_report` references `plan` with `READY_FOR_APPROVAL`.
- Negative build chain: `build_report` references `plan` with `BLOCKED`.
- Positive test chain: `test_report` references `plan` with `READY_FOR_APPROVAL` and `build_report` with `READY_FOR_TEST`.
- Negative test-to-build chain: `test_report` references `build_report` with `BLOCKED`.
- Negative test-to-plan chain: `test_report` references `plan` with `BLOCKED`.
- Positive review chain: `review_report` references `plan` with `READY_FOR_APPROVAL`, `build_report` with `READY_FOR_TEST`, and `test_report` with `PASS`.
- Negative review-to-test chain: `review_report` references `test_report` with `FAIL`.
- Negative review-to-test chain for `BLOCKED`.
- Negative review-to-build chain: `review_report` references `build_report` with `BLOCKED`.
- Negative review-to-plan chain: `review_report` references `plan` with `BLOCKED`.
- Missing referenced artifacts still produce only existing missing input errors, not referenced-outcome-chain errors.
- Structurally invalid referenced artifacts still produce structural errors, not referenced-outcome-chain duplicates.
- Structurally invalid referencing artifacts do not produce referenced-outcome-chain errors.
- Invalid task contracts do not produce referenced-outcome-chain cascades.
- Referenced earlier attempts are allowed even when later attempts exist; this proves TASK-0007 does not require references to point to latest attempts.
- Existing TASK-0005 latest-attempt tests still pass.
- Existing TASK-0006 delivery-ready outcome tests still pass.
- Deterministic error ordering when multiple invalid references exist.

Do not weaken existing assertions.

## Documentation Plan

Update:

- `tools/forge-validator/README.md`
  - Describe referenced outcome-chain validation.
  - Include the exact matrix.
  - Clarify that this differs from latest delivery-ready outcome gates.
  - Clarify cascade prevention for missing or structurally invalid referenced artifacts.

- `.forge/artifacts/README.md`
  - Document the allowed referenced outcome matrix for `input_artifacts`.
  - Explain that `input_artifacts` may reference non-latest attempts.
  - Explain that retry-chain validation remains deferred.

- `.forge/README.md`
  - Update the Validator capability summary to mention referenced outcome-chain validation.
  - Keep deferred semantics clear.

- `docs/TASKS.md`
  - During Builder handoff, synchronize TASK-0007 lifecycle status according to the workflow.

## Acceptance Criteria Mapping

- AC-1: The plan and implementation keep referenced outcome-chain validation separate from retry-chain validation, latest-attempt outcome validation, orchestration, and automatic transitions.
- AC-2: The design sorts referencing artifacts and input paths before producing referenced-outcome-chain errors, preserving deterministic output.
- AC-3: The exact matrix is defined in this plan and should be implemented as a closed constant.
- AC-4: Negative review-to-test cases cover `FAIL`, `BLOCKED`, and any outcome other than `PASS`.
- AC-5: Negative test-to-build cases cover `BLOCKED` and any outcome other than `READY_FOR_TEST`.
- AC-6: Negative plan-reference cases cover `BLOCKED` or any outcome other than `READY_FOR_APPROVAL`.
- AC-7: Negative review-to-build cases cover `BLOCKED` or any outcome other than `READY_FOR_TEST`.
- AC-8: Positive chain tests cover build, test, and review artifact references with allowed outcomes.
- AC-9: Missing and structurally invalid referenced artifacts are skipped by the new check so existing input and structural errors remain authoritative.
- AC-10: Invalid task contracts remain outside downstream referenced-outcome-chain validation.
- AC-11: Existing structural validation remains unchanged and tests continue covering every live artifact.
- AC-12: Existing latest-attempt selection remains unchanged; a dedicated test should prove input references need not point to the latest attempt.
- AC-13: Existing TASK-0001/TASK-0002 completed-task exemption remains unchanged.
- AC-14: Existing TASK-0006 delivery-ready latest outcome gates remain unchanged and separate.
- AC-15: Tests cover positive, negative, cascade-prevention, deterministic, latest-attempt preservation, and delivery-ready preservation scenarios.
- AC-16: Documentation includes the matrix, cascade behavior, and deferred lifecycle semantics.
- AC-17: Validator remains read-only, verification passes, and the implementation stays within approved scope.
- AC-18: `docs/TASKS.md` remains synchronized with `.forge/tasks/TASK-0007.yaml`.

## Verification Plan

Required checks:

```bash
git diff --check
pnpm -C tools/forge-validator verify
```

Recommended inspections:

```bash
git status --porcelain=v1 --untracked-files=all
git diff -- tools/forge-validator/src/validate.mjs tools/forge-validator/test/validate.test.mjs
git diff -- tools/forge-validator/README.md .forge/artifacts/README.md .forge/README.md docs/TASKS.md
```

## Risks

- The main design risk is accidental retry-chain validation. The implementation must validate only the artifacts explicitly listed in `input_artifacts`.
- Another risk is noisy cascades when references are missing or malformed. The new check must skip those cases and let existing input/structural validation report them.
- The compatibility matrix is intentionally closed. If future workflows need additional artifact pairings or outcomes, they should be added by a later task.
- The Validator should avoid reparsing artifacts because doing so could create inconsistent error behavior and duplicate work.

## Open Questions

None. The matrix and non-goals are explicit enough for Builder implementation.

## Outcome

READY_FOR_APPROVAL
