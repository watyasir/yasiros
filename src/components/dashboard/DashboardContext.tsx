"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useToast } from "@/components/Toast";
import type { NewTask, Task, TaskStatus } from "@/lib/tasks";
import type { DashboardData, GalleryActions, SaveCheckin, TaskActions, ViewId } from "@/modules/types";

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
const withStatus = (task: Task, before: TaskStatus): Task =>
  task.status === before ? task : { ...task, doneAt: task.status === "done" ? new Date().toISOString() : null };

const DashboardContext = createContext<DashboardState | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return ctx;
}

export function DashboardProvider({
  data,
  view,
  taskActions,
  galleryActions,
  saveCheckin,
  children,
}: {
  data: DashboardData;
  view: ViewId;
  /** Real dashboard only: saves task changes. */
  taskActions?: TaskActions;
  galleryActions?: GalleryActions;
  saveCheckin?: SaveCheckin;
  children: ReactNode;
}) {
  const toast = useToast();
  const [tasks, setTasks] = useState(data.tasks);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [shownTasks, setShownTasks] = useState(data.tasks);
  if (shownTasks !== data.tasks) {
    setShownTasks(data.tasks);
    setTasks(data.tasks);
  }
  /** Shows the change now; on the real dashboard, saves it and puts things back if that fails. */
  const changeTasks = (change: (t: Task[]) => Task[], save: ((a: TaskActions) => Promise<{ ok: boolean }>) | null, failMsg: string) => {
    const before = tasks;
    setTasks(change);
    setTaskError(null);
    if (!taskActions || !save) return;
    save(taskActions)
      .catch(() => ({ ok: false }))
      .then((res) => {
        if (res.ok) return;
        setTasks(before);
        setTaskError(`${failMsg} Check your connection and try again.`);
        toast({ text: `${failMsg} Try again.`, tone: "danger" });
      });
  };
  const addTask = (task: NewTask) =>
    changeTasks(
      (t) => [...t, { id: `new-${Date.now()}`, ...shown(task), order: 0, doneAt: task.status === "done" ? new Date().toISOString() : null, goalId: task.goalId }],
      (a) => a.add(task),
      "Couldn't add the task.",
    );
  // Tasks added a moment ago ("new-…") change on the page only, until the server sends their real id.
  const updateTask = (id: string, task: NewTask) =>
    changeTasks((t) => t.map((k) => (k.id === id ? withStatus({ ...k, ...shown(task) }, k.status) : k)), id.startsWith("new-") ? null : (a) => a.update(id, task), "Couldn't save the task.");
  const moveTask = (id: string, status: TaskStatus) =>
    changeTasks((t) => t.map((k) => (k.id === id ? withStatus({ ...k, status }, k.status) : k)), id.startsWith("new-") ? null : (a) => a.move(id, status), "Couldn't move the task.");
  const deleteTask = (id: string) =>
    changeTasks((t) => t.filter((k) => k.id !== id), id.startsWith("new-") ? null : (a) => a.remove(id), "Couldn't delete the task.");

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
