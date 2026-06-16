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
  await fs.mkdir(path.dirname(path.join(fixtureRoot, relativePath)), { recursive: true });
  await fs.writeFile(path.join(fixtureRoot, relativePath), content);
}

async function removeFixturePath(fixtureRoot, relativePath) {
  await fs.rm(path.join(fixtureRoot, relativePath), { recursive: true, force: true });
}

function artifactContent(metadata, body = '# Artifact\n') {
  const lines = ['---'];

  for (const [key, value] of Object.entries(metadata)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${item}`);
        }
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push('---', '', body);
  return `${lines.join('\n')}\n`;
}

function planMetadata(overrides = {}) {
  return {
    schema_version: 1,
    task_id: 'TASK-0003',
    artifact_type: 'plan',
    attempt: 3,
    producing_role: 'planner',
    outcome: 'READY_FOR_APPROVAL',
    input_artifacts: [],
    ...overrides,
  };
}

function buildReportMetadata(overrides = {}) {
  return {
    schema_version: 1,
    task_id: 'TASK-0003',
    artifact_type: 'build_report',
    attempt: 1,
    producing_role: 'builder',
    outcome: 'READY_FOR_TEST',
    input_artifacts: ['.forge/artifacts/TASK-0003/plan-002.md'],
    ...overrides,
  };
}

function testReportMetadata(overrides = {}) {
  return {
    schema_version: 1,
    task_id: 'TASK-0003',
    artifact_type: 'test_report',
    attempt: 1,
    producing_role: 'tester',
    outcome: 'PASS',
    input_artifacts: [
      '.forge/artifacts/TASK-0003/plan-002.md',
      '.forge/artifacts/TASK-0003/build-report-001.md',
    ],
    ...overrides,
  };
}

function reviewReportMetadata(overrides = {}) {
  return {
    schema_version: 1,
    task_id: 'TASK-0003',
    artifact_type: 'review_report',
    attempt: 1,
    producing_role: 'reviewer',
    outcome: 'ACCEPT',
    input_artifacts: [
      '.forge/artifacts/TASK-0003/plan-002.md',
      '.forge/artifacts/TASK-0003/build-report-001.md',
      '.forge/artifacts/TASK-0003/test-report-001.md',
    ],
    ...overrides,
  };
}

async function writeArtifact(fixtureRoot, relativePath, metadata, body) {
  await writeFixtureFile(fixtureRoot, relativePath, artifactContent(metadata, body));
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

test('artifact absence remains valid', async () => {
  await withFixture(async (fixtureRoot) => {
    await removeFixturePath(fixtureRoot, '.forge/artifacts/TASK-0003');

    const result = await validateRepository(fixtureRoot);
    assert.deepEqual(result, { ok: true, errors: [] });
  });
});

test('a valid live plan artifact passes', async () => {
  await withFixture(async (fixtureRoot) => {
    await writeArtifact(
      fixtureRoot,
      '.forge/artifacts/TASK-0003/plan-003.md',
      planMetadata(),
    );

    const result = await validateRepository(fixtureRoot);
    assert.deepEqual(result, { ok: true, errors: [] });
  });
});

test('a valid complete live artifact chain passes', async () => {
  await withFixture(async (fixtureRoot) => {
    await writeArtifact(
      fixtureRoot,
      '.forge/artifacts/TASK-0003/build-report-001.md',
      buildReportMetadata(),
    );
    await writeArtifact(
      fixtureRoot,
      '.forge/artifacts/TASK-0003/test-report-001.md',
      testReportMetadata(),
    );
    await writeArtifact(
      fixtureRoot,
      '.forge/artifacts/TASK-0003/review-report-001.md',
      reviewReportMetadata(),
    );

    const result = await validateRepository(fixtureRoot);
    assert.deepEqual(result, { ok: true, errors: [] });
  });
});

test('artifact metadata keys may appear in any order', async () => {
  await withFixture(async (fixtureRoot) => {
    await writeArtifact(
      fixtureRoot,
      '.forge/artifacts/TASK-0003/plan-003.md',
      {
        input_artifacts: [],
        outcome: 'READY_FOR_APPROVAL',
        producing_role: 'planner',
        attempt: 3,
        artifact_type: 'plan',
        task_id: 'TASK-0003',
        schema_version: 1,
      },
    );

    const result = await validateRepository(fixtureRoot);
    assert.deepEqual(result, { ok: true, errors: [] });
  });
});

test('README and templates under artifacts are not live artifacts', async () => {
  await withFixture(async (fixtureRoot) => {
    await writeFixtureFile(fixtureRoot, '.forge/artifacts/README.md', 'not front matter');
    await writeFixtureFile(fixtureRoot, '.forge/artifacts/templates/bad.md', 'not front matter');

    const result = await validateRepository(fixtureRoot);
    assert.deepEqual(result, { ok: true, errors: [] });
  });
});

const artifactDiscoveryFailures = [
  {
    name: 'unsupported artifact-root file',
    path: '.forge/artifacts/notes.md',
    content: 'notes',
    expected: /unsupported direct artifact entry 'notes\.md'/,
  },
  {
    name: 'unsupported artifact task directory',
    path: '.forge/artifacts/TASK-ABC/plan-001.md',
    content: artifactContent(planMetadata({ task_id: 'TASK-ABC', attempt: 1 })),
    expected: /unsupported artifact task directory 'TASK-ABC'/,
  },
  {
    name: 'missing task contract',
    path: '.forge/artifacts/TASK-9999/plan-001.md',
    content: artifactContent(planMetadata({ task_id: 'TASK-9999', attempt: 1 })),
    expected: /artifact task directory has no matching task contract \.forge\/tasks\/TASK-9999\.yaml/,
  },
  {
    name: 'nested artifact directory',
    path: '.forge/artifacts/TASK-0003/nested/file.md',
    content: 'nested',
    expected: /live artifact task directories must contain only direct artifact files/,
  },
];

for (const { name, path: artifactPath, content, expected } of artifactDiscoveryFailures) {
  test(`artifact discovery rejects ${name}`, async () => {
    await withFixture(async (fixtureRoot) => {
      await writeFixtureFile(fixtureRoot, artifactPath, content);
      await assertInvalid(fixtureRoot, expected);
    });
  });
}

const artifactFilenameFailures = [
  {
    name: 'unsupported slug',
    path: '.forge/artifacts/TASK-0003/deploy-001.md',
    expected: /unsupported slug 'deploy'/,
  },
  {
    name: 'invalid attempt width',
    path: '.forge/artifacts/TASK-0003/plan-1.md',
    expected: /attempt suffix must be exactly three digits/,
  },
  {
    name: 'attempt zero',
    path: '.forge/artifacts/TASK-0003/plan-000.md',
    expected: /attempt suffix must be a positive attempt/,
  },
  {
    name: 'wrong extension',
    path: '.forge/artifacts/TASK-0003/plan-003.txt',
    expected: /artifact filename must match <artifact-slug>-NNN\.md/,
  },
];

for (const { name, path: artifactPath, expected } of artifactFilenameFailures) {
  test(`artifact filename rejects ${name}`, async () => {
    await withFixture(async (fixtureRoot) => {
      await writeFixtureFile(fixtureRoot, artifactPath, artifactContent(planMetadata()));
      await assertInvalid(fixtureRoot, expected);
    });
  });
}

const frontMatterFailures = [
  {
    name: 'missing opening delimiter',
    content: 'schema_version: 1\n---\n',
    expected: /must start with YAML front matter delimiter/,
  },
  {
    name: 'missing closing delimiter',
    content: '---\nschema_version: 1\n',
    expected: /front matter is missing closing delimiter/,
  },
  {
    name: 'malformed YAML',
    content: '---\nschema_version: [\n---\n',
    expected: /YAML parse error in \.forge\/artifacts\/TASK-0003\/plan-003\.md front matter/,
  },
  {
    name: 'non-mapping front matter',
    content: '---\n- 1\n---\n',
    expected: /front matter must contain a YAML mapping/,
  },
];

for (const { name, content, expected } of frontMatterFailures) {
  test(`artifact front matter rejects ${name}`, async () => {
    await withFixture(async (fixtureRoot) => {
      await writeFixtureFile(fixtureRoot, '.forge/artifacts/TASK-0003/plan-003.md', content);
      await assertInvalid(fixtureRoot, expected);
    });
  });
}

const artifactMetadataFailures = [
  {
    name: 'missing metadata field',
    metadata: (() => {
      const metadata = planMetadata();
      delete metadata.outcome;
      return metadata;
    })(),
    expected: /missing artifact metadata key 'outcome'/,
  },
  {
    name: 'unexpected metadata field',
    metadata: planMetadata({ produced_at: '2026-06-17T00:00:00Z' }),
    expected: /unexpected artifact metadata key 'produced_at'/,
  },
  {
    name: 'mismatched task ID',
    metadata: planMetadata({ task_id: 'TASK-9999' }),
    expected: /task_id must match artifact task directory 'TASK-0003'/,
  },
  {
    name: 'mismatched artifact type',
    metadata: planMetadata({ artifact_type: 'build_report' }),
    expected: /artifact_type must be 'plan' for filename slug 'plan'/,
  },
  {
    name: 'mismatched attempt',
    metadata: planMetadata({ attempt: 4 }),
    expected: /attempt must match filename suffix 3/,
  },
  {
    name: 'wrong producing role',
    metadata: planMetadata({ producing_role: 'builder' }),
    expected: /producing_role must be 'planner' for artifact_type 'plan'/,
  },
  {
    name: 'invalid outcome',
    metadata: planMetadata({ outcome: 'PASS' }),
    expected: /outcome must be one of \[READY_FOR_APPROVAL, BLOCKED\]/,
  },
];

for (const { name, metadata, expected } of artifactMetadataFailures) {
  test(`artifact metadata rejects ${name}`, async () => {
    await withFixture(async (fixtureRoot) => {
      await writeArtifact(fixtureRoot, '.forge/artifacts/TASK-0003/plan-003.md', metadata);
      await assertInvalid(fixtureRoot, expected);
    });
  });
}

test('artifact metadata rejects non-array inputs', async () => {
  await withFixture(async (fixtureRoot) => {
    await writeFixtureFile(
      fixtureRoot,
      '.forge/artifacts/TASK-0003/build-report-001.md',
      `---
schema_version: 1
task_id: TASK-0003
artifact_type: build_report
attempt: 1
producing_role: builder
outcome: READY_FOR_TEST
input_artifacts: .forge/artifacts/TASK-0003/plan-002.md
---
`,
    );

    await assertInvalid(fixtureRoot, /input_artifacts must be an array/);
  });
});

const artifactInputFailures = [
  {
    name: 'non-string input',
    inputs: [123],
    expected: /input_artifacts\[0\] must be a repository-relative string/,
  },
  {
    name: 'absolute path',
    inputs: ['/tmp/plan-001.md'],
    expected: /must not be absolute/,
  },
  {
    name: 'backslash path',
    inputs: [String.raw`.forge\artifacts\TASK-0003\plan-002.md`],
    expected: /must use forward slashes and must not contain backslashes/,
  },
  {
    name: 'traversal',
    inputs: ['.forge/artifacts/TASK-0003/../TASK-0003/plan-002.md'],
    expected: /must not escape the repository through '\.\.'/,
  },
  {
    name: 'missing artifact input',
    inputs: ['.forge/artifacts/TASK-0003/plan-999.md'],
    expected: /does not reference an existing discovered live artifact file/,
  },
  {
    name: 'self-reference',
    inputs: ['.forge/artifacts/TASK-0003/build-report-001.md'],
    expected: /must not reference the current artifact/,
  },
  {
    name: 'duplicate input',
    inputs: [
      '.forge/artifacts/TASK-0003/plan-002.md',
      '.forge/artifacts/TASK-0003/plan-002.md',
    ],
    expected: /duplicates '\.forge\/artifacts\/TASK-0003\/plan-002\.md'/,
  },
  {
    name: 'build report without plan input',
    inputs: [],
    expected: /build_report artifacts must reference at least one plan artifact/,
  },
];

for (const { name, inputs, expected } of artifactInputFailures) {
  test(`artifact inputs reject ${name}`, async () => {
    await withFixture(async (fixtureRoot) => {
      await writeArtifact(
        fixtureRoot,
        '.forge/artifacts/TASK-0003/build-report-001.md',
        buildReportMetadata({ input_artifacts: inputs }),
      );
      await assertInvalid(fixtureRoot, expected);
    });
  });
}

test('artifact inputs reject other-task input paths', async () => {
  await withFixture(async (fixtureRoot) => {
    const task = await readFixtureFile(fixtureRoot, '.forge/tasks/TASK-0003.yaml');
    await writeFixtureFile(
      fixtureRoot,
      '.forge/tasks/TASK-0004.yaml',
      task.replace('id: TASK-0003', 'id: TASK-0004'),
    );
    await writeArtifact(
      fixtureRoot,
      '.forge/artifacts/TASK-0004/plan-001.md',
      planMetadata({ task_id: 'TASK-0004', attempt: 1 }),
    );
    await writeArtifact(
      fixtureRoot,
      '.forge/artifacts/TASK-0003/build-report-001.md',
      buildReportMetadata({ input_artifacts: ['.forge/artifacts/TASK-0004/plan-001.md'] }),
    );

    await assertInvalid(fixtureRoot, /must reference an artifact in \.forge\/artifacts\/TASK-0003\//);
  });
});

test('test reports must reference a build report', async () => {
  await withFixture(async (fixtureRoot) => {
    await writeArtifact(
      fixtureRoot,
      '.forge/artifacts/TASK-0003/test-report-001.md',
      testReportMetadata({ input_artifacts: ['.forge/artifacts/TASK-0003/plan-002.md'] }),
    );

    await assertInvalid(fixtureRoot, /test_report artifacts must reference at least one build_report artifact/);
  });
});

test('review reports must reference a test report', async () => {
  await withFixture(async (fixtureRoot) => {
    await writeArtifact(
      fixtureRoot,
      '.forge/artifacts/TASK-0003/build-report-001.md',
      buildReportMetadata(),
    );
    await writeArtifact(
      fixtureRoot,
      '.forge/artifacts/TASK-0003/review-report-001.md',
      reviewReportMetadata({
        input_artifacts: [
          '.forge/artifacts/TASK-0003/plan-002.md',
          '.forge/artifacts/TASK-0003/build-report-001.md',
        ],
      }),
    );

    await assertInvalid(fixtureRoot, /review_report artifacts must reference at least one test_report artifact/);
  });
});
