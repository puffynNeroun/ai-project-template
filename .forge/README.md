# Forge Project Contract

`.forge` contains the machine-facing project contract for future automation. Intended consumers include humans, repository agents, the future Forge Orchestrator, a CI validator, and Forge Eval.

`.forge` is not application runtime code. `.forge/project.yaml` is the machine-readable source for project document paths and executable commands.

`AGENTS.md` remains the canonical human-readable agent policy. `docs/PRODUCT_SPEC.md`, `docs/TASKS.md`, and `docs/DECISIONS.md` remain the canonical product requirements, backlog, and decision history.

A `null` command means the command is not configured. Agents must not guess, infer, or invent a command when its value is `null`; maintainers should replace `null` only when a real reproducible project command exists.

Roles, workflows, structured tasks, formal schema validation, and additional policy files are intentionally deferred.
