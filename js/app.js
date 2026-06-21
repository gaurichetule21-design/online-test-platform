/* =========================================================
   SLATE — shared client logic
   ---------------------------------------------------------
   This file is loaded on every page. Each page's logic is
   guarded by a check for an element that only exists on that
   page, so one script can drive the whole site.

   DATA LAYER
   ---------------------------------------------------------
   There is no backend yet. The `API` object below is the
   single place that talks to "the server". Every method
   returns a Promise and has a fake network delay, so the UI
   already behaves like it's waiting on a real request.

   When the backend exists, replace the body of each method
   with a real call, e.g.:

     async getTests() {
       const res = await fetch("/api/tests");
       if (!res.ok) throw new Error("Failed to load tests");
       return res.json();
     }

   Nothing else in this file should need to change.
   ========================================================= */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const API = {
  async login({ email, role }) {
    // TODO: replace with: POST /api/auth/login { email, password }
    await delay(500);
    return { id: "u_1", name: email.split("@")[0] || "there", email, role };
  },

  async getInstructorTests() {
    // TODO: replace with: GET /api/tests?owner=me
    await delay(400);
    return [
      { id: "t1", title: "JavaScript Fundamentals", questions: 12, status: "published", attempts: 34, avgScore: 78 },
      { id: "t2", title: "World History — Unit 3", questions: 20, status: "published", attempts: 51, avgScore: 65 },
      { id: "t3", title: "React Hooks Checkpoint", questions: 15, status: "published", attempts: 19, avgScore: 82 },
    ];
  },

  async getAvailableTests() {
    // TODO: replace with: GET /api/tests/available
    await delay(400);
    return [
      { id: "t1", title: "JavaScript Fundamentals", questions: 12, duration: 20, code: "JS-FUND" },
      { id: "t2", title: "World History — Unit 3", questions: 20, duration: 30, code: "HIST-U3" },
      { id: "t4", title: "React Hooks Checkpoint", questions: 15, duration: 25, code: "RX-HOOK" },
    ];
  },

  async getMyResults() {
    // TODO: replace with: GET /api/attempts?user=me
    await delay(400);
    return [
      { id: "a1", title: "Intro to CSS", score: 9, total: 10, date: "Jun 12, 2026" },
      { id: "a2", title: "Algebra Basics", score: 7, total: 10, date: "Jun 5, 2026" },
    ];
  },

  async createTest(payload) {
    // TODO: replace with: POST /api/tests { ...payload }
    await delay(600);
    return { id: "t_new", ...payload };
  },

  async getTestForAttempt(testId) {
    // TODO: replace with: GET /api/tests/:id/attempt
    await delay(500);
    return {
      id: testId || "t1",
      title: "JavaScript Fundamentals",
      durationMinutes: 20,
      questions: [
        { id: "q1", type: "mcq", text: "Which keyword declares a block-scoped variable in JavaScript?", options: ["var", "let", "function", "global"], correctIndex: 1 },
        { id: "q2", type: "truefalse", text: "JavaScript arrays can hold mixed data types.", correctIndex: 0 },
        { id: "q3", type: "short", text: "What does \"DOM\" stand for?", expected: "document object model" },
        { id: "q4", type: "mcq", text: "Which method adds an item to the end of an array?", options: ["push()", "shift()", "pop()", "splice()"], correctIndex: 0 },
        { id: "q5", type: "mcq", text: "What is the result of typeof null?", options: ["'null'", "'undefined'", "'object'", "'number'"], correctIndex: 2 },
        { id: "q6", type: "truefalse", text: "== and === always behave the same way in JavaScript.", correctIndex: 1 },
      ],
    };
  },

  async submitAttempt(testId, answers) {
    // TODO: replace with: POST /api/tests/:id/submit { answers }
    await delay(700);
    return { attemptId: "a_new" };
  },

  async getResult(attemptId) {
    // TODO: replace with: GET /api/attempts/:id
    await delay(400);
    return {
      title: "JavaScript Fundamentals",
      score: 5,
      total: 6,
      timeTaken: "14:32",
      breakdown: [
        { text: "Which keyword declares a block-scoped variable in JavaScript?", your: "let", correct: "let", state: "correct" },
        { text: "JavaScript arrays can hold mixed data types.", your: "True", correct: "True", state: "correct" },
        { text: "What does \"DOM\" stand for?", your: "document object model", correct: "Document Object Model", state: "correct" },
        { text: "Which method adds an item to the end of an array?", your: "pop()", correct: "push()", state: "incorrect" },
        { text: "What is the result of typeof null?", your: "'object'", correct: "'object'", state: "correct" },
        { text: "== and === always behave the same way in JavaScript.", your: "—", correct: "False", state: "skipped" },
      ],
    };
  },
};

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* ---------------------------------------------------------
   LOGIN PAGE
   --------------------------------------------------------- */
function initLoginPage() {
  const form = document.getElementById("login-form");
  if (!form) return;

  const roleButtons = document.querySelectorAll("[data-role-option]");
  let selectedRole = "student";
  roleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedRole = btn.dataset.roleOption;
      roleButtons.forEach((b) => b.classList.toggle("is-selected", b === btn));
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value || "guest@example.com";
    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in…";

    await API.login({ email, role: selectedRole });
    window.location.href = `dashboard.html?role=${selectedRole}`;
  });
}

/* ---------------------------------------------------------
   DASHBOARD PAGE
   --------------------------------------------------------- */
function initDashboardPage() {
  const root = document.getElementById("dashboard-root");
  if (!root) return;

  const instructorView = document.getElementById("instructor-view");
  const studentView = document.getElementById("student-view");
  const switchButtons = document.querySelectorAll("[data-view-switch]");

  function setView(role) {
    instructorView.hidden = role !== "instructor";
    studentView.hidden = role !== "student";
    switchButtons.forEach((b) => b.classList.toggle("is-selected", b.dataset.viewSwitch === role));
    const url = new URL(window.location);
    url.searchParams.set("role", role);
    window.history.replaceState({}, "", url);
  }

  switchButtons.forEach((btn) => btn.addEventListener("click", () => setView(btn.dataset.viewSwitch)));
  setView(qs("role") === "instructor" ? "instructor" : "student");

  // populate instructor test list
  API.getInstructorTests().then((tests) => {
    const list = document.getElementById("instructor-test-list");
    list.innerHTML = tests.map((t) => `
      <div class="card card-pad card-hover spread">
        <div>
          <div class="cluster" style="margin-bottom:6px;">
            <strong>${t.title}</strong>
            <span class="badge ${t.status === "published" ? "badge-published" : "badge-draft"}">${t.status}</span>
          </div>
          <span class="text-faint mono" style="font-size:13px;">${t.questions} questions · ${t.attempts} attempts${t.avgScore !== null ? ` · avg ${t.avgScore}%` : ""}</span>
        </div>
        <div class="cluster">
          <button class="btn btn-secondary btn-sm">Edit</button>
          <button class="btn btn-ghost btn-sm">View results</button>
        </div>
      </div>
    `).join("");

    document.getElementById("stat-total-tests").textContent = tests.length;
    document.getElementById("stat-total-attempts").textContent = tests.reduce((a, t) => a + t.attempts, 0);
    const scored = tests.filter((t) => t.avgScore !== null);
    document.getElementById("stat-avg-score").textContent = scored.length
      ? Math.round(scored.reduce((a, t) => a + t.avgScore, 0) / scored.length) + "%"
      : "—";
  });

  // populate student available tests
  API.getAvailableTests().then((tests) => {
    const list = document.getElementById("available-test-list");
    list.innerHTML = tests.map((t) => `
      <div class="card card-pad card-hover spread">
        <div>
          <strong>${t.title}</strong><br>
          <span class="text-faint mono" style="font-size:13px;">${t.questions} questions · ${t.duration} min · code ${t.code}</span>
        </div>
        <a class="btn btn-primary btn-sm" href="attempt-test.html?test=${t.id}">Start test</a>
      </div>
    `).join("");
  });

  // populate student results
  API.getMyResults().then((results) => {
    const list = document.getElementById("my-results-list");
    if (!results.length) {
      list.innerHTML = `<div class="empty-state">No attempts yet — finish a test to see it here.</div>`;
      return;
    }
    list.innerHTML = results.map((r) => `
      <div class="card card-pad card-hover spread">
        <div>
          <strong>${r.title}</strong><br>
          <span class="text-faint" style="font-size:13px;">${r.date}</span>
        </div>
        <div class="cluster">
          <span class="mono" style="font-size:15px;">${r.score}/${r.total}</span>
          <a class="btn btn-secondary btn-sm" href="result.html?attempt=${r.id}">View</a>
        </div>
      </div>
    `).join("");
  });
}

/* ---------------------------------------------------------
   CREATE TEST PAGE
   --------------------------------------------------------- */
let questionCounter = 0;

function questionBlockTemplate(qNum) {
  const uid = `q${++questionCounter}`;
  return `
    <div class="card card-pad question-block" data-uid="${uid}" style="margin-bottom:16px;">
      <div class="spread" style="margin-bottom:14px;">
        <span class="eyebrow" style="margin:0;">Question ${qNum}</span>
        <button type="button" class="btn btn-ghost btn-sm remove-question" aria-label="Remove question">Remove</button>
      </div>
      <div class="row">
        <div class="field" style="flex:2;">
          <label>Question text</label>
          <textarea class="q-text" placeholder="Type the question…" rows="2"></textarea>
        </div>
        <div class="field" style="flex:1;">
          <label>Type</label>
          <select class="q-type">
            <option value="mcq">Multiple choice</option>
            <option value="truefalse">True / False</option>
            <option value="short">Short answer</option>
          </select>
        </div>
      </div>
      <div class="answer-area"></div>
    </div>
  `;
}

function mcqAnswerArea() {
  return `
    <label>Options — mark the correct one</label>
    <div class="mcq-options stack" style="gap:8px;"></div>
    <button type="button" class="btn btn-secondary btn-sm add-option" style="margin-top:8px;">+ Add option</button>
  `;
}
function mcqOptionRow(letter) {
  return `
    <div class="cluster mcq-option-row">
      <span class="option-letter">${letter}</span>
      <input type="radio" name="correct-${questionCounter}" class="mcq-correct">
      <input type="text" class="mcq-option-text" placeholder="Option text" style="flex:1;">
      <button type="button" class="btn btn-ghost btn-sm remove-option" aria-label="Remove option">✕</button>
    </div>
  `;
}
function truefalseAnswerArea(uid) {
  return `
    <label>Correct answer</label>
    <div class="option-row"><input type="radio" name="tf-${uid}" checked><span class="option-letter">T</span> True</div>
    <div class="option-row"><input type="radio" name="tf-${uid}"><span class="option-letter">F</span> False</div>
  `;
}
function shortAnswerArea() {
  return `
    <label>Expected answer</label>
    <input type="text" class="short-expected" placeholder="e.g. document object model">
    <p class="field-hint">Graded as an exact match, case-insensitive. Review short answers manually if you expect phrasing to vary.</p>
  `;
}

function wireQuestionBlock(block) {
  const typeSelect = block.querySelector(".q-type");
  const answerArea = block.querySelector(".answer-area");

  function render() {
    const uid = block.dataset.uid;
    if (typeSelect.value === "mcq") {
      answerArea.innerHTML = mcqAnswerArea();
      const optWrap = answerArea.querySelector(".mcq-options");
      optWrap.innerHTML = ["A", "B", "C", "D"].slice(0, 2).map(mcqOptionRow).join("");
      answerArea.querySelector(".add-option").addEventListener("click", () => {
        const count = optWrap.children.length;
        const letter = String.fromCharCode(65 + count);
        optWrap.insertAdjacentHTML("beforeend", mcqOptionRow(letter));
        wireOptionRemoval(optWrap);
      });
      wireOptionRemoval(optWrap);
    } else if (typeSelect.value === "truefalse") {
      answerArea.innerHTML = truefalseAnswerArea(uid);
    } else {
      answerArea.innerHTML = shortAnswerArea();
    }
    updateSummary();
  }

  function wireOptionRemoval(optWrap) {
    optWrap.querySelectorAll(".remove-option").forEach((btn) => {
      btn.onclick = () => { if (optWrap.children.length > 2) btn.closest(".mcq-option-row").remove(); };
    });
  }

  typeSelect.addEventListener("change", render);
  block.querySelector(".remove-question").addEventListener("click", () => { block.remove(); updateSummary(); });
  render();
}

function updateSummary() {
  const blocks = document.querySelectorAll(".question-block");
  const countEl = document.getElementById("summary-count");
  const typesEl = document.getElementById("summary-types");
  if (!countEl) return;
  countEl.textContent = blocks.length;
  const types = { mcq: 0, truefalse: 0, short: 0 };
  blocks.forEach((b) => { const t = b.querySelector(".q-type").value; types[t]++; });
  typesEl.innerHTML = `
    <span class="text-faint">MCQ ${types.mcq}</span> ·
    <span class="text-faint">True/False ${types.truefalse}</span> ·
    <span class="text-faint">Short answer ${types.short}</span>
  `;
}

function initCreateTestPage() {
  const addBtn = document.getElementById("add-question");
  if (!addBtn) return;
  const list = document.getElementById("question-list");

  function addQuestion() {
    const qNum = list.children.length + 1;
    list.insertAdjacentHTML("beforeend", questionBlockTemplate(qNum));
    wireQuestionBlock(list.lastElementChild);
  }

  addBtn.addEventListener("click", addQuestion);
  addQuestion(); // start with one question

  document.getElementById("save-draft").addEventListener("click", () => saveTest("draft"));
  document.getElementById("publish-test").addEventListener("click", () => saveTest("published"));

  async function saveTest(status) {
    const title = document.getElementById("test-title").value || "Untitled test";
    const duration = document.getElementById("test-duration").value || 20;
    const banner = document.getElementById("save-banner");
    banner.textContent = status === "draft" ? "Saving draft…" : "Publishing…";
    banner.hidden = false;
    await API.createTest({ title, duration, status, questionCount: list.children.length });
    banner.textContent = status === "draft" ? "Saved as draft." : "Published — redirecting to your dashboard…";
    setTimeout(() => { window.location.href = "dashboard.html?role=instructor"; }, 900);
  }
}

/* ---------------------------------------------------------
   ATTEMPT TEST PAGE
   --------------------------------------------------------- */
function initAttemptPage() {
  const stage = document.getElementById("question-stage");
  if (!stage) return;

  let test = null;
  let current = 0;
  const answers = {};
  let secondsLeft = 0;
  let timerId = null;

  API.getTestForAttempt(qs("test")).then((data) => {
    test = data;
    secondsLeft = test.durationMinutes * 60;
    document.getElementById("attempt-title").textContent = test.title;
    buildBubbleStrip();
    renderQuestion();
    timerId = setInterval(tick, 1000);
  });

  function tick() {
    secondsLeft--;
    document.getElementById("timer").textContent = formatClock(Math.max(secondsLeft, 0));
    if (secondsLeft <= 0) { clearInterval(timerId); submitTest(); }
  }

  function buildBubbleStrip() {
    const strip = document.getElementById("bubble-strip");
    strip.innerHTML = test.questions.map((q, i) => `<button type="button" class="bubble" data-index="${i}">${i + 1}</button>`).join("");
    strip.querySelectorAll(".bubble").forEach((b) => b.addEventListener("click", () => { current = +b.dataset.index; renderQuestion(); }));
  }

  function refreshBubbleStrip() {
    document.querySelectorAll("#bubble-strip .bubble").forEach((b, i) => {
      b.classList.toggle("is-filled", answers[test.questions[i].id] !== undefined);
      b.classList.toggle("is-current", i === current);
    });
  }

  function renderQuestion() {
    const q = test.questions[current];
    const typeLabel = { mcq: "Multiple choice", truefalse: "True / False", short: "Short answer" }[q.type];
    let answerHtml = "";

    if (q.type === "mcq") {
      answerHtml = q.options.map((opt, i) => `
        <label class="option-row ${answers[q.id] === i ? "is-selected" : ""}">
          <input type="radio" name="answer" ${answers[q.id] === i ? "checked" : ""} data-index="${i}">
          <span class="option-letter">${String.fromCharCode(65 + i)}</span> ${opt}
        </label>
      `).join("");
    } else if (q.type === "truefalse") {
      ["True", "False"].forEach((label, i) => {
        answerHtml += `
          <label class="option-row ${answers[q.id] === i ? "is-selected" : ""}">
            <input type="radio" name="answer" ${answers[q.id] === i ? "checked" : ""} data-index="${i}">
            <span class="option-letter">${label[0]}</span> ${label}
          </label>`;
      });
    } else {
      answerHtml = `<input type="text" id="short-input" placeholder="Type your answer…" value="${answers[q.id] || ""}">`;
    }

    stage.innerHTML = `
      <span class="eyebrow">Question ${current + 1} of ${test.questions.length} · ${typeLabel}</span>
      <h2 style="font-size:21px;">${q.text}</h2>
      <div class="stack" style="gap:8px; margin-top:18px;">${answerHtml}</div>
    `;

    if (q.type === "short") {
      document.getElementById("short-input").addEventListener("input", (e) => {
        answers[q.id] = e.target.value;
        refreshBubbleStrip();
      });
    } else {
      stage.querySelectorAll('input[name="answer"]').forEach((input) => {
        input.addEventListener("change", (e) => {
          answers[q.id] = +e.target.dataset.index;
          renderQuestion();
          refreshBubbleStrip();
        });
      });
    }

    document.getElementById("prev-btn").disabled = current === 0;
    document.getElementById("next-btn").hidden = current === test.questions.length - 1;
    document.getElementById("submit-btn").hidden = current !== test.questions.length - 1;
    refreshBubbleStrip();
  }

  document.getElementById("prev-btn").addEventListener("click", () => { current--; renderQuestion(); });
  document.getElementById("next-btn").addEventListener("click", () => { current++; renderQuestion(); });
  document.getElementById("submit-btn").addEventListener("click", submitTest);

  async function submitTest() {
    if (timerId) clearInterval(timerId);
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    const { attemptId } = await API.submitAttempt(test.id, answers);
    window.location.href = `result.html?attempt=${attemptId}`;
  }
}

/* ---------------------------------------------------------
   RESULT PAGE
   --------------------------------------------------------- */
function initResultPage() {
  const root = document.getElementById("result-root");
  if (!root) return;

  API.getResult(qs("attempt")).then((r) => {
    const pct = Math.round((r.score / r.total) * 100);
    document.getElementById("result-title").textContent = r.title;
    document.getElementById("result-score").textContent = `${r.score}/${r.total}`;
    document.getElementById("result-pct").textContent = `${pct}%`;
    document.getElementById("result-time").textContent = r.timeTaken;

    const correct = r.breakdown.filter((b) => b.state === "correct").length;
    const incorrect = r.breakdown.filter((b) => b.state === "incorrect").length;
    const skipped = r.breakdown.filter((b) => b.state === "skipped").length;
    document.getElementById("count-correct").textContent = correct;
    document.getElementById("count-incorrect").textContent = incorrect;
    document.getElementById("count-skipped").textContent = skipped;

    document.getElementById("breakdown-list").innerHTML = r.breakdown.map((b, i) => `
      <div class="card card-pad" style="margin-bottom:10px;">
        <div class="spread" style="margin-bottom:8px; align-items:flex-start;">
          <strong>Q${i + 1}. ${b.text}</strong>
          <span class="badge badge-${b.state}">${b.state}</span>
        </div>
        <div class="text-muted" style="font-size:13px;">
          Your answer: <span class="mono">${b.your}</span>
          ${b.state !== "correct" ? ` · Correct answer: <span class="mono">${b.correct}</span>` : ""}
        </div>
      </div>
    `).join("");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLoginPage();
  initDashboardPage();
  initCreateTestPage();
  initAttemptPage();
  initResultPage();
});