---
schema_version: 1
task_id: TASK-0015
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Add a Forge artifact report scaffold command.

The command should create valid lifecycle artifact report files for a selected task.

Target command examples:

pnpm -C tools/forge-validator run artifact:new -- --id TASK-0015 --type plan
pnpm -C tools/forge-validator run artifact:new -- --id TASK-0015 --type build_report
pnpm -C tools/forge-validator run artifact:new -- --id TASK-0015 --type test_report
pnpm -C tools/forge-validator run artifact:new -- --id TASK-0015 --type review_report

## Goals

- Create artifact report files with valid frontmatter.
- Support plan, build_report, test_report, and review_report.
- Validate task ID format.
- Validate artifact type.
- Refuse missing task contracts.
- Refuse overwriting existing artifact files.
- Keep task status unchanged.
- Keep docs/TASKS.md unchanged.
- Document usage.
- Add tests.
- Preserve full Forge Validator verification.

## Proposed files

Create:

- tools/forge-validator/src/scaffold-artifact.mjs
- tools/forge-validator/test/scaffold-artifact.test.mjs

Update:

- tools/forge-validator/package.json
- tools/forge-validator/README.md

## Artifact mapping

plan:

- path: .forge/artifacts/TASK-XXXX/plan-001.md
- artifact_type: plan
- producing_role: planner
- outcome: READY_FOR_APPROVAL
- input_artifacts: []

build_report:

- path: .forge/artifacts/TASK-XXXX/build-report-001.md
- artifact_type: build_report
- producing_role: builder
- outcome: READY_FOR_TEST
- input_artifacts:
  - .forge/artifacts/TASK-XXXX/plan-001.md

test_report:

- path: .forge/artifacts/TASK-XXXX/test-report-001.md
- artifact_type: test_report
- producing_role: tester
- outcome: PASS
- input_artifacts:
  - .forge/artifacts/TASK-XXXX/plan-001.md
  - .forge/artifacts/TASK-XXXX/build-report-001.md

review_report:

- path: .forge/artifacts/TASK-XXXX/review-report-001.md
- artifact_type: review_report
- producing_role: reviewer
- outcome: ACCEPT
- input_artifacts:
  - .forge/artifacts/TASK-XXXX/plan-001.md
  - .forge/artifacts/TASK-XXXX/build-report-001.md
  - .forge/artifacts/TASK-XXXX/test-report-001.md

## Safety

The command must validate before writing.

The command must not:

- overwrite existing artifact reports
- change task status
- change docs/TASKS.md
- create branches
- create commits
- push
- create PRs
- merge PRs
- complete tasks

## Verification

Run:

pnpm -C tools/forge-validator verify

Expected:

tests pass
Forge contract validation passed.

## Outcome

READY_FOR_APPROVAL
