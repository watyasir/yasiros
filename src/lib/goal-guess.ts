/*
  Which goal a new task belongs to, when nobody said (a task from Claude through the API, or one
  added on Work without a goal). Learned from history: the goals that earlier tasks with the same
  area went to, plus how many title words it shares with a goal's name and its tasks. When no
  goal clearly wins, the task gets a new goal of its own (Yasir, 3 Nov 2026: nothing stays loose).
*/

interface PastTask {
  title: string;
  area: string | null;
  goal_id: string | null;
}

interface GoalInfo {
  id: string;
  title: string;
  area: string | null;
}

// Words that say nothing about the subject.
const STOP = new Set("a an and the of for to in on at by with from my me i is be get go do new add buy make set up out it its this that + : · –".split(" "));

const words = (text: string) =>
  new Set(
    text
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );

const same = (a: string | null, b: string | null) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/** The best goal's id, or null when it isn't clear. */
export function guessGoal(task: { title: string; area: string | null }, goals: GoalInfo[], history: PastTask[]): string | null {
  if (goals.length === 0) return null;
  const titleWords = words(task.title);
  const sameArea = history.filter((h) => h.goal_id && same(h.area, task.area));

  const scored = goals.map((g) => {
    // Share of earlier same-area tasks that went to this goal (0–1), counted twice: the strongest sign.
    const areaShare = sameArea.length ? sameArea.filter((h) => h.goal_id === g.id).length / sameArea.length : 0;
    // Title words in common with the goal's name and its tasks.
    const known = words([g.title, ...history.filter((h) => h.goal_id === g.id).map((h) => h.title)].join(" "));
    const shared = [...titleWords].filter((w) => known.has(w)).length;
    const score = 2 * areaShare + 0.6 * Math.min(shared, 3) + (same(g.area, task.area) ? 0.5 : 0);
    return { id: g.id, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const [best, next] = scored;
  // Clear winner: strong enough, and well ahead of the runner-up.
  return best.score >= 1 && best.score - (next?.score ?? 0) >= 0.5 ? best.id : null;
}

/**
 * A new goal for a task that fits none: named after its area ("Shopping"), or its first words
 * when it has none, ending on the task's due date. Its target is its task count (1 to start).
 */
export function newGoalFor(task: { title: string; area: string | null; due_date?: string | null }) {
  const area = task.area?.trim();
  const fromTitle = [...words(task.title)].slice(0, 3).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  const title = (area || fromTitle || "Other tasks").slice(0, 60);
  return { title, area: area ?? "", target: 1, unit: "tasks", deadline: task.due_date ?? null };
}

