"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { OWNERS, TASK_COLUMNS, taskProblem, type NewTask, type Owner, type Task, type TaskStatus } from "@/lib/tasks";

/** Editing a task, or adding one to a column. */
export type SheetTarget = { task?: Task; status: TaskStatus };

const fieldClass = "min-h-11 w-full rounded-xl border border-line bg-card px-3 text-[15px] text-ink placeholder:text-soft sm:min-h-9 sm:text-[13px]";
const labelClass = "flex flex-col gap-1 text-xs font-semibold text-soft";

/**
 * One sheet for adding and editing: title, note, area, due date, who's on it, column.
 * A bottom sheet on the phone, a centred panel on the laptop. Esc or Cancel closes it.
 */
export function TaskSheet({ target, onClose }: { target: SheetTarget; onClose: () => void }) {
  const { addTask, updateTask, deleteTask } = useDashboard();
  const { task } = target;
  const [form, setForm] = useState<NewTask>({
    title: task?.title ?? "",
    note: task?.note ?? "",
    area: task?.area ?? "",
    due: task?.due ?? null,
    owner: task?.owner ?? "Me",
    status: target.status,
  });
  const [problem, setProblem] = useState<string | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const set = <K extends keyof NewTask>(key: K, value: NewTask[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = taskProblem(form);
    if (p) return setProblem(p);
    if (task) updateTask(task.id, form);
    else addTask(form);
    onClose();
  };

  return (
    <dialog
      ref={ref}
      aria-label={task ? `Edit ${task.title}` : "Add a task"}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-0 mt-auto w-full max-w-none rounded-t-[20px] border-0 bg-card p-0 text-ink backdrop:bg-ink/30 sm:m-auto sm:max-w-[440px] sm:rounded-[20px]"
    >
      <form onSubmit={submit} className="flex flex-col gap-3 p-5 pb-[max(20px,env(safe-area-inset-bottom))]">
        <h2 className="m-0 text-[17px] display">{task ? "Edit task" : "Add task"}</h2>
        <label className={labelClass}>
          Title
          <input value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={120} placeholder="What needs doing?" className={fieldClass} />
        </label>
        <label className={labelClass}>
          Note
          <textarea
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Optional"
            className={`${fieldClass} resize-none py-2.5 leading-[1.4]`}
          />
        </label>
        <div className="flex gap-2">
          <label className={`${labelClass} min-w-0 flex-1`}>
            Area
            <input value={form.area} onChange={(e) => set("area", e.target.value)} maxLength={40} placeholder="Home, Health…" className={fieldClass} />
          </label>
          <label className={`${labelClass} min-w-0 flex-1`}>
            Due
            <input type="date" value={form.due ?? ""} onChange={(e) => set("due", e.target.value || null)} className={fieldClass} />
          </label>
        </div>
        <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
          <legend className="mb-1 p-0 text-xs font-semibold text-soft">Who&apos;s on it</legend>
          <div className="flex gap-1 rounded-full bg-fill p-1">
            {OWNERS.map((o: Owner) => (
              <label
                key={o}
                className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full text-[13px] font-semibold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent sm:min-h-8 ${form.owner === o ? "bg-card text-ink" : "text-soft"}`}
              >
                <input type="radio" name="owner" value={o} checked={form.owner === o} onChange={() => set("owner", o)} className="sr-only" />
                {o}
              </label>
            ))}
          </div>
        </fieldset>
        <label className={labelClass}>
          Column
          <select value={form.status} onChange={(e) => set("status", e.target.value as TaskStatus)} className={`${fieldClass} cursor-pointer`}>
            {TASK_COLUMNS.map((c) => (
              <option key={c.status} value={c.status}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {problem && (
          <p role="alert" className="m-0 text-xs text-danger">
            {problem}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          {task && (
            <button
              type="button"
              onClick={() => {
                if (!window.confirm(`Delete "${task.title}"?`)) return;
                deleteTask(task.id);
                onClose();
              }}
              className="min-h-11 cursor-pointer rounded-full border-0 bg-transparent px-3 text-[13px] font-semibold text-danger hover:bg-fill sm:min-h-9"
            >
              Delete
            </button>
          )}
          <button type="button" onClick={onClose} className="ml-auto min-h-11 cursor-pointer rounded-full border-0 bg-transparent px-3 text-[13px] font-semibold text-accent hover:bg-fill sm:min-h-9">
            Cancel
          </button>
          <button type="submit" className="min-h-11 cursor-pointer rounded-full border-0 bg-pop px-5 text-[13px] font-semibold text-ink hover:bg-pop-strong sm:min-h-9">
            {task ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
