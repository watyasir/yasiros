-- On hold (13 Nov 2026): a task can have a start date. Until that date (India time) the Work
-- page shows it small and grey at the bottom of its card, and it stays out of the counts, Next
-- up and the calendar feeds. Goals already have start_date. Null = already going.
-- The app works before this runs: it reads and saves tasks without start_date.

alter table public.tasks
  add column if not exists start_date date null;
