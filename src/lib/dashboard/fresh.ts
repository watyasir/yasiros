import "server-only";
import { revalidatePath, updateTag } from "next/cache";

/** The tag on every private cache that reads dashboard data (the 4 tabs and the check-in). */
export const DASHBOARD_TAG = "dashboard";

/**
 * Call after any save from a Server Action (tasks, goals, check-in, workouts, settings). It expires
 * the dashboard's private caches and every page under "/" at once, so the next read waits for fresh
 * data, and it clears the browser's cache of visited and preloaded tabs (Next 16: any of these
 * in a Server Action empties the whole client cache and sends the current page fresh).
 */
export function dashboardChanged() {
  updateTag(DASHBOARD_TAG);
  revalidatePath("/", "layout");
}
