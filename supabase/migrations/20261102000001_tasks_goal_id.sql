-- v10 Focus: a task can belong to a goal (shown as a card on the Work page).
-- Additive: existing tasks stay loose (goal_id null). Deleting a goal keeps its tasks.
-- The app works without this migration (every task shows under "Loose tasks").

alter table public.tasks
  add column if not exists goal_id uuid null references public.goals(id) on delete set null;

create index if not exists tasks_goal_id_idx on public.tasks (goal_id);

-- Let the API see the new column straight away.
notify pgrst, 'reload schema';
