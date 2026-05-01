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

function initializeSidebar() {
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

  //App state
  const state = {
    problem: null,
    hintLevel: 0,
    hints: null,
  };

  function problemLoaded() {
    if (!state.problem) {
      outputBox.innerHTML = "Please click <b>Load problem</b> first.";
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

    outputBox.innerHTML = "Generating hint...";

    const data = await fetchHints();
    console.log("FRONTEND DATA:", data);
    if (!data) {
      outputBox.innerHTML = "Failed to fetch hint. Please try again.";
      return;
    }
    state.hints = data;
    state.hintLevel = 1;
    outputBox.innerHTML = `
      <div><b>Pattern:</b> ${data.pattern}</div>
      <div><b>Hint 1:</b></div>
      <div>${data.level1}</div>
    `;
  });

  nextHintBtn.addEventListener("click", async () => {
    if (!problemLoaded()) return;

    if (state.hintLevel === 0) {
      outputBox.innerHTML = "Please click <b>Get Hint</b> first.";
      return;
    }
    if (state.hintLevel >= 3) {
      outputBox.innerHTML = `
        You've reached maximum hints.<br><br>
        Try solving now <br>
        Or click <b>Show Full Solution</b>
      `;
      return;
    }
    state.hintLevel++;

    const hintLevel = `level${state.hintLevel}`;
    outputBox.innerHTML = `
      <div><b>Hint ${state.hintLevel}:</b></div>
      <div>${state.hints[hintLevel]}</div>
    `;
  });

  showSolBtn.addEventListener("click", async () => {
    if (!problemLoaded()) return;

    if (!confirm("Are you sure you want to see the full solution?")) return;

    const solution = await fetchSolution();
    outputBox.innerHTML = `<pre>${solution}</pre>`;
  });

}
