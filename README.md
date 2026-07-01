# Project Template

A minimal documentation template for starting a new software project with clear intent, task tracking, decision history, and safe agent guidance.

## Copy Into a New Project

Copy the template without carrying over this repository's Git history:

```sh
mkdir -p /path/to/new-project
rsync -a --exclude='.git' /path/to/ai-project-template/ /path/to/new-project/
cd /path/to/new-project
git init
```

If this is hosted as a Git template repository, you can also create a new project using the platform's "Use this template" function.

Then update the project name, product details, and tasks before adding application code or tooling.

## Complete First

1. `docs/PRODUCT_SPEC.md` - define the problem, users, goals, requirements, constraints, risks, and acceptance criteria.
2. `docs/TASKS.md` - capture the first useful work in `Now`, `Next`, and `Later`.
3. `docs/DECISIONS.md` - record important choices as they are made.
4. `.forge/project.yaml` - verify the referenced document paths, replace command values only with real reproducible commands, and leave unavailable commands as `null`.
5. `AGENTS.md` - review the repository workflow before using automation or AI agents.

## Expected Workflow

Use this loop for project work:

1. Inspect the repository and relevant documents.
2. Plan work that is complex, risky, or spans multiple files.
3. Edit only the files needed for the task.
4. Run relevant checks.
5. Review `git status` and `git diff` before handing off.

Do not commit, push, deploy, or install dependencies unless explicitly requested.

## Forge CLI

Forge Validator can still be run with the existing pnpm scripts, but the package now exposes a concise `forge` bin entrypoint for local CLI usage.

Examples:

- `forge status`
- `forge smoke`
- `forge verify`
- `forge task new -- --id TASK-XXXX --title "Task title"`
- `forge task stage -- --id TASK-XXXX --stage planner`
- `forge task complete -- --id TASK-XXXX`
- `forge artifact new -- --id TASK-XXXX --type plan`

The existing commands remain supported for backward compatibility:

- `pnpm -C tools/forge-validator run status`
- `pnpm -C tools/forge-validator run workflow:smoke`
- `pnpm -C tools/forge-validator verify`
