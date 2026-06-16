import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDocument } from 'yaml';

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const defaultRepositoryRoot = path.resolve(packageDir, '..', '..');

const projectPath = '.forge/project.yaml';
const workflowPath = '.forge/workflows/feature.yaml';
const taskTemplatePath = '.forge/tasks/task.template.yaml';
const taskDir = '.forge/tasks';

const requiredProjectDocuments = [
  'product_spec',
  'tasks',
  'decisions',
  'agent_instructions',
];

const requiredProjectCommands = [
  'install',
  'build',
  'typecheck',
  'test',
  'verify',
];

const expectedStatuses = [
  'proposed',
  'approved',
  'in_progress',
  'blocked',
  'ready_for_pr',
  'completed',
];

const expectedStages = [
  'plan',
  'approve_plan',
  'build',
  'test',
  'review',
  'approve_delivery',
];

const expectedStageActors = {
  plan: 'agent',
  approve_plan: 'human',
  build: 'agent',
  test: 'agent',
  review: 'agent',
  approve_delivery: 'human',
};

const expectedStageRoleContracts = {
  plan: '.forge/roles/planner.md',
  build: '.forge/roles/builder.md',
  test: '.forge/roles/tester.md',
  review: '.forge/roles/reviewer.md',
};

const expectedTaskKeys = [
  'schema_version',
  'id',
  'title',
  'status',
  'workflow',
  'goal',
  'in_scope',
  'out_of_scope',
  'allowed_files',
  'protected_files',
  'acceptance_criteria',
  'required_checks',
];

const remoteStageIds = [
  'push',
  'pr',
  'pull_request',
  'pull-request',
  'merge',
  'publish',
  'deploy',
  'release',
];

const remoteStageTokens = new Set(['push', 'pr', 'merge', 'publish', 'deploy', 'release']);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasPathEscape(relativePath) {
  const normalized = path.posix.normalize(relativePath);
  return normalized === '..' || normalized.startsWith('../') || relativePath.split('/').includes('..');
}

function isAbsolutePath(value) {
  return path.isAbsolute(value) || /^[A-Za-z]:[\\/]/.test(value);
}

function validateRepositoryRelativePath(value, label, errors, options = {}) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${label} must be a non-empty repository-relative string.`);
    return false;
  }

  if (value.includes('\\')) {
    errors.push(`${label} must use forward slashes and must not contain backslashes: ${value}`);
    return false;
  }

  if (isAbsolutePath(value)) {
    errors.push(`${label} must not be absolute: ${value}`);
    return false;
  }

  if (hasPathEscape(value)) {
    errors.push(`${label} must not escape the repository through '..': ${value}`);
    return false;
  }

  if (options.exactPath && /[*?\[\]]/.test(value)) {
    errors.push(`${label} must be an exact path and must not use glob syntax: ${value}`);
    return false;
  }

  if (options.exactPath && value.startsWith('!')) {
    errors.push(`${label} must be an exact path and must not use negation syntax: ${value}`);
    return false;
  }

  return true;
}

async function isRegularFile(repositoryRoot, relativePath) {
  try {
    const stat = await fs.stat(path.resolve(repositoryRoot, relativePath));
    return stat.isFile();
  } catch {
    return false;
  }
}

async function parseYamlFile(repositoryRoot, relativePath, errors) {
  const absolutePath = path.resolve(repositoryRoot, relativePath);

  let source;
  try {
    source = await fs.readFile(absolutePath, 'utf8');
  } catch (error) {
    errors.push(`Contract error in ${relativePath}: required file is missing or unreadable (${error.code ?? error.message}).`);
    return null;
  }

  let document;
  try {
    document = parseDocument(source, { prettyErrors: false });
  } catch (error) {
    errors.push(`YAML parse error in ${relativePath}: ${error.message}`);
    return null;
  }

  if (document.errors.length > 0) {
    for (const error of document.errors) {
      errors.push(`YAML parse error in ${relativePath}: ${error.message}`);
    }
    return null;
  }

  return document.toJS();
}

function validateRequiredObject(value, relativePath, errors) {
  if (!isPlainObject(value)) {
    errors.push(`Contract error in ${relativePath}: file must contain a YAML mapping.`);
    return false;
  }
  return true;
}

function compareArray(actual, expected, label, relativePath, errors) {
  if (!Array.isArray(actual)) {
    errors.push(`Contract error in ${relativePath}: ${label} must be an array.`);
    return;
  }

  if (actual.length !== expected.length || actual.some((value, index) => value !== expected[index])) {
    errors.push(`Contract error in ${relativePath}: ${label} must be exactly [${expected.join(', ')}] in that order.`);
  }
}

async function validateProject(repositoryRoot, errors) {
  const project = await parseYamlFile(repositoryRoot, projectPath, errors);
  if (!validateRequiredObject(project, projectPath, errors)) {
    return null;
  }

  for (const key of ['schema_version', 'documents', 'commands']) {
    if (!(key in project)) {
      errors.push(`Contract error in ${projectPath}: missing required key '${key}'.`);
    }
  }

  if (project.schema_version !== 1) {
    errors.push(`Contract error in ${projectPath}: schema_version must be 1.`);
  }

  if (!isPlainObject(project.documents)) {
    errors.push(`Contract error in ${projectPath}: documents must be a mapping.`);
  } else {
    for (const key of requiredProjectDocuments) {
      if (!(key in project.documents)) {
        errors.push(`Contract error in ${projectPath}: documents.${key} is required.`);
        continue;
      }

      const value = project.documents[key];
      const label = `${projectPath}: documents.${key}`;
      if (validateRepositoryRelativePath(value, label, errors) && !(await isRegularFile(repositoryRoot, value))) {
        errors.push(`Contract error in ${projectPath}: documents.${key} does not reference an existing regular file: ${value}`);
      }
    }
  }

  if (!isPlainObject(project.commands)) {
    errors.push(`Contract error in ${projectPath}: commands must be a mapping.`);
  } else {
    for (const key of requiredProjectCommands) {
      if (!(key in project.commands)) {
        errors.push(`Contract error in ${projectPath}: commands.${key} is required.`);
        continue;
      }

      const value = project.commands[key];
      if (value !== null && (typeof value !== 'string' || value.trim() === '')) {
        errors.push(`Contract error in ${projectPath}: commands.${key} must be a non-empty string or null.`);
      }
    }
  }

  return project;
}

function visitNested(value, visitor) {
  if (Array.isArray(value)) {
    for (const item of value) {
      visitNested(item, visitor);
    }
    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    visitor(key, child);
    visitNested(child, visitor);
  }
}

async function validateWorkflow(repositoryRoot, errors) {
  const workflow = await parseYamlFile(repositoryRoot, workflowPath, errors);
  if (!validateRequiredObject(workflow, workflowPath, errors)) {
    return null;
  }

  if (workflow.schema_version !== 1) {
    errors.push(`Contract error in ${workflowPath}: schema_version must be 1.`);
  }

  if (workflow.id !== 'feature') {
    errors.push(`Contract error in ${workflowPath}: id must be 'feature'.`);
  }

  compareArray(workflow.task_statuses, expectedStatuses, 'task_statuses', workflowPath, errors);

  const stages = Array.isArray(workflow.stages) ? workflow.stages : [];
  if (!Array.isArray(workflow.stages)) {
    errors.push(`Contract error in ${workflowPath}: stages must be an array.`);
  }

  const stageIds = stages.map((stage) => (isPlainObject(stage) ? stage.id : undefined));
  compareArray(stageIds, expectedStages, 'stage IDs', workflowPath, errors);

  const stageIdSet = new Set();
  for (const stageId of stageIds) {
    if (stageIdSet.has(stageId)) {
      errors.push(`Contract error in ${workflowPath}: stage id '${stageId}' is duplicated.`);
    }
    stageIdSet.add(stageId);
  }

  const statusSet = new Set(Array.isArray(workflow.task_statuses) ? workflow.task_statuses : []);

  for (const [index, stage] of stages.entries()) {
    if (!isPlainObject(stage)) {
      errors.push(`Contract error in ${workflowPath}: stages[${index}] must be a mapping.`);
      continue;
    }

    const stageLabel = `stage '${stage.id ?? index}'`;
    const expectedActor = expectedStageActors[stage.id];
    if (stage.actor !== expectedActor) {
      errors.push(`Contract error in ${workflowPath}: ${stageLabel} actor must be '${expectedActor}'.`);
    }

    if (typeof stage.id === 'string') {
      const stageId = stage.id.toLowerCase();
      const stageTokens = stageId.split(/[^a-z0-9]+/).filter(Boolean);
      if (remoteStageIds.includes(stageId) || stageTokens.some((token) => remoteStageTokens.has(token))) {
        errors.push(`Contract error in ${workflowPath}: ${stageLabel} appears to define a remote-operation stage.`);
      }
    }

    const expectedRoleContract = expectedStageRoleContracts[stage.id];
    if (expectedRoleContract) {
      if (!('role_contract' in stage)) {
        errors.push(`Contract error in ${workflowPath}: ${stageLabel} must use role_contract ${expectedRoleContract}.`);
      } else if (stage.role_contract !== expectedRoleContract) {
        errors.push(`Contract error in ${workflowPath}: ${stageLabel} role_contract must be ${expectedRoleContract}.`);
      }
    }

    if (expectedActor === 'human' && 'role_contract' in stage) {
      errors.push(`Contract error in ${workflowPath}: human ${stageLabel} must not define a role_contract.`);
    }

    if ('role_contract' in stage) {
      const label = `${workflowPath}: ${stageLabel} role_contract`;
      if (validateRepositoryRelativePath(stage.role_contract, label, errors)) {
        if (!(await isRegularFile(repositoryRoot, stage.role_contract))) {
          errors.push(`Contract error in ${workflowPath}: ${stageLabel} role_contract does not reference an existing regular file: ${stage.role_contract}`);
        }
      }
    }

    if (Array.isArray(stage.allowed_statuses)) {
      for (const status of stage.allowed_statuses) {
        if (!statusSet.has(status)) {
          errors.push(`Contract error in ${workflowPath}: ${stageLabel} references unknown status '${status}'.`);
        }
      }
    }

    visitNested(stage, (key, value) => {
      if (key === 'next' && !stageIdSet.has(value)) {
        errors.push(`Contract error in ${workflowPath}: ${stageLabel} references unknown next stage '${value}'.`);
      }

      if ((key === 'status' || key === 'sets_status') && !statusSet.has(value)) {
        errors.push(`Contract error in ${workflowPath}: ${stageLabel} references unknown status '${value}'.`);
      }

      if ((key === 'status' || key === 'sets_status') && value === 'completed') {
        errors.push(`Contract error in ${workflowPath}: ${stageLabel} must not automatically assign completed.`);
      }

      if (stage.actor === 'agent' && (key === 'status' || key === 'sets_status') && value === 'ready_for_pr') {
        errors.push(`Contract error in ${workflowPath}: agent ${stageLabel} must not assign ready_for_pr.`);
      }
    });
  }

  const approveDelivery = stages.find((stage) => isPlainObject(stage) && stage.id === 'approve_delivery');
  if (approveDelivery?.on_approve?.status !== 'ready_for_pr') {
    errors.push(`Contract error in ${workflowPath}: terminal delivery approval must set status ready_for_pr.`);
  }

  return workflow;
}

async function discoverTaskFiles(repositoryRoot, errors) {
  const directory = path.resolve(repositoryRoot, taskDir);
  let entries;
  try {
    entries = await fs.readdir(directory);
  } catch (error) {
    errors.push(`Contract error in ${taskDir}: task directory is missing or unreadable (${error.code ?? error.message}).`);
    return [taskTemplatePath];
  }

  const activeTaskFiles = entries
    .filter((entry) => entry.startsWith('TASK-') && entry.endsWith('.yaml'))
    .sort()
    .map((entry) => `${taskDir}/${entry}`);

  return [taskTemplatePath, ...activeTaskFiles];
}

function validateTaskKeySet(task, taskPath, errors) {
  const actualKeys = Object.keys(task);
  const expectedKeySet = new Set(expectedTaskKeys);
  const actualKeySet = new Set(actualKeys);
  const missingKeys = expectedTaskKeys.filter((key) => !actualKeySet.has(key));
  const unexpectedKeys = actualKeys.filter((key) => !expectedKeySet.has(key)).sort();

  for (const key of missingKeys) {
    errors.push(`Contract error in ${taskPath}: missing top-level key '${key}'.`);
  }

  for (const key of unexpectedKeys) {
    errors.push(`Contract error in ${taskPath}: unexpected top-level key '${key}'.`);
  }
}

async function getTaskWorkflow(repositoryRoot, taskPath, task, canonicalWorkflow, errors) {
  if (!validateRepositoryRelativePath(task.workflow, `${taskPath}: workflow`, errors)) {
    return null;
  }

  if (!(await isRegularFile(repositoryRoot, task.workflow))) {
    errors.push(`Contract error in ${taskPath}: workflow does not reference an existing regular file: ${task.workflow}`);
    return null;
  }

  const taskWorkflow = task.workflow === workflowPath
    ? canonicalWorkflow
    : await parseYamlFile(repositoryRoot, task.workflow, errors);

  if (!validateRequiredObject(taskWorkflow, task.workflow, errors)) {
    return null;
  }

  if (!Array.isArray(taskWorkflow.task_statuses)) {
    errors.push(`Contract error in ${task.workflow}: task_statuses must be an array.`);
    return null;
  }

  return taskWorkflow;
}

async function validateTask(repositoryRoot, taskPath, workflow, project, errors) {
  const task = await parseYamlFile(repositoryRoot, taskPath, errors);
  if (!validateRequiredObject(task, taskPath, errors)) {
    return;
  }

  validateTaskKeySet(task, taskPath, errors);

  if (task.schema_version !== 1) {
    errors.push(`Contract error in ${taskPath}: schema_version must be 1.`);
  }

  const isTemplate = taskPath === taskTemplatePath;
  const filename = path.basename(taskPath);
  const stem = filename.slice(0, -'.yaml'.length);

  if (isTemplate) {
    if (task.id !== 'TASK-XXX') {
      errors.push(`Contract error in ${taskPath}: template id must be TASK-XXX.`);
    }
    if (task.status !== 'proposed') {
      errors.push(`Contract error in ${taskPath}: template status must be proposed.`);
    }
  } else {
    if (!/^TASK-\d+\.yaml$/.test(filename)) {
      errors.push(`Contract error in ${taskPath}: active task filename must match TASK-<number>.yaml.`);
    }
    if (task.id !== stem) {
      errors.push(`Contract error in ${taskPath}: active task id must match filename stem '${stem}'.`);
    }
  }

  for (const key of ['title', 'goal']) {
    if (typeof task[key] !== 'string' || task[key].trim() === '') {
      errors.push(`Contract error in ${taskPath}: ${key} must be a non-empty string.`);
    }
  }

  const taskWorkflow = await getTaskWorkflow(repositoryRoot, taskPath, task, workflow, errors);
  const statuses = new Set(Array.isArray(taskWorkflow?.task_statuses) ? taskWorkflow.task_statuses : []);
  if (!statuses.has(task.status)) {
    errors.push(`Contract error in ${taskPath}: status '${task.status}' is not listed in the referenced workflow task_statuses.`);
  }

  for (const key of ['in_scope', 'out_of_scope', 'allowed_files', 'protected_files', 'required_checks']) {
    if (!Array.isArray(task[key])) {
      errors.push(`Contract error in ${taskPath}: ${key} must be an array.`);
    }
  }

  for (const key of ['allowed_files', 'protected_files']) {
    if (Array.isArray(task[key])) {
      for (const [index, value] of task[key].entries()) {
        validateRepositoryRelativePath(value, `${taskPath}: ${key}[${index}]`, errors, { exactPath: true });
      }
    }
  }

  if (!Array.isArray(task.acceptance_criteria) || task.acceptance_criteria.length === 0) {
    errors.push(`Contract error in ${taskPath}: acceptance_criteria must be a non-empty array.`);
  } else {
    const acceptanceIds = new Set();
    for (const [index, criterion] of task.acceptance_criteria.entries()) {
      if (!isPlainObject(criterion)) {
        errors.push(`Contract error in ${taskPath}: acceptance_criteria[${index}] must be a mapping.`);
        continue;
      }

      for (const key of ['id', 'description']) {
        if (typeof criterion[key] !== 'string' || criterion[key].trim() === '') {
          errors.push(`Contract error in ${taskPath}: acceptance_criteria[${index}].${key} must be a non-empty string.`);
        }
      }

      if (typeof criterion.id === 'string') {
        if (acceptanceIds.has(criterion.id)) {
          errors.push(`Contract error in ${taskPath}: acceptance criterion id '${criterion.id}' is duplicated.`);
        }
        acceptanceIds.add(criterion.id);
      }
    }
  }

  const commandKeys = new Set(Object.keys(isPlainObject(project?.commands) ? project.commands : {}));
  if (Array.isArray(task.required_checks)) {
    for (const [index, check] of task.required_checks.entries()) {
      if (!commandKeys.has(check)) {
        errors.push(`Contract error in ${taskPath}: required_checks[${index}] references unknown project command key '${check}'.`);
      }
    }
  }
}

async function validateTasks(repositoryRoot, workflow, project, errors) {
  const taskFiles = await discoverTaskFiles(repositoryRoot, errors);
  for (const taskPath of taskFiles) {
    await validateTask(repositoryRoot, taskPath, workflow, project, errors);
  }
}

export async function validateRepository(repositoryRoot = defaultRepositoryRoot) {
  const resolvedRoot = path.resolve(repositoryRoot);
  const errors = [];

  const project = await validateProject(resolvedRoot, errors);
  const workflow = await validateWorkflow(resolvedRoot, errors);
  await validateTasks(resolvedRoot, workflow, project, errors);

  return {
    ok: errors.length === 0,
    errors: [...errors].sort(),
  };
}

export async function runCli(argv = process.argv) {
  const repositoryRoot = argv[2] ? path.resolve(argv[2]) : defaultRepositoryRoot;
  const result = await validateRepository(repositoryRoot);

  if (result.ok) {
    console.log('Forge contract validation passed.');
    return 0;
  }

  console.error(`Forge contract validation failed with ${result.errors.length} error(s):`);
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  return 1;
}

function isDirectExecution() {
  if (!process.argv[1]) {
    return false;
  }
  return import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
}

if (isDirectExecution()) {
  process.exitCode = await runCli(process.argv);
}
