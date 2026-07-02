---
schema_version: 1
task_id: TASK-0026
artifact_type: plan
attempt: 1
producing_role: planner
outcome: READY_FOR_APPROVAL
input_artifacts: []
---

# TASK-0026 Plan — Redesign Pages Demo as Premium Product Walkthrough

## Goal

Redesign the existing GitHub Pages demo into a premium light-palette product walkthrough.

The current demo is technically working, but it feels like a simple card-based documentation page.

The new demo must feel like a serious product presentation:

- confident;
- calm;
- premium;
- clear;
- visually impressive;
- easy to understand without reading long paragraphs.

The key design target is not more pages or more sections.

The key target is higher visual and functional density per screen.

## Product Problem

The current demo does not clearly communicate:

- what comes into Forge;
- what Forge does with that input;
- what artifacts are produced;
- what final proof state is created;
- why this workflow is more trustworthy than chaotic AI prompting.

The current animation mostly highlights cards and fills a progress bar.

That motion is decorative, not explanatory.

## Product Story

The redesigned demo must tell one coherent story:

    Input task contract
    -> Forge orchestration pipeline
    -> role stages
    -> evidence artifacts
    -> PR and completion gates
    -> final proof state

The user should understand the product in roughly 10-20 seconds.

## Design Direction

Use a light premium palette.

The page should feel like a polished engineering product, not a generic landing page.

Recommended visual language:

- warm off-white background;
- white product panels;
- soft graphite text;
- trust-blue and deep-green accents;
- subtle amber for gates or warnings;
- thin borders;
- soft shadows;
- large whitespace;
- crisp typography;
- calm motion;
- no noisy gradients;
- no childish neon;
- no heavy dark-card grid.

Suggested palette:

    background: #F7F4EC
    surface: #FFFFFF
    surface-soft: #FBFAF6
    ink: #111827
    muted: #667085
    border: #E7E3DA
    trust-blue: #2563EB
    deep-green: #047857
    mint: #DDF8E8
    amber: #B7791F
    blueprint: #E8EEF9

The final implementation may adjust exact values if the result looks better.

## Layout Strategy

Use one strong product walkthrough page.

Avoid many generic sections.

Planned page structure:

1. Premium hero with product claim and compact live system preview.
2. Main interactive walkthrough board.
3. Evidence output rail.
4. Final proof state.
5. Compact contrast block: Without Forge vs With Forge.

The main section should carry most of the value.

## Main Visual Concept

Create a central "Forge Orchestration Board".

It should look like a real product system diagram.

The board should contain:

- left side: input contract panel;
- middle: connected lifecycle pipeline;
- right side: live stage inspector;
- bottom or side: evidence artifact rail;
- final area: proof state.

The visual flow:

    Input Contract
        |
        v
    Plan -> Build -> Test -> Review -> Implementation PR -> Completion PR -> Done
        |
        v
    Evidence artifacts appear as the flow advances

The user should see blocks appearing, connecting, and producing artifacts.

## Input Contract Panel

Show the starting input clearly.

Example content:

    TASK-0026
    Redesign Pages demo
    Scope: docs/pages-demo/*
    Guardrails: no SaaS claims, no agent claims
    Acceptance: clear product walkthrough

This panel should make it obvious that Forge starts with controlled inputs.

## Lifecycle Pipeline

Replace the equal-card grid with a connected flow.

Each stage should have:

- short label;
- small role/status indicator;
- meaningful output;
- visual connector to the next stage.

Suggested stages:

    Task
    Plan
    Build
    Test
    Review
    PR
    Complete
    Done

Each active stage should update the inspector.

## Stage Inspector

The stage inspector should show concise data for the selected/active stage:

- role;
- what happens;
- command/action;
- artifact produced;
- gate or check.

Example:

    Stage: Test
    Role: tester
    Action: verify behavior
    Output: test-report-001.md
    Gate: verify must pass

This is more useful than a long text paragraph.

## Evidence Artifact Rail

Artifacts should appear as visible outputs.

Show file chips/cards such as:

    TASK-0026.yaml
    plan-001.md
    build-report-001.md
    test-report-001.md
    review-report-001.md

During animation:

- each stage activates;
- an artifact chip appears or moves into the evidence rail;
- the inspector updates;
- the final proof state fills.

This makes motion meaningful.

## Final Proof State

At the end, show a compact proof panel:

    main clean
    PR merged
    task completed
    evidence stored
    verify passed

This should be the emotional payoff.

The message:

    The work is not just done. It is auditable.

## Contrast Block

Add a compact "Without Forge / With Forge" comparison.

Without Forge:

- scattered prompts;
- unclear scope;
- untracked edits;
- missing review;
- uncertain done state.

With Forge:

- scoped task;
- staged roles;
- evidence artifacts;
- reviewer gate;
- clean completion.

This block should be visual and concise, not long prose.

## Motion Plan

Motion must explain the workflow.

Use browser-native CSS and JavaScript only.

Planned interactions:

- "Run walkthrough" button starts the story.
- Active node changes in the pipeline.
- Connectors animate between nodes.
- Inspector updates per stage.
- Evidence chips appear as outputs.
- Final proof panel becomes complete.
- User can click any stage to inspect it.
- Reset returns to the first state.

Motion rules:

- smooth but not slow;
- no distracting loops;
- no heavy animation libraries;
- respect `prefers-reduced-motion`;
- page remains understandable if JavaScript is disabled.

## Copywriting Plan

Reduce long explanatory paragraphs.

Use strong concise product copy.

Suggested hero:

    AI can create code fast.
    Forge makes delivery trustworthy.

Supporting line:

    A local-first workflow that turns prompts, edits, reviews, and releases into scoped, auditable engineering evidence.

Alternative shorter line:

    From AI-assisted work to reviewed, verifiable delivery.

Avoid inflated claims.

Do not claim that Forge autonomously writes code or operates as a SaaS product.

## Files to Change

Primary files:

    docs/pages-demo/index.html
    docs/pages-demo/styles.css
    docs/pages-demo/app.js

Possible documentation updates:

    docs/GITHUB_PAGES_DEMO.md
    README.md
    docs/DEMO.md

Task evidence:

    .forge/artifacts/TASK-0026/build-report-001.md
    .forge/artifacts/TASK-0026/test-report-001.md
    .forge/artifacts/TASK-0026/review-report-001.md

No workflow changes are planned.

## Implementation Guidance

The builder should rewrite the current demo structure rather than patching small visual details.

Expected implementation approach:

1. Replace the current hero/card grid layout with the orchestration board.
2. Rebuild HTML around semantic product regions:
   - hero;
   - walkthrough board;
   - input contract;
   - pipeline;
   - inspector;
   - evidence rail;
   - proof panel;
   - contrast block.
3. Rewrite CSS for the light premium visual system.
4. Rewrite JS stage state so it drives:
   - active pipeline node;
   - inspector content;
   - evidence artifact visibility;
   - proof state completion.
5. Keep all links valid from deployed GitHub Pages.
6. Keep the demo static and no-framework.

## Quality Bar

The output should not look like:

- documentation with cards;
- a basic startup landing page;
- a dashboard mockup with random blocks;
- a simple progress bar.

It should look like:

- a premium product walkthrough;
- a visual explanation system;
- a serious engineering product demo;
- something acceptable for portfolio presentation.

## Testing Plan

Tester should verify:

- light palette exists and dark card-grid styling is removed;
- central product walkthrough board exists;
- input task contract is visible;
- lifecycle appears as connected flow;
- stage inspector updates per active stage;
- evidence artifacts are represented visually;
- final proof state is visible;
- "Run walkthrough" or equivalent starts meaningful animation;
- reset behavior works;
- stage click behavior works;
- JavaScript syntax passes;
- reduced-motion support remains;
- responsive behavior exists;
- README/docs links remain valid;
- Pages docs remain accurate;
- no false claims about SaaS, autonomous agents, npm publishing, Telegram approvals, automatic PR creation, or automatic code generation;
- v0.2.2 tag and GitHub Release remain intact;
- Forge status, workflow smoke, and verify pass.

## Acceptance Criteria Mapping

- AC-01: Light premium palette will replace the dark card grid.
- AC-02: Hero and orchestration preview will communicate value quickly.
- AC-03: Main board will show input -> process -> evidence -> result.
- AC-04: Input contract panel will be visible.
- AC-05: Lifecycle will be a connected flow.
- AC-06: Evidence artifacts will appear as workflow outputs.
- AC-07: Final proof panel will show completion evidence.
- AC-08: Motion will drive stage changes, evidence appearance, and proof state.
- AC-09: Long text will be reduced into concise labels and inspector data.
- AC-10: Responsive light product design will be implemented.
- AC-11: Static no-framework GitHub Pages deployment remains.
- AC-12: Accuracy guardrails will be tested.
- AC-13: README/docs links remain valid.
- AC-14: v0.2.2 release integrity will be checked.
- AC-15: Forge checks will pass.

## Risks

### Risk 1 — Design becomes pretty but unclear

Mitigation:

Every animation must correspond to a real workflow concept.

### Risk 2 — Too much text remains

Mitigation:

Move explanation into structured labels, chips, and inspector rows.

### Risk 3 — Too much visual complexity

Mitigation:

Use one main board and a small number of high-quality supporting blocks.

### Risk 4 — Overclaiming product capabilities

Mitigation:

Keep explicit accuracy notes and test forbidden claims.

### Risk 5 — Pages deployment breaks

Mitigation:

Do not change `.github/workflows/pages.yml` in this task.

## Decision

This plan is ready for approval.
