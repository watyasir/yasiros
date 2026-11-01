-- v10 Focus (2 Nov 2026): a task can belong to a goal. The Work page shows one card per goal
-- with its tasks; tasks without a goal go in "Loose tasks". Deleting a goal keeps its tasks (loose).
-- The app works before this runs: it reads tasks without goal_id and shows them all as loose.

alter table public.tasks
  add column if not exists goal_id uuid null references public.goals (id) on delete set null;

create index if not exists tasks_goal on public.tasks (goal_id);
