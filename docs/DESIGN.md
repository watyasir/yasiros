# Yasir OS: design spec

**Status:** v10 "Focus" (2 Nov 2026) on the v9 "Playground" look. Light only, three themes. This file is the whole spec; the code follows the latest changelog entry (§9). Apple HIG, v6 "Teal and grey" and v8 "Soft bento" are retired.

## 1. Look in one paragraph

A playful bento: a warm page, one dark hero tile and a different soft colour for every Overview tile. Bricolage for big headings and numbers, Inter for words, JetBrains Mono for small uppercase labels. Things move a little when you touch them (tilt, a count-up, confetti for a finished day), never enough to get in the way, and nothing moves with reduced motion on.

## 2. Themes and tokens

Three themes, picked in /settings → Appearance (saved per account in `user_prefs`; Candy until picked; the demo is always Candy). Each theme sets raw `--th-*` values on `<html data-theme="candy|matcha|sunset">` in `src/app/globals.css`; an `@theme inline` block maps them to Tailwind colours. Components only use the colour names, never a hex.

| Token (class) | Candy | Matcha | Sunset | Use |
|---|---|---|---|---|
| `page` | `#F5F1EA` | `#EFF2EA` | `#FBF0EA` | page |
| `ink` / `soft` | `#17152B` / `#55516A` | `#17221A` / `#4F5B4A` | `#2A1613` / `#674B44` | text / secondary text |
| `hero` / `hero-soft` | `#2D2A70` / `#CFCBFF` | `#1F3D2B` / `#C3E5CB` | `#8A2D3B` / `#FFD3CB` | the dark hero tile / its secondary text |
| `dot-on` | `#FFD84D` | `#E6F07A` | `#FFC857` | logged days, Undo, highlights |
| `accent` | = hero | = hero | = hero | links, focus ring, chart line, selected |
| `t-tasks` `t-money` `t-check` `t-today` `t-weight` `t-fund` `t-diet` `t-study` `t-claude` | one per Overview tile, see globals.css | | | Tile `tone` fills |

Fixed in every theme: `card` white, `claude` `#D97757`, states `ok` `#15803D`/`#DCFCE7`, `warn` `#B45309`/`#FEF3C7`, `danger` `#B91C1C`/`#FEE2E2`. Radius 20px tiles (`tile`), 12px items (`item`), pills 999px. Shadows: `tile` (resting) and `lift` (hover, toasts).

Type: `display` = Bricolage Grotesque 800 (headings, big numbers); Inter 500/600/700 (body, labels in sentences); `label` = JetBrains Mono 700, uppercase 11px, 0.08em tracking (tile headings, small labels). All via `next/font`.

`npm run contrast` (scripts/contrast.mjs) reads globals.css and checks every text/background pair in all three themes (ink, soft and accent on every tile fill, the hero, chips, buttons): all ≥ 4.5:1. The saturated check-in fill uses ink for secondary text too.

## 3. Layout

- One fluid layout, max 1240px. **4 tabs** (v10): Overview `/`, Health `/health`, Finance `/finance`, Work `/work`, the same under `/demo`. Old addresses redirect: `/money` → `/finance`, `/board` → `/work`, `/winter-arc` → `/health`. Gallery (`/gallery`), the share card and Claude's jobs live in Settings.
- Top bar: the tabs from 561px up, then the Check-in pill (`/log`) and a Settings button on every width. No app name or logo mark in the header (the browser tab title stays). 560px and under: a 4-tab bar at the bottom, a pill on the active tab, above the home indicator.
- **Overview header:** the greeting only ("Up late" before 5, "Good morning" before 12, "Good afternoon" before 17, "Good evening" before 22, else "Good night", + ", Yasir"). No subline, no clock.
- **Overview bento** (the only bento, `bento` utility): desktop 4 columns, rows 158px 158px auto, gap 14px: `"today today tasks money" "today today tasks money" "arc arc arc arc"`. 960px and under: 2 columns (today across, then tasks + money, then arc). 560px and under: 1 column. Tiles in priority order (no `grid-flow-dense`).
- **Health:** the Winter Arc hero across the top; a 7D / 30D / 90D switch; Weight (chip "Body check due" when due), Sleep, Workouts in a row of 3; then Meals (2 columns, planned / swapped / skipped chips) and Blood pressure (1 column).
- **Finance:** Wallet, This month (spend vs income), 50 / 20 / 30 vs target, Top spends, and **Saving for** (goals in ₹ or with "fund"/"saving" in the name, each with a bar).
- **Work** (replaces the Board's kanban): goal cards, 3 columns on a laptop, 2 from 1100px, 1 from 700px, cards in a row the same height. Card: "<area> · by <deadline>", the goal, % done + bar, "x of y tasks done", the first 3 open tasks ("Show all N" / "Show less" only when there are more), "+ Add task". Tasks with no goal: a last "Loose tasks" card. Filter Active / Done / All. Tap a title for the task sheet (with a Goal picker).

## 4. Overview tiles

- **Today** (dark hero, read-only; the whole tile opens `/log`): "3 of 5 done", a bar, a chip per item (✓ when done), "Left: Meals, Reading", "Next: <phase> at <time>" from the day plan. 5 of 5: one confetti burst a day per device. **The 5 items and their trackers:**
  1. **Check-in**: anything saved today.
  2. **Workout**: the `workout` tracker ticked today, or a workout session logged today (walk days use the same tick).
  3. **Meals**: every meal slot (`choice` trackers in the Meals group) has a value today.
  4. **Revision**: the `study` tracker above 0 minutes today.
  5. **Reading**: the `reading-page` tracker logged today.
- **Next up:** 3 open tasks, overdue first, a round 44px tick. Tick → the task leaves the list at once (no strikethrough), small confetti, toast "Nice. N left." with Undo (puts it back). None left: "All clear." + Work link.
- **Money:** left to spend (big, counts up once), the wallet of up to 3 bank cards back to front (hover, focus or tap fans them), "Updated 8:45 PM".
- **Winter Arc strip** (full width, short; opens Health): Day X / 90, streak flame, average consistency %, the 90 days as a thin row of dots (two rows on phones), today pulsing.

## 5. Interaction and motion

Tilt (max 2.5°) + glare + 4px lift on mouse devices only; touch uses `:active` scale .96. Confetti ≤ 120 pieces on a canvas that removes itself. One toast at a time, bottom centre, 4.5 s, optional Undo; it's only for Undo and errors (no task pop-ups since v10). Tab changes fade and slide the page (React `<ViewTransition>`). No animation library. `prefers-reduced-motion` turns off tilt, confetti, count-ups and pulses. Every write is optimistic, rolls back with an error toast, and never double-saves.

## 6. Accessibility

Text ≥ 4.5:1 in every theme (checked by `npm run contrast`). Every control is a real button or link with a label, a visible 3px `accent` focus ring and a 44px target (meal chips are 28px on mouse devices, 44px on touch). Charts say their point in words. Never colour alone: states have a word or symbol.

## 7. Copy rules

Plain, short, friendly. Empty states say what to do next; never fake numbers on the real app. Money ₹1,25,000, dates 18 Oct 2026, India time.

## 8. Phone

Installed as a home-screen app it should feel like one: no tap highlight, `touch-action: manipulation` on controls (pinch zoom kept), no text selection on nav, buttons and tile headings, no rubber-band scroll, safe-area insets with `viewport-fit=cover`, tile-shaped skeletons while a page loads (never a blank white screen), press feedback on every control. Sign-in inside the app: type the code from the sign-in email (or the code from Settings on a signed-in device). Designed at 390px first; no sideways scroll; the check-in stays under a minute.

## 9. Changelog (Claude Code: apply the latest entry if the code doesn't match)

- **v10 Focus, 2 Nov 2026.** Same v9 look (tokens, tones, fonts, tilt, confetti, Undo toast, charts, wallet fan, count-up, flame, 3 themes); fewer, clearer pieces. 4 tabs (Overview, Health, Finance, Work) + Check-in + Settings; no name or mark in the header. Overview: greeting only; Today (5 things, read-only), Next up, Money, Winter Arc strip. Removed from Overview: water cups, score ring, Weight, 1RK fund, Meals, TYBBA and Claude's jobs tiles. No due-task pop-ups or reminder toasts. Health gets the Winter Arc hero, Meals and the "Body check due" chip; Steps, Today's trackers and Body check tiles removed. Finance adds "Saving for". Work replaces the kanban with goal cards (tasks.goal_id). Gallery, the share card and Claude's jobs moved to Settings. App feel for the installed iPhone app, skeleton loading, page transitions, and sign-in with the email code.
- **v9, 30 Oct 2026: "Playground".** Three themes (Candy, Matcha, Sunset) as `--th-*` variables mapped by `@theme inline`; switch in /settings (saved in `user_prefs`, cookie + head script so there's no flash; falls back to Candy). Bricolage display type and mono labels. Overview: greeting header with the shift line and IST clock, a colour per tile, live tiles (task tick + Undo, water cups, meal chips, score ring, fanning wallet, scrub charts, the 90-dot hero) with confetti and toasts. The rest of the app uses the same Tile tones. v8 names renamed (peach → pop, blue → accent-soft, blue-text → accent, sub → soft, surface → page).
- **v8, 30 Oct 2026: "Soft bento".** Replaces v6 everywhere. Tokens in §2, layout in §3. Overview becomes the bento (hero, next up, money, check-in, today, weight, 1RK fund, diet, TYBBA study, Claude's jobs); Winter Arc, Board, Money, Health and Gallery are their own pages with a top bar and phone tab bar (the sidebar, phone home, header chip, Habits and In-progress tiles are gone). One `Tile`, one `LineChart`. The blocking action gate becomes reminder toasts. Apple HIG skills, hig-doctor and the v6 mockups removed.

### History (retired designs)

- **v6.4, 27 Oct 2026:** **My Day** card on Overview (laptop row under Top priority; phone Today tab under the pin): day chip (weekday · shift day / day off), Now (brand tint, time range) and Next (column grey, "at 9:30 PM") panels, then folded lists: Full day (time, teal-ramp dot, title, detail; current phase tinted and `aria-current`), Meals, Gym A / B, Skin, hair, body, Prep, Stock list. Content comes from the database (`day_plans`), never the repo. **Owner tags:** Claude `#D97757` orange tint, Me soft teal `#5E9C96` tint, Both neutral; replaces cyan. **Claude's scheduled tasks** panel beside the Board from 1200px (260px, dashed Claude-orange border, white), under it below; name, status chip (OK sage, Failed coral, Running brand, Scheduled/Paused neutral), schedule, last and next run. **Action gate:** before the dashboard, up to 3 cards one at a time, max 440px, centred over a blurred, inert dashboard (`ink/30` scrim): chip (Overdue/Due today coral, Due tomorrow yellow, N days left brand) + date, "1 of 3", title on one line, "Next:" 2 lines, up to 2 question bullets + "More questions in chat", chat footer with Copy name; buttons Done (the one primary) · Doing it now · Snooze to tomorrow (hidden when more than a day overdue) · Move date (inline date field + Save date). No close, Esc or backdrop dismissal.
- **v6.3, 26 Oct 2026:** Board on real tasks. Columns To do · In progress · Waiting on others · Done; cards show title, note (2 lines), owner chip (Me / Claude / Both), area, due date (yellow within 3 days, coral overdue), most important first. Drag cards between columns (laptop; the column border turns brand); tap a card or "Add task" for one sheet (bottom sheet under 640px, centred panel above): title, note, area, due, who's on it, column, Delete, Cancel, Save as the one primary button. Done shows the latest 20 with "Show all". New slim **Top priority** card at the top of Overview (laptop and phone Today tab): the open Home task with the highest order, with its due date; tap opens the Board.
- **v6.2, 27 Oct 2026:** Inbox (mail nudges) and Instinct (view, status pill, "what Instinct can see", digest) dropped for good and deleted from the code. Views are Overview, Winter Arc and Board. The older mockups (`Main.dc.html`, `Phone.dc.html`) still show them; ignore those parts.
- **v6.1, 26 Oct 2026:** layout split. Overview = whole life (Today, Tasks, Money, Body, Workouts, Goals, Habits, In progress) with Winter Arc reduced to a dark "Day X/90 →" chip in the header. New sidebar page **Winter Arc**: dark teal hero with the 90-day strip, targets this week, streaks per tracker, week-by-week % chart, Share card button. Sidebar: Overview, Winter Arc, Board, Trackers (Inbox and Instinct hidden, parked). Mockups: `docs/design-reference/LifeOverview.dc.html`, `WinterArcPage.dc.html`. Same v6 tokens. **Phone (under 640px):** tab bar stays Today · Arc · Board · Money + round Log button. *Today tab* = the life Overview stacked in one column: greeting + "Day X/90 →" chip, Today checklist, Tasks (due + overdue), a 2×2 of Body / Workouts / Goals / Money summary, Habits grid (last 2 weeks so it fits), In progress. *Arc tab* = the Winter Arc page stacked: hero card (big day number, streak/best/targets row, 90-day strip at 15 cells per row), Targets this week, Streaks as a 2-column grid, Week-by-week chart scrollable sideways if it doesn't fit, Share card button. 44px targets, no horizontal page scroll.
- **v6, 20 Oct 2026:** "Teal and grey" per §2b. Replaces the Catppuccin accents and rainbow folders with deep teal `#0F4C4A` + sage + yellow + coral; pill-shaped nav, buttons, segments and chips; Winter Arc season card becomes the dark teal gradient hero; Money tile gets the wallet stack of account tabs. Mockups updated. Supersedes v5.
- **v5, 20 Oct 2026:** "Grey gradient". Neutrals switched to Zendesk Garden greys per §2b; soft grey gradients on frame, sidebar, header, cards, board columns and plain buttons; 1px `#D8DCDE` card borders; text `#293239`, secondary `#5C6970`. Accents, layout and components unchanged. No dark mode.
- **v4, 19 Oct 2026:** switched from Apple "Winter dawn" glass to the AnuPpuccin Latte card layout. Removed the gradient wallpaper and all glass blur and shadows; cards are flat `base` on `crust`; rainbow folder colours in the sidebar and section bars; rounded-square checkboxes; dashed header rule; whole palette moved to Catppuccin Latte with text-safe variants.
- v3, 19 Oct 2026: light theme only; added Inbox, Board, Instinct views, the season strip hero and the Instinct status pill.
- v2, 18 Oct 2026: Apple HIG structure (sidebar, segmented control, one primary button).
