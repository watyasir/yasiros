# Progress

| Phase | Name | Status |
|---|---|---|
| 0 | Setup: scaffold, git, GitHub, Vercel | ✅ Done (19 Oct 2026) |
| 1 | The look (demo data only) | ✅ Done (19 Oct 2026) |
| 2 | Database + login + daily check-in | ✅ Done (20 Oct 2026) |
| 3 | Real dashboard | ✅ Done (20 Oct 2026) |
| 4 | Workouts + body | ✅ Done (21 Oct 2026) |
| 5 | Tasks + goals | ✅ Done (21 Oct 2026) |
| 6 | Money (snapshots via the API) | ✅ Done (26 Oct 2026) |
| 7 | Winter Arc season + custom trackers | ✅ Done (21 Oct 2026) |
| 8 | Automation (logging API) | ✅ Done (26 Oct 2026) |
| 8b | Mail nudges | ❌ Dropped (27 Oct 2026), code deleted |
| 8c | Instinct link | ❌ Dropped (27 Oct 2026), code deleted |
| 9 | Share + portfolio polish | ✅ Done (26 Oct 2026) |
| v8 | Soft bento redesign + own pages | ✅ Done (30 Oct 2026), replaced by v9 |
| v9 | Playground look, 3 themes | ✅ Done (30 Oct 2026) |
| v10 | Focus: 4 tabs, Work goal cards, app feel | ✅ Done (1–2 Nov 2026) |
| — | Rebrand to Decko, Bento icon | ✅ Done (2 Nov 2026) |
| — | Security + reliability pass | ✅ Done (2 Nov 2026) |
| v10.2 | Section check-ins | ✅ Done (10 Nov 2026) |
| v10.3 | On-hold goals and tasks | ✅ Done (13 Nov 2026) |

## ▶ Start here (current state, 10 Nov 2026)
Read this block first; the sections below it are history, oldest first.

**What's live** (yasiros.vercel.app, display name "Decko"): v10 Focus on the v9 Playground look. 4 tabs: Overview `/` (Today's 5 things as buttons that each open one check-in section, Next up, Money (one line until a bank has a balance), Winter Arc strip), Health `/health`, Finance `/finance`, Work `/work` (goal cards; on-hold goals and tasks small and grey until their start date); Check-in `/log` (a list of 5 sections + More, each opens the same sheet at `/log?section=<key>`); Settings (themes, season, trackers, calendar feeds, sign-in code, Gallery, share card, Claude's jobs). Every page again under `/demo` on fake data. `/money`, `/board`, `/winter-arc` redirect. No task pop-ups.

**Database:** every file in `supabase/migrations/` up to `20261102000001_task_goals.sql` has been run (the on-hold `20261113000001_task_start_date.sql` hasn't yet, see Still open) on the live Supabase project. A new migration must be additive, and the app must keep working before it's run (catch Postgres `42703`, as `src/lib/task-store.ts` and `src/lib/tracker-store.ts` do).

**Checks before every push** (GitHub Actions runs them too, `.github/workflows/checks.yml`): `npm run build`, `npm run lint`, `npx tsc --noEmit`, `npx knip`, `npm run contrast`, `npm run privacy-check -- --all`, `npm audit --omit=dev`. Push to `main`, then confirm Vercel is green: `gh api repos/watyasir/yasiros/commits/<sha>/status`.

**Still open**
- [ ] Mac must: run the migration in the Supabase SQL editor (`supabase/migrations/20261113000001_task_start_date.sql`, adds `tasks.start_date`; until then task start dates are dropped, goal on-hold already works)
- [ ] Yasir, GitHub: two-factor login; Settings → Advanced Security → Dependabot alerts + security updates on; Settings → Rules → ruleset for `main` with only "Restrict deletions" and "Block force pushes" (not "Require a pull request")
- [ ] Yasir: free uptime monitor (e.g. UptimeRobot) on `https://yasiros.vercel.app/api/health`, every 5 minutes, email alert
- [ ] Mac session: run `npm run backup` once to confirm it works, then weekly (or as a scheduled task)
- Done 3 Nov: the sign-in email carries a code to type inside the iPhone app (Resend as Supabase's SMTP sender, free plan, test sender to Yasir's own address). Settings → "Sign in on another device" still works too

**Where things are**
| What | Where |
|---|---|
| Spec and design rules (latest changelog wins) | `docs/DESIGN.md` |
| API for Claude's tasks (log, summary, money, tasks, goals, claude-jobs, day-plan, calendar, gallery, health) | `docs/API.md` |
| What happened each session | `docs/BUILD_LOG.md` |
| Pages and routes | `src/app/` (real), `src/app/demo/` (fake data), `src/app/api/` |
| App shell, tabs, Check-in + Settings buttons | `src/components/dashboard/` (`Dashboard.tsx`, `Nav.tsx`, `DashboardContext.tsx`) |
| One folder per page | `src/modules/overview`, `health`, `finance`, `work`, `gallery`; shared types in `src/modules/types.ts` |
| Shared pieces | `src/components/` (`Tile`, `LineChart`, `Toast`, `Skeleton`, `useConfetti`, …) |
| Check-in sections (which trackers, when done), the sheet, /log list | `src/lib/checkin-sections.ts`, `src/components/checkin/` (`SectionSheet`, `useSectionSave`, `CheckInHub`, `TrackerRows`) |
| Turning database rows into what pages show | `src/lib/dashboard/` (`load.ts` reads, `build.ts` + `extras.ts` shape; Today's 5 things in `buildFocus`) |
| Themes and all colours | `src/app/globals.css` (`--th-*` per theme); contrast check `scripts/contrast.mjs` |
| Fake data for /demo | `src/data/demo/` |
| App icon and launch screens | `public/icons/icon.svg` (source), `public/icons/*.png`, `src/app/icon.svg`, `favicon.ico`, `apple-icon.png`, `public/splash/` |
| Offline + install | `public/sw.js` (cache version `v3`), `src/app/manifest.ts`, `src/app/offline/` |
| Error pages, health check, robots | `src/app/error.tsx`, `global-error.tsx`, `not-found.tsx`, `src/app/api/health/`, `src/app/robots.ts` |
| Security headers, redirects | `next.config.ts` |
| Sign-in | `src/app/login/` (email link, email code, Settings code), `src/proxy.ts` (who may see which page), `src/lib/auth.ts`, `src/lib/signin-code.ts` |
| Scripts | `scripts/privacy-check.mjs` (pre-commit + CI), `scripts/contrast.mjs`, `scripts/backup.mjs` (`npm run backup`, Mac only, writes git-ignored `backups/`) |
| Environment variables (names only) | `.env.example`; real values in `.env.local` and Vercel |

## Decisions & schedule (21 Oct 2026)

**Decisions**
- **Winter Arc starts Mon 26 Oct 2026**, day 1 of 90. Test data wiped 21 Oct with "Reset test data" (checked: 0 entries, workouts, body checks, tasks, goals; 8 trackers and the season kept). Real logging starts Mon 26 Oct.
- **Design stays on v6** ("Teal and grey"), never older designs. Not a hard freeze: where a feature needs a design or layout change, make it with v6 tokens and components (Yasir chose this over a strict freeze, 21 Oct).
- **Gmail: no full inbox.** Phase 8b is "Mail nudges": Claude posts the emails that need Yasir through the API; he reads and replies in Gmail.
- **Tracker targets** get decided with Yasir when Phase 6 is finalized.
- **Product name is "Yasir OS"** (renamed 26 Oct 2026 from "Yarizz's Dashboard"): tab titles, header/logo, metadata, README. Code/repo name `yasiros`. Winter Arc is only the season feature (chip, page, hero), never the product name.

**Schedule**
- **Fri 23 Oct, night:** Phase 8, 8b, 8c, then 9. Phase 9 runs on `/demo` data; drop it if it's past 1:30 AM.
- **Sat 24 Oct, night:** Phase 6 Money, after Yasir brainstorms it with Claude chat.
- **Sun 25 Oct:** rename the web address and GitHub repo to match "Yarizz's Dashboard" (new Vercel domain, Supabase sign-in URLs updated, old link stops working).

**Phase 6 leaning (not final)**
- No Google service account. Claude's scheduled finance task pushes a money snapshot to `POST /api/money` twice a day.
- The sheet has one combined bank balance plus per-card dues, not per-bank balances.

**Open decisions**
- Sign-in length: 7 days or 30 days, now that Gmail sign-in is gone.
- Per-bank balances: would need new rows in the sheet.

**Parked for later**
- Zendesk-style extras: alert strip, countdown, smart tags, connected-apps strip, weekly result card, collapsible tiles, NEW tag
- German tracker
- Trips / "cool stuff" fund

## Phase 0 checklist
- [x] Node.js installed
- [x] Next.js + TypeScript + Tailwind project created
- [x] Apple HIG skills installed (`npx skills add raintree-technology/apple-hig-skills`)
- [x] Git repo set up
- [x] `.env.example` created
- [x] `docs/PROGRESS.md` created
- [x] Placeholder home page says "Winter Arc Dashboard"
- [x] Pushed to GitHub (watyasir/winter-arc-dashboard)
- [x] Deployed on Vercel, live link works: https://yasiros.vercel.app

## Phase 1 checklist
- [x] Design tokens: Catppuccin Latte colours, text-safe variants, fonts (`src/app/globals.css`)
- [x] Shared UI pieces (`src/components/`): Card, SectionHeading, Button, Chip, CheckBox, Switch, Sparkline, ProgressBar, Icon
- [x] Fake data in `src/data/demo/`, one data shape in `src/modules/types.ts`
- [x] Tile registry (`src/modules/registry.ts`) with all Overview tiles: season strip, stats, Today, Inbox preview, Money, Weight, Goals, Habits, In progress
- [x] Sidebar with rainbow folders and collapsible trackers tree; header card with dashed rule
- [x] Inbox, Board and Instinct views, switched from the sidebar
- [x] Instinct status pill (demo: waiting with timer, then "replied" for 3.5 s)
- [x] Checked on laptop (1440px) and phone (390px); `npx hig-doctor .` clean
- [x] Moved on: the phone home screen and check-in sheet were built in Phases 2 and 3

## Design v6 "Teal and grey" (20 Oct 2026)
- [x] Design docs committed ("Design v6: Teal and grey + wallet stack")
- [x] Tokens renamed to v6 meanings, grey frame, white cards, teal brand, dark teal hero, pill controls
- [x] Wallet stack in the Money tile (fake accounts, tab opens account detail)
- [x] Checked at 1440px and 375px; `npx hig-doctor .` clean
- [x] Pre-commit privacy check (`scripts/privacy-check.mjs`, turned on by `npm install` via `prepare`)

## Phase 2 checklist
- [x] Migration: trackers, entries, seasons + row-level security (`supabase/migrations/`)
- [x] Login: email sign-in link, only `ALLOWED_EMAIL` gets in (`/login`, `/auth/confirm`, `src/proxy.ts`)
- [x] Default trackers added on first visit: sleep, water, workout, steps, skincare, hair, study, mood
- [x] `/log` check-in sheet (steppers, switches, segments, Done → Saved ✓), plus `/demo/log` on fake data
- [x] Supabase project (Mumbai), migration run, auth URLs set, `.env.local` written (20 Oct)
- [x] Tested on the Mac: signed in with the email link, saved a check-in (8 trackers, 8 entries in the database)
- [x] Vercel: `NEXT_PUBLIC_SUPABASE_URL` + `ALLOWED_EMAIL` set; publishable key is a code default (`src/lib/supabase/config.ts`); pushed and live (20 Oct)
- [x] Signed in on the iPhone at the live link and saved a check-in (20 Oct, 2:40 AM IST, confirmed in the database). Phase 2 done.
- [x] Moved to Phase 3: phone home screen with the tab bar (`Phone.dc.html`), done there

## Phase 3 checklist
- [x] Real data on `/` with the same tiles as `/demo`: today's status, streak, 7-day averages, this week vs weekly targets, 4-week habit grid (`src/lib/dashboard/`)
- [x] Empty states that say what to log (season, money, weight, goals, inbox, board)
- [x] Tapping a yes/no row on Today saves it and the numbers update straight away; `/log` refreshes `/` on save
- [x] Phone home screen with the floating tab bar (`Phone.dc.html`): Today, Arc, Board, Money tabs + round Log button, shown under 640px on `/` and `/demo`
- [x] Fixed: "Log Today" button text was teal on teal (global link colour won); plain links only get the teal now
- [x] Checked at 375px and desktop on `/demo` and on the real builder with test rows; `npx hig-doctor .` clean
- [x] Live check (20 Oct): Yasir's real rows give 8 of 8 logged and correct stats; tapping Hair routine on the phone ticks/unticks and saves straight to the database

## Phase 4 checklist
- [x] Migration: workouts, workout_sets (saved together by `save_workout`), body_checks, user_settings (goal weight), each locked to its owner. Run on Supabase (20 Oct)
- [x] `/log/workout`: name, exercises, sets of reps × kg; one-tap "Repeat last workout"; new sets copy the one before; recent list with delete. Saving ticks "Workout done" for that day
- [x] `/log/body`: weekly weight, goal weight, waist, chest, arms, progress photo yes/no (only the yes/no is stored)
- [x] Tiles: Workouts this week (vs weekly target), Lift progress (heaviest set per session), Weight vs goal with measurements and a "Due" chip after 7 days
- [x] `/demo/log/workout` and `/demo/log/body` on fake data; demo tiles run fake workouts through the same builder
- [x] Links from `/log` ("More to log"); phone: Workouts on Today tab, Weight + Lifts on Arc tab
- [x] Checked at 1440px and 375px on `/demo`; `npx hig-doctor .` clean
- [x] Pushed and live on Vercel (20 Oct)
- [x] Marked done 21 Oct: Yasir's entries so far are test numbers; tiles work on them. Real logging starts with the season.

## Phase 5 checklist
- [x] Migration: tasks (title, area, due date, Board column, owner) and goals (target, unit, deadline, linked tracker or hand-typed progress) + `goal_progress` view, each locked to its owner
- [x] Board on real tasks: To do / In progress / Waiting / Done, add per column, move with the column picker, delete
- [x] Tiles: Due today, Overdue (tick = done), In progress on real tasks; phone Today tab lists overdue + due today
- [x] Goals page (`/log/goals`): add a goal (typed-in or from a tracker), update typed progress, delete; `/demo/log/goals` on fake data; Goals tile on real data with an "Update goals" link
- [x] Migration run on Supabase (21 Oct); checked at 1440px and 375px on `/demo`; `npx hig-doctor .` clean; build passes; pushed

## Phase 7 checklist
- [x] Hero card before the start date: "Starts in X days" (desktop + phone); started: day X of 90, days to go, % targets hit, streak, best streak
- [x] Links to `/settings`: sidebar "+ New tracker", hero "Start Winter Arc", "Season and trackers" on `/log`
- [x] `/settings`: Winter Arc start date + target per tracker, add a tracker (shows in /log and on the dashboard), Reset test data (with confirm).
- [x] Yasir's season set in Supabase (21 Oct): Winter Arc, day 1 = Mon 26 Oct 2026, 90 days, targets sleep 7, water 3, steps 8000, skincare, hair, study 90 min (weekly workout and mood not counted daily; switch on in /settings)
- [x] Checked `/settings` at 375px (on a throwaway local page, since it needs sign-in) and the hero on `/demo` at desktop; countdown checked against the builder; `npx hig-doctor .` clean; build passes; pushed

## Polish + speed (21 Oct 2026)
- [x] Server code runs in Mumbai (`vercel.json` region `bom1`), next to the database; it ran in the US before, adding ~250 ms per database read
- [x] Sign-in checked from the login token's signature on the server (no extra trip to Supabase); dashboard and check-in read everything in parallel
- [x] Fixed: `/settings` crashed after adding a tracker; done tasks no longer show due dates; goals with the same name no longer clash
- [x] ~~Targets for each tracker are decided with Yasir~~ Set 3 Nov (see "Open items": Season targets)

## Sign-in rules (20 Oct 2026)
- [x] Same browser stays signed in (login cookie lasts 400 days and refreshes on each visit)
- [x] Each device is signed out 7 days after its sign-in, with a clear message on `/login` (`src/lib/session.ts`, `src/proxy.ts`)
- [x] Dropped 21 Oct: Phase 8b is now mail nudges (no Gmail sign-in), so there's nothing to keep in step

## Cleanup (26 Oct 2026)
- [x] Inbox and Instinct hidden from the sidebar, header (Instinct pill) and Overview (Inbox preview) on `/` and `/demo`; code kept in `src/modules/inbox` and `src/modules/instinct`. Today and Money now share their row.

## Phase 9 checklist
- [x] `/progress` share card: day X/90, current + best streak, % targets hit this week (last week on Mondays), workouts this week, weight change. Portrait, dark teal hero, fits one phone screen
- [x] "Copy link" (shows the link to copy by hand if the clipboard is blocked); "Share progress" link on the Winter Arc hero
- [x] Public with `?t=<SHARE_TOKEN>`: numbers worked out on the server, only the card is sent; wrong or missing token = not found; not indexed, no referrer
- [x] `/demo/progress` on fake data with a "Sample data" chip
- [x] `SHARE_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` set in Vercel (Production) by Yasir; checked live 26 Oct: signed-in card shows day 1 with Copy link, the share link shows the card with no sign-in, a wrong token shows no card
- [x] README: what it is, screenshot list, stack, how it grows, how it was built with AI

## Design v6.1 layout split (26 Oct 2026)
- [x] Winter Arc data per tracker (targets this week, streaks, 13-week %) in the shared builder + demo data
- [x] Sidebar: Overview, Winter Arc, Board, Trackers (tree folds under Trackers); "Life, tracked"
- [x] Overview = whole life (Today · Tasks · Money / Body · Workouts · Goals / Habits · In progress) + "Day X/90 →" chip in the header
- [x] Winter Arc page: hero + 90-day strip, targets this week, streaks per tracker, week-by-week % (13 bars); header "Share card" opens the Phase 9 card
- [x] Phone: Today tab = life Overview in one column (chip, Today, Tasks, 2×2 Body/Workouts/Goals/Money, Habits 2 weeks, In progress); Arc tab = Winter Arc page stacked + Share card; tabs follow the shared view
- [x] Checked at 1440px and 375px on /demo (no sideways scroll, all phone targets 44px+); `npx hig-doctor .` clean (mockups excluded via `.higauditignore`); build passes; pushed

## Rename to Yasir OS (26 Oct 2026)
- [x] Product name "Yasir OS" in tab titles, sidebar logo text, welcome/sign-in pages, share card, metadata, README, CLAUDE.md; `package.json` name `yasiros`
- [x] GitHub repo renamed to `yasiros` (github.com/watyasir/yasiros; old URL redirects), git remote updated
- [x] Vercel: project renamed `yasiros`, domain `yasiros.vercel.app`; the old address was removed on Yasir's request (it now returns 404)
- [x] Supabase Auth: Site URL `https://yasiros.vercel.app`; Redirect URLs: `https://yasiros.vercel.app/**` and localhost only (old one removed)
- [x] Sign-in on the new address: email sent from yasiros.vercel.app/login, its link returns to `https://yasiros.vercel.app/auth/callback` (checked in the email)
- [x] Yasir signed in on the laptop at the new address

## Speed + sign-in landing (26 Oct 2026)
- [x] Signing in (email link or /login while signed in) lands on the dashboard, never the check-in; the check-in only opens from Log Today
- [x] Visited pages are reused for 2 minutes when going back and forth (`staleTimes`); saving still refreshes the dashboard at once
- [x] Log Today, Cancel/back links and the "More to log" links fully preload their page; the check-in's data is a private cache (`'use cache: private'`) so the preload includes it
- [x] Only the visible layout (phone or laptop) is rendered after load: about 1/3 less work on every tap and view switch
- Measured before (live, signed in): page loads 190–760 ms (slow ones = Vercel starting a fresh server), view switch ~60 ms on the laptop. Fluid compute was already on; server already in Mumbai
- Measured after (live): Log Today → check-in 14 ms (was 300–760 ms), Cancel → dashboard 10 ms, view switches 44–67 ms including two screen frames

## Phase 8 + 6 checklist (26 Oct 2026, overnight)
- [x] `POST /api/log`, `GET /api/summary`, `POST /api/money`, all behind env `API_TOKEN` (Bearer header, constant-time check). No token set = 503 and the app works as usual; wrong token = 401
- [x] Migration `20261026000001_money_snapshots.sql`: owner-locked `money_snapshots` (month, income, expenses, categories, needs/wants/savings actual vs target 50/20/30, banks, cards with dues + due date, spendable, updated_at). Not run yet
- [x] Money tile reads the latest snapshot: wallet stack (tab per bank and card, front card = available to spend), spend vs income, split bars with target markers, top 4 spends, "Updated <time>". Empty state until the first snapshot (also if the table doesn't exist yet). `/demo` stays fake, now in the same shape
- [x] No Google service account: BUILD_PLAN, README, CLAUDE.md and `.env.example` updated (`LOG_API_TOKEN` and the Google sheet vars replaced by `API_TOKEN`)
- [x] `docs/API.md` with example bodies (made-up amounts, no real bank names)
- [x] Checked: snapshot checker on good and bad bodies; 503 / 401 locally; Money tile at 1440px and 375px on /demo (no sideways scroll); build passes; `npx hig-doctor .` clean
- [x] Migration run in Supabase (26 Oct, via the SQL editor); snapshot insert dry-run in a rolled-back transaction: accepted, row-level security on, 0 rows left
- [x] `API_TOKEN` in Vercel (Production), redeployed. Live tests: summary 200 with real data; wrong/missing token 401; unknown tracker, bad value, future date, bad money body all 400; a real `/api/log` save (today's sleep value written back unchanged) 200
- [x] Fixed: `/api/log` said `"ok": true` when nothing was saved; now `"ok": false` with the skipped list
- [x] Signed-in pages at 375px (inside a 375px frame on the live site): no sideways scroll; "Back to dashboard" on workout and body pages raised to 44px
- [x] Finance task connected (26 Oct): its first tries were refused (one 401 wrong token, one 400 bad field; Vercel logs didn't say which field)
- [x] `/api/money` now accepts amounts as text ("₹12,000", "48%"), names the exact bad field and list position, and logs the reason (no amounts) in Vercel
- [x] First real snapshot saved 26 Oct, 10:37 PM (201); Money tile checked live at laptop and phone size. The finance task now sends one at 8:45 AM and 8:45 PM
- [x] Fixed: a long card name pushed its amount onto a hidden second line; names now shorten with "…" and amounts always show

## Final pass (26 Oct 2026, overnight)
- [x] New address `/winter-arc` (and `/demo/winter-arc`) opens the Winter Arc page; switching to it keeps `#winter-arc` in the address so a refresh stays there
- [x] Clicked through `/demo` (all views and phone tabs), `/demo/winter-arc`, `/demo/log`, `/demo/progress`, `/login`, and signed-out `/`, `/log`, `/settings`, `/progress` at 1440px and 375px: no sideways scroll, no tap targets under 44px on the phone, no console errors
- [x] Live, signed in (laptop width): `/`, `/winter-arc`, `/log`, `/settings`, `/progress` load with no errors; Money shows its empty state (table not created yet); `/api/summary` answers 503 until `API_TOKEN` is set

## Cleanup for speed (27 Oct 2026)
- [x] Mail nudges (8b) and the Instinct link (8c) dropped for good: Inbox and Instinct views, the Instinct status pill, their demo data, types and state deleted; their env placeholders removed
- [x] Migration `20261027000001_drop_nudges_instinct.sql` (drops `instinct_requests` and `mail_nudges` if they exist). Checked read-only in Supabase: neither table exists, so there was nothing to run
- [x] Dead code (`npx knip`, config in `knip.json`): removed the unused Stats, Due today, Overdue, Lift progress and Weight tiles, the Sparkline, their data (`stats`, `lifts`), 3 unused icons, 4 unused colour tokens and a few unused helpers; knip now reports nothing
- [x] `npm prune`; build cache cleared and rebuilt; `/demo` checked at 1440px and 375px (all views and phone tabs, check-in pages, share card): no sideways scroll, no small tap targets, no console errors; `npx hig-doctor .` clean
- [x] CLAUDE.md rule: keep the code lean, no hidden or parked features. Docs (CLAUDE.md, DESIGN.md v6.2, BUILD_PLAN.md, README) updated

## Tonight in 5 lines (26 Oct 2026)
1. Layout split, rename to Yasir OS and the share card were already done and live, so they were skipped.
2. New API for Claude's scheduled tasks: log tracker values, read today's summary, push money snapshots, all behind one token.
3. Money tile now shows real snapshots: wallet stack per bank and card, left to spend, spend vs income, 50/20/30 vs target, top spends.
4. `/winter-arc` now has its own address; every page checked on laptop and phone width.
5. Money goes live after you run one migration and add `API_TOKEN` (morning checklist at the top).

**Next up (old note):** Phase 6 (money from the Personal Finance sheet; get the sheet's cell map from Claude chat first). Optional: use Reset test data in /settings before 26 Oct so Winter Arc starts clean. Supabase's built-in email allows only 2 sign-in emails per hour.

## Tasks API + Board (26 Oct 2026, night)
- [x] Migration `20261027000002_tasks_api.sql`: tasks get `note`, `sort_order`, `external_id` (unique per user; app-made tasks get `app-…` automatically), `updated_by` (Yasir/Claude). Status, owner, area, due date, updated_at were already there. Run in Supabase by Claude (26 Oct, SQL editor via Chrome): success
- [x] `POST /api/tasks` (one or many, upsert by external_id; new tasks need a title, known ones change only what's sent), `GET /api/tasks` (`?status=todo,doing`), `DELETE /api/tasks/:external_id`, same `API_TOKEN`. API says owner `Yasir`, the database keeps `Me`. Documented in `docs/API.md`
- [x] Board: To do · In progress · Waiting on others · Done. Cards show owner chip, area, due date (yellow within 3 days, coral overdue) and note; most important first. Drag between columns on the laptop; tap a card to edit (title, note, area, due, who's on it, column, delete); "Add task" opens the same sheet. Done shows the latest 20 with "Show all"
- [x] Overview's In progress tile and the phone Board tab use the same tasks; `/demo` stays on fake tasks
- [x] Top priority pin: the open "Home" task with the highest order shows as a slim card at the top of Overview (laptop and phone), with its due date; tap opens the Board
- [x] Plan (31 phases, 5 sections) and 4 Claude jobs loaded through the live API; tasks API returns the new fields
- [x] Checked on `/demo` at 1440px and 375px: drag, edit, add, pin; no sideways scroll, no phone targets under 44px, no console errors. `npx hig-doctor .` clean, knip clean, build passes
- [x] Live API test on the real database: create, partial update (status only), new task without title refused (400), `?status=done` filter, delete, second delete 404. The test task was deleted afterwards

Build complete. From here: improvements only.

## My Day, calendar, Claude's jobs, owner tags, action gate (27 Oct 2026)
- [x] Migration `…_my_day_gate_jobs.sql`: tasks get `next_steps`, `questions`, `chat_name`, `gate_quiet_until`; new tables `gate_log`, `claude_jobs`, `day_plans` (row-level security on). Run in Supabase by Claude (27 Oct): success
- [x] **My Day** on Overview (laptop and phone): Now / Next from the day plan (India time, moves on by itself), the full day with the current phase marked, and folded Meals, Gym A / B, Skin, hair, body, Prep, Stock list. The plan is data in Supabase, sent through `POST /api/day-plan`; `/demo` has a made-up one
- [x] Yasir's Winter Arc Day plan (v3.1) retimed for the 1:30–10:30 PM shift: wake 7:30, gym 7:50, build block 10:00, ride 12:40, breaks 3:30 / 5:45 / 8:45, home 11:00, lights out 12:30 (7 h). Sat/Sun off: Saturday gym B, prep 10:30, Claude 4 h; Sunday rest, review 8:30 PM
- [x] **Calendar feed** `/api/calendar.ics?token=SHARE_TOKEN`: weekly repeating phases + all tasks with due dates as all-day events; subscribe with `webcal://` (signed in, `/progress` has a **Subscribe in Calendar** button). Subscribed on the Mac by Claude (27 Oct): iCloud calendar "Yasir OS", refresh every hour, so it syncs to the iPhone too. Live: 47 weekly routine events + 26 task days, 200 with the right token, 404 with a wrong one
- [x] **Claude's scheduled tasks**: `GET/POST /api/claude-jobs` (by name, same token) and `DELETE /api/claude-jobs?name=`, shown in a separate panel beside the Board (under it on smaller screens)
- [x] **Owner tags**: Claude orange `#D97757`, Me soft teal, Both neutral
- [x] **Action gate**: opens first on every visit for open tasks due within 3 days (overdue first, negative sort_order jumps the queue, max 3, one at a time). Dashboard blurred and locked; no close. Done · Doing it now · Snooze to tomorrow (hidden when more than a day overdue) · Move date. Each answer quiets the task until midnight IST and is logged in `gate_log`. Tasks API takes `next_steps`, `questions`, `chat_name`; a note "Next: … | Chat: "…"" works as a fallback
- [x] Plan (31 phases, 5 sections) and 4 Claude jobs loaded through the live API; tasks API returns the new fields
- [x] Checked on `/demo` at 1440px and 375px: gate (Esc does nothing, keyboard works, all 3 answers), My Day, Board + jobs panel; no sideways scroll, phone targets 44px. knip, hig-doctor, lint and build clean
- [x] `DELETE /api/claude-jobs?name=` added (27 Oct); "Bryan Johnson digest" and "Daily brain sweep" removed from the panel through it

## Run 29 Oct 2026: layout, M11, M12, M10, M4, M5
- [x] Layout: sidebar Overview · Winter Arc · Board · Check-in (opens /log; /demo/log on the demo); trackers tree and "+ New tracker" gone from the sidebar (New tracker lives in /settings); no "Log Today" in the page header; phone round button says Check-in; Overview has no pinned banner and no My Day. Their code, demo plan and types deleted; day_plans table and /api/day-plan kept for the calendar
- [x] M11 calendar: `&cat=` gives 9 coloured feeds (`X-WR-CALNAME` "Yasir OS · <Name>", `X-APPLE-CALENDAR-COLOR`); no `&cat` = old all-in-one feed. Phases take optional `cal`, with fallback rules checked against the live plan (31 phases). /settings → Calendar lists the 9 webcal links with copy buttons and colour dots; /progress "Subscribe in Calendar" goes there. Feed builder moved to `src/lib/calendar-feed.ts`
- [x] M5 code: phases take `from`/`until`; on those dates a dated phase replaces the undated one at the same start time; the feeds split weeks into date ranges with `RRULE UNTIL` (checked on the real plan: no doubles, Breakfast shortens to 20 min on exam days). Plan change waits for the deploy
- [x] M12 gallery code: private bucket `gallery` (25 MB, PNG/JPG/SVG/PDF/WebP) + `gallery_items` with row-level security (migration `…_gallery.sql`, run in Supabase by Claude: success). `POST /api/gallery` with an upload-only key (GALLERY_TOKEN, else HMAC of API_TOKEN): multipart for small files, signed upload link + confirm up to 25 MB; type checked from the file's own bytes; originals stored byte-for-byte. Key saved to `~/Claude/yasiros-gallery-key.txt`. Gallery in the sidebar and phone tabs: category tabs, thumbnail grid, full-size viewer (Fit / Actual size, pinch zoom), Download original, Share (file), Delete with confirm. Demo on 5 made-up images
- [x] ~~M12 live test: 3000 px+ PNG up and back, bytes compared~~ Done 30 Oct (Local steps item 10: byte-identical)
- [x] M10 PWA (29 Oct, cloud session): `src/app/manifest.ts` ("Yasir OS", standalone, theme `#f6f8fa`, icons 192/512/maskable 512 in `public/icons/`), apple-touch-icon 180 + `appleWebApp` metadata, hand-written `public/sw.js` (cache-first `/_next/static` + `/icons`, network-first pages with the last copy as fallback, `/offline` page precached with its CSS, sign-out clears saved pages, `?t=` share links never cached; `sw.js` sent no-cache). Checked on /demo in Chromium: worker activates, visited page opens offline, unvisited page shows the offline card
- [x] M10 sign-in code: /settings → "Sign in on another device" shows an 8-character code (HMAC of user id + minute with SUPABASE_SERVICE_ROLE_KEY; only that minute is stored, in app_metadata). Works once, 10 minutes, only the newest code, 5 wrong tries end it, only ALLOWED_EMAIL. /login → "Have a code?" → server checks it, makes a magic-link token with the admin API, verifies it on that device. 12/12 logic tests pass against a fake admin API; wrong-code message checked on /login at 375 and 1440. knip, hig-doctor, lint, build clean
  - [x] ~~Live: Add to Home Screen on the iPhone…~~ Moved to "Open items" at the end (one iPhone check for v10 + Decko)
- [x] M4 check-in matches the day plan (29 Oct, cloud session): new tracker types `time_of_day` (lights out, wake) and `choice` (7 meal slots: Planned / Swapped / Skipped, default Planned), a `group_name` so Meals and Blood pressure (morning + evening, systolic/diastolic) each share one card, and Reading page. All data: migration `20261030000001_day_plan_log.sql` adds the 14 trackers to the existing account. Blank typed numbers aren't saved (no stale BP). Today shows Meals and BP as one row each; season targets and goals skip the new types. /demo/log on fake values. Normal day = 5 actions (evening BP ×2, one swap, page, Done). knip, hig-doctor, lint, build clean; /demo and /demo/log at 1440, 390, 375: no sideways scroll, no phone targets under 44px, no console errors
  - [x] ~~Live: run the migration in Supabase before this deploys~~ Run 30 Oct (Local steps item 1); meal names moved to "Open items"
- [x] M5 plan change posted (29 Oct): +Exam revision 10:00 Mon–Fri from 2 Nov; +Walk 07:50 and +Leave for exam 09:40 on 17–21 Nov; 31 → 34 phases, nothing else changed
- [x] ~~Finish: build, knip, hig-doctor, lint, /demo, docs, deploy, live checks~~ Done in the final build (30 Oct); hig-doctor was retired with Apple HIG


## Final build checklist (30 Oct 2026, cloud session): Soft bento + close every queued item
Baseline: `npm ci`, build, lint, `tsc --noEmit` all clean (30 Oct). M4 + M10 + a hotfix (check-in works before the M4 migration) pushed and live on Vercel.

- [x] 1. Removed the 14 Apple HIG skills, `skills-lock.json`, `.higauditignore`, the hig-doctor rule (CLAUDE.md, DESIGN.md), the v6 mockups (`docs/design-reference/`), every v6 token, and dead code: sidebar, phone home, header chip, Card, SectionHeading, Habits / In progress / Tasks / Today / Season tiles, the old weight chart builder (knip clean)
- [x] 2. Soft bento tokens in one `@theme` block; Inter + JetBrains Mono via next/font; 3px blue focus ring; reduced motion; dark text on every peach/blue fill (fixed white-on-peach on Done/Save buttons, white tick on blue)
- [x] 3. Overview bento (`bento` grid areas, 4 → 2 → phone columns): Winter Arc hero (90 squares, today outlined), Next up (3 tasks, owner + due chip with a word), Money (accounts + left to spend + "updated"), Check-in (✓ Logged), Today (shift / Weekend off + current phase from the day plan), Weight (14 days), 1RK fund (goal with "1RK" in its name), Diet (meal chips), TYBBA study, Claude's jobs. Empty states, no fake numbers on the real app
- [x] 4. One SVG `LineChart` (no library): weight on Overview + Health, steps and sleep (wake − lights out, else Sleep hours) on Health with 14/30/90 days, daily consistency (0–100) on Winter Arc
- [x] 5. Own pages /winter-arc, /board, /money, /health, /gallery and /demo twins; top bar from 561px, 6-tab bar on the phone; signed-out visitors go to /login
- [x] 6. Layout cleanup verified: Check-in is a nav item (top bar pill), no Log Today button in a page header, no banner, no My Day (day plan data kept for the feeds and the Today tile)
- [x] 7. M4: + Weight in the check-in (typed kg, decimals fixed), migration `20261030000002_weight_tracker.sql`; the rest checked on /demo/log (lights out, wake, 7 meals Planned/Swapped/Skipped, reading page, BP morning + evening, steps); one Save; blank boxes aren't saved
- [x] 8. M5 exam mode: plan data posted 29 Oct; the code (`from`/`until` phases) builds and is unchanged. Live check left for the Mac (see Local steps)
- [x] 9. M10 PWA: "Y" mark icons (192, 512, maskable 512, apple-touch 180), theme/background `#FFF5E6`, worker v2 caches only `/_next/static`, `/icons` and the offline card (never pages, /api or auth), no reload on reopen. Chrome's installability check: no errors
- [x] 10. M11 calendar feeds build unchanged; M12 Gallery restyled; `POST /api/gallery` without `GALLERY_TOKEN` → 503 "Gallery key not set" (the API_TOKEN-derived fallback key is removed)
- [x] 11. Claude's jobs: status dot + word, "Last run 2h ago" (worked out in the browser); /api/claude-jobs unchanged
- [x] 12. Restyled Board, check-in, workout, body, goals, settings (checked on a throwaway page), login, share card, offline. Blocking action gate replaced by reminder toasts (Yasir, 30 Oct): tap to answer, Esc / ✕ closes, one at a time on the phone
- [x] 13. Every demo route + /, /login, /offline, /progress at 390 and 1280: no sideways scroll, no phone targets under 44px, no console errors. APIs: no key → 503, wrong key → 401. build, lint, tsc, knip clean

## Local steps (for the Mac session) — done 30 Oct 2026, 4 AM IST
- [x] 1. `…_day_plan_log.sql` run in the Supabase SQL editor by Claude: success (types now include time_of_day ×2, choice ×7; BP, reading page added)
- [x] 2. `…_weight_tracker.sql` run: success (weight is a check-in tracker)
- [x] 3. `GALLERY_TOKEN` in Vercel Production (Secret) = the key in `~/Claude/yasiros-gallery-key.txt` (form filled by Claude, value pasted by Yasir from the clipboard, clipboard cleared after); same value in `.env.local`; redeployed, green
- [x] 4. Signed in at 1280: `/`, `/winter-arc`, `/board`, `/money`, `/health`, `/gallery`, `/log`, `/settings` load, no console errors, no sideways scroll. Phone size (375): every `/demo` route, no sideways scroll, no target under 44px (Chrome can't emulate 375, so the signed-in phone pass is on the iPhone)
- [x] 5. `/log`: no "Update pending"; lights out, wake, 7 meals, BP, weight, reading all show. Test check-in (a test weight, Breakfast swapped) saved → Overview Diet showed 6/7 with Breakfast swapped; Weight needs 2 days for a trend (as designed). Test check-in deleted afterwards (16 rows, all written by the test; nothing else was logged that day)
- [x] 6. Today tile shows the weekday shift (12:40–11:00 PM) and "Now: Lights out" at night; M5 exam phases show in the feeds (Exam revision in Build & study, Walk in Gym & walk, Leave for exam in Commute)
- [x] ~~7. Reminder toasts~~ No longer applies: removed in v10 Focus
- [x] ~~8. iPhone check~~ Moved to "Open items" at the end
- [x] ~~9. Rename meal slots~~ Moved to "Open items" at the end
- [x] 10. M12: 3200×2400 PNG (multipart) and 3000×1000 PNG (9 MB, upload link) uploaded; downloads byte-identical (same SHA-256); both test uploads deleted. Wrong key → 401
- [x] APIs live: /api/tasks 200 (73), /api/claude-jobs 200 (8), /api/day-plan 200, /api/summary 200, no key → 401; /api/money is POST-only (405 on GET, expected). All 9 calendar feeds 200 with the right names and colours, all-in-one feed 200, wrong token 404. Manifest, /sw.js, icons, /offline 200. build, lint, tsc, knip clean
- Note: `.env.local` `SHARE_TOKEN` isn't the live one (Yasir set his own phrase in Vercel on 26 Oct); feed checks run from the signed-in /settings page

## v9 "Playground" (30 Oct 2026): started on the Mac, finished in the cloud session, merged to main
Baseline before changes: build, lint, tsc, knip all clean.
- [x] §1 Themes: Candy / Matcha / Sunset as `--th-*` on `[data-theme]` in globals.css, mapped by `@theme inline` (v8 names renamed: peach→pop, blue→accent-soft, blue-text→accent, sub→soft, surface→page). Bricolage 800 (`display`), Inter 500/600/700, JetBrains Mono 700 (`label`). `npm run contrast` (scripts/contrast.mjs). Committed f363b1f
- [x] §2 Theme switch (code; the migration is still for the Mac): `user_prefs` migration written (`…_user_prefs.sql`, NOT run in Supabase yet), `saveTheme` action, `loadTheme` (falls back to Candy), Appearance cards in /settings, cookie + `<head>` script sets data-theme before paint (root layout can't read cookies under cacheComponents), ThemeSync in the dashboard, demo = Candy
- [x] §3 Overview (built and checked in the cloud session, fixes below): OverviewHeader (greeting, shift line, IST clock), HeroTile (90 round dots, scrub readout, streak flame), NextUpTile (tick → done, slide, confetti, Undo toast), MoneyTile (fanning wallet, count-up), CheckInTile (6 water cups → `setTodayEntry`, celebration once a day), TodayTile (score ring, `src/lib/score.ts` weights 30/30/20/20), WeightTile (scrub chart), Fund / Meals (toggle chips) / TYBBA / Claude tiles. Shared: Tile (tones + tilt), useTilt, useConfetti, useCountUp, useNow, Toast. Shift fix in `buildPlan`: only phases with cal "shift"
- [x] §4 Rest of the app: Winter Arc, Health and Money tiles get v9 tones; reminder toasts in the v9 look; no v8 names or comments left; no hex outside globals.css (calendar feed colours and the theme-colour meta are data); big files split (CheckInRows, MoreSettings, RecentWorkouts)
- [x] §5 Cloud checks: build, lint, tsc, knip, contrast (49 pairs × 3 themes) clean; every /demo route + /, /login, /offline at 1280 and 390 in Candy, Matcha and Sunset: no sideways scroll, no clipped tiles, no phone target under 44px, no console errors. Demo interactions: hero scrub, task tick + Undo toast + confetti, water cups up/down, all meals → "All meals in" toast, confetti canvas removed after. Theme save failing (no user_prefs table) → back to Candy + error toast, no crash. Live writes are left for the Mac
- [x] §6 Docs: DESIGN.md v9 (+ changelog), CLAUDE.md design rule, README, BUILD_LOG; merged into main and pushed

### Cloud session (30 Oct 2026, continuing on `v9-playground`)
- [x] Baseline fixed: Weight tile change line in ink (▲/▼ kept), contrast ≥ 4.5:1 in all 3 themes; unused exports removed; build, lint, tsc, knip clean
- [x] Overview fixes: header shift line follows the dashboard's day (demo Sunday = "Weekend off."), demo plan has shift times; wallet cards 22px apart (fan 48px) so all names show; Check-in fits its 158px row with 44px controls; Today ring stacks on phones; Claude job rows wrap on phones; meal chips have aria-pressed

### Next session
1. **Live:** v9 Playground is on main (Vercel): the bento Overview with live tiles, every page in the v9 look, reminder toasts, three themes; /demo shows it all on fake data in Candy.
2. **Theme switch:** built and safe without the database table (falls back to Candy; saving shows an error toast and switches back). It saves for real once the user_prefs migration is run.
3. **Not done here, and why:** no signed-in tests against real data (this session can't sign in or reach Supabase), so water cups, meal chips, task tick + Undo and theme saving are only tested on /demo.
4. **Mac session must:** (a) run `supabase/migrations/20261031000001_user_prefs.sql` in the Supabase SQL editor; (b) signed in, tap a water cup, a meal chip, tick a task and Undo it, then put each value back; (c) switch the theme on the laptop and check it on the phone.
5. **iPhone:** open the home-screen app: Overview fits with no sideways scroll, tab bar works, one reminder toast at a time, water cups and meal chips are easy to tap, the theme you picked shows with no flash of Candy.

### Mac session, live checks (30 Oct 2026, afternoon)
- [x] `…_user_prefs.sql` run in the Supabase SQL editor by Claude: success (row-level security on, 1 policy)
- [x] Vercel deploy of 759b238 green; live Overview shows the shift as 1:30–10:30 PM and "Shift at 1:30 PM." in the header
- [x] Signed in on yasiros.vercel.app (Chrome, 1440): water cups 4 → 3 → 2 → 1 → 0 each saved, first save showed "Day 5 logged. Streak 1."; meal chip Pre-gym → Planned → Skipped, both survive a reload; task tick → "Nice. 31 left." + Undo, task back to To do after a reload (done_at cleared); theme Matcha saved, came back from the database with the cookie cleared, then set back to Candy. No error toasts, no sideways scroll
- [x] Put back: today's test entry and the theme row deleted (0 entries today, 0 user_prefs rows, as before); this browser's "celebrated today" flag cleared
- [x] ~~Water-cup oddity~~ No longer applies: the water cups were removed in v10 Focus
- [x] ~~iPhone check (v9)~~ Moved to "Open items" at the end (cups and meal chips no longer on the Overview)

## v10 "Focus" (1 Nov 2026, cloud session)
Same v9 look; fewer, clearer pieces. Baseline: build, lint, tsc, knip, contrast clean.
- [x] Nav: 4 tabs Overview / Health / Finance / Work (+ /demo); `/money` → `/finance`, `/board` → `/work`, `/winter-arc` → `/health` (also under /demo). Check-in pill + Settings button on every page; no name or "Y" mark in the header (tab title stays). Gallery, share card and Claude's jobs moved into Settings (and a new `/demo/settings`)
- [x] Overview: greeting only (no subline, no clock); Today (dark, read-only, 5 things, whole tile opens /log, confetti once a day at 5/5), Next up (tick removes the task, confetti, "Nice. N left." + Undo), Money (left to spend + wallet fan + updated), Winter Arc strip (day, flame, consistency %, 90 dots). Deleted: water cups, score ring, Weight, 1RK fund, Meals, TYBBA, Claude's jobs tiles and their code (setTodayEntry, toggleTodayTracker, live.ts, score.ts)
- [x] No task pop-ups: reminder toasts, the task card and the gate code removed (lib/gate.ts, answerGate). The Toast stays for Undo and errors
- [x] Health: Winter Arc hero across the top, 7D / 30D / 90D, Weight ("Body check due" chip + body check link), Sleep, Workouts; Meals (2 cols) + Blood pressure. Steps, Today's trackers and Body check tiles removed
- [x] Finance: Wallet, This month, 50/20/30 vs target, Top spends, Saving for (₹ goals or "fund"/"saving" names; amounts as ₹42,000 of ₹1,00,000)
- [x] Work: goal cards (3 / 2 / 1 columns, equal heights), first 3 open tasks + Show all / Show less, tick + confetti + Undo, Active / Done / All, Loose tasks card, task sheet with a Goal picker. Migration `20261102000001_task_goals.sql` (tasks.goal_id + index); before it runs every task shows under Loose tasks and saving falls back without goal_id. `POST /api/tasks` takes `goal_id` (checked against the owner's goals; 400 before the migration); docs/API.md updated. `/api/summary` unchanged
- [x] App feel: no tap highlight, touch-action manipulation, no selection on nav/buttons/tile headings, no rubber-band, viewport-fit=cover + safe areas, page fade/slide (React ViewTransition, off with reduced motion), tabs prefetched, phone tab bar with a pill above the home indicator, tile skeletons (app/loading.tsx + every Suspense fallback), press feedback, explicit apple-mobile-web-app-capable meta
- [x] Login inside the app: after "Email me a sign-in link", type the code from the email (`verifyOtp` type "email"); the Settings sign-in code still works
- [x] Checks: build, lint, tsc, knip, contrast clean. Playwright: every /demo route + /, /login, /offline at 1280 and 390: no sideways scroll, no console errors, no phone target under 44px; tick on Overview and Work → gone + "Nice. 11 left.", Undo → back; all 6 redirects 307

### Mac steps (v10)
1. Run `supabase/migrations/20261102000001_task_goals.sql` in the Supabase SQL editor.
2. Supabase → Authentication → Email Templates → Magic Link: add the code to the email, e.g. `<p>Or type this code in the app: {{ .Token }}</p>`, so the installed iPhone app can sign in with it.
3. Put a few tasks on goals (task sheet → Goal, or `goal_id` through the API) and check the Work cards.
4. iPhone: re-open the home-screen app: 4 tabs, no pop-ups, Today tile opens the check-in, sign in with the email code inside the app.

## Rebrand to "Decko" (2 Nov 2026, cloud session)
Display name only: repo `yasiros`, `yasiros.vercel.app`, every route and API URL unchanged (calendar feeds and the finance task keep working).
- [x] Name: manifest name + short_name, appleWebApp title, `<title>` template "<page> · Decko", welcome, login, offline, demo, share card, calendar feeds (X-WR-CALNAME "Decko · <name>", PRODID), demo gallery sample images, service worker comment; CLAUDE.md, README, DESIGN.md say "Decko (repo: yasiros)", API.md feed names
- [x] Icon "Bento": `public/icons/icon.svg` (source); icon-192, icon-512, apple-touch-icon 180 (full bleed), maskable-512 (tiles in the centre 80%), rendered with the pre-installed Playwright; `src/app/icon.svg` (sharp tab icon), `src/app/favicon.ico` (16/32/48, RGBA PNG entries), `src/app/apple-icon.png`. The "Y" mark on the welcome page is now the Bento icon
- [x] iPhone launch screens: 8 portrait sizes in `public/splash/` (1320×2868, 1206×2622, 1290×2796, 1179×2556, 1170×2532, 1125×2436, 828×1792, 750×1334), Candy page colour, icon at 22% of the width, linked with device-width/height/pixel-ratio media queries
- [x] Service worker v3 (drops the v2 cache with the old icons)
- [x] Checks: build, lint, tsc, knip, contrast clean; Chrome installability: no errors; /demo routes at 1280 and 390 clean

### iPhone step (Decko)
Delete the old home-screen icon, then in Safari open yasiros.vercel.app → Share → Add to Home Screen (Open as Web App on). Only a fresh install picks up the new name, icon and launch screen.

## Open items (2 Nov 2026) — the only things left
Cloud session (2 Nov): old unticked items closed or moved here; build, lint, tsc, knip and contrast re-run clean on main; Vercel green for the v10 and Decko commits.

**Mac session (Claude):**
- [x] Run `supabase/migrations/20261102000001_task_goals.sql` in the Supabase SQL editor; confirm `tasks.goal_id` and the `tasks_goal` index (2 Nov, Mac: both confirmed)
- [x] Supabase → Authentication → Email Templates → Magic Link: **done 3 Nov** (Resend SMTP: smtp.resend.com:465, user `resend`, key pasted by Yasir, sender name "Decko"; test email arrived with the link and an 8-digit code). Was parked (2 Nov): add `<p>Or type this code in the app: {{ .Token }}</p>` (keep the link); send a test email and check the code shows. **Blocked (2 Nov, Mac):** Supabase only lets templates be edited with custom SMTP ("Set up custom SMTP to edit templates"); the built-in sender can't change. Needs an email provider sign-up + password (Yasir). Until then the iPhone app signs in with Settings → Sign in on another device (8-letter code), which works without email
- [x] Live checks (2 Nov, Mac), signed in at 1440: 4 tabs (Overview, Health, Finance, Work); /money → /finance, /board → /work, /winter-arc → /health (and under /demo); Settings has Gallery, share card, Claude's jobs, Calendar (9 feeds); title "Decko", favicon, SVG and apple-touch icons served; Today "0 of 5" with Open the check-in → /log; Next up tick → toast "Nice. 31 left. Undo" → Undo → still open after a reload (32 open); gym feed `X-WR-CALNAME:Decko · Gym & walk`, all-in-one "Decko"; no console errors, no sideways scroll. Phone width (375, built-in browser): all 7 /demo pages, no sideways scroll, no target under 44px, no console errors
- [x] 1RK fund dropped (3 Nov, Yasir: not moving out until June 2027): the "Move out: 1RK" task deleted, "1RK fund" dropped from the money-sheet task. Old note: Finance "Saving for" didn't list the 1RK fund: there are **no goals** in the database (0 rows); the 1RK fund is the money snapshot's fund (₹), not a goal. Saving for lists goals whose unit is ₹. Needs Yasir: add the goal (title, ₹ target, date) in Goals, or say to show the snapshot fund there
- [x] Work (3 Nov): 7 goals made (exams, the app, money, scholarships, disputes, Winter Arc health, a work goal; names live in Supabase only) and all 31 open tasks filed with due dates that fit each goal; 0 loose; /log-matches-plan and exam-mode ticked done. New tasks without a goal (API or Work) are filed by `src/lib/goal-guess.ts` from history (same-area share + shared title words; only a clear winner): 30 of 31 right when tested leave-one-out. When nothing fits, a new goal is made for the task (named after its area, or its first words; ends on its due date) so nothing stays loose (Yasir, 3 Nov). Old note: put 2 or 3 real tasks on their goals. **Waiting on goals:** the goals table is empty, so the Goal picker has nothing to offer; Work shows only Loose tasks (41 of 73 done). Once Yasir names his goals, the Mac session adds them and files tasks under them

**Yasir:**
- [x] iPhone (Yasir confirmed, 2 Nov): delete the old home-screen icon, re-add from Safari (Share → Add to Home Screen, Open as Web App on); check the Decko name, Bento icon and launch screen; sign in inside the app with the code from the email; airplane mode → offline card
- [x] Meal slot names (3 Nov): the 7 slots renamed to Yasir's real meals (data only, trackers and entries kept)
- [x] Season targets (3 Nov): sleep 7 h, steps 10,000, new tracker Claude session 90 min/day, Pages read 10/day (was "Reading page"; no entries yet), skincare and hair yes/no; water off the check-in (archived, entries kept); study has no daily target (exam season only). Day plan: Exam revision now 10–21 Nov only (7 days before exams), Claude build block back otherwise

**Status (2 Nov, cloud):** every open item is done or parked. The email code inside the app now works (Resend SMTP, 3 Nov).

## Security check (2 Nov 2026, cloud session)
- [x] Secrets: no API keys, tokens, passwords or private keys anywhere in the code or in all 104 commits of history. The only key is the Supabase publishable key, which is public by design (row-level security protects the data). `.env*` is ignored; `.env.example` has never had a value
- [x] Personal data: no email, phone, bank names or amounts in the code or history. Removed today: a test weight from PROGRESS.md and real goal names (one with another person's first name). Those two are still in older commits' history (rewriting public history isn't worth it for these; keep names and health numbers out from now on)
- [x] Database: all 15 tables have row-level security; the goal view runs as the reader; no SECURITY DEFINER functions; every trigger function pins search_path; the gallery bucket is private with owner-only policies
- [x] Code: every server action checks the signed-in owner (login actions only accept ALLOWED_EMAIL); the API, gallery upload, share card and calendar compare tokens in constant time; redirects only go to fixed paths; the only raw HTML is the fixed theme script
- [x] Added security headers on every response: no framing (X-Frame-Options DENY + frame-ancestors 'none'), form-action/base-uri 'self', nosniff, Referrer-Policy, HSTS, Permissions-Policy off for camera/mic/location/payment. Checked: pages, sign-in form and installability unchanged
- [x] Packages: `npm audit --omit=dev` 0 vulnerabilities; 1 moderate warning only in the eslint dev tooling (never shipped; the suggested fix downgrades eslint)
- [x] GitHub: secret scanning and push protection are on
- → Yasir's GitHub steps (2FA, Dependabot, ruleset for `main`; collaborators, deploy keys and webhooks should be none except Vercel): tracked in "Start here" at the top

## Reliability + security pass (2 Nov 2026, cloud session)
- [x] GitHub Actions `Checks` (.github/workflows/checks.yml) on every push to main and every pull request: privacy check over the whole repo (`npm run privacy-check -- --all`, new), contrast, lint, build, tsc, knip, `npm audit --omit=dev --audit-level=high`. Read-only permissions
- [x] Dependabot config (.github/dependabot.yml): one grouped package update PR a week (max 3 open), GitHub Actions monthly
- [x] Node pinned to 22.x (`engines`), so Vercel and CI build on the same version as here
- [x] Error pages: `app/error.tsx` (a page crashes → "Something went wrong" + Try again + error code), `app/global-error.tsx` (even the layout fails), `app/not-found.tsx` (bad links). Never a blank screen
- [x] `GET /api/health` for an uptime monitor: 200 `{"ok":true,"database":"up"}`, 503 when the database or its key is missing. No token, no data
- [x] `robots.txt`: search engines may list `/` and `/demo` only
- [x] Backups: `npm run backup` (scripts/backup.mjs, reads .env.local) saves every row of the owner's 15 tables to `backups/decko-<date>.json` on the Mac; `backups/` is git-ignored
- → Uptime monitor on /api/health: tracked in "Start here" at the top
- → First `npm run backup` on the Mac: tracked in "Start here" at the top


## v10.2 Section check-ins (10 Nov 2026)
- [x] Today card: 5 chips are 44px buttons (Sleep, Workout, Meals, Revision, Reading); each opens a sheet with only that section; saves only its trackers, optimistic with rollback; count and bar update without a reload. Whole-tile link removed.
- [x] /log: list of the 5 sections with done marks + More (all other trackers and the longer logs); rows open the same sheet at `/log?section=<key>`.
- [x] Overview Money: one line "Add balances to see money." until a bank has a balance above zero.
- [x] Tested live signed in at 1440 and 390, all 3 themes; each section saved only its own trackers; test entries removed afterwards (today back to empty).
- Next: opening balances (HDFC, HSBC, IDFC) so Money shows the wallet again.
