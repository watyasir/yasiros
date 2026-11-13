import type { Task } from "@/lib/tasks";

/**
 * Task changes the page shows before the server's list has them (tick, Undo, edit, add, delete).
 * They live outside React, so they outlast a tab switch (each page mounts its own dashboard).
 * Each change is laid over every list the server sends that was read before its save landed, in
 * the order the changes were made: a list rendered between two quick ticks, or a tab preloaded
 * before a tick, can't bring a ticked task back. Lists read after the save are the truth (Claude
 * may have changed a task since). A failed save takes back only its own change.
 */
export interface PendingChange {
  key: number;
  /** Lays the change over a task list. Safe to apply to a list that already has it. */
  apply: (tasks: Task[]) => Task[];
  /** Server time (ms) the save landed; null while it's on its way (or never saved: /demo). */
  savedAt: number | null;
  /** Client time after which it's forgotten: no cached list is older than that. */
  keepUntil: number;
}

/** Longer than any cached page lives in the browser (staleTimes.static, 5 minutes). */
const KEEP_MS = 10 * 60_000;

export interface PendingStore {
  get: () => PendingChange[];
  subscribe: (listener: () => void) => () => void;
  add: (apply: PendingChange["apply"]) => number;
  /** The save landed at server time `at`. */
  saved: (key: number, at: number) => void;
  /** The save failed: take back this change only. */
  drop: (key: number) => void;
}

function createStore(): PendingStore {
  let changes: PendingChange[] = [];
  let next = 0;
  const listeners = new Set<() => void>();
  const set = (list: PendingChange[]) => {
    const now = Date.now();
    // Saved changes older than any cached list are done with.
    changes = list.filter((c) => c.savedAt === null || c.keepUntil > now);
    listeners.forEach((l) => l());
  };
  return {
    get: () => changes,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    add: (apply) => {
      const key = ++next;
      set([...changes, { key, apply, savedAt: null, keepUntil: Infinity }]);
      return key;
    },
    saved: (key, at) => set(changes.map((c) => (c.key === key ? { ...c, savedAt: at, keepUntil: Date.now() + KEEP_MS } : c))),
    drop: (key) => set(changes.filter((c) => c.key !== key)),
  };
}

/** One store for the real dashboard, one for /demo (which never saves, so its changes stay). */
export const pendingStores = { real: createStore(), demo: createStore() };

/** The server's list (read at server time `loadedAt`) with every change it doesn't have yet on top, oldest first. */
export const withPending = (server: Task[], loadedAt: number, changes: PendingChange[]) =>
  changes.reduce((list, c) => (c.savedAt === null || loadedAt < c.savedAt ? c.apply(list) : list), server);
