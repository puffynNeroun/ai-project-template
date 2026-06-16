# Decisions

Record decisions that affect architecture, product scope, operations, security, or long-term maintenance.

## Entry Template

### YYYY-MM-DD: Decision Title

- Status: Proposed | Accepted | Superseded
- Context:
- Decision:
- Alternatives considered:
- Consequences:
- Follow-up actions:

## Log

Add accepted project decisions here as they are made. Do not backfill history unless it is useful and accurate.

### 2026-06-17: Repository-Tracked Stage Handoff Artifacts

- Status: Accepted
- Context: Planner, Builder, Tester, and Reviewer handoffs need persistent records that are reviewable in the repository without adding runtime orchestration.
- Decision: Store stage handoffs under `.forge/artifacts/TASK-XXXX/<artifact-slug>-NNN.md` using YAML front matter for minimal metadata and Markdown bodies for human-readable content. Supported artifacts are `plan`, `build_report`, `test_report`, and `review_report`.
- Alternatives considered: Keep handoffs only in chat; add validator-enforced schemas immediately; build an orchestration runtime or external state store.
- Consequences: Handoffs become repository-tracked and append-only by policy. Attempts are numbered independently per artifact type. Task YAML remains the source of task status and scope, artifact files are stage handoffs, `docs/TASKS.md` is the human-readable board, Git history is the audit trail, and GitHub pull requests are delivery history.
- Follow-up actions: Keep role artifact permissions narrowly scoped to each role's own new artifact file. Defer validator enforcement, automatic status transitions, orchestration, human approval artifacts, and delivery evidence artifacts.
