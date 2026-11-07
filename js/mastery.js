// Pure mastery / progress logic for nursing-lab-checkoff-tracker-webapp.
// Kept framework-free so it runs identically in the browser and in node --test.
// Education only — never clinical advice.

export const CRIT_LEVELS = {
  unsure: 0,
  getting: 1,
  solid: 2,
};

export const CIRCLES_NEEDED = 2;

export function makeSkill(id, name, category, critTexts, steps = "") {
  return {
    id,
    name,
    category,
    steps,
    crits: critTexts.map((text, i) => ({ id: `${id}-c${i + 1}`, text })),
    attempts: [],
    ratings: {},
  };
}

export function makeAttempt(id, date, results) {
  return { id, date, results };
}

export function normalizeAttempt(attempt, skill) {
  if (!attempt || typeof attempt !== "object") return null;
  const results = {};
  const raw = attempt.results || {};
  for (const crit of skill.crits) {
    results[crit.id] = raw[crit.id] === "pass" ? "pass" : "miss";
  }
  return {
    id: typeof attempt.id === "string" ? attempt.id : "",
    date: typeof attempt.date === "string" ? attempt.date : "",
    results,
  };
}

export function critPassedTimes(attemptList, critId) {
  if (!Array.isArray(attemptList)) return 0;
  let count = 0;
  for (const attempt of attemptList) {
    if (attempt && attempt.results && attempt.results[critId] === "pass") count += 1;
  }
  return count;
}

export function critStatus(attemptList, skill, critId) {
  const times = critPassedTimes(attemptList, critId);
  return times >= CIRCLES_NEEDED ? "mastered" : times > 0 ? "in-progress" : "not-started";
}

export function skillProgress(attemptList, skill) {
  const total = skill.crits.length;
  let mastered = 0;
  const perCrit = {};
  for (const crit of skill.crits) {
    const passedTimes = critPassedTimes(attemptList, crit.id);
    perCrit[crit.id] = passedTimes;
    if (passedTimes >= CIRCLES_NEEDED) mastered += 1;
  }
  return { total, mastered, perCrit, isMastered: total > 0 && mastered === total };
}

export function isSkillMastered(attemptList, skill) {
  return skillProgress(attemptList, skill).isMastered;
}

export function confidenceFromRatings(ratings, skill) {
  const levels = Object.values(CRIT_LEVELS);
  let sum = 0;
  let count = 0;
  for (const crit of skill.crits) {
    const value = ratings ? ratings[crit.id] : undefined;
    if (value in CRIT_LEVELS) {
      sum += CRIT_LEVELS[value];
      count += 1;
    } else {
      sum += CRIT_LEVELS.unsure;
      count += 1;
    }
  }
  if (count === 0 || levels.length === 0) return 0;
  const max = levels[levels.length - 1];
  return Math.round((sum / count / max) * 100);
}

export function attemptScore(skill, attempt) {
  if (!attempt || !attempt.results) return 0;
  const total = skill.crits.length;
  if (total === 0) return 0;
  let passed = 0;
  for (const crit of skill.crits) {
    if (attempt.results[crit.id] === "pass") passed += 1;
  }
  return Math.round((passed / total) * 100);
}

export function nextUpCrits(attemptList, skill, limit = 5) {
  const progress = skillProgress(attemptList, skill) || { perCrit: {} };
  const list = [];
  for (const crit of skill.crits) {
    const passedTimes = progress.perCrit[crit.id] || 0;
    if (passedTimes < CIRCLES_NEEDED) {
      list.push({
        crit,
        passedTimes,
        needed: Math.max(CIRCLES_NEEDED - passedTimes, 0),
      });
    }
  }
  list.sort((a, b) => a.passedTimes - b.passedTimes);
  return list.slice(0, limit);
}
