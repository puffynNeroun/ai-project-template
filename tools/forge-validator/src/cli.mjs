#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const srcDir = path.dirname(currentFile);
const packageRoot = path.resolve(srcDir, "..");

const scriptByCommand = {
  status: "status.mjs",
  smoke: "workflow-smoke.mjs",
};

const taskScriptByCommand = {
  new: "scaffold-task.mjs",
  stage: "stage-task.mjs",
  complete: "complete-task.mjs",
};

const artifactScriptByCommand = {
  new: "scaffold-artifact.mjs",
};

function stripSeparator(args) {
  if (args[0] === "--") {
    return args.slice(1);
  }

  return args;
}

export function renderHelp() {
  return [
    "Forge CLI",
    "",
    "Usage:",
    "  forge help",
    "  forge status",
    "  forge smoke",
    "  forge verify",
    "  forge task new -- --id TASK-XXXX --title \"Task title\"",
    "  forge task stage -- --id TASK-XXXX --stage planner",
    "  forge task complete -- --id TASK-XXXX",
    "  forge artifact new -- --id TASK-XXXX --type plan",
    "",
    "Notes:",
    "  Existing pnpm scripts remain supported.",
    "  The optional -- separator is accepted for compatibility with current command usage.",
  ].join("\n");
}

export function resolveCommand(rawArgs) {
  const args = stripSeparator(rawArgs);
  const [command, subcommand, ...rest] = args;

  if (!command || command === "help" || command === "-h" || command === "--help") {
    return {
      kind: "help",
    };
  }

  if (command in scriptByCommand) {
    return {
      kind: "node-script",
      script: scriptByCommand[command],
      args: stripSeparator([subcommand, ...rest].filter((value) => value !== undefined)),
    };
  }

  if (command === "verify") {
    return {
      kind: "package-script",
      command: "pnpm",
      args: ["run", "verify", ...stripSeparator([subcommand, ...rest].filter((value) => value !== undefined))],
    };
  }

  if (command === "task") {
    if (!subcommand || subcommand === "help" || subcommand === "-h" || subcommand === "--help") {
      return {
        kind: "error",
        message: "Missing task subcommand. Expected one of: new, stage, complete.",
      };
    }

    if (!(subcommand in taskScriptByCommand)) {
      return {
        kind: "error",
        message: `Unknown task subcommand '${subcommand}'. Expected one of: new, stage, complete.`,
      };
    }

    return {
      kind: "node-script",
      script: taskScriptByCommand[subcommand],
      args: stripSeparator(rest),
    };
  }

  if (command === "artifact") {
    if (!subcommand || subcommand === "help" || subcommand === "-h" || subcommand === "--help") {
      return {
        kind: "error",
        message: "Missing artifact subcommand. Expected: new.",
      };
    }

    if (!(subcommand in artifactScriptByCommand)) {
      return {
        kind: "error",
        message: `Unknown artifact subcommand '${subcommand}'. Expected: new.`,
      };
    }

    return {
      kind: "node-script",
      script: artifactScriptByCommand[subcommand],
      args: stripSeparator(rest),
    };
  }

  return {
    kind: "error",
    message: `Unknown command '${command}'.`,
  };
}

function spawnCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: packageRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });

    child.on("error", (error) => {
      console.error(error.message);
      resolve(1);
    });

    child.on("close", (code) => {
      resolve(code ?? 1);
    });
  });
}

export async function runResolvedCommand(resolved) {
  if (resolved.kind === "help") {
    console.log(renderHelp());
    return 0;
  }

  if (resolved.kind === "error") {
    console.error(resolved.message);
    console.error("");
    console.error(renderHelp());
    return 1;
  }

  if (resolved.kind === "node-script") {
    const scriptPath = path.join(srcDir, resolved.script);

    return spawnCommand(process.execPath, [scriptPath, ...resolved.args]);
  }

  if (resolved.kind === "package-script") {
    return spawnCommand(resolved.command, resolved.args);
  }

  console.error("Internal CLI error: unsupported command resolution.");
  return 1;
}

export async function main(argv = process.argv.slice(2)) {
  return runResolvedCommand(resolveCommand(argv));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main();
}
