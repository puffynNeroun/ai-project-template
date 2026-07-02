const steps = [
  {
    title: "Define Task",
    description: "Forge starts by turning an idea into a scoped task contract.",
    evidence: "task"
  },
  {
    title: "Plan",
    description: "The plan records the intended path before implementation starts.",
    evidence: "plan"
  },
  {
    title: "Build",
    description: "The builder makes the change and records implementation evidence.",
    evidence: "build"
  },
  {
    title: "Test",
    description: "The tester verifies the result and records what passed.",
    evidence: "test"
  },
  {
    title: "Review",
    description: "The reviewer accepts or rejects the work before PR.",
    evidence: "review"
  },
  {
    title: "Implementation PR",
    description: "The implementation PR moves the actual work into main.",
    evidence: "review"
  },
  {
    title: "Completion PR",
    description: "The completion PR marks the Forge task completed after merge.",
    evidence: "task"
  },
  {
    title: "Done",
    description: "Main is clean, the task is completed, and evidence remains in the repo.",
    evidence: "task"
  }
];

const stepCards = Array.from(document.querySelectorAll("[data-step]"));
const evidenceCards = Array.from(document.querySelectorAll("[data-evidence]"));
const title = document.querySelector("#active-step-title");
const description = document.querySelector("#active-step-description");
const progress = document.querySelector("[data-progress]");
const playButton = document.querySelector("[data-action='play']");
const resetButton = document.querySelector("[data-action='reset']");

let activeStep = 0;
let playTimer = null;

function setStep(index) {
  activeStep = Math.max(0, Math.min(index, steps.length - 1));
  const step = steps[activeStep];

  title.textContent = step.title;
  description.textContent = step.description;
  progress.style.width = `${((activeStep + 1) / steps.length) * 100}%`;

  stepCards.forEach((card) => {
    const isActive = Number(card.dataset.step) === activeStep;
    card.classList.toggle("is-active", isActive);
    card.setAttribute("aria-current", isActive ? "step" : "false");
  });

  evidenceCards.forEach((card) => {
    card.classList.toggle("is-highlighted", card.dataset.evidence === step.evidence);
  });
}

function stopPlayback() {
  if (playTimer) {
    window.clearInterval(playTimer);
    playTimer = null;
  }

  playButton.textContent = "Play lifecycle";
}

function playLifecycle() {
  if (playTimer) {
    stopPlayback();
    return;
  }

  playButton.textContent = "Pause";
  playTimer = window.setInterval(() => {
    if (activeStep >= steps.length - 1) {
      stopPlayback();
      return;
    }

    setStep(activeStep + 1);
  }, 900);
}

stepCards.forEach((card) => {
  card.addEventListener("click", () => {
    stopPlayback();
    setStep(Number(card.dataset.step));
  });
});

playButton.addEventListener("click", playLifecycle);

resetButton.addEventListener("click", () => {
  stopPlayback();
  setStep(0);
});

setStep(0);
