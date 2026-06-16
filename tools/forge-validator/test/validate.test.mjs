import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { validateRepository } from '../src/validate.mjs';

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(packageDir, '..', '..');

async function createFixture() {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-validator-'));

  await fs.cp(path.join(repositoryRoot, '.forge'), path.join(fixtureRoot, '.forge'), {
    recursive: true,
  });
  await fs.cp(path.join(repositoryRoot, 'docs'), path.join(fixtureRoot, 'docs'), {
    recursive: true,
  });
  await fs.copyFile(path.join(repositoryRoot, 'AGENTS.md'), path.join(fixtureRoot, 'AGENTS.md'));

  return fixtureRoot;
}

async function withFixture(callback) {
  const fixtureRoot = await createFixture();
  try {
    await callback(fixtureRoot);
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
}

async function readFixtureFile(fixtureRoot, relativePath) {
  return fs.readFile(path.join(fixtureRoot, relativePath), 'utf8');
}

async function writeFixtureFile(fixtureRoot, relativePath, content) {
  await fs.writeFile(path.join(fixtureRoot, relativePath), content);
}

async function assertInvalid(fixtureRoot, expectedMessage) {
  const result = await validateRepository(fixtureRoot);
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), expectedMessage);
}

test('current repository passes', async () => {
  const result = await validateRepository(repositoryRoot);
  assert.deepEqual(result, { ok: true, errors: [] });
});

test('a missing document reference fails', async () => {
  await withFixture(async (fixtureRoot) => {
    const project = await readFixtureFile(fixtureRoot, '.forge/project.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/project.yaml',
      project.replace('docs/PRODUCT_SPEC.md', 'docs/MISSING.md'),
    );

    await assertInvalid(fixtureRoot, /documents\.product_spec does not reference an existing regular file/);
  });
});

test('malformed YAML produces a parse error', async () => {
  await withFixture(async (fixtureRoot) => {
    await writeFixtureFile(fixtureRoot, '.forge/project.yaml', 'schema_version: [\n');
    await assertInvalid(fixtureRoot, /YAML parse error in \.forge\/project\.yaml/);
  });
});

test('an unknown workflow stage target fails', async () => {
  await withFixture(async (fixtureRoot) => {
    const workflow = await readFixtureFile(fixtureRoot, '.forge/workflows/feature.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/workflows/feature.yaml',
      workflow.replace('next: approve_plan', 'next: missing_stage'),
    );

    await assertInvalid(fixtureRoot, /unknown next stage 'missing_stage'/);
  });
});

test('a missing role-contract reference fails', async () => {
  await withFixture(async (fixtureRoot) => {
    const workflow = await readFixtureFile(fixtureRoot, '.forge/workflows/feature.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/workflows/feature.yaml',
      workflow.replace('.forge/roles/planner.md', '.forge/roles/missing.md'),
    );

    await assertInvalid(fixtureRoot, /role_contract does not reference an existing regular file/);
  });
});

test('an active task whose id does not match its filename fails', async () => {
  await withFixture(async (fixtureRoot) => {
    const template = await readFixtureFile(fixtureRoot, '.forge/tasks/task.template.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/tasks/TASK-001.yaml',
      template.replace('id: TASK-XXX', 'id: TASK-002'),
    );

    await assertInvalid(fixtureRoot, /active task id must match filename stem 'TASK-001'/);
  });
});

test('an active task using glob syntax in allowed_files fails', async () => {
  await withFixture(async (fixtureRoot) => {
    const template = await readFixtureFile(fixtureRoot, '.forge/tasks/task.template.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/tasks/TASK-001.yaml',
      template
        .replace('id: TASK-XXX', 'id: TASK-001')
        .replace('allowed_files: []', 'allowed_files:\n  - "src/*.js"'),
    );

    await assertInvalid(fixtureRoot, /allowed_files\[0\] must be an exact path and must not use glob syntax/);
  });
});

test('duplicate acceptance criterion IDs fail', async () => {
  await withFixture(async (fixtureRoot) => {
    const template = await readFixtureFile(fixtureRoot, '.forge/tasks/task.template.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/tasks/TASK-001.yaml',
      template
        .replace('id: TASK-XXX', 'id: TASK-001')
        .replace(
          'acceptance_criteria:\n  - id: AC-1\n    description: Replace with a measurable result.',
          'acceptance_criteria:\n  - id: AC-1\n    description: First result.\n  - id: AC-1\n    description: Second result.',
        ),
    );

    await assertInvalid(fixtureRoot, /acceptance criterion id 'AC-1' is duplicated/);
  });
});

test('an unknown required_checks key fails', async () => {
  await withFixture(async (fixtureRoot) => {
    const template = await readFixtureFile(fixtureRoot, '.forge/tasks/task.template.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/tasks/TASK-001.yaml',
      template
        .replace('id: TASK-XXX', 'id: TASK-001')
        .replace('required_checks: []', 'required_checks:\n  - missing_check'),
    );

    await assertInvalid(fixtureRoot, /required_checks\[0\] references unknown project command key 'missing_check'/);
  });
});

test('a known required check whose command is null remains valid', async () => {
  await withFixture(async (fixtureRoot) => {
    const template = await readFixtureFile(fixtureRoot, '.forge/tasks/task.template.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/tasks/TASK-001.yaml',
      template
        .replace('id: TASK-XXX', 'id: TASK-001')
        .replace('required_checks: []', 'required_checks:\n  - build'),
    );

    const result = await validateRepository(fixtureRoot);
    assert.deepEqual(result, { ok: true, errors: [] });
  });
});

test('a Windows-style traversal path fails', async () => {
  await withFixture(async (fixtureRoot) => {
    const project = await readFixtureFile(fixtureRoot, '.forge/project.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/project.yaml',
      project.replace('docs/PRODUCT_SPEC.md', String.raw`..\outside.md`),
    );

    await assertInvalid(fixtureRoot, /must use forward slashes and must not contain backslashes/);
  });
});

test('an invalid or missing stage actor fails', async () => {
  await withFixture(async (fixtureRoot) => {
    const workflow = await readFixtureFile(fixtureRoot, '.forge/workflows/feature.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/workflows/feature.yaml',
      workflow.replace('id: plan\n    actor: agent', 'id: plan\n    actor: human'),
    );

    await assertInvalid(fixtureRoot, /stage 'plan' actor must be 'agent'/);
  });
});

test('swapping Planner and Builder role contracts fails', async () => {
  await withFixture(async (fixtureRoot) => {
    const workflow = await readFixtureFile(fixtureRoot, '.forge/workflows/feature.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/workflows/feature.yaml',
      workflow
        .replace('role_contract: .forge/roles/planner.md', 'role_contract: __PLANNER__')
        .replace('role_contract: .forge/roles/builder.md', 'role_contract: .forge/roles/planner.md')
        .replace('role_contract: __PLANNER__', 'role_contract: .forge/roles/builder.md'),
    );

    await assertInvalid(fixtureRoot, /stage 'plan' role_contract must be \.forge\/roles\/planner\.md/);
  });
});

test('a task status is checked against the workflow referenced by that task', async () => {
  await withFixture(async (fixtureRoot) => {
    await writeFixtureFile(
      fixtureRoot,
      '.forge/workflows/custom.yaml',
      'task_statuses:\n  - custom_status\n',
    );

    const template = await readFixtureFile(fixtureRoot, '.forge/tasks/task.template.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/tasks/TASK-001.yaml',
      template
        .replace('id: TASK-XXX', 'id: TASK-001')
        .replace('status: proposed', 'status: custom_status')
        .replace('workflow: .forge/workflows/feature.yaml', 'workflow: .forge/workflows/custom.yaml'),
    );

    const result = await validateRepository(fixtureRoot);
    assert.deepEqual(result, { ok: true, errors: [] });
  });
});

test('a task with approved top-level keys in a different order remains valid', async () => {
  await withFixture(async (fixtureRoot) => {
    await writeFixtureFile(
      fixtureRoot,
      '.forge/tasks/TASK-001.yaml',
      `required_checks: []
acceptance_criteria:
  - description: Replace with a measurable result.
    id: AC-1
protected_files: []
allowed_files: []
out_of_scope: []
in_scope: []
goal: Replace with one bounded outcome.
workflow: .forge/workflows/feature.yaml
status: proposed
title: Replace with a concrete task title
id: TASK-001
schema_version: 1
`,
    );

    const result = await validateRepository(fixtureRoot);
    assert.deepEqual(result, { ok: true, errors: [] });
  });
});
