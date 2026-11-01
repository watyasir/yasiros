"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { StatusMessages, type Status } from "@/components/body/Sheet";
import { Group } from "@/components/FormGroup";
import { CALENDARS } from "@/lib/calendar";
import type { ClaudeJob } from "@/lib/claude-jobs";
import { ClaudeJobsPanel } from "./ClaudeJobsPanel";
import type { SettingsActions } from "./SettingsForm";

/* /settings: more pages (Gallery, share card), Claude's jobs, the sign-in code, the calendar feeds and Reset test data. */

// ---------------------------------------------------------------- More pages and Claude's jobs

const row = "flex min-h-[52px] items-center justify-between gap-3 py-1.5 text-[17px] text-ink no-underline";

/** Pages that have no tab (v10): the Gallery and the shareable Winter Arc card, plus Claude's scheduled tasks. */
export function MoreSection({ jobs }: { jobs: ClaudeJob[] }) {
  return (
    <>
      <Group id="more" title="More">
        <Link href="/gallery" prefetch className={row}>
          Gallery
          <span aria-hidden="true" className="text-soft">
            →
          </span>
        </Link>
        <Link href="/progress" prefetch className={row}>
          Winter Arc share card
          <span aria-hidden="true" className="text-soft">
            →
          </span>
        </Link>
      </Group>
      <ClaudeJobsPanel jobs={jobs} />
    </>
  );
}

// ---------------------------------------------------------------- Sign-in code

/**
 * On iPhone the home-screen app doesn't share Safari's sign-in, and the email link opens in Safari.
 * This shows a one-time code to type into "Have a code?" on the other device's /login.
 */
export function SignInCodeSection({ make }: { make: SettingsActions["makeSignInCode"] }) {
  const [code, setCode] = useState<{ code: string; expiresAt: number } | null>(null);
  const [status, setStatus] = useState<Status>("editing");
  const [busy, startBusy] = useTransition();

  const run = () =>
    startBusy(async () => {
      const r = await make();
      if (r.ok) setCode(r);
      setStatus(r.ok ? "editing" : { error: r.message });
    });
  const until = code
    ? new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(code.expiresAt)
    : "";

  return (
    <>
      <Group id="signin-code" title="Sign in on another device">
        <div className="flex flex-col gap-2 py-3">
          <span className="text-[15px] text-soft">
            For the home-screen app on your iPhone: on its sign-in page, tap &ldquo;Have a code from Settings?&rdquo; and type this code.
          </span>
          {code && (
            <div role="status" className="flex flex-col gap-1 rounded-2xl bg-fill-strong p-3">
              <span className="font-mono text-[28px] font-semibold tracking-[0.12em]" aria-label={`Code ${code.code.split("").join(" ")}`}>
                {code.code.slice(0, 4)}-{code.code.slice(4)}
              </span>
              <span className="text-[13px] text-soft">Works once, until {until}. Making a new one ends this one.</span>
            </div>
          )}
          <Button onClick={run} disabled={busy} className="self-start">
            {busy ? "Making…" : code ? "Make a new code" : "Show sign-in code"}
          </Button>
        </div>
      </Group>
      <StatusMessages status={status} savedText="" />
    </>
  );
}

// ---------------------------------------------------------------- Calendar feeds

/**
 * The 9 colour-coded calendar feeds. Tap a name to subscribe in Apple Calendar (webcal://),
 * or copy its link. The dots are each calendar's own colour in Apple Calendar.
 */
export function CalendarSection({ path }: { path: string | null }) {
  const [copied, setCopied] = useState<string | null>(null);
  const linkFor = (key: string) => `webcal://${window.location.host}${path}&cat=${key}`;

  async function copy(key: string) {
    try {
      await navigator.clipboard.writeText(linkFor(key));
      setCopied(key);
    } catch {
      window.prompt("Copy this link", linkFor(key));
    }
  }

  return (
    <Group id="calendar" title="Calendar">
      {!path && <p className="m-0 py-3 text-[15px] text-soft">The feeds need SHARE_TOKEN in the site&apos;s settings.</p>}
      {path &&
        CALENDARS.map((c) => (
          <div key={c.key} className="flex min-h-[52px] items-center gap-3 py-1.5">
            {/* Apple Calendar's colour for this feed: data, not a theme colour. */}
            <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
            <a
              href={`${path}&cat=${c.key}`}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = linkFor(c.key);
              }}
              className="flex min-h-11 flex-1 items-center text-[17px] text-ink no-underline"
            >
              {c.name}
            </a>
            <Button onClick={() => copy(c.key)} aria-label={`Copy the ${c.name} calendar link`}>
              {copied === c.key ? "Copied" : "Copy"}
            </Button>
          </div>
        ))}
      {path && <p className="m-0 py-3 text-[13px] text-soft">Tap a name to subscribe in Calendar, or copy its link.</p>}
    </Group>
  );
}

// ---------------------------------------------------------------- Reset

export function ResetSection({ reset }: { reset: SettingsActions["resetTestData"] }) {
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<Status>("editing");
  const [busy, startBusy] = useTransition();

  const run = () =>
    startBusy(async () => {
      const r = await reset();
      setStatus(r.ok ? "saved" : { error: r.message });
      setConfirming(false);
    });

  return (
    <>
      <Group id="reset" title="Test data">
        <div className="flex flex-col gap-2 py-3">
          <span className="text-[15px] text-soft">
            Deletes all your entries, workouts, body checks, tasks and goals. Trackers, Winter Arc and your goal weight stay.
          </span>
          {!confirming ? (
            <button
              type="button"
              onClick={() => (setConfirming(true), setStatus("editing"))}
              className="min-h-11 cursor-pointer self-start rounded-full border-0 bg-transparent px-2 text-[15px] font-semibold text-danger hover:bg-danger-soft"
            >
              Reset test data
            </button>
          ) : (
            <div role="alertdialog" aria-label="Confirm reset" className="flex flex-col gap-2 rounded-2xl bg-danger-soft p-3">
              <span className="text-[15px] font-semibold text-danger">Delete all test data? This can&apos;t be undone.</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={run}
                  disabled={busy}
                  className="min-h-11 cursor-pointer rounded-full border-0 bg-danger px-4 text-[15px] font-semibold text-white"
                >
                  {busy ? "Deleting…" : "Delete test data"}
                </button>
                <Button onClick={() => setConfirming(false)} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Group>
      <StatusMessages status={status} savedText="Test data cleared. Your dashboard starts fresh." />
    </>
  );
}
