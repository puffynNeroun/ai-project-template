---
schema_version: 1
task_id: TASK-0021
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# TASK-0021 Plan — Rewrite README for portfolio/open-source quality

## Goal

Rewrite the root README so Forge is understandable, credible, and useful as an open-source and portfolio-grade workflow toolkit for safe AI-assisted software delivery.

The README should make the value obvious quickly.

## Current Problem

Forge now has real lifecycle mechanics and a normal CLI entrypoint, but the README does not yet sell the project clearly.

A new visitor should understand within 30 seconds:

- what Forge is
- why it exists
- what problem it solves
- how to run it
- how it controls AI-assisted development
- what is implemented today
- what is planned later

## Product Positioning

Use this core positioning:

Forge is a local-first workflow toolkit for safe AI-assisted software delivery.

Do not position Forge as:

- a replacement for Codex, Cursor, Aider, or OpenHands
- an autonomous agent platform
- a magic app generator
- a production SaaS
- an npm-published package, unless that is actually implemented

Correct framing:

- AI tools can help write code.
- Forge controls the delivery process around that code.
- Forge makes tasks, plans, artifacts, checks, reviews, PRs, merges, and completion explicit.

## README Structure

Rewrite README.md around this structure:

1. Title and one-line description
2. Short problem statement
3. What Forge does
4. Why AI-assisted development needs workflow control
5. Core lifecycle
6. Quickstart
7. CLI commands
8. Artifact evidence model
9. Safety model
10. Example workflow
11. Bootstrap real projects
12. Current status
13. Roadmap
14. What Forge is not
15. Development and verification commands

## Required Content

### 1. Clear opening

The first section should explain Forge in plain language.

Expected idea:

Forge helps humans and AI agents build software through small, reviewable, evidence-backed steps instead of chaotic prompt-to-code edits.

### 2. Problem section

Explain the failure mode:

- AI agents can produce large unreviewed diffs
- context gets lost
- humans skip planning
- tests are treated as optional
- protected files can be changed accidentally
- task evidence is scattered or missing

### 3. Solution section

Explain that Forge adds:

- task contracts
- role-based lifecycle
- allowed_files and protected_files
- persistent artifacts
- required checks
- status command
- workflow smoke test
- contract validator
- PR and completion discipline

### 4. CLI commands

Document current concise CLI commands from TASK-0020.

Important accuracy rule:

The README can say the package exposes a forge bin entrypoint, but it must not claim npm publishing or global installation.

Mention existing pnpm commands remain supported.

### 5. Lifecycle section

Explain the lifecycle:

- define task
- planner writes plan
- builder implements
- tester verifies
- reviewer accepts or rejects
- implementation PR is merged
- task is completed through a completion PR

### 6. Artifacts section

Explain:

- plan-001.md
- build-report-001.md
- test-report-001.md
- review-report-001.md

Make it obvious that artifacts are not decoration. They are evidence.

### 7. Safety model

Explain:

- allowed_files
- protected_files
- required_checks
- validator
- CI
- dirty working tree checks
- small scoped tasks
- no direct release/tag/merge without verification

### 8. Quickstart

Keep it accurate to the current repo.

Include:

- clone
- install dependencies
- run status
- run smoke
- run verify

Use current working commands:

- pnpm -C tools/forge-validator run status
- pnpm -C tools/forge-validator run workflow:smoke
- pnpm -C tools/forge-validator verify

Also show the new CLI examples, but avoid pretending that global forge is already installed everywhere.

### 9. Bootstrap reference

Reference docs/BOOTSTRAP_PROJECT.md as the guide for creating a real product repository from the template.

Mention Pixardia as an example direction only if phrased as a bootstrap example, not as a completed product.

### 10. Roadmap

Keep roadmap grounded:

Near-term:

- README quality
- demo scenario/script
- Pixardia bootstrap

Later:

- agent runner
- approval UI
- Telegram or web approvals

Do not present future features as already built.

## Acceptance Criteria Mapping

- AC-01: Clear product description.
- AC-02: Problem and solution sections.
- AC-03: Quickstart with current verification commands.
- AC-04: CLI commands from TASK-0020.
- AC-05: Lifecycle explanation.
- AC-06: Safety model explanation.
- AC-07: Bootstrap guide reference.
- AC-08: Grounded roadmap.
- AC-09: No false claims about unimplemented features.
- AC-10: status, smoke, and verify pass.

## Verification Plan

Run:

- pnpm -C tools/forge-validator run status
- pnpm -C tools/forge-validator run workflow:smoke
- pnpm -C tools/forge-validator verify

Expected result:

- tests 214
- pass 214
- fail 0
- Forge contract validation passed

## Risks

### Risk 1 — Overmarketing

README could become hype instead of documentation.

Mitigation:

Use strong language, but keep claims tied to implemented features.

### Risk 2 — Claiming global forge availability incorrectly

TASK-0020 added a package bin entrypoint, not npm publishing.

Mitigation:

Explain the CLI carefully and keep pnpm commands as the reliable quickstart.

### Risk 3 — README scope creep

The task could expand into docs/BOOTSTRAP_PROJECT.md, demo scripts, or new CLI behavior.

Mitigation:

Only edit README.md plus lifecycle evidence.

## Decision

This plan is ready for approval.
