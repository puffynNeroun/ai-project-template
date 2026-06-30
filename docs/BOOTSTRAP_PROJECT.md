# Bootstrap a New Project from This Template

## Purpose

This document explains how to start a real product from this template without losing the Forge workflow structure.

Use it when creating a new project such as Pixardia, an internal tool, a SaaS app, or another product repository.

## Starting Point

This template is stable as of Forge v0.2.0.

Current baseline:

- Forge lifecycle CLI is available.
- Workflow smoke test is available.
- Forge contract validation is available.
- Release notes exist at docs/releases/v0.2.0.md.
- Expected verification baseline is 203 passing tests.

## 1. Create a New Repository from the Template

In GitHub:

1. Open the template repository.
2. Choose "Use this template".
3. Create a new repository.
4. Name it after the real product.

Example names:

- pixardia
- pixardia-web
- pixardia-platform
- client-portal
- ai-automation-dashboard

Do not continue building the real product inside the template repository unless the template itself is the product you are changing.

## 2. Clone the New Repository

Example:

git clone git@github.com:OWNER/NEW_PROJECT.git
cd NEW_PROJECT

Or with HTTPS:

git clone https://github.com/OWNER/NEW_PROJECT.git
cd NEW_PROJECT

## 3. Run the First Verification

Before changing product files, confirm the template works locally.

Run:

pnpm -C tools/forge-validator run status

pnpm -C tools/forge-validator run workflow:smoke

pnpm -C tools/forge-validator verify

Expected result:

- status command exits successfully
- workflow smoke passes
- verify passes
- tests 203
- pass 203
- fail 0
- Forge contract validation passed

If these checks fail immediately after cloning, fix the environment first. Do not start product work on a broken baseline.

## 4. Rename and Adapt Project Identity

Update project-specific identity in the new repository.

Start with:

- README.md
- package.json
- docs/PRODUCT_SPEC.md
- docs/TASKS.md
- docs/DECISIONS.md
- AGENTS.md

Use the real product name consistently.

For Pixardia, use:

- Product name: Pixardia
- Product type: web studio / digital product studio
- Goal: portfolio, services, leads, AI-assisted delivery workflow

## 5. Reset or Keep Historical Template Evidence

The template contains completed Forge tasks that explain how the workflow was built.

For a real product, choose one approach:

### Option A: Keep history

Use this when you want the project to preserve the template evolution.

Pros:

- full audit trail
- all examples remain available
- validator behavior stays proven

Cons:

- docs/TASKS.md contains template history

### Option B: Create a clean product repo

Use this when the product repository should start from TASK-0001.

This requires a dedicated cleanup task. Do not delete history manually without a Forge task.

Recommended cleanup task title:

Reset template task history for product bootstrap

## 6. Define the First Real Product Task

A good first product task is not "build everything".

Use a foundation task.

Example:

pnpm -C tools/forge-validator run task:new -- --id TASK-0001 --title "Define product foundation"

For Pixardia, possible first tasks:

pnpm -C tools/forge-validator run task:new -- --id TASK-0001 --title "Define Pixardia product foundation"

pnpm -C tools/forge-validator run task:new -- --id TASK-0001 --title "Define Pixardia MVP scope"

pnpm -C tools/forge-validator run task:new -- --id TASK-0001 --title "Define Pixardia architecture baseline"

## 7. Run the Forge Lifecycle

Every meaningful change should move through the lifecycle.

### Planner

pnpm -C tools/forge-validator run task:stage -- --id TASK-0001 --stage planner

pnpm -C tools/forge-validator run artifact:new -- --id TASK-0001 --type plan

Use the plan artifact to describe:

- goal
- scope
- out of scope
- files to change
- acceptance criteria
- verification commands

### Builder

pnpm -C tools/forge-validator run task:stage -- --id TASK-0001 --stage builder

pnpm -C tools/forge-validator run artifact:new -- --id TASK-0001 --type build_report

Use the build report to summarize:

- files changed
- behavior added
- safety notes
- verification performed

### Tester

pnpm -C tools/forge-validator run task:stage -- --id TASK-0001 --stage tester

pnpm -C tools/forge-validator run artifact:new -- --id TASK-0001 --type test_report

Use the test report to record:

- commands run
- expected results
- actual results
- failures
- fixes
- final outcome

### Reviewer

pnpm -C tools/forge-validator run task:stage -- --id TASK-0001 --stage reviewer

pnpm -C tools/forge-validator run artifact:new -- --id TASK-0001 --type review_report

Use the review report to confirm:

- acceptance criteria are met
- scope was respected
- protected files were not touched
- verification passed
- the task is ready for PR

### Complete

After the PR is merged:

pnpm -C tools/forge-validator run task:complete -- --id TASK-0001

## 8. Standard Verification Before PR

Before opening a PR, run:

pnpm -C tools/forge-validator run status

pnpm -C tools/forge-validator run workflow:smoke

pnpm -C tools/forge-validator verify

Also check:

git status --short --branch

Expected:

- working tree clean before PR or only intended files changed before commit
- workflow smoke passed
- verify passed
- no stale verification text
- active task has required artifacts

## 9. How to Work with Cursor, Codex, or Another AI Assistant

Use the AI assistant as a workflow partner, not as an uncontrolled code generator.

Give it clear instructions:

- work only on the active task
- respect allowed_files
- do not touch protected_files
- do not push unless explicitly requested
- do not merge unless explicitly requested
- run smoke and verify before commit
- stop at PR and wait for approval
- explain failures clearly
- keep changes small

Good prompt:

We are working in this repository using the Forge lifecycle.
Use docs/TASKS.md to find the active task.
Read .forge/tasks/TASK-XXXX.yaml before editing.
Only modify allowed_files.
Do not modify protected_files.
Run workflow smoke and verify before commit.
Do not push, create PRs, merge, tag, or release unless I explicitly ask.

## 10. Pixardia Bootstrap Example

For Pixardia, start with product foundation instead of jumping directly into UI.

Recommended first three tasks:

### TASK-0001

Define Pixardia product foundation

Expected output:

- product goal
- audience
- services
- lead flow
- pages
- technical constraints
- non-goals

### TASK-0002

Define Pixardia MVP scope

Expected output:

- exact MVP pages
- required forms
- data model
- SEO requirements
- deployment target
- acceptance criteria

### TASK-0003

Define Pixardia architecture baseline

Expected output:

- app structure
- Next.js routes
- database plan
- validation plan
- API route plan
- environment variables
- local development commands

## 11. Practical Product Rule

Do not start by asking the AI to build the whole product.

Start with one small task:

- define scope
- create one page
- create one API route
- create one form
- create one data model
- add one verification layer

Small tasks are easier to review, test, and merge.

## 12. Bootstrap Checklist

Before real development:

- New repository created from template.
- Repository cloned locally.
- status command passes.
- workflow smoke passes.
- verify passes.
- product name chosen.
- README updated.
- product spec updated.
- first task created.
- task contract reviewed.
- plan artifact created.
- protected files understood.
- PR boundaries understood.

## 13. Release Safety

Template releases are separate from product releases.

Forge v0.2.0 means the template workflow is stable.

It does not mean the product is ready.

When building a product from this template, create product-specific releases only after the product has its own tested milestones.

## Summary

Use this template to make product development controlled, reviewable, and repeatable.

The workflow is:

1. define task
2. plan
3. build
4. test
5. review
6. PR
7. merge
8. complete task

Keep each task small and verifiable.
