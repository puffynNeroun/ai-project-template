# Forge Project Contract

`.forge` contains the machine-facing project contract for future automation. Intended consumers include humans, repository agents, the future Forge Orchestrator, a CI validator, and Forge Eval.

`.forge` is not application runtime code. `.forge/project.yaml` is the machine-readable source for project document paths and executable commands.

`AGENTS.md` remains the canonical human-readable agent policy. `docs/PRODUCT_SPEC.md`, `docs/TASKS.md`, and `docs/DECISIONS.md` remain the canonical product requirements, backlog, and decision history.

A `null` command means the command is not configured. Agents must not guess, infer, or invent a command when its value is `null`; maintainers should replace `null` only when a real reproducible project command exists.

The four core role contracts live under `.forge/roles/`. They define role-specific responsibilities and handoff boundaries, supplement `AGENTS.md`, and remain human-readable contracts rather than a machine-readable workflow.

`.forge/tasks/` contains task contract documentation and an inactive task template. Active task files follow the `TASK-<number>.yaml` convention.

`.forge/workflows/feature.yaml` defines the machine-readable feature-stage order and human approval gates. Task and workflow files reference role contracts rather than duplicating them.

Formal schema validation, runtime orchestration, artifact persistence, additional workflow types, additional policy files, and CI validation are intentionally deferred.
