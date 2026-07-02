# Forge Demo

For a visual walkthrough of the lifecycle, see [GitHub Pages Visual Demo](GITHUB_PAGES_DEMO.md).

This demo shows how Forge guides a small AI-assisted development task through a safe, reviewable workflow.

The example is intentionally small:

    Add a short FAQ section to a product README.

The point is not the FAQ itself. The point is the delivery process around the change.

## What This Demo Shows

Forge helps turn AI-assisted coding from a loose chat-driven process into a repository-backed workflow.

This demo shows:

- how a task is defined;
- how scope is constrained;
- how a plan is recorded;
- how implementation evidence is captured;
- how testing evidence is captured;
- how review evidence is captured;
- how a task reaches PR readiness;
- how completion happens after merge.

## Starting Point

A clean repository starts with no active task:

    Now:
    - No active task.

    Next:
    - Define the next task.

Baseline checks should pass before starting new work:

    pnpm -C tools/forge-validator run status
    pnpm -C tools/forge-validator run workflow:smoke
    pnpm -C tools/forge-validator verify

Expected baseline:

    tests 214
    pass 214
    fail 0
    Forge contract validation passed

## Demo Scenario

Imagine you want to add a small FAQ section to a product README.

Without Forge, the workflow might look like this:

1. Ask an AI assistant to edit the README.
2. Paste a large change.
3. Forget the exact scope.
4. Skip a formal review.
5. Merge because the text "looks fine."

With Forge, the workflow becomes explicit:

1. Define a task contract.
2. Approve a plan.
3. Build only the approved scope.
4. Test the result.
5. Review the result.
6. Open a PR.
7. Complete the task only after merge.

## Step 1 — Define the Task

Create a task contract:

    pnpm -C tools/forge-validator run task:new -- \
      --id TASK-XXXX \
      --title "Add README FAQ section"

Forge creates:

    .forge/tasks/TASK-XXXX.yaml
    .forge/artifacts/TASK-XXXX/

It also updates:

    docs/TASKS.md

The task starts as:

    status: proposed

The task contract should define:

- goal;
- in-scope work;
- out-of-scope work;
- allowed files;
- protected files;
- acceptance criteria;
- required checks.

Example scope:

    allowed_files:
      - README.md
      - docs/TASKS.md
      - .forge/tasks/TASK-XXXX.yaml
      - .forge/artifacts/TASK-XXXX/plan-001.md
      - .forge/artifacts/TASK-XXXX/build-report-001.md
      - .forge/artifacts/TASK-XXXX/test-report-001.md
      - .forge/artifacts/TASK-XXXX/review-report-001.md

This prevents the task from silently expanding into unrelated changes.

## Step 2 — Write the Plan

Create the plan artifact:

    pnpm -C tools/forge-validator run artifact:new -- \
      --id TASK-XXXX \
      --type plan

Then write:

    .forge/artifacts/TASK-XXXX/plan-001.md

The plan explains:

- what will be changed;
- what will not be changed;
- how acceptance criteria map to the work;
- what checks will run;
- what risks exist.

Move the task through the planner gate:

    pnpm -C tools/forge-validator run task:stage -- \
      --id TASK-XXXX \
      --stage planner

The task moves:

    proposed -> approved

## Step 3 — Build the Change

Move to the builder stage:

    pnpm -C tools/forge-validator run task:stage -- \
      --id TASK-XXXX \
      --stage builder

The task moves:

    approved -> in_progress

Now the human or AI assistant edits the allowed file, for example:

    README.md

Then create a build report:

    pnpm -C tools/forge-validator run artifact:new -- \
      --id TASK-XXXX \
      --type build_report

Write:

    .forge/artifacts/TASK-XXXX/build-report-001.md

The build report should explain:

- what changed;
- why it changed;
- which files changed;
- what was intentionally not changed.

## Step 4 — Test the Change

Move to tester stage:

    pnpm -C tools/forge-validator run task:stage -- \
      --id TASK-XXXX \
      --stage tester

For tester, the task remains:

    in_progress -> in_progress

But the task board moves the next action to reviewer.

Run verification:

    pnpm -C tools/forge-validator run status
    pnpm -C tools/forge-validator run workflow:smoke
    pnpm -C tools/forge-validator verify

Create the test report:

    pnpm -C tools/forge-validator run artifact:new -- \
      --id TASK-XXXX \
      --type test_report

Write:

    .forge/artifacts/TASK-XXXX/test-report-001.md

The test report should include:

- commands run;
- result of each check;
- verification baseline;
- any manual content checks.

## Step 5 — Review the Change

Move to reviewer stage:

    pnpm -C tools/forge-validator run task:stage -- \
      --id TASK-XXXX \
      --stage reviewer

The task moves:

    in_progress -> ready_for_pr

Create the review report:

    pnpm -C tools/forge-validator run artifact:new -- \
      --id TASK-XXXX \
      --type review_report

Write:

    .forge/artifacts/TASK-XXXX/review-report-001.md

The review should check:

- the task stayed inside allowed files;
- protected files were not changed;
- acceptance criteria were met;
- verification passed;
- the result is ready for PR.

## Step 6 — Open and Merge the Implementation PR

Push the branch:

    git push -u origin task/TASK-XXXX-add-readme-faq

Create a PR with GitHub CLI:

    gh pr create \
      --base main \
      --head task/TASK-XXXX-add-readme-faq \
      --title "TASK-XXXX: Add README FAQ section" \
      --body-file /tmp/TASK-XXXX-pr-body.md

Confirm CI:

    gh pr checks TASK-XXXX

After checks pass, merge the implementation PR:

    gh pr merge TASK-XXXX --merge --delete-branch

At this point the implementation is merged, but the task is not completed yet.

## Step 7 — Complete the Task

After the implementation PR is merged into `main`, create a completion branch:

    git switch main
    git pull --ff-only origin main
    git switch -c chore/complete-TASK-XXXX

Complete the task:

    pnpm -C tools/forge-validator run task:complete -- --id TASK-XXXX

Forge moves the task:

    ready_for_pr -> completed

It also updates:

    docs/TASKS.md

Run final checks:

    pnpm -C tools/forge-validator run status
    pnpm -C tools/forge-validator run workflow:smoke
    pnpm -C tools/forge-validator verify

Then open and merge a completion PR.

The repository returns to:

    Now:
    - No active task.

    Next:
    - Define the next task.

## What Artifacts Were Created

For the demo task, Forge creates this evidence chain:

    .forge/tasks/TASK-XXXX.yaml
    .forge/artifacts/TASK-XXXX/plan-001.md
    .forge/artifacts/TASK-XXXX/build-report-001.md
    .forge/artifacts/TASK-XXXX/test-report-001.md
    .forge/artifacts/TASK-XXXX/review-report-001.md

Each artifact has structured frontmatter:

    schema_version: 1
    task_id: TASK-XXXX
    artifact_type: plan
    attempt: 1
    producing_role: planner
    outcome: READY_FOR_APPROVAL
    input_artifacts: []

These files make the workflow auditable.

## What Forge Prevented

Forge does not stop every mistake, but it reduces common AI-assisted development failure modes.

It helps prevent:

- unclear task intent;
- unbounded scope;
- accidental edits to protected files;
- missing planning evidence;
- missing test evidence;
- missing review evidence;
- merging without a visible lifecycle trail;
- forgetting to complete the task after implementation merge.

Forge turns "the AI changed some files" into "this scoped task moved through defined delivery gates."

## Commands Used in This Demo

Status:

    pnpm -C tools/forge-validator run status

Create task:

    pnpm -C tools/forge-validator run task:new -- --id TASK-XXXX --title "Add README FAQ section"

Create artifacts:

    pnpm -C tools/forge-validator run artifact:new -- --id TASK-XXXX --type plan
    pnpm -C tools/forge-validator run artifact:new -- --id TASK-XXXX --type build_report
    pnpm -C tools/forge-validator run artifact:new -- --id TASK-XXXX --type test_report
    pnpm -C tools/forge-validator run artifact:new -- --id TASK-XXXX --type review_report

Move stages:

    pnpm -C tools/forge-validator run task:stage -- --id TASK-XXXX --stage planner
    pnpm -C tools/forge-validator run task:stage -- --id TASK-XXXX --stage builder
    pnpm -C tools/forge-validator run task:stage -- --id TASK-XXXX --stage tester
    pnpm -C tools/forge-validator run task:stage -- --id TASK-XXXX --stage reviewer

Complete task:

    pnpm -C tools/forge-validator run task:complete -- --id TASK-XXXX

Smoke test:

    pnpm -C tools/forge-validator run workflow:smoke

Full verification:

    pnpm -C tools/forge-validator verify

## Notes on the `forge` CLI

Forge also exposes a packaged `forge` bin entrypoint with commands like:

    forge status
    forge smoke
    forge verify
    forge task new -- --id TASK-XXXX --title "Task title"
    forge task stage -- --id TASK-XXXX --stage planner
    forge task complete -- --id TASK-XXXX
    forge artifact new -- --id TASK-XXXX --type plan

The repository is not currently published as a public npm package, so the pnpm commands remain the reliable direct way to run the demo from a fresh clone.

## What This Demo Is Not

This demo is not:

- an autonomous agent runner;
- a web UI;
- a TUI;
- a Telegram approval flow;
- a SaaS dashboard;
- npm publishing documentation;
- automatic code generation.

It is a practical workflow demo for the current repository.

## What to Try Next

After reading this demo:

1. Read the root README.
2. Run `pnpm -C tools/forge-validator run status`.
3. Run `pnpm -C tools/forge-validator run workflow:smoke`.
4. Run `pnpm -C tools/forge-validator verify`.
5. Create a small task and move it through the lifecycle.

Forge becomes useful when every change has a task, a plan, evidence, review, and completion.
