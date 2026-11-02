# Build Plan: Decko (was "Yasir OS")

> **All phases below are done** (19–26 Oct 2026). Later work (redesigns v8–v10, the Decko rebrand, the security pass) is in `docs/PROGRESS.md` and `docs/BUILD_LOG.md`. For the current state, read the "▶ Start here" block at the top of `docs/PROGRESS.md`.

One phase = one Claude Code session. Each phase ends with something that works and that you can see. Paste the **kickoff prompt** to start that session. Don't start a new phase in the same session; start a fresh session for it (this keeps usage low).

---

## Phase 0: Setup (you do most of this, ~20 min)

**You do:**
1. Create free accounts: GitHub, Supabase, Vercel (sign up to Vercel *with* GitHub).
2. Install Claude Code if it isn't already, and open it in an empty folder named `winter-arc-dashboard`.
3. Copy `CLAUDE.md` and the `docs/` folder from this brief into that folder.
4. Ask Claude Code to install the Apple design skills: `npx skills add raintree-technology/apple-hig-skills` (MIT, 14 Apple HIG skills plus the `hig-doctor` audit). Run `npx hig-doctor .` at the end of every phase to catch design-rule misses.

**Kickoff prompt:**
> Read CLAUDE.md and docs/BUILD_PLAN.md. Do Phase 0: create the Next.js + TypeScript + Tailwind project in this folder, set up git, create .env.example, create docs/PROGRESS.md from the phase list, and a placeholder home page that says "Winter Arc Dashboard". Then walk me step by step through pushing it to a new GitHub repo and deploying it on Vercel. Stop after it's live.

**Done when:** a live Vercel link shows the placeholder page.

---

## Phase 1: The look (demo data only)

Build the full dashboard **visually**, on fake data. It's the most satisfying phase and your first portfolio screenshot.

**Kickoff prompt:**
> Phase 1. Read docs/DESIGN.md and the files in docs/design-reference/. Build the design tokens (v6 "Teal and grey", see DESIGN.md §2b) and the full dashboard at /demo with fake data from src/data/demo: sidebar with rainbow folders and trackers tree, header card with dashed rule, Overview (season strip, stats with sparklines, Today, Money, Weight, Goals, Habits, In progress), plus the Board view switched from the sidebar, all on fake data. Match the reference files exactly. Show me how to view it.

**Done when:** `/demo` looks finished on phone and laptop.

---

## Phase 2: Database + login + daily check-in

**You do:** create a Supabase project, then paste its URL and keys into `.env.local` and Vercel when Claude Code asks.

**Kickoff prompt:**
> Phase 2. Set up Supabase: tables for trackers, entries, seasons (with migrations), row-level security so only the logged-in user sees their data, and email magic-link login allowed only for ALLOWED_EMAIL. Seed my default trackers (sleep hours, water, workout done, study minutes, skincare done, hair routine done, mood 1-5, steps). Build /log: a phone-friendly daily check-in that takes under 60 seconds. Tell me exactly what to paste where.

**Done when:** you can log in on your phone and save today's check-in.

---

## Phase 3: Real dashboard

**Kickoff prompt:**
> Phase 3. Make / show my real data using the same tiles as /demo: today's status, streaks, 7/30-day trends, weekly targets hit. Empty states should say what to log. Keep /demo working on fake data.

**Done when:** the dashboard updates the moment you log.

---

## Phase 4: Workouts + body

**Kickoff prompt:**
> Phase 4. Add workouts (session date, exercises, sets x reps x weight) with a fast "repeat last workout" button, and weekly body check (weight, waist, chest, arms, progress photo yes/no). Add tiles: workouts this week, lift progress per exercise, weight trend vs target.

---

## Phase 5: Tasks + goals

**Kickoff prompt:**
> Phase 5. Add tasks (title, area, due date, done) and goals (title, area, target, deadline, progress linked to a tracker or manual). Tiles: today's tasks, overdue, goal progress bars.

---

## Phase 6: Money (snapshots pushed by Claude)

**Decided 26 Oct 2026:** no Google service account. The app never reads the sheet. Claude's scheduled finance task reads the Personal Finance sheet and pushes a snapshot to `POST /api/money` (same `API_TOKEN` as Phase 8), e.g. twice a day. Built together with Phase 8.

**Snapshot:** month, income, expenses, per-category spends, needs/wants/savings actual vs target (targets 50/20/30), each bank's balance, each card's unpaid dues + due date, available spendable, updated_at. Stored in the owner-locked `money_snapshots` table; the tiles read the latest one. Body format in `docs/API.md`.

**Tiles:** wallet stack (one tab per bank and per card, front card = available spendable), spend vs income, 50/20/30 bars with target markers, top categories, "Updated <time>". Empty state until the first snapshot; `/demo` stays fake.

**You do:** run the migration in Supabase, set `API_TOKEN` in Vercel, then point the finance task at the endpoint (Claude chat). Per-bank balances need rows in the sheet if it only has a combined balance.

---

## Phase 7: Winter Arc season + custom trackers

**Kickoff prompt:**
> Phase 7. Add seasons: a "Start Winter Arc" button that sets today as day 1 of 90, with targets per tracker. Show day X/90, days left, % targets hit, best streak. Add /settings where I can create a new tracker (name, area, type, unit, target) without code, and it appears in /log and on the dashboard automatically.

**Done when:** you can add something new to track in 30 seconds.

---

## Phase 8: Automation (less work for you)

**Kickoff prompt:**
> Phase 8. Add a secure logging API (POST /api/log with a secret token) so my Claude scheduled tasks can log entries for me. Add a daily summary endpoint that returns today's missing logs and the Winter Arc status as JSON. Document both in docs/API.md.

**Built 26 Oct 2026** with Phase 6: `POST /api/log`, `GET /api/summary`, `POST /api/money`, all behind env `API_TOKEN` (no token set = 503, the app still works).

**After this:** Claude (chat) connects your existing scheduled tasks to it, so check-in reminders and logs reach the dashboard without you.

---

## Phases 8b and 8c — DROPPED (27 Oct 2026)

Mail nudges (8b) and the Instinct link (8c) were dropped for good. Their code, demo data and docs were deleted; a migration drops their tables if they exist. Don't rebuild them.

## Phase 9: Share + portfolio polish

**Scheduled (21 Oct 2026):** Fri 23 Oct night, after 8. Build it on `/demo` data; drop it to a later night if it's past 1:30 AM.

**Kickoff prompt:**
> Phase 9. Add a "progress card" page that shows my Winter Arc stats in a shareable layout (for my accountability group). Then write a strong README: what it is, screenshots from /demo, stack, how it grows, and a short "how I built it with AI" section drawn from docs/BUILD_LOG.md.

**Done when:** the GitHub page reads like a case study.

---

## Later ideas (not planned yet)
- German practice tracker, trips and "cool stuff" bucket list (saving goals now show on Finance → "Saving for"; a reading log exists as the Pages read tracker)
- Weekly review page fed by the Sunday review task
- Done since: install as a phone app (PWA, 29 Oct), saving goals (v10)
- Parked 21 Oct: Zendesk-style extras (alert strip, countdown, smart tags, connected-apps strip, weekly result card, collapsible tiles, NEW tag)
