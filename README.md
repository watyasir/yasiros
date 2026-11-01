# Decko (repo: yasiros)

A personal life dashboard with a 90-day **Winter Arc** season on top. One place to see and log health, workouts, body, tasks, goals and money, built to keep growing: new areas of life are added as data, not new code.

**Live demo (fake data, no login):** https://yasiros.vercel.app/demo

It's also a portfolio project. I'm a vibe coder: I planned, designed, directed and reviewed; [Claude Code](https://claude.com/claude-code) wrote the code. The whole process is logged in [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md).

## What it does

- **Daily check-in in under 60 seconds** on a phone: steppers, switches and 1–5 scales for every tracker, one "Done" button.
- **Winter Arc season:** day X of 90, current and best streak, % of days with every target hit, and a 90-cell strip of the season.
- **Workouts and body:** log sets in seconds with "Repeat last workout", see lift progress and a weekly weight chart against a goal.
- **Tasks and goals:** a Board (To do / In progress / Waiting / Done), due-today and overdue tiles, goals linked to trackers.
- **Shareable progress card** (`/progress`): a portrait card made for a phone screenshot, plus a private link for an accountability group.
- **Money:** a scheduled Claude task reads an existing finance sheet and pushes a snapshot to the API; the dashboard shows it as a wallet stack (one tab per bank and card, front card = left to spend), spend vs income, a 50/20/30 split against target and the top spends.
- **API for automations:** `POST /api/log`, `GET /api/summary` and `POST /api/money`, behind one secret token ([`docs/API.md`](docs/API.md)), so Claude's scheduled tasks can log and read without anyone opening the app.
- **Demo mode:** `/demo` runs the whole app on made-up data, so anyone can click around.

## Screenshots

All taken from `/demo` (sample data):

| Screen | Where |
|---|---|
| Overview bento on a laptop: Winter Arc hero, Next up, Money, Check-in, Weight, Diet, Claude's jobs | [`/demo`](https://yasiros.vercel.app/demo) at 1280px |
| The same bento on a phone, with the tab bar and a reminder toast | `/demo` at 390px |
| Health: weight, steps and sleep line charts | [`/demo/health`](https://yasiros.vercel.app/demo/health) |
| Board view | `/demo/board` |
| Daily check-in sheet | [`/demo/log`](https://yasiros.vercel.app/demo/log) on a phone |
| Workout logger with "Repeat last workout" | [`/demo/log/workout`](https://yasiros.vercel.app/demo/log/workout) |
| Shareable Winter Arc card | [`/demo/progress`](https://yasiros.vercel.app/demo/progress) on a phone |

## Stack

| Part | Tool | Why |
|---|---|---|
| App | Next.js (App Router) + TypeScript | A web app that works well on a phone |
| Styling | Tailwind CSS | Every colour and font is a token in one file |
| Database + login | Supabase (Postgres + Auth) | Real database, email sign-in, row-level security |
| Hosting | Vercel (Mumbai region) | Auto-deploys from GitHub, runs next to the database |
| Money data | Snapshots pushed to `POST /api/money` | Money already lives in a finance sheet; a Claude task reads it, so the app needs no Google access |

The look is "Playground" (v9): a bento-grid Overview with one dark hero tile and a soft colour per tile, in three themes (Candy, Matcha, Sunset) you can switch in Settings. Bricolage for headings, Inter for words, JetBrains Mono for labels. Tiles tilt a little under the mouse, finished days get confetti, and all of it switches off with reduced motion. Every text colour passes 4.5:1 in all three themes (checked by `npm run contrast`), tap targets are 44px and focus is always visible. Charts are one small hand-written SVG component, no chart library. Full spec in [`docs/DESIGN.md`](docs/DESIGN.md).

## How it grows

The app is built from a few generic pieces, so a new area of life is a new row, not a new feature:

- **Tracker:** anything measured over time. Name, area (Health, Body, Mind, Skills, Money, Custom), type (`checkbox`, `number`, `scale_1_5`, `duration_minutes`), optional unit and a daily or weekly target. Adding one in `/settings` puts it in the check-in, the stats and the season straight away.
- **Entry:** one value for one tracker on one date.
- **Season:** a time-boxed challenge (Winter Arc = 90 days) with a start date and per-tracker targets.
- **Tile registry:** every Overview tile is one line in [`src/modules/registry.ts`](src/modules/registry.ts). A new module is a folder in `src/modules/` plus one entry there.

Workouts, tasks, goals and money have their own tables because their shape is different, but they plug into the same registry. `/demo` and the real dashboard share one data shape ([`src/modules/types.ts`](src/modules/types.ts)), so every tile works on both.

## Privacy

The repo is public; the data isn't. Real data lives only in Supabase, locked to one account by row-level security, and only one email can sign in. A pre-commit check ([`scripts/privacy-check.mjs`](scripts/privacy-check.mjs)) blocks commits that look like they contain personal details. The share card is public only through a secret token in its link and shows nothing beyond its six numbers.

## How I built it with AI

Every session followed the same loop: one phase per session, a short prompt from me, Claude Code builds and checks it in a real browser, then logs what happened. A few things that stood out:

- **Design first, in chat.** Four design passes on a canvas before any code (editorial → Apple HIG → light "Winter dawn" → a card layout inspired by my Obsidian theme), then "Teal and grey" (v6) once the app was real, then "Soft bento" (v8), and finally "Playground" (v9) with three themes. The spec lives in `docs/DESIGN.md` and the code follows its changelog.
- **Fake data first.** Phase 1 built the whole dashboard on made-up data at `/demo`. Every later phase swapped real data into the same tiles, so the demo never broke.
- **A privacy scare, caught early.** Before the first push, a check found real details in the design mockups (names, a card number, amounts). They were replaced before anything went public, and the pre-commit privacy check came out of it.
- **Bugs found by looking, not guessing.** A "Log Today" button had teal text on a teal background because a global link rule won; the weight chart's labels shrank too small on phones; a 30-per-row season strip turned into dots on a phone (now 15 per row).
- **Speed, from one response header.** The dashboard took 1–2 s after a check-in. Vercel's `x-vercel-id` header showed the server code running in the US while the database sat in Mumbai, so every read crossed the world. One line in `vercel.json` moved it to Mumbai.
- **Scope cuts are decisions too.** A Gmail inbox and an AI-assistant link were designed, then dropped when simpler options looked better. Their code was deleted, not hidden, to keep the app lean.

What I did myself: sign-ups, approving logins, and every product and design call. Claude Code wrote and tested the code; the full session-by-session story is in [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md), and the phase plan in [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md).

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in the values you need
npm run dev
```

`/demo` works with no settings at all. The real dashboard needs a Supabase project (run the files in `supabase/migrations/` in order) and `ALLOWED_EMAIL`.
