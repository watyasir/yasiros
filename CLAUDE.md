# Decko (repo: yasiros)

**Decko** (repo and code name `yasiros`; the display name since 2 Nov 2026, was "Yasir OS"): a personal life dashboard for Yasir. Only the name people see changed: the repo, the address `yasiros.vercel.app`, every route and every API URL stay as they are (Apple Calendar feeds and the finance task depend on them). Winter Arc is only the 90-day season feature (chip, page, hero), never the product name. One place to see and log health, workouts, body, tasks, goals and money, with a 90-day "Winter Arc" season on top. It is built to keep growing: new areas of life get added as new trackers, without rebuilding the app.

It is also a **public portfolio project**. Yasir is a vibe coder: he directs, prompts and reviews; you write the code. Explain what you did in plain words, not jargon.

## Read this first, every session

1. Read `docs/PROGRESS.md` to see which phase is done and which one is next.
2. Work on **one phase only**, the one Yasir names. Do not start the next phase on your own.
3. Read only the files the phase needs. Do not scan the whole repo.
4. At the end of the session:
   - tick off finished items in `docs/PROGRESS.md`
   - add an entry to `docs/BUILD_LOG.md` (template below)
   - commit with a clear message
5. **Save progress as you go, not only at the end** (usage limits can cut a session off mid-task). After each finished step: tick it in `docs/PROGRESS.md` with one line on what's done and what's next, and commit (`git commit -m "..."`). When a new session starts or Yasir types "continue", read `docs/PROGRESS.md` and `git status` first, finish any half-done step, then carry on.
6. Do dashboard work yourself (Supabase SQL editor and migrations, Vercel and GitHub settings, via Chrome or a CLI), even when the request says "add it to the checklist" or "for the morning": do it, then record it as done. Only hand Yasir what you're not allowed to do (sign-ups, passwords, typing secret keys, payments, deleting data), as short numbered steps.

## Stack

| Part | Tool | Why |
|---|---|---|
| App | Next.js (App Router) + TypeScript | Web app that also works well on a phone |
| Styling | Tailwind CSS | Fast, consistent design tokens |
| Charts | One small SVG `LineChart` (no library) | Light, themed, accessible |
| Database + login | Supabase (Postgres + Auth) | Free tier, real database, email login |
| Hosting | Vercel | Free tier, live link, auto-deploy from GitHub |
| Money data | Snapshots pushed to `POST /api/money` by Claude's finance task (no Google service account, 26 Oct 2026) | Money already lives in his Personal Finance sheet |

Keep dependencies few. Ask before adding any new library.

## Hard rules

- **No personal data in the repo.** The repo is public. Real data lives only in Supabase. No names, amounts, bank details or health info in code, seeds, comments, screenshots or commits.
- **Secrets only in `.env.local`** (and Vercel env settings). Keep `.env.example` updated with empty placeholders. Never commit `.env.local`.
- **The Google Sheet is read-only for this app.** Another system already writes to it. The app must never write, format or create anything in that sheet.
- **Demo mode must always work.** `/demo` shows the full dashboard with fake data and no login. That is what recruiters and visitors see.
- **Only Yasir can log in** to the real dashboard (allow-list one email via env var `ALLOWED_EMAIL`).
- **Logging must be fast.** The daily check-in should take under 60 seconds on a phone. If a feature makes logging slower, say so before building it.
- **Mobile first.** Design for a 390px wide phone screen, then widen for desktop.
- **Keep the code lean:** delete unused code, no hidden or parked features. Run a dead-code check (`npx knip`) before finishing a phase.
- **Checks must stay green.** GitHub Actions runs the privacy check, contrast, lint, build, types, knip and `npm audit` on every push (`.github/workflows/checks.yml`); fix a red run before anything else. Back up with `npm run backup` (Mac only; never commit `backups/`).
- All money in Indian rupees, formatted Indian style: ₹1,25,000. Dates as `18 Oct 2026`. Timezone `Asia/Kolkata`.

## How the app grows (important)

Everything is built from a few generic pieces, so new things are added as data, not new code:

- **Tracker**: anything measured over time. Has a name, area (Health, Body, Mind, Skills, Money, Custom), type (`checkbox`, `number`, `scale_1_5`, `duration_minutes`, `time_of_day`, `choice`), optional unit, optional daily/weekly target, optional group (trackers in one group share a card on the check-in, like Meals or Blood pressure).
- **Entry**: one value for one tracker on one date.
- **Season**: a time-boxed challenge (Winter Arc = 90 days). Has a start date, length and targets. Only one active at a time.
- **Tiles**: every tile is the shared `Tile`; the Overview places them by grid area (`bento` in globals.css), the other pages stack them in a simple grid.

Workouts, tasks, goals and money get their own tables because their shape is different.

## Design rule: v9 Playground (30 Oct 2026)

**Read `docs/DESIGN.md` before any UI work.** It is the full spec and has a changelog; if the code doesn't match the latest entry, update the code. Apple HIG, v6 "Teal and grey" and v8 "Soft bento" are retired: don't bring them back.

Short version:
- **Light only, three themes:** Candy (default), Matcha, Sunset. Each theme is a set of `--th-*` variables on `[data-theme]` in `src/app/globals.css`, mapped to Tailwind colours by `@theme inline` (`page`, `ink`, `soft`, `hero`, `accent`, `dot-on`, `t-tasks`, `t-money`, ...). Never a hex value in a component. The demo is always Candy.
- **Contrast:** every text/background pair ≥ 4.5:1 in all three themes. Run `npm run contrast` after any colour change.
- **App icon "Bento":** `public/icons/icon.svg` (4 tiles on `#2d2a70`) is the source; the PNGs, `src/app/favicon.ico`, `src/app/icon.svg` and the iPhone launch screens in `public/splash/` are rendered from it.
- **Type:** `display` (Bricolage 800) for headings and big numbers, Inter for words, `label` (JetBrains Mono 700, uppercase 11px) for tile headings. All via `next/font`.
- **Components:** one `Tile` (tones + tilt), one SVG `LineChart`, one `useConfetti`, one `Toast`. No chart or animation library. Files under ~250 lines.
- **Behaviour:** tilt and glare on mouse devices only; confetti ≤ 120 pieces; one toast at a time with optional Undo; `prefers-reduced-motion` turns motion off; every control a labelled button or link with a 44px target and a visible focus ring; every write optimistic with rollback and an error toast.
- **Pages (v10 Focus):** 4 tabs: Overview `/` (the only bento: Today, Next up, Money, Winter Arc strip), Health `/health`, Finance `/finance`, Work `/work` (goal cards), each again under `/demo`; plus Check-in `/log` and Settings (Gallery, share card, Claude's jobs). `/money`, `/board`, `/winter-arc` redirect. No task pop-ups or reminder toasts; the Toast is only for Undo and errors.

## Folder layout (target)

```
src/
  app/            routes: / and /health, /finance, /work, /gallery (+ /demo/...), /log, /login, /settings, /progress, /api
  components/     shared UI (Tile, LineChart, Chip, Segmented, ...) and the app shell (dashboard/)
  modules/        one folder per page (overview, health, finance, work, gallery)
  lib/            supabase client, sheets client, date + rupee helpers
  data/demo/      fake data for /demo
docs/
  PROGRESS.md     phase checklist
  BUILD_LOG.md    what was built each session (portfolio case study material)
  BUILD_PLAN.md   the full phased plan
supabase/
  migrations/     database schema changes, in order
```

## BUILD_LOG entry template

```
## Session N — <date> — Phase X: <name>
**Goal:**
**What I asked Claude Code to do:** (Yasir's main prompt, short)
**What got built:**
**What broke and how we fixed it:**
**What Yasir had to do himself:** (sign-ups, keys, clicks)
**Screenshot to take:** (which screen is worth showing)
**Next:**
```

## Talking to Yasir

- Plain words, short. No lectures.
- When you finish, tell him: what works now, how to see it (link or command), and what he needs to do, if anything.
- If you hit a blocker, name it, then give the fix. Don't loop on retries.
