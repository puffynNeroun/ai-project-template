---
schema_version: 1
task_id: TASK-0025
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# TASK-0025 Plan — Add GitHub Pages Visual Demo

## Goal

Add a first static GitHub Pages visual demo for Forge.

The demo should help a GitHub visitor understand Forge visually, without reading only Markdown documentation.

The demo should explain:

- what Forge is;
- the lifecycle from task definition to completion;
- what happens under the hood;
- how task contracts and artifacts create evidence;
- why this makes AI-assisted development safer and less chaotic.

## Product Decision

Build the first visual demo inside the current repository.

Do not create a separate repository yet.

Reason:

- Forge is the product.
- The GitHub Pages demo is the product's presentation layer.
- README, docs, release notes, demo docs, and Pages demo should stay together for now.
- A separate repository can be considered later only if the visual demo grows into a full documentation site.

## Technical Decision

Use a lightweight no-framework static implementation.

Planned files:

    docs/pages-demo/index.html
    docs/pages-demo/styles.css
    docs/pages-demo/app.js
    docs/GITHUB_PAGES_DEMO.md
    .github/workflows/pages.yml

Also update links from:

    README.md
    docs/DEMO.md

No package manager changes are planned.

No build step is planned.

No frontend framework is planned.

## Visual Demo Scope

The visual demo should include:

1. Hero section
2. Lifecycle timeline
3. Under-the-hood artifact panel
4. Step-by-step explanation cards
5. Simple progressive reveal or animation
6. Safety/accuracy notes
7. Links back to README and docs/DEMO.md

## Lifecycle Steps to Show

The page should show this flow:

    Define Task
    Plan
    Build
    Test
    Review
    Implementation PR
    Merge
    Completion PR
    Done

Each step should explain what Forge records or validates.

## Under-the-Hood Explanation

The page should explain that Forge stores evidence in files such as:

    .forge/tasks/TASK-XXXX.yaml
    .forge/artifacts/TASK-XXXX/plan-001.md
    .forge/artifacts/TASK-XXXX/build-report-001.md
    .forge/artifacts/TASK-XXXX/test-report-001.md
    .forge/artifacts/TASK-XXXX/review-report-001.md

The demo should avoid making Forge look like a magical autonomous agent.

The message should be:

    AI can help, but Forge keeps the process scoped, reviewed, and verifiable.

## Animation / Progressive Reveal Plan

Use simple browser-native JavaScript and CSS.

Planned behavior:

- step cards appear progressively;
- clicking a lifecycle step highlights the corresponding under-the-hood evidence;
- a "Play lifecycle" button advances through the steps;
- a "Reset" button returns to the first step;
- animation must be decorative, not required for understanding.

The page should remain readable if JavaScript is disabled.

## GitHub Pages Deployment Plan

Add a GitHub Actions workflow:

    .github/workflows/pages.yml

The workflow should:

- run on push to main;
- support manual workflow dispatch;
- upload `docs/pages-demo` as the Pages artifact;
- deploy to GitHub Pages.

Documentation should explain that repository settings may still need GitHub Pages enabled with GitHub Actions as the source.

## Documentation Plan

Add:

    docs/GITHUB_PAGES_DEMO.md

It should explain:

- what the visual demo is;
- where source files live;
- how GitHub Pages deployment is intended to work;
- how to enable Pages from GitHub repository settings if needed;
- local preview options.

Update README and docs/DEMO.md with links to the visual demo documentation.

If the actual deployed URL is not known at implementation time, link to the source/demo docs and explain that the Pages URL appears after deployment.

## Accuracy Guardrails

The demo must not claim unimplemented features.

Do not claim Forge has:

- autonomous agent runner;
- SaaS dashboard;
- npm publishing;
- Telegram approvals;
- automatic PR creation;
- automatic code generation;
- production hosted backend;
- authentication;
- analytics;
- web application UI beyond this static demo page.

## Accessibility and Quality

The demo should:

- use semantic HTML;
- work on desktop and mobile;
- have readable contrast;
- support keyboard interaction for buttons;
- avoid external dependencies;
- avoid remote fonts or tracking scripts;
- keep animations lightweight;
- respect `prefers-reduced-motion`.

## Testing Plan

Tester should check:

- files exist;
- no glob paths are added to task contract;
- static demo contains lifecycle steps;
- static demo contains under-the-hood artifact explanation;
- static demo contains progressive reveal or animation behavior;
- documentation explains GitHub Pages deployment;
- README or docs link to demo documentation;
- demo does not claim unimplemented features;
- v0.2.2 tag and GitHub Release remain intact;
- Forge status passes;
- workflow smoke passes;
- verify passes.

## Acceptance Criteria Mapping

- AC-01: Static visual demo will exist under docs/pages-demo.
- AC-02: Demo will explain lifecycle from task definition through completion.
- AC-03: Demo will explain task contracts and artifacts.
- AC-04: Demo will include progressive reveal or animation behavior.
- AC-05: docs/GITHUB_PAGES_DEMO.md will explain GitHub Pages deployment.
- AC-06: README or docs/DEMO.md will link to the demo or deployment instructions.
- AC-07: Demo will avoid unimplemented feature claims.
- AC-08: status, smoke, and verify will pass.
- AC-09: v0.2.2 tag and GitHub Release will be checked.

## Risks

### Risk 1 — Scope creep into a full docs site

Mitigation:

Use static HTML/CSS/JS only.

### Risk 2 — GitHub Pages settings require manual configuration

Mitigation:

Add workflow and documentation, but clearly state repository Pages settings may need to be enabled.

### Risk 3 — Overclaiming product capabilities

Mitigation:

Add explicit "what Forge is not" messaging and test for forbidden claims.

### Risk 4 — Visual polish slows delivery

Mitigation:

Aim for a clean first version, not a final marketing website.

## Decision

This plan is ready for approval.
