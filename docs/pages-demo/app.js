const stages = [
  {
    title: "Scope",
    state: "scope locked",
    owner: "Task author",
    purpose: "Lock scope and claims",
    output: "TASK-0026.yaml",
    gate: "Allowed files declared",
    coreTitle: "Scope locked",
    coreCopy: "Work starts as a contract, not a loose prompt trail.",
    terminalStatus: "scoping",
    proofs: ["scope"],
    logs: [
      "$ forge task:new --id TASK-0026",
      "created .forge/tasks/TASK-0026.yaml",
      "allowed files: docs/pages-demo/index.html, styles.css, app.js",
      "guardrails recorded: no SaaS, no agent-runner claims",
      "status: in_progress"
    ]
  },
  {
    title: "Plan",
    state: "plan approved",
    owner: "Planner",
    purpose: "Convert goal into a bounded path",
    output: "plan-001.md",
    gate: "Plan matches task contract",
    coreTitle: "Path selected",
    coreCopy: "The walkthrough has a design direction before implementation begins.",
    terminalStatus: "planning",
    proofs: ["scope"],
    logs: [
      "$ forge artifact:new --type plan --task TASK-0026",
      "created .forge/artifacts/TASK-0026/plan-001.md",
      "story: input -> process -> evidence -> final proof",
      "status: READY_FOR_APPROVAL"
    ]
  },
  {
    title: "Build",
    state: "build recorded",
    owner: "Builder",
    purpose: "Rewrite the static product demo",
    output: "build-report-001.md",
    gate: "Only allowed files changed",
    coreTitle: "Implementation bounded",
    coreCopy: "The product surface changes while the task contract keeps the blast radius visible.",
    terminalStatus: "building",
    proofs: ["scope"],
    logs: [
      "$ forge task:stage --stage builder",
      "updated docs/pages-demo/index.html",
      "updated docs/pages-demo/styles.css",
      "updated docs/pages-demo/app.js",
      "recorded build-report-001.md"
    ]
  },
  {
    title: "Test",
    state: "checks passing",
    owner: "Tester",
    purpose: "Verify syntax and Forge contracts",
    output: "test-report-001.md",
    gate: "Required checks pass",
    coreTitle: "Verification gate",
    coreCopy: "The workflow moves only after the local evidence can be checked.",
    terminalStatus: "verifying",
    proofs: ["scope", "checks"],
    logs: [
      "$ node --check docs/pages-demo/app.js",
      "JavaScript syntax passed",
      "$ pnpm -C tools/forge-validator verify",
      "Forge contract validation passed"
    ]
  },
  {
    title: "Review",
    state: "review accepted",
    owner: "Reviewer",
    purpose: "Inspect evidence before delivery",
    output: "review-report-001.md",
    gate: "Reviewer accepts the change",
    coreTitle: "Human gate passed",
    coreCopy: "The review decision becomes part of the task evidence, not a memory of chat.",
    terminalStatus: "reviewing",
    proofs: ["scope", "checks", "review"],
    logs: [
      "$ forge task:stage --stage reviewer",
      "read plan, build, and test evidence",
      "checked accuracy boundaries",
      "outcome: ACCEPT"
    ]
  },
  {
    title: "Impl PR",
    state: "implementation merged",
    owner: "Maintainer",
    purpose: "Merge reviewed implementation",
    output: "implementation PR",
    gate: "CI green before merge",
    coreTitle: "Delivery history",
    coreCopy: "A maintainer-owned PR records how the reviewed implementation entered main.",
    terminalStatus: "delivery",
    proofs: ["scope", "checks", "review", "pr"],
    logs: [
      "maintainer opens implementation PR",
      "GitHub checks: Forge Contracts passed",
      "review evidence linked in PR body",
      "implementation PR merged by maintainer"
    ]
  },
  {
    title: "Complete PR",
    state: "completion recorded",
    owner: "Maintainer",
    purpose: "Archive the completed task state",
    output: "completion PR",
    gate: "Task completion recorded",
    coreTitle: "Lifecycle closing",
    coreCopy: "Completion evidence is delivered separately from the implementation itself.",
    terminalStatus: "closing",
    proofs: ["scope", "checks", "review", "pr", "completion"],
    logs: [
      "$ forge task:complete --id TASK-0026",
      "task status: completed",
      "completion PR records lifecycle closeout",
      "task archive merged by maintainer"
    ]
  },
  {
    title: "Done",
    state: "auditable final state",
    owner: "Repository",
    purpose: "Leave a clean, inspectable trail",
    output: "clean main + stored evidence",
    gate: "No active task remains",
    coreTitle: "Auditable final state",
    coreCopy: "The work is not just done. It is inspectable after the fact.",
    terminalStatus: "complete",
    proofs: ["scope", "checks", "review", "pr", "completion", "clean"],
    logs: [
      "$ forge status",
      "active task: none",
      "stored evidence: task, plan, build, test, review",
      "$ git status --short",
      "working tree clean"
    ]
  }
];

const stageNodes = Array.from(document.querySelectorAll("[data-stage]"));
const signalPaths = Array.from(document.querySelectorAll("[data-link]"));
const artifacts = Array.from(document.querySelectorAll("[data-artifact]"));
const proofItems = Array.from(document.querySelectorAll("[data-proof]"));

const machine = document.querySelector("[data-machine]");
const runState = document.querySelector("[data-run-state]");
const terminalStatus = document.querySelector("[data-terminal-status]");
const terminalLog = document.querySelector("[data-terminal-log]");
const artifactCount = document.querySelector("[data-artifact-count]");
const proofCount = document.querySelector("[data-proof-count]");
const proofMessage = document.querySelector("[data-proof-message]");
const coreTitle = document.querySelector("[data-core-title]");
const coreCopy = document.querySelector("[data-core-copy]");
const coreMeter = document.querySelector("[data-core-meter]");
const inspectorTitle = document.querySelector("[data-inspector-title]");
const inspectorCopy = document.querySelector("[data-inspector-copy]");
const inspectorOwner = document.querySelector("[data-inspector-owner]");
const inspectorPurpose = document.querySelector("[data-inspector-purpose]");
const inspectorOutput = document.querySelector("[data-inspector-output]");
const inspectorGate = document.querySelector("[data-inspector-gate]");

const runButton = document.querySelector("[data-action='run']");
const nextButton = document.querySelector("[data-action='next']");
const resetButton = document.querySelector("[data-action='reset']");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeStage = 0;
let runTimer = null;

function clampStage(index) {
  return Math.max(0, Math.min(index, stages.length - 1));
}

function formatLog(stage) {
  return stage.logs.join("\n");
}

function setRunButtonLabel() {
  runButton.textContent = runTimer ? "Pause walkthrough" : "Run walkthrough";
}

function stopRun() {
  if (runTimer) {
    window.clearInterval(runTimer);
    runTimer = null;
  }

  machine.classList.remove("is-running");
  setRunButtonLabel();
}

function updateArtifacts() {
  let visibleCount = 0;

  artifacts.forEach((artifact) => {
    const emitStage = Number(artifact.dataset.emitStage);
    const wasVisible = artifact.classList.contains("is-visible");
    const isVisible = emitStage <= activeStage;

    artifact.classList.toggle("is-visible", isVisible);
    artifact.classList.remove("is-new");

    if (isVisible) {
      visibleCount += 1;
    }

    if (isVisible && !wasVisible && !reducedMotionQuery.matches) {
      window.requestAnimationFrame(() => {
        artifact.classList.add("is-new");
      });
    }
  });

  artifactCount.textContent = `${visibleCount} / ${artifacts.length}`;
}

function updateProof(stage) {
  const completedProofs = stage.proofs;
  const proofProgress = (completedProofs.length / proofItems.length) * 100;

  proofItems.forEach((item) => {
    item.classList.toggle("is-complete", completedProofs.includes(item.dataset.proof));
  });

  proofCount.textContent = `${completedProofs.length} / ${proofItems.length}`;
  coreMeter.textContent = `${completedProofs.length}/${proofItems.length}`;
  coreMeter.parentElement.style.setProperty("--proof-progress", `${proofProgress}%`);

  proofMessage.textContent = completedProofs.length === proofItems.length
    ? "The work is not just done. It is auditable."
    : "Proof is assembled as each gate passes.";
}

function updateSignals() {
  signalPaths.forEach((path) => {
    const linkIndex = Number(path.dataset.link);
    const isReached = linkIndex <= activeStage;

    path.classList.toggle("is-active", isReached);
    path.classList.toggle("is-complete", linkIndex < activeStage);
    path.classList.toggle("is-live", linkIndex === activeStage);
  });
}

function setStage(index) {
  activeStage = clampStage(index);
  const stage = stages[activeStage];

  runState.textContent = stage.state;
  terminalStatus.textContent = stage.terminalStatus;
  terminalLog.textContent = formatLog(stage);
  coreTitle.textContent = stage.coreTitle;
  coreCopy.textContent = stage.coreCopy;
  inspectorTitle.textContent = stage.title;
  inspectorCopy.textContent = stage.coreCopy;
  inspectorOwner.textContent = stage.owner;
  inspectorPurpose.textContent = stage.purpose;
  inspectorOutput.textContent = stage.output;
  inspectorGate.textContent = stage.gate;

  stageNodes.forEach((node) => {
    const nodeIndex = Number(node.dataset.stage);
    node.classList.toggle("is-active", nodeIndex === activeStage);
    node.classList.toggle("is-complete", nodeIndex < activeStage);
    node.setAttribute("aria-current", nodeIndex === activeStage ? "step" : "false");
  });

  updateSignals();
  updateArtifacts();
  updateProof(stage);

  if (activeStage === stages.length - 1) {
    stopRun();
  }
}

function runWalkthrough() {
  if (runTimer) {
    stopRun();
    return;
  }

  if (reducedMotionQuery.matches) {
    setStage(stages.length - 1);
    return;
  }

  if (activeStage === stages.length - 1) {
    setStage(0);
  }

  machine.classList.add("is-running");
  runTimer = window.setInterval(() => {
    setStage(activeStage + 1);
  }, 1350);
  setRunButtonLabel();
}

stageNodes.forEach((node) => {
  node.addEventListener("click", () => {
    stopRun();
    setStage(Number(node.dataset.stage));
  });
});

runButton.addEventListener("click", runWalkthrough);

nextButton.addEventListener("click", () => {
  stopRun();
  setStage(activeStage + 1 > stages.length - 1 ? 0 : activeStage + 1);
});

resetButton.addEventListener("click", () => {
  stopRun();
  setStage(0);
});

setStage(0);
