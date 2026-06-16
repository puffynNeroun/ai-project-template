---
schema_version: 1
task_id: TASK-0003
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Add structural validation for existing live persistent stage artifacts to Forge Validator. The validator should be strict for artifacts that exist, while artifact absence remains valid regardless of task lifecycle status.

The implementation should stay narrow: extend the existing single-file validator, use the existing `yaml` dependency, add focused tests, and update only the approved documentation.

## Task Interpretation

TASK-0003 validates the artifact contract introduced by TASK-0002. It does not make artifacts lifecycle-required, does not decide which attempt is latest, does not enforce approval/PASS/ACCEPT chains, and does not enforce append-only behavior through Git.

The validator should treat `.forge/artifacts/README.md` and `.forge/artifacts/templates/` as documentation/template support files, not live artifacts. Live artifacts exist only under `.forge/artifacts/TASK-<number>/`.

## Scope

In scope:

- Discover live artifact task directories under `.forge/artifacts/TASK-<number>/`.
- Ignore `.forge/artifacts/README.md` and `.forge/artifacts/templates/`.
- Reject unsupported entries under `.forge/artifacts/`.
- Require each artifact task directory to correspond to an existing `.forge/tasks/TASK-<number>.yaml`.
- Validate artifact filenames, front matter, metadata keys, metadata values, input references, and minimal input composition.
- Keep validation read-only.
- Update validator tests and docs.

Out of scope:

- Requiring artifacts based on task status.
- Evaluating latest attempts or retry chains.
- Enforcing append-only history through Git.
- Validating referenced artifact outcomes.
- Validating Markdown headings, writing quality, or report completeness.
- Adding dependencies, package metadata changes, orchestration, automatic status transitions, or remote operations.

## Allowed Files

Builder may modify only:

- `.forge/tasks/TASK-0003.yaml`
- `tools/forge-validator/src/validate.mjs`
- `tools/forge-validator/test/validate.test.mjs`
- `tools/forge-validator/README.md`
- `.forge/artifacts/README.md`
- `.forge/README.md`
- `docs/TASKS.md`

Planner created this artifact as the only Planner write:

- `.forge/artifacts/TASK-0003/plan-001.md`

## Protected Files

Builder must not modify:

- `.forge/project.yaml`
- `.forge/workflows/feature.yaml`
- `.forge/tasks/task.template.yaml`
- `.forge/tasks/README.md`
- `.forge/tasks/TASK-0001.yaml`
- `.forge/tasks/TASK-0002.yaml`
- `.forge/roles/planner.md`
- `.forge/roles/builder.md`
- `.forge/roles/tester.md`
- `.forge/roles/reviewer.md`
- `.forge/artifacts/templates/plan.md`
- `.forge/artifacts/templates/build-report.md`
- `.forge/artifacts/templates/test-report.md`
- `.forge/artifacts/templates/review-report.md`
- `.github/workflows/forge-contracts.yml`
- `tools/forge-validator/package.json`
- `tools/forge-validator/pnpm-lock.yaml`
- `AGENTS.md`
- `README.md`
- `docs/PRODUCT_SPEC.md`
- `docs/AI_WORKFLOW.md`
- `docs/DECISIONS.md`
- Any existing artifact.

## Implementation Plan

1. Update lifecycle tracking only where approved.
   - Change `.forge/tasks/TASK-0003.yaml` from `proposed` to `in_progress` at Builder start.
   - Update `docs/TASKS.md` to show TASK-0003 as `in_progress` and point Next to Tester after Builder completion.

2. Add artifact constants and mappings in `tools/forge-validator/src/validate.mjs`.
   - Add `artifactRoot = '.forge/artifacts'`.
   - Add exact metadata key list:
     `schema_version`, `task_id`, `artifact_type`, `attempt`, `producing_role`, `outcome`, `input_artifacts`.
   - Add slug/type/role mappings:
     - `plan` -> `plan` -> `planner`
     - `build-report` -> `build_report` -> `builder`
     - `test-report` -> `test_report` -> `tester`
     - `review-report` -> `review_report` -> `reviewer`
   - Add outcome mapping by artifact type:
     - `plan`: `READY_FOR_APPROVAL`, `BLOCKED`
     - `build_report`: `READY_FOR_TEST`, `BLOCKED`
     - `test_report`: `PASS`, `FAIL`, `BLOCKED`
     - `review_report`: `ACCEPT`, `REJECT`, `BLOCKED`
   - Add minimal input type requirements:
     - `plan`: none
     - `build_report`: `plan`
     - `test_report`: `plan`, `build_report`
     - `review_report`: `plan`, `build_report`, `test_report`

3. Reuse existing helpers where possible.
   - Reuse `isPlainObject`.
   - Reuse `validateRepositoryRelativePath` for input artifact path safety, with custom artifact-specific messages if needed.
   - Reuse `isRegularFile`.
   - Reuse `hasPathEscape` and `isAbsolutePath` indirectly through `validateRepositoryRelativePath`.
   - Continue using `parseDocument` from `yaml`; do not add dependencies.

4. Add live artifact discovery.
   - Implement `discoverArtifactFiles(repositoryRoot, taskFileSet, errors)`.
   - If `.forge/artifacts/` is absent, return an empty list.
   - Iterate direct entries in `.forge/artifacts/`.
   - Ignore `README.md` and `templates`.
   - Reject any other non-directory or unsupported directory entry.
   - Accept only directories matching `TASK-\d+`.
   - For each `TASK-<number>` artifact directory, require `.forge/tasks/TASK-<number>.yaml` to exist among discovered active task files.
   - Read only direct files inside the task artifact directory; reject nested directories and unsupported entries.
   - Return sorted repository-relative artifact file paths for deterministic errors.

5. Define supported filename grammar.
   - Live artifact files must match:
     `^(plan|build-report|test-report|review-report)-(\d{3})\.md$`
   - Reject unsupported slugs.
   - Reject missing `.md`.
   - Reject non-three-digit suffixes.
   - Reject `000` because attempt must be positive.
   - Reject filenames with extra segments such as `plan-final-001.md`, `plan-1.md`, `plan-000.md`, or `notes.md`.

6. Add front matter extraction.
   - Implement `parseArtifactFile(repositoryRoot, artifactPath, errors)`.
   - Read the Markdown file.
   - Require it to start with `---` followed by a closing `---` delimiter on its own line.
   - Treat a missing opening delimiter, missing closing delimiter, empty front matter, YAML parse error, or non-mapping front matter as a contract error for that artifact.
   - Parse only the front matter with `parseDocument`, not the Markdown body.
   - Do not validate Markdown headings or body content.

7. Add exact metadata key validation.
   - Implement `validateArtifactKeySet(metadata, artifactPath, errors)`.
   - Compare set equality against the required metadata keys.
   - Key order must not matter.
   - Report missing keys and unexpected keys.
   - Do not allow rejected TASK-0002 fields such as `artifact_slug`, `produced_at`, `task_status`, `model`, or `commit_sha`.

8. Validate directory, filename, and metadata consistency.
   - Implement `validateArtifact(repositoryRoot, artifactPath, artifactFilesSet, taskFileSet, errors)`.
   - Derive task id from directory and slug/attempt from filename.
   - Validate:
     - `schema_version === 1`
     - `task_id` equals directory task id
     - `artifact_type` equals slug mapping
     - `attempt` is an integer and equals parsed numeric suffix
     - `producing_role` equals mapped role
     - `outcome` is allowed for artifact type
     - `input_artifacts` is an array
   - Use precise messages that include the artifact path.

9. Validate safe `input_artifacts`.
   - For each input:
     - require string;
     - require repository-relative path;
     - require forward slashes;
     - reject absolute paths and traversal;
     - require it to start with `.forge/artifacts/<same-task-id>/`;
     - require it to reference an existing regular live artifact file already discovered;
     - reject self-reference;
     - reject duplicates.
   - References should be checked against the discovered artifact file set and `isRegularFile`.
   - Do not allow references to `.forge/artifacts/README.md`, templates, other tasks, missing files, directories, or arbitrary repository files.

10. Validate minimal input composition.
   - For `plan`, require zero inputs.
   - For `build_report`, require at least one referenced artifact whose filename slug maps to `plan`.
   - For `test_report`, require at least one `plan` and one `build_report`.
   - For `review_report`, require at least one `plan`, one `build_report`, and one `test_report`.
   - Determine referenced artifact types from referenced filenames using the same filename parser.
   - Do not validate referenced outcomes, attempt recency, ordering, approval state, or full retry-chain semantics.

11. Wire validation into `validateRepository`.
   - Adjust task discovery so artifact validation can receive active task knowledge.
   - Minimal approach:
     - Let `discoverTaskFiles` remain responsible for task file discovery.
     - Add helper `getActiveTaskFileSet(repositoryRoot, errors)` or refactor `validateTasks` to return the discovered task file list.
     - Call `validateArtifacts(resolvedRoot, taskFileSet, errors)` after task validation.
   - Avoid a broad architectural refactor or plugin system.

12. Extend test fixture helpers.
   - Update `writeFixtureFile` so it creates parent directories with `fs.mkdir(path.dirname(...), { recursive: true })` before writing.
   - Add `removeFixturePath` helper only if needed for missing-file or directory-entry tests.
   - Keep fixtures temporary and read-only from the validator perspective.

13. Add focused tests.
   - Valid cases:
     - current repository still passes with only docs/templates and no live artifacts;
     - a valid `TASK-0003/plan-001.md` passes;
     - a valid chain of plan, build report, test report, and review report passes;
     - metadata keys in different order remain valid.
   - Discovery and path cases:
     - unsupported file under `.forge/artifacts/` fails;
     - unsupported directory under `.forge/artifacts/` fails;
     - live artifact directory without matching task contract fails;
     - nested directory inside a live artifact directory fails.
   - Filename cases:
     - unsupported slug fails;
     - non-three-digit attempt fails;
     - `000` attempt fails;
     - non-`.md` artifact file fails.
   - Front matter cases:
     - missing opening delimiter fails;
     - missing closing delimiter fails;
     - malformed YAML front matter fails;
     - non-mapping front matter fails.
   - Metadata cases:
     - missing required key fails;
     - unexpected key fails;
     - mismatched `task_id`, `artifact_type`, `attempt`, or `producing_role` fails;
     - invalid outcome fails.
   - Input cases:
     - non-string input fails;
     - absolute path fails;
     - backslash path fails;
     - traversal path fails;
     - other-task artifact path fails;
     - missing artifact path fails;
     - self-reference fails;
     - duplicate input fails;
     - build report without plan fails;
     - test report without build report fails;
     - review report without test report fails.

14. Update documentation.
   - `tools/forge-validator/README.md`: state that the validator now structurally validates existing live artifacts, remains read-only, ignores artifact absence by task status, and does not enforce lifecycle/latest/append-only semantics.
   - `.forge/artifacts/README.md`: update the deferred enforcement section to distinguish implemented structural validation from still-deferred lifecycle, append-only Git, approval, and orchestration enforcement.
   - `.forge/README.md`: update the validator overview to mention structural validation of existing live artifacts while preserving deferred orchestration/status-transition language.
   - `docs/TASKS.md`: track TASK-0003 as current `in_progress` during Builder work.

## Acceptance Criteria Mapping

- AC-1: Artifact discovery ignores README/templates and discovers only `.forge/artifacts/TASK-<number>/` live artifacts.
- AC-2: Discovery rejects unsupported artifact directories/files and missing task contracts.
- AC-3: Front matter parser enforces exact key set independent of order.
- AC-4: Filename-derived slug/attempt and directory task id are checked against metadata type, role, attempt, and outcome mappings.
- AC-5: `input_artifacts` validation enforces uniqueness, same-task paths, path safety, existing artifact files, and non-self-reference.
- AC-6: Minimal input composition checks are artifact-type based and avoid latest/status semantics.
- AC-7: Validator uses only filesystem reads and reports errors; no creation, mutation, agent execution, Git, or GitHub operations.
- AC-8: Test matrix covers valid artifacts and major invalid classes while existing tests continue to pass.
- AC-9: Validator and artifact docs explain structural validation versus deferred lifecycle enforcement.
- AC-10: `docs/TASKS.md` status matches `.forge/tasks/TASK-0003.yaml`.
- AC-11: `verify` passes and changed files remain inside the approved implementation scope.

## Verification Plan

Builder should run:

```bash
git status --porcelain=v1 --untracked-files=all
git diff --name-only
git diff --check
pnpm -C tools/forge-validator verify
```

Builder should also confirm:

- no protected file changed;
- no file outside TASK-0003 `allowed_files` changed, except this Planner artifact already created;
- no build, test, or review artifact was created for TASK-0003 during Builder implementation;
- `package.json` and `pnpm-lock.yaml` are unchanged.

Planner-stage baseline verification after creating this artifact:

```bash
git status --porcelain=v1 --untracked-files=all
git diff --check
pnpm -C tools/forge-validator verify
```

At Planner stage, validator success is only a baseline because current validator does not yet validate live artifacts.

## Risks

- The largest risk is accidental lifecycle expansion: requiring artifacts based on task status, latest attempts, approval evidence, or PASS/ACCEPT chains. Keep TASK-0003 strictly structural.
- Input validation can accidentally become too broad if it accepts any repository-relative path. Restrict inputs to existing same-task live artifact files.
- Discovery can accidentally validate templates as live artifacts. Explicitly ignore `.forge/artifacts/templates/`.
- Front matter parsing can accidentally parse the whole Markdown file as YAML. Extract only the front matter block.
- Error messages may become noisy if one malformed artifact cascades into many downstream errors. Prefer validating enough to report useful errors while avoiding avoidable follow-on failures.
- Test fixture helpers currently do not create parent directories; without a recursive mkdir update, nested artifact test setup will be brittle.

## Open Questions

None blocking.

One implementation choice remains for Builder: whether `validateTasks` should return the task file list or whether a small separate active-task discovery helper should be added. Prefer the smaller change after inspecting how the code reads during implementation.

## Outcome

READY_FOR_APPROVAL
