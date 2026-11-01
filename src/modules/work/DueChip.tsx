import { Chip } from "@/components/Chip";
import type { Task } from "@/lib/tasks";
import { shortDate } from "@/lib/trackers";

/** "! Overdue", "Today" or the due date, on a soft chip: words, never colour alone. */
export function DueChip({ task, today }: { task: Task; today: string }) {
  if (!task.due || task.status === "done") return null;
  if (task.due < today) return <Chip tone="danger">! Overdue</Chip>;
  if (task.due === today) return <Chip tone="warn">Today</Chip>;
  return <Chip>{shortDate(task.due)}</Chip>;
}
