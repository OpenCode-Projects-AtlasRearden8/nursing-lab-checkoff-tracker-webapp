# Skills Lab Checkoff Tracker

A quiet, local-first study webapp for nursing students working toward skills-lab
checkoffs. Track every rubric critical line ("crit"), log practice attempts,
gauge your comfort, and earn the **mastery glow** — the warm golden shimmer a
skill earns when every crit has passed in **two separate practice attempts**.
It also prints a calm **pre-checkoff night one-pager** so the night before is
review, not panic.

Built by [Asdale Dynamics, LLC](https://dylanasdale.github.io) — plain-language,
friendly tools and education. Like a friend would.

> **Education only, never clinical advice.** This app is a study aid. Your
> nursing program's official rubric and your instructors are always the
> authority on how any skill is performed or evaluated. Nothing here should be
> applied to real patient care.

## What it does

- **Skill library** — 9 common skills-lab skills arrive pre-loaded with example
  critical-line rubrics (hand hygiene, vital signs, med pass, sterile dressing,
  IV insertion, foley catheter, injections, oxygen setup, turning & positioning).
  Every skill is editable: add your own skills and paste in *your program's*
  rubric wording.
- **Critical lines with circles** — each crit tracks ○○ → ●○ → ●●. Two filled
  circles means it passed in two separate logged attempts.
- **Practice attempts** — log a practice run, check the crits you performed
  correctly, and see the whole history with dates and scores.
- **Self-rating per crit** — 🙏 Unsure / 🌤 Getting it / ⭐ Solid.
- **Comfort confidence meter** — a per-skill meter derived from your
  self-ratings (Shaky → Warming up → Confident).
- **Mastery glow** — when *every* crit in a skill has been passed in two
  separate attempts, the skill card gets a golden pulsing glow (and a toast
  celebrates the unlock). It's the app's only flourish, and it's earned.
- **Pre-checkoff night one-pager** — a printable page per skill (or all skills):
  crits with ✔✔ status, tonight's focus list (lowest pass counts first), your
  comfort level, and a footer reminder that it's education, not advice.

## How mastery works

A critical line is "passed" when you check it during a logged practice attempt.
A skill is **mastered** when every one of its crits has at least 2 passing
logged attempts. Two passes inside a *single* attempt don't count as mastery —
the point is repeatability across sessions. (These thresholds are covered by
the automated tests; see below.)

## Running it

No build step, no dependencies, no backend, no accounts. Everything lives in
your browser's localStorage.

Option 1 — just open the file:

```
open index.html        # macOS
xdg-open index.html    # Linux
# or double-click index.html in your file manager
```

Option 2 — serve it locally (recommended, and required by some browsers for
ES modules on `file://`):

```
npm start              # python3 -m http.server 8080
# then visit http://localhost:8080
```

Any static file server works — that's all it needs.

## Running the tests

The mastery thresholds and crit-pass logic are pure ES modules, so they're
tested with Node's built-in test runner (no packages to install):

```
npm test        # node --test tests/  — 16 tests
```

## Privacy & data

- Local-first: all progress (attempts, ratings, custom skills) is stored in
  your browser's localStorage. Nothing is uploaded, ever. There is no server.
- Clearing your browser data clears your progress.
- No secrets, no API keys, no personal data in the codebase.

## Sibling tools

Deliberately distinct from the other Asdale Dynamics study tools:

- `clinical-rotation-log-webapp` — logging site visits during clinical rotations
- `nclex-style-quiz-trainer` — practicing questions

This one is for the skills lab: rubrics, reps, and the night before.

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Asdale Dynamics, LLC.
