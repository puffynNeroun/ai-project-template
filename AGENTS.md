# Agent Workflow

Follow this workflow for all repository work.

## Before Editing

- Inspect the repository before making changes.
- Read relevant docs and existing files first.
- Plan work that is complex, risky, or spans multiple files.
- Ask for clarification when requirements are ambiguous.

## Project Metadata

- Inspect `.forge/project.yaml` when it exists.
- Treat the manifest as the machine-readable source for document paths and project commands.
- Do not invent or infer commands when a manifest command value is `null`.
- Treat `AGENTS.md` as the authoritative operational and safety policy.
- Treat the referenced product spec, tasks, and decisions documents as authoritative for their respective purposes.

## Safety Rules

- Stay inside this repository unless explicitly instructed otherwise.
- Never expose, print, or log secrets.
- Never edit secret files unless explicitly instructed.
- Avoid installing dependencies without explicit approval.
- Do not commit, push, force-push, rewrite history, deploy, or publish unless explicitly requested.

## Making Changes

- Make narrowly scoped changes that directly serve the request.
- Preserve existing structure and conventions.
- Challenge unnecessary files, tools, or process before adding them.
- Avoid unrelated refactors or formatting churn.

## Before Handoff

- Run relevant checks for the files changed.
- Review `git status`.
- Review `git diff`.
- Summarize changes, checks run, and any remaining risks or assumptions.
