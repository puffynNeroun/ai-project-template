---
schema_version: 1
task_id: TASK-0024
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# TASK-0024 Plan — Release Forge v0.2.2

## Goal

Create the Forge v0.2.2 release using the already-merged release notes:

    docs/releases/v0.2.2.md

This task performs the actual release operation:

- create annotated git tag v0.2.2;
- push tag v0.2.2 to origin;
- create GitHub release v0.2.2 from docs/releases/v0.2.2.md;
- verify local tag, remote tag, and GitHub release.

## Intended Release Commit

The intended release commit is the current origin/main commit at planning time:

    0be084cc070415e4250559ddc2d0ceba978c63f0

Short form:

    0be084c

The tag must point to this main commit, not to the TASK-0024 task branch commit.

Reason:

- TASK-0023 already merged the v0.2.2 release notes into main.
- TASK-0023 completion is already merged.
- main is clean and has no active task.
- TASK-0024 evidence should be recorded separately after release execution.

## Current Pre-Release State

Verified before writing this plan:

- docs/releases/v0.2.2.md exists.
- TASK-0023 is completed.
- local tag v0.2.2 does not exist.
- remote tag v0.2.2 does not exist.
- GitHub release v0.2.2 does not exist.

## Release Execution Plan

### Step 1 — Pre-release verification

Before creating the tag, run:

    git switch main
    git pull --ff-only origin main
    git fetch --tags --prune-tags
    pnpm -C tools/forge-validator run status
    pnpm -C tools/forge-validator run workflow:smoke
    pnpm -C tools/forge-validator verify

Confirm:

- main is clean;
- main equals origin/main;
- no active task on main;
- verification baseline passes;
- the main commit matches the intended release commit or the release operator explicitly confirms any difference.

Expected verification baseline:

    tests 214
    pass 214
    fail 0
    Forge contract validation passed

### Step 2 — Create annotated tag

Create annotated tag v0.2.2 on the intended main commit:

    git tag -a v0.2.2 RELEASE_COMMIT -m "Release Forge v0.2.2"

The actual command must substitute RELEASE_COMMIT with:

    0be084cc070415e4250559ddc2d0ceba978c63f0

### Step 3 — Push tag

Push the tag:

    git push origin v0.2.2

### Step 4 — Create GitHub release

Create GitHub release v0.2.2 using docs/releases/v0.2.2.md:

    gh release create v0.2.2 --title "Forge v0.2.2" --notes-file docs/releases/v0.2.2.md

### Step 5 — Verify release

Verify:

    git rev-parse v0.2.2
    git ls-remote --tags origin refs/tags/v0.2.2
    gh release view v0.2.2
    pnpm -C tools/forge-validator run status
    pnpm -C tools/forge-validator run workflow:smoke
    pnpm -C tools/forge-validator verify

Record evidence in:

    .forge/artifacts/TASK-0024/build-report-001.md

## Testing Plan

Tester should confirm:

- local tag v0.2.2 exists;
- remote tag v0.2.2 exists;
- GitHub release v0.2.2 exists;
- GitHub release body comes from docs/releases/v0.2.2.md;
- Forge status passes;
- Forge workflow smoke passes;
- Forge verify passes;
- no protected files changed.

Record evidence in:

    .forge/artifacts/TASK-0024/test-report-001.md

## Review Plan

Reviewer should confirm:

- release points to the intended main commit;
- release notes are the expected v0.2.2 notes;
- no documentation, CLI, validator, workflow, role, CI, or completed task evidence files were modified;
- release task evidence is sufficient;
- status, smoke, and verify pass.

Record evidence in:

    .forge/artifacts/TASK-0024/review-report-001.md

## Acceptance Criteria Mapping

- AC-01: This plan records the exact intended main commit.
- AC-02: Pre-release checks are required before execution.
- AC-03: Build step will verify local annotated tag v0.2.2.
- AC-04: Build/test steps will verify remote tag v0.2.2.
- AC-05: Build/test steps will verify GitHub release v0.2.2.
- AC-06: GitHub release will use docs/releases/v0.2.2.md.
- AC-07: Build/test/review artifacts will record release evidence.
- AC-08: Status, smoke, and verify are required after release execution.
- AC-09: Changed files are limited to TASK-0024 task/evidence and docs/TASKS.md.

## Out-of-Scope Guardrails

This release task must not:

- change release notes content;
- change README;
- change docs/DEMO.md;
- change docs/BOOTSTRAP_PROJECT.md;
- publish npm packages;
- add GitHub Pages demo;
- add agent runner, UI, TUI, SaaS dashboard, or Telegram approvals;
- change CLI behavior;
- change validator behavior;
- change workflow contracts;
- change role contracts.

## Decision

This release plan is ready for approval.
