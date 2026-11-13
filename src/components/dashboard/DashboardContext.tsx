"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { useToast } from "@/components/Toast";
import type { NewTask, Task, TaskStatus } from "@/lib/tasks";
import type { DashboardData, GalleryActions, SaveCheckin, TaskActions, TaskSaved, ViewId } from "@/modules/types";
import { pendingStores, withPending, type PendingChange } from "./pendingTasks";

interface DashboardState {
  data: DashboardData;
  /** The page on screen (from its address). */
  view: ViewId;
  /** Tasks as shown right now: changes appear at once and roll back if saving fails. */
  tasks: Task[];
  addTask: (task: NewTask) => void;
  updateTask: (id: string, task: NewTask) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  taskError: string | null;
  /** Real dashboard only: lists and deletes gallery files. */
  galleryActions?: GalleryActions;
  /** Real dashboard only: saves one check-in section's values for today (the demo pretends). */
  saveCheckin?: SaveCheckin;
}

/** A saved sheet as it shows on the Board straight away. */
const shown = (task: NewTask) => ({ ...task, title: task.title.trim(), area: task.area.trim(), note: task.note.trim() || null });

/** Moving into Done stamps the time, so it tops the Done column (the server does the same). */
const withStatus = (task: Task, before: TaskStatus, doneAt: string): Task =>
  task.status === before ? task : { ...task, doneAt: task.status === "done" ? doneAt : null };


const DashboardContext = createContext<DashboardState | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return ctx;
}

export function DashboardProvider({
  data,
  loadedAt = 0,
  view,
  taskActions,
  galleryActions,
  saveCheckin,
  children,
}: {
  data: DashboardData;
  /** Server time (ms) the data was read; the demo's never changes. */
  loadedAt?: number;
  view: ViewId;
  /** Real dashboard only: saves task changes. */
  taskActions?: TaskActions;
  galleryActions?: GalleryActions;
  saveCheckin?: SaveCheckin;
  children: ReactNode;
}) {
  const toast = useToast();
  const [taskError, setTaskError] = useState<string | null>(null);
  const store = taskActions ? pendingStores.real : pendingStores.demo;
  const pending = useSyncExternalStore(store.subscribe, store.get, store.get);
  const tasks = useMemo(() => withPending(data.tasks, loadedAt, pending), [data.tasks, loadedAt, pending]);

  /** Shows the change now; on the real dashboard, saves it and takes back only this change if that fails. */
  const changeTasks = (apply: PendingChange["apply"], save: ((a: TaskActions) => Promise<TaskSaved>) | null, failMsg: string) => {
    const key = store.add(apply);
    setTaskError(null);
    if (!taskActions || !save) return;
    save(taskActions)
      .catch((): TaskSaved => ({ ok: false }))
      .then((res) => {
        if (res.ok) return store.saved(key, res.at);
        store.drop(key);
        setTaskError(`${failMsg} Check your connection and try again.`);
        toast({ text: `${failMsg} Try again.`, tone: "danger" });
      });
  };
  const now = () => new Date().toISOString();
  const addTask = (task: NewTask) => {
    const temp: Task = { id: `new-${Date.now()}`, ...shown(task), order: 0, doneAt: task.status === "done" ? now() : null, goalId: task.goalId };
    // A list that already has it (read in the moment the save landed) doesn't get it twice.
    const known = new Set(data.tasks.map((t) => t.id));
    const has = (list: Task[]) => list.some((t) => !known.has(t.id) && !t.id.startsWith("new-") && t.title === temp.title);
    changeTasks((list) => (has(list) ? list : [...list, temp]), (a) => a.add(task), "Couldn't add the task.");
  };
  // Tasks added a moment ago ("new-…") change on the page only, until the server sends their real id.
  const updateTask = (id: string, task: NewTask) => {
    const at = now();
    changeTasks(
      (list) => list.map((k) => (k.id === id ? withStatus({ ...k, ...shown(task) }, k.status, at) : k)),
      id.startsWith("new-") ? null : (a) => a.update(id, task),
      "Couldn't save the task.",
    );
  };
  const moveTask = (id: string, status: TaskStatus) => {
    const at = now();
    changeTasks(
      (list) => list.map((k) => (k.id === id ? withStatus({ ...k, status }, k.status, at) : k)),
      id.startsWith("new-") ? null : (a) => a.move(id, status),
      "Couldn't move the task.",
    );
  };
  const deleteTask = (id: string) =>
    changeTasks((list) => list.filter((k) => k.id !== id), id.startsWith("new-") ? null : (a) => a.remove(id), "Couldn't delete the task.");

  const value: DashboardState = {
    data,
    view,
    tasks,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    taskError,
    galleryActions,
    saveCheckin,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
