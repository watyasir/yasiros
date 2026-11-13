// Ticked tasks must not pop back while saves are in flight, when an older (preloaded) list
// arrives, or after a tab switch. A failed save rolls back only its own task.
import assert from "node:assert/strict";
import test from "node:test";
import { pendingStores, withPending } from "../src/components/dashboard/pendingTasks.ts";

const task = (id, status = "todo") => ({ id, title: id, status });
const move = (id, status) => (list) => list.map((k) => (k.id === id ? { ...k, status } : k));
const statuses = (list) => Object.fromEntries(list.map((t) => [t.id, t.status]));
const fresh = () => {
  const s = pendingStores.real;
  s.get().forEach((c) => s.drop(c.key));
  return s;
};

test("three quick ticks: no list, old or new, brings one back", () => {
  const s = fresh();
  const preloaded = { at: 100, tasks: [task("a"), task("b"), task("c")] };
  const k = ["a", "b", "c"].map((id) => s.add(move(id, "done")));
  s.saved(k[0], 200);
  // Rendered after the first save, before the others: b and c still open there.
  const between = { at: 250, tasks: [task("a", "done"), task("b"), task("c")] };
  const all = { a: "done", b: "done", c: "done" };
  assert.deepEqual(statuses(withPending(between.tasks, between.at, s.get())), all);
  assert.deepEqual(statuses(withPending(preloaded.tasks, preloaded.at, s.get())), all, "a tab preloaded before the ticks");
  s.saved(k[1], 300);
  s.saved(k[2], 400);
  assert.deepEqual(statuses(withPending(between.tasks, between.at, s.get())), all, "after switching back to an older tab");
  // A list read after the last save is the truth (e.g. Claude reopened b since).
  const later = { at: 500, tasks: [task("a", "done"), task("b"), task("c", "done")] };
  assert.deepEqual(statuses(withPending(later.tasks, later.at, s.get())), { a: "done", b: "todo", c: "done" });
});

test("a failed save rolls back only that task", () => {
  const s = fresh();
  const ka = s.add(move("a", "done"));
  s.add(move("b", "done"));
  s.drop(ka);
  assert.deepEqual(statuses(withPending([task("a"), task("b")], 0, s.get())), { a: "todo", b: "done" });
});

test("tick then Undo ends open on every list", () => {
  const s = fresh();
  const tick = s.add(move("a", "done"));
  const undo = s.add(move("a", "todo"));
  s.saved(tick, 200);
  s.saved(undo, 300);
  assert.deepEqual(statuses(withPending([task("a")], 100, s.get())), { a: "todo" });
  assert.deepEqual(statuses(withPending([task("a", "done")], 250, s.get())), { a: "todo" }, "list read between tick and Undo");
  assert.deepEqual(statuses(withPending([task("a")], 350, s.get())), { a: "todo" });
});
