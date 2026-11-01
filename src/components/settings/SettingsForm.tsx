"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { ToastProvider } from "@/components/Toast";
import { fieldClass, StatusMessages, type Status } from "@/components/body/Sheet";
import { Field, Group } from "@/components/FormGroup";
import { parseNumber, type SaveResult } from "@/lib/body";
import type { ThemeId } from "@/lib/theme";
import type { ClaudeJob } from "@/lib/claude-jobs";
import { AppearanceSection } from "./AppearanceSection";
import { ClaudeJobsSection, MoreSection } from "./ExtrasSections";
import { CalendarSection, ResetSection, SignInCodeSection } from "./MoreSettings";
import { SEASON_DAYS, seasonProblem, TRACKER_TYPES, trackerProblem, type SeasonInput, type TrackerInput } from "@/lib/settings";
import { AREA_ORDER, formatDayLabel, type Tracker, type TrackerArea, type TrackerType } from "@/lib/trackers";

/*
  /settings: Winter Arc (start date + a daily target per tracker), a new tracker, the calendar
  feeds, a sign-in code for another device, and Reset test data. The one primary button is the season's.
*/

export interface SettingsActions {
  saveSeason: (s: SeasonInput) => Promise<SaveResult>;
  addTracker: (t: TrackerInput) => Promise<SaveResult>;
  resetTestData: () => Promise<SaveResult>;
  makeSignInCode: () => Promise<{ ok: true; code: string; expiresAt: number } | { ok: false; message: string }>;
  saveTheme: (t: ThemeId) => Promise<{ ok: boolean }>;
}

/** What a daily target means for each type, shown next to the box. */
const targetUnit = (t: Pick<Tracker, "type" | "unit">) =>
  t.type === "duration_minutes" ? "min" : t.type === "scale_1_5" ? "of 5" : (t.unit ?? "");

export function SettingsForm({
  trackers,
  season,
  defaultStart,
  actions,
  calendarPath,
  theme,
  jobs,
}: {
  trackers: Tracker[];
  /** The active season, if there is one. */
  season: { start: string; targets: Record<string, number> } | null;
  /** Next Monday, for a new season. */
  defaultStart: string;
  actions: SettingsActions;
  /** /api/calendar.ics?token=…; null = SHARE_TOKEN isn't set. */
  calendarPath: string | null;
  /** The saved theme (Candy until one is picked). */
  theme: ThemeId;
  /** Claude's scheduled jobs. */
  jobs: ClaudeJob[];
}) {
  return (
    <ToastProvider>
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col gap-[18px] px-4 pt-6 pb-8">
        <header className="flex items-center justify-between">
          <h1 className="m-0 text-[34px] leading-[1.1] display tracking-[-0.02em]">Settings</h1>
          <Link href="/" prefetch className="flex min-h-11 items-center text-[17px] text-accent no-underline hover:text-accent-strong">
            Done
          </Link>
        </header>
        <AppearanceSection theme={theme} save={actions.saveTheme} />
        <MoreSection galleryHref="/gallery" shareHref="/progress" />
        <ClaudeJobsSection jobs={jobs} />
        <SeasonSection trackers={trackers} season={season} defaultStart={defaultStart} save={actions.saveSeason} />
        <NewTrackerSection add={actions.addTracker} />
        <CalendarSection path={calendarPath} />
        <SignInCodeSection make={actions.makeSignInCode} />
        <ResetSection reset={actions.resetTestData} />
      </div>
    </ToastProvider>
  );
}

// ---------------------------------------------------------------- Winter Arc

/** Clock times, choices and grouped readings (meals, blood pressure) are logged, not targets. */
const countable = (t: Tracker) => !t.group_name && t.type !== "time_of_day" && t.type !== "choice";

function SeasonSection({
  trackers,
  season,
  defaultStart,
  save,
}: {
  trackers: Tracker[];
  season: { start: string; targets: Record<string, number> } | null;
  defaultStart: string;
  save: SettingsActions["saveSeason"];
}) {
  const [start, setStart] = useState(season?.start ?? defaultStart);
  // Per tracker: on/off and the target text. Starts from the season, or each tracker's own daily target.
  const [rows, setRows] = useState(() =>
    Object.fromEntries(
      trackers.map((t) => {
        const own = t.target_period === "daily" && t.target != null ? Number(t.target) : null;
        const value = season ? season.targets[t.slug] : own;
        const on = season ? t.slug in season.targets : own != null;
        return [t.slug, { on, text: value == null || t.type === "checkbox" ? "" : String(value) }];
      }),
    ),
  );
  const [status, setStatus] = useState<Status>("editing");
  const [saving, startSaving] = useTransition();

  const change = (slug: string, next: Partial<{ on: boolean; text: string }>) => {
    setRows((r) => ({ ...r, [slug]: { ...r[slug], ...next } }));
    setStatus("editing");
  };

  const submit = () => {
    const targets: Record<string, number> = {};
    for (const t of trackers.filter(countable)) {
      const row = rows[t.slug];
      if (!row?.on) continue;
      const n = t.type === "checkbox" ? 1 : parseNumber(row.text);
      if (n == null) return setStatus({ error: `Set a daily target for ${t.name}, or switch it off.` });
      targets[t.slug] = n;
    }
    const input = { start, targets };
    const problem = seasonProblem(input);
    if (problem) return setStatus({ error: problem });
    startSaving(async () => {
      const r = await save(input);
      setStatus(r.ok ? "saved" : { error: r.message });
    });
  };

  return (
    <>
      <Group id="season" title={`Winter Arc · ${SEASON_DAYS} days`}>
        <Field label="Day 1">
          <input type="date" value={start} onChange={(e) => e.target.value && (setStart(e.target.value), setStatus("editing"))} className={fieldClass} />
        </Field>
      </Group>
      <p className="m-0 mx-4 -mt-3 text-[13px] text-soft">
        {formatDayLabel(start)}. Until then the dashboard counts down to it.
      </p>

      <Group title="Daily targets that count">
        {trackers.filter(countable).map((t) => {
          // A tracker added further down this page starts switched off.
          const row = rows[t.slug] ?? { on: false, text: "" };
          return (
            <div key={t.id} className="flex min-h-[52px] items-center gap-3 py-1.5">
              <span className="min-w-0 flex-1 text-[17px]">{t.name}</span>
              {row.on && t.type !== "checkbox" && (
                <span className="flex items-center gap-2">
                  <input
                    inputMode="decimal"
                    aria-label={`Daily target for ${t.name}`}
                    value={row.text}
                    placeholder="–"
                    onChange={(e) => change(t.slug, { text: e.target.value.replace(/[^\d.,]/g, "") })}
                    className={`${fieldClass} w-20 text-right`}
                  />
                  <span className="w-10 text-[13px] text-soft">{targetUnit(t)}</span>
                </span>
              )}
              <button
                type="button"
                role="switch"
                aria-checked={row.on}
                aria-label={`Count ${t.name}`}
                onClick={() => change(t.slug, { on: !row.on })}
                className="flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-[46px] items-center rounded-full p-0.5 transition-colors motion-reduce:transition-none ${
                    row.on ? "justify-end bg-accent-soft" : "justify-start bg-fill-strong"
                  }`}
                >
                  <span className="size-6 rounded-full bg-white" />
                </span>
              </button>
            </div>
          );
        })}
      </Group>
      <p className="m-0 mx-4 -mt-3 text-[13px] text-soft">A day counts as &quot;all targets&quot; when every switched-on tracker hits its target.</p>

      <StatusMessages status={status} savedText={season ? "Season saved." : "Winter Arc is set. See you on day 1."} />
      <Button variant="primary" onClick={submit} disabled={saving} className="min-h-[50px] text-[17px] sm:min-h-[50px]">
        {saving ? "Saving…" : season ? "Save season" : "Start Winter Arc"}
      </Button>
    </>
  );
}

// ---------------------------------------------------------------- new tracker

function NewTrackerSection({ add }: { add: SettingsActions["addTracker"] }) {
  const [name, setName] = useState("");
  const [area, setArea] = useState<TrackerArea>("Custom");
  const [type, setType] = useState<TrackerType>("checkbox");
  const [unit, setUnit] = useState("");
  const [target, setTarget] = useState("");
  const [period, setPeriod] = useState<"daily" | "weekly">("daily");
  const [status, setStatus] = useState<Status>("editing");
  const [saving, startSaving] = useTransition();

  const submit = () => {
    // A daily yes/no needs no number: done = target hit.
    const t = type === "checkbox" && period === "daily" ? 1 : parseNumber(target);
    const input: TrackerInput = { name, area, type, unit, target: t, period };
    const problem = trackerProblem(input);
    if (problem) return setStatus({ error: problem });
    startSaving(async () => {
      const r = await add(input);
      if (!r.ok) return setStatus({ error: r.message });
      setStatus("saved");
      setName("");
      setUnit("");
      setTarget("");
    });
  };

  const needsNumber = !(type === "checkbox" && period === "daily");
  return (
    <>
      <Group id="new-tracker" title="New tracker">
        <Field label="Name">
          <input value={name} maxLength={40} placeholder="e.g. Reading" onChange={(e) => (setName(e.target.value), setStatus("editing"))} className={`${fieldClass} w-44`} />
        </Field>
        <Field label="Area">
          <select value={area} onChange={(e) => setArea(e.target.value as TrackerArea)} className={`${fieldClass} w-44 cursor-pointer`}>
            {AREA_ORDER.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as TrackerType)} className={`${fieldClass} w-44 cursor-pointer`}>
            {TRACKER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        {type === "number" && (
          <Field label="Unit">
            <input value={unit} maxLength={12} placeholder="e.g. pages" onChange={(e) => setUnit(e.target.value)} className={`${fieldClass} w-44`} />
          </Field>
        )}
        <Field label="Target">
          <select value={period} onChange={(e) => setPeriod(e.target.value as "daily" | "weekly")} aria-label="Target period" className={`${fieldClass} w-44 cursor-pointer`}>
            <option value="daily">{type === "checkbox" ? "Every day" : "Per day"}</option>
            <option value="weekly">{type === "checkbox" ? "Times a week" : "Per week"}</option>
          </select>
        </Field>
        {needsNumber && (
          <Field label={period === "weekly" && type === "checkbox" ? "Times" : "Amount"}>
            <span className="flex items-center gap-2">
              <input
                inputMode="decimal"
                value={target}
                placeholder="optional"
                onChange={(e) => setTarget(e.target.value.replace(/[^\d.,]/g, ""))}
                className={`${fieldClass} w-28 text-right`}
              />
              <span className="w-10 text-[13px] text-soft">{type === "checkbox" ? "" : targetUnit({ type, unit: unit || null })}</span>
            </span>
          </Field>
        )}
      </Group>
      <StatusMessages status={status} savedText="Tracker added. It's in your check-in and on the dashboard now." />
      <Button onClick={submit} disabled={saving} className="self-start">
        {saving ? "Adding…" : "Add tracker"}
      </Button>
    </>
  );
}
