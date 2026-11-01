"use server";

import { refresh } from "next/cache";
import { requireUser } from "@/lib/auth";
import { fileNameFor, type GalleryItem, type GalleryMime } from "@/lib/gallery";
import { TASK_STATUSES, taskProblem, type NewTask, type TaskStatus } from "@/lib/tasks";

/** The columns the task sheet saves. Changes from the app are marked as Yasir's. */
const taskRow = (task: NewTask, withGoal: boolean) => ({
  title: task.title.trim(),
  area: task.area.trim(),
  due_date: task.due || null,
  status: task.status,
  note: task.note.trim() || null,
  owner: task.owner,
  ...(withGoal ? { goal_id: task.goalId } : {}),
  updated_by: "Yasir",
});

/**
 * Runs a save with goal_id, and again without it if the task-goals migration hasn't run yet
 * (Postgres 42703 "column does not exist"), so the sheet works either way.
 */
async function withGoalFallback(save: (withGoal: boolean) => PromiseLike<{ error: { code?: string } | null }>): Promise<{ ok: boolean }> {
  let { error } = await save(true);
  if (error?.code === "42703" || error?.code === "PGRST204") ({ error } = await save(false));
  if (error) return { ok: false };
  refresh();
  return { ok: true };
}

/** Adds a task from the Work page. */
export async function addTask(task: NewTask): Promise<{ ok: boolean }> {
  if (taskProblem(task)) return { ok: false };
  const { supabase, user } = await requireUser();
  return withGoalFallback((g) => supabase.from("tasks").insert({ user_id: user.id, ...taskRow(task, g) }));
}

/** Saves the task sheet. Row-level security limits this to the user's own tasks. */
export async function updateTask(id: string, task: NewTask): Promise<{ ok: boolean }> {
  if (taskProblem(task)) return { ok: false };
  const { supabase } = await requireUser();
  return withGoalFallback((g) => supabase.from("tasks").update(taskRow(task, g)).eq("id", id));
}

/** Changes a task's status (ticking one off moves it to Done; Undo puts it back). */
export async function moveTask(id: string, status: TaskStatus): Promise<{ ok: boolean }> {
  if (!TASK_STATUSES.includes(status)) return { ok: false };
  const { supabase } = await requireUser();
  const { error } = await supabase.from("tasks").update({ status, updated_by: "Yasir" }).eq("id", id);
  if (error) return { ok: false };
  refresh();
  return { ok: true };
}

export async function deleteTask(id: string): Promise<{ ok: boolean }> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return { ok: false };
  refresh();
  return { ok: true };
}

// ---------------------------------------------------------------- gallery

/** The gallery, newest first, with signed links (1 hour) to each original. Read with the owner's own login. */
export async function listGallery(): Promise<{ ok: true; items: GalleryItem[] } | { ok: false }> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("gallery_items")
    .select("id, title, category, description, file_path, mime, width, height, bytes, created_at")
    .order("created_at", { ascending: false });
  if (error) return { ok: false };
  if (data.length === 0) return { ok: true, items: [] };
  const signed = await supabase.storage.from("gallery").createSignedUrls(data.map((d) => d.file_path), 3600);
  if (signed.error) return { ok: false };
  const urls = new Map(signed.data.map((s) => [s.path, s.signedUrl]));
  return {
    ok: true,
    items: data.flatMap((d) => {
      const url = urls.get(d.file_path);
      if (!url) return [];
      const fileName = fileNameFor(d.title, d.mime as GalleryMime);
      return [{
        id: d.id,
        title: d.title,
        category: d.category,
        description: d.description,
        mime: d.mime as GalleryMime,
        width: d.width,
        height: d.height,
        bytes: Number(d.bytes),
        createdAt: d.created_at,
        url,
        downloadUrl: `${url}&download=${encodeURIComponent(fileName)}`,
        fileName,
      }];
    }),
  };
}

/** Deletes a gallery file and its entry (after the confirm in the viewer). */
export async function deleteGalleryItem(id: string): Promise<{ ok: boolean }> {
  const { supabase } = await requireUser();
  const { data } = await supabase.from("gallery_items").select("file_path").eq("id", id).maybeSingle();
  if (!data) return { ok: false };
  const removed = await supabase.storage.from("gallery").remove([data.file_path]);
  if (removed.error) return { ok: false };
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  return { ok: !error };
}

