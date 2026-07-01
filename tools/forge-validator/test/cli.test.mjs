import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { renderHelp, resolveCommand } from "../src/cli.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(testDir, "..");
const cliPath = path.join(packageRoot, "src", "cli.mjs");

function runCli(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: packageRoot,
    encoding: "utf8",
  });
}

test("renderHelp includes the concise Forge commands", () => {
  const help = renderHelp();

  assert.match(help, /forge status/);
  assert.match(help, /forge smoke/);
  assert.match(help, /forge verify/);
  assert.match(help, /forge task new/);
  assert.match(help, /forge artifact new/);
});

test("help exits successfully", () => {
  const result = runCli(["help"]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Forge CLI/);
  assert.equal(result.stderr, "");
});

test("unknown command exits non-zero", () => {
  const result = runCli(["does-not-exist"]);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown command 'does-not-exist'/);
});

test("resolveCommand maps status to the existing status script", () => {
  assert.deepEqual(resolveCommand(["status"]), {
    kind: "node-script",
    script: "status.mjs",
    args: [],
  });
});

test("resolveCommand maps smoke to the existing workflow smoke script", () => {
  assert.deepEqual(resolveCommand(["smoke"]), {
    kind: "node-script",
    script: "workflow-smoke.mjs",
    args: [],
  });
});

test("resolveCommand maps verify to the existing package verify script", () => {
  assert.deepEqual(resolveCommand(["verify"]), {
    kind: "package-script",
    command: "pnpm",
    args: ["run", "verify"],
  });
});

test("resolveCommand maps task new and strips the optional separator", () => {
  assert.deepEqual(resolveCommand(["task", "new", "--", "--id", "TASK-1234", "--title", "Example"]), {
    kind: "node-script",
    script: "scaffold-task.mjs",
    args: ["--id", "TASK-1234", "--title", "Example"],
  });
});

test("resolveCommand maps task stage", () => {
  assert.deepEqual(resolveCommand(["task", "stage", "--id", "TASK-1234", "--stage", "planner"]), {
    kind: "node-script",
    script: "stage-task.mjs",
    args: ["--id", "TASK-1234", "--stage", "planner"],
  });
});

test("resolveCommand maps task complete", () => {
  assert.deepEqual(resolveCommand(["task", "complete", "--id", "TASK-1234"]), {
    kind: "node-script",
    script: "complete-task.mjs",
    args: ["--id", "TASK-1234"],
  });
});

test("resolveCommand maps artifact new", () => {
  assert.deepEqual(resolveCommand(["artifact", "new", "--type", "plan"]), {
    kind: "node-script",
    script: "scaffold-artifact.mjs",
    args: ["--type", "plan"],
  });
});

test("forge status dispatches successfully", () => {
  const result = runCli(["status"]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Forge Lifecycle Status/);
});
