# API

Endpoints for Claude's scheduled tasks, so logging, money updates and the task Board reach the dashboard without opening the app. All amounts and tasks below are made up.

Base URL: `https://yasiros.vercel.app`

## Access

Every call sends the secret token as a header:

```
Authorization: Bearer <API_TOKEN>
```

| Situation | Answer |
|---|---|
| `API_TOKEN` not set on the server | `503` `{ "ok": false, "error": "The API is off: API_TOKEN isn't set." }` (the rest of the app works as usual) |
| Wrong or missing token | `401` |
| Server can't read the database (`SUPABASE_SERVICE_ROLE_KEY` or `ALLOWED_EMAIL` missing) | `503` |
| Body doesn't fit | `400` with an `error` naming the field |

Every reply is JSON with `"ok": true` or `"ok": false`. Nothing is cached. Data is always saved to the owner's account (`ALLOWED_EMAIL`).

Make a token: `openssl rand -hex 32`. Set the same value as `API_TOKEN` in Vercel and in the scheduled task.

---

## POST /api/log

Logs tracker values for one day, the same as the check-in. A value already logged that day is overwritten.

```json
{
  "date": "2026-10-26",
  "entries": [
    { "tracker": "sleep", "value": 7.5 },
    { "tracker": "water", "value": 3 },
    { "tracker": "skincare", "value": true },
    { "tracker": "Study", "value": 90 }
  ]
}
```

- `date`: optional, `YYYY-MM-DD`, India time. Default today. Up to 7 days back, never the future.
- `entries`: 1 to 50. `tracker` is the tracker's slug or its name (any case). `GET /api/summary` lists the slugs.
- Values: yes/no trackers take `1`/`0` or `true`/`false`; 1–5 scales take whole numbers 1–5; minute trackers take minutes (0–1440); number trackers take the amount in their unit.
- Clock times (`lights-out`, `wake`) take minutes after midnight: `30` = 12:30 AM, `450` = 7:30 AM. Lights out is last night's, saved on the day you wake up.
- Meal slots (`meal-1` … `meal-7`) take `1` planned (as in the day plan), `2` swapped, `3` skipped.
- Blood pressure: `bp-am-sys`, `bp-am-dia`, `bp-pm-sys`, `bp-pm-dia` (mmHg). Reading: `reading-page` (the page you reached).
- Weight: `weight` (kg, decimals fine). Health's weight chart uses it and the weekly body check; on the same day the check-in wins.

Reply `200` when at least one value saved (entries that don't fit are listed in `skipped`). When nothing saved: `400` with `"ok": false`, `"error": "Nothing saved: check the skipped entries."` and the same `skipped` list.

```json
{
  "ok": true,
  "date": "2026-10-26",
  "saved": [{ "tracker": "sleep", "value": 7.5 }, { "tracker": "water", "value": 3 }],
  "skipped": [{ "tracker": "german", "reason": "No tracker with that slug or name." }]
}
```

```bash
curl -X POST https://yasiros.vercel.app/api/log \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d '{"entries":[{"tracker":"water","value":3}]}'
```

---

## GET /api/summary

Today at a glance: what's logged, what's missing, and the Winter Arc status. For reminder tasks ("you haven't logged water yet").

```json
{
  "ok": true,
  "date": "2026-10-26",
  "logged": [{ "tracker": "sleep", "name": "Sleep", "value": 7, "shown": "7 h" }],
  "missing": [{ "tracker": "water", "name": "Water", "type": "number", "unit": "L" }],
  "season": {
    "name": "Winter Arc",
    "day": 1,
    "length": 90,
    "starts_in": 0,
    "days_left": 89,
    "streak": 0,
    "best_streak": 0,
    "targets_hit": { "pct": null, "period": "This week" },
    "targets_this_week": [{ "name": "Sleep", "done": 1, "target": 7 }],
    "streaks": [{ "name": "Sleep", "current": 1, "best": 1 }],
    "workouts_this_week": { "count": 0, "target": 4 }
  }
}
```

- `season` is `null` when no season is set up. Before day 1, `starts_in` counts the days to go.
- `targets_hit.pct`: % of finished days this week with every target hit (`null` = no finished day yet; on Mondays it's last week).

```bash
curl https://yasiros.vercel.app/api/summary -H "Authorization: Bearer $API_TOKEN"
```

---

## POST /api/money

Saves a money snapshot. The Money tiles show the latest one: wallet stack (a tab per bank and per card, front card = `spendable`), spend vs income, the 50/20/30 split against target, the top 4 categories and "Updated <time>". The app never reads or writes the finance sheet; the finance task reads it and sends this.

```json
{
  "month": "2026-10",
  "income": 50000,
  "expenses": 31800,
  "categories": [
    { "name": "Rent", "amount": 12000 },
    { "name": "Food", "amount": 7400 },
    { "name": "Travel", "amount": 4100 }
  ],
  "split": {
    "needs": { "actual": 48, "target": 50 },
    "wants": { "actual": 15, "target": 20 },
    "savings": { "actual": 37, "target": 30 }
  },
  "banks": [
    { "name": "Bank A", "balance": 30000 },
    { "name": "Bank B", "balance": 12000 },
    { "name": "Bank C", "balance": 6000 }
  ],
  "cards": [
    { "name": "Card A", "dues": 4200, "due_date": "2026-11-05" },
    { "name": "Card B", "dues": 0, "due_date": null }
  ],
  "spendable": 14600,
  "updated_at": "2026-10-26T21:30:00+05:30"
}
```

Amounts and percentages may be plain numbers or text like `"₹12,000"`, `"-2,300"` or `"48%"`. Names longer than 40 characters are cut to 40. An empty `due_date` counts as `null`.

| Field | Rule |
|---|---|
| `month` | `YYYY-MM` |
| `income`, `expenses` | rupees, 0 or more |
| `categories` | up to 30 `{ name, amount }`; the tile shows the biggest 4 |
| `split` | `needs`, `wants`, `savings`, each `{ actual, target }` as % of income. `target` is optional: 50 / 20 / 30 |
| `banks` | up to 30 `{ name, balance }` (names up to 40 characters) |
| `cards` | up to 30 `{ name, dues, due_date }`; `dues` = unpaid amount, `due_date` = `YYYY-MM-DD` or `null` |
| `spendable` | rupees left to spend this month (can be negative) |
| `updated_at` | optional ISO time the numbers were read; default now; not in the future |

A rejected body gets `400` with an `error` naming the field and list position, e.g. `"cards[0].due_date: YYYY-MM-DD or null."` The same message shows in Vercel's logs (never the amounts).

Reply `201`:

```json
{ "ok": true, "month": "2026-10", "updated_at": "2026-10-26T16:00:00.000Z" }
```

Every call adds a snapshot (older ones stay as history). Needs the `money_snapshots` table (`supabase/migrations/20261026000001_money_snapshots.sql`); without it the call answers `500` and the tile keeps its empty state.

```bash
curl -X POST https://yasiros.vercel.app/api/money \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d @snapshot.json
```

---

## Tasks: POST /api/tasks, GET /api/tasks, DELETE /api/tasks/:external_id

Keeps the Board in sync with Claude's task list. Every task has an `external_id`, the name Claude knows it by. Tasks added in the app get one automatically (`app-…`), so Claude can update or delete those too (`GET` lists them). Needs the tasks API migration (`supabase/migrations/20261027000002_tasks_api.sql`); without it these calls answer `500`.

| Field | Rule |
|---|---|
| `external_id` | required, text, 1–100 characters, unique per task |
| `title` | 1–120 characters. Required for a new task |
| `status` | `todo`, `doing`, `waiting` or `done` (the Board columns: To do, In progress, Waiting on others, Done). Default `todo` |
| `owner` | `Yasir`, `Claude` or `Both`. Default `Yasir` |
| `area` | up to 40 characters, e.g. `Home`, `Health`, `Skills`. `null` = none |
| `due_date` | `YYYY-MM-DD` or `null` |
| `note` | up to 500 characters, shown on the card. `null` clears it |
| `sort_order` | whole number, higher = more important. The highest `Home` task is pinned at the top of Overview. Default `0` |
| `updated_by` | `Yasir` or `Claude`. Default `Claude` for API calls (the app sets `Yasir`) |

Read-only in replies: `updated_at`, `done_at` (set when the task moves to Done).

### POST /api/tasks

Adds or updates by `external_id`: one task, a list, or `{ "tasks": [...] }` (1–100). A new `external_id` creates a task (needs `title`); a known one changes only the fields you send.

```json
{
  "tasks": [
    { "external_id": "home-move", "title": "Move to the new flat", "area": "Home", "due_date": "2026-11-15", "owner": "Both", "sort_order": 10, "note": "Book the movers first" },
    { "external_id": "learn-sql", "title": "Finish the SQL course", "area": "Skills", "status": "doing" },
    { "external_id": "app-1a2b3c4d5e6f7a8b", "status": "done" }
  ]
}
```

Reply `200`: how many were created and updated, plus each saved task.

```json
{
  "ok": true,
  "created": 2,
  "updated": 1,
  "tasks": [
    { "external_id": "home-move", "title": "Move to the new flat", "status": "todo", "owner": "Both", "area": "Home", "due_date": "2026-11-15", "note": "Book the movers first", "sort_order": 10, "updated_at": "2026-10-27T03:00:00+00:00", "updated_by": "Claude", "done_at": null }
  ]
}
```

**Goal (Work page, v10):** `goal_id` puts a task on a goal's card (the goal's `id`, a uuid from the `goals` table); `null` makes it a loose task. A goal id that isn't one of the owner's goals gets `400`. Before migration `20261102000001_task_goals.sql` is run, sending `goal_id` gets `400` ("the task-goals migration hasn't been run yet") and replies leave `goal_id` out; afterwards every reply includes it.

```json
{ "external_id": "pack-kitchen", "title": "Pack the kitchen", "goal_id": "3f0c1d2e-4b5a-4c6d-8e7f-9a0b1c2d3e4f" }
```

**Older fields, still accepted:** `next_steps`, `questions` and `chat_name` are saved as before, but no page shows them since v10 (the due-task pop-up is gone).

A body that doesn't fit gets `400` naming the field and list position, e.g. `"tasks[1].status: one of todo, doing, waiting, done."` or `"title: \"learn-sql\" is a new task, so it needs a title."` Nothing is saved when the body is rejected.

```bash
curl -X POST https://yasiros.vercel.app/api/tasks \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d '{"external_id":"learn-sql","status":"done"}'
```

### GET /api/tasks

Every task, most important first (`sort_order`, then due date). `?status=todo,doing` keeps only those columns.

```json
{ "ok": true, "count": 1, "tasks": [{ "external_id": "learn-sql", "title": "Finish the SQL course", "status": "doing", "owner": "Yasir", "area": "Skills", "due_date": null, "note": null, "sort_order": 0, "next_steps": null, "questions": [], "chat_name": null, "updated_at": "2026-10-27T03:00:00+00:00", "updated_by": "Claude", "done_at": null }] }
```

```bash
curl "https://yasiros.vercel.app/api/tasks?status=todo,doing,waiting" -H "Authorization: Bearer $API_TOKEN"
```

### DELETE /api/tasks/:external_id

Deletes one task. Reply `200` `{ "ok": true, "deleted": "learn-sql" }`, or `404` when no task has that `external_id`. To finish a task, move it to `done` instead, so it stays in the Done column.

```bash
curl -X DELETE https://yasiros.vercel.app/api/tasks/learn-sql -H "Authorization: Bearer $API_TOKEN"
```

## Claude's scheduled tasks: GET, POST and DELETE /api/claude-jobs

Shown in their own panel beside the Board, never mixed with tasks. `POST` adds or updates by `name`: one job, a list, or `{ "jobs": [...] }` (1–50). Known jobs change only the fields you send.

| Field | What |
|---|---|
| `name` | required, up to 100 characters |
| `schedule` | text for people, e.g. `"Daily 8:45 AM and PM"` |
| `status` | `ok`, `failed`, `running`, `scheduled` or `paused` |
| `last_run`, `next_run` | ISO times with offset, or `null` |

```bash
curl -X POST https://yasiros.vercel.app/api/claude-jobs \
  -H "Authorization: Bearer $API_TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Morning brief","schedule":"Daily 8:00 AM","status":"ok","last_run":"2026-10-27T08:00:00+05:30","next_run":"2026-10-28T08:00:00+05:30"}'
```

Reply `200` `{ "ok": true, "saved": 1, "jobs": [...] }`. `GET` lists them, soonest next run first.

`DELETE /api/claude-jobs?name=<name>` removes one job (exact name, URL-encoded). Reply `200` `{ "ok": true, "deleted": "Morning brief" }`, `404` when no job has that name, `400` without `name`.

```bash
curl -X DELETE "https://yasiros.vercel.app/api/claude-jobs?name=Morning%20brief" -H "Authorization: Bearer $API_TOKEN"
```

## Day plan: GET and POST /api/day-plan

The plan behind the routine in the calendar feeds. It lives only in the database. `POST` replaces the whole plan:

```json
{
  "phases": [
    { "start": "07:30", "kind": "food", "title": "Wake, water, snack" },
    { "start": "07:50", "kind": "move", "title": "Workout", "byDay": { "mon": "Gym A", "wed": "Gym B" } },
    { "start": "13:30", "kind": "work", "title": "Shift", "days": ["mon", "tue", "wed", "thu", "fri"] },
    { "start": "24:30", "kind": "sleep", "title": "Lights out" }
  ],
  "sections": [{ "title": "Stock list", "items": [{ "label": "Dairy", "text": "Milk, yoghurt" }] }]
}
```

- A phase lasts until the next one starts. Times after midnight are written `24:30` and belong to the day before, so a day runs from waking to lights out.
- `kind`: `sleep`, `care`, `food`, `move`, `work` or `mind`. `days` limits a phase to some weekdays (`mon`…`sun`); `byDay` swaps in that day's `detail`.
- `cal` (optional) puts a phase in one of the 9 calendar feeds: `sleep`, `shift`, `breaks`, `meals`, `gym`, `care`, `build`, `commute`, `tasks`. Without it: kind `sleep` → sleep; a title starting with the word "Break" → breaks; a title with the word "ride" → commute; then kind `work` → shift, `food` → meals, `move` → gym, `mind` → build, `care` → care.
- `from` / `until` (optional, `YYYY-MM-DD`, both included) limit a phase to some dates, for exam weeks and other one-offs. On those dates it **replaces any undated phase that starts at the same time**; a new time just adds a phase (and shortens the one before it). Example: `{ "start": "10:00", "kind": "mind", "title": "Exam revision · 1.5 h", "cal": "build", "days": ["mon","tue","wed","thu","fri"], "from": "2026-11-02" }`.
- `sections` (up to 12, 30 items each) are kept with the plan (meals, gym, prep, stock list).

## Calendar feeds: GET /api/calendar.ics?token=SHARE_TOKEN[&cat=<key>]

Nine colour-coded calendars for Apple Calendar, one per `cat`:

| `cat` | Calendar name | Colour |
|---|---|---|
| `sleep` | Yasir OS · Sleep | `#7C8CE8` |
| `shift` | Yasir OS · Shift | `#2BB3A8` |
| `breaks` | Yasir OS · Breaks | `#F5C842` |
| `meals` | Yasir OS · Meals | `#FF9F45` |
| `gym` | Yasir OS · Gym & walk | `#4CD07D` |
| `care` | Yasir OS · Self-care | `#FF7EB6` |
| `build` | Yasir OS · Build & study | `#A78BFA` |
| `commute` | Yasir OS · Commute | `#A1A1AA` |
| `tasks` | Yasir OS · Tasks due | `#FF5C5C` |

Each feed sets `X-WR-CALNAME` and `X-APPLE-CALENDAR-COLOR`. Subscribe from **/settings → Calendar** (signed in): tap a name to open it as `webcal://`, or copy its link. `/progress` → **Subscribe in Calendar** leads there.

- Phases repeat weekly on their days (India time). Dated phases (`from`/`until`) split the weeks into ranges, and each event repeats only until its range ends (`RRULE … UNTIL`), so an exam-week phase never doubles up with the one it replaces.
- `tasks`: every task with a due date as an all-day event (done ones start with ✓).
- Without `&cat`, the original all-in-one "Yasir OS" feed (everything above in one calendar) keeps working.
- A wrong token or an unknown `cat` gets `404`. The token is the same one as the /progress share link, so anyone with that link could also read these feeds. The calendar app fetches them again about every hour.

---

## Gallery: POST /api/gallery

Saves an image or PDF Claude made in a chat to the private gallery, byte-for-byte (PNG, JPG, SVG, PDF, WebP, up to 25 MB). It uses its own upload-only key, not `API_TOKEN`:

```
Authorization: Bearer <GALLERY_TOKEN>
```

| Situation | Answer |
|---|---|
| `GALLERY_TOKEN` not set on the server | `503` `{ "ok": false, "error": "Gallery key not set: add GALLERY_TOKEN to the site's settings." }` |
| Wrong or missing key | `401` |

Three ways to call it:

1. **Small files (about 4 MB or less):** `multipart/form-data` with `file` and `meta` (JSON: `title`, `category`, optional `note`).
2. **Bigger files, step 1:** JSON `{ "mime": "image/png", "bytes": 3145728 }` → a signed `upload_url` and a `path`. PUT the file there with that `Content-Type`.
3. **Bigger files, step 2:** JSON `{ "path": "<from step 1>", "title": "...", "category": "..." }` files it in the gallery.

The file type is checked from the file's own bytes, not its name.

