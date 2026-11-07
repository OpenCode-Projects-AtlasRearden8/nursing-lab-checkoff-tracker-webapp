# STATUS.md

## What was built

**Skills Lab Checkoff Tracker** — a static, local-first study webapp for
nursing students preparing for skills-lab checkoffs.

Features:

- **Skill library** — 9 pre-loaded common skills-lab skills with example
  critical-line rubrics (hand hygiene, vital signs, oral med pass, sterile
  dressing change, peripheral IV insertion, indwelling urinary catheter, IM/SQ
  injection, oxygen setup, turning & positioning). Users can add custom skills
  and paste their own program's rubric wording.
- **Rubric critical lines ("crits")** — each crit shows a two-circle status
  (○○ → ●○ → ●●) tracking passes across separate logged practice attempts.
  Each crit also has a 3-level self-rating (Unsure / Getting it / Solid).
- **Practice attempts** — a per-skill log of dated attempts with per-crit
  pass/miss, per-attempt score, and deletable history.
- **Comfort confidence meter** — per-skill meter derived from self-ratings
  (0–100%, labeled Shaky / Warming up / Confident).
- **Mastery glow** — when every crit has passed in **two separate logged
  attempts**, the skill card gets a pulsing golden glow plus a toast. Skill is
  included in the overall "passed twice" progress bar on the dashboard.
- **Pre-checkoff night one-pager** — printable per skill or for all skills:
  crits with ✔✔ status, a "focus tonight" list ranked by lowest pass counts,
  comfort level, and an education-only footer. `@media print` hides everything
  except the sheet.
- **Education-only framing** — persistent site disclaimer; the night sheet and
  footer repeat it. No clinical decision support of any kind.
- **Local-first** — no backend, no build step, no dependencies. State (skills,
  attempts, ratings, custom skills) persists in browser localStorage.

Distinct from sibling tools: `clinical-rotation-log-webapp` (site visits during
rotations) and `nclex-style-quiz-trainer` (question practice). This one is for
the skills lab: rubrics, reps, and the night before.

## How to run it

No build step and no runtime dependencies.

```bash
# Option A: serve locally (recommended — needed by some browsers for ES modules)
npm start            # python3 -m http.server 8080 → http://localhost:8080

# Option B: open index.html directly in a browser
```

Any static file server works. All data stays in the browser's localStorage;
clearing browser data clears progress.

## How to test

```bash
npm test             # node --test tests/ — 16 tests, no packages to install
```

## Verification results

- `npm test` → **16/16 passing** (node --test, zero dependencies). Coverage
  includes the mastery thresholds: empty state, single pass ≠ mastery, two
  separate passing attempts for all crits → mastery, passes inside one attempt
  don't double-count, one crit short → not mastered, deleting the second pass →
  mastery removed, zero-crit skills never marked mastered, comfort ratings math,
  attempt score, next-up ranking, and result normalization.
- `node --check` passes on all three JS modules.
- `python3 -m http.server` smoke test: `/`, `/styles.css`, `/js/mastery.js`,
  `/js/skills-data.js`, `/js/app.js` all return HTTP 200.
- Logic smoke test in Node: `defaultSkills()` builds 9 skills; a skill with two
  full passing attempts reports `isSkillMastered === true`; default skills with
  empty attempts are all unmastered.
- License check: `LICENSE` copyright line is exactly
  `Copyright (c) 2026 Asdale Dynamics, LLC`; README credits Asdale Dynamics, LLC.

## Known gaps

- No automated UI/browser tests (logic is tested headlessly; rendering was
  verified by module serving/parse checks). A headless-browser pass could be
  added if a runner is available.
- Mastery history: deleting an attempt that removed the glow can re-lock a
  skill; no separate "ever-mastered" badge is kept.
- Night sheet prints one page per skill (a `page-break-after`); a program with
  many custom skills prints multiple pages rather than a literal single page.
- Self-ratings are manual per crit; no automatic blending of attempt scores
  into the comfort meter.
- Export/backup is manual (no JSON import/export yet); localStorage data is
  per-browser and clearing site data clears progress.
- Example rubric wording is simplified for study and explicitly subordinated to
  the user's official program rubric.
