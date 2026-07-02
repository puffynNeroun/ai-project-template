---
schema_version: 1
task_id: TASK-0023
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# TASK-0023 Plan — Prepare Forge v0.2.2 Release Notes

## Goal

Prepare release notes for Forge v0.2.2.

This release notes task documents the public presentation and usability improvements added after v0.2.1:

- TASK-0020 — packaged Forge CLI
- TASK-0021 — open-source quality README
- TASK-0022 — Forge demo scenario

## Release Positioning

Forge v0.2.2 should be positioned as a public presentation and usability release.

The release notes should explain that Forge became easier to understand, easier to run, and easier to evaluate from GitHub.

Core message:

    v0.2.2 makes Forge easier to use and easier to explain.

## Planned File

Add:

    docs/releases/v0.2.2.md

Do not edit prior release notes.

Do not create a git tag.

Do not create a GitHub release.

Do not publish npm packages.

## Release Notes Structure

Create `docs/releases/v0.2.2.md` with this structure:

1. Title
2. Status
3. Summary
4. What's included
5. TASK-0020 — Forge CLI
6. TASK-0021 — README rewrite
7. TASK-0022 — Demo scenario
8. Verification baseline
9. Upgrade/readiness notes
10. What this release does not include
11. Release checklist for later tagging

## Required Content

### 1. Status

Clearly state that this document prepares release notes only.

Use wording like:

    These notes prepare Forge v0.2.2. This task does not create the git tag or GitHub release.

### 2. Summary

Explain v0.2.2 as a public presentation and usability release.

Mention:

- Forge CLI command shape
- README clarity
- end-to-end demo
- no runtime behavior changes in this release notes task

### 3. TASK-0020 Summary

Document the packaged CLI entrypoint:

- `forge status`
- `forge smoke`
- `forge verify`
- `forge task new`
- `forge task stage`
- `forge task complete`
- `forge artifact new`

Accuracy requirement:

Do not claim npm publishing or global install by default.

### 4. TASK-0021 Summary

Document the README improvements:

- clearer positioning
- quickstart
- lifecycle explanation
- artifacts as evidence
- safety model
- roadmap
- limitations

### 5. TASK-0022 Summary

Document the demo scenario:

- `docs/DEMO.md`
- end-to-end workflow
- task definition through completion
- artifacts at each stage
- what Forge prevents

### 6. Verification Baseline

Include current expected baseline:

    tests 214
    pass 214
    fail 0
    Forge contract validation passed

### 7. What This Release Does Not Include

Explicitly avoid overclaiming.

Do not claim:

- npm publishing
- GitHub Pages visual demo
- agent runner
- web UI
- TUI
- Telegram approvals
- SaaS dashboard
- automatic code generation
- automatic PR creation

### 8. Later Tagging Checklist

Include a small checklist for the future tag/release task.

Example:

- confirm main is clean
- run status
- run workflow smoke
- run verify
- create tag v0.2.2
- push tag
- create GitHub release from these notes

But clearly say that this task does not perform those actions.

## Acceptance Criteria Mapping

- AC-01: `docs/releases/v0.2.2.md` exists.
- AC-02: Release notes summarize TASK-0020, TASK-0021, and TASK-0022.
- AC-03: Release notes position v0.2.2 as public presentation and usability release.
- AC-04: Release notes include 214-test verification baseline.
- AC-05: Release notes do not claim tag or GitHub release already exists.
- AC-06: Release notes avoid claims about npm publishing, GitHub Pages, agent runner, UI, SaaS, or Telegram approvals.
- AC-07: status, smoke, and verify pass.

## Verification Plan

Run:

- pnpm -C tools/forge-validator run status
- pnpm -C tools/forge-validator run workflow:smoke
- pnpm -C tools/forge-validator verify

Also run content checks to confirm:

- `docs/releases/v0.2.2.md` exists
- release notes mention TASK-0020, TASK-0021, TASK-0022
- release notes mention tests 214, pass 214, fail 0
- release notes do not claim tag/release was created
- release notes do not claim unimplemented features

Expected baseline:

    tests 214
    pass 214
    fail 0
    Forge contract validation passed

## Risks

### Risk 1 — Accidentally creating a release

This task must only prepare notes.

Mitigation:

Do not run tag or GitHub release commands.

### Risk 2 — Overclaiming future features

The release notes could accidentally claim GitHub Pages, npm publishing, or agent runner.

Mitigation:

Include a clear "not included" section.

### Risk 3 — Scope creep

Release notes could turn into README or demo editing.

Mitigation:

Only add `docs/releases/v0.2.2.md` plus lifecycle evidence.

## Decision

This plan is ready for approval.
