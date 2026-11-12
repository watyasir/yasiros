import type { Goal } from "@/lib/tasks";

/** Fake goals for /demo/log/goals (the demo Goals tile uses the ready-made rows in index.ts). */
export const demoGoals: Goal[] = [
  { id: "g1", title: "Gain 5 kg", area: "Body", target: 5, unit: "kg", deadline: "2026-12-24", start: null, trackerId: null, current: 2.1 },
  { id: "g2", title: "Bench press 70 kg", area: "Body", target: 70, unit: "kg", deadline: "2026-12-31", start: null, trackerId: null, current: 55 },
  { id: "g3", title: "German A1", area: "Skills", target: 100, unit: "%", deadline: "2027-03-31", start: null, trackerId: null, current: 35 },
];
