import type { Owner, TaskStatus } from "@/lib/tasks";
import type { DashboardData, SeasonDay, Task } from "@/modules/types";
import { demoBento } from "./bento";
import { DEMO_TODAY, demoBody } from "./body";
import { demoGallery } from "./gallery";

/*
  Fake data for /demo. Every name, amount and number here is made up.
  Real data never goes in this repo.
*/

// A believable 90-day season: day 23 is today, days 8 and 16 were missed.
const seasonDays: SeasonDay[] = Array.from({ length: 90 }, (_, i) => {
  if (i === 22) return "today";
  if (i > 22) return "upcoming";
  if (i === 7 || i === 15) return "missed";
  return ((i * 47 + 13) % 100) / 100 < 0.3 ? "most" : "all";
});

function demoTask(
  id: string,
  title: string,
  owner: Owner,
  area: string,
  due: string | null,
  status: TaskStatus,
  extra: Partial<Pick<Task, "note" | "order" | "doneAt" | "goalId">> = {},
): Task {
  return { id, title, owner, area, due, status, note: null, order: 0, doneAt: null, goalId: null, ...extra };
}

// Made-up goals the demo tasks belong to (the Work page's cards).
const G = { move: "demo-goal-move", exams: "demo-goal-exams", os: "demo-goal-os", fund: "demo-goal-fund" };

export const demoData: DashboardData = {
  theme: "candy",
  ownerLine: "Life, tracked",
  basePath: "/demo",
  todayISO: DEMO_TODAY,
  logHref: "/demo/log",
  shareHref: "/demo/progress",
  views: {
    overview: { title: "", subtitle: "" },
    health: { title: "Health", subtitle: "Sample data · Winter Arc day 23 of 90" },
    finance: { title: "Finance", subtitle: "October · sample accounts" },
    work: { title: "Work", subtitle: "Sample data · 11 open · 2 overdue" },
    gallery: { title: "Gallery", subtitle: "Images and files Claude saved from chats" },
  },
  navBadges: { work: "11" },
  season: {
    startsIn: 0,
    name: "Winter Arc",
    length: 90,
    day: 23,
    streak: 12,
    targetsHitPct: 78,
    bestStreak: 19,
    missed: 2,
    startLabel: "26 Sep",
    endLabel: "24 Dec",
    days: seasonDays,
  },
  // Day 23 is the 2nd day of season week 4.
  arc: {
    rangeLabel: "26 Sep 2026 → 24 Dec 2026",
    week: 4,
    weekCount: 13,
    targets: [
      { name: "Sleep 7 hr", done: 2, target: 7 },
      { name: "Study 1.5 hr", done: 2, target: 7 },
      { name: "Water 3 L", done: 1, target: 7 },
      { name: "Skincare", done: 2, target: 7 },
      { name: "German 20 min", done: 0, target: 7 },
      { name: "Workout", done: 1, target: 5 },
    ],
    streaks: [
      { name: "Sleep 7 hr", current: 3, best: 12 },
      { name: "Study 1.5 hr", current: 12, best: 19 },
      { name: "Water 3 L", current: 1, best: 6 },
      { name: "Skincare", current: 9, best: 15 },
      { name: "German 20 min", current: 0, best: 8 },
      { name: "Workout", current: 2, best: 5 },
    ],
    weeks: [78, 86, 71, 64, null, null, null, null, null, null, null, null, null],
  },

  money: {
    month: "October",
    updated: "9:52 PM",
    income: 50000,
    spent: 31800,
    spendable: 14600,
    split: {
      needs: { actual: 48, target: 50 },
      wants: { actual: 15, target: 20 },
      savings: { actual: 37, target: 30 },
    },
    categories: [
      { name: "Rent", amount: 12000 },
      { name: "Food", amount: 7400 },
      { name: "Travel", amount: 4100 },
      { name: "Shopping", amount: 3300 },
    ],
    // Made-up accounts. Real ones arrive as snapshots through POST /api/money (Phase 6).
    accounts: [
      {
        id: "savings",
        name: "Savings account",
        kind: "savings",
        balance: 48200,
        transactions: [
          { label: "Moved from salary account", date: "18 Oct", amount: 10000 },
          { label: "Interest", date: "1 Oct", amount: 312 },
          { label: "Travel fund top-up", date: "1 Oct", amount: -5000 },
          { label: "Moved from salary account", date: "18 Sep", amount: 10000 },
          { label: "Interest", date: "1 Sep", amount: 298 },
        ],
      },
      {
        id: "salary",
        name: "Salary account",
        kind: "current",
        balance: 31500,
        transactions: [
          { label: "Groceries", date: "19 Oct", amount: -1240 },
          { label: "Moved to savings", date: "18 Oct", amount: -10000 },
          { label: "Rent", date: "5 Oct", amount: -12000 },
          { label: "Salary", date: "1 Oct", amount: 50000 },
          { label: "Phone bill", date: "1 Oct", amount: -399 },
        ],
      },
      {
        id: "card",
        name: "Credit card",
        kind: "card",
        balance: -12400,
        due: "5 Nov",
        transactions: [
          { label: "Food delivery", date: "17 Oct", amount: -245 },
          { label: "Air fryer, EMI 1 of 3", date: "14 Oct", amount: -2300 },
          { label: "Fuel", date: "12 Oct", amount: -1500 },
          { label: "Streaming plan", date: "11 Oct", amount: -199 },
          { label: "Bill paid", date: "5 Oct", amount: 9800 },
        ],
      },
    ],
  },
  workoutHref: "/demo/log/workout",
  bodyHref: "/demo/log/body",
  goalsHref: "/demo/log/goals",
  settingsHref: "/demo/settings",
  ...demoBody,
  ...demoBento,
  goals: [
    { id: G.move, name: "Move to a 1RK", area: "Home", deadline: "2027-01-31", progress: "2 of 4 steps", pct: 50, by: "by 31 Jan 2027", tone: "accent", saving: false },
    { id: G.exams, name: "Clear 3rd-year exams", area: "Study", deadline: "2026-11-21", progress: "40%", pct: 40, by: "by 21 Nov", tone: "accent", saving: false },
    { id: G.os, name: "Finish Decko", area: "Build", deadline: "2026-11-15", progress: "75%", pct: 75, by: "by 15 Nov", tone: "accent", saving: false },
    { id: G.fund, name: "1RK fund", area: "Money", deadline: "2027-01-31", progress: "₹42,000 of ₹1,00,000", pct: 42, by: "by 31 Jan 2027", tone: "accent", saving: true },
    { id: "demo-goal-travel", name: "Travel fund", area: "Money", deadline: "2027-04-30", progress: "₹26,000 of ₹50,000", pct: 52, by: "by 30 Apr 2027", tone: "accent", saving: true },
  ],
  tasks: [
    demoTask("t0", "Book the movers", "Both", "Home", "2026-10-20", "todo", { order: 10, goalId: G.move }),
    demoTask("t1", "Shortlist 3 flats near the office", "Me", "Home", "2026-10-25", "todo", { goalId: G.move }),
    demoTask("t2", "Pack the kitchen", "Me", "Home", null, "todo", { goalId: G.move }),
    demoTask("t3", "Pay the token amount", "Me", "Home", null, "done", { goalId: G.move, doneAt: "2026-10-14T10:00:00+05:30" }),
    demoTask("t4", "Revise Marketing unit 3", "Me", "Study", "2026-10-18", "todo", { goalId: G.exams }),
    demoTask("t5", "Finance past papers (2 years)", "Me", "Study", "2026-10-16", "todo", { goalId: G.exams }),
    demoTask("t6", "Submit the project report", "Me", "Study", "2026-10-22", "doing", { goalId: G.exams }),
    demoTask("t7", "Print the hall ticket", "Me", "Study", null, "todo", { goalId: G.exams }),
    demoTask("t8", "Collect the course certificate", "Both", "Study", null, "done", { goalId: G.exams, doneAt: "2026-10-12T10:00:00+05:30" }),
    demoTask("t9", "Work page with goal cards", "Claude", "Build", "2026-10-18", "doing", { goalId: G.os }),
    demoTask("t10", "Write the case study", "Both", "Build", null, "todo", { goalId: G.os }),
    demoTask("t11", "Soft bento redesign", "Claude", "Build", null, "done", { goalId: G.os, doneAt: "2026-10-16T10:00:00+05:30" }),
    demoTask("t12", "Three themes", "Claude", "Build", null, "done", { goalId: G.os, doneAt: "2026-10-17T10:00:00+05:30" }),
    demoTask("t13", "Two delivery refund disputes", "Claude", "Disputes", "2026-10-15", "waiting", { note: "Waiting 48 h before the second follow-up" }),
    demoTask("t14", "Renew library card", "Me", "Errands", "2026-10-18", "todo"),
    demoTask("t15", "Cancel unused music app", "Claude", "Subscriptions", null, "todo"),
  ],
  gallery: demoGallery,
};
