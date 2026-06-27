---
schema_version: 1
task_id: TASK-0009
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

TASK-0009 is a decision and policy task. It should not change Forge Validator source, tests, package metadata, CI, or completed task evidence.

Recommended policy: keep `plan` and `build_report` retry chains unrestricted for now, document that this is intentional, and preserve TASK-0008 retry-chain validation for `test_report` and `review_report` only.

This policy keeps early planning and building stages flexible while the repository gathers more evidence about real retry patterns. Any later enforcement for `plan` or `build_report` should be introduced through a separate implementation task with its own acceptance criteria and tests.

## Decision Options Considered

Option 1: Enforce `plan` retry chains now.

This would require `plan` attempt `N > 1` to follow a previous `plan` attempt with a specific outcome, probably `BLOCKED` or some future rejected-plan outcome. The current artifact outcome matrix only supports `READY_FOR_APPROVAL` and `BLOCKED` for plans. There is no explicit "rejected by human" plan artifact outcome, and workflow rejection returns the task to `proposed` rather than encoding rejection in the prior plan artifact.

Option 2: Enforce `build_report` retry chains now.

This would require `build_report` attempt `N > 1` to follow a previous `build_report` attempt with a specific outcome, probably `BLOCKED`, or to infer retry authorization from later `test_report FAIL` or `review_report REJECT` artifacts. That crosses into referenced outcome-chain, workflow-state, and orchestration semantics rather than a simple same-type retry rule.

Option 3: Keep `plan` and `build_report` retry chains unrestricted for now.

This preserves the current TASK-0008 behavior and existing tests that assert `plan` attempt `2` and `build_report` attempt `2` are not checked by retry-chain validation. It documents the policy without creating premature validation rules.

## Recommended Policy

Keep `plan` and `build_report` retry chains unrestricted for now.

The policy should be documented as intentional:

- `test_report` retries remain constrained by TASK-0008: attempt `N > 1` requires previous same-task `test_report` attempt `N-1` outcome `FAIL`.
- `review_report` retries remain constrained by TASK-0008: attempt `N > 1` requires previous same-task `review_report` attempt `N-1` outcome `REJECT`.
- `plan` retries remain structurally validated but do not require a previous `plan` outcome.
- `build_report` retries remain structurally validated and input-validated but do not require a previous `build_report` outcome.
- No retry rule should be inferred from Git history, human approval evidence, runtime orchestration, or automatic task transitions.

## Plan Retry-Chain Analysis

Plan retry-chain validation could be useful if the repository later needs to prove that each revised plan follows a rejected or blocked prior plan.

It is risky now because:

- `plan` has no explicit `REJECTED` outcome.
- Human plan rejection is workflow state, not an artifact outcome.
- A plan attempt `2` may be a clarification, correction, or replacement, not necessarily a retry after `BLOCKED`.
- Requiring previous `BLOCKED` would incorrectly reject legitimate plan revisions after human feedback.
- Enforcing this now could pressure agents to fabricate `BLOCKED` outcomes to satisfy structure rather than accurately represent planning history.

Decision: do not enforce plan retry-chain validation in TASK-0009.

## Build Report Retry-Chain Analysis

Build retry-chain validation could be useful if the repository later wants every rebuilt handoff to be explicitly tied to a previous failed test or rejected review.

It is risky now because:

- `build_report` outcomes are `READY_FOR_TEST` and `BLOCKED`; they do not directly encode "needs retry."
- A second build report is often authorized by downstream `test_report FAIL` or `review_report REJECT`, not by a previous `build_report` outcome.
- Same-type build retry validation would not capture the real causal chain without adding cross-artifact workflow semantics.
- Enforcing it too early could duplicate or conflict with TASK-0007 referenced input outcome-chain validation.
- It may require broader policy decisions about whether build retries must reference the failing test or rejecting review, which is not in scope here.

Decision: do not enforce build_report retry-chain validation in TASK-0009.

## Exact Files Builder May Change

Builder may change only policy documentation and handoff state:

- `.forge/tasks/TASK-0009.yaml`
- `docs/TASKS.md`
- `.forge/artifacts/TASK-0009/build-report-001.md`
- `tools/forge-validator/README.md`
- `.forge/artifacts/README.md`
- `.forge/README.md`

The expected Builder work is documentation-only plus task lifecycle synchronization.

## Files Builder Must Not Change

Builder must not change:

- `tools/forge-validator/src/validate.mjs`
- `tools/forge-validator/test/validate.test.mjs`
- package files
- lockfiles
- CI workflows
- completed task contracts
- completed task artifacts
- role contracts
- workflow contracts
- task templates

Builder must not add validator source or test changes unless a new, separate implementation task is approved later.

## Acceptance Criteria Mapping

- AC-01: This plan recommends that plan retry chains remain unrestricted for now and explains why.
- AC-02: This plan recommends that `build_report` retry chains remain unrestricted for now and explains why.
- AC-03: The plan identifies risks of premature plan/build enforcement, including missing artifact outcomes, human approval ambiguity, and cross-artifact workflow coupling.
- AC-04: The plan explicitly preserves TASK-0008 `test_report` and `review_report` retry behavior unchanged.
- AC-05: The plan forbids Builder from changing validator source or validator tests for TASK-0009.
- AC-06: Verification requires `pnpm -C tools/forge-validator verify` to pass.

## Verification Plan

Planner verification:

```bash
git status --short --branch
cat .forge/tasks/TASK-0009.yaml
cat docs/TASKS.md
git diff --check
pnpm -C tools/forge-validator verify
```

Builder verification should include:

```bash
git diff --check
pnpm -C tools/forge-validator verify
```

Builder should also inspect the final diff to confirm no validator source or test files changed.

## Risks And Non-Goals

Risks:

- Leaving plan/build retries unrestricted may allow ambiguous plan or build histories.
- Documenting unrestricted policy without future review could make it feel permanent; it should remain revisitable after more evidence.
- Build retry causality may eventually need a richer policy that references failed test or rejected review artifacts.

Non-goals:

- No validator implementation changes.
- No validator test changes.
- No package, lockfile, CI, role, or workflow changes.
- No completed artifact rewrites.
- No Git-history append-only validation.
- No human approval evidence validation.
- No orchestration or automatic task transitions.

## Final Outcome

READY_FOR_APPROVAL
