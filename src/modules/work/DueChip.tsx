import { dueState, type Task } from "@/lib/tasks";
import { shortDate } from "@/lib/trackers";

const dueColor = { soon: "text-warn", overdue: "text-danger" };

/** "Due 26 Oct", yellow within 3 days, "Overdue · 16 Oct" in coral. Words, never colour alone. */
export function DueLabel({ task, today, className = "" }: { task: Task; today: string; className?: string }) {
  if (!task.due || task.status === "done") return null;
  const state = dueState(task, today);
  const text = state === "overdue" ? `Overdue · ${shortDate(task.due)}` : task.due === today ? "Due today" : `Due ${shortDate(task.due)}`;
  return <span className={`text-[11px] font-semibold ${state ? dueColor[state] : "text-soft"} ${className}`}>{text}</span>;
}
