// Tests for mastery thresholds and crit-pass logic.
// Run with: npm test  (node --test tests/)

import test from "node:test";
import assert from "node:assert/strict";

import {
  CRIT_LEVELS,
  CIRCLES_NEEDED,
  makeSkill,
  makeAttempt,
  critPassedTimes,
  critStatus,
  skillProgress,
  isSkillMastered,
  confidenceFromRatings,
  attemptScore,
  nextUpCrits,
  normalizeAttempt,
} from "../js/mastery.js";

function demoSkill() {
  return makeSkill("s1", "Demo Skill", "Test", ["Wash hands", "Identify patient", "Check pulse"]);
}

function attemptFor(skill, passIds, id = "a1") {
  const results = {};
  for (const crit of skill.crits) {
    results[crit.id] = passIds.includes(crit.id) ? "pass" : "miss";
  }
  return makeAttempt(id, "2026-01-15", results);
}

test("CIRCLES_NEEDED is 2 (every crit must pass in two separate attempts)", () => {
  assert.equal(CIRCLES_NEEDED, 2);
});

test("rating levels exist and top out at 'solid'", () => {
  assert.deepEqual(Object.keys(CRIT_LEVELS).sort(), ["getting", "solid", "unsure"]);
  assert.equal(CRIT_LEVELS.solid, 2);
});

test("empty attempt list => nothing mastered", () => {
  const skill = demoSkill();
  assert.equal(critPassedTimes([], skill.crits[0].id), 0);
  assert.equal(critStatus([], skill, skill.crits[0].id), "not-started");
  assert.equal(isSkillMastered([], skill), false);
});

test("one passing attempt for a crit is not mastery for that crit", () => {
  const skill = demoSkill();
  const attempts = [attemptFor(skill, [skill.crits[0].id], "a1")];
  assert.equal(critPassedTimes(attempts, skill.crits[0].id), 1);
  assert.equal(critStatus(attempts, skill, skill.crits[0].id), "in-progress");
});

test("two passing attempts for every crit => skill mastered", () => {
  const skill = demoSkill();
  const attempts = [attemptFor(skill, skill.crits.map((c) => c.id), "a1")];
  assert.equal(isSkillMastered(attempts, skill), false); // only once each
  attempts.push(attemptFor(skill, skill.crits.map((c) => c.id), "a2"));
  assert.equal(isSkillMastered(attempts, skill), true);
  assert.equal(skillProgress(attempts, skill).mastered, skill.crits.length);
});

test("passes must be in separate logged attempts (2 passes inside ONE attempt do not count twice)", () => {
  const skill = demoSkill();
  const oneAttempt = [attemptFor(skill, skill.crits.map((c) => c.id), "only")];
  assert.equal(critPassedTimes(oneAttempt, skill.crits[0].id), 1);
  assert.equal(isSkillMastered(oneAttempt, skill), false);
});

test("partial mastery: all crits passing twice except one => not mastered", () => {
  const skill = demoSkill();
  const passAllButLast = [skill.crits[0].id, skill.crits[1].id];
  const attempts = [
    attemptFor(skill, passAllButLast, "a1"),
    attemptFor(skill, passAllButLast, "a2"),
  ];
  const progress = skillProgress(attempts, skill);
  assert.equal(progress.mastered, 2);
  assert.equal(progress.total, 3);
  assert.equal(progress.isMastered, false);
  assert.equal(critStatus(attempts, skill, skill.crits[2].id), "not-started");
});

test("deleting the only second pass removes mastery", () => {
  const skill = demoSkill();
  const attempts = [attemptFor(skill, skill.crits.map((c) => c.id), "a1")];
  attempts.push(attemptFor(skill, skill.crits.map((c) => c.id), "a2"));
  assert.equal(isSkillMastered(attempts, skill), true);
  attempts.pop();
  assert.equal(isSkillMastered(attempts, skill), false);
});

test("skill with no crits is never mastered (avoid vacuous truth)", () => {
  const skill = makeSkill("empty", "Empty", "Test", []);
  assert.equal(isSkillMastered([], skill), false);
});

test("zero-crit progress reports zero and not-mastered", () => {
  const skill = makeSkill("empty", "Empty", "Test", []);
  const progress = skillProgress([], skill);
  assert.equal(progress.total, 0);
  assert.equal(progress.mastered, 0);
  assert.equal(progress.isMastered, false);
});

test("confidenceFromRatings: no ratings => 0%", () => {
  const skill = demoSkill();
  assert.equal(confidenceFromRatings({}, skill), 0);
  assert.equal(confidenceFromRatings(undefined, skill), 0);
});

test("confidenceFromRatings: all solid => 100%, mixed averages", () => {
  const skill = demoSkill();
  const solid = {};
  skill.crits.forEach((c) => (solid[c.id] = "solid"));
  assert.equal(confidenceFromRatings(solid, skill), 100);
  const mixed = {};
  mixed[skill.crits[0].id] = "unsure";
  mixed[skill.crits[1].id] = "getting";
  mixed[skill.crits[2].id] = "solid";
  assert.equal(confidenceFromRatings(mixed, skill), Math.round(((0 + 1 + 2) / 3 / 2) * 100));
});

test("attemptScore computes percentage of passed crits", () => {
  const skill = demoSkill();
  const attempt = attemptFor(skill, [skill.crits[0].id, skill.crits[1].id], "x");
  assert.equal(attemptScore(skill, attempt), Math.round((2 / 3) * 100));
  assert.equal(attemptScore(skill, null), 0);
});

test("nextUpCrits prioritizes lowest pass counts and caps count", () => {
  const skill = makeSkill("many", "Many", "Test", ["c1", "c2", "c3", "c4"]);
  const attempts = [
    attemptFor(skill, [skill.crits[0].id, skill.crits[1].id], "a1"),
    attemptFor(skill, [skill.crits[0].id, skill.crits[1].id], "a2"),
    attemptFor(skill, [skill.crits[2].id], "a3"),
  ];
  const next = nextUpCrits(attempts, skill, 2);
  assert.equal(next.length, 2);
  assert.equal(next[0].crit.id, skill.crits[3].id); // 0/2 first
  assert.equal(next[1].crit.id, skill.crits[2].id); // 1/2 second
});

test("normalizeAttempt coerces unknown crit results to miss", () => {
  const skill = demoSkill();
  const attempt = attemptFor(skill, [], "n1");
  attempt.results[skill.crits[0].id] = "huh";
  const norm = normalizeAttempt(attempt, skill);
  assert.equal(norm.results[skill.crits[0].id], "miss");
  assert.equal(norm.results[skill.crits[1].id], "miss");
  assert.deepEqual(
    skill.crits.map((c) => critPassedTimes([norm], c.id)),
    [0, 0, 0]
  );
});

test("normalizeAttempt ignores unknown crit keys not in skill", () => {
  const skill = demoSkill();
  const attempt = makeAttempt("n2", "2026-01-16", { bogus: "pass" });
  const norm = normalizeAttempt(attempt, skill);
  assert.equal("bogus" in norm.results, false);
  assert.equal(Object.keys(norm.results).length, 3);
});
