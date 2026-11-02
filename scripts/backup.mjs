#!/usr/bin/env node
/*
  Backup: saves every row of the owner's data (trackers, entries, tasks, goals, workouts, money,
  day plan, ...) to backups/decko-<date>.json on this computer. The free Supabase plan keeps no
  backups you can download, so run this now and then (e.g. every Sunday):

    npm run backup

  It reads NEXT_PUBLIC_SUPABASE_URL (or the default), SUPABASE_SERVICE_ROLE_KEY and ALLOWED_EMAIL
  from .env.local. backups/ is git-ignored: the file holds personal data and never goes to GitHub.
  Gallery files themselves stay in Supabase Storage; their list is in the backup.
*/
import { mkdirSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const TABLES = [
  "trackers", "entries", "seasons", "tasks", "goals", "workouts", "workout_sets", "body_checks",
  "user_settings", "user_prefs", "money_snapshots", "day_plans", "claude_jobs", "gallery_items", "gate_log",
];
const PAGE = 1000;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tlxifgjnjaxzmesbregz.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const email = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
if (!key || !email) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY and ALLOWED_EMAIL in .env.local first.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: users, error: userError } = await supabase.auth.admin.listUsers({ perPage: 100 });
const owner = users?.users.find((u) => u.email?.toLowerCase() === email);
if (userError || !owner) {
  console.error("Couldn't find the owner's account. Check ALLOWED_EMAIL and the key.");
  process.exit(1);
}

const backup = { app: "Decko", taken_at: new Date().toISOString(), tables: {} };
for (const table of TABLES) {
  const rows = [];
  for (let page = 0; ; page++) {
    const { data, error } = await supabase.from(table).select("*").eq("user_id", owner.id).range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) {
      console.warn(`  ${table}: skipped (${error.message})`);
      break;
    }
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  backup.tables[table] = rows;
  console.log(`  ${table}: ${rows.length} rows`);
}

mkdirSync("backups", { recursive: true });
const file = `backups/decko-${backup.taken_at.slice(0, 10)}.json`;
writeFileSync(file, JSON.stringify(backup, null, 2));
console.log(`Saved ${file}. Keep a copy somewhere safe (it holds personal data; never commit it).`);
