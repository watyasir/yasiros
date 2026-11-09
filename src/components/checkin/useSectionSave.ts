"use client";

import { useRef, useState } from "react";
import { useToast } from "@/components/Toast";
import { sectionDone, sectionLabel, type FocusKey, type SectionKey } from "@/lib/checkin-sections";
import type { CheckInValues, Tracker } from "@/lib/trackers";
import type { SaveCheckin } from "@/modules/types";

/** The demo's save: nothing is stored. */
const pretend: SaveCheckin = () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 300));

/**
 * Saving one check-in section, shared by the Today card and /log. The section counts as saved at
 * once (optimistic); if the save fails it's put back and an error toast says so. One save at a
 * time: a second Save while one is running is ignored. Fresh data from the server replaces the
 * local copy when it arrives.
 */
export function useSectionSave(base: { trackers: Tracker[]; values: CheckInValues; saved: string[]; workedOut: boolean }, save: SaveCheckin = pretend) {
  const toast = useToast();
  const [local, setLocal] = useState({ base, values: base.values, saved: new Set(base.saved) });
  const busy = useRef(false);
  // New server data (after a save, or a page refresh) replaces what was shown. Compared by its
  // parts, so a caller that builds the object inline doesn't reset it on every render.
  const changed = local.base.values !== base.values || local.base.saved !== base.saved || local.base.trackers !== base.trackers || local.base.workedOut !== base.workedOut;
  if (changed) setLocal({ base, values: base.values, saved: new Set(base.saved) });

  const done = (key: FocusKey) => sectionDone(key, base.trackers, (t) => (local.saved.has(t.id) ? local.values[t.id] : undefined), base.workedOut);

  function run(section: SectionKey, sent: CheckInValues) {
    if (busy.current) return;
    busy.current = true;
    const before = local;
    setLocal({ base, values: { ...local.values, ...sent }, saved: new Set([...local.saved, ...Object.keys(sent)]) });
    save(sent)
      .catch(() => ({ ok: false as const, message: "Couldn't reach the server." }))
      .then((res) => {
        if (!res.ok) {
          setLocal(before);
          toast({ text: `Couldn't save ${sectionLabel(section)}. ${res.message}`, tone: "danger" });
        }
      })
      .finally(() => {
        busy.current = false;
      });
  }

  return { values: local.values, done, run };
}
