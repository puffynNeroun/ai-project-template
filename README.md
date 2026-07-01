# Forge

Forge is a local-first workflow toolkit for safe AI-assisted software delivery.

It helps humans and AI coding tools build software through small, reviewable, evidence-backed steps instead of chaotic prompt-to-code edits.

Forge is not another AI agent. It is the workflow layer around AI-assisted development.

## Why Forge Exists

AI coding tools are powerful, but raw AI-assisted development often turns into a mess:

- huge diffs with unclear intent;
- skipped planning;
- forgotten acceptance criteria;
- tests treated as optional;
- protected files changed by accident;
- review evidence scattered across chat history;
- task status living in someone's head instead of the repository.

Forge solves this by making the delivery process explicit.

The model is simple:

1. Define a task.
2. Approve a plan.
3. Build inside a scoped contract.
4. Test with evidence.
5. Review with evidence.
6. Merge through a PR.
7. Complete the task only after the implementation is merged.

AI can still help write code. Forge makes the process safe, visible, and verifiable.

## What Forge Does

Forge provides a repository-based workflow for AI-assisted software development.

It currently includes:

- task contracts in `.forge/tasks/`;
- persistent lifecycle artifacts in `.forge/artifacts/`;
- role contracts for planner, builder, tester, and reviewer;
- allowed files and protected files per task;
- task board tracking in `docs/TASKS.md`;
- lifecycle commands for task creation, stage transitions, artifact scaffolding, completion, status, smoke testing, and validation;
- a packaged `forge` CLI entrypoint;
- a contract validator;
- a GitHub Actions verification workflow.

Forge is designed to work alongside tools like ChatGPT, Cursor, Codex, Aider, OpenHands, or any other coding assistant.

Those tools can produce changes. Forge controls the delivery workflow around those changes.

## The Core Idea

Chaotic AI coding usually looks like this:

- ask the model for changes;
- paste code;
- fix whatever breaks;
- forget why something changed;
- ship with weak review evidence.

Forge pushes the process toward this:

- define the task;
- constrain the scope;
- write the plan;
- build only what was approved;
- test and record evidence;
- review the result;
- merge through GitHub;
- complete the task with a clean repository state.

This creates a useful audit trail for both humans and AI agents.

## Quickstart

Clone the repository:

    git clone https://github.com/puffynNeroun/ai-project-template.git
    cd ai-project-template

Install dependencies from the Forge Validator package:

    pnpm -C tools/forge-validator install

Check the current lifecycle state:

    pnpm -C tools/forge-validator run status

Run the workflow smoke test:

    pnpm -C tools/forge-validator run workflow:smoke

Run full verification:

    pnpm -C tools/forge-validator verify

Expected baseline:

    tests 214
    pass 214
    fail 0
    Forge contract validation passed

## Forge CLI

Forge Validator now exposes a packaged `forge` bin entrypoint.

The existing pnpm commands remain the most explicit and reliable way to run the current repository directly:

    pnpm -C tools/forge-validator run status
    pnpm -C tools/forge-validator run workflow:smoke
    pnpm -C tools/forge-validator verify

The packaged CLI supports the concise command shape:

    forge status
    forge smoke
    forge verify
    forge task new -- --id TASK-XXXX --title "Task title"
    forge task stage -- --id TASK-XXXX --stage planner
    forge task complete -- --id TASK-XXXX
    forge artifact new -- --id TASK-XXXX --type plan

Important accuracy note: the package exposes a bin entrypoint, but this repository is not currently published as a public npm package. Do not assume global `forge` availability unless the package is linked, installed, or executed in an environment that exposes its bin.

For direct local execution during development, you can run the CLI entrypoint with Node:

    node tools/forge-validator/src/cli.mjs help
    node tools/forge-validator/src/cli.mjs status
    node tools/forge-validator/src/cli.mjs smoke
    node tools/forge-validator/src/cli.mjs verify

## Lifecycle

Forge uses a staged lifecycle.

### 1. Define a task

A task starts as a contract in `.forge/tasks/TASK-XXXX.yaml`.

The contract defines:

- goal;
- scope;
- out-of-scope items;
- allowed files;
- protected files;
- acceptance criteria;
- required checks.

Example:

    pnpm -C tools/forge-validator run task:new -- --id TASK-0021 --title "Rewrite README for portfolio/open-source quality"

### 2. Plan

The planner creates a plan artifact:

    .forge/artifacts/TASK-XXXX/plan-001.md

Then the task moves from `proposed` to `approved`.

### 3. Build

The builder implements the approved scope and records a build report:

    .forge/artifacts/TASK-XXXX/build-report-001.md

The build report explains what changed and why.

### 4. Test

The tester verifies the implementation and records a test report:

    .forge/artifacts/TASK-XXXX/test-report-001.md

The test report must show what checks were run and whether they passed.

### 5. Review

The reviewer inspects the implementation and records a review report:

    .forge/artifacts/TASK-XXXX/review-report-001.md

A task becomes `ready_for_pr` only after the review gate is accepted.

### 6. Pull request and merge

The implementation is pushed as a PR.

CI runs Forge verification before merge.

### 7. Completion

After the implementation PR is merged, the task is completed in a separate completion step.

This marks the task as `completed`, clears the active task board, and leaves the repository ready for the next task.

## Artifacts Are Evidence

Forge artifacts are not decorative markdown.

They are persistent evidence that the work went through the required delivery gates.

Current artifact types:

- `plan-001.md` — what will be done and what will not be done;
- `build-report-001.md` — what was implemented;
- `test-report-001.md` — what was verified;
- `review-report-001.md` — what was accepted or rejected.

The validator checks artifact structure, metadata, outcomes, input chains, retry chains, and required artifact presence based on task status.

This matters because chat history is fragile. Repository evidence is durable.

## Safety Model

Forge is built around boring but valuable safety controls.

### Allowed files

Each task declares files it is allowed to modify.

This keeps implementation scope narrow.

### Protected files

Each task also declares protected files.

These commonly include workflow contracts, role contracts, CI files, release notes, and completed task evidence.

### Required checks

Task contracts declare required verification keys.

The validator rejects unknown check keys and invalid task contracts.

### Artifacts and outcomes

Artifacts include structured frontmatter with:

- task id;
- artifact type;
- attempt number;
- producing role;
- outcome;
- input artifacts.

This lets Forge validate the chain of evidence.

### Git and PR gates

Forge is designed around clean working trees, small branches, PR checks, merge discipline, and completion commits.

The goal is not speed at any cost. The goal is controlled delivery.

## Example Workflow

A typical feature workflow looks like this:

    pnpm -C tools/forge-validator run task:new -- --id TASK-XXXX --title "Feature title"

    pnpm -C tools/forge-validator run artifact:new -- --id TASK-XXXX --type plan
    pnpm -C tools/forge-validator run task:stage -- --id TASK-XXXX --stage planner

    pnpm -C tools/forge-validator run task:stage -- --id TASK-XXXX --stage builder
    pnpm -C tools/forge-validator run artifact:new -- --id TASK-XXXX --type build_report

    pnpm -C tools/forge-validator run task:stage -- --id TASK-XXXX --stage tester
    pnpm -C tools/forge-validator run artifact:new -- --id TASK-XXXX --type test_report

    pnpm -C tools/forge-validator run task:stage -- --id TASK-XXXX --stage reviewer
    pnpm -C tools/forge-validator run artifact:new -- --id TASK-XXXX --type review_report

    pnpm -C tools/forge-validator verify

After the implementation PR is merged:

    pnpm -C tools/forge-validator run task:complete -- --id TASK-XXXX

## Bootstrap a Real Project

Forge can be used as a template for real product repositories.

See:

    docs/BOOTSTRAP_PROJECT.md

That guide explains how to create a new project from this template, adapt the project identity, run baseline checks, and start the first real product task.

Pixardia is an example direction for applying Forge to a real product workflow.

## Current Status

Forge currently has:

- file-based task contracts;
- lifecycle artifacts;
- status command;
- task scaffold command;
- stage transition command;
- artifact scaffold command;
- completion command;
- workflow smoke command;
- validator and tests;
- GitHub Actions verification;
- project bootstrap documentation;
- packaged CLI entrypoint.

Current verification baseline:

    tests 214
    pass 214
    fail 0
    Forge contract validation passed

## Roadmap

Near-term:

- improve README and open-source presentation;
- add a demo scenario or demo script;
- bootstrap a real Pixardia repository from the template.

Later:

- add an agent runner layer;
- add dry-run execution;
- add approval flows;
- add audit logs;
- add a TUI or web dashboard;
- consider Telegram or web approvals after the execution model is safe.

The later items are not implemented yet.

## What Forge Is Not

Forge is not:

- a replacement for ChatGPT, Cursor, Codex, Aider, or OpenHands;
- a fully autonomous coding agent;
- a magic website generator;
- an npm-published public package at the moment;
- a SaaS product;
- a substitute for engineering judgment.

Forge is the workflow layer that keeps AI-assisted development structured.

## Development Commands

Show current lifecycle state:

    pnpm -C tools/forge-validator run status

Run workflow smoke test:

    pnpm -C tools/forge-validator run workflow:smoke

Run full verification:

    pnpm -C tools/forge-validator verify

Run the local CLI entrypoint directly:

    node tools/forge-validator/src/cli.mjs help
    node tools/forge-validator/src/cli.mjs status
    node tools/forge-validator/src/cli.mjs smoke
    node tools/forge-validator/src/cli.mjs verify

## Project Rule

Keep the scope tight.

Small tasks, explicit plans, persistent evidence, and verification before merge.

That is the point of Forge.
