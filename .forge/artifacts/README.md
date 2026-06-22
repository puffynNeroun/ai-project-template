# Persistent Stage Artifacts

`.forge/artifacts/` contains repository-tracked handoff artifacts produced by the Planner, Builder, Tester, and Reviewer stages.

Artifacts are not runtime state. They document what each role handed to the next stage and preserve the evidence needed for humans and later agents to understand a task cycle.

## Path Convention

Artifacts live under a task-specific directory:

```text
.forge/artifacts/TASK-XXXX/<artifact-slug>-NNN.md
```

The supported artifact types and filename slugs are:

| Artifact type | Filename slug | Producing role |
| --- | --- | --- |
| `plan` | `plan` | Planner |
| `build_report` | `build-report` | Builder |
| `test_report` | `test-report` | Tester |
| `review_report` | `review-report` | Reviewer |

Examples:

```text
.forge/artifacts/TASK-0042/plan-001.md
.forge/artifacts/TASK-0042/build-report-001.md
.forge/artifacts/TASK-0042/test-report-001.md
.forge/artifacts/TASK-0042/review-report-001.md
```

## Format

Each artifact uses YAML front matter for small machine-readable metadata followed by a Markdown body for human-readable handoff content.

Artifact front matter uses only these fields:

```yaml
---
schema_version: 1
task_id: TASK-0042
artifact_type: test_report
attempt: 1
producing_role: tester
outcome: PASS
input_artifacts:
  - .forge/artifacts/TASK-0042/plan-001.md
  - .forge/artifacts/TASK-0042/build-report-001.md
---
```

Field meanings:

- `schema_version`: Artifact metadata version. The current version is `1`.
- `task_id`: The task identifier that owns the artifact.
- `artifact_type`: One of `plan`, `build_report`, `test_report`, or `review_report`.
- `attempt`: A positive integer matching the filename suffix.
- `producing_role`: One of `planner`, `builder`, `tester`, or `reviewer`.
- `outcome`: The role-specific handoff result.
- `input_artifacts`: Repository-relative paths to input artifacts used for the handoff.

Artifact metadata must not duplicate task status, current stage, timestamps, model information, token usage, cost, duration, session identifiers, commit SHAs, or pull request numbers.

## Outcomes

Allowed outcomes are role-specific:

| Artifact type | Outcomes |
| --- | --- |
| `plan` | `READY_FOR_APPROVAL`, `BLOCKED` |
| `build_report` | `READY_FOR_TEST`, `BLOCKED` |
| `test_report` | `PASS`, `FAIL`, `BLOCKED` |
| `review_report` | `ACCEPT`, `REJECT`, `BLOCKED` |

## Attempt Numbering

Attempts are numbered independently for each task and artifact type.

The first artifact for a type uses suffix `001`; later attempts use `002`, `003`, and so on. The front matter `attempt` value must match the numeric filename suffix.

Existing artifacts are append-only. Roles must not edit, rename, replace, or delete existing artifacts. A correction or retry creates the next attempt for that artifact type.

This append-only rule is a repository policy. The Forge Validator structurally validates existing live artifacts, but it does not enforce append-only behavior through Git history.

## Input Artifacts

`input_artifacts` contains repository-relative artifact paths only.

Input rules:

- `plan`: no input artifacts.
- `build_report`: references the approved plan. On retries, it may also reference the test report or review report that returned the work.
- `test_report`: references the plan and exact build report being tested.
- `review_report`: references the plan, build report, and passing test report being reviewed.

Input references are exact artifact paths. They are not required to reference the latest attempt, and the validator does not infer replacement or retry chains from later attempts.

The Forge Validator checks the outcomes of referenced input artifacts with this matrix:

| Referencing artifact type | Referenced artifact type | Required referenced outcome |
| --- | --- | --- |
| `build_report` | `plan` | `READY_FOR_APPROVAL` |
| `test_report` | `plan` | `READY_FOR_APPROVAL` |
| `test_report` | `build_report` | `READY_FOR_TEST` |
| `review_report` | `plan` | `READY_FOR_APPROVAL` |
| `review_report` | `build_report` | `READY_FOR_TEST` |
| `review_report` | `test_report` | `PASS` |

Referenced outcome-chain checks run only when both the referencing artifact and referenced artifact are structurally valid. Missing referenced artifacts and structurally invalid referenced artifacts are reported by input and structural validation without secondary referenced-outcome errors.

## Source Boundaries

- Task YAML is the source of task status, goal, scope, file boundaries, acceptance criteria, and required checks.
- Artifact files are stage handoffs.
- `docs/TASKS.md` is the human-readable board.
- Git history is the audit trail.
- GitHub pull requests are delivery history.

Artifacts should reference these sources rather than duplicating their authority.

## Structural Validation

The Forge Validator validates existing live artifacts under `.forge/artifacts/TASK-<number>/`. It checks artifact paths, filenames, YAML front matter metadata, role/type/outcome consistency, safe input references, and minimal input composition.

`.forge/artifacts/README.md` and `.forge/artifacts/templates/` are documentation and templates, not live artifacts.

## Status-Aware Presence Validation

For fully valid active task contracts, the Forge Validator requires structurally valid artifacts according to task status:

| Task status | Required structurally valid artifact types |
| --- | --- |
| `proposed` | None |
| `blocked` | None based only on status |
| `approved` | `plan` |
| `in_progress` | `plan` |
| `ready_for_pr` | `plan`, `build_report`, `test_report`, `review_report` |
| `completed` | `plan`, `build_report`, `test_report`, `review_report` |

`blocked` has no additional presence requirement because it can be entered from different workflow stages, and status alone does not identify the last completed stage.

The validator selects the latest existing attempt for each task and artifact type by highest numeric filename attempt when evaluating presence. Attempt gaps are allowed, so `test-report-003.md` is latest when attempts `001` and `003` exist.

Only the latest existing attempt can satisfy presence for a required artifact type. A malformed latest attempt is not hidden by an earlier valid attempt and produces an invalid-latest-attempt presence error. A malformed earlier attempt still fails structural validation, while a later structurally valid attempt can satisfy presence.

Artifact outcomes do not affect presence decisions. For delivery-ready statuses, the validator separately requires successful latest delivery artifact outcomes:

| Task status | Latest `test_report` outcome | Latest `review_report` outcome |
| --- | --- | --- |
| `ready_for_pr` | `PASS` | `ACCEPT` |
| `completed` | `PASS` | `ACCEPT` |

The `completed` outcome gate follows the same TASK-0001 and TASK-0002 legacy exemption as status-aware presence. Proposed, blocked, approved, and in-progress tasks do not require `test_report` `PASS` or `review_report` `ACCEPT`.

Delivery-ready outcome gates run only after the relevant latest artifact exists and is structurally valid. Missing artifacts and structurally invalid latest attempts are reported by structural and presence checks, without secondary outcome errors.

`TASK-0001` and `TASK-0002` are explicit legacy completed-task exemptions because they were completed before persistent live artifacts existed. Do not create retroactive artifacts for them. This exemption does not apply to `TASK-0003` or later tasks.

Presence validation runs only for active task contracts that pass task-contract validation. Invalid task contracts report their own task-contract errors without secondary missing-artifact errors.

## Deferred Enforcement

This contract does not add exact-attempt requirements, retry-chain validation, append-only Git-history enforcement, human approval artifacts, delivery evidence artifacts, runtime orchestration, automatic status transitions, GitHub automation, a database, an event stream, or a web interface.
