const laneX = {
  llm: 128,
  code: 450,
  tools: 770
};

const colors = {
  request: "#e56b4f",
  assistant: "#3b82f6",
  tool: "#10b981",
  loop: "#f59e0b",
  result: "#14b8a6"
};

const sequenceSvg = document.querySelector("#sequenceSvg");
const terminalLog = document.querySelector("#terminalLog");
const terminalStep = document.querySelector("#terminalStep");
const terminalTitle = document.querySelector("#terminalTitle");
const stepLabel = document.querySelector("#stepLabel");
const stepDots = document.querySelector("#stepDots");
const payloadTitle = document.querySelector("#payloadTitle");
const payloadKind = document.querySelector("#payloadKind");
const payloadBody = document.querySelector("#payloadBody");
const teachingNote = document.querySelector("#teachingNote");
const sourceModule = document.querySelector("#sourceModule");
const autoExplainBtn = document.querySelector("#autoExplainBtn");

let scenarios = {};
let scenarioKeys = [];
let scenarioKey = "claude";
let currentSteps = [];
let stepIndex = 0;
let selectedIndex = 0;
let replayTimer = null;
let explainTimer = null;
let explainMode = false;
let laneFocus = new Set(["llm", "code", "tools"]);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function shortText(text, max = 26) {
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function messageY(index) {
  const gap = Math.max(56, Math.min(68, 730 / currentSteps.length));
  return 92 + index * gap;
}

async function loadScenarios() {
  const response = await fetch("./data/scenarios.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load scenarios.json: ${response.status}`);
  }
  scenarios = await response.json();
  scenarioKeys = Object.keys(scenarios);
  scenarioKey = scenarioKeys.includes("claude") ? "claude" : scenarioKeys[0];
  currentSteps = scenarios[scenarioKey].steps;
}

function renderSequence() {
  const defs = `
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
        <path d="M0,0 L0,6 L7,3 z" fill="context-stroke"></path>
      </marker>
    </defs>`;

  const lanes = Object.entries(laneX).map(([lane, x]) => `
    <line class="lane-line" x1="${x}" y1="44" x2="${x}" y2="860"></line>
    <text class="lane-title" x="${x}" y="32" text-anchor="middle" fill="${laneFocus.has(lane) ? colors.request : "#9ca3af"}">${lane === "llm" ? "Claude LLM" : lane === "code" ? "Runtime" : "Tools / State"}</text>
  `).join("");

  const messages = currentSteps.map((item, index) => {
    const y = messageY(index);
    const fromX = laneX[item.from];
    const toX = laneX[item.to];
    const left = Math.min(fromX, toX) + 12;
    const width = Math.max(Math.abs(toX - fromX) - 24, 170);
    const color = colors[item.kind] || colors.request;
    const visible = index <= stepIndex && laneFocus.has(item.lane);
    const active = index === selectedIndex;
    const explaining = explainMode && active;
    const direction = fromX < toX ? 1 : -1;
    const cardX = direction > 0 ? left + 24 : left + width - 214;

    return `
      <g class="message-block ${explaining ? "explaining" : ""}" data-index="${index}" opacity="${visible ? "1" : "0.18"}">
        <line class="message-line ${visible ? "visible" : ""}" x1="${fromX + direction * 10}" y1="${y}" x2="${toX - direction * 16}" y2="${y}" stroke="${color}"></line>
        <rect class="message-card ${active ? "active" : ""}" x="${cardX}" y="${y - 31}" width="206" height="50" stroke="${color}"></rect>
        <text class="message-kicker" x="${cardX + 12}" y="${y - 13}" fill="${color}">${escapeHtml(item.kind.toUpperCase())}</text>
        <text class="message-label" x="${cardX + 12}" y="${y + 8}">${escapeHtml(shortText(item.label))}</text>
      </g>`;
  }).join("");

  sequenceSvg.innerHTML = defs + lanes + messages;
}

function renderTerminal() {
  terminalTitle.textContent = scenarios[scenarioKey].title;
  terminalStep.textContent = `${stepIndex + 1} / ${currentSteps.length}`;
  stepLabel.textContent = `STEP ${String(stepIndex + 1).padStart(2, "0")}`;
  terminalLog.innerHTML = currentSteps.slice(0, stepIndex + 1).map((item, index) => `
    <article class="term-entry ${index === selectedIndex ? "active" : ""}" data-index="${index}">
      <div class="term-head">
        <span>${escapeHtml(item.title)}</span>
        <span class="term-status">${escapeHtml(item.status)}</span>
      </div>
      <pre class="term-body">${escapeHtml(item.body)}</pre>
    </article>
  `).join("");
  requestAnimationFrame(() => {
    const activeEntry = terminalLog.querySelector(".term-entry.active");
    if (activeEntry) {
      activeEntry.scrollIntoView({ block: "nearest", behavior: explainMode ? "smooth" : "auto" });
    } else {
      terminalLog.scrollTop = terminalLog.scrollHeight;
    }
  });
}

function renderPayload() {
  const item = currentSteps[selectedIndex];
  payloadTitle.textContent = item.title;
  payloadKind.textContent = item.kind.toUpperCase();
  payloadBody.textContent = JSON.stringify(item.payload, null, 2);
  sourceModule.textContent = item.source || "src/runtime/unknown.ts";
  teachingNote.textContent = item.teaching || "";
}

function renderDots() {
  stepDots.innerHTML = currentSteps.map((_, index) => `
    <button class="step-dot ${index < stepIndex ? "done" : ""} ${index === stepIndex ? "active" : ""}" data-step="${index}" type="button" aria-label="Go to step ${index + 1}"></button>
  `).join("");
}

function renderScenarioButtons() {
  document.querySelectorAll(".scenario").forEach((button) => {
    button.classList.toggle("active", button.dataset.scenario === scenarioKey);
  });
}

function render() {
  if (!currentSteps.length) return;
  if (selectedIndex > stepIndex) selectedIndex = stepIndex;
  renderScenarioButtons();
  renderSequence();
  renderTerminal();
  renderPayload();
  renderDots();
  autoExplainBtn.classList.toggle("active", explainMode);
  autoExplainBtn.textContent = explainMode ? "暂停" : "讲解";
}

function go(nextStep, options = {}) {
  stepIndex = Math.max(0, Math.min(currentSteps.length - 1, nextStep));
  selectedIndex = options.keepSelected ? Math.min(selectedIndex, stepIndex) : stepIndex;
  render();
}

function stopReplay() {
  if (replayTimer) {
    clearInterval(replayTimer);
    replayTimer = null;
  }
}

function stopExplain() {
  if (explainTimer) {
    clearInterval(explainTimer);
    explainTimer = null;
  }
  explainMode = false;
  render();
}

function startExplain() {
  stopReplay();
  if (explainTimer) {
    stopExplain();
    return;
  }
  explainMode = true;
  go(0);
  explainTimer = setInterval(() => {
    if (stepIndex >= currentSteps.length - 1) {
      stopExplain();
      return;
    }
    go(stepIndex + 1);
  }, 2400);
  render();
}

function switchScenario(nextScenario) {
  if (!scenarios[nextScenario]) return;
  stopReplay();
  if (explainTimer) {
    clearInterval(explainTimer);
    explainTimer = null;
    explainMode = false;
  }
  scenarioKey = nextScenario;
  currentSteps = scenarios[scenarioKey].steps;
  stepIndex = 0;
  selectedIndex = 0;
  render();
}

function setLoadError(error) {
  terminalTitle.textContent = "scenario loader";
  terminalLog.innerHTML = `
    <article class="term-entry active">
      <div class="term-head">
        <span>Failed to load data/scenarios.json</span>
        <span class="term-status">ERROR</span>
      </div>
      <pre class="term-body">${escapeHtml(error.message)}\n\n请用本地静态服务打开本项目，例如：\npython3 -m http.server 8765</pre>
    </article>`;
}

document.querySelector(".scenario-strip").addEventListener("click", (event) => {
  const button = event.target.closest("[data-scenario]");
  if (!button) return;
  switchScenario(button.dataset.scenario);
});

document.querySelector("#prevBtn").addEventListener("click", () => {
  stopReplay();
  if (explainTimer) stopExplain();
  go(stepIndex - 1);
});

document.querySelector("#nextBtn").addEventListener("click", () => {
  stopReplay();
  if (explainTimer) stopExplain();
  go(stepIndex + 1);
});

document.querySelector("#replayBtn").addEventListener("click", () => {
  stopReplay();
  if (explainTimer) stopExplain();
  go(0);
  replayTimer = setInterval(() => {
    if (stepIndex >= currentSteps.length - 1) {
      stopReplay();
      return;
    }
    go(stepIndex + 1);
  }, 760);
});

autoExplainBtn.addEventListener("click", startExplain);

document.querySelector("#resetBtn").addEventListener("click", () => {
  stopReplay();
  if (explainTimer) stopExplain();
  go(0);
});

document.querySelector("#themeBtn").addEventListener("click", () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === "bright" ? "" : "bright";
});

document.querySelector(".lane-head").addEventListener("click", (event) => {
  const button = event.target.closest("[data-focus]");
  if (!button) return;
  const lane = button.dataset.focus;
  if (laneFocus.has(lane) && laneFocus.size > 1) {
    laneFocus.delete(lane);
    button.classList.remove("active");
  } else {
    laneFocus.add(lane);
    button.classList.add("active");
  }
  renderSequence();
});

sequenceSvg.addEventListener("click", (event) => {
  const block = event.target.closest(".message-block");
  if (!block) return;
  if (explainTimer) stopExplain();
  selectedIndex = Number(block.dataset.index);
  if (selectedIndex > stepIndex) stepIndex = selectedIndex;
  render();
});

terminalLog.addEventListener("click", (event) => {
  const entry = event.target.closest(".term-entry");
  if (!entry) return;
  if (explainTimer) stopExplain();
  selectedIndex = Number(entry.dataset.index);
  render();
});

stepDots.addEventListener("click", (event) => {
  const dot = event.target.closest("[data-step]");
  if (!dot) return;
  stopReplay();
  if (explainTimer) stopExplain();
  go(Number(dot.dataset.step));
});

window.addEventListener("keydown", (event) => {
  if (!currentSteps.length) return;
  if (event.key === "ArrowRight") go(stepIndex + 1);
  if (event.key === "ArrowLeft") go(stepIndex - 1);
  if (event.key === " ") {
    event.preventDefault();
    startExplain();
  }
  if (["1", "2", "3", "4"].includes(event.key)) {
    switchScenario(scenarioKeys[Number(event.key) - 1]);
  }
});

loadScenarios()
  .then(render)
  .catch(setLoadError);
