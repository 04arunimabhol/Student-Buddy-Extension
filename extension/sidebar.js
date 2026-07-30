function cleanText(s) {
  return (s || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractProblemFromPage() {
  const titleEl =
    document.querySelector('[data-cy="question-title"]') ||
    document.querySelector("div.text-title-large a") ||
    document.querySelector("h1") ||
    document.querySelector("div.text-title-large");

  const title = cleanText(titleEl?.textContent) || "LeetCode Problem";

  const descEl =
    document.querySelector('[data-track-load="description_content"]') ||
    document.querySelector('[data-cy="question-content"]') ||
    document.querySelector("div.elfjS") ||
    document.querySelector("div[data-key='description']") ||
    document.querySelector("div[class*='question-content']");

  const statement = cleanText(descEl?.innerText || descEl?.textContent);
  if (!statement) {
    throw new Error("Could not extract problem statement");
  }

  const difficultyEl = document.querySelector(
    'div[class*="text-difficulty"]'
  );
  const difficulty = difficultyEl?.textContent.trim() || "Unknown";

  const url = window.location.href;

  return { title, statement, difficulty, url };
}

let sidebar = document.createElement("div");

fetch(chrome.runtime.getURL("sidebar.html"))
  .then((response) => response.text())
  .then((html) => {
    sidebar.innerHTML = html;
    document.body.appendChild(sidebar);

    initializeSidebar();
  })
  .catch((err) => console.error("Failed to load sidebar:", err));

async function initializeSidebar() {
  sidebar.querySelector(".sb-close").addEventListener("click", () => {
    sidebar.style.display = "none";
  });

  const loadProblemBtn = sidebar.querySelector("#sb-load-problem");
  const problemStatus = sidebar.querySelector("#sb-problem-status");
  const getHintBtn = sidebar.querySelector("#sb-get-hint");
  const nextHintBtn = sidebar.querySelector("#sb-next-hint");
  const outputBox = sidebar.querySelector("#sb-output");
  const textarea = sidebar.querySelector(".sb-textarea");
  const showSolBtn = sidebar.querySelector("#sb-solution");
  const language = sidebar.querySelector(".sb-select");

  const settingsBtn = sidebar.querySelector("#sb-settings");
  const settingsPanel = sidebar.querySelector("#sb-settings-panel");
  const settingsClose = sidebar.querySelector("#sb-settings-close");

  const apiInput = sidebar.querySelector("#sb-api-key");
  const saveKeyBtn = sidebar.querySelector("#sb-save-key");
  const saveStatus = sidebar.querySelector("#sb-save-status");

  const expandBtn = sidebar.querySelector("#sb-expand-output");
  const modal = sidebar.querySelector("#sb-output-modal");
  const modalOutput = sidebar.querySelector("#sb-modal-output");
  const closeModalBtn = sidebar.querySelector("#sb-close-modal");

  //App state
  const state = {
    problem: null,
    hintLevel: 0,
    hints: null,
    useUserApi: false
  };

  let userApiKey = null;
  async function loadApiKey() {
    const result = await chrome.storage.local.get("geminiApiKey");
    userApiKey = result.geminiApiKey || null;
  }
  await loadApiKey();

  function updateOutput(html) {
    outputBox.innerHTML = html;
    modalOutput.innerHTML = html;
  }

  async function checkApiAccess() {
    const result = await chrome.storage.local.get([
      "trialProblemsUsed",
      "usedProblems",
      "geminiApiKey",
    ]);

    const trialProblemsUsed = result.trialProblemsUsed || 0;
    const usedProblems = result.usedProblems || [];
    const apiKey = result.geminiApiKey || "";

    const currentProblem = state.problem.url;

    // Already unlocked before
    if (usedProblems.includes(currentProblem)) {
      state.useUserApi = trialProblemsUsed >= 2;
      return true;
    }

    // Free trial available
    if (trialProblemsUsed < 2) {
      usedProblems.push(currentProblem);

      await chrome.storage.local.set({
        trialProblemsUsed: trialProblemsUsed + 1,
        usedProblems,
      });

      state.useUserApi = false;
      return true;
    }

    // Trial over → use user's API key
    if (apiKey) {
      userApiKey = apiKey;
      state.useUserApi = true;
      return true;
    }

    updateOutput(`
      <b>Your free trial has ended.</b><br><br>
      Please add your Gemini API key from the extension settings.
    `);

    return false;
  }

  function problemLoaded() {
    if (!state.problem) {
      updateOutput("Please click <b>Load problem</b> first.");
      return false;
    }
    return true;
  }

  async function fetchHints() {
    return new Promise((resolve) =>{
      chrome.runtime.sendMessage(
        {
          endpoint : "get-hints",
          payload : {
            apiKey: state.useUserApi ? userApiKey : "",
            title: state.problem.title,
            description: state.problem.statement,
            difficulty: state.problem.difficulty,
            userCode: textarea.value,
          },
        },
        (response) => {
          console.log("Raw response from bg:", response);
          if (chrome.runtime.lastError) {
            console.error("Runtime error:", chrome.runtime.lastError);
            resolve(null);
            return;
          }
          resolve(response);
        }
      );
    });

  }

  async function fetchSolution() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        {
          endpoint: "get-solution",
          payload: {
            apiKey: state.useUserApi ? userApiKey : "",
            title: state.problem.title,
            description: state.problem.statement,
            difficulty: state.problem.difficulty,
            userCode: textarea.value,
            language: language.value,
          },
        },
        (response) => {
          resolve(response?.solution);
        }
      );
    });
    
  }

  loadProblemBtn.addEventListener("click", () => {
    try {
      const prob = extractProblemFromPage();
      state.problem = prob;
      problemStatus.textContent = `Loaded: ${prob.title}`;
    } catch (err) {
      problemStatus.textContent = "Failed to load problem";
      console.error(err);
    }
  });

  getHintBtn.addEventListener("click", async () => {
    if (!problemLoaded()) return;

    const allowed = await checkApiAccess();
    if (!allowed) return;

    updateOutput("Generating hint...");

    const data = await fetchHints();
    console.log("FRONTEND DATA:", data);
    if (!data) {
      updateOutput("Failed to fetch hint. Please try again.");
      return;
    }
    if (data?.error === "Invalid Gemini API Key") {
      updateOutput(`
        <b>Invalid Gemini API Key.</b><br><br>
        Please update it from Student Buddy Settings.
      `);
      return;
    }
    state.hints = data;
    state.hintLevel = 1;
    updateOutput(`
      <div><b>Pattern:</b> ${data.pattern}</div>
      <div><b>Hint 1:</b></div>
      <div>${data.level1}</div>
    `);
  });

  nextHintBtn.addEventListener("click", async () => {
    if (!problemLoaded()) return;

    if (state.hintLevel === 0) {
      updateOutput("Please click <b>Get Hint</b> first.");
      return;
    }
    if (state.hintLevel >= 3) {
      updateOutput(`
        You've reached maximum hints.<br><br>
        Try solving now <br>
        Or click <b>Show Full Solution</b>
      `);
      return;
    }
    state.hintLevel++;

    const hintLevel = `level${state.hintLevel}`;
    updateOutput(`
      <div><b>Hint ${state.hintLevel}:</b></div>
      <div>${state.hints[hintLevel]}</div>
    `);
  });

  showSolBtn.addEventListener("click", async () => {
    if (!problemLoaded()) return;

    const allowed = await checkApiAccess();
    if (!allowed) return;

    if (!confirm("Are you sure you want to see the full solution?")) return;

    const solution = await fetchSolution();
    updateOutput(`<pre>${solution}</pre>`);
  });

  settingsBtn.addEventListener("click", () => {
    apiInput.value = userApiKey;
    saveStatus.textContent = "";
    settingsPanel.style.display = "block";
  });

  settingsClose.addEventListener("click", () => {
    settingsPanel.style.display = "none";
  });

  saveKeyBtn.addEventListener("click", async () => {

    userApiKey = apiInput.value.trim();

    await chrome.storage.local.set({
        geminiApiKey: userApiKey
    });

    saveStatus.textContent = "API Key Saved ✓";

    setTimeout(() => {
        saveStatus.textContent = "";
        settingsPanel.style.display = "none";
    }, 1200);

  });

  expandBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
  });

  modal.addEventListener("click", (e) => {
      if(e.target === modal){
          modal.style.display = "none";
      }
  });

}
