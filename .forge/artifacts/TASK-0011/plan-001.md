---
schema_version: 1
task_id: TASK-0011
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# Plan

## Summary

Add a controlled Forge task scaffold command so new tasks can be started with a small CLI command instead of manual large heredoc copy-paste blocks.

The command should create a new task contract, prepare the matching artifact directory, and update `docs/TASKS.md` while refusing unsafe situations.

## Goals

- Provide a safe task scaffold command in the Forge Validator package.
- Accept a task ID and task title from CLI arguments.
- Validate task ID format before writing files.
- Refuse to run when `docs/TASKS.md` already has an active task.
- Refuse to overwrite an existing task contract.
- Refuse to overwrite or reuse an existing task artifact directory.
- Create a new task contract in `proposed` status.
- Prepare the matching `.forge/artifacts/TASK-XXXX/` directory.
- Update `docs/TASKS.md` Now and Next sections for the new task.
- Document the command in the Forge Validator README.
- Add tests for successful and rejected scaffold behavior.
- Preserve existing Forge Validator verification behavior.

## Non-Goals

- Do not change existing validator validation rules.
- Do not create plan, build, test, or review reports automatically.
- Do not approve tasks automatically.
- Do not create branches, commits, pushes, pull requests, merges, or releases.
- Do not modify completed task contracts or completed artifacts.
- Do not rewrite TASK-0001 through TASK-0010 evidence.
- Do not add a database, web UI, or long-running service.

## Proposed Implementation

### 1. Add scaffold module

Create `tools/forge-validator/src/scaffold-task.mjs`.

The module should contain testable functions for:

- parsing CLI arguments;
- validating task IDs;
- checking task board state;
- building task contract text;
- updating `docs/TASKS.md`;
- creating task files and artifact directory;
- rendering a short success message.

### 2. Add CLI usage

Add a package script such as:

~~~bash
pnpm -C tools/forge-validator run task:new -- --id TASK-0012 --title "Example task title"
~~~

The command should also support an optional repository root argument for tests, for example:

~~~bash
node ./src/scaffold-task.mjs --repo-root ../.. --id TASK-0012 --title "Example task title"
~~~

### 3. Validate inputs before writes

Before changing files, the command should validate:

- task ID matches `TASK-0000` style format;
- title is non-empty;
- task contract path does not already exist;
- artifact directory does not already exist;
- `docs/TASKS.md` has no active task in Now;
- `docs/TASKS.md` has a Next section that can be updated.

If any validation fails, the command should exit with a non-zero code and avoid partial writes.

### 4. Write scaffolded task contract

The generated contract should include:

- `schema_version: 1`;
- supplied task ID;
- supplied title;
- `status: proposed`;
- `workflow: .forge/workflows/feature.yaml`;
- clear starter goal;
- starter in-scope and out-of-scope sections;
- allowed files for that task;
- protected files for workflow safety;
- starter acceptance criteria;
- `required_checks: verify`.

### 5. Prepare artifact directory

The command should create:

~~~text
.forge/artifacts/TASK-XXXX/
~~~

The command should not create plan/build/test/review artifacts.

### 6. Update task board

The command should update `docs/TASKS.md`:

- `Now` becomes the new task line in `proposed` status;
- `Next` becomes `Run Planner for TASK-XXXX`;
- `Completed` remains unchanged.

### 7. Add tests

Create `tools/forge-validator/test/scaffold-task.test.mjs`.

Tests should cover:

- successful scaffold in a fixture repository;
- invalid task ID rejection;
- empty title rejection;
- existing active task rejection;
- existing task contract rejection;
- existing artifact directory rejection;
- board update behavior;
- no branch, commit, push, pull request, merge, or release behavior.

### 8. Update README

Document:

- purpose;
- command usage;
- required arguments;
- refusal behavior;
- what files are created or updated;
- what the command intentionally does not do.

## Verification Plan

Run:

~~~bash
pnpm -C tools/forge-validator verify
~~~

Expected result:

~~~text
tests pass
Forge contract validation passed.
~~~

## Risks

The main risk is accidental partial writes if validation happens after file creation.

To reduce that risk, the implementation should perform all validation first, then write files only after all checks pass.

## Outcome

READY_FOR_APPROVAL
