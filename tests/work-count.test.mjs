// The Work tab's number must equal the open tasks on the goal cards, Loose tasks included.
import assert from "node:assert/strict";
import test from "node:test";
import { byGoal, openTasks, workSummary } from "../src/lib/tasks.ts";

const today = "2026-11-14";
const task = (id, over = {}) => ({ id, title: id, area: "", due: null, status: "todo", owner: "Me", note: null, order: 0, doneAt: null, goalId: null, start: null, ...over });
const goals = [
  { id: "g1", start: null },
  { id: "g2", start: null },
  { id: "later", start: "2026-12-01" }, // on hold: its tasks don't count
];
const tasks = [
  task("a", { goalId: "g1" }),
  task("b", { goalId: "g1", status: "done" }),
  task("c", { goalId: "g1", status: "doing", due: "2026-11-10" }),
  task("d", { goalId: "g2", start: "2026-11-20" }), // own start date ahead
  task("e", { goalId: "g2", status: "waiting", due: today }),
  task("f", { goalId: "later" }),
  task("g"), // loose
  task("h", { goalId: "gone" }), // goal deleted: loose
  task("i", { status: "done" }),
];

test("badge equals the sum of open tasks across the cards, Loose tasks included", () => {
  const badge = openTasks(tasks, goals, today).length;
  const groups = byGoal(tasks, goals.map((g) => g.id));
  assert.equal(groups.at(-1).goalId, null, "Loose tasks come last");
  const cardSum = groups.reduce((n, g) => n + openTasks(g.tasks, goals, today).length, 0);
  assert.equal(badge, 5);
  assert.equal(cardSum, badge);
  assert.equal(groups.reduce((n, g) => n + g.tasks.length, 0), tasks.length, "every task is on exactly one card");
});

test("ticking a task drops the count straight away", () => {
  const ticked = tasks.map((t) => (t.id === "a" ? { ...t, status: "done" } : t));
  assert.equal(openTasks(ticked, goals, today).length, 4);
});

test("subtitle counts open, overdue and due today", () => {
  assert.equal(workSummary(openTasks(tasks, goals, today), today), "5 open · 1 overdue · 1 due today");
  assert.equal(workSummary([], today), "No open tasks");
});

test("no Loose card when every task has a goal", () => {
  assert.equal(byGoal([task("x", { goalId: "g1" })], ["g1"]).length, 1);
});
