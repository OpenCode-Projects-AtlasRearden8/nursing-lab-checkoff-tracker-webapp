// app.js — UI + localStorage persistence for the Skills Lab Checkoff Tracker.
// Education only — never clinical advice. All data stays in the browser.

import {
  makeSkill,
  makeAttempt,
  skillProgress,
  isSkillMastered,
  confidenceFromRatings,
  attemptScore,
  nextUpCrits,
} from "./mastery.js";
import { defaultSkills } from "./skills-data.js";

const STORAGE_KEY = "nursing-lab-checkoff-tracker.v1";

function uid() {
  return `a${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * @typedef {Object} AppState
 * @property {Array} skills
 */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { skills: defaultSkills() };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.skills)) return { skills: defaultSkills() };
    return parsed;
  } catch {
    return { skills: defaultSkills() };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: the app keeps working in-memory.
  }
}

/* ---------------- rating / comfort helpers ---------------- */

const RATING_LABELS = { unsure: "Unsure", getting: "Getting it", solid: "Solid" };

function comfortClass(pct) {
  if (pct >= 75) return "high";
  if (pct >= 40) return "mid";
  return "low";
}

function comfortWord(pct) {
  if (pct >= 75) return "Confident";
  if (pct >= 40) return "Warming up";
  return "Shaky";
}

function critCircles(passedTimes) {
  let html = "";
  for (let i = 0; i < 2; i += 1) {
    html += `<span class="circle ${i < passedTimes ? "on" : ""}">${i < passedTimes ? "●" : "○"}</span>`;
  }
  return html;
}

/* ---------------- routing ---------------- */

let state = loadState();
let route = { view: "dashboard" };

window.addEventListener("hashchange", () => applyRoute());

function applyRoute() {
  const hash = window.location.hash || "#/";
  const parts = hash.replace(/^#\//, "").split("/");
  if (parts[0] === "skill" && parts[1]) {
    route = { view: "skill", id: parts[1] };
  } else if (parts[0] === "night-sheet") {
    route = { view: "night-sheet" };
  } else {
    route = { view: "dashboard" };
  }
  render();
}

/* ---------------- render: dashboard ---------------- */

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render() {
  const app = document.getElementById("app");
  const sheetRoot = document.getElementById("print-sheet-root");
  sheetRoot.innerHTML = "";

  if (route.view === "skill") {
    app.innerHTML = renderSkillDetail(route.id);
  } else if (route.view === "night-sheet") {
    app.innerHTML = renderNightSheetControls();
    sheetRoot.innerHTML = renderNightSheet();
  } else {
    app.innerHTML = renderDashboard();
  }
  bindEvents();
}

function renderDashboard() {
  const skills = state.skills;
  const totalCrits = skills.reduce((n, s) => n + s.crits.length, 0);
  const masteredCrits = skills.reduce(
    (n, s) => n + skillProgress(s.attempts, s).mastered,
    0
  );
  const masteredSkills = skills.filter((s) => isSkillMastered(s.attempts, s)).length;
  const pct = totalCrits ? Math.round((masteredCrits / totalCrits) * 100) : 0;

  const cards = skills
    .map((skill) => {
      const progress = skillProgress(skill.attempts, skill);
      const confidence = confidenceFromRatings(skill.ratings, skill);
      const mastered = progress.isMastered;
      return `
      <div class="skill-card ${mastered ? "mastered" : ""}" data-skill-id="${skill.id}">
        <button class="skill-main" data-action="open" data-skill-id="${escapeHtml(skill.id)}">
          <h3>${escapeHtml(skill.name)}</h3>
          <span class="meta">${escapeHtml(skill.category)} · ${progress.mastered}/${progress.total} crits pass twice · ${skill.attempts.length} practice attempts</span>
        </button>
        ${mastered ? '<span class="badge-mastered">✦ Mastery glow</span>' : ""}
        <div class="comfort-wrap">
          <div class="comfort-label"><span>Comfort</span><span>${confidence}%</span></div>
          <div class="comfort-meter"><div class="comfort-fill ${comfortClass(confidence)}" style="width:${confidence}%"></div></div>
          <div class="comfort-label"><span>${comfortWord(confidence)}</span></div>
        </div>
      </div>`;
    })
    .join("");

  return `
    <div class="dash-bar">
      <button class="btn btn-primary" data-action="open-night-sheet">🌙 Pre-checkoff night sheet (print)</button>
      <button class="btn btn-primary" data-action="add-skill">+ Add a skill</button>
    </div>

    <div class="overall-card">
      <h2>Overall: ${masteredCrits}/${totalCrits} critical lines pass twice across all skills</h2>
      <div class="overall-bar-wrap"><div class="overall-bar" style="width:${pct}%"></div></div>
      <p class="hint" style="margin:0.4rem 0 0">${masteredSkills} of ${skills.length} skills fully mastered (every crit passed twice)</p>
    </div>

    <div class="skill-list" id="skill-list">${cards || '<p class="hint">No skills yet — add one above.</p>'}</div>
  `;
}

/* ---------------- render: skill detail ---------------- */

function findSkill(id) {
  return state.skills.find((s) => s.id === id);
}

function renderSkillDetail(id) {
  const skill = findSkill(id);
  if (!skill) {
    return `<button class="back-link" data-action="home">← Back to all skills</button>
      <div class="panel"><p>Skill not found. It may have been deleted.</p></div>`;
  }
  const progress = skillProgress(skill.attempts, skill);
  const confidence = confidenceFromRatings(skill.ratings, skill);
  const mastered = progress.isMastered;

  const critRows = skill.crits
    .map((crit) => {
      const passedTimes = progress.perCrit[crit.id] || 0;
      const rating = skill.ratings[crit.id] || "";
      const rowMastered = passedTimes >= 2;
      return `
      <div class="crit-row ${rowMastered ? "mastered" : ""}">
        <span class="crit-circles" title="Passed twice: ${passedTimes}/2">${critCircles(passedTimes)}</span>
        <span class="crit-text">${escapeHtml(crit.text)}</span>
        <select class="rating-select" data-skill-id="${escapeHtml(skill.id)}" data-crit-id="${escapeHtml(crit.id)}" aria-label="Self-rating for: ${escapeHtml(crit.text)}">
          <option value="">No self-rating</option>
          <option value="unsure" ${rating === "unsure" ? "selected" : ""}>🙏 Unsure</option>
          <option value="getting" ${rating === "getting" ? "selected" : ""}>🌤 Getting it</option>
          <option value="solid" ${rating === "solid" ? "selected" : ""}>⭐ Solid</option>
        </select>
      </div>`;
    })
    .join("");

  const attemptChecks = skill.crits
    .map((crit) => {
      const passedTimes = progress.perCrit[crit.id] || 0;
      return `
      <div class="crit-check">
        <input type="checkbox" id="chk-${escapeHtml(crit.id)}" data-attempt-crit="${escapeHtml(crit.id)}"
          ${passedTimes >= 2 ? "disabled checked" : ""} />
        <label class="attempt-crit-label" for="chk-${escapeHtml(crit.id)}">${escapeHtml(crit.text)}${passedTimes >= 2 ? " (already 2 ✔)" : ""}</label>
      </div>`;
    })
    .join("");

  const history = [...skill.attempts].reverse();
  const historyTable = history.length
    ? `<table class="history-table"><thead><tr><th>Date</th><th>Score</th><th>Passed</th><th></th></tr></thead><tbody>
      ${history
        .map(
          (a) => `<tr>
            <td>${escapeHtml(a.date)}</td>
            <td>${attemptScore(skill, a)}%</td>
            <td>${skill.crits.filter((c) => a.results[c.id] === "pass").length}/${skill.crits.length}</td>
            <td><button class="btn-ghost" data-action="delete-attempt" data-attempt-id="${escapeHtml(a.id)}" aria-label="Delete attempt on ${escapeHtml(a.date)}">delete</button></td>
          </tr>`
        )
        .join("")}
      </tbody></table>`
    : `<p class="hint">No practice attempts logged yet. Log your at-home or open-lab practice — the glow comes when every crit has passed in two separate attempts.</p>`;

  return `
    <button class="back-link" data-action="home">← Back to all skills</button>

    <div class="detail-header">
      <div>
        <h2>${mastered ? "✦ " : ""}${escapeHtml(skill.name)}</h2>
        <span class="meta">${escapeHtml(skill.category)} · ${progress.mastered}/${progress.total} mastered · Comfort ${confidence}% (${comfortWord(confidence)})</span>
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary" data-action="print-one">🖨 Print this skill's one-pager</button>
        <button data-action="reset-skill">Reset this skill</button>
        <button class="btn-danger" data-action="delete-skill">Delete skill</button>
      </div>
    </div>

    <div class="panel">
      <h3>Rubric critical lines — pass twice to master</h3>
      <p class="hint">● = passed in a logged attempt. Every crit needs <strong>two separate passing attempts</strong> for the mastery glow.</p>
      ${critRows}
    </div>

    ${mastered ? `<div class="panel mastered-panel" style="border-color: var(--glow); background: rgba(243,199,60,0.12);"><h3>✦ Mastery glow unlocked</h3><p class="hint" style="margin:0">Every critical line has passed in two separate logged attempts. That's the glow. Rest easy, then keep it warm with a quick run-through tonight.</p></div>` : ""}

    <div class="panel attempt-form">
      <h3>Log a practice attempt</h3>
      <p class="hint">Today, ${todayISO()} — check each crit you performed correctly this time.</p>
      ${attemptChecks}
      <button class="btn btn-primary" data-action="log-attempt" data-skill-id="${escapeHtml(skill.id)}">Save practice attempt</button>
    </div>

    <div class="panel">
      <h3>Practice history (${skill.attempts.length})</h3>
      ${historyTable}
    </div>
  `;
}

/* ---------------- render: night sheet ---------------- */

function renderNightSheetControls() {
  return `
    <button class="back-link" data-action="home">← Back to all skills</button>
    <div class="panel">
      <h2 style="margin:0 0 0.4rem">Pre-checkoff night one-pager</h2>
      <p class="hint">A quiet, printable page for the night before: what already glows, what still needs a second pass, and where your comfort sits. Hit <strong>Print / Save as PDF</strong> below (or Ctrl/Cmd+P) — only the sheet prints.</p>
      <div class="print-controls">
        <button class="btn btn-primary" data-action="print-now">🖨 Print / Save as PDF</button>
      </div>
    </div>
  `;
}

function renderNightSheet() {
  const skills = state.skills;
  const pages = skills
    .map((skill) => {
      const progress = skillProgress(skill.attempts, skill);
      const confidence = confidenceFromRatings(skill.ratings, skill);
      const next = nextUpCrits(skill.attempts, skill, 5);

      const critLines = skill.crits
        .map((crit) => {
          const times = progress.perCrit[crit.id] || 0;
          const mark = times >= 2 ? "✔✔" : times === 1 ? "○○" : "·  ";
          return `<div class="sheet-crit ${times >= 2 ? "needed" : ""}"><span class="box">${mark}</span><span>${escapeHtml(crit.text)}</span></div>`;
        })
        .join("");

      const focusLines = next.length
        ? next
            .map(
              (n) =>
                `<div class="sheet-crit needed">→ <span>${escapeHtml(n.crit.text)} <em>(${n.passedTimes}/2 — needs ${n.needed} more pass${n.needed > 1 ? "es" : ""})</em></span></div>`
            )
            .join("")
        : '<div class="sheet-crit needed">→ All crits at 2/2. One calm run-through to keep it warm, then sleep.</div>';

      return `
      <section class="sheet-page">
        <h2>${escapeHtml(skill.name)} — night-before checklist</h2>
        <p class="sheet-sub">${escapeHtml(skill.category)} · ${progress.mastered}/${progress.total} crits pass twice · Comfort ${confidence}% (${comfortWord(confidence)}) · ${skill.attempts.length} logged attempts</p>
        ${skill.steps ? `<div class="sheet-body"><strong>Flow:</strong> ${escapeHtml(skill.steps)}</div>` : ""}
        <div class="sheet-check"><strong>Critical lines:</strong>${critLines}</div>
        <div class="sheet-check"><strong>Focus for tonight's run-through:</strong>${focusLines}</div>
        <div class="sheet-footer">Pre-checkoff study sheet · education only, never clinical advice · official rubric wins · Asdale Dynamics, LLC</div>
      </section>`;
    })
    .join("");

  return pages;
}

/* ---------------- events ---------------- */

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", onAction);
  });
  document.querySelectorAll("select.rating-select").forEach((el) => {
    el.addEventListener("change", onRatingChange);
  });
}

function onAction(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;
  switch (action) {
    case "home":
      window.location.hash = "#/";
      break;
    case "open": {
      const id = target.dataset.skillId;
      // Discard trailing hash history noise; simple navigate.
      event.preventDefault();
      window.location.hash = `#/skill/${id}`;
      break;
    }
    case "add-skill":
      addSkill();
      break;
    case "open-night-sheet":
      window.location.hash = "#/night-sheet";
      break;
    case "print-now":
      window.print();
      break;
    case "print-one": {
      // Print only this skill: temporarily render just one page.
      const sheetRoot = document.getElementById("print-sheet-root");
      sheetRoot.innerHTML = oneSkillSheet(route.id);
      window.print();
      sheetRoot.innerHTML = "";
      break;
    }
    case "log-attempt":
      logAttempt(target.dataset.skillId);
      break;
    case "delete-attempt":
      deleteAttempt(route.id, target.dataset.attemptId);
      break;
    case "reset-skill":
      resetSkill(route.id);
      break;
    case "delete-skill":
      deleteSkill(route.id);
      break;
    default:
      break;
  }
}

function onRatingChange(event) {
  const skill = findSkill(event.target.dataset.skillId);
  if (!skill) return;
  const critId = event.target.dataset.critId;
  const value = event.target.value;
  if (value) skill.ratings[critId] = value;
  else delete skill.ratings[critId];
  saveState(state);
  render(); // refresh comfort meters
}

function addSkill() {
  const name = window.prompt("Skill name (e.g., 'Sterile Gloving'):");
  if (!name) return;
  const critsRaw = window.prompt(
    "Critical lines, one per line (your program's rubric wording):",
    "- Line one\n- Line two"
  );
  if (!critsRaw) return;
  const lines = critsRaw
    .split("\n")
    .map((l) => l.replace(/^[-•*\s]+/, "").trim())
    .filter(Boolean);
  if (!lines.length) {
    window.alert("Please include at least one critical line.");
    return;
  }
  const id = `custom-${Date.now().toString(36)}`;
  const skill = makeSkill(id, name.trim(), "My skills", lines);
  state.skills.push(skill);
  saveState(state);
  window.location.hash = `#/skill/${id}`;
}

function logAttempt(skillId) {
  const skill = findSkill(skillId);
  if (!skill) return;
  const results = {};
  skill.crits.forEach((crit) => {
    const el = document.querySelector(`input[data-attempt-crit="${CSS.escape(crit.id)}"]`);
    results[crit.id] = el && el.checked ? "pass" : "miss";
  });
  skill.attempts.push(makeAttempt(uid(), todayISO(), results));
  saveState(state);

  if (progress.isMastered) {
    window.setTimeout(() => {
      const existing = document.querySelector(".mastery-toast");
      if (existing) existing.remove();
      const toast = document.createElement("div");
      toast.className = "mastery-toast";
      toast.style.cssText =
        "position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);" +
        "background:var(--glow);color:#5c4400;font-family:sans-serif;font-weight:600;" +
        "padding:0.7rem 1.2rem;border-radius:999px;box-shadow:0 0 18px rgba(243,199,60,0.65);z-index:50";
      toast.textContent = "✦ Mastery glow unlocked — every crit passed twice!";
      document.body.appendChild(toast);
      window.setTimeout(() => toast.remove(), 4000);
    }, 150);
  }
  render();
}

function deleteAttempt(skillId, attemptId) {
  const skill = findSkill(skillId);
  if (!skill) return;
  skill.attempts = skill.attempts.filter((a) => a.id !== attemptId);
  saveState(state);
  render();
}

function resetSkill(skillId) {
  const skill = findSkill(skillId);
  if (!skill) return;
  if (!window.confirm(`Reset all attempts and self-ratings for "${skill.name}"?`)) return;
  skill.attempts = [];
  skill.ratings = {};
  saveState(state);
  render();
}

function deleteSkill(skillId) {
  const skill = findSkill(skillId);
  if (!skill) return;
  if (!window.confirm(`Delete "${skill.name}" and its history? This can't be undone.`)) return;
  state.skills = state.skills.filter((s) => s.id !== skillId);
  saveState(state);
  window.location.hash = "#/";
}

function oneSkillSheet(skillId) {
  const original = [...state.skills];
  const skill = findSkill(skillId);
  state.skills = skill ? [skill] : [];
  const html = renderNightSheet();
  state.skills = original;
  return html;
}

/* ---------------- boot ---------------- */

applyRoute();
