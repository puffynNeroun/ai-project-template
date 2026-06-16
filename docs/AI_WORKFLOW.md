# AI-Assisted Project Workflow

## Purpose and Boundaries

This workflow explains how a bounded Forge task moves from proposal to a reviewed pull request. It is grounded in the current task contract, role contracts, workflow file, project manifest, and repository instructions.

Agents may inspect files, propose plans, implement allowed changes, run configured checks, and produce stage reports only within the active task contract. They must not change protected files, expand the scope, add dependencies, modify workflows or validator code, or create runtime orchestration or persistent artifact storage unless a future approved task explicitly allows it.

## Participants

The human operator controls task approval, delivery approval, and all Git and GitHub actions. The human may approve, reject, pause, or redirect work at the workflow gates.

The Planner, Builder, Tester, and Reviewer are agent roles. Each role has a limited contract and a handoff artifact. A role may perform only the actions allowed by its contract, the repository instructions, and the active task file.

## Planner

The Planner works while a task is `proposed`. It reads the relevant repository state, identifies scope, risks, allowed files, protected files, acceptance criteria, and verification commands, then produces a `plan` artifact.

The Planner does not modify files, approve its own plan, implement work, install dependencies, commit, push, merge, publish, or perform remote mutation.

## Human Plan Approval

The `approve_plan` stage is a human gate. If the human approves the Planner handoff, the task status changes from `proposed` to `approved` and the workflow may continue to Builder.

If the human rejects the plan, the task remains or returns to `proposed` and the workflow goes back to planning.

## Builder

The Builder works only after plan approval, while the task is `approved` or `in_progress`. The Builder changes the task status to `in_progress`, implements the approved scope, modifies only allowed files, runs configured checks, and produces a `build_report`.

The Builder must not modify protected files, add dependencies, change project commands, edit workflows, change role contracts, modify validator behavior, expand scope, accept its own work as final, or perform Git and GitHub delivery actions.

## Tester

The Tester evaluates the Builder output against every acceptance criterion and runs the required checks from the task contract. For this repository, the configured required check is `verify`.

If Tester reports `PASS`, the workflow advances to Reviewer. If Tester reports `FAIL`, work returns to Builder. If Tester reports `BLOCKED`, automatic continuation stops and the human must decide how to proceed.

## Reviewer

The Reviewer checks the plan, build report, test report, implementation, file boundaries, and documentation quality. The Reviewer confirms that the work stays inside the task contract and that protected and out-of-scope files remain unchanged.

If Reviewer reports `ACCEPT`, the workflow advances to human delivery approval. If Reviewer reports `REJECT`, work returns to Builder. If Reviewer reports `BLOCKED`, automatic continuation stops for human attention.

## Human Delivery Approval

The `approve_delivery` stage is the second human gate. It requires the review report.

If the human approves delivery, the task status changes to `ready_for_pr`. If the human rejects delivery, the task status returns to `in_progress` and the workflow goes back to Builder.

## Task Statuses

`proposed` means the task exists but implementation is not approved.

`approved` means the human approved the plan and Builder may begin.

`in_progress` means Builder, Tester, and Reviewer work may proceed within the task contract.

`blocked` means automatic continuation stops and human attention is required.

`ready_for_pr` means the agent cycle is complete and the task is ready for human-controlled pull request work.

`completed` is recorded only after the human-controlled delivery process is finished, including any required merge and post-merge verification.

## Failure, Rejection, and Blocked Paths

Tester `FAIL` returns work to Builder so the implementation can be corrected within the approved scope.

Reviewer `REJECT` also returns work to Builder, usually for correctness, boundary, or documentation-quality issues.

Any blocked outcome stops automatic continuation. Blocked work requires human attention before the workflow can continue.

## Human-Controlled Git and GitHub Actions

Commit, push, Pull Request creation, merge, release, deployment, and final completion are never performed automatically by these role contracts.

Agents may leave working-tree changes and stage reports for inspection, but the human operator controls whether and when repository history, remotes, pull requests, releases, deployments, or completion records are updated.

## End-to-End Example

For `TASK-0001`, the task starts as `proposed` with a goal to document the AI-assisted project workflow. The Planner reads the task and workflow contracts and produces a plan. The human approves that plan, changing the task to `approved`.

Builder then changes the task to `in_progress`, creates `docs/AI_WORKFLOW.md`, updates `docs/TASKS.md`, runs `pnpm -C tools/forge-validator verify`, and produces a build report. Tester checks each acceptance criterion and either passes the work to Reviewer, returns it to Builder on failure, or blocks for human attention.

Reviewer checks the implementation and boundaries. If Reviewer accepts, the human may approve delivery and change the task to `ready_for_pr`. Only after that does the human decide whether to commit, push, open a pull request, merge, and eventually mark the task `completed`.
