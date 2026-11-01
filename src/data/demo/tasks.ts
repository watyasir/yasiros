import type { Owner, Task, TaskStatus } from "@/lib/tasks";

/** Fake tasks for /demo: some linked to the demo goals (ids in index.ts), the rest loose. Made up. */
function task(id: string, title: string, owner: Owner, area: string, due: string | null, status: TaskStatus, goalId: string | null, extra: Partial<Pick<Task, "note" | "order" | "doneAt">> = {}): Task {
  return { id, title, owner, area, due, status, goalId, note: null, order: 0, doneAt: null, ...extra };
}

export const demoTasks: Task[] = [
  // 1RK fund
  task("t0", "Move to the new flat", "Both", "Home", "2026-10-20", "todo", "g1rk", { order: 10, note: "Book the movers, then pack the kitchen" }),
  task("t4", "November finance review", "Both", "Money", "2026-10-20", "todo", "g1rk", { note: "Claude drafts the numbers first" }),
  task("t5", "Cancel unused music app", "Claude", "Subscriptions", null, "todo", "g1rk"),
  task("t14", "Finance logging + email bridge", "Claude", "Build", null, "done", "g1rk", { doneAt: "2026-10-15T10:00:00+05:30" }),
  // Gain 5 kg
  task("t20", "Plan a 4-week gym split", "Me", "Body", "2026-10-19", "todo", "ggain"),
  task("t21", "Buy protein powder", "Me", "Body", "2026-10-22", "todo", "ggain"),
  task("t22", "Log every meal for a week", "Me", "Health", null, "doing", "ggain"),
  task("t23", "Book a body check", "Me", "Health", "2026-10-25", "todo", "ggain"),
  task("t24", "Weigh in every morning", "Me", "Health", null, "todo", "ggain"),
  // Bench press 70 kg
  task("t25", "Test a 60 kg single", "Me", "Body", "2026-10-24", "todo", "gbench"),
  task("t26", "Learn the spotter signals", "Me", "Body", null, "done", "gbench", { doneAt: "2026-10-14T10:00:00+05:30" }),
  // German A1
  task("t7", "Course completion certificate", "Both", "Learning", "2026-10-18", "doing", "ggerman"),
  task("t11", "Course mentor: batch reply", "Claude", "Learning", "2026-10-21", "waiting", "ggerman"),
  task("t27", "Finish unit 4 vocabulary", "Me", "Skills", "2026-10-19", "todo", "ggerman"),
  // Loose
  task("t1", "Winter Arc kickoff", "Both", "Winter Arc", "2026-10-18", "todo", null),
  task("t2", "Renew library card", "Me", "Errands", "2026-10-18", "todo", null),
  task("t3", "Book dentist check-up", "Me", "Health", "2026-10-16", "todo", null, { note: "Call the clinic at 10 AM, ask for a Saturday slot" }),
  task("t6", "Yasir OS design", "Both", "Build", null, "doing", null, { order: 2 }),
  task("t8", "Two delivery refund disputes", "Claude", "Disputes", "2026-10-15", "doing", null, { note: "Waiting 48 h before the second follow-up" }),
  task("t9", "Habit app review", "Claude", "Build", null, "doing", null),
  task("t10", "New job: document check", "Claude", "Work", null, "waiting", null, { note: "HR said by Friday" }),
  task("t12", "Dashboard project brief", "Claude", "Build", null, "done", null, { doneAt: "2026-10-17T10:00:00+05:30" }),
  task("t13", "Weekly review agent", "Claude", "Build", null, "done", null, { doneAt: "2026-10-16T10:00:00+05:30" }),
];

export const demoOpenTasks = demoTasks.filter((t) => t.status !== "done").length;
